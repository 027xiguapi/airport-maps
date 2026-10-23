/**
 * Publishes the German content rows to another database (normally production).
 *
 * German lives in two places:
 *   1. application code — `lib/i18n/messages/de.ts`, `de-vocab.json`, the blog
 *      `.de.md` files, `public/photos/captions.de.json`, the sitemap/route code.
 *      Those ship with a normal deployment, not with this script.
 *   2. database rows — `content_documents` (405 rows: 363 airport guides, 37
 *      country introductions, 5 static pages) and `airport_translations`
 *      (363 descriptions), both with `locale='de'`.
 *
 * This script copies only #2, and only the `de` rows: it never truncates, never
 * touches zh/en/tw rows, and never writes structured airport data. That keeps
 * production's newer English/Chinese editorial content intact while the German
 * pages go live.
 *
 * Usage:
 *   # dry run (default): read-only, prints what would change
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-de-to-remote.mjs
 *
 *   # apply inside one transaction, then verify row-for-row
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-de-to-remote.mjs --apply
 *
 *   # also save the target's current de rows (usually none) before writing
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-de-to-remote.mjs --apply --backup .backup/remote-de.json
 *
 * The local database is whatever `DATABASE_URL` resolves to (.env.local), i.e.
 * the copy that was reviewed. `--apply` refuses to run when the two URLs point
 * at the same database.
 */
import fs from 'node:fs';
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const APPLY = process.argv.includes('--apply');
const backupAt = (() => {
  const i = process.argv.indexOf('--backup');
  return i >= 0 ? process.argv[i + 1] : null;
})();

const LOCAL = databaseUrl();
const REMOTE = process.env.REMOTE_DATABASE_URL;
if (!REMOTE) {
  console.error('REMOTE_DATABASE_URL is not set');
  process.exit(1);
}
if (REMOTE === LOCAL) {
  console.error('REMOTE_DATABASE_URL points at the same database as DATABASE_URL — refusing');
  process.exit(1);
}

const local = new pg.Client({ connectionString: LOCAL, connectionTimeoutMillis: 15000 });
const remote = new pg.Client({ connectionString: REMOTE, connectionTimeoutMillis: 15000 });
await local.connect();
await remote.connect();

const log = (...args) => console.log(...args);

// ------------------------------------------------------------------ read local
const docs = (
  await local.query(
    `select kind, subject, locale, title, summary, updated::text, body
       from content_documents where locale = 'de' order by kind, subject`
  )
).rows;
const descriptions = (
  await local.query(
    `select airport_iata, locale, description_md
       from airport_translations where locale = 'de' order by airport_iata`
  )
).rows;

if (docs.length === 0) {
  console.error('local has no German content_documents rows — nothing to sync');
  process.exit(1);
}

log(`local German rows: ${docs.length} documents, ${descriptions.length} descriptions`);

// ----------------------------------------------------------------- read remote
const remoteDocs = (
  await remote.query(`select count(*)::int n from content_documents where locale = 'de'`)
).rows[0].n;
const remoteDescriptions = (
  await remote.query(`select count(*)::int n from airport_translations where locale = 'de'`)
).rows[0].n;
log(`target German rows: ${remoteDocs} documents, ${remoteDescriptions} descriptions`);

// Existing de rows on the target would be updated, not duplicated — list them
// so an accidental overwrite is visible before --apply.
const existing = (
  await remote.query(
    `select kind, subject from content_documents where locale = 'de' order by kind, subject`
  )
).rows;
if (existing.length) {
  log(`target already has ${existing.length} German documents (will be updated):`);
  log('  ' + existing.slice(0, 20).map((r) => `${r.kind}/${r.subject}`).join(', '));
}

// Data shape checks: every German description must point at a real airport on
// the target, otherwise the FK insert would abort the transaction halfway.
const targetAirports = new Set(
  (await remote.query('select iata from airports')).rows.map((r) => r.iata)
);
const orphanDescriptions = descriptions.filter((d) => !targetAirports.has(d.airport_iata));
if (orphanDescriptions.length) {
  console.error(
    `target is missing ${orphanDescriptions.length} airports referenced by German descriptions: ` +
      orphanDescriptions.slice(0, 10).map((d) => d.airport_iata).join(', ')
  );
  process.exit(1);
}
const targetSubjects = new Set(
  (await remote.query(`select kind || '|' || subject k from content_documents`)).rows.map((r) => r.k)
);
const newDocuments = docs.filter((d) => !targetSubjects.has(`${d.kind}|${d.subject}`));
log(`documents without any row on the target (subject not present in any locale): ${newDocuments.length}`);

if (backupAt && APPLY) {
  const backup = {
    content_documents: (
      await remote.query(
        `select kind, subject, locale, title, summary, updated::text, body
           from content_documents where locale = 'de'`
      )
    ).rows,
    airport_translations: (
      await remote.query(
        `select airport_iata, locale, description_md from airport_translations where locale = 'de'`
      )
    ).rows,
  };
  fs.writeFileSync(backupAt, JSON.stringify(backup, null, 1), 'utf8');
  log(`backed up target German rows to ${backupAt}`);
}

if (!APPLY) {
  log('\nDRY RUN — nothing written. Re-run with --apply to publish.');
  await local.end();
  await remote.end();
  process.exit(0);
}

// ---------------------------------------------------------------------- apply
const docUpsert = `
  insert into content_documents (kind, subject, locale, title, summary, updated, body)
  values ($1, $2, 'de', $3, $4, $5, $6)
  on conflict (kind, subject, locale) do update set
    title = excluded.title,
    summary = excluded.summary,
    updated = excluded.updated,
    body = excluded.body,
    updated_at = now()`;

const descriptionUpsert = `
  insert into airport_translations (airport_iata, locale, description_md)
  values ($1, 'de', $2)
  on conflict (airport_iata, locale) do update set
    description_md = excluded.description_md`;

log('\nwriting …');
await remote.query('begin');
try {
  for (const d of docs) {
    await remote.query(docUpsert, [d.kind, d.subject, d.title, d.summary, d.updated, d.body]);
  }
  for (const d of descriptions) {
    await remote.query(descriptionUpsert, [d.airport_iata, d.description_md]);
  }
  await remote.query('commit');
} catch (error) {
  await remote.query('rollback').catch(() => {});
  throw error;
}
log('committed');

// --------------------------------------------------------------------- verify
const verify = async (sql, params = []) => (await remote.query(sql, params)).rows;
const afterDocs = await verify(
  `select count(*)::int n from content_documents where locale = 'de'`
);
const afterDescriptions = await verify(
  `select count(*)::int n from airport_translations where locale = 'de'`
);
log(`target now: ${afterDocs[0].n} documents, ${afterDescriptions[0].n} descriptions`);

// Compare the full payload, not just the counts.
const hash = async (client) => {
  const d = (await client.query(
    `select md5(coalesce(string_agg(kind||'|'||subject||'|'||coalesce(title,'')||'|'||coalesce(summary,'')||'|'||coalesce(updated::text,'')||'|'||body, E'\\n' order by kind, subject),'')) h
       from content_documents where locale='de'`
  )).rows[0].h;
  const t = (await client.query(
    `select md5(coalesce(string_agg(airport_iata||'|'||description_md, E'\\n' order by airport_iata),'')) h
       from airport_translations where locale='de'`
  )).rows[0].h;
  return { d, t };
};
const [lh, rh] = [await hash(local), await hash(remote)];
log(`documents hash   local=${lh.d} target=${rh.d} ${lh.d === rh.d ? 'OK' : 'MISMATCH'}`);
log(`descriptions hash local=${lh.t} target=${rh.t} ${lh.t === rh.t ? 'OK' : 'MISMATCH'}`);

await local.end();
await remote.end();
if (lh.d !== rh.d || lh.t !== rh.t) {
  console.error('verification failed — German rows on the target differ from local');
  process.exit(1);
}
log('\nGerman rows are published. Deploy/rebuild the app so /de routes are generated.');
