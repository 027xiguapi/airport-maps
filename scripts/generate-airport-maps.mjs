/**
 * Renders airport maps from OpenStreetMap geometry, one per IATA code, into
 * the same two slots the site already reads:
 *
 *   public/source-maps/{IATA}.png   2000 px wide, the full-resolution original
 *   public/maps/{IATA}.png           400 px wide, the cover used by cards and
 *                                    the homepage strip (see lib/map-images.ts)
 *
 * Why generated rather than fetched: the maps already in those directories were
 * downloaded from a third party, and this pipeline exists so new ones can be
 * produced without borrowing anyone's artwork. The geometry comes from
 * OpenStreetMap (aeroway=terminal/apron/taxiway/parking, access roads, and the
 * POIs behind the legend), so every file carries the ODbL attribution line
 * baked into the image, and the provenance for each render is recorded in
 * public/maps/maps-manifest.json next to the files.
 *
 * The legend labels are English on purpose: one file per airport serves all
 * locales, which is how the existing cover set works.
 *
 * Usage:
 *   node scripts/generate-airport-maps.mjs --codes PEK,PVG,CAN,KIX
 *   node scripts/generate-airport-maps.mjs --missing --kind large
 *   node scripts/generate-airport-maps.mjs --missing            # every airport without a cover
 *
 * Flags:
 *   --codes A,B,C   explicit IATA codes (upper case)
 *   --codes-file F  read codes from a file (one per line or comma separated)
 *   --missing       every airport in the seed data that has no cover yet
 *   --kind K        restrict --missing to directory airports of that size
 *                   (large|medium|small|heliport)
 *   --dry-run       print the plan only: no fetch, no write
 *   --force         re-render (and re-fetch) airports that already have a cover
 *   --reindex       write manifest entries for the given --codes from the files
 *                   already on disk, without rendering anything
 *   --limit N       stop after N airports
 *   --delay MS      pause between Overpass requests (default 1200)
 *
 * Raw Overpass responses are cached under data/osm/ so re-styling a map does
 * not mean re-querying the API; delete a cache file to refresh that airport.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { ROOT } from './_env.mjs';

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback = null) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};

const DRY = has('--dry-run');
const FORCE = has('--force');
const LIMIT = Number(value('--limit', '0')) || 0;
const DELAY = Number(value('--delay', '1200'));
const KIND = value('--kind');

const MAPS_DIR = join(ROOT, 'public', 'maps');
const SOURCE_DIR = join(ROOT, 'public', 'source-maps');
const CACHE_DIR = join(ROOT, 'data', 'osm');
/** Provenance record for what this script produced. Kept out of public/maps so
    that directory holds images only; the site reads public/data/latest-maps.json
    instead (written alongside it below). */
const MANIFEST = join(ROOT, 'scripts', 'maps-manifest.json');
/** Page data for the homepage "latest maps" strip: newest first, no hashes. */
const LATEST_INDEX = join(ROOT, 'public', 'data', 'latest-maps.json');

// ------------------------------------------------------------------ targets
const legacy = JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8'));
const directory = JSON.parse(readFileSync(join(ROOT, 'scripts', 'directory-data.json'), 'utf8'));
const kindOf = new Map(directory.airports.map((a) => [a.iata, a.kind]));
const allCodes = [...new Set([...legacy.airports.map((a) => a.iata), ...directory.airports.map((a) => a.iata)])];
const covered = () => {
  try {
    return new Set(readdirSync(MAPS_DIR).filter((f) => /^[A-Z]{3}\.png$/.test(f)).map((f) => f.slice(0, 3)));
  } catch {
    return new Set();
  }
};

function requestedCodes() {
  const explicit = value('--codes');
  const file = value('--codes-file');
  let codes;
  if (explicit) codes = explicit.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  else if (file) codes = readFileSync(file, 'utf8').split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter(Boolean);
  else if (has('--missing')) codes = allCodes.filter((c) => !covered().has(c));
  else throw new Error('Nothing to do: pass --codes, --codes-file or --missing.');
  if (KIND) codes = codes.filter((c) => kindOf.get(c) === KIND);
  return codes;
}

function targets() {
  const codes = requestedCodes();
  if (FORCE) return codes;
  const done = covered();
  return codes.filter((c) => !done.has(c));
}

// ---------------------------------------------------------------- geo source
/** Coordinates for a code: repo dataset, then the OurAirports dump, then OSM. */
const coordsCache = new Map();
const isMissing = (o) => !o || !Number.isFinite(o.lat) || !Number.isFinite(o.lng) || (o.lat === 0 && o.lng === 0);
function coords(code) {
  if (coordsCache.has(code)) return coordsCache.get(code);
  const wa = JSON.parse(readFileSync(join(ROOT, 'public', 'data', 'world-airports.json'), 'utf8')).airports;
  const hit = wa.find((r) => String(r[0]).toUpperCase() === code);
  let out = hit ? { lat: hit[6], lng: hit[7], from: 'world-airports.json' } : null;
  if (!out) {
    const rows = readFileSync(join(ROOT, 'data', 'world-airports.csv'), 'utf8').split(/\r?\n/);
    const head = rows[0].split(',');
    const iIata = head.indexOf('iata_code');
    const iLat = head.indexOf('latitude_deg');
    const iLng = head.indexOf('longitude_deg');
    for (const line of rows) {
      if (!line) continue;
      const cols = line.split(',');
      if ((cols[iIata] || '').replace(/"/g, '').toUpperCase() !== code) continue;
      const lat = Number(cols[iLat]);
      const lng = Number(cols[iLng]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) out = { lat, lng, from: 'world-airports.csv' };
      break;
    }
  }
  if (isMissing(out)) out = null;
  coordsCache.set(code, out);
  return out;
}

// ------------------------------------------------------------------ overpass
// General-purpose instances only. Regional ones (e.g. overpass.osm.ch, which
// serves Switzerland) answer a query outside their region with HTTP 200 and an
// empty element list, which is indistinguishable from "the airport is unmapped"
// — see the empty-result retry in cached().
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
/** A mirror that is overloaded can hold a request open for minutes; without a
    deadline one hung socket stalls the whole run. Query-shaped work over a busy
    instance regularly takes a minute, so the deadline is generous. */
const REQUEST_TIMEOUT_MS = 90_000;
const ATTEMPTS = 3;
let lastRequest = 0;
/** Mirror list in the order this run found them healthy (see probeMirrors). */
let mirrorOrder = MIRRORS;

/**
 * Probes each mirror once and puts the healthy ones first. The probe expects a
 * non-empty answer, so a regional instance that would silently answer "nothing"
 * outside its own country is demoted along with the ones that are down.
 */
async function probeMirrors() {
  const probe = '[out:json][timeout:10];nwr["aeroway"="terminal"](50.02,8.54,50.06,8.60);out center;';
  const scored = [];
  for (const host of MIRRORS) {
    const started = Date.now();
    try {
      const res = await fetch(host, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(probe),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'airport-maps/1.0 (site data pipeline)' },
        signal: AbortSignal.timeout(20_000),
      });
      const text = await res.text();
      const count = res.ok && text.trim().startsWith('{') ? (JSON.parse(text).elements?.length ?? 0) : 0;
      scored.push({ host, count, ms: Date.now() - started });
      console.log(`  ${host.split('/')[2].padEnd(30)} ${count ? 'ok' : 'no data'} · ${Date.now() - started} ms`);
    } catch (err) {
      scored.push({ host, count: 0, ms: Infinity });
      console.log(`  ${host.split('/')[2].padEnd(30)} unreachable · ${err.message.slice(0, 40)}`);
    }
  }
  scored.sort((a, b) => b.count - a.count || a.ms - b.ms);
  const healthy = scored.filter((s) => s.count > 0).map((s) => s.host);
  // An instance that answers a known-good query with nothing would otherwise be
  // read as "this airport is unmapped", so it is left out of the rotation
  // entirely — unless nothing at all answered, in which case try them all.
  return healthy.length ? healthy : MIRRORS;
}

async function overpass(query, label, { startAt = 0 } = {}) {
  let lastError;
  const start = startAt % Math.max(1, mirrorOrder.length);
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const host = mirrorOrder[(start + attempt) % mirrorOrder.length];
    const wait = DELAY * (attempt + 1) - (Date.now() - lastRequest);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    try {
      lastRequest = Date.now();
      const res = await fetch(host, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'airport-maps/1.0 (site data pipeline)' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const text = await res.text();
      if (!res.ok || !text.trim().startsWith('{')) throw new Error(`HTTP ${res.status}: ${text.slice(0, 80).replace(/\s+/g, ' ')}`);
      const json = JSON.parse(text);
      if (json.remark && /error|timed out/i.test(json.remark)) throw new Error(json.remark);
      return json.elements ?? [];
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`${label}: ${lastError.message}`);
}

/** Overpass lookup for codes neither local dataset carries (closed fields etc.). */
async function coordsFromOsm(code) {
  const els = await overpass(`[out:json][timeout:30];nwr["iata"="${code}"];out center;`, `coords ${code}`);
  const hit = els.find((e) => e.center || e.lat);
  if (!hit) return null;
  return {
    lat: hit.lat ?? hit.center.lat,
    lng: hit.lon ?? hit.center.lon,
    from: 'overpass iata lookup',
  };
}

/** Search radius around the reference point. Wide enough for the terminal
    complex plus nearby hotels/parking, tight enough that a city-centre query
    does not come back with thousands of unrelated car parks. */
const HALF_BOX = { large: 0.045, medium: 0.035, small: 0.022, heliport: 0.018 };

/** Terminal buildings and aprons: these decide the frame. */
function queryCore(bbox) {
  return `[out:json][timeout:120];
(
  way["aeroway"~"^(terminal|apron|parking)$"](${bbox});
);
out geom;`;
}

/**
 * Everything drawn inside the frame that is not a building: car parks plus the
 * POIs behind the other six legend entries. Both live in the frame-sized box,
 * never the wide search box — in a city like Santiago the latter holds hundreds
 * of car parks and the query times out.
 */
function queryPois(bbox) {
  return `[out:json][timeout:90];
(
  nwr["amenity"="parking"](${bbox});
  nwr["amenity"~"^(bus_station|car_rental|restaurant|fast_food|cafe)$"](${bbox});
  nwr["tourism"="hotel"](${bbox});
  nwr["highway"="bus_stop"](${bbox});
);
out center;`;
}

function queryDetail(bbox) {
  return `[out:json][timeout:120];
(
  way["aeroway"="taxiway"](${bbox});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|service)$"](${bbox});
);
out geom;`;
}

/**
 * Overpass response cache. `retryEmpty` re-asks once when a query comes back
 * with nothing: an empty answer is also what a mirror outside its own region
 * returns, and caching that would drop an airport that is mapped perfectly well.
 */
async function cached(code, stage, makeQuery, bbox, { retryEmpty = false } = {}) {
  const file = join(CACHE_DIR, `${code}.${stage}.json`);
  if (existsSync(file)) {
    const hit = JSON.parse(readFileSync(file, 'utf8'));
    if (!retryEmpty || hit.length) return hit;
  }
  let els = await overpass(makeQuery(bbox), `${code} ${stage}`);
  if (retryEmpty && !els.length) els = await overpass(makeQuery(bbox), `${code} ${stage} (retry)`, { startAt: 1 });
  if (!els.length && retryEmpty) return els; // genuinely unmapped: do not cache
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(file, JSON.stringify(els));
  return els;
}

// ------------------------------------------------------------------- drawing
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const COLORS = {
  bg: '#FBFCFD',
  roadFill: '#FFFFFF',
  roadCasing: '#DDE2E8',
  parking: '#E7EAEE',
  parkingEdge: '#D2D8DE',
  apron: '#DFE5EB',
  apronEdge: '#C7CFD7',
  taxiway: '#D3D9DF',
  terminal: '#6FB6D8',
  terminalEdge: '#2E7DB3',
  ink: '#3A3F45',
  dim: '#98A2AE',
};
const ROAD_W = { motorway: 12, trunk: 11, primary: 10, secondary: 8, tertiary: 7, service: 5 };
/** How much air to leave around the framed complex. Also sizes the road and
    POI queries, so the two stay in step. */
const MARGIN = 1.7;

const isTerm = (e) => e.tags.aeroway === 'terminal';
const isApron = (e) => e.tags.aeroway === 'apron';
const isPark = (e) => e.tags.aeroway === 'parking' || e.tags.amenity === 'parking';

const ICON = 62;
const font = 'Arial, Helvetica, sans-serif';
const badge = (fill, body) =>
  `<rect x="${-ICON / 2}" y="${-ICON / 2}" width="${ICON}" height="${ICON}" rx="10" fill="${fill}"/>${body}`;

/** Legend/badge glyphs, drawn at the origin and translated into place. */
const GLYPH = {
  parking: (fill = '#2E7DB3') =>
    badge(fill, `<text x="0" y="15" font-size="40" font-weight="700" fill="#fff" text-anchor="middle" font-family="${font}">P</text>`),
  bus: () =>
    badge('#3A3F45', `<rect x="-19" y="-16" width="38" height="24" rx="6" fill="#fff"/><rect x="-13" y="-12" width="26" height="11" rx="2" fill="#3A3F45"/><circle cx="-10" cy="13" r="5" fill="#fff"/><circle cx="10" cy="13" r="5" fill="#fff"/>`),
  food: () =>
    badge('#F5A623', `<path d="M-12 -16 v32 M-12 -16 c-7 0 -7 10 0 10 M12 -16 v32 M12 -16 c6 3 6 12 0 14" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/>`),
  hotel: () =>
    badge('#3A3F45', `<path d="M-18 12 V-8 h18 a10 10 0 0 1 10 10 v10 M-18 3 H18 M-18 12 H18" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`),
  car: () =>
    badge('#3FAE4A', `<path d="M-19 5 l4 -11 h30 l4 11 v9 h-38 z" fill="#fff"/><circle cx="-10" cy="14" r="4.5" fill="#3FAE4A"/><circle cx="10" cy="14" r="4.5" fill="#3FAE4A"/>`),
  security: () =>
    badge('#3A3F45', `<path d="M0 -17 l14 5.5 v9 c0 10 -6 16 -14 19 c-8 -3 -14 -9 -14 -19 v-9 z" fill="#fff"/>`),
  /** Wider than the square badges: it carries a car plus an arrow. */
  dropoff: () =>
    `<rect x="-36" y="${-ICON / 2}" width="72" height="${ICON}" rx="10" fill="#3A3F45"/><path d="M-30 3 l3.5 -10 h17 l3.5 10 v8 h-24 z" fill="#fff"/><path d="M6 -11 l9 9 -9 9" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

const LEGEND = [
  ['dropoff', 'Pick up & drop-off area'],
  ['parking', 'Parking'],
  ['bus', 'Bus'],
  ['security', 'Security'],
  ['food', 'Food'],
  ['hotel', 'Hotel'],
  ['car', 'Car rentals'],
];
/** How many badges of each kind to place; the rest would just stack up. */
const CAP = { parking: 12, bus: 3, food: 4, hotel: 2, car: 3 };

/**
 * Builds the SVG for one airport. `frame` fixes the projection (so the terminal
 * complex fills the canvas rather than the whole query box), `areas` are the
 * ground shapes drawn inside it, `detail` is drawn underneath, and `pois`
 * become badges at their mapped positions.
 */
function renderSvg({ iata, name, bounds, areas, detail, pois }) {
  const minX = bounds.min[0];
  const maxX = bounds.max[0];
  const minY = bounds.min[1];
  const maxY = bounds.max[1];
  const kW = Math.cos((bounds.center[1] * Math.PI) / 180);

  const W = 2000;
  const PAD = 80;
  const LEGEND_H = 150;
  const spanX = ((maxX - minX) * kW || 1e-6) * MARGIN;
  const spanY = (maxY - minY || 1e-6) * MARGIN;
  const scale = Math.min((W - PAD * 2) / spanX, (W * 0.8 - PAD) / spanY);
  const cx = bounds.center[0];
  const cy = bounds.center[1];
  const imgW = W;
  // A long thin airfield would otherwise rasterise into a letterbox strip; zoom
  // until the content is MIN_CONTENT_H tall and let the ends clip instead.
  const MIN_CONTENT_H = 700;
  const zoom = Math.max(scale, MIN_CONTENT_H / spanY);
  const imgH = Math.round(spanY * zoom + PAD * 2 + LEGEND_H);
  const px = (lng) => imgW / 2 + (lng - cx) * kW * zoom;
  const py = (lat) => (imgH - LEGEND_H) / 2 - (lat - cy) * zoom;

  const path = (e, close) =>
    e.geometry.map((p, i) => `${i ? 'L' : 'M'}${px(p.lon).toFixed(1)} ${py(p.lat).toFixed(1)}`).join(' ') + (close ? ' Z' : '');

  const g = [];
  for (const e of detail) {
    if (e.tags.aeroway === 'taxiway') {
      g.push(`<path d="${path(e)}" fill="none" stroke="${COLORS.taxiway}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>`);
      continue;
    }
    const w = ROAD_W[e.tags.highway] ?? 5;
    g.push(`<path d="${path(e)}" fill="none" stroke="${COLORS.roadCasing}" stroke-width="${w + 3}" stroke-linejoin="round" stroke-linecap="round"/>`);
    g.push(`<path d="${path(e)}" fill="none" stroke="${COLORS.roadFill}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`);
  }
  for (const e of areas) {
    if (isPark(e)) g.push(`<path d="${path(e, true)}" fill="${COLORS.parking}" stroke="${COLORS.parkingEdge}" stroke-width="2.5" stroke-linejoin="round"/>`);
    else if (isApron(e)) g.push(`<path d="${path(e, true)}" fill="${COLORS.apron}" stroke="${COLORS.apronEdge}" stroke-width="2.5" stroke-linejoin="round"/>`);
    else if (isTerm(e)) g.push(`<path d="${path(e, true)}" fill="${COLORS.terminal}" stroke="${COLORS.terminalEdge}" stroke-width="4" stroke-linejoin="round"/>`);
  }

  // Badges: nearest to the field first, then drop ones that would overlap.
  let placed = 0;
  for (const [type, list] of pois) {
    const keep = [];
    for (const p of list) {
      if (keep.length >= CAP[type]) break;
      if (keep.some((o) => Math.hypot((o.x - p.x) * kW, (o.y - p.y) * 1) * scale < ICON * 1.5)) continue;
      keep.push(p);
    }
    for (const p of keep) {
      g.push(`<g transform="translate(${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)})">${GLYPH[type]()}</g>`);
      placed++;
    }
  }

  let lx = PAD;
  const ly = imgH - LEGEND_H / 2 - 10;
  for (const [type, label] of LEGEND) {
    g.push(`<g transform="translate(${lx + ICON / 2} ${ly})">${GLYPH[type]()}</g>`);
    g.push(`<text x="${lx + ICON + 16}" y="${ly + 12}" font-size="26" fill="${COLORS.ink}" font-family="${font}">${esc(label)}</text>`);
    lx += ICON + 30 + label.length * 13.6 + 26;
  }
  g.push(`<text x="${imgW - PAD}" y="${imgH - 20}" font-size="20" fill="${COLORS.dim}" text-anchor="end" font-family="${font}">© OpenStreetMap contributors</text>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgW}" height="${imgH}" role="img" aria-label="${esc(`${iata} ${name} airport map`)}">
<rect width="${imgW}" height="${imgH}" fill="${COLORS.bg}"/>
${g.join('\n')}
</svg>`;
  return { svg, imgW, imgH, badges: placed };
}

// ------------------------------------------------------------------- manifest
const sourcePath = (code) => join(SOURCE_DIR, `${code}.png`);
const coverPath = (code) => join(MAPS_DIR, `${code}.png`);
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

/**
 * Records provenance for codes whose files are on disk — what was rendered, from
 * where, under which licence. Called after every airport rather than once at the
 * end, so interrupting a long run does not lose the record of what it produced.
 */
function recordProvenance(codes) {
  const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { entries: {} };
  const entries = { ...previous.entries };
  for (const code of codes) {
    if (!existsSync(sourcePath(code)) || !existsSync(coverPath(code))) continue;
    entries[code] = {
      generatedAt: statSync(sourcePath(code)).mtime.toISOString(),
      generator: 'generate-airport-maps.mjs',
      dataSource: 'OpenStreetMap via Overpass API',
      dataLicence: 'ODbL 1.0 — © OpenStreetMap contributors (attribution rendered into the image)',
      sha256: { source: sha256(sourcePath(code)), cover: sha256(coverPath(code)) },
    };
  }
  writeFileSync(MANIFEST, JSON.stringify({
    note: 'Provenance for the covers this script generated. Images downloaded by scripts/fetch-airport-images.mjs are recorded by that script instead.',
    updatedAt: new Date().toISOString(),
    entries,
  }, null, 2) + '\n');

  // Newest first, for the homepage "latest maps" strip. Page data lives under
  // public/; this file is only codes and dates, never the provenance hashes.
  mkdirSync(dirname(LATEST_INDEX), { recursive: true });
  writeFileSync(LATEST_INDEX, JSON.stringify({
    note: 'Generated by scripts/generate-airport-maps.mjs — the covers it produced, newest first.',
    maps: Object.entries(entries)
      .sort((a, b) => String(b[1].generatedAt).localeCompare(String(a[1].generatedAt)))
      .map(([iata, entry]) => ({ iata, generatedAt: entry.generatedAt })),
  }, null, 2) + '\n');

  return Object.keys(entries).length;
}

// --------------------------------------------------------------------- main
const POS = (e) => (e.lat ? [e.lon, e.lat] : e.center ? [e.center.lon, e.center.lat] : null);
const CENTROID = (e) => {
  const p = e.geometry ?? [];
  if (!p.length) return POS(e);
  let sx = 0;
  let sy = 0;
  for (const q of p) { sx += q.lon; sy += q.lat; }
  return [sx / p.length, sy / p.length];
};
const poiType = (e) => {
  if (e.tags.highway === 'bus_stop' || e.tags.amenity === 'bus_station') return 'bus';
  if (e.tags.amenity === 'car_rental') return 'car';
  if (e.tags.tourism === 'hotel') return 'hotel';
  if (e.tags.amenity === 'restaurant' || e.tags.amenity === 'fast_food' || e.tags.amenity === 'cafe') return 'food';
  if (isPark(e)) return 'parking';
  return null;
};
const bboxOf = (lat, lng, latHalf) => [lat - latHalf, lng - latHalf * 1.45, lat + latHalf, lng + latHalf * 1.45].join(',');

/** Bounding box of a set of ways, used to frame the render. */
function extentOf(els) {
  const pts = els.flatMap((e) => e.geometry.map((p) => [p.lon, p.lat]));
  const min = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1]))];
  const max = [Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  return { min, max, center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2], lonSpan: max[0] - min[0], latSpan: max[1] - min[1] };
}

async function build(code) {
  const kind = kindOf.get(code) ?? 'large';
  const point = coords(code);
  if (!point) throw new Error('no coordinates in any local dataset');
  const box = bboxOf(point.lat, point.lng, HALF_BOX[kind] ?? HALF_BOX.medium);

  // Stage A: the airport itself. The frame comes from terminal buildings —
  // aprons cover the whole movement area, so framing on those pulls in the
  // runways and turns a hub like PEK into a picture of the airfield.
  const areaEls = (await cached(code, 'a', queryCore, box, { retryEmpty: true })).filter((e) => e.geometry);
  const buildings = areaEls.filter((e) => isTerm(e) || isApron(e));
  if (!buildings.length) throw new Error('no terminal/apron geometry in OSM for this field');
  const terminals = areaEls.filter(isTerm);
  const aprons = areaEls.filter(isApron);
  const frame = terminals.length ? terminals : aprons.length ? aprons : buildings;

  const raw = extentOf(frame);
  // A regional field has a terminal a few hundred metres across. Flooring the
  // frame (and the queries below) at roughly a kilometre keeps those maps from
  // rendering as a lone building on an empty page.
  const MIN_SPAN = 0.009;
  const minLon = MIN_SPAN / Math.cos((raw.center[1] * Math.PI) / 180);
  const padLat = Math.max(0, (MIN_SPAN - raw.latSpan) / 2);
  const padLon = Math.max(0, (minLon - raw.lonSpan) / 2);
  const bounds = {
    min: [raw.min[0] - padLon, raw.min[1] - padLat],
    max: [raw.max[0] + padLon, raw.max[1] + padLat],
    center: raw.center,
    lonSpan: raw.lonSpan + 2 * padLon,
    latSpan: raw.latSpan + 2 * padLat,
  };
  const tight = bboxOf(bounds.center[1], bounds.center[0], (MARGIN / 2) * Math.max(bounds.latSpan, bounds.lonSpan / 1.45));

  // Stages B and C only look at that frame: airport roads and taxiways, then the
  // POIs behind the legend. A stage that keeps timing out costs its own layer —
  // the geometry from stage A is what the map is actually made of.
  const warnings = [];
  const safe = async (label, fn) => {
    try {
      return await fn();
    } catch (err) {
      warnings.push(`${label} (${String(err.message).slice(0, 40)})`);
      return [];
    }
  };
  const detail = (await safe('no roads', () => cached(code, 'b', queryDetail, tight, { retryEmpty: true }))).filter((e) => e.geometry);
  const poiEls = await safe('no POIs', () => cached(code, 'c2', queryPois, tight, { retryEmpty: true }));

  /** Inside the frame, with room for shapes that overhang its edge. */
  const inside = (p, pad = 0.25) => p
    && p[0] >= bounds.min[0] - bounds.lonSpan * pad && p[0] <= bounds.max[0] + bounds.lonSpan * pad
    && p[1] >= bounds.min[1] - bounds.latSpan * pad && p[1] <= bounds.max[1] + bounds.latSpan * pad;

  const areas = [
    ...buildings,
    ...poiEls.filter((e) => e.geometry && isPark(e) && inside(CENTROID(e))),
  ];

  const kW = Math.cos((bounds.center[1] * Math.PI) / 180);
  const buckets = new Map();
  for (const e of poiEls) {
    const type = poiType(e);
    if (!type) continue;
    const p = type === 'parking' ? CENTROID(e) : POS(e);
    if (!p || !inside(p)) continue;
    const k = Math.hypot((p[0] - bounds.center[0]) * kW, p[1] - bounds.center[1]);
    if (!buckets.has(type)) buckets.set(type, []);
    buckets.get(type).push({ x: p[0], y: p[1], k });
  }
  for (const list of buckets.values()) list.sort((a, b) => a.k - b.k);

  const name = directory.airports.find((a) => a.iata === code)?.nameEn
    ?? legacy.airports.find((a) => a.iata === code)?.nameEn
    ?? code;
  return { ...renderSvg({ iata: code, name, bounds, areas, detail, pois: buckets }), point, kind, coreCount: areas.length, detailCount: detail.length, warnings };
}

async function main() {
  if (has('--reindex')) {
    const codes = requestedCodes();
    console.log(`reindexed ${recordProvenance(codes)} manifest entries for ${codes.length} code(s)`);
    return;
  }
  const list = targets();
  if (LIMIT) list.splice(LIMIT);
  console.log(`${list.length} airport(s) to render${DRY ? ' (dry run)' : ''}`);
  if (DRY) {
    console.log(list.map((c) => `${c} (${kindOf.get(c) ?? 'editorial'})`).join(' '));
    return;
  }
  for (const dir of [SOURCE_DIR, MAPS_DIR, CACHE_DIR]) mkdirSync(dir, { recursive: true });
  console.log('probing Overpass mirrors:');
  mirrorOrder = await probeMirrors();

  const done = [];
  const skipped = [];
  const failed = [];

  for (const [i, code] of list.entries()) {
    const label = `[${i + 1}/${list.length}] ${code}`;
    try {
      if (!coords(code)) {
        const found = await coordsFromOsm(code);
        if (!found) throw new Error('no coordinates in any dataset or OSM');
        coordsCache.set(code, found);
      }
      const map = await build(code);
      const sourcePath = join(SOURCE_DIR, `${code}.png`);
      const coverPath = join(MAPS_DIR, `${code}.png`);
      const raster = await sharp(Buffer.from(map.svg));
      await raster.clone().png({ compressionLevel: 9 }).toFile(sourcePath);
      await raster.clone().resize({ width: 400, withoutEnlargement: false }).png({ compressionLevel: 9 }).toFile(coverPath);

      const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
      done.push({ code, size: `${map.imgW}x${map.imgH}`, badges: map.badges });
      recordProvenance([code]);
      console.log(`${label} ok — ${map.imgW}x${map.imgH}, ${map.coreCount} core + ${map.detailCount} detail shapes, ${map.badges} badges (coords: ${map.point.from})${map.warnings.length ? ` [${map.warnings.join('; ')}]` : ''}`);
    } catch (err) {
      if (/no terminal\/apron\/parking|no coordinates/.test(err.message)) {
        skipped.push({ code, reason: err.message });
        console.log(`${label} skipped — ${err.message}`);
      } else {
        failed.push({ code, reason: err.message });
        console.log(`${label} FAILED — ${err.message}`);
      }
    }
  }

  console.log(`\nrendered: ${done.length} | skipped (no OSM geometry): ${skipped.length} | failed: ${failed.length}`);
  if (skipped.length) console.log(`skipped: ${skipped.map((s) => s.code).join(' ')}`);
  if (failed.length) console.log(`failed: ${failed.map((f) => `${f.code} (${f.reason})`).join(', ')}`);
  console.log(`manifest: ${MANIFEST}`);
}

await main();
