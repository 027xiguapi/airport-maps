import vocab from './cs-vocab.json';

/**
 * Česká lokalizace strukturovaných dat, která databáze ukládá pouze v čínštině,
 * tradiční čínštině a angličtině (`countries.name_en`, `airports.city_en`,
 * `terminals.name_en`, …). Podobně jako němčina, francouzština, italština a
 * korejština používá čeština anglické sloupce jako základ a překládá uzavřené
 * slovníky při vykreslování:
 *
 *  - názvy zemí, regionů a měst jsou vlastní jména s ustálenou českou formou
 *    (Německo, Východní Asie, Peking), nikoli text rozhraní;
 *  - názvy letišť jsou mezinárodní anglické názvy, přeložené pro vybrané uzly
 *    (Mezinárodní letiště Inčchon) a ponechané beze změny v katalogové dávce;
 *  - názvy terminálů, zóny bran a štítky vybavení jsou uzavřený slovník
 *    zrcadlený z db/terminology/en.json.
 *
 * Tabulky jsou v cs-vocab.json, takže běžící web i obsahové skripty čtou jeden
 * soubor. Chybějící hodnoty se vracejí k angličtině: nové letiště nebo město
 * tedy nikdy nezobrazí čínský text.
 */

/** České štítky druhů dopravy, klíčované podle ground_transport.icon. */
export const csTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Český název země pro anglický sloupec. */
export const czechCountry = translate(vocab.countries);

/** Český název regionu pro anglický sloupec. */
export const czechRegion = translate(vocab.regions);

/** Český název města pro anglický sloupec. */
export const czechCity = translate(vocab.cities);

/** Český název letiště pro anglický sloupec. */
export const czechAirportName = translate(vocab.airports);

/** Český název terminálu pro anglický sloupec. */
export const czechTerminalName = translate(vocab.terminals);

/** Český štítek vybavení pro anglický sloupec. */
export const czechLabel = translate(vocab.labels);

/**
 * Zóny bran přicházejí z anglické vrstvy buď jako rozsah kódů ("A1–A20",
 * "1–10"), nebo jako fráze s halou, terminálem či odbavovací zónou. Překládat
 * je třeba jen fráze; kódy jsou jazykově neutrální.
 */
export function czechGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Odbavení / Přílety')
    .replace(/^Check-in hall$/, 'Odbavovací hala')
    .replace(/^Concourse (.+)$/, 'Hala $1')
    .replace(/^Satellite Concourse (.+)$/, 'Satelitní hala $1');
}

/** Fráze-zóna bran ("Hala A") stojí sama; kód potřebuje slovo "Brány". */
export function isCzechGateRangePhrase(value: string): boolean {
  return /(hala|satelit|odbav|přílet|prilet|terminál|check-in)/i.test(value);
}

/**
 * Reverzní index: český název -> anglická hodnota sloupce, pro vyhledávání.
 * `search_blob` v databázi obsahuje jen čínské, anglické a tradiční čínské
 * názvy, takže český návštěvník píšící „Peking“ nebo „Londýn“ by nic nenašel.
 * Český výraz se přeloží zpět do angličtiny a hledání proběhne pro oba.
 *
 * Diakritika dostává druhý klíč bez ní („peking“, „zurich“), protože klávesnice
 * a návštěvníci ji často vynechávají.
 */
const FOLD: Record<string, string> = {
  á: 'a', č: 'c', ď: 'd', é: 'e', ě: 'e', í: 'i', ň: 'n', ó: 'o', ř: 'r', š: 's',
  ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[áčďéěíňóřšťúůýž]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, czech] of Object.entries(table)) {
      const key = czech.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Anglický protějšek českého názvu místa nebo letiště, nebo null. */
export function czechSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
