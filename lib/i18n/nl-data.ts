import vocab from './nl-vocab.json';

/**
 * Nederlandse lokalisatie van de gestructureerde gegevens die de database
 * alleen in het Chinees, Traditioneel Chinees en Engels opslaat
 * (`countries.name_en`, `airports.city_en`, `terminals.name_en`, …). Net als
 * Duits, Frans, Italiaans en Koreaans gebruikt het Nederlands de Engelse
 * kolommen als basis en vertaalt het de gesloten woordenlijsten bij het
 * renderen:
 *
 *  - land-, regio- en stadsnamen zijn eigennamen met een gevestigde Nederlandse
 *    vorm (Verenigde Staten, Oost-Azië, Peking) en geen UI-tekst;
 *  - luchthavennamen zijn de internationale Engelse namen, vertaald voor de
 *    geselecteerde hubs (Internationale luchthaven Incheon) en ongewijzigd
 *    gelaten voor de directorybatch;
 *  - terminalnamen, gatebereiken en voorzieningslabels zijn een gesloten
 *    woordenlijst, gespiegeld van db/terminology/en.json.
 *
 * De tabellen staan in nl-vocab.json, zodat de draaiende site en de
 * contentscripts één bestand lezen. Waarden die er niet in staan, vallen terug
 * op het Engels: een nieuwe luchthaven of stad toont dus nooit Chinese tekst.
 */

/** Nederlandse labels voor vervoerswijzen, op ground_transport.icon. */
export const nlTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Nederlandse landnaam voor de Engelse kolomwaarde. */
export const dutchCountry = translate(vocab.countries);

/** Nederlands regionaam voor de Engelse kolomwaarde. */
export const dutchRegion = translate(vocab.regions);

/** Nederlandse stadsnaam voor de Engelse kolomwaarde. */
export const dutchCity = translate(vocab.cities);

/** Nederlandse luchthavennaam voor de Engelse kolomwaarde. */
export const dutchAirportName = translate(vocab.airports);

/** Nederlandse terminalnaam voor de Engelse kolomwaarde. */
export const dutchTerminalName = translate(vocab.terminals);

/** Nederlands voorzieningslabel voor de Engelse kolomwaarde. */
export const dutchLabel = translate(vocab.labels);

/**
 * Gatebereiken komen uit de Engelse laag als een codebereik ("A1–A20",
 * "1–10") of als een frase met een concourse, hal of incheckzone. Alleen de
 * frases hoeven vertaald te worden; codes zijn taalonafhankelijk.
 */
export function dutchGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Inchecken / Aankomst')
    .replace(/^Check-in hall$/, 'Incheckhal')
    .replace(/^Satellite Concourse (.+)$/, 'Satellietconcourse $1');
}

/** Een frase-gatebereik ("Concourse A") staat op zichzelf; een code heeft "Gates". */
export function isDutchGateRangePhrase(value: string): boolean {
  return /(concourse|hal|satelliet|satellite|incheck|check-in)/i.test(value);
}

/**
 * Omgekeerde index: Nederlandse naam -> Engelse kolomwaarde, voor het
 * zoekvak. De `search_blob` van de database bevat alleen Chinese, Engelse en
 * Traditioneel-Chinese namen, dus een Nederlandse bezoeker die "Peking" of
 * "Londen" typt, zou anders niets vinden. De Nederlandse term wordt terugvertaald
 * naar het Engels en de zoekopdracht loopt voor beide.
 *
 * Accenten krijgen een tweede, onbeklemtoonde sleutel ("peking", "münchen" ->
 * "munchen"), omdat toetsenborden en bezoekers ze vaak weglaten.
 */
const FOLD: Record<string, string> = {
  à: 'a', á: 'a', ä: 'a', â: 'a', ã: 'a', å: 'a',
  è: 'e', é: 'e', ë: 'e', ê: 'e',
  ì: 'i', í: 'i', ï: 'i', î: 'i',
  ò: 'o', ó: 'o', ö: 'o', ô: 'o', õ: 'o',
  ù: 'u', ú: 'u', ü: 'u', û: 'u',
  ç: 'c', ñ: 'n', ÿ: 'y', ß: 'ss',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[àáäâãåèéëêìíïîòóöôõùúüûçñÿß]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, dutch] of Object.entries(table)) {
      const key = dutch.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Engelse tegenhanger van een Nederlandse plaats- of luchthavennaam, of null. */
export function dutchSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
