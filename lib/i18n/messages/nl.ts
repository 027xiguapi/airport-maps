import type { Messages } from './zh';
import { nlTransportModes } from '../nl-data';

/** Luchthavenklasse voor de inleidende zin (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'grote luchthaven',
  medium: 'middelgrote luchthaven',
  small: 'kleine luchthaven',
  heliport: 'helikopterhaven',
} as const;

/** "1 terminal" / "2 terminals" voor al geformatteerde aantallen. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * Nederlandse catalogus. Getoetst aan de Chinese bron (`Messages`), zodat een
 * ontbrekende of hernoemde sleutel de build laat falen.
 */
export const nl: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Luchthaven- en terminalkaarten',
    description:
      'Blader door terminalkaarten van luchthavens, geordend per land en regio. Van grote internationale hubs tot regionale luchthavens: bekijk gedetailleerde plattegronden van gates, incheckbalies, bagagebanden, winkels, restaurants, lounges en vervoer naar de stad.',
    keywords: [
      'luchthavenkaarten',
      'terminalkaarten',
      'indeling luchthaventerminal',
      'gates',
      'vervoer luchthaven',
      'luchthavengids',
    ],
    numberOfItems: (n: number) => `${n} luchthaven${n === 1 ? '' : 's'}`,
  },

  nav: {
    home: 'Home',
    airports: 'Alle luchthavens',
    countries: 'Per land',
    tools: 'Online tools',
    about: 'Over ons',
    label: 'Hoofdnavigatie',
    languageLabel: 'Taal',
    switchLanguage: 'Taal wijzigen',
    languagePlanned: 'In voorbereiding',
    languagePlannedHint: 'Deze taalversie is nog niet gepubliceerd.',
    themeToggle: 'Donkere modus aan/uit',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Advertentie',
    skipToContent: 'Naar de hoofdinhoud',
    backToTop: 'Terug naar boven',
    breadcrumbLabel: 'Kruimelpad',
    home: 'Home',
    viewMap: 'Kaart bekijken',
    terminalMap: 'Terminalkaart',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} terminal${counts.terminals === 1 ? '' : 's'}${
            counts.gates > 0 ? `, ${counts.gates} gate${counts.gates === 1 ? '' : 's'}` : ''
          } — Terminalkaart`
        : `${name} (${iata}) — locatiekaart en luchthavengids ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} terminalkaart` : name,
    airportGuide: 'Luchthavengids',
    lastUpdated: 'Onlangs bijgewerkt',
    updatedOn: (date: string) => `Bijgewerkt op ${date}`,
    publishedOn: (date: string) => `Gepubliceerd op ${date}`,
    readMore: 'Lees de volledige gids',
  },

  units: {
    terminalsFact: 'Terminals',
    gatesFact: 'Gates',
    terminals: (n: number) => `${n} terminal${n === 1 ? '' : 's'}`,
    terminalsShort: (n: number) => `${n} terminal${n === 1 ? '' : 's'}`,
    gates: (n: number) => `${n} gate${n === 1 ? '' : 's'}`,
    airports: (n: number) => `${n} luchthaven${n === 1 ? '' : 's'}`,
    airportsChip: (n: number) => `${n} luchthaven${n === 1 ? '' : 's'}`,
    pax: 'Passagiers',
    paxFull: 'Jaarlijkse passagiers',
    distance: 'Naar het centrum',
    distanceFrom: (city: string) => `Vanuit het centrum van ${city}`,
    gatesLabel: (range: string) => `Gates ${range}`,
    gatesCount: (n: number) => `${n} gates`,
    satellite: 'Satellietterminal',
    airlinesLabel: 'Belangrijkste luchtvaartmaatschappijen: ',
  },

  search: {
    ariaLabel: 'Luchthavens zoeken',
    placeholder: 'Zoek luchthavens, steden of IATA-codes',
    heroPlaceholder: 'Zoek op luchthavennnaam, stad of IATA-code — bijv. LHR / Dubai / Heathrow',
    submit: 'Luchthaven zoeken',
    loading: 'Zoeken…',
    empty: 'Geen overeenkomende luchthavens gevonden',
    resultsTitle: (term: string) => `Zoekresultaten voor “${term}”`,
    resultsCount: (n: number) => `${n} overeenkomende luchthaven${n === 1 ? '' : 's'} gevonden.`,
    noResults: 'Geen luchthavens gevonden. Probeer een ander trefwoord, zoals een stadsnaam of IATA-code.',
    noResultsHint: 'Kunt u de luchthaven niet vinden?',
    viewAll: (n: number) => `Bekijk alle ${n} luchthavens`,
    orBrowseByCountry: 'of blader per land',
    range: (from: number, to: number, total: number) =>
      `Toont ${from}–${to} van ${total} luchthavens`,
  },

  hero: {
    eyebrow: 'Wereldwijde luchthavengids',
    titleLead: 'Verken luchthavens en',
    titleAccent: 'terminalkaarten',
    sub: 'Vind uw weg op elke luchthaven met onze complete verzameling luchthaven- en terminalkaarten, geordend per land en regio — van grote internationale hubs tot regionale luchthavens.',
    stats: {
      countries: 'Landen / regio’s',
      airports: 'Luchthavens',
      terminals: 'Terminalkaarten',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Over deze site',
      imageAlt: 'Een passagiersvliegtuig aan de gate van een luchthaventerminal met glazen gevel bij zonsopgang',
      blocks: [
        {
          title: 'Vind uw weg op elke luchthaven met gedetailleerde terminalkaarten',
          body: 'De weg vinden op luchthavens en terminals over de hele wereld kan lastig zijn. Onze uitgebreide luchthavenkaarten bieden gedetailleerde plattegronden van terminals, gates, incheckzones, bagagebanden, winkels, restaurants, lounges en vervoersknooppunten, zodat u de route al voor vertrek kunt plannen.',
        },
        {
          title: 'Interactieve terminalkaarten en plattegronden',
          body: 'Grote internationale luchthavens hebben meerdere terminals en complexe indelingen. Onze gedetailleerde kaarten helpen u gates te vinden, voorzieningen te lokaliseren, overstappen te plannen en efficiënt door beveiliging, vertrekhal en aankomsthal te bewegen — zonder om te lopen.',
        },
        {
          title: 'Vervoer naar en van de luchthaven',
          body: 'Naast terminalindelingen behandelen onze luchthavengidsen vervoersopties, parkeren en toegangsroutes. Ontdek de beste manier om bij uw gate te komen, tussen terminals te wisselen en gebruik te maken van trein, bus, taxi en huurauto.',
        },
      ],
    },
    map: {
      kicker: 'Wereldkaart',
      title: 'Luchthavenkaart',
      en: 'Luchthavenkaart',
      sub: (airports: string, world: string) =>
        `Lokaliseer ${world} luchthavens met lijnvluchten wereldwijd — ${airports} daarvan hebben hier een terminalkaart. Klik op een punt voor het land of de regio en details.`,
      all: 'Alle',
      gEurope: 'Europa',
      gAsia: 'Azië',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Oceanië',
      legendSite: 'Hier opgenomen · klik voor terminalkaarten',
      legendWorld: 'Overige luchthavens met lijnvluchten wereldwijd',
      countTemplate: '{n} luchthavens getoond',
      download: 'Gegevens downloaden',
      downloadTitle: 'Exporteer alle luchthavens in het huidige filter als CSV (IATA, naam, stad, land, coördinaten)',
      openAirport: 'Luchthaven bekijken',
    },
    popular: {
      kicker: 'Terminalkaarten',
      title: 'Populaire luchthavenkaarten',
      en: 'Luchthavenkaarten',
      sub: 'Een selectie van terminalkaarten van grote luchthavens wereldwijd — open een luchthavenpagina voor de volledige kaart.',
    },
    recent: {
      kicker: 'Nieuw gepubliceerd',
      title: 'Onlangs bijgewerkt',
      en: 'Onlangs bijgewerkt',
      sub: 'Nieuwe en herziene luchthavens, landen en reisgidsen.',
      countriesTitle: 'Onlangs bijgewerkte landen',
    },
    routes: {
      kicker: 'Routes',
      title: 'Drukste luchthavenroutekaarten',
      en: 'Routekaarten',
      sub: 'Luchthavens gerangschikt naar het aantal bestemmingen met rechtstreekse vluchten — open er een voor de routekaart, luchtvaartmaatschappijen en bestemmingslijst.',
      collection: 'De routeverzameling',
      tabsLabel: 'Routekaarten per stad',
      explore: (city: string) => `Verken ${city}`,
      play: 'Diavoorstelling starten',
      pause: 'Diavoorstelling pauzeren',
    },
    photos: {
      kicker: 'Nieuwste foto’s',
      title: 'Nieuwste luchthavenfoto’s',
      en: 'Nieuwste foto’s',
      sub: 'De meest recent toegevoegde luchthavenfoto’s — de zes nieuwste luchthavens, elk met één foto.',
      ariaLabel: 'Carrousel met nieuwste luchthavenfoto’s',
      prev: 'Vorige foto',
      next: 'Volgende foto',
      play: 'Diavoorstelling starten',
      pause: 'Diavoorstelling pauzeren',
      counter: (index: number, total: number) => `Foto ${index} van ${total}`,
      view: (name: string) => `Kaart van ${name} bekijken`,
      open: 'Luchthavenpagina openen',
    },
    countries: {
      kicker: 'Per land',
      title: 'Luchthavenkaarten per land',
      en: 'Landen',
      sub: 'Blader door terminalkaarten per land en regio, van grote internationale hubs tot regionale luchthavens.',
      more: 'Alle landen',
    },
    all: {
      kicker: 'Alle kaarten',
      title: 'Alle luchthavenkaarten',
      en: 'Alle luchthavens',
      sub: 'Luchthavenkaarten van de drukste luchthavens en reishubs ter wereld.',
      hint: 'Selecteer een luchthaven om de terminalindeling te zien.',
      more: 'Alles bekijken',
    },
    facts: {
      kicker: 'Gidsgegevens',
      title: 'Luchthavengegevens in één oogopslag',
      en: 'Lijsten en tabellen',
      sub: 'De cijfers van de gids als lijsten en tabellen: dekking, de drukste luchthavens met gepubliceerde passagierscijfers en de regionale verdeling.',
      note: (pax: string, detailed: string, total: string) =>
        `Passagierscijfers dekken ${pax} van ${total} luchthavens; terminal- en gatecijfers dekken ${detailed} van ${total}. Terminalaantallen volgen de eigen groepering van deze gids en kunnen concourses omvatten.`,
      coverageTitle: 'Dekkingscijfers',
      coverage: {
        airports: 'Luchthavens',
        countries: 'Landen en regio’s',
        regions: 'Regio’s in de gids',
        cities: 'Unieke stadsnamen',
        terminals: 'Terminals',
        gates: 'Gates',
        routes: 'Luchthavens met routekaart',
      },
      busiest: {
        title: 'Drukste luchthavens naar jaarlijkse passagiers',
        sub: 'De twaalf drukste luchthavens met gepubliceerde jaarlijkse passagierscijfers.',
        caption: 'Luchthavens met gepubliceerde jaarlijkse passagierscijfers, gerangschikt',
        rank: 'Rang',
        iata: 'IATA',
        airport: 'Luchthaven',
        city: 'Stad',
        country: 'Land',
        terminals: 'Terminals',
        gates: 'Gates',
        pax: 'Jaarlijkse passagiers (mln)',
      },
      regions: {
        title: 'Luchthavens per regio',
        sub: 'Aantallen luchthavens, terminals en gates gegroepeerd naar de regiogrenzen van deze gids; sommige landen en gebieden vallen onder twee regio’s.',
        caption: 'Luchthavenaantallen per regio',
        region: 'Regio',
        airports: 'Luchthavens',
        detailed: 'Met gedetailleerde gegevens',
        terminals: 'Terminals',
        gates: 'Gates',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Luchthaven',
    city: 'Stad',
    country: 'Land',
    size: 'Grootte',
    map: 'Kaart',
    empty: 'Geen luchthavens voldoen aan deze filters. Probeer de selectie te verbreden.',
  },

  pager: {
    label: 'Paginering',
    previous: 'Vorige pagina',
    next: 'Volgende pagina',
  },

  filters: {
    searchPlaceholder: 'Zoek luchthavens, steden of IATA-codes',
    submit: 'Zoeken',
    country: 'Land',
    all: 'Alle',
    sort: 'Sorteren',
    sortPax: 'Passagiers',
    sortName: 'Naam',
    sortIata: 'IATA-code',
    sortUpdated: 'Laatst bijgewerkt',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Alle luchthavenkaarten van ${country}${sortLabel ? ` — gesorteerd op ${sortLabel}` : ''}`
        : `Alle luchthavenkaarten — gesorteerd op ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Elke luchthavenkaart van ${country} op één pagina: terminalindelingen, gatebereiken en vervoer naar de stad${sortLabel ? `, geordend op ${sortLabel}` : ''}.`
        : `De volledige luchthavengids op één pagina: terminalindelingen, gatebereiken en vervoer naar de stad${sortLabel ? `, geordend op ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Luchthavens per land bekijken',
    description:
      'Blader door de wereldwijde gids met terminalkaarten per land en regio. Van grote internationale hubs tot regionale luchthavens: zie hoeveel luchthavens en terminals elk land heeft.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Van grote internationale hubs tot regionale luchthavens — ${countries} landen en regio’s, ${airports} luchthavens en ${terminals} terminals in totaal.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} land${countries === 1 ? '' : 'en'} · ${airports} luchthaven${airports === 1 ? '' : 's'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} luchthavenkaart — alle ${count} luchthavens` : `Luchthavenkaarten van ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} heeft ${total} luchthavens met lijnvluchten; ${count} daarvan hebben hier een gidspagina, met de verspreidingskaart, de volledige nationale lijst en rechtstreekse routes.`
        : `Terminalkaarten voor ${count} luchthaven${count === 1 ? '' : 's'} in ${name} (${nameEn}), met de belangrijkste internationale hubs en regionale luchthavens van ${region}. Bekijk gates, terminalindelingen en vervoer naar de stad.`,
    chip: (nameEn: string) => `LUCHTHAVENS ${nameEn.toUpperCase()}`,
    kicker: 'Luchthavenkaarten',
    titleOf: (name: string) => `Luchthavens in ${name}`,
    en: 'Luchthavens',
    sub: 'Selecteer een luchthaven om de terminalindeling, gatebereiken en vervoersopties te zien.',
    empty: 'Voor dit land of deze regio zijn nog geen luchthavens vermeld.',
    moreKicker: 'Andere landen',
    moreTitle: 'Andere landen bekijken',
    moreEn: 'Meer landen',
    all: 'Alle landen',
    notFound: 'Land niet gevonden',
    introKicker: 'Overzicht',
    introTitle: (name: string) => `Luchthavenoverzicht van ${name}`,
    introEn: 'Luchthavenoverzicht',
    introSub:
      'De omvang van de luchthavens in dit land of deze regio, de belangrijkste hubs en de steden die ze bedienen.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} ligt in ${o.region}. Deze site behandelt ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` en ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) is de grootste qua jaarlijkse passagiers, met ${o.busiestPax}.`
        : '') +
      ` De luchthavens bedienen onder meer ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Elke luchthavenpagina bevat een locatiekaart en de luchthavencodes, plus alle terminal-, gate- en vervoersgegevens die voor die luchthaven zijn verzameld.',
    distribution: {
      kicker: 'Verspreiding',
      title: (name: string) => `Verspreidingskaart van luchthavens in ${name}`,
      en: 'Luchthavenverspreiding',
      sub: (covered: string, total: string) =>
        `${total} luchthavens met lijnvluchten in het hele land (groot, middelgroot en klein); ${covered} daarvan hebben een gidspagina op deze site. De volledige lijst volgt hieronder.`,
      mapAlt: (name: string, total: string) =>
        `Verspreidingskaart van luchthavens in ${name}: ${total} luchthavens met lijnvluchten`,
      siteTag: 'Hier opgenomen',
      colAirport: 'Luchthaven',
      colCity: 'Stad',
      colType: 'Type',
      types: {
        large: 'Groot',
        medium: 'Middelgroot',
        small: 'Klein',
      },
      empty: 'Nog geen nationale luchthavenlijst beschikbaar.',
    },
    linksTitle: 'Gerelateerde links',
    linksEn: 'Gerelateerde links',
    linksSub: 'Officiële sites en encyclopedieën voor het land en elk van zijn luchthavens.',
    linksCountry: (name: string) => `Naslag over ${name}`,
    linksAirports: (name: string) => `Luchthavens in ${name}`,
    faqKicker: 'Veelgestelde vragen',
    faqTitle: 'Veelgestelde vragen',
    faqEn: 'Vragen',
    faq: {
      airportTotal: (name: string) => `Hoeveel luchthavens zijn er in ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} heeft ${total} luchthavens met lijnvluchten voor passagiers (groot, middelgroot en klein); deze site behandelt ${covered} daarvan in detail. Zie de verspreidingskaart en de volledige lijst hierboven.`,
      airportCount: (name: string) => `Welke luchthavens zijn opgenomen in ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Deze site behandelt ${count} in ${name}: ${list}.`,
      busiest: (name: string) => `Wat is de drukste luchthaven in ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Qua jaarlijkse passagiers is ${busiest} (${iata}) de grootste van de hier behandelde luchthavens, met ${pax}.`,
      terminals: (name: string) => `Hoeveel terminals hebben de luchthavens in ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `De in ${name} behandelde luchthavens hebben ${terminals} met in totaal ${gates}: ${list}.`,
      cities: (name: string) => `Welke steden in ${name} hebben een luchthaven?`,
      citiesAnswer: (name: string, cities: string) =>
        `De hier behandelde luchthavens van ${name} bedienen onder meer ${cities}. U kunt ze filteren op stad of IATA-code in de luchthavengids.`,
      maps: (name: string) => `Hebben de luchthavens in ${name} terminalkaarten?`,
      mapsAnswer: (name: string, count: string) =>
        `Sommige wel. Luchthavenpagina’s bevatten een locatiekaart, luchthavencodes en rechtstreekse routes, en de ${count} die in ${name} zijn opgenomen tonen een terminalindeling, gatebereiken en vervoer naar de stad waar die gegevens zijn verzameld. Open een luchthaven om te zien wat er beschikbaar is.`,
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
        ? `${o.name} (${o.iata}) heeft ${o.terminals} terminal${o.terminals === '1' ? '' : 's'}${
            o.gates ? ` met ${o.gates} gate${o.gates === '1' ? '' : 's'}` : ''
          }${o.pax ? `, goed voor ${o.pax} passagiers per jaar` : ''}${
            o.distance ? `, ${o.distance} van het stadscentrum` : ''
          }. Terminalkaart met alle terminals, gatebereiken en vervoer naar de stad.`
        : `${o.name} (${o.iata}) bedient ${o.city}, ${o.country}. Locatiekaart, luchthavencodes en reisinformatie.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'luchthaven';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) is een ${kind} die ${where} bedient`;
      return o.terminals > 0
        ? `${head}, met ${o.terminals} terminal${o.terminals === 1 ? '' : 's'}${
            o.gates > 0 ? ` en ${o.gates} gate${o.gates === 1 ? '' : 's'}` : ''
          }${o.distance ? `, ongeveer ${o.distance} van het centrum van ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Terminalindeling`,
    mapNote: 'TERMINALINDELING',
    realMapTitle: (iata: string) => `${iata} terminalkaart — gates en navigatie`,
    mapAlt: (name: string, iata: string) =>
      `Terminalkaart van ${name} (${iata}) met alle terminals, gatebereiken en concourses`,
    realMapNote: 'TERMINALKAART',
    photosKicker: 'Foto’s',
    photosTitle: 'Luchthavenfoto’s',
    photosEn: 'Luchthavenfoto’s',
    photosSub:
      'Echte foto’s van deze luchthaven, elk met vermelding van de openbare webpagina waar ze zijn gevonden; het auteursrecht blijft bij de oorspronkelijke fotografen. Klik op een foto om te vergroten, of op de bronvermelding om de bronpagina te openen.',
    photosCredit: (host: string) => `Bron: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Luchthavenfoto ${index} van ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Foto ${index} van ${name} vergroten`,
    zoomLabel: 'Zoomen',
    zoomClose: 'Sluiten',
    zoomIn: 'Inzoomen',
    zoomOut: 'Uitzoomen',
    downloadKicker: 'Download',
    downloadTitle: 'Luchthavenkaarten downloaden',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) =>
      `Nieuwste terminalkaart en plattegrond van ${iata} ${year} downloaden`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Nieuwste terminalkaart van ${iata} ${year} als PDF downloaden`,
    timeKicker: 'Tijd',
    timeTitle: (iata: string) => `Tijdsinformatie luchthaven — huidige tijd in ${iata}`,
    timeEn: 'Luchthaventijd',
    timeSub: (iata: string, tz: string) => `Huidige tijd in ${iata} (${tz}) vergeleken met uw lokale tijd.`,
    clockAirport: 'Huidige luchthaventijd',
    clockLocal: 'Uw lokale tijd',
    infoKicker: 'Info',
    infoTitle: 'Luchthaveninformatie en details',
    infoEn: 'Luchthavengegevens',
    infoIata: 'IATA-code luchthaven',
    infoLocation: 'Locatie luchthaven',
    infoCoords: 'Coördinaten',
    infoTimezone: 'Tijdzone',
    linksKicker: 'Links',
    linksTitle: 'Gerelateerde links',
    linksEn: 'GERELATEERDE LINKS',
    linksSub: 'Externe bronnen voor deze luchthaven: de officiële website, Wikipedia en Baidu Baike.',
    officialSite: 'Officiële website',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Bronnen: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Open data van OurAirports',
    sourcesNote:
      'Luchthavencodes, coördinaten en luchthavenklasse zijn samengesteld uit open data; paginadetails volgen de officiële publicaties van elke luchthaven.',
    mapEmbedKicker: 'Kaart',
    mapEmbedTitle: (name: string) => `Interactieve kaart — locatie van ${name}`,
    mapEmbedEn: 'Interactieve kaart',
    extMapsNote: 'Bekijk deze luchthaven op andere kaartdiensten:',
    routeMapKicker: 'Routes',
    routeMapTitle: (name: string) => `Routekaart van ${name} — rechtstreekse bestemmingen`,
    routeMapEn: 'Routekaart',
    routeMapAria: (name: string) => `Kaart met rechtstreekse routes vanaf ${name}`,
    routeLegendTitle: 'Legenda',
    routeLegendClose: 'Legenda verbergen',
    routeReset: 'Kaart resetten',
    routeZoomIn: 'Inzoomen',
    routeZoomOut: 'Uitzoomen',
    routeFullscreen: 'Volledig scherm',
    routeExitFullscreen: 'Volledig scherm verlaten',
    routeOpenAirport: 'Open de luchthavenpagina van {iata}',
    routeTiers: {
      trunk: '6+ maatschappijen',
      major: '3–5 maatschappijen',
      minor: '2 maatschappijen',
      single: '1 maatschappij',
    },
    routeCarriersTpl: '{n} maatschappijen',
    routeTableDest: 'Bestemming',
    routeTableCountry: 'Land/regio',
    routeTableDistance: 'Afstand',
    routeTableCarriers: 'Maatschappijen',
    routeCarriersMore: (n: number) => ` +${n} meer`,
    routeMapNote: (date: string) =>
      `Momentopname routgegevens: ${date}; alleen rechtstreekse vluchten. Bron: `,
    legendTerminal: 'Terminalgebouw',
    legendTransit: 'Knooppunt openbaar vervoer',
    legendCorridor: 'Verbinding tussen terminals',
    terminalsKicker: 'Terminals',
    terminalsTitle: 'Terminalgids',
    terminalsEn: 'Terminalgids',
    terminalsSub: (name: string) =>
      `Gatebereiken, belangrijkste luchtvaartmaatschappijen en voorzieningen per terminal op ${name}.`,
    transitTitle: 'Vervoer naar de stad',
    facilitiesTitle: 'Luchthavenvoorzieningen',
    faqKicker: 'Veelgestelde vragen',
    faqTitle: 'Veelgestelde vragen',
    faqEn: 'Vragen',
    guideKicker: 'Gids',
    guideTitle: 'Luchthavengids',
    guideEn: 'Luchthavengids',
    blogKicker: 'Artikelen',
    blogTitle: (iata: string) => `Luchthavengidsen voor ${iata}`,
    blogEn: 'Uit de blog',
    blogSub: (iata: string, count: number) =>
      `${count} artikelen op deze site behandelen ${iata}: aankomst, vervoer naar de stad, bagage en overstappen.`,
    blogAll: 'Alle artikelen',
    relatedTitle: (country: string) => `Andere luchthavens in ${country}`,
    relatedEn: (country: string) => `Meer in ${country}`,
    relatedAll: (country: string) => `Alle luchthavens in ${country}`,
    flights: {
      kicker: 'Vluchten',
      title: (name: string) => `Vluchten van en naar ${name} — vertrek en aankomst`,
      en: 'Vluchttabel',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'vluchtnummer', 'vluchtnummers')} bij ${plural(
          airlines,
          'luchtvaartmaatschappij',
          'luchtvaartmaatschappijen'
        )} en ${plural(destinations, 'bestemming', 'bestemmingen')}, gesplitst naar richting. Codeshare-nummers zijn inbegrepen.`,
      statDepartures: 'Vertreknumners',
      statArrivals: 'Aankomstnummers',
      statAirlines: 'Maatschappijen',
      statDestinations: 'Bestemmingen',
      note: (date: string) =>
        `Vluchtnummers en routes uit de vluchtindex van aviability.com (momentopname ${date}); codeshare-nummers zijn inbegrepen en er worden geen vertrektijden getoond. Bron: `,
      source: 'aviability.com',
      tabDepartures: 'Vertrek',
      tabArrivals: 'Aankomst',
      search: 'Zoek vluchtnummer, maatschappij of stad',
      clearSearch: 'Zoekopdracht wissen',
      flight: 'Vlucht',
      airline: 'Maatschappij',
      destination: 'Bestemming',
      origin: 'Herkomst',
      country: 'Land/regio',
      empty: 'Geen vluchten gevonden voor deze zoekopdracht.',
      loading: 'Vluchten laden…',
      error: 'Meer vluchten konden niet worden geladen.',
      retry: 'Opnieuw proberen',
      previous: 'Vorige',
      next: 'Volgende',
      pagination: 'Paginering',
      showing: '{from}–{to} van {total} vluchtnummers',
      pageOf: 'Pagina {page} van {pages}',
    },
    notFound: 'Luchthaven niet gevonden',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Nieuwste routekaart van ${name} (${iata}) ${year} — ${count} rechtstreekse bestemmingen`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Kaart met rechtstreekse routes van ${name} (${iata}): ${count} bestemmingen met luchtvaartmaatschappijen en afstanden, plus de volledige bestemmingslijst.`,
    heading: (name: string) => `Routekaart van ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} heeft ${count} rechtstreekse bestemmingen, gekleurd naar het aantal maatschappijen dat ze bedient.`,
    backToAirport: (iata: string) => `Terug naar de luchthavenpagina van ${iata}`,
    flightNumbers: (iata: string) => `Vluchtnummers van ${iata}`,
    openFull: 'Routekaart bekijken',
    previewCta: (iata: string) => `Bekijk de volledige routekaart van ${iata}`,
    teaserSub: (count: string) => `${count} rechtstreekse bestemmingen: kaart, maatschappijen en afstanden.`,
    mapSectionTitle: (name: string) => `Kaart met rechtstreekse routes van ${name}`,
    tableKicker: (iata: string) => `${iata} · Bestemmingen`,
    tableSectionTitle: (name: string) => `Rechtstreekse bestemmingen van ${name}`,
    tableSectionEn: (iata: string) => `Bestemmingen van ${iata}`,
    tableToc: 'Bestemmingen',
    tableSectionSub: (count: string) =>
      `${count} bestemmingen, drukste eerst naar aantal maatschappijen, met afstand en maatschappijen.`,
    dataKicker: 'Download',
    dataTitle: 'Routedata downloaden',
    dataEn: 'Gegevens',
    dataSub: (count: number) =>
      `${count} rechtstreekse routes met bestemming, IATA-code, stad, land, afstand en maatschappijen — klaar voor een spreadsheet of script.`,
    dataFields: 'CSV is geschikt voor Excel / Numbers, JSON voor code; beide zijn UTF-8.',
    dataCsv: 'CSV downloaden',
    dataJson: 'JSON downloaden',
    airportMapSub:
      'Terminal- en gate-indeling in één oogopslag — klik op de afbeelding voor de volledige kaart, terminalvoorzieningen en vervoer naar de stad op de luchthavenpagina.',
    airportMapCta: (iata: string) => `Bekijk de volledige terminalkaart van ${iata}`,
    factDestinations: 'Rechtstreekse bestemmingen',
    factAirlines: 'Maatschappijen',
    factCountries: 'Landen',
    factSnapshot: 'Momentopname gegevens',
    faqCountQ: (name: string) => `Naar hoeveel plaatsen vliegt ${name} rechtstreeks?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) heeft ${count} rechtstreekse bestemmingen in ${countries} landen en gebieden. Alleen rechtstreekse routes worden geteld; reizen met een tussenstop niet.`,
    faqAirlinesQ: (name: string) => `Hoeveel maatschappijen vliegen vanaf ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} maatschappijen bieden rechtstreekse routes vanaf deze luchthaven. De grootste netwerken zijn ${leaders} (aantal bestemmingen tussen haakjes).`,
    faqFarthestQ: (name: string) => `Wat is de verste rechtstreekse bestemming vanaf ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `De verste rechtstreekse bestemming is ${city}, ${country} ${iata}, ongeveer ${km} km verderop.`,
    faqBusiestQ: () => 'Welke bestemmingen kennen de meeste concurrentie?',
    faqBusiestA: (count: string, list: string) =>
      `${count} bestemmingen worden door drie of meer maatschappijen bediend; de drukste zijn ${list}.`,
    faqSourceQ: () => 'Hoe vaak worden de routedata bijgewerkt?',
    faqSourceA: (date: string, source: string, license: string) =>
      `De routes op deze pagina komen uit de open dataset van ${source} (${license}), een momentopname van ${date} en geen live dienstregeling — controleer tickets en tijden bij de maatschappij of luchthaven.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Vlucht ${number} van ${airline} — ${from} naar ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Vlucht ${number} is een vluchtnummer van ${airline} van ${from} naar ${to}${distance ? `, ongeveer ${distance}` : ''}. Routekaart, vertrek- en aankomstluchthaven, afstand en andere vluchten op de route.`,
    heading: (number: string) => `Vlucht ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Vlucht ${number} is een vluchtnummer van ${airline} tussen ${from} en ${to}${distance ? `, een grootcirkelafstand van ongeveer ${distance}` : ''}.`,
    factFlight: 'Vluchtnummer',
    factFrom: 'Van',
    factTo: 'Naar',
    factDistance: 'Afstand',
    overviewKicker: 'Overzicht',
    overviewTitle: (number: string) => `Over vlucht ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} is een vluchtnummer van ${airline} tussen ${originName} (${originIata}) en ${destName} (${destIata})${distance ? `, ongeveer ${distance} uit elkaar` : ''}. Deze pagina verzamelt het vluchtnummer, de maatschappij, de route en de twee luchthavens voor snel opzoeken.`,
    overviewNote:
      'De vluchtindex bevat geen vertrek- of aankomsttijden, vliegtuigtypes of uitvoeringsdata; controleer dienstregeling, incheck- en boardtijden bij de maatschappij of luchthaven.',
    routeKicker: 'Route',
    routeTitle: (from: string, to: string) => `Route ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Routediagram voor vlucht ${number}`,
    routeMapAria: (number: string) => `Routekaart voor vlucht ${number}`,
    airportsKicker: 'Luchthavens',
    airportsTitle: 'Vertrek- en aankomstluchthaven',
    airportsSub:
      'De luchthavens die deze vlucht verbindt. Luchthavens in de gids openen hun eigen pagina.',
    originAirport: 'Vertrekluchthaven',
    destinationAirport: 'Aankomstluchthaven',
    airportPage: 'Luchthavenpagina openen',
    detailsKicker: 'Details',
    detailsTitle: 'Vluchtgegevens',
    detailsFlight: 'Vluchtnummer',
    detailsAirline: 'Maatschappij',
    detailsOrigin: 'Vertrekluchthaven',
    detailsDestination: 'Aankomstluchthaven',
    detailsDistance: 'Grootcirkelafstand',
    detailsRoutes: 'Vermelde routes',
    detailsSnapshot: 'Momentopname gegevens',
    routesKicker: 'Routes',
    routesTitle: 'Routes onder dit vluchtnummer',
    routesSub: (count: string) =>
      `Dit nummer komt voor op ${count} routes; een nummer kan door codeshare-partners worden hergebruikt.`,
    routesRoute: 'Route',
    routesAirline: 'Maatschappij',
    routesDistance: 'Afstand',
    relatedKicker: 'Gerelateerd',
    relatedTitle: 'Andere vluchten op deze route',
    relatedSub: 'Andere vluchtnummers tussen dezelfde vertrek- en aankomstluchthaven.',
    relatedEn: 'Meer vluchten',
    faqKicker: 'Veelgestelde vragen',
    faqTitle: 'Veelgestelde vragen',
    faqEn: 'Vragen',
    faqWhat: (number: string) => `Wat is vlucht ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Vlucht ${number} is een vluchtnummer van ${airline} op de route ${from} → ${to}${distance ? `, ongeveer ${distance} uit elkaar` : ''}.`,
    faqRoute: (number: string) => `Waar vliegt vlucht ${number} naartoe?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Vlucht ${number} vliegt van ${originName} (${originIata}) naar ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Waar staan de vertrek- en aankomsttijden van ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Deze pagina behandelt het vluchtnummer, de maatschappij, de route en de luchthavens van ${number}. De vluchtindex van aviability.com bevat geen vertrek- of aankomsttijden — raadpleeg de maatschappij of luchthaven voor de actuele dienstregeling.`,
    note: (date: string) =>
      `Vluchtnummer, maatschappij en route uit de vluchtindex van aviability.com (momentopname ${date}); vertrek- en aankomsttijden zijn niet inbegrepen. Bron: `,
    source: 'aviability.com',
    sourceFlight: 'Bekijken op aviability.com',
    viewAirport: (iata: string) => `Open de luchthavenpagina van ${iata}`,
    notFound: 'Vlucht niet gevonden',
  },

  faq: {
    terminalCount: (name: string) => `Hoeveel terminals heeft ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) heeft ${terminals} terminals met in totaal ${gates} gates: ${list}.`,
    gateCount: (name: string) => `Hoeveel gates heeft ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) heeft in totaal ${gates} gates: ${list}.`,
    whereIs: (iata: string) => `Waar ligt ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} is de IATA-code voor ${name} (${nameEn}), gelegen in ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Hoe ver ligt ${name} van het centrum van ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} ligt ongeveer ${distance} van het centrum van ${city}. U kunt de stad bereiken met ${transit}.`,
    access: (name: string, city: string) => `Hoe kom ik van ${name} naar ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Welke voorzieningen biedt ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} biedt ${facilities}. Zie de terminalindeling hierboven voor de verdeling over de terminals.`,
    location: (name: string) => `Waar ligt ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA-code ${iata}) ligt in ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Welke maatschappijen opereren vanaf elke terminal op ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Belangrijkste maatschappijen per terminal op ${name}: ${list}. Maatschappijen en gate-indelingen veranderen, dus controleer altijd uw instapkaart en de borden op de luchthaven.`,
    timezone: (name: string) => `In welke tijdzone ligt ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) ligt in de tijdzone ${tz}. Vergelijk met uw lokale tijd via de luchthavenklok hierboven.`,
    flightsCount: (name: string) => `Hoeveel vluchtnummers staan er voor ${name} vermeld?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `De vluchtindex van aviability.com vermeldt ${plural(
        departures,
        'vertreknnummer',
        'vertreknnummers'
      )} en ${plural(arrivals, 'aankomstnummer', 'aankomstnummers')} voor ${name} (${iata}), met ${plural(
        airlines,
        'maatschappij',
        'maatschappijen'
      )} en ${plural(destinations, 'bestemming', 'bestemmingen')} (momentopname ${date}). Codeshare-nummers zijn inbegrepen en dienstregelingen kunnen wijzigen — controleer dit bij de maatschappij voor u reist.`,
  },

  editorial: {
    authorName: 'Redactieteam World Airport Maps',
    role: 'Samengesteld en gecontroleerd door ',
    sourcesNote: 'Samengesteld uit openbare bronnen en officiële luchthaveninformatie',
  },

  toc: {
    label: 'Op deze pagina',
    map: 'Terminalkaart',
    photos: 'Luchthavenfoto’s',
    time: 'Luchthaventijd',
    details: 'Luchthavengegevens',
    links: 'Gerelateerde links',
    location: 'Locatiekaart',
    routes: 'Routekaart',
    flights: 'Vluchten',
    guide: 'Luchthavengids',
    blog: 'Gerelateerde gidsen',
    terminals: 'Terminalgids',
    transport: 'Vervoer naar de stad',
    facilities: 'Voorzieningen',
    faq: 'Veelgestelde vragen',
    flightOverview: 'Vluchtoverzicht',
    flightRoute: 'Route',
    flightAirports: 'Luchthavens',
    flightDetails: 'Vluchtgegevens',
    flightRoutes: 'Alle routes',
    flightRelated: 'Gerelateerde vluchten',
    intro: 'Luchthavenoverzicht',
    distribution: 'Luchthavenverspreiding',
    airports: 'Luchthavenlijst',
  },

  error: {
    title: 'Deze pagina kon niet worden geladen',
    sub: 'Er ging iets mis bij het lezen van de luchthavengegevens. Probeer het opnieuw of ga terug naar de homepage om verder te bladeren.',
    retry: 'Opnieuw proberen',
    backHome: 'Terug naar de homepage',
    notFoundTitle: '404 · Pagina niet gevonden',
    notFoundSub: 'De opgevraagde pagina is mogelijk verplaatst of verwijderd. Probeer een luchthaven te zoeken of ga verder via de links hieronder.',
  },

  footer: {
    sponsored: 'Gesponsord',
    mapsTitle: 'Gedetailleerde terminalkaarten',
    mapsBody:
      'De weg vinden op luchthavens en hun terminals kan lastig zijn. Onze luchthavenkaarten tonen gedetailleerde indelingen van terminals, gates, incheckzones, bagagebanden, winkels, restaurants, lounges en vervoersknooppunten, zodat uw reis soepeler verloopt.',
    plansTitle: 'Interactieve terminalplattegronden',
    plansBody:
      'Grote internationale luchthavens hebben meerdere terminals en complexe indelingen. Onze gedetailleerde kaarten helpen u uw gate te vinden, voorzieningen te lokaliseren, een overstap te plannen en efficiënt door beveiliging, vertrek en aankomst te bewegen.',
    transitTitle: 'Vervoer naar en van de luchthaven',
    transitBody:
      'Naast terminalindelingen behandelen we vervoersopties, parkeren en toegangsroutes — hoe u bij uw gate komt, tussen terminals wisselt en gebruikmaakt van trein, bus, taxi en huurauto.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} landen / regio’s · ${airports} luchthavens · ${terminals} terminals · geïllustreerde terminalindelingen`,
    fallback: 'Geïllustreerde terminalindelingen en vervoersgidsen voor luchthavens wereldwijd',
    linksLabel: 'Voettekstnavigatie',
    about: 'Over ons',
    contact: 'Contact',
    sources: 'Databronnen',
    privacy: 'Privacybeleid',
    disclaimer: 'Disclaimer',
    terms: 'Gebruiksvoorwaarden',
  },

  transportModes: nlTransportModes as Record<string, string>,

  categories: {
    kicker: 'Bladeren',
    title: 'Blader per gebied',
    en: 'Blader per gebied',
    sub: 'Betreed de gids vanuit elke invalshoek: per land, per regio, per stad — of ga direct naar de drukste hubs, de laatste updates en de luchthavengidsen.',
    allAirports: {
      title: 'Alle luchthavens',
      body: 'De volledige gids, gerangschikt naar passagiersvolume, filterbaar op land en opnieuw sorteerbaar.',
    },
    byCountry: {
      title: 'Per land',
      body: 'Zie hoeveel luchthavens, terminals en gates elk land of elke regio heeft.',
    },
    byRegion: {
      title: 'Per regio',
      body: 'Landen gegroepeerd in Oost-Azië, Europa, Noord-Amerika en de rest, voor sneller zoeken.',
    },
    popularCities: {
      title: 'Populaire steden',
      body: 'De drukste luchthavensteden naar totale jaarlijkse passagiers, en elke luchthaven daarin.',
    },
    recentlyUpdated: {
      title: 'Onlangs bijgewerkt',
      body: 'Nieuw toegevoegde en herziene luchthavengegevens, meest recent eerst.',
    },
    guides: {
      title: 'Luchthavengidsen',
      body: 'Uitgebreide gidsen over overstappen, naar de stad reizen en praktische tips.',
    },
    routes: {
      title: 'Routekaarten',
      body: 'Bekijk het rechtstreekse netwerk van een luchthaven, gerangschikt naar aantal bestemmingen, met maatschappijen en afstanden.',
    },
  },

  guides: {
    kicker: 'Gidsen',
    title: 'Luchthavengidsen',
    en: 'Luchthavengidsen',
    sub: 'Naast de terminalplattegronden hebben we uitgebreide gidsen geschreven voor geselecteerde hubs: hoe de gate-nummering werkt, hoe u tussen terminals wisselt en hoe u de stad bereikt.',
    more: 'Deze luchthaven bekijken',
  },

  blog: {
    kicker: 'Journaal',
    title: 'Reisnotities',
    nav: 'Blog',
    en: 'Reisnotities',
    sub: 'Uitgebreide notities van onze redactie: aankomst en immigratie, overstappen, terminalvoorzieningen en waar u kunt uitrusten.',
    more: 'Lezen',
    all: 'Alle artikelen',
    morePosts: 'Meer artikelen',
    airportsKicker: 'Luchthavens',
    airportsTitle: 'Luchthavens in dit artikel',
    airportsEn: 'Behandelde luchthavens',
    airportsSub: 'Open een luchthavenpagina voor de terminalkaart, het vervoer naar de stad en de veelgestelde vragen.',
    back: 'Terug naar de artikelenlijst',
    empty: 'Nog geen artikelen.',
    readingMinutes: (n: number) => `${n} min lezen`,
    source: (name: string) => `Bron: ${name}`,
    tags: 'Labels',
  },

  comments: {
    kicker: 'Reacties',
    title: 'Reacties van lezers',
    en: 'Discussie',
    sub: 'Vragen, reisverslagen en correcties zijn allemaal welkom. Reacties zijn openbaar.',
    formTitle: 'Laat een reactie achter',
    countOne: '1 reactie',
    countMany: '{n} reacties',
    empty: 'Nog geen reacties — schrijf de eerste.',
    loading: 'Reacties laden…',
    loadError: 'Reacties zijn momenteel niet beschikbaar.',
    retry: 'Opnieuw proberen',
    nameLabel: 'Naam',
    namePlaceholder: 'Hoe mogen we u aanspreken?',
    bodyLabel: 'Reactie',
    bodyPlaceholder: 'Deel uw ervaring, stel een vraag of voeg context toe…',
    submit: 'Reactie plaatsen',
    submitting: 'Plaatsen…',
    success: 'Geplaatst — bedankt voor het delen.',
    error: 'Uw reactie kon niet worden geplaatst. Probeer het later opnieuw.',
    rateLimited: 'Dat ging te snel. Wacht een paar minuten en probeer het opnieuw.',
    nameError: 'Voer een naam in (2–40 tekens).',
    bodyError: 'Schrijf een reactie (5–2000 tekens).',
    note: 'Reacties zijn openbaar en geven de mening van de auteurs weer. Blijf vriendelijk en plaats geen advertenties of persoonsgegevens.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Terminalindeling van ${name}`,
    gates: 'Gates',
    terminal: 'Terminal',
    corridor: 'Verbinding',
    transit: 'Openbaar vervoer',
    footer: (iata: string) => `${iata} · Terminalindeling`,
  },

  tool: {
    label: 'Online tools',
    hub: {
      kicker: 'Tools',
      title: 'Kaart- en coördinatentools',
      en: 'Gratis tools',
      sub: 'Gratis online tools voor reizigers en liefhebbers van geografie — werkt in de browser, niets te installeren.',
      description:
        'Gratis online kaart- en coördinatentools: conversie tussen WGS84 / GCJ02 / BD09, decimale graden ↔ DMS en grootcirkelafstand tussen twee punten. Tweetalig, direct in uw browser.',
      comingTitle: 'Meer tools in ontwikkeling',
      comingSub: 'Coördinaten prikken, locatie delen en projectiecalculators zijn onderweg.',
    },
    howTitle: 'Hoe te gebruiken',
    relatedTitle: 'Gerelateerde tools',
    allTools: 'Alle tools',
    tools: {
      coordinateConverter: {
        title: 'Coördinatenconverter',
        en: 'Coördinatenconverter',
        description:
          'Converteer tussen WGS84, GCJ02 en BD09 — de oplossing voor het verschoven-kaartprobleem in China.',
        note: 'WGS84 is de gps- en internationale standaard. GCJ02 is het verschoven coördinatenstelsel dat in vasteland-China verplicht is (bijgenaamd "Marscoördinaten"), gebruikt door AMap en Tencent Maps. BD09 voegt daar nog een verschuiving aan toe en wordt door Baidu Maps gebruikt. Dezelfde plek kan 100–700 m verschillen tussen systemen, dus converteer voordat u coördinaten in een andere kaartdienst hergebruikt.',
        steps: [
          'Voer decimale coördinaten in als breedtegraad, lengtegraad — bijv. 39.9042, 116.4074.',
          'Kies het coördinatenstelsel van uw invoer.',
          'Klik op "Converteren" voor de andere twee stelsels; gebruik "Kopiëren" om een resultaat te bewaren.',
        ],
        inputLabel: 'Coördinaten (breedtegraad, lengtegraad)',
        inputPlaceholder: 'bijv. 39.9042, 116.4074',
        sourceLabel: 'Invoer-coördinatenstelsel',
        wgs84: 'WGS84 · gps / internationaal',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Decimalen',
        submit: 'Converteren',
        copy: 'Kopiëren',
        copied: 'Gekopieerd',
        error: 'De coördinaten konden niet worden gelezen. Gebruik het formaat "breedtegraad, lengtegraad", bijv. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Coördinatenformaat-converter',
        en: 'Coördinatenformaat-converter',
        description:
          'Converteer tussen decimale graden (DD), graden-minuten (DM) en graden-minuten-seconden (DMS); het invoerformaat wordt automatisch herkend.',
        note: 'DD (39.9042°) is de gewone decimale stijl die apparaten en API’s gebruiken; DMS (39°54′15″N) is gangbaar in de scheepvaart, luchtvaart en landmeetkunde; DM (39°54.25′N) is typisch voor veldnotities. De tool herkent het invoerformaat aan het aantal getalgroepen per helft (1 = DD, 2 = DM, 3 = DMS) en geeft alle drie de stijlen weer, met N/Z/O/W voor de halfronden.',
        steps: [
          'Voer een paar coördinaten in — 39.9042, 39°54′15″N en 39°32.5′E werken allemaal; scheid de twee delen met een komma.',
          'Kies het aantal decimalen voor de uitvoer.',
          'Klik op "Converteren" — alle drie de formaten worden getoond; gebruik "Kopiëren" om er een te bewaren.',
        ],
        inputLabel: 'Coördinaten (één paar, kommagescheiden)',
        inputPlaceholder: 'bijv. 39°54′15″N, 116°24′51″E of 39.9042, 116.4074',
        precisionLabel: 'Decimalen',
        submit: 'Converteren',
        ddLabel: 'Decimale graden (DD)',
        dmLabel: 'Graden-minuten (DM)',
        dmsLabel: 'Graden-minuten-seconden (DMS)',
        copy: 'Kopiëren',
        copied: 'Gekopieerd',
        error: 'De coördinaten konden niet worden gelezen. Ondersteunde stijlen zijn onder meer 39.9042, 39°54′15″N en 39°32.5′E, gescheiden door een komma.',
      },
      distanceCalculator: {
        title: 'Afstandscalculator',
        en: 'Afstandscalculator',
        description:
          'Grootcirkelafstand tussen twee punten op aarde, plus de beginpeiling.',
        note: 'De afstand gebruikt de Haversine-grootcirkelformule (gemiddelde aardstraal 6.371,0088 km) — het kortste pad over het oppervlak. De beginpeiling is de kompasrichting van het eerste naar het tweede punt, 0° bij noord en met de klok mee toenemend.',
        steps: [
          'Voer de breedtegraad en lengtegraad van het begin- en eindpunt in.',
          'Klik op "Afstand berekenen".',
          'Krijg het resultaat in kilometers, mijlen en zeemijlen, plus de beginpeiling.',
        ],
        fromLabel: 'Van',
        toLabel: 'Naar',
        inputPlaceholder: 'breedtegraad, lengtegraad',
        example: 'Voorbeeld: Peking → Shanghai',
        submit: 'Afstand berekenen',
        km: 'km',
        mi: 'mi',
        nmi: 'nm',
        bearing: 'Beginpeiling',
        copy: 'Kopiëren',
        copied: 'Gekopieerd',
        error: 'De coördinaten konden niet worden gelezen. Gebruik het formaat "breedtegraad, lengtegraad" met breedtegraad -90–90 en lengtegraad -180–180.',
      },
    },
  },
};
