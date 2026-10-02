import type { APIRoute } from 'astro';
import { absolute } from '../config';

/**
 * Canonical, indexable, 200-status URLs only. The 404 page is excluded.
 *
 * `lastmod` is emitted only when a real content change date is supplied in
 * `SITEMAP_LASTMOD` (ISO 8601). It is left unset by default because an
 * automated lastmod on every build is not a real content change.
 * `changefreq` and `priority` are deliberately omitted — Google ignores them.
 */
const PAGES = [
  '/',
  '/about/',
  '/projects/',
  '/projects/mr-chess/',
  '/projects/monssif-fit/',
  '/projects/nike-d-line/',
  '/projects/promesatec/',
  '/learning/',
  '/contact/',
];

/** Set to an ISO date when content actually changes, e.g. '2026-10-02'. */
const LASTMOD: string | null = null;

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const body = PAGES.map((path) => {
    const lastmod = LASTMOD ? `\n    <lastmod>${escape(LASTMOD)}</lastmod>` : '';
    return `  <url>\n    <loc>${escape(absolute(path))}</loc>${lastmod}\n  </url>`;
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};