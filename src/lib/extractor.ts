import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { buildFilename, buildMarkdownDocument, buildPlainTextDocument, cleanupMarkdown, countWords, normalizeText } from './document';
import type { ExtractedPage } from './types';

interface ExtractedContent {
  byline?: string;
  excerpt?: string;
  markdown: string;
  plainText: string;
  title: string;
}

const REMOVABLE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'template',
  'iframe',
  'canvas',
  'svg',
  'form',
  'dialog',
  'button',
  '[hidden]',
  '[aria-hidden="true"]',
];

const LAZY_IMAGE_ATTRIBUTES = ['data-src', 'data-lazy-src', 'data-original', 'data-url'];

export function extractCurrentPage(): ExtractedPage {
  const capturedAt = new Date().toISOString();
  const readable = tryExtractReadableContent();
  const fallback = readable ?? extractFallbackContent();
  const title = fallback.title || document.title || location.hostname;
  const markdown = buildMarkdownDocument({
    title,
    url: location.href,
    capturedAt,
    byline: fallback.byline,
    bodyMarkdown: fallback.markdown || fallback.plainText,
  });
  const plainText = buildPlainTextDocument({
    title,
    url: location.href,
    capturedAt,
    byline: fallback.byline,
    bodyText: fallback.plainText,
  });

  return {
    title,
    url: location.href,
    domain: location.hostname,
    excerpt: fallback.excerpt,
    byline: fallback.byline,
    extractedAt: capturedAt,
    filename: buildFilename(title, capturedAt),
    markdown,
    plainText,
    wordCount: countWords(fallback.plainText),
    characterCount: fallback.plainText.length,
  };
}

function tryExtractReadableContent(): ExtractedContent | undefined {
  const clonedDocument = cloneCurrentDocument();
  prepareFragment(clonedDocument);

  const article = new Readability(clonedDocument).parse();
  if (!article?.content || !article.textContent?.trim()) {
    return undefined;
  }

  const fragment = document.implementation.createHTMLDocument('');
  fragment.body.innerHTML = article.content;
  prepareFragment(fragment);

  const markdown = cleanupMarkdown(createTurndownService().turndown(fragment.body));
  const plainText = normalizeText(article.textContent);

  if (!plainText) {
    return undefined;
  }

  return {
    title: normalizeText(article.title || document.title || location.hostname),
    byline: normalizeOptional(article.byline),
    excerpt: normalizeOptional(article.excerpt),
    markdown,
    plainText,
  };
}

function extractFallbackContent(): ExtractedContent {
  const clonedDocument = cloneCurrentDocument();
  prepareFragment(clonedDocument);

  const root =
    clonedDocument.querySelector('article, main, [role="main"], .main, #main, .content, #content') ??
    clonedDocument.body;
  const markdown = cleanupMarkdown(createTurndownService().turndown(root as HTMLElement));
  const plainText = normalizeText((root.textContent || document.body?.innerText || document.title || '').trim());

  return {
    title: normalizeText(document.title || location.hostname),
    markdown: markdown || plainText,
    plainText,
  };
}

function cloneCurrentDocument() {
  return document.cloneNode(true) as Document;
}

function prepareFragment(root: Document | ParentNode) {
  removeNoise(root);
  hydrateLazyImages(root);
  absolutizeUrls(root);
}

function removeNoise(root: Document | ParentNode) {
  root.querySelectorAll(REMOVABLE_SELECTORS.join(',')).forEach((node) => node.remove());
}

function hydrateLazyImages(root: Document | ParentNode) {
  root.querySelectorAll('img').forEach((image) => {
    if (image.getAttribute('src')) {
      return;
    }

    for (const attribute of LAZY_IMAGE_ATTRIBUTES) {
      const candidate = image.getAttribute(attribute);
      if (candidate) {
        image.setAttribute('src', candidate);
        break;
      }
    }
  });
}

function absolutizeUrls(root: Document | ParentNode) {
  root.querySelectorAll<HTMLElement>('[href], [src]').forEach((node) => {
    if (node instanceof HTMLAnchorElement && node.getAttribute('href')) {
      node.setAttribute('href', toAbsoluteUrl(node.getAttribute('href') || ''));
    }

    if (node instanceof HTMLImageElement && node.getAttribute('src')) {
      node.setAttribute('src', toAbsoluteUrl(node.getAttribute('src') || ''));
    }

    if (node instanceof HTMLSourceElement && node.getAttribute('src')) {
      node.setAttribute('src', toAbsoluteUrl(node.getAttribute('src') || ''));
    }
  });
}

function toAbsoluteUrl(value: string) {
  try {
    return new URL(value, document.baseURI).href;
  } catch {
    return value;
  }
}

function createTurndownService() {
  const turndown = new TurndownService({
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
  });

  turndown.use(gfm);

  turndown.addRule('preserveDetailsSummary', {
    filter: ['summary'],
    replacement(content: string) {
      return `**${content.trim()}**\n\n`;
    },
  });

  turndown.addRule('dropEmptyLinks', {
    filter(node: Node) {
      return node.nodeName === 'A' && !((node as HTMLAnchorElement).getAttribute('href') || '').trim();
    },
    replacement(content: string) {
      return content;
    },
  });

  return turndown;
}

function normalizeOptional(input?: string | null) {
  const normalized = input ? normalizeText(input) : '';
  return normalized || undefined;
}
