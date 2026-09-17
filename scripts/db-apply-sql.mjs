/**
 * Runs a .sql file against DATABASE_URL. Used for the statements drizzle-kit
 * does not manage:
 *
 *   node scripts/db-apply-sql.mjs db/extensions.sql   before push/migrate
 *   node scripts/db-apply-sql.mjs db/custom.sql       after  push/migrate
 *
 * The files are written to be idempotent, so re-running is harmless.
 */
import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/db-apply-sql.mjs <file.sql>');
  process.exit(1);
}

const path = isAbsolute(target) ? target : join(ROOT, target);
const sql = readFileSync(path, 'utf8');

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
try {
  // One query = one implicit transaction: a failing statement rolls the whole
  // file back instead of leaving a half-applied schema behind.
  await client.query(sql);
  console.log(`applied ${target}`);
} finally {
  await client.end();
}
