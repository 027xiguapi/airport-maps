import type { Messages } from './zh';
import { ukTransportModes } from '../uk-data';

/** Клас аеропорту у вступному реченні (тип airport у schema.org). */
const AIRPORT_KIND = {
  large: 'великий аеропорт',
  medium: 'середній аеропорт',
  small: 'малий аеропорт',
  heliport: 'геліпорт',
} as const;

/**
 * Українська форма після числівника: 1 термінал, 2–4 термінали, 5+ терміналів
 * (з винятком 11–14). `value` уже відформатоване, тому розбираємо його назад.
 */
const pluralUk = (value: string, one: string, few: string, many: string) => {
  const n = Number(value.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return `${value} ${many}`;
  const abs = Math.abs(n);
  if (!Number.isInteger(abs)) return `${value} ${many}`;
  if (abs === 1) return `${value} ${one}`;
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${value} ${few}`;
  return `${value} ${many}`;
};

/**
 * Український каталог. Типізований за китайським джерелом (`Messages`), тому
 * відсутній або перейменований ключ зупиняє компіляцію.
 */
export const uk: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Карти аеропортів і терміналів',
    description:
      'Переглядайте карти терміналів аеропортів, упорядковані за країнами й регіонами. Від великих міжнародних хабів до регіональних аеропортів: детальні схеми виходів, зон реєстрації, стрічок видачі багажу, крамниць, ресторанів, лаунжів і транспорту до міста.',
    keywords: [
      'карти аеропортів',
      'карти терміналів',
      'схема терміналу аеропорту',
      'виходи на посадку',
      'транспорт аеропорту',
      'гід аеропортом',
    ],
    numberOfItems: (n: number) =>
      pluralUk(String(n), 'аеропорт', 'аеропорти', 'аеропортів'),
  },

  nav: {
    home: 'Головна',
    airports: 'Усі аеропорти',
    countries: 'За країною',
    tools: 'Онлайн-інструменти',
    about: 'Про нас',
    label: 'Головна навігація',
    languageLabel: 'Мова',
    switchLanguage: 'Змінити мову',
    languagePlanned: 'У підготовці',
    languagePlannedHint: 'Ця мовна версія ще не опублікована.',
    themeToggle: 'Перемкнути темний режим',
    menu: 'Меню',
  },

  common: {
    advertisement: 'Реклама',
    skipToContent: 'Перейти до вмісту',
    backToTop: 'Нагору',
    breadcrumbLabel: 'Навігаційний ланцюжок',
    home: 'Головна',
    viewMap: 'Переглянути карту',
    terminalMap: 'Карта терміналу',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralUk(String(counts.terminals), 'термінал', 'термінали', 'терміналів')}${
            counts.gates > 0
              ? `, ${pluralUk(String(counts.gates), 'вихід', 'виходи', 'виходів')}`
              : ''
          } — карта терміналу`
        : `${name} (${iata}) — карта розташування та гід ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — карта терміналу` : name,
    airportGuide: 'Гід аеропортом',
    lastUpdated: 'Нещодавно оновлено',
    updatedOn: (date: string) => `Оновлено ${date}`,
    publishedOn: (date: string) => `Опубліковано ${date}`,
    readMore: 'Читати повний гід',
  },

  units: {
    terminalsFact: 'Термінали',
    gatesFact: 'Виходи',
    terminals: (n: number) =>
      pluralUk(String(n), 'термінал', 'термінали', 'терміналів'),
    terminalsShort: (n: number) =>
      pluralUk(String(n), 'термінал', 'термінали', 'терміналів'),
    gates: (n: number) => pluralUk(String(n), 'вихід', 'виходи', 'виходів'),
    airports: (n: number) =>
      pluralUk(String(n), 'аеропорт', 'аеропорти', 'аеропортів'),
    airportsChip: (n: number) =>
      pluralUk(String(n), 'аеропорт', 'аеропорти', 'аеропортів'),
    pax: 'Пасажири',
    paxFull: 'Пасажири на рік',
    distance: 'До центру',
    distanceFrom: (city: string) => `Від центру ${city}`,
    gatesLabel: (range: string) => `Виходи ${range}`,
    gatesCount: (n: number) => `${n} виходів`,
    satellite: 'Сателітний термінал',
    airlinesLabel: 'Основні авіакомпанії: ',
  },

  search: {
    ariaLabel: 'Пошук аеропортів',
    placeholder: 'Пошук аеропортів, міст або кодів IATA',
    heroPlaceholder: 'Шукайте за назвою аеропорту, містом або кодом IATA — напр. LHR / Дубай / Heathrow',
    submit: 'Знайти аеропорт',
    loading: 'Пошук…',
    empty: 'Не знайдено відповідних аеропортів',
    resultsTitle: (term: string) => `Результати для «${term}»`,
    resultsCount: (n: number) =>
      `Знайдено ${pluralUk(String(n), 'відповідний аеропорт', 'відповідні аеропорти', 'відповідних аеропортів')}.`,
    noResults: 'Жоден аеропорт не відповідає. Спробуйте інше слово, наприклад назву міста або код IATA.',
    noResultsHint: 'Не можете знайти потрібний аеропорт?',
    viewAll: (n: number) => `Переглянути всі ${n} аеропортів`,
    orBrowseByCountry: 'або перегляньте за країною',
    range: (from: number, to: number, total: number) =>
      `Показано ${from}–${to} з ${total} аеропортів`,
  },

  hero: {
    eyebrow: 'Світовий каталог аеропортів',
    titleLead: 'Досліджуйте аеропорти та',
    titleAccent: 'карти терміналів',
    sub: 'Знайдіть дорогу в будь-якому аеропорту завдяки повній колекції карт аеропортів і терміналів, упорядкованих за країнами й регіонами — від великих міжнародних хабів до регіональних аеропортів.',
    stats: {
      countries: 'Країни / регіони',
      airports: 'Аеропорти',
      terminals: 'Карти терміналів',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Про цей сайт',
      imageAlt: 'Пасажирський літак біля виходу аеропорту зі скляним фасадом на світанку',
      blocks: [
        {
          title: 'Орієнтуйтеся в будь-якому аеропорту завдяки детальним картам терміналів',
          body: 'Орієнтуватися в аеропортах і терміналах по всьому світу буває складно. Наші карти показують детальні схеми терміналів, виходів, зон реєстрації, стрічок багажу, крамниць, ресторанів, лаунжів і транспортних вузлів, тож маршрут можна спланувати ще до подорожі.',
        },
        {
          title: 'Інтерактивні карти терміналів і плани поверхів',
          body: 'Великі міжнародні аеропорти мають кілька терміналів і складні схеми. Наші карти допомагають знайти виходи, розташувати зручності, спланувати пересадки й ефективно пройти контроль безпеки, зони вильоту та прибуття — без зайвих кіл.',
        },
        {
          title: 'Транспорт і доступ до аеропорту',
          body: 'Окрім схем терміналів, наші гіди описують варіанти транспорту, паркування та під’їзні шляхи. Знайдіть найкращий спосіб дістатися до виходу, перейти між терміналами та скористатися наземним транспортом: потягом, автобусом, таксі й орендованим авто.',
        },
      ],
    },
    map: {
      kicker: 'Карта світу',
      title: 'Карта аеропортів',
      en: 'Карта аеропортів',
      sub: (airports: string, world: string) =>
        `Локалізуйте ${world} аеропортів з регулярними рейсами по всьому світу — ${airports} з них мають тут карту терміналу. Натисніть точку, щоб побачити країну або регіон і деталі.`,
      all: 'Усі',
      gEurope: 'Європа',
      gAsia: 'Азія',
      gAmericas: 'Америка',
      gAfrica: 'Африка',
      gOceania: 'Океанія',
      legendSite: 'Є тут · натисніть для карт терміналів',
      legendWorld: 'Інші аеропорти з регулярними рейсами',
      countTemplate: 'Показано {n} аеропортів',
      download: 'Завантажити дані',
      downloadTitle: 'Експортувати всі аеропорти поточного фільтра в CSV (IATA, назва, місто, країна, координати)',
      openAirport: 'Переглянути аеропорт',
    },
    popular: {
      kicker: 'Карти терміналів',
      title: 'Популярні карти аеропортів',
      en: 'Карти аеропортів',
      sub: 'Добірка обкладинок карт терміналів великих аеропортів світу — відкрийте сторінку аеропорту для повної карти.',
    },
    recent: {
      kicker: 'Щойно опубліковано',
      title: 'Нещодавно оновлено',
      en: 'Нещодавно оновлено',
      sub: 'Нові та переглянуті аеропорти, країни й путівники.',
      countriesTitle: 'Нещодавно оновлені країни',
    },
    routes: {
      kicker: 'Маршрути',
      title: 'Найзавантаженіші карти маршрутів',
      en: 'Карти маршрутів',
      sub: 'Аеропорти, упорядковані за кількістю місць прямих рейсів — відкрийте один, щоб побачити карту маршрутів, авіакомпанії та список напрямків.',
      collection: 'Колекція маршрутів',
      tabsLabel: 'Карти маршрутів за містами',
      explore: (city: string) => `Дослідити ${city}`,
      play: 'Запустити слайдшоу',
      pause: 'Пауза слайдшоу',
    },
    photos: {
      kicker: 'Останні фото',
      title: 'Останні фото аеропортів',
      en: 'Останні фото',
      sub: 'Найновіші додані фото аеропортів — шість найновіших аеропортів, по одному фото.',
      ariaLabel: 'Карусель останніх фото аеропортів',
      prev: 'Попереднє фото',
      next: 'Наступне фото',
      play: 'Запустити слайдшоу',
      pause: 'Пауза слайдшоу',
      counter: (index: number, total: number) => `Фото ${index} з ${total}`,
      view: (name: string) => `Переглянути карту ${name}`,
      open: 'Відкрити сторінку аеропорту',
    },
    countries: {
      kicker: 'За країною',
      title: 'Карти аеропортів за країною',
      en: 'Країни',
      sub: 'Переглядайте карти терміналів, упорядковані за країнами й регіонами, від великих міжнародних хабів до регіональних аеропортів.',
      more: 'Усі країни',
    },
    all: {
      kicker: 'Усі карти',
      title: 'Усі карти аеропортів',
      en: 'Усі аеропорти',
      sub: 'Карти найзавантаженіших аеропортів і туристичних хабів світу.',
      hint: 'Виберіть аеропорт, щоб побачити схему терміналу.',
      more: 'Переглянути все',
    },
    facts: {
      kicker: 'Дані каталогу',
      title: 'Дані аеропортів стисло',
      en: 'Списки й таблиці',
      sub: 'Цифри каталогу у вигляді списків і таблиць: охоплення, найзавантаженіші аеропорти з опублікованими даними про пасажирів і регіональний поділ.',
      note: (pax: string, detailed: string, total: string) =>
        `Дані про пасажирів охоплюють ${pax} з ${total} аеропортів; дані про термінали й виходи охоплюють ${detailed} з ${total}. Кількість терміналів відповідає власному групуванню каталогу й може включати конкорси.`,
      coverageTitle: 'Цифри охоплення',
      coverage: {
        airports: 'Аеропорти',
        countries: 'Країни та регіони',
        regions: 'Регіони каталогу',
        cities: 'Унікальні назви міст',
        terminals: 'Термінали',
        gates: 'Виходи',
        routes: 'Аеропорти з картою маршрутів',
      },
      busiest: {
        title: 'Найзавантаженіші аеропорти за річними пасажирами',
        sub: 'Дванадцять найзавантаженіших аеропортів серед тих, що мають опубліковані річні дані про пасажирів.',
        caption: 'Аеропорти з опублікованими річними даними про пасажирів, за рейтингом',
        rank: 'Місце',
        iata: 'IATA',
        airport: 'Аеропорт',
        city: 'Місто',
        country: 'Країна',
        terminals: 'Термінали',
        gates: 'Виходи',
        pax: 'Пасажири на рік (млн)',
      },
      regions: {
        title: 'Аеропорти за регіоном каталогу',
        sub: 'Кількість аеропортів, терміналів і виходів, згрупована за регіонами каталогу; деякі країни й території належать до двох регіонів.',
        caption: 'Кількість аеропортів за регіоном каталогу',
        region: 'Регіон',
        airports: 'Аеропорти',
        detailed: 'З детальними даними',
        terminals: 'Термінали',
        gates: 'Виходи',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Аеропорт',
    city: 'Місто',
    country: 'Країна',
    size: 'Розмір',
    map: 'Карта',
    empty: 'Жоден аеропорт не відповідає фільтрам. Спробуйте розширити вибір.',
  },

  pager: {
    label: 'Пагінація',
    previous: 'Попередня сторінка',
    next: 'Наступна сторінка',
  },

  filters: {
    searchPlaceholder: 'Пошук аеропортів, міст або кодів IATA',
    submit: 'Знайти',
    country: 'Країна',
    all: 'Усі',
    sort: 'Сортувати',
    sortPax: 'Пасажири',
    sortName: 'Назва',
    sortIata: 'Код IATA',
    sortUpdated: 'Останнє оновлення',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Усі карти аеропортів: ${country}${sortLabel ? ` — сортування за: ${sortLabel}` : ''}`
        : `Усі карти аеропортів — сортування за: ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Усі карти аеропортів країни ${country} на одній сторінці: схеми терміналів, зони виходів і наземний транспорт${sortLabel ? `, упорядковано за: ${sortLabel}` : ''}.`
        : `Повний каталог карт аеропортів на одній сторінці: схеми терміналів, зони виходів і наземний транспорт${sortLabel ? `, упорядковано за: ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Переглянути аеропорти за країною',
    description:
      'Переглядайте світовий каталог карт терміналів за країнами й регіонами. Від великих міжнародних хабів до регіональних аеропортів: дізнайтеся, скільки аеропортів і терміналів має кожна країна.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Від великих міжнародних хабів до регіональних аеропортів — ${countries} країн і регіонів, ${airports} аеропортів і ${terminals} терміналів загалом.`,
    regionCount: (countries: number, airports: number) =>
      `${pluralUk(String(countries), 'країна', 'країни', 'країн')} · ${pluralUk(String(airports), 'аеропорт', 'аеропорти', 'аеропортів')}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} — карта аеропортів, усіх ${count}` : `Карти аеропортів: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} має ${total} аеропортів з регулярними рейсами; ${count} з них мають тут сторінку-гід, з картою розподілу, повним національним списком і прямими сполученнями.`
        : `Карти терміналів для ${count} аеропортів у ${name} (${nameEn}), що охоплюють головні міжнародні хаби та регіональні аеропорти регіону ${region}. Перегляньте виходи, схеми терміналів і наземний транспорт.`,
    chip: (nameEn: string) => `АЕРОПОРТИ: ${nameEn.toUpperCase()}`,
    kicker: 'Карти аеропортів',
    titleOf: (name: string) => `Аеропорти в ${name}`,
    en: 'Аеропорти',
    sub: 'Виберіть аеропорт, щоб побачити схему терміналу, зони виходів і варіанти транспорту.',
    empty: 'Для цієї країни або регіону ще немає аеропортів.',
    moreKicker: 'Інші країни',
    moreTitle: 'Переглянути інші країни',
    moreEn: 'Більше країн',
    all: 'Усі країни',
    notFound: 'Країну не знайдено',
    introKicker: 'Огляд',
    introTitle: (name: string) => `Огляд аеропортів: ${name}`,
    introEn: 'Огляд аеропортів',
    introSub:
      'Масштаб аеропортів у цій країні чи регіоні, головні хаби та міста, які вони обслуговують.',
    introBody: (o: {
      name: string;
      nameEn: string;
      region: string;
      airports: string;
      terminals: string | null;
      gates: string | null;
      cities: string;
      busiest: string | null;
      busiestIata: string;
      busiestPax: string;
      mapsNote: string;
    }) =>
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} розташований у регіоні ${o.region}. Цей сайт охоплює ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` і ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) — найбільший за річною кількістю пасажирів, ${o.busiestPax}.`
        : '') +
      ` Аеропорти обслуговують такі міста, як ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Кожна сторінка аеропорту містить карту розташування й коди аеропорту, а також усі зібрані дані про термінали, виходи й транспорт.',
    distribution: {
      kicker: 'Розподіл',
      title: (name: string) => `Карта розподілу аеропортів: ${name}`,
      en: 'Розподіл аеропортів',
      sub: (covered: string, total: string) =>
        `${total} аеропортів з регулярними рейсами по всій країні (великі, середні та малі); ${covered} з них мають тут сторінку-гід. Повний список нижче.`,
      mapAlt: (name: string, total: string) =>
        `Карта розподілу аеропортів: ${name}, ${total} аеропортів з регулярними рейсами`,
      siteTag: 'Є тут',
      colAirport: 'Аеропорт',
      colCity: 'Місто',
      colType: 'Тип',
      types: {
        large: 'Великий',
        medium: 'Середній',
        small: 'Малий',
      },
      empty: 'Національний список аеропортів ще недоступний.',
    },
    linksTitle: 'Пов’язані посилання',
    linksEn: 'Пов’язані посилання',
    linksSub: 'Офіційні сайти й енциклопедії для країни та кожного її аеропорту.',
    linksCountry: (name: string) => `Джерела про ${name}`,
    linksAirports: (name: string) => `Аеропорти в ${name}`,
    faqKicker: 'Часті запитання',
    faqTitle: 'Часті запитання',
    faqEn: 'Запитання',
    faq: {
      airportTotal: (name: string) => `Скільки аеропортів у ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} має ${total} аеропортів з регулярними пасажирськими рейсами (великих, середніх і малих); цей сайт детально охоплює ${covered} з них. Дивіться карту розподілу й повний список вище.`,
      airportCount: (name: string) => `Які аеропорти охоплені в ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Цей сайт охоплює ${count} у ${name}: ${list}.`,
      busiest: (name: string) => `Який аеропорт у ${name} найзавантаженіший?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `За річною кількістю пасажирів ${busiest} (${iata}) — найбільший серед охоплених тут аеропортів, ${pax}.`,
      terminals: (name: string) => `Скільки терміналів мають аеропорти в ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Охоплені в ${name} аеропорти мають ${terminals} із загалом ${gates}: ${list}.`,
      cities: (name: string) => `Які міста в ${name} мають аеропорт?`,
      citiesAnswer: (name: string, cities: string) =>
        `Охоплені тут аеропорти ${name} обслуговують такі міста, як ${cities}. Їх можна фільтрувати за містом або кодом IATA у каталозі аеропортів.`,
      maps: (name: string) => `Чи мають аеропорти в ${name} карти терміналів?`,
      mapsAnswer: (name: string, count: string) =>
        `Деякі мають. Сторінки аеропортів містять карту розташування, коди аеропорту й прямі рейси, а ${count} охоплених у ${name} показують схему терміналу, зони виходів і наземний транспорт там, де дані зібрано. Відкрийте аеропорт, щоб побачити, що доступно.`,
    },
  },

  airport: {
    metaDescription: (o: {
      name: string;
      nameEn: string;
      iata: string;
      city: string;
      country: string;
      terminals: string | null;
      gates: string | null;
      pax: string;
      distance: string;
    }) =>
      o.terminals
        ? `${o.name} (${o.iata}) має ${pluralUk(o.terminals, 'термінал', 'термінали', 'терміналів')}${
            o.gates ? ` з ${pluralUk(o.gates, 'виходом', 'виходами', 'виходами')}` : ''
          }${o.pax ? `, обслуговуючи ${o.pax} пасажирів на рік` : ''}${
            o.distance ? `, ${o.distance} від центру міста` : ''
          }. Карта терміналу з усіма терміналами, зонами виходів і наземним транспортом.`
        : `${o.name} (${o.iata}) обслуговує ${o.city}, ${o.country}. Карта розташування, коди аеропорту й туристична інформація.`,
    quickAnswer: (o: {
      name: string;
      iata: string;
      icao: string | null;
      kind: 'large' | 'medium' | 'small' | 'heliport' | null;
      city: string;
      country: string;
      terminals: number;
      gates: number;
      distance: string;
    }) => {
      const where = o.city === o.country ? o.city : `${o.city}, ${o.country}`;
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'аеропорт';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) — ${kind}, що обслуговує ${where}`;
      return o.terminals > 0
        ? `${head}, з ${pluralUk(String(o.terminals), 'терміналом', 'терміналами', 'терміналами')}${
            o.gates > 0 ? ` і ${pluralUk(String(o.gates), 'виходом', 'виходами', 'виходами')}` : ''
          }${o.distance ? `, приблизно ${o.distance} від центру ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Схема терміналу`,
    mapNote: 'СХЕМА ТЕРМІНАЛУ',
    realMapTitle: (iata: string) => `${iata} — карта терміналу, виходи й навігація`,
    mapAlt: (name: string, iata: string) =>
      `Карта терміналу ${name} (${iata}) з усіма терміналами, зонами виходів і конкорсами`,
    realMapNote: 'КАРТА ТЕРМІНАЛУ',
    photosKicker: 'Фото',
    photosTitle: 'Фото аеропорту',
    photosEn: 'Фото аеропорту',
    photosSub:
      'Справжні фото цього аеропорту, кожне із зазначенням публічної вебсторінки, де його знайдено; авторські права належать фотографам. Натисніть на фото, щоб збільшити, або на рядок джерела, щоб відкрити сторінку-джерело.',
    photosCredit: (host: string) => `Джерело: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Фото ${index} аеропорту ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Збільшити фото ${index} аеропорту ${name}`,
    zoomLabel: 'Збільшити',
    zoomClose: 'Закрити',
    zoomIn: 'Наблизити',
    zoomOut: 'Віддалити',
    downloadKicker: 'Завантажити',
    downloadTitle: 'Завантажити карти аеропортів',
    downloadEn: 'Завантаження',
    downloadMapLabel: (year: number, iata: string) =>
      `Найновіша карта терміналу й план поверхів ${iata} ${year} для завантаження`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Найновіша карта терміналу ${iata} ${year} у PDF`,
    timeKicker: 'Час',
    timeTitle: (iata: string) => `Інформація про час — поточний час у ${iata}`,
    timeEn: 'Час в аеропорту',
    timeSub: (iata: string, tz: string) => `Поточний час у ${iata} (${tz}) порівняно з вашим місцевим часом.`,
    clockAirport: 'Поточний час в аеропорту',
    clockLocal: 'Ваш місцевий час',
    infoKicker: 'Інфо',
    infoTitle: 'Інформація та дані аеропорту',
    infoEn: 'Дані аеропорту',
    infoIata: 'Код IATA аеропорту',
    infoLocation: 'Розташування аеропорту',
    infoCoords: 'Координати',
    infoTimezone: 'Часовий пояс',
    linksKicker: 'Посилання',
    linksTitle: 'Пов’язані посилання',
    linksEn: 'ПОВ’ЯЗАНІ ПОСИЛАННЯ',
    linksSub: 'Зовнішні джерела для цього аеропорту: офіційний сайт, Вікіпедія та Baidu Baike.',
    officialSite: 'Офіційний сайт',
    wikiLabel: 'Вікіпедія',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Джерела: ',
    sourcesWikipedia: 'Вікіпедія',
    sourcesOurAirports: 'Відкриті дані OurAirports',
    sourcesNote:
      'Коди аеропортів, координати й клас аеропорту походять з відкритих даних; деталі сторінки відповідають офіційним публікаціям аеропорту.',
    mapEmbedKicker: 'Карта',
    mapEmbedTitle: (name: string) => `Інтерактивна карта — розташування ${name}`,
    mapEmbedEn: 'Інтерактивна карта',
    extMapsNote: 'Переглянути цей аеропорт в інших картографічних сервісах:',
    routeMapKicker: 'Маршрути',
    routeMapTitle: (name: string) => `Карта маршрутів ${name} — прямі напрямки`,
    routeMapEn: 'Карта маршрутів',
    routeMapAria: (name: string) => `Карта прямих рейсів з ${name}`,
    routeLegendTitle: 'Легенда',
    routeLegendClose: 'Сховати легенду',
    routeReset: 'Скинути карту',
    routeZoomIn: 'Наблизити',
    routeZoomOut: 'Віддалити',
    routeFullscreen: 'На весь екран',
    routeExitFullscreen: 'Вийти з повноекранного режиму',
    routeOpenAirport: 'Відкрити сторінку аеропорту {iata}',
    routeTiers: {
      trunk: '6+ авіакомпаній',
      major: '3–5 авіакомпаній',
      minor: '2 авіакомпанії',
      single: '1 авіакомпанія',
    },
    routeCarriersTpl: '{n} авіакомпаній',
    routeTableDest: 'Напрямок',
    routeTableCountry: 'Країна/регіон',
    routeTableDistance: 'Відстань',
    routeTableCarriers: 'Авіакомпанії',
    routeCarriersMore: (n: number) => ` +${n} ще`,
    routeMapNote: (date: string) =>
      `Знімок даних про маршрути: ${date}; лише прямі рейси. Джерело: `,
    legendTerminal: 'Будівля терміналу',
    legendTransit: 'Вузол наземного транспорту',
    legendCorridor: 'Сполучення між терміналами',
    terminalsKicker: 'Термінали',
    terminalsTitle: 'Гід терміналами',
    terminalsEn: 'Гід терміналами',
    terminalsSub: (name: string) =>
      `Зони виходів, основні авіакомпанії та зручності кожного терміналу в ${name}.`,
    transitTitle: 'Наземний транспорт',
    facilitiesTitle: 'Зручності аеропорту',
    faqKicker: 'Часті запитання',
    faqTitle: 'Часті запитання',
    faqEn: 'Запитання',
    guideKicker: 'Гід',
    guideTitle: 'Гід аеропортом',
    guideEn: 'Гід аеропортом',
    blogKicker: 'Статті',
    blogTitle: (iata: string) => `Гіди аеропортом ${iata}`,
    blogEn: 'З блогу',
    blogSub: (iata: string, count: number) =>
      `${count} статей на сайті стосуються ${iata}: прибуття, наземний транспорт, багаж і пересадки.`,
    blogAll: 'Усі статті',
    relatedTitle: (country: string) => `Інші аеропорти в ${country}`,
    relatedEn: (country: string) => `Більше в ${country}`,
    relatedAll: (country: string) => `Усі аеропорти в ${country}`,
    flights: {
      kicker: 'Рейси',
      title: (name: string) => `Рейси до та з ${name} — вильоти й прильоти`,
      en: 'Табло рейсів',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${pluralUk(flights, 'номер рейсу', 'номери рейсів', 'номерів рейсів')} у ${pluralUk(
          airlines,
          'авіакомпанії',
          'авіакомпаній',
          'авіакомпаній'
        )} і ${pluralUk(destinations, 'напрямку', 'напрямків', 'напрямків')}, розділено за напрямком. Номери codeshare включено.`,
      statDepartures: 'Номери вильотів',
      statArrivals: 'Номери прильотів',
      statAirlines: 'Авіакомпанії',
      statDestinations: 'Напрямки',
      note: (date: string) =>
        `Номери рейсів і маршрути з індексу aviability.com (знімок ${date}); номери codeshare включено, час вильоту не показано. Джерело: `,
      source: 'aviability.com',
      tabDepartures: 'Вильоти',
      tabArrivals: 'Прильоти',
      search: 'Пошук номера рейсу, авіакомпанії або міста',
      clearSearch: 'Очистити пошук',
      flight: 'Рейс',
      airline: 'Авіакомпанія',
      destination: 'Напрямок',
      origin: 'Звідки',
      country: 'Країна/регіон',
      empty: 'Жоден рейс не відповідає пошуку.',
      loading: 'Завантаження рейсів…',
      error: 'Не вдалося завантажити більше рейсів.',
      retry: 'Спробувати знову',
      previous: 'Попередня',
      next: 'Наступна',
      pagination: 'Пагінація',
      showing: 'Показано {from}–{to} з {total} номерів рейсів',
      pageOf: 'Сторінка {page} з {pages}',
    },
    notFound: 'Аеропорт не знайдено',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Найновіша карта маршрутів ${name} (${iata}) ${year} — ${count} прямих напрямків`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Карта прямих рейсів з ${name} (${iata}): ${count} напрямків з авіакомпаніями й відстанями та повний список напрямків.`,
    heading: (name: string) => `Карта маршрутів ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} має ${count} прямих напрямків, забарвлених за кількістю авіакомпаній, що їх обслуговують.`,
    backToAirport: (iata: string) => `Назад до сторінки аеропорту ${iata}`,
    flightNumbers: (iata: string) => `Номери рейсів ${iata}`,
    openFull: 'Переглянути карту маршрутів',
    previewCta: (iata: string) => `Переглянути повну карту маршрутів ${iata}`,
    teaserSub: (count: string) => `${count} прямих напрямків: карта, авіакомпанії та відстані.`,
    mapSectionTitle: (name: string) => `Карта прямих рейсів з ${name}`,
    tableKicker: (iata: string) => `${iata} · Напрямки`,
    tableSectionTitle: (name: string) => `Список прямих напрямків з ${name}`,
    tableSectionEn: (iata: string) => `Напрямки ${iata}`,
    tableToc: 'Напрямки',
    tableSectionSub: (count: string) =>
      `${count} напрямків, найзавантаженіші спершу за кількістю авіакомпаній, з відстанню й перевізниками.`,
    dataKicker: 'Завантажити',
    dataTitle: 'Завантажити дані про маршрути',
    dataEn: 'Дані',
    dataSub: (count: number) =>
      `${count} прямих сполучень з напрямком, кодом IATA, містом, країною, відстанню й авіакомпаніями — готово для таблиці або скрипта.`,
    dataFields: 'CSV підходить для Excel / Numbers, JSON — для коду; обидва в UTF-8.',
    dataCsv: 'Завантажити CSV',
    dataJson: 'Завантажити JSON',
    airportMapSub:
      'Схема терміналів і виходів стисло — натисніть на зображення, щоб побачити повну карту, зручності терміналів і наземний транспорт на сторінці аеропорту.',
    airportMapCta: (iata: string) => `Переглянути повну карту терміналу ${iata}`,
    factDestinations: 'Прямі напрямки',
    factAirlines: 'Авіакомпанії',
    factCountries: 'Країни',
    factSnapshot: 'Знімок даних',
    faqCountQ: (name: string) => `До скількох місць ${name} літає без пересадок?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) має ${count} прямих напрямків у ${countries} країнах і територіях. Рахуються лише прямі рейси; маршрути з пересадкою — ні.`,
    faqAirlinesQ: (name: string) => `Скільки авіакомпаній літає з ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} авіакомпаній виконують прямі рейси з цього аеропорту. Найбільші мережі мають ${leaders} (кількість напрямків у дужках).`,
    faqFarthestQ: (name: string) => `Який найдальший прямий напрямок з ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Найдальший прямий напрямок — ${city}, ${country} ${iata}, приблизно ${km} км.`,
    faqBusiestQ: () => 'Які напрямки мають найбільшу конкуренцію?',
    faqBusiestA: (count: string, list: string) =>
      `${count} напрямків обслуговують три або більше авіакомпаній; найзавантаженіші — ${list}.`,
    faqSourceQ: () => 'Як часто оновлюються дані про маршрути?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Маршрути на цій сторінці походять з відкритого набору ${source} (${license}), знімка від ${date}, а не живого розкладу — квитки й час перевіряйте в авіакомпанії або аеропорту.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Рейс ${number} авіакомпанії ${airline} — ${from} до ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейсу, який використовує ${airline} на маршруті ${from}–${to}${distance ? `, приблизно ${distance}` : ''}. Карта маршруту, аеропорти вильоту й прильоту, відстань та інші рейси на маршруті.`,
    heading: (number: string) => `Рейс ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейсу, який використовує ${airline} між ${from} і ${to}${distance ? `, відстань по прямій приблизно ${distance}` : ''}.`,
    factFlight: 'Номер рейсу',
    factFrom: 'З',
    factTo: 'До',
    factDistance: 'Відстань',
    overviewKicker: 'Огляд',
    overviewTitle: (number: string) => `Про рейс ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} — номер рейсу, який використовує ${airline} між ${originName} (${originIata}) і ${destName} (${destIata})${distance ? `, приблизно ${distance} один від одного` : ''}. Сторінка збирає номер рейсу, авіакомпанію, маршрут і обидва аеропорти для швидкої довідки.`,
    overviewNote:
      'Індекс рейсів не містить часу вильоту чи прильоту, типів літаків або днів виконання; розклад, реєстрацію й посадку уточнюйте в авіакомпанії або аеропорту.',
    routeKicker: 'Маршрут',
    routeTitle: (from: string, to: string) => `Маршрут ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Схема маршруту рейсу ${number}`,
    routeMapAria: (number: string) => `Карта маршруту рейсу ${number}`,
    airportsKicker: 'Аеропорти',
    airportsTitle: 'Аеропорти вильоту й прильоту',
    airportsSub:
      'Аеропорти, які з’єднує цей рейс. Аеропорти з каталогу відкривають власну сторінку.',
    originAirport: 'Аеропорт вильоту',
    destinationAirport: 'Аеропорт прильоту',
    airportPage: 'Відкрити сторінку аеропорту',
    detailsKicker: 'Деталі',
    detailsTitle: 'Дані рейсу',
    detailsFlight: 'Номер рейсу',
    detailsAirline: 'Авіакомпанія',
    detailsOrigin: 'Аеропорт вильоту',
    detailsDestination: 'Аеропорт прильоту',
    detailsDistance: 'Відстань по прямій',
    detailsRoutes: 'Перелічені маршрути',
    detailsSnapshot: 'Знімок даних',
    routesKicker: 'Маршрути',
    routesTitle: 'Маршрути під цим номером рейсу',
    routesSub: (count: string) =>
      `Номер трапляється на ${count} маршрутах; один номер можуть використовувати партнери codeshare.`,
    routesRoute: 'Маршрут',
    routesAirline: 'Авіакомпанія',
    routesDistance: 'Відстань',
    relatedKicker: 'Пов’язане',
    relatedTitle: 'Інші рейси на цьому маршруті',
    relatedSub: 'Інші номери рейсів між тими самими аеропортами вильоту й прильоту.',
    relatedEn: 'Більше рейсів',
    faqKicker: 'Часті запитання',
    faqTitle: 'Часті запитання',
    faqEn: 'Запитання',
    faqWhat: (number: string) => `Що таке рейс ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейсу, який використовує ${airline} на маршруті ${from} → ${to}${distance ? `, приблизно ${distance} один від одного` : ''}.`,
    faqRoute: (number: string) => `Куди літає рейс ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Рейс ${number} летить з ${originName} (${originIata}) до ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Де час вильоту й прильоту для ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Сторінка охоплює номер рейсу, авіакомпанію, маршрут і аеропорти для ${number}. Індекс aviability.com не містить часу вильоту чи прильоту — актуальний розклад перевіряйте в авіакомпанії або аеропорту.`,
    note: (date: string) =>
      `Номер рейсу, авіакомпанія й маршрут з індексу aviability.com (знімок ${date}); час вильоту й прильоту не включено. Джерело: `,
    source: 'aviability.com',
    sourceFlight: 'Переглянути на aviability.com',
    viewAirport: (iata: string) => `Відкрити сторінку аеропорту ${iata}`,
    notFound: 'Рейс не знайдено',
  },

  faq: {
    terminalCount: (name: string) => `Скільки терміналів має ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) має ${terminals} терміналів із загалом ${gates} виходами: ${list}.`,
    gateCount: (name: string) => `Скільки виходів має ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) має загалом ${gates} виходів: ${list}.`,
    whereIs: (iata: string) => `Де розташований ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} — код IATA аеропорту ${name} (${nameEn}), розташованого в ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Як далеко ${name} від центру ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} розташований приблизно ${distance} від центру ${city}. До міста можна дістатися: ${transit}.`,
    access: (name: string, city: string) => `Як дістатися з ${name} до ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Які зручності пропонує ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} пропонує ${facilities}. Розподіл між терміналами дивіться у схемі терміналу вище.`,
    location: (name: string) => `Де розташований ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, код IATA ${iata}) розташований у ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Які авіакомпанії обслуговують кожен термінал у ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Основні авіакомпанії за терміналами в ${name}: ${list}. Авіакомпанії й розподіл виходів змінюються, тому завжди перевіряйте посадковий талон і вказівники в аеропорту.`,
    timezone: (name: string) => `У якому часовому поясі ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) розташований у часовому поясі ${tz}. Порівняйте з місцевим часом за годинником аеропорту вище.`,
    flightsCount: (name: string) => `Скільки номерів рейсів указано для ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Індекс aviability.com наводить ${pluralUk(
        departures,
        'номер вильоту',
        'номери вильотів',
        'номерів вильотів'
      )} і ${pluralUk(arrivals, 'номер прильоту', 'номери прильотів', 'номерів прильотів')} для ${name} (${iata}), охоплюючи ${pluralUk(
        airlines,
        'авіакомпанію',
        'авіакомпанії',
        'авіакомпаній'
      )} і ${pluralUk(destinations, 'напрямок', 'напрямки', 'напрямків')} (знімок ${date}). Номери codeshare включено, а розклади можуть змінюватися — уточнюйте в авіакомпанії перед подорожжю.`,
  },

  editorial: {
    authorName: 'Редакційна команда World Airport Maps',
    role: 'Укладено й перевірено ',
    sourcesNote: 'Укладено з публічних джерел та офіційної інформації аеропортів',
  },

  toc: {
    label: 'На цій сторінці',
    map: 'Карта терміналу',
    photos: 'Фото аеропорту',
    time: 'Час в аеропорту',
    details: 'Дані аеропорту',
    links: 'Пов’язані посилання',
    location: 'Карта розташування',
    routes: 'Карта маршрутів',
    flights: 'Рейси',
    guide: 'Гід аеропортом',
    blog: 'Пов’язані гіди',
    terminals: 'Гід терміналами',
    transport: 'Наземний транспорт',
    facilities: 'Зручності',
    faq: 'Часті запитання',
    flightOverview: 'Огляд рейсу',
    flightRoute: 'Маршрут',
    flightAirports: 'Аеропорти',
    flightDetails: 'Дані рейсу',
    flightRoutes: 'Усі маршрути',
    flightRelated: 'Пов’язані рейси',
    intro: 'Огляд аеропортів',
    distribution: 'Розподіл аеропортів',
    airports: 'Список аеропортів',
  },

  error: {
    title: 'Сторінку не вдалося завантажити',
    sub: 'Під час читання даних аеропорту сталася помилка. Спробуйте ще раз або поверніться на головну.',
    retry: 'Спробувати знову',
    backHome: 'Назад на головну',
    notFoundTitle: '404 · Сторінку не знайдено',
    notFoundSub: 'Запитану сторінку могло бути переміщено або видалено. Спробуйте знайти аеропорт або скористайтеся посиланнями нижче.',
  },

  footer: {
    sponsored: 'Спонсоровано',
    mapsTitle: 'Детальні карти терміналів',
    mapsBody:
      'Орієнтуватися в аеропортах і терміналах буває складно. Наші карти показують детальні схеми терміналів, виходів, зон реєстрації, стрічок багажу, крамниць, ресторанів, лаунжів і транспортних вузлів, щоб подорож була плавнішою.',
    plansTitle: 'Інтерактивні плани терміналів',
    plansBody:
      'Великі міжнародні аеропорти мають кілька терміналів і складні схеми. Наші карти допомагають знайти вихід, зручності, спланувати пересадку й ефективно пройти контроль, вильоти та прильоти.',
    transitTitle: 'Транспорт і доступ до аеропорту',
    transitBody:
      'Окрім схем терміналів, ми описуємо варіанти транспорту, паркування й під’їзні шляхи — як дістатися до виходу, перейти між терміналами та скористатися потягом, автобусом, таксі й орендованим авто.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} країн / регіонів · ${airports} аеропортів · ${terminals} терміналів · ілюстровані схеми терміналів`,
    fallback: 'Ілюстровані схеми терміналів і транспортні гіди для аеропортів світу',
    linksLabel: 'Навігація в нижньому колонтитулі',
    about: 'Про нас',
    contact: 'Контакти',
    sources: 'Джерела даних',
    privacy: 'Політика конфіденційності',
    disclaimer: 'Відмова від відповідальності',
    terms: 'Умови використання',
  },

  transportModes: ukTransportModes as Record<string, string>,

  categories: {
    kicker: 'Перегляд',
    title: 'Перегляд за областю',
    en: 'Перегляд за областю',
    sub: 'Увійдіть до каталогу з будь-якого боку: за країною, регіоном, містом — або одразу до найзавантаженіших хабів, останніх оновлень і гідів.',
    allAirports: {
      title: 'Усі аеропорти',
      body: 'Повний каталог, упорядкований за пасажиропотоком, з фільтром країни й повторним сортуванням.',
    },
    byCountry: {
      title: 'За країною',
      body: 'Дізнайтеся, скільки аеропортів, терміналів і виходів має кожна країна чи регіон.',
    },
    byRegion: {
      title: 'За регіоном',
      body: 'Країни, згруповані в Східну Азію, Європу, Північну Америку та решту світу.',
    },
    popularCities: {
      title: 'Популярні міста',
      body: 'Найзавантаженіші авіаційні міста за загальною річною кількістю пасажирів і всі аеропорти в кожному.',
    },
    recentlyUpdated: {
      title: 'Нещодавно оновлено',
      body: 'Нові та переглянуті записи аеропортів, найновіші спершу.',
    },
    guides: {
      title: 'Гіди аеропортами',
      body: 'Докладні гіди про пересадки, дорогу до міста й практичні поради.',
    },
    routes: {
      title: 'Карти маршрутів',
      body: 'Перегляньте мережу прямих рейсів аеропорту, упорядковану за кількістю напрямків, з авіакомпаніями й відстанями.',
    },
  },

  guides: {
    kicker: 'Гіди',
    title: 'Гіди аеропортами',
    en: 'Гіди аеропортами',
    sub: 'Окрім схем терміналів, ми підготували докладні гіди для вибраних хабів: як читати нумерацію виходів, як переходити між терміналами й як дістатися до міста.',
    more: 'Переглянути цей аеропорт',
  },

  blog: {
    kicker: 'Журнал',
    title: 'Дорожні нотатки',
    nav: 'Блог',
    en: 'Дорожні нотатки',
    sub: 'Докладні нотатки нашої редакції: прибуття й імміграція, пересадки, зручності терміналів і місця для відпочинку.',
    more: 'Читати',
    all: 'Усі статті',
    morePosts: 'Більше статей',
    airportsKicker: 'Аеропорти',
    airportsTitle: 'Аеропорти в цій статті',
    airportsEn: 'Охоплені аеропорти',
    airportsSub: 'Відкрийте сторінку аеропорту, щоб побачити карту терміналу, наземний транспорт і часті запитання.',
    back: 'Назад до списку статей',
    empty: 'Статей ще немає.',
    readingMinutes: (n: number) => `${n} хв читання`,
    source: (name: string) => `Джерело: ${name}`,
    tags: 'Теги',
  },

  comments: {
    kicker: 'Коментарі',
    title: 'Коментарі читачів',
    en: 'Обговорення',
    sub: 'Запитання, розповіді про подорожі та виправлення вітаються. Коментарі публічні.',
    formTitle: 'Залишити коментар',
    countOne: '1 коментар',
    countMany: '{n} коментарів',
    empty: 'Коментарів ще немає — будьте першим.',
    loading: 'Завантаження коментарів…',
    loadError: 'Коментарі зараз недоступні.',
    retry: 'Спробувати знову',
    nameLabel: "Ім'я",
    namePlaceholder: 'Як до вас звертатися?',
    bodyLabel: 'Коментар',
    bodyPlaceholder: 'Поділіться досвідом, поставте запитання або додайте контекст…',
    submit: 'Опублікувати коментар',
    submitting: 'Публікація…',
    success: 'Опубліковано — дякуємо за участь.',
    error: 'Не вдалося опублікувати коментар. Спробуйте пізніше.',
    rateLimited: 'Це було занадто швидко. Зачекайте кілька хвилин і спробуйте знову.',
    nameError: "Введіть ім'я (2–40 символів).",
    bodyError: 'Напишіть коментар (5–2000 символів).',
    note: 'Коментарі публічні й відображають думки авторів. Будьте ввічливі й не публікуйте рекламу чи особисті дані.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Схема терміналу ${name}`,
    gates: 'Виходи',
    terminal: 'Термінал',
    corridor: 'Сполучення',
    transit: 'Наземний транспорт',
    footer: (iata: string) => `${iata} · Схема терміналу`,
  },

  tool: {
    label: 'Онлайн-інструменти',
    hub: {
      kicker: 'Інструменти',
      title: 'Інструменти для карт і координат',
      en: 'Безкоштовні інструменти',
      sub: 'Безкоштовні онлайн-інструменти для мандрівників і любителів географії — працюють у браузері, нічого встановлювати не потрібно.',
      description:
        'Безкоштовні онлайн-інструменти для карт і координат: конвертація WGS84 / GCJ02 / BD09, десяткові градуси ↔ DMS і відстань по прямій між двома точками. Двомовні, одразу в браузері.',
      comingTitle: 'Більше інструментів у розробці',
      comingSub: 'Вибір координат на карті, обмін місцезнаходженням і калькулятори проєкцій уже в дорозі.',
    },
    howTitle: 'Як користуватися',
    relatedTitle: 'Пов’язані інструменти',
    allTools: 'Усі інструменти',
    tools: {
      coordinateConverter: {
        title: 'Конвертер координат',
        en: 'Конвертер координат',
        description:
          'Конвертуйте між WGS84, GCJ02 і BD09 — вирішення проблеми зсуву карт у Китаї.',
        note: 'WGS84 — стандарт GPS і міжнародний стандарт. GCJ02 — зсунута система координат, обов’язкова в материковому Китаї (її називають «марсіанськими координатами»), використовується AMap і Tencent Maps. BD09 додає ще один зсув поверх GCJ02 і використовується Baidu Maps. Те саме місце може відрізнятися на 100–700 м між системами, тому конвертуйте перед повторним використанням координат в іншому картографічному сервісі.',
        steps: [
          'Введіть десяткові координати як широту, довготу — напр. 39.9042, 116.4074.',
          'Виберіть систему координат вхідних даних.',
          'Натисніть «Конвертувати», щоб отримати дві інші системи; «Копіювати» збереже результат.',
        ],
        inputLabel: 'Координати (широта, довгота)',
        inputPlaceholder: 'напр. 39.9042, 116.4074',
        sourceLabel: 'Система координат вхідних даних',
        wgs84: 'WGS84 · GPS / міжнародна',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Знаків після коми',
        submit: 'Конвертувати',
        copy: 'Копіювати',
        copied: 'Скопійовано',
        error: 'Не вдалося розібрати координати. Використовуйте формат «широта, довгота», напр. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Конвертер формату координат',
        en: 'Конвертер формату координат',
        description:
          'Конвертуйте між десятковими градусами (DD), градусами-хвилинами (DM) і градусами-хвилинами-секундами (DMS); формат вхідних даних визначається автоматично.',
        note: 'DD (39.9042°) — простий десятковий формат пристроїв і API; DMS (39°54′15″N) поширений у морській справі, авіації та геодезії; DM (39°54.25′N) типовий для польових записів. Інструмент визначає формат за кількістю груп цифр у кожній половині (1 = DD, 2 = DM, 3 = DMS) і показує всі три формати, з N/S/E/W для півкуль.',
        steps: [
          'Введіть пару координат — 39.9042, 39°54′15″N і 39°32.5′E працюють; розділіть половини комою.',
          'Виберіть кількість знаків після коми для результату.',
          'Натисніть «Конвертувати» — буде показано всі три формати; «Копіювати» збереже один.',
        ],
        inputLabel: 'Координати (одна пара, через кому)',
        inputPlaceholder: 'напр. 39°54′15″N, 116°24′51″E або 39.9042, 116.4074',
        precisionLabel: 'Знаків після коми',
        submit: 'Конвертувати',
        ddLabel: 'Десяткові градуси (DD)',
        dmLabel: 'Градуси-хвилини (DM)',
        dmsLabel: 'Градуси-хвилини-секунди (DMS)',
        copy: 'Копіювати',
        copied: 'Скопійовано',
        error: 'Не вдалося розібрати координати. Підтримуються формати 39.9042, 39°54′15″N і 39°32.5′E, розділені комою.',
      },
      distanceCalculator: {
        title: 'Калькулятор відстані',
        en: 'Калькулятор відстані',
        description:
          'Відстань по прямій між двома точками на Землі та початковий азимут.',
        note: 'Відстань обчислюється за формулою гаверсинуса для великого кола (середній радіус Землі 6 371,0088 км) — найкоротшим шляхом по поверхні. Початковий азимут — компасний напрямок від першої точки до другої, 0° на півночі, зростає за годинниковою стрілкою.',
        steps: [
          'Введіть широту й довготу початкової та кінцевої точок.',
          'Натисніть «Обчислити відстань».',
          'Отримайте результат у кілометрах, милях і морських милях та початковий азимут.',
        ],
        fromLabel: 'З',
        toLabel: 'До',
        inputPlaceholder: 'широта, довгота',
        example: 'Приклад: Пекін → Шанхай',
        submit: 'Обчислити відстань',
        km: 'км',
        mi: 'миль',
        nmi: 'мор. миль',
        bearing: 'Початковий азимут',
        copy: 'Копіювати',
        copied: 'Скопійовано',
        error: 'Не вдалося розібрати координати. Використовуйте формат «широта, довгота» з широтою -90–90 і довготою -180–180.',
      },
    },
  },
};
