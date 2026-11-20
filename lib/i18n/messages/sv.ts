import type { Messages } from './zh';
import { svTransportModes } from '../sv-data';

/** Flygplatsklass för inledningsmeningen (schema.orgs airport-typ). */
const AIRPORT_KIND = {
  large: 'stor flygplats',
  medium: 'medelstor flygplats',
  small: 'liten flygplats',
  heliport: 'helikopterflygplats',
} as const;

/** "1 terminal" / "2 terminaler" för redan formaterade antal. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * Svensk katalog. Typad mot den kinesiska källan (`Messages`), så en saknad
 * eller omdöpt nyckel får bygget att fallera.
 */
export const sv: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Flygplats- och terminalkartor',
    description:
      'Bläddra bland terminalkartor över flygplatser, ordnade efter land och region. Från stora internationella nav till regionala flygplatser: se detaljerade layouter för gater, incheckningsområden, bagageband, butiker, restauranger, lounger och marktransport.',
    keywords: [
      'flygplatskartor',
      'terminalkartor',
      'flygplatsens terminalutformning',
      'gates',
      'flygplatstransport',
      'flygplatsguide',
    ],
    numberOfItems: (n: number) => `${n} flygplats${n === 1 ? '' : 'er'}`,
  },

  nav: {
    home: 'Hem',
    airports: 'Alla flygplatser',
    countries: 'Efter land',
    tools: 'Onlineverktyg',
    about: 'Om oss',
    label: 'Huvudnavigering',
    languageLabel: 'Språk',
    switchLanguage: 'Byt språk',
    languagePlanned: 'Under förberedelse',
    languagePlannedHint: 'Den här språkversionen är inte publicerad än.',
    themeToggle: 'Växla mörkt läge',
    menu: 'Meny',
  },

  common: {
    advertisement: 'Annons',
    skipToContent: 'Hoppa till huvudinnehållet',
    backToTop: 'Tillbaka till toppen',
    breadcrumbLabel: 'Brödsmulor',
    home: 'Hem',
    viewMap: 'Visa karta',
    terminalMap: 'Terminalkarta',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} terminal${counts.terminals === 1 ? '' : 'er'}${
            counts.gates > 0 ? `, ${counts.gates} gate${counts.gates === 1 ? '' : 's'}` : ''
          } — Terminalkarta`
        : `${name} (${iata}) — karta och flygplatsguide ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} terminalkarta` : name,
    airportGuide: 'Flygplatsguide',
    lastUpdated: 'Nyligen uppdaterad',
    updatedOn: (date: string) => `Uppdaterad ${date}`,
    publishedOn: (date: string) => `Publicerad ${date}`,
    readMore: 'Läs hela guiden',
  },

  units: {
    terminalsFact: 'Terminaler',
    gatesFact: 'Gates',
    terminals: (n: number) => `${n} terminal${n === 1 ? '' : 'er'}`,
    terminalsShort: (n: number) => `${n} terminal${n === 1 ? '' : 'er'}`,
    gates: (n: number) => `${n} gate${n === 1 ? '' : 's'}`,
    airports: (n: number) => `${n} flygplats${n === 1 ? '' : 'er'}`,
    airportsChip: (n: number) => `${n} flygplats${n === 1 ? '' : 'er'}`,
    pax: 'Passagerare',
    paxFull: 'Passagerare per år',
    distance: 'Till centrum',
    distanceFrom: (city: string) => `Från centrala ${city}`,
    gatesLabel: (range: string) => `Gates ${range}`,
    gatesCount: (n: number) => `${n} gates`,
    satellite: 'Satellitterminal',
    airlinesLabel: 'Huvudflygbolag: ',
  },

  search: {
    ariaLabel: 'Sök flygplatser',
    placeholder: 'Sök flygplatser, städer eller IATA-koder',
    heroPlaceholder: 'Sök på flygplatsnamn, stad eller IATA-kod — t.ex. LHR / Dubai / Heathrow',
    submit: 'Hitta flygplats',
    loading: 'Söker…',
    empty: 'Inga matchande flygplatser hittades',
    resultsTitle: (term: string) => `Sökresultat för “${term}”`,
    resultsCount: (n: number) => `${n} matchande flygplats${n === 1 ? '' : 'er'} hittades.`,
    noResults: 'Inga flygplatser matchade. Prova ett annat sökord, till exempel ett stadsnamn eller en IATA-kod.',
    noResultsHint: 'Hittar du inte flygplatsen du söker?',
    viewAll: (n: number) => `Visa alla ${n} flygplatser`,
    orBrowseByCountry: 'eller bläddra efter land',
    range: (from: number, to: number, total: number) =>
      `Visar ${from}–${to} av ${total} flygplatser`,
  },

  hero: {
    eyebrow: 'Världens flygplatsregister',
    titleLead: 'Utforska flygplatser och',
    titleAccent: 'terminalkartor',
    sub: 'Hitta rätt på vilken flygplats som helst med vår kompletta samling flygplats- och terminalkartor, ordnade efter land och region — från stora internationella nav till regionala flygplatser.',
    stats: {
      countries: 'Länder / regioner',
      airports: 'Flygplatser',
      terminals: 'Terminalkartor',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Om webbplatsen',
      imageAlt: 'Ett passagerarflygplan vid gaten på en flygplats med glasfasad i soluppgång',
      blocks: [
        {
          title: 'Hitta rätt på vilken flygplats som helst med detaljerade terminalkartor',
          body: 'Det kan vara svårt att navigera på flygplatser och terminaler runt om i världen. Våra överskådliga flygplatskartor visar detaljerade layouter för terminaler, gater, incheckningsområden, bagageband, butiker, restauranger, lounger och transportnav, så att du kan planera vägen innan du ger dig av.',
        },
        {
          title: 'Interaktiva terminalkartor och planlösningar',
          body: 'Stora internationella flygplatser har flera terminaler och komplexa layouter. Våra detaljerade kartor hjälper dig att hitta gater, lokalisera faciliteter, planera byten och röra dig effektivt genom säkerhetskontroller, avgångshallar och ankomsthallar — utan att gå tillbaka.',
        },
        {
          title: 'Transport till och från flygplatsen',
          body: 'Utöver terminallayouter täcker våra flygplatsguider transportalternativ, parkering och tillfartsvägar. Hitta det bästa sättet att nå din gate, byta mellan terminaler och använda marktransport som tåg, buss, taxi och hyrbil.',
        },
      ],
    },
    map: {
      kicker: 'Världskarta',
      title: 'Flygplatskarta',
      en: 'Flygplatskarta',
      sub: (airports: string, world: string) =>
        `Lokalisera ${world} flygplatser med linjetrafik världen över — ${airports} av dem har en terminalkarta här. Klicka på en punkt för land eller region och detaljer.`,
      all: 'Alla',
      gEurope: 'Europa',
      gAsia: 'Asien',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Oceanien',
      legendSite: 'Med här · klicka för terminalkartor',
      legendWorld: 'Övriga flygplatser med linjetrafik världen över',
      countTemplate: '{n} flygplatser visas',
      download: 'Ladda ner data',
      downloadTitle: 'Exportera alla flygplatser i aktuellt filter som CSV (IATA, namn, stad, land, koordinater)',
      openAirport: 'Visa flygplats',
    },
    popular: {
      kicker: 'Terminalkartor',
      title: 'Populära flygplatskartor',
      en: 'Flygplatskartor',
      sub: 'Ett urval terminalkartor från stora flygplatser världen över — öppna en flygplatssida för hela kartan.',
    },
    recent: {
      kicker: 'Nyligen publicerat',
      title: 'Nyligen uppdaterat',
      en: 'Nyligen uppdaterat',
      sub: 'Nya och reviderade flygplatser, länder och reseguider.',
      countriesTitle: 'Nyligen uppdaterade länder',
    },
    routes: {
      kicker: 'Rutter',
      title: 'Flitigast flygplatsrutter',
      en: 'Ruttkartor',
      sub: 'Flygplatser rangordnade efter antal platser de flyger till utan mellanlandning — öppna en för ruttkarta, flygbolag och destinationslista.',
      collection: 'Ruttsamlingen',
      tabsLabel: 'Ruttkartor per stad',
      explore: (city: string) => `Utforska ${city}`,
      play: 'Starta bildspelet',
      pause: 'Pausa bildspelet',
    },
    photos: {
      kicker: 'Senaste foton',
      title: 'Senaste flygplatsfoton',
      en: 'Senaste foton',
      sub: 'De senast tillagda flygplatsfotona — de sex nyaste flygplatserna, ett foto var.',
      ariaLabel: 'Karusell med senaste flygplatsfoton',
      prev: 'Föregående foto',
      next: 'Nästa foto',
      play: 'Starta bildspelet',
      pause: 'Pausa bildspelet',
      counter: (index: number, total: number) => `Foto ${index} av ${total}`,
      view: (name: string) => `Visa kartan för ${name}`,
      open: 'Öppna flygplatssidan',
    },
    countries: {
      kicker: 'Efter land',
      title: 'Flygplatskartor efter land',
      en: 'Länder',
      sub: 'Bläddra bland terminalkartor ordnade efter land och region, från stora internationella nav till regionala flygplatser.',
      more: 'Alla länder',
    },
    all: {
      kicker: 'Alla kartor',
      title: 'Alla flygplatskartor',
      en: 'Alla flygplatser',
      sub: 'Flygplatskartor för världens mest trafikerade flygplatser och reseknutpunkter.',
      hint: 'Välj en flygplats för att se terminalutformningen.',
      more: 'Visa alla',
    },
    facts: {
      kicker: 'Registerdata',
      title: 'Flygplatsdata i korthet',
      en: 'Listor och tabeller',
      sub: 'Registrets siffror som listor och tabeller: täckning, de mest trafikerade flygplatserna med publicerade passagerarsiffror och den regionala fördelningen.',
      note: (pax: string, detailed: string, total: string) =>
        `Passagerarsiffror täcker ${pax} av ${total} flygplatser; terminal- och gatesiffror täcker ${detailed} av ${total}. Terminalantalen följer registrets egen gruppering och kan omfatta pirer.`,
      coverageTitle: 'Täckningssiffror',
      coverage: {
        airports: 'Flygplatser',
        countries: 'Länder och regioner',
        regions: 'Registerregioner',
        cities: 'Unika stadsnamn',
        terminals: 'Terminaler',
        gates: 'Gates',
        routes: 'Flygplatser med ruttkarta',
      },
      busiest: {
        title: 'Flitigast flygplatser efter årliga passagerare',
        sub: 'De tolv mest trafikerade flygplatserna bland dem med publicerade årliga passagerarsiffror.',
        caption: 'Flygplatser med publicerade årliga passagerarsiffror, rangordnade',
        rank: 'Rang',
        iata: 'IATA',
        airport: 'Flygplats',
        city: 'Stad',
        country: 'Land',
        terminals: 'Terminaler',
        gates: 'Gates',
        pax: 'Årliga passagerare (milj.)',
      },
      regions: {
        title: 'Flygplatser efter registerregion',
        sub: 'Antal flygplatser, terminaler och gater grupperade efter registrets egna regionetiketter; vissa länder och territorier tillhör två regioner.',
        caption: 'Flygplatsantal grupperade efter registerregion',
        region: 'Region',
        airports: 'Flygplatser',
        detailed: 'Med detaljerad data',
        terminals: 'Terminaler',
        gates: 'Gates',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Flygplats',
    city: 'Stad',
    country: 'Land',
    size: 'Storlek',
    map: 'Karta',
    empty: 'Inga flygplatser matchar filtren. Försök bredda urvalet.',
  },

  pager: {
    label: 'Paginering',
    previous: 'Föregående sida',
    next: 'Nästa sida',
  },

  filters: {
    searchPlaceholder: 'Sök flygplatser, städer eller IATA-koder',
    submit: 'Sök',
    country: 'Land',
    all: 'Alla',
    sort: 'Sortera',
    sortPax: 'Passagerare',
    sortName: 'Namn',
    sortIata: 'IATA-kod',
    sortUpdated: 'Senast uppdaterad',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Alla flygplatskartor för ${country}${sortLabel ? ` — sorterade efter ${sortLabel}` : ''}`
        : `Alla flygplatskartor — sorterade efter ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Varje flygplatskarta för ${country} på en sida: terminallayouter, gateområden och marktransport${sortLabel ? `, ordnade efter ${sortLabel}` : ''}.`
        : `Hela flygplatsregistret på en sida: terminallayouter, gateområden och marktransport${sortLabel ? `, ordnade efter ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Bläddra bland flygplatser efter land',
    description:
      'Bläddra i det globala registret med terminalkartor efter land och region. Från stora internationella nav till regionala flygplatser: se hur många flygplatser och terminaler varje land har.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Från stora internationella nav till regionala flygplatser — ${countries} länder och regioner, ${airports} flygplatser och ${terminals} terminaler totalt.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} land${countries === 1 ? '' : 'er'} · ${airports} flygplats${airports === 1 ? '' : 'er'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} flygplatskarta — alla ${count} flygplatser` : `Flygplatskartor för ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} har ${total} flygplatser med linjetrafik; ${count} av dem har en guidesida här, med spridningskarta, fullständig nationslista och direktlinjer.`
        : `Terminalkartor för ${count} flygplats${count === 1 ? '' : 'er'} i ${name} (${nameEn}), med de viktigaste internationella nav och regionala flygplatser som ${region} har. Se gater, terminallayouter och marktransport.`,
    chip: (nameEn: string) => `FLYGPLATSER I ${nameEn.toUpperCase()}`,
    kicker: 'Flygplatskartor',
    titleOf: (name: string) => `Flygplatser i ${name}`,
    en: 'Flygplatser',
    sub: 'Välj en flygplats för att se terminalutformning, gateområden och transportalternativ.',
    empty: 'Inga flygplatser är listade för detta land eller denna region än.',
    moreKicker: 'Andra länder',
    moreTitle: 'Bläddra bland andra länder',
    moreEn: 'Fler länder',
    all: 'Alla länder',
    notFound: 'Landet hittades inte',
    introKicker: 'Översikt',
    introTitle: (name: string) => `Flygplatsöversikt för ${name}`,
    introEn: 'Flygplatsöversikt',
    introSub:
      'Omfattningen av flygplatserna i detta land eller denna region, dess viktigaste nav och de städer de betjänar.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} ligger i ${o.region}. Den här webbplatsen täcker ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` och ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) är störst sett till årliga passagerare, med ${o.busiestPax}.`
        : '') +
      ` Flygplatserna betjänar bland annat ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Varje flygplatssida har en lägeskarta och flygplatskoder, plus de terminal-, gate- och transportuppgifter som sammanställts för flygplatsen.',
    distribution: {
      kicker: 'Spridning',
      title: (name: string) => `Spridningskarta över flygplatser i ${name}`,
      en: 'Flygplatsspridning',
      sub: (covered: string, total: string) =>
        `${total} flygplatser med linjetrafik i hela landet (stora, medelstora och små); ${covered} av dem har en guidesida här. Hela listan följer nedan.`,
      mapAlt: (name: string, total: string) =>
        `Spridningskarta över flygplatser i ${name}: ${total} flygplatser med linjetrafik`,
      siteTag: 'Med här',
      colAirport: 'Flygplats',
      colCity: 'Stad',
      colType: 'Typ',
      types: {
        large: 'Stor',
        medium: 'Medelstor',
        small: 'Liten',
      },
      empty: 'Ingen nationell flygplatslista finns än.',
    },
    linksTitle: 'Relaterade länkar',
    linksEn: 'Relaterade länkar',
    linksSub: 'Officiella webbplatser och uppslagsverk för landet och var och en av dess flygplatser.',
    linksCountry: (name: string) => `Referens om ${name}`,
    linksAirports: (name: string) => `Flygplatser i ${name}`,
    faqKicker: 'Vanliga frågor',
    faqTitle: 'Vanliga frågor',
    faqEn: 'Frågor',
    faq: {
      airportTotal: (name: string) => `Hur många flygplatser finns det i ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} har ${total} flygplatser med passagerarlinjetrafik (stora, medelstora och små); den här webbplatsen täcker ${covered} av dem i detalj. Se spridningskartan och hela listan ovan.`,
      airportCount: (name: string) => `Vilka flygplatser täcks i ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Den här webbplatsen täcker ${count} i ${name}: ${list}.`,
      busiest: (name: string) => `Vilken är den mest trafikerade flygplatsen i ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Sett till årliga passagerare är ${busiest} (${iata}) störst bland flygplatserna som täcks här, med ${pax}.`,
      terminals: (name: string) => `Hur många terminaler har flygplatserna i ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Flygplatserna som täcks i ${name} har ${terminals} med totalt ${gates}: ${list}.`,
      cities: (name: string) => `Vilka städer i ${name} har flygplats?`,
      citiesAnswer: (name: string, cities: string) =>
        `Flygplatserna i ${name} som täcks här betjänar bland annat ${cities}. Du kan filtrera dem efter stad eller IATA-kod i flygplatsregistret.`,
      maps: (name: string) => `Har flygplatserna i ${name} terminalkartor?`,
      mapsAnswer: (name: string, count: string) =>
        `Några av dem. Flygplatssidor har en lägeskarta, flygplatskoder och direktlinjer, och de ${count} som täcks i ${name} visar terminalutformning, gateområden och marktransport där uppgifterna är sammanställda. Öppna en flygplats för att se vad som finns.`,
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
        ? `${o.name} (${o.iata}) har ${o.terminals} terminal${o.terminals === '1' ? '' : 'er'}${
            o.gates ? ` med ${o.gates} gate${o.gates === '1' ? '' : 's'}` : ''
          }${o.pax ? `, med ${o.pax} passagerare per år` : ''}${
            o.distance ? `, ${o.distance} från stadskärnan` : ''
          }. Terminalkarta med alla terminaler, gateområden och marktransport.`
        : `${o.name} (${o.iata}) betjänar ${o.city}, ${o.country}. Lägeskarta, flygplatskoder och reseinformation.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'flygplats';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) är en ${kind} som betjänar ${where}`;
      return o.terminals > 0
        ? `${head}, med ${o.terminals} terminal${o.terminals === 1 ? '' : 'er'}${
            o.gates > 0 ? ` och ${o.gates} gate${o.gates === 1 ? '' : 's'}` : ''
          }${o.distance ? `, cirka ${o.distance} från centrala ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Terminalutformning`,
    mapNote: 'TERMINALUTFORMNING',
    realMapTitle: (iata: string) => `${iata} terminalkarta — gater och navigering`,
    mapAlt: (name: string, iata: string) =>
      `Terminalkarta för ${name} (${iata}) med alla terminaler, gateområden och pirer`,
    realMapNote: 'TERMINALKARTA',
    photosKicker: 'Foton',
    photosTitle: 'Flygplatsfoton',
    photosEn: 'Flygplatsfoton',
    photosSub:
      'Riktiga foton av flygplatsen, var och en med källhänvisning till den offentliga webbsida de hittades på; upphovsrätten stannar hos fotograferna. Klicka på ett foto för att förstora, eller på källraden för att öppna källsidan.',
    photosCredit: (host: string) => `Källa: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Flygplatsfoto ${index} av ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Förstora foto ${index} av ${name}`,
    zoomLabel: 'Zooma',
    zoomClose: 'Stäng',
    zoomIn: 'Zooma in',
    zoomOut: 'Zooma ut',
    downloadKicker: 'Ladda ner',
    downloadTitle: 'Ladda ner flygplatskartor',
    downloadEn: 'Nedladdningar',
    downloadMapLabel: (year: number, iata: string) =>
      `Senaste terminalkarta och planlösning för ${iata} ${year} att ladda ner`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Senaste terminalkarta för ${iata} ${year} som PDF`,
    timeKicker: 'Tid',
    timeTitle: (iata: string) => `Tidsinformation för flygplatsen — aktuell tid i ${iata}`,
    timeEn: 'Flygplatstid',
    timeSub: (iata: string, tz: string) => `Aktuell tid i ${iata} (${tz}) jämfört med din lokala tid.`,
    clockAirport: 'Aktuell flygplatstid',
    clockLocal: 'Din lokala tid',
    infoKicker: 'Info',
    infoTitle: 'Flygplatsinformation och detaljer',
    infoEn: 'Flygplatsuppgifter',
    infoIata: 'Flygplatsens IATA-kod',
    infoLocation: 'Flygplatsens läge',
    infoCoords: 'Koordinater',
    infoTimezone: 'Tidszon',
    linksKicker: 'Länkar',
    linksTitle: 'Relaterade länkar',
    linksEn: 'RELATERADE LÄNKAR',
    linksSub: 'Externa referenser för flygplatsen: officiell webbplats, Wikipedia och Baidu Baike.',
    officialSite: 'Officiell webbplats',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Källor: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Öppna data från OurAirports',
    sourcesNote:
      'Flygplatskoder, koordinater och flygplatsklass är sammanställda från öppna data; sidans detaljer följer flygplatsens officiella publikationer.',
    mapEmbedKicker: 'Karta',
    mapEmbedTitle: (name: string) => `Interaktiv karta — ${name}s läge`,
    mapEmbedEn: 'Interaktiv karta',
    extMapsNote: 'Visa flygplatsen på andra karttjänster:',
    routeMapKicker: 'Rutter',
    routeMapTitle: (name: string) => `Ruttkarta för ${name} — direkta destinationer`,
    routeMapEn: 'Ruttkarta',
    routeMapAria: (name: string) => `Karta över direktlinjer från ${name}`,
    routeLegendTitle: 'Teckenförklaring',
    routeLegendClose: 'Dölj teckenförklaringen',
    routeReset: 'Återställ kartan',
    routeZoomIn: 'Zooma in',
    routeZoomOut: 'Zooma ut',
    routeFullscreen: 'Visa i fullskärm',
    routeExitFullscreen: 'Lämna fullskärm',
    routeOpenAirport: 'Öppna flygplatssidan för {iata}',
    routeTiers: {
      trunk: '6+ flygbolag',
      major: '3–5 flygbolag',
      minor: '2 flygbolag',
      single: '1 flygbolag',
    },
    routeCarriersTpl: '{n} flygbolag',
    routeTableDest: 'Destination',
    routeTableCountry: 'Land/region',
    routeTableDistance: 'Avstånd',
    routeTableCarriers: 'Flygbolag',
    routeCarriersMore: (n: number) => ` +${n} till`,
    routeMapNote: (date: string) =>
      `Ögonblicksbild av ruttdata: ${date}; endast direktflyg. Källa: `,
    legendTerminal: 'Terminalbyggnad',
    legendTransit: 'Nav för marktransport',
    legendCorridor: 'Förbindelse mellan terminaler',
    terminalsKicker: 'Terminaler',
    terminalsTitle: 'Terminalguide',
    terminalsEn: 'Terminalguide',
    terminalsSub: (name: string) =>
      `Gateområden, viktigaste flygbolag och faciliteter för varje terminal på ${name}.`,
    transitTitle: 'Marktransport',
    facilitiesTitle: 'Flygplatsfaciliteter',
    faqKicker: 'Vanliga frågor',
    faqTitle: 'Vanliga frågor',
    faqEn: 'Frågor',
    guideKicker: 'Guide',
    guideTitle: 'Flygplatsguide',
    guideEn: 'Flygplatsguide',
    blogKicker: 'Artiklar',
    blogTitle: (iata: string) => `Flygplatsguider för ${iata}`,
    blogEn: 'Från bloggen',
    blogSub: (iata: string, count: number) =>
      `${count} artiklar på webbplatsen behandlar ${iata}: ankomst, marktransport, bagage och byten.`,
    blogAll: 'Alla artiklar',
    relatedTitle: (country: string) => `Andra flygplatser i ${country}`,
    relatedEn: (country: string) => `Mer i ${country}`,
    relatedAll: (country: string) => `Alla flygplatser i ${country}`,
    flights: {
      kicker: 'Flyg',
      title: (name: string) => `Flyg till och från ${name} — avgångar och ankomster`,
      en: 'Flygtavla',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'flygnummer', 'flygnummer')} hos ${plural(
          airlines,
          'flygbolag',
          'flygbolag'
        )} och ${plural(destinations, 'destination', 'destinationer')}, uppdelat efter riktning. Codeshare-nummer ingår.`,
      statDepartures: 'Avgångsnummer',
      statArrivals: 'Ankomstnummer',
      statAirlines: 'Flygbolag',
      statDestinations: 'Destinationer',
      note: (date: string) =>
        `Flygnummer och rutter från aviability.coms flygindex (ögonblicksbild ${date}); codeshare-nummer ingår och inga avgångstider visas. Källa: `,
      source: 'aviability.com',
      tabDepartures: 'Avgångar',
      tabArrivals: 'Ankomster',
      search: 'Sök flygnummer, flygbolag eller stad',
      clearSearch: 'Rensa sökningen',
      flight: 'Flyg',
      airline: 'Flygbolag',
      destination: 'Destination',
      origin: 'Ursprung',
      country: 'Land/region',
      empty: 'Inga flyg matchar sökningen.',
      loading: 'Laddar flyg…',
      error: 'Det gick inte att ladda fler flyg.',
      retry: 'Försök igen',
      previous: 'Föregående',
      next: 'Nästa',
      pagination: 'Paginering',
      showing: 'Visar {from}–{to} av {total} flygnummer',
      pageOf: 'Sida {page} av {pages}',
    },
    notFound: 'Flygplatsen hittades inte',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Senaste ruttkarta för ${name} (${iata}) ${year} — ${count} direkta destinationer`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Karta över direktlinjer från ${name} (${iata}): ${count} destinationer med flygbolag och avstånd, plus hela destinationslistan.`,
    heading: (name: string) => `Ruttkarta för ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} har ${count} direkta destinationer, färgade efter hur många flygbolag som trafikerar dem.`,
    backToAirport: (iata: string) => `Tillbaka till flygplatssidan för ${iata}`,
    flightNumbers: (iata: string) => `Flygnummer för ${iata}`,
    openFull: 'Visa ruttkarta',
    previewCta: (iata: string) => `Visa hela ruttkartan för ${iata}`,
    teaserSub: (count: string) => `${count} direkta destinationer: karta, flygbolag och avstånd.`,
    mapSectionTitle: (name: string) => `Karta över direktlinjer från ${name}`,
    tableKicker: (iata: string) => `${iata} · Destinationer`,
    tableSectionTitle: (name: string) => `Direkta destinationer från ${name}`,
    tableSectionEn: (iata: string) => `Destinationer från ${iata}`,
    tableToc: 'Destinationer',
    tableSectionSub: (count: string) =>
      `${count} destinationer, mest trafikerade först efter antal flygbolag, med avstånd och flygbolag.`,
    dataKicker: 'Ladda ner',
    dataTitle: 'Ladda ner ruttdata',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} direktlinjer med destination, IATA-kod, stad, land, avstånd och flygbolag — redo för ett kalkylark eller skript.`,
    dataFields: 'CSV passar Excel / Numbers, JSON passar kod; båda är UTF-8.',
    dataCsv: 'Ladda ner CSV',
    dataJson: 'Ladda ner JSON',
    airportMapSub:
      'Terminal- och gateutformning i korthet — klicka på bilden för hela kartan, terminalfaciliteter och marktransport på flygplatssidan.',
    airportMapCta: (iata: string) => `Se hela terminalkartan för ${iata}`,
    factDestinations: 'Direkta destinationer',
    factAirlines: 'Flygbolag',
    factCountries: 'Länder',
    factSnapshot: 'Dataögonblick',
    faqCountQ: (name: string) => `Hur många platser flyger ${name} till utan mellanlandning?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) har ${count} direkta destinationer i ${countries} länder och territorier. Endast direktlinjer räknas; resor med mellanlandning ingår inte.`,
    faqAirlinesQ: (name: string) => `Hur många flygbolag flyger från ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} flygbolag trafikerar direktlinjer från flygplatsen. De största näten är ${leaders} (antal destinationer inom parentes).`,
    faqFarthestQ: (name: string) => `Vilken är den längsta direkta destinationen från ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Den längsta direkta destinationen är ${city}, ${country} ${iata}, cirka ${km} km bort.`,
    faqBusiestQ: () => 'Vilka destinationer har mest konkurrens?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinationer trafikeras av tre eller fler flygbolag; de mest trafikerade är ${list}.`,
    faqSourceQ: () => 'Hur ofta uppdateras ruttdata?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Rutterna på sidan kommer från ${source}s öppna dataset (${license}), en ögonblicksbild från ${date} och inte en live-tidtabell — kontrollera biljetter och tider hos flygbolaget eller flygplatsen.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Flyg ${number} med ${airline} — ${from} till ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flyg ${number} är ett flygnummer som används av ${airline} från ${from} till ${to}${distance ? `, cirka ${distance}` : ''}. Ruttkarta, avgångs- och ankomstflygplats, avstånd och andra flyg på rutten.`,
    heading: (number: string) => `Flyg ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flyg ${number} är ett flygnummer som används av ${airline} mellan ${from} och ${to}${distance ? `, ett storcirkelavstånd på cirka ${distance}` : ''}.`,
    factFlight: 'Flygnummer',
    factFrom: 'Från',
    factTo: 'Till',
    factDistance: 'Avstånd',
    overviewKicker: 'Översikt',
    overviewTitle: (number: string) => `Om flyg ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} är ett flygnummer som används av ${airline} mellan ${originName} (${originIata}) och ${destName} (${destIata})${distance ? `, cirka ${distance} från varandra` : ''}. Sidan samlar flygnummer, flygbolag, rutt och de två flygplatserna för snabb uppslagning.`,
    overviewNote:
      'Flygindexet innehåller inga avgångs- eller ankomsttider, flygplanstyper eller trafikdagar; kontrollera tidtabell, incheckning och boarding hos flygbolaget eller flygplatsen.',
    routeKicker: 'Rutt',
    routeTitle: (from: string, to: string) => `Rutt ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Ruttdiagram för flyg ${number}`,
    routeMapAria: (number: string) => `Ruttkarta för flyg ${number}`,
    airportsKicker: 'Flygplatser',
    airportsTitle: 'Avgångs- och ankomstflygplats',
    airportsSub:
      'Flygplatserna som flyget förbinder. Flygplatser som registret täcker öppnar sin egen sida.',
    originAirport: 'Avgångsflygplats',
    destinationAirport: 'Ankomstflygplats',
    airportPage: 'Öppna flygplatssidan',
    detailsKicker: 'Detaljer',
    detailsTitle: 'Flyguppgifter',
    detailsFlight: 'Flygnummer',
    detailsAirline: 'Flygbolag',
    detailsOrigin: 'Avgångsflygplats',
    detailsDestination: 'Ankomstflygplats',
    detailsDistance: 'Storcirkelavstånd',
    detailsRoutes: 'Listade rutter',
    detailsSnapshot: 'Dataögonblick',
    routesKicker: 'Rutter',
    routesTitle: 'Rutter under detta flygnummer',
    routesSub: (count: string) =>
      `Numret förekommer på ${count} rutter; ett nummer kan återanvändas av codeshare-partners.`,
    routesRoute: 'Rutt',
    routesAirline: 'Flygbolag',
    routesDistance: 'Avstånd',
    relatedKicker: 'Relaterat',
    relatedTitle: 'Andra flyg på denna rutt',
    relatedSub: 'Andra flygnummer mellan samma avgångs- och ankomstflygplats.',
    relatedEn: 'Fler flyg',
    faqKicker: 'Vanliga frågor',
    faqTitle: 'Vanliga frågor',
    faqEn: 'Frågor',
    faqWhat: (number: string) => `Vad är flyg ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flyg ${number} är ett flygnummer som används av ${airline} på rutten ${from} → ${to}${distance ? `, cirka ${distance} från varandra` : ''}.`,
    faqRoute: (number: string) => `Vart flyger flyg ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Flyg ${number} går från ${originName} (${originIata}) till ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Var finns avgångs- och ankomsttiderna för ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Sidan behandlar flygnummer, flygbolag, rutt och flygplatser för ${number}. aviability.coms flygindex innehåller inga avgångs- eller ankomsttider — kontrollera den aktuella tidtabellen hos flygbolaget eller flygplatsen.`,
    note: (date: string) =>
      `Flygnummer, flygbolag och rutt från aviability.coms flygindex (ögonblicksbild ${date}); avgångs- och ankomsttider ingår inte. Källa: `,
    source: 'aviability.com',
    sourceFlight: 'Visa på aviability.com',
    viewAirport: (iata: string) => `Öppna flygplatssidan för ${iata}`,
    notFound: 'Flyget hittades inte',
  },

  faq: {
    terminalCount: (name: string) => `Hur många terminaler har ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) har ${terminals} terminaler med totalt ${gates} gater: ${list}.`,
    gateCount: (name: string) => `Hur många gater har ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) har totalt ${gates} gater: ${list}.`,
    whereIs: (iata: string) => `Var ligger ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} är IATA-koden för ${name} (${nameEn}), belägen i ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Hur långt är det från ${name} till centrala ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} ligger cirka ${distance} från centrala ${city}. Du kan ta dig till staden med ${transit}.`,
    access: (name: string, city: string) => `Hur tar jag mig från ${name} till ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Vilka faciliteter erbjuder ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} erbjuder ${facilities}. Se terminalutformningen ovan för hur de fördelas mellan terminalerna.`,
    location: (name: string) => `Var ligger ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA-kod ${iata}) ligger i ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Vilka flygbolag trafikerar varje terminal på ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Huvudflygbolag per terminal på ${name}: ${list}. Flygbolag och gatefördelning ändras, så kontrollera alltid ditt boardingkort och flygplatsens skyltning.`,
    timezone: (name: string) => `Vilken tidszon ligger ${name} i?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) ligger i tidszonen ${tz}. Jämför med din lokala tid med flygplatsklockan ovan.`,
    flightsCount: (name: string) => `Hur många flygnummer finns listade för ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.coms flygindex listar ${plural(
        departures,
        'avgångsnummer',
        'avgångsnummer'
      )} och ${plural(arrivals, 'ankomstnummer', 'ankomstnummer')} för ${name} (${iata}), med ${plural(
        airlines,
        'flygbolag',
        'flygbolag'
      )} och ${plural(destinations, 'destination', 'destinationer')} (ögonblicksbild ${date}). Codeshare-nummer ingår och tidtabeller kan ändras — bekräfta hos flygbolaget före resan.`,
  },

  editorial: {
    authorName: 'World Airport Maps redaktion',
    role: 'Sammanställd och granskad av ',
    sourcesNote: 'Sammanställd från offentliga källor och officiell flygplatsinformation',
  },

  toc: {
    label: 'På sidan',
    map: 'Terminalkarta',
    photos: 'Flygplatsfoton',
    time: 'Flygplatstid',
    details: 'Flygplatsuppgifter',
    links: 'Relaterade länkar',
    location: 'Lägeskarta',
    routes: 'Ruttkarta',
    flights: 'Flyg',
    guide: 'Flygplatsguide',
    blog: 'Relaterade guider',
    terminals: 'Terminalguide',
    transport: 'Marktransport',
    facilities: 'Faciliteter',
    faq: 'Vanliga frågor',
    flightOverview: 'Flygöversikt',
    flightRoute: 'Rutt',
    flightAirports: 'Flygplatser',
    flightDetails: 'Flyguppgifter',
    flightRoutes: 'Alla rutter',
    flightRelated: 'Relaterade flyg',
    intro: 'Flygplatsöversikt',
    distribution: 'Flygplatsspridning',
    airports: 'Flygplatslista',
  },

  error: {
    title: 'Sidan kunde inte laddas',
    sub: 'Något gick fel när flygplatsdatan lästes. Försök igen eller gå tillbaka till startsidan och fortsätt bläddra.',
    retry: 'Försök igen',
    backHome: 'Tillbaka till startsidan',
    notFoundTitle: '404 · Sidan hittades inte',
    notFoundSub: 'Sidan du begärde kan ha flyttats eller tagits bort. Sök efter en flygplats eller fortsätt via länkarna nedan.',
  },

  footer: {
    sponsored: 'Sponsrad',
    mapsTitle: 'Detaljerade terminalkartor',
    mapsBody:
      'Det kan vara svårt att navigera på flygplatser och deras terminaler. Våra flygplatskartor visar detaljerade layouter för terminaler, gater, incheckningsområden, bagageband, butiker, restauranger, lounger och transportnav så att resan flyter bättre.',
    plansTitle: 'Interaktiva terminalplaner',
    plansBody:
      'Stora internationella flygplatser har flera terminaler och komplexa layouter. Våra detaljerade kartor hjälper dig hitta din gate, hitta faciliteter, planera ett byte och röra dig effektivt genom säkerhetskontroll, avgångar och ankomster.',
    transitTitle: 'Transport till och från flygplatsen',
    transitBody:
      'Utöver terminallayouter täcker vi transportalternativ, parkering och tillfartsvägar — hur du når din gate, byter mellan terminaler och använder tåg, buss, taxi och hyrbil.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} länder / regioner · ${airports} flygplatser · ${terminals} terminaler · illustrerade terminallayouter`,
    fallback: 'Illustrerade terminallayouter och transportguider för flygplatser världen över',
    linksLabel: 'Sidfotsnavigering',
    about: 'Om oss',
    contact: 'Kontakt',
    sources: 'Datakällor',
    privacy: 'Integritetspolicy',
    disclaimer: 'Ansvarsfriskrivning',
    terms: 'Användarvillkor',
  },

  transportModes: svTransportModes as Record<string, string>,

  categories: {
    kicker: 'Bläddra',
    title: 'Bläddra efter område',
    en: 'Bläddra efter område',
    sub: 'Gå in i registret från vilken vinkel du vill: efter land, efter region, efter stad — eller direkt till de mest trafikerade nav, senaste uppdateringarna och flygplatsguiderna.',
    allAirports: {
      title: 'Alla flygplatser',
      body: 'Hela registret, rangordnat efter passagerarvolym, filtrerbart efter land och sorterbart igen.',
    },
    byCountry: {
      title: 'Efter land',
      body: 'Se hur många flygplatser, terminaler och gater varje land eller region har.',
    },
    byRegion: {
      title: 'Efter region',
      body: 'Länder grupperade i Östasien, Europa, Nordamerika och övriga, för snabbare urval.',
    },
    popularCities: {
      title: 'Populära städer',
      body: 'De mest trafikerade flygplatsstäderna efter totala årliga passagerare, och varje flygplats i dem.',
    },
    recentlyUpdated: {
      title: 'Nyligen uppdaterat',
      body: 'Nya och reviderade flygplatsregister, senast först.',
    },
    guides: {
      title: 'Flygplatsguider',
      body: 'Utförliga guider om terminalbyten, hur du tar dig in till staden och praktiska tips.',
    },
    routes: {
      title: 'Ruttkartor',
      body: 'Se en flygplats direktnät, rangordnat efter antal destinationer, med flygbolag och avstånd.',
    },
  },

  guides: {
    kicker: 'Guider',
    title: 'Flygplatsguider',
    en: 'Flygplatsguider',
    sub: 'Utöver terminalplanerna har vi skrivit utförliga guider för utvalda nav: hur gatunumreringen fungerar, hur du byter mellan terminaler och hur du tar dig in till staden.',
    more: 'Visa flygplatsen',
  },

  blog: {
    kicker: 'Journal',
    title: 'Reseanteckningar',
    nav: 'Blogg',
    en: 'Reseanteckningar',
    sub: 'Utförliga anteckningar från vår redaktion: ankomst och immigration, byten, terminalfaciliteter och var du kan vila.',
    more: 'Läs',
    all: 'Alla artiklar',
    morePosts: 'Fler artiklar',
    airportsKicker: 'Flygplatser',
    airportsTitle: 'Flygplatser i artikeln',
    airportsEn: 'Flygplatser som täcks',
    airportsSub: 'Öppna en flygplatssida för terminalkarta, marktransport och vanliga frågor.',
    back: 'Tillbaka till artikellistan',
    empty: 'Inga artiklar än.',
    readingMinutes: (n: number) => `${n} min läsning`,
    source: (name: string) => `Källa: ${name}`,
    tags: 'Taggar',
  },

  comments: {
    kicker: 'Kommentarer',
    title: 'Läsarkommentarer',
    en: 'Diskussion',
    sub: 'Frågor, reseberättelser och rättelser är alla välkomna. Kommentarer är offentliga.',
    formTitle: 'Lämna en kommentar',
    countOne: '1 kommentar',
    countMany: '{n} kommentarer',
    empty: 'Inga kommentarer än — bli den första.',
    loading: 'Laddar kommentarer…',
    loadError: 'Kommentarer är inte tillgängliga just nu.',
    retry: 'Försök igen',
    nameLabel: 'Namn',
    namePlaceholder: 'Hur ska vi tilltala dig?',
    bodyLabel: 'Kommentar',
    bodyPlaceholder: 'Dela din erfarenhet, ställ en fråga eller lägg till sammanhang…',
    submit: 'Skicka kommentar',
    submitting: 'Skickar…',
    success: 'Skickad — tack för att du delar med dig.',
    error: 'Kommentaren kunde inte skickas. Försök igen senare.',
    rateLimited: 'Det gick för snabbt. Vänta några minuter och försök igen.',
    nameError: 'Ange ett namn (2–40 tecken).',
    bodyError: 'Skriv en kommentar (5–2000 tecken).',
    note: 'Kommentarer är offentliga och speglar författarnas egna åsikter. Var vänlig och lägg inte upp annonser eller personuppgifter.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Terminalutformning för ${name}`,
    gates: 'Gates',
    terminal: 'Terminal',
    corridor: 'Förbindelse',
    transit: 'Marktransport',
    footer: (iata: string) => `${iata} · Terminalutformning`,
  },

  tool: {
    label: 'Onlineverktyg',
    hub: {
      kicker: 'Verktyg',
      title: 'Kart- och koordinatverktyg',
      en: 'Gratis verktyg',
      sub: 'Gratis onlineverktyg för resenärer och geografiintresserade — körs i webbläsaren, inget att installera.',
      description:
        'Gratis kart- och koordinatverktyg online: konvertering mellan WGS84 / GCJ02 / BD09, decimalgrader ↔ DMS och storcirkelavstånd mellan två punkter. Tvåspråkigt, direkt i webbläsaren.',
      comingTitle: 'Fler verktyg under utveckling',
      comingSub: 'Koordinatplockning, platsdelning och projektionskalkylatorer är på väg.',
    },
    howTitle: 'Så använder du verktyget',
    relatedTitle: 'Relaterade verktyg',
    allTools: 'Alla verktyg',
    tools: {
      coordinateConverter: {
        title: 'Koordinatkonverterare',
        en: 'Koordinatkonverterare',
        description:
          'Konvertera mellan WGS84, GCJ02 och BD09 — lösningen på koordinatförskjutningen i Kina.',
        note: 'WGS84 är GPS- och den internationella standarden. GCJ02 är det förskjutna koordinatsystem som krävs i Fastlandskina (kallat "Marskoordinater") och används av AMap och Tencent Maps. BD09 lägger ytterligare en förskjutning ovanpå GCJ02 och används av Baidu Maps. Samma plats kan skilja 100–700 m mellan systemen, så konvertera innan du återanvänder koordinater i en annan karttjänst.',
        steps: [
          'Ange decimala koordinater som latitud, longitud — t.ex. 39.9042, 116.4074.',
          'Välj vilket koordinatsystem indatan använder.',
          'Tryck på "Konvertera" för de andra två systemen; använd "Kopiera" för att spara ett resultat.',
        ],
        inputLabel: 'Koordinater (latitud, longitud)',
        inputPlaceholder: 't.ex. 39.9042, 116.4074',
        sourceLabel: 'Indatans koordinatsystem',
        wgs84: 'WGS84 · GPS / internationell',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Decimaler',
        submit: 'Konvertera',
        copy: 'Kopiera',
        copied: 'Kopierat',
        error: 'Koordinaterna kunde inte tolkas. Använd formatet "latitud, longitud", t.ex. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Koordinatformatkonverterare',
        en: 'Koordinatformatkonverterare',
        description:
          'Konvertera mellan decimalgrader (DD), grader-minuter (DM) och grader-minuter-sekunder (DMS); indataformatet känns igen automatiskt.',
        note: 'DD (39.9042°) är det vanliga decimalformat som enheter och API:er använder; DMS (39°54′15″N) är vanligt i sjöfart, luftfart och lantmäteri; DM (39°54.25′N) är typiskt för fältanteckningar. Verktyget känner igen indataformatet från antalet siffergrupper i varje halva (1 = DD, 2 = DM, 3 = DMS) och visar alla tre formaten, med N/S/Ö/V för halvkloten.',
        steps: [
          'Ange ett koordinatpar — 39.9042, 39°54′15″N och 39°32.5′Ö fungerar alla; separera halvorna med kommatecken.',
          'Välj antal decimaler för utdata.',
          'Tryck på "Konvertera" — alla tre formaten listas; använd "Kopiera" för att spara ett.',
        ],
        inputLabel: 'Koordinater (ett par, kommaseparerat)',
        inputPlaceholder: 't.ex. 39°54′15″N, 116°24′51″Ö eller 39.9042, 116.4074',
        precisionLabel: 'Decimaler',
        submit: 'Konvertera',
        ddLabel: 'Decimalgrader (DD)',
        dmLabel: 'Grader-minuter (DM)',
        dmsLabel: 'Grader-minuter-sekunder (DMS)',
        copy: 'Kopiera',
        copied: 'Kopierat',
        error: 'Koordinaterna kunde inte tolkas. Format som stöds är bland annat 39.9042, 39°54′15″N och 39°32.5′Ö, separerade med kommatecken.',
      },
      distanceCalculator: {
        title: 'Avståndskalkylator',
        en: 'Avståndskalkylator',
        description:
          'Storcirkelavstånd mellan två punkter på jorden, plus initial bäring.',
        note: 'Avståndet använder Haversine-formeln för storcirkel (jordens medelradie 6 371,0088 km) — den kortaste vägen över ytan. Initial bäring är kompassriktningen från den första punkten mot den andra, 0° vid norr och ökande medurs.',
        steps: [
          'Ange latitud och longitud för start- och slutpunkten.',
          'Tryck på "Beräkna avstånd".',
          'Få resultatet i kilometer, miles och nautiska mil, plus initial bäring.',
        ],
        fromLabel: 'Från',
        toLabel: 'Till',
        inputPlaceholder: 'latitud, longitud',
        example: 'Exempel: Peking → Shanghai',
        submit: 'Beräkna avstånd',
        km: 'km',
        mi: 'mi',
        nmi: 'nm',
        bearing: 'Initial bäring',
        copy: 'Kopiera',
        copied: 'Kopierat',
        error: 'Koordinaterna kunde inte tolkas. Använd formatet "latitud, longitud" med latitud -90–90 och longitud -180–180.',
      },
    },
  },
};
