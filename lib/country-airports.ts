import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { routeDestinationCounts } from './routes';

/** One scheduled airport from the per-country lists. */
export type NationalAirport = {
  iata: string;
  /** English name, as in the source dataset. */
  name: string;
  /** City (municipality) in English; empty when the dataset has none. */
  city: string;
  type: 'large' | 'medium' | 'small';
  /** Coordinates, null only for the occasional site airport the datasets miss. */
  lat: number | null;
  lng: number | null;
};

export type CountryAirportList = {
  /** English country name from the source dataset. */
  name: string;
  total: number;
  airports: NationalAirport[];
};

let cache: Record<string, CountryAirportList> | null | undefined;

/**
 * The full national airport list backing the "airport distribution" block on
 * /country/<CC> — every scheduled airport, not just the ones with a detail
 * page. Returns null when scripts/build-country-airports.mjs has not produced
 * (or this checkout lacks) the data file.
 *
 * Server-side only (reads from disk); the file is small enough to read once
 * per process and cache. The path is built inline from `process.cwd()` so the
 * bundler can scope file tracing, mirroring lib/content.ts.
 */
export function getCountryAirports(code: string): CountryAirportList | null {
  if (cache === undefined) {
    try {
      const raw = JSON.parse(
        readFileSync(join(process.cwd(), 'scripts', 'country-airports.json'), 'utf8')
      );
      cache = raw?.countries ?? null;
    } catch {
      cache = null;
    }
  }
  return cache?.[code.toUpperCase()] ?? null;
}

/** National size classes, biggest first — the order the cards should read in. */
const CLASS_RANK: Record<NationalAirport['type'], number> = { large: 0, medium: 1, small: 2 };

/** Size class, then how many direct destinations the route dump records, then IATA. */
function bySizeThenNetwork(
  a: { iata: string; rank: number },
  b: { iata: string; rank: number },
  destinations: Map<string, number>
): number {
  return (
    a.rank - b.rank ||
    (destinations.get(b.iata) ?? 0) - (destinations.get(a.iata) ?? 0) ||
    a.iata.localeCompare(b.iata)
  );
}

/**
 * Reading order for the airport cards on /country/<CC>.
 *
 * `getAirportsByCountry` returns them by annual passengers, which is the right
 * story where those figures exist — but most airports (the directory batch)
 * have no compiled passenger number, so they fall back to IATA order and a
 * country reads Chiayi, Lanyu, Lyudao … before Taoyuan. Two repo-data signals
 * break those ties instead:
 *
 *   1. the national dataset's size class — large → medium → small;
 *   2. the OpenFlights route dump's direct-destination count, busiest first
 *      (the same figure the homepage ranks by, see lib/routes.ts), so a
 *      country's main gateway still leads its class;
 *   3. IATA, for a stable order.
 *
 * A country whose airports have no passenger figures at all — the common case
 * outside the editorial set — therefore ends up ordered by size and network,
 * which is what a reader expects on those pages.
 */
export function orderCountryAirports<T extends { iata: string; annualPaxM: number | null }>(
  airports: T[],
  national: CountryAirportList | null
): T[] {
  if (!national) return airports;
  const rank = new Map(national.airports.map((a) => [a.iata, CLASS_RANK[a.type] ?? 1]));
  const destinations = routeDestinationCounts();
  return [...airports].sort((a, b) => {
    if (a.annualPaxM !== b.annualPaxM) {
      // Descending by passengers, with the figure-less group last.
      if (a.annualPaxM === null) return 1;
      if (b.annualPaxM === null) return -1;
      return b.annualPaxM - a.annualPaxM;
    }
    return bySizeThenNetwork(
      { iata: a.iata, rank: rank.get(a.iata) ?? CLASS_RANK.medium },
      { iata: b.iata, rank: rank.get(b.iata) ?? CLASS_RANK.medium },
      destinations
    );
  });
}

/**
 * The national list in the same order as the cards above it. The distribution
 * table and the card grid list the same airports for a fully covered country
 * (every Taiwanese airport is covered, for instance), so reading them in two
 * different orders — alphabetical in the table, size-first in the grid — looks
 * like a bug. This keeps one order for both.
 */
export function orderNationalAirports(airports: NationalAirport[]): NationalAirport[] {
  const destinations = routeDestinationCounts();
  return [...airports].sort((a, b) =>
    bySizeThenNetwork(
      { iata: a.iata, rank: CLASS_RANK[a.type] ?? CLASS_RANK.medium },
      { iata: b.iata, rank: CLASS_RANK[b.type] ?? CLASS_RANK.medium },
      destinations
    )
  );
}
