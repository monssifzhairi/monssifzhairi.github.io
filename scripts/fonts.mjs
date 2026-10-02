/**
 * Materialises the site's real webfonts as TTF files that an image renderer can
 * actually load, and provides a way to prove text actually rendered.
 *
 * Why this exists
 * ---------------
 * The brand assets (favicon PNGs, OG image, logo) are typographic, so they must
 * be drawn in the same Oswald the site uses. The site self-hosts Oswald through
 * @fontsource, but:
 *
 *   - `@fontsource` only ships WOFF2, which is a container format that image
 *     renderers generally cannot read.
 *   - `wawoff2` (a WASM build of Google's reference woff2 tools) decompresses
 *     WOFF2 back to plain TrueType, which every renderer understands.
 *
 * Nothing is installed onto the machine: the TTFs go to a temp directory and are
 * removed again by `dispose()`.
 *
 * Rendering is done by @resvg/resvg-js, which takes explicit font file paths.
 * See generate-brand.mjs for why the more obvious sharp/librsvg route is not
 * usable here.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decompress } from 'wawoff2';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Only the weights the brand assets use. Oswald ships a static file per weight,
 * and rendering always loads exactly these with system fonts disabled, so a
 * missing weight fails loudly rather than silently substituting.
 */
const WEIGHTS = [400, 500, 600, 700];

const OSWALD_DIR = join(root, 'node_modules', '@fontsource', 'oswald', 'files');

/**
 * Decompresses the Oswald weights this project needs into a temp directory.
 *
 * @returns {Promise<{ family: string, files: Record<number, string>, dispose: () => void }>}
 *   `files` maps a font weight to an absolute path of a TrueType file.
 */
export async function materialiseFonts() {
  const work = mkdtempSync(join(tmpdir(), 'monssif-brand-'));

  const fail = (msg) => {
    rmSync(work, { recursive: true, force: true });
    throw new Error(msg);
  };

  let entries;
  try {
    entries = readdirSync(OSWALD_DIR);
  } catch {
    fail(`Missing ${OSWALD_DIR}\nRun \`npm install\` before generating brand assets.`);
  }

  const files = {};
  for (const weight of WEIGHTS) {
    const woff2 = `oswald-latin-${weight}-normal.woff2`;
    if (!entries.includes(woff2)) {
      fail(`Missing ${woff2} in ${OSWALD_DIR}. Run \`npm install\`.`);
    }
    const ttf = Buffer.from(await decompress(readFileSync(join(OSWALD_DIR, woff2))));

    // TrueType files start with the 0x00010000 version tag.
    if (ttf.length < 1024 || ttf.readUInt32BE(0) !== 0x00010000) {
      fail(`Decompressed ${woff2} is not a valid TrueType file (${ttf.length} bytes).`);
    }

    const ttfPath = join(work, `oswald-${weight}.ttf`);
    writeFileSync(ttfPath, ttf);
    files[weight] = ttfPath;
  }

  return {
    family: 'Oswald',
    files,
    dispose() {
      rmSync(work, { recursive: true, force: true });
    },
  };
}

/**
 * Measures the bright ink in a rendered image.
 *
 * This is a guard, not a helper for its own sake: when a font family fails to
 * match, the renderer draws *nothing* and still reports success, which is how
 * "generated" brand assets once ended up with no typography at all. Asserting
 * on measured ink turns that class of failure into a loud error.
 *
 * @returns {Promise<{ width: number, height: number } | null>} null when blank.
 */
export async function measureInk(pngBuffer, sharp, { threshold = 90 } = {}) {
  const { data, info } = await sharp(pngBuffer).raw().toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height || info.channels < 3) return null;

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (lum > threshold) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  return { width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
