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
echo "────────────────────────────────"
echo "Done! $FOUND tools bundled, $MISSING missing."

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "To install missing tools:"
    if [ "$OS" = "Darwin" ]; then
        echo "  brew install p7zip squashfs cdrtools"
    else
        echo "  sudo apt install 7zip squashfs-tools genisoimage"
        echo "  # or on Fedora/RHEL:"
        echo "  sudo dnf install 7zip squashfs-tools genisoimage"
        echo "  # or on Arch:"
        echo "  sudo pacman -S 7zip squashfs-tools cdrtools"
    fi
fi
