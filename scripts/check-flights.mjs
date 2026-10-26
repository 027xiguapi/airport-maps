/**
 * Validates the consolidated flight dataset behind the airport and flight pages.
 *
 * `data/flights.json.gz` is produced by scripts/fetch-flights.mjs and read at
 * request time, so a broken or half-written refresh would show up as wrong
 * counts or a missing board rather than a build error. This checker catches that
 * before a deploy:
 *
 *   - the document parses and carries the expected metadata;
 *   - every airline slug has a display name, and every flight tuple is valid
 *     (flight number, known airline, IATA codes, at least one directory end);
 *   - no route is duplicated, and the array is in the documented order;
 *   - the per-airport counts and the global totals match the actual records.
 *
 * Usage: node scripts/check-flights.mjs [--verbose]
 * Exit code 1 when an error is found; warnings do not fail the run.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { ROOT } from './_env.mjs';

const FILE = join(ROOT, 'data', 'flights.json.gz');
const verbose = process.argv.includes('--verbose');

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const facts = JSON.parse(readFileSync(join(ROOT, 'lib', 'airport-facts.json'), 'utf8')).airports;
const directoryCodes = new Set(Object.keys(facts));

let data;
try {
  data = JSON.parse(gunzipSync(readFileSync(FILE)).toString('utf8'));
} catch (error) {
  console.error(`ERROR data/flights.json.gz: cannot read/gunzip/parse (${error.message})`);
  process.exit(1);
}

if (!data || typeof data !== 'object' || Array.isArray(data)) {
  console.error('ERROR data/flights.json.gz: top level is not an object');
  process.exit(1);
}

for (const key of ['source', 'sourceUrl', 'license', 'generatedAt', 'dataDate']) {
  if (typeof data[key] !== 'string' || !data[key].trim()) {
    fail(`${key}: expected a non-empty string`);
  }
}
for (const key of ['updatedFeedDate', 'fullIndexDate']) {
  if (data[key] != null && !/^\d{4}-\d{2}-\d{2}$/.test(data[key])) {
    fail(`${key}: invalid date ${JSON.stringify(data[key])}`);
  }
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dataDate ?? '')) {
  fail(`dataDate: invalid date ${JSON.stringify(data.dataDate)}`);
}
if (!data.airlines || typeof data.airlines !== 'object' || Array.isArray(data.airlines)) {
  fail('airlines: expected an object');
}
if (!data.airports || typeof data.airports !== 'object' || Array.isArray(data.airports)) {
  fail('airports: expected an object');
}
if (!Array.isArray(data.flights) || data.flights.length === 0) {
  fail('flights: expected a non-empty array');
}
if (!data.totals || typeof data.totals !== 'object' || Array.isArray(data.totals)) {
  fail('totals: expected an object');
}

const airlines = data.airlines && typeof data.airlines === 'object' ? data.airlines : {};
const airports = data.airports && typeof data.airports === 'object' ? data.airports : {};
const flights = Array.isArray(data.flights) ? data.flights : [];

for (const [slug, name] of Object.entries(airlines)) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`airlines: bad slug ${JSON.stringify(slug)}`);
  if (typeof name !== 'string' || !name.trim()) {
    fail(`airlines: ${slug} has no display name`);
  }
}

const airportCodes = new Set(Object.keys(airports));
for (const [code, counts] of Object.entries(airports)) {
  if (!/^[A-Z]{3}$/.test(code)) fail(`airports: bad IATA code ${JSON.stringify(code)}`);
  if (!directoryCodes.has(code)) {
    warn(`${code}: airport entry is not in lib/airport-facts.json`);
  }
  if (!counts || typeof counts !== 'object') {
    fail(`${code}: counts are not an object`);
    continue;
  }
  for (const direction of ['departures', 'arrivals']) {
    if (!Number.isInteger(counts[direction]) || counts[direction] < 0) {
      fail(`${code}: ${direction} is not a non-negative integer`);
    }
  }
}

/**
 * The snapshot order: number (numeric), origin, destination, airline. Both the
 * airport boards and the flight pages rely on it for their display order.
 */
const compareRows = (a, b) =>
  a[0].localeCompare(b[0], 'en', { numeric: true }) ||
  a[2].localeCompare(b[2]) ||
  a[3].localeCompare(b[3]) ||
  a[1].localeCompare(b[1]);

const boardCounts = new Map(
  [...airportCodes].map((code) => [code, { departures: 0, arrivals: 0 }])
);
const seenRoutes = new Set();
const numbers = new Set();
const slugUse = new Map();
let departureTotal = 0;
let arrivalTotal = 0;
let outOfOrder = 0;
let previousComparable = false;
let previous = null;

for (let index = 0; index < flights.length; index += 1) {
  const row = flights[index];
  const label = `flights[${index}]`;
  if (!Array.isArray(row) || row.length !== 4) {
    fail(`${label}: malformed row ${JSON.stringify(row)}`);
    previousComparable = false;
    previous = null;
    continue;
  }

  const [number, slug, origin, destination] = row;
  const comparable =
    typeof number === 'string' &&
    typeof slug === 'string' &&
    typeof origin === 'string' &&
    typeof destination === 'string';
  if (typeof number !== 'string' || !/^[A-Z0-9]{3,8}$/.test(number)) {
    fail(`${label}: bad flight number ${JSON.stringify(number)}`);
  } else {
    numbers.add(number);
  }
  if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    fail(`${label}: bad airline slug ${JSON.stringify(slug)}`);
  } else if (!Object.hasOwn(airlines, slug)) {
    fail(`${label}: airline ${slug} missing from airlines`);
  } else {
    slugUse.set(slug, (slugUse.get(slug) ?? 0) + 1);
  }
  if (typeof origin !== 'string' || !/^[A-Z]{3}$/.test(origin)) {
    fail(`${label}: bad origin ${JSON.stringify(origin)}`);
  }
  if (typeof destination !== 'string' || !/^[A-Z]{3}$/.test(destination)) {
    fail(`${label}: bad destination ${JSON.stringify(destination)}`);
  }

  const originKnown = airportCodes.has(origin);
  const destinationKnown = airportCodes.has(destination);
  if (!originKnown && !destinationKnown) {
    fail(`${label}: ${number} does not touch a directory airport (${origin}-${destination})`);
  } else {
    if (originKnown) {
      boardCounts.get(origin).departures += 1;
      departureTotal += 1;
    }
    if (destinationKnown) {
      boardCounts.get(destination).arrivals += 1;
      arrivalTotal += 1;
    }
  }
  if (origin === destination) {
    warn(`${label}: ${number} starts and ends at ${origin}`);
  }

  const key = `${origin}|${number}|${destination}`;
  if (seenRoutes.has(key)) fail(`${label}: duplicate route ${key}`);
  seenRoutes.add(key);

  if (comparable && previousComparable && previous && compareRows(previous, row) > 0) {
    outOfOrder += 1;
    if (outOfOrder === 1) fail(`${label}: row is before ${JSON.stringify(previous)}`);
  }
  previous = row;
  previousComparable = comparable;
}
if (outOfOrder > 1) fail(`${outOfOrder} rows are out of order`);

for (const [code, counts] of boardCounts) {
  const expected = airports[code];
  if (!expected) continue;
  if (expected.departures !== counts.departures) {
    fail(`${code}: airports.departures ${expected.departures} != records ${counts.departures}`);
  }
  if (expected.arrivals !== counts.arrivals) {
    fail(`${code}: airports.arrivals ${expected.arrivals} != records ${counts.arrivals}`);
  }
  if (counts.departures + counts.arrivals === 0) warn(`${code}: airport entry has no flights`);
  if (verbose) {
    console.log(`${code}: ${counts.departures} departures, ${counts.arrivals} arrivals`);
  }
}

const totals = data.totals && typeof data.totals === 'object' ? data.totals : {};
for (const [key, actual] of [
  ['airports', airportCodes.size],
  ['airlines', Object.keys(airlines).length],
  ['flights', departureTotal + arrivalTotal],
  ['departures', departureTotal],
  ['arrivals', arrivalTotal],
  ['numbers', numbers.size],
  ['routes', flights.length],
]) {
  if (totals[key] !== actual) fail(`totals.${key} is ${totals[key]}, counted ${actual}`);
}

for (const slug of Object.keys(airlines)) {
  if (!slugUse.has(slug)) warn(`airlines: ${slug} is not referenced by any flight`);
}

const uncovered = [...directoryCodes].filter((code) => !airportCodes.has(code));
if (uncovered.length) {
  console.log(
    `${uncovered.length} directory airports have no flights: ${uncovered
      .sort()
      .slice(0, 30)
      .join(', ')}${uncovered.length > 30 ? ', ...' : ''}`
  );
}

console.log(
  `Checked ${airportCodes.size} airports · ${departureTotal.toLocaleString('en-US')} departures · ` +
    `${arrivalTotal.toLocaleString('en-US')} arrivals · ${numbers.size.toLocaleString('en-US')} flight numbers · ` +
    `${flights.length.toLocaleString('en-US')} routes · ${slugUse.size} airlines in use · ` +
    `data date ${data.dataDate}`
);

for (const message of warnings.slice(0, 20)) console.warn(`WARN ${message}`);
if (warnings.length > 20) console.warn(`...and ${warnings.length - 20} more warnings`);

if (errors.length) {
  for (const message of errors.slice(0, 40)) console.error(`ERROR ${message}`);
  if (errors.length > 40) console.error(`...and ${errors.length - 40} more errors`);
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'} found`);
  process.exit(1);
}

console.log(`OK${warnings.length ? ` (${warnings.length} warnings)` : ''}`);
