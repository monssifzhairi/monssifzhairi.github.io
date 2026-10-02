/**
 * Behavioural tests for the shipped inline JavaScript, executed in a real DOM.
 *
 * Covers the things static analysis cannot prove:
 *   - the mobile overlay navigation (focus trap, Escape, scroll lock, a11y state)
 *   - the reveal-on-scroll system and its reduced-motion behaviour
 *   - the ticker pause control and its reduced-motion behaviour
 *   - the pointer ring, magnetic controls, parallax and decoder text, including
 *     that they are inert on coarse pointers and under reduced motion, and that
 *     the decoder cannot alter an accessible name
 *
 * Run: node scripts/test-behaviour.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = join(root, 'dist', 'index.html');
const html = readFileSync(page, 'utf8');

let passed = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/**
 * Boot the page's inline scripts inside jsdom, optionally with reduced motion
 * and/or a fine pointer.
 *
 * Astro hoists page scripts into <script type="module">. jsdom cannot execute
 * ES modules, so the DOM is built without running scripts and each inline
 * script is then evaluated in order through window.eval(). The shipped code is
 * plain JS with no import/export, so evaluating it directly is equivalent to
 * what a browser does.
 */
function boot({ reducedMotion = false, finePointer = false } = {}) {
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://monssifzhairi.github.io/',
    virtualConsole,
    beforeParse(window) {
      window.matchMedia = (query) => {
        let matches = false;
        if (/prefers-reduced-motion/.test(query)) matches = reducedMotion;
        if (/hover: hover/.test(query)) matches = finePointer;
        return {
          matches,
          media: query,
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent() {
            return false;
          },
        };
      };
      window.IntersectionObserver = class {
        constructor(cb) {
          this.cb = cb;
        }
        observe(el) {
          // Simulate the element entering the viewport.
          this.cb([{ isIntersecting: true, target: el }], this);
        }
        unobserve() {}
        disconnect() {}
      };
    },
  });

  // Evaluate the page's own scripts, in document order.
  const scripts = [...dom.window.document.querySelectorAll('script')].filter(
    (s) => s.type === 'module' || (s.type === '' && s.textContent.trim()),
  );
  for (const s of scripts) {
    dom.window.eval(s.textContent);
  }
  return dom;
}

function key(dom, target, k, { shift = false } = {}) {
  const { window } = dom;
  const ev = new window.KeyboardEvent('keydown', {
    key: k,
    bubbles: true,
    cancelable: true,
    shiftKey: shift,
  });
  (target || window.document).dispatchEvent(ev);
  return ev;
}

/* ------------------------------------------------ mobile overlay nav -- */
console.log('\nMOBILE OVERLAY NAVIGATION');
{
  const dom = boot();
  const { window } = dom;
  const doc = window.document;
  const toggle = doc.getElementById('menu-toggle');
  const overlay = doc.getElementById('mobile-nav');
  const close = doc.getElementById('menu-close');
  const toggleName = () => toggle.querySelector('.sr-only').textContent;

  check('overlay starts hidden', overlay.hidden === true);
  check('toggle starts collapsed', toggle.getAttribute('aria-expanded') === 'false');
  check('toggle controls the overlay', toggle.getAttribute('aria-controls') === 'mobile-nav');
  check('toggle has an accessible name', toggleName() === 'Open menu');
  check('close button has an accessible name', !!close.textContent.includes('Close menu'));

  toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('click opens the overlay', overlay.hidden === false);
  check('aria-expanded=true when open', toggle.getAttribute('aria-expanded') === 'true');
  check('toggle name becomes "Close menu"', toggleName() === 'Close menu');
  check('background scroll is locked', doc.documentElement.classList.contains('no-scroll'));
  check('focus moved into the panel', doc.activeElement === close, `activeElement=${doc.activeElement?.id}`);

  // focus trap: Tab from the last focusable wraps to the first
  const items = overlay.querySelectorAll('a[href], button:not([disabled])');
  const last = items[items.length - 1];
  last.focus();
  key(dom, window.document, 'Tab');
  check('Tab wraps from last to first', doc.activeElement === items[0], `got ${doc.activeElement?.tagName}`);

  // Shift+Tab from the first wraps to the last
  items[0].focus();
  key(dom, window.document, 'Tab', { shift: true });
  check('Shift+Tab wraps from first to last', doc.activeElement === last);

  // Escape closes and restores focus + state
  key(dom, window.document, 'Escape');
  check('Escape closes the overlay', overlay.getAttribute('data-open') === 'false');
  check('aria-expanded=false after Escape', toggle.getAttribute('aria-expanded') === 'false');
  check('scroll lock released', !doc.documentElement.classList.contains('no-scroll'));
  check('focus returned to the toggle', doc.activeElement === toggle);
  check('toggle name restored', toggleName() === 'Open menu');

  // Toggle button closes it again (second click)
  toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('reopens on second click', overlay.hidden === false);
  toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('closes on toggle click', overlay.getAttribute('data-open') === 'false');

  // Close button closes it
  toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  close.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('close button closes the overlay', overlay.getAttribute('data-open') === 'false');

  dom.window.close();
}

/* ------------------------------------------------------ active page -- */
console.log('\nACTIVE PAGE INDICATION');
{
  const dom = boot();
  const { window } = dom;
  const doc = window.document;
  const current = doc.querySelectorAll('nav [aria-current="page"]');
  // On "/" the desktop nav has no page marked, and the wordmark is the home link.
  check('no nav item wrongly marked as current on /', current.length === 0, `found ${current.length}`);

  const wordmark = doc.querySelector('.wordmark');
  check('wordmark links to the homepage', wordmark.getAttribute('href') === '/');
  check('wordmark has an accessible name', !!wordmark.getAttribute('aria-label'));
  dom.window.close();
}

/* ---------------------------------------------------- reduced motion -- */
console.log('\nREDUCED MOTION');
{
  const dom = boot({ reducedMotion: true });
  const { window } = dom;
  const doc = window.document;
  const items = doc.querySelectorAll('[data-reveal]');
  check('reveal elements exist', items.length > 0, `${items.length}`);

  const hidden = [...items].filter((el) => el.classList.contains('js-reveal'));
  check('no reveal element is opted into animation under reduced motion', hidden.length === 0, `${hidden.length} opted in`);

  dom.window.close();

  // Confirm the shipped stylesheet honours prefers-reduced-motion.
  const cssDir = join(root, 'dist', '_astro');
  const cssFiles = readdirSync(cssDir).filter((f) => f.endsWith('.css'));
  const shipped = cssFiles.map((f) => readFileSync(join(cssDir, f), 'utf8')).join('\n');
  const occurrences = (shipped.match(/prefers-reduced-motion/g) || []).length;
  check('reduced-motion media query present in shipped CSS', occurrences > 0, `${occurrences} occurrences`);
  check('reduced-motion disables the film texture animation', /film-texture[\s\S]{0,200}animation:\s*none/.test(shipped));
  check('reduced-motion forces reveal elements visible', /js-reveal[\s\S]{0,120}opacity:\s*1\s*!important/.test(shipped));
}

{
  // With motion allowed, elements opt in and IntersectionObserver reveals them.
  const dom = boot({ reducedMotion: false });
  const { window } = dom;
  const doc = window.document;
  const items = doc.querySelectorAll('[data-reveal]');
  const opted = [...items].filter((el) => el.classList.contains('js-reveal'));
  check('reveal elements opt in when motion is allowed', opted.length === items.length, `${opted.length}/${items.length}`);

  // The test's IntersectionObserver reports every observed element as visible,
  // so this asserts the reveal path actually completes.
  const revealed = [...items].filter((el) => el.classList.contains('is-visible'));
  check(
    'IntersectionObserver reveals opted-in elements',
    revealed.length === opted.length,
    `${revealed.length}/${opted.length}`,
  );

  // Content must still be present in the DOM regardless: check the hero text.
  const h1 = doc.querySelector('h1');
  check('hero H1 is real text in the DOM', h1 && h1.textContent.trim() === 'Monssif Zhairi', h1?.textContent);
  dom.window.close();
}

/* ------------------------------------------------------ ticker pause -- */
console.log('\nAMBIENT TICKER');
{
  const dom = boot();
  const { window } = dom;
  const doc = window.document;
  const ticker = doc.getElementById('ticker');
  const ctrl = doc.getElementById('ticker-toggle');
  const label = doc.getElementById('ticker-toggle-label');

  check('ticker viewport is hidden from assistive tech', doc.querySelector('.ticker__viewport').getAttribute('aria-hidden') === 'true');
  check('ticker has a pause control', !!ctrl);
  check('pause control starts unpressed', ctrl.getAttribute('aria-pressed') === 'false');
  check('pause control is keyboard reachable (real button)', ctrl.tagName === 'BUTTON');
  check('pause control has an accessible name', label.textContent.length > 3, label.textContent);

  ctrl.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('click pauses the ticker', ticker.dataset.paused === 'true');
  check('aria-pressed reflects paused state', ctrl.getAttribute('aria-pressed') === 'true');
  check('label changes to "Resume"', /Resume/i.test(label.textContent), label.textContent);

  ctrl.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('click resumes the ticker', ticker.dataset.paused === 'false');
  dom.window.close();
}

{
  const dom = boot({ reducedMotion: true });
  const { window } = dom;
  const doc = window.document;
  const ctrl = doc.getElementById('ticker-toggle');
  check('ticker control disabled under reduced motion', ctrl.disabled === true);
  check('ticker marked paused under reduced motion', doc.getElementById('ticker').dataset.paused === 'true');
  dom.window.close();
}

/* --------------------------------------------- pointer + motion layer -- */
console.log('\nPOINTER RING, MAGNETIC, PARALLAX, DECODER TEXT');

{
  // Default boot: the mock reports a coarse pointer.
  const dom = boot();
  const { window } = dom;
  const doc = window.document;
  check(
    'no pointer ring on a coarse pointer',
    !doc.querySelector('.cursor-ring') && !doc.querySelector('.cursor-dot'),
  );
  check(
    'no magnetic hookup on a coarse pointer',
    doc.querySelectorAll('.btn[data-magnetic]').length === 0,
  );
  dom.window.close();
}

{
  const dom = boot({ finePointer: true });
  const { window } = dom;
  const doc = window.document;
  const ring = doc.querySelector('.cursor-ring');
  const dot = doc.querySelector('.cursor-dot');

  check('pointer ring created on a fine pointer', !!ring && !!dot);
  check('ring is hidden from assistive tech', ring?.getAttribute('aria-hidden') === 'true');
  check('dot is hidden from assistive tech', dot?.getAttribute('aria-hidden') === 'true');

  // The native pointer must survive: the design adds a ring, it never
  // replaces the cursor.
  const styles = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('');
  check('native cursor is never hidden (no cursor:none)', !/cursor\s*:\s*none/.test(styles));

  window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 120, clientY: 80 }));
  check('ring activates on pointer movement', doc.body.hasAttribute('data-cursor'));

  const btn = doc.querySelector('.btn');
  check('buttons opt into the magnetic effect', btn?.hasAttribute('data-magnetic') === true);
  dom.window.close();
}

{
  const dom = boot({ finePointer: true, reducedMotion: true });
  const { window } = dom;
  const doc = window.document;
  check(
    'no pointer ring under reduced motion',
    !doc.querySelector('.cursor-ring') && !doc.querySelector('.cursor-dot'),
  );
  check(
    'no magnetic hookup under reduced motion',
    doc.querySelectorAll('.btn[data-magnetic]').length === 0,
  );
  check(
    'parallax layers are not driven under reduced motion',
    [...doc.querySelectorAll('[data-parallax]')].every((el) => !el.style.transform),
  );
  check('no scroll skew under reduced motion', !doc.getElementById('main').style.transform);
  dom.window.close();
}

/* The parallax/scroll loop is driven by requestAnimationFrame, so its checks
   have to run after a frame has actually been served. */
const parallaxChecks = (async () => {
  const dom = boot();
  const { window } = dom;
  const doc = window.document;

  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));

  check(
    'parallax layers are driven when motion is allowed',
    [...doc.querySelectorAll('[data-parallax]')].some((el) => el.style.transform.includes('translate3d')),
  );

  /* Decoder text must never be able to change an accessible name. */
  const scrambled = [...doc.querySelectorAll('[data-scramble]')];
  check('nav links carry the decoder effect', scrambled.length > 0, `${scrambled.length} links`);

  const namesIntact = scrambled.every((el) => {
    const visual = el.querySelector('.scramble-text');
    const real = el.querySelector('.sr-only');
    return (
      visual?.getAttribute('aria-hidden') === 'true' &&
      real &&
      real.textContent.trim() === visual.textContent.trim()
    );
  });
  check('decoder visual layer is aria-hidden with an intact accessible name', namesIntact);

  dom.window.close();
})();

await parallaxChecks;

console.log('\n' + '='.repeat(60));
if (failures.length) {
  console.log(`RESULT: ${passed} passed, ${failures.length} FAILED`);
  failures.forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log(`RESULT: all ${passed} behaviour checks passed`);
console.log('='.repeat(60));