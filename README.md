# Page to Markdown

<img width="1582" height="1035" alt="image" src="https://github.com/user-attachments/assets/bf0ccfef-bdee-48e1-9746-50b24021ffd5" />


A lightweight browser extension built with WXT and TypeScript that turns the current tab into:

- Markdown on your clipboard
- Plain text on your clipboard
- A downloaded `.md` file

It uses Mozilla Readability to pull out the main article content when possible, then converts the cleaned HTML to Markdown with Turndown and the GFM plugin.

## What it does

- Click the toolbar icon to open a tiny action popup
- Copy the current page as Markdown
- Copy the current page as plain text
- Download the current page as a Markdown file
- Prefer reader-style content extraction, with a full-page fallback for less article-like pages

## Stack

- WXT
- TypeScript
- `@mozilla/readability`
- `turndown`
- `turndown-plugin-gfm`

## Development

```bash
npm install
npm run dev:chrome
```

That starts WXT in Chrome dev mode and prepares the generated icon/store assets automatically.

## Build

```bash
npm run build:chrome
npm run build:safari
```

Chrome and Safari builds are emitted under `release/`.

- Chrome unpacked build: `release/chrome/unpacked`
- Safari unpacked build: `release/safari/unpacked`

## Chrome Store Package

```bash
npm run pack:chrome-store
```

That creates Chrome Web Store artifacts under `release/chrome/web-store/`:

- upload zip
- listing docs
- store graphics

`npm run build:assets` is still available if you only want to regenerate the icons and store artwork.

## Load in Chrome

1. Run `npm run build:chrome`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Choose **Load unpacked**
5. Select `release/chrome/unpacked`

## Load in Safari

1. Run `npm run build:safari`
2. Convert `release/safari/unpacked` with Apple's Safari web extension tooling
3. Open the generated Xcode project and run it

Safari packaging requires full Xcode, not just the command line tools.

## Repo Layout

```text
assets/
  public/        Static files copied into extension builds
  source/        Editable SVG artwork sources
docs/
  chrome-web-store/  Store listing and upload notes
entrypoints/     Extension entrypoints
src/             Shared TypeScript logic
scripts/         Build and packaging scripts
release/
  chrome/
    unpacked/    Load this in Chrome during development
    web-store/   Upload zip and store listing assets
  safari/
    unpacked/    Convert this with Apple's Safari tooling
```

## Notes

- The extension only works on normal `http`, `https`, and `file` pages
- Browser-internal pages like `chrome://` and `about:` are not accessible
- For `file://` pages in Chrome, you may need to enable file URL access for the extension

---

Built with [Claude Code](https://claude.ai/code).
