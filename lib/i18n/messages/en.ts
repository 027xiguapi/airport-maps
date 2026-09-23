import type { Messages } from './zh';

/**
 * English catalog. Typed against the Chinese source of truth, so any missing or
 * renamed key fails the build.
 */
export const en: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Airport & Terminal Maps',
    description:
      'Browse airport terminal maps organised by country and region. From major international hubs to regional airports, see detailed layouts of gates, check-in areas, baggage claim, shops, restaurants, lounges and ground transport.',
    keywords: [
      'airport maps',
      'terminal maps',
      'airport terminal layout',
      'gates',
      'airport transport',
      'airport guide',
    ],
    numberOfItems: (n: number) => `${n} airport${n === 1 ? '' : 's'}`,
  },

  nav: {
    home: 'Home',
    airports: 'All airports',
    countries: 'By country',
    tools: 'Online tools',
    about: 'About',
    label: 'Main navigation',
    languageLabel: 'Language',
    switchLanguage: 'Switch language',
    themeToggle: 'Toggle dark mode',
    menu: 'Menu',
  },

  common: {
    skipToContent: 'Skip to main content',
    backToTop: 'Back to top',
    breadcrumbLabel: 'Breadcrumb',
    home: 'Home',
    viewMap: 'View map',
    terminalMap: 'Terminal map',
    /** Airport page <title>/og:title, mirroring the Chinese "2026年最新…地图". */
    latestAirportTitle: (year: number, name: string, iata: string) =>
      `Latest ${name} (${iata}) Terminal Map ${year}`,
    airportGuide: 'Airport guide',
    lastUpdated: 'Recently updated',
    updatedOn: (date: string) => `Updated ${date}`,
    publishedOn: (date: string) => `Published ${date}`,
    readMore: 'Read the full guide',
  },

  units: {
    terminals: (n: number) => `${n} terminal${n === 1 ? '' : 's'}`,
    terminalsShort: (n: number) => `${n} terminal${n === 1 ? '' : 's'}`,
    gates: (n: number) => `${n} gate${n === 1 ? '' : 's'}`,
    airports: (n: number) => `${n} airport${n === 1 ? '' : 's'}`,
    airportsChip: (n: number) => `${n} airport${n === 1 ? '' : 's'}`,
    pax: 'Passengers',
    paxFull: 'Annual passengers',
    distance: 'To city centre',
    distanceFrom: (city: string) => `From central ${city}`,
    gatesLabel: (range: string) => `Gates ${range}`,
    gatesCount: (n: number) => `${n} gates`,
    satellite: 'Satellite concourse',
    airlinesLabel: 'Main airlines: ',
  },

  search: {
    ariaLabel: 'Search airports',
    placeholder: 'Search airports, cities or IATA codes',
    heroPlaceholder: 'Search by airport name, city or IATA code — e.g. LHR / Dubai / Heathrow',
    submit: 'Find airport',
    loading: 'Searching…',
    empty: 'No matching airports found',
    resultsTitle: (term: string) => `Search results for “${term}”`,
    resultsCount: (n: number) => `${n} matching airport${n === 1 ? '' : 's'} found.`,
    noResults: 'No airports matched. Try a different keyword, such as a city name or IATA code.',
    noResultsHint: 'Not finding the airport you want?',
    viewAll: (n: number) => `Browse all ${n} airports`,
    orBrowseByCountry: 'browse by country',
    range: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total} airports`,
  },

  hero: {
    eyebrow: 'World Airport Directory',
    titleLead: 'Explore airports and',
    titleAccent: 'terminal maps',
    sub: 'Find your way through any airport with our complete collection of airport and terminal maps, organised by country and region — from major international hubs to regional airports.',
    stats: {
      countries: 'Countries / regions',
      airports: 'Airports covered',
      terminals: 'Terminal maps',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'About this site',
      imageAlt: 'An airliner at the gate of a glass-fronted airport terminal at sunrise',
      blocks: [
        {
          title: 'Navigate Any Airport with Detailed Terminal Maps',
          body: 'Navigating airports and terminals worldwide can be challenging. Our comprehensive airport maps provide detailed layouts of terminals, gates, check-in areas, baggage claim, shops, restaurants, lounges and transportation hubs, so you can plan the route before you set off.',
        },
        {
          title: 'Interactive Airport Terminal Maps and Floor Plans',
          body: 'Major international airports feature multiple terminals and complex layouts. Our detailed airport maps help you locate gates, find amenities, plan connections and move efficiently through security checkpoints, departure areas and arrival halls — without doubling back.',
        },
        {
          title: 'Airport Transportation and Access Information',
          body: 'Beyond terminal layouts, our airport guides cover transportation options, parking information and access routes. Find the best way to reach your departure gate, connect between terminals, and use ground transportation including trains, buses, taxis and rental cars.',
        },
      ],
    },
    map: {
      kicker: 'World Map',
      title: 'Airport map',
      en: 'Airport Map',
      sub: (airports: string, world: string) =>
        `Locate ${world} scheduled airports worldwide — ${airports} of them with terminal maps here. Click a dot for its country/region and details.`,
      all: 'All',
      gEurope: 'Europe',
      gAsia: 'Asia',
      gAmericas: 'Americas',
      gAfrica: 'Africa',
      gOceania: 'Oceania',
      legendSite: 'Covered here · click for terminal maps',
      legendWorld: 'Other scheduled airports worldwide',
      countTemplate: '{n} airports shown',
      download: 'Download data',
      downloadTitle: 'Export every airport in the current filter as CSV (IATA, name, city, country, coordinates)',
      openAirport: 'View airport',
    },
    popular: {
      kicker: 'Terminal Maps',
      title: 'Popular airport maps',
      en: 'Airport Maps',
      sub: 'A rotating pick of terminal-map covers from airports worldwide — open an airport page for the full map.',
    },
    recent: {
      kicker: 'Freshly Published',
      title: 'Recently updated',
      en: 'Recently Updated',
      sub: 'New and newly revised airport maps.',
    },
    /** Homepage route-map strip: the widest direct networks, linking to /route/<IATA>. */
    routes: {
      kicker: 'Routes',
      title: 'Busiest airport route maps',
      en: 'Route Maps',
      sub: 'Airports ranked by how many places they fly to non-stop — open one for its route map, airlines and destination list.',
    },
    countries: {
      kicker: 'By Country',
      title: 'Airport maps by country',
      en: 'Countries',
      sub: 'Browse airport terminal maps organised by country and region, from major international hubs to regional airports.',
      more: 'All countries',
    },
    all: {
      kicker: 'All Maps',
      title: 'All airport maps',
      en: 'All Airports',
      sub: 'Airport maps for the world’s busiest airports and travel hubs.',
      hint: 'Select any airport to see its terminal layout.',
      more: 'View all',
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Airport',
    city: 'City',
    country: 'Country',
    size: 'Size',
    map: 'Map',
    empty: 'No airports match these filters. Try widening your selection.',
  },

  pager: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
  },

  filters: {
    searchPlaceholder: 'Search airports, cities or IATA codes',
    submit: 'Search',
    country: 'Country',
    all: 'All',
    sort: 'Sort',
    sortPax: 'Passengers',
    sortName: 'Name',
    sortIata: 'IATA code',
    sortUpdated: 'Last updated',
  },

  countries: {
    title: 'Browse airports by country',
    description:
      'Browse the global airport terminal map directory by country and region. From major international hubs to regional airports, see how many airports and terminals each country has.',
    sub: (countries: string, airports: string, terminals: string) =>
      `From major international hubs to regional airports — ${countries} countries and regions, ${airports} airports and ${terminals} terminals in total.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} countr${countries === 1 ? 'y' : 'ies'} · ${airports} airport${airports === 1 ? '' : 's'}`,
  },

  country: {
    title: (name: string) => `${name} airport maps`,
    description: (name: string, nameEn: string, region: string, count: number) =>
      `Terminal maps for ${count} airport${count === 1 ? '' : 's'} in ${name} (${nameEn}), covering the main international hubs and regional airports of ${region}. See gates, terminal layouts and ground transport.`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} AIRPORTS`,
    kicker: 'Airport Maps',
    titleOf: (name: string) => `Airports in ${name}`,
    en: 'Airports',
    sub: 'Select any airport to see its terminal layout, gate ranges and ground transport options.',
    empty: 'No airports are listed for this country or region yet.',
    moreKicker: 'Other Countries',
    moreTitle: 'Browse other countries',
    moreEn: 'More Countries',
    all: 'All countries',
    notFound: 'Country not found',

    /** Airport overview: assembled from database fields; a longer article can
        live in content/<locale>/countries/<CC>.md */
    introKicker: 'Overview',
    introTitle: (name: string) => `${name} airport overview`,
    introEn: 'Airport Overview',
    introSub:
      'The scale of this country or region\u2019s airports, its main hubs and the cities they serve.',
    introBody: (o: {
      name: string;
      nameEn: string;
      region: string;
      airports: string;
      terminals: string;
      gates: string;
      cities: string;
      busiest: string | null;
      busiestIata: string;
      busiestPax: string;
      mapsNote: string;
    }) =>
      // `o.nameEn` is empty when it equals `o.name` (both are "Japan").
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} lies in ${o.region}. This site covers ${o.airports}, ${o.terminals} and ${o.gates} there.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) is the largest by annual passengers, at ${o.busiestPax}.`
        : '') +
      ` The airports serve cities including ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Every airport has a terminal layout diagram, gate ranges and ground transport notes.',

    /** Related links */
    linksTitle: 'Related links',
    linksEn: 'Related Links',
    linksSub: 'Official sites and encyclopedia entries for the country and each of its airports.',
    linksCountry: (name: string) => `${name} reference`,
    linksAirports: (name: string) => `Airports in ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faqEn: 'Questions',
    faq: {
      airportCount: (name: string) => `Which airports are covered in ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `This site covers ${count} in ${name}: ${list}.`,
      busiest: (name: string) => `Which is the busiest airport in ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `By annual passengers, ${busiest} (${iata}) is the largest of the airports covered here, at ${pax}.`,
      terminals: (name: string) => `How many terminals do the airports in ${name} have?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `The airports covered in ${name} have ${terminals} with ${gates} in total: ${list}.`,
      cities: (name: string) => `Which cities in ${name} have airports?`,
      citiesAnswer: (name: string, cities: string) =>
        `The ${name} airports covered here serve cities including ${cities}. You can filter them by city or IATA code in the airport directory.`,
      maps: (name: string) => `Do the airports in ${name} have terminal maps?`,
      mapsAnswer: (name: string, count: string) =>
        `Yes. Every one of the ${count} covered in ${name} has a terminal layout diagram marking terminal buildings, gate ranges, main airlines and ground transport. Open any airport to see it.`,
    },
  },

  airport: {
    /** Meta description assembled from formatted airport facts. Terminals and
        gates are null for directory airports with no compiled counts. */
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
      `${o.name} (${o.iata}, ${o.nameEn}) serves ${o.city}, ${o.country}. ${
        o.terminals
          ? `Terminal maps, ${o.terminals.toLowerCase()} and ${o.gates?.toLowerCase()}`
          : 'Terminal map and gate layout'
      }${o.pax ? `, ${o.pax} passengers a year` : ''}${o.distance ? `, ${o.distance} from the city centre` : ''}.`,
    mapTitle: (iata: string) => `${iata} · Terminal layout`,
    mapNote: 'TERMINAL LAYOUT',
    realMapTitle: (iata: string) => `${iata} Airport Terminal Map — Gates & Navigation`,
    realMapNote: 'TERMINAL MAP',
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Zoom',
    zoomClose: 'Close',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    downloadKicker: 'Download',
    downloadTitle: 'Download Airport Maps',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) => `${year} Latest ${iata} Airport Terminal Map Download`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year} Latest ${iata} Airport Terminal Map PDF Download`,
    timeKicker: 'Time',
    timeTitle: (iata: string) => `Airport time information — ${iata} current time`,
    timeEn: 'Airport Time',
    timeSub: (iata: string, tz: string) => `Current time at ${iata} (${tz}) compared with your local time.`,
    clockAirport: 'Airport current time',
    clockLocal: 'Your local time',
    infoKicker: 'Info',
    infoTitle: 'Airport information & details',
    infoEn: 'Airport Details',
    infoIata: 'Airport IATA code',
    infoLocation: 'Airport location',
    infoCoords: 'Coordinates',
    infoTimezone: 'Timezone',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Links',
    linksTitle: 'Related links',
    linksEn: 'RELATED LINKS',
    linksSub: 'External references for this airport: the official website, Wikipedia and Baidu Baike.',
    officialSite: 'Official website',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    mapEmbedKicker: 'Map',
    mapEmbedTitle: (name: string) => `Interactive map — ${name} location`,
    mapEmbedEn: 'Interactive Map',
    extMapsNote: 'View this airport on other map services:',
    routeMapKicker: 'Routes',
    routeMapTitle: (name: string) => `${name} route map — direct destinations`,
    routeMapEn: 'Route Map',
    routeMapAria: (name: string) => `Map of direct routes from ${name}`,
    routeLegendTitle: 'Colour key',
    routeLegendClose: 'Hide the legend',
    routeReset: 'Reset map',
    routeZoomIn: 'Zoom in',
    routeZoomOut: 'Zoom out',
    routeFullscreen: 'View fullscreen',
    routeExitFullscreen: 'Exit fullscreen',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Open the {iata} airport page',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6+ airlines',
      major: '3–5 airlines',
      minor: '2 airlines',
      single: '1 airline',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} airlines',
    routeTableDest: 'Destination',
    routeTableCountry: 'Country/region',
    routeTableDistance: 'Distance',
    routeTableCarriers: 'Airlines',
    routeCarriersMore: (n: number) => ` +${n} more`,
    routeMapNote: (date: string) =>
      `Route data snapshot: ${date}; direct flights only. Source: `,
    legendTerminal: 'Terminal building',
    legendTransit: 'Ground transport node',
    legendCorridor: 'Inter-terminal link',
    terminalsKicker: 'Terminals',
    terminalsTitle: 'Terminal guide',
    terminalsEn: 'Terminal Guide',
    terminalsSub: (name: string) =>
      `Gate ranges, main airlines and facilities for each terminal at ${name}.`,
    transitTitle: 'Ground transport',
    facilitiesTitle: 'Airport facilities',
    faqKicker: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faqEn: 'Questions',
    guideKicker: 'Guide',
    guideTitle: 'Airport guide',
    guideEn: 'Airport Guide',
    relatedTitle: (country: string) => `Other airports in ${country}`,
    relatedEn: (country: string) => `More in ${country}`,
    relatedAll: (country: string) => `All airports in ${country}`,
    notFound: 'Airport not found',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Latest ${name} (${iata}) Route Map ${year} — ${count} direct destinations`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Direct route map for ${name} (${iata}): ${count} destinations with operating airlines and distances, plus the full destination list.`,
    heading: (name: string) => `${name} route map`,
    headingSub: (iata: string, count: string) =>
      `${iata} has ${count} direct destinations, coloured by how many airlines serve each.`,
    backToAirport: (iata: string) => `Back to the ${iata} airport page`,
    /** Button on the airport page's teaser card. */
    openFull: 'View route map',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `View the full ${iata} route map`,
    teaserSub: (count: string) => `${count} direct destinations: map, operating airlines and distances.`,
    /** Figure on a tile of the homepage's route strip. */
    cardMeta: (count: string) => `${count} direct destinations`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `${name} direct route map`,
    tableKicker: (iata: string) => `${iata} · Destinations`,
    tableSectionTitle: (name: string) => `${name} direct destination list`,
    tableSectionEn: (iata: string) => `${iata} Destinations`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Destinations',
    tableSectionSub: (count: string) =>
      `${count} destinations, busiest first by number of operating airlines, with distance and carriers.`,
    dataKicker: 'Download',
    dataTitle: 'Route data download',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} direct routes with destination, IATA code, city, country, distance and operating airlines — ready for a spreadsheet or a script.`,
    dataFields: 'CSV suits Excel / Numbers, JSON suits code; both are UTF-8.',
    dataCsv: 'Download CSV',
    dataJson: 'Download JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Terminal and gate layout at a glance — click the image for the full map, terminal facilities and ground transport on the airport page.',
    airportMapCta: (iata: string) => `See the full ${iata} terminal map`,
    /** Header fact cells. */
    factDestinations: 'Direct destinations',
    factAirlines: 'Airlines',
    factCountries: 'Countries',
    factSnapshot: 'Data snapshot',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `How many places does ${name} fly to non-stop?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) has ${count} direct destinations across ${countries} countries and territories. Only non-stop routes are counted; itineraries with a stop are not.`,
    faqAirlinesQ: (name: string) => `How many airlines fly from ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} airlines operate direct routes from this airport. The widest networks are ${leaders} (destination count in brackets).`,
    faqFarthestQ: (name: string) => `What is the farthest non-stop destination from ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `The farthest direct destination is ${city}, ${country} ${iata}, about ${km} km away.`,
    faqBusiestQ: () => 'Which destinations have the most competition?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinations are served by three or more airlines; the busiest are ${list}.`,
    faqSourceQ: () => 'How often is the route data updated?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Routes on this page come from the ${source} open dataset (${license}), a ${date} snapshot rather than a live schedule — check the airline or airport for tickets and timings.`,
  },

  faq: {
    terminalCount: (name: string) => `How many terminals does ${name} have?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) has ${terminals} terminals with ${gates} gates in total: ${list}.`,
    distance: (name: string, city: string) => `How far is ${name} from central ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} is about ${distance} from central ${city}. You can reach the city by ${transit}.`,
    access: (name: string, city: string) => `How do I get from ${name} into ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `What facilities does ${name} offer?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} offers ${facilities}. See the terminal layout above for how these are distributed between terminals.`,
    location: (name: string) => `Where is ${name} located?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA code ${iata}) is located in ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Which airlines operate from each terminal at ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Main airlines by terminal at ${name}: ${list}. Airlines and gate assignments change, so always confirm on your boarding pass and the airport's own signage.`,
    timezone: (name: string) => `What time zone is ${name} in?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) is in the ${tz} time zone. Compare it with your local time using the airport clock above.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'World Airport Maps Editorial Team',
    role: 'Compiled & reviewed by ',
    sourcesNote: 'Compiled from public sources and official airport information',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'On this page',
    map: 'Terminal map',
    time: 'Airport time',
    details: 'Airport details',
    links: 'Related links',
    location: 'Location map',
    routes: 'Route map',
    guide: 'Airport guide',
    terminals: 'Terminal guide',
    transport: 'Ground transport',
    facilities: 'Facilities',
    faq: 'FAQ',
    intro: 'Airport overview',
    airports: 'Airport list',
  },

  error: {
    title: 'This page could not be loaded',
    sub: 'Something went wrong while reading the airport data. Please try again, or head back to the homepage to keep browsing.',
    retry: 'Try again',
    backHome: 'Back to homepage',
    notFoundTitle: '404 · Page not found',
    notFoundSub: 'The page you requested may have been moved or removed. Try searching for an airport, or continue from the links below.',
  },

  footer: {
    mapsTitle: 'Detailed terminal maps',
    mapsBody:
      'Navigating airports and their terminals can be a challenge. Our airport maps show detailed layouts of terminals, gates, check-in areas, baggage claim, shops, restaurants, lounges and transport interchanges so your journey runs more smoothly.',
    plansTitle: 'Interactive terminal plans',
    plansBody:
      'Major international airports have multiple terminals and complex layouts. Our detailed maps help you locate your gate, find facilities, plan a connection and move efficiently through security, departures and arrivals.',
    transitTitle: 'Airport transport and access',
    transitBody:
      'Beyond terminal layouts we also cover transport options, parking and access routes — how to reach your gate, transfer between terminals, and use ground transport including trains, buses, taxis and car hire.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} countries / regions · ${airports} airports · ${terminals} terminals · illustrated terminal layouts`,
    fallback: 'Illustrated terminal layouts and ground transport guides for airports worldwide',
    linksLabel: 'Footer navigation',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: 'Rail',
    tram: 'Tram',
    bus: 'Bus',
    taxi: 'Taxi',
    car: 'Car & parking',
    ferry: 'Ferry',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Browse',
    title: 'Browse by area',
    en: 'Browse by area',
    sub: 'Enter the directory from whichever angle suits you: by country, by region, by city — or go straight to the busiest hubs, the latest updates and the airport guides.',
    allAirports: {
      title: 'All airports',
      body: 'The complete directory, ranked by passenger volume, filterable by country and re-sortable.',
    },
    byCountry: {
      title: 'By country',
      body: 'See how many airports, terminals and gates each country or region has.',
    },
    byRegion: {
      title: 'By region',
      body: 'Countries grouped into East Asia, Europe, North America and the rest, for faster targeting.',
    },
    popularCities: {
      title: 'Popular cities',
      body: 'The busiest airport cities by total annual passengers, and every airport in each.',
    },
    recentlyUpdated: {
      title: 'Recently updated',
      body: 'Newly added and newly revised airport records, most recent first.',
    },
    guides: {
      title: 'Airport guides',
      body: 'Long-form guides to terminal transfers, getting into the city and practical tips.',
    },
    routes: {
      title: 'Route maps',
      body: 'See an airport’s non-stop network, ranked by destination count, with airlines and distances.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guides',
    title: 'Airport guides',
    en: 'Airport guides',
    sub: 'Beyond the terminal diagrams, we have written long-form guides for selected hubs: how to read the gate numbering, how to move between terminals and how to get into the city.',
    more: 'View this airport',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Terminal layout diagram for ${name}`,
    gates: 'Gates',
    terminal: 'Terminal',
    corridor: 'Link',
    transit: 'Ground transport',
    footer: (iata: string) => `${iata} · Terminal layout`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Online tools',
    hub: {
      kicker: 'Tools',
      title: 'Map and coordinate tools',
      en: 'Free Tools',
      sub: 'Free online tools for travellers and geography lovers — open in a browser, nothing to install.',
      description:
        'Free online map and coordinate tools: WGS84 / GCJ02 / BD09 coordinate conversion, decimal degrees ↔ DMS formatting and great-circle distance between two points. Bilingual, ready in your browser.',
      comingTitle: 'More tools in development',
      comingSub: 'Coordinate picking, location sharing and projection calculators are on the way.',
    },
    howTitle: 'How to use',
    relatedTitle: 'Related tools',
    allTools: 'All tools',
    tools: {
      coordinateConverter: {
        title: 'Coordinate converter',
        en: 'Coordinate Converter',
        description:
          'Convert between WGS84, GCJ02 and BD09 — the fix for the China map offset problem.',
        note: 'WGS84 is the GPS and international standard. GCJ02 is the offset coordinate system required in mainland China (nicknamed "Mars coordinates"), used by AMap and Tencent Maps. BD09 adds a further offset on top of GCJ02 and is used by Baidu Maps. The same spot can differ by 100–700 m across systems, so convert before reusing coordinates in another map service.',
        steps: [
          'Enter decimal coordinates as latitude, longitude — e.g. 39.9042, 116.4074.',
          'Choose the coordinate system your input uses.',
          'Hit "Convert" to get the other two systems; use "Copy" to save a result.',
        ],
        inputLabel: 'Coordinates (latitude, longitude)',
        inputPlaceholder: 'e.g. 39.9042, 116.4074',
        sourceLabel: 'Input coordinate system',
        wgs84: 'WGS84 · GPS / international',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Decimal places',
        submit: 'Convert',
        copy: 'Copy',
        copied: 'Copied',
        error: 'Could not parse the coordinates. Use the "latitude, longitude" format, e.g. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Coordinate format converter',
        en: 'Coordinate Format Converter',
        description:
          'Convert between decimal degrees (DD), degrees-minutes (DM) and degrees-minutes-seconds (DMS); the input format is detected automatically.',
        note: 'DD (39.9042°) is the plain-decimal style devices and APIs use; DMS (39°54′15″N) is common in maritime, aviation and surveying; DM (39°54.25′N) is typical for field records. The tool detects the input format from how many number groups each half contains (1 = DD, 2 = DM, 3 = DMS) and outputs all three styles, with N/S/E/W for the hemispheres.',
        steps: [
          'Enter a pair of coordinates — 39.9042, 39°54′15″N and 39°32.5′E styles all work; separate the two halves with a comma.',
          'Choose the number of decimal places for the output.',
          'Hit "Convert" — all three formats are listed; use "Copy" to save one.',
        ],
        inputLabel: 'Coordinates (one pair, comma-separated)',
        inputPlaceholder: 'e.g. 39°54′15″N, 116°24′51″E or 39.9042, 116.4074',
        precisionLabel: 'Decimal places',
        submit: 'Convert',
        ddLabel: 'Decimal degrees (DD)',
        dmLabel: 'Degrees-minutes (DM)',
        dmsLabel: 'Degrees-minutes-seconds (DMS)',
        copy: 'Copy',
        copied: 'Copied',
        error: 'Could not parse the coordinates. Supported styles include 39.9042, 39°54′15″N and 39°32.5′E, separated by a comma.',
      },
      distanceCalculator: {
        title: 'Distance calculator',
        en: 'Distance Calculator',
        description:
          'Great-circle distance between two points on Earth, plus the initial bearing.',
        note: 'Distance uses the Haversine great-circle formula (mean Earth radius 6,371.0088 km) — the shortest path along the surface. The initial bearing is the compass direction from the first point towards the second, 0° at north and increasing clockwise.',
        steps: [
          'Enter the latitude and longitude of the start and end points.',
          'Hit "Calculate distance".',
          'Get the result in kilometres, miles and nautical miles, plus the initial bearing.',
        ],
        fromLabel: 'From',
        toLabel: 'To',
        inputPlaceholder: 'latitude, longitude',
        example: 'Example: Beijing → Shanghai',
        submit: 'Calculate distance',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Initial bearing',
        copy: 'Copy',
        copied: 'Copied',
        error: 'Could not parse the coordinates. Use the "latitude, longitude" format with latitude -90–90 and longitude -180–180.',
      },
    },
  },
};
