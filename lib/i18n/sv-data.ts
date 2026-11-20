import vocab from './sv-vocab.json';

/**
 * Svensk lokalisering av den strukturerade data som databasen bara lagrar på
 * kinesiska, traditionell kinesiska och engelska (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Precis som tyska, franska,
 * italienska och koreanska använder svenskan de engelska kolumnerna som bas och
 * översätter de slutna ordlistorna vid rendering:
 *
 *  - lands-, regions- och stadsnamn är egennamn med etablerad svensk form
 *    (Tyskland, Östasien, Peking) och inte UI-text;
 *  - flygplatsnamn är de internationella engelska namnen, översatta för de
 *    utvalda nav (Incheons internationella flygplats) och oförändrade för
 *    katalogbatchen;
 *  - terminalnamn, gateområden och facilitetsetiketter är en sluten ordlista,
 *    speglad från db/terminology/en.json.
 *
 * Tabellerna ligger i sv-vocab.json, så den körande sajten och innehålls-
 * skripten läser en fil. Värden som saknas faller tillbaka på engelska: en ny
 * flygplats eller stad visar alltså aldrig kinesisk text.
 */

/** Svenska transportlägesetiketter, nycklade på ground_transport.icon. */
export const svTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Svenskt landnamn för den engelska kolumnen. */
export const swedishCountry = translate(vocab.countries);

/** Svenskt regionnamn för den engelska kolumnen. */
export const swedishRegion = translate(vocab.regions);

/** Svenskt stadsnamn för den engelska kolumnen. */
export const swedishCity = translate(vocab.cities);

/** Svenskt flygplatsnamn för den engelska kolumnen. */
export const swedishAirportName = translate(vocab.airports);

/** Svenskt terminalnamn för den engelska kolumnen. */
export const swedishTerminalName = translate(vocab.terminals);

/** Svensk facilitetsetikett för den engelska kolumnen. */
export const swedishLabel = translate(vocab.labels);

/**
 * Gateområden kommer från det engelska lagret antingen som ett kodområde
 * ("A1–A20", "1–10") eller som en fras med pir, hall eller incheckningszon.
 * Bara fraserna behöver översättas; koder är språkneutrala.
 */
export function swedishGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Incheckning / Ankomster')
    .replace(/^Check-in hall$/, 'Incheckningshall')
    .replace(/^Concourse (.+)$/, 'Pir $1')
    .replace(/^Satellite Concourse (.+)$/, 'Satellitpir $1');
}

/** Ett fras-gateområde ("Pir A") står för sig; en kod behöver "Gates". */
export function isSwedishGateRangePhrase(value: string): boolean {
  return /(pir|hall|satellit|incheckning|ankomst|check-in)/i.test(value);
}

/**
 * Omvänd index: svenskt namn -> engelskt kolumnvärde, för sökfältet.
 * Databasens `search_blob` innehåller bara kinesiska, engelska och traditionell
 * kinesiska, så en svensk besökare som skriver "Peking" eller "Moskva" skulle
 * annars inte hitta något. Den svenska termen översätts tillbaka till engelska
 * och sökningen körs för båda.
 *
 * Å, ä och ö får en andra, teckenfri nyckel ("peking", "zurich"), eftersom
 * tangentbord och besökare ofta utelämnar dem.
 */
const FOLD: Record<string, string> = {
  å: 'a', ä: 'a', ö: 'o', é: 'e', è: 'e', ü: 'u', á: 'a', í: 'i', ó: 'o', ú: 'u',
  ç: 'c', ñ: 'n',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[åäöéèüáíóúçñ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, swedish] of Object.entries(table)) {
      const key = swedish.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Engelsk motsvarighet till ett svenskt plats- eller flygplatsnamn, eller null. */
export function swedishSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
