import type { Messages } from './zh';

/** "1 numero di volo" / "2 numeri di volo" for already-formatted counts. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'grande aeroporto',
  medium: 'aeroporto di medie dimensioni',
  small: 'piccolo aeroporto',
  heliport: 'eliporto',
} as const;

/**
 * "a" / "di" before a city name. Italian exonyms that carry an article need the
 * contracted form — "al Cairo", "dell’Avana" — so these helpers handle the four
 * values that do (Il Cairo, L’Avana, La Valletta, La Paz takes none); every other
 * name takes the plain preposition.
 */
const cityA = (city: string) =>
  /^Il /.test(city) ? `al ${city.slice(3)}` : /^L’/.test(city) ? `all’${city.slice(2)}` : /^La /.test(city) ? `alla ${city.slice(3)}` : `a ${city}`;
const cityDi = (city: string) =>
  /^Il /.test(city) ? `del ${city.slice(3)}` : /^L’/.test(city) ? `dell’${city.slice(2)}` : /^La /.test(city) ? `della ${city.slice(3)}` : `di ${city}`;

/**
 * Airport names in running Italian take a definite article — "l’aeroporto di
 * Monaco conta 2 terminal" — while the same name stands bare in headings and
 * metadata titles. These helpers add the article only where a sentence needs it;
 * directory airports still carry their English name ("Anaa Airport") and are
 * left alone.
 */
const lowerFirst = (name: string) => `l’${name[0].toLowerCase()}${name.slice(1)}`;
const air = (name: string) => (/^Aeroporto/i.test(name) ? lowerFirst(name) : name);
const airDi = (name: string) =>
  /^Aeroporto/i.test(name)
    ? `dell’${name[0].toLowerCase()}${name.slice(1)}`
    : /^[AEIOU]/i.test(name)
      ? `d’${name}`
      : `di ${name}`;
const airA = (name: string) =>
  /^Aeroporto/i.test(name) ? `all’${name[0].toLowerCase()}${name.slice(1)}` : `a ${name}`;
const airDa = (name: string) =>
  /^Aeroporto/i.test(name) ? `dall’${name[0].toLowerCase()}${name.slice(1)}` : `da ${name}`;

/** Sentence-initial form of `air()`: "L’aeroporto …" always starts capitalised. */
const airStart = (name: string) => {
  const value = air(name);
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Italian catalog. Typed against the Chinese source of truth, so any missing or
 * renamed key fails the build.
 *
 * Country names lead as labels ("Cina — regione: Asia orientale") because most
 * Italian country names need an article as subject ("la Cina", "il Giappone",
 * "gli Stati Uniti") and one template cannot choose the right one from the name
 * alone. Airport names use the `air*` helpers above.
 */
export const it: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Mappe degli aeroporti e dei terminal',
    description:
      'Esplora le mappe dei terminal degli aeroporti, organizzate per paese e regione. Dai grandi hub internazionali agli aeroporti regionali, scopri la disposizione dettagliata di gate, aree check-in, ritiro bagagli, negozi, ristoranti, lounge e collegamenti terrestri.',
    keywords: [
      'mappe aeroporti',
      'mappe dei terminal',
      'pianta terminal aeroporto',
      'gate',
      'trasporti aeroporto',
      'guida aeroporto',
    ],
    numberOfItems: (n: number) => `${n} aeroport${n === 1 ? 'o' : 'i'}`,
  },

  nav: {
    home: 'Home',
    airports: 'Tutti gli aeroporti',
    countries: 'Per paese',
    tools: 'Strumenti online',
    about: 'Chi siamo',
    label: 'Navigazione principale',
    languageLabel: 'Lingua',
    switchLanguage: 'Cambia lingua',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'In preparazione',
    languagePlannedHint: 'Questa versione linguistica non è ancora pubblicata.',
    themeToggle: 'Attiva/disattiva la modalità scura',
    menu: 'Menu',
  },

  common: {
    skipToContent: 'Vai al contenuto principale',
    backToTop: 'Torna in alto',
    breadcrumbLabel: 'Percorso di navigazione',
    home: 'Home',
    viewMap: 'Vedi la mappa',
    terminalMap: 'Mappa del terminal',
    /** Accessible iframe title on the ad slots (components/ads/). */
    advertisement: 'Pubblicità',
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
        ? `${name} (${iata}): ${counts.terminals} terminal${
            counts.gates > 0 ? `, ${counts.gates} gate` : ''
          } — Mappa dei terminal`
        : `${name} (${iata}) — Mappa della posizione e guida ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — mappa dei terminal` : name,
    airportGuide: 'Guida dell’aeroporto',
    lastUpdated: 'Aggiornato di recente',
    updatedOn: (date: string) => `Aggiornato il ${date}`,
    publishedOn: (date: string) => `Pubblicato il ${date}`,
    readMore: 'Leggi la guida completa',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Terminal',
    gatesFact: 'Gate',
    /** "terminal" and "gate" are invariable in Italian. */
    terminals: (n: number) => `${n} terminal`,
    terminalsShort: (n: number) => `${n} terminal`,
    gates: (n: number) => `${n} gate`,
    airports: (n: number) => `${n} aeroport${n === 1 ? 'o' : 'i'}`,
    airportsChip: (n: number) => `${n} aeroport${n === 1 ? 'o' : 'i'}`,
    pax: 'Passeggeri',
    paxFull: 'Passeggeri annui',
    distance: 'Dal centro',
    distanceFrom: (city: string) => `Dal centro ${cityDi(city)}`,
    gatesLabel: (range: string) => `Gate ${range}`,
    gatesCount: (n: number) => `${n} gate`,
    satellite: 'Satellite',
    airlinesLabel: 'Compagnie principali: ',
  },

  search: {
    ariaLabel: 'Cerca un aeroporto',
    placeholder: 'Cerca un aeroporto, una città o un codice IATA',
    heroPlaceholder: 'Cerca per nome dell’aeroporto, città o codice IATA — es. LHR / Dubai / Heathrow',
    submit: 'Trova l’aeroporto',
    loading: 'Ricerca in corso…',
    empty: 'Nessun aeroporto corrispondente',
    resultsTitle: (term: string) => `Risultati per «${term}»`,
    resultsCount: (n: number) =>
      `${n} aeroport${n === 1 ? 'o corrispondente trovato' : 'i corrispondenti trovati'}.`,
    noResults: 'Nessun aeroporto corrispondente. Prova con un’altra parola chiave, come il nome di una città o un codice IATA.',
    noResultsHint: 'Non trovi l’aeroporto che cerchi?',
    viewAll: (n: number) => `Sfoglia tutti i ${n} aeroporti`,
    orBrowseByCountry: 'sfoglia per paese',
    range: (from: number, to: number, total: number) =>
      `Visualizzazione da ${from} a ${to} di ${total} aeroporti`,
  },

  hero: {
    eyebrow: 'Atlante mondiale degli aeroporti',
    titleLead: 'Esplora gli aeroporti e le',
    titleAccent: 'mappe dei terminal',
    sub: 'Orienta i tuoi spostamenti in qualsiasi aeroporto con la nostra raccolta completa di mappe aeroportuali e piante dei terminal, organizzate per paese e regione — dai grandi hub internazionali agli aeroporti regionali.',
    stats: {
      countries: 'Paesi e regioni',
      airports: 'Aeroporti coperti',
      terminals: 'Mappe dei terminal',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'Informazioni su questo sito',
      imageAlt: 'Un aereo di linea al gate di un terminal aeroportuale con facciata in vetro all’alba',
      blocks: [
        {
          title: 'Orientati in qualsiasi aeroporto con piante dettagliate dei terminal',
          body: 'Muoversi negli aeroporti e nei terminal di tutto il mondo può essere complicato. Le nostre mappe complete mostrano la disposizione dettagliata di terminal, gate, aree check-in, ritiro bagagli, negozi, ristoranti, lounge e snodi di trasporto, così puoi pianificare il percorso prima di partire.',
        },
        {
          title: 'Mappe interattive dei terminal e delle planimetrie',
          body: 'I grandi aeroporti internazionali hanno più terminal e disposizioni complesse. Le nostre mappe dettagliate ti aiutano a trovare il gate, individuare i servizi, pianificare una coincidenza e attraversare rapidamente i controlli di sicurezza, le aree partenze e le sale arrivi — senza tornare indietro.',
        },
        {
          title: 'Trasporti e accesso all’aeroporto',
          body: 'Oltre alle planimetrie, le nostre guide coprono i mezzi di trasporto, i parcheggi e i percorsi di accesso. Scopri il modo migliore per raggiungere il gate, spostarti tra i terminal e usare i trasporti terrestri: treno, autobus, taxi o auto a noleggio.',
        },
      ],
    },
    map: {
      kicker: 'Mappa mondiale',
      title: 'Mappa degli aeroporti',
      en: 'Mappa degli aeroporti',
      sub: (airports: string, world: string) =>
        `Localizza ${world} aeroporti con voli di linea nel mondo — ${airports} dei quali con la mappa dei terminal su questo sito. Fai clic su un punto per il paese o la regione e i dettagli.`,
      all: 'Tutti',
      gEurope: 'Europa',
      gAsia: 'Asia',
      gAmericas: 'Americhe',
      gAfrica: 'Africa',
      gOceania: 'Oceania',
      legendSite: 'Coperti qui · clicca per le mappe dei terminal',
      legendWorld: 'Altri aeroporti con voli di linea nel mondo',
      countTemplate: '{n} aeroporti visualizzati',
      download: 'Scarica i dati',
      downloadTitle: 'Esporta tutti gli aeroporti del filtro attuale in CSV (IATA, nome, città, paese, coordinate)',
      openAirport: 'Vedi l’aeroporto',
    },
    popular: {
      kicker: 'Mappe dei terminal',
      title: 'Mappe degli aeroporti più popolari',
      en: 'Mappe degli aeroporti',
      sub: 'Una selezione a rotazione delle copertine delle mappe dei terminal di tutto il mondo — apri la pagina di un aeroporto per la mappa completa.',
    },
    recent: {
      kicker: 'Novità',
      title: 'Aggiornati di recente',
      en: 'Aggiornamenti recenti',
      sub: 'Aeroporti, paesi e guide di viaggio nuovi o appena rivisti.',
      countriesTitle: 'Paesi aggiornati di recente',
    },
    /** Homepage route-map strip: the widest direct networks, linking to /route/<IATA>. */
    routes: {
      kicker: 'Rotte',
      title: 'Mappe delle rotte più trafficate',
      en: 'Mappe delle rotte',
      sub: 'Aeroporti ordinati per numero di destinazioni servite senza scalo — aprine uno per la mappa delle rotte, le compagnie e l’elenco delle destinazioni.',
    },
    countries: {
      kicker: 'Per paese',
      title: 'Mappe degli aeroporti per paese',
      en: 'Paesi',
      sub: 'Sfoglia le mappe dei terminal organizzate per paese e regione, dai grandi hub internazionali agli aeroporti regionali.',
      more: 'Tutti i paesi',
    },
    all: {
      kicker: 'Tutte le mappe',
      title: 'Tutte le mappe degli aeroporti',
      en: 'Tutti gli aeroporti',
      sub: 'Mappe degli aeroporti più trafficati del mondo e dei grandi snodi di viaggio.',
      hint: 'Seleziona un aeroporto per vedere la disposizione dei suoi terminal.',
      more: 'Vedi tutto',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Elenchi e tabelle',
      title: 'I dati aeroportuali in breve',
      en: 'Elenchi e tabelle',
      sub: 'Le cifre dell’atlante presentate come elenchi e tabelle: copertura, aeroporti più trafficati per passeggeri annui e ripartizione per regione.',
      coverageTitle: 'Copertura in breve',
      coverage: {
        airports: 'Aeroporti',
        countries: 'Paesi e regioni',
        regions: 'Regioni del mondo',
        cities: 'Città',
        terminals: 'Terminal',
        gates: 'Gate',
        routes: 'Mappe delle rotte',
      },
      busiest: {
        title: 'Aeroporti più trafficati per passeggeri annui',
        sub: 'I 12 aeroporti con il maggior traffico passeggeri annuo, in classifica.',
        caption: 'Aeroporti ordinati per traffico passeggeri annuo',
        rank: 'Posizione',
        iata: 'IATA',
        airport: 'Aeroporto',
        city: 'Città',
        country: 'Paese',
        terminals: 'Terminal',
        gates: 'Gate',
        pax: 'Passeggeri annui (M)',
      },
      regions: {
        title: 'Aeroporti per regione',
        sub: 'Numero di aeroporti, terminal e gate raggruppati per regione del mondo.',
        caption: 'Aeroporti raggruppati per regione del mondo',
        region: 'Regione',
        airports: 'Aeroporti',
        terminals: 'Terminal',
        gates: 'Gate',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Aeroporto',
    city: 'Città',
    country: 'Paese',
    size: 'Dimensione',
    map: 'Mappa',
    empty: 'Nessun aeroporto corrisponde a questi filtri. Prova ad ampliare la selezione.',
  },

  pager: {
    label: 'Paginazione',
    previous: 'Pagina precedente',
    next: 'Pagina successiva',
  },

  filters: {
    searchPlaceholder: 'Cerca un aeroporto, una città o un codice IATA',
    submit: 'Cerca',
    country: 'Paese',
    all: 'Tutti',
    sort: 'Ordina',
    sortPax: 'Passeggeri',
    sortName: 'Nome',
    sortIata: 'Codice IATA',
    sortUpdated: 'Ultimo aggiornamento',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Tutte le mappe degli aeroporti — ${country}${sortLabel ? `, ordinate per ${sortLabel}` : ''}`
        : `Tutte le mappe degli aeroporti — ordinate per ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Tutte le mappe degli aeroporti della categoria «${country}» in un’unica pagina: piante dei terminal, fasce di gate e trasporti terrestri${sortLabel ? `, ordinate per ${sortLabel}` : ''}.`
        : `L’atlante completo delle mappe degli aeroporti in un’unica pagina: piante dei terminal, fasce di gate e trasporti terrestri${sortLabel ? `, ordinate per ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Sfoglia gli aeroporti per paese',
    description:
      'Sfoglia l’atlante mondiale delle mappe dei terminal per paese e regione. Dai grandi hub internazionali agli aeroporti regionali, scopri quanti aeroporti e terminal ha ciascun paese.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Dai grandi hub internazionali agli aeroporti regionali — ${countries} paesi e regioni, ${airports} aeroporti e ${terminals} terminal in totale.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} paesi · ${airports} aeroport${airports === 1 ? 'o' : 'i'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count
        ? `${name} — mappe degli aeroporti, ${count} aeroporti`
        : `${name} — mappe degli aeroporti`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''}: ${total} aeroporti con voli di linea, di cui ${count} trattati su questo sito. Mappa di distribuzione, elenco nazionale completo e rotte dirette. Regione: ${region}.`
        : `${name} (${nameEn}): mappe dei terminal per ${count} aeroport${count === 1 ? 'o' : 'i'}, dai grandi hub internazionali agli aeroporti regionali. Gate, disposizione dei terminal e trasporti terrestri. Regione: ${region}.`,
    chip: (nameEn: string) => `AEROPORTI — ${nameEn.toUpperCase()}`,
    kicker: 'Mappe degli aeroporti',
    titleOf: (name: string) => `Aeroporti — ${name}`,
    en: 'Aeroporti',
    sub: 'Seleziona un aeroporto per vedere la disposizione dei terminal, le fasce di gate e le opzioni di trasporto terrestre.',
    empty: 'Non ci sono ancora aeroporti elencati per questo paese o regione.',
    moreKicker: 'Altri paesi',
    moreTitle: 'Sfoglia altri paesi',
    moreEn: 'Altri paesi',
    all: 'Tutti i paesi',
    notFound: 'Paese non trovato',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Panoramica',
    introTitle: (name: string) => `${name} — panoramica degli aeroporti`,
    introEn: 'Panoramica degli aeroporti',
    introSub:
      'La dimensione della rete aeroportuale del paese o della regione, i suoi hub principali e le città servite.',
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
      // `o.nameEn` is empty when it equals `o.name` (both are "Japan"). The name
      // leads as a label ("Cina — regione: Asia orientale") because Italian
      // country names take an article as subject ("la Cina", "il Giappone").
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} — regione: ${o.region}. Questo sito ne elenca ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` e ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${airStart(o.busiest)} (${o.busiestIata}) è il più trafficato per passeggeri annui, con ${o.busiestPax}.`
        : '') +
      ` Gli aeroporti servono città come ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Ogni pagina aeroporto raccoglie la mappa della posizione e i codici, oltre alle informazioni su terminal, gate e trasporti terrestri disponibili.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Distribuzione',
      title: (name: string) => `${name} — mappa di distribuzione degli aeroporti`,
      en: 'Distribuzione degli aeroporti',
      sub: (covered: string, total: string) =>
        `${total} aeroporti con voli di linea in tutto il paese (grandi, medi e piccoli); ${covered} di essi hanno una pagina dedicata su questo sito. Segue l’elenco completo.`,
      mapAlt: (name: string, total: string) =>
        `Mappa di distribuzione degli aeroporti — ${name}: ${total} aeroporti con voli di linea`,
      siteTag: 'Coperti qui',
      colAirport: 'Aeroporto',
      colCity: 'Città',
      colType: 'Tipo',
      types: {
        large: 'Grande',
        medium: 'Medio',
        small: 'Piccolo',
      },
      empty: 'Nessun elenco nazionale di aeroporti disponibile al momento.',
    },

    /** Related links */
    linksTitle: 'Link utili',
    linksEn: 'Link utili',
    linksSub: 'Siti ufficiali e voci enciclopediche sul paese e su ciascuno dei suoi aeroporti.',
    linksCountry: (name: string) => `${name} — riferimenti`,
    linksAirports: (name: string) => `Aeroporti — ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Domande frequenti',
    faqEn: 'Domande',
    faq: {
      airportTotal: () => 'Quanti aeroporti ci sono in questo paese o regione?',
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}: ${total} aeroporti con servizio passeggeri di linea (grandi, medi e piccoli); questo sito ne descrive ${covered} in dettaglio. Vedi la mappa di distribuzione e l’elenco completo qui sopra.`,
      airportCount: () => 'Quali aeroporti sono coperti qui?',
      airportCountAnswer: (name: string, count: string, list: string) =>
        `${name}: questo sito copre ${count} aeroporti, ovvero ${list}.`,
      busiest: () => 'Qual è l’aeroporto più trafficato di questo paese?',
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Per passeggeri annui, ${busiest} (${iata}) è il più importante tra gli aeroporti coperti qui, con ${pax}.`,
      terminals: () => 'Quanti terminal hanno gli aeroporti di questo paese?',
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name} — ${terminals} e ${gates} in totale: ${list}.`,
      cities: () => 'Quali città di questo paese hanno un aeroporto?',
      citiesAnswer: (name: string, cities: string) =>
        `${name} — gli aeroporti coperti servono città come ${cities}. Puoi filtrarli per città o codice IATA nell’atlante.`,
      maps: () => 'Gli aeroporti di questo paese hanno mappe dei terminal?',
      mapsAnswer: (name: string, count: string) =>
        `In parte. Le pagine degli aeroporti riportano mappa della posizione, codici e rotte dirette; dove i dati sui terminal sono disponibili mostrano anche lo schema dei terminal, le fasce di gate e i trasporti terrestri. ${name}: apri un aeroporto per vedere cosa contiene — sono ${count} quelli coperti.`,
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
        ? `${airStart(o.name)} (${o.iata}) ha ${o.terminals} terminal${
            o.gates ? ` e ${o.gates} gate` : ''
          }${o.pax ? `, con ${o.pax} di passeggeri l’anno` : ''}${
            o.distance ? `, a ${o.distance} dal centro` : ''
          }. Mappa dei terminal, fasce di gate e trasporti terrestri.`
        : `${airStart(o.name)} (${o.iata}) serve ${o.city} (${o.country}). Mappa della posizione, codici aeroportuali e informazioni di viaggio.`,
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
      const where = o.city === o.country ? o.city : `${o.city} (${o.country})`;
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'aeroporto';
      const head = `${airStart(o.name)} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) è un ${kind} che serve ${where}`;
      return o.terminals > 0
        ? `${head}, con ${o.terminals} terminal${
            o.gates > 0 ? ` e ${o.gates} gate` : ''
          }${o.distance ? `, a circa ${o.distance} dal centro` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Disposizione dei terminal`,
    mapNote: 'DISPOSIZIONE DEI TERMINAL',
    realMapTitle: (iata: string) => `Mappa dei terminal dell’aeroporto ${iata} — gate e orientamento`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Mappa dei terminal di ${name} (${iata}): terminal, fasce di gate e satellite`,
    realMapNote: 'MAPPA DEI TERMINAL',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Foto',
    photosTitle: 'Foto dell’aeroporto',
    photosEn: 'Foto dell’aeroporto',
    photosSub:
      'Foto reali di questo aeroporto, ciascuna attribuita alla pagina web pubblica in cui è stata trovata; il copyright resta dei fotografi originali. Clicca una foto per ingrandirla, o una riga di credito per aprire la pagina di origine.',
    photosCredit: (host: string) => `Fonte: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Foto ${index} dell’aeroporto ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Ingrandisci la foto ${index} ${airDi(name)}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Zoom',
    zoomClose: 'Chiudi',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    downloadKicker: 'Download',
    downloadTitle: 'Scarica le mappe dell’aeroporto',
    downloadEn: 'Download',
    downloadMapLabel: (year: number, iata: string) =>
      `Mappa dei terminal ${iata} ${year} — planimetria da scaricare`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Mappa dei terminal ${iata} ${year} — download PDF`,
    timeKicker: 'Ora',
    timeTitle: (iata: string) => `Ora dell’aeroporto — ora attuale a ${iata}`,
    timeEn: 'Ora dell’aeroporto',
    timeSub: (iata: string, tz: string) => `Ora attuale a ${iata} (${tz}) confrontata con la tua ora locale.`,
    clockAirport: 'Ora attuale all’aeroporto',
    clockLocal: 'La tua ora locale',
    infoKicker: 'Info',
    infoTitle: 'Informazioni e dettagli sull’aeroporto',
    infoEn: 'Dettagli dell’aeroporto',
    infoIata: 'Codice IATA dell’aeroporto',
    infoLocation: 'Posizione dell’aeroporto',
    infoCoords: 'Coordinate',
    infoTimezone: 'Fuso orario',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Link',
    linksTitle: 'Link utili',
    linksEn: 'LINK UTILI',
    linksSub: 'Riferimenti esterni su questo aeroporto: sito ufficiale, Wikipedia e Baidu Baike.',
    officialSite: 'Sito ufficiale',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Fonti: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'dati aperti OurAirports',
    sourcesNote:
      'I codici, le coordinate e la classe dell’aeroporto provengono da dati aperti; i dettagli della pagina seguono le pubblicazioni ufficiali di ciascun aeroporto.',
    mapEmbedKicker: 'Mappa',
    mapEmbedTitle: (name: string) => `Mappa interattiva — posizione di ${name}`,
    mapEmbedEn: 'Mappa interattiva',
    extMapsNote: 'Vedi questo aeroporto su altri servizi cartografici:',
    routeMapKicker: 'Rotte',
    routeMapTitle: (name: string) => `${name} — mappa delle rotte dirette`,
    routeMapEn: 'Mappa delle rotte',
    routeMapAria: (name: string) => `Mappa delle rotte dirette da ${name}`,
    routeLegendTitle: 'Legenda',
    routeLegendClose: 'Nascondi la legenda',
    routeReset: 'Reimposta la mappa',
    routeZoomIn: 'Ingrandisci',
    routeZoomOut: 'Riduci',
    routeFullscreen: 'Visualizza a schermo intero',
    routeExitFullscreen: 'Esci dallo schermo intero',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Apri la pagina dell’aeroporto {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6 compagnie e oltre',
      major: '3–5 compagnie',
      minor: '2 compagnie',
      single: '1 compagnia',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} compagnie',
    routeTableDest: 'Destinazione',
    routeTableCountry: 'Paese o regione',
    routeTableDistance: 'Distanza',
    routeTableCarriers: 'Compagnie',
    routeCarriersMore: (n: number) => ` +${n} altre`,
    routeMapNote: (date: string) =>
      `Istantanea dei dati sulle rotte: ${date}; solo voli diretti. Fonte: `,
    legendTerminal: 'Edificio terminal',
    legendTransit: 'Snodo di trasporto terrestre',
    legendCorridor: 'Collegamento tra terminal',
    terminalsKicker: 'Terminal',
    terminalsTitle: 'Guida ai terminal',
    terminalsEn: 'Guida ai terminal',
    terminalsSub: (name: string) =>
      `Fasce di gate, compagnie principali e servizi di ciascun terminal ${airDi(name)}.`,
    transitTitle: 'Trasporti terrestri',
    facilitiesTitle: 'Servizi dell’aeroporto',
    faqKicker: 'FAQ',
    faqTitle: 'Domande frequenti',
    faqEn: 'Domande',
    guideKicker: 'Guida',
    guideTitle: 'Guida dell’aeroporto',
    guideEn: 'Guida dell’aeroporto',
    blogKicker: 'Articoli',
    blogTitle: (iata: string) => `Guide aeroportuali — ${iata}`,
    blogEn: 'Dal blog',
    blogSub: (iata: string, count: number) =>
      `${count} articoli del sito parlano di ${iata}: arrivo, trasporti, bagagli e coincidenze.`,
    blogAll: 'Tutti gli articoli',
    relatedTitle: (country: string) => `Altri aeroporti — ${country}`,
    relatedEn: (country: string) => `Altri aeroporti — ${country}`,
    relatedAll: (country: string) => `Tutti gli aeroporti — ${country}`,
    /** Tabellone voli: numeri in partenza e in arrivo (aviability.com). */
    flights: {
      kicker: 'Voli',
      title: (name: string) => `${name}: voli in partenza e in arrivo`,
      en: 'Flight Board',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'numero di volo', 'numeri di volo')} di ${plural(
          airlines,
          'compagnia',
          'compagnie'
        )} verso ${plural(destinations, 'destinazione', 'destinazioni')}, divisi per direzione. I numeri in codeshare sono inclusi.`,
      statDepartures: 'Numeri in partenza',
      statArrivals: 'Numeri in arrivo',
      statAirlines: 'Compagnie',
      statDestinations: 'Destinazioni',
      note: (date: string) =>
        `Numeri di volo e rotte dall’indice voli aviability.com (istantanea del ${date}); i numeri in codeshare sono inclusi e gli orari di partenza non sono disponibili. Fonte: `,
      source: 'aviability.com',
      tabDepartures: 'Partenze',
      tabArrivals: 'Arrivi',
      search: 'Cerca numero di volo, compagnia o città',
      clearSearch: 'Cancella la ricerca',
      flight: 'Volo',
      airline: 'Compagnia',
      destination: 'Destinazione',
      origin: 'Provenienza',
      country: 'Paese/regione',
      empty: 'Nessun volo corrisponde alla ricerca.',
      loading: 'Caricamento dei voli…',
      error: 'Impossibile caricare altri voli.',
      retry: 'Riprova',
      previous: 'Precedente',
      next: 'Successiva',
      pagination: 'Paginazione',
      showing: '{from}–{to} di {total} numeri di volo',
      pageOf: 'Pagina {page} di {pages}',
    },
    notFound: 'Aeroporto non trovato',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Mappa delle rotte ${name} (${iata}) ${year} — ${count} destinazioni dirette`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Mappa delle rotte dirette ${airDi(name)} (${iata}): ${count} destinazioni con compagnie operative e distanze, più l’elenco completo delle destinazioni.`,
    heading: (name: string) => `${name} — mappa delle rotte`,
    headingSub: (iata: string, count: string) =>
      `${iata} ha ${count} destinazioni dirette, colorate in base al numero di compagnie che le servono.`,
    backToAirport: (iata: string) => `Torna alla pagina dell’aeroporto ${iata}`,
    /** Link dalla mappa delle rotte al tabellone voli dell’aeroporto. */
    flightNumbers: (iata: string) => `Numeri di volo per ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Vedi la mappa delle rotte',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Vedi la mappa completa delle rotte ${iata}`,
    teaserSub: (count: string) => `${count} destinazioni dirette: mappa, compagnie e distanze.`,
    /** Figure on a tile of the homepage's route strip. */
    cardMeta: (count: string) => `${count} destinazioni dirette`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `${name} — mappa delle rotte dirette`,
    tableKicker: (iata: string) => `${iata} · Destinazioni`,
    tableSectionTitle: (name: string) => `${name} — elenco delle destinazioni dirette`,
    tableSectionEn: (iata: string) => `Destinazioni ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Destinazioni',
    tableSectionSub: (count: string) =>
      `${count} destinazioni, le più servite per prime in base al numero di compagnie, con distanza e vettori.`,
    dataKicker: 'Download',
    dataTitle: 'Scarica i dati delle rotte',
    dataEn: 'Dati',
    dataSub: (count: number) =>
      `${count} rotte dirette con destinazione, codice IATA, città, paese, distanza e compagnie — pronte per un foglio di calcolo o uno script.`,
    dataFields: 'CSV per Excel / Numbers, JSON per il codice; entrambi in UTF-8.',
    dataCsv: 'Scarica il CSV',
    dataJson: 'Scarica il JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Disposizione di terminal e gate in un colpo d’occhio — clicca l’immagine per la mappa completa, i servizi e i trasporti terrestri nella pagina dell’aeroporto.',
    airportMapCta: (iata: string) => `Vedi la mappa completa dei terminal ${iata}`,
    /** Header fact cells. */
    factDestinations: 'Destinazioni dirette',
    factAirlines: 'Compagnie',
    factCountries: 'Paesi',
    factSnapshot: 'Istantanea dei dati',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `Quante destinazioni serve ${air(name)} senza scalo?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${airStart(name)} (${iata}) ha ${count} destinazioni dirette in ${countries} paesi e territori. Sono contate solo le rotte senza scalo; gli itinerari con sosta non sono inclusi.`,
    faqAirlinesQ: (name: string) => `Quante compagnie partono ${airDa(name)}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} compagnie aeree operano rotte dirette da questo aeroporto. Le reti più estese sono ${leaders} (numero di destinazioni tra parentesi).`,
    faqFarthestQ: (name: string) => `Qual è la destinazione diretta più lontana ${airDa(name)}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `La destinazione diretta più lontana è ${city}, ${country} (${iata}), a circa ${km} km.`,
    faqBusiestQ: () => 'Quali destinazioni hanno la maggiore concorrenza?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinazioni sono servite da tre o più compagnie; le più contese sono ${list}.`,
    faqSourceQ: () => 'Con quale frequenza vengono aggiornati i dati sulle rotte?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Le rotte di questa pagina provengono dal dataset aperto ${source} (${license}), un’istantanea di ${date} e non un orario in tempo reale — verifica biglietti e orari con la compagnia o l’aeroporto.`,
  },

  /** Pagina di un singolo numero di volo (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} — volo ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Il volo ${number} è un numero di volo di ${airline} da ${from} a ${to}${distance ? `, a circa ${distance} in linea d’aria` : ''}. Mappa della rotta, aeroporti di partenza e arrivo, distanza e altri voli sulla rotta.`,
    heading: (number: string) => `Volo ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Il volo ${number} è un numero di volo di ${airline} tra ${from} e ${to}${distance ? `, a circa ${distance} in linea d’aria` : ''}.`,
    factFlight: 'Numero di volo',
    factFrom: 'Partenza',
    factTo: 'Arrivo',
    factDistance: 'Distanza',
    overviewKicker: 'Panoramica',
    overviewTitle: (number: string) => `Informazioni sul volo ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `Il volo ${number} è un numero di volo di ${airline} tra ${originName} (${originIata}) e ${destName} (${destIata})${distance ? `, a circa ${distance}` : ''}. Questa pagina raccoglie numero di volo, compagnia, rotta e i due aeroporti per una ricerca rapida.`,
    overviewNote:
      'L’indice dei voli non contiene orari di partenza o arrivo, aeromobili o giorni di operatività; verifica orari, check-in e imbarco con la compagnia o l’aeroporto.',
    routeKicker: 'Rotta',
    routeTitle: (from: string, to: string) => `Rotta ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Schema della rotta del volo ${number}`,
    routeMapAria: (number: string) => `Mappa della rotta del volo ${number}`,
    airportsKicker: 'Aeroporti',
    airportsTitle: 'Aeroporti di partenza e arrivo',
    airportsSub:
      'I due aeroporti della rotta. Quelli coperti dal catalogo aprono la propria pagina.',
    originAirport: 'Aeroporto di partenza',
    destinationAirport: 'Aeroporto di arrivo',
    airportPage: 'Apri la pagina dell’aeroporto',
    detailsKicker: 'Dettagli',
    detailsTitle: 'Dettagli del volo',
    detailsFlight: 'Numero di volo',
    detailsAirline: 'Compagnia',
    detailsOrigin: 'Aeroporto di partenza',
    detailsDestination: 'Aeroporto di arrivo',
    detailsDistance: 'Distanza in linea d’aria',
    detailsRoutes: 'Rotte elencate',
    detailsSnapshot: 'Istantanea dei dati',
    routesKicker: 'Rotte',
    routesTitle: 'Rotte con questo numero di volo',
    routesSub: (count: string) =>
      `Questo numero compare su ${count} rotte; lo stesso numero può essere condiviso da compagnie in codeshare.`,
    routesRoute: 'Rotta',
    routesAirline: 'Compagnia',
    routesDistance: 'Distanza',
    relatedKicker: 'Correlati',
    relatedTitle: 'Altri voli sulla stessa rotta',
    relatedSub: 'Altri numeri di volo tra gli stessi aeroporti di partenza e arrivo.',
    relatedEn: 'Altri voli',
    faqKicker: 'FAQ',
    faqTitle: 'Domande frequenti',
    faqEn: 'Domande',
    faqWhat: (number: string) => `Che cos’è il volo ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Il volo ${number} è un numero di volo di ${airline} sulla rotta ${from} → ${to}${distance ? `, a circa ${distance}` : ''}.`,
    faqRoute: (number: string) => `Dove vola il volo ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Il volo ${number} collega ${originName} (${originIata}) a ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Dove trovo gli orari di partenza e arrivo del volo ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Questa pagina riporta numero di volo, compagnia, rotta e aeroporti del volo ${number}. L’indice aviability.com non include orari di partenza o arrivo — controlla la compagnia o l’aeroporto per l’orario aggiornato.`,
    note: (date: string) =>
      `Numero di volo, compagnia e rotta dall’indice voli aviability.com (istantanea del ${date}); gli orari di partenza e arrivo non sono inclusi. Fonte: `,
    source: 'aviability.com',
    sourceFlight: 'Vedi su aviability.com',
    viewAirport: (iata: string) => `Apri la pagina dell’aeroporto ${iata}`,
    notFound: 'Volo non trovato',
  },

  faq: {
    terminalCount: (name: string) => `Quanti terminal ha ${air(name)}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${airStart(name)} (${iata}) ha ${terminals} terminal e ${gates} gate in totale: ${list}.`,
    gateCount: (name: string) => `Quanti gate ha ${air(name)}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${airStart(name)} (${iata}) ha ${gates} gate in totale: ${list}.`,
    whereIs: (iata: string) => `Dove si trova ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} è il codice IATA ${airDi(name)} (${nameEn}), situato ${cityA(city)}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Quanto dista ${air(name)} dal centro?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${airStart(name)} dista circa ${distance} dal centro. Puoi raggiungere la città in ${transit}.`,
    access: (name: string, city: string) => `Come si arriva in centro ${airDa(name)}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Quali servizi offre ${air(name)}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${airStart(name)} offre ${facilities}. Vedi la disposizione dei terminal qui sopra per la loro distribuzione.`,
    location: (name: string) => `Dove si trova ${air(name)}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${airStart(name)} (${nameEn}, codice IATA ${iata}) si trova ${cityA(city)}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Quali compagnie operano da ciascun terminal ${airDi(name)}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Compagnie principali per terminal ${airA(name)}: ${list}. Compagnie e assegnazioni dei gate cambiano: verifica sempre sulla carta d’imbarco e sulla segnaletica dell’aeroporto.`,
    timezone: (name: string) => `In quale fuso orario si trova ${air(name)}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${airStart(name)} (${iata}) si trova nel fuso orario ${tz}. Confrontalo con la tua ora locale usando l’orologio dell’aeroporto qui sopra.`,
    flightsCount: (name: string) => `Quanti numeri di volo sono elencati ${airA(name)}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `L’indice voli di aviability.com elenca ${plural(
        departures,
        'numero di volo in partenza',
        'numeri di volo in partenza'
      )} e ${plural(arrivals, 'numero di volo in arrivo', 'numeri di volo in arrivo')} ${airDi(name)} (${iata}), operati da ${plural(
        airlines,
        'compagnia',
        'compagnie'
      )} verso ${plural(destinations, 'destinazione', 'destinazioni')} (istantanea del ${date}). I numeri in codeshare sono inclusi; orari e numeri di volo possono cambiare, verifica con la compagnia prima di partire.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Redazione di World Airport Maps',
    role: 'Compilato e verificato da ',
    sourcesNote: 'Compilato da fonti pubbliche e informazioni ufficiali degli aeroporti',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'In questa pagina',
    map: 'Mappa del terminal',
    photos: 'Foto dell’aeroporto',
    time: 'Ora dell’aeroporto',
    details: 'Dettagli dell’aeroporto',
    links: 'Link utili',
    location: 'Mappa della posizione',
    routes: 'Mappa delle rotte',
    flights: 'Voli',
    guide: 'Guida dell’aeroporto',
    blog: 'Guide correlate',
    terminals: 'Guida ai terminal',
    transport: 'Trasporti terrestri',
    facilities: 'Servizi',
    faq: 'FAQ',
    flightOverview: 'Panoramica del volo',
    flightRoute: 'Rotta',
    flightAirports: 'Aeroporti',
    flightDetails: 'Dettagli del volo',
    flightRoutes: 'Tutte le rotte',
    flightRelated: 'Voli correlati',
    intro: 'Panoramica dell’aeroporto',
    distribution: 'Distribuzione degli aeroporti',
    airports: 'Elenco degli aeroporti',
  },

  error: {
    title: 'Impossibile caricare questa pagina',
    sub: 'Si è verificato un errore durante la lettura dei dati dell’aeroporto. Riprova, oppure torna alla home per continuare la navigazione.',
    retry: 'Riprova',
    backHome: 'Torna alla home',
    notFoundTitle: '404 · Pagina non trovata',
    notFoundSub: 'La pagina richiesta potrebbe essere stata spostata o rimossa. Prova a cercare un aeroporto, oppure continua con i link qui sotto.',
  },

  footer: {
    mapsTitle: 'Piante dettagliate dei terminal',
    mapsBody:
      'Orientarsi negli aeroporti e nei loro terminal può essere impegnativo. Le nostre mappe mostrano la disposizione dettagliata di terminal, gate, aree check-in, ritiro bagagli, negozi, ristoranti, lounge e snodi di trasporto, per un viaggio più scorrevole.',
    plansTitle: 'Planimetrie interattive dei terminal',
    plansBody:
      'I grandi aeroporti internazionali hanno più terminal e disposizioni complesse. Le nostre mappe dettagliate ti aiutano a trovare il gate, individuare i servizi, pianificare una coincidenza e attraversare rapidamente sicurezza, partenze e arrivi.',
    transitTitle: 'Trasporti e accesso all’aeroporto',
    transitBody:
      'Oltre alle planimetrie, trattiamo anche i mezzi di trasporto, i parcheggi e i percorsi di accesso — come raggiungere il gate, spostarti tra i terminal e usare treno, autobus, taxi o auto a noleggio.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} paesi e regioni · ${airports} aeroporti · ${terminals} terminal · schemi illustrati dei terminal`,
    fallback: 'Schemi dei terminal e guide ai trasporti terrestri per gli aeroporti di tutto il mondo',
    linksLabel: 'Navigazione del piè di pagina',
    about: 'Chi siamo',
    contact: 'Contatti',
    sources: 'Fonti dei dati',
    privacy: 'Privacy',
    terms: 'Termini di utilizzo',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: 'Treno',
    tram: 'Tram',
    bus: 'Bus',
    taxi: 'Taxi',
    car: 'Auto e parcheggio',
    ferry: 'Traghetto',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Sfoglia',
    title: 'Sfoglia per area',
    en: 'Sfoglia per area',
    sub: 'Entra nell’atlante dall’angolo che preferisci: per paese, per regione, per città — oppure vai direttamente agli hub più trafficati, agli ultimi aggiornamenti e alle guide aeroportuali.',
    allAirports: {
      title: 'Tutti gli aeroporti',
      body: 'L’atlante completo, ordinato per traffico passeggeri, filtrabile per paese e riordinabile.',
    },
    byCountry: {
      title: 'Per paese',
      body: 'Scopri quanti aeroporti, terminal e gate ha ciascun paese o regione.',
    },
    byRegion: {
      title: 'Per regione',
      body: 'I paesi raggruppati per Asia orientale, Europa, America del Nord e il resto del mondo, per orientarsi più in fretta.',
    },
    popularCities: {
      title: 'Città popolari',
      body: 'Le città aeroportuali più trafficate per passeggeri annui totali, e tutti i loro aeroporti.',
    },
    recentlyUpdated: {
      title: 'Aggiornati di recente',
      body: 'Schede aeroportuali aggiunte o riviste di recente, le più nuove per prime.',
    },
    guides: {
      title: 'Guide aeroportuali',
      body: 'Guide approfondite su coincidenze, accesso alla città e consigli pratici.',
    },
    routes: {
      title: 'Mappe delle rotte',
      body: 'La rete diretta di un aeroporto, ordinata per numero di destinazioni, con compagnie e distanze.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guide',
    title: 'Guide aeroportuali',
    en: 'Guide aeroportuali',
    sub: 'Oltre agli schemi dei terminal, abbiamo scritto guide approfondite per alcuni hub: come leggere la numerazione dei gate, come spostarsi tra i terminal e come raggiungere la città.',
    more: 'Vedi questo aeroporto',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the Italian
   * wording of the same UI.
   */
  blog: {
    kicker: 'Diario',
    title: 'Note di viaggio',
    nav: 'Blog',
    en: 'Note di viaggio',
    sub: 'Note approfondite dalla nostra redazione: arrivi e immigrazione, coincidenze, servizi in terminal e dove riposare.',
    more: 'Leggi',
    all: 'Tutti gli articoli',
    morePosts: 'Altri articoli',
    back: 'Torna all’elenco degli articoli',
    empty: 'Nessun articolo al momento.',
    readingMinutes: (n: number) => `${n} min di lettura`,
    source: (name: string) => `Fonte: ${name}`,
    tags: 'Tag',
  },

  comments: {
    kicker: 'Commenti',
    title: 'Commenti dei lettori',
    en: 'Discussione',
    sub: 'Domande, resoconti di viaggio e correzioni sono benvenuti. I commenti sono pubblici.',
    formTitle: 'Lascia un commento',
    countOne: '1 commento',
    countMany: '{n} commenti',
    empty: 'Ancora nessun commento — scrivi il primo.',
    loading: 'Caricamento commenti…',
    loadError: 'I commenti non sono disponibili al momento.',
    retry: 'Riprova',
    nameLabel: 'Nome',
    namePlaceholder: 'Come vuoi essere chiamato?',
    bodyLabel: 'Commento',
    bodyPlaceholder: 'Condividi la tua esperienza, fai una domanda o aggiungi informazioni…',
    submit: 'Pubblica commento',
    submitting: 'Pubblicazione…',
    success: 'Pubblicato — grazie per la condivisione.',
    error: 'Impossibile pubblicare il commento. Riprova più tardi.',
    rateLimited: 'Troppo veloce. Attendi qualche minuto e riprova.',
    nameError: 'Inserisci un nome (2–40 caratteri).',
    bodyError: 'Scrivi un commento (5–2000 caratteri).',
    note: 'I commenti sono pubblici e riflettono le opinioni dei lettori. Mantieni un tono rispettoso e non pubblicare pubblicità o dati personali.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Schema dei terminal di ${name}`,
    gates: 'Gate',
    terminal: 'Terminal',
    corridor: 'Collegamento',
    transit: 'Trasporti terrestri',
    footer: (iata: string) => `${iata} · Disposizione dei terminal`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Strumenti online',
    hub: {
      kicker: 'Strumenti',
      title: 'Strumenti per mappe e coordinate',
      en: 'Strumenti gratuiti',
      sub: 'Strumenti online gratuiti per viaggiatori e appassionati di geografia — si aprono nel browser, senza installare nulla.',
      description:
        'Strumenti gratuiti per mappe e coordinate: conversione WGS84 / GCJ02 / BD09, gradi decimali ↔ DMS e distanza ortodromica tra due punti. Bilingue, pronti nel browser.',
      comingTitle: 'Altri strumenti in arrivo',
      comingSub: 'Selezione di punti sulla mappa, condivisione della posizione e calcolatori di proiezione stanno arrivando.',
    },
    howTitle: 'Come si usa',
    relatedTitle: 'Strumenti correlati',
    allTools: 'Tutti gli strumenti',
    tools: {
      coordinateConverter: {
        title: 'Convertitore di coordinate',
        en: 'Convertitore di coordinate',
        description:
          'Converti tra WGS84, GCJ02 e BD09 — la soluzione al problema dello scostamento delle mappe in Cina.',
        note: 'WGS84 è lo standard GPS internazionale. GCJ02 è il sistema di coordinate scostato obbligatorio nella Cina continentale (soprannominato «coordinate Marte»), usato da AMap e Tencent Maps. BD09 aggiunge un ulteriore scostamento a GCJ02 ed è usato da Baidu Maps. Lo stesso punto può variare di 100–700 m tra i sistemi: converti prima di riutilizzare le coordinate in un altro servizio cartografico.',
        steps: [
          'Inserisci coordinate decimali come latitudine, longitudine — es. 39.9042, 116.4074.',
          'Scegli il sistema di coordinate dell’input.',
          'Clicca «Converti» per ottenere gli altri due sistemi; usa «Copia» per salvare un risultato.',
        ],
        inputLabel: 'Coordinate (latitudine, longitudine)',
        inputPlaceholder: 'es. 39.9042, 116.4074',
        sourceLabel: 'Sistema di coordinate inserito',
        wgs84: 'WGS84 · GPS / internazionale',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Cifre decimali',
        submit: 'Converti',
        copy: 'Copia',
        copied: 'Copiato',
        error: 'Impossibile leggere le coordinate. Usa il formato «latitudine, longitudine», es. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Convertitore di formato delle coordinate',
        en: 'Convertitore di formato',
        description:
          'Converti tra gradi decimali (DD), gradi-minuti (DM) e gradi-minuti-secondi (DMS); il formato di input viene riconosciuto automaticamente.',
        note: 'DD (39.9042°) è lo stile decimale usato da dispositivi e API; DMS (39°54′15″N) è comune in ambito marittimo, aeronautico e topografico; DM (39°54.25′N) è tipico dei rilievi sul campo. Lo strumento riconosce il formato in ingresso dal numero di gruppi di cifre di ciascuna metà (1 = DD, 2 = DM, 3 = DMS) e restituisce tutti e tre gli stili, con N/S/E/O per gli emisferi.',
        steps: [
          'Inserisci una coppia di coordinate — funzionano gli stili 39.9042, 39°54′15″N e 39°32.5′E; separa le due metà con una virgola.',
          'Scegli il numero di cifre decimali per il risultato.',
          'Clicca «Converti» — vengono elencati tutti e tre i formati; usa «Copia» per salvarne uno.',
        ],
        inputLabel: 'Coordinate (una coppia, separate da virgola)',
        inputPlaceholder: 'es. 39°54′15″N, 116°24′51″E oppure 39.9042, 116.4074',
        precisionLabel: 'Cifre decimali',
        submit: 'Converti',
        ddLabel: 'Gradi decimali (DD)',
        dmLabel: 'Gradi-minuti (DM)',
        dmsLabel: 'Gradi-minuti-secondi (DMS)',
        copy: 'Copia',
        copied: 'Copiato',
        error: 'Impossibile leggere le coordinate. Formati supportati: 39.9042, 39°54′15″N e 39°32.5′E, separati da una virgola.',
      },
      distanceCalculator: {
        title: 'Calcolatore di distanza',
        en: 'Calcolatore di distanza',
        description:
          'Distanza ortodromica tra due punti sulla Terra, più l’azimut iniziale.',
        note: 'La distanza usa la formula di Haversine (raggio medio terrestre 6.371,0088 km) — il percorso più breve sulla superficie. L’azimut iniziale è la direzione della bussola dal primo punto verso il secondo: 0° a nord, crescente in senso orario.',
        steps: [
          'Inserisci latitudine e longitudine del punto di partenza e di arrivo.',
          'Clicca «Calcola la distanza».',
          'Ottieni il risultato in chilometri, miglia e miglia nautiche, più l’azimut iniziale.',
        ],
        fromLabel: 'Da',
        toLabel: 'A',
        inputPlaceholder: 'latitudine, longitudine',
        example: 'Esempio: Pechino → Shanghai',
        submit: 'Calcola la distanza',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Azimut iniziale',
        copy: 'Copia',
        copied: 'Copiato',
        error: 'Impossibile leggere le coordinate. Usa il formato «latitudine, longitudine» con latitudine tra -90 e 90 e longitudine tra -180 e 180.',
      },
    },
  },
};
