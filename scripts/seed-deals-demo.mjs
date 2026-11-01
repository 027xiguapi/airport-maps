/**
 * Demo data for the merged deals table.
 *
 *   node scripts/seed-deals-demo.mjs          insert / refresh the demo rows
 *   node scripts/seed-deals-demo.mjs --clear  remove them
 *
 * Every row carries batch_id = 'demo-seed', so this script never touches real
 * submissions or official imports. Run it against a development database:
 * production fares should come from the collector or the admin screen.
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const CLEAR = process.argv.includes('--clear');
const BATCH = 'demo-seed';

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

try {
await client.query('begin');

// Refresh: remove the previous demo batch. Fare rows also use the batch id,
// so a rerun cannot accumulate duplicates.
const removed = await client.query('delete from deals where batch_id = $1', [BATCH]);
let inserted = null;

if (!CLEAR) {
  // Community: one with the submitter's own affiliate link, one without.
  await client.query(
    `insert into deals (
       kind, airport_iata, destination, destination_en, airline, airline_en,
       price, currency, cabin, trip_type, travel_from, travel_to,
       booking_url, aff_url, notes, notes_en, status, submitter_name,
       batch_id, expires_at
     ) values
       ('community', 'PVG', '曼谷', 'Bangkok', '泰国国际航空', 'Thai Airways',
        1280, 'CNY', 'economy', 'roundtrip', current_date + 20, current_date + 27,
        'https://example.com/book/thai-pvg-bkk',
        'https://example.com/aff/demo-thai?ref=demo123',
        '含 20kg 托运，需在 3 天内出票。', '20kg checked bag; ticketing within 3 days.',
        'visible', 'Demo Traveller', $1, now() + interval '30 days'),
       ('community', 'PEK', '东京', 'Tokyo', '全日空', 'ANA',
        1980, 'CNY', 'economy', 'oneway', current_date + 15, null,
        'https://example.com/book/ana-pek-nrt', null,
        '早班机，价格含税。', 'Morning departure, taxes included.',
        'visible', 'Demo Traveller', $1, now() + interval '30 days')`,
    [BATCH]
  );

  // Official fare card (admin-style), with an explicit affiliate link.
  await client.query(
    `insert into deals (
       kind, airport_iata, destination, destination_en, airline, airline_en,
       price, currency, cabin, trip_type, booking_url, aff_url, notes, notes_en,
       status, tax_included, submitter_name, batch_id, expires_at
     ) values
       ('official', 'PVG', '台北', 'Taipei', '国泰航空', 'Cathay Pacific',
        1200, 'CNY', 'economy', 'roundtrip',
        'https://example.com/book/cx-pvg-tpe',
        'https://example.com/aff/demo-cathay?ref=demo456',
        '单人往返不含税机票卡，实际以出票为准。',
        'Round-trip fare card per person, taxes excluded.',
        'visible', false, '管理员', $1, now() + interval '30 days')`,
    [BATCH]
  );

  // Machine-collected fares: the collector's shape (USD-normalised, verified).
  await client.query(
    `insert into deals (
       kind, provider, fingerprint, airport_iata, destination, destination_iata,
       destination_country, destination_city, airline, airline_code, flight_numbers,
       stops, duration_minutes, price, currency, price_usd, fx_rate, tax_included,
       cabin, trip_type, travel_from, booking_url, booking_partner, baseline_usd,
       discount_pct, deal_score, is_deal, status, verified_at, expires_at, batch_id
     ) values
       ('fare', 'demo', 'demo-fare-pvg-bkk', 'PVG', '曼谷', 'BKK', 'TH', 'Bangkok',
        'Thai Airways', 'TG', 'TG665', 0, 270, 179, 'USD', 179, 1, true,
        'economy', 'oneway', current_date + 10,
        'https://example.com/deep/thai-pvg-bkk', 'travelpayouts', 320, 44, 88,
        true, 'visible', now(), now() + interval '7 days', $1),
       ('fare', 'demo', 'demo-fare-pek-icn', 'PEK', '首尔', 'ICN', 'KR', 'Seoul',
        'Korean Air', 'KE', 'KE854', 1, 320, 129, 'USD', 129, 1, true,
        'economy', 'oneway', current_date + 14,
        'https://example.com/deep/ke-pek-icn', 'travelpayouts', 210, 39, 76,
        true, 'visible', now(), now() + interval '7 days', $1)`,
    [BATCH]
  );

  inserted = await client.query(
    `select id, kind, airport_iata, destination, price, currency, aff_url
       from deals where batch_id = $1 order by id`,
    [BATCH]
  );
}

await client.query('commit');

if (CLEAR) {
  console.log(`Removed ${removed.rowCount ?? 0} demo deal(s).`);
} else {
  console.log(
    `Removed ${removed.rowCount ?? 0} old demo row(s); inserted ${inserted.rowCount}.`
  );
  console.table(inserted.rows);
}
} catch (error) {
  await client.query('rollback');
  throw error;
} finally {
  await client.end();
}
