/**
 * Generates every raster brand asset, in the site's real typeface.
 *
 *   public/logo.png                MZ monogram, white on transparent (header)
 *   public/favicon-48.png          48x48   (Google favicon requirement)
 *   public/favicon-192.png         192x192
 *   public/favicon-512.png         512x512
 *   public/apple-touch-icon.png    180x180
 *   public/icon-maskable-512.png   512x512 maskable, safe-zone padded
 *   public/og/og-default.jpg       1200x630 social preview
 *
 * Three rules make the output trustworthy:
 *
 *  1. Text is drawn by @resvg/resvg-js, with Oswald loaded from TTF files
 *     decompressed out of @fontsource (see fonts.mjs).
 *
 *  2. Nothing is written until a preflight render proves the monogram actually
 *     produced ink of a plausible size. A renderer that cannot match a font
 *     family draws *nothing* and still exits 0 — that is exactly how the
 *     previously committed assets ended up with no real typography. The
 *     preflight makes that failure loud instead of silent.
 *
 *  3. The PNG icons are rasterised from the committed public/favicon.svg rather
 *     than re-drawn from parameters, so the vector favicon stays the single
 *     source of truth for the tile.
 *
 * Note on sharp: it is used only for pixel operations (resize, encode, measure).
 * Its SVG *text* rendering cannot be used here — librsvg in this build emits a
 * ~18x12 stub regardless of font-size, family, or fontconfig, so SVG text is
 * always rendered by resvg instead.
 *
 * The OG image is the site's own wordmark. It is typographic brand imagery,
 * NOT a project screenshot: nothing here represents a project.
 *
 * Usage: npm run brand   (committed output is also fine; this is reproducible)
 */
import { readFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { materialiseFonts, measureInk } from './fonts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const BG = '#0d0d0d';
const FG = '#ededed';
const ACCENT = '#ffffff';
const LABEL = '#949494';

const fonts = await materialiseFonts();
const FONT_PATHS = Object.values(fonts.files);
const FAMILY = fonts.family;

/** Renders SVG to a PNG buffer. System fonts stay off so nothing substitutes. */
function renderPng(svg, { width } = {}) {
  const resvg = new Resvg(svg, {
    ...(width ? { fitTo: { mode: 'width', value: width } } : { fitTo: { mode: 'original' } }),
    font: {
      fontFiles: FONT_PATHS,
      loadSystemFonts: false,
      defaultFontFamily: FAMILY,
    },
  });
  return resvg.render().asPng();
}

/* ------------------------------------------------------------ monogram -- */

/**
 * The MZ monogram on a tile-free canvas.
 * Tracking and weight match public/favicon.svg so the wordmark, the favicon and
 * the OG image are all the same mark.
 */
function monogramSvg({ size, weight = 600, tracking = -0.5, fill = ACCENT }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <text x="50%" y="71.5%" text-anchor="middle" font-family="${FAMILY}" font-size="${size * 0.8}"
        font-weight="${weight}" letter-spacing="${tracking}" fill="${fill}">MZ</text>
</svg>`;
}

/* ----------------------------------------------------------- preflight -- */

/**
 * Proves the renderer is really drawing Oswald before anything is overwritten.
 * Oswald's cap height is 810/1000 em, so a correctly rendered "M" at 300px must
 * measure ~243px tall and clearly more than one glyph wide.
 */
async function preflight() {
  const png = renderPng(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#000"/>
     <text x="20" y="300" font-family="${FAMILY}" font-size="300" fill="#fff">M</text></svg>`,
  );
  const ink = await measureInk(png, sharp);
  if (!ink) {
    throw new Error(
      'Preflight failed: the renderer drew no text at all.\n' +
        'Refusing to overwrite the committed brand assets — they are still correct.',
    );
  }
  const capEm = ink.height / 300;
  if (capEm < 0.7 || capEm > 0.9) {
    throw new Error(
      `Preflight failed: "M" measured ${ink.width}x${ink.height} at font-size 300 ` +
        `(cap height ${capEm.toFixed(3)} em; Oswald is 0.810). ` +
        'A different font is being substituted. Refusing to overwrite assets.',
    );
  }
  return capEm;
}

/* --------------------------------------------------------------- assets -- */

/**
 * Renders the monogram large and trims to the ink, so logo.png is a tight,
 * transparent wordmark rather than a square of mostly-nothing.
 */
async function logoPng(targetInkHeight = 48) {
  const large = renderPng(monogramSvg({ size: 1024 }));
  // Crop the transparent margin first, then downsample: resampling the full
  // square would waste work and soften the result.
  const tight = await sharp(large).trim({ threshold: 1 }).png().toBuffer();
  const out = await sharp(tight)
    .resize({ height: targetInkHeight, fit: 'inside', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const { width, height } = await sharp(out).metadata();
  const ink = await measureInk(out, sharp);
  if (!ink || ink.height < targetInkHeight - 2) {
    throw new Error(`logo.png rendered unexpectedly small (${ink ? `${ink.width}x${ink.height}` : 'blank'}).`);
  }
  await sharp(out).toFile(join(pub, 'logo.png'));
  return { width, height };
}

/**
 * Rasterises the committed favicon.svg at an exact pixel size.
 * The SVG is vector with only a viewBox, so width/height are injected and the
 * artwork scales cleanly rather than upscaling a 64px raster.
 */
async function faviconTile(size) {
  const svg = await readFile(join(pub, 'favicon.svg'), 'utf8');
  if (!svg.includes('<svg')) throw new Error('favicon.svg looks invalid');
  const sized = svg.replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
  const out = join(pub, `favicon-${size}.png`);
  await sharp(renderPng(sized, { width: size })).png({ compressionLevel: 9 }).toFile(out);
  return out;
}

/** apple-touch-icon is a flat, opaque tile — iOS renders transparency badly. */
async function appleTouchIcon(size = 180) {
  const svg = await readFile(join(pub, 'favicon.svg'), 'utf8');
  const sized = svg.replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
  const out = join(pub, 'apple-touch-icon.png');
  await sharp(renderPng(sized, { width: size }))
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toFile(out);
  return out;
}

/**
 * Maskable icons are cropped to a circle inscribed in the middle 80%, so the
 * monogram must shrink into the safe zone. Only the padding differs.
 */
async function maskableIcon(size = 512) {
  const inner = Math.round(size * 0.56);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="${FAMILY}"
        font-size="${Math.round(inner * 1.28)}" font-weight="600" letter-spacing="-0.5"
        fill="${ACCENT}">MZ</text>
</svg>`;
  const out = join(pub, 'icon-maskable-512.png');
  await sharp(renderPng(svg, { width: size })).png({ compressionLevel: 9 }).toFile(out);
  return out;
}

/* --------------------------------------------------- OG social preview -- */

/** Wrap text on spaces to a character budget. */
function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function ogImage() {
  const w = 1200;
  const h = 630;

  const name = wrap('Monssif Zhairi', 20);
  const positioning = wrap(
    'Developer · Creative Developer · AI Explorer · Cybersecurity Learner',
    58,
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.055"/>
      <stop offset="0.62" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>

  <!-- ambient film texture, matching the site's .film-texture -->
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.05"/>

  <!-- hairline frame, matching the site's hairline colour -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="#222" stroke-width="1"/>

  <!-- monogram -->
  <text x="80" y="150" font-family="${FAMILY}" font-size="42" font-weight="600"
        letter-spacing="3" fill="${ACCENT}">MZ</text>

  <!-- MONSSIF // DIGITAL LAB brand concept -->
  <text x="80" y="196" font-family="${FAMILY}" font-size="17" font-weight="500"
        letter-spacing="6.5" fill="${LABEL}">MONSSIF // DIGITAL LAB</text>

  <line x1="80" y1="232" x2="${w - 80}" y2="232" stroke="#222" stroke-width="1"/>

  <!-- the name -->
  ${name
    .map(
      (line, i) =>
        `<text x="80" y="${352 + i * 104}" font-family="${FAMILY}" font-size="92"
              font-weight="600" letter-spacing="0.5" fill="${FG}">${line}</text>`,
    )
    .join('\n  ')}

  <!-- positioning line -->
  ${positioning
    .map(
      (line, i) =>
        `<text x="80" y="${352 + name.length * 104 + 6 + i * 34}" font-family="${FAMILY}"
              font-size="21" font-weight="400" letter-spacing="4.2" fill="${LABEL}">${line}</text>`,
    )
    .join('\n  ')}

  <line x1="80" y1="${h - 92}" x2="${w - 80}" y2="${h - 92}" stroke="#222" stroke-width="1"/>
  <text x="80" y="${h - 58}" font-family="${FAMILY}" font-size="17" font-weight="500"
        letter-spacing="5" fill="${LABEL}">WEB · CREATIVE · AI · CYBERSECURITY</text>
</svg>`;

  await mkdir(join(pub, 'og'), { recursive: true });
  const out = join(pub, 'og', 'og-default.jpg');
  await sharp(renderPng(svg, { width: w }))
    .flatten({ background: BG })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(out);
  return out;
}

/* ----------------------------------------------------------------- main -- */

try {
  const capEm = await preflight();
  console.log(`preflight: OK (cap height ${capEm.toFixed(3)} em, expected 0.810)`);

  const logo = await logoPng(48);
  const icons = [];
  for (const size of [48, 192, 512]) icons.push(await faviconTile(size));
  icons.push(await appleTouchIcon(180));
  icons.push(await maskableIcon(512));
  const og = await ogImage();

  console.log(`logo:      public/logo.png  (${logo.width}x${logo.height} ink, transparent)`);
  for (const i of icons) console.log(`icon:      ${i.replace(root + '/', '')}`);
  const { size } = await stat(og);
  console.log(`OG image:  ${og.replace(root + '/', '')}  (${(size / 1024).toFixed(1)} KB)`);

  // Fail loudly if the social image would bloat the page.
  if (size > 1_000_000) {
    console.error('OG image exceeds ~1 MB.');
    process.exitCode = 1;
  }
} finally {
  fonts.dispose();
}
