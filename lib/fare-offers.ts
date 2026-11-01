import { query, queryOne } from '@/lib/db';
import { DEAL_COLUMNS, DEAL_JOINS, toPublicDeal, type DealRow } from '@/lib/deals';
import type { PublicDeal } from '@/lib/deal-format';
import type { Locale } from '@/lib/i18n/config';

/**
 * Server-side reads for machine-collected fares — the `kind = 'fare'` slice of
 * the merged `deals` table (`db/schema.ts`).
 *
 * The feed is deliberately narrower than the table: only visible, tax-inclusive
 * offers that clear the deal thresholds and depart inside the window are ever
 * listed. Everything else is the collector's business, not the reader's. The
 * row shape and the mapper are shared with lib/deals.ts so a fare card and a
 * community card can never drift apart.
 */

export const FARE_MARKETS = ['all', 'us', 'cn'] as const;
/** Which origin market a listing covers. `all` = both. */
export type FareMarket = (typeof FARE_MARKETS)[number];

export const FARE_SCOPES = ['all', 'domestic', 'international'] as const;
export type FareScope = (typeof FARE_SCOPES)[number];

export type FareFilters = {
  /** Price cap in USD, exclusive (`under 100` → `< 100`). */
  underUsd?: number | null;
  scope?: FareScope;
  market?: FareMarket;
  origin?: string | null;
  destination?: string | null;
  nonstopOnly?: boolean;
  /** How far ahead departures may be, in days. Defaults to 120. */
  departWithinDays?: number;
  limit?: number;
  offset?: number;
};

type FareRow = DealRow & { total_count?: number };

/** Shared WHERE clause + parameter list, so the listing and its count agree. */
function fareWhere(filters: FareFilters): { sql: string; params: unknown[] } {
  const scope = filters.scope && filters.scope !== 'all' ? filters.scope : null;
  const market =
    filters.market === 'us' ? 'US' : filters.market === 'cn' ? 'CN' : null;
  const days = Math.min(Math.max(filters.departWithinDays ?? 120, 1), 365);
  const params = [
    filters.origin?.toUpperCase() ?? null,
    filters.destination?.toUpperCase() ?? null,
    filters.underUsd ?? null,
    scope,
    market,
    filters.nonstopOnly === true,
    days,
  ];

  return {
    params,
    sql: `
      d.kind = 'fare'
      and d.status = 'visible'
      and d.is_deal
      and d.tax_included
      and d.expires_at > now()
      and d.travel_from >= current_date
      and d.travel_from <= current_date + ($7::int)
      and ($1::text is null or d.airport_iata = $1)
      and ($2::text is null or d.destination_iata = $2)
      and ($3::numeric is null or d.price_usd < $3)
      and ($4::text is null
           or ($4 = 'domestic' and d.destination_country = a.country_code)
           or ($4 = 'international' and d.destination_country <> a.country_code))
      and ($5::text is null or a.country_code = $5)
      and ($6::boolean is not true or d.stops = 0)`,
  };
}

/**
 * One page of verified fares, cheapest-first within the deal score. `total`
 * comes from a window function so the page and its pagination share one query;
 * an empty page past the end falls back to a count query (same shape as
 * listDeals) so the pager can still correct itself.
 */
export async function listFareOffers(
  locale: Locale,
  filters: FareFilters = {}
): Promise<{ offers: PublicDeal[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 60);
  const offset = Math.min(Math.max(filters.offset ?? 0, 0), 5000);
  const { sql: where, params } = fareWhere(filters);

  const rows = await query<FareRow>(
    `select ${DEAL_COLUMNS}, count(*) over()::int as total_count
       ${DEAL_JOINS}
      where ${where}
      order by d.deal_score desc nulls last, d.price_usd asc, d.travel_from asc, d.id asc
      limit $8 offset $9`,
    [...params, limit, offset]
  );

  if (rows.length > 0) {
    return {
      offers: rows.map((row) => toPublicDeal(row, locale)),
      total: rows[0]?.total_count ?? 0,
    };
  }

  const count = await queryOne<{ total: number }>(
    `select count(*)::int as total ${DEAL_JOINS} where ${where}`,
    params
  );
  return { offers: [], total: count?.total ?? 0 };
}

/** One fare, or null — used when a card needs the row behind an id. */
export async function getFareOfferById(id: number): Promise<PublicDeal | null> {
  const row = await queryOne<FareRow>(
    `select ${DEAL_COLUMNS} ${DEAL_JOINS} where d.kind = 'fare' and d.id = $1`,
    [id]
  );
  return row ? toPublicDeal(row, 'en') : null;
}

export type FareStats = {
  offers: number;
  airports: number;
  /** Cheapest live fare in USD, or null when the table is empty. */
  minUsd: number | null;
};

/** Hero figures for /deals and the landing pages. */
export async function getFareStats(): Promise<FareStats> {
  const row = await queryOne<{ offers: number; airports: number; min_usd: number | null }>(
    `select count(*)::int as offers,
            count(distinct airport_iata)::int as airports,
            min(price_usd)::float8 as min_usd
       from deals
      where kind = 'fare' and status = 'visible' and is_deal and expires_at > now()`
  );
  return {
    offers: row?.offers ?? 0,
    airports: row?.airports ?? 0,
    minUsd: row?.min_usd ?? null,
  };
}

/** Origins with at least one live fare, for /deals/from/[iata] and the sitemap. */
export async function listFareOriginCodes(
  limit = 100
): Promise<{ iata: string; count: number; minUsd: number }[]> {
  const rows = await query<{ iata: string; count: number; min_usd: number }>(
    `select airport_iata as iata, count(*)::int as count, min(price_usd)::float8 as min_usd
       from deals
      where kind = 'fare' and status = 'visible' and is_deal
        and expires_at > now() and travel_from >= current_date
      group by airport_iata
      order by min(price_usd) asc
      limit $1`,
    [Math.min(Math.max(limit, 1), 300)]
  );
  return rows.map((row) => ({ iata: row.iata, count: row.count, minUsd: row.min_usd }));
}

export type FareMapPoint = { iata: string; minUsd: number; count: number };

/**
 * Map overlay data: one point per origin airport with its cheapest fare.
 * Served by /api/fare-airports with a short s-maxage, so the page never pays
 * this query on first paint.
 */
export async function getFareMapPoints(): Promise<FareMapPoint[]> {
  const rows = await query<{ iata: string; min_usd: number; count: number }>(
    `select airport_iata as iata, min(price_usd)::float8 as min_usd, count(*)::int as count
       from deals
      where kind = 'fare' and status = 'visible' and is_deal and tax_included
        and expires_at > now() and travel_from >= current_date
      group by airport_iata`
  );
  return rows.map((row) => ({ iata: row.iata, minUsd: row.min_usd, count: row.count }));
}
