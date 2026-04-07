import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';

import type { LegacyResultWindow } from '../src/lib/types';

const LEGACY_RESULT_KEY = '__PAGE_TO_MD_RESULT__';

export default defineUnlistedScript({
  async main() {
    const { extractCurrentPage } = await import('../src/lib/extractor');
    const result = extractCurrentPage();
    (window as LegacyResultWindow)[LEGACY_RESULT_KEY] = result;
    return result;
  },
});
