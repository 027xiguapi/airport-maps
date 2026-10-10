/**
 * Builds the per-country airport lists behind the "airport distribution" block
 * on /country/<CC>: the full national list, the "how many airports" answers and
 * the input for scripts/generate-country-maps.mjs.
 *
 * Source: data/world-airports.csv — the same OurAirports-style dump
 * `prepare-world-airports.mjs` distills for the homepage map. Unlike that
 * script this keeps small airports too (the questions are "X 有多少座机场" /
 * "how many airports does X have", not "which big hubs"), and it keeps each
 * country's English name so the map renderer can match Natural Earth outlines
 * by name.
 *
 * Airports this site covers (scripts/legacy-data.json + directory-data.json)
 * are cross-checked against the result: a site airport the dump misses (stale
 * scheduled_service flag, a code the 2018 dump predates) is merged back in with
 * coordinates when the CSV or scripts/airport-coords.json can supply them.
 *
 * Output: scripts/country-airports.json — committed on purpose; lib/
 * country-airports.ts reads it at request time and the map script at build
 * time. Runtime file reads from `scripts/` already have precedent
 * (lib/map-images.ts reads map-file-aliases.json the same way).
 *
 * Usage: node scripts/build-country-airports.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

const SRC = join(ROOT, 'data', 'world-airports.csv');
const OUT = join(ROOT, 'scripts', 'country-airports.json');

/** Minimal quoted-CSV line parser (the source has commas inside quotes). */
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const TYPE = {
  large_airport: 'large',
  medium_airport: 'medium',
  small_airport: 'small',
};

const round4 = (v) => Math.round(Number(v) * 10000) / 10000;

const raw = readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);
const head = parseLine(lines[0]);
const col = {};
head.forEach((name, i) => (col[name] = i));

/** iso -> country name, from any row (the dump repeats it on every airport). */
const countryNames = new Map();
/** iata -> row, unfiltered, so site airports a filter drops can still be found. */
const byIata = new Map();
/** iso -> Map(iata -> airport), the filtered lists under construction. */
const countries = new Map();

for (let i = 1; i < lines.length; i++) {
  if (!lines[i]) continue;
  const c = parseLine(lines[i]);
  const iata = c[col.iata_code];
  const iso = (c[col.iso_country] || '').toUpperCase();
  const type = TYPE[c[col.type]];
  const lat = round4(c[col.latitude_deg]);
  const lng = round4(c[col.longitude_deg]);

  if (iso && !countryNames.has(iso)) countryNames.set(iso, c[col.country_name] || '');
  if (/^[A-Z]{3}$/.test(iata) && !byIata.has(iata)) {
    byIata.set(iata, {
      iata,
      name: c[col.name] || iata,
      city: c[col.municipality] || '',
      type: type ?? 'small',
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    });
  }

  if (!/^[A-Z]{3}$/.test(iata) || !iso || !type) continue;
  if (c[col.scheduled_service] !== '1') continue;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

  if (!countries.has(iso)) countries.set(iso, new Map());
  const list = countries.get(iso);
  // One entry per IATA code; a better (larger) type wins on duplicates.
  const prev = list.get(iata);
  const rank = { large: 0, medium: 1, small: 2 };
  if (!prev || rank[type] < rank[prev.type]) {
    list.set(iata, { iata, name: c[col.name] || iata, city: c[col.municipality] || '', type, lat, lng });
  }
}

// ------------------------------------------------- merge the site's airports
const extraCoords = (() => {
  try {
    const file = JSON.parse(readFileSync(join(ROOT, 'scripts', 'airport-coords.json'), 'utf8'));
    return Object.fromEntries(
      Object.entries(file).filter(([code, v]) => /^[A-Z]{3}$/.test(code) && v && typeof v.lat === 'number')
    );
  } catch {
    return {};
  }
})();

const siteAirports = [
  ...JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8')).airports.map((a) => ({
    iata: a.iata,
    country: a.country,
  })),
  ...JSON.parse(readFileSync(join(ROOT, 'scripts', 'directory-data.json'), 'utf8')).airports.map((a) => ({
    iata: a.iata,
    country: a.country,
  })),
];

const merged = [];
for (const a of siteAirports) {
  const iso = (a.country || '').toUpperCase();
  if (!iso) continue;
  const list = countries.get(iso) ?? new Map();
  countries.set(iso, list);
  if (list.has(a.iata)) continue;
  const row = byIata.get(a.iata);
  const coord = extraCoords[a.iata];
  const entry = {
    iata: a.iata,
    name: row?.name ?? a.iata,
    city: row?.city ?? '',
    type: row?.type ?? 'medium',
    lat: row?.lat ?? (coord ? round4(coord.lat) : null),
    lng: row?.lng ?? (coord ? round4(coord.lng) : null),
  };
  list.set(a.iata, entry);
  merged.push(`${a.iata} (${iso}${row ? '' : ', not in CSV'})`);
}

// ------------------------------------------------------------------- output
const rank = { large: 0, medium: 1, small: 2 };
const out = {};
for (const [iso, list] of [...countries.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const airports = [...list.values()].sort(
    (a, b) => rank[a.type] - rank[b.type] || a.name.localeCompare(b.name)
  );
  out[iso] = { name: countryNames.get(iso) ?? '', total: airports.length, airports };
}

const payload = {
  source: 'OurAirports via data/world-airports.csv — airports with a scheduled-service flag, IATA code and coordinates (large/medium/small).',
  generated: new Date().toISOString().slice(0, 10),
  countries: out,
};

writeFileSync(OUT, JSON.stringify(payload));

const withData = Object.values(out);
const total = withData.reduce((sum, c) => sum + c.total, 0);
const big = Object.entries(out)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 12)
  .map(([iso, c]) => `${iso} ${c.total}`)
  .join(', ');
console.log(`wrote ${OUT.replace(ROOT, '.')}`);
console.log(`${withData.length} countries, ${total} airports total`);
console.log(`largest: ${big}`);
if (merged.length) console.log(`merged ${merged.length} site airport(s) missing from the filtered dump: ${merged.join(', ')}`);
