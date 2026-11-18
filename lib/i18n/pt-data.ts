import vocab from './pt-vocab.json';

/**
 * Portuguese (Brazil) localization of the structured data that the database
 * stores in Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French, Italian,
 * Spanish and Korean, Portuguese reuses the English columns as its base and
 * translates the closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established
 *    Portuguese forms (Estados Unidos, Ásia Oriental, Pequim) rather than UI
 *    copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Aeroporto Internacional de Incheon) and kept as-is for the
 *    directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in pt-vocab.json (the same shape as de-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Portuguese transport-mode labels, keyed by the ground_transport.icon value. */
export const portugueseTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Portuguese country name for the English column value. */
export const portugueseCountry = translate(vocab.countries);

/** Portuguese region label for the English column value. */
export const portugueseRegion = translate(vocab.regions);

/** Portuguese city name for the English column value. */
export const portugueseCity = translate(vocab.cities);

/** Portuguese airport name for the English column value. */
export const portugueseAirportName = translate(vocab.airports);

/** Portuguese terminal name for the English column value. */
export const portugueseTerminalName = translate(vocab.terminals);

/** Portuguese facility/amenity label for the English column value. */
export const portugueseLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function portugueseGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Desembarque')
    .replace(/^Check-in hall$/, 'Saguão de check-in')
    .replace(/^Concourse (.+)$/, 'Área $1')
    .replace(/^Satellite Concourse (.+)$/, 'Área satélite $1');
}

/** A phrase gate range ("Área A") stands alone; a code range needs "Portões". */
export function isPortugueseGateRangePhrase(value: string): boolean {
  return /(área|area|saguão|saguao|satélite|satelite|check-in)/i.test(value);
}

/**
 * Reverse index: Portuguese name -> English column value, for the search box.
 * The database's `search_blob` carries the Chinese, English and Traditional
 * names, so a Portuguese visitor typing "Pequim" or "Londres" would otherwise
 * get nothing. The Portuguese term is translated back to the English one and
 * the query runs for both (`portugueseSearchAlias` in lib/queries.ts).
 *
 * Accents get a second, unaccented key ("pekin", "sao paulo"), because
 * keyboards and visitors often drop them — the index accepts either spelling.
 */
const FOLD: Record<string, string> = {
  á: 'a', â: 'a', ã: 'a', à: 'a',
  é: 'e', ê: 'e',
  í: 'i',
  ó: 'o', ô: 'o', õ: 'o',
  ú: 'u', ü: 'u',
  ç: 'c',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[áâãàéêíóôõúüç]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, portuguese] of Object.entries(table)) {
      const key = portuguese.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/**
 * Informal spellings that accent folding cannot derive: "Pequim" carries no
 * accent, yet visitors also type the phonetic "pekin". The keys are compared
 * after the same lowercasing and accent folding as the generated index.
 */
const VARIANTS: Record<string, string> = {
  pekin: 'Beijing',
};

/** English counterpart of a Portuguese place/airport name, or null. */
export function portugueseSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  const folded = unaccent(key);
  return (
    REVERSE.get(key) ??
    REVERSE.get(folded) ??
    VARIANTS[key] ??
    VARIANTS[folded] ??
    null
  );
}
