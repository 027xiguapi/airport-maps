import vocab from './ja-vocab.json';

/**
 * Japanese localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, Korean and French,
 * Japanese reuses the English columns as its base and translates the closed
 * vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Japanese
 *    forms (ドイツ, 東アジア, 北京) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (ミュンヘン空港) and kept as-is for the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in ja-vocab.json (the same shape as de-vocab.json). Values
 * not listed there fall through unchanged, so a new airport or city shows its
 * English name instead of a Chinese one.
 */

/** Japanese transport-mode labels, keyed by the ground_transport.icon value. */
export const jaTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Japanese country name for the English column value. */
export const japaneseCountry = translate(vocab.countries);

/** Japanese region label for the English column value. */
export const japaneseRegion = translate(vocab.regions);

/** Japanese city name for the English column value. */
export const japaneseCity = translate(vocab.cities);

/** Japanese airport name for the English column value. */
export const japaneseAirportName = translate(vocab.airports);

/** Japanese terminal name for the English column value. */
export const japaneseTerminalName = translate(vocab.terminals);

/** Japanese facility/amenity label for the English column value. */
export const japaneseLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function japaneseGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'チェックイン / 到着')
    .replace(/^Check-in hall$/, 'チェックインロビー')
    .replace(/^Concourse (.+)$/, '$1コンコース')
    .replace(/^Satellite Concourse (.+)$/, 'サテライトコンコース $1');
}

/** A phrase gate range ("Aコンコース") stands alone; a code range needs "ゲート". */
export function isJapaneseGateRangePhrase(value: string): boolean {
  return /(コンコース|ターミナル|ロビー|チェックイン|到着)/.test(value);
}

/**
 * Reverse index: Japanese name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Japanese visitor typing "北京" or "ドイツ" would otherwise get nothing.
 * The Japanese term is translated back to the English one and the query runs for
 * both (`japaneseSearchAlias` in lib/queries.ts).
 *
 * Japanese has no letter case, so the key is just lowercased. Katakana names
 * get a second, hiragana key ("ろんどん"), because visitors often type the
 * reading in hiragana — the index accepts either spelling. Kanji names keep
 * their kanji key; a kana reading ("ぺきん") simply finds no alias instead of
 * throwing.
 */
const KATAKANA = /[\u30a1-\u30f6]/g;
const toHiragana = (value: string) =>
  value.replace(KATAKANA, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, japanese] of Object.entries(table)) {
      const key = japanese.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const hiragana = toHiragana(key);
      if (hiragana !== key && !index.has(hiragana)) index.set(hiragana, english);
    }
  }
  return index;
})();

/** English counterpart of a Japanese place/airport name, or null. */
export function japaneseSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(toHiragana(key)) ?? null;
}
