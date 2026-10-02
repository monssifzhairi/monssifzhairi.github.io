// @ts-check
import { defineConfig } from 'astro/config';
import { SITE_URL } from './src/config.ts';

/**
 * Astro configuration.
 *
 * `site` is derived from SITE_URL in src/config.ts, which is the single
 * source of truth for the origin. Do not type the origin anywhere else.
 */
export default defineConfig({
  site: SITE_URL,
  // Directory-style URLs: /projects/mr-chess/ -> dist/projects/mr-chess/index.html
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  vite: {
    build: {
      /**
       * Astro inlines a script only when its minified output is under Vite's
       * `assetsInlineLimit` (4096 by default). The interaction layer is ~4 KB
       * minified, so the default would flip it into a separate _astro/*.js
       * request at the first sign of growth. Raising the limit keeps the whole
       * site at zero JavaScript files, which scripts/verify.py asserts.
       *
       * Images and fonts all live in public/ and are copied verbatim, so this
       * limit only ever applies to the inline script chunks.
       */
      assetsInlineLimit: 8192,
    },
  },
});