import vocab from './it-vocab.json';

/**
 * Italian localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French and Korean,
 * Italian reuses the English columns as its base and translates the closed
 * vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Italian
 *    forms (Stati Uniti, Asia orientale, Pechino) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Aeroporto di Monaco di Baviera) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in it-vocab.json (the same shape as de-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Italian transport-mode labels, keyed by the ground_transport.icon value. */
export const itTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Italian country name for the English column value. */
export const italianCountry = translate(vocab.countries);

/** Italian region label for the English column value. */
export const italianRegion = translate(vocab.regions);

/** Italian city name for the English column value. */
export const italianCity = translate(vocab.cities);

/** Italian airport name for the English column value. */
export const italianAirportName = translate(vocab.airports);

/** Italian terminal name for the English column value. */
export const italianTerminalName = translate(vocab.terminals);

/** Italian facility/amenity label for the English column value. */
export const italianLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function italianGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Arrivi')
    .replace(/^Check-in hall$/, 'Hall del check-in')
    .replace(/^Satellite Concourse (.+)$/, 'Satellite $1')
    .replace(/^Concourse (.+)$/, 'Satellite $1');
}

/** A phrase gate range ("Satellite A") stands alone; a code range needs "Gate". */
export function isItalianGateRangePhrase(value: string): boolean {
  return /(satellite|hall|check-in|arrivi)/i.test(value);
}

/**
 * Reverse index: Italian name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so an Italian visitor typing "Pechino" or "Londra" would otherwise get
 * nothing. The Italian term is translated back to the English one and the query
 * runs for both (`italianSearchAlias` in lib/queries.ts).
 *
 * Accents and apostrophes get secondary keys ("pechino" needs none, but
 * "citta del messico" should match "Città del Messico", and "lavana" should
 * match "L'Avana"), because visitors often drop them when typing.
 */
const FOLD: Record<string, string> = {
  à: 'a', á: 'a', â: 'a', ä: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ò: 'o', ó: 'o', ô: 'o', ö: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[àáâäèéêëìíîïòóôöùúûüçñ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, italian] of Object.entries(table)) {
      const key = italian.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
      const noApostrophe = folded.replace(/['’]/g, '');
      if (noApostrophe !== folded && !index.has(noApostrophe)) index.set(noApostrophe, english);
    }
  }
  return index;
})();

/** English counterpart of an Italian place/airport name, or null. */
export function italianSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  const folded = unaccent(key);
  return (
    REVERSE.get(key) ??
    REVERSE.get(folded) ??
    REVERSE.get(folded.replace(/['’]/g, '')) ??
    null
  );
}
