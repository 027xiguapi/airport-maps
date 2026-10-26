/**
 * Publishes translated long-form content to another database (normally production).
 *
 * Per locale this copies two tables and nothing else:
 *   - `content_documents`   airport guides, country introductions, static pages
 *   - `airport_translations` the one-paragraph airport descriptions
 *
 * It never truncates, never deletes, never touches other locales, and never
 * writes the structured airport/terminal/country rows. That keeps production's
 * newer editorial data intact while the translated pages go live.
 *
 * Usage (dry run is the default and writes nothing):
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-content-to-remote.mjs --locale fr
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-content-to-remote.mjs --locale fr,it --apply
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-content-to-remote.mjs --locale it --apply --backup .backup/remote-it.json
 *
 * `npm run content:push -- --locale fr` does not reliably forward the flag on
 * npm 10 (it consumes unknown options), so the script also reads:
 *   SYNC_LOCALES=fr,it  SYNC_APPLY=1  SYNC_BACKUP=<file>
 *
 * The local database is whatever `DATABASE_URL` resolves to (.env.local).
 * `--apply` refuses to run when source and target are the same database.
 */
import fs from 'node:fs';
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const argValue = (name) => {
  const i = process.argv.indexOf(name);
  if (i >= 0) return process.argv[i + 1];
  const inline = process.argv.find((a) => a.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
};

const LOCALES = (argValue('--locale') ?? process.env.SYNC_LOCALES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const APPLY = process.argv.includes('--apply') || process.env.SYNC_APPLY === '1';
const BACKUP = argValue('--backup') ?? process.env.SYNC_BACKUP ?? null;

if (LOCALES.length === 0) {
  console.error('No locales given: pass --locale fr,it or SYNC_LOCALES=fr,it');
  process.exit(1);
}

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

const log = (...a) => console.log(...a);
let failed = false;

for (const locale of LOCALES) {
  const docs = (
    await local.query(
      `select kind, subject, title, summary, updated::text, body
         from content_documents where locale = $1 order by kind, subject`,
      [locale]
    )
  ).rows;
  const descriptions = (
    await local.query(
      `select airport_iata, description_md
         from airport_translations where locale = $1 order by airport_iata`,
      [locale]
    )
  ).rows;

  log(`\n[${locale}] local rows: ${docs.length} documents, ${descriptions.length} descriptions`);
  if (docs.length === 0) {
    console.error(`[${locale}] nothing to sync — no rows locally`);
    failed = true;
    continue;
  }

  const remoteDocs = (
    await remote.query('select count(*)::int n from content_documents where locale = $1', [locale])
  ).rows[0].n;
  const remoteDescriptions = (
    await remote.query('select count(*)::int n from airport_translations where locale = $1', [locale])
  ).rows[0].n;
  log(`[${locale}] target rows: ${remoteDocs} documents, ${remoteDescriptions} descriptions`);

  const targetAirports = new Set(
    (await remote.query('select iata from airports')).rows.map((r) => r.iata)
  );
  const orphans = descriptions.filter((d) => !targetAirports.has(d.airport_iata));
  if (orphans.length) {
    console.error(
      `[${locale}] target is missing airports referenced by descriptions: ` +
        orphans.slice(0, 10).map((d) => d.airport_iata).join(', ')
    );
    failed = true;
    continue;
  }

  if (BACKUP && APPLY) {
    const backup = {
      locale,
      content_documents: (
        await remote.query(
          `select kind, subject, locale, title, summary, updated::text, body
             from content_documents where locale = $1`,
          [locale]
        )
      ).rows,
      airport_translations: (
        await remote.query(
          'select airport_iata, locale, description_md from airport_translations where locale = $1',
          [locale]
        )
      ).rows,
    };
    fs.writeFileSync(BACKUP.replace('{locale}', locale), JSON.stringify(backup, null, 1), 'utf8');
    log(`[${locale}] backed up target rows to ${BACKUP.replace('{locale}', locale)}`);
  }

  if (!APPLY) {
    log(`[${locale}] DRY RUN — nothing written`);
    continue;
  }

  log(`[${locale}] writing …`);
  await remote.query('begin');
  try {
    for (const d of docs) {
      await remote.query(
        `insert into content_documents (kind, subject, locale, title, summary, updated, body)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (kind, subject, locale) do update set
           title = excluded.title, summary = excluded.summary,
           updated = excluded.updated, body = excluded.body, updated_at = now()`,
        [d.kind, d.subject, locale, d.title, d.summary, d.updated, d.body]
      );
    }
    for (const d of descriptions) {
      await remote.query(
        `insert into airport_translations (airport_iata, locale, description_md)
         values ($1, $2, $3)
         on conflict (airport_iata, locale) do update set description_md = excluded.description_md`,
        [d.airport_iata, locale, d.description_md]
      );
    }
    await remote.query('commit');
  } catch (error) {
    await remote.query('rollback').catch(() => {});
    throw error;
  }

  const afterDocs = (
    await remote.query('select count(*)::int n from content_documents where locale = $1', [locale])
  ).rows[0].n;
  const afterDescriptions = (
    await remote.query('select count(*)::int n from airport_translations where locale = $1', [locale])
  ).rows[0].n;
  log(`[${locale}] target now: ${afterDocs} documents, ${afterDescriptions} descriptions`);

  const hash = async (client) => {
    const d = (
      await client.query(
        `select md5(coalesce(string_agg(kind||'|'||subject||'|'||coalesce(title,'')||'|'||coalesce(summary,'')||'|'||coalesce(updated::text,'')||'|'||body, E'\\n' order by kind, subject),'')) h
           from content_documents where locale = $1`,
        [locale]
      )
    ).rows[0].h;
    const t = (
      await client.query(
        `select md5(coalesce(string_agg(airport_iata||'|'||description_md, E'\\n' order by airport_iata),'')) h
           from airport_translations where locale = $1`,
        [locale]
      )
    ).rows[0].h;
    return { d, t };
  };
  const lh = await hash(local);
  const rh = await hash(remote);
  const ok = lh.d === rh.d && lh.t === rh.t;
  log(`[${locale}] hash documents ${lh.d === rh.d ? 'OK' : 'MISMATCH'}, descriptions ${lh.t === rh.t ? 'OK' : 'MISMATCH'}`);
  if (!ok) failed = true;
}

await local.end();
await remote.end();
if (failed) {
  console.error('\nsync failed or incomplete');
  process.exit(1);
}
log('\ndone. Deploy/rebuild the app so the new locale routes are generated.');
