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
  'invalid_notes',
] as const;
export type DealErrorCode = (typeof DEAL_ERROR_CODES)[number];

/** A deal as the API and every card render it. */
export type PublicDeal = {
  id: number;
  airport: {
    iata: string;
    name: string;
    city: string;
    countryCode: string;
    flagUrl: string | null;
  };
  destination: string;
  /** Chinese auxiliary under the English destination on non-Chinese pages. */
  destinationAlt: string | null;
  airline: string;
  price: number;
  /** ISO 4217, e.g. CNY. */
  currency: string;
  cabin: DealCabin;
  tripType: DealTripType;
  /** YYYY-MM-DD or null. */
  travelFrom: string | null;
  travelTo: string | null;
  /** Null for an official fare card without a single booking page. */
  bookingUrl: string | null;
  notes: string;
  /** Whether `price` includes taxes; official fare cards are often excl. */
  taxIncluded: boolean;
  /** Published by the site (admin) rather than submitted by a reader. */
  isOfficial: boolean;
  submitterName: string;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601; the listing cutoff. */
  expiresAt: string;
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

/** `{name}`-style substitution for the catalog's string templates. */
export function formatDealLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
