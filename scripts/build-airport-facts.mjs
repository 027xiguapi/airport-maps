/**
 * Compiles lib/airport-facts.json — the per-airport hard facts (ICAO code,
 * airport class, elevation, en-Wikipedia article, coordinates) the airport
 * pages use for the answer-first lead sentence, schema.org sameAs/geo/citation
 * and the directory-batch descriptions.
 *
 * Everything comes from repo files, nothing is fetched:
 *   - data/world-airports.csv       OurAirports export: icao_code, type,
 *                                   elevation_ft, wikipedia_link, coordinates,
 *                                   scheduled_service
 *   - scripts/directory-data.json   curated icao / kind for the batch airports
 *                                   (also covers the 12 the CSV export lacks)
 *   - scripts/airport-coords.json   hand-checked coordinates fallback
 *   - scripts/legacy-data.json      the editorial airport list
 *
 * Usage: node scripts/build-airport-facts.mjs
 * Afterwards: npm run typecheck (the JSON is imported by lib/airport-facts.ts).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const legacy = read('scripts/legacy-data.json');
const directory = read('scripts/directory-data.json');
const handCoords = read('scripts/airport-coords.json');

/** Every airport the site carries a row for. */
const codes = [...new Set([...legacy.airports, ...directory.airports].map((a) => a.iata))];

/** Minimal quoted-CSV line parser (the source has commas inside quotes). */
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const CSV = join(ROOT, 'data', 'world-airports.csv');
const lines = readFileSync(CSV, 'utf8').split(/\r?\n/);
const col = {};
parseLine(lines[0]).forEach((name, i) => (col[name] = i));

/**
 * One CSV row per IATA code: the most authoritative record wins — a scheduled
 * large airport beats an unscheduled small field that shares the code (the
 * KAAA/AAA case in OurAirports).
 */
const TYPE_RANK = { large_airport: 3, medium_airport: 2, small_airport: 1, heliport: 1 };
const csvRecord = (c) => ({
  type: c[col.type],
  icao: c[col.icao_code] || undefined,
  elev: c[col.elevation_ft] === '' ? undefined : Number(c[col.elevation_ft]),
  wiki: /^https?:\/\/en\.wikipedia\.org\/wiki\/\S+$/.test(c[col.wikipedia_link])
    ? c[col.wikipedia_link]
    : undefined,
  scheduled: c[col.scheduled_service] === '1' ? true : c[col.scheduled_service] === '0' ? false : undefined,
  lat: c[col.latitude_deg] === '' ? undefined : Number(c[col.latitude_deg]),
  lng: c[col.longitude_deg] === '' ? undefined : Number(c[col.longitude_deg]),
});
const csvIndex = new Map();
/** A curated ICAO is authoritative when an IATA code has been reused. */
const csvByIcao = new Map();
for (let i = 1; i < lines.length; i++) {
  if (!lines[i]) continue;
  const c = parseLine(lines[i]);
  const rec = csvRecord(c);
  if (rec.icao && !csvByIcao.has(rec.icao)) csvByIcao.set(rec.icao, rec);
  const iata = c[col.iata_code];
  if (!/^[A-Z]{3}$/.test(iata)) continue;
  const rank = (TYPE_RANK[c[col.type]] ?? 0) * 10 + (c[col.scheduled_service] === '1' ? 1 : 0);
  const prev = csvIndex.get(iata);
  if (prev && prev.rank > rank) continue;
  csvIndex.set(iata, { ...rec, rank });
}

/**
 * Coordinates/elevation fallback for airports with no IATA match in the CSV
 * (OurAirports leaves `iata_code` empty for a handful of fields we still
 * carry): look the row up by its ICAO/ident codes instead. Only these two
 * fields are taken from an ident match — class, service and the Wikipedia
 * article stay tied to an exact IATA match.
 */
const identIndex = new Map();
for (let i = 1; i < lines.length; i++) {
  if (!lines[i]) continue;
  const c = parseLine(lines[i]);
  if (c[col.type] === 'closed') continue;
  const keys = [c[col.icao_code], c[col.gps_code], c[col.ident]].filter((k) => /^[A-Z0-9]{4}$/.test(k));
  for (const key of keys) {
    if (!identIndex.has(key)) {
      identIndex.set(key, {
        elev: c[col.elevation_ft] === '' ? undefined : Number(c[col.elevation_ft]),
        lat: c[col.latitude_deg] === '' ? undefined : Number(c[col.latitude_deg]),
        lng: c[col.longitude_deg] === '' ? undefined : Number(c[col.longitude_deg]),
      });
    }
  }
}

const CSV_TYPE = {
  large_airport: 'large',
  medium_airport: 'medium',
  small_airport: 'small',
  heliport: 'heliport',
};

/**
 * Airports whose OurAirports `scheduled_service` flag is stale. Green Island
 * (GNI), Qimei (CMJ) and Wang'an (WOT) are on Daily Air's DHC-6 island network
 * — Taitung–Green Island, Taitung–Orchid Island, Kaohsiung/Magong–Qimei and
 * Magong–Wang'an — but the 2018 dump files them as unscheduled. The flag feeds
 * the "no scheduled passenger service" clause in descriptions and guides, so a
 * wrong `false` is worse than the override. (Magong Airport Authority publishes
 * the Qimei/Wang'an domestic timetable.) Remove an entry once the dump is
 * refreshed.
 */
const SCHEDULED_OVERRIDE = new Set(['GNI', 'CMJ', 'WOT']);
const round4 = (v) => Math.round(v * 10000) / 10000;
const dirIndex = new Map(directory.airports.map((a) => [a.iata, a]));

const out = {};
const stats = { type: 0, icao: 0, elevFt: 0, wikiEn: 0, lat: 0, scheduled: 0 };
for (const iata of codes.sort()) {
  const exact = csvIndex.get(iata);
  const dir = dirIndex.get(iata);
  // A reused IATA (GOY is Tura in OurAirports, Ampara in this directory) must
  // not overwrite facts for the airport the curated ICAO identifies.
  const csv =
    exact && (!dir?.icao || exact.icao === dir.icao)
      ? exact
      : csvByIcao.get(dir?.icao) ?? exact;
  const hand = handCoords[iata];
  const byIdent = identIndex.get(dir?.icao ?? csv?.icao);
  const lat = csv?.lat ?? byIdent?.lat ?? hand?.lat;
  const lng = csv?.lng ?? byIdent?.lng ?? hand?.lng;
  const type = dir?.kind ?? CSV_TYPE[csv?.type] ?? undefined;
  const facts = {
    type,
    icao: dir?.icao || csv?.icao,
    elevFt: csv?.elev ?? byIdent?.elev,
    wikiEn: csv?.wiki,
    lat: lat != null && lng != null ? round4(lat) : undefined,
    lng: lat != null && lng != null ? round4(lng) : undefined,
    // undefined when no source says either way, so copy never claims scheduled
    // service for an airfield that has none.
    scheduled: SCHEDULED_OVERRIDE.has(iata) ? true : csv?.scheduled,
  };
  for (const k of Object.keys(facts)) {
    if (facts[k] === undefined) delete facts[k];
    else stats[k] += 1;
  }
  out[iata] = facts;
}

writeFileSync(
  join(ROOT, 'lib', 'airport-facts.json'),
  JSON.stringify(
    {
      note:
        'Per-airport hard facts compiled by scripts/build-airport-facts.mjs from data/world-airports.csv, ' +
        'scripts/directory-data.json and scripts/airport-coords.json. Do not edit by hand.',
      airports: out,
    },
    null,
    0
  ) + '\n'
);

console.log(`airports: ${codes.length}`);
console.log(
  `coverage — type ${stats.type}, icao ${stats.icao}, elevFt ${stats.elevFt}, en-wiki ${stats.wikiEn}, coords ${stats.lat}, scheduled ${stats.scheduled}`
);
const missing = ['icao', 'lat'].map((k) => codes.filter((c) => out[c][k] === undefined).length);
console.log(`missing icao ${missing[0]}, missing coords ${missing[1]}`);
