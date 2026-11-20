import type { Messages } from './zh';
import { csTransportModes } from '../cs-data';

/** Klasa letiště ve úvodní větě (typ airport ve schema.org). */
const AIRPORT_KIND = {
  large: 'velké letiště',
  medium: 'středně velké letiště',
  small: 'malé letiště',
  heliport: 'heliport',
} as const;

/**
 * České skloňování po číslovce: 1 terminál, 2–4 terminály, 5+ terminálů.
 * `value` je už naformátované (desetinná čárka), proto ho parsujeme zpět.
 */
const pluralCs = (value: string, one: string, few: string, many: string) => {
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
 * Český katalog. Typovaný vůči čínskému zdroji (`Messages`), takže chybějící
 * nebo přejmenovaný klíč zastaví kompilaci.
 */
export const cs: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Mapy letišť a terminálů',
    description:
      'Procházejte mapy terminálů letišť uspořádané podle zemí a regionů. Od velkých mezinárodních uzlů po regionální letiště: prohlédněte si podrobná uspořádání bran, odbavovacích zón, pásů na zavazadla, obchodů, restaurací, salonků a dopravy do města.',
    keywords: [
      'mapy letišť',
      'mapy terminálů',
      'uspořádání letištního terminálu',
      'brány',
      'letištní doprava',
      'průvodce letištěm',
    ],
    numberOfItems: (n: number) =>
      pluralCs(String(n), 'letiště', 'letiště', 'letišť'),
  },

  nav: {
    home: 'Domů',
    airports: 'Všechna letiště',
    countries: 'Podle země',
    tools: 'Online nástroje',
    about: 'O nás',
    label: 'Hlavní navigace',
    languageLabel: 'Jazyk',
    switchLanguage: 'Změnit jazyk',
    languagePlanned: 'V přípravě',
    languagePlannedHint: 'Tato jazyková verze zatím nebyla zveřejněna.',
    themeToggle: 'Přepnout tmavý režim',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Reklama',
    skipToContent: 'Přejít na obsah',
    backToTop: 'Zpět nahoru',
    breadcrumbLabel: 'Drobečková navigace',
    home: 'Domů',
    viewMap: 'Zobrazit mapu',
    terminalMap: 'Mapa terminálu',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralCs(String(counts.terminals), 'terminál', 'terminály', 'terminálů')}${
            counts.gates > 0
              ? `, ${pluralCs(String(counts.gates), 'brána', 'brány', 'bran')}`
              : ''
          } — mapa terminálu`
        : `${name} (${iata}) — mapa polohy a průvodce ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — mapa terminálu` : name,
    airportGuide: 'Průvodce letištěm',
    lastUpdated: 'Nedávno aktualizováno',
    updatedOn: (date: string) => `Aktualizováno ${date}`,
    publishedOn: (date: string) => `Zveřejněno ${date}`,
    readMore: 'Přečíst celý průvodce',
  },

  units: {
    terminalsFact: 'Terminály',
    gatesFact: 'Brány',
    terminals: (n: number) =>
      pluralCs(String(n), 'terminál', 'terminály', 'terminálů'),
    terminalsShort: (n: number) =>
      pluralCs(String(n), 'terminál', 'terminály', 'terminálů'),
    gates: (n: number) => pluralCs(String(n), 'brána', 'brány', 'bran'),
    airports: (n: number) => pluralCs(String(n), 'letiště', 'letiště', 'letišť'),
    airportsChip: (n: number) =>
      pluralCs(String(n), 'letiště', 'letiště', 'letišť'),
    pax: 'Cestující',
    paxFull: 'Cestující ročně',
    distance: 'Do centra',
    distanceFrom: (city: string) => `Z centra ${city}`,
    gatesLabel: (range: string) => `Brány ${range}`,
    gatesCount: (n: number) => `${n} bran`,
    satellite: 'Satelitní terminál',
    airlinesLabel: 'Hlavní aerolinky: ',
  },

  search: {
    ariaLabel: 'Hledat letiště',
    placeholder: 'Hledat letiště, města nebo kódy IATA',
    heroPlaceholder: 'Hledejte podle názvu letiště, města nebo kódu IATA — např. LHR / Dubaj / Heathrow',
    submit: 'Najít letiště',
    loading: 'Hledání…',
    empty: 'Nenalezena žádná odpovídající letiště',
    resultsTitle: (term: string) => `Výsledky hledání pro „${term}“`,
    resultsCount: (n: number) =>
      `Nalezeno ${pluralCs(String(n), 'odpovídající letiště', 'odpovídající letiště', 'odpovídajících letišť')}.`,
    noResults: 'Žádné letiště neodpovídá. Zkuste jiné slovo, například název města nebo kód IATA.',
    noResultsHint: 'Nemůžete letiště najít?',
    viewAll: (n: number) => `Procházet všech ${n} letišť`,
    orBrowseByCountry: 'nebo procházet podle země',
    range: (from: number, to: number, total: number) =>
      `Zobrazeno ${from}–${to} z ${total} letišť`,
  },

  hero: {
    eyebrow: 'Světový adresář letišť',
    titleLead: 'Prozkoumejte letiště a',
    titleAccent: 'mapy terminálů',
    sub: 'Najděte cestu na každém letišti díky kompletní sbírce map letišť a terminálů uspořádaných podle zemí a regionů — od velkých mezinárodních uzlů po regionální letiště.',
    stats: {
      countries: 'Země / regiony',
      airports: 'Letiště',
      terminals: 'Mapy terminálů',
    },
  },

  home: {
    intro: {
      ariaLabel: 'O tomto webu',
      imageAlt: 'Dopravní letadlo u brány letištního terminálu s prosklenou fasádou při východu slunce',
      blocks: [
        {
          title: 'Projděte každým letištěm díky podrobným mapám terminálů',
          body: 'Orientace na letištích a terminálech po celém světě bývá náročná. Naše mapy ukazují podrobná uspořádání terminálů, bran, odbavovacích zón, pásů na zavazadla, obchodů, restaurací, salonků a dopravních uzlů, takže trasu můžete naplánovat ještě před cestou.',
        },
        {
          title: 'Interaktivní mapy terminálů a půdorysy',
          body: 'Velká mezinárodní letiště mají více terminálů a složitá uspořádání. Naše mapy pomáhají najít brány, lokalizovat vybavení, naplánovat přestupy a plynule projít bezpečnostní kontrolou, odletovou i příletovou halou — bez zbytečného vracení.',
        },
        {
          title: 'Doprava a přístup na letiště',
          body: 'Kromě uspořádání terminálů naše průvodce pokrývají možnosti dopravy, parkování a příjezdové trasy. Najděte nejlepší cestu k bráně, přestup mezi terminály a pozemní dopravu včetně vlaku, autobusu, taxíku a půjčení auta.',
        },
      ],
    },
    map: {
      kicker: 'Mapa světa',
      title: 'Mapa letišť',
      en: 'Mapa letišť',
      sub: (airports: string, world: string) =>
        `Najděte ${world} letišť s pravidelným provozem po celém světě — ${airports} z nich má zde mapu terminálu. Klikněte na bod pro zemi nebo region a podrobnosti.`,
      all: 'Vše',
      gEurope: 'Evropa',
      gAsia: 'Asie',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Oceánie',
      legendSite: 'Zahrnuto zde · klikněte pro mapy terminálů',
      legendWorld: 'Ostatní letiště s pravidelným provozem',
      countTemplate: 'Zobrazeno {n} letišť',
      download: 'Stáhnout data',
      downloadTitle: 'Exportovat všechna letiště aktuálního filtru do CSV (IATA, název, město, země, souřadnice)',
      openAirport: 'Zobrazit letiště',
    },
    popular: {
      kicker: 'Mapy terminálů',
      title: 'Populární mapy letišť',
      en: 'Mapy letišť',
      sub: 'Výběr obálek map terminálů velkých letišť světa — otevřete stránku letiště pro celou mapu.',
    },
    recent: {
      kicker: 'Nově zveřejněno',
      title: 'Nedávno aktualizováno',
      en: 'Nedávno aktualizováno',
      sub: 'Nová a revidovaná letiště, země a cestovní průvodce.',
      countriesTitle: 'Nedávno aktualizované země',
    },
    routes: {
      kicker: 'Trasy',
      title: 'Nejrušnější mapy tras',
      en: 'Mapy tras',
      sub: 'Letiště seřazená podle počtu míst, kam létají bez mezipřistání — otevřete jedno pro mapu tras, aerolinky a seznam destinací.',
      collection: 'Sbírka tras',
      tabsLabel: 'Mapy tras podle měst',
      explore: (city: string) => `Prozkoumat ${city}`,
      play: 'Spustit prezentaci',
      pause: 'Pozastavit prezentaci',
    },
    photos: {
      kicker: 'Nejnovější fotografie',
      title: 'Nejnovější fotografie letišť',
      en: 'Nejnovější fotografie',
      sub: 'Nejnověji přidané fotografie letišť — šest nejnovějších letišť, každé s jedním snímkem.',
      ariaLabel: 'Karusel nejnovějších fotografií letišť',
      prev: 'Předchozí fotografie',
      next: 'Další fotografie',
      play: 'Spustit prezentaci',
      pause: 'Pozastavit prezentaci',
      counter: (index: number, total: number) => `Fotografie ${index} z ${total}`,
      view: (name: string) => `Zobrazit mapu ${name}`,
      open: 'Otevřít stránku letiště',
    },
    countries: {
      kicker: 'Podle země',
      title: 'Mapy letišť podle země',
      en: 'Země',
      sub: 'Procházejte mapy terminálů uspořádané podle zemí a regionů, od velkých mezinárodních uzlů po regionální letiště.',
      more: 'Všechny země',
    },
    all: {
      kicker: 'Všechny mapy',
      title: 'Všechny mapy letišť',
      en: 'Všechna letiště',
      sub: 'Mapy nejrušnějších letišť a cestovních uzlů světa.',
      hint: 'Vyberte letiště a zobrazte uspořádání terminálu.',
      more: 'Zobrazit vše',
    },
    facts: {
      kicker: 'Data adresáře',
      title: 'Data letišť v kostce',
      en: 'Seznamy a tabulky',
      sub: 'Čísla adresáře v podobě seznamů a tabulek: pokrytí, nejrušnější letiště se zveřejněnými údaji o cestujících a regionální rozdělení.',
      note: (pax: string, detailed: string, total: string) =>
        `Údaje o cestujících pokrývají ${pax} z ${total} letišť; údaje o terminálech a branách pokrývají ${detailed} z ${total}. Počty terminálů vycházejí z vlastního seskupení adresáře a mohou zahrnovat haly.`,
      coverageTitle: 'Čísla pokrytí',
      coverage: {
        airports: 'Letiště',
        countries: 'Země a regiony',
        regions: 'Regiony adresáře',
        cities: 'Unikátní názvy měst',
        terminals: 'Terminály',
        gates: 'Brány',
        routes: 'Letiště s mapou tras',
      },
      busiest: {
        title: 'Nejrušnější letiště podle ročních cestujících',
        sub: 'Dvanáct nejrušnějších letišť se zveřejněnými ročními údaji o cestujících.',
        caption: 'Letiště se zveřejněnými ročními údaji o cestujících, seřazená',
        rank: 'Pořadí',
        iata: 'IATA',
        airport: 'Letiště',
        city: 'Město',
        country: 'Země',
        terminals: 'Terminály',
        gates: 'Brány',
        pax: 'Roční cestující (mil.)',
      },
      regions: {
        title: 'Letiště podle regionu adresáře',
        sub: 'Počty letišť, terminálů a bran seskupené podle regionů adresáře; některé země a území patří do dvou regionů.',
        caption: 'Počty letišť podle regionu adresáře',
        region: 'Region',
        airports: 'Letiště',
        detailed: 'S podrobnými daty',
        terminals: 'Terminály',
        gates: 'Brány',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Letiště',
    city: 'Město',
    country: 'Země',
    size: 'Velikost',
    map: 'Mapa',
    empty: 'Žádné letiště neodpovídá filtrům. Zkuste výběr rozšířit.',
  },

  pager: {
    label: 'Stránkování',
    previous: 'Předchozí stránka',
    next: 'Další stránka',
  },

  filters: {
    searchPlaceholder: 'Hledat letiště, města nebo kódy IATA',
    submit: 'Hledat',
    country: 'Země',
    all: 'Vše',
    sort: 'Seřadit',
    sortPax: 'Cestující',
    sortName: 'Název',
    sortIata: 'Kód IATA',
    sortUpdated: 'Poslední aktualizace',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Všechny mapy letišť: ${country}${sortLabel ? ` — seřazeno podle: ${sortLabel}` : ''}`
        : `Všechny mapy letišť — seřazeno podle: ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Všechny mapy letišť země ${country} na jedné stránce: uspořádání terminálů, zóny bran a pozemní doprava${sortLabel ? `, seřazeno podle: ${sortLabel}` : ''}.`
        : `Celý adresář map letišť na jedné stránce: uspořádání terminálů, zóny bran a pozemní doprava${sortLabel ? `, seřazeno podle: ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Procházet letiště podle země',
    description:
      'Procházejte světový adresář map terminálů podle zemí a regionů. Od velkých mezinárodních uzlů po regionální letiště: zjistěte, kolik letišť a terminálů má každá země.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Od velkých mezinárodních uzlů po regionální letiště — ${countries} zemí a regionů, ${airports} letišť a ${terminals} terminálů celkem.`,
    regionCount: (countries: number, airports: number) =>
      `${pluralCs(String(countries), 'země', 'země', 'zemí')} · ${pluralCs(String(airports), 'letiště', 'letiště', 'letišť')}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} — mapa letišť, všech ${count}` : `Mapy letišť: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} má ${total} letišť s pravidelným provozem; ${count} z nich má zde stránku průvodce, s mapou rozmístění, úplným národním seznamem a přímými linkami.`
        : `Mapy terminálů pro ${count} letišť v zemi ${name} (${nameEn}), pokrývající hlavní mezinárodní uzel i regionální letiště regionu ${region}. Prohlédněte si brány, uspořádání terminálů a pozemní dopravu.`,
    chip: (nameEn: string) => `LETIŠTĚ: ${nameEn.toUpperCase()}`,
    kicker: 'Mapy letišť',
    titleOf: (name: string) => `Letiště v zemi ${name}`,
    en: 'Letiště',
    sub: 'Vyberte letiště a zobrazte uspořádání terminálu, zóny bran a možnosti dopravy.',
    empty: 'Pro tuto zemi nebo region zatím nejsou uvedena žádná letiště.',
    moreKicker: 'Jiné země',
    moreTitle: 'Procházet jiné země',
    moreEn: 'Více zemí',
    all: 'Všechny země',
    notFound: 'Země nenalezena',
    introKicker: 'Přehled',
    introTitle: (name: string) => `Přehled letišť: ${name}`,
    introEn: 'Přehled letišť',
    introSub:
      'Rozsah letišť v této zemi nebo regionu, hlavní uzly a města, která obsluhují.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} leží v regionu ${o.region}. Tento web pokrývá ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` a ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) je největší podle ročních cestujících — ${o.busiestPax}.`
        : '') +
      ` Letiště obsluhují mimo jiné ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Každá stránka letiště obsahuje mapu polohy a kódy letiště a také všechny údaje o terminálech, branách a dopravě, které pro něj byly shromážděny.',
    distribution: {
      kicker: 'Rozmístění',
      title: (name: string) => `Mapa rozmístění letišť: ${name}`,
      en: 'Rozmístění letišť',
      sub: (covered: string, total: string) =>
        `${total} letišť s pravidelným provozem v celé zemi (velká, střední a malá); ${covered} z nich má zde stránku průvodce. Úplný seznam následuje.`,
      mapAlt: (name: string, total: string) =>
        `Mapa rozmístění letišť: ${name}, ${total} letišť s pravidelným provozem`,
      siteTag: 'Zahrnuto zde',
      colAirport: 'Letiště',
      colCity: 'Město',
      colType: 'Typ',
      types: {
        large: 'Velké',
        medium: 'Střední',
        small: 'Malé',
      },
      empty: 'Národní seznam letišť zatím není k dispozici.',
    },
    linksTitle: 'Související odkazy',
    linksEn: 'Související odkazy',
    linksSub: 'Oficiální stránky a encyklopedie pro zemi a každé její letiště.',
    linksCountry: (name: string) => `Zdroje o ${name}`,
    linksAirports: (name: string) => `Letiště v zemi ${name}`,
    faqKicker: 'FAQ',
    faqTitle: 'Často kladené otázky',
    faqEn: 'Otázky',
    faq: {
      airportTotal: (name: string) => `Kolik letišť je v zemi ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} má ${total} letišť s pravidelnou osobní dopravou (velkých, středních a malých); tento web podrobně pokrývá ${covered} z nich. Viz mapa rozmístění a úplný seznam výše.`,
      airportCount: (name: string) => `Která letiště jsou v zemi ${name} zahrnuta?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Tento web zahrnuje ${count} v zemi ${name}: ${list}.`,
      busiest: (name: string) => `Které letiště v zemi ${name} je nejrušnější?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Podle ročních cestujících je ${busiest} (${iata}) největší z letišť zde zahrnutých — ${pax}.`,
      terminals: (name: string) => `Kolik terminálů mají letiště v zemi ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Letiště zahrnutá v zemi ${name} mají ${terminals} s celkem ${gates}: ${list}.`,
      cities: (name: string) => `Která města v zemi ${name} mají letiště?`,
      citiesAnswer: (name: string, cities: string) =>
        `Zahrnutá letiště ${name} obsluhují mimo jiné ${cities}. V adresáři letišť je můžete filtrovat podle města nebo kódu IATA.`,
      maps: (name: string) => `Mají letiště v zemi ${name} mapy terminálů?`,
      mapsAnswer: (name: string, count: string) =>
        `Některá ano. Stránky letišť obsahují mapu polohy, kódy letiště a přímé linky a ${count} zahrnutých v zemi ${name} zobrazuje uspořádání terminálu, zóny bran a pozemní dopravu tam, kde jsou údaje shromážděny. Otevřete letiště a zjistěte, co je k dispozici.`,
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
        ? `${o.name} (${o.iata}) má ${pluralCs(o.terminals, 'terminál', 'terminály', 'terminálů')}${
            o.gates ? ` s ${pluralCs(o.gates, 'branou', 'branami', 'branami')}` : ''
          }${o.pax ? `, ročně obslouží ${o.pax} cestujících` : ''}${
            o.distance ? `, ${o.distance} od centra města` : ''
          }. Mapa terminálu se všemi terminály, zónami bran a pozemní dopravou.`
        : `${o.name} (${o.iata}) obsluhuje ${o.city}, ${o.country}. Mapa polohy, kódy letiště a cestovní informace.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'letiště';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) je ${kind} obsluhující ${where}`;
      return o.terminals > 0
        ? `${head}, s ${pluralCs(String(o.terminals), 'terminálem', 'terminály', 'terminály')}${
            o.gates > 0 ? ` a ${pluralCs(String(o.gates), 'branou', 'branami', 'branami')}` : ''
          }${o.distance ? `, přibližně ${o.distance} od centra ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Uspořádání terminálu`,
    mapNote: 'USPOŘÁDÁNÍ TERMINÁLU',
    realMapTitle: (iata: string) => `${iata} — mapa terminálu, brány a navigace`,
    mapAlt: (name: string, iata: string) =>
      `Mapa terminálu ${name} (${iata}) se všemi terminály, zónami bran a halami`,
    realMapNote: 'MAPA TERMINÁLU',
    photosKicker: 'Fotografie',
    photosTitle: 'Fotografie letiště',
    photosEn: 'Fotografie letiště',
    photosSub:
      'Skutečné fotografie tohoto letiště, každá s uvedením veřejné webové stránky, kde byla nalezena; autorská práva zůstávají fotografům. Kliknutím na fotografii ji zvětšíte, kliknutím na řádek zdroje otevřete zdrojovou stránku.',
    photosCredit: (host: string) => `Zdroj: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Fotografie letiště ${index}: ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Zvětšit fotografii ${index} letiště ${name}`,
    zoomLabel: 'Zvětšit',
    zoomClose: 'Zavřít',
    zoomIn: 'Přiblížit',
    zoomOut: 'Oddálit',
    downloadKicker: 'Stáhnout',
    downloadTitle: 'Stáhnout mapy letišť',
    downloadEn: 'Ke stažení',
    downloadMapLabel: (year: number, iata: string) =>
      `Nejnovější mapa terminálu a půdorys ${iata} ${year} ke stažení`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Nejnovější mapa terminálu ${iata} ${year} v PDF`,
    timeKicker: 'Čas',
    timeTitle: (iata: string) => `Informace o čase — aktuální čas v ${iata}`,
    timeEn: 'Čas na letišti',
    timeSub: (iata: string, tz: string) => `Aktuální čas v ${iata} (${tz}) ve srovnání s vaším místním časem.`,
    clockAirport: 'Aktuální čas na letišti',
    clockLocal: 'Váš místní čas',
    infoKicker: 'Info',
    infoTitle: 'Informace a údaje o letišti',
    infoEn: 'Údaje o letišti',
    infoIata: 'Kód IATA letiště',
    infoLocation: 'Poloha letiště',
    infoCoords: 'Souřadnice',
    infoTimezone: 'Časové pásmo',
    linksKicker: 'Odkazy',
    linksTitle: 'Související odkazy',
    linksEn: 'SOUVISEJÍCÍ ODKAZY',
    linksSub: 'Externí zdroje pro toto letiště: oficiální web, Wikipedie a Baidu Baike.',
    officialSite: 'Oficiální web',
    wikiLabel: 'Wikipedie',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Zdroje: ',
    sourcesWikipedia: 'Wikipedie',
    sourcesOurAirports: 'Otevřená data OurAirports',
    sourcesNote:
      'Kódy letišť, souřadnice a klasifikace letiště pocházejí z otevřených dat; podrobnosti stránky odpovídají oficiálním publikacím letiště.',
    mapEmbedKicker: 'Mapa',
    mapEmbedTitle: (name: string) => `Interaktivní mapa — poloha ${name}`,
    mapEmbedEn: 'Interaktivní mapa',
    extMapsNote: 'Zobrazit toto letiště v jiných mapových službách:',
    routeMapKicker: 'Trasy',
    routeMapTitle: (name: string) => `Mapa tras ${name} — přímé destinace`,
    routeMapEn: 'Mapa tras',
    routeMapAria: (name: string) => `Mapa přímých spojení z ${name}`,
    routeLegendTitle: 'Legenda',
    routeLegendClose: 'Skrýt legendu',
    routeReset: 'Obnovit mapu',
    routeZoomIn: 'Přiblížit',
    routeZoomOut: 'Oddálit',
    routeFullscreen: 'Celá obrazovka',
    routeExitFullscreen: 'Ukončit celou obrazovku',
    routeOpenAirport: 'Otevřít stránku letiště {iata}',
    routeTiers: {
      trunk: '6+ aerolinek',
      major: '3–5 aerolinek',
      minor: '2 aerolinky',
      single: '1 aerolinka',
    },
    routeCarriersTpl: '{n} aerolinek',
    routeTableDest: 'Destinace',
    routeTableCountry: 'Země/region',
    routeTableDistance: 'Vzdálenost',
    routeTableCarriers: 'Aerolinky',
    routeCarriersMore: (n: number) => ` +${n} dalších`,
    routeMapNote: (date: string) =>
      `Snímek dat o trasách: ${date}; pouze přímé lety. Zdroj: `,
    legendTerminal: 'Budova terminálu',
    legendTransit: 'Uzel pozemní dopravy',
    legendCorridor: 'Spojení mezi terminály',
    terminalsKicker: 'Terminály',
    terminalsTitle: 'Průvodce terminály',
    terminalsEn: 'Průvodce terminály',
    terminalsSub: (name: string) =>
      `Zóny bran, hlavní aerolinky a vybavení pro každý terminál na ${name}.`,
    transitTitle: 'Pozemní doprava',
    facilitiesTitle: 'Vybavení letiště',
    faqKicker: 'FAQ',
    faqTitle: 'Často kladené otázky',
    faqEn: 'Otázky',
    guideKicker: 'Průvodce',
    guideTitle: 'Průvodce letištěm',
    guideEn: 'Průvodce letištěm',
    blogKicker: 'Články',
    blogTitle: (iata: string) => `Průvodci letištěm ${iata}`,
    blogEn: 'Z blogu',
    blogSub: (iata: string, count: number) =>
      `${count} článků na tomto webu se věnuje ${iata}: přílet, pozemní doprava, zavazadla a přestupy.`,
    blogAll: 'Všechny články',
    relatedTitle: (country: string) => `Další letiště v zemi ${country}`,
    relatedEn: (country: string) => `Více v zemi ${country}`,
    relatedAll: (country: string) => `Všechna letiště v zemi ${country}`,
    flights: {
      kicker: 'Lety',
      title: (name: string) => `Lety do a z ${name} — odlety a přílety`,
      en: 'Letová tabule',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${pluralCs(flights, 'číslo letu', 'čísla letů', 'čísel letů')} u ${pluralCs(
          airlines,
          'aerolinky',
          'aerolinek',
          'aerolinek'
        )} a ${pluralCs(destinations, 'destinace', 'destinací', 'destinací')}, rozděleno podle směru. Čísla codeshare jsou zahrnuta.`,
      statDepartures: 'Čísla odletů',
      statArrivals: 'Čísla příletů',
      statAirlines: 'Aerolinky',
      statDestinations: 'Destinace',
      note: (date: string) =>
        `Čísla letů a trasy z letového indexu aviability.com (snímek ${date}); čísla codeshare jsou zahrnuta a časy odletů se nezobrazují. Zdroj: `,
      source: 'aviability.com',
      tabDepartures: 'Odlety',
      tabArrivals: 'Přílety',
      search: 'Hledat číslo letu, aerolinku nebo město',
      clearSearch: 'Vymazat hledání',
      flight: 'Let',
      airline: 'Aerolinka',
      destination: 'Destinace',
      origin: 'Odkud',
      country: 'Země/region',
      empty: 'Hledání neodpovídá žádný let.',
      loading: 'Načítání letů…',
      error: 'Další lety se nepodařilo načíst.',
      retry: 'Zkusit znovu',
      previous: 'Předchozí',
      next: 'Další',
      pagination: 'Stránkování',
      showing: 'Zobrazeno {from}–{to} z {total} čísel letů',
      pageOf: 'Strana {page} z {pages}',
    },
    notFound: 'Letiště nenalezeno',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Nejnovější mapa tras ${name} (${iata}) ${year} — ${count} přímých destinací`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Mapa přímých spojení z ${name} (${iata}): ${count} destinací s aerolinkami a vzdálenostmi a úplný seznam destinací.`,
    heading: (name: string) => `Mapa tras ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} má ${count} přímých destinací, obarvených podle počtu aerolinek, které je obsluhují.`,
    backToAirport: (iata: string) => `Zpět na stránku letiště ${iata}`,
    flightNumbers: (iata: string) => `Čísla letů ${iata}`,
    openFull: 'Zobrazit mapu tras',
    previewCta: (iata: string) => `Zobrazit celou mapu tras ${iata}`,
    teaserSub: (count: string) => `${count} přímých destinací: mapa, aerolinky a vzdálenosti.`,
    mapSectionTitle: (name: string) => `Mapa přímých spojení z ${name}`,
    tableKicker: (iata: string) => `${iata} · Destinace`,
    tableSectionTitle: (name: string) => `Seznam přímých destinací z ${name}`,
    tableSectionEn: (iata: string) => `Destinace ${iata}`,
    tableToc: 'Destinace',
    tableSectionSub: (count: string) =>
      `${count} destinací, nejrušnější nejdříve podle počtu aerolinek, se vzdáleností a dopravci.`,
    dataKicker: 'Stáhnout',
    dataTitle: 'Stáhnout data o trasách',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} přímých spojení s destinací, kódem IATA, městem, zemí, vzdáleností a aerolinkami — připraveno pro tabulku nebo skript.`,
    dataFields: 'CSV se hodí pro Excel / Numbers, JSON pro kód; oba v UTF-8.',
    dataCsv: 'Stáhnout CSV',
    dataJson: 'Stáhnout JSON',
    airportMapSub:
      'Uspořádání terminálů a bran v kostce — klikněte na obrázek pro celou mapu, vybavení terminálů a pozemní dopravu na stránce letiště.',
    airportMapCta: (iata: string) => `Zobrazit celou mapu terminálu ${iata}`,
    factDestinations: 'Přímé destinace',
    factAirlines: 'Aerolinky',
    factCountries: 'Země',
    factSnapshot: 'Snímek dat',
    faqCountQ: (name: string) => `Kam všude ${name} létá bez mezipřistání?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) má ${count} přímých destinací v ${countries} zemích a územích. Počítají se pouze přímé lety; cesty s přestupem ne.`,
    faqAirlinesQ: (name: string) => `Kolik aerolinek létá z ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} aerolinek provozuje přímé lety z tohoto letiště. Největší sítě mají ${leaders} (počet destinací v závorce).`,
    faqFarthestQ: (name: string) => `Která přímá destinace z ${name} je nejvzdálenější?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Nejvzdálenější přímou destinací je ${city}, ${country} ${iata}, přibližně ${km} km daleko.`,
    faqBusiestQ: () => `Které destinace mají největší konkurenci?`,
    faqBusiestA: (count: string, list: string) =>
      `${count} destinací obsluhují tři nebo více aerolinek; nejrušnější jsou ${list}.`,
    faqSourceQ: () => `Jak často se data o trasách aktualizují?`,
    faqSourceA: (date: string, source: string, license: string) =>
      `Trasy na této stránce pocházejí z otevřeného datasetu ${source} (${license}), jde o snímek z ${date}, nikoli o živý jízdní řád — jízdenky a časy ověřte u aerolinky nebo letiště.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Let ${number} aerolinky ${airline} — ${from} do ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Let ${number} je číslo letu, které používá ${airline} na trase ${from}–${to}${distance ? `, přibližně ${distance}` : ''}. Mapa trasy, letiště odletu a příletu, vzdálenost a další lety na trase.`,
    heading: (number: string) => `Let ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Let ${number} je číslo letu, které používá ${airline} mezi ${from} a ${to}${distance ? `, vzdálenost vzdušnou čarou přibližně ${distance}` : ''}.`,
    factFlight: 'Číslo letu',
    factFrom: 'Z',
    factTo: 'Do',
    factDistance: 'Vzdálenost',
    overviewKicker: 'Přehled',
    overviewTitle: (number: string) => `O letu ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} je číslo letu, které používá ${airline} mezi ${originName} (${originIata}) a ${destName} (${destIata})${distance ? `, přibližně ${distance} od sebe` : ''}. Stránka shrnuje číslo letu, aerolinku, trasu a obě letiště pro rychlé vyhledání.`,
    overviewNote:
      'Letový index neobsahuje časy odletu ani příletu, typy letadel ani dny provozu; jízdní řád, odbavení a boarding ověřte u aerolinky nebo letiště.',
    routeKicker: 'Trasa',
    routeTitle: (from: string, to: string) => `Trasa ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Schéma trasy letu ${number}`,
    routeMapAria: (number: string) => `Mapa trasy letu ${number}`,
    airportsKicker: 'Letiště',
    airportsTitle: 'Letiště odletu a příletu',
    airportsSub:
      'Letiště, která tento let spojuje. Letiště zahrnutá v adresáři otevírají vlastní stránku.',
    originAirport: 'Letiště odletu',
    destinationAirport: 'Letiště příletu',
    airportPage: 'Otevřít stránku letiště',
    detailsKicker: 'Podrobnosti',
    detailsTitle: 'Údaje o letu',
    detailsFlight: 'Číslo letu',
    detailsAirline: 'Aerolinka',
    detailsOrigin: 'Letiště odletu',
    detailsDestination: 'Letiště příletu',
    detailsDistance: 'Vzdálenost vzdušnou čarou',
    detailsRoutes: 'Uvedené trasy',
    detailsSnapshot: 'Snímek dat',
    routesKicker: 'Trasy',
    routesTitle: 'Trasy pod tímto číslem letu',
    routesSub: (count: string) =>
      `Číslo se objevuje na ${count} trasách; jedno číslo může sdílet více codeshare partnerů.`,
    routesRoute: 'Trasa',
    routesAirline: 'Aerolinka',
    routesDistance: 'Vzdálenost',
    relatedKicker: 'Související',
    relatedTitle: 'Další lety na této trase',
    relatedSub: 'Další čísla letů mezi stejným letištěm odletu a příletu.',
    relatedEn: 'Více letů',
    faqKicker: 'FAQ',
    faqTitle: 'Často kladené otázky',
    faqEn: 'Otázky',
    faqWhat: (number: string) => `Co je let ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Let ${number} je číslo letu, které používá ${airline} na trase ${from} → ${to}${distance ? `, přibližně ${distance} od sebe` : ''}.`,
    faqRoute: (number: string) => `Kam let ${number} létá?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Let ${number} létá z ${originName} (${originIata}) do ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Kde jsou časy odletu a příletu ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Stránka uvádí číslo letu, aerolinku, trasu a letiště pro ${number}. Letový index aviability.com neobsahuje časy odletu ani příletu — aktuální jízdní řád ověřte u aerolinky nebo letiště.`,
    note: (date: string) =>
      `Číslo letu, aerolinka a trasa z letového indexu aviability.com (snímek ${date}); časy odletu a příletu nejsou zahrnuty. Zdroj: `,
    source: 'aviability.com',
    sourceFlight: 'Zobrazit na aviability.com',
    viewAirport: (iata: string) => `Otevřít stránku letiště ${iata}`,
    notFound: 'Let nenalezen',
  },

  faq: {
    terminalCount: (name: string) => `Kolik terminálů má ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) má ${terminals} terminálů s celkem ${gates} branami: ${list}.`,
    gateCount: (name: string) => `Kolik bran má ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) má celkem ${gates} bran: ${list}.`,
    whereIs: (iata: string) => `Kde se nachází ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} je kód IATA letiště ${name} (${nameEn}), které se nachází v ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Jak daleko je ${name} od centra ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} je přibližně ${distance} od centra ${city}. Do města se dostanete: ${transit}.`,
    access: (name: string, city: string) => `Jak se dostanu z ${name} do ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Jaké vybavení nabízí ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} nabízí ${facilities}. Rozmístění mezi terminály najdete v uspořádání terminálu výše.`,
    location: (name: string) => `Kde se nachází ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, kód IATA ${iata}) se nachází v ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Které aerolinky obsluhují jednotlivé terminály na ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Hlavní aerolinky podle terminálu na ${name}: ${list}. Aerolinky a přiřazení bran se mění, proto vždy zkontrolujte palubní vstupenku a značení na letišti.`,
    timezone: (name: string) => `V jakém časovém pásmu je ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) je v časovém pásmu ${tz}. Porovnejte s místním časem pomocí hodin letiště výše.`,
    flightsCount: (name: string) => `Kolik čísel letů je uvedeno pro ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Letový index aviability.com uvádí ${pluralCs(
        departures,
        'číslo odletu',
        'čísla odletů',
        'čísel odletů'
      )} a ${pluralCs(arrivals, 'číslo příletu', 'čísla příletů', 'čísel příletů')} pro ${name} (${iata}), zahrnujíc ${pluralCs(
        airlines,
        'aerolinku',
        'aerolinky',
        'aerolinek'
      )} a ${pluralCs(destinations, 'destinaci', 'destinace', 'destinací')} (snímek ${date}). Čísla codeshare jsou zahrnuta a jízdní řády se mohou měnit — před cestou je ověřte u aerolinky.`,
  },

  editorial: {
    authorName: 'Redakční tým World Airport Maps',
    role: 'Sestavili a zkontrolovali ',
    sourcesNote: 'Sestaveno z veřejných zdrojů a oficiálních informací letišť',
  },

  toc: {
    label: 'Na této stránce',
    map: 'Mapa terminálu',
    photos: 'Fotografie letiště',
    time: 'Čas na letišti',
    details: 'Údaje o letišti',
    links: 'Související odkazy',
    location: 'Mapa polohy',
    routes: 'Mapa tras',
    flights: 'Lety',
    guide: 'Průvodce letištěm',
    blog: 'Související průvodci',
    terminals: 'Průvodce terminály',
    transport: 'Pozemní doprava',
    facilities: 'Vybavení',
    faq: 'FAQ',
    flightOverview: 'Přehled letu',
    flightRoute: 'Trasa',
    flightAirports: 'Letiště',
    flightDetails: 'Údaje o letu',
    flightRoutes: 'Všechny trasy',
    flightRelated: 'Související lety',
    intro: 'Přehled letišť',
    distribution: 'Rozmístění letišť',
    airports: 'Seznam letišť',
  },

  error: {
    title: 'Stránku se nepodařilo načíst',
    sub: 'Při čtení dat letiště se něco pokazilo. Zkuste to znovu nebo se vraťte na úvodní stránku.',
    retry: 'Zkusit znovu',
    backHome: 'Zpět na úvodní stránku',
    notFoundTitle: '404 · Stránka nenalezena',
    notFoundSub: 'Požadovaná stránka mohla být přesunuta nebo odstraněna. Zkuste vyhledat letiště nebo pokračujte pomocí odkazů níže.',
  },

  footer: {
    sponsored: 'Sponzorováno',
    mapsTitle: 'Podrobné mapy terminálů',
    mapsBody:
      'Orientace na letištích a jejich terminálech může být náročná. Naše mapy ukazují podrobná uspořádání terminálů, bran, odbavovacích zón, pásů na zavazadla, obchodů, restaurací, salonků a dopravních uzlů, takže cesta probíhá plynuleji.',
    plansTitle: 'Interaktivní půdorysy terminálů',
    plansBody:
      'Velká mezinárodní letiště mají více terminálů a složitá uspořádání. Naše mapy pomáhají najít bránu, vybavení, naplánovat přestup a plynule projít bezpečnostní kontrolou, odlety a přílety.',
    transitTitle: 'Doprava a přístup na letiště',
    transitBody:
      'Kromě uspořádání terminálů pokrýváme možnosti dopravy, parkování a příjezdové trasy — jak se dostat k bráně, přestoupit mezi terminály a využít vlak, autobus, taxík i půjčení auta.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} zemí / regionů · ${airports} letišť · ${terminals} terminálů · ilustrovaná uspořádání terminálů`,
    fallback: 'Ilustrovaná uspořádání terminálů a dopravní průvodci pro letiště po celém světě',
    linksLabel: 'Navigace v zápatí',
    about: 'O nás',
    contact: 'Kontakt',
    sources: 'Zdroje dat',
    privacy: 'Zásady ochrany osobních údajů',
    disclaimer: 'Prohlášení',
    terms: 'Podmínky používání',
  },

  transportModes: csTransportModes as Record<string, string>,

  categories: {
    kicker: 'Procházet',
    title: 'Procházet podle oblasti',
    en: 'Procházet podle oblasti',
    sub: 'Vstupte do adresáře z libovolného úhlu: podle země, regionu, města — nebo přímo k nejrušnějším uzlům, nejnovějším aktualizacím a průvodcům.',
    allAirports: {
      title: 'Všechna letiště',
      body: 'Kompletní adresář seřazený podle osobní dopravy, s filtrem země a možností přeřazení.',
    },
    byCountry: {
      title: 'Podle země',
      body: 'Zjistěte, kolik letišť, terminálů a bran má každá země nebo region.',
    },
    byRegion: {
      title: 'Podle regionu',
      body: 'Země seskupené do východní Asie, Evropy, Severní Ameriky a zbytku světa.',
    },
    popularCities: {
      title: 'Populární města',
      body: 'Nejrušnější letištní města podle celkových ročních cestujících a všechna letiště v každém z nich.',
    },
    recentlyUpdated: {
      title: 'Nedávno aktualizováno',
      body: 'Nově přidané a revidované záznamy letišť, nejnovější první.',
    },
    guides: {
      title: 'Průvodci letišti',
      body: 'Podrobní průvodci přestupy, cestou do města a praktickými tipy.',
    },
    routes: {
      title: 'Mapy tras',
      body: 'Prohlédněte si síť přímých spojení letiště, seřazenou podle počtu destinací, s aerolinkami a vzdálenostmi.',
    },
  },

  guides: {
    kicker: 'Průvodci',
    title: 'Průvodci letišti',
    en: 'Průvodci letišti',
    sub: 'Kromě půdorysů terminálů jsme připravili podrobné průvodce vybranými uzly: jak číst číslování bran, jak přestupovat mezi terminály a jak se dostat do města.',
    more: 'Zobrazit toto letiště',
  },

  blog: {
    kicker: 'Deník',
    title: 'Cestovní poznámky',
    nav: 'Blog',
    en: 'Cestovní poznámky',
    sub: 'Podrobné poznámky naší redakce: přílet a imigrace, přestupy, vybavení terminálů a místa k odpočinku.',
    more: 'Číst',
    all: 'Všechny články',
    morePosts: 'Další články',
    airportsKicker: 'Letiště',
    airportsTitle: 'Letiště v tomto článku',
    airportsEn: 'Zahrnutá letiště',
    airportsSub: 'Otevřete stránku letiště pro mapu terminálu, pozemní dopravu a FAQ.',
    back: 'Zpět na seznam článků',
    empty: 'Zatím žádné články.',
    readingMinutes: (n: number) => `${n} min čtení`,
    source: (name: string) => `Zdroj: ${name}`,
    tags: 'Štítky',
  },

  comments: {
    kicker: 'Komentáře',
    title: 'Komentáře čtenářů',
    en: 'Diskuze',
    sub: 'Otázky, cestovní zážitky i opravy jsou vítány. Komentáře jsou veřejné.',
    formTitle: 'Napsat komentář',
    countOne: '1 komentář',
    countMany: '{n} komentářů',
    empty: 'Zatím žádné komentáře — buďte první.',
    loading: 'Načítání komentářů…',
    loadError: 'Komentáře jsou momentálně nedostupné.',
    retry: 'Zkusit znovu',
    nameLabel: 'Jméno',
    namePlaceholder: 'Jak vás máme oslovovat?',
    bodyLabel: 'Komentář',
    bodyPlaceholder: 'Podělte se o zkušenost, položte otázku nebo doplňte kontext…',
    submit: 'Odeslat komentář',
    submitting: 'Odesílání…',
    success: 'Odesláno — děkujeme za sdílení.',
    error: 'Komentář se nepodařilo odeslat. Zkuste to později.',
    rateLimited: 'To bylo příliš rychlé. Počkejte několik minut a zkuste to znovu.',
    nameError: 'Zadejte jméno (2–40 znaků).',
    bodyError: 'Napište komentář (5–2000 znaků).',
    note: 'Komentáře jsou veřejné a vyjadřují názory jejich autorů. Buďte slušní a nepřidávejte reklamy ani osobní údaje.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Uspořádání terminálu ${name}`,
    gates: 'Brány',
    terminal: 'Terminál',
    corridor: 'Spojení',
    transit: 'Pozemní doprava',
    footer: (iata: string) => `${iata} · Uspořádání terminálu`,
  },

  tool: {
    label: 'Online nástroje',
    hub: {
      kicker: 'Nástroje',
      title: 'Mapové a souřadnicové nástroje',
      en: 'Bezplatné nástroje',
      sub: 'Bezplatné online nástroje pro cestovatele a milovníky geografie — běží v prohlížeči, nic se neinstaluje.',
      description:
        'Bezplatné mapové a souřadnicové nástroje online: převod WGS84 / GCJ02 / BD09, desetinné stupně ↔ DMS a vzdálenost vzdušnou čarou mezi dvěma body. Dvojjazyčné, přímo v prohlížeči.',
      comingTitle: 'Další nástroje v přípravě',
      comingSub: 'Výběr souřadnic na mapě, sdílení polohy a projekční kalkulačky jsou na cestě.',
    },
    howTitle: 'Jak používat',
    relatedTitle: 'Související nástroje',
    allTools: 'Všechny nástroje',
    tools: {
      coordinateConverter: {
        title: 'Převodník souřadnic',
        en: 'Převodník souřadnic',
        description:
          'Převádějte mezi WGS84, GCJ02 a BD09 — řešení problému posunu map v Číně.',
        note: 'WGS84 je standard GPS a mezinárodní standard. GCJ02 je posunutý souřadnicový systém povinný v pevninské Číně (přezdívaný „marťanské souřadnice“), který používají AMap a Tencent Maps. BD09 přidává další posun nad GCJ02 a používá ho Baidu Maps. Stejné místo se může mezi systémy lišit o 100–700 m, proto před opětovným použitím souřadnic v jiné mapové službě převádějte.',
        steps: [
          'Zadejte desetinné souřadnice jako zeměpisná šířka, délka — např. 39.9042, 116.4074.',
          'Vyberte souřadnicový systém vstupu.',
          'Klikněte na „Převést“ pro zbývající dva systémy; pomocí „Kopírovat“ výsledek uložíte.',
        ],
        inputLabel: 'Souřadnice (zeměpisná šířka, délka)',
        inputPlaceholder: 'např. 39.9042, 116.4074',
        sourceLabel: 'Souřadnicový systém vstupu',
        wgs84: 'WGS84 · GPS / mezinárodní',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Desetinná místa',
        submit: 'Převést',
        copy: 'Kopírovat',
        copied: 'Zkopírováno',
        error: 'Souřadnice se nepodařilo přečíst. Použijte formát „zeměpisná šířka, délka“, např. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Převodník formátu souřadnic',
        en: 'Převodník formátu souřadnic',
        description:
          'Převádějte mezi desetinnými stupni (DD), stupni-minutami (DM) a stupni-minutami-sekundami (DMS); vstupní formát se rozpozná automaticky.',
        note: 'DD (39.9042°) je běžný desetinný formát zařízení a API; DMS (39°54′15″N) je obvyklý v námořnictví, letectví a geodézii; DM (39°54.25′N) je typický pro terénní poznámky. Nástroj rozpozná vstupní formát podle počtu skupin číslic v každé polovině (1 = DD, 2 = DM, 3 = DMS) a zobrazí všechny tři formáty s N/S/E/W pro polokoule.',
        steps: [
          'Zadejte dvojici souřadnic — 39.9042, 39°54′15″N i 39°32.5′E fungují; obě poloviny oddělte čárkou.',
          'Vyberte počet desetinných míst výstupu.',
          'Klikněte na „Převést“ — zobrazí se všechny tři formáty; pomocí „Kopírovat“ jeden uložíte.',
        ],
        inputLabel: 'Souřadnice (jedna dvojice, oddělená čárkou)',
        inputPlaceholder: 'např. 39°54′15″N, 116°24′51″E nebo 39.9042, 116.4074',
        precisionLabel: 'Desetinná místa',
        submit: 'Převést',
        ddLabel: 'Desetinné stupně (DD)',
        dmLabel: 'Stupně-minuty (DM)',
        dmsLabel: 'Stupně-minuty-sekundy (DMS)',
        copy: 'Kopírovat',
        copied: 'Zkopírováno',
        error: 'Souřadnice se nepodařilo přečíst. Podporované formáty zahrnují 39.9042, 39°54′15″N a 39°32.5′E, oddělené čárkou.',
      },
      distanceCalculator: {
        title: 'Kalkulačka vzdálenosti',
        en: 'Kalkulačka vzdálenosti',
        description:
          'Vzdálenost vzdušnou čarou mezi dvěma body na Zemi a počáteční azimut.',
        note: 'Vzdálenost počítá Haversinova formule pro velkou kružnici (střední poloměr Země 6371,0088 km) — nejkratší cestu po povrchu. Počáteční azimut je kompasový směr od prvního bodu k druhému, 0° na severu, rostoucí po směru hodinových ručiček.',
        steps: [
          'Zadejte zeměpisnou šířku a délku počátečního a koncového bodu.',
          'Klikněte na „Vypočítat vzdálenost“.',
          'Získáte výsledek v kilometrech, mílích a námořních mílích a počáteční azimut.',
        ],
        fromLabel: 'Z',
        toLabel: 'Do',
        inputPlaceholder: 'zeměpisná šířka, délka',
        example: 'Příklad: Peking → Šanghaj',
        submit: 'Vypočítat vzdálenost',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Počáteční azimut',
        copy: 'Kopírovat',
        copied: 'Zkopírováno',
        error: 'Souřadnice se nepodařilo přečíst. Použijte formát „zeměpisná šířka, délka“ se šířkou -90–90 a délkou -180–180.',
      },
    },
  },
};
