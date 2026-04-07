import { browser } from 'wxt/browser';

import type { ExtractedPage } from './types';

const EXTRACTOR_FILE = 'extract-page.js';
const LEGACY_RESULT_KEY = '__PAGE_TO_MD_RESULT__';

interface LegacyTabsApi {
  executeScript?: (
    tabId: number,
    details: { code?: string; file?: string },
  ) => Promise<unknown[]>;
}

export async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

export function isCapturableUrl(url?: string) {
  return Boolean(url && /^(https?:\/\/|file:\/\/)/i.test(url));
}

export async function runExtractorOnTab(tabId: number): Promise<ExtractedPage> {
  if (browser.scripting?.executeScript) {
    const results = await browser.scripting.executeScript({
      target: { tabId },
      files: [EXTRACTOR_FILE],
    });
    const result = results[0]?.result as ExtractedPage | undefined;

    if (result) {
      return result;
    }
  }

  const legacyTabs = browser.tabs as typeof browser.tabs & LegacyTabsApi;

  if (legacyTabs.executeScript) {
    await legacyTabs.executeScript(tabId, { file: EXTRACTOR_FILE });
    const legacyResult = await legacyTabs.executeScript(tabId, {
      code: `window.${LEGACY_RESULT_KEY}`,
    });
    const result = legacyResult?.[0];

    if (result && typeof result === 'object') {
      return result as ExtractedPage;
    }
  }

  throw new Error('This browser could not inject the page reader for the current tab.');
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea fallback for browsers with stricter clipboard rules.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

export async function downloadMarkdownFile(result: ExtractedPage) {
  const blob = new Blob([result.markdown], {
    type: 'text/markdown;charset=utf-8',
  });
  const objectUrl = URL.createObjectURL(blob);

  try {
    if (browser.downloads?.download) {
      try {
        await browser.downloads.download({
          url: objectUrl,
          filename: result.filename,
          saveAs: true,
          conflictAction: 'uniquify',
        });
        return;
      } catch {
        // Fall back to a plain anchor download below.
      }
    }

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = result.filename;
    anchor.click();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
  }
}
