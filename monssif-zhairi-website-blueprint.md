# Monssif Zhairi: Website Blueprint and SEO Architecture

Handoff specification for the coding agent (OpenCode). This document contains architecture, content structure and SEO rules only. It contains no implementation code. Build exactly what is described; where something is marked **[CONFIRM]**, do not guess. Leave a clearly marked placeholder and flag it.

---

## 0. Open items to resolve before building

1. **GitHub handle mismatch.** The old site (monssif.xo.je) links to `github.com/monssif-dev` and its project repos live there. The new brief names `github.com/monssifzhairi`. Pick one canonical handle. Every link, `sameAs` entry and project repo URL must use real, working URLs. **[CONFIRM]** whether repos were moved or the old handle should be mentioned or redirected.
2. **Repo links.** Known from the old site: MR-CHESS and NIKE D-LINE repos. No repo URL is known for MONSSIF FIT or PROMESATEC. Link only to URLs that exist. **[CONFIRM]**
3. **Apex Timepiece.** The old site lists a real bilingual watch boutique (Next.js + Supabase). It is not in the new project list. Include as a fifth project or leave out. **[CONFIRM]**
4. **Personal details.** The old site publishes "Morocco", a Gmail address and a portrait. Decide which of these appear on the new site. Default: location "Morocco" yes if desired, email only on the Contact page (never in structured data), portrait optional. **[CONFIRM]**
5. **Learning page content** must come from Monssif (see section 7). Do not fabricate progress, courses, labs, certifications or dates.
6. **Notes about the old site analysis.** The old site was analyzed from its text and metadata, not its rendered visuals. The agent should lift colors, type choices, motion timing and layout rhythm directly from the old site's own CSS/JS rather than re-inventing them.

---

## 1. Identity

- **Person:** Monssif Zhairi (given name Monssif, family name Zhairi).
- **Natural variants:** "Zhairi Monssif" (family name first, common in many naming conventions), "Monssif".
- **Positioning line (use verbatim, consistently):** Developer · Creative Developer · AI Explorer · Cybersecurity Learner.
- **Brand concept:** MONSSIF // DIGITAL LAB. A visual/atmospheric idea used in the wordmark, footer, social image and small interface labels (for example section markers like "// 01 ABOUT"). It is not a page, not a heading on its own, and not the site name. The site name is always **Monssif Zhairi**.
- **Real topics:** web development, creative development, AI, cybersecurity (learning), Python, JavaScript, 3D/WebGL, Linux, networking, mathematics, mathematical logic.
- **Voice:** first person, plain, specific. Show what was built and how, not adjectives. The old site's tone ("learning by shipping something real and reading the source", "understanding how systems break is the fastest way to understand how they work") is the reference.
- **Truthfulness rule:** no invented achievements, clients, jobs, certifications, metrics, testimonials or experience. Every project carries an honest status label (for example "In progress").

---

## 2. Design direction

### Atmosphere (carried over from the old site)
Dark, quiet, technical, cinematic. Near-black background (the old site declares `#0d0d0d` as its theme color; reuse its actual palette), restrained accent color, generous negative space, monospace or technical micro-labels beside a confident display type for the name. A slow ticker of topics (Web Development • Creative Development • AI • Cybersecurity • Linux …) is part of the old identity and may remain as a single ambient element.

### Anti-portfolio principle
Not a grid of equal cards. Prefer:
- Large typographic compositions and full-width editorial rows.
- One idea per viewport on desktop.
- Projects shown as an index of "experiments" with one featured preview at a time, not a card wall.
- Sections separated by rhythm, scale and motion, not boxes and shadows.

### Animation philosophy
- Motion explains structure (reveals, scroll progress, state change). It is never decoration for its own sake.
- Scroll-linked storytelling is the signature (the old site's NIKE D-LINE canvas sequence is the model: user-driven, reversible, never autoplays).
- One signature moment per page maximum; everything else is subtle (opacity/translate, 200 to 600 ms, consistent easing).
- Ambient motion (ticker, subtle background texture) must be slow, low-contrast and pausable.
- `prefers-reduced-motion` produces a complete, static, fully readable experience. Not a degraded one.
- Heavy 3D/WebGL runs only where it is the content (the NIKE D-LINE detail page, and optionally one lightweight ambient element on the homepage). It is lazy-loaded and never blocks first paint.

### Desktop experience
- Fixed minimal header: wordmark "MZ" (or MONSSIF // DIGITAL LAB as a small label) left; About · Projects · Learning · Contact right; active page indicated.
- Pointer-aware details allowed (custom cursor state, hover reveal of project preview), always optional and never required to access information.
- Scroll-driven sections on the homepage; inner pages are calmer and text-first.

### Mobile experience
- Same content and order as desktop. Never a reduced-information version.
- Header collapses to wordmark plus a menu button opening a full-screen overlay navigation (focus-trapped, closable with Escape and a visible button).
- Hover patterns become tap/expand patterns. Large tap targets (at least 44 px).
- Scroll-linked canvas/3D uses fewer frames or a lower resolution tier; fall back to a static poster plus description when the device is constrained or reduced motion is on.
- Test at 360 px width, thumb-reach navigation, no horizontal scroll.

---

## 3. Site architecture

Multi-page static site with real URLs (the old site used only `#anchors`, which cannot rank as separate pages). Keep the page count small and every page substantial.

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | Identity, signature experience, entry points |
| About | `/about/` | Who Monssif is, how he works, what he's interested in |
| Projects | `/projects/` | Index of the real projects |
| MR-CHESS | `/projects/mr-chess/` | Case study |
| MONSSIF FIT | `/projects/monssif-fit/` | Case study |
| NIKE D-LINE | `/projects/nike-d-line/` | Case study (3D/WebGL) |
| PROMESATEC | `/projects/promesatec/` | Case study |
| Learning | `/learning/` | Honest, living view of what he is studying |
| Contact | `/contact/` | How to reach him |
| 404 | `/404.html` | Helpful not-found page |

URL rules: lowercase, hyphen-separated, trailing slash consistently (GitHub Pages serves directory index pages with a trailing slash), no query parameters or hash routing for content, no duplicate paths.

Navigation (primary, identical on every page): About · Projects · Learning · Contact. Wordmark links to `/`. Footer repeats the nav and adds GitHub.

Do not create: a standalone "Digital Lab" page, a blog (unless real content exists later), a "Skills" page (skills live inside About and project pages), tag/category pages, or any near-duplicate pages.

---

## 4. Homepage schema (`/`)

Goal: immediately answer "who is Monssif Zhairi" and invite exploration.

1. **Hero.** H1 is exactly **Monssif Zhairi** (visible, real text, not an image). Below it, the positioning line as a normal paragraph. One short statement (about 20 words) in his voice. Two calls to action: *Projects* and *GitHub*. The MONSSIF // DIGITAL LAB label appears as a small visual element.
2. **Signal strip.** Ambient ticker of real topics (see section 1). Decorative: hidden from assistive tech (`aria-hidden`), pausable, static under reduced motion.
3. **Selected work** (H2). Four project rows (MR-CHESS, MONSSIF FIT, NIKE D-LINE, PROMESATEC): name, one-line description, 3 to 4 stack tags, status, link to detail page. Large typographic list with preview reveal, not cards.
4. **About teaser** (H2). 2 to 3 sentences, written differently from the About page, with a link to `/about/`.
5. **Learning teaser** (H2). The real topics as a compact list with link to `/learning/`.
6. **Contact strip** (H2). One line plus GitHub and a link to `/contact/`.
7. **Footer.** © Monssif Zhairi, MONSSIF // DIGITAL LAB label, nav, GitHub.

Duplicate-content rule: homepage teasers must be distinct, shorter wording, not copies of inner-page text.

---

## 5. About schema (`/about/`)

H1: **About Monssif Zhairi**.

Sections (H2):
- **Who I am.** Short first-person intro naming Monssif Zhairi once. Optionally mention "also written Zhairi Monssif" once, naturally, in a sentence about the name. Not repeated anywhere else on the page.
- **What I work on.** Web development, creative development (3D/WebGL, scroll-driven interaction), AI, Python and JavaScript. Link to the relevant project pages.
- **What I'm learning.** Cybersecurity, Linux, networking, mathematics and mathematical logic. One paragraph, link to `/learning/`.
- **How I work.** Builds real things, reads source, learns by shipping (reuse the true spirit of the old text).
- **Elsewhere.** GitHub link (and the old site only if kept online and desired).

Optional: portrait with descriptive alt text; location line. **[CONFIRM]**

Do not state employment, education, awards, clients or certifications unless Monssif supplies and confirms them.

---

## 6. Projects schema

### `/projects/` (index)
H1: **Projects by Monssif Zhairi**. One intro sentence. Four project entries (name, one-sentence summary, stack, status, link). Same editorial treatment as the homepage but with a bit more text per entry.

### Project detail template (identical order on every project page)
H1: project name. Then H2 sections:
1. **Overview.** What it is, in 2 to 3 sentences.
2. **What it does / what I built.** Concrete feature list (only true features).
3. **How it's built.** Stack and key technical decisions.
4. **Status.** Honest label (Shipped, In progress, Prototype).
5. **Links.** Repository and live demo only if they exist.
6. Footer navigation: previous / next project, back to `/projects/`.

Each page needs a unique hero visual (screenshot or recording) with descriptive alt text. The visual must be real.

### Project content (use only these facts; expand only with what Monssif confirms)

**MR-CHESS.** Dart chess engine with legal move generation, castling, en passant, promotion and draw conditions. The old site additionally describes a Flutter app, a Melos monorepo, a FEN codec, unit tests and Riverpod/go_router wiring, and marks it *in progress*; include these only if still accurate. **[CONFIRM]**

**MONSSIF FIT.** React + Supabase fitness application with authentication, user profiles, workouts, file storage, and database security via Row Level Security (RLS).

**NIKE D-LINE.** Interactive 3D/WebGL product experience. The old site describes it as a scroll-driven canvas frame sequence (watch to exploded view, reversible, no autoplay, React + TypeScript + Vite + GSAP). Include if still accurate. **[CONFIRM]** Add a clear disclaimer that it is an independent personal concept/demo and not affiliated with or endorsed by Nike.

**PROMESATEC.** Interactive logistics/cargo and textile experience connected to Spain. No further facts are known. Ask Monssif for the stack, his role and the status before writing the page. **[CONFIRM]**

---

## 7. Learning schema (`/learning/`)

H1: **Learning** (title tag carries the name). The page presents learning honestly as a living map, not as credentials.

Structure (H2 per area, short and first-person):
- **Cybersecurity**, **Linux**, **Networking**, **Python**, **Mathematics**, **Mathematical logic**, **AI**, **3D/WebGL**.
- For each: *why it interests me*, *what I'm exploring right now*, *what I've built or practiced* (only real items), and optionally one link to a project that relates.
- Optional "Notes" or "Log" area **only** if Monssif supplies dated, real entries.

Rules: never write "certified", "expert", "pentester" or similar; describe as learning. No invented labs, CTF results, courses or hours. Where content is missing, the agent leaves a visible placeholder in the build notes, not on the public page.

Experience idea: a subtle "map" of topics where related topics connect (Linux ↔ Networking ↔ Cybersecurity; Mathematics ↔ Mathematical logic ↔ AI), expressed as a list with relationships if the visual is not available. Information must exist as plain text.

---

## 8. Contact schema (`/contact/`)

H1: **Contact Monssif Zhairi**.
- One short paragraph: what he's open to (only what he states: collaboration, freelance, interesting problems on the old site).
- Primary: GitHub link. Secondary: email if he wants it public **[CONFIRM]**. If shown, render so it is readable text plus a mailto link; do not put it in structured data.
- Static hosting means there is no backend. Use mailto or a third-party form service only if desired; if a form is used, it needs labels, validation messages, spam protection and a privacy sentence.
- No fake phone, address or social profiles.

---

## 9. SEO architecture

### 9.1 Technical SEO
- **Rendering:** all primary content must be present in the delivered HTML (static generation or pre-rendering). A client-rendered-only shell is not acceptable. Google can render JavaScript, but static HTML is faster, more reliable and cheaper to crawl.
- **URLs:** per section 3. One canonical URL per page.
- **Canonical URLs:** every page has a self-referencing absolute canonical using the exact format `https://monssifzhairi.github.io/<path>/` (https, no `www`, trailing slash). Internal links, sitemap entries and canonicals must all use that same form.
- **Crawlability:** every page reachable via normal `<a href>` links within two clicks of the homepage. No content only reachable via scroll events, hover, hash routes or JavaScript click handlers.
- **Indexability:** all real pages are indexable (no `noindex`). The 404 page returns a real 404 status (GitHub Pages does this for `404.html`).
- **Semantic HTML:** `header`, `nav`, `main`, `section`, `article` (for project case studies), `footer`; one `main` per page; skip link to `main`.
- **Heading hierarchy:** exactly one H1 per page, then H2/H3 in order with no skipped levels. The homepage H1 is the visible name.
- **Internal linking:** see section 14.
- **Mobile SEO:** responsive, same content as desktop, correct viewport meta, readable font sizes, no intrusive overlays, tap targets 44 px+.
- **Performance and accessibility:** sections 15 and 16 (both support search and users).
- **Images:** real `<img>` elements with descriptive alt text, explicit width/height, modern formats; text is never baked into images.
- **Language:** `lang="en"` on the document. If a French or Arabic version is added later, use `hreflang` with separate URLs. Not for the first release.
- **Meta keywords:** do not add; Google ignores them.

### 9.2 Identity strategy for the name (no stuffing)
- The visible name "Monssif Zhairi" appears naturally in: header wordmark, homepage H1, title tags, About H1, footer copyright, image alt for the portrait, structured data. That is enough.
- Variations are signaled in structured data (`alternateName`) and once in About prose. Do not repeat "Zhairi Monssif" or "Monssif" in headings, footers or alt text as keywords.
- Use the name in the same order and spelling everywhere: **Monssif Zhairi**.
- Write for a person reading, not for a crawler.

### 9.3 Entity and identity consistency
The same person must be identified identically across:

| Surface | Requirement |
|---|---|
| Website | Name "Monssif Zhairi", site name "Monssif Zhairi", links to GitHub |
| GitHub profile | Display name exactly "Monssif Zhairi"; Website field = `https://monssifzhairi.github.io/`; short bio matching the positioning line |
| GitHub profile README | Link to the site; mention the name once |
| Project repos | Description and README link to the matching project page on the site; each project page links to its repo |
| Project pages | Author shown as Monssif Zhairi, linked to `/about/` |
| Structured data | Person `@id` the same on every page; `sameAs` lists only real profiles |
| Search Console | Property for `https://monssifzhairi.github.io/`, sitemap submitted |
| Old site | If it stays online: add a visible link to the new site; if you can edit its HTML, set canonicals or a clear notice pointing to the new site |

### 9.4 Google Search strategy (legitimate signals only)
Realistic expectations first: no one can guarantee ranking for a name. "Monssif Zhairi" is the most achievable query because it is distinctive; "Monssif" alone is a short given name and competes with every other Monssif. Indexing and name recognition take days to weeks and depend on whether other people share the name.

Do:
1. Verify the site in Google Search Console, submit `sitemap.xml`, inspect the homepage URL and request indexing.
2. Keep titles, H1, structured data, `og:site_name` and the visible footer name consistent. These support Google's site-name detection (WebSite structured data with `name` and `alternateName`, plus matching title/H1).
3. Make the GitHub profile and repos point to the site with the same name (a genuine two-way link between the site and the real GitHub account).
4. Publish real, useful content: project case studies and the Learning page. Original, specific text that nobody else has.
5. Earn genuine mentions over time: real posts, real project shares, real community profiles that Monssif actually owns and keeps active. Add them to `sameAs` only after they exist.
6. Keep the site fast, accessible and stable (same URLs over time).
7. Consider a custom domain later (for example one containing the name). GitHub Pages redirects the github.io address to a custom domain automatically once configured, preserving the identity.

Do not: keyword stuffing, hidden text, fake backlinks, link exchanges, fake reviews, fake organizations or profiles, misleading structured data, automated spam, duplicate or scraped content, doorway pages, or pages created only to capture name variations.

---

## 10. Structured data

Use JSON-LD, generated at build time, one connected graph per page, identified by stable `@id` values. Only mark up what is visible on the page. Structured data for Person does not produce a special rich result; its value is clarity of entity and name. Do not promise or expect rich results.

### Stable identifiers
- Person: `https://monssifzhairi.github.io/#person`
- WebSite: `https://monssifzhairi.github.io/#website`

### Person (homepage and About, referenced from every other page by `@id`)
Include:
- `name`: Monssif Zhairi
- `givenName`: Monssif; `familyName`: Zhairi
- `alternateName`: "Zhairi Monssif", "Monssif" (supports the variants without stuffing)
- `url`: `https://monssifzhairi.github.io/`
- `sameAs`: `https://github.com/monssifzhairi` only (add other profiles only when real and owned)
- `description`: one factual sentence matching the visible positioning
- `image`: portrait URL if a portrait is used
- `jobTitle`: optional; use a simple honest value like "Developer" only if Monssif agrees
- `knowsAbout`: the real topics (web development, creative development, artificial intelligence, cybersecurity, Python, JavaScript, WebGL, Linux, computer networking, mathematics, mathematical logic)
- `homeLocation` / `address.addressCountry`: only if location is published **[CONFIRM]**

Omit: `email` and `telephone` (spam), `alumniOf`, `worksFor`, `award`, `hasCredential`, organization data, anything not provided and confirmed.

### WebSite (homepage only)
- `name`: Monssif Zhairi; `alternateName`: "Zhairi Monssif" (and optionally "Monssif Zhairi Portfolio" is not needed)
- `url`: homepage; `inLanguage`: en
- `publisher` and `author`: reference the Person `@id`
- Do **not** add `SearchAction` (Google retired the sitelinks search box feature).

### ProfilePage (About page)
- `mainEntity`: the Person `@id`, plus `dateCreated` / `dateModified` honestly. It matches the page's purpose and Google documents the type for pages focused on one person.

### BreadcrumbList (all inner pages)
- Home → About; Home → Projects; Home → Projects → [Project name]; Home → Learning; Home → Contact. Names and URLs must match the visible breadcrumb or navigation trail. Do not add a breadcrumb to the homepage.

### Project pages (optional, conservative)
- A `CreativeWork` or `SoftwareSourceCode` entry with `name`, `description`, `author` (Person `@id`), `url`, `codeRepository` (only if a repo exists), `programmingLanguage`. These do not generate rich results; skip them if they add maintenance burden.

### Never use
Organization, LocalBusiness, Review, AggregateRating, Product (for NIKE D-LINE), JobPosting, FAQ, or any type implying something that is not true or not visible.

### Validation
Test with Google's Rich Results Test and the Schema Markup Validator. No errors; warnings reviewed.

---

## 11. Metadata

### Titles and descriptions (natural, under about 60 / 160 characters)

| Page | Title | Meta description |
|---|---|---|
| Home | Monssif Zhairi — Developer, Creative Developer & AI Explorer | Monssif Zhairi is a developer working across web and creative development, AI and cybersecurity. Explore projects like MR-CHESS, MONSSIF FIT and NIKE D-LINE. |
| About | About Monssif Zhairi | Who Monssif Zhairi is, what he builds across web, 3D and AI, and what he is learning in cybersecurity, Linux, networking and mathematics. |
| Projects | Projects by Monssif Zhairi | Selected projects by Monssif Zhairi: a Dart chess engine, a React and Supabase fitness app, a 3D/WebGL product experience and an interactive logistics site. |
| Learning | Learning — Monssif Zhairi | What Monssif Zhairi is currently studying: cybersecurity, Linux, networking, Python, mathematics and mathematical logic. |
| Contact | Contact Monssif Zhairi | Get in touch with Monssif Zhairi about collaboration or projects. |
| MR-CHESS | MR-CHESS: a Dart chess engine — Monssif Zhairi | A chess engine in Dart with legal moves, castling, en passant, promotion and draw conditions, by Monssif Zhairi. |
| MONSSIF FIT | MONSSIF FIT: React and Supabase fitness app — Monssif Zhairi | A fitness app with authentication, profiles, workouts, storage and database security using Supabase RLS. |
| NIKE D-LINE | NIKE D-LINE: an interactive 3D/WebGL experience — Monssif Zhairi | An independent interactive 3D/WebGL product experience built by Monssif Zhairi. |
| PROMESATEC | PROMESATEC: interactive logistics and textile experience — Monssif Zhairi | An interactive logistics, cargo and textile experience connected to Spain, by Monssif Zhairi. **[CONFIRM wording]** |

Titles are unique per page. Descriptions are unique, accurate summaries (Google may rewrite them; that is fine).

### Open Graph (every page)
`og:type` = `website` on home, `profile` on About (with `profile:first_name` Monssif, `profile:last_name` Zhairi), `article` or `website` on project pages; `og:site_name` = Monssif Zhairi; `og:title`, `og:description`, `og:url` = canonical URL; `og:image` absolute URL (1200×630) with `og:image:alt`, width and height; `og:locale` = en.

### Twitter/X cards
`twitter:card` = `summary_large_image`, plus title, description, image and image alt. Do **not** set `twitter:site` or `twitter:creator`; no X account was provided and none may be invented.

### Social preview image
One default 1200×630 image (JPG or PNG, under about 1 MB) in the MONSSIF // DIGITAL LAB atmosphere: dark background, "Monssif Zhairi" in large type, positioning line below. Optionally one image per project page using a real screenshot. Alt text describes the image.

### Favicon set
SVG favicon (monogram "MZ" in the brand style), plus a PNG/ICO fallback whose size is a multiple of 48 px (Google's favicon requirement), plus a 180 px apple-touch-icon and a web manifest with `theme-color` matching the dark background. Favicon files must be crawlable (not blocked by robots).

### Other head items
`<title>`, meta description, canonical, viewport, theme-color, author name. No meta keywords.

---

## 12. Sitemap

File: `/sitemap.xml` at the site root.
- Include only canonical, indexable, 200-status URLs: `/`, `/about/`, `/projects/`, the four project pages, `/learning/`, `/contact/`. Exclude the 404 page.
- Absolute URLs in the exact canonical format.
- `lastmod` only if it reflects real content changes. Omit `changefreq` and `priority` (Google ignores them).
- Regenerate automatically at build time. Reference it in `robots.txt` and submit it in Search Console.

---

## 13. Robots

File: `/robots.txt` at the root. Policy: allow all crawlers, no disallow rules, and one `Sitemap:` line pointing to the absolute sitemap URL. Do not block CSS, JavaScript, images, fonts or the 3D assets (Google needs them to render the page). Do not use robots.txt to hide pages from search; robots.txt controls crawling, not indexing.

---

## 14. Internal linking

- Persistent primary nav and footer on every page (descriptive anchor text: About, Projects, Learning, Contact; never "click here").
- Homepage links to every top-level page and to every project.
- Each project page links back to `/projects/`, to the previous/next project and to `/about/` (author) and to its repo (external).
- About links to relevant projects and to Learning. Learning links to related projects.
- Breadcrumbs on inner pages, matching BreadcrumbList.
- Reciprocal links with real external profiles: site → GitHub, GitHub profile and repos → site and project pages.
- External links to the repos use normal `<a>` elements; add `rel="noopener"` for new-tab links. No `nofollow` on own profiles needed.

---

## 15. Performance

- Targets (Core Web Vitals, 75th percentile): LCP under 2.5 s, INP under 200 ms, CLS under 0.1. Test on a throttled mid-range mobile profile.
- Homepage first load must not include Three.js or the large frame sequences. Load heavy assets lazily, only on the page that needs them, and after an intentional trigger or when near viewport.
- Frame sequences: modern formats, tiered resolution, progressive loading, poster image first.
- Fonts: self-hosted, subsetted, `font-display: swap`, at most two families.
- Images: AVIF/WebP, responsive sizes, explicit dimensions, lazy-load below the fold, preload only the LCP image.
- JavaScript budget: ship the minimum on text pages (About, Learning, Contact should work with almost none).
- Animations use compositor-friendly properties (transform, opacity). No layout thrashing.
- GitHub Pages sets its own cache headers and you cannot customize them, so use content-hashed filenames for static assets.
- Verify with Lighthouse and PageSpeed Insights, and monitor Search Console's Core Web Vitals report once data exists.

---

## 16. Accessibility

- Target WCAG 2.2 AA.
- Skip-to-content link (the old site already has one; keep it); landmarks; one H1 per page.
- Full keyboard operation, visible focus styles, logical tab order, focus-trapped mobile menu with Escape to close.
- Color contrast checked on the dark theme, including the muted micro-labels (that is where dark designs usually fail).
- `prefers-reduced-motion` respected everywhere. Ambient animation has a pause control or is off by default under reduced motion.
- Canvas/WebGL content has a text equivalent (description of what it shows, controls explained) and a static fallback.
- All images have meaningful alt text; decorative elements are hidden from assistive tech.
- No information conveyed by motion or color alone.
- Forms (if any) have labels, error messages and instructions.
- Test with a screen reader (NVDA or VoiceOver) and with keyboard only.

---

## 17. GitHub Pages deployment considerations

- Repository must be named exactly `monssifzhairi.github.io` (user site), serving from the root of `https://monssifzhairi.github.io/`. Because it is a user site, there is no repository subpath, so no base-path configuration problems.
- Enforce HTTPS in repository settings.
- Prefer deploying via GitHub Actions or a build output branch. Include an empty `.nojekyll` file if the build output uses folders starting with underscores.
- Output structure: each page as `<path>/index.html` so URLs end in `/`.
- Root files: `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, favicons, `manifest`, and the OG image.
- 404 handling: GitHub Pages serves `404.html` for unknown paths with a real 404 status. Do not rely on a single-page-app fallback that returns 200 for everything.
- Hash routing and client-only routing are not acceptable (section 9.1).
- No server-side redirects, custom headers or edge config are available. If the old site needs to point to the new one, do it in the old site's HTML (visible link; canonical if editable).
- A custom domain can be added later via a `CNAME` file; plan the canonical URL as a single configuration value so the whole site (canonicals, sitemap, structured data, OG URLs) changes together.
- Keep the repository and asset sizes modest (GitHub Pages published sites are limited to 1 GB, and soft bandwidth limits apply).

---

## 18. Final SEO and launch checklist

**Identity**
- [ ] Name is spelled "Monssif Zhairi" everywhere, in the same order.
- [ ] Canonical GitHub handle decided; all links match.
- [ ] GitHub profile: name, website field, bio updated; profile README links to the site.
- [ ] Each repo links to its project page; each project page links to its repo.

**Technical**
- [ ] All content in delivered HTML; no hash routing.
- [ ] Self-referencing absolute canonical on every page, same format everywhere.
- [ ] `robots.txt` allows all and references the sitemap.
- [ ] `sitemap.xml` lists only canonical indexable URLs, submitted in Search Console.
- [ ] 404 page returns a true 404.
- [ ] One H1 per page; heading levels not skipped.
- [ ] Mobile layout checked at 360 px; Core Web Vitals within targets.

**Content and metadata**
- [ ] Unique, natural title and description per page (section 11).
- [ ] Open Graph and Twitter card tags on every page; OG image 1200×630 loads from an absolute URL.
- [ ] Favicon set present and crawlable.
- [ ] No claims about jobs, clients, certifications, awards or metrics that are not real.
- [ ] Project statuses are honest; NIKE D-LINE carries the non-affiliation note.

**Structured data**
- [ ] Person (stable `@id`, `sameAs` = real GitHub only), WebSite on the homepage, ProfilePage on About, BreadcrumbList on inner pages.
- [ ] Everything marked up is visible on the page; no email/phone in JSON-LD.
- [ ] Rich Results Test and Schema Markup Validator pass.

**Search Console and monitoring**
- [ ] Property verified for `https://monssifzhairi.github.io/`.
- [ ] Sitemap submitted; homepage inspected and indexing requested.
- [ ] Review Coverage/Pages, Performance (queries for "Monssif Zhairi") and Core Web Vitals after one to two weeks, then monthly.

**Never**
- [ ] No keyword stuffing, hidden text, fake backlinks/reviews/organizations/profiles, misleading markup, duplicated text between pages, or doorway pages.
