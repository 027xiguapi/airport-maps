import vocab from './uk-vocab.json';

/**
 * Українська локалізація структурованих даних, які база зберігає лише
 * китайською, традиційною китайською та англійською (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …). Як і німецька, французька,
 * італійська та корейська, українська використовує англійські стовпці як
 * основу й перекладає закриті словники під час рендерингу:
 *
 *  - назви країн, регіонів і міст — власні назви з усталеною українською
 *    формою (Німеччина, Східна Азія, Пекін), а не текст інтерфейсу;
 *  - назви аеропортів — міжнародні англійські назви, перекладені для вибраних
 *    хабів (Міжнародний аеропорт Інчхон) і залишені без змін для каталогу;
 *  - назви терміналів, зони виходів і позначки зручностей — закритий словник,
 *    дзеркальний до db/terminology/en.json.
 *
 * Таблиці в uk-vocab.json, тож робочий сайт і скрипти вмісту читають один файл.
 * Відсутні значення повертаються до англійської: новий аеропорт або місто
 * ніколи не покаже китайський текст.
 */

/** Українські позначки видів транспорту, за ground_transport.icon. */
export const ukTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** Українська назва країни для англійського стовпця. */
export const ukrainianCountry = translate(vocab.countries);

/** Українська назва регіону для англійського стовпця. */
export const ukrainianRegion = translate(vocab.regions);

/** Українська назва міста для англійського стовпця. */
export const ukrainianCity = translate(vocab.cities);

/** Українська назва аеропорту для англійського стовпця. */
export const ukrainianAirportName = translate(vocab.airports);

/** Українська назва терміналу для англійського стовпця. */
export const ukrainianTerminalName = translate(vocab.terminals);

/** Українська позначка зручності для англійського стовпця. */
export const ukrainianLabel = translate(vocab.labels);

/**
 * Зони виходів надходять з англійського шару або як діапазон кодів ("A1–A20",
 * "1–10"), або як фраза з конкорсом, залом чи зоною реєстрації. Перекладати
 * потрібно лише фрази; коди мовно нейтральні.
 */
export function ukrainianGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'Реєстрація / Прибуття')
    .replace(/^Check-in hall$/, 'Зал реєстрації')
    .replace(/^Concourse (.+)$/, 'Конкорс $1')
    .replace(/^Satellite Concourse (.+)$/, 'Сателітний конкорс $1');
}

/** Фраза-зона виходів ("Конкорс A") стоїть сама; код потребує слова «Виходи». */
export function isUkrainianGateRangePhrase(value: string): boolean {
  return /(конкорс|сателіт|реєстрац|прибутт|термінал|check-in)/i.test(value);
}

/**
 * Зворотний індекс: українська назва -> англійське значення стовпця, для
 * пошуку. `search_blob` містить лише китайські, англійські та традиційні
 * китайські назви, тож український відвідувач, який вводить «Пекін» або
 * «Лондон», нічого не знайшов би. Український термін перекладається назад
 * англійською, і пошук виконується для обох.
 *
 * Літери і/ї/є/ґ отримують другий ключ без діакритики («kyiv» → «kiiv»),
 * бо клавіатури й відвідувачі часто їх пропускають.
 */
const FOLD: Record<string, string> = {
  і: 'i', ї: 'i', є: 'e', ґ: 'g', й: 'i', ь: '', ъ: '',
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ç: 'c',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[іїєґйьъáéíóúüç]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, ukrainian] of Object.entries(table)) {
      const key = ukrainian.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** Англійський відповідник української назви місця або аеропорту, або null. */
export function ukrainianSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
