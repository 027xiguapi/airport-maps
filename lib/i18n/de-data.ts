import type { Locale } from './config';
import vocab from './de-vocab.json';

/**
 * German localization of the structured data that the database stores in
 * Chinese, Traditional Chinese and English only (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). German reuses the English
 * columns as its base and translates the closed vocabularies on the way out:
 *
 *  - country, region and city names are proper nouns with established German
 *    forms (Deutschland, Ostasien, Peking) rather than UI copy;
 *  - airport names are the international English names, translated for the
 *    curated hubs (Flughafen München) and kept as-is for the directory batch;
 *  - terminal names, gate ranges and facility labels are a closed vocabulary,
 *    mirrored from db/terminology/en.json so the two languages cannot drift.
 *
 * The tables live in de-vocab.json because the seed/content scripts
 * (scripts/_de.mjs) read the same file. Values not listed there fall through
 * unchanged, so a new airport or city shows its English name instead of a
 * Chinese one.
 */

/** German transport-mode labels, keyed by the ground_transport.icon value. */
export const deTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** German country name for the English column value. */
export const germanCountry = translate(vocab.countries);

/** German region label for the English column value. */
export const germanRegion = translate(vocab.regions);

/** German city name for the English column value. */
export const germanCity = translate(vocab.cities);

/** German airport name for the English column value. */
export const germanAirportName = translate(vocab.airports);

/** German terminal name for the English column value. */
export const germanTerminalName = translate(vocab.terminals);

/** German facility/amenity label for the English column value. */
export const germanLabel = translate(vocab.labels);

/**
 * Gate ranges come out of the English layer as either a plain code range
 * ("A1–A20", "1–10") or a phrase naming a concourse, hall or check-in area.
 * Only the phrases need translating; the codes are language-neutral.
 */
export function germanGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Ankunft')
    .replace(/^Check-in hall$/, 'Check-in-Halle')
    .replace(/^Hall (.+)$/, 'Halle $1')
    .replace(/^Concourse (.+)$/, 'Bereich $1');
}

/** A phrase gate range ("Bereich A") stands alone; a code range needs "Gates". */
export function isGateRangePhrase(value: string): boolean {
  return /^(bereich|halle|check-in|concourse|hall)/i.test(value);
}

/**
 * Reverse index: German name -> English column value, for the search box. The
 * database's `search_blob` carries the Chinese, English and Traditional names,
 * so a German visitor typing "Peking" or "München" would otherwise get nothing.
 * The German term is translated back to the English one and the query runs for
 * both (`germanSearchAlias` in lib/queries.ts).
 *
 * Umlauts get a second, ASCII key ("muenchen"), because keyboards without
 * umlauts are common and visitors type the transliteration instead.
 */
const TRANSLITERATE: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
const asciiKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => TRANSLITERATE[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, german] of Object.entries(table)) {
      const key = german.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const ascii = asciiKey(key);
      if (ascii !== key && !index.has(ascii)) index.set(ascii, english);
    }
  }
  return index;
})();

/** English counterpart of a German place/airport name, or null. */
export function germanSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(asciiKey(key)) ?? null;
}
