/**
 * Creates the target database (if absent) so drizzle-kit has somewhere to
 * push/migrate into. Schema DDL is owned by db/schema.ts, not by this script.
 *
 * Usage:
 *   node scripts/db-create.mjs           create the database when missing
 *   node scripts/db-create.mjs --reset   drop and recreate it (destructive)
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const reset = process.argv.includes('--reset');

const url = new URL(databaseUrl());
const dbName = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'airport_maps';

if (!/^[a-z_][a-z0-9_]*$/i.test(dbName)) {
  throw new Error(`refusing to create oddly named database: ${dbName}`);
}

// Connect to the maintenance database: you cannot drop the database you are
// connected to.
const adminUrl = new URL(url);
adminUrl.pathname = '/postgres';

const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();

const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

if (rows.length > 0 && reset) {
  // FORCE terminates connections still holding the database (a running
  // `next dev`, a stale psql session), which a plain DROP would refuse.
  await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  console.log(`dropped database ${dbName}`);
  await admin.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);
  console.log(`created database ${dbName}`);
} else if (rows.length === 0) {
  await admin.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);
  console.log(`created database ${dbName}`);
} else {
  console.log(`database ${dbName} already exists`);
}

await admin.end();
