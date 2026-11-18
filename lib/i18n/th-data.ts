import vocab from './th-vocab.json';

/**
 * Thai localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, Korean and French,
 * Thai reuses the English columns as its base and translates the closed
 * vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Thai
 *    forms (เยอรมนี, เอเชียตะวันออก, ปักกิ่ง) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (ท่าอากาศยานมิวนิก) and kept as-is for the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in th-vocab.json (the same shape as fr-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Thai transport-mode labels, keyed by the ground_transport.icon value. */
export const thTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Thai country name for the English column value. */
export const thaiCountry = translate(vocab.countries);

/** Thai region label for the English column value. */
export const thaiRegion = translate(vocab.regions);

/** Thai city name for the English column value. */
export const thaiCity = translate(vocab.cities);

/** Thai airport name for the English column value. */
export const thaiAirportName = translate(vocab.airports);

/** Thai terminal name for the English column value. */
export const thaiTerminalName = translate(vocab.terminals);

/** Thai facility/amenity label for the English column value. */
export const thaiLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function thaiGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'เช็คอิน / ขาเข้า')
    .replace(/^Check-in hall$/, 'โถงเช็คอิน')
    .replace(/^Concourse (.+)$/, 'โถง $1')
    .replace(/^Satellite Concourse (.+)$/, 'โถงดาวเทียม $1');
}

/** A phrase gate range ("โถง A") stands alone; a code range needs "ประตู". */
export function isThaiGateRangePhrase(value: string): boolean {
  return /(โถง|เช็คอิน|ขาเข้า|อาคาร)/.test(value);
}

/**
 * Reverse index: Thai name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Thai visitor typing "ปักกิ่ง" or "ลอนดอน" would otherwise get nothing.
 * The Thai term is translated back to the English one and the query runs for
 * both (`thaiSearchAlias` in lib/queries.ts).
 *
 * Thai has no letter case, so the key is only trimmed and lowercased (which is
 * a no-op for Thai but folds Latin letters embedded in a name). Airport names
 * also get their English spelling as a key, because the directory batch keeps
 * those names untranslated and visitors may type them either way.
 */
const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, thai] of Object.entries(table)) {
      const key = thai.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
    }
  }
  for (const english of Object.keys(vocab.airports)) {
    const key = english.trim().toLowerCase();
    if (!key) continue;
    if (!index.has(key)) index.set(key, english);
  }
  return index;
})();

/** English counterpart of a Thai place/airport name, or null. */
export function thaiSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? null;
}
