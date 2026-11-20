import vocab from './sw-vocab.json';

/**
 * Ujanibishaji wa Kiswahili wa data iliyoundwa ambayo hifadhidata huhifadhi kwa
 * Kichina, Kichina cha Jadi na Kiingereza tu (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Kama Kijerumani, Kifaransa,
 * Kiitaliano na Kikorea, Kiswahili hutumia safu za Kiingereza kama msingi na
 * kutafsiri kamusi zilizofungwa wakati wa kuonyesha:
 *
 *  - majina ya nchi, kanda na miji ni majina maalum yenye umbo la Kiswahili
 *    (Ujerumani, Asia ya Mashariki, Beijing), si maandishi ya UI;
 *  - majina ya viwanja vya ndege ni majina ya kimataifa ya Kiingereza,
 *    yaliyotafsiriwa kwa vituo teule (Uwanja wa ndege wa kimataifa wa Incheon)
 *    na kuachwa kama yalivyo kwa kundi la saraka;
 *  - majina ya terminali, maeneo ya malango na lebo za huduma ni kamusi
 *    iliyofungwa, inayoakisiwa kutoka db/terminology/en.json.
 *
 * Jedwali ziko katika sw-vocab.json, hivyo tovuti inayofanya kazi na skripti za
 * maudhui husoma faili moja. Thamani zisizopo hurudi kwa Kiingereza: uwanja
 * mpya wa ndege au mji hauonyeshi maandishi ya Kichina kamwe.
 */

/** Lebo za Kiswahili za aina za usafiri, kwa ground_transport.icon. */
export const swTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Jina la Kiswahili la nchi kwa safu ya Kiingereza. */
export const swahiliCountry = translate(vocab.countries);

/** Jina la Kiswahili la kanda kwa safu ya Kiingereza. */
export const swahiliRegion = translate(vocab.regions);

/** Jina la Kiswahili la mji kwa safu ya Kiingereza. */
export const swahiliCity = translate(vocab.cities);

/** Jina la Kiswahili la uwanja wa ndege kwa safu ya Kiingereza. */
export const swahiliAirportName = translate(vocab.airports);

/** Jina la Kiswahili la terminali kwa safu ya Kiingereza. */
export const swahiliTerminalName = translate(vocab.terminals);

/** Lebo ya Kiswahili ya huduma kwa safu ya Kiingereza. */
export const swahiliLabel = translate(vocab.labels);

/**
 * Maeneo ya malango yanatoka kwenye tabaka la Kiingereza kama safu ya misimbo
 * ("A1–A20", "1–10") au kama kirai chenye ukumbi, jumba au eneo la
 * kujiandikisha. Virai pekee vinahitaji kutafsiriwa; misimbo haina lugha.
 */
export function swahiliGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Kujiandikisha / Kuwasili')
    .replace(/^Check-in hall$/, 'Ukumbi wa kujiandikisha')
    .replace(/^Concourse (.+)$/, 'Ukumbi $1')
    .replace(/^Satellite Concourse (.+)$/, 'Ukumbi wa satelaiti $1');
}

/** Eneo-kirai la malango ("Ukumbi A") linasimama peke yake; msimbo unahitaji "Malango". */
export function isSwahiliGateRangePhrase(value: string): boolean {
  return /(ukumbi|satelaiti|kujiandikisha|kuwasili|terminali|check-in)/i.test(value);
}

/**
 * Faharasa ya kinyume: jina la Kiswahili -> thamani ya safu ya Kiingereza, kwa
 * kisanduku cha utafutaji. `search_blob` ina majina ya Kichina, Kiingereza na
 * Kichina cha Jadi pekee, hivyo mgeni anayeandika "Beijing" au "London" hapati
 * kitu. Neno la Kiswahili hutafsiriwa kurudi Kiingereza na utafutaji hufanyika
 * kwa yote mawili.
 */
const FOLD: Record<string, string> = {
  á: 'a', à: 'a', é: 'e', è: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ç: 'c', ñ: 'n',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[áàéèíóúüçñ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, swahili] of Object.entries(table)) {
      const key = swahili.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Kilinganisho cha Kiingereza cha jina la Kiswahili la mahali au uwanja, au null. */
export function swahiliSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
