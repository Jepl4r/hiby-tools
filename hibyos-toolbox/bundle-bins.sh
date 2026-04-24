#!/bin/bash
# ─────────────────────────────────────────────
# Automatically copy system binaries
# to the scripts/bin/ folder of the project.
# Only for macOS and Linux
# Use: ./bundle-bins.sh
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
    TARGET="linux-x64"
else
    echo "OS not supported: $OS"
    exit 1
fi

BIN_DIR="$SCRIPT_DIR/scripts/bin/$TARGET"
mkdir -p "$BIN_DIR"

echo "Platform: $TARGET"
echo "Folder: $BIN_DIR"
echo ""

TOOLS=("7z" "unsquashfs" "mksquashfs" "mkisofs")

for tool in "${TOOLS[@]}"; do
    path=$(which "$tool" 2>/dev/null || true)
    if [ -n "$path" ]; then
        cp "$path" "$BIN_DIR/"
        chmod +x "$BIN_DIR/$tool"
        echo "✅ $tool → copied from $path"
    else
        echo "⚠️  $tool → Not found in the system, skipped"
    fi
done

echo ""
echo "Done! Binaries copied into: $BIN_DIR"
echo ""
