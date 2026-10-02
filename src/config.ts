/**
 * SINGLE SOURCE OF TRUTH FOR THE SITE ORIGIN.
 *
 * Every canonical URL, sitemap entry, robots.txt Sitemap line, Open Graph URL
 * and JSON-LD `@id` derives from SITE_URL. Change it here (and `site` in
 * astro.config.mjs) to move the whole site to a custom domain at once.
 */
export const SITE_URL = 'https://monssifzhairi.github.io';

/**
 * Absolute URL for a site-root-relative path.
 * `path` must start with a slash. Trailing slashes are preserved as given so
 * that canonicals, internal links and sitemap entries stay byte-identical.
 *
 * absolute('/')                    -> https://monssifzhairi.github.io/
 * absolute('/projects/mr-chess/')  -> https://monssifzhairi.github.io/projects/mr-chess/
 * absolute('/sitemap.xml')         -> https://monssifzhairi.github.io/sitemap.xml
 */
export function absolute(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

/** Stable JSON-LD node identifiers (blueprint section 10). */
export const ID = {
  person: absolute('/#person'),
  website: absolute('/#website'),
} as const;