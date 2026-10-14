import FACTS from './airport-facts.json';

/**
 * Per-airport hard facts compiled from the repo's data files by
 * `scripts/build-airport-facts.mjs` (OurAirports export first, curated
 * directory data and hand-checked coordinates as fallback — see that script
 * for the priority chain). Nothing here is fetched at request time.
 *
 * Every field is optional: `type` and `icao` exist for all 363 airports today,
 * coordinates and elevation for all but one, `wikiEn` only where OurAirports
 * carries an English Wikipedia article.
 */
export type AirportClass = 'large' | 'medium' | 'small' | 'heliport';

export type AirportFacts = {
  /** OurAirports airport class; also stored as kind in the directory data. */
  type?: AirportClass;
  /** ICAO code — a real one, so absent for fields that have none. */
  icao?: string;
  /** Elevation above sea level, feet (OurAirports' unit). */
  elevFt?: number;
  /** English Wikipedia article for this exact airport (OurAirports link). */
  wikiEn?: string;
  lat?: number;
  lng?: number;
  /** Present only when OurAirports states it, so copy never guesses. */
  scheduled?: boolean;
};

const AIRPORTS = (FACTS as { airports: Record<string, AirportFacts> }).airports;

export function getAirportFacts(iata: string): AirportFacts | null {
  return AIRPORTS[iata.toUpperCase()] ?? null;
}

export function airportCoords(iata: string): { lat: number; lng: number } | null {
  const facts = getAirportFacts(iata);
  return facts?.lat != null && facts.lng != null ? { lat: facts.lat, lng: facts.lng } : null;
}
