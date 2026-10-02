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
});