/**
 * Fetches the airports-worldwide.com entry for each airport in a GSC export
 * CSV and stores the **raw source text** in scripts/airport-history.raw.json —
 * source material only; the published 「机场历史」 lines are written by hand
 * into scripts/airport-history.json (zh + en + source URL) and embedded by
 * scripts/generate-airport-guides.mjs.
 *
 * Why this source: its airport pages are a Wikipedia (CC BY-SA) mirror — the
 * prose carries real history ("built in 1942 as a Naval Air Station…") and the
 * tables carry objective facts (operator, elevation, runway lengths, passenger
 * statistics by year), and its site serves no robots.txt (all crawling
 * allowed). The other reachable Chinese encyclopedias all refuse automated
 * readers: baike.baidu.com answers 403, baike.sogou.com serves a JS challenge
 * on entry pages, baike.so.com switches to a captcha page after a few
 * requests; zh.wikipedia.org is unreachable from this network entirely.
 *
 * Site structure: homepage → country page → (USA only: state page) → entry.
 * Index pages are cached in scripts/airport-history.index-cache.json so a
 * resumed run does not refetch them.
 *
 * Usage:
 *   node scripts/fetch-airport-history.mjs --csv 表格.csv
 *   node scripts/fetch-airport-history.mjs --codes ABQ,AOJ --force
 *   node scripts/fetch-airport-history.mjs --csv 表格.csv --limit 20
 *
 * Exit code is 1 when at least one airport had no matching entry.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://www.airports-worldwide.com';
const RAW = join(ROOT, 'scripts', 'airport-history.raw.json');
const CACHE = join(ROOT, 'scripts', 'airport-history.index-cache.json');

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const withEq = args.find((a) => a.startsWith(`--${name}=`));
  if (withEq) return withEq.split('=').slice(1).join('=');
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};
const CSV = flag('csv');
const CODES = (flag('codes') || '').split(/[\s,;]+/).filter(Boolean).map((c) => c.toUpperCase());
const LIMIT = Number(flag('limit', '0'));
const DELAY = Number(flag('delay', '700'));
const FORCE = args.includes('--force');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** (name, absolute url) pairs from a country/state index page. */
function indexEntries(html, pageUrl) {
  const entries = [];
  const seen = new Set();
  for (const match of html.matchAll(/href="([^"#]+\.(?:php|htm|html))"[^>]*>([^<]{2,80})</g)) {
    let url;
    try {
      url = new URL(match[1], pageUrl);
    } catch {
      continue;
    }
    if (!/(^|\.)airports-worldwide\.com$/.test(url.host)) continue;
    const path = url.pathname.replace(/^\//, '');
    if (/^(css|images?|articles|about|contact|disclaimer|privacy|search|feedback)/i.test(path)) continue;
    const name = match[2].replace(/\s+/g, ' ').trim();
    if (!name || seen.has(url.href)) continue;
    seen.add(url.href);
    entries.push({ name, url: url.href });
  }
  return entries;
}

/** Normalized comparison form for airport names. */
const norm = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(international|regional|municipal|county|airports?|airfields?|field|air\s+base|airbase|and|the|机场)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Country names the two sides spell differently. The site's own page titles
 * carry the short form it files the country under (…/usa.html is "USA
 * Airports" while the DB says "United States"), so the aliases map our DB
 * spelling to the site's.
 */
const COUNTRY_ALIASES = {
  'united states': 'usa',
  'united kingdom': 'uk',
  turkiye: 'turkey',
  myanmar: 'burma',
  russia: 'russian federation',
  'south korea': 'korea',
  czechia: 'czech republic',
  'viet nam': 'vietnam',
  'cote divoire': 'ivory coast',
  'east timor': 'timor leste',
  laos: 'lao',
  macau: 'macao',
};

/** US state names for the site's state-page slugs, keyed by ISO 3166-2 suffix. */
const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  PR: 'Puerto Rico', VI: 'US Virgin Islands', GU: 'Guam', AS: 'American Samoa',
  MP: 'Northern Mariana Islands',
};

const tokens = (text) => new Set(norm(text).split(' ').filter((t) => t.length >= 3));

function overlap(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  let shared = 0;
  for (const token of left) if (right.has(token)) shared++;
  return shared;
}

/** Structured facts lifted from the entry's tables. */
function entryStats(text) {
  const pax = [];
  for (const match of text.matchAll(/(?:Passengers|旅客).{0,40}?\b(19|20)\d{2}\b[^\d]{0,40}([\d,]{3,})/g)) {
    pax.push({ year: match[0].match(/\b(19|20)\d{2}\b/)[0], value: Number(match[2].replace(/,/g, '')) });
  }
  const elevation = text.match(/Elevation\s+AMSL\s+([\d,]+)\s*ft\s*\/\s*([\d,]+)\s*m/i);
  const operator = text.match(/Operator\s+([A-Za-z][^|]{1,60}?)\s+(?:Serves|Elevation|Runways|Location)/i);
  const runways = [...text.matchAll(/\b(\d{2}[LCR]?\/\d{2}[LCR]?)\s+([\d,]+)\s+([\d,]+)\s+(Asphalt|Concrete|Grass|Gravel|Sand|Turf|Clay|Dirt|Paved)/gi)]
    .map((m) => ({ designator: m[1], lengthM: Number(m[2].replace(/,/g, '')), surface: m[4] }));
  return {
    ...(elevation ? { elevationFt: Number(elevation[1].replace(/,/g, '')), elevationM: Number(elevation[2].replace(/,/g, '')) } : {}),
    ...(operator ? { operator: operator[1].trim() } : {}),
    ...(pax.length ? { pax } : {}),
    ...(runways.length ? { runways } : {}),
  };
}

/** The Wikipedia-derived prose: from the first sentence after the summary tables.
    Long enough to reach the History section of the fuller articles (small
    fields carry a single lead paragraph and no more). */
function entryProse(html) {
  const text = stripTags(html);
  const marker = text.search(/\(IATA:\s*[A-Z]{3}[^)]*\)\s*is\s/);
  const body = marker >= 0 ? text.slice(marker) : text;
  return body.slice(0, 3200).trim();
}

function codesFromCsv(file) {
  const text = readFileSync(join(ROOT, file), 'utf8');
  const codes = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/\/airport\/([A-Za-z]{3})(?:,|\/|$)/);
    if (match) codes.add(match[1].toUpperCase());
  }
  return [...codes].sort();
}

// ------------------------------------------------------------------- state

const raw = existsSync(RAW)
  ? JSON.parse(readFileSync(RAW, 'utf8'))
  : { note: 'Raw airports-worldwide.com (Wikipedia CC BY-SA mirror) extracts; source material for scripts/airport-history.json. Not published.', airports: {} };
raw.airports ??= {};
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { pages: {} };

/** Fetches an index page once and caches its entries. */
async function index(url) {
  const hit = cache.pages[url];
  if (hit?.entries?.length) return hit.entries;
  const entries = indexEntries(await get(url), url);
  cache.pages[url] = { fetchedAt: new Date().toISOString().slice(0, 10), entries };
  writeFileSync(CACHE, `${JSON.stringify(cache, null, 2)}\n`);
  await sleep(DELAY);
  return entries;
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
let codes = CODES.length > 0 ? CODES : CSV ? codesFromCsv(CSV) : [];
if (!codes.length) throw new Error('pass --csv <file> or --codes A,B');
const { rows } = await client.query(
  'SELECT iata, name, name_en, city_en, country_code FROM airports WHERE iata = ANY($1)',
  [codes]
);
const names = new Map(rows.map((row) => [row.iata.toUpperCase(), row]));
const countryPages = await client.query('SELECT code, name_en FROM countries');
const countryName = new Map(countryPages.rows.map((row) => [row.code.toUpperCase(), row.name_en]));
await client.end();

/** IATA → ISO region ("US-NM") from the world-airports dump, for the US state pages. */
const regions = (() => {
  try {
    const lines = readFileSync(join(ROOT, 'data', 'world-airports.csv'), 'utf8').split(/\r?\n/);
    const head = lines[0].split(',');
    const iIata = head.indexOf('iata_code');
    const iRegion = head.indexOf('iso_region');
    const map = new Map();
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      const code = (cols[iIata] || '').replace(/"/g, '').toUpperCase();
      if (code && !map.has(code)) map.set(code, (cols[iRegion] || '').replace(/"/g, ''));
    }
    return map;
  } catch {
    return new Map();
  }
})();

if (LIMIT) codes = codes.slice(0, LIMIT);
const todo = codes.filter((code) => FORCE || !raw.airports[code]?.prose);
console.log(`${codes.length} code(s) in scope, ${todo.length} to fetch`);

// Country → index URL, from the homepage's own country list.
let countryIndex = null;
async function countryUrl(name) {
  if (!countryIndex) {
    countryIndex = indexEntries(await get(`${BASE}/`), `${BASE}/`);
    await sleep(DELAY);
  }
  const want = COUNTRY_ALIASES[norm(name)] ?? norm(name);
  // Whole-word containment only: a raw substring test sent "India" to the
  // British Indian Ocean Territory page ("india" sits inside "indian").
  const contains = (haystack, needle) => {
    if (!needle) return false;
    const pattern = new RegExp(`(^|\\s)${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
    return pattern.test(haystack);
  };
  let best = null;
  for (const entry of countryIndex) {
    const have = norm(entry.name);
    if (!have) continue;
    const score = have === want ? 3 : contains(have, want) || contains(want, have) ? 1 : 0;
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  return best?.entry?.url ?? null;
}

const missing = [];
let found = 0;
for (const [i, code] of todo.entries()) {
  const row = names.get(code);
  if (!row) {
    missing.push(`${code}: not in the DB`);
    continue;
  }
  try {
    const country = countryName.get((row.country_code || '').toUpperCase()) || '';
    const countryPage = await countryUrl(country);
    if (!countryPage) throw new Error(`no country page for "${country}"`);

    let candidates = await index(countryPage);
    // The USA splits into state pages; the airport's ISO region opens the one
    // right state directly. (Detected from the country rather than the page
    // contents: the country page carries a few non-state links, so a
    // "everything looks like a state" test never fires.)
    if ((row.country_code || '').toUpperCase() === 'US') {
      const region = (regions.get(code) || '').split('-')[1] || '';
      const stateName = US_STATES[region];
      const stateEntry = stateName
        ? candidates.find((entry) => norm(entry.name) === norm(stateName))
        : null;
      const states = stateEntry ? [stateEntry] : candidates.slice(0, 8);
      candidates = [];
      for (const state of states) candidates.push(...(await index(state.url)));
    }

    // The city is the strongest signal for small fields: the DB's name_en and
    // the encyclopedia's entry title often disagree entirely ("Sardar
    // Vallabhbhai Patel International Airport" is filed as "Ahmedabad").
    const ranked = candidates
      .map((entry) => ({
        entry,
        score: 3 * overlap(entry.name, row.city_en || '') + 2 * overlap(entry.name, row.name_en || row.name),
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score);

    let entryResult = null;
    for (const candidate of ranked.slice(0, 4)) {
      const html = await get(candidate.entry.url);
      await sleep(DELAY);
      const text = stripTags(html);
      const iata = (text.match(/IATA:\s*([A-Z]{3})/) || [])[1];
      if (iata !== code) continue;
      entryResult = {
        title: candidate.entry.name,
        url: candidate.entry.url,
        fetchedAt: new Date().toISOString().slice(0, 10),
        iata,
        stats: entryStats(text),
        prose: entryProse(html),
      };
      break;
    }
    if (!entryResult) throw new Error('no entry for this code');

    raw.airports[code] = entryResult;
    found++;
    writeFileSync(RAW, `${JSON.stringify(raw, null, 2)}\n`);
    console.log(`[${i + 1}/${todo.length}] ${code} ${row.name_en || row.name}: ${entryResult.title} (${entryResult.prose.length} chars${entryResult.stats.pax?.length ? `, ${entryResult.stats.pax.length} pax point(s)` : ''})`);
  } catch (err) {
    // One bad airport must not stop the run — report and continue.
    missing.push(`${code}: ${err.message}`);
    console.log(`[${i + 1}/${todo.length}] ${code} ${row.name_en || row.name}: ${err.message}`);
  }
}

console.log(`\n${found} entr(ies) fetched, ${todo.length - found} without`);
if (missing.length) {
  console.log(missing.slice(0, 80).join('\n'));
  if (missing.length > 80) console.log(`… and ${missing.length - 80} more`);
}
console.log('\nNext: write scripts/airport-history.json from these extracts, then run');
console.log('  node scripts/generate-airport-guides.mjs --refresh --codes …');
process.exitCode = missing.length > 0 ? 1 : 0;
