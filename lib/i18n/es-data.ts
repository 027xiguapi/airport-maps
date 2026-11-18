import vocab from './es-vocab.json';

/**
 * Spanish localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French, Italian
 * and Korean, Spanish reuses the English columns as its base and translates
 * the closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Spanish
 *    forms (Estados Unidos, Asia Oriental, Pekín) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Aeropuerto Internacional de Incheon) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in es-vocab.json (the same shape as de-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Spanish transport-mode labels, keyed by the ground_transport.icon value. */
export const esTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Spanish country name for the English column value. */
export const spanishCountry = translate(vocab.countries);

/** Spanish region label for the English column value. */
export const spanishRegion = translate(vocab.regions);

/** Spanish city name for the English column value. */
export const spanishCity = translate(vocab.cities);

/** Spanish airport name for the English column value. */
export const spanishAirportName = translate(vocab.airports);

/** Spanish terminal name for the English column value. */
export const spanishTerminalName = translate(vocab.terminals);

/** Spanish facility/amenity label for the English column value. */
export const spanishLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function spanishGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Facturación / Llegadas')
    .replace(/^Check-in hall$/, 'Sala de facturación')
    .replace(/^Concourse (.+)$/, 'Zona $1')
    .replace(/^Satellite Concourse (.+)$/, 'Zona satélite $1');
}

/** A phrase gate range ("Zona A") stands alone; a code range needs "Puertas". */
export function isSpanishGateRangePhrase(value: string): boolean {
  return /(zona|sala|satélite|satelite|facturación)/i.test(value);
}

/**
 * Reverse index: Spanish name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Spanish visitor typing "Pekín" or "Londres" would otherwise get nothing.
 * The Spanish term is translated back to the English one and the query runs for
 * both (`spanishSearchAlias` in lib/queries.ts).
 *
 * Accents get a second, unaccented key ("pekin", "espana"), because keyboards
 * and visitors often drop them — the index accepts either spelling.
 */
const FOLD: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[áéíóúüñ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, spanish] of Object.entries(table)) {
      const key = spanish.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** English counterpart of a Spanish place/airport name, or null. */
export function spanishSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
