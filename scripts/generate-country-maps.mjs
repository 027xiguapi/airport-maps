/**
 * Renders the per-country airport distribution maps shown on /country/<CC>:
 *
 *   public/country-maps/<ISO>.png   the country's outline with one dot per
 *                                   scheduled airport; the airports this site
 *                                   covers are drawn larger, in the brand
 *                                   orange, with IATA labels
 *
 * The outline is Natural Earth 50m via `world-atlas` (the topojson-client
 * devDependency), matched by English country name — countries without a
 * matching outline still render, dots only. Everything is composed as an SVG
 * and rasterised with sharp, the same toolchain as
 * scripts/generate-airport-maps.mjs, so no tile server or network access is
 * needed.
 *
 * The bounding box comes from the airports, never the outline: Natural Earth's
 * France polygon carries the overseas departments, which would blow the frame
 * out to half the world. Rings are clipped to the canvas instead. Countries
 * whose airports straddle the antimeridian (RU, NZ, FJ) get their western
 * longitudes unwrapped (+360) before fitting, so one country stays in one
 * frame.
 *
 * Usage:
 *   node scripts/generate-country-maps.mjs                missing maps only
 *   node scripts/generate-country-maps.mjs --force        re-render everything
 *   node scripts/generate-country-maps.mjs --codes JP,US  a subset
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import sharp from 'sharp';
import { feature } from 'topojson-client';
import { ROOT } from './_env.mjs';

const DATA = join(ROOT, 'scripts', 'country-airports.json');
const OUT_DIR = join(ROOT, 'public', 'country-maps');
const MANIFEST = join(ROOT, 'scripts', 'country-maps-manifest.json');

const WIDTH = 1600;
const MAX_HEIGHT = 2000;
const MIN_SPAN = 1.2; // projected units — keeps city-states and islands airy
const PAD = 0.08;

/** OurAirports country_name -> Natural Earth name, where they differ. */
const NAME_ALIASES = {
  'United States': 'United States of America',
  Macao: 'Macau',
  'Czech Republic': 'Czechia',
  Swaziland: 'eSwatini',
  'Republic of Serbia': 'Serbia',
  'Republic of the Congo': 'Congo',
  'Democratic Republic of the Congo': 'Dem. Rep. Congo',
  'Cape Verde': 'Cabo Verde',
  'Ivory Coast': "Côte d'Ivoire",
  'Dominican Republic': 'Dominican Rep.',
  'Saint Vincent and the Grenadines': 'St. Vin. and Gren.',
  'Solomon Islands': 'Solomon Is.',
  'Cook Islands': 'Cook Is.',
  'French Polynesia': 'Fr. Polynesia',
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------ outlines (NE)
const world = JSON.parse(
  readFileSync(createRequire(import.meta.url).resolve('world-atlas/countries-50m.json'), 'utf8')
);
const features = feature(world, world.objects.countries).features;
const byName = new Map(features.map((f) => [f.properties?.name, f]));

/** Flat list of [lon, lat] rings for a country's outline, or null. */
function outlineRings(countryName) {
  const f = byName.get(NAME_ALIASES[countryName] ?? countryName);
  if (!f?.geometry) return null;
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return polys.flat().filter((ring) => ring.length >= 4);
}

// -------------------------------------------------------------- the render
function renderSvg(iso, entry, rings, covered) {
  const withCoords = entry.airports.filter((a) => Number.isFinite(a.lat) && Number.isFinite(a.lng));
  if (withCoords.length === 0) return null;

  const lats = withCoords.map((a) => a.lat);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const cos = Math.cos((midLat * Math.PI) / 180);
  const rawLons = withCoords.map((a) => a.lng);
  const unwrap = Math.max(...rawLons) - Math.min(...rawLons) > 180;

  const project = ([lon, lat]) => {
    const l = unwrap && lon < 0 ? lon + 360 : lon;
    return [l * cos, -lat];
  };

  // Frame from the airports only.
  const pts = withCoords.map((a) => project([a.lng, a.lat]));
  let minX = Math.min(...pts.map((p) => p[0]));
  let maxX = Math.max(...pts.map((p) => p[0]));
  let minY = Math.min(...pts.map((p) => p[1]));
  let maxY = Math.max(...pts.map((p) => p[1]));
  const grow = (lo, hi) => {
    const mid = (lo + hi) / 2;
    const span = Math.max(hi - lo, MIN_SPAN);
    return [mid - span / 2, mid + span / 2];
  };
  [minX, maxX] = grow(minX, maxX);
  [minY, maxY] = grow(minY, maxY);
  const dx = maxX - minX;
  const dy = maxY - minY;
  minX -= dx * PAD;
  maxX += dx * PAD;
  minY -= dy * PAD;
  maxY += dy * PAD;

  let scale = WIDTH / (maxX - minX);
  let W = WIDTH;
  let H = Math.round((maxY - minY) * scale);
  if (H > MAX_HEIGHT) {
    scale = MAX_HEIGHT / (maxY - minY);
    H = MAX_HEIGHT;
    W = Math.round((maxX - minX) * scale);
  }
  const px = (x) => Math.round((x - minX) * scale * 10) / 10;
  const py = (y) => Math.round((y - minY) * scale * 10) / 10;

  // Outline, clipped to the canvas (rings may extend past the frame).
  let outline = '';
  if (rings) {
    const d = rings
      .map((ring) => {
        const coords = ring.map(([lon, lat]) => project([lon, lat]));
        return `M${coords.map(([x, y]) => `${px(x)} ${py(y)}`).join('L')}Z`;
      })
      .join('');
    outline = `<path d="${d}" fill="#E7EEF5" stroke="#BFD2E2" stroke-width="2" stroke-linejoin="round"/>`;
  }

  // Dots: covered airports in brand orange, the rest sized by type.
  const DOT = {
    large: { r: 7, fill: '#5E8DB4' },
    medium: { r: 5.5, fill: '#7FA6C4' },
    small: { r: 4.5, fill: '#9CBCD4' },
  };
  const placed = [];
  const dots = withCoords
    .map((a) => {
      const [x, y] = project([a.lng, a.lat]);
      const cx = px(x);
      const cy = py(y);
      const isCovered = covered.has(a.iata);
      const dot = isCovered
        ? `<circle cx="${cx}" cy="${cy}" r="9" fill="#F4622E" stroke="#FFFFFF" stroke-width="3"/>`
        : `<circle cx="${cx}" cy="${cy}" r="${DOT[a.type].r}" fill="${DOT[a.type].fill}" stroke="#FFFFFF" stroke-width="1.6"/>`;
      return { a, cx, cy, isCovered, dot };
    });
  placed.push(...dots.map((d) => [d.cx, d.cy]));

  // Labels: the airports this site covers, then every other large airport.
  // Each label gets a small box (84×28); a box is rejected if it overlaps an
  // already-placed label or sits on another dot, and the anchor is nudged
  // vertically a few times before giving up — HND must not lose its label to
  // NRT just because the two are neighbours.
  const labelCandidates = dots
    .filter((d) => d.isCovered || d.a.type === 'large')
    .sort((p, q) => Number(q.isCovered) - Number(p.isCovered));
  const allDotPts = dots.map((d) => [d.cx, d.cy]);
  const boxes = [];
  let labels = '';
  for (const d of labelCandidates) {
    if (boxes.length >= 18) break;
    const right = d.cx < W - 160;
    const w = 84;
    const h = 28;
    for (const dy of [0, -24, 24, -46, 46]) {
      const y = d.cy + 7 + dy;
      if (y < 26 || y > H - 64) continue;
      const x = right ? d.cx + 14 : d.cx - 14 - w;
      if (x < 4 || x + w > W - 4) continue;
      const box = { x, y: y - 20, w, h };
      const overlapsLabel = boxes.some(
        (b) => !(box.x + box.w < b.x || b.x + b.w < box.x || box.y + box.h < b.y || b.y + b.h < box.y)
      );
      if (overlapsLabel) continue;
      const coversDot = allDotPts.some(
        ([px, py]) =>
          px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h &&
          Math.hypot(px - d.cx, py - d.cy) > 12
      );
      if (coversDot) continue;
      boxes.push(box);
      labels += `<text x="${right ? box.x : box.x + box.w}" y="${y}" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="#17334D" stroke="#FFFFFF" stroke-width="4" paint-order="stroke" text-anchor="${right ? 'start' : 'end'}">${esc(d.a.iata)}</text>`;
      break;
    }
  }

  // Small legend + credit, both in English (the page supplies the localized
  // alt text and description around the image).
  const legendY = H - 26;
  const legend = `<g font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="19">
    <rect x="0" y="${H - 52}" width="360" height="52" fill="#FFFFFF" opacity="0.72"/>
    <circle cx="24" cy="${legendY - 6}" r="8" fill="#F4622E" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="42" y="${legendY}" fill="#41525F">Covered on this site</text>
    <circle cx="212" cy="${legendY - 6}" r="6" fill="#7FA6C4" stroke="#FFFFFF" stroke-width="1.6"/>
    <text x="226" y="${legendY}" fill="#41525F">Other airports</text>
  </g>
  <text x="${W - 12}" y="${H - 12}" text-anchor="end" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="16" fill="#9AA9B8">OurAirports · Natural Earth</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${iso} airport distribution map`)}">
  <defs><clipPath id="frame"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
  <rect width="${W}" height="${H}" fill="#F6F9FC"/>
  <g clip-path="url(#frame)">${outline}${dots.map((d) => d.dot).join('')}</g>
  ${labels}
  ${legend}
</svg>`;

  return { svg, W, H, covered: dots.filter((d) => d.isCovered).length };
}

// -------------------------------------------------------------------- main
const FORCE = process.argv.includes('--force');
const codesArg = process.argv.indexOf('--codes');
const only = codesArg >= 0 ? new Set((process.argv[codesArg + 1] ?? '').split(',').map((c) => c.trim().toUpperCase())) : null;

/**
 * Countries that actually have a /country/<CC> page, straight from the
 * database. Rendering every ISO code in the dataset would ship ~140 maps no
 * page links to; when the database is unreachable (a fresh checkout, CI) the
 * script renders everything rather than nothing.
 */
async function siteCountryCodes() {
  try {
    const { databaseUrl } = await import('./_env.mjs');
    const pg = (await import('pg')).default;
    const client = new pg.Client({ connectionString: databaseUrl() });
    await client.connect();
    const { rows } = await client.query('SELECT code FROM countries');
    await client.end();
    return new Set(rows.map((r) => String(r.code).toUpperCase()));
  } catch (error) {
    console.warn(`note: could not read country list from the database (${error.message}); rendering every dataset country`);
    return null;
  }
}

const data = JSON.parse(readFileSync(DATA, 'utf8'));
mkdirSync(OUT_DIR, { recursive: true });

/** Airports with a detail page on this site — drawn highlighted + labelled. */
const covered = new Set([
  ...JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8')).airports.map((a) => a.iata),
  ...JSON.parse(readFileSync(join(ROOT, 'scripts', 'directory-data.json'), 'utf8')).airports.map((a) => a.iata),
]);

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
manifest.source = data.source;
manifest.maps = manifest.maps ?? {};

let rendered = 0;
let skipped = 0;
const missingOutline = [];
const noCoords = [];

const siteCodes = await siteCountryCodes();

for (const [iso, entry] of Object.entries(data.countries)) {
  if (only && !only.has(iso)) continue;
  if (!only && siteCodes && !siteCodes.has(iso)) continue;
  const file = `${iso}.png`;
  const out = join(OUT_DIR, file);
  if (!FORCE && existsSync(out)) {
    skipped++;
    continue;
  }
  const rings = outlineRings(entry.name);
  if (!rings) missingOutline.push(iso);
  const result = renderSvg(iso, entry, rings, covered);
  if (!result) {
    noCoords.push(iso);
    continue;
  }
  await sharp(Buffer.from(result.svg)).png({ compressionLevel: 9, palette: true }).toFile(out);
  manifest.maps[iso] = {
    file,
    width: result.W,
    height: result.H,
    airports: entry.total,
    covered: result.covered,
    generated: data.generated,
  };
  rendered++;
  console.log(`${iso.padEnd(3)} ${String(entry.total).padStart(4)} airports (${String(result.covered).padStart(2)} covered) ${result.W}x${result.H}`);
}

manifest.generated = new Date().toISOString().slice(0, 10);
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`rendered ${rendered}, skipped ${skipped} existing (${Object.keys(manifest.maps).length} in manifest)`);
if (missingOutline.length) console.log(`no Natural Earth outline: ${missingOutline.join(', ')}`);
if (noCoords.length) console.log(`no coordinates, skipped: ${noCoords.join(', ')}`);
