import vocab from './tr-vocab.json';

/**
 * Turkish localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French and
 * Indonesian, Turkish reuses the English columns as its base and translates the
 * closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Turkish
 *    forms (Almanya, Doğu Asya, Pekin) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Incheon Uluslararası Havalimanı) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in tr-vocab.json (the same shape as fr-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Turkish transport-mode labels, keyed by the ground_transport.icon value. */
export const trTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Turkish country name for the English column value. */
export const turkishCountry = translate(vocab.countries);

/** Turkish region label for the English column value. */
export const turkishRegion = translate(vocab.regions);

/** Turkish city name for the English column value. */
export const turkishCity = translate(vocab.cities);

/** Turkish airport name for the English column value. */
export const turkishAirportName = translate(vocab.airports);

/** Turkish terminal name for the English column value. */
export const turkishTerminalName = translate(vocab.terminals);

/** Turkish facility/amenity label for the English column value. */
export const turkishLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function turkishGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Varış')
    .replace(/^Check-in hall$/, 'Check-in salonu')
    .replace(/^Concourse (.+)$/, 'Koridor $1')
    .replace(/^Satellite Concourse (.+)$/, 'Uydu koridor $1');
}

/** A phrase gate range ("Koridor A") stands alone; a code range needs "Kapı". */
export function isTurkishGateRangePhrase(value: string): boolean {
  return /(koridor|salon|check-in|varış|terminal)/i.test(value);
}

/**
 * Reverse index: Turkish name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Turkish visitor typing "Pekin" or "Londra" would otherwise get nothing.
 * The Turkish term is translated back to the English one and the query runs for
 * both (`turkishSearchAlias` in lib/queries.ts).
 *
 * Keys are lowercased with the Turkish locale, where "I" becomes "ı" and "İ"
 * becomes "i". An ASCII-folded second key ("istanbul" for "İstanbul", "irak"
 * for "Irak") is added as well, because visitors usually type on an English
 * keyboard and drop the Turkish letters.
 */
const FOLD: Record<string, string> = {
  ı: 'i', İ: 'i',
  ş: 's', ğ: 'g',
  ü: 'u', ö: 'o', ç: 'c',
};
const fold = (value: string) =>
  value.replace(/[ıİşğüöç]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, turkish] of Object.entries(table)) {
      const key = turkish.trim().toLocaleLowerCase('tr');
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = fold(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** English counterpart of a Turkish place/airport name, or null. */
export function turkishSearchAlias(term: string): string | null {
  const key = term.trim().toLocaleLowerCase('tr');
  return REVERSE.get(key) ?? REVERSE.get(fold(key)) ?? null;
}
