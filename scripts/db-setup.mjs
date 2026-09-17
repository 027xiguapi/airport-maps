/**
 * Creates the target database (if absent) and applies db/schema.sql.
 * Usage: node scripts/db-setup.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const url = new URL(databaseUrl());
const dbName = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'airport_maps';

if (!/^[a-z_][a-z0-9_]*$/i.test(dbName)) {
  throw new Error(`refusing to create oddly named database: ${dbName}`);
}

// Connect to the maintenance database to create the target if needed.
const adminUrl = new URL(url);
adminUrl.pathname = '/postgres';

const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
if (rows.length === 0) {
  await admin.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);
  console.log(`created database ${dbName}`);
} else {
  console.log(`database ${dbName} already exists`);
}
await admin.end();

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const schema = readFileSync(join(ROOT, 'db', 'schema.sql'), 'utf8');
await client.query(schema);
console.log('applied db/schema.sql');

const { rows: tableRows } = await client.query(
  `SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`
);
console.log('tables:', tableRows.map((r) => r.table_name).join(', '));
await client.end();
