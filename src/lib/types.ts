export interface ExtractedPage {
  byline?: string;
  characterCount: number;
  domain: string;
  excerpt?: string;
  extractedAt: string;
  filename: string;
  markdown: string;
  plainText: string;
  title: string;
  url: string;
  wordCount: number;
}

export interface LegacyResultWindow extends Window {
  __PAGE_TO_MD_RESULT__?: ExtractedPage;
}
