import { getFlightNumberRecords } from './flight-store';
import {
  getAirlineName,
  getFlightDataDate,
  getFlightPlaces,
  getRelatedFlightNumbers,
  type FlightPlace,
} from './flights';
import { localizedPath, type Locale } from './i18n/config';

/**
 * Data for the standalone /flight/<number> pages.
 *
 * scripts/fetch-flights.mjs writes one gzipped JSON document
 * (`data/flights.json.gz`) with every route in the snapshot. lib/flight-store
 * indexes it by flight number on first use, so a page resolves its number
 * without opening a prefix shard. The page then resolves the airports through
 * the same localized place layer as the airport board and computes great-circle
 * distances locally — the sitemap data has no schedules, so there is nothing
 * time-based to show.
 */

export type FlightRoute = {
  airline: string;
  airlineSlug: string;
  origin: FlightPlace;
  destination: FlightPlace;
  /** Great-circle distance in kilometres; null when a coordinate is missing. */
  km: number | null;
  /** aviability.com page for this exact number and route. */
  sourceUrl: string;
};

export type FlightPageData = {
  /** Upper-case flight number, e.g. "AA100". */
  number: string;
  airline: string;
  airlineSlug: string;
  /** Every route this number is listed on, primary first (dataset order). */
  routes: FlightRoute[];
  primary: FlightRoute;
  dataDate: string | null;
  related: { number: string; airline: string; href: string }[];
};

/** Great-circle distance between two resolved airports, in kilometres. */
function distanceKm(a: FlightPlace, b: FlightPlace): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h))));
}

function fallbackPlace(code: string): FlightPlace {
  return { iata: code, name: code, city: '', country: '', countryCode: '', lat: null, lng: null };
}

/** Canonical site path for a flight number, e.g. `/zh/flight/aa100`. */
export function flightPath(locale: Locale, number: string): string {
  return localizedPath(locale, `/flight/${number.toLowerCase()}`);
}

/**
 * Resolve one flight number for a page. Case-insensitive; returns null when the
 * number is malformed or absent from the index (the page then 404s).
 */
export async function getFlightPage(
  locale: Locale,
  rawNumber: string
): Promise<FlightPageData | null> {
  const number = rawNumber.toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(number)) return null;

  const rawRoutes = getFlightNumberRecords(number);
  if (!rawRoutes || rawRoutes.length === 0) return null;

  const codes = rawRoutes.flatMap(([, , origin, destination]) => [origin, destination]);
  const places = await getFlightPlaces(locale, codes);

  const routes: FlightRoute[] = rawRoutes.map(([, slug, originCode, destinationCode]) => {
    const origin = places.get(originCode) ?? fallbackPlace(originCode);
    const destination = places.get(destinationCode) ?? fallbackPlace(destinationCode);
    return {
      airline: getAirlineName(slug),
      airlineSlug: slug,
      origin,
      destination,
      km: distanceKm(origin, destination),
      sourceUrl: `https://aviability.com/en/flight/${number.toLowerCase()}-${slug}/${originCode.toLowerCase()}-${destinationCode.toLowerCase()}`,
    };
  });

  const primary = routes[0];
  const related = getRelatedFlightNumbers(
    primary.origin.iata,
    primary.destination.iata,
    number,
    6
  ).map((row) => ({
    ...row,
    href: flightPath(locale, row.number),
  }));

  return {
    number,
    airline: primary.airline,
    airlineSlug: primary.airlineSlug,
    routes,
    primary,
    dataDate: getFlightDataDate(),
    related,
  };
}
