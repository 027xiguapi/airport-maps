import vocab from './vi-vocab.json';

/**
 * Vietnamese localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French and Korean,
 * Vietnamese reuses the English columns as its base and translates the closed
 * vocabularies on the way out:
 *
 *  - country, region and city names are the established Vietnamese forms
 *    (Đức, Hoa Kỳ, Đông Á, Bắc Kinh) rather than UI copy;
 *  - airport names are the international names translated for the curated hubs
 *    (Sân bay München) and kept as-is for the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in vi-vocab.json (the same shape as fr-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Vietnamese transport-mode labels, keyed by the ground_transport.icon value. */
export const viTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Vietnamese country name for the English column value. */
export const vietnameseCountry = translate(vocab.countries);

/** Vietnamese region label for the English column value. */
export const vietnameseRegion = translate(vocab.regions);

/** Vietnamese city name for the English column value. */
export const vietnameseCity = translate(vocab.cities);

/** Vietnamese airport name for the English column value. */
export const vietnameseAirportName = translate(vocab.airports);

/** Vietnamese terminal name for the English column value. */
export const vietnameseTerminalName = translate(vocab.terminals);

/** Vietnamese facility/amenity label for the English column value. */
export const vietnameseLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function vietnameseGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Đến')
    .replace(/^Check-in hall$/, 'Sảnh check-in')
    .replace(/^Concourse (.+)$/, 'Khu $1')
    .replace(/^Satellite Concourse (.+)$/, 'Khu vệ tinh $1');
}

/** A phrase gate range ("Khu A") stands alone; a code range needs "Cổng". */
export function isVietnameseGateRangePhrase(value: string): boolean {
  return /(khu|sảnh|vệ tinh|check-in|đến)/i.test(value);
}

/**
 * Reverse index: Vietnamese name -> English column value, for the search box.
 * The database's `search_blob` carries the Chinese, English and Traditional
 * names, so a Vietnamese visitor typing "Bắc Kinh" or "Luân Đôn" would
 * otherwise get nothing. The Vietnamese term is translated back to the English
 * one and the query runs for both (`vietnameseSearchAlias` in lib/queries.ts).
 *
 * Vietnamese is written with stacked tone marks, and visitors routinely type
 * without them ("bac kinh", "da nang"), so every entry also gets an unaccented
 * key: ă/â → a, đ → d, ê → e, ô/ơ → o, ư → u, and all five tones dropped. A few
 * names keep a Latin umlaut (München, Zürich) and are folded the same way.
 */
const FOLD: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  ä: 'a',
  đ: 'd',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ö: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ü: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
};
const unaccent = (value: string) =>
  value
    .toLowerCase()
    .replace(/[àáảãạăằắẳẵặâầấẩẫậäđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợöùúủũụưừứửữựüỳýỷỹỵ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, vietnamese] of Object.entries(table)) {
      const key = vietnamese.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** English counterpart of a Vietnamese place/airport name, or null. */
export function vietnameseSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
