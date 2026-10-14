/**
 * Exports content documents from the database (`content_documents`) back to a
 * `.md` tree — the inverse of `scripts/content-import.mjs`. Three uses:
 *
 *   - backup / off-site copy of the editorial text (the database is the store
 *     now, so this plus `pg_dump` is the safety net);
 *   - `--check` against a tree to prove a round trip is lossless (what the
 *     original content/ migration was verified with);
 *   - handing one locale's files to a translator, then importing the result
 *     under a new locale.
 *
 *   node scripts/content-export.mjs                        → ./content
 *   node scripts/content-export.mjs --out <dir>            another tree root
 *   node scripts/content-export.mjs --locale zh            one locale only
 *   node scripts/content-export.mjs --json <file>          single JSON snapshot
 *   node scripts/content-export.mjs --check <dir>          compare, write nothing
 *
 * The tree layout and file names match what lib/content.ts used to read
 * (including the `AUX_.md` DOS-device-name spelling), and `--check` compares
 * through the same frontmatter reader the app used, so a clean check means the
 * database reproduces the files' app-visible content exactly.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { DIR_KINDS, KIND_DIRS, fileStem, parseDocument, renderDocument } from './content-md.mjs';

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  const arg = args[i];
  return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args[i + 1] ?? null;
};

/** Flag value as a path: absolute stays as given, relative resolves from the repo root. */
const flagPath = (name, fallback) => {
  const value = flagValue(name) ?? fallback;
  return isAbsolute(value) ? value : join(ROOT, value);
};

const CHECK_DIR = args.includes('--check') ? flagPath('--check', 'content') : null;
const JSON_OUT = args.includes('--json') ? flagPath('--json') : null;
const OUT = flagPath('--out', 'content');
const LOCALE = flagValue('--locale');
const KIND = flagValue('--kind');

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows } = await client.query(
  `SELECT kind, subject, locale, title, summary, updated::text AS updated, body
   FROM content_documents
   ${LOCALE || KIND ? 'WHERE ' + [
     LOCALE ? 'locale = $1' : null,
     KIND ? `kind = $${LOCALE ? 2 : 1}` : null,
   ].filter(Boolean).join(' AND ') : ''}
   ORDER BY locale, kind, subject`,
  [LOCALE, KIND].filter(Boolean)
);
await client.end();

if (rows.length === 0) {
  console.error('no documents selected');
  process.exit(1);
}

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify({ exported_at: new Date().toISOString(), documents: rows }, null, 2) + '\n');
  console.log(`wrote ${rows.length} document(s) to ${JSON_OUT}`);
  process.exit(0);
}

const pathFor = (row) =>
  join(OUT, row.locale, KIND_DIRS[row.kind], `${fileStem(row.kind, row.subject)}.md`);

if (CHECK_DIR) {
  // Compare through the app's reader: every selected row must reproduce an
  // identical { title, summary, updated, body } in the tree.
  const fileFor = (row) => join(CHECK_DIR, row.locale, KIND_DIRS[row.kind], `${fileStem(row.kind, row.subject)}.md`);
  let checked = 0;
  const problems = [];
  const seen = new Set();
  for (const row of rows) {
    const path = fileFor(row);
    seen.add(relative(CHECK_DIR, path));
    if (!existsSync(path)) {
      problems.push(`missing file: ${relative(CHECK_DIR, path)}`);
      continue;
    }
    const file = parseDocument(readFileSync(path, 'utf8'));
    const db = { title: row.title ?? undefined, summary: row.summary ?? undefined, updated: row.updated ?? undefined, body: row.body };
    const fields = ['title', 'summary', 'updated', 'body'];
    const diffs = fields.filter((f) => (file[f] ?? '') !== (db[f] ?? ''));
    if (diffs.length) {
      problems.push(`${relative(CHECK_DIR, path)}: ${diffs.join(', ')} differ`);
    } else {
      checked++;
    }
  }
  // Files in the tree with no database row at all — the migration must have
  // imported everything, so these are reported rather than ignored.
  for (const locale of new Set(rows.map((r) => r.locale))) {
    for (const [dir, kind] of Object.entries(DIR_KINDS)) {
      const dirPath = join(CHECK_DIR, locale, dir);
      if (!existsSync(dirPath)) continue;
      for (const file of readdirSync(dirPath)) {
        if (!file.endsWith('.md')) continue;
        if (!seen.has(relative(CHECK_DIR, join(dirPath, file)))) {
          problems.push(`extra file (no DB row): ${relative(CHECK_DIR, join(dirPath, file))}`);
        }
      }
    }
  }
  if (problems.length) {
    console.error(`${problems.length} problem(s) — first 20:\n  ${problems.slice(0, 20).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`check passed: ${checked} document(s) match ${relative(ROOT, CHECK_DIR) || CHECK_DIR}`);
  process.exit(0);
}

const written = new Map();
for (const row of rows) {
  const path = pathFor(row);
  if (!written.has(path)) {
    mkdirSync(join(path, '..'), { recursive: true });
    written.set(path, true);
  }
  writeFileSync(path, renderDocument(row));
}
console.log(
  `wrote ${rows.length} document(s) to ${relative(ROOT, OUT) || OUT}` +
    ` (${[...new Set(rows.map((r) => r.locale))].sort().join(', ')})`
);
