/**
 * Builds data/flights.json.gz from aviability.com's flight sitemaps.
 *
 * The site publishes every flight-number page in sitemaps under /sm/:
 *
 *   - `updated-flights-en.xml.gz` — the flights whose pages changed most
 *     recently, each with a <lastmod>, so it also dates the snapshot.
 *   - `_flight-en-NN.xml.gz` — the complete flight index (18 parts, reached
 *     through `_sitemap-index-en.xml.gz`), without timestamps.
 *
 * A flight URL carries everything the pages need: the marketing flight number,
 * the airline slug and the origin/destination pair. Codeshare numbers are part
 * of that index, so one route can carry numbers from several airlines. There
 * are no departure times in the sitemaps, so the pages present flight numbers
 * and routes, never a timetable.
 *
 * Only flights touching an airport the directory covers are kept (either end
 * of the journey). Everything else is thrown away, which keeps the directory
 * from shipping the full ~560k-flight index.
 *
 * The output is one gzipped JSON document:
 *
 *   {
 *     source, sourceUrl, license, generatedAt, dataDate,
 *     updatedFeedDate, fullIndexDate,
 *     airlines: { slug: display name },
 *     airports: { IATA: { departures, arrivals } },
 *     totals: { ... },
 *     flights: [[number, airline, origin, destination], ...]
 *   }
 *
 * Every route appears exactly once, sorted by flight number, origin, destination
 * and airline. That single order serves both readers: an airport board filters
 * the records where the airport is one end, and `/flight/<number>` filters by
 * number, so neither needs its own copy. The compressed file is about 2.4 MB for
 * the current 500-airport directory, against ~5.9 MB for the old per-airport
 * files plus number shards; lib/flight-store.ts parses it once per server
 * process and indexes it in memory.
 *
 * Usage:
 *   node scripts/fetch-flights.mjs
 *
 * The full index is the baseline snapshot; the updated feed adds the flight
 * pages revised since it and dates the combined snapshot. Both are needed on
 * every run: writing only the updated feed would leave most airports without a
 * file, so the script always rebuilds the whole dataset.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { ROOT } from './_env.mjs';

const BASE = 'https://aviability.com/sm/';
const UPDATED = 'updated-flights-en.xml.gz';
const INDEX = '_sitemap-index-en.xml.gz';
const OUT_DIR = join(ROOT, 'data');
const OUT_FILE = join(OUT_DIR, 'flights.json.gz');
/** Pre-consolidation layout: one file per airport plus a numbers/ shard tree. */
const LEGACY_DIR = join(OUT_DIR, 'flights');
const FACTS = join(ROOT, 'lib', 'airport-facts.json');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/** `https://aviability.com/en/flight/nh693-ana-all-nippon-airways/hnd-ubj` */
const FLIGHT_URL_RE =
  /^https:\/\/aviability\.com\/en\/flight\/([a-z0-9]+)-([a-z0-9-]+)\/([a-z]{3})-([a-z]{3})$/;
const LOC_RE = /<loc>([^<]+)<\/loc>/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const today = new Date().toISOString().slice(0, 10);

/**
 * Airline slugs are lower-case URL fragments of the airline name. Title-casing
 * them gets most names right; the map below fixes the brand spellings that
 * title case would break (ANA, KLM, airBaltic, ...).
 */
const AIRLINE_NAMES = new Map([
  ['aerolineas-argentinas', 'Aerolíneas Argentinas'],
  ['aeromexico', 'Aeroméxico'],
  ['air-algerie', 'Air Algérie'],
  ['airasia', 'AirAsia'],
  ['airasia-cambodia', 'AirAsia Cambodia'],
  ['airasia-x', 'AirAsia X'],
  ['airbaltic', 'airBaltic'],
  ['aircalin', 'Aircalin'],
  ['airnorth', 'Airnorth'],
  ['air-do', 'Air Do'],
  ['air-europa', 'Air Europa'],
  ['air-new-zealand', 'Air New Zealand'],
  ['air-tahiti-nui', 'Air Tahiti Nui'],
  ['ana-all-nippon-airways', 'ANA All Nippon Airways'],
  ['boliviana-de-aviacion', 'Boliviana de Aviación'],
  ['breeze-airways', 'Breeze Airways'],
  ['cebgo', 'Cebgo'],
  ['cebu-pacific', 'Cebu Pacific'],
  ['citilink', 'Citilink'],
  ['delta', 'Delta Air Lines'],
  ['easyjet', 'easyJet'],
  ['flynas', 'flynas'],
  ['indigo', 'IndiGo'],
  ['ita-airways', 'ITA Airways'],
  ['jal', 'JAL'],
  ['jetblue', 'JetBlue'],
  ['klm', 'KLM'],
  ['latam-airlines-group', 'LATAM Airlines Group'],
  ['lot-polish-airlines', 'LOT Polish Airlines'],
  ['sas-scandinavian-airlines', 'SAS Scandinavian Airlines'],
  ['tap-air-portugal', 'TAP Air Portugal'],
  ['uia', 'UIA'],
  ['westjet', 'WestJet'],
  ['wizz-air', 'Wizz Air'],
]);

/** Words that are acronyms even in an otherwise ordinary hyphenated name. */
const ACRONYM_WORDS = new Set(['ana', 'klm', 'sas', 'ita', 'tap', 'jal', 'lot', 'uia', 'asl', 'atr']);

function airlineName(slug) {
  const known = AIRLINE_NAMES.get(slug);
  if (known) return known;
  return slug
    .split('-')
    .map((word) =>
      ACRONYM_WORDS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

async function fetchGzip(name, { optional = false } = {}) {
  const url = `${BASE}${name}`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/gzip,*/*' },
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8');
    } catch (error) {
      if (attempt === 3) {
        if (optional) {
          console.warn(`  ! ${name}: ${error.message}`);
          return null;
        }
        throw error;
      }
      await sleep(1000 * attempt);
    }
  }
  return null;
}

/** Runs `fn` over `items` with at most `limit` requests in flight. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const directoryCodes = new Set(Object.keys(JSON.parse(readFileSync(FACTS, 'utf8')).airports));
console.log(`Directory airports: ${directoryCodes.size}`);

/** Deduplicated flights touching the directory: KEY -> [number, airline, origin, dest]. */
const flights = new Map();
let parsedUrls = 0;
let keptUrls = 0;

function addFlight(number, airline, origin, dest) {
  parsedUrls += 1;
  const o = origin.toUpperCase();
  const d = dest.toUpperCase();
  if (!directoryCodes.has(o) && !directoryCodes.has(d)) return;
  const key = `${o}|${number.toUpperCase()}|${d}`;
  if (!flights.has(key)) {
    flights.set(key, [number.toUpperCase(), airline, o, d]);
    keptUrls += 1;
  }
}

/** Parses one sitemap document and adds its flights. */
function ingest(xml) {
  for (const match of xml.matchAll(LOC_RE)) {
    const parsed = FLIGHT_URL_RE.exec(match[1]);
    if (!parsed) continue;
    addFlight(parsed[1], parsed[2], parsed[3], parsed[4]);
  }
}

let dataDate = today;
let updatedLastmod = null;
let fullIndexDate = null;

console.log(`Downloading ${UPDATED}...`);
const updatedXml = await fetchGzip(UPDATED);
ingest(updatedXml);
const updatedDates = [...updatedXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) =>
  m[1].slice(0, 10)
);
if (updatedDates.length) {
  updatedLastmod = [...updatedDates].sort().pop();
  console.log(
    `  ${updatedDates.length.toLocaleString('en-US')} updated entries, newest ${updatedLastmod}`
  );
}

console.log(`Downloading ${INDEX}...`);
const indexXml = await fetchGzip(INDEX);
const parts = [...indexXml.matchAll(LOC_RE)]
  .map((m) => m[1])
  .filter((url) => /\/_flight-en-\d+\.xml\.gz$/.test(url));
const indexDates = [...indexXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) =>
  m[1].slice(0, 10)
);
fullIndexDate = indexDates.sort().pop() ?? null;
console.log(`  ${parts.length} flight maps${fullIndexDate ? `, dated ${fullIndexDate}` : ''}`);

let done = 0;
await mapLimit(parts, 6, async (url) => {
  const file = url.slice(url.lastIndexOf('/') + 1);
  const xml = await fetchGzip(file);
  ingest(xml);
  done += 1;
  process.stdout.write(`  ${done}/${parts.length} ${file}\r`);
});
process.stdout.write('\n');

if (flights.size === 0) {
  console.error('No flights matched the directory; nothing written.');
  process.exit(1);
}

// The newest signal wins: the updated feed's lastmod, else the index's date.
const dates = [updatedLastmod, fullIndexDate].filter(Boolean).sort();
if (dates.length) dataDate = dates.pop();

console.log(
  `Kept ${keptUrls.toLocaleString('en-US')} of ${parsedUrls.toLocaleString('en-US')} flight URLs ` +
    `(data date ${dataDate})`
);

/**
 * One order for the whole snapshot. For an airport board, filtering a fixed
 * origin leaves number → destination → airline (the old departures order), and
 * filtering a fixed destination leaves number → origin → airline (the old
 * arrivals order). For a flight number, it leaves origin → destination →
 * airline, which is the route order the flight pages used before.
 */
const sortedFlights = [...flights.values()].sort(
  (a, b) =>
    a[0].localeCompare(b[0], 'en', { numeric: true }) ||
    a[2].localeCompare(b[2]) ||
    a[3].localeCompare(b[3]) ||
    a[1].localeCompare(b[1])
);

/** Per-airport board counts, the airline display names and the number count. */
const airportCounts = new Map();
const airlines = new Map();
const numbers = new Set();
let departureTotal = 0;
let arrivalTotal = 0;

for (const [number, airline, origin, destination] of sortedFlights) {
  numbers.add(number);
  airlines.set(airline, airlineName(airline));

  if (directoryCodes.has(origin)) {
    const bucket = airportCounts.get(origin) ?? { departures: 0, arrivals: 0 };
    bucket.departures += 1;
    departureTotal += 1;
    airportCounts.set(origin, bucket);
  }
  if (directoryCodes.has(destination)) {
    const bucket = airportCounts.get(destination) ?? { departures: 0, arrivals: 0 };
    bucket.arrivals += 1;
    arrivalTotal += 1;
    airportCounts.set(destination, bucket);
  }
}

const metaAirports = Object.fromEntries(
  [...airportCounts.entries()].sort(([a], [b]) => a.localeCompare(b))
);

// Write the new snapshot first, then swap it in. Only once the file is in place
// is the pre-consolidation directory removed, so a failed refresh leaves the
// previous dataset usable.
mkdirSync(OUT_DIR, { recursive: true });
const payload = {
  source: 'aviability.com',
  sourceUrl: 'https://aviability.com/sm/updated-flights-en.xml.gz',
  license: 'Flight-number index published by aviability.com',
  generatedAt: today,
  dataDate,
  updatedFeedDate: updatedLastmod,
  fullIndexDate,
  airlines: Object.fromEntries([...airlines.entries()].sort(([a], [b]) => a.localeCompare(b))),
  airports: metaAirports,
  totals: {
    airports: Object.keys(metaAirports).length,
    airlines: airlines.size,
    flights: departureTotal + arrivalTotal,
    departures: departureTotal,
    arrivals: arrivalTotal,
    numbers: numbers.size,
    routes: sortedFlights.length,
  },
  flights: sortedFlights,
};

const gz = gzipSync(`${JSON.stringify(payload)}\n`, { level: 9 });
const tempFile = `${OUT_FILE}.tmp`;
writeFileSync(tempFile, gz);
renameSync(tempFile, OUT_FILE);

// A checkout that still carries the old per-airport layout would otherwise keep
// ~990 stale files next to the new dataset.
if (existsSync(LEGACY_DIR)) rmSync(LEGACY_DIR, { recursive: true, force: true });

console.log(
  `Wrote data/flights.json.gz (${(gz.length / 1e6).toFixed(2)} MB) · ` +
    `${Object.keys(metaAirports).length} airports · ` +
    `${departureTotal.toLocaleString('en-US')} departures · ` +
    `${arrivalTotal.toLocaleString('en-US')} arrivals · ${airlines.size} airlines · ` +
    `${numbers.size.toLocaleString('en-US')} flight numbers · ` +
    `${sortedFlights.length.toLocaleString('en-US')} routes`
);
