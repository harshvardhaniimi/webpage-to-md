interface MarkdownDocumentInput {
  bodyMarkdown: string;
  byline?: string;
  capturedAt: string;
  title: string;
  url: string;
}

interface PlainTextDocumentInput {
  bodyText: string;
  byline?: string;
  capturedAt: string;
  title: string;
  url: string;
}

export function buildMarkdownDocument(input: MarkdownDocumentInput) {
  const lines = [`# ${input.title}`, '', `Source: ${input.url}`, `Captured: ${input.capturedAt}`];

  if (input.byline) {
    lines.push(`Byline: ${input.byline}`);
  }

  lines.push('', cleanupMarkdown(input.bodyMarkdown));

  return lines.join('\n').trimEnd() + '\n';
}

export function buildPlainTextDocument(input: PlainTextDocumentInput) {
  const lines = [input.title, '', input.url, `Captured: ${input.capturedAt}`];

  if (input.byline) {
    lines.push(`Byline: ${input.byline}`);
  }

  lines.push('', normalizeText(input.bodyText));

  return lines.join('\n').trimEnd() + '\n';
}

export function buildFilename(title: string, capturedAt: string) {
  const stem = sanitizeFilename(title).toLowerCase() || 'page';
  return `${stem}-${capturedAt.slice(0, 10)}.md`;
}

export function cleanupMarkdown(input: string) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeText(input: string) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function sanitizeFilename(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function countWords(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}
