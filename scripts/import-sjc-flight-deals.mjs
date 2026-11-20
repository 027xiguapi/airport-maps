/**
 * Imports the "Flights from San Jose" fare cards from the reference screenshots.
 *
 *   node scripts/import-sjc-flight-deals.mjs <fixture.json>           # dry run
 *   node scripts/import-sjc-flight-deals.mjs <fixture.json> --apply   # commit
 *
 * The script supports both `deals` layouts the project has shipped:
 *
 *   - merged/v1 schema (`kind` column): rows are machine fares
 *     (`kind = 'fare'`), keyed by (provider, fingerprint), with USD-normalised
 *     prices and scoring fields;
 *   - legacy schema (`is_official` column): rows are official cards
 *     (`is_official = true`) grouped by `batch_id`, matched by airline, trip
 *     type and travel window.
 *
 * SJC is inserted into `airports` when missing: `deals.airport_iata` references
 * `airports.iata`, and the curated directory seed does not carry San Jose. The
 * insert is `on conflict (iata) do nothing`, so an existing row is never
 * overwritten by this fixture.
 *
 * Re-running is idempotent on both layouts. The fixture is relative to the
 * moment it runs: "Just found" cards get a freshly stamped timestamp, cards
 * "found 1 hour ago" are backdated by an hour, and `expires_at` moves forward,
 * so the demo keeps matching the screenshot.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import pg from 'pg';

import { databaseUrl, ROOT } from './_env.mjs';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const apply = process.argv.includes('--apply');
const fixtureArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));

if (!fixtureArg) {
  console.error(
    'Usage: node scripts/import-sjc-flight-deals.mjs <fixture.json> [--apply]'
  );
  process.exit(1);
}

const dataPath = resolve(ROOT, fixtureArg);
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

if (!Array.isArray(data.deals) || data.deals.length === 0) {
  throw new Error('fixture has no deals');
}

/**
 * sha1(origin|destination|depart|return|cabin|trip|carrier|stops), the identity
 * documented on `deals.fingerprint` in db/schema.ts.
 */
function fingerprintFor(deal) {
  return createHash('sha1')
    .update(
      [
        data.airport.iata,
        deal.destinationIata,
        deal.travelFrom,
        deal.tripType === 'roundtrip' ? (deal.travelTo ?? '') : '',
        deal.cabin,
        deal.tripType,
        deal.airlineCode ?? deal.airlineEn,
        deal.stops,
      ].join('|')
    )
    .digest('hex');
}

const now = Date.now();

function firstSeenAtFor(deal) {
  if (deal.firstSeenHoursAgo != null) {
    return new Date(now - deal.firstSeenHoursAgo * HOUR_MS);
  }
  return new Date(now - (deal.firstSeenDaysAgo ?? 0) * DAY_MS);
}

/** Identity of one fixture card within a legacy batch (airline can repeat). */
function legacyKey(deal) {
  return [deal.airlineEn, deal.tripType, deal.travelFrom, deal.travelTo ?? '']
    .join('|')
    .toLowerCase();
}

const currency = String(data.currency).toUpperCase();

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

try {
  const target = new URL(databaseUrl());
  console.log(
    `database: ${target.host}${target.pathname} | batch: ${data.batchId} | ${apply ? 'APPLY' : 'DRY RUN'}`
  );

  await client.query('begin');

  const layout = await client.query(
    `select
       exists(select 1 from information_schema.columns
               where table_name = 'deals' and column_name = 'kind') as has_kind`
  );
  const modern = layout.rows[0]?.has_kind === true;

  const country = await client.query('select 1 from countries where code = $1', [
    data.airport.countryCode,
  ]);
  if (country.rowCount === 0) {
    throw new Error(`country ${data.airport.countryCode} is missing from the directory`);
  }

  const airport = await client.query(
    `insert into airports
       (iata, slug, name, name_tw, name_en, city, city_tw, city_en,
        country_code, gate_count, annual_pax_m, distance_km)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     on conflict (iata) do nothing
     returning iata`,
    [
      data.airport.iata,
      data.airport.slug,
      data.airport.name,
      data.airport.nameTw,
      data.airport.nameEn,
      data.airport.city,
      data.airport.cityTw,
      data.airport.cityEn,
      data.airport.countryCode,
      data.airport.gateCount,
      data.airport.annualPaxM,
      data.airport.distanceKm,
    ]
  );
  const airportCreated = airport.rowCount > 0;
  if (!airportCreated) {
    const existing = await client.query('select 1 from airports where iata = $1', [
      data.airport.iata,
    ]);
    if (existing.rowCount === 0) throw new Error(`could not insert or find ${data.airport.iata}`);
  }

  let inserted = 0;
  let updated = 0;
  let pruned = 0;

  if (modern) {
    for (const deal of data.deals) {
      const fingerprint = fingerprintFor(deal);
      const firstSeenAt = firstSeenAtFor(deal);
      const expiresAt = new Date(now + data.expiryDays * DAY_MS);

      const result = await client.query(
        `insert into deals (
           kind, provider, fingerprint, airport_iata, destination, destination_en,
           destination_iata, destination_country, destination_city,
           airline, airline_en, airline_code, flight_numbers, stops, duration_minutes,
           price, currency, price_usd, fx_rate, tax_included,
           cabin, trip_type, travel_from, travel_to, booking_url, aff_url,
           booking_partner, notes, notes_en, baseline_usd, discount_pct, deal_score,
           is_deal, status, submitter_name, batch_id,
           created_at, updated_at, first_seen_at, last_seen_at, verified_at,
           expires_at, raw
         ) values (
           'fare', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
           $15, $16, $17, 1, true, $18, $19, $20, $21, $22, null, $23, $24, $25,
           $26, $27, $28, true, 'visible', null, $29, $30, $31, $32, $33, $34,
           $35, $36::jsonb
         )
         on conflict (provider, fingerprint) do update set
           kind = excluded.kind,
           airport_iata = excluded.airport_iata,
           destination = excluded.destination,
           destination_en = excluded.destination_en,
           destination_iata = excluded.destination_iata,
           destination_country = excluded.destination_country,
           destination_city = excluded.destination_city,
           airline = excluded.airline,
           airline_en = excluded.airline_en,
           airline_code = excluded.airline_code,
           flight_numbers = excluded.flight_numbers,
           stops = excluded.stops,
           duration_minutes = excluded.duration_minutes,
           price = excluded.price,
           currency = excluded.currency,
           price_usd = excluded.price_usd,
           fx_rate = excluded.fx_rate,
           tax_included = excluded.tax_included,
           cabin = excluded.cabin,
           trip_type = excluded.trip_type,
           travel_from = excluded.travel_from,
           travel_to = excluded.travel_to,
           booking_url = excluded.booking_url,
           aff_url = excluded.aff_url,
           booking_partner = excluded.booking_partner,
           notes = excluded.notes,
           notes_en = excluded.notes_en,
           baseline_usd = excluded.baseline_usd,
           discount_pct = excluded.discount_pct,
           deal_score = excluded.deal_score,
           is_deal = excluded.is_deal,
           status = excluded.status,
           submitter_name = excluded.submitter_name,
           batch_id = excluded.batch_id,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at,
           first_seen_at = excluded.first_seen_at,
           last_seen_at = excluded.last_seen_at,
           verified_at = excluded.verified_at,
           expires_at = excluded.expires_at,
           raw = excluded.raw
         returning (xmax = 0) as inserted`,
        [
          data.provider,
          fingerprint,
          data.airport.iata,
          deal.destination,
          deal.destinationEn,
          deal.destinationIata,
          deal.destinationCountry,
          deal.destinationCity,
          deal.airline,
          deal.airlineEn,
          deal.airlineCode,
          deal.flightNumbers,
          deal.stops,
          deal.durationMinutes,
          deal.price,
          currency,
          deal.priceUsd ?? deal.price,
          deal.cabin,
          deal.tripType,
          deal.travelFrom,
          deal.travelTo,
          deal.bookingUrl,
          deal.bookingPartner ?? 'airline',
          deal.notes ?? '',
          deal.notesEn ?? null,
          deal.baselineUsd,
          deal.discountPct,
          deal.dealScore,
          data.batchId,
          firstSeenAt,
          new Date(now),
          firstSeenAt,
          new Date(now),
          new Date(now),
          expiresAt,
          JSON.stringify({ source: 'screenshot', card: deal.cardLabel ?? null }),
        ]
      );

      if (result.rows[0]?.inserted) inserted += 1;
      else updated += 1;
    }
  } else {
    // Legacy layout: no kind/fingerprint. The batch id plus the origin is the
    // import's identity; route, trip type and travel window match one card.
    const existing = await client.query(
      `select id, airline_en, trip_type,
              travel_from::text as travel_from, travel_to::text as travel_to
         from deals
        where batch_id = $1 and airport_iata = $2
        order by id`,
      [data.batchId, data.airport.iata]
    );
    const byKey = new Map(
      existing.rows.map((row) => [
        legacyKey({
          airlineEn: row.airline_en,
          tripType: row.trip_type,
          travelFrom: row.travel_from,
          travelTo: row.travel_to,
        }),
        row.id,
      ])
    );
    const expiresAt = new Date(
      now + (data.legacyExpiryDays ?? data.expiryDays) * DAY_MS
    );
    const submitterName = data.legacySubmitterName ?? 'Expedia 特价';

    for (const deal of data.deals) {
      const createdAt = firstSeenAtFor(deal);
      const params = [
        data.airport.iata,
        deal.destination,
        deal.destinationEn,
        deal.airline,
        deal.airlineEn,
        deal.price,
        currency,
        deal.cabin,
        deal.tripType,
        deal.travelFrom,
        deal.travelTo,
        deal.bookingUrl,
        deal.notes ?? '',
        deal.notesEn ?? null,
        createdAt,
        new Date(now),
        expiresAt,
        data.batchId,
        submitterName,
      ];
      const id = byKey.get(legacyKey(deal));

      if (id) {
        await client.query(
          `update deals set
             airport_iata = $1, destination = $2, destination_en = $3,
             airline = $4, airline_en = $5, price = $6, currency = $7,
             cabin = $8, trip_type = $9, travel_from = $10, travel_to = $11,
             booking_url = $12, notes = $13, notes_en = $14,
             created_at = $15, updated_at = $16, expires_at = $17,
             batch_id = $18, submitter_name = $19,
             tax_included = true, is_official = true, status = 'visible'
           where id = $20`,
          [...params, id]
        );
        updated += 1;
      } else {
        await client.query(
          `insert into deals (
             airport_iata, destination, destination_en, airline, airline_en,
             price, currency, cabin, trip_type, travel_from, travel_to,
             booking_url, notes, notes_en, created_at, updated_at, expires_at,
             batch_id, submitter_name, tax_included, is_official, status
           ) values (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
             $15, $16, $17, $18, $19, true, true, 'visible'
           )`,
          params
        );
        inserted += 1;
      }
    }
  }

  // A fixture describes one full tab capture. `replaceBatch` keeps that promise
  // on re-import: rows the capture no longer lists (e.g. an older travel date
  // for the same price) are removed, so the page never shows both captures.
  if (data.replaceBatch) {
    const rows = await client.query(
      modern
        ? `select id, fingerprint, airline_en, trip_type,
                  travel_from::text as travel_from, travel_to::text as travel_to
             from deals
            where batch_id = $1`
        : `select id, airline_en, trip_type,
                  travel_from::text as travel_from, travel_to::text as travel_to
             from deals
            where batch_id = $1`,
      [data.batchId]
    );
    const keep = new Set(
      data.deals.map((deal) => (modern ? fingerprintFor(deal) : legacyKey(deal)))
    );
    const staleIds = rows.rows
      .filter((row) => {
        const key = modern
          ? row.fingerprint
          : legacyKey({
              airlineEn: row.airline_en,
              tripType: row.trip_type,
              travelFrom: row.travel_from,
              travelTo: row.travel_to,
            });
        return !keep.has(key);
      })
      .map((row) => row.id);

    if (staleIds.length > 0) {
      await client.query('delete from deals where id = any($1::int[])', [staleIds]);
      pruned = staleIds.length;
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
      fixture: fixtureArg,
      layout: modern ? 'merged/v1 (kind=fare)' : 'legacy (is_official)',
      airport: `${airportCreated ? 'created' : 'existing'} ${data.airport.iata}`,
      inserted,
      updated,
      pruned,
      total: data.deals.length,
      batchId: data.batchId,
    })
  );
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
