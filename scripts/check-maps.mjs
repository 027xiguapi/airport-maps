/**
 * Reports coverage of /public/maps cover images against the airports table:
 * which airports have no image, and which image files match no airport.
 * Read-only; safe to run any time.
 *
 * Usage: node scripts/check-maps.mjs [--table]
 *   --table  print every missing airport as a table row (default lists codes)
 */
import pg from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { databaseUrl, ROOT } from './_env.mjs';

const asTable = process.argv.includes('--table');

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows } = await client.query(
  'SELECT iata, name_en, country_code FROM airports ORDER BY iata'
);
await client.end();

const files = new Set(
  readdirSync(join(ROOT, 'public', 'maps')).filter((f) => /^[A-Z]{3}_?\.png$/.test(f))
);
// AUX gains a trailing underscore on disk (see scripts/map-file-aliases.json):
// its plain IATA name is a DOS device on Windows, which git cannot index.
const ALIASES = (() => {
  try {
    const file = JSON.parse(readFileSync(join(ROOT, 'scripts', 'map-file-aliases.json'), 'utf8'));
    return Object.fromEntries(
      Object.entries(file).filter(([code, name]) => /^[A-Z]{3}$/.test(code) && typeof name === 'string')
    );
  } catch {
    return {};
  }
})();
const byFile = new Map(Object.entries(ALIASES).map(([code, name]) => [name, code]));
const coded = new Set([...files].map((f) => byFile.get(f) ?? f.slice(0, 3)));
const dbCodes = new Set(rows.map((a) => a.iata));

const missing = rows.filter((a) => !coded.has(a.iata));
const orphans = [...coded].filter((code) => !dbCodes.has(code)).sort();

console.log(`DB airports: ${rows.length}, map images: ${files.size}, matched: ${rows.length - missing.length}`);

if (!missing.length) {
  console.log('No missing map images.');
} else if (asTable) {
  console.log(`\nMissing maps (${missing.length}):`);
  console.table(missing.map((a) => ({ iata: a.iata, name: a.name_en, country: a.country_code })));
} else {
  const byCountry = new Map();
  for (const a of missing) {
    if (!byCountry.has(a.country_code)) byCountry.set(a.country_code, []);
    byCountry.get(a.country_code).push(a.iata);
  }
  console.log(`\nMissing maps (${missing.length}) by country:`);
  for (const [country, codes] of [...byCountry].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${country} (${codes.length}): ${codes.join(' ')}`);
  }
  console.log('\nRe-run with --table for full names.');
}

if (orphans.length) {
  console.log(`\nImages with no airport in DB (${orphans.length}): ${orphans.join(' ')}`);
}
