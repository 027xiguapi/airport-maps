/**
 * Client-safe fare vocabulary: the shape the cards and boards render plus the
 * formatting helpers they share with the server.
 *
 * Free of `lib/db` imports on purpose — `FareBoard` is a client component, and
 * the browser bundle must not pull the `pg` connection module in.
 */

export const FARE_MARKETS = ['all', 'us', 'cn'] as const;
/** Which origin market a listing covers. `all` = both. */
export type FareMarket = (typeof FARE_MARKETS)[number];

export const FARE_SCOPES = ['all', 'domestic', 'international'] as const;
export type FareScope = (typeof FARE_SCOPES)[number];

/** The price bands the static landing pages expose. */
export const FARE_UNDER_TIERS = [100, 200, 300] as const;
export type FareUnderTier = (typeof FARE_UNDER_TIERS)[number];

/** One offer as the API and every card render it. */
export type FareOffer = {
  id: number;
  provider: string;
  origin: {
    iata: string;
    city: string;
    name: string;
    countryCode: string;
    flagUrl: string | null;
  };
  destination: {
    iata: string;
    city: string | null;
    countryCode: string;
  };
  airline: string;
  airlineCode: string | null;
  /** Marketing numbers, comma separated, or null when the provider omits them. */
  flights: string | null;
  stops: number;
  durationMinutes: number | null;
  /** Always USD; the original price and rate live on the row, not on the card. */
  priceUsd: number;
  baselineUsd: number | null;
  discountPct: number | null;
  cabin: 'economy' | 'premium' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
  /** YYYY-MM-DD. */
  departDate: string;
  /** YYYY-MM-DD or null for a one-way. */
  returnDate: string | null;
  taxIncluded: boolean;
  /** ISO 8601, or null before the first successful re-check. */
  verifiedAt: string | null;
  /** Affiliate deep link; Phase 1 wraps this in /go for click attribution. */
  deepLink: string;
};

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

export type FareOfferPage = {
  offers: FareOffer[];
  total: number;
};

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

/** YYYY-MM-DD → a short date pinned to UTC so SSR and hydration agree. */
export function formatFareDate(value: string | null, lang: string): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
      date
    );
  } catch {
    return value;
  }
}
