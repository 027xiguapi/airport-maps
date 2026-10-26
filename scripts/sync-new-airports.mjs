/**
 * Copies the airport/country rows that are missing on another database
 * (normally production) — insert-only, never updates or deletes.
 *
 * This is the structured half of a deployment when the local directory has
 * grown (new airports/countries). The translated long-form content is pushed
 * separately by scripts/sync-content-to-remote.mjs, per locale.
 *
 * Usage:
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-new-airports.mjs            # dry run
 *   REMOTE_DATABASE_URL='postgresql://…' node scripts/sync-new-airports.mjs --apply
 *
 * SYNC_APPLY=1 works as well (npm 10 swallows unknown flags after `--`).
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const APPLY = process.argv.includes('--apply') || process.env.SYNC_APPLY === '1';
const LOCAL = databaseUrl();
const REMOTE = process.env.REMOTE_DATABASE_URL;
if (!REMOTE) {
  console.error('REMOTE_DATABASE_URL is not set');
  process.exit(1);
}
if (REMOTE === LOCAL) {
  console.error('REMOTE_DATABASE_URL points at the same database — refusing');
  process.exit(1);
}

const local = new pg.Client({ connectionString: LOCAL });
const remote = new pg.Client({ connectionString: REMOTE });
await local.connect();
await remote.connect();

const log = (...a) => console.log(...a);

const localCountries = (await local.query('select * from countries order by code')).rows;
const localAirports = (await local.query('select * from airports order by iata')).rows;
const remoteCountryCodes = new Set(
  (await remote.query('select code from countries')).rows.map((r) => r.code)
);
const remoteAirportCodes = new Set(
  (await remote.query('select iata from airports')).rows.map((r) => r.iata)
);

const newCountries = localCountries.filter((c) => !remoteCountryCodes.has(c.code));
const newAirports = localAirports.filter((a) => !remoteAirportCodes.has(a.iata));
log(`target has ${remoteAirportCodes.size} airports, ${remoteCountryCodes.size} countries`);
log(`local  has ${localAirports.length} airports, ${localCountries.length} countries`);
log(`to insert: ${newCountries.length} countries, ${newAirports.length} airports`);
if (newCountries.length) log('  countries:', newCountries.map((c) => c.code).join(', '));
if (newAirports.length) log('  airports:', newAirports.map((a) => a.iata).join(', '));

if (!APPLY) {
  log('DRY RUN — nothing written');
  await local.end();
  await remote.end();
  process.exit(0);
}

const countryColumns = ['code', 'name', 'name_en', 'name_tw', 'region', 'region_tw', 'region_en', 'flag_url', 'sort_order'];
const airportColumns = [
  'iata', 'slug', 'name', 'name_en', 'name_tw', 'city', 'city_en', 'city_tw',
  'country_code', 'gate_count', 'annual_pax_m', 'distance_km', 'updated_at', 'search_blob',
];

await remote.query('begin');
try {
  for (const c of newCountries) {
    const values = countryColumns.map((k) => c[k]);
    const placeholders = countryColumns.map((_, i) => `$${i + 1}`).join(',');
    await remote.query(
      `insert into countries (${countryColumns.join(',')}) values (${placeholders})`,
      values
    );
  }
  for (const a of newAirports) {
    const values = airportColumns.map((k) => a[k]);
    const placeholders = airportColumns.map((_, i) => `$${i + 1}`).join(',');
    await remote.query(
      `insert into airports (${airportColumns.join(',')}) values (${placeholders})`,
      values
    );
  }
  await remote.query('commit');
} catch (error) {
  await remote.query('rollback').catch(() => {});
  throw error;
}

const afterAirports = (await remote.query('select count(*)::int n from airports')).rows[0].n;
const afterCountries = (await remote.query('select count(*)::int n from countries')).rows[0].n;
log(`target now: ${afterAirports} airports, ${afterCountries} countries`);

await local.end();
await remote.end();
log('done. Push content next: node scripts/sync-content-to-remote.mjs --locale en,zh,tw,de,ko,fr,it --apply');
