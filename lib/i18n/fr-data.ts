import vocab from './fr-vocab.json';

/**
 * French localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German and Korean, French
 * reuses the English columns as its base and translates the closed vocabularies
 * on the way out:
 *
 *  - country, region and city names are proper nouns with established French
 *    forms (États-Unis, Asie de l'Est, Pékin) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Aéroport international d'Incheon) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in fr-vocab.json (the same shape as de-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** French transport-mode labels, keyed by the ground_transport.icon value. */
export const frTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** French country name for the English column value. */
export const frenchCountry = translate(vocab.countries);

/** French region label for the English column value. */
export const frenchRegion = translate(vocab.regions);

/** French city name for the English column value. */
export const frenchCity = translate(vocab.cities);

/** French airport name for the English column value. */
export const frenchAirportName = translate(vocab.airports);

/** French terminal name for the English column value. */
export const frenchTerminalName = translate(vocab.terminals);

/** French facility/amenity label for the English column value. */
export const frenchLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function frenchGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Enregistrement / Arrivées')
    .replace(/^Check-in hall$/, "Hall d'enregistrement")
    .replace(/^Concourse (.+)$/, 'Hall $1')
    .replace(/^Satellite Concourse (.+)$/, 'Satellite $1');
}

/** A phrase gate range ("Hall A") stands alone; a code range needs "Portes". */
export function isFrenchGateRangePhrase(value: string): boolean {
  return /(hall|satellite|enregistrement)/i.test(value);
}

/**
 * Reverse index: French name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a French visitor typing "Pékin" or "Londres" would otherwise get nothing.
 * The French term is translated back to the English one and the query runs for
 * both (`frenchSearchAlias` in lib/queries.ts).
 *
 * Accents get a second, unaccented key ("pekin"), because keyboards and
 * visitors often drop them — the index accepts either spelling.
 */
const FOLD: Record<string, string> = {
  à: 'a', â: 'a', ä: 'a', æ: 'ae',
  ç: 'c',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  î: 'i', ï: 'i',
  ô: 'o', ö: 'o', œ: 'oe',
  ù: 'u', û: 'u', ü: 'u',
  ÿ: 'y',
  ñ: 'n',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[àâäæçéèêëîïôöœùûüÿñ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, french] of Object.entries(table)) {
      const key = french.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** English counterpart of a French place/airport name, or null. */
export function frenchSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
