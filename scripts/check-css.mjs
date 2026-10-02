#!/usr/bin/env node
/**
 * Parses the built CSS with a real CSS parser and asserts the stylesheet
 * actually contains the rules it appears to contain.
 *
 * Why this exists
 * ---------------
 * The reduced-motion block was once silently destroyed. A comment opener was
 * clobbered during an edit, leaving orphaned prose at the top level. A CSS
 * parser does not error on this: it reads the prose plus the following
 * `@media` prelude as one *selector*, finds it invalid, and throws away the
 * block and all 13 rules inside it. Every text-based check passed the whole
 * time, because the strings were still present in the file.
 *
 * The practical result was that `prefers-reduced-motion` did nothing at all.
 * So this script checks structure, not strings:
 *
 *   1. every stylesheet parses
 *   2. no rule has a selector containing leftover prose or a stray comment end
 *   3. the reduced-motion block exists and directly contains the rules that
 *      provide the static experience
 *
 * Run: node scripts/check-css.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const failures = [];

/** Selectors that must survive inside a prefers-reduced-motion block. */
const REQUIRED_IN_REDUCED_MOTION = [
  '.js-reveal',
  '.film-texture',
  '.cursor-dot',
  '[data-magnetic]',
];

function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/* Astro splits styling in two: src/styles/global.css becomes a linked
   stylesheet, while each component's scoped <style> is inlined into the page
   HTML. Checking only the linked file would leave most of the CSS unverified,
   so both sources are collected here. */
function collectCss() {
  const sources = [];

  const cssDir = join(dist, '_astro');
  for (const file of readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
    sources.push({ label: file, css: readFileSync(join(cssDir, file), 'utf8') });
  }

  let inlineCount = 0;
  for (const page of readdirSync(dist, { recursive: true })) {
    if (!String(page).endsWith('.html')) continue;
    const rel = join(dist, String(page));
    const html = readFileSync(rel, 'utf8');
    for (const [, body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      sources.push({ label: `inline in ${page} #${++inlineCount}`, css: body });
    }
  }
  return sources;
}

const sources = collectCss();
check(
  `found ${sources.length} stylesheet source(s) (linked + inlined)`,
  sources.length > 0,
);

let totalRules = 0;
let reducedMotionBlocks = 0;
const reducedMotionSelectors = new Set();

for (const { label, css } of sources) {
  let ast;
  try {
    ast = postcss.parse(css, { from: label });
  } catch (err) {
    check(`${label}: parses`, false, err.message);
    continue;
  }

  // Orphaned prose or a stray comment terminator inside a selector means a
  // comment swallowed the rule that follows it.
  const malformed = [];
  ast.walkRules((rule) => {
    totalRules++;
    const sel = rule.selector || '';
    if (/\/\*|\*\/|\bsaid\b|complete, static/.test(sel)) malformed.push(sel.slice(0, 60));
  });
  check(
    `${label}: no rule has a malformed selector`,
    malformed.length === 0,
    malformed.join(' | '),
  );

  ast.walkAtRules('media', (atRule) => {
    if (!atRule.params.includes('prefers-reduced-motion')) return;
    reducedMotionBlocks++;
    // Only direct children count. Rules nested inside a swallowed block would
    // otherwise still be reachable by walkAtRules and look fine.
    for (const child of atRule.nodes || []) {
      if (child.type !== 'rule') continue;
      child.selector
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => reducedMotionSelectors.add(s));
    }
  });
}

check('a prefers-reduced-motion block was found', reducedMotionBlocks > 0, `found ${reducedMotionBlocks}`);

for (const required of REQUIRED_IN_REDUCED_MOTION) {
  check(
    `reduced-motion directly contains "${required}"`,
    reducedMotionSelectors.has(required),
    `present: ${[...reducedMotionSelectors].join(', ') || 'none'}`,
  );
}

/* Outlined text relies on `-webkit-text-stroke`, which is a prefixed,
   non-standard property. Setting `color: transparent` next to it means a
   browser that cannot stroke text renders *nothing*. So any rule combining the
   two must sit inside an @supports guard for the same property. */
const unguardedStrokeText = [];
for (const { label, css } of sources) {
  let ast;
  try {
    ast = postcss.parse(css, { from: label });
  } catch {
    continue;
  }
  ast.walkRules((rule) => {
    const transparent = /color:\s*(transparent|#0000|rgba?\([^)]*,\s*0\s*\))/i.test(rule.toString());
    if (!transparent) return;
    if (!/-webkit-text-stroke/.test(rule.toString())) return;
    let p = rule.parent;
    let guarded = false;
    while (p && p.type !== 'root') {
      if (p.type === 'atrule' && p.name === 'supports' && /-webkit-text-stroke/.test(p.params)) {
        guarded = true;
        break;
      }
      p = p.parent;
    }
    if (!guarded) {
      unguardedStrokeText.push(`${label}: ${rule.selector.slice(0, 50)}`);
    }
  });
}
check(
  'outlined text (transparent fill + text-stroke) is @supports-guarded',
  unguardedStrokeText.length === 0,
  unguardedStrokeText.join(' | '),
);

console.log(`\n  ${totalRules} style rules parsed across ${sources.length} stylesheet source(s)`);

if (failures.length) {
  console.log(`\nRESULT: ${failures.length} FAILED`);
  failures.forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log('RESULT: CSS structure OK');
