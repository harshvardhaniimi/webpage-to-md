# Chrome Web Store Upload

## Files to Use

- Extension upload ZIP: `release/chrome/web-store/page-to-markdown-chrome-store.zip`
- Store icon: `release/chrome/web-store/assets/icon-128.png`
- Screenshot: `release/chrome/web-store/assets/screenshot-1280x800.png`
- Small promo tile: `release/chrome/web-store/assets/promo-tile-440x280.png`
- Listing copy: `release/chrome/web-store/docs/listing.md`

## Dashboard Steps

1. Sign in to the Chrome Web Store Developer Dashboard.
2. Create a new item.
3. Upload `release/chrome/web-store/page-to-markdown-chrome-store.zip`.
4. Fill in the store listing using `docs/listing.md`.
5. Upload the `128x128` icon, screenshot, and `440x280` promo tile.
6. Complete the privacy section based on the current extension behavior.
7. Submit for review.

## Important Notes

- The ZIP already has `manifest.json` at the root, which is what the Chrome Web Store expects.
- If you change the extension code, rerun `npm run pack:chrome-store` before uploading a new version.
- Future uploads must use a higher extension version than the previous upload.
