import { createHash } from 'node:crypto';
import { query, queryOne } from '@/lib/db';
import {
  type DealCabin,
  type DealErrorCode,
  type DealTripType,
  type OwnDeal,
  type PublicDeal,
  isDealCabin,
  isDealTripType,
} from '@/lib/deal-format';
import type { Locale } from '@/lib/i18n/config';

/**
 * Reader-submitted airfare deals (db/schema.ts → `deals`).
 *
 * Publication is immediate — a submission with a valid session is inserted as
 * `status = 'visible'` — so the guards that matter are at write time:
 *
 *   - sign-in is required by the API route (no anonymous offers),
 *   - per-user and per-IP quotas (24h windows) stop a single account flooding,
 *   - a double-click within ten minutes returns the existing row,
 *   - the URL must be http(s), so a submission cannot smuggle `javascript:`.
 *
 * Stale offers disappear from listings through `expires_at`, not moderation.
 * Hiding spam is `scripts/deals.mjs hide <id>`, the same escape hatch the
 * comment system has.
 */

export const MAX_DESTINATION_LENGTH = 60;
export const MAX_AIRLINE_LENGTH = 60;
export const MAX_NOTES_LENGTH = 600;
export const MAX_BOOKING_URL_LENGTH = 600;
export const MAX_PRICE = 1_000_000;

/** Offers one account may publish per rolling day. */
const DAILY_DEALS_PER_USER = 10;
/** Offers one address may publish per rolling day (shared devices, offices). */
const DAILY_DEALS_PER_IP = 20;
/** A repeat submission inside this window is treated as a double click. */
const DUPLICATE_WINDOW_MINUTES = 10;
/** How long an offer without a travel end date stays listed. */
const DEFAULT_LISTING_DAYS = 30;

export type DealDraft = {
  airportIata: string;
  destination: string;
  airline: string;
  /** Normalised to two decimals, as a string for numeric(10,2). */
  price: string;
  currency: string;
  cabin: DealCabin;
  tripType: DealTripType;
  travelFrom: string | null;
  travelTo: string | null;
  bookingUrl: string;
  notes: string;
};

/** Alias kept for the API route's import; the union lives in lib/deal-format. */
export type DealError = DealErrorCode;

export type DealValidation =
  | { ok: true; draft: DealDraft }
  | { ok: false; error: DealError };

/** Strips control characters and collapses runaway whitespace. */
function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanLine(value: unknown): string {
  return cleanText(value).replace(/\s+/g, ' ').trim();
}

/** YYYY-MM-DD, or null when the field is empty; undefined when malformed. */
function parseDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return undefined;
  const raw = value.trim();
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) return undefined;
  return raw;
}

/** Today in UTC, the reference for "not in the past" checks. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function oneYearAheadIso(): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 2);
  return date.toISOString().slice(0, 10);
}

/**
 * Validates a submission and returns the normalised draft. The checks mirror
 * the database constraints; anything that passes here is safe to insert.
 */
export function validateDealInput(payload: Record<string, unknown>): DealValidation {
  const airportIata = cleanLine(payload.airportIata).toUpperCase();
  if (!/^[A-Z]{3}$/.test(airportIata)) return { ok: false, error: 'invalid_airport' };

  const destination = cleanLine(payload.destination);
  if (
    [...destination].length < 2 ||
    [...destination].length > MAX_DESTINATION_LENGTH
  ) {
    return { ok: false, error: 'invalid_destination' };
  }

  const airline = cleanLine(payload.airline);
  if ([...airline].length < 2 || [...airline].length > MAX_AIRLINE_LENGTH) {
    return { ok: false, error: 'invalid_airline' };
  }

  const rawPrice =
    typeof payload.price === 'number'
      ? payload.price
      : Number(String(payload.price ?? '').replace(/[,\s]/g, ''));
  if (!Number.isFinite(rawPrice) || rawPrice <= 0 || rawPrice > MAX_PRICE) {
    return { ok: false, error: 'invalid_price' };
  }
  const price = rawPrice.toFixed(2);

  const currency = cleanLine(payload.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, error: 'invalid_currency' };

  const cabin = payload.cabin ?? 'economy';
  if (!isDealCabin(cabin)) return { ok: false, error: 'invalid_cabin' };

  const tripType = payload.tripType ?? 'oneway';
  if (!isDealTripType(tripType)) return { ok: false, error: 'invalid_trip_type' };

  const travelFrom = parseDate(payload.travelFrom);
  const travelTo = parseDate(payload.travelTo);
  if (travelFrom === undefined || travelTo === undefined) {
    return { ok: false, error: 'invalid_dates' };
  }
  if (travelFrom && travelTo && travelTo < travelFrom) {
    return { ok: false, error: 'invalid_dates' };
  }
  // A fare that can no longer be flown is not useful; allow today.
  const lastDate = travelTo ?? travelFrom;
  if (lastDate && lastDate < todayIso()) return { ok: false, error: 'invalid_dates' };
  const firstDate = travelFrom ?? travelTo;
  if (firstDate && firstDate > oneYearAheadIso()) {
    return { ok: false, error: 'invalid_dates' };
  }

  const bookingUrl = cleanLine(payload.bookingUrl);
  if (bookingUrl.length > MAX_BOOKING_URL_LENGTH) return { ok: false, error: 'invalid_url' };
  try {
    const url = new URL(bookingUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, error: 'invalid_url' };
    }
    if (url.username || url.password) return { ok: false, error: 'invalid_url' };
    // A host without a dot is an internal name, not a booking page.
    if (!url.hostname.includes('.')) return { ok: false, error: 'invalid_url' };
  } catch {
    return { ok: false, error: 'invalid_url' };
  }

  const notes = cleanText(payload.notes);
  if ([...notes].length > MAX_NOTES_LENGTH) return { ok: false, error: 'invalid_notes' };

  return {
    ok: true,
    draft: {
      airportIata,
      destination,
      airline,
      price,
      currency,
      cabin,
      tripType,
      travelFrom,
      travelTo,
      bookingUrl,
      notes,
    },
  };
}

/** Salted address hash for quota checks; never the raw address. */
export function dealIpHash(ip: string): string {
  const salt = process.env.DEALS_IP_SALT ?? process.env.COMMENTS_IP_SALT ?? 'airport-maps-deals';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

// ------------------------------------------------------------------- reading

type DealRow = {
  id: number;
  airport_iata: string;
  destination: string;
  destination_en: string | null;
  airline: string;
  airline_en: string | null;
  price: string;
  currency: string;
  cabin: DealCabin;
  trip_type: DealTripType;
  travel_from: string | null;
  travel_to: string | null;
  booking_url: string | null;
  notes: string;
  notes_en: string | null;
  tax_included: boolean;
  is_official: boolean;
  status: 'visible' | 'hidden';
  submitter_name: string;
  created_at: Date;
  expires_at: Date;
  airport_name: string;
  airport_name_tw: string | null;
  airport_name_en: string | null;
  airport_city: string;
  airport_city_tw: string | null;
  airport_city_en: string | null;
  airport_country_code: string;
  flag_url: string | null;
  total_count?: number;
};

const DEAL_COLUMNS = `
  d.id, d.airport_iata, d.destination, d.destination_en,
  d.airline, d.airline_en, d.price, d.currency,
  d.cabin, d.trip_type,
  -- date columns are cast to text: pg would otherwise hand back a JS Date at
  -- the server's local midnight, which serialises to the previous day in UTC.
  d.travel_from::text as travel_from, d.travel_to::text as travel_to,
  d.booking_url, d.notes, d.notes_en, d.tax_included, d.is_official,
  d.status, d.submitter_name, d.created_at, d.expires_at,
  a.name as airport_name, a.name_tw as airport_name_tw, a.name_en as airport_name_en,
  a.city as airport_city, a.city_tw as airport_city_tw, a.city_en as airport_city_en,
  a.country_code as airport_country_code, c.flag_url`;

const DEAL_JOINS = `
  from deals d
  join airports a on a.iata = d.airport_iata
  join countries c on c.code = a.country_code`;

/** Airport/city wording for a deal card. */
function localizedAirport(
  locale: Locale,
  zh: string,
  tw: string | null,
  en: string | null
): string {
  if (locale === 'zh') return zh;
  if (locale === 'tw') return tw ?? zh;
  return en ?? zh;
}

/**
 * English-primary rendering for official fare cards: on non-Chinese locales an
 * English value is followed by the Chinese source in parentheses, so the page
 * reads in English first while the original wording stays available. Chinese
 * locales keep the Chinese primary and do not append an English duplicate.
 */
function localizedDealText(
  locale: Locale,
  zh: string,
  en: string | null | undefined
): string {
  if (locale === 'zh' || locale === 'tw' || !en) return zh;
  const primary = en.trim();
  const auxiliary = zh.trim();
  if (!primary) return zh;
  return auxiliary && primary !== auxiliary ? `${primary} (${auxiliary})` : primary;
}

function toPublicDeal(row: DealRow, locale: Locale): PublicDeal {
  const chinesePrimary = locale === 'zh' || locale === 'tw';
  // The destination gets its own auxiliary line: an English name plus a Chinese
  // parenthetical is too wide for the card's route row and would wrap mid-word.
  const destination =
    chinesePrimary || !row.destination_en ? row.destination : row.destination_en;
  const destinationAlt =
    chinesePrimary || !row.destination_en || row.destination_en === row.destination
      ? null
      : row.destination;

  return {
    id: row.id,
    airport: {
      iata: row.airport_iata,
      name: localizedAirport(locale, row.airport_name, row.airport_name_tw, row.airport_name_en),
      city: localizedAirport(locale, row.airport_city, row.airport_city_tw, row.airport_city_en),
      countryCode: row.airport_country_code,
      flagUrl: row.flag_url,
    },
    destination,
    destinationAlt,
    airline: localizedDealText(locale, row.airline, row.airline_en),
    price: Number(row.price),
    currency: row.currency,
    cabin: row.cabin,
    tripType: row.trip_type,
    travelFrom: row.travel_from,
    travelTo: row.travel_to,
    bookingUrl: row.booking_url,
    notes: localizedDealText(locale, row.notes, row.notes_en),
    taxIncluded: row.tax_included,
    isOfficial: row.is_official,
    submitterName: row.submitter_name,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
  };
}

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export type DealFilters = {
  locale: Locale;
  airport?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
};

/**
 * Public listing: visible, unexpired offers newest first. `total` comes from a
 * window function so the page and its "load more" share one round-trip.
 */
export async function listDeals(filters: DealFilters): Promise<{
  deals: PublicDeal[];
  total: number;
}> {
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 60);
  const offset = Math.min(Math.max(filters.offset ?? 0, 0), 5000);
  const airport = filters.airport?.toUpperCase() ?? null;
  const q = filters.q?.trim() ? likePattern(filters.q.trim().slice(0, 80)) : null;

  const rows = await query<DealRow>(
    `select ${DEAL_COLUMNS}, count(*) over()::int as total_count
       ${DEAL_JOINS}
      where d.status = 'visible' and d.expires_at > now()
        and ($1::text is null or d.airport_iata = $1)
        and ($2::text is null or d.destination ilike $2 escape '\\'
                           or d.destination_en ilike $2 escape '\\'
                           or d.airline ilike $2 escape '\\'
                           or d.airline_en ilike $2 escape '\\')
      order by d.created_at desc, d.id desc
      limit $3 offset $4`,
    [airport, q, limit, offset]
  );

  if (rows.length > 0) {
    return {
      deals: rows.map((row) => toPublicDeal(row, filters.locale)),
      total: rows[0]?.total_count ?? 0,
    };
  }

  // An empty page past the end has no window-function total to read, but the
  // pagination still needs the real count to redirect to the last page. One
  // cheap count query only on the empty path keeps the normal listing to a
  // single round-trip.
  const count = await queryOne<{ total: number }>(
    `select count(*)::int as total
       from deals d
      where d.status = 'visible' and d.expires_at > now()
        and ($1::text is null or d.airport_iata = $1)
        and ($2::text is null or d.destination ilike $2 escape '\\'
                           or d.destination_en ilike $2 escape '\\'
                           or d.airline ilike $2 escape '\\'
                           or d.airline_en ilike $2 escape '\\')`,
    [airport, q]
  );

  return { deals: [], total: count?.total ?? 0 };
}

/** Deals departing from one airport, for its detail page. A missing table
 *  (deployment before the migration) must not take the page down, so a failed
 *  read degrades to "no offers" — the same policy as getCommentCounts. */
export async function getAirportDeals(
  locale: Locale,
  iata: string,
  limit = 4
): Promise<PublicDeal[]> {
  try {
    return (await listDeals({ locale, airport: iata.toUpperCase(), limit })).deals;
  } catch (error) {
    console.error('[deals] airport query failed', error);
    return [];
  }
}

/**
 * The submitter's own offers, newest first, including hidden and expired ones
 * so the page can explain what happened to a submission.
 */
export async function listUserDeals(
  locale: Locale,
  userId: number,
  limit = 50
): Promise<OwnDeal[]> {
  const rows = await query<DealRow>(
    `select ${DEAL_COLUMNS}
       ${DEAL_JOINS}
      where d.user_id = $1
      order by d.created_at desc, d.id desc
      limit $2`,
    [userId, Math.min(Math.max(limit, 1), 100)]
  );
  return rows.map((row) => ({ ...toPublicDeal(row, locale), status: row.status }));
}

/** One offer, or null — used to echo a just-created row back to the browser. */
export async function getDealById(locale: Locale, id: number): Promise<PublicDeal | null> {
  const row = await queryOne<DealRow>(
    `select ${DEAL_COLUMNS} ${DEAL_JOINS} where d.id = $1`,
    [id]
  );
  return row ? toPublicDeal(row, locale) : null;
}

/** True when the directory carries this departure airport. */
export async function dealAirportExists(iata: string): Promise<boolean> {
  const row = await queryOne<{ ok: number }>('select 1 as ok from airports where iata = $1', [
    iata.toUpperCase(),
  ]);
  return Boolean(row);
}

// ------------------------------------------------------------------ quota/meta

/** True when this account or address has published too much today. */
export async function isDealRateLimited(userId: number, ipHash: string): Promise<boolean> {
  const row = await queryOne<{ user_count: number; ip_count: number }>(
    `select
       (select count(*) from deals
         where user_id = $1 and created_at > now() - interval '24 hours')::int as user_count,
       (select count(*) from deals
         where ip_hash = $2 and created_at > now() - interval '24 hours')::int as ip_count`,
    [userId, ipHash]
  );
  return (
    (row?.user_count ?? 0) >= DAILY_DEALS_PER_USER ||
    (row?.ip_count ?? 0) >= DAILY_DEALS_PER_IP
  );
}

/**
 * A submission identical to one from the last ten minutes: a double click or a
 * retried request, so the existing row is returned instead of duplicated.
 */
export async function findRecentDuplicate(
  userId: number,
  draft: DealDraft
): Promise<number | null> {
  const row = await queryOne<{ id: number }>(
    `select id from deals
      where user_id = $1 and airport_iata = $2 and destination = $3
        and airline = $4 and price = $5 and currency = $6
        and created_at > now() - ($7 || ' minutes')::interval
      order by created_at desc
      limit 1`,
    [
      userId,
      draft.airportIata,
      draft.destination,
      draft.airline,
      draft.price,
      draft.currency,
      DUPLICATE_WINDOW_MINUTES,
    ]
  );
  return row?.id ?? null;
}

/**
 * When the offer stops being listed: end of its last travel date when the
 * submitter gave one, otherwise a month from now.
 */
function expiresAtFor(draft: DealDraft): Date {
  if (draft.travelTo) return new Date(`${draft.travelTo}T23:59:59.999Z`);
  return new Date(Date.now() + DEFAULT_LISTING_DAYS * 86_400_000);
}

/** Inserts the deal and returns it in public shape. */
export async function createDeal(
  locale: Locale,
  draft: DealDraft,
  submitter: { userId: number; name: string; ipHash: string }
): Promise<PublicDeal> {
  const row = await queryOne<{ id: number }>(
    `insert into deals (airport_iata, destination, airline, price, currency, cabin,
                        trip_type, travel_from, travel_to, booking_url, notes,
                        user_id, submitter_name, ip_hash, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     returning id`,
    [
      draft.airportIata,
      draft.destination,
      draft.airline,
      draft.price,
      draft.currency,
      draft.cabin,
      draft.tripType,
      draft.travelFrom,
      draft.travelTo,
      draft.bookingUrl,
      draft.notes,
      submitter.userId,
      submitter.name,
      submitter.ipHash,
      expiresAtFor(draft),
    ]
  );
  if (!row) throw new Error('insert into deals returned no row');
  const deal = await getDealById(locale, row.id);
  if (!deal) throw new Error(`deal ${row.id} vanished after insert`);
  return deal;
}
