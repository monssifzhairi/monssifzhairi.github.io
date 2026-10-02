# monssifzhairi.github.io

Personal website of **Monssif Zhairi** — Developer · Creative Developer · AI Explorer · Cybersecurity Learner.

Static site built with Astro, deployed to GitHub Pages at
**https://monssifzhairi.github.io**.

The information architecture, SEO strategy and content rules come from
`monssif-zhairi-website-blueprint.md`. Nothing on this site was invented:
every project status, stack and claim is either confirmed by Monssif or
explicitly marked as unconfirmed.

---

## Quick start

```bash
npm install
npm run dev            # local dev server
npm run build          # -> dist/
npm run preview        # serve dist/

npm run check          # astro check (types)
npm run verify         # static SEO/a11y/content/brand-asset audit of dist/
npm run check:css      # parse the built CSS; assert rules are reachable
npm run test:behaviour # focus-trap / reduced-motion / ticker / pointer tests in a real DOM
npm test               # check + build + verify + test:behaviour
npm run brand          # regenerate the logo, OG image and PNG icons from source
npm run serve:dist     # serve dist/ with GitHub Pages-like 404 behaviour
```

---

## The one value that matters

`SITE_URL` in **`src/config.ts`** is the single source of truth for the origin.
`astro.config.mjs` imports it, and every canonical URL, sitemap entry,
`robots.txt` Sitemap line, Open Graph URL and JSON-LD `@id` derives from it via
the `absolute()` helper. The origin is typed in exactly one place.

To move to a custom domain later, change that single constant, then add a
`CNAME` file. Nothing else needs editing — verified by temporarily setting
`SITE_URL` to another origin and confirming all nine canonicals and the sitemap
followed.

```ts
export const SITE_URL = 'https://monssifzhairi.github.io';
export function absolute(path: string): string { ... }
```

Astro loads `src/config.ts` through its own config bundler, so the import in
`astro.config.mjs` costs nothing at runtime and adds no build step.

---

## Architecture

```
.github/workflows/deploy.yml   Build + deploy to GitHub Pages
.nojekyll                      Keep Pages from running Jekyll over the output
astro.config.mjs               static output, directory format, trailing slashes

public/                        Copied verbatim to dist/
  favicon.svg                  MZ monogram (SVG)
  favicon-48/192/512.png       Raster icons, generated from SVG
  apple-touch-icon.png         180x180
  icon-maskable-512.png        Maskable, monogram inside the 80% safe zone
  site.webmanifest             theme-color #0d0d0d
  og/og-default.jpg            1200x630 social preview (generated)

src/
  config.ts                    SITE_URL (single source of truth) + absolute()
  data/
    site.ts                    identity, nav, topics, learning areas
    projects.ts                ALL project data incl. every repo/demo URL
    meta.ts                    titles, descriptions, OG/Twitter per page
  layouts/BaseLayout.astro     <head>, canonical, OG, Twitter, JSON-LD, fonts
  components/
    Header.astro               fixed header + mobile overlay nav + focus trap
    Footer.astro               copyright, nav, GitHub
    Ticker.astro               ambient topic ticker (pausable)
    ProjectRow.astro           one project as a full-width editorial row
    Breadcrumbs.astro          visible trail mirroring BreadcrumbList
    SectionHead.astro          "// 0N" marker + heading
  styles/global.css            Design tokens lifted from the previous site
  pages/
    index.astro                /
    about.astro                /about/
    projects/index.astro       /projects/
    projects/[slug].astro      /projects/<slug>/   (all four, from one template)
    learning.astro             /learning/
    contact.astro              /contact/
    404.astro                  /404.html
    sitemap.xml.ts             generated
    robots.txt.ts              generated

scripts/
  generate-brand.mjs           builds logo.png + og-default.jpg + PNG icons
  fonts.mjs                    decompresses Oswald WOFF2 -> TTF for rendering
  verify.py                    11-section post-build audit
  check-css.mjs                structural CSS parse check
  test-behaviour.mjs           DOM tests for the interactive layer
  serve-dist.py                static server that mimics Pages 404 behaviour
```

**Why Astro:** every page is delivered as complete static HTML
(blueprint §9.1 forbids a client-rendered shell), and text pages ship almost no
JavaScript (§15). Zero JavaScript files are emitted; the only JS is ~6.5 KB of
inlined module code per page for the menu, ticker and motion system.

---

## Design tokens lifted from the previous site

Read out of the previous site's `styles.css` and `script.js` (kept locally in
`old-site-reference/`, git-ignored and never part of the build), not invented:

| Token | Value |
|---|---|
| Background | `#0d0d0d` (also `theme-color`) |
| Text / soft / muted | `#ededed` / `#bdbdbd` / `#a5a5a5` |
| Micro-label | `#949494` — **changed** from the old `#8a8a8a` |
| Hairlines | `#222`, `rgba(255,255,255,.18/.3)` |
| Accent | white only — the old palette is strictly monochrome |
| Display type | Oswald, uppercase |
| Body type | Inter Variable, `line-height: 1.6` |
| Micro-labels | Oswald `0.72–0.85rem`, `letter-spacing .25–.4em` |
| Signature easing | `cubic-bezier(.19,1,.22,1)` |
| Durations | `.25 / .3 / .45 / .6 / .8s` |
| Ambient | `feTurbulence` film texture at `opacity .04` |

**One deliberate deviation.** The old micro-label grey `#8a8a8a` is only
**3.4:1** against `#0d0d0d`, which fails WCAG 2.2 AA for text. It is replaced by
`#949494` (**5.9:1**). `--text-muted` was raised from `#888` to `#a5a5a5`
(8.0:1) for the same reason. `#8a8a8a` survives only on hairlines and
decorative strokes. This is a required accessibility fix, not a redesign.

Everything else — the monochrome restraint, the editorial rows instead of a
card wall, oversized parallax background type, the scroll-linked reveal
philosophy, the ticker — is carried over.

### Motion

- Motion explains structure; it is never decoration.
- The **reveal state is the CSS default**. JavaScript opts elements in by
  adding `.js-reveal`. If JS fails, is blocked, or never runs, content is
  simply visible.
- `prefers-reduced-motion: reduce` produces a complete, static, readable
  experience: the texture stops, reveals are forced visible, the menu and
  ticker transitions are removed, and the reveal system does not opt in at all.
- The ticker is a real, focusable **pause button** and is disabled under
  reduced motion rather than offering a control over motion that cannot happen.
- The pointer ring, magnetic pull, scroll skew and parallax are all gated on a
  fine pointer (`(hover: hover) and (pointer: fine)`), so touch devices and
  keyboard users never run code they cannot see.

### Interaction effects

The previous site's signature interactions are rebuilt idiomatically against
the current components rather than copied as a script. Each one is a *pure
enhancement*: the page is complete and readable with all of them absent.

| Effect | Implementation | Guard |
|---|---|---|
| Button wipe | `scaleY` panel on a pseudo-element, colour inverted to `#0d0d0d` | Reduced motion |
| Editorial row wipe | White panel slides left→right, text colour inverts | Reduced motion |
| Scroll skew + parallax | One shared `requestAnimationFrame` loop over `[data-parallax]` | Reduced motion |
| Decoder text | Nav labels scramble on hover/focus/enter | Reduced motion |
| Magnetic controls | `data-magnetic` opt-in on `.btn` only, so the stretched row links stay intact | Reduced motion, fine pointer |
| Pointer ring | Dot + trailing ring, `aria-hidden`, removed on leave | Reduced motion, fine pointer |
| Scroll hint | Animated label in the hero | Reduced motion |

**Accessible names cannot be disturbed.** The decoder swaps visible glyphs, so
each label renders twice: a `.scramble-text` copy that is `aria-hidden="true"`,
plus the untouched `.sr-only` original. A screen reader therefore announces
"Projects" whether or not the letters are mid-scramble. This is asserted in
`scripts/test-behaviour.mjs`.

**The native pointer is never replaced.** `cursor: none` appears nowhere in the
build. The ring is additive, so the OS cursor, focus rings and text carets all
behave normally. This is asserted in the test suite.

### Deliberately rejected patterns

Some previous-site effects were **not** carried over. These are decisions, not
oversights:

| Rejected | Reason |
|---|---|
| Blocking preloader | Delays first paint and directly harms LCP for a purely cosmetic transition. |
| `cursor: none` | Hides the OS pointer — an accessibility regression for a purely cosmetic effect. |
| `mix-blend-mode: difference` on the nav | Blend modes sample whatever is behind them, so contrast against body text is unpredictable and unverifiable. |
| 3D card tilt / spotlight | Conflicts with the full-width editorial rows and their stretched links, and breaks on coarse pointers. |
| Forced `window.scrollTo(0, 0)` | Throws away scroll position and history on navigation. |
| Outlined type at hover | The old grey outline dropped to **2.5:1** on the hover state; the hover colours are recomputed per background instead (§Design tokens). |

---

## Routes and SEO

| Page | URL | H1 |
|---|---|---|
| Home | `/` | Monssif Zhairi |
| About | `/about/` | About Monssif Zhairi |
| Projects | `/projects/` | Projects by Monssif Zhairi |
| MR-CHESS | `/projects/mr-chess/` | MR-CHESS |
| MONSSIF FIT | `/projects/monssif-fit/` | MONSSIF FIT |
| NIKE D-LINE | `/projects/nike-d-line/` | NIKE D-LINE |
| PROMESATEC | `/projects/promesatec/` | PROMESATEC |
| Learning | `/learning/` | Learning |
| Contact | `/contact/` | Contact Monssif Zhairi |
| 404 | `/404.html` | Page not found |

- Every page is built as `<path>/index.html`, so URLs end in `/`.
- One self-referencing absolute canonical per page, exact format
  `https://monssifzhairi.github.io/<path>/` — https, no `www`, trailing slash,
  byte-identical across internal links, canonicals and the sitemap.
- The 404 page deliberately has **no canonical and no `og:url`**: GitHub serves
  it at arbitrary unknown paths, so declaring a single URL would name a page
  that does not exist. It is `noindex`.
- `sitemap.xml` lists exactly the 9 canonical indexable URLs. The 404 is
  excluded. No `changefreq`, no `priority`. `lastmod` is emitted only if a real
  content-change date is set (`LASTMOD` in `src/pages/sitemap.xml.ts`) — an
  automatic `lastmod` on every build would be a lie.
- `robots.txt`: `User-agent: *`, `Allow: /`, one `Sitemap:` line, no
  `Disallow`. CSS, JS, fonts and images are not blocked.

### Structured data

One connected JSON-LD `@graph` per page, stable `@id`s:

- `https://monssifzhairi.github.io/#person` — identical `Person` node on every page
- `https://monssifzhairi.github.io/#website` — homepage (also referenced elsewhere)
- `ProfilePage` on About, `BreadcrumbList` on all inner pages,
  `SoftwareSourceCode` on project pages that have a real repo and real stack

**Deliberately absent:** `email`, `telephone`, `address`/`homeLocation`,
`image`, `jobTitle`, `alumniOf`, `worksFor`, `award`, `hasCredential`, and any
`Organization` / `LocalBusiness` / `Review` / `AggregateRating` / `Product` /
`JobPosting` / `FAQPage` type. `SearchAction` is omitted (Google retired it).

`ProfilePage.dateCreated` / `dateModified` are **omitted**: no honest dates
were supplied, and inventing them would be worse than leaving them out.

---

## Accessibility

Targeting WCAG 2.2 AA.

- Skip link on every page, pointing at `#main`.
- One `<main>`, one `<h1>`, no skipped heading levels (verified by
  `scripts/verify.py`).
- `header` / `nav` / `main` / `section` / `article` / `footer` landmarks,
  `aria-label` on every nav, visible breadcrumb trail mirroring the
  `BreadcrumbList`.
- Active page marked with `aria-current="page"` and an underline — never by
  colour alone.
- Mobile overlay navigation: focus moves in on open, is trapped while open,
  closes on Escape / the close button / following a link, returns focus to the
  toggle, locks background scroll, and closes automatically if the viewport
  widens past the desktop breakpoint so a hidden overlay can never keep focus.
  All 20+ behaviours are covered by `scripts/test-behaviour.mjs`.
- Tap targets ≥ 44px. Project rows use a stretched pseudo-element on a single
  real `<a>`, so the whole row is tappable while assistive tech still sees one
  link per row.
- Text contrast fixed to AA (see the design-token deviation above).
- `rel="noopener"` on every `target="_blank"`; new-tab links announce it via
  visually hidden text.
- Decorative texture, background type, row figures and the ticker viewport are
  `aria-hidden`. No information is conveyed by motion or colour alone.

---

## Brand assets

The wordmark, favicon, Apple touch icon, maskable icon and OG image are all
generated from one source: `npm run brand`.

### One mark, one source

`public/favicon.svg` is the canonical monogram. The PNG icons are **rasterised
from that file**, not re-drawn from parameters, so the vector favicon and the
raster icons cannot drift apart. `public/logo.png` (the header wordmark) is the
same monogram with no tile behind it, trimmed to its ink on a transparent
background and rendered at 2× the header's display size.

### Why the generator is more elaborate than it looks

Every one of these assets is typographic, which means they need the real Oswald —
and that turns out to be the hard part. Three findings shaped the design:

1. **sharp cannot render SVG text in this environment.** Its bundled librsvg
   emits a ~18×12 stub regardless of `font-size`, `font-family`, or
   `fontconfig` — so `font-family="Oswald…"` silently became a system fallback
   face. The previously committed icons were 152×95 of ink where Oswald measures
   93×73, which is how the mismatch was caught.
2. **fontkit cannot extract glyph outlines here.** It opens the font and reports
   correct metrics, but `glyph.path.commands` comes back empty, so converting
   text to paths was not an option.
3. **`@fontsource` ships only WOFF2**, which renderers generally cannot read.

So the pipeline is: `wawoff2` decompresses Oswald's WOFF2 to TrueType →
`@resvg/resvg-js` renders the SVG with those fonts loaded explicitly → sharp
handles the pixel work (resize, encode, measure).

### Silent-failure guard

A renderer that cannot match a font family draws **nothing** and still exits
successfully. That is precisely how the assets ended up typographically wrong
in the first place, so the failure is now made loud in two places:

- `generate-brand.mjs` runs a **preflight** render and measures the cap height of
  an "M". Oswald's is exactly 0.810 em; if the measurement is missing or outside
  0.7–0.9, it aborts **before writing anything**, so a broken renderer cannot
  overwrite correct assets.
- `scripts/verify.py` section 12 asserts every brand file exists, is a readable
  image of the exact expected size, is not implausibly small, that `logo.png`
  has an alpha channel, and that every page's header references it with `alt=""`
  and explicit `width`/`height` (so it cannot shift layout).

`sharp` is still used for all pixel operations — it is only SVG *text* that
bypasses it.

---

## Performance

- **Zero JavaScript files emitted.** All page JS is inlined (~6.5 KB/page) and
  progressive-enhancement only. This is deliberate, and it is load-bearing:
  Astro inlines a script only below Vite's `assetsInlineLimit`, which defaults
  to 4096 bytes. The interaction layer sits just under that line, so
  `astro.config.mjs` raises the limit to `8192` explicitly. Without it, the next
  few added bytes would silently promote the script into a render-blocking
  `_astro/*.js` request. `npm run verify` asserts the file count stays at zero.
- Self-hosted subsetted fonts (Inter Variable, Oswald 400/500/600) with
  `font-display: swap` and `font-range` subsetting; only latin-ish subsets are
  fetched via `unicode-range`. No Google Fonts request, no third-party origin.
- No client framework, no Three.js, no GSAP, no scroll library.
- Animations animate only `transform` and `opacity`; no layout thrashing.
- Scroll, parallax and cursor effects share a **single**
  `requestAnimationFrame` loop, and reads are batched before writes so no frame
  thrashes layout.
- The film texture is an inline SVG data URI — no extra request.
- 269 KB of HTML total across all 10 pages (~27 KB/page average), of which ~6.5 KB
  is inlined JS repeated per page. Gzipped over the wire this costs roughly a
  third of that, since the same script appears on every page.
- GitHub Pages sets its own cache headers, so Astro emits content-hashed asset
  filenames (`_astro/about.<hash>.css`) for long-lived caching.

Targets (75th percentile, throttled mid-range mobile): LCP < 2.5s, INP < 200ms,
CLS < 0.1. **These still need measuring with Lighthouse / PageSpeed Insights
after the first deploy** — see the checklist below.

---

## Verification

`npm test` runs five gates, all currently passing:

```
astro check              0 errors, 0 warnings, 0 hints   (27 files)
npm run build            10 pages, 0 client JS files
npm run verify           ALL CHECKS PASSED                (11 sections)
npm run check:css        CSS structure OK                 (492 rules, 11 sources)
npm run test:behaviour   all 57 behaviour checks passed
```

### Structural CSS checking

`scripts/check-css.mjs` parses every stylesheet with postcss and asserts the
rules are actually reachable — because string-based checks cannot see this class
of failure, and the site hit it.

The reduced-motion block was once silently destroyed. A comment opener was
clobbered during an edit, leaving orphaned prose at the top level. A CSS parser
does not error on that: it reads the prose *plus the following `@media` prelude*
as a single selector, finds it invalid, and discards the block and all **13 rules
inside it**. Every text-based check passed the entire time, because the strings
were still in the file. The practical result was that `prefers-reduced-motion`
did nothing at all.

So the check is structural, not textual:

1. every stylesheet parses;
2. no rule has a selector containing leftover prose or a stray comment end;
3. the reduced-motion block exists and *directly contains* `.js-reveal`,
   `.film-texture`, `.cursor-dot` and `[data-magnetic]`;
4. outlined type (transparent fill + `-webkit-text-stroke`) sits behind an
   `@supports` guard — text-stroke is a prefixed, non-standard property, so a
   browser that cannot stroke would otherwise honour `color: transparent` and
   render *nothing*. All four outlined-text rules (`.bg-text`,
   `.ticker__group`, `.row__figure`, `.hero-figure__text`) are guarded.

Point 3 matters: `walkAtRules` would still reach rules nested inside a swallowed
block and report them as present. Only direct children are counted.

Astro splits styling in two — `global.css` becomes a linked stylesheet, while
each component's scoped `<style>` is inlined into the page HTML. Checking only
the linked file would leave most of the CSS unverified, so the script collects
both: **11 sources, 492 rules** rather than 1 source and 148 rules.

`scripts/verify.py` audits the built output for:

1. every route exists; canonical/og:url exact-match the expected URL; 404 has
   neither, and is `noindex`
2. content is present in the delivered HTML (word count floor + no app-shell
   markers) — i.e. not a client-rendered shell
3. unique title and description per page, with length warnings
4. complete OG + Twitter metadata everywhere, absolute `og:image`, **no**
   `twitter:site`/`twitter:creator`, **no** meta keywords
5. JSON-LD parses; `Person @id` identical on every page; `sameAs` exactly the
   real GitHub profile; banned properties and banned schema types rejected
6. sitemap contains exactly the 9 canonical URLs; no `changefreq`/`priority`
7. `robots.txt` allows all, has the right `Sitemap:` line, blocks nothing
8. every internal link resolves to a real built file; every top-level page and
   every project page is one click from the homepage via a normal `<a href>`
9. no declined or unconfirmed content leaked in (legacy GitHub handle, email,
   location, excluded projects, unconfirmed MR-CHESS/NIKE D-LINE details), and
   no certification / expertise / employment / client / years-of-experience
   claims
10. skip link, `#main`, reduced-motion CSS, `aria-hidden`, `rel=noopener`,
    self-hosted fonts with `font-display`, JS and HTML budgets

`scripts/serve-dist.py` additionally confirmed real HTTP behaviour:
200 on all 9 routes plus `sitemap.xml`, `robots.txt`, icons, manifest and OG
image; **404 with the 404 page body** on unknown paths; and 301 directory
normalisation (`/about` → `/about/`), matching GitHub Pages.

### Bugs this verification caught during the build

- Two internal links pointed at a misspelled slug, `/projects/monsif-fit/`
  instead of `/projects/monssif-fit/` (About and Contact).
- The 404 page originally emitted `canonical` and `og:url` pointing at
  `…/404/`, a URL that does not exist.
- The focus trap used `offsetParent` to find focusable elements, which silently
  returns an empty list without layout — the trap no-ops in that case. Replaced
  with an explicit selector.
- Focus after closing the menu returned to `<body>` when the trigger had not
  been focused. Now falls back to the toggle.
- Under reduced motion the ticker set `aria-pressed` but never
  `data-paused`, so its state and its CSS disagreed.

---

## TODO / CONFIRM register

Everything below is a deliberate, visible gap — never filled with a guess.

### 1. GitHub repositories return 404 (blocked on external action)

The canonical `monssifzhairi` URLs are used everywhere as instructed, but they
do not resolve yet:

| URL | Status on 2026-10-02 |
|---|---|
| `https://github.com/monssifzhairi` | **200** |
| `https://github.com/monssifzhairi/NIKE-D-LINE` | **404** |
| `https://github.com/monssifzhairi/mr_chess` | **404** |
| `https://www.monssif.xo.je` | 200 |

The repositories have not been moved/recreated under the `monssifzhairi`
account yet. The links are kept visible rather than hidden. **Fix them in
`src/data/projects.ts` only** — no page hardcodes a repo URL.

- [ ] Move/rename the two repositories under `monssifzhairi`
- [ ] Re-run the link check afterwards

### 2. PROMESATEC — only one confirmed fact

Confirmed: *"an interactive logistics, cargo and textile experience connected
to Spain."* The page states exactly that and shows a visible "to confirm"
block for everything else. **Not guessed:** stack, role, status, repository,
demo, features, technical implementation.

- [ ] Confirm stack
- [ ] Confirm your role
- [ ] Confirm status → set `status` in `src/data/projects.ts`
- [ ] Confirm features → `features[]`
- [ ] Confirm how it's built → `how[]`
- [ ] Confirm repo / demo URLs if they exist
- [ ] Confirm the meta description wording (blueprint §11 marks it `[CONFIRM]`).
      Current title was shortened from the blueprint's draft to stay under
      ~65 characters so Google does not truncate it.

### 3. Learning page — awaiting real content

All 8 areas exist (Cybersecurity, Linux, Networking, Python, Mathematics,
Mathematical logic, AI, 3D/WebGL) in the first person, using only confirmed
topics. **Not invented:** courses, certifications, CTFs, labs, hours,
progress, achievements.

Each area has a visible "to fill in" block for **what I'm exploring right
now** and **what I've built or practiced**. Fill in `LEARNING_AREAS` in
`src/data/site.ts`:

- [ ] Exploring-now text per area (8)
- [ ] Built/practiced items per area (8), with project links where relevant
- [ ] Optional dated Notes/Log section, only with real entries
      (`exploring` and `built` already support this)

Three items already link out truthfully: Mathematics and Mathematical logic →
MR-CHESS, 3D/WebGL → NIKE D-LINE.

### 4. MONSSIF FIT and NIKE D-LINE details

Status labels were set to `In progress` and `Prototype`. **Not confirmed:**
those are the minimum-honest labels, not verified facts.

- [ ] Confirm MONSSIF FIT status
- [ ] Confirm NIKE D-LINE status
- [ ] Confirm whether MONSSIF FIT has a repository (currently shown as
      "No public repository")

The Flutter / Melos / FEN / Riverpod / go_router MR-CHESS details and the
GSAP / React / Vite scroll-sequence NIKE D-LINE details from the previous site
were **deliberately excluded** per the locked decision. If they are still
accurate, add them to `src/data/projects.ts`.

### 5. Project hero visuals

Typographic/editorial heroes, per the locked decision. No fabricated
screenshots, mockups or stock imagery. When a real screenshot exists, add it
in `projects/[slug].astro` as a real `<img>` with explicit `width`/`height`
and descriptive alt text — the page structure and SEO markup do not change.
`Project.heroImage` is the intended slot.

- [ ] Real screenshots for MR-CHESS, MONSSIF FIT, NIKE D-LINE, PROMESATEC

### 6. Post-deploy SEO actions (need a live URL)

- [ ] Verify the repository is named exactly `monssifzhairi.github.io`
- [ ] Set **Settings → Pages → Source: GitHub Actions**
- [ ] Enforce HTTPS in repository settings
- [ ] Verify Search Console property for `https://monssifzhairi.github.io/`
- [ ] Submit `https://monssifzhairi.github.io/sitemap.xml`
- [ ] Inspect the homepage and request indexing
- [ ] Run Rich Results Test + Schema Markup Validator on the live URL
- [ ] Run Lighthouse / PageSpeed Insights on a throttled mobile profile
- [ ] Add a visible link to the new site in the old site's HTML, and set its
      canonical or a notice. **Not done here** — the old site's HTML was not
      modified, and no snippet was written because none was requested yet.
- [ ] GitHub profile: display name `Monssif Zhairi`, website
      `https://monssifzhairi.github.io/`, bio = the positioning line
- [ ] `monssifzhairi/monssifzhairi` profile README links to the site
- [ ] Each repo README links to its project page; each project page links to
      its repo

---

## Checklist status

### Identity
- [x] Name spelled "Monssif Zhairi" everywhere, same order
- [x] Legacy GitHub handle appears nowhere (asserted in `verify.py`)
- [ ] GitHub profile name / website / bio updated
- [ ] Profile README links to the site
- [ ] Repos link to their project pages (pending repo move)

### Technical
- [x] All content in delivered HTML; no hash routing; no client-only shell
- [x] Self-referencing absolute canonical on every indexable page
- [x] `robots.txt` allows all and references the sitemap
- [x] `sitemap.xml` lists only the 9 canonical indexable URLs
- [x] 404 page returns a real 404 (verified over HTTP)
- [x] One H1 per page; no skipped heading levels
- [x] No fixed widths that break 360px; `overflow-x: clip` guards
- [x] Zero JavaScript files; 269 KB HTML total
- [ ] Core Web Vitals measured on the live site

### Content and metadata
- [x] Unique, natural title and description per page
- [x] Open Graph + Twitter cards on every page
- [x] One real 1200×630 typographic OG image (27 KB), absolute URL
- [x] Favicon set: SVG + 48/192/512 PNG + 180 apple-touch + maskable + manifest
- [x] No claims about jobs, clients, certifications, awards or metrics
- [x] Honest project statuses; unknown ones marked "to confirm"
- [x] NIKE D-LINE carries the non-affiliation disclaimer
- [x] No meta keywords
- [x] No public location, email or portrait (declined)

### Structured data
- [x] Person with stable `@id`, `sameAs` = real GitHub only
- [x] WebSite, ProfilePage (About), BreadcrumbList (inner pages)
- [x] Only visible content marked up; no email/phone in JSON-LD
- [ ] Validated on the live URL with Rich Results Test

### Search Console and monitoring
- [x] File-based verification file committed
      (`public/googledb1b084fed1c024.html`, served at
      `/googledb1b084fed1c024.html` — confirmed 200 locally)
- [ ] Verification confirmed accepted in the Search Console dashboard
- [ ] Sitemap submitted; homepage indexing requested
- [ ] Review Coverage and Core Web Vitals after 1–2 weeks, then monthly

### Never
- [x] No keyword stuffing, hidden text, fake backlinks/reviews/organizations
- [x] No misleading structured data
- [x] No duplicated text between pages (verified: unique titles/descriptions)
- [x] No doorway pages
- [x] No `cursor: none`; no effect that hides or renames content
- [x] No blocking preloader or any pattern that delays first paint

---

## Licence

No licence declared. The previous site's public-facing text was reused as the
voice reference; nothing was copied verbatim at length.