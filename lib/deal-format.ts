/**
 * Client-safe deal vocabulary: types, enums, and locale-aware formatting.
 *
 * Kept free of `lib/db` imports so the card and the submission form can import
 * it from the browser bundle. Server queries and validation live in
 * `lib/deals.ts`.
 */

export const DEAL_CABINS = ['economy', 'premium', 'business', 'first'] as const;
export type DealCabin = (typeof DEAL_CABINS)[number];

export const DEAL_TRIP_TYPES = ['oneway', 'roundtrip'] as const;
export type DealTripType = (typeof DEAL_TRIP_TYPES)[number];

/**
 * Where a row came from: a reader, an administrator, or the fare collector.
 * One table holds all three; the card and the admin screen branch on this.
 */
export const DEAL_KINDS = ['community', 'official', 'fare'] as const;
export type DealKind = (typeof DEAL_KINDS)[number];

/**
 * Validation failures the submission form has to explain. Kept here (not in
 * lib/deals.ts) because the browser bundle imports the union as a type and
 * must not pull in the database module.
 */
export const DEAL_ERROR_CODES = [
  'invalid_airport',
  'invalid_destination',
  'invalid_airline',
  'invalid_price',
  'invalid_currency',
  'invalid_cabin',
  'invalid_trip_type',
  'invalid_dates',
  'invalid_url',
  'invalid_aff_url',
  'invalid_notes',
] as const;
export type DealErrorCode = (typeof DEAL_ERROR_CODES)[number];

/** A deal as the API and every card render it. */
export type PublicDeal = {
  id: number;
  /** community | official | fare — see DEAL_KINDS. */
  kind: DealKind;
  airport: {
    iata: string;
    name: string;
    city: string;
    countryCode: string;
    flagUrl: string | null;
  };
  destination: string;
  /** Secondary destination line (English/Chinese pair, or the fare city). */
  destinationAlt: string | null;
  /** Arrival IATA; machine fares only. */
  destinationIata: string | null;
  /** Arrival country (ISO 3166-1 alpha-2); machine fares only. */
  destinationCountry: string | null;
  airline: string;
  airlineCode: string | null;
  price: number;
  /** ISO 4217, e.g. CNY. */
  currency: string;
  /** USD-normalised price; machine fares only. */
  priceUsd: number | null;
  cabin: DealCabin;
  tripType: DealTripType;
  /** YYYY-MM-DD or null. */
  travelFrom: string | null;
  travelTo: string | null;
  /** Null for an official fare card without a single booking page. */
  bookingUrl: string | null;
  /**
   * Affiliate link to use for the CTA. An explicitly stored link, or the
   * booking URL with the site's affiliate parameters appended for machine
   * fares. Null means "use bookingUrl unchanged".
   */
  affUrl: string | null;
  notes: string;
  /** Whether `price` includes taxes; official fare cards are often excl. */
  taxIncluded: boolean;
  /** Null for machine fares. */
  submitterName: string | null;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601; the listing cutoff. */
  expiresAt: string;

  // ---- machine fares only (all null on human cards) ----
  provider: string | null;
  stops: number | null;
  durationMinutes: number | null;
  /** Marketing numbers, comma separated. */
  flightNumbers: string | null;
  discountPct: number | null;
  dealScore: number | null;
  /** ISO 8601; last successful re-check. */
  verifiedAt: string | null;
};

/** A deal as its own submitter sees it (adds the moderation state). */
export type OwnDeal = PublicDeal & { status: 'visible' | 'hidden' };

export function isDealCabin(value: unknown): value is DealCabin {
  return typeof value === 'string' && (DEAL_CABINS as readonly string[]).includes(value);
}

export function isDealTripType(value: unknown): value is DealTripType {
  return typeof value === 'string' && (DEAL_TRIP_TYPES as readonly string[]).includes(value);
}

/** Same formatter on the server and the client, so hydration cannot mismatch. */
export function formatDealPrice(price: number, currency: string, lang: string): string {
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
      // A fare of 480 is not "480.00"; a fare of 479.5 keeps its cents.
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

/** US dollar amount in the page language ("$199", "199 US$"). */
export function formatUsd(amount: number, lang: string): string {
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

/**
 * Flight time for a card footer. Uses the compact `7h 20m` form everywhere
 * except the CJK locales, where the unit words read better than the letters.
 */
export function formatDuration(minutes: number | null, lang: string): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (lang.startsWith('zh') || lang.startsWith('ko')) {
    return `${hours}小时${rest > 0 ? `${rest}分` : ''}`;
  }
  if (lang.startsWith('ja')) return `${hours}時間${rest > 0 ? `${rest}分` : ''}`;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

/** YYYY-MM-DD → a short date in the page language, pinned to UTC. */
export function formatDealDate(value: string | null, lang: string): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(lang, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return value;
  }
}

/**
 * ISO timestamp → localized date + time in the site's time zone.
 *
 * Pinning the time zone matters for hydration: the card is rendered on the
 * server and again in the browser, and a browser-local clock would produce a
 * different string on the first client render. Asia/Shanghai is the operating
 * time zone of the fare data and the admin, so submission times read naturally
 * on the Chinese pages and stay stable everywhere else.
 */
export function formatDealDateTime(value: string | null, lang: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Shanghai',
    }).format(date);
  } catch {
    return value.slice(0, 16).replace('T', ' ');
  }
}

/** `{name}`-style substitution for the catalog's string templates. */
export function formatDealLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
