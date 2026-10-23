import vocab from './ko-vocab.json';

/**
 * Korean localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, Korean reuses the
 * English columns as its base and translates the closed vocabularies on the way
 * out:
 *
 *  - country, region and city names are proper nouns with established Korean
 *    forms (미국, 동아시아, 도쿄) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (인천국제공항) and kept as-is for the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in ko-vocab.json (the same shape as de-vocab.json). Values
 * not listed there fall through unchanged, so a new airport or city shows its
 * English name instead of a Chinese one.
 */

/** Korean transport-mode labels, keyed by the ground_transport.icon value. */
export const koTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Korean country name for the English column value. */
export const koreanCountry = translate(vocab.countries);

/** Korean region label for the English column value. */
export const koreanRegion = translate(vocab.regions);

/** Korean city name for the English column value. */
export const koreanCity = translate(vocab.cities);

/** Korean airport name for the English column value. */
export const koreanAirportName = translate(vocab.airports);

/** Korean terminal name for the English column value. */
export const koreanTerminalName = translate(vocab.terminals);

/** Korean facility/amenity label for the English column value. */
export const koreanLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function koreanGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, '체크인 / 도착')
    .replace(/^Check-in hall$/, '체크인 홀')
    .replace(/^Hall (.+)$/, '$1 홀')
    .replace(/^Concourse (.+)$/, '$1 콘코스');
}

/** A phrase gate range ("A 콘코스") stands alone; a code range needs "게이트". */
export function isKoreanGateRangePhrase(value: string): boolean {
  return /(콘코스|홀|체크인)/.test(value);
}

/**
 * Reverse index: Korean name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Korean visitor typing "도쿄" or "인천" would otherwise get nothing. The
 * Korean term is translated back to the English one and the query runs for both
 * (`koreanSearchAlias` in lib/queries.ts).
 */
const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, korean] of Object.entries(table)) {
      const key = korean.trim().toLowerCase();
      if (key && !index.has(key)) index.set(key, english);
    }
  }
  return index;
})();

/** English counterpart of a Korean place/airport name, or null. */
export function koreanSearchAlias(term: string): string | null {
  return REVERSE.get(term.trim().toLowerCase()) ?? null;
}
