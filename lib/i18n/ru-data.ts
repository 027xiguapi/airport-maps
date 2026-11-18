import vocab from './ru-vocab.json';

/**
 * Russian localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Like German, French, Spanish
 * and Italian, Russian reuses the English columns as its base and translates
 * the closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established Russian
 *    forms (Германия, Восточная Азия, Пекин) rather than UI copy;
 *  - airport names are the international English names, rendered in Cyrillic
 *    for the curated hubs (Международный аэропорт Инчхон) and kept as-is for
 *    the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the languages cannot drift.
 *
 * The tables live in ru-vocab.json (the same shape as fr-vocab.json), so the
 * running site and the content scripts read one file. Values not listed there
 * fall through unchanged, so a new airport or city shows its English name
 * instead of a Chinese one.
 */

/** Russian transport-mode labels, keyed by the ground_transport.icon value. */
export const ruTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Russian country name for the English column value. */
export const russianCountry = translate(vocab.countries);

/** Russian region label for the English column value. */
export const russianRegion = translate(vocab.regions);

/** Russian city name for the English column value. */
export const russianCity = translate(vocab.cities);

/** Russian airport name for the English column value. */
export const russianAirportName = translate(vocab.airports);

/** Russian terminal name for the English column value. */
export const russianTerminalName = translate(vocab.terminals);

/** Russian facility/amenity label for the English column value. */
export const russianLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function russianGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Регистрация / Прилёт')
    .replace(/^Check-in hall$/, 'Зал регистрации')
    .replace(/^Concourse (.+)$/, 'Галерея $1')
    .replace(/^Satellite Concourse (.+)$/, 'Спутниковая галерея $1');
}

/** A phrase gate range ("Галерея A") stands alone; a code range needs "Выходы". */
export function isRussianGateRangePhrase(value: string): boolean {
  return /(галерея|зал|регистрац|прилёт|терминал)/i.test(value);
}

/**
 * Reverse index: Russian name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a Russian visitor typing "Пекин" or "Москва" would otherwise get nothing.
 * The Russian term is translated back to the English one and the query runs for
 * both (`russianSearchAlias` in lib/queries.ts).
 *
 * Cyrillic names also get Latin keys, because keyboards and visitors often
 * transliterate: "Москва" is indexed as "moskva" and "Пекин" as "pekin". A
 * second, simplified respelling drops the digraphs ("myunkhen" -> "munhen"),
 * so either spelling of an airport or city resolves.
 */
const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const translit = (value: string): string =>
  value.toLowerCase().replace(/[а-яё]/g, (c) => CYRILLIC[c] ?? c);

const simplify = (value: string): string =>
  value
    .replace(/shch/g, 'sch')
    .replace(/kh/g, 'h')
    .replace(/ts/g, 'c')
    .replace(/yu/g, 'u')
    .replace(/ya/g, 'a')
    .replace(/yo/g, 'e')
    .replace(/y/g, 'i');

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, russian] of Object.entries(table)) {
      const key = russian.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const latin = translit(key);
      if (latin !== key && !index.has(latin)) index.set(latin, english);
      const simple = simplify(latin);
      if (simple !== latin && !index.has(simple)) index.set(simple, english);
    }
  }
  return index;
})();

/** English counterpart of a Russian place/airport name, or null. */
export function russianSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  const direct = REVERSE.get(key);
  if (direct) return direct;
  if (!/[а-яё]/.test(key)) return null;
  const latin = translit(key);
  return REVERSE.get(latin) ?? REVERSE.get(simplify(latin)) ?? null;
}
