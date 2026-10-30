import { query, queryOne } from '@/lib/db';
import type { FareFilters, FareOffer, FareOfferPage } from '@/lib/fare-format';
import type { Locale } from '@/lib/i18n/config';

/**
 * Server-side reads for machine-collected fares (`db/schema.ts` → fare_offers).
 *
 * Same conventions as lib/deals.ts: hand-written SQL because the listing needs
 * a window-function total and an index-friendly ORDER BY, one round-trip for a
 * page of cards, and NaN/`numeric` values converted to numbers at the boundary
 * so nothing downstream has to know how `pg` serialises them.
 *
 * The feed is deliberately narrower than the table: only `status = 'live'`,
 * `is_deal`, tax-inclusive offers inside the departure window are ever listed.
 * Everything else is the collector's business, not the reader's.
 */

type FareRow = {
  id: number;
  provider: string;
  origin_iata: string;
  destination_iata: string;
  destination_country: string;
  destination_city: string | null;
  airline_code: string | null;
  airline_name: string;
  flight_numbers: string | null;
  stops: number;
  duration_minutes: number | null;
  price_usd: string;
  baseline_usd: string | null;
  discount_pct: number | null;
  cabin: FareOffer['cabin'];
  trip_type: FareOffer['tripType'];
  depart_date: string;
  return_date: string | null;
  tax_included: boolean;
  verified_at: Date | null;
  deep_link: string;
  origin_city: string;
  origin_city_tw: string | null;
  origin_city_en: string | null;
  origin_name: string;
  origin_name_tw: string | null;
  origin_name_en: string | null;
  origin_country: string;
  flag_url: string | null;
  total_count?: number;
};

const FARE_COLUMNS = `
  o.id, o.provider, o.origin_iata, o.destination_iata, o.destination_country,
  o.destination_city, o.airline_code, o.airline_name, o.flight_numbers,
  o.stops, o.duration_minutes,
  o.price_usd, o.baseline_usd, o.discount_pct,
  o.cabin, o.trip_type,
  -- date columns as text: pg returns DATE at local midnight otherwise.
  o.depart_date::text as depart_date, o.return_date::text as return_date,
  o.tax_included, o.verified_at, o.deep_link,
  a.city as origin_city, a.city_tw as origin_city_tw, a.city_en as origin_city_en,
  a.name as origin_name, a.name_tw as origin_name_tw, a.name_en as origin_name_en,
  a.country_code as origin_country, c.flag_url`;

const FARE_JOINS = `
  from fare_offers o
  join airports a on a.iata = o.origin_iata
  join countries c on c.code = a.country_code`;

/** Airport/city wording in the page's language. */
function localized(
  locale: Locale,
  zh: string,
  tw: string | null,
  en: string | null
): string {
  if (locale === 'zh') return zh;
  if (locale === 'tw') return tw ?? zh;
  return en ?? zh;
}

function toFareOffer(row: FareRow, locale: Locale): FareOffer {
  return {
    id: row.id,
    provider: row.provider,
    origin: {
      iata: row.origin_iata,
      city: localized(locale, row.origin_city, row.origin_city_tw, row.origin_city_en),
      name: localized(locale, row.origin_name, row.origin_name_tw, row.origin_name_en),
      countryCode: row.origin_country,
      flagUrl: row.flag_url,
    },
    destination: {
      iata: row.destination_iata,
      city: row.destination_city,
      countryCode: row.destination_country,
    },
    airline: row.airline_name,
    airlineCode: row.airline_code,
    flights: row.flight_numbers,
    stops: row.stops,
    durationMinutes: row.duration_minutes,
    priceUsd: Number(row.price_usd),
    baselineUsd: row.baseline_usd == null ? null : Number(row.baseline_usd),
    discountPct: row.discount_pct,
    cabin: row.cabin,
    tripType: row.trip_type,
    departDate: row.depart_date,
    returnDate: row.return_date,
    taxIncluded: row.tax_included,
    verifiedAt: row.verified_at ? row.verified_at.toISOString() : null,
    deepLink: row.deep_link,
  };
}

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
      o.status = 'live'
      and o.is_deal
      and o.tax_included
      and o.expires_at > now()
      and o.depart_date >= current_date
      and o.depart_date <= current_date + ($7::int)
      and ($1::text is null or o.origin_iata = $1)
      and ($2::text is null or o.destination_iata = $2)
      and ($3::numeric is null or o.price_usd < $3)
      and ($4::text is null
           or ($4 = 'domestic' and o.destination_country = a.country_code)
           or ($4 = 'international' and o.destination_country <> a.country_code))
      and ($5::text is null or a.country_code = $5)
      and ($6::boolean is not true or o.stops = 0)`,
  };
}

/**
 * One page of verified deals, cheapest-first within the deal score. `total`
 * comes from a window function so the page and its pagination share one query;
 * an empty page past the end falls back to a count query (same shape as
 * listDeals) so the pager can still correct itself.
 */
export async function listFareOffers(
  locale: Locale,
  filters: FareFilters = {}
): Promise<FareOfferPage> {
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 60);
  const offset = Math.min(Math.max(filters.offset ?? 0, 0), 5000);
  const { sql: where, params } = fareWhere(filters);

  const rows = await query<FareRow>(
    `select ${FARE_COLUMNS}, count(*) over()::int as total_count
       ${FARE_JOINS}
      where ${where}
      order by o.deal_score desc nulls last, o.price_usd asc, o.depart_date asc, o.id asc
      limit $8 offset $9`,
    [...params, limit, offset]
  );

  if (rows.length > 0) {
    return { offers: rows.map((row) => toFareOffer(row, locale)), total: rows[0]?.total_count ?? 0 };
  }

  const count = await queryOne<{ total: number }>(
    `select count(*)::int as total ${FARE_JOINS} where ${where}`,
    params
  );
  return { offers: [], total: count?.total ?? 0 };
}

/** One offer, or null — used by the redirect route before logging a click. */
export async function getFareOfferById(id: number): Promise<FareOffer | null> {
  const row = await queryOne<FareRow>(
    `select ${FARE_COLUMNS} ${FARE_JOINS} where o.id = $1`,
    [id]
  );
  return row ? toFareOffer(row, 'en') : null;
}

/**
 * Fares departing one airport, for its detail page. A failed read degrades to
 * "no offers" rather than taking an ISR page down — the same policy as
 * getAirportDeals, and the same reason: a deployment before the migration must
 * still serve the airport page.
 */
export async function getAirportFareOffers(
  locale: Locale,
  iata: string,
  limit = 6
): Promise<FareOffer[]> {
  try {
    const { offers } = await listFareOffers(locale, {
      origin: iata.toUpperCase(),
      limit,
      departWithinDays: 120,
    });
    return offers;
  } catch (error) {
    console.error('[fares] airport query failed', error);
    return [];
  }
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
            count(distinct origin_iata)::int as airports,
            min(price_usd)::float8 as min_usd
       from fare_offers
      where status = 'live' and is_deal and expires_at > now()`
  );
  return {
    offers: row?.offers ?? 0,
    airports: row?.airports ?? 0,
    minUsd: row?.min_usd ?? null,
  };
}

/** Origins with at least one live deal, for /deals/from/[iata] and the sitemap. */
export async function listFareOriginCodes(
  limit = 100
): Promise<{ iata: string; count: number; minUsd: number }[]> {
  const rows = await query<{ iata: string; count: number; min_usd: number }>(
    `select origin_iata as iata, count(*)::int as count, min(price_usd)::float8 as min_usd
       from fare_offers
      where status = 'live' and is_deal and expires_at > now() and depart_date >= current_date
      group by origin_iata
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
    `select origin_iata as iata, min(price_usd)::float8 as min_usd, count(*)::int as count
       from fare_offers
      where status = 'live' and is_deal and tax_included
        and expires_at > now() and depart_date >= current_date
      group by origin_iata`
  );
  return rows.map((row) => ({ iata: row.iata, minUsd: row.min_usd, count: row.count }));
}
