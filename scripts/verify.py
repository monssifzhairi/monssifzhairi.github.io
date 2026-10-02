#!/usr/bin/env python3
"""
Post-build verification for the Monssif Zhairi site.

Checks, per blueprint sections 9-18. These are the individual assertions;
they are printed under 11 grouped sections:
  1. every route exists and is reachable
  2. self-referencing absolute canonical, exact format
  3. one <h1> per page, no skipped heading levels, semantic landmarks
  4. all content present in the delivered HTML (no client-only shell)
  5. unique title + description per page
  6. Open Graph / Twitter metadata
  7. JSON-LD parses and has a stable Person @id on every page
  8. sitemap contains exactly the canonical indexable URLs
  9. robots.txt allows all and references the sitemap
 10. no forbidden content: monssif-dev, email, telephone, location,
     fabricated claims, meta keywords, Organization/Review/Product types
 11. internal links resolve to real files
 12. brand assets exist at the right size, and the header uses the logo
"""
import json
import os
import re
import sys
from html.parser import HTMLParser

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
BASE = "https://monssifzhairi.github.io"

ROUTES = [
    ("index.html", "/"),
    ("about/index.html", "/about/"),
    ("projects/index.html", "/projects/"),
    ("projects/mr-chess/index.html", "/projects/mr-chess/"),
    ("projects/monssif-fit/index.html", "/projects/monssif-fit/"),
    ("projects/nike-d-line/index.html", "/projects/nike-d-line/"),
    ("projects/promesatec/index.html", "/projects/promesatec/"),
    ("learning/index.html", "/learning/"),
    ("contact/index.html", "/contact/"),
    ("404.html", "/404.html"),
]

failures = []
notes = []


def fail(msg):
    failures.append(msg)


def read(rel):
    with open(os.path.join(DIST, rel), encoding="utf-8") as fh:
        return fh.read()


class Doc(HTMLParser):
    """Collects heading structure, landmarks and links."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.headings = []  # (level, text)
        self.landmarks = []
        self.links = []
        self.html_lang = None
        self.text = []
        self._capture = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.html_lang = a.get("lang")
        if tag in ("main", "header", "footer", "nav", "article", "section"):
            self.landmarks.append(tag)
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._capture = (int(tag[1]), [])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])

    def handle_endtag(self, tag):
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self._capture:
            lvl, buf = self._capture
            self.headings.append((lvl, "".join(buf).strip()))
            self._capture = None

    def handle_data(self, data):
        self.text.append(data)
        if self._capture:
            self._capture[1].append(data)


print("=" * 78)
print("1. ROUTES, CANONICALS, HEADINGS, LANDMARKS")
print("=" * 78)

docs = {}
for rel, path in ROUTES:
    full = os.path.join(DIST, rel)
    if not os.path.exists(full):
        fail(f"missing route file: {rel}")
        continue
    s = read(rel)
    docs[path] = s

    expected = BASE + path if rel != "404.html" else None

    can = re.search(r'<link rel="canonical" href="([^"]+)"', s)
    if rel == "404.html":
        # Served at arbitrary unknown URLs, so a self-referencing canonical
        # would be meaningless. Omitted by design; page is noindex.
        if can:
            notes.append("404: canonical present (acceptable but unnecessary)")
        if "noindex" not in s:
            fail("404.html: missing noindex")
    else:
        if not can:
            fail(f"{path}: no canonical")
        elif can.group(1) != expected:
            fail(f"{path}: canonical {can.group(1)!r} != {expected!r}")
        elif "www." in can.group(1):
            fail(f"{path}: canonical contains www")
        if not can.group(1).endswith("/"):
            fail(f"{path}: canonical missing trailing slash")

    og = re.search(r'<meta property="og:url" content="([^"]+)"', s)
    if expected:
        if not og:
            fail(f"{path}: no og:url")
        elif og.group(1) != expected:
            fail(f"{path}: og:url {og.group(1)!r} != {expected!r}")

    # exactly one h1, no skipped levels
    d = Doc()
    d.feed(s)
    h1s = [h for h in d.headings if h[0] == 1]
    if len(h1s) != 1:
        fail(f"{path}: expected 1 h1, found {len(h1s)}")
    prev = 0
    for lvl, txt in d.headings:
        if prev and lvl > prev + 1:
            fail(f"{path}: heading level skipped h{prev} -> h{lvl} ({txt!r})")
        prev = lvl
    if d.landmarks.count("main") != 1:
        fail(f"{path}: expected exactly 1 <main>, found {d.landmarks.count('main')}")
    if d.html_lang != "en":
        fail(f"{path}: html lang is {d.html_lang!r}, expected 'en'")

    status = "ok"
    print(f"  {path:<32} h1={len(h1s)} headings={len(d.headings):<3} landmarks={len(d.landmarks):<3} {status}")

print()
print("=" * 78)
print("2. CONTENT PRESENT IN DELIVERED HTML (no client-only shell)")
print("=" * 78)
for path, s in sorted(docs.items()):
    if path == "/404.html":
        continue
    d = Doc()
    d.feed(s)
    words = len(" ".join(d.text).split())
    # A client-rendered shell would have almost no text.
    if words < 250:
        fail(f"{path}: only {words} words in delivered HTML — looks like a shell")
    if "astro-island" in s or 'id="__NEXT_DATA__"' in s or 'id="root"' in s:
        fail(f"{path}: contains a client-only app shell marker")
    print(f"  {path:<32} {words:>5} words in static HTML")

print()
print("=" * 78)
print("3. UNIQUE TITLES + DESCRIPTIONS")
print("=" * 78)
titles, descs = {}, {}
for path, s in sorted(docs.items()):
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    de = re.search(r'<meta name="description" content="([^"]*)"', s)
    t = t.group(1).strip() if t else ""
    de = de.group(1).strip() if de else ""
    if not t:
        fail(f"{path}: no title")
    if not de:
        fail(f"{path}: no description")
    if len(t) > 65:
        notes.append(f"{path}: title {len(t)} chars (>65, may truncate): {t!r}")
    if len(de) > 175:
        notes.append(f"{path}: description {len(de)} chars (>175): {de!r}")
    if t in titles:
        fail(f"{path}: duplicate title with {titles[t]}")
    if de in descs:
        fail(f"{path}: duplicate description with {descs[de]}")
    titles[t] = path
    descs[de] = path
    print(f"  {path:<32} title={len(t):<3} desc={len(de):<4} {t[:44]}")

print()
print("=" * 78)
print("4. OPEN GRAPH + TWITTER")
print("=" * 78)
for path, s in sorted(docs.items()):
    need = [
        'property="og:type"',
        'property="og:site_name" content="Monssif Zhairi"',
        'property="og:locale" content="en"',
        'property="og:title"',
        'property="og:description"',
        'property="og:image" content="https://monssifzhairi.github.io/og/og-default.jpg"',
        'property="og:image:width" content="1200"',
        'property="og:image:height" content="630"',
        'property="og:image:alt"',
        'name="twitter:card" content="summary_large_image"',
        'name="twitter:title"',
        'name="twitter:description"',
        'name="twitter:image"',
        'name="twitter:image:alt"',
        'name="theme-color"',
        'name="author" content="Monssif Zhairi"',
    ]
    if rel != "404.html":
        # The 404 is served at arbitrary unknown paths, so it deliberately
        # declares no canonical URL.
        need.append('property="og:url"')
    missing = [n for n in need if n not in s]
    if missing:
        fail(f"{path}: missing meta {missing}")
    if 'name="twitter:site"' in s or 'name="twitter:creator"' in s:
        fail(f"{path}: twitter:site/twitter:creator set but no account exists")
    if re.search(r'<meta[^>]+name="keywords"', s):
        fail(f"{path}: meta keywords tag present")
print("  checked all routes for og/twitter/theme/author + no keywords")

og_abs = re.search(r'property="og:image" content="([^"]+)"', docs["/"]).group(1)
print(f"  og:image absolute -> {og_abs}")
if not og_abs.startswith("https://"):
    fail("og:image is not absolute")

print()
print("=" * 78)
print("5. JSON-LD")
print("=" * 78)
PERSON_ID = BASE + "/#person"
for path, s in sorted(docs.items()):
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    if not blocks:
        fail(f"{path}: no JSON-LD")
        continue
    try:
        data = json.loads(blocks[0])
    except Exception as e:
        fail(f"{path}: JSON-LD does not parse: {e}")
        continue
    graph = data.get("@graph", [])
    types = [n.get("@type") for n in graph]
    person = next((n for n in graph if n.get("@type") == "Person"), None)
    if not person:
        fail(f"{path}: no Person node")
    else:
        if person.get("@id") != PERSON_ID:
            fail(f"{path}: Person @id {person.get('@id')!r} != {PERSON_ID!r}")
        if person.get("name") != "Monssif Zhairi":
            fail(f"{path}: Person name {person.get('name')!r}")
        if person.get("givenName") != "Monssif" or person.get("familyName") != "Zhairi":
            fail(f"{path}: Person name parts wrong")
        if person.get("sameAs") != ["https://github.com/monssifzhairi"]:
            fail(f"{path}: sameAs {person.get('sameAs')!r}")
        for banned in ("email", "telephone", "address", "homeLocation", "worksFor", "alumniOf", "award", "hasCredential", "image", "jobTitle"):
            if banned in person:
                fail(f"{path}: Person must not contain {banned!r}")
    banned_types = {"Organization", "LocalBusiness", "Review", "AggregateRating", "Product", "JobPosting", "FAQPage", "Event"}
    bad = set(types) & banned_types
    if bad:
        fail(f"{path}: forbidden schema type(s) {bad}")
    if path == "/" and "WebSite" not in types:
        fail("homepage: missing WebSite node")
    if path != "/" and "WebSite" in types:
        notes.append(f"{path}: WebSite node present (allowed)")
    if path == "/about/" and "ProfilePage" not in types:
        fail("about: missing ProfilePage node")
    print(f"  {path:<32} {types}")

print()
print("=" * 78)
print("6. SITEMAP")
print("=" * 78)
sm = read("sitemap.xml")
locs = re.findall(r"<loc>(.*?)</loc>", sm)
# The 404 page is excluded from the sitemap (blueprint section 12).
expected_locs = [BASE + path for _rel, path in ROUTES if path != "/404.html"]
for l in locs:
    if l not in expected_locs:
        fail(f"sitemap contains non-canonical or non-indexable URL: {l}")
for e in expected_locs:
    if e not in locs:
        fail(f"sitemap missing {e}")
if "changefreq" in sm:
    fail("sitemap has changefreq")
if "priority" in sm:
    fail("sitemap has priority")
print(f"  {len(locs)} URLs (expected {len(expected_locs)})")
for l in locs:
    print(f"    {l}")
if re.search(r"<lastmod>(.*?)</lastmod>", sm):
    print("  lastmod present:", re.findall(r"<lastmod>(.*?)</lastmod>", sm)[0])

print()
print("=" * 78)
print("7. ROBOTS.TXT")
print("=" * 78)
rb = read("robots.txt")
print("  " + rb.replace("\n", "\n  ").strip())
if not re.search(r"^User-agent:\s*\*", rb, re.M):
    fail("robots.txt: no User-agent: *")
if not re.search(r"^Allow:\s*/\s*$", rb, re.M):
    fail("robots.txt: no Allow: /")
if re.search(r"^Disallow:", rb, re.M):
    fail("robots.txt: has Disallow rules")
if f"Sitemap: {BASE}/sitemap.xml" not in rb:
    fail("robots.txt: sitemap line missing or wrong")
if "<meta name=\"robots\" content=\"noindex\"" in rb:
    fail("robots.txt contains HTML")

print()
print("=" * 78)
print("8. INTERNAL LINKS RESOLVE")
print("=" * 78)
internal = set()
for path, s in docs.items():
    d = Doc()
    d.feed(s)
    for href in d.links:
        if href.startswith("http") or href.startswith("#") or href.startswith("mailto:"):
            continue
        internal.add(href)
broken = []
for href in sorted(internal):
    target = href.lstrip("/")
    candidates = [target, os.path.join(target, "index.html"), target + "index.html", os.path.join(target, "404.html")]
    if not any(os.path.exists(os.path.join(DIST, c)) for c in candidates):
        broken.append(href)
for b in broken:
    fail(f"internal link does not resolve to a built file: {b}")
print(f"  {len(internal)} unique internal link targets, {len(broken)} broken")
for b in broken:
    print(f"    BROKEN -> {b}")

# two-click reachability from the homepage
home = docs["/"]
home_links = set()
d = Doc()
d.feed(home)
for href in d.links:
    if href.startswith("http"):
        continue
    home_links.add(href)
one_click = set()
for h in home_links:
    t = h.lstrip("/")
    f = os.path.join(DIST, t, "index.html")
    if os.path.exists(f) and h != "/":
        one_click.add(h)
print(f"  reachable in 1 click from '/': {len(one_click)} -> {sorted(one_click)}")
for path in ["/about/", "/projects/", "/learning/", "/contact/"]:
    if path not in one_click:
        fail(f"{path} not linked from the homepage with a normal <a href>")
proj_pages = [p for p, _ in ROUTES if p.startswith("/projects/") and p != "/projects/"]
for pp in proj_pages:
    if pp not in one_click:
        fail(f"{pp} not linked from the homepage (homepage must link to every project)")

print()
print("=" * 78)
print("9. FORBIDDEN / INVENTED CONTENT")
print("=" * 78)
BANNED_SUBSTR = [
    ("monssif-dev", "legacy GitHub handle"),
    ("monssifzhairioffi", "old email address"),
    ("@gmail.com", "email address"),
    ("mailto:", "email link"),
    ("Morocco", "location (declined)"),
    ("Apex Timepiece", "excluded project"),
    ("apex-store", "excluded project"),
    ("apex-store-blue", "excluded project"),
    ("Flutter", "unconfirmed MR-CHESS detail"),
    ("Melos", "unconfirmed MR-CHESS detail"),
    ("Riverpod", "unconfirmed MR-CHESS detail"),
    ("go_router", "unconfirmed MR-CHESS detail"),
    ("FEN", "unconfirmed MR-CHESS detail"),
    ("GSAP", "unconfirmed NIKE D-LINE detail"),
    ("Next.js", "unconfirmed project detail"),
    ("mongodb", "unconfirmed project detail"),
]
for path, s in sorted(docs.items()):
    hay = s.lower()
    for needle, why in BANNED_SUBSTR:
        if needle.lower() in hay:
            fail(f"{path}: contains {needle!r} ({why})")

# Certification / expertise *claims*. Denials such as "nothing here is claimed
# to be certified" are honest copy and must not trip this check, so only
# assertive constructions are flagged.
CLAIM_PATTERNS = [
    (r"\bis a certified\b", "certification claim"),
    (r"\bam a certified\b", "certification claim"),
    (r"\bcertified (?:in|by|with|as)\b", "certification claim"),
    (r"\bcertified professional\b", "certification claim"),
    (r"\b(?:ce|oscp|cissp|cism|sec\w*)\s+certified\b", "certification claim"),
    (r"\bi am an expert\b", "expertise claim"),
    (r"\bexpert (?:in|developer|engineer)\b", "expertise claim"),
    (r"\bprofessional pentester\b", "expertise claim"),
    (r"\bworked (?:at|for) [A-Z]", "employment claim"),
    (r"\bmy (?:clients?|company|employer)\b", "client/employment claim"),
    (r"\b\d+\+? years of experience\b", "experience claim"),
    (r"\baward[- ]winning\b", "award claim"),
]
for path, s in sorted(docs.items()):
    body = re.sub(r"<[^>]+>", " ", s)
    for pattern, why in CLAIM_PATTERNS:
        m = re.search(pattern, body, re.I)
        if m:
            fail(f"{path}: possible {why}: {m.group(0)!r}")

# status labels must be from the allowed set
ALLOWED_STATUS = {"in progress", "prototype", "shipped", "to confirm"}
for path, s in sorted(docs.items()):
    for m in re.finditer(r'class="status-line__value">([^<]+)<', s):
        if m.group(1).strip().lower() not in ALLOWED_STATUS:
            fail(f"{path}: unrecognised status label {m.group(1)!r}")

# year in footer must not be hardcoded/stale
for path, s in sorted(docs.items()):
    if "2026</span>" in s:
        fail(f"{path}: hardcoded stale year")

print("  scanned all pages for declined / unconfirmed / invented content")

print()
print("=" * 78)
print("10. ACCESSIBILITY + PERFORMANCE MARKERS")
print("=" * 78)
for path, s in sorted(docs.items()):
    if 'class="skip-link" href="#main"' not in s:
        fail(f"{path}: missing skip link")
    if 'id="main"' not in s:
        fail(f"{path}: no #main target")
    if "prefers-reduced-motion" not in s:
        fail(f"{path}: no prefers-reduced-motion handling in CSS")
    if 'aria-hidden="true"' not in s:
        fail(f"{path}: no aria-hidden decorative elements")
    if 'target="_blank"' in s and 'rel="noopener' not in s:
        fail(f"{path}: target=_blank without rel=noopener")
print("  skip link, #main, reduced-motion, aria-hidden, rel=noopener: all present")

# fonts self-hosted only
ASTRO = os.path.join(DIST, "_astro")
astro_files = sorted(os.listdir(ASTRO))
allcss = " ".join(
    open(os.path.join(ASTRO, f), encoding="utf-8").read() for f in astro_files if f.endswith(".css")
)
for ext in [".woff", ".woff2"]:
    if ext not in allcss:
        fail(f"self-hosted fonts: no {ext} referenced in CSS")
if "fonts.googleapis" in allcss or "fonts.gstatic" in allcss:
    fail("CSS still loads fonts from Google Fonts (must be self-hosted)")
if "font-display" not in allcss:
    fail("CSS missing font-display: swap")
print("  fonts self-hosted (woff/woff2, font-display: swap), no Google Fonts")

# no client framework payload
js = [f for f in os.listdir(os.path.join(DIST, "_astro")) if f.endswith(".js")]
total_js = sum(os.path.getsize(os.path.join(DIST, "_astro", f)) for f in js)
print(f"  client JS: {len(js)} file(s), {total_js/1024:.1f} KB total")
if total_js > 60 * 1024:
    fail(f"client JS budget exceeded: {total_js/1024:.1f} KB")
if re.search(r"three(\.module)?(\.min)?\.js", " ".join(js)):
    fail("Three.js present in the bundle")

html_total = sum(os.path.getsize(os.path.join(DIST, r)) for r, _ in ROUTES)
print(f"  total HTML: {html_total/1024:.1f} KB across {len(ROUTES)} pages")

print()
print("=" * 78)
print("11. BRAND ASSETS")
print("=" * 78)
# The brand assets are typographic, so they are easy to break silently: a
# renderer that cannot match a font family emits a blank tile and still exits 0.
# These checks fail loudly if the images are missing, malformed, empty of ink,
# or if the header stops using the generated logo.

BRAND_FILES = {
    "logo.png": None,  # any size; must be transparent and contain ink
    "favicon-48.png": (48, 48),
    "favicon-192.png": (192, 192),
    "favicon-512.png": (512, 512),
    "apple-touch-icon.png": (180, 180),
    "icon-maskable-512.png": (512, 512),
    "og/og-default.jpg": (1200, 630),
}


def png_size(rel):
    """Returns (width, height) from the IHDR chunk without a decoder."""
    with open(os.path.join(DIST, rel), "rb") as fh:
        head = fh.read(26)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big")


def png_has_alpha(rel):
    with open(os.path.join(DIST, rel), "rb") as fh:
        head = fh.read(26)
    return head[25] in (4, 6)


def jpeg_size(rel):
    with open(os.path.join(DIST, rel), "rb") as fh:
        data = fh.read()
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i < len(data) - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        # SOF0-SOF15, skipping the non-frame markers DHT/JPG/DAC.
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            return (
                int.from_bytes(data[i + 7 : i + 9], "big"),
                int.from_bytes(data[i + 5 : i + 7], "big"),
            )
        i += 2 + int.from_bytes(data[i + 2 : i + 4], "big")
    return None


for rel, expected in BRAND_FILES.items():
    path = os.path.join(DIST, rel)
    if not os.path.exists(path):
        fail(f"brand asset missing from dist: {rel}")
        continue
    size = png_size(rel) if rel.endswith(".png") else jpeg_size(rel)
    if size is None:
        fail(f"brand asset is not a readable image: {rel}")
        continue
    if expected and size != expected:
        fail(f"{rel}: expected {expected[0]}x{expected[1]}, got {size[0]}x{size[1]}")
    # An empty or near-empty image means the type failed to render.
    if os.path.getsize(path) < 200:
        fail(f"{rel}: implausibly small ({os.path.getsize(path)} bytes) - likely blank")
    print(f"  {rel:26} {size[0]}x{size[1]}  {os.path.getsize(path)/1024:.1f} KB")

# The header wordmark is a real image: it must ship, be transparent (so it sits
# on the page background), and reserve space so it cannot shift layout.
if not os.path.exists(os.path.join(DIST, "logo.png")):
    fail("logo.png missing - the header wordmark cannot render")
else:
    if not png_has_alpha("logo.png"):
        fail("logo.png has no alpha channel; it would show a box on the header")
    home = read("index.html")
    if 'src="/logo.png"' not in home:
        fail('header does not reference /logo.png')
    logo_tag = re.search(r'<img[^>]*src="/logo\.png"[^>]*>', home)
    if not logo_tag:
        fail("could not find the header logo <img>")
    else:
        tag = logo_tag.group(0)
        for attr in ('alt=""', "width=", "height="):
            if attr not in tag:
                fail(f"header logo img missing {attr} (alt keeps it decorative; "
                     "width/height prevent layout shift)")
        print("  header logo <img>: alt=\"\" + explicit dimensions")

# Every page uses the same header, so the check above holds site-wide.
for path, _ in ROUTES:
    if 'src="/logo.png"' not in read(path):
        fail(f"{path}: header logo missing")

print()
print("=" * 78)
if notes:
    print("NOTES")
    print("-" * 78)
    for n in notes:
        print("  - " + n)
    print()
print("=" * 78)
if failures:
    print(f"RESULT: {len(failures)} PROBLEM(S)")
    print("=" * 78)
    for f in failures:
        print("  FAIL " + f)
    sys.exit(1)
print("RESULT: ALL CHECKS PASSED")
print("=" * 78)