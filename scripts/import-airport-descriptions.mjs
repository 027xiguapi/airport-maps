/**
 * Imports translated short airport descriptions into `airport_translations` —
 * the answer-first paragraph the airport page shows under the H1. This is the
 * `airport_translations` counterpart of `content-import.mjs`, which only covers
 * the long-form `content_documents` store.
 *
 * Translations are produced from the English rows exported by
 * `scripts/export-airport-descriptions.mjs`; the file is a flat
 * `{ "<IATA>": "<markdown>" }` JSON object, so a translator (or a batch of
 * them) can write one file per language:
 *
 *   node scripts/import-airport-descriptions.mjs --locale es --file <path>
 *   node scripts/import-airport-descriptions.mjs --locale es --file <path> --dry-run
 *   node scripts/import-airport-descriptions.mjs --locale es --file <path> --prune
 *
 * Rows are upserted on (airport_iata, locale), so re-importing an unchanged
 * file changes nothing. Unknown IATA codes and empty strings are reported and
 * skipped. `--prune` deletes rows of that locale whose IATA is absent from the
 * file — only use it when the file is the complete set for the language.
 */
import { readFileSync } from 'node:fs';
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
const FILE = flagValue('--file');
const DRY = args.includes('--dry-run');
const PRUNE = args.includes('--prune');

if (!LOCALE || !FILE) {
  console.error(
    'usage: node scripts/import-airport-descriptions.mjs --locale <code> --file <path> [--dry-run] [--prune]'
  );
  process.exit(1);
}

const path = isAbsolute(FILE) ? FILE : join(ROOT, FILE);
const raw = JSON.parse(readFileSync(path, 'utf8'));
const entries = Object.entries(raw).filter(
  ([iata, text]) => /^[A-Z]{3}$/.test(iata) && typeof text === 'string' && text.trim()
);
const empty = Object.entries(raw).filter(([, text]) => typeof text !== 'string' || !text.trim());
if (empty.length) {
  console.warn(`skipped ${empty.length} empty value(s): ${empty.slice(0, 8).map(([i]) => i).join(', ')}`);
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const { rows: known } = await client.query('SELECT iata::text AS iata FROM airports');
const knownSet = new Set(known.map((r) => r.iata));
const unknown = entries.filter(([iata]) => !knownSet.has(iata));
if (unknown.length) {
  console.warn(
    `skipped ${unknown.length} unknown IATA code(s): ${unknown.slice(0, 10).map(([i]) => i).join(', ')}`
  );
}
const valid = entries.filter(([iata]) => knownSet.has(iata));

if (PRUNE) {
  const { rowCount } = DRY
    ? await client.query(
        `SELECT count(*)::int AS n FROM airport_translations
          WHERE locale = $1 AND airport_iata <> ALL($2::char(3)[])`,
        [LOCALE, valid.map(([iata]) => iata)]
      )
    : await client.query(
        `DELETE FROM airport_translations
          WHERE locale = $1 AND airport_iata <> ALL($2::char(3)[])`,
        [LOCALE, valid.map(([iata]) => iata)]
      );
  const removed = Array.isArray(rowCount) ? rowCount[0].n : rowCount;
  console.log(`${DRY ? 'would delete' : 'deleted'} ${removed} row(s) outside this file`);
}

if (!DRY && valid.length) {
  const values = valid.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
  await client.query(
    `INSERT INTO airport_translations (airport_iata, locale, description_md)
     VALUES ${values}
     ON CONFLICT (airport_iata, locale) DO UPDATE SET description_md = excluded.description_md`,
    valid.flatMap(([iata, text]) => [iata, LOCALE, text.trim()])
  );
}

console.log(
  `${DRY ? 'would import' : 'imported'} ${valid.length} description(s) for ${LOCALE} ` +
    `(${unknown.length} unknown, ${empty.length} empty skipped)`
);

await client.end();
