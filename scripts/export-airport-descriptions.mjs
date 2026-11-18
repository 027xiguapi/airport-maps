/**
 * Exports the short airport descriptions (`airport_translations.description_md`)
 * as a flat `{ "<IATA>": "<markdown>" }` JSON file — the input side of a
 * translation batch. `scripts/import-airport-descriptions.mjs` takes the same
 * shape back for another locale.
 *
 *   node scripts/export-airport-descriptions.mjs --locale en --out <file>
 */
import { writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  const arg = args[i];
  return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args[i + 1] ?? null;
};

const LOCALE = flagValue('--locale');
const OUT = flagValue('--out');
if (!LOCALE || !OUT) {
  console.error('usage: node scripts/export-airport-descriptions.mjs --locale <code> --out <file>');
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows } = await client.query(
  `SELECT airport_iata::text AS iata, description_md
     FROM airport_translations
    WHERE locale = $1
    ORDER BY airport_iata`,
  [LOCALE]
);
await client.end();

const out = Object.fromEntries(rows.map((r) => [r.iata, r.description_md]));
const path = isAbsolute(OUT) ? OUT : join(ROOT, OUT);
writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`wrote ${rows.length} description(s) for ${LOCALE} to ${path}`);
