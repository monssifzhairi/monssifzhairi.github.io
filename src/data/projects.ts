import { SITE } from './site';

/**
 * ============================================================================
 * ALL PROJECT REPOSITORY / DEMO URLs LIVE HERE AND NOWHERE ELSE.
 * ============================================================================
 * Locked decision: `https://github.com/monssifzhairi` is the canonical identity.
 * The legacy handle from the previous site must never appear in this
 * repository.
 *
 * STATE AS OF 2026-10-02 (recorded, not hidden):
 *   https://github.com/monssifzhairi/NIKE-D-LINE  -> HTTP 404
 *   https://github.com/monssifzhairi/mr_chess     -> HTTP 404
 * These return 404 because the repositories have not been moved/recreated under
 * the `monssifzhairi` account yet. The links are intentionally kept visible and
 * are expected to resolve once the move happens. Fix them in THIS FILE ONLY.
 */

export type ProjectStatus = 'In progress' | 'Prototype' | 'Shipped';

/**
 * A status of `null` means the status is UNCONFIRMED and is rendered as a
 * visible "to confirm" marker, never guessed.
 */

export type Project = {
  slug: string;
  name: string;
  /** Section marker label, e.g. "// 01". */
  index: string;
  /** One-line description used on the homepage and projects index. */
  summary: string;
  /** Honest status label, or null when unconfirmed. Never embellished. */
  status: ProjectStatus | null;
  /**
   * Stack tags. Empty when unconfirmed; the page then renders a visible
   * "to confirm" marker rather than inventing technologies.
   */
  stack: string[];
  /** External repository. null when no repo is known to exist. */
  repo: string | null;
  /** Live demo. null when none is known to exist. */
  demo: string | null;
  /**
   * Typographic hero figure. Real design content, not a fabricated screenshot.
   * When a real screenshot exists, `heroImage.src` can be added without
   * changing page structure or SEO markup.
   */
  heroFigure: string;
  heroAlt: string;
  disclaimer?: string;
  /** Content for the shared case-study template (blueprint section 6). */
  overview: string[];
  features: string[];
  how: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: 'mr-chess',
    name: 'MR-CHESS',
    index: '// 01',
    summary: 'A chess engine written from scratch in Dart.',
    status: 'In progress',
    stack: ['Dart'],
    repo: `${SITE.github}/mr_chess`,
    demo: null,
    heroFigure: '♞',
    heroAlt: '',
    overview: [
      'MR-CHESS is a chess engine written from scratch in Dart.',
      'The goal is the engine itself: a correct, self-contained implementation of the rules, written to be read rather than to be fast.',
    ],
    features: [
      'Legal move generation',
      'Castling',
      'En passant',
      'Promotion',
      'Draw conditions',
    ],
    how: [
      'Written in Dart.',
      'The move rules are implemented directly rather than delegated to a library, so the logic is the readable part of the project.',
    ],
  },
  {
    slug: 'monssif-fit',
    name: 'MONSSIF FIT',
    index: '// 02',
    summary: 'A fitness application built with React and Supabase.',
    status: 'In progress',
    stack: ['React', 'Supabase'],
    repo: null,
    demo: null,
    heroFigure: 'M·F',
    heroAlt: '',
    overview: [
      'MONSSIF FIT is a fitness application built with React and Supabase.',
      'The interesting part is not the interface: it is that access to data is enforced in the database rather than only in the client.',
    ],
    features: [
      'Authentication',
      'User profiles',
      'Workouts',
      'File storage',
      'Database security via Row Level Security (RLS)',
    ],
    how: [
      'React on the front end, Supabase on the back end.',
      'Row Level Security policies define who can read and write which rows, so the rules live in the database instead of being trusted to the client.',
    ],
  },
  {
    slug: 'nike-d-line',
    name: 'NIKE D-LINE',
    index: '// 03',
    summary: 'An interactive 3D/WebGL product experience.',
    status: 'Prototype',
    stack: ['3D', 'WebGL'],
    repo: `${SITE.github}/NIKE-D-LINE`,
    demo: null,
    heroFigure: 'D-LINE',
    heroAlt: '',
    disclaimer:
      'NIKE D-LINE is an independent personal concept and demonstration. It is not affiliated with, sponsored by, or endorsed by Nike, Inc.',
    overview: [
      'NIKE D-LINE is an interactive 3D/WebGL product experience.',
      'It exists to test how far a product can be explored in a browser instead of looked at in a flat image.',
    ],
    features: [
      'Interactive 3D product presentation in the browser',
      'Built on WebGL rendering rather than pre-rendered imagery',
      'Pointer and scroll driven interaction',
    ],
    how: [
      'Built with 3D and WebGL.',
      'WebGL gives direct control over the scene, which is what makes the interaction real rather than simulated.',
    ],
  },
  {
    slug: 'promesatec',
    name: 'PROMESATEC',
    index: '// 04',
    summary: 'An interactive logistics, cargo and textile experience connected to Spain.',
    // TODO CONFIRM: status not supplied. Not guessed.
    status: null,
    // TODO CONFIRM: stack not supplied. Not guessed.
    stack: [],
    // TODO CONFIRM: no repository URL known to exist.
    repo: null,
    // TODO CONFIRM: no demo URL known to exist.
    demo: null,
    heroFigure: 'P/S',
    heroAlt: '',
    overview: [
      'PROMESATEC is an interactive logistics, cargo and textile experience connected to Spain.',
    ],
    // TODO CONFIRM: only true features may be listed here.
    features: [],
    // TODO CONFIRM: stack and key technical decisions not supplied.
    how: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/** Previous / next project, wrapping in the order shown on the index page. */
export function getProjectNeighbours(slug: string) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return { previous: undefined, next: undefined };
  return {
    previous: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(i + 1) % PROJECTS.length],
  };
}