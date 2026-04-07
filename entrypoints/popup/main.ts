import './style.css';

import { copyTextToClipboard, downloadMarkdownFile, getActiveTab, isCapturableUrl, runExtractorOnTab } from '../../src/lib/extension';
import type { ExtractedPage } from '../../src/lib/types';

type ActionType = 'copy-markdown' | 'copy-text' | 'download-markdown';
type ActiveTab = Awaited<ReturnType<typeof getActiveTab>>;

const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-action]'));
const statusEl = document.querySelector<HTMLParagraphElement>('#status');
const detailsEl = document.querySelector<HTMLParagraphElement>('#details');
const tabTitleEl = document.querySelector<HTMLParagraphElement>('#tab-title');
const tabUrlEl = document.querySelector<HTMLParagraphElement>('#tab-url');

let activeTab: ActiveTab;
let cachedResult: ExtractedPage | undefined;
let inflightResult: Promise<ExtractedPage> | undefined;

void bootstrap();

async function bootstrap() {
  bindButtons();
  activeTab = await getActiveTab();

  if (!activeTab?.id || !isCapturableUrl(activeTab.url)) {
    setDisabled(true);
    renderTabMeta(activeTab);
    setStatus('This tab is not accessible. Try an http, https, or file page instead.', 'error');
    return;
  }

  renderTabMeta(activeTab);
  setStatus('Ready when you are.', 'idle');
  void warmCapture();
}

function bindButtons() {
  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.action as ActionType;
      await handleAction(action);
    });
  });
}

async function handleAction(action: ActionType) {
  if (!activeTab?.id) {
    setStatus('No active tab is available right now.', 'error');
    return;
  }

  setDisabled(true);
  setStatus(getPendingMessage(action), 'idle');

  try {
    const result = await getResult(activeTab.id);

    if (action === 'copy-markdown') {
      await copyTextToClipboard(result.markdown);
      setStatus('Markdown copied to your clipboard.', 'success');
    } else if (action === 'copy-text') {
      await copyTextToClipboard(result.plainText);
      setStatus('Plain text copied to your clipboard.', 'success');
    } else {
      await downloadMarkdownFile(result);
      setStatus(`Saved ${result.filename}.`, 'success');
    }

    renderDetails(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong while reading this page.';
    setStatus(message, 'error');
  } finally {
    setDisabled(false);
  }
}

async function warmCapture() {
  if (!activeTab?.id) {
    return;
  }

  try {
    const result = await getResult(activeTab.id);
    renderDetails(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The page could not be processed.';
    setStatus(message, 'error');
  }
}

async function getResult(tabId: number): Promise<ExtractedPage> {
  if (cachedResult) {
    return cachedResult;
  }

  inflightResult ??= runExtractorOnTab(tabId)
    .then((result) => {
      cachedResult = result;
      return result;
    })
    .finally(() => {
      inflightResult = undefined;
    });

  return inflightResult;
}

function renderTabMeta(tab: ActiveTab) {
  if (!tabTitleEl || !tabUrlEl) {
    return;
  }

  tabTitleEl.textContent = tab?.title?.trim() || 'Current tab';
  tabUrlEl.textContent = tab?.url || 'Only regular web pages are supported.';
}

function renderDetails(result: ExtractedPage) {
  if (!detailsEl) {
    return;
  }

  const parts = [`${result.wordCount.toLocaleString()} words`, `${result.characterCount.toLocaleString()} characters`];

  if (result.byline) {
    parts.push(result.byline);
  }

  detailsEl.textContent = parts.join(' | ');
}

function setDisabled(disabled: boolean) {
  buttons.forEach((button) => {
    button.disabled = disabled;
  });
}

function setStatus(message: string, tone: 'idle' | 'success' | 'error') {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function getPendingMessage(action: ActionType) {
  if (action === 'copy-markdown') {
    return 'Extracting the page and preparing Markdown...';
  }

  if (action === 'copy-text') {
    return 'Extracting the page and flattening it to plain text...';
  }

  return 'Extracting the page and preparing a download...';
}
