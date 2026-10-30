import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import pg from 'pg';

/**
 * Direct database import for the Cathay fare card.
 *
 * The normal path is /admin/deals → 批量导入, but that requires an interactive
 * admin session. This script is for running on the server when the admin login
 * is not available (or for repeatable deployments):
 *
 *   node scripts/import-cathay-online.mjs           # dry run, rolls back
 *   node scripts/import-cathay-online.mjs --apply   # writes to DATABASE_URL
 *
 * It is idempotent: an existing row with the same
 * (airline, origin, destination, price, currency, tax flag) is updated in
 * place; only missing rows are inserted. Nothing is deleted.
 */

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const separator = trimmed.indexOf('=');
  if (separator < 0) continue;
  process.env[trimmed.slice(0, separator).trim()] ??= trimmed
    .slice(separator + 1)
    .trim();
}

const apply = process.argv.includes('--apply');
const dataPath = new URL('../data/cathay-fare-card-2026.expanded.json', import.meta.url);
if (!existsSync(dataPath)) {
  throw new Error(`missing ${dataPath.pathname}`);
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
if (!Array.isArray(data.rows) || data.rows.length === 0) {
  throw new Error('expanded JSON has no rows');
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const target = new URL(process.env.DATABASE_URL);
const expiresAt = new Date(`${data.expiresAt}T23:59:59+08:00`);
if (Number.isNaN(expiresAt.getTime())) throw new Error('invalid expiresAt');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const batchId = randomUUID();
let updated = 0;
let inserted = 0;

try {
  console.log(
    `database: ${target.host}${target.pathname} | rows: ${data.rows.length} | ${apply ? 'APPLY' : 'DRY RUN'}`
  );
  await client.query('begin');

  for (const row of data.rows) {
    const bookingUrl = row.bookingUrl ?? data.bookingUrl;
    const existing = await client.query(
      `select id
         from deals
        where airline = $1
          and airport_iata = $2
          and destination = $3
          and price = $4::numeric
          and currency = $5
          and tax_included = false
        order by id
        limit 1`,
      [data.airline, row.airportIata, row.destination, row.price, data.currency]
    );

    if (existing.rows[0]) {
      await client.query(
        `update deals
            set booking_url = $2,
                destination_en = coalesce(nullif($3, ''), destination_en),
                airline_en = coalesce(nullif($4, ''), airline_en),
                notes = coalesce(nullif($5, ''), notes),
                notes_en = coalesce(nullif($6, ''), notes_en),
                status = 'visible',
                is_official = true,
                submitter_name = '国泰航空官方',
                user_id = null,
                expires_at = $7,
                batch_id = $8,
                updated_at = now()
          where id = $1`,
        [
          existing.rows[0].id,
          bookingUrl,
          row.destinationEn ?? '',
          data.airlineEn ?? '',
          data.notes ?? '',
          data.notesEn ?? '',
          expiresAt,
          batchId,
        ]
      );
      updated += 1;
    } else {
      await client.query(
        `insert into deals
           (airport_iata, destination, destination_en, airline, airline_en,
            price, currency, cabin, trip_type, travel_from, travel_to,
            booking_url, notes, notes_en, status, user_id, submitter_name,
            ip_hash, expires_at, tax_included, is_official, batch_id)
         values ($1, $2, $3, $4, $5, $6::numeric, $7, 'economy', 'roundtrip',
                 null, null, $8, $9, $10, 'visible', null, '国泰航空官方',
                 null, $11, false, true, $12)`,
        [
          row.airportIata,
          row.destination,
          row.destinationEn ?? null,
          data.airline,
          data.airlineEn ?? null,
          row.price,
          data.currency,
          bookingUrl,
          data.notes ?? null,
          data.notesEn ?? null,
          expiresAt,
          batchId,
        ]
      );
      inserted += 1;
    }
  }

  if (apply) {
    await client.query('commit');
  } else {
    await client.query('rollback');
  }

  console.log(
    JSON.stringify({
      applied: apply,
      updated,
      inserted,
      batchId: apply ? batchId : null,
      expiresAt: data.expiresAt,
    })
  );
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
