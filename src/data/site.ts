/**
 * Identity, navigation and shared copy.
 *
 * TRUTHFULNESS RULE: nothing in this file may state employment, education,
 * awards, clients, certifications, metrics or location. Those were explicitly
 * declined (locked decision: no public location, email or portrait).
 */

export const SITE = {
  /** Used verbatim, in this order and spelling, everywhere. */
  name: 'Monssif Zhairi',
  givenName: 'Monssif',
  familyName: 'Zhairi',
  /** Name variants. Signalled in structured data only, plus once in About prose. */
  alternateNames: ['Zhairi Monssif', 'Monssif'],

  /**
   * Positioning line - verbatim from the blueprint, used consistently.
   * Also the GitHub profile bio (§9.3 requires them to match).
   */
  positioning: 'Developer · Creative Developer · AI Explorer · Cybersecurity Learner',

  /**
   * Small visual/atmospheric label. NOT a page, NOT a heading, NOT the site
   * name. Used in the wordmark lockup, footer, social image and section
   * markers such as "// 01 ABOUT".
   */
  labLabel: 'MONSSIF // DIGITAL LAB',

  /**
   * The one canonical GitHub identity. The legacy handle from the previous
   * site must never appear anywhere in this project: not in links, not in
   * JSON-LD, not in documentation.
   */
  github: 'https://github.com/monssifzhairi',
  githubHandle: 'monssifzhairi',

  /** Retired personal site, kept online. Linked from About "Elsewhere" only. */
  legacySite: 'https://www.monssif.xo.je',

  /** lang="en" on <html>. hreflang is intentionally absent (blueprint §9.1). */
  locale: 'en',

  /** Matches the dark background exactly (§11). */
  themeColor: '#0d0d0d',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/** Primary navigation - identical on every page (blueprint §3). */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'About', href: '/about/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Learning', href: '/learning/' },
  { label: 'Contact', href: '/contact/' },
];

/**
 * Real topics only (blueprint §1). Drives the ambient ticker, the Learning
 * teaser and `knowsAbout`. Order is intentional and reused verbatim.
 */
export const TOPICS = [
  'Web Development',
  'Creative Development',
  'AI',
  'Cybersecurity',
  'Linux',
  'Networking',
  'Python',
  'JavaScript',
  '3D/WebGL',
  'Mathematics',
  'Mathematical Logic',
] as const;

/**
 * `knowsAbout` for the Person node. Subset of TOPICS, worded per §10.
 * No skills that are not evidenced by a project page or the Learning page.
 */
export const KNOWS_ABOUT = [
  'web development',
  'creative development',
  'artificial intelligence',
  'cybersecurity',
  'Python',
  'JavaScript',
  'WebGL',
  'Linux',
  'computer networking',
  'mathematics',
  'mathematical logic',
] as const;

/**
 * Person.description - one factual sentence matching the visible positioning
 * line. Kept free of metrics, seniority and location claims.
 */
export const PERSON_DESCRIPTION =
  'Developer working across web development, creative development, AI and cybersecurity.';

/**
 * The eight Learning areas required by blueprint §7.
 * `links` point at project pages that genuinely relate to the area.
 */
export type LearningArea = {
  id: string;
  title: string;
  /** Why it interests me. First person. */
  why: string;
  /** What I'm exploring right now. TODO slot until Monssif supplies specifics. */
  exploring: string | null;
  /** What I've built or practiced. Only real, project-linked items. */
  built: { text: string; href?: string }[];
  /** Related areas on the same page, expressed as plain text (§7). */
  related: string[];
};

export const LEARNING_AREAS: LearningArea[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    why: 'Understanding how systems break is the fastest way to understand how they work. I care less about breaking things than about the reasoning underneath them.',
    exploring: null,
    built: [],
    related: ['Linux', 'Networking'],
  },
  {
    id: 'linux',
    title: 'Linux',
    why: 'The environment most of what I want to understand runs on. Shell, permissions, processes and services are where theory becomes something you can actually see.',
    exploring: null,
    built: [],
    related: ['Networking', 'Cybersecurity'],
  },
  {
    id: 'networking',
    title: 'Networking',
    why: 'It is the layer where the abstract becomes concrete. Following a packet teaches you more about a system than reading about it does.',
    exploring: null,
    built: [],
    related: ['Linux', 'Cybersecurity'],
  },
  {
    id: 'python',
    title: 'Python',
    why: 'It is the language I reach for first when I want to test an idea quickly, and AI work pulls me back to it constantly.',
    exploring: null,
    built: [],
    related: ['AI', 'Mathematics'],
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    why: 'Not for its own sake. Mathematics is how I keep a piece of code honest about what it is actually doing.',
    exploring: null,
    built: [
      { text: 'The mathematics behind the MR-CHESS move rules', href: '/projects/mr-chess/' },
    ],
    related: ['Mathematical logic', 'Python', 'AI'],
  },
  {
    id: 'mathematical-logic',
    title: 'Mathematical logic',
    why: 'It changed how I write conditions. Reasoning about why a branch must be true or false is closer to writing software than most people expect.',
    exploring: null,
    built: [
      { text: 'The rule checks behind the MR-CHESS move generator', href: '/projects/mr-chess/' },
    ],
    related: ['Mathematics', 'AI'],
  },
  {
    id: 'ai',
    title: 'AI',
    why: 'I treat it as a subject to understand rather than a tool to advertise. What is actually happening under the interface is the interesting part.',
    exploring: null,
    built: [],
    related: ['Python', 'Mathematical logic'],
  },
  {
    id: '3d-webgl',
    title: '3D/WebGL',
    why: 'It sits exactly where creative development and programming meet: a scene is just state, and the renderer is just a function of that state.',
    exploring: null,
    built: [
      { text: 'NIKE D-LINE, an interactive 3D/WebGL experience', href: '/projects/nike-d-line/' },
    ],
    related: ['JavaScript'],
  },
];

/**
 * Plain-text rendering of the topic relationships described in blueprint §7.
 * Rendered as a real list so the information exists without JavaScript or SVG.
 */
export const LEARNING_RELATIONSHIPS: { from: string; to: string[] }[] = [
  { from: 'Linux', to: ['Networking', 'Cybersecurity'] },
  { from: 'Mathematics', to: ['Mathematical logic', 'AI'] },
  { from: 'Python', to: ['AI', 'Mathematics'] },
  { from: '3D/WebGL', to: ['JavaScript'] },
];