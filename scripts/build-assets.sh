#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/assets/source"
PUBLIC_ICON_DIR="$ROOT_DIR/assets/public/icons"
STORE_ASSET_DIR="$ROOT_DIR/release/chrome/web-store/assets"
LOCK_DIR="$ROOT_DIR/.build-assets.lock"

mkdir -p "$PUBLIC_ICON_DIR" "$STORE_ASSET_DIR"

cleanup() {
  rm -rf "$LOCK_DIR"
}

acquire_lock() {
  while true; do
    if mkdir "$LOCK_DIR" 2>/dev/null; then
      echo "$$" > "$LOCK_DIR/pid"
      return
    fi

    if [[ -f "$LOCK_DIR/pid" ]]; then
      local lock_pid=""
      lock_pid="$(<"$LOCK_DIR/pid")"

      if ! kill -0 "$lock_pid" 2>/dev/null; then
        rm -rf "$LOCK_DIR"
        continue
      fi
    fi

    sleep 0.1
  done
}

trap cleanup EXIT INT TERM
acquire_lock

render_svg() {
  local input_file="$1"
  local output_file="$2"
  local width="$3"
  local height="$4"
  local thumb_size="$width"
  local quicklook_dir
  local rendered_file

  if [[ "$height" -gt "$thumb_size" ]]; then
    thumb_size="$height"
  fi

  quicklook_dir="$(mktemp -d)"
  qlmanage -t -s "$thumb_size" -o "$quicklook_dir" "$input_file" >/dev/null 2>&1
  rendered_file="$(find "$quicklook_dir" -type f -name '*.png' | head -n 1)"

  if [[ -z "${rendered_file:-}" ]]; then
    echo "Failed to render $input_file" >&2
    exit 1
  fi

  sips --resampleHeightWidth "$height" "$width" "$rendered_file" --out "$output_file" >/dev/null
  rm -rf "$quicklook_dir"
}

render_svg "$SOURCE_DIR/icon.svg" "$PUBLIC_ICON_DIR/icon-16.png" 16 16
render_svg "$SOURCE_DIR/icon.svg" "$PUBLIC_ICON_DIR/icon-32.png" 32 32
render_svg "$SOURCE_DIR/icon.svg" "$PUBLIC_ICON_DIR/icon-48.png" 48 48
render_svg "$SOURCE_DIR/icon.svg" "$PUBLIC_ICON_DIR/icon-128.png" 128 128
render_svg "$SOURCE_DIR/promo-tile.svg" "$STORE_ASSET_DIR/promo-tile-440x280.png" 440 280
render_svg "$SOURCE_DIR/store-screenshot.svg" "$STORE_ASSET_DIR/screenshot-1280x800.png" 1280 800
