# Chrome Web Store Listing

## Suggested Name

Page to Markdown

## Summary

Copy the current page as Markdown or plain text, or download it as a clean Markdown file.

## Description

Page to Markdown is a simple one-click utility for turning the current tab into something you can actually use.

Use it to:

- Copy a readable Markdown version of the current page
- Copy a plain text version for notes, docs, or AI prompts
- Download the extracted content as a `.md` file

The extension is designed for low-friction page capture:

- Click the toolbar icon
- Choose Markdown, plain text, or download
- Get the result immediately

It uses reader-style extraction to focus on the main content of the page when possible, then falls back to the page body for less article-like layouts.

## Suggested Category

Productivity

## Suggested Language

English

## Privacy Notes

Suggested answers for the Chrome Web Store privacy section, based on the current code:

- Personal communications: No
- Health information: No
- Financial information: No
- Authentication information: No
- Personal location: No
- Web history: No
- User activity: No
- Website content: Yes, but only transiently on the active tab when the user clicks the extension

Suggested disclosures:

- The extension processes the content of the current page locally in the browser.
- The extension does not send page content to a remote server.
- The extension does not sell user data.
- The extension does not use data for advertising or creditworthiness decisions.

## Test Instructions

1. Open any normal webpage over `http` or `https`.
2. Click the extension icon in the toolbar.
3. Verify that `Copy Markdown`, `Copy Plain Text`, and `Download .md` all work.
4. Verify that browser-internal pages like `chrome://extensions` are rejected gracefully.
