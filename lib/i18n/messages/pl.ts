import type { Messages } from './zh';
import { plTransportModes } from '../pl-data';

/** Klasa lotniska w zdaniu wprowadzającym (typ airport w schema.org). */
const AIRPORT_KIND = {
  large: 'duże lotnisko',
  medium: 'średnie lotnisko',
  small: 'małe lotnisko',
  heliport: 'lądowisko dla helikopterów',
} as const;

/**
 * Polska odmiana po liczebniku: 1 terminal, 2–4 terminale, 5+ terminali.
 * `value` jest już sformatowane (przecinek dziesiętny), więc parsujemy je
 * z powrotem; liczby niecałkowite dostają formę dopełniacza.
 */
const pluralPl = (value: string, one: string, few: string, many: string) => {
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
 * Katalog polski. Typowany względem chińskiego źródła (`Messages`), więc
 * brakujący lub zmieniony klucz zatrzymuje kompilację.
 */
export const pl: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Mapy lotnisk i terminali',
    description:
      'Przeglądaj mapy terminali lotnisk uporządkowane według krajów i regionów. Od dużych węzłów międzynarodowych po lotniska regionalne: zobacz szczegółowe układy bramek, stref odprawy, taśm bagażowych, sklepów, restauracji, salonów i transportu do miasta.',
    keywords: [
      'mapy lotnisk',
      'mapy terminali',
      'układ terminala lotniska',
      'bramki',
      'transport lotniskowy',
      'przewodnik po lotnisku',
    ],
    numberOfItems: (n: number) =>
      pluralPl(String(n), 'lotnisko', 'lotniska', 'lotnisk'),
  },

  nav: {
    home: 'Strona główna',
    airports: 'Wszystkie lotniska',
    countries: 'Według kraju',
    tools: 'Narzędzia online',
    about: 'O nas',
    label: 'Nawigacja główna',
    languageLabel: 'Język',
    switchLanguage: 'Zmień język',
    languagePlanned: 'W przygotowaniu',
    languagePlannedHint: 'Ta wersja językowa nie została jeszcze opublikowana.',
    themeToggle: 'Przełącz tryb ciemny',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Reklama',
    skipToContent: 'Przejdź do treści',
    backToTop: 'Powrót na górę',
    breadcrumbLabel: 'Ścieżka nawigacji',
    home: 'Strona główna',
    viewMap: 'Zobacz mapę',
    terminalMap: 'Mapa terminala',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralPl(String(counts.terminals), 'terminal', 'terminale', 'terminali')}${
            counts.gates > 0
              ? `, ${pluralPl(String(counts.gates), 'bramka', 'bramki', 'bramek')}`
              : ''
          } — mapa terminala`
        : `${name} (${iata}) — mapa lokalizacji i przewodnik ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — mapa terminala` : name,
    airportGuide: 'Przewodnik po lotnisku',
    lastUpdated: 'Ostatnio aktualizowane',
    updatedOn: (date: string) => `Zaktualizowano ${date}`,
    publishedOn: (date: string) => `Opublikowano ${date}`,
    readMore: 'Przeczytaj cały przewodnik',
  },

  units: {
    terminalsFact: 'Terminale',
    gatesFact: 'Bramki',
    terminals: (n: number) =>
      pluralPl(String(n), 'terminal', 'terminale', 'terminali'),
    terminalsShort: (n: number) =>
      pluralPl(String(n), 'terminal', 'terminale', 'terminali'),
    gates: (n: number) => pluralPl(String(n), 'bramka', 'bramki', 'bramek'),
    airports: (n: number) => pluralPl(String(n), 'lotnisko', 'lotniska', 'lotnisk'),
    airportsChip: (n: number) =>
      pluralPl(String(n), 'lotnisko', 'lotniska', 'lotnisk'),
    pax: 'Pasażerowie',
    paxFull: 'Pasażerowie rocznie',
    distance: 'Do centrum',
    distanceFrom: (city: string) => `Od centrum ${city}`,
    gatesLabel: (range: string) => `Bramki ${range}`,
    gatesCount: (n: number) => `${n} bramek`,
    satellite: 'Terminal satelitarny',
    airlinesLabel: 'Główne linie lotnicze: ',
  },

  search: {
    ariaLabel: 'Szukaj lotnisk',
    placeholder: 'Szukaj lotnisk, miast lub kodów IATA',
    heroPlaceholder: 'Szukaj po nazwie lotniska, mieście lub kodzie IATA — np. LHR / Dubaj / Heathrow',
    submit: 'Znajdź lotnisko',
    loading: 'Wyszukiwanie…',
    empty: 'Nie znaleziono pasujących lotnisk',
    resultsTitle: (term: string) => `Wyniki wyszukiwania dla „${term}”`,
    resultsCount: (n: number) =>
      `Znaleziono ${pluralPl(String(n), 'pasujące lotnisko', 'pasujące lotniska', 'pasujących lotnisk')}.`,
    noResults: 'Żadne lotnisko nie pasuje. Spróbuj innego słowa, np. nazwy miasta lub kodu IATA.',
    noResultsHint: 'Nie możesz znaleźć lotniska?',
    viewAll: (n: number) => `Przeglądaj wszystkie lotniska (${n})`,
    orBrowseByCountry: 'lub przeglądaj według kraju',
    range: (from: number, to: number, total: number) =>
      `Wyświetlono ${from}–${to} z ${total} lotnisk`,
  },

  hero: {
    eyebrow: 'Światowy katalog lotnisk',
    titleLead: 'Odkrywaj lotniska i',
    titleAccent: 'mapy terminali',
    sub: 'Znajdź drogę na każdym lotnisku dzięki kompletnej kolekcji map lotnisk i terminali, uporządkowanych według krajów i regionów — od dużych węzłów międzynarodowych po lotniska regionalne.',
    stats: {
      countries: 'Kraje / regiony',
      airports: 'Lotniska',
      terminals: 'Mapy terminali',
    },
  },

  home: {
    intro: {
      ariaLabel: 'O tej stronie',
      imageAlt: 'Samolot pasażerski przy bramce lotniska z przeszkloną elewacją o wschodzie słońca',
      blocks: [
        {
          title: 'Nawiguj po każdym lotnisku dzięki szczegółowym mapom terminali',
          body: 'Poruszanie się po lotniskach i terminalach na całym świecie bywa trudne. Nasze mapy pokazują szczegółowe układy terminali, bramek, stref odprawy, taśm bagażowych, sklepów, restauracji, salonów i węzłów transportowych, dzięki czemu trasę można zaplanować jeszcze przed podróżą.',
        },
        {
          title: 'Interaktywne mapy terminali i plany pięter',
          body: 'Duże lotniska międzynarodowe mają wiele terminali i złożone układy. Nasze mapy pomagają zlokalizować bramki, znaleźć udogodnienia, zaplanować przesiadki i sprawnie przejść przez kontrolę bezpieczeństwa, strefę odlotów i halę przylotów — bez zawracania.',
        },
        {
          title: 'Transport i dostęp do lotniska',
          body: 'Poza układami terminali nasze przewodniki opisują opcje transportu, parkingi i drogi dojazdu. Znajdź najlepszy sposób dotarcia do bramki, przesiadki między terminalami oraz transport naziemny: pociąg, autobus, taksówkę i wynajem samochodu.',
        },
      ],
    },
    map: {
      kicker: 'Mapa świata',
      title: 'Mapa lotnisk',
      en: 'Mapa lotnisk',
      sub: (airports: string, world: string) =>
        `Zlokalizuj ${world} lotnisk z regularnymi połączeniami na świecie — ${airports} z nich ma tu mapę terminala. Kliknij punkt, aby zobaczyć kraj lub region i szczegóły.`,
      all: 'Wszystkie',
      gEurope: 'Europa',
      gAsia: 'Azja',
      gAmericas: 'Ameryka',
      gAfrica: 'Afryka',
      gOceania: 'Oceania',
      legendSite: 'Ujęte tutaj · kliknij, aby zobaczyć mapy terminali',
      legendWorld: 'Pozostałe lotniska z regularnymi połączeniami',
      countTemplate: 'Wyświetlono {n} lotnisk',
      download: 'Pobierz dane',
      downloadTitle: 'Eksportuj wszystkie lotniska z bieżącego filtra do CSV (IATA, nazwa, miasto, kraj, współrzędne)',
      openAirport: 'Zobacz lotnisko',
    },
    popular: {
      kicker: 'Mapy terminali',
      title: 'Popularne mapy lotnisk',
      en: 'Mapy lotnisk',
      sub: 'Wybór okładek map terminali dużych lotnisk na świecie — otwórz stronę lotniska, aby zobaczyć pełną mapę.',
    },
    recent: {
      kicker: 'Świeżo opublikowane',
      title: 'Ostatnio aktualizowane',
      en: 'Ostatnio aktualizowane',
      sub: 'Nowe i zaktualizowane lotniska, kraje i przewodniki.',
      countriesTitle: 'Ostatnio aktualizowane kraje',
    },
    routes: {
      kicker: 'Trasy',
      title: 'Najbardziej ruchliwe mapy tras',
      en: 'Mapy tras',
      sub: 'Lotniska uszeregowane według liczby miejsc obsługiwanych bezpośrednio — otwórz jedno, aby zobaczyć mapę tras, linie i listę kierunków.',
      collection: 'Kolekcja tras',
      tabsLabel: 'Mapy tras według miast',
      explore: (city: string) => `Odkryj ${city}`,
      play: 'Rozpocznij pokaz slajdów',
      pause: 'Wstrzymaj pokaz slajdów',
    },
    photos: {
      kicker: 'Najnowsze zdjęcia',
      title: 'Najnowsze zdjęcia lotnisk',
      en: 'Najnowsze zdjęcia',
      sub: 'Ostatnio dodane zdjęcia lotnisk — sześć najnowszych lotnisk, po jednym zdjęciu.',
      ariaLabel: 'Karuzela najnowszych zdjęć lotnisk',
      prev: 'Poprzednie zdjęcie',
      next: 'Następne zdjęcie',
      play: 'Rozpocznij pokaz slajdów',
      pause: 'Wstrzymaj pokaz slajdów',
      counter: (index: number, total: number) => `Zdjęcie ${index} z ${total}`,
      view: (name: string) => `Zobacz mapę ${name}`,
      open: 'Otwórz stronę lotniska',
    },
    countries: {
      kicker: 'Według kraju',
      title: 'Mapy lotnisk według kraju',
      en: 'Kraje',
      sub: 'Przeglądaj mapy terminali uporządkowane według krajów i regionów, od dużych węzłów międzynarodowych po lotniska regionalne.',
      more: 'Wszystkie kraje',
    },
    all: {
      kicker: 'Wszystkie mapy',
      title: 'Wszystkie mapy lotnisk',
      en: 'Wszystkie lotniska',
      sub: 'Mapy najruchliwszych lotnisk i węzłów podróżnych świata.',
      hint: 'Wybierz lotnisko, aby zobaczyć układ terminala.',
      more: 'Zobacz wszystko',
    },
    facts: {
      kicker: 'Dane katalogu',
      title: 'Dane lotnisk w skrócie',
      en: 'Listy i tabele',
      sub: 'Liczby katalogu w formie list i tabel: pokrycie, najruchliwsze lotniska z opublikowanymi danymi o pasażerach i podział regionalny.',
      note: (pax: string, detailed: string, total: string) =>
        `Dane o pasażerach obejmują ${pax} z ${total} lotnisk; dane o terminalach i bramkach obejmują ${detailed} z ${total}. Liczba terminali wynika z własnego grupowania katalogu i może obejmować hale.`,
      coverageTitle: 'Liczby pokrycia',
      coverage: {
        airports: 'Lotniska',
        countries: 'Kraje i regiony',
        regions: 'Regiony katalogu',
        cities: 'Unikalne nazwy miast',
        terminals: 'Terminale',
        gates: 'Bramki',
        routes: 'Lotniska z mapą tras',
      },
      busiest: {
        title: 'Najruchliwsze lotniska według pasażerów rocznie',
        sub: 'Dwanaście najruchliwszych lotnisk z opublikowanymi rocznymi danymi o pasażerach.',
        caption: 'Lotniska z opublikowanymi rocznymi danymi o pasażerach, uszeregowane',
        rank: 'Miejsce',
        iata: 'IATA',
        airport: 'Lotnisko',
        city: 'Miasto',
        country: 'Kraj',
        terminals: 'Terminale',
        gates: 'Bramki',
        pax: 'Pasażerowie rocznie (mln)',
      },
      regions: {
        title: 'Lotniska według regionu katalogu',
        sub: 'Liczby lotnisk, terminali i bramek pogrupowane według regionów katalogu; niektóre kraje i terytoria należą do dwóch regionów.',
        caption: 'Liczba lotnisk według regionu katalogu',
        region: 'Region',
        airports: 'Lotniska',
        detailed: 'Ze szczegółowymi danymi',
        terminals: 'Terminale',
        gates: 'Bramki',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Lotnisko',
    city: 'Miasto',
    country: 'Kraj',
    size: 'Wielkość',
    map: 'Mapa',
    empty: 'Żadne lotnisko nie pasuje do filtrów. Spróbuj rozszerzyć wybór.',
  },

  pager: {
    label: 'Paginacja',
    previous: 'Poprzednia strona',
    next: 'Następna strona',
  },

  filters: {
    searchPlaceholder: 'Szukaj lotnisk, miast lub kodów IATA',
    submit: 'Szukaj',
    country: 'Kraj',
    all: 'Wszystkie',
    sort: 'Sortuj',
    sortPax: 'Pasażerowie',
    sortName: 'Nazwa',
    sortIata: 'Kod IATA',
    sortUpdated: 'Ostatnia aktualizacja',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Wszystkie mapy lotnisk: ${country}${sortLabel ? ` — sortowane według: ${sortLabel}` : ''}`
        : `Wszystkie mapy lotnisk — sortowane według: ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Wszystkie mapy lotnisk kraju ${country} na jednej stronie: układy terminali, strefy bramek i transport naziemny${sortLabel ? `, uporządkowane według: ${sortLabel}` : ''}.`
        : `Pełny katalog map lotnisk na jednej stronie: układy terminali, strefy bramek i transport naziemny${sortLabel ? `, uporządkowane według: ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Przeglądaj lotniska według kraju',
    description:
      'Przeglądaj światowy katalog map terminali według krajów i regionów. Od dużych węzłów międzynarodowych po lotniska regionalne: zobacz, ile lotnisk i terminali ma każdy kraj.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Od dużych węzłów międzynarodowych po lotniska regionalne — ${countries} krajów i regionów, ${airports} lotnisk i ${terminals} terminali łącznie.`,
    regionCount: (countries: number, airports: number) =>
      `${pluralPl(String(countries), 'kraj', 'kraje', 'krajów')} · ${pluralPl(String(airports), 'lotnisko', 'lotniska', 'lotnisk')}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} — mapa lotnisk, wszystkie ${count}` : `Mapy lotnisk: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} ma ${total} lotnisk z regularnymi połączeniami; ${count} z nich ma tu stronę przewodnika, z mapą rozmieszczenia, pełną listą krajową i połączeniami bezpośrednimi.`
        : `Mapy terminali dla ${count} lotnisk w ${name} (${nameEn}), obejmujące główne węzły międzynarodowe i lotniska regionalne regionu ${region}. Zobacz bramki, układy terminali i transport naziemny.`,
    chip: (nameEn: string) => `LOTNISKA: ${nameEn.toUpperCase()}`,
    kicker: 'Mapy lotnisk',
    titleOf: (name: string) => `Lotniska w ${name}`,
    en: 'Lotniska',
    sub: 'Wybierz lotnisko, aby zobaczyć układ terminala, strefy bramek i opcje transportu.',
    empty: 'Brak lotnisk dla tego kraju lub regionu.',
    moreKicker: 'Inne kraje',
    moreTitle: 'Przeglądaj inne kraje',
    moreEn: 'Więcej krajów',
    all: 'Wszystkie kraje',
    notFound: 'Nie znaleziono kraju',
    introKicker: 'Przegląd',
    introTitle: (name: string) => `Przegląd lotnisk: ${name}`,
    introEn: 'Przegląd lotnisk',
    introSub:
      'Skala lotnisk w tym kraju lub regionie, główne węzły i obsługiwane miasta.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} leży w regionie ${o.region}. Ta strona obejmuje ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` i ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) jest największym pod względem rocznej liczby pasażerów — ${o.busiestPax}.`
        : '') +
      ` Lotniska obsługują m.in. ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Każda strona lotniska zawiera mapę lokalizacji i kody lotniska oraz wszystkie zebrane dla niego dane o terminalach, bramkach i transporcie.',
    distribution: {
      kicker: 'Rozmieszczenie',
      title: (name: string) => `Mapa rozmieszczenia lotnisk: ${name}`,
      en: 'Rozmieszczenie lotnisk',
      sub: (covered: string, total: string) =>
        `${total} lotnisk z regularnymi połączeniami w całym kraju (duże, średnie i małe); ${covered} z nich ma tu stronę przewodnika. Pełna lista poniżej.`,
      mapAlt: (name: string, total: string) =>
        `Mapa rozmieszczenia lotnisk: ${name}, ${total} lotnisk z regularnymi połączeniami`,
      siteTag: 'Ujęte tutaj',
      colAirport: 'Lotnisko',
      colCity: 'Miasto',
      colType: 'Typ',
      types: {
        large: 'Duże',
        medium: 'Średnie',
        small: 'Małe',
      },
      empty: 'Brak krajowej listy lotnisk.',
    },
    linksTitle: 'Powiązane linki',
    linksEn: 'Powiązane linki',
    linksSub: 'Oficjalne strony i encyklopedie dla kraju i każdego z jego lotnisk.',
    linksCountry: (name: string) => `Źródła o ${name}`,
    linksAirports: (name: string) => `Lotniska w ${name}`,
    faqKicker: 'FAQ',
    faqTitle: 'Najczęściej zadawane pytania',
    faqEn: 'Pytania',
    faq: {
      airportTotal: (name: string) => `Ile lotnisk jest w ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} ma ${total} lotnisk z regularnym ruchem pasażerskim (dużych, średnich i małych); ta strona szczegółowo opisuje ${covered} z nich. Zobacz mapę rozmieszczenia i pełną listę powyżej.`,
      airportCount: (name: string) => `Które lotniska są ujęte w ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Ta strona obejmuje ${count} w ${name}: ${list}.`,
      busiest: (name: string) => `Które lotnisko w ${name} jest najruchliwsze?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Pod względem rocznej liczby pasażerów ${busiest} (${iata}) jest największym z ujętych tu lotnisk — ${pax}.`,
      terminals: (name: string) => `Ile terminali mają lotniska w ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Lotniska ujęte w ${name} mają ${terminals} z łącznie ${gates}: ${list}.`,
      cities: (name: string) => `Które miasta w ${name} mają lotnisko?`,
      citiesAnswer: (name: string, cities: string) =>
        `Ujęte tu lotniska ${name} obsługują m.in. ${cities}. Możesz filtrować je według miasta lub kodu IATA w katalogu lotnisk.`,
      maps: (name: string) => `Czy lotniska w ${name} mają mapy terminali?`,
      mapsAnswer: (name: string, count: string) =>
        `Część z nich. Strony lotnisk zawierają mapę lokalizacji, kody lotniska i połączenia bezpośrednie, a ${count} ujętych w ${name} pokazuje układ terminala, strefy bramek i transport naziemny tam, gdzie dane zostały zebrane. Otwórz lotnisko, aby zobaczyć, co jest dostępne.`,
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
        ? `${o.name} (${o.iata}) ma ${pluralPl(o.terminals, 'terminal', 'terminale', 'terminali')}${
            o.gates ? ` z ${pluralPl(o.gates, 'bramką', 'bramkami', 'bramkami')}` : ''
          }${o.pax ? `, obsługując ${o.pax} pasażerów rocznie` : ''}${
            o.distance ? `, ${o.distance} od centrum miasta` : ''
          }. Mapa terminala ze wszystkimi terminalami, strefami bramek i transportem naziemnym.`
        : `${o.name} (${o.iata}) obsługuje ${o.city}, ${o.country}. Mapa lokalizacji, kody lotniska i informacje podróżne.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'lotnisko';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) to ${kind} obsługujące ${where}`;
      return o.terminals > 0
        ? `${head}, z ${pluralPl(String(o.terminals), 'terminalem', 'terminalami', 'terminalami')}${
            o.gates > 0 ? ` i ${pluralPl(String(o.gates), 'bramką', 'bramkami', 'bramkami')}` : ''
          }${o.distance ? `, około ${o.distance} od centrum ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Układ terminala`,
    mapNote: 'UKŁAD TERMINALA',
    realMapTitle: (iata: string) => `${iata} — mapa terminala, bramki i nawigacja`,
    mapAlt: (name: string, iata: string) =>
      `Mapa terminala ${name} (${iata}) ze wszystkimi terminalami, strefami bramek i halami`,
    realMapNote: 'MAPA TERMINALA',
    photosKicker: 'Zdjęcia',
    photosTitle: 'Zdjęcia lotniska',
    photosEn: 'Zdjęcia lotniska',
    photosSub:
      'Prawdziwe zdjęcia tego lotniska, każde z podaniem publicznej strony internetowej, na której je znaleziono; prawa autorskie należą do fotografów. Kliknij zdjęcie, aby powiększyć, lub podpis źródła, aby otworzyć stronę źródłową.',
    photosCredit: (host: string) => `Źródło: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Zdjęcie lotniska ${index}: ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Powiększ zdjęcie ${index} lotniska ${name}`,
    zoomLabel: 'Powiększ',
    zoomClose: 'Zamknij',
    zoomIn: 'Powiększ',
    zoomOut: 'Pomniejsz',
    downloadKicker: 'Pobierz',
    downloadTitle: 'Pobierz mapy lotnisk',
    downloadEn: 'Pliki do pobrania',
    downloadMapLabel: (year: number, iata: string) =>
      `Najnowsza mapa terminala i plan pięter ${iata} ${year} do pobrania`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Najnowsza mapa terminala ${iata} ${year} w PDF`,
    timeKicker: 'Czas',
    timeTitle: (iata: string) => `Informacje o czasie — aktualna godzina w ${iata}`,
    timeEn: 'Czas na lotnisku',
    timeSub: (iata: string, tz: string) => `Aktualna godzina w ${iata} (${tz}) w porównaniu z czasem lokalnym.`,
    clockAirport: 'Aktualna godzina na lotnisku',
    clockLocal: 'Twój czas lokalny',
    infoKicker: 'Info',
    infoTitle: 'Informacje i dane lotniska',
    infoEn: 'Dane lotniska',
    infoIata: 'Kod IATA lotniska',
    infoLocation: 'Lokalizacja lotniska',
    infoCoords: 'Współrzędne',
    infoTimezone: 'Strefa czasowa',
    linksKicker: 'Linki',
    linksTitle: 'Powiązane linki',
    linksEn: 'POWIĄZANE LINKI',
    linksSub: 'Zewnętrzne źródła dla tego lotniska: oficjalna strona, Wikipedia i Baidu Baike.',
    officialSite: 'Oficjalna strona',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Źródła: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Otwarte dane OurAirports',
    sourcesNote:
      'Kody lotnisk, współrzędne i klasa lotniska pochodzą z otwartych danych; szczegóły strony są zgodne z oficjalnymi publikacjami lotniska.',
    mapEmbedKicker: 'Mapa',
    mapEmbedTitle: (name: string) => `Mapa interaktywna — lokalizacja ${name}`,
    mapEmbedEn: 'Mapa interaktywna',
    extMapsNote: 'Zobacz to lotnisko w innych serwisach mapowych:',
    routeMapKicker: 'Trasy',
    routeMapTitle: (name: string) => `Mapa tras ${name} — kierunki bezpośrednie`,
    routeMapEn: 'Mapa tras',
    routeMapAria: (name: string) => `Mapa połączeń bezpośrednich z ${name}`,
    routeLegendTitle: 'Legenda',
    routeLegendClose: 'Ukryj legendę',
    routeReset: 'Resetuj mapę',
    routeZoomIn: 'Powiększ',
    routeZoomOut: 'Pomniejsz',
    routeFullscreen: 'Pełny ekran',
    routeExitFullscreen: 'Wyjdź z pełnego ekranu',
    routeOpenAirport: 'Otwórz stronę lotniska {iata}',
    routeTiers: {
      trunk: '6+ linii',
      major: '3–5 linii',
      minor: '2 linie',
      single: '1 linia',
    },
    routeCarriersTpl: '{n} linii',
    routeTableDest: 'Kierunek',
    routeTableCountry: 'Kraj/region',
    routeTableDistance: 'Odległość',
    routeTableCarriers: 'Linie',
    routeCarriersMore: (n: number) => ` +${n} więcej`,
    routeMapNote: (date: string) =>
      `Migawka danych o trasach: ${date}; tylko połączenia bezpośrednie. Źródło: `,
    legendTerminal: 'Budynek terminala',
    legendTransit: 'Węzeł transportu naziemnego',
    legendCorridor: 'Połączenie między terminalami',
    terminalsKicker: 'Terminale',
    terminalsTitle: 'Przewodnik po terminalach',
    terminalsEn: 'Przewodnik po terminalach',
    terminalsSub: (name: string) =>
      `Strefy bramek, główne linie lotnicze i udogodnienia dla każdego terminala na ${name}.`,
    transitTitle: 'Transport naziemny',
    facilitiesTitle: 'Udogodnienia lotniska',
    faqKicker: 'FAQ',
    faqTitle: 'Najczęściej zadawane pytania',
    faqEn: 'Pytania',
    guideKicker: 'Przewodnik',
    guideTitle: 'Przewodnik po lotnisku',
    guideEn: 'Przewodnik po lotnisku',
    blogKicker: 'Artykuły',
    blogTitle: (iata: string) => `Przewodniki po lotnisku ${iata}`,
    blogEn: 'Z bloga',
    blogSub: (iata: string, count: number) =>
      `${count} artykułów na stronie dotyczy ${iata}: przylot, transport naziemny, bagaż i przesiadki.`,
    blogAll: 'Wszystkie artykuły',
    relatedTitle: (country: string) => `Inne lotniska w ${country}`,
    relatedEn: (country: string) => `Więcej w ${country}`,
    relatedAll: (country: string) => `Wszystkie lotniska w ${country}`,
    flights: {
      kicker: 'Loty',
      title: (name: string) => `Loty do i z ${name} — odloty i przyloty`,
      en: 'Tablica lotów',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${pluralPl(flights, 'numer lotu', 'numery lotów', 'numerów lotów')} u ${pluralPl(
          airlines,
          'linii lotniczej',
          'linii lotniczych',
          'linii lotniczych'
        )} i ${pluralPl(destinations, 'kierunku', 'kierunków', 'kierunków')}, z podziałem na kierunek. Numery codeshare są uwzględnione.`,
      statDepartures: 'Numery odlotów',
      statArrivals: 'Numery przylotów',
      statAirlines: 'Linie lotnicze',
      statDestinations: 'Kierunki',
      note: (date: string) =>
        `Numery lotów i trasy z indeksu aviability.com (migawka ${date}); numery codeshare są uwzględnione, a godziny odlotów nie są pokazywane. Źródło: `,
      source: 'aviability.com',
      tabDepartures: 'Odloty',
      tabArrivals: 'Przyloty',
      search: 'Szukaj numeru lotu, linii lub miasta',
      clearSearch: 'Wyczyść wyszukiwanie',
      flight: 'Lot',
      airline: 'Linia lotnicza',
      destination: 'Kierunek',
      origin: 'Pochodzenie',
      country: 'Kraj/region',
      empty: 'Żaden lot nie pasuje do wyszukiwania.',
      loading: 'Ładowanie lotów…',
      error: 'Nie udało się załadować kolejnych lotów.',
      retry: 'Spróbuj ponownie',
      previous: 'Poprzednia',
      next: 'Następna',
      pagination: 'Paginacja',
      showing: 'Wyświetlono {from}–{to} z {total} numerów lotów',
      pageOf: 'Strona {page} z {pages}',
    },
    notFound: 'Nie znaleziono lotniska',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Najnowsza mapa tras ${name} (${iata}) ${year} — ${count} kierunków bezpośrednich`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Mapa połączeń bezpośrednich z ${name} (${iata}): ${count} kierunków z liniami lotniczymi i odległościami oraz pełna lista kierunków.`,
    heading: (name: string) => `Mapa tras ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} ma ${count} kierunków bezpośrednich, oznaczonych kolorem według liczby obsługujących je linii.`,
    backToAirport: (iata: string) => `Powrót do strony lotniska ${iata}`,
    flightNumbers: (iata: string) => `Numery lotów ${iata}`,
    openFull: 'Zobacz mapę tras',
    previewCta: (iata: string) => `Zobacz pełną mapę tras ${iata}`,
    teaserSub: (count: string) => `${count} kierunków bezpośrednich: mapa, linie lotnicze i odległości.`,
    mapSectionTitle: (name: string) => `Mapa połączeń bezpośrednich z ${name}`,
    tableKicker: (iata: string) => `${iata} · Kierunki`,
    tableSectionTitle: (name: string) => `Lista kierunków bezpośrednich z ${name}`,
    tableSectionEn: (iata: string) => `Kierunki ${iata}`,
    tableToc: 'Kierunki',
    tableSectionSub: (count: string) =>
      `${count} kierunków, najruchliwsze najpierw według liczby linii, z odległością i przewoźnikami.`,
    dataKicker: 'Pobierz',
    dataTitle: 'Pobierz dane o trasach',
    dataEn: 'Dane',
    dataSub: (count: number) =>
      `${count} połączeń bezpośrednich z kierunkiem, kodem IATA, miastem, krajem, odległością i liniami — gotowe do arkusza lub skryptu.`,
    dataFields: 'CSV pasuje do Excela / Numbers, JSON do kodu; oba w UTF-8.',
    dataCsv: 'Pobierz CSV',
    dataJson: 'Pobierz JSON',
    airportMapSub:
      'Układ terminali i bramek w skrócie — kliknij obraz, aby zobaczyć pełną mapę, udogodnienia terminali i transport naziemny na stronie lotniska.',
    airportMapCta: (iata: string) => `Zobacz pełną mapę terminala ${iata}`,
    factDestinations: 'Kierunki bezpośrednie',
    factAirlines: 'Linie lotnicze',
    factCountries: 'Kraje',
    factSnapshot: 'Migawka danych',
    faqCountQ: (name: string) => `Do ilu miejsc ${name} lata bezpośrednio?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) ma ${count} kierunków bezpośrednich w ${countries} krajach i terytoriach. Liczone są tylko połączenia bezpośrednie; podróże z przesiadką nie.`,
    faqAirlinesQ: (name: string) => `Ile linii lotniczych lata z ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} linii obsługuje połączenia bezpośrednie z tego lotniska. Największe sieci mają ${leaders} (liczba kierunków w nawiasach).`,
    faqFarthestQ: (name: string) => `Który kierunek bezpośredni z ${name} jest najdalszy?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Najdalszym kierunkiem bezpośrednim jest ${city}, ${country} ${iata}, około ${km} km.`,
    faqBusiestQ: () => 'Które kierunki mają największą konkurencję?',
    faqBusiestA: (count: string, list: string) =>
      `${count} kierunków obsługują trzy lub więcej linii; najruchliwsze to ${list}.`,
    faqSourceQ: () => 'Jak często aktualizowane są dane o trasach?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Trasy na tej stronie pochodzą z otwartego zbioru ${source} (${license}), migawki z ${date}, a nie z aktualnego rozkładu — bilety i godziny sprawdzaj u linii lub na lotnisku.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Lot ${number} linii ${airline} — ${from} do ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Lot ${number} to numer lotu używany przez ${airline} na trasie ${from}–${to}${distance ? `, około ${distance}` : ''}. Mapa trasy, lotniska odlotu i przylotu, odległość i inne loty na trasie.`,
    heading: (number: string) => `Lot ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Lot ${number} to numer lotu używany przez ${airline} między ${from} a ${to}${distance ? `, odległość w linii prostej około ${distance}` : ''}.`,
    factFlight: 'Numer lotu',
    factFrom: 'Z',
    factTo: 'Do',
    factDistance: 'Odległość',
    overviewKicker: 'Przegląd',
    overviewTitle: (number: string) => `O locie ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} to numer lotu używany przez ${airline} między ${originName} (${originIata}) a ${destName} (${destIata})${distance ? `, około ${distance} od siebie` : ''}. Strona zbiera numer lotu, linię, trasę i oba lotniska do szybkiego sprawdzenia.`,
    overviewNote:
      'Indeks lotów nie zawiera godzin odlotu ani przylotu, typów samolotów ani dni operacji; rozkład, odprawę i boarding potwierdź u linii lub na lotnisku.',
    routeKicker: 'Trasa',
    routeTitle: (from: string, to: string) => `Trasa ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Schemat trasy lotu ${number}`,
    routeMapAria: (number: string) => `Mapa trasy lotu ${number}`,
    airportsKicker: 'Lotniska',
    airportsTitle: 'Lotniska odlotu i przylotu',
    airportsSub:
      'Lotniska, które łączy ten lot. Lotniska ujęte w katalogu otwierają własną stronę.',
    originAirport: 'Lotnisko odlotu',
    destinationAirport: 'Lotnisko przylotu',
    airportPage: 'Otwórz stronę lotniska',
    detailsKicker: 'Szczegóły',
    detailsTitle: 'Dane lotu',
    detailsFlight: 'Numer lotu',
    detailsAirline: 'Linia lotnicza',
    detailsOrigin: 'Lotnisko odlotu',
    detailsDestination: 'Lotnisko przylotu',
    detailsDistance: 'Odległość w linii prostej',
    detailsRoutes: 'Wymienione trasy',
    detailsSnapshot: 'Migawka danych',
    routesKicker: 'Trasy',
    routesTitle: 'Trasy pod tym numerem lotu',
    routesSub: (count: string) =>
      `Numer występuje na ${count} trasach; jeden numer może być współużytkowany przez partnerów codeshare.`,
    routesRoute: 'Trasa',
    routesAirline: 'Linia lotnicza',
    routesDistance: 'Odległość',
    relatedKicker: 'Powiązane',
    relatedTitle: 'Inne loty na tej trasie',
    relatedSub: 'Inne numery lotów między tym samym lotniskiem odlotu i przylotu.',
    relatedEn: 'Więcej lotów',
    faqKicker: 'FAQ',
    faqTitle: 'Najczęściej zadawane pytania',
    faqEn: 'Pytania',
    faqWhat: (number: string) => `Czym jest lot ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Lot ${number} to numer lotu używany przez ${airline} na trasie ${from} → ${to}${distance ? `, około ${distance} od siebie` : ''}.`,
    faqRoute: (number: string) => `Dokąd lata lot ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Lot ${number} leci z ${originName} (${originIata}) do ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Gdzie są godziny odlotu i przylotu ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Strona opisuje numer lotu, linię, trasę i lotniska ${number}. Indeks aviability.com nie zawiera godzin odlotu ani przylotu — aktualny rozkład sprawdź u linii lub na lotnisku.`,
    note: (date: string) =>
      `Numer lotu, linia i trasa z indeksu aviability.com (migawka ${date}); godziny odlotu i przylotu nie są uwzględnione. Źródło: `,
    source: 'aviability.com',
    sourceFlight: 'Zobacz na aviability.com',
    viewAirport: (iata: string) => `Otwórz stronę lotniska ${iata}`,
    notFound: 'Nie znaleziono lotu',
  },

  faq: {
    terminalCount: (name: string) => `Ile terminali ma ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) ma ${terminals} terminali z łącznie ${gates} bramkami: ${list}.`,
    gateCount: (name: string) => `Ile bramek ma ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) ma łącznie ${gates} bramek: ${list}.`,
    whereIs: (iata: string) => `Gdzie znajduje się ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} to kod IATA lotniska ${name} (${nameEn}), położonego w ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Jak daleko jest z ${name} do centrum ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} leży około ${distance} od centrum ${city}. Do miasta można dojechać: ${transit}.`,
    access: (name: string, city: string) => `Jak dostać się z ${name} do ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Jakie udogodnienia oferuje ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} oferuje ${facilities}. Zobacz układ terminala powyżej, aby sprawdzić ich rozmieszczenie między terminalami.`,
    location: (name: string) => `Gdzie znajduje się ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, kod IATA ${iata}) znajduje się w ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Które linie obsługują każdy terminal na ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Główne linie według terminala na ${name}: ${list}. Linie i przypisanie bramek się zmieniają, więc zawsze sprawdź kartę pokładową i oznaczenia na lotnisku.`,
    timezone: (name: string) => `W jakiej strefie czasowej jest ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) znajduje się w strefie czasowej ${tz}. Porównaj z czasem lokalnym za pomocą zegara lotniska powyżej.`,
    flightsCount: (name: string) => `Ile numerów lotów jest wymienionych dla ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Indeks aviability.com wymienia ${pluralPl(
        departures,
        'numer odlotu',
        'numery odlotów',
        'numerów odlotów'
      )} i ${pluralPl(arrivals, 'numer przylotu', 'numery przylotów', 'numerów przylotów')} dla ${name} (${iata}), obejmując ${pluralPl(
        airlines,
        'linię lotniczą',
        'linie lotnicze',
        'linii lotniczych'
      )} i ${pluralPl(destinations, 'kierunek', 'kierunki', 'kierunków')} (migawka ${date}). Numery codeshare są uwzględnione, a rozkłady mogą się zmieniać — potwierdź u linii przed podróżą.`,
  },

  editorial: {
    authorName: 'Zespół redakcyjny World Airport Maps',
    role: 'Opracowane i sprawdzone przez ',
    sourcesNote: 'Opracowane na podstawie źródeł publicznych i oficjalnych informacji lotnisk',
  },

  toc: {
    label: 'Na tej stronie',
    map: 'Mapa terminala',
    photos: 'Zdjęcia lotniska',
    time: 'Czas na lotnisku',
    details: 'Dane lotniska',
    links: 'Powiązane linki',
    location: 'Mapa lokalizacji',
    routes: 'Mapa tras',
    flights: 'Loty',
    guide: 'Przewodnik po lotnisku',
    blog: 'Powiązane przewodniki',
    terminals: 'Przewodnik po terminalach',
    transport: 'Transport naziemny',
    facilities: 'Udogodnienia',
    faq: 'FAQ',
    flightOverview: 'Przegląd lotu',
    flightRoute: 'Trasa',
    flightAirports: 'Lotniska',
    flightDetails: 'Dane lotu',
    flightRoutes: 'Wszystkie trasy',
    flightRelated: 'Powiązane loty',
    intro: 'Przegląd lotnisk',
    distribution: 'Rozmieszczenie lotnisk',
    airports: 'Lista lotnisk',
  },

  error: {
    title: 'Nie udało się załadować strony',
    sub: 'Coś poszło nie tak podczas odczytywania danych lotniska. Spróbuj ponownie lub wróć na stronę główną.',
    retry: 'Spróbuj ponownie',
    backHome: 'Powrót na stronę główną',
    notFoundTitle: '404 · Nie znaleziono strony',
    notFoundSub: 'Żądana strona mogła zostać przeniesiona lub usunięta. Wyszukaj lotnisko lub skorzystaj z linków poniżej.',
  },

  footer: {
    sponsored: 'Sponsorowane',
    mapsTitle: 'Szczegółowe mapy terminali',
    mapsBody:
      'Poruszanie się po lotniskach i terminalach bywa trudne. Nasze mapy pokazują szczegółowe układy terminali, bramek, stref odprawy, taśm bagażowych, sklepów, restauracji, salonów i węzłów transportowych, dzięki czemu podróż przebiega sprawniej.',
    plansTitle: 'Interaktywne plany terminali',
    plansBody:
      'Duże lotniska międzynarodowe mają wiele terminali i złożone układy. Nasze mapy pomagają znaleźć bramkę, udogodnienia, zaplanować przesiadkę i sprawnie przejść przez kontrolę, odloty i przyloty.',
    transitTitle: 'Transport i dostęp do lotniska',
    transitBody:
      'Poza układami terminali opisujemy opcje transportu, parkingi i drogi dojazdu — jak dotrzeć do bramki, przesiąść się między terminalami i korzystać z pociągu, autobusu, taksówki i wynajmu samochodu.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} krajów / regionów · ${airports} lotnisk · ${terminals} terminali · ilustrowane układy terminali`,
    fallback: 'Ilustrowane układy terminali i przewodniki transportowe dla lotnisk na świecie',
    linksLabel: 'Nawigacja w stopce',
    about: 'O nas',
    contact: 'Kontakt',
    sources: 'Źródła danych',
    privacy: 'Polityka prywatności',
    disclaimer: 'Zastrzeżenia prawne',
    terms: 'Warunki korzystania',
  },

  transportModes: plTransportModes as Record<string, string>,

  categories: {
    kicker: 'Przeglądaj',
    title: 'Przeglądaj według obszaru',
    en: 'Przeglądaj według obszaru',
    sub: 'Wejdź do katalogu z dowolnej strony: według kraju, regionu, miasta — albo przejdź od razu do najruchliwszych węzłów, najnowszych aktualizacji i przewodników.',
    allAirports: {
      title: 'Wszystkie lotniska',
      body: 'Pełny katalog uszeregowany według ruchu pasażerskiego, z filtrem kraju i ponownym sortowaniem.',
    },
    byCountry: {
      title: 'Według kraju',
      body: 'Zobacz, ile lotnisk, terminali i bramek ma każdy kraj lub region.',
    },
    byRegion: {
      title: 'Według regionu',
      body: 'Kraje pogrupowane w Azję Wschodnią, Europę, Amerykę Północną i pozostałe regiony.',
    },
    popularCities: {
      title: 'Popularne miasta',
      body: 'Najruchliwsze miasta lotnicze według łącznej liczby pasażerów i wszystkie lotniska w każdym z nich.',
    },
    recentlyUpdated: {
      title: 'Ostatnio aktualizowane',
      body: 'Nowo dodane i zaktualizowane rekordy lotnisk, od najnowszych.',
    },
    guides: {
      title: 'Przewodniki po lotniskach',
      body: 'Obszerne przewodniki po przesiadkach, dojeździe do miasta i praktycznych wskazówkach.',
    },
    routes: {
      title: 'Mapy tras',
      body: 'Zobacz siatkę połączeń bezpośrednich lotniska, uszeregowaną według liczby kierunków, z liniami i odległościami.',
    },
  },

  guides: {
    kicker: 'Przewodniki',
    title: 'Przewodniki po lotniskach',
    en: 'Przewodniki po lotniskach',
    sub: 'Poza planami terminali przygotowaliśmy obszerne przewodniki po wybranych węzłach: jak czytać numerację bramek, jak przesiadać się między terminalami i jak dostać się do miasta.',
    more: 'Zobacz to lotnisko',
  },

  blog: {
    kicker: 'Dziennik',
    title: 'Notatki z podróży',
    nav: 'Blog',
    en: 'Notatki z podróży',
    sub: 'Obszerne notatki naszej redakcji: przylot i kontrola graniczna, przesiadki, udogodnienia terminali i miejsca odpoczynku.',
    more: 'Czytaj',
    all: 'Wszystkie artykuły',
    morePosts: 'Więcej artykułów',
    airportsKicker: 'Lotniska',
    airportsTitle: 'Lotniska w tym artykule',
    airportsEn: 'Omówione lotniska',
    airportsSub: 'Otwórz stronę lotniska, aby zobaczyć mapę terminala, transport naziemny i FAQ.',
    back: 'Powrót do listy artykułów',
    empty: 'Brak artykułów.',
    readingMinutes: (n: number) => `${n} min czytania`,
    source: (name: string) => `Źródło: ${name}`,
    tags: 'Tagi',
  },

  comments: {
    kicker: 'Komentarze',
    title: 'Komentarze czytelników',
    en: 'Dyskusja',
    sub: 'Pytania, relacje z podróży i poprawki są mile widziane. Komentarze są publiczne.',
    formTitle: 'Dodaj komentarz',
    countOne: '1 komentarz',
    countMany: '{n} komentarzy',
    empty: 'Brak komentarzy — napisz pierwszy.',
    loading: 'Ładowanie komentarzy…',
    loadError: 'Komentarze są chwilowo niedostępne.',
    retry: 'Spróbuj ponownie',
    nameLabel: 'Imię',
    namePlaceholder: 'Jak mamy się do Ciebie zwracać?',
    bodyLabel: 'Komentarz',
    bodyPlaceholder: 'Podziel się doświadczeniem, zadaj pytanie lub dodaj kontekst…',
    submit: 'Opublikuj komentarz',
    submitting: 'Publikowanie…',
    success: 'Opublikowano — dziękujemy za podzielenie się.',
    error: 'Nie udało się opublikować komentarza. Spróbuj później.',
    rateLimited: 'To było zbyt szybkie. Odczekaj kilka minut i spróbuj ponownie.',
    nameError: 'Podaj imię (2–40 znaków).',
    bodyError: 'Napisz komentarz (5–2000 znaków).',
    note: 'Komentarze są publiczne i odzwierciedlają opinie autorów. Bądź uprzejmy i nie publikuj reklam ani danych osobowych.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Układ terminala ${name}`,
    gates: 'Bramki',
    terminal: 'Terminal',
    corridor: 'Połączenie',
    transit: 'Transport naziemny',
    footer: (iata: string) => `${iata} · Układ terminala`,
  },

  tool: {
    label: 'Narzędzia online',
    hub: {
      kicker: 'Narzędzia',
      title: 'Narzędzia mapowe i współrzędnych',
      en: 'Darmowe narzędzia',
      sub: 'Darmowe narzędzia online dla podróżnych i miłośników geografii — działają w przeglądarce, nic nie trzeba instalować.',
      description:
        'Darmowe narzędzia mapowe i współrzędnych online: konwersja WGS84 / GCJ02 / BD09, stopnie dziesiętne ↔ DMS i odległość w linii prostej między dwoma punktami. Dwujęzyczne, w przeglądarce.',
      comingTitle: 'Więcej narzędzi w przygotowaniu',
      comingSub: 'Wybór współrzędnych na mapie, udostępnianie lokalizacji i kalkulatory projekcji są w drodze.',
    },
    howTitle: 'Jak używać',
    relatedTitle: 'Powiązane narzędzia',
    allTools: 'Wszystkie narzędzia',
    tools: {
      coordinateConverter: {
        title: 'Konwerter współrzędnych',
        en: 'Konwerter współrzędnych',
        description:
          'Konwertuj między WGS84, GCJ02 i BD09 — rozwiązanie problemu przesunięcia map w Chinach.',
        note: 'WGS84 to standard GPS i międzynarodowy. GCJ02 to przesunięty system współrzędnych wymagany w Chinach kontynentalnych (zwany „współrzędnymi Marsa”), używany przez AMap i Tencent Maps. BD09 dodaje kolejne przesunięcie względem GCJ02 i jest używany przez Baidu Maps. To samo miejsce może różnić się o 100–700 m między systemami, więc konwertuj przed ponownym użyciem współrzędnych w innym serwisie mapowym.',
        steps: [
          'Wpisz współrzędne dziesiętne jako szerokość, długość geograficzną — np. 39.9042, 116.4074.',
          'Wybierz system współrzędnych danych wejściowych.',
          'Kliknij „Konwertuj”, aby otrzymać pozostałe dwa systemy; użyj „Kopiuj”, aby zapisać wynik.',
        ],
        inputLabel: 'Współrzędne (szerokość, długość geograficzna)',
        inputPlaceholder: 'np. 39.9042, 116.4074',
        sourceLabel: 'System współrzędnych wejściowych',
        wgs84: 'WGS84 · GPS / międzynarodowy',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Miejsca dziesiętne',
        submit: 'Konwertuj',
        copy: 'Kopiuj',
        copied: 'Skopiowano',
        error: 'Nie udało się odczytać współrzędnych. Użyj formatu „szerokość, długość geograficzna”, np. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Konwerter formatu współrzędnych',
        en: 'Konwerter formatu współrzędnych',
        description:
          'Konwertuj między stopniami dziesiętnymi (DD), stopniami-minutami (DM) i stopniami-minutami-sekundami (DMS); format wejściowy jest rozpoznawany automatycznie.',
        note: 'DD (39.9042°) to zwykły format dziesiętny używany przez urządzenia i API; DMS (39°54′15″N) jest powszechny w żegludze, lotnictwie i geodezji; DM (39°54.25′N) jest typowy dla notatek terenowych. Narzędzie rozpoznaje format wejściowy po liczbie grup cyfr w każdej połowie (1 = DD, 2 = DM, 3 = DMS) i wyświetla wszystkie trzy formaty, z N/S/E/W dla półkul.',
        steps: [
          'Wpisz parę współrzędnych — 39.9042, 39°54′15″N i 39°32.5′E działają; oddziel obie połowy przecinkiem.',
          'Wybierz liczbę miejsc dziesiętnych wyniku.',
          'Kliknij „Konwertuj” — wyświetlą się wszystkie trzy formaty; użyj „Kopiuj”, aby zapisać jeden.',
        ],
        inputLabel: 'Współrzędne (jedna para, oddzielona przecinkiem)',
        inputPlaceholder: 'np. 39°54′15″N, 116°24′51″E lub 39.9042, 116.4074',
        precisionLabel: 'Miejsca dziesiętne',
        submit: 'Konwertuj',
        ddLabel: 'Stopnie dziesiętne (DD)',
        dmLabel: 'Stopnie-minuty (DM)',
        dmsLabel: 'Stopnie-minuty-sekundy (DMS)',
        copy: 'Kopiuj',
        copied: 'Skopiowano',
        error: 'Nie udało się odczytać współrzędnych. Obsługiwane formaty to m.in. 39.9042, 39°54′15″N i 39°32.5′E, oddzielone przecinkiem.',
      },
      distanceCalculator: {
        title: 'Kalkulator odległości',
        en: 'Kalkulator odległości',
        description:
          'Odległość w linii prostej między dwoma punktami na Ziemi oraz początkowy azymut.',
        note: 'Odległość jest liczona wzorem Haversine’a dla wielkiego koła (średni promień Ziemi 6371,0088 km) — najkrótszą drogą po powierzchni. Początkowy azymut to kierunek kompasowy od pierwszego punktu do drugiego, 0° na północy, rosnący zgodnie z ruchem wskazówek zegara.',
        steps: [
          'Wpisz szerokość i długość geograficzną punktu początkowego i końcowego.',
          'Kliknij „Oblicz odległość”.',
          'Otrzymasz wynik w kilometrach, milach i milach morskich oraz początkowy azymut.',
        ],
        fromLabel: 'Z',
        toLabel: 'Do',
        inputPlaceholder: 'szerokość, długość geograficzna',
        example: 'Przykład: Pekin → Szanghaj',
        submit: 'Oblicz odległość',
        km: 'km',
        mi: 'mi',
        nmi: 'Mm',
        bearing: 'Początkowy azymut',
        copy: 'Kopiuj',
        copied: 'Skopiowano',
        error: 'Nie udało się odczytać współrzędnych. Użyj formatu „szerokość, długość geograficzna” z szerokością -90–90 i długością -180–180.',
      },
    },
  },
};
