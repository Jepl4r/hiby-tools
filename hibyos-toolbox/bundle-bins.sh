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
            cp "$cmd_path" "$BIN_DIR/$target_name"
            chmod +x "$BIN_DIR/$target_name"
            if [ "$cmd" != "$target_name" ]; then
                echo "✅ $target_name → copied from $cmd_path (via $cmd)"
            else
                echo "✅ $target_name → copied from $cmd_path"
            fi
            FOUND=$((FOUND + 1))
            return 0
        fi
    done

    echo "⚠️  $target_name → not found (tried: ${candidates[*]})"
    MISSING=$((MISSING + 1))
    return 1
}

copy_tool "7z"         "7z" "7za" "7zr" || true

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
        echo "  sudo apt install p7zip-full squashfs-tools genisoimage"
        echo "  # or on Fedora/RHEL:"
        echo "  sudo dnf install p7zip p7zip-plugins squashfs-tools genisoimage"
        echo "  # or on Arch:"
        echo "  sudo pacman -S p7zip squashfs-tools cdrtools"
    fi
fi
