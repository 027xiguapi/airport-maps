import vocab from './id-vocab.json';

/**
 * Indonesian localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French, Spanish
 * and Korean, Indonesian reuses the English columns as its base and translates
 * the closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established
 *    Indonesian forms (Amerika Serikat, Asia Tenggara, Kairo) rather than UI
 *    copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Bandara Internasional Incheon) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in id-vocab.json (the same shape as fr-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Indonesian transport-mode labels, keyed by the ground_transport.icon value. */
export const idTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Indonesian country name for the English column value. */
export const indonesianCountry = translate(vocab.countries);

/** Indonesian region label for the English column value. */
export const indonesianRegion = translate(vocab.regions);

/** Indonesian city name for the English column value. */
export const indonesianCity = translate(vocab.cities);

/** Indonesian airport name for the English column value. */
export const indonesianAirportName = translate(vocab.airports);

/** Indonesian terminal name for the English column value. */
export const indonesianTerminalName = translate(vocab.terminals);

/** Indonesian facility/amenity label for the English column value. */
export const indonesianLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function indonesianGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Kedatangan')
    .replace(/^Check-in hall$/, 'Aula check-in')
    .replace(/^Concourse (.+)$/, 'Concourse $1')
    .replace(/^Satellite Concourse (.+)$/, 'Concourse Satelit $1');
}

/** A phrase gate range ("Concourse A") stands alone; a code range needs "Gerbang". */
export function isIndonesianGateRangePhrase(value: string): boolean {
  return /(concourse|satelit|aula|check-in|kedatangan)/i.test(value);
}

/**
 * Reverse index: Indonesian name -> English column value, for the search box.
 * The database's `search_blob` carries the Chinese, English and Traditional
 * names, so an Indonesian visitor typing "Kairo" or "Amerika Serikat" would
 * otherwise get nothing. The Indonesian term is translated back to the English
 * one and the query runs for both (`indonesianSearchAlias` in lib/queries.ts).
 *
 * Indonesian has no diacritics of its own, so plain lowercase is the only
 * normalization the index needs; imported spellings such as "Bogotá" are
 * matched exactly as written.
 */
const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, indonesian] of Object.entries(table)) {
      const key = indonesian.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
    }
  }
  return index;
})();

/** English counterpart of an Indonesian place/airport name, or null. */
export function indonesianSearchAlias(term: string): string | null {
  return REVERSE.get(term.trim().toLowerCase()) ?? null;
}
