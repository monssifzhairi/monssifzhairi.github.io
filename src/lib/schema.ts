import { ID, absolute } from '../config';
import { KNOWS_ABOUT, PERSON_DESCRIPTION, SITE } from '../data/site';

/**
 * Structured data, emitted as JSON-LD at build time (blueprint §10).
 *
 * Rules enforced here:
 *  - One connected graph per page, stable @id values.
 *  - Only mark up what is visible on that page.
 *  - NO email, NO telephone, NO address/location, NO alumniOf, NO worksFor,
 *    NO award, NO hasCredential, NO organization data (all declined upstream).
 *  - No SearchAction (retired by Google).
 *  - Never Organization, LocalBusiness, Review, AggregateRating, Product,
 *    JobPosting or FAQ.
 */

export type Crumb = {
  name: string;
  /** Site-root-relative path with a trailing slash. */
  href: string;
};

/** The Person node. Same @id on every page. */
function person() {
  return {
    '@type': 'Person',
    '@id': ID.person,
    name: SITE.name,
    givenName: SITE.givenName,
    familyName: SITE.familyName,
    alternateName: SITE.alternateNames,
    url: absolute('/'),
    description: PERSON_DESCRIPTION,
    // Real GitHub profile only.
    sameAs: [SITE.github],
    knowsAbout: [...KNOWS_ABOUT],
  };
}

/** The WebSite node. Homepage only. */
function website() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: absolute('/'),
    name: SITE.name,
    alternateName: SITE.alternateNames[0],
    inLanguage: SITE.locale,
    publisher: { '@id': ID.person },
    author: { '@id': ID.person },
  };
}

/** ProfilePage wrapper for the About page. */
function profilePage() {
  return {
    '@type': 'ProfilePage',
    '@id': `${absolute('/about/')}#profilepage`,
    url: absolute('/about/'),
    name: `About ${SITE.name}`,
    isPartOf: { '@id': ID.website },
    mainEntity: { '@id': ID.person },
  };
}

/** BreadcrumbList for inner pages. Never on the homepage. */
function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(crumbs[crumbs.length - 1]!.href)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.href),
    })),
  };
}

export type ProjectNodeInput = {
  name: string;
  description: string;
  /** Site-root-relative canonical path of the project page. */
  href: string;
  repo: string | null;
  stack: string[];
};

export function projectPath(slug: string) {
  return `/projects/${slug}/`;
}

/**
 * Conservative SoftwareSourceCode node for project pages (blueprint §10).
 * `codeRepository` and `programmingLanguage` are included ONLY when a real
 * repository URL and real stack entries exist.
 */
export function softwareSourceCode(p: ProjectNodeInput) {
  const node: Record<string, unknown> = {
    '@type': 'SoftwareSourceCode',
    '@id': `${absolute(p.href)}#sourcecode`,
    name: p.name,
    description: p.description,
    url: absolute(p.href),
    author: { '@id': ID.person },
  };
  if (p.repo) node.codeRepository = p.repo;
  if (p.stack.length > 0) node.programmingLanguage = p.stack;
  return node;
}

export type GraphInput = {
  /** Include the WebSite node (homepage only). */
  withWebsite?: boolean;
  /** Include a ProfilePage node (About page only). */
  withProfilePage?: boolean;
  /** Include a BreadcrumbList (all inner pages). */
  crumbs?: Crumb[];
  /** Include a SoftwareSourceCode node (project pages only). */
  project?: ProjectNodeInput;
};

/** Builds one connected @graph for a page. */
export function buildGraph(input: GraphInput = {}) {
  const graph: unknown[] = [person()];
  if (input.withWebsite) graph.push(website());
  if (input.withProfilePage) graph.push(profilePage());
  if (input.crumbs?.length) graph.push(breadcrumbList(input.crumbs));
  if (input.project) graph.push(softwareSourceCode(input.project));
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeGraph(input: GraphInput = {}): string {
  // Escaping `<` prevents a "</script>" sequence inside a string from
  // terminating the script element early.
  return JSON.stringify(buildGraph(input)).replace(/</g, '\\u003c');
}