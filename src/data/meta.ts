import type { Project } from './projects';
import { SITE_URL } from '../config';
import { SITE } from './site';

/**
 * Per-page title / description / Open Graph / Twitter configuration.
 *
 * Titles and descriptions come verbatim from blueprint §11. Descriptions are
 * unique per page and are factual summaries only.
 */

export type PageMeta = {
  title: string;
  description: string;
  ogType: 'website' | 'profile' | 'article';
  /** Absolute path to the OG image. Always 1200x630. */
  ogImage: string;
  ogImageAlt: string;
  /** Avoids indexing thin or duplicate surfaces. The 404 page sets this. */
  noindex?: boolean;
};

export const OG_DEFAULT_PATH = '/og/og-default.jpg';
export const OG_DEFAULT_ALT =
  'Monssif Zhairi — Developer, Creative Developer, AI Explorer and Cybersecurity Learner, on a near-black background.';

/** Fields every page shares. The per-page title/description/type is spread in. */
type PageMetaBase = Pick<PageMeta, 'ogImage' | 'ogImageAlt'>;

const base: PageMetaBase = {
  ogImage: OG_DEFAULT_PATH,
  ogImageAlt: OG_DEFAULT_ALT,
};

export const META = {
  home: {
    ...base,
    title: 'Monssif Zhairi — Developer, Creative Developer & AI Explorer',
    description:
      'Monssif Zhairi is a developer working across web and creative development, AI and cybersecurity. Explore projects like MR-CHESS, MONSSIF FIT and NIKE D-LINE.',
    ogType: 'website',
  },
  about: {
    ...base,
    title: 'About Monssif Zhairi',
    description:
      'Who Monssif Zhairi is, what he builds across web, 3D and AI, and what he is learning in cybersecurity, Linux, networking and mathematics.',
    ogType: 'profile',
  },
  projects: {
    ...base,
    title: 'Projects by Monssif Zhairi',
    description:
      'Selected projects by Monssif Zhairi: a Dart chess engine, a React and Supabase fitness app, a 3D/WebGL product experience and an interactive logistics site.',
    ogType: 'website',
  },
  learning: {
    ...base,
    title: 'Learning — Monssif Zhairi',
    description:
      'What Monssif Zhairi is currently studying: cybersecurity, Linux, networking, Python, mathematics and mathematical logic.',
    ogType: 'website',
  },
  contact: {
    ...base,
    title: 'Contact Monssif Zhairi',
    description: 'Get in touch with Monssif Zhairi about collaboration or projects.',
    ogType: 'website',
  },
  notFound: {
    ...base,
    title: 'Page not found — Monssif Zhairi',
    description: `That page does not exist on ${new URL(SITE_URL).hostname}.`,
    ogType: 'website',
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

/** Meta for a project detail page, derived from its data entry. */
export function projectMeta(project: Project): PageMeta {
  const DESCRIPTIONS: Record<string, string> = {
    'mr-chess':
      'A chess engine in Dart with legal moves, castling, en passant, promotion and draw conditions, by Monssif Zhairi.',
    'monssif-fit':
      'A fitness app with authentication, profiles, workouts, storage and database security using Supabase RLS.',
    'nike-d-line':
      'An independent interactive 3D/WebGL product experience built by Monssif Zhairi.',
    promesatec:
      'An interactive logistics, cargo and textile experience connected to Spain, by Monssif Zhairi.',
  };

  const TITLES: Record<string, string> = {
    'mr-chess': 'MR-CHESS: a Dart chess engine — Monssif Zhairi',
    'monssif-fit': 'MONSSIF FIT: React and Supabase fitness app — Monssif Zhairi',
    'nike-d-line': 'NIKE D-LINE: an interactive 3D/WebGL experience — Monssif Zhairi',
    // TODO CONFIRM: blueprint §11 marks this wording as unconfirmed.
    // Shortened from the blueprint's draft so the title stays under ~65 chars
    // and Google does not truncate it. "cargo" is kept in the description.
    promesatec: 'PROMESATEC: logistics and textile experience — Monssif Zhairi',
  };

  return {
    ...base,
    title: TITLES[project.slug] ?? `${project.name} — Monssif Zhairi`,
    description: DESCRIPTIONS[project.slug] ?? project.summary,
    ogType: 'article',
  };
}

export const SITE_NAME = SITE.name;