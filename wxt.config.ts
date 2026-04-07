import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'release',
  outDirTemplate: '{{browser}}/unpacked',
  publicDir: 'assets/public',
  manifest: ({ manifestVersion }) => ({
    name: 'Page to Markdown',
    description:
      'Copy the current page as Markdown or plain text, or download it as a .md file.',
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    permissions: [
      'activeTab',
      'clipboardWrite',
      'downloads',
      ...(manifestVersion === 3 ? ['scripting'] : []),
    ],
    action: manifestVersion === 3
      ? {
          default_icon: {
            16: 'icons/icon-16.png',
            32: 'icons/icon-32.png',
          },
        }
      : undefined,
    browser_action: manifestVersion === 2
      ? {
          default_icon: {
            16: 'icons/icon-16.png',
            32: 'icons/icon-32.png',
          },
        }
      : undefined,
  }),
});
