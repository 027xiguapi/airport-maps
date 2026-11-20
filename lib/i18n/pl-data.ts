import vocab from './pl-vocab.json';

/**
 * Polska lokalizacja danych strukturalnych, które baza przechowuje tylko po
 * chińsku, w tradycyjnym chińskim i po angielsku (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Podobnie jak niemiecki,
 * francuski, włoski i koreański, polski używa kolumn angielskich jako podstawy
 * i tłumaczy zamknięte słowniki podczas renderowania:
 *
 *  - nazwy krajów, regionów i miast to nazwy własne o ustalonej polskiej formie
 *    (Niemcy, Azja Wschodnia, Pekin), a nie tekst interfejsu;
 *  - nazwy lotnisk to międzynarodowe nazwy angielskie, przetłumaczone dla
 *    wybranych węzłów (Międzynarodowy port lotniczy Incheon) i pozostawione bez
 *    zmian w partii katalogowej;
 *  - nazwy terminali, strefy bramek i etykiety udogodnień to zamknięty słownik,
 *    odwzorowany z db/terminology/en.json.
 *
 * Tabele są w pl-vocab.json, więc działająca strona i skrypty treści czytają
 * jeden plik. Brakujące wartości wracają do angielskiego: nowe lotnisko lub
 * miasto nigdy nie pokaże chińskiego tekstu.
 */

/** Polskie etykiety środków transportu, kluczowane na ground_transport.icon. */
export const plTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Polska nazwa kraju dla angielskiej kolumny. */
export const polishCountry = translate(vocab.countries);

/** Polska nazwa regionu dla angielskiej kolumny. */
export const polishRegion = translate(vocab.regions);

/** Polska nazwa miasta dla angielskiej kolumny. */
export const polishCity = translate(vocab.cities);

/** Polska nazwa lotniska dla angielskiej kolumny. */
export const polishAirportName = translate(vocab.airports);

/** Polska nazwa terminala dla angielskiej kolumny. */
export const polishTerminalName = translate(vocab.terminals);

/** Polska etykieta udogodnienia dla angielskiej kolumny. */
export const polishLabel = translate(vocab.labels);

/**
 * Strefy bramek wychodzą z warstwy angielskiej jako zakres kodów ("A1–A20",
 * "1–10") albo jako fraza z halą, terminalem lub strefą odprawy. Tłumaczenia
 * wymagają tylko frazy; kody są neutralne językowo.
 */
export function polishGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Odprawa / Przyloty')
    .replace(/^Check-in hall$/, 'Hala odpraw')
    .replace(/^Concourse (.+)$/, 'Hala $1')
    .replace(/^Satellite Concourse (.+)$/, 'Hala satelitarna $1');
}

/** Fraza-strefa bramek ("Hala A") stoi sama; kod wymaga słowa "Bramki". */
export function isPolishGateRangePhrase(value: string): boolean {
  return /(hala|satelit|odpraw|przylot|terminal|check-in)/i.test(value);
}

/**
 * Indeks odwrotny: polska nazwa -> angielska wartość kolumny, dla wyszukiwarki.
 * `search_blob` w bazie zawiera tylko nazwy chińskie, angielskie i tradycyjne
 * chińskie, więc polski gość wpisujący „Pekin” lub „Londyn” niczego by nie
 * znalazł. Polska nazwa jest tłumaczona z powrotem na angielską, a wyszukiwanie
 * działa dla obu.
 *
 * Znaki diakrytyczne dostają drugi klucz bez nich („lodz”, „wroclaw”), bo
 * klawiatury i goście często je pomijają.
 */
const FOLD: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, polish] of Object.entries(table)) {
      const key = polish.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Angielski odpowiednik polskiej nazwy miejsca lub lotniska albo null. */
export function polishSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
