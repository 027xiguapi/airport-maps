/**
 * Renders a labelled Esri World Imagery satellite view for airports that have
 * no published photo yet, so every airport page can show a real picture while
 * the ground-photo batches catch up.
 *
 * The output matches the satellite covers already used for ~280 airports:
 * a 4×3 mosaic of 256 px Web Mercator tiles at zoom 14 (1024×768), with a
 * translucent label bar naming the airport and the imagery credit. Artifacts
 * and provenance follow the same conventions as the other photo fetchers:
 *
 *   public/photos/<IATA>/<iata>-sat-1.webp
 *   public/photos/manifest.json      source:'satellite', host + tile template
 *   public/photos/captions/<IATA>.json  authored zh + en caption (the page gate)
 *
 * The caption is written here because a satellite view needs no editorial
 * judgement: the picture always shows the airport's runway/terminal layout.
 * Existing captions in the file are preserved.
 *
 * Usage:
 *   node scripts/fetch-airport-satellite-photos.mjs --missing --dry-run
 *   node scripts/fetch-airport-satellite-photos.mjs --missing
 *   node scripts/fetch-airport-satellite-photos.mjs --codes DEN,DFW,LAS
 *   node scripts/fetch-airport-satellite-photos.mjs --codes-file .backup/codes.txt
 *
 * Flags:
 *   --missing        every DB airport without a published photo
 *   --codes A,B,C    explicit codes
 *   --codes-file F   one code per line, or comma-separated
 *   --force          overwrite an existing satellite render / caption
 *   --dry-run        list the plan, touch nothing
 *   --delay 120      ms between tile requests
 *   --zoom 14        Web Mercator zoom level
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback = null) => {
  const withEq = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (withEq) return withEq.slice(flag.length + 1);
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};

const DRY = has('--dry-run');
const FORCE = has('--force');
const DELAY = Number(value('--delay', '120'));
const ZOOM = Number(value('--zoom', '14'));
const COLS = 4;
const ROWS = 3;
const TILE = 256;
const WIDTH = COLS * TILE;
const HEIGHT = ROWS * TILE;
const LABEL_H = 40;

const PHOTOS = join(ROOT, 'public', 'photos');
const CAPTIONS = join(PHOTOS, 'captions');
const MANIFEST = join(PHOTOS, 'manifest.json');
const ESRI_ITEM = 'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9';
const TILE_URL = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/{y}/{x}`;
const UA = 'airport-maps/1.0 (site data pipeline)';

const PHOTO_STEMS = (() => {
  try {
    const file = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photo-file-aliases.json'), 'utf8'));
    return Object.fromEntries(
      Object.entries(file).filter(
        ([code, stem]) => /^[A-Z]{3}$/.test(code) && typeof stem === 'string'
      )
    );
  } catch {
    return {};
  }
})();
const STEM_TO_CODE = Object.fromEntries(
  Object.entries(PHOTO_STEMS).map(([code, stem]) => [stem, code])
);
const photoStem = (code) => PHOTO_STEMS[code] ?? code;
const escapeXml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------ inputs
const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
};

const manifest = readJson(MANIFEST, { airports: {} });
manifest.airports ??= {};
const captionsOnDisk = new Map();
if (existsSync(CAPTIONS)) {
  for (const name of readdirSync(CAPTIONS)) {
    const match = name.match(/^([A-Z]{3})_?\.json$/);
    if (!match) continue;
    captionsOnDisk.set(STEM_TO_CODE[match[1]] ?? match[1], name);
  }
}

/** Codes with at least one published (captioned, not skipped) photo. */
function publishedCodes() {
  const out = new Set();
  for (const [code, entries] of Object.entries(manifest.airports)) {
    if (!Array.isArray(entries)) continue;
    const stem = captionsOnDisk.get(code);
    const rows = stem ? readJson(join(CAPTIONS, stem), null) : null;
    if (!rows) continue;
    const skip = new Set(Array.isArray(rows._skip) ? rows._skip : []);
    if (
      entries.some(
        (entry) =>
          entry?.file &&
          !skip.has(entry.file) &&
          rows[entry.file] &&
          typeof rows[entry.file] === 'object' &&
          rows[entry.file].zh
      )
    ) {
      out.add(code);
    }
  }
  return out;
}

async function missingFromDb() {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    const { rows } = await client.query('select iata, name, name_en, city from airports order by iata');
    const published = publishedCodes();
    return rows.filter((row) => !published.has(row.iata));
  } finally {
    await client.end();
  }
}

async function airportsFromCodes(codes) {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    const { rows } = await client.query(
      'select iata, name, name_en, city from airports where iata = ANY($1) order by iata',
      [codes]
    );
    return rows;
  } finally {
    await client.end();
  }
}

// ------------------------------------------------------------- coordinates
const handChecked = (() => {
  const file = readJson(join(ROOT, 'scripts', 'airport-coords.json'), {});
  return Object.fromEntries(
    Object.entries(file)
      .filter(([code]) => /^[A-Z]{3}$/.test(code))
      .map(([code, entry]) => [code, { lat: entry.lat, lng: entry.lng }])
  );
})();

const worldAirports = (() => {
  const file = readJson(join(ROOT, 'public', 'data', 'world-airports.json'), { airports: [] });
  return file.airports ?? [];
})();

const csvRows = (() => {
  try {
    const rows = readFileSync(join(ROOT, 'data', 'world-airports.csv'), 'utf8').split(/\r?\n/);
    const head = rows[0].split(',');
    return {
      iata: head.indexOf('iata_code'),
      lat: head.indexOf('latitude_deg'),
      lng: head.indexOf('longitude_deg'),
      rows,
    };
  } catch {
    return null;
  }
})();

const isMissing = (point) =>
  !point ||
  !Number.isFinite(point.lat) ||
  !Number.isFinite(point.lng) ||
  (point.lat === 0 && point.lng === 0);

function coords(code) {
  if (handChecked[code] && !isMissing(handChecked[code])) return handChecked[code];
  const hit = worldAirports.find((row) => String(row[0]).toUpperCase() === code);
  if (hit && Number.isFinite(hit[6]) && Number.isFinite(hit[7])) {
    return { lat: hit[6], lng: hit[7] };
  }
  if (csvRows) {
    for (const line of csvRows.rows) {
      const cols = line.split(',');
      if ((cols[csvRows.iata] || '').replace(/"/g, '').toUpperCase() !== code) continue;
      const lat = Number(cols[csvRows.lat]);
      const lng = Number(cols[csvRows.lng]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0) return { lat, lng };
      break;
    }
  }
  return null;
}

// ------------------------------------------------------------------- tiles
function tileXY(lat, lng, zoom) {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

async function fetchTile(z, x, y, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await sleep(DELAY);
      const res = await fetch(
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
        { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30_000) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      // Ocean and empty-land tiles are still valid, very small JPEGs (~700 B);
      // only reject something that is not an image at all.
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer.subarray(1, 4).toString('ascii') === 'PNG';
      if (buffer.length < 200 || (!isJpeg && !isPng)) {
        throw new Error(`not an image tile (${buffer.length} bytes)`);
      }
      return buffer;
    } catch (error) {
      lastError = error;
      await sleep(600 * (attempt + 1));
    }
  }
  throw new Error(`tile ${z}/${x}/${y}: ${lastError.message}`);
}

async function render(airport, point) {
  const { x, y } = tileXY(point.lat, point.lng, ZOOM);
  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tx = x - Math.floor(COLS / 2) + col;
      const ty = y - Math.floor(ROWS / 2) + row;
      const input = await fetchTile(ZOOM, tx, ty);
      tiles.push({ input, left: col * TILE, top: row * TILE });
    }
  }

  const label = `${airport.name_en} (${airport.iata}) · satellite view · Imagery © Esri, Maxar, Earthstar Geographics`;
  const fontSize = label.length > 112 ? 13 : label.length > 96 ? 14 : 15;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
<rect x="0" y="${HEIGHT - LABEL_H}" width="${WIDTH}" height="${LABEL_H}" fill="rgba(0,0,0,0.58)"/>
<text x="16" y="${HEIGHT - 13}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" fill="#fff">${escapeXml(label)}</text>
</svg>`;

  return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: '#000' } })
    .composite([...tiles, { input: Buffer.from(svg), left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toBuffer();
}

// ------------------------------------------------------------------- main
const codesArg = value('--codes');
const fileArg = value('--codes-file');
let airports;
if (codesArg) {
  airports = await airportsFromCodes(
    codesArg.split(/[\s,;]+/).map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
} else if (fileArg) {
  airports = await airportsFromCodes(
    readFileSync(fileArg, 'utf8')
      .split(/[\s,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
  );
} else if (has('--missing')) {
  airports = await missingFromDb();
} else {
  throw new Error('Nothing to do: pass --missing, --codes or --codes-file');
}

console.log(`${airports.length} airport(s) in scope${DRY ? ' (dry run)' : ''}`);
if (DRY) {
  console.log(airports.map((a) => `${a.iata} (${a.name_en})`).join('\n'));
  process.exit(0);
}

let written = 0;
const failures = [];
for (const [index, airport] of airports.entries()) {
  const code = airport.iata;
  const label = `[${index + 1}/${airports.length}] ${code}`;
  const point = coords(code);
  if (!point) {
    failures.push(`${code}: no coordinates`);
    console.log(`${label} skipped — no coordinates`);
    continue;
  }
  try {
    const buffer = await render(airport, point);
    const file = `${code.toLowerCase()}-sat-1.webp`;
    const dir = join(PHOTOS, photoStem(code));
    mkdirSync(dir, { recursive: true });
    const outPath = join(dir, file);
    if (existsSync(outPath) && !FORCE) {
      console.log(`${label} already has ${file} (use --force to replace)`);
      continue;
    }
    writeFileSync(outPath, buffer);

    const entry = {
      file,
      width: WIDTH,
      height: HEIGHT,
      source: 'satellite',
      host: 'server.arcgisonline.com',
      pageUrl: ESRI_ITEM,
      imageUrl: TILE_URL,
      title: `Esri World Imagery — ${airport.name_en} (${code}) satellite view`,
      licenseFilter: 'Esri World Imagery — attribution required',
      query: '',
    };
    const entries = (manifest.airports[code] ?? []).filter((item) => item.file !== file);
    entries.push(entry);
    manifest.airports[code] = entries;
    writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

    const captionPath = join(CAPTIONS, `${photoStem(code)}.json`);
    const rows = existsSync(captionPath) ? readJson(captionPath, {}) : {};
    if (!rows[file] || FORCE) {
      rows._note ??=
        'Esri World Imagery satellite view; no verified ground photo has been published yet.';
      rows[file] = {
        zh: `从卫星图看，${airport.name}（${code}）的机场布局与周边环境清晰可辨。`,
        en: `In the satellite image, the layout of ${airport.name_en} (${code}) and its surroundings are clearly visible.`,
      };
      mkdirSync(CAPTIONS, { recursive: true });
      writeFileSync(captionPath, `${JSON.stringify(rows, null, 2)}\n`);
    }
    written++;
    console.log(`${label} ok — ${WIDTH}x${HEIGHT}, ${(buffer.length / 1024).toFixed(0)}KB`);
  } catch (error) {
    failures.push(`${code}: ${error.message}`);
    console.log(`${label} FAILED — ${error.message}`);
  }
}

console.log(`\n${written} satellite image(s) written`);
if (failures.length) {
  console.log(`${failures.length} failed:`);
  for (const line of failures) console.log(`  - ${line}`);
}
if (written > 0) {
  console.log('Now run: node scripts/build-photo-captions.mjs');
}
