#!/bin/bash
# ─────────────────────────────────────────────
# Bundle system binaries into the app.
# Works on macOS and Linux.
#
# Usage: ./bundle-bins.sh
# ─────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ARCH=$(uname -m)
OS=$(uname -s)

if [ "$OS" = "Darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
        TARGET="darwin-arm64"
    else
        TARGET="darwin-x64"
    fi
elif [ "$OS" = "Linux" ]; then
    case "$ARCH" in
        x86_64)  TARGET="linux-x64" ;;
        aarch64) TARGET="linux-arm64" ;;
        *)
            echo "❌ Unsupported Linux architecture: $ARCH"
            exit 1
            ;;
    esac
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

BIN_DIR="$SCRIPT_DIR/scripts/bin/$TARGET"
mkdir -p "$BIN_DIR"

echo "Platform: $TARGET"
echo "Output:   $BIN_DIR"
echo ""

FOUND=0
MISSING=0

copy_tool() {
    local target_name="$1"
    shift
    local candidates=("$@")

    for cmd in "${candidates[@]}"; do
        local cmd_path
        cmd_path=$(which "$cmd" 2>/dev/null || true)
        if [ -n "$cmd_path" ]; then
            local real_path="$cmd_path"

            if [ "$OS" = "Linux" ] && file "$cmd_path" | grep -q "shell script"; then
                local exec_target
                exec_target=$(grep -oP '(?<=exec\s)(\S+)' "$cmd_path" 2>/dev/null | head -1)
                if [ -n "$exec_target" ] && [ -x "$exec_target" ]; then
                    echo "   ↳ $cmd_path is a wrapper → resolved to $exec_target"
                    real_path="$exec_target"
                fi
            fi

            cp "$real_path" "$BIN_DIR/$target_name"
            chmod +x "$BIN_DIR/$target_name"
            if [ "$cmd" != "$target_name" ]; then
                echo "✅ $target_name → copied from $real_path (via $cmd)"
            else
                echo "✅ $target_name → copied from $real_path"
            fi
            FOUND=$((FOUND + 1))
            return 0
        fi
    done

    echo "⚠️  $target_name → not found (tried: ${candidates[*]})"
    MISSING=$((MISSING + 1))
    return 1
}

copy_tool "7z"         "7zz" "7z" "7za" "7zr" || true

if [ "$OS" = "Linux" ]; then
    for so_dir in /usr/lib/7zip /usr/lib/p7zip /usr/libexec/p7zip; do
        if [ -f "$so_dir/7z.so" ]; then
            cp "$so_dir/7z.so" "$BIN_DIR/7z.so"
            echo "   ✅ 7z.so → copied from $so_dir/7z.so"
            break
        fi
    done
fi

copy_tool "unsquashfs" "unsquashfs" || true
copy_tool "mksquashfs" "mksquashfs" || true

copy_tool "mkisofs"    "mkisofs" "genisoimage" || true

copy_tool "md5sum"     "md5sum" || true

copy_tool "split"      "split" || true

echo ""
echo "── ADB Manager ──"

copy_tool "ffmpeg"     "ffmpeg" || true

copy_adb() {
    local adb_path
    adb_path=$(which adb 2>/dev/null || true)

    if [ -z "$adb_path" ]; then
        local candidates=()
        if [ "$OS" = "Darwin" ]; then
            candidates=(
                "$HOME/Library/Android/sdk/platform-tools/adb"
                "/opt/homebrew/bin/adb"
                "/usr/local/bin/adb"
            )
        else
            candidates=(
                "$HOME/Android/Sdk/platform-tools/adb"
                "/usr/bin/adb"
                "/usr/local/bin/adb"
            )
        fi
        for c in "${candidates[@]}"; do
            if [ -x "$c" ]; then
                adb_path="$c"
                break
            fi
        done
    fi

    if [ -n "$adb_path" ]; then
        cp "$adb_path" "$BIN_DIR/adb"
        chmod +x "$BIN_DIR/adb"
        echo "✅ adb → copied from $adb_path"

        local adb_dir
        adb_dir=$(dirname "$adb_path")
        for lib in "$adb_dir"/lib*.so "$adb_dir"/lib*.dylib; do
            if [ -f "$lib" ]; then
                cp "$lib" "$BIN_DIR/"
                echo "   ✅ $(basename "$lib") → copied"
            fi
        done

        FOUND=$((FOUND + 1))
    else
        echo "⚠️  adb → not found"
        MISSING=$((MISSING + 1))
    fi
}
copy_adb

echo ""
echo "────────────────────────────────"
echo "Done! $FOUND tools bundled, $MISSING missing."

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "To install missing tools:"
    if [ "$OS" = "Darwin" ]; then
        echo "  brew install p7zip squashfs cdrtools ffmpeg"
        echo "  # For ADB:"
        echo "  brew install android-platform-tools"
    else
        echo "  sudo apt install 7zip squashfs-tools genisoimage ffmpeg"
        echo "  # For ADB:"
        echo "  sudo apt install android-tools-adb"
        echo "  # or on Fedora/RHEL:"
        echo "  sudo dnf install 7zip squashfs-tools genisoimage ffmpeg android-tools"
        echo "  # or on Arch:"
        echo "  sudo pacman -S 7zip squashfs-tools cdrtools ffmpeg android-tools"
    fi
fi
