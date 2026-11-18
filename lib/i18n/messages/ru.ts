import type { Messages } from './zh';
import { ruTransportModes } from '../ru-data';

/**
 * Russian catalog. Typed against the Chinese source of truth (`Messages`), so a
 * missing or renamed key fails the build.
 *
 * Style: polite, neutral address ("вы"), traveller-facing Russian without bare
 * commands where a neutral phrasing reads naturally; Russian typography
 * («кавычки», en dashes) and the established Russian names for countries and
 * cities. Airport names keep their international form.
 */

/** "1 номер рейса" / "2 номера рейсов" for already-formatted counts. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Russian noun form: 1 → one, 2–4 → few, 5+ / 11–14 → many. */
const ruForm = (n: number, one: string, few: string, many: string) => {
  const mod100 = Math.abs(n) % 100;
  const mod10 = Math.abs(n) % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'крупный аэропорт',
  medium: 'аэропорт среднего размера',
  small: 'малый аэропорт',
  heliport: 'вертолётная площадка',
} as const;

export const ru: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Карты аэропортов и терминалов',
    description:
      'Просматривайте карты терминалов аэропортов по странам и регионам. От крупных международных хабов до региональных аэропортов: подробные схемы терминалов, выходов на посадку, зон регистрации, выдачи багажа, магазинов, ресторанов, залов ожидания и наземного транспорта.',
    keywords: [
      'карты аэропортов',
      'карты терминалов',
      'план терминала аэропорта',
      'выходы на посадку',
      'транспорт до аэропорта',
      'путеводитель по аэропорту',
    ],
    numberOfItems: (n: number) =>
      `${n} ${n === 1 ? 'аэропорт' : 'аэропортов'}`,
  },

  nav: {
    home: 'Главная',
    airports: 'Все аэропорты',
    countries: 'По странам',
    tools: 'Онлайн-инструменты',
    about: 'О сайте',
    label: 'Основная навигация',
    languageLabel: 'Язык',
    switchLanguage: 'Сменить язык',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'В подготовке',
    languagePlannedHint: 'Эта языковая версия ещё не опубликована.',
    themeToggle: 'Переключить тёмную тему',
    menu: 'Меню',
  },

  common: {
    advertisement: 'Реклама',
    skipToContent: 'Перейти к основному содержанию',
    backToTop: 'Наверх',
    breadcrumbLabel: 'Навигационная цепочка',
    home: 'Главная',
    viewMap: 'Посмотреть карту',
    terminalMap: 'Карта терминала',
    /** Accessible iframe title on the ad slots (components/ads/). */
    /**
     * Airport page <title>/og:title. Airports with compiled data lead with the
     * counts Google is asked for ("how many terminals/gates does X have"); the
     * 303 directory airports without terminal data get an honest location-map
     * title instead of promising a terminal map the page cannot show.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} ${ruForm(
            counts.terminals,
            'терминал',
            'терминала',
            'терминалов'
          )}${
            counts.gates > 0
              ? `, ${counts.gates} ${ruForm(counts.gates, 'выход', 'выхода', 'выходов')}`
              : ''
          } — карта терминала`
        : `${name} (${iata}) — карта расположения и путеводитель по аэропорту ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — карта терминала` : name,
    airportGuide: 'Путеводитель по аэропорту',
    lastUpdated: 'Недавно обновлено',
    updatedOn: (date: string) => `Обновлено ${date}`,
    publishedOn: (date: string) => `Опубликовано ${date}`,
    readMore: 'Читать полный путеводитель',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Терминалы',
    gatesFact: 'Выходы на посадку',
    terminals: (n: number) => `${n} ${ruForm(n, 'терминал', 'терминала', 'терминалов')}`,
    terminalsShort: (n: number) => `${n} ${ruForm(n, 'терминал', 'терминала', 'терминалов')}`,
    gates: (n: number) => `${n} ${ruForm(n, 'выход', 'выхода', 'выходов')}`,
    airports: (n: number) => `${n} ${ruForm(n, 'аэропорт', 'аэропорта', 'аэропортов')}`,
    airportsChip: (n: number) => `${n} ${ruForm(n, 'аэропорт', 'аэропорта', 'аэропортов')}`,
    pax: 'Пассажиры',
    paxFull: 'Годовой пассажиропоток',
    distance: 'До центра города',
    distanceFrom: (city: string) => `От центра города: ${city}`,
    gatesLabel: (range: string) => `Выходы ${range}`,
    gatesCount: (n: number) => `${n} ${ruForm(n, 'выход', 'выхода', 'выходов')}`,
    satellite: 'Сателлитный терминал',
    airlinesLabel: 'Основные авиакомпании: ',
  },

  search: {
    ariaLabel: 'Поиск аэропортов',
    placeholder: 'Поиск по аэропорту, городу или коду IATA',
    heroPlaceholder:
      'Поиск по названию аэропорта, городу или коду IATA — например, LHR / Дубай / Хитроу',
    submit: 'Найти аэропорт',
    loading: 'Идёт поиск…',
    empty: 'Подходящие аэропорты не найдены',
    resultsTitle: (term: string) => `Результаты поиска по запросу «${term}»`,
    resultsCount: (n: number) =>
      `Найдено ${n} ${n === 1 ? 'подходящий аэропорт' : 'подходящих аэропортов'}.`,
    noResults:
      'Подходящих аэропортов нет. Попробуйте другое ключевое слово — например, название города или код IATA.',
    noResultsHint: 'Не удаётся найти нужный аэропорт?',
    viewAll: (n: number) => `Просмотреть все аэропорты: ${n}`,
    orBrowseByCountry: 'или выбрать страну',
    range: (from: number, to: number, total: number) =>
      `Показаны ${from}–${to} из ${total} аэропортов`,
  },

  hero: {
    eyebrow: 'Всемирный справочник аэропортов',
    titleLead: 'Исследуйте аэропорты и',
    titleAccent: 'карты терминалов',
    sub: 'Находите нужный путь в любом аэропорту с нашей полной коллекцией карт аэропортов и терминалов, упорядоченной по странам и регионам — от крупных международных хабов до региональных аэропортов.',
    stats: {
      countries: 'Страны / регионы',
      airports: 'Аэропортов в каталоге',
      terminals: 'Карты терминалов',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'О сайте',
      imageAlt:
        'Пассажирский самолёт у выхода на посадку в терминале с панорамным остеклением на рассвете',
      blocks: [
        {
          title: 'Подробные карты терминалов для любого аэропорта',
          body: 'Ориентироваться в аэропортах и терминалах по всему миру бывает непросто. Наши подробные карты показывают расположение терминалов, выходов на посадку, зон регистрации, выдачи багажа, магазинов, ресторанов, залов ожидания и транспортных узлов, чтобы вы могли спланировать маршрут ещё до поездки.',
        },
        {
          title: 'Интерактивные карты и планы терминалов аэропортов',
          body: 'Крупные международные аэропорты состоят из нескольких терминалов со сложной планировкой. Подробные карты помогают найти выход на посадку, нужные услуги, спланировать пересадку и без лишних кругов пройти досмотр, зоны вылета и прилёта.',
        },
        {
          title: 'Транспорт и способы добраться до аэропорта',
          body: 'Помимо планировки терминалов, наши путеводители рассказывают о транспорте, парковках и подъездных путях. Вы узнаете, как быстрее добраться до выхода на посадку, переехать между терминалами и воспользоваться наземным транспортом: поездами, автобусами, такси и прокатом автомобилей.',
        },
      ],
    },
    map: {
      kicker: 'Карта мира',
      title: 'Карта аэропортов',
      en: 'Карта аэропортов',
      sub: (airports: string, world: string) =>
        `Найдите на карте ${world} аэропортов регулярных рейсов по всему миру — для ${airports} из них здесь есть карты терминалов. Нажмите на точку, чтобы увидеть страну или регион и подробности.`,
      all: 'Все',
      gEurope: 'Европа',
      gAsia: 'Азия',
      gAmericas: 'Америка',
      gAfrica: 'Африка',
      gOceania: 'Океания',
      legendSite: 'Есть на сайте · нажмите, чтобы открыть карты терминалов',
      legendWorld: 'Другие аэропорты регулярных рейсов в мире',
      countTemplate: '{n} аэропортов на карте',
      download: 'Скачать данные',
      downloadTitle:
        'Экспортировать все аэропорты текущей выборки в CSV (IATA, название, город, страна, координаты)',
      openAirport: 'Открыть аэропорт',
    },
    popular: {
      kicker: 'Карты терминалов',
      title: 'Популярные карты аэропортов',
      en: 'Карты аэропортов',
      sub: 'Подборка обложек карт терминалов крупнейших аэропортов мира — откройте страницу аэропорта, чтобы увидеть полную карту.',
    },
    recent: {
      kicker: 'Только что опубликовано',
      title: 'Недавно обновлено',
      en: 'Недавние обновления',
      sub: 'Новые и обновлённые аэропорты, страны и путеводители.',
      countriesTitle: 'Недавно обновлённые страны',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Маршруты',
      title: 'Самые загруженные карты маршрутов',
      en: 'Карты маршрутов',
      sub: 'Аэропорты, упорядоченные по числу направлений с беспосадочными рейсами — откройте карту маршрутов, список авиакомпаний и направлений.',
      collection: 'Коллекция маршрутов',
      tabsLabel: 'Карты маршрутов по городам',
      explore: (city: string) => `Подробнее: ${city}`,
      play: 'Запустить слайд-шоу',
      pause: 'Приостановить слайд-шоу',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'Последние фотографии',
      title: 'Последние фотографии аэропортов',
      en: 'Последние фото',
      sub: 'Самые свежие фотографии аэропортов — шесть новых аэропортов, по одному снимку каждого.',
      ariaLabel: 'Карусель последних фотографий аэропортов',
      prev: 'Предыдущее фото',
      next: 'Следующее фото',
      play: 'Запустить слайд-шоу',
      pause: 'Приостановить слайд-шоу',
      counter: (index: number, total: number) => `Фото ${index} из ${total}`,
      view: (name: string) => `Открыть карту: ${name}`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'Открыть страницу аэропорта',
    },
    countries: {
      kicker: 'По странам',
      title: 'Карты аэропортов по странам',
      en: 'Страны',
      sub: 'Просматривайте карты терминалов аэропортов по странам и регионам — от крупных международных хабов до региональных аэропортов.',
      more: 'Все страны',
    },
    all: {
      kicker: 'Все карты',
      title: 'Все карты аэропортов',
      en: 'Все аэропорты',
      sub: 'Карты аэропортов для самых загруженных аэропортов и транспортных хабов мира.',
      hint: 'Выберите аэропорт, чтобы увидеть планировку его терминалов.',
      more: 'Показать все',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Данные каталога',
      title: 'Данные об аэропортах в цифрах',
      en: 'Списки и таблицы',
      sub: 'Цифры каталога в виде списков и таблиц: охват, самые загруженные аэропорты среди тех, по которым опубликован пассажиропоток, и распределение по регионам.',
      note: (pax: string, detailed: string, total: string) =>
        `Данные о пассажиропотоке есть по ${pax} из ${total} аэропортов; данные о терминалах и выходах — по ${detailed} из ${total}. Число терминалов соответствует группировке каталога и может включать отдельные корпуса.`,
      coverageTitle: 'Показатели охвата',
      coverage: {
        airports: 'Аэропорты',
        countries: 'Страны и регионы',
        regions: 'Регионы каталога',
        cities: 'Уникальные названия городов',
        terminals: 'Терминалы',
        gates: 'Выходы на посадку',
        routes: 'Аэропорты с картами маршрутов',
      },
      busiest: {
        title: 'Самые загруженные аэропорты по годовому пассажиропотоку',
        sub: '12 самых загруженных аэропортов среди тех, по которым опубликован годовой пассажиропоток.',
        caption: 'Аэропорты с опубликованным годовым пассажиропотоком, по убыванию',
        rank: 'Место',
        iata: 'IATA',
        airport: 'Аэропорт',
        city: 'Город',
        country: 'Страна',
        terminals: 'Терминалы',
        gates: 'Выходы на посадку',
        pax: 'Годовой пассажиропоток (млн)',
      },
      regions: {
        title: 'Аэропорты по регионам каталога',
        sub: 'Количество аэропортов, терминалов и выходов на посадку по регионам каталога; некоторые страны и территории относятся к двум регионам.',
        caption: 'Количество аэропортов по регионам каталога',
        region: 'Регион',
        airports: 'Аэропорты',
        detailed: 'С подробными данными',
        terminals: 'Терминалы',
        gates: 'Выходы на посадку',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Аэропорт',
    city: 'Город',
    country: 'Страна',
    size: 'Размер',
    map: 'Карта',
    empty: 'По этим фильтрам аэропортов не найдено. Попробуйте расширить выбор.',
  },

  pager: {
    label: 'Постраничная навигация',
    previous: 'Предыдущая страница',
    next: 'Следующая страница',
  },

  filters: {
    searchPlaceholder: 'Поиск по аэропорту, городу или коду IATA',
    submit: 'Найти',
    country: 'Страна',
    all: 'Все',
    sort: 'Сортировка',
    sortPax: 'Пассажиропоток',
    sortName: 'Название',
    sortIata: 'Код IATA',
    sortUpdated: 'Последнее обновление',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Все карты аэропортов: ${country}${sortLabel ? ` — сортировка по: ${sortLabel}` : ''}`
        : `Все карты аэропортов — сортировка по: ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Каталог карт аэропортов: ${country}. Все карты на одной странице: планировки терминалов, диапазоны выходов и наземный транспорт${sortLabel ? `, упорядочено по: ${sortLabel}` : ''}.`
        : `Полный каталог карт аэропортов на одной странице: планировки терминалов, диапазоны выходов и наземный транспорт${sortLabel ? `, упорядочено по: ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Аэропорты по странам',
    description:
      'Просматривайте всемирный каталог карт терминалов аэропортов по странам и регионам. От крупных международных хабов до региональных аэропортов: узнайте, сколько аэропортов и терминалов в каждой стране.',
    sub: (countries: string, airports: string, terminals: string) =>
      `От крупных международных хабов до региональных аэропортов — ${countries} стран и регионов, ${airports} аэропортов и ${terminals} терминалов в общей сложности.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ${countries === 1 ? 'страна' : 'стран'} · ${airports} ${
        airports === 1 ? 'аэропорт' : 'аэропортов'
      }`,
  },

  country: {
    title: (name: string, count?: number) =>
      count
        ? `Карта аэропортов: ${name} — ${count} аэропортов`
        : `Карты аэропортов: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''}: всего ${total} аэропортов с регулярными рейсами; для ${count} из них на сайте есть страница с картой распределения аэропортов, полным национальным списком и прямыми маршрутами.`
        : `Карты терминалов для ${count} ${
            count === 1 ? 'аэропорта' : 'аэропортов'
          } — ${name} (${nameEn}), регион ${region}. Основные международные хабы и региональные аэропорты, выходы на посадку, планировки терминалов и наземный транспорт.`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} · АЭРОПОРТЫ`,
    kicker: 'Карты аэропортов',
    titleOf: (name: string) => `Аэропорты: ${name}`,
    en: 'Аэропорты',
    sub: 'Выберите аэропорт, чтобы увидеть планировку терминалов, диапазоны выходов на посадку и варианты наземного транспорта.',
    empty: 'Для этой страны или региона аэропорты пока не добавлены.',
    moreKicker: 'Другие страны',
    moreTitle: 'Перейти к другим странам',
    moreEn: 'Больше стран',
    all: 'Все страны',
    notFound: 'Страна не найдена',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Обзор',
    introTitle: (name: string) => `Обзор аэропортов: ${name}`,
    introEn: 'Обзор аэропортов',
    introSub:
      'Масштаб аэропортов этой страны или региона, главные хабы и города, которые они обслуживают.',
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
      // `o.nameEn` is empty when it equals `o.name` (both are "Japan").
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} находится в регионе ${o.region}. На сайте представлены ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` и ${o.gates}` : ''}.` +
      (o.busiest
        ? ` Крупнейший по годовому пассажиропотоку — ${o.busiest} (${o.busiestIata}), ${o.busiestPax}.`
        : '') +
      ` Аэропорты обслуживают такие города, как ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'На каждой странице аэропорта есть карта расположения и коды аэропорта, а также сведения о терминалах, выходах и наземном транспорте, если они собраны.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Распределение',
      title: (name: string) => `Карта распределения аэропортов: ${name}`,
      en: 'Распределение аэропортов',
      sub: (covered: string, total: string) =>
        `Аэропортов регулярных рейсов по всей стране: ${total} (крупные, средние и малые); для ${covered} из них на сайте есть страница с путеводителем. Полный список ниже.`,
      mapAlt: (name: string, total: string) =>
        `Карта распределения аэропортов: ${name} — ${total} аэропортов регулярных рейсов`,
      siteTag: 'Есть на сайте',
      colAirport: 'Аэропорт',
      colCity: 'Город',
      colType: 'Тип',
      types: {
        large: 'Крупный',
        medium: 'Средний',
        small: 'Малый',
      },
      empty: 'Национальный список аэропортов пока недоступен.',
    },

    /** Related links */
    linksTitle: 'Полезные ссылки',
    linksEn: 'Полезные ссылки',
    linksSub:
      'Официальные сайты и энциклопедические статьи о стране или регионе и каждом его аэропорте.',
    linksCountry: (name: string) => `Справочник: ${name}`,
    linksAirports: (name: string) => `Аэропорты: ${name}`,

    faqKicker: 'Частые вопросы',
    faqTitle: 'Часто задаваемые вопросы',
    faqEn: 'Вопросы',
    faq: {
      airportTotal: (name: string) => `Сколько аэропортов насчитывает ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}: всего аэропортов с регулярными пассажирскими рейсами — ${total} (крупные, средние и малые); на сайте подробно представлены ${covered}. Смотрите карту распределения и полный список выше.`,
      airportCount: (name: string) => `Какие аэропорты представлены здесь: ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `На сайте представлены ${count} — ${name}: ${list}.`,
      busiest: (name: string) => `Какой аэропорт самый загруженный: ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `По годовому пассажиропотоку крупнейший среди представленных здесь аэропортов — ${busiest} (${iata}), ${pax}.`,
      terminals: (name: string) => `Сколько терминалов у аэропортов: ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `В аэропортах, представленных здесь (${name}), ${terminals} и ${gates} в общей сложности: ${list}.`,
      cities: (name: string) => `Какие города обслуживают аэропорты: ${name}?`,
      citiesAnswer: (name: string, cities: string) =>
        `Аэропорты, представленные здесь (${name}), обслуживают такие города, как ${cities}. В каталоге аэропортов их можно отфильтровать по городу или коду IATA.`,
      maps: (name: string) => `Есть ли карты терминалов у аэропортов: ${name}?`,
      mapsAnswer: (name: string, count: string) =>
        `У некоторых. На страницах аэропортов есть карта расположения, коды и прямые маршруты; для аэропортов, представленных здесь (${name}; всего ${count}), показаны схема терминалов, диапазоны выходов и наземный транспорт, если эти данные собраны. Откройте любой аэропорт, чтобы узнать, что доступно.`,
    },
  },

  airport: {
    /**
     * Meta description assembled from formatted airport facts. Terminals and
     * gates are null for directory airports with no compiled counts, and the
     * clause drops out instead of reading "0 terminals". The count question
     * Google receives ("how many gates does X have") is answered in the first
     * clause, because that is the text a snippet shows.
     */
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
        ? `${o.name} (${o.iata}): ${o.terminals} ${
            o.terminals === '1' ? 'терминал' : 'терминалов'
          }${o.gates ? `, ${o.gates} ${o.gates === '1' ? 'выход' : 'выходов'}` : ''}${
            o.pax ? `, годовой пассажиропоток — ${o.pax}` : ''
          }${
            o.distance ? `, ${o.distance} от центра города` : ''
          }. Карта терминала со всеми терминалами, диапазонами выходов и наземным транспортом.`
        : `${o.name} (${o.iata}) обслуживает ${o.city}, ${o.country}. Карта расположения, коды аэропорта и информация для путешественников.`,
    /**
     * Lead answer sentence under the H1: the full-sentence answer to "what is
     * this airport / where is it" plus the terminal and gate counts the FAQ
     * otherwise hides inside a collapsed accordion. kind/icao come from
     * lib/airport-facts.json; city and country collapse into one when equal
     * (Singapore) so the sentence never reads "serving Singapore, Singapore".
     */
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'аэропорт';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) — ${kind} в городе ${where}`;
      return o.terminals > 0
        ? `${head}: ${o.terminals} ${
            o.terminals === 1 ? 'терминал' : 'терминалов'
          }${o.gates > 0 ? ` и ${o.gates} ${o.gates === 1 ? 'выход' : 'выходов'}` : ''}${
            o.distance ? `, примерно ${o.distance} от центра города ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Планировка терминалов`,
    mapNote: 'ПЛАНИРОВКА ТЕРМИНАЛОВ',
    realMapTitle: (iata: string) =>
      `${iata}: карта терминалов аэропорта — выходы и навигация`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Карта терминалов: ${name} (${iata}) — все терминалы, диапазоны выходов и корпуса`,
    realMapNote: 'КАРТА ТЕРМИНАЛОВ',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Фотографии',
    photosTitle: 'Фотографии аэропорта',
    photosEn: 'Фото аэропорта',
    photosSub:
      'Реальные фотографии этого аэропорта; у каждой указан источник — общедоступная веб-страница. Авторские права принадлежат фотографам. Нажмите на фото, чтобы увеличить, или на подпись, чтобы открыть источник.',
    photosCredit: (host: string) => `Источник: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata}), фотография аэропорта ${index}`,
    photosZoom: (name: string, index: number) =>
      `Увеличить фотографию ${index}: ${name}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Масштаб',
    zoomClose: 'Закрыть',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    downloadKicker: 'Скачать',
    downloadTitle: 'Скачать карты аэропорта',
    downloadEn: 'Загрузки',
    downloadMapLabel: (year: number, iata: string) =>
      `${year}: последняя карта терминалов аэропорта ${iata} и план этажей`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}: последняя карта терминалов аэропорта ${iata} в PDF`,
    timeKicker: 'Время',
    timeTitle: (iata: string) => `${iata}: текущее время в аэропорту`,
    timeEn: 'Время в аэропорту',
    timeSub: (iata: string, tz: string) =>
      `Текущее время в ${iata} (${tz}) в сравнении с вашим местным временем.`,
    clockAirport: 'Текущее время в аэропорту',
    clockLocal: 'Ваше местное время',
    infoKicker: 'Информация',
    infoTitle: 'Информация об аэропорте',
    infoEn: 'Сведения об аэропорте',
    infoIata: 'Код IATA',
    infoLocation: 'Расположение аэропорта',
    infoCoords: 'Координаты',
    infoTimezone: 'Часовой пояс',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Ссылки',
    linksTitle: 'Полезные ссылки',
    linksEn: 'ПОЛЕЗНЫЕ ССЫЛКИ',
    linksSub:
      'Внешние источники об этом аэропорте: официальный сайт, Википедия и Байду Байкэ.',
    officialSite: 'Официальный сайт',
    wikiLabel: 'Википедия',
    baikeLabel: 'Байду Байкэ',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Источники: ',
    sourcesWikipedia: 'Википедия',
    sourcesOurAirports: 'Открытые данные OurAirports',
    sourcesNote:
      'Коды аэропортов, координаты и класс аэропорта собраны из открытых данных; сведения на странице соответствуют официальным публикациям аэропорта.',
    mapEmbedKicker: 'Карта',
    mapEmbedTitle: (name: string) => `Интерактивная карта: ${name}`,
    mapEmbedEn: 'Интерактивная карта',
    extMapsNote: 'Посмотреть этот аэропорт на других картографических сервисах:',
    routeMapKicker: 'Маршруты',
    routeMapTitle: (name: string) => `${name}: карта маршрутов — прямые направления`,
    routeMapEn: 'Карта маршрутов',
    routeMapAria: (name: string) => `Карта прямых маршрутов: ${name}`,
    routeLegendTitle: 'Легенда',
    routeLegendClose: 'Скрыть легенду',
    routeReset: 'Сбросить карту',
    routeZoomIn: 'Увеличить',
    routeZoomOut: 'Уменьшить',
    routeFullscreen: 'Открыть во весь экран',
    routeExitFullscreen: 'Выйти из полноэкранного режима',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Открыть страницу аэропорта {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6 и более авиакомпаний',
      major: '3–5 авиакомпаний',
      minor: '2 авиакомпании',
      single: '1 авиакомпания',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} авиакомпаний',
    routeTableDest: 'Направление',
    routeTableCountry: 'Страна/регион',
    routeTableDistance: 'Расстояние',
    routeTableCarriers: 'Авиакомпании',
    routeCarriersMore: (n: number) => ` + ещё ${n}`,
    routeMapNote: (date: string) =>
      `Данные о маршрутах: ${date}; только беспосадочные рейсы. Источник: `,
    legendTerminal: 'Здание терминала',
    legendTransit: 'Узел наземного транспорта',
    legendCorridor: 'Переход между терминалами',
    terminalsKicker: 'Терминалы',
    terminalsTitle: 'Путеводитель по терминалам',
    terminalsEn: 'Терминалы',
    terminalsSub: (name: string) =>
      `Аэропорт ${name}: диапазоны выходов, основные авиакомпании и услуги каждого терминала.`,
    transitTitle: 'Наземный транспорт',
    facilitiesTitle: 'Услуги в аэропорту',
    faqKicker: 'Частые вопросы',
    faqTitle: 'Часто задаваемые вопросы',
    faqEn: 'Вопросы',
    guideKicker: 'Путеводитель',
    guideTitle: 'Путеводитель по аэропорту',
    guideEn: 'Путеводитель по аэропорту',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'Статьи',
    blogTitle: (iata: string) => `Путеводители по аэропорту ${iata}`,
    blogEn: 'Из блога',
    blogSub: (iata: string, count: number) =>
      `Публикаций о ${iata} на сайте: ${count}. Темы: прилёт, наземный транспорт, багаж и пересадки.`,
    blogAll: 'Все статьи',
    relatedTitle: (country: string) => `Другие аэропорты: ${country}`,
    relatedEn: (country: string) => `Больше аэропортов: ${country}`,
    relatedAll: (country: string) => `Все аэропорты: ${country}`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'Рейсы',
      title: (name: string) => `${name}: рейсы — вылеты и прилёты`,
      en: 'Табло рейсов',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'номер рейса', 'номеров рейсов')} у ${plural(
          airlines,
          'авиакомпании',
          'авиакомпаний'
        )} по ${plural(destinations, 'направлению', 'направлениям')}, с разбивкой по направлению. Номера код-шеринга также включены.`,
      statDepartures: 'Номера рейсов на вылет',
      statArrivals: 'Номера рейсов на прилёт',
      statAirlines: 'Авиакомпании',
      statDestinations: 'Направления',
      note: (date: string) =>
        `Номера рейсов и маршруты из индекса рейсов aviability.com (снимок ${date}); номера код-шеринга включены, время вылета не указано. Источник: `,
      source: 'aviability.com',
      tabDepartures: 'Вылеты',
      tabArrivals: 'Прилёты',
      search: 'Поиск по номеру рейса, авиакомпании или городу',
      clearSearch: 'Очистить поиск',
      flight: 'Рейс',
      airline: 'Авиакомпания',
      destination: 'Направление',
      origin: 'Пункт вылета',
      country: 'Страна/регион',
      empty: 'По этому запросу рейсы не найдены.',
      loading: 'Загрузка рейсов…',
      error: 'Не удалось загрузить другие рейсы.',
      retry: 'Повторить',
      previous: 'Назад',
      next: 'Вперёд',
      pagination: 'Постраничная навигация',
      showing: 'Показаны {from}–{to} из {total} номеров рейсов',
      pageOf: 'Страница {page} из {pages}',
    },
    notFound: 'Аэропорт не найден',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${name} (${iata}): карта маршрутов ${year} — ${count} прямых направлений`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Карта прямых маршрутов: ${name} (${iata}) — ${count} направлений с авиакомпаниями и расстояниями, а также полный список направлений.`,
    heading: (name: string) => `Карта маршрутов: ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata}: ${count} прямых направлений; цвет показывает, сколько авиакомпаний обслуживают каждое.`,
    backToAirport: (iata: string) => `Вернуться на страницу аэропорта ${iata}`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `Номера рейсов ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Посмотреть карту маршрутов',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Открыть полную карту маршрутов ${iata}`,
    teaserSub: (count: string) =>
      `${count} прямых направлений: карта, авиакомпании и расстояния.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `Карта прямых маршрутов: ${name}`,
    tableKicker: (iata: string) => `${iata} · Направления`,
    tableSectionTitle: (name: string) => `Список прямых направлений: ${name}`,
    tableSectionEn: (iata: string) => `Направления ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Направления',
    tableSectionSub: (count: string) =>
      `${count} направлений, сначала самые загруженные по числу авиакомпаний, с расстоянием и перевозчиками.`,
    dataKicker: 'Скачать',
    dataTitle: 'Скачать данные о маршрутах',
    dataEn: 'Данные',
    dataSub: (count: number) =>
      `Прямых маршрутов: ${count}. В выгрузке — направление, код IATA, город, страна, расстояние и авиакомпании; данные готовы для таблицы или скрипта.`,
    dataFields: 'CSV подходит для Excel / Numbers, JSON — для кода; оба формата в UTF-8.',
    dataCsv: 'Скачать CSV',
    dataJson: 'Скачать JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Планировка терминалов и выходов на посадку с первого взгляда — нажмите на изображение, чтобы открыть полную карту, услуги терминалов и наземный транспорт на странице аэропорта.',
    airportMapCta: (iata: string) => `Открыть полную карту терминалов ${iata}`,
    /** Header fact cells. */
    factDestinations: 'Прямые направления',
    factAirlines: 'Авиакомпании',
    factCountries: 'Страны',
    factSnapshot: 'Снимок данных',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `Сколько беспосадочных направлений у аэропорта ${name}?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}): ${count} прямых направлений; стран и территорий — ${countries}. Учитываются только беспосадочные рейсы; маршруты с пересадкой не включены.`,
    faqAirlinesQ: (name: string) => `Сколько авиакомпаний выполняют рейсы из аэропорта ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `Авиакомпаний, выполняющих прямые рейсы из этого аэропорта: ${count}. Самые широкие сети — ${leaders} (число направлений в скобках).`,
    faqFarthestQ: (name: string) => `Какое самое дальнее беспосадочное направление из аэропорта ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Самое дальнее прямое направление — ${city}, ${country} ${iata}, около ${km} км.`,
    faqBusiestQ: () => 'На каких направлениях больше всего конкуренции?',
    faqBusiestA: (count: string, list: string) =>
      `Направлений, обслуживаемых тремя и более авиакомпаниями: ${count}; самые загруженные — ${list}.`,
    faqSourceQ: () => 'Как часто обновляются данные о маршрутах?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Маршруты на этой странице взяты из открытого набора данных ${source} (${license}); это снимок от ${date}, а не актуальное расписание — билеты и время уточняйте у авиакомпании или аэропорта.`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Рейс ${number} (${airline}): ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейса авиакомпании ${airline} по маршруту ${from} → ${to}${distance ? `, около ${distance}` : ''}. Карта маршрута, аэропорты вылета и прилёта, расстояние и другие рейсы на этом маршруте.`,
    heading: (number: string) => `Рейс ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейса, который выполняет авиакомпания ${airline} по маршруту ${from} → ${to}${distance ? `, расстояние по прямой около ${distance}` : ''}.`,
    factFlight: 'Номер рейса',
    factFrom: 'Откуда',
    factTo: 'Куда',
    factDistance: 'Расстояние',
    overviewKicker: 'Обзор',
    overviewTitle: (number: string) => `О рейсе ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} — номер рейса авиакомпании ${airline} по маршруту ${originName} (${originIata}) → ${destName} (${destIata})${distance ? `, расстояние около ${distance}` : ''}. На этой странице собраны номер рейса, авиакомпания, маршрут и два аэропорта для быстрого поиска.`,
    overviewNote:
      'В индексе рейсов нет времени вылета и прилёта, типа воздушного судна и дат выполнения; расписание, регистрацию и время посадки уточняйте у авиакомпании или в аэропорту.',
    routeKicker: 'Маршрут',
    routeTitle: (from: string, to: string) => `${from} → ${to}: маршрут`,
    routeDiagramAria: (number: string) => `Схема маршрута рейса ${number}`,
    routeMapAria: (number: string) => `Карта маршрута рейса ${number}`,
    airportsKicker: 'Аэропорты',
    airportsTitle: 'Аэропорты вылета и прилёта',
    airportsSub:
      'Аэропорты, которые соединяет этот рейс. Для аэропортов, представленных в каталоге, открывается отдельная страница.',
    originAirport: 'Аэропорт вылета',
    destinationAirport: 'Аэропорт прилёта',
    airportPage: 'Открыть страницу аэропорта',
    detailsKicker: 'Подробности',
    detailsTitle: 'Сведения о рейсе',
    detailsFlight: 'Номер рейса',
    detailsAirline: 'Авиакомпания',
    detailsOrigin: 'Аэропорт вылета',
    detailsDestination: 'Аэропорт прилёта',
    detailsDistance: 'Расстояние по прямой',
    detailsRoutes: 'Маршрутов в списке',
    detailsSnapshot: 'Снимок данных',
    routesKicker: 'Маршруты',
    routesTitle: 'Маршруты под этим номером рейса',
    routesSub: (count: string) =>
      `Под этим номером зарегистрировано маршрутов: ${count}. Один номер могут использовать партнёры по код-шерингу.`,
    routesRoute: 'Маршрут',
    routesAirline: 'Авиакомпания',
    routesDistance: 'Расстояние',
    relatedKicker: 'Похожие',
    relatedTitle: 'Другие рейсы на этом маршруте',
    relatedSub: 'Другие номера рейсов между теми же аэропортами вылета и прилёта.',
    relatedEn: 'Больше рейсов',
    faqKicker: 'Частые вопросы',
    faqTitle: 'Часто задаваемые вопросы',
    faqEn: 'Вопросы',
    faqWhat: (number: string) => `Что такое рейс ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Рейс ${number} — номер рейса авиакомпании ${airline} на маршруте ${from} → ${to}${distance ? `, расстояние около ${distance}` : ''}.`,
    faqRoute: (number: string) => `Куда летит рейс ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Рейс ${number} выполняется из ${originName} (${originIata}) в ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Где указано время вылета и прилёта рейса ${number}?`,
    faqTimesAnswer: (number: string) =>
      `На этой странице собраны номер рейса, авиакомпания, маршрут и аэропорты для ${number}. В индексе рейсов aviability.com нет времени вылета и прилёта — актуальное расписание уточняйте у авиакомпании или в аэропорту.`,
    note: (date: string) =>
      `Номер рейса, авиакомпания и маршрут из индекса рейсов aviability.com (снимок ${date}); время вылета и прилёта не включено. Источник: `,
    source: 'aviability.com',
    sourceFlight: 'Посмотреть на aviability.com',
    viewAirport: (iata: string) => `Открыть страницу аэропорта ${iata}`,
    notFound: 'Рейс не найден',
  },

  faq: {
    terminalCount: (name: string) => `Сколько терминалов у аэропорта ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}): ${terminals} и ${gates} в общей сложности: ${list}.`,
    gateCount: (name: string) => `Сколько выходов на посадку у аэропорта ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}): ${gates} в общей сложности: ${list}.`,
    whereIs: (iata: string) => `Где находится ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} — код IATA аэропорта ${name} (${nameEn}), расположенного в городе ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Как далеко аэропорт ${name} от центра города ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `Аэропорт ${name} находится примерно в ${distance} от центра города ${city}. До города можно добраться: ${transit}.`,
    access: (name: string, city: string) => `Как добраться из аэропорта ${name} в город ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Какие услуги есть в аэропорту ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `В аэропорту ${name} доступны ${facilities}. Распределение услуг по терминалам показано на схеме выше.`,
    location: (name: string) => `Где расположен аэропорт ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, код IATA ${iata}) расположен в городе ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Какие авиакомпании выполняют рейсы из каждого терминала аэропорта ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Основные авиакомпании по терминалам аэропорта ${name}: ${list}. Авиакомпании и выходы могут меняться, поэтому всегда сверяйтесь с посадочным талоном и указателями в аэропорту.`,
    timezone: (name: string) => `В каком часовом поясе находится аэропорт ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) находится в часовом поясе ${tz}. Сравните его со своим местным временем по часам аэропорта выше.`,
    flightsCount: (name: string) => `Сколько номеров рейсов указано для аэропорта ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `В индексе рейсов aviability.com для ${name} (${iata}) указано ${plural(
        departures,
        'номер рейса на вылет',
        'номеров рейсов на вылет'
      )} и ${plural(arrivals, 'номер рейса на прилёт', 'номеров рейсов на прилёт')}, охватывающих ${plural(
        airlines,
        'авиакомпанию',
        'авиакомпаний'
      )} и ${plural(destinations, 'направление', 'направлений')} (снимок ${date}). Номера код-шеринга включены, расписания могут меняться — уточняйте информацию у авиакомпании перед поездкой.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Редакция World Airport Maps',
    role: 'Составлено и проверено: ',
    sourcesNote: 'Составлено по открытым источникам и официальной информации аэропортов',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'На этой странице',
    map: 'Карта терминала',
    photos: 'Фотографии аэропорта',
    time: 'Время в аэропорту',
    details: 'Сведения об аэропорте',
    links: 'Полезные ссылки',
    location: 'Карта расположения',
    routes: 'Карта маршрутов',
    flights: 'Рейсы',
    guide: 'Путеводитель по аэропорту',
    blog: 'Связанные путеводители',
    terminals: 'Путеводитель по терминалам',
    transport: 'Наземный транспорт',
    facilities: 'Услуги',
    faq: 'Частые вопросы',
    flightOverview: 'Обзор рейса',
    flightRoute: 'Маршрут',
    flightAirports: 'Аэропорты',
    flightDetails: 'Сведения о рейсе',
    flightRoutes: 'Все маршруты',
    flightRelated: 'Похожие рейсы',
    intro: 'Обзор аэропорта',
    distribution: 'Распределение аэропортов',
    airports: 'Список аэропортов',
  },

  error: {
    title: 'Не удалось загрузить страницу',
    sub: 'При чтении данных об аэропорте произошла ошибка. Попробуйте ещё раз или вернитесь на главную страницу, чтобы продолжить просмотр.',
    retry: 'Повторить',
    backHome: 'На главную',
    notFoundTitle: '404 · Страница не найдена',
    notFoundSub:
      'Возможно, запрошенная страница была перемещена или удалена. Попробуйте найти аэропорт или воспользуйтесь ссылками ниже.',
  },

  footer: {
    sponsored: 'Реклама',
    mapsTitle: 'Подробные карты терминалов',
    mapsBody:
      'Ориентироваться в аэропортах и терминалах бывает непросто. Наши карты показывают подробную планировку терминалов, выходов на посадку, зон регистрации, выдачи багажа, магазинов, ресторанов, залов ожидания и транспортных узлов, чтобы поездка проходила спокойнее.',
    plansTitle: 'Интерактивные планы терминалов',
    plansBody:
      'Крупные международные аэропорты имеют несколько терминалов и сложную планировку. Наши подробные карты помогают найти выход на посадку, нужные услуги, спланировать пересадку и без лишних усилий пройти досмотр, зоны вылета и прилёта.',
    transitTitle: 'Транспорт и подъезд к аэропорту',
    transitBody:
      'Помимо планировки терминалов, мы рассказываем о транспорте, парковках и подъездных путях: как добраться до выхода на посадку, переехать между терминалами и воспользоваться наземным транспортом — поездами, автобусами, такси и прокатом автомобилей.',
    stats: (countries: string, airports: string, terminals: string) =>
      `Стран и регионов: ${countries} · аэропортов: ${airports} · терминалов: ${terminals} · иллюстрированные планировки терминалов`,
    fallback:
      'Иллюстрированные планировки терминалов и путеводители по наземному транспорту для аэропортов мира',
    linksLabel: 'Навигация в подвале',
    about: 'О сайте',
    contact: 'Контакты',
    sources: 'Источники данных',
    privacy: 'Политика конфиденциальности',
    disclaimer: 'Отказ от ответственности',
    terms: 'Условия использования',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: ruTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Разделы',
    title: 'Просмотр по разделам',
    en: 'Просмотр по разделам',
    sub: 'Выберите удобный способ начать: по стране, региону или городу — либо сразу перейдите к самым загруженным хабам, последним обновлениям и путеводителям по аэропортам.',
    allAirports: {
      title: 'Все аэропорты',
      body: 'Полный каталог, упорядоченный по пассажиропотоку, с фильтрами по стране и сортировкой.',
    },
    byCountry: {
      title: 'По странам',
      body: 'Сколько аэропортов, терминалов и выходов на посадку в каждой стране или регионе.',
    },
    byRegion: {
      title: 'По регионам',
      body: 'Страны, сгруппированные по регионам — Восточная Азия, Европа, Северная Америка и остальные, — для быстрого поиска.',
    },
    popularCities: {
      title: 'Популярные города',
      body: 'Самые загруженные аэропортные города по общему годовому пассажиропотоку и все аэропорты каждого из них.',
    },
    recentlyUpdated: {
      title: 'Недавно обновлено',
      body: 'Новые и обновлённые записи об аэропортах, сначала самые свежие.',
    },
    guides: {
      title: 'Путеводители по аэропортам',
      body: 'Подробные путеводители по пересадкам в терминалах, поездкам в город и практическим советам.',
    },
    routes: {
      title: 'Карты маршрутов',
      body: 'Беспосадочная сеть аэропорта, упорядоченная по числу направлений, с авиакомпаниями и расстояниями.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Путеводители',
    title: 'Путеводители по аэропортам',
    en: 'Путеводители по аэропортам',
    sub: 'Помимо схем терминалов, мы подготовили подробные путеводители по отдельным хабам: как читать нумерацию выходов, как перебраться между терминалами и как добраться до города.',
    more: 'Открыть страницу аэропорта',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the English
   * wording of the same UI.
   */
  blog: {
    kicker: 'Журнал',
    title: 'Заметки о путешествиях',
    nav: 'Блог',
    en: 'Заметки о путешествиях',
    sub: 'Подробные материалы от нашей редакции: прилёт и паспортный контроль, пересадки, услуги терминалов и где отдохнуть.',
    more: 'Читать',
    all: 'Все статьи',
    morePosts: 'Больше статей',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'Аэропорты',
    airportsTitle: 'Аэропорты в этой статье',
    airportsEn: 'Аэропорты в статье',
    airportsSub:
      'Откройте страницу аэропорта, чтобы увидеть карту терминала, наземный транспорт и ответы на частые вопросы.',
    back: 'Вернуться к списку статей',
    empty: 'Статей пока нет.',
    readingMinutes: (n: number) => `${n} мин чтения`,
    source: (name: string) => `Источник: ${name}`,
    tags: 'Теги',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'Комментарии',
    title: 'Комментарии читателей',
    en: 'Обсуждение',
    sub: 'Вопросы, отчёты о поездках и исправления приветствуются. Комментарии видны всем.',
    formTitle: 'Оставить комментарий',
    countOne: '1 комментарий',
    countMany: '{n} комментариев',
    empty: 'Комментариев пока нет — вы можете оставить первый.',
    loading: 'Загрузка комментариев…',
    loadError: 'Комментарии сейчас недоступны.',
    retry: 'Повторить',
    nameLabel: 'Имя',
    namePlaceholder: 'Как к вам обращаться?',
    bodyLabel: 'Комментарий',
    bodyPlaceholder: 'Поделитесь опытом, задайте вопрос или добавьте подробности…',
    submit: 'Отправить комментарий',
    submitting: 'Отправка…',
    success: 'Комментарий опубликован — спасибо, что поделились.',
    error: 'Не удалось опубликовать комментарий. Попробуйте позже.',
    rateLimited: 'Слишком быстро. Подождите несколько минут и попробуйте снова.',
    nameError: 'Укажите имя (от 2 до 40 символов).',
    bodyError: 'Напишите комментарий (от 5 до 2000 символов).',
    note: 'Комментарии видны всем и отражают мнение их авторов. Пожалуйста, соблюдайте вежливость и не публикуйте рекламу или личные данные.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Схема планировки терминалов: ${name}`,
    gates: 'Выходы на посадку',
    terminal: 'Терминал',
    corridor: 'Переход',
    transit: 'Наземный транспорт',
    footer: (iata: string) => `${iata} · Планировка терминалов`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Онлайн-инструменты',
    hub: {
      kicker: 'Инструменты',
      title: 'Карты и работа с координатами',
      en: 'Бесплатные инструменты',
      sub: 'Бесплатные онлайн-инструменты для путешественников и любителей географии — работают в браузере, ничего устанавливать не нужно.',
      description:
        'Бесплатные онлайн-инструменты для карт и координат: преобразование WGS84 / GCJ02 / BD09, перевод десятичных градусов ↔ DMS и расстояние по большому кругу между двумя точками. Двуязычный интерфейс, работает прямо в браузере.',
      comingTitle: 'Новые инструменты в разработке',
      comingSub: 'Выбор координат на карте, обмен местоположением и калькуляторы проекций уже в работе.',
    },
    howTitle: 'Как пользоваться',
    relatedTitle: 'Другие инструменты',
    allTools: 'Все инструменты',
    tools: {
      coordinateConverter: {
        title: 'Конвертер координат',
        en: 'Конвертер координат',
        description:
          'Преобразование между WGS84, GCJ02 и BD09 — решение проблемы смещения координат на картах Китая.',
        note: 'WGS84 — стандарт GPS и международных систем. GCJ02 — система со смещением, обязательная в материковом Китае (её называют «координатами Марса»); используется AMap и Tencent Maps. BD09 добавляет ещё одно смещение к GCJ02 и применяется в Baidu Maps. Одна и та же точка может отличаться на 100–700 м в разных системах, поэтому перед использованием координат в другом картографическом сервисе их следует преобразовать.',
        steps: [
          'Введите десятичные координаты в формате «широта, долгота» — например, 39.9042, 116.4074.',
          'Выберите систему координат введённых данных.',
          'Нажмите «Преобразовать», чтобы получить две другие системы; кнопка «Копировать» сохранит результат.',
        ],
        inputLabel: 'Координаты (широта, долгота)',
        inputPlaceholder: 'например, 39.9042, 116.4074',
        sourceLabel: 'Система координат введённых данных',
        wgs84: 'WGS84 · GPS / международная',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Знаков после запятой',
        submit: 'Преобразовать',
        copy: 'Копировать',
        copied: 'Скопировано',
        error:
          'Не удалось разобрать координаты. Используйте формат «широта, долгота», например, 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Конвертер форматов координат',
        en: 'Конвертер форматов координат',
        description:
          'Преобразование между десятичными градусами (DD), градусами и минутами (DM) и градусами, минутами и секундами (DMS); формат ввода определяется автоматически.',
        note: 'DD (39.9042°) — привычная десятичная запись для устройств и API; DMS (39°54′15″N) часто используется в мореплавании, авиации и геодезии; DM (39°54.25′N) типична для полевых записей. Инструмент определяет формат по числу групп чисел в каждой половине (1 = DD, 2 = DM, 3 = DMS) и выводит все три формата с указанием полушария N/S/E/W.',
        steps: [
          'Введите пару координат — подойдут форматы 39.9042, 39°54′15″N и 39°32.5′E; разделите половины запятой.',
          'Выберите число знаков после запятой для результата.',
          'Нажмите «Преобразовать» — будут показаны все три формата; кнопка «Копировать» сохранит нужный.',
        ],
        inputLabel: 'Координаты (одна пара, через запятую)',
        inputPlaceholder: 'например, 39°54′15″N, 116°24′51″E или 39.9042, 116.4074',
        precisionLabel: 'Знаков после запятой',
        submit: 'Преобразовать',
        ddLabel: 'Десятичные градусы (DD)',
        dmLabel: 'Градусы и минуты (DM)',
        dmsLabel: 'Градусы, минуты и секунды (DMS)',
        copy: 'Копировать',
        copied: 'Скопировано',
        error:
          'Не удалось разобрать координаты. Поддерживаются форматы 39.9042, 39°54′15″N и 39°32.5′E, разделённые запятой.',
      },
      distanceCalculator: {
        title: 'Калькулятор расстояний',
        en: 'Калькулятор расстояний',
        description:
          'Расстояние по большому кругу между двумя точками на Земле и начальный азимут.',
        note: 'Расстояние вычисляется по формуле гаверсинуса для большого круга (средний радиус Земли 6 371,0088 км) — это кратчайший путь по поверхности. Начальный азимут — направление по компасу от первой точки ко второй: 0° соответствует северу, далее по часовой стрелке.',
        steps: [
          'Введите широту и долготу начальной и конечной точек.',
          'Нажмите «Рассчитать расстояние».',
          'Получите результат в километрах, милях и морских милях, а также начальный азимут.',
        ],
        fromLabel: 'Откуда',
        toLabel: 'Куда',
        inputPlaceholder: 'широта, долгота',
        example: 'Пример: Пекин → Шанхай',
        submit: 'Рассчитать расстояние',
        km: 'км',
        mi: 'ми',
        nmi: 'мор. ми',
        bearing: 'Начальный азимут',
        copy: 'Копировать',
        copied: 'Скопировано',
        error:
          'Не удалось разобрать координаты. Используйте формат «широта, долгота»: широта от -90 до 90, долгота от -180 до 180.',
      },
    },
  },
};
