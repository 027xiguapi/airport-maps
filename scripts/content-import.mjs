/**
 * Imports long-form content documents from a `.md` tree into the database
 * (`content_documents` — the runtime store the app reads through
 * lib/content.ts). This is how the original `content/` tree was migrated, and
 * how a new or updated language batch gets in later: hand the translator a
 * `node scripts/content-export.mjs --locale zh --out <dir>` tree, drop the
 * translated files under `<dir>/<locale>/…`, and import that.
 *
 *   node scripts/content-import.mjs                      ./content → database
 *   node scripts/content-import.mjs --dir <path>         another tree root
 *   node scripts/content-import.mjs --only zh,en         restrict locales
 *   node scripts/content-import.mjs --dry-run            report, write nothing
 *   node scripts/content-import.mjs --prune              also delete rows of an
 *                                                        imported locale that
 *                                                        have no file any more
 *
 * Rows are upserted on (kind, subject, locale), so re-importing an unchanged
 * tree changes nothing. Files whose frontmatter cannot supply a `title`,
 * `summary` or `updated` are still imported with those fields NULL — matching
 * the reader, which treats all three as optional — but every skip, warning or
 * orphaned subject is printed.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { DIR_KINDS, KIND_DIRS, parseDocument, subjectFromStem, fileStem } from './content-md.mjs';

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  const arg = args[i];
  return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args[i + 1] ?? null;
};

const DRY = args.includes('--dry-run');
const PRUNE = args.includes('--prune');
/** Absolute stays as given, relative resolves from the repo root. */
const dir = flagValue('--dir') ?? 'content';
const TREE = isAbsolute(dir) ? dir : join(ROOT, dir);
const ONLY = flagValue('--only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;

if (!existsSync(TREE)) {
  console.error(
    `tree not found: ${TREE}\n` +
      'Pass --dir <path> (the content lives in the database now; a tree is whatever\n' +
      '`content-export` produced — the 2026-10-14 migration export sits next to the repo).'
  );
  process.exit(1);
}

/** Every { kind, subject, locale, title, summary, updated, body, file } row in the tree. */
function collect() {
  const rows = [];
  const skipped = [];
  for (const locale of readdirSync(TREE, { withFileTypes: true })) {
    if (!locale.isDirectory() || !/^[a-z]{2,8}$/.test(locale.name)) continue;
    if (ONLY && !ONLY.includes(locale.name)) continue;
    for (const dirEntry of readdirSync(join(TREE, locale.name), { withFileTypes: true })) {
      const kind = DIR_KINDS[dirEntry.name];
      if (!dirEntry.isDirectory() || !kind) continue;
      const dir = join(TREE, locale.name, dirEntry.name);
      for (const file of readdirSync(dir)) {
        if (!file.endsWith('.md')) {
          skipped.push(`${relative(TREE, join(dir, file))} (not .md)`);
          continue;
        }
        const path = join(dir, file);
        const doc = parseDocument(readFileSync(path, 'utf8'));
        const stem = file.slice(0, -3);
        let subject = subjectFromStem(kind, stem);
        if (kind === 'airport' || kind === 'country') subject = subject.toUpperCase();
        if (fileStem(kind, subject) !== stem) {
          skipped.push(`${relative(TREE, path)} (file name does not round-trip: expected ${fileStem(kind, subject)}.md)`);
          continue;
        }
        if (!doc.body) {
          skipped.push(`${relative(TREE, path)} (empty body)`);
          continue;
        }
        if (!doc.updated) skipped.push(`${relative(TREE, path)} (no frontmatter "updated" date)`);
        rows.push({
          kind,
          subject,
          locale: locale.name,
          title: doc.title ?? null,
          summary: doc.summary ?? null,
          updated: doc.updated ?? null,
          body: doc.body,
          file: relative(TREE, path),
        });
      }
    }
  }
  return { rows, skipped };
}

const { rows, skipped } = collect();
if (rows.length === 0) {
  console.error(`no documents found under ${TREE}`);
  process.exit(1);
}

const locales = [...new Set(rows.map((r) => r.locale))].sort();
console.log(
  `${rows.length} document(s) under ${TREE} — locale(s) ${locales.join(', ')}, ` +
    `${Object.entries(
      rows.reduce((acc, r) => ((acc[r.kind] = (acc[r.kind] ?? 0) + 1), acc), {})
    )
      .map(([kind, n]) => `${n} ${kind}`)
      .join(', ')}${DRY ? '  [dry run]' : ''}`
);
for (const line of skipped) console.warn(`  skip: ${line}`);

if (DRY) {
  // Report what would change, then stop before touching the database.
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    const { rows: current } = await client.query(
      'SELECT kind, subject, locale, title, summary, updated::text, body FROM content_documents'
    );
    const byKey = new Map(current.map((r) => [`${r.kind}|${r.subject}|${r.locale}`, r]));
    let added = 0;
    let changed = 0;
    let unchanged = 0;
    for (const r of rows) {
      const existing = byKey.get(`${r.kind}|${r.subject}|${r.locale}`);
      if (!existing) added++;
      else if (
        existing.title !== r.title ||
        existing.summary !== r.summary ||
        (existing.updated ?? null) !== (r.updated ?? null) ||
        existing.body !== r.body
      )
        changed++;
      else unchanged++;
    }
    console.log(`would insert ${added}, update ${changed}, leave ${unchanged} unchanged`);
  } finally {
    await client.end();
  }
  process.exit(0);
}

// Reference check: guides/intros whose airport or country has no row are
// imported anyway (nothing is thrown away), but they are unreachable, so say so.
const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
try {
  const { rows: known } = await client.query('SELECT iata FROM airports');
  const airportCodes = new Set(known.map((r) => r.iata));
  const { rows: knownCountries } = await client.query('SELECT code FROM countries');
  const countryCodes = new Set(knownCountries.map((r) => r.code));
  const orphanAirports = rows.filter((r) => r.kind === 'airport' && !airportCodes.has(r.subject));
  const orphanCountries = rows.filter((r) => r.kind === 'country' && !countryCodes.has(r.subject));
  for (const r of orphanAirports) console.warn(`  note: ${r.file} — no '${r.subject}' row in airports`);
  for (const r of orphanCountries) console.warn(`  note: ${r.file} — no '${r.subject}' row in countries`);

  await client.query('BEGIN');
  const upsert = `
    INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (kind, subject, locale) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      updated = EXCLUDED.updated,
      body = EXCLUDED.body,
      updated_at = now()
    RETURNING (xmax = 0) AS inserted`;
  let inserted = 0;
  let updated = 0;
  for (const r of rows) {
    const { rows: [result] } = await client.query(upsert, [
      r.kind,
      r.subject,
      r.locale,
      r.title,
      r.summary,
      r.updated,
      r.body,
    ]);
    if (result.inserted) inserted++;
    else updated++;
  }

  let pruned = 0;
  if (PRUNE) {
    // Only the imported locale(s): a batch import must not touch other languages.
    const { rowCount } = await client.query(
      `DELETE FROM content_documents
       WHERE locale = ANY($1)
         AND (kind, subject, locale) NOT IN (
           SELECT * FROM unnest($2::text[], $3::text[], $4::text[])
         )`,
      [
        locales,
        rows.map((r) => r.kind),
        rows.map((r) => r.subject),
        rows.map((r) => r.locale),
      ]
    );
    pruned = rowCount;
  }

  await client.query('COMMIT');
  console.log(
    `imported ${rows.length} document(s): ${inserted} inserted, ${updated} updated` +
      (PRUNE ? `, ${pruned} pruned` : '') +
      (skipped.length ? `, ${skipped.length} skipped` : '')
  );
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await client.end();
}
