/**
 * Generates the static image assets from source SVG:
 *
 *   public/og/og-default.jpg        1200x630 social preview (blueprint §11)
 *   public/favicon-48.png           48x48   (Google favicon requirement)
 *   public/favicon-192.png          192x192
 *   public/favicon-512.png          512x512
 *   public/icon-maskable-512.png    512x512 maskable, safe-zone padded
 *   public/apple-touch-icon.png     180x180
 *
 * The OG image is the site's own wordmark. It is typographic brand imagery,
 * NOT a project screenshot: nothing here represents a project.
 *
 * Usage: npm run og   (committed output is also fine; this is reproducible)
 */
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const BG = '#0d0d0d';
const FG = '#ededed';
const ACCENT = '#ffffff';
const LABEL = '#949494';

const DISPLAY = "Oswald, 'Arial Narrow', Helvetica, Arial, sans-serif";

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

/* --------------------------------------------------- OG social preview -- */
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
    <filter id="grain">
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
  <text x="80" y="150" font-family="${DISPLAY}" font-size="42" font-weight="600"
        letter-spacing="3" fill="${ACCENT}">MZ</text>

  <!-- MONSSIF // DIGITAL LAB brand concept -->
  <text x="80" y="196" font-family="${DISPLAY}" font-size="17" font-weight="500"
        letter-spacing="6.5" fill="${LABEL}">MONSSIF // DIGITAL LAB</text>

  <line x1="80" y1="232" x2="${w - 80}" y2="232" stroke="#222" stroke-width="1"/>

  <!-- the name -->
  ${name
    .map(
      (line, i) =>
        `<text x="80" y="${352 + i * 104}" font-family="${DISPLAY}" font-size="92"
              font-weight="600" letter-spacing="0.5" fill="${FG}">${line}</text>`,
    )
    .join('\n  ')}

  <!-- positioning line -->
  ${positioning
    .map(
      (line, i) =>
        `<text x="80" y="${352 + name.length * 104 + 6 + i * 34}" font-family="${DISPLAY}"
              font-size="21" font-weight="400" letter-spacing="4.2" fill="${LABEL}">${line}</text>`,
    )
    .join('\n  ')}

  <line x1="80" y1="${h - 92}" x2="${w - 80}" y2="${h - 92}" stroke="#222" stroke-width="1"/>
  <text x="80" y="${h - 58}" font-family="${DISPLAY}" font-size="17" font-weight="500"
        letter-spacing="5" fill="${LABEL}">WEB · CREATIVE · AI · CYBERSECURITY</text>
</svg>`;

  await mkdir(join(pub, 'og'), { recursive: true });
  const out = join(pub, 'og', 'og-default.jpg');

  await sharp(Buffer.from(svg))
    .flatten({ background: BG })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(out);

  return out;
}

/* ------------------------------------------------------------- icons --- */
async function monogramSvg(size, { padding = 0.14 } = {}) {
  const font = Math.round(size * (1 - padding * 2));
  const baseline = size * 0.715;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" fill="none"
        stroke="#2a2a2a" stroke-width="1"/>
  <text x="50%" y="${baseline}" font-family="${DISPLAY}" font-size="${font}"
        font-weight="600" letter-spacing="-0.5" text-anchor="middle" fill="${ACCENT}">MZ</text>
</svg>`;
}

async function icons() {
  const targets = [
    ['favicon-48.png', 48, {}],
    ['favicon-192.png', 192, {}],
    ['favicon-512.png', 512, {}],
    ['apple-touch-icon.png', 180, {}],
    // Maskable icons must survive an aggressive circular crop: keep the
    // monogram inside the inner 80% safe zone.
    ['icon-maskable-512.png', 512, { padding: 0.24 }],
  ];

  const written = [];
  for (const [name, size, opts] of targets) {
    const svg = await monogramSvg(size, opts);
    const out = join(pub, name);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
    written.push(out);
  }
  return written;
}

const og = await ogImage();
const icons_ = await icons();

// Report the OG image size: the blueprint asks for under ~1 MB.
const { size } = await import('node:fs').then((fs) => fs.statSync(og));
console.log(`OG image:  ${og.replace(root + '/', '')}  (${(size / 1024).toFixed(1)} KB)`);
for (const i of icons_) console.log(`icon:      ${i.replace(root + '/', '')}`);

// Fail loudly if the social image would bloat the page.
if (size > 1_000_000) {
  console.error('OG image exceeds ~1 MB.');
  process.exitCode = 1;
}

// Sanity check that the committed SVG favicon is readable.
const favicon = await readFile(join(pub, 'favicon.svg'), 'utf8');
if (!favicon.includes('<svg')) throw new Error('favicon.svg looks invalid');