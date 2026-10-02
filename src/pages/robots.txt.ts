import type { APIRoute } from 'astro';
import { absolute } from '../config';

/**
 * robots.txt
 *
 * Policy: allow all crawlers, no disallow rules, one Sitemap line.
 * CSS, JavaScript, images and fonts are NOT blocked — Google needs them to
 * render the page.
 *
 * robots.txt controls crawling, not indexing. No page uses robots.txt to hide
 * itself from search; the 404 page uses a `noindex` meta tag instead.
 */
export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${absolute('/sitemap.xml')}`, ''].join(
    '\n',
  );

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};