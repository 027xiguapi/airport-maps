import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
