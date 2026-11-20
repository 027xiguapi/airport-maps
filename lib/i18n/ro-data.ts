import vocab from './ro-vocab.json';

/**
 * Localizarea românească a datelor structurate pe care baza de date le
 * stochează doar în chineză, chineză tradițională și engleză
 * (`countries.name_en`, `airports.city_en`, `terminals.name_en`, …). Ca și
 * germana, franceza, italiana și coreeana, româna folosește coloanele engleze
 * ca bază și traduce vocabularele închise la randare:
 *
 *  - numele țărilor, regiunilor și orașelor sunt nume proprii cu formă
 *    românească stabilită (Germania, Asia de Est, Beijing), nu text de interfață;
 *  - numele aeroporturilor sunt numele internaționale englezești, traduse pentru
 *    nodurile selectate (Aeroportul Internațional Incheon) și păstrate ca atare
 *    pentru lotul de director;
 *  - numele terminalelor, zonele porților și etichetele facilităților sunt un
 *    vocabular închis, oglindit din db/terminology/en.json.
 *
 * Tabelele sunt în ro-vocab.json, astfel încât site-ul care rulează și
 * scripturile de conținut citesc un singur fișier. Valorile lipsă cad înapoi pe
 * engleză: un aeroport sau oraș nou nu afișează niciodată text chinezesc.
 */

/** Etichete românești pentru modurile de transport, după ground_transport.icon. */
export const roTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Numele românesc al țării pentru coloana engleză. */
export const romanianCountry = translate(vocab.countries);

/** Numele românesc al regiunii pentru coloana engleză. */
export const romanianRegion = translate(vocab.regions);

/** Numele românesc al orașului pentru coloana engleză. */
export const romanianCity = translate(vocab.cities);

/** Numele românesc al aeroportului pentru coloana engleză. */
export const romanianAirportName = translate(vocab.airports);

/** Numele românesc al terminalului pentru coloana engleză. */
export const romanianTerminalName = translate(vocab.terminals);

/** Eticheta românească a facilității pentru coloana engleză. */
export const romanianLabel = translate(vocab.labels);

/**
 * Zonele porților vin din stratul englez fie ca interval de coduri ("A1–A20",
 * "1–10"), fie ca frază cu un culoar, o hală sau o zonă de check-in. Doar
 * frazele trebuie traduse; codurile sunt neutre lingvistic.
 */
export function romanianGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Check-in / Sosiri')
    .replace(/^Check-in hall$/, 'Sala de check-in')
    .replace(/^Concourse (.+)$/, 'Culoarul $1')
    .replace(/^Satellite Concourse (.+)$/, 'Culoarul satelit $1');
}

/** O zonă-frază ("Culoarul A") stă singură; un cod are nevoie de „Porți”. */
export function isRomanianGateRangePhrase(value: string): boolean {
  return /(culoar|satelit|check-in|sosiri|terminal)/i.test(value);
}

/**
 * Index invers: nume românesc -> valoarea coloanei engleze, pentru căutare.
 * `search_blob` conține doar nume chinezești, englezești și tradiționale, așa
 * că un vizitator român care scrie „Beijing” sau „Londra” nu ar găsi nimic.
 * Termenul românesc este tradus înapoi în engleză, iar căutarea rulează pentru
 * ambele.
 *
 * Diacriticele primesc o a doua cheie fără ele („bucharest”, „zurich”), pentru
 * că tastaturile și vizitatorii le omit adesea.
 */
const FOLD: Record<string, string> = {
  ă: 'a', â: 'a', î: 'i', ș: 's', ț: 't',
  á: 'a', à: 'a', é: 'e', è: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ç: 'c',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[ăâîșțáàéèíóúüç]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, romanian] of Object.entries(table)) {
      const key = romanian.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Corespondentul englez al unui nume românesc de loc sau aeroport, sau null. */
export function romanianSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
