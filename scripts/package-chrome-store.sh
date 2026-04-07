#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RELEASE_DIR="$ROOT_DIR/release"
BUILD_DIR="$RELEASE_DIR/chrome/unpacked"
STORE_DIR="$RELEASE_DIR/chrome/web-store"
STORE_DOC_DIR="$STORE_DIR/docs"
STORE_ASSET_DIR="$STORE_DIR/assets"
ZIP_PATH="$STORE_DIR/page-to-markdown-chrome-store.zip"

rm -rf "$STORE_DIR"
mkdir -p "$STORE_DOC_DIR" "$STORE_ASSET_DIR"

cd "$ROOT_DIR"
npm run build:chrome

rm -f "$ZIP_PATH"

cp "$ROOT_DIR/docs/chrome-web-store/listing.md" "$STORE_DOC_DIR/listing.md"
cp "$ROOT_DIR/docs/chrome-web-store/upload.md" "$STORE_DOC_DIR/upload.md"
cp "$ROOT_DIR/assets/public/icons/icon-128.png" "$STORE_ASSET_DIR/icon-128.png"

(
  cd "$BUILD_DIR"
  zip -qr "$ZIP_PATH" . -x "*.DS_Store"
)

echo "Created $ZIP_PATH"
