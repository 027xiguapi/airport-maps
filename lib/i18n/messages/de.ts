import type { Messages } from './zh';
import { deTransportModes } from '../de-data';

/**
 * German catalog. Typed against the Chinese source of truth (`Messages`), so a
 * missing or renamed key fails `npm run typecheck`.
 *
 * Style: formal address ("Sie"), German typography — „Anführungszeichen“, en
 * dashes, decimal comma — and the established German names for cities and
 * countries (München, Peking, Vereinigte Staaten). Airport names keep their
 * international form ("Flughafen Frankfurt (FRA)").
 */

/** "1 Flugnummer" / "2 Flugnummern" for already-formatted counts. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'Großflughafen',
  medium: 'Regionalflughafen',
  small: 'kleiner Flughafen',
  heliport: 'Heliport',
} as const;

export const de: Messages = {
  site: {
    name: 'Welt-Flughafenkarten',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'Welt-Flughafen',
    nameAccent: 'karten',
    tagline: 'Flughafen- und Terminalpläne',
    description:
      'Flughafen-Terminalpläne nach Land und Region durchsuchen. Von großen internationalen Drehkreuzen bis zu Regionalflughäfen: detaillierte Layouts von Gates, Check-in-Bereichen, Gepäckausgabe, Geschäften, Restaurants, Lounges und Bodentransport.',
    keywords: [
      'Flughafenpläne',
      'Terminalpläne',
      'Flughafen-Lageplan',
      'Gates',
      'Flughafentransfer',
      'Flughafenführer',
    ],
    numberOfItems: (n: number) =>
      `${n} ${n === 1 ? 'Flughafen' : 'Flughäfen'}`,
  },

  nav: {
    home: 'Start',
    airports: 'Alle Flughäfen',
    countries: 'Nach Land',
    tools: 'Online-Tools',
    about: 'Über uns',
    label: 'Hauptnavigation',
    languageLabel: 'Sprache',
    switchLanguage: 'Sprache wechseln',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'In Vorbereitung',
    languagePlannedHint: 'Diese Sprachversion ist noch nicht veröffentlicht.',
    themeToggle: 'Dunkelmodus umschalten',
    menu: 'Menü',
  },

  common: {
    skipToContent: 'Zum Hauptinhalt springen',
    backToTop: 'Nach oben',
    breadcrumbLabel: 'Navigationspfad',
    home: 'Start',
    viewMap: 'Karte ansehen',
    terminalMap: 'Terminalplan',
    /** Accessible iframe title on the ad slots (components/ads/). */
    advertisement: 'Anzeige',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} ${
            counts.terminals === 1 ? 'Terminal' : 'Terminals'
          }${
            counts.gates > 0
              ? `, ${counts.gates} ${counts.gates === 1 ? 'Gate' : 'Gates'}`
              : ''
          } – Terminalplan`
        : `${name} (${iata}) – Lageplan & Flughafenführer ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} – Terminalplan` : name,
    airportGuide: 'Flughafenführer',
    lastUpdated: 'Zuletzt aktualisiert',
    updatedOn: (date: string) => `Aktualisiert am ${date}`,
    publishedOn: (date: string) => `Veröffentlicht am ${date}`,
    readMore: 'Zum vollständigen Führer',
  },

  units: {
    terminalsFact: 'Terminals',
    gatesFact: 'Gates',
    terminals: (n: number) => `${n} ${n === 1 ? 'Terminal' : 'Terminals'}`,
    terminalsShort: (n: number) => `${n} ${n === 1 ? 'Terminal' : 'Terminals'}`,
    gates: (n: number) => `${n} ${n === 1 ? 'Gate' : 'Gates'}`,
    airports: (n: number) => `${n} ${n === 1 ? 'Flughafen' : 'Flughäfen'}`,
    airportsChip: (n: number) => `${n} ${n === 1 ? 'Flughafen' : 'Flughäfen'}`,
    pax: 'Passagiere',
    paxFull: 'Passagiere pro Jahr',
    distance: 'Zum Stadtzentrum',
    distanceFrom: (city: string) => `Ab dem Zentrum von ${city}`,
    gatesLabel: (range: string) => `Gates ${range}`,
    gatesCount: (n: number) => `${n} Gates`,
    satellite: 'Satellitenterminal',
    airlinesLabel: 'Wichtigste Fluggesellschaften: ',
  },

  search: {
    ariaLabel: 'Flughäfen durchsuchen',
    placeholder: 'Flughäfen, Städte oder IATA-Codes suchen',
    heroPlaceholder:
      'Nach Flughafenname, Stadt oder IATA-Code suchen – z. B. LHR / Dubai / Heathrow',
    submit: 'Flughafen finden',
    loading: 'Suche läuft …',
    empty: 'Keine passenden Flughäfen gefunden',
    resultsTitle: (term: string) => `Suchergebnisse für „${term}“`,
    resultsCount: (n: number) =>
      n === 1
        ? '1 passender Flughafen gefunden.'
        : `${n} passende Flughäfen gefunden.`,
    noResults:
      'Keine Flughäfen gefunden. Versuchen Sie einen anderen Suchbegriff, etwa einen Städtenamen oder einen IATA-Code.',
    noResultsHint: 'Ihr Wunschflughafen ist nicht dabei?',
    viewAll: (n: number) => `Alle ${n} Flughäfen durchsuchen`,
    orBrowseByCountry: 'nach Land durchsuchen',
    range: (from: number, to: number, total: number) =>
      `Flughäfen ${from}–${to} von ${total}`,
  },

  hero: {
    eyebrow: 'Weltweites Flughafenverzeichnis',
    titleLead: 'Entdecken Sie Flughäfen und',
    titleAccent: 'Terminalpläne',
    sub: 'Finden Sie sich an jedem Flughafen zurecht – mit unserer vollständigen Sammlung von Flughafen- und Terminalplänen, geordnet nach Land und Region, von großen internationalen Drehkreuzen bis zu Regionalflughäfen.',
    stats: {
      countries: 'Länder / Regionen',
      airports: 'Erfasste Flughäfen',
      terminals: 'Terminalpläne',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Über diese Website',
      imageAlt:
        'Ein Verkehrsflugzeug am Gate eines gläsernen Flughafenterminals bei Sonnenaufgang',
      blocks: [
        {
          title: 'Jeden Flughafen mit detaillierten Terminalplänen erschließen',
          body: 'Sich an Flughäfen und Terminals weltweit zurechtzufinden, kann schwierig sein. Unsere umfassenden Flughafenpläne zeigen detaillierte Layouts von Terminals, Gates, Check-in-Bereichen, Gepäckausgabe, Geschäften, Restaurants, Lounges und Verkehrsknoten – damit Sie die Route schon vor der Abreise planen können.',
        },
        {
          title: 'Interaktive Terminalpläne und Grundrisse',
          body: 'Große internationale Flughäfen haben mehrere Terminals und komplexe Wegeführungen. Unsere detaillierten Pläne helfen Ihnen, Gates zu finden, Einrichtungen zu nutzen, Anschlüsse zu planen und zügig durch Sicherheitskontrollen, Abflugbereiche und Ankunftshallen zu gelangen – ohne Umwege.',
        },
        {
          title: 'Flughafentransfer und Anfahrt',
          body: 'Über den Terminalaufbau hinaus zeigen unsere Führer Transportmöglichkeiten, Parkinformationen und Anfahrtswege. Erfahren Sie, wie Sie am besten zu Ihrem Abfluggate kommen, zwischen Terminals wechseln und Bahn, Bus, Taxi oder Mietwagen nutzen.',
        },
      ],
    },
    map: {
      kicker: 'Weltkarte',
      title: 'Flughafenkarte',
      en: 'Flughafenkarte',
      sub: (airports: string, world: string) =>
        `Finden Sie ${world} planmäßig bediente Flughäfen weltweit – ${airports} davon mit Terminalplan hier. Klicken Sie auf einen Punkt für Land/Region und Details.`,
      all: 'Alle',
      gEurope: 'Europa',
      gAsia: 'Asien',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Ozeanien',
      legendSite: 'Hier erfasst · Klick öffnet den Terminalplan',
      legendWorld: 'Weitere planmäßig bediente Flughäfen weltweit',
      countTemplate: '{n} Flughäfen angezeigt',
      download: 'Daten herunterladen',
      downloadTitle:
        'Alle Flughäfen des aktuellen Filters als CSV exportieren (IATA, Name, Stadt, Land, Koordinaten)',
      openAirport: 'Flughafen ansehen',
    },
    popular: {
      kicker: 'Terminalpläne',
      title: 'Beliebte Flughafenpläne',
      en: 'Flughafenpläne',
      sub: 'Eine wechselnde Auswahl von Terminalplan-Titeln aus aller Welt – öffnen Sie eine Flughafenseite für den vollständigen Plan.',
    },
    recent: {
      kicker: 'Neu veröffentlicht',
      title: 'Zuletzt aktualisiert',
      en: 'Zuletzt aktualisiert',
      sub: 'Neue und überarbeitete Flughäfen, Länder und Reiseführer.',
      countriesTitle: 'Zuletzt aktualisierte Länder',
    },
    routes: {
      kicker: 'Strecken',
      title: 'Die größten Nonstop-Streckennetze',
      en: 'Streckenkarten',
      sub: 'Flughäfen nach der Zahl ihrer Nonstop-Ziele – öffnen Sie einen für Streckenkarte, Fluggesellschaften und Zielliste.',
    },
    countries: {
      kicker: 'Nach Land',
      title: 'Flughafenpläne nach Land',
      en: 'Länder',
      sub: 'Terminalpläne nach Land und Region durchsuchen, von großen internationalen Drehkreuzen bis zu Regionalflughäfen.',
      more: 'Alle Länder',
    },
    all: {
      kicker: 'Alle Pläne',
      title: 'Alle Flughafenpläne',
      en: 'Alle Flughäfen',
      sub: 'Flughafenpläne für die verkehrsreichsten Flughäfen und Reiseknoten der Welt.',
      hint: 'Wählen Sie einen Flughafen, um seinen Terminalaufbau zu sehen.',
      more: 'Alle anzeigen',
    },
    facts: {
      kicker: 'Listen & Tabellen',
      title: 'Flughafendaten auf einen Blick',
      en: 'Listen & Tabellen',
      sub: 'Die Zahlen des Verzeichnisses als Listen und Tabellen: Abdeckung auf einen Blick, die verkehrsreichsten Flughäfen und die Verteilung nach Region.',
      coverageTitle: 'Abdeckung auf einen Blick',
      coverage: {
        airports: 'Flughäfen',
        countries: 'Länder & Regionen',
        regions: 'Weltregionen',
        cities: 'Städte',
        terminals: 'Terminals',
        gates: 'Gates',
        routes: 'Streckenkarten',
      },
      busiest: {
        title: 'Verkehrsreichste Flughäfen nach Passagierzahl',
        sub: 'Die 12 Flughäfen mit dem höchsten Jahresaufkommen, der Rangfolge nach.',
        caption: 'Flughäfen nach jährlichem Passagieraufkommen',
        rank: 'Rang',
        iata: 'IATA',
        airport: 'Flughafen',
        city: 'Stadt',
        country: 'Land',
        terminals: 'Terminals',
        gates: 'Gates',
        pax: 'Passagiere pro Jahr (Mio.)',
      },
      regions: {
        title: 'Flughäfen nach Region',
        sub: 'Flughafen-, Terminal- und Gate-Zahlen nach Weltregion gruppiert.',
        caption: 'Flughafenzahlen nach Weltregion',
        region: 'Region',
        airports: 'Flughäfen',
        terminals: 'Terminals',
        gates: 'Gates',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Flughafen',
    city: 'Stadt',
    country: 'Land',
    size: 'Größe',
    map: 'Karte',
    empty: 'Keine Flughäfen für diese Filter. Erweitern Sie Ihre Auswahl.',
  },

  pager: {
    label: 'Seitennavigation',
    previous: 'Vorherige Seite',
    next: 'Nächste Seite',
  },

  filters: {
    searchPlaceholder: 'Flughäfen, Städte oder IATA-Codes suchen',
    submit: 'Suchen',
    country: 'Land',
    all: 'Alle',
    sort: 'Sortieren',
    sortPax: 'Passagiere',
    sortName: 'Name',
    sortIata: 'IATA-Code',
    sortUpdated: 'Zuletzt aktualisiert',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Alle Flughafenpläne für ${country}${sortLabel ? ` – sortiert nach ${sortLabel}` : ''}`
        : `Alle Flughafenpläne – sortiert nach ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Jeder Flughafenplan für ${country} auf einer Seite: Terminalaufbau, Gate-Bereiche und Bodentransport${
            sortLabel ? `, geordnet nach ${sortLabel}` : ''
          }.`
        : `Das vollständige Flughafenverzeichnis auf einer Seite: Terminalaufbau, Gate-Bereiche und Bodentransport${
            sortLabel ? `, geordnet nach ${sortLabel}` : ''
          }.`,
  },

  countries: {
    title: 'Flughäfen nach Land durchsuchen',
    description:
      'Das weltweite Flughafen-Terminalverzeichnis nach Land und Region durchsuchen. Von großen internationalen Drehkreuzen bis zu Regionalflughäfen: sehen Sie, wie viele Flughäfen und Terminals jedes Land hat.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Von großen internationalen Drehkreuzen bis zu Regionalflughäfen – ${countries} Länder und Regionen, ${airports} Flughäfen und ${terminals} Terminals insgesamt.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ${countries === 1 ? 'Land' : 'Länder'} · ${airports} ${
        airports === 1 ? 'Flughafen' : 'Flughäfen'
      }`,
  },

  country: {
    title: (name: string, count?: number) =>
      count
        ? `${name}: Flughafenplan – alle ${count} Flughäfen`
        : `Flughafenpläne ${name}`,
    description: (
      name: string,
      nameEn: string,
      region: string,
      count: number,
      total?: number
    ) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} hat ${total} planmäßig bediente Flughäfen; für ${count} davon gibt es hier eine eigene Seite. Sehen Sie die Verteilungskarte, die vollständige nationale Liste und die Nonstop-Ziele.`
        : `Terminalpläne für ${count} ${
            count === 1 ? 'Flughafen' : 'Flughäfen'
          } in ${name} (${nameEn}) – die wichtigsten internationalen Drehkreuze und Regionalflughäfen in ${region}. Mit Gates, Terminalaufbau und Bodentransport.`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} · FLUGHÄFEN`,
    kicker: 'Flughafenpläne',
    titleOf: (name: string) => `Flughäfen in ${name}`,
    en: 'Flughäfen',
    sub: 'Wählen Sie einen Flughafen, um Terminalaufbau, Gate-Bereiche und Bodentransport zu sehen.',
    empty: 'Für dieses Land oder diese Region sind noch keine Flughäfen hinterlegt.',
    moreKicker: 'Weitere Länder',
    moreTitle: 'Andere Länder entdecken',
    moreEn: 'Weitere Länder',
    all: 'Alle Länder',
    notFound: 'Land nicht gefunden',

    introKicker: 'Überblick',
    introTitle: (name: string) => `${name}: Flughäfen im Überblick`,
    introEn: 'Flughafenüberblick',
    introSub:
      'Die Größe der Flughäfen dieses Landes, seine wichtigsten Drehkreuze und die Städte, die sie verbinden.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} liegt in ${o.region}. Diese Seite erfasst dort ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` und ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) ist mit ${o.busiestPax} der größte nach jährlichem Passagieraufkommen.`
        : '') +
      ` Die Flughäfen bedienen unter anderem ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Jede Flughafenseite enthält Lageplan und Flughafencodes sowie die für sie erfassten Angaben zu Terminals, Gates und Bodentransport.',

    distribution: {
      kicker: 'Verteilung',
      title: (name: string) => `${name}: Karte der Flughafenverteilung`,
      en: 'Flughafenverteilung',
      sub: (covered: string, total: string) =>
        `${total} planmäßig bediente Flughäfen im ganzen Land (große, mittlere und kleine); für ${covered} davon gibt es hier eine eigene Seite. Die vollständige Liste folgt.`,
      mapAlt: (name: string, total: string) =>
        `${name}: Karte der Flughafenverteilung mit ${total} planmäßig bedienten Flughäfen`,
      siteTag: 'Hier erfasst',
      colAirport: 'Flughafen',
      colCity: 'Stadt',
      colType: 'Typ',
      types: {
        large: 'Groß',
        medium: 'Mittel',
        small: 'Klein',
      },
      empty: 'Noch keine nationale Flughafenliste verfügbar.',
    },

    linksTitle: 'Weiterführende Links',
    linksEn: 'Weiterführende Links',
    linksSub:
      'Offizielle Seiten und Enzyklopädie-Einträge zum Land und zu seinen Flughäfen.',
    linksCountry: (name: string) => `${name} – Referenzen`,
    linksAirports: (name: string) => `Flughäfen in ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Häufig gestellte Fragen',
    faqEn: 'Fragen',
    faq: {
      airportTotal: (name: string) => `Wie viele Flughäfen gibt es in ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} hat ${total} Flughäfen mit planmäßigem Passagierverkehr (große, mittlere und kleine); diese Seite erfasst ${covered} davon im Detail. Sehen Sie die Verteilungskarte und die vollständige Liste oben.`,
      airportCount: (name: string) => `Welche Flughäfen sind in ${name} erfasst?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Diese Seite erfasst ${count} in ${name}: ${list}.`,
      busiest: (name: string) => `Welcher ist der verkehrsreichste Flughafen in ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Nach jährlichem Passagieraufkommen ist ${busiest} (${iata}) mit ${pax} der größte der hier erfassten Flughäfen.`,
      terminals: (name: string) => `Wie viele Terminals haben die Flughäfen in ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Die in ${name} erfassten Flughäfen haben ${terminals} mit insgesamt ${gates}: ${list}.`,
      cities: (name: string) => `In welchen Städten in ${name} gibt es Flughäfen?`,
      citiesAnswer: (name: string, cities: string) =>
        `Die hier erfassten Flughäfen in ${name} bedienen unter anderem ${cities}. Im Flughafenverzeichnis können Sie sie nach Stadt oder IATA-Code filtern.`,
      maps: (name: string) => `Gibt es für die Flughäfen in ${name} Terminalpläne?`,
      mapsAnswer: (name: string, count: string) =>
        `Teilweise. Die Flughafenseiten enthalten Lageplan, Flughafencodes und Nonstop-Ziele; wo Terminaldaten vorliegen, kommen Terminalplan, Gate-Bereiche und Bodentransport hinzu. Von den ${count} in ${name} erfassten Flughäfen zeigt das jeder, für den diese Angaben erfasst sind. Öffnen Sie einen Flughafen, um zu sehen, was er bietet.`,
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
        ? `${o.name} (${o.iata}) hat ${o.terminals} ${
            o.terminals === '1' ? 'Terminal' : 'Terminals'
          }${o.gates ? ` mit ${o.gates} ${o.gates === '1' ? 'Gate' : 'Gates'}` : ''}${
            o.pax ? `, ${o.pax} Passagiere pro Jahr` : ''
          }${
            o.distance ? `, ${o.distance} vom Stadtzentrum entfernt` : ''
          }. Terminalplan mit allen Terminals, Gate-Bereichen und Bodentransport.`
        : `${o.name} (${o.iata}) bedient ${o.city}, ${o.country}. Lageplan, Flughafencodes und Reiseinformationen.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'Flughafen';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) ist ein ${kind} und bedient ${where}`;
      return o.terminals > 0
        ? `${head}, mit ${o.terminals} ${o.terminals === 1 ? 'Terminal' : 'Terminals'}${
            o.gates > 0 ? ` und ${o.gates} ${o.gates === 1 ? 'Gate' : 'Gates'}` : ''
          }${
            o.distance ? `, etwa ${o.distance} vom Zentrum von ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Terminalaufbau`,
    mapNote: 'TERMINALAUFBAU',
    realMapTitle: (iata: string) =>
      `${iata} Flughafen-Terminalplan – Gates & Orientierung`,
    mapAlt: (name: string, iata: string) =>
      `${name} (${iata}) Terminalplan mit allen Terminals, Gate-Bereichen und Abfertigungsgebäuden`,
    realMapNote: 'TERMINALPLAN',
    photosKicker: 'Fotos',
    photosTitle: 'Flughafenfotos',
    photosEn: 'Flughafenfotos',
    photosSub:
      'Echte Fotos dieses Flughafens, jeweils mit Quellenangabe zur öffentlichen Webseite, auf der sie gefunden wurden; das Urheberrecht liegt bei den Fotografinnen und Fotografen. Klicken Sie auf ein Foto zum Vergrößern oder auf die Quellenangabe, um die Originalseite zu öffnen.',
    photosCredit: (host: string) => `Quelle: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata}) Flughafenfoto ${index}`,
    photosZoom: (name: string, index: number) =>
      `Foto ${index} von ${name} vergrößern`,
    zoomLabel: 'Zoom',
    zoomClose: 'Schließen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    downloadKicker: 'Download',
    downloadTitle: 'Flughafenpläne herunterladen',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) =>
      `${year} aktueller Terminalplan und Grundriss des Flughafens ${iata} zum Download`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year} aktueller Terminalplan des Flughafens ${iata} als PDF zum Download`,
    timeKicker: 'Uhrzeit',
    timeTitle: (iata: string) => `Flughafenzeit – aktuelle Uhrzeit in ${iata}`,
    timeEn: 'Flughafenzeit',
    timeSub: (iata: string, tz: string) =>
      `Aktuelle Uhrzeit in ${iata} (${tz}) im Vergleich zu Ihrer Ortszeit.`,
    clockAirport: 'Aktuelle Flughafenzeit',
    clockLocal: 'Ihre Ortszeit',
    infoKicker: 'Info',
    infoTitle: 'Flughafeninformationen und Details',
    infoEn: 'Flughafendetails',
    infoIata: 'IATA-Code des Flughafens',
    infoLocation: 'Lage des Flughafens',
    infoCoords: 'Koordinaten',
    infoTimezone: 'Zeitzone',
    linksKicker: 'Links',
    linksTitle: 'Weiterführende Links',
    linksEn: 'WEITERFÜHRENDE LINKS',
    linksSub:
      'Externe Quellen zu diesem Flughafen: offizielle Website und Wikipedia.',
    officialSite: 'Offizielle Website',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Quellen: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'OurAirports Open Data',
    sourcesNote:
      'Flughafencodes, Koordinaten und Flughafenklasse stammen aus offenen Daten; die Detailangaben folgen den offiziellen Veröffentlichungen des jeweiligen Flughafens.',
    mapEmbedKicker: 'Karte',
    mapEmbedTitle: (name: string) => `Interaktive Karte – Lage des Flughafens ${name}`,
    mapEmbedEn: 'Interaktive Karte',
    extMapsNote: 'Diesen Flughafen in anderen Kartendiensten ansehen:',
    routeMapKicker: 'Strecken',
    routeMapTitle: (name: string) => `${name}: Streckenkarte – Nonstop-Ziele`,
    routeMapEn: 'Streckenkarte',
    routeMapAria: (name: string) => `Karte der Nonstop-Strecken ab ${name}`,
    routeLegendTitle: 'Farblegende',
    routeLegendClose: 'Legende ausblenden',
    routeReset: 'Karte zurücksetzen',
    routeZoomIn: 'Vergrößern',
    routeZoomOut: 'Verkleinern',
    routeFullscreen: 'Vollbild anzeigen',
    routeExitFullscreen: 'Vollbild verlassen',
    routeOpenAirport: 'Flughafenseite {iata} öffnen',
    routeTiers: {
      trunk: '6+ Fluggesellschaften',
      major: '3–5 Fluggesellschaften',
      minor: '2 Fluggesellschaften',
      single: '1 Fluggesellschaft',
    },
    routeCarriersTpl: '{n} Fluggesellschaften',
    routeTableDest: 'Ziel',
    routeTableCountry: 'Land/Region',
    routeTableDistance: 'Entfernung',
    routeTableCarriers: 'Fluggesellschaften',
    routeCarriersMore: (n: number) => ` +${n} weitere`,
    routeMapNote: (date: string) =>
      `Streckendaten: Stand ${date}; nur Nonstop-Verbindungen. Quelle: `,
    legendTerminal: 'Terminalgebäude',
    legendTransit: 'Knotenpunkt Bodentransport',
    legendCorridor: 'Verbindung zwischen Terminals',
    terminalsKicker: 'Terminals',
    terminalsTitle: 'Terminalführer',
    terminalsEn: 'Terminalführer',
    terminalsSub: (name: string) =>
      `Gate-Bereiche, wichtigste Fluggesellschaften und Einrichtungen für jedes Terminal in ${name}.`,
    transitTitle: 'Bodentransport',
    facilitiesTitle: 'Flughafeneinrichtungen',
    faqKicker: 'FAQ',
    faqTitle: 'Häufig gestellte Fragen',
    faqEn: 'Fragen',
    guideKicker: 'Führer',
    guideTitle: 'Flughafenführer',
    guideEn: 'Flughafenführer',
    blogKicker: 'Artikel',
    blogTitle: (iata: string) => `${iata}: Flughafen-Ratgeber`,
    blogEn: 'Aus dem Blog',
    blogSub: (iata: string, count: number) =>
      `${count} Artikel dieser Website behandeln ${iata}: Ankunft, Verkehr, Gepäck und Umsteigen.`,
    blogAll: 'Alle Artikel',
    relatedTitle: (country: string) => `Weitere Flughäfen in ${country}`,
    relatedEn: (country: string) => `Mehr in ${country}`,
    relatedAll: (country: string) => `Alle Flughäfen in ${country}`,
    /** Flugtafel: Flugnummern ab und an diesem Flughafen (aviability.com). */
    flights: {
      kicker: 'Flüge',
      title: (name: string) => `${name}: Flüge – Abflüge und Ankünfte`,
      en: 'Flight Board',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'Flugnummer', 'Flugnummern')} von ${plural(
          airlines,
          'Fluggesellschaft',
          'Fluggesellschaften'
        )} zu ${plural(destinations, 'Ziel', 'Zielen')}, getrennt nach Abflug und Ankunft. Codeshare-Nummern sind enthalten.`,
      statDepartures: 'Abflug-Flugnummern',
      statArrivals: 'Ankunfts-Flugnummern',
      statAirlines: 'Fluggesellschaften',
      statDestinations: 'Ziele',
      note: (date: string) =>
        `Flugnummern und Strecken aus dem aviability.com-Fluginventar (Stand ${date}); Codeshare-Nummern sind enthalten, Abflugzeiten fehlen. Quelle: `,
      source: 'aviability.com',
      tabDepartures: 'Abflüge',
      tabArrivals: 'Ankünfte',
      search: 'Flugnummer, Airline oder Stadt suchen',
      clearSearch: 'Suche löschen',
      flight: 'Flug',
      airline: 'Airline',
      destination: 'Ziel',
      origin: 'Abflugort',
      country: 'Land/Region',
      empty: 'Keine Flüge zu dieser Suche.',
      loading: 'Flüge werden geladen…',
      error: 'Weitere Flüge konnten nicht geladen werden.',
      retry: 'Erneut versuchen',
      previous: 'Zurück',
      next: 'Weiter',
      pagination: 'Seitennavigation',
      showing: '{from}–{to} von {total} Flugnummern',
      pageOf: 'Seite {page} von {pages}',
    },
    notFound: 'Flughafen nicht gefunden',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Aktuelle Streckenkarte ${name} (${iata}) ${year} – ${count} Nonstop-Ziele`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Nonstop-Streckenkarte für ${name} (${iata}): ${count} Ziele mit fliegenden Gesellschaften und Entfernungen, dazu die vollständige Zielliste.`,
    heading: (name: string) => `${name}: Streckenkarte`,
    headingSub: (iata: string, count: string) =>
      `${iata} hat ${count} Nonstop-Ziele, eingefärbt nach der Zahl der Fluggesellschaften.`,
    backToAirport: (iata: string) => `Zurück zur Flughafenseite ${iata}`,
    /** Link von der Streckenkarte zur Flugtafel der Flughafenseite. */
    flightNumbers: (iata: string) => `Flugnummern für ${iata}`,
    openFull: 'Streckenkarte ansehen',
    previewCta: (iata: string) => `Die vollständige Streckenkarte ${iata} ansehen`,
    teaserSub: (count: string) =>
      `${count} Nonstop-Ziele: Karte, fliegende Gesellschaften und Entfernungen.`,
    cardMeta: (count: string) => `${count} Nonstop-Ziele`,
    mapSectionTitle: (name: string) => `${name}: Karte der Nonstop-Strecken`,
    tableKicker: (iata: string) => `${iata} · Ziele`,
    tableSectionTitle: (name: string) => `${name}: Liste der Nonstop-Ziele`,
    tableSectionEn: (iata: string) => `Ziele ab ${iata}`,
    tableToc: 'Ziele',
    tableSectionSub: (count: string) =>
      `${count} Ziele, nach der Zahl der fliegenden Gesellschaften geordnet, mit Entfernung und Airlines.`,
    dataKicker: 'Download',
    dataTitle: 'Streckendaten herunterladen',
    dataEn: 'Daten',
    dataSub: (count: number) =>
      `${count} Nonstop-Verbindungen mit Ziel, IATA-Code, Stadt, Land, Entfernung und fliegenden Gesellschaften – bereit für Tabellenkalkulation oder Skript.`,
    dataFields: 'CSV eignet sich für Excel / Numbers, JSON für Code; beides ist UTF-8.',
    dataCsv: 'CSV herunterladen',
    dataJson: 'JSON herunterladen',
    airportMapSub:
      'Terminal- und Gate-Aufbau auf einen Blick – klicken Sie auf das Bild für den vollständigen Plan, Terminaleinrichtungen und Bodentransport auf der Flughafenseite.',
    airportMapCta: (iata: string) =>
      `Den vollständigen Terminalplan ${iata} ansehen`,
    factDestinations: 'Nonstop-Ziele',
    factAirlines: 'Fluggesellschaften',
    factCountries: 'Länder',
    factSnapshot: 'Datenstand',
    faqCountQ: (name: string) =>
      `Wie viele Orte fliegt ${name} nonstop an?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) hat ${count} Nonstop-Ziele in ${countries} Ländern und Gebieten. Gezählt werden nur Direktflüge; Verbindungen mit Zwischenstopp nicht.`,
    faqAirlinesQ: (name: string) =>
      `Wie viele Fluggesellschaften fliegen vom ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} Fluggesellschaften bedienen Nonstop-Strecken ab diesem Flughafen. Die größten Netze haben ${leaders} (Zahl der Ziele in Klammern).`,
    faqFarthestQ: (name: string) =>
      `Was ist das weiteste Nonstop-Ziel vom ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Das weiteste Nonstop-Ziel ist ${city}, ${country} ${iata}, rund ${km} km entfernt.`,
    faqBusiestQ: () => 'Auf welchen Strecken gibt es den meisten Wettbewerb?',
    faqBusiestA: (count: string, list: string) =>
      `${count} Ziele werden von drei oder mehr Fluggesellschaften angeflogen; die meistbedienten sind ${list}.`,
    faqSourceQ: () => 'Wie oft werden die Streckendaten aktualisiert?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Die Strecken auf dieser Seite stammen aus dem offenen Datensatz von ${source} (${license}), einem Stand von ${date} und keinem Live-Flugplan – prüfen Sie Tickets und Zeiten bei der Fluggesellschaft oder am Flughafen.`,
  },

  /** Einzelne Flugnummernseite (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} Flug — ${from} nach ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flug ${number} ist eine Flugnummer von ${airline} von ${from} nach ${to}${distance ? `, etwa ${distance}` : ''}. Streckenkarte, Start- und Zielflughafen, Entfernung und weitere Flüge auf der Strecke.`,
    heading: (number: string) => `Flug ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flug ${number} ist eine Flugnummer von ${airline} zwischen ${from} und ${to}${distance ? `, Luftlinie etwa ${distance}` : ''}.`,
    factFlight: 'Flugnummer',
    factFrom: 'Von',
    factTo: 'Nach',
    factDistance: 'Entfernung',
    overviewKicker: 'Überblick',
    overviewTitle: (number: string) => `Über Flug ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} ist eine Flugnummer von ${airline} zwischen ${originName} (${originIata}) und ${destName} (${destIata})${distance ? `, Luftlinie etwa ${distance}` : ''}. Diese Seite bündelt Flugnummer, Fluggesellschaft, Strecke und die beiden Flughäfen für die schnelle Suche.`,
    overviewNote:
      'Der Flugindex enthält keine Abflug- oder Ankunftszeiten, Flugzeugtypen oder Betriebstage; bestätigen Sie Flugplan, Check-in und Boarding bei der Fluggesellschaft oder am Flughafen.',
    routeKicker: 'Strecke',
    routeTitle: (from: string, to: string) => `Strecke ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Streckendiagramm für Flug ${number}`,
    routeMapAria: (number: string) => `Streckenkarte für Flug ${number}`,
    airportsKicker: 'Flughäfen',
    airportsTitle: 'Start- und Zielflughafen',
    airportsSub:
      'Die beiden Flughäfen dieser Strecke. Flughäfen im Verzeichnis öffnen ihre eigene Seite.',
    originAirport: 'Startflughafen',
    destinationAirport: 'Zielflughafen',
    airportPage: 'Flughafenseite öffnen',
    detailsKicker: 'Details',
    detailsTitle: 'Flugdetails',
    detailsFlight: 'Flugnummer',
    detailsAirline: 'Fluggesellschaft',
    detailsOrigin: 'Startflughafen',
    detailsDestination: 'Zielflughafen',
    detailsDistance: 'Luftlinie',
    detailsRoutes: 'Gelistete Strecken',
    detailsSnapshot: 'Datenstand',
    routesKicker: 'Strecken',
    routesTitle: 'Strecken unter dieser Flugnummer',
    routesSub: (count: string) =>
      `Diese Nummer erscheint auf ${count} Strecken; Codeshare-Partner können dieselbe Nummer nutzen.`,
    routesRoute: 'Strecke',
    routesAirline: 'Fluggesellschaft',
    routesDistance: 'Entfernung',
    relatedKicker: 'Verwandt',
    relatedTitle: 'Weitere Flüge auf dieser Strecke',
    relatedSub: 'Andere Flugnummern zwischen demselben Start- und Zielflughafen.',
    relatedEn: 'Weitere Flüge',
    faqKicker: 'FAQ',
    faqTitle: 'Häufig gestellte Fragen',
    faqEn: 'Fragen',
    faqWhat: (number: string) => `Was ist Flug ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Flug ${number} ist eine Flugnummer von ${airline} auf der Strecke ${from} → ${to}${distance ? `, Luftlinie etwa ${distance}` : ''}.`,
    faqRoute: (number: string) => `Wohin fliegt ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Flug ${number} fliegt von ${originName} (${originIata}) nach ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Wo finde ich die Abflug- und Ankunftszeiten von ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Diese Seite zeigt Flugnummer, Fluggesellschaft, Strecke und Flughäfen von ${number}. Der aviability.com-Flugindex enthält keine Abflug- oder Ankunftszeiten – prüfen Sie den aktuellen Flugplan bei der Fluggesellschaft oder am Flughafen.`,
    note: (date: string) =>
      `Flugnummer, Fluggesellschaft und Strecke aus dem aviability.com-Flugindex (Stand ${date}); Abflug- und Ankunftszeiten sind nicht enthalten. Quelle: `,
    source: 'aviability.com',
    sourceFlight: 'Auf aviability.com ansehen',
    viewAirport: (iata: string) => `Flughafenseite ${iata} öffnen`,
    notFound: 'Flug nicht gefunden',
  },

  faq: {
    terminalCount: (name: string) => `Wie viele Terminals gibt es am ${name}?`,
    terminalCountAnswer: (
      name: string,
      iata: string,
      terminals: string,
      gates: string,
      list: string
    ) =>
      `${name} (${iata}) hat ${terminals} mit insgesamt ${gates}: ${list}.`,
    gateCount: (name: string) => `Wie viele Gates gibt es am ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) hat insgesamt ${gates}: ${list}.`,
    whereIs: (iata: string) => `Wo liegt ${iata}?`,
    whereIsAnswer: (
      iata: string,
      name: string,
      nameEn: string,
      city: string,
      cityEn: string,
      country: string
    ) =>
      `${iata} ist der IATA-Code für ${name} (${nameEn}), gelegen in ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) =>
      `Wie weit ist es vom Zentrum von ${city} bis zum ${name}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} liegt etwa ${distance} vom Zentrum von ${city} entfernt. In die Stadt gelangen Sie mit ${transit}.`,
    access: (name: string, city: string) =>
      `Wie komme ich vom ${name} nach ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Welche Einrichtungen gibt es am ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} bietet ${facilities}. Der Terminalplan oben zeigt, wie sich diese auf die Terminals verteilen.`,
    location: (name: string) => `Wo liegt ${name}?`,
    locationAnswer: (
      name: string,
      nameEn: string,
      iata: string,
      city: string,
      cityEn: string,
      country: string
    ) =>
      `${name} (${nameEn}, IATA-Code ${iata}) liegt in ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) =>
      `Welche Fluggesellschaften fliegen ab welchem Terminal am ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Wichtigste Fluggesellschaften nach Terminal am ${name}: ${list}. Airlines und Gate-Zuweisungen ändern sich – maßgeblich sind Ihre Bordkarte und die Beschilderung am Flughafen.`,
    timezone: (name: string) => `In welcher Zeitzone liegt ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) liegt in der Zeitzone ${tz}. Vergleichen Sie die Uhrzeit oben an der Flughafenuhr mit Ihrer Ortszeit.`,
    flightsCount: (name: string) => `Wie viele Flugnummern sind am ${name} gelistet?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Das Fluginventar von aviability.com listet für ${name} (${iata}) ${plural(
        departures,
        'Abflug-Flugnummer',
        'Abflug-Flugnummern'
      )} und ${plural(arrivals, 'Ankunfts-Flugnummer', 'Ankunfts-Flugnummern')} von ${plural(
        airlines,
        'Fluggesellschaft',
        'Fluggesellschaften'
      )} zu ${plural(destinations, 'Ziel', 'Zielen')} (Stand ${date}). Codeshare-Nummern sind enthalten; Flugnummern und Flugpläne können sich ändern – bestätigen Sie Details vor der Reise bei der Airline.`,
  },

  editorial: {
    authorName: 'Redaktion Welt-Flughafenkarten',
    role: 'Zusammengestellt und geprüft von ',
    sourcesNote: 'Aus öffentlichen Quellen und offiziellen Flughafenangaben zusammengestellt',
  },

  toc: {
    label: 'Auf dieser Seite',
    map: 'Terminalplan',
    photos: 'Flughafenfotos',
    time: 'Flughafenzeit',
    details: 'Flughafendetails',
    links: 'Weiterführende Links',
    location: 'Lageplan',
    routes: 'Streckenkarte',
    flights: 'Flüge',
    guide: 'Flughafenführer',
    blog: 'Ratgeber',
    terminals: 'Terminalführer',
    transport: 'Bodentransport',
    facilities: 'Einrichtungen',
    faq: 'FAQ',
    flightOverview: 'Flugüberblick',
    flightRoute: 'Strecke',
    flightAirports: 'Flughäfen',
    flightDetails: 'Flugdetails',
    flightRoutes: 'Alle Strecken',
    flightRelated: 'Weitere Flüge',
    intro: 'Flughafenüberblick',
    distribution: 'Flughafenverteilung',
    airports: 'Flughafenliste',
  },

  error: {
    title: 'Diese Seite konnte nicht geladen werden',
    sub: 'Beim Lesen der Flughafendaten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.',
    retry: 'Erneut versuchen',
    backHome: 'Zur Startseite',
    notFoundTitle: '404 · Seite nicht gefunden',
    notFoundSub: 'Die angeforderte Seite wurde möglicherweise verschoben oder entfernt. Suchen Sie nach einem Flughafen oder nutzen Sie die Links unten.',
  },

  footer: {
    mapsTitle: 'Detaillierte Terminalpläne',
    mapsBody:
      'Sich an Flughäfen und ihren Terminals zurechtzufinden, kann herausfordernd sein. Unsere Flughafenpläne zeigen detaillierte Layouts von Terminals, Gates, Check-in-Bereichen, Gepäckausgabe, Geschäften, Restaurants, Lounges und Verkehrsknoten, damit Ihre Reise reibungsloser verläuft.',
    plansTitle: 'Interaktive Terminalpläne',
    plansBody:
      'Große internationale Flughäfen haben mehrere Terminals und komplexe Wegeführungen. Unsere detaillierten Pläne helfen Ihnen, Ihr Gate zu finden, Einrichtungen zu nutzen, einen Anschluss zu planen und zügig durch Sicherheitskontrolle, Abflug und Ankunft zu kommen.',
    transitTitle: 'Flughafentransfer und Anfahrt',
    transitBody:
      'Über den Terminalaufbau hinaus zeigen wir Transportmöglichkeiten, Parken und Anfahrtswege – wie Sie zu Ihrem Gate kommen, zwischen Terminals wechseln und Bahn, Bus, Taxi oder Mietwagen nutzen.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} Länder / Regionen · ${airports} Flughäfen · ${terminals} Terminals · illustrierte Terminalpläne`,
    fallback:
      'Illustrierte Terminalpläne und Bodentransport-Führer für Flughäfen weltweit',
    linksLabel: 'Fußzeilennavigation',
    about: 'Über uns',
    contact: 'Kontakt',
    sources: 'Datenquellen',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. Shared
   *  with the German content scripts through lib/i18n/de-vocab.json. */
  transportModes: deTransportModes,

  categories: {
    kicker: 'Durchsuchen',
    title: 'Nach Bereich durchsuchen',
    en: 'Nach Bereich durchsuchen',
    sub: 'Steigen Sie ins Verzeichnis ein, wie es Ihnen passt: nach Land, nach Region, nach Stadt – oder direkt zu den verkehrsreichsten Drehkreuzen, den neuesten Updates und den Flughafenführern.',
    allAirports: {
      title: 'Alle Flughäfen',
      body: 'Das vollständige Verzeichnis, nach Passagieraufkommen geordnet, nach Land filterbar und neu sortierbar.',
    },
    byCountry: {
      title: 'Nach Land',
      body: 'Sehen Sie, wie viele Flughäfen, Terminals und Gates jedes Land oder jede Region hat.',
    },
    byRegion: {
      title: 'Nach Region',
      body: 'Länder gruppiert nach Ostasien, Europa, Nordamerika und weiteren Regionen – für eine schnellere Auswahl.',
    },
    popularCities: {
      title: 'Beliebte Städte',
      body: 'Die verkehrsreichsten Flughafenstädte nach jährlichem Passagieraufkommen und alle Flughäfen darin.',
    },
    recentlyUpdated: {
      title: 'Zuletzt aktualisiert',
      body: 'Neu hinzugefügte und überarbeitete Flughafendatensätze, die neuesten zuerst.',
    },
    guides: {
      title: 'Flughafenführer',
      body: 'Ausführliche Führer zu Terminalwechseln, Wegen in die Stadt und praktischen Tipps.',
    },
    routes: {
      title: 'Streckenkarten',
      body: 'Das Nonstop-Netz eines Flughafens nach Zahl der Ziele, mit Fluggesellschaften und Entfernungen.',
    },
  },

  guides: {
    kicker: 'Führer',
    title: 'Flughafenführer',
    en: 'Flughafenführer',
    sub: 'Jenseits der Terminalpläne haben wir ausführliche Führer zu ausgewählten Drehkreuzen verfasst: wie sich die Gate-Nummern lesen, wie Sie zwischen Terminals wechseln und wie Sie in die Stadt kommen.',
    more: 'Diesen Flughafen ansehen',
  },

  blog: {
    kicker: 'Journal',
    title: 'Reisenotizen',
    nav: 'Blog',
    en: 'Reisenotizen',
    sub: 'Ausführliche Notizen aus unserer Redaktion: Ankunft und Einreise, Transfers, Terminaleinrichtungen und wo man sich ausruhen kann.',
    more: 'Lesen',
    all: 'Alle Beiträge',
    morePosts: 'Weitere Beiträge',
    back: 'Zurück zur Beitragsliste',
    empty: 'Noch keine Beiträge.',
    readingMinutes: (n: number) => `${n} Min. Lesezeit`,
    source: (name: string) => `Quelle: ${name}`,
    tags: 'Schlagwörter',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Terminalplan für ${name}`,
    gates: 'Gates',
    terminal: 'Terminal',
    corridor: 'Verbindung',
    transit: 'Bodentransport',
    footer: (iata: string) => `${iata} · Terminalaufbau`,
  },

  tool: {
    label: 'Online-Tools',
    hub: {
      kicker: 'Tools',
      title: 'Karten- und Koordinaten-Tools',
      en: 'Kostenlose Tools',
      sub: 'Kostenlose Online-Tools für Reisende und Geografie-Fans – im Browser nutzbar, ohne Installation.',
      description:
        'Kostenlose Online-Tools für Karten und Koordinaten: Umrechnung WGS84 / GCJ02 / BD09, Dezimalgrad ↔ DMS und Großkreis-Distanz zwischen zwei Punkten. Zweisprachig, direkt im Browser.',
      comingTitle: 'Weitere Tools in Entwicklung',
      comingSub: 'Koordinatenauswahl, Standortfreigabe und Projektionsrechner sind auf dem Weg.',
    },
    howTitle: 'So funktioniert es',
    relatedTitle: 'Verwandte Tools',
    allTools: 'Alle Tools',
    tools: {
      coordinateConverter: {
        title: 'Koordinaten-Umrechner',
        en: 'Koordinaten-Umrechner',
        description:
          'Zwischen WGS84, GCJ02 und BD09 umrechnen – die Lösung für das Versatzproblem chinesischer Karten.',
        note: 'WGS84 ist der GPS- und internationale Standard. GCJ02 ist das in Festlandchina vorgeschriebene verschobene Koordinatensystem (auch „Mars-Koordinaten“ genannt), das AMap und Tencent Maps verwenden. BD09 legt auf GCJ02 eine weitere Verschiebung und wird von Baidu Maps genutzt. Derselbe Punkt kann sich zwischen den Systemen um 100–700 m unterscheiden – rechnen Sie also um, bevor Sie Koordinaten in einem anderen Kartendienst weiterverwenden.',
        steps: [
          'Dezimalkoordinaten als Breite, Länge eingeben – z. B. 39.9042, 116.4074.',
          'Das Koordinatensystem der Eingabe wählen.',
          'Auf „Umrechnen“ klicken, um die beiden anderen Systeme zu erhalten; mit „Kopieren“ ein Ergebnis übernehmen.',
        ],
        inputLabel: 'Koordinaten (Breite, Länge)',
        inputPlaceholder: 'z. B. 39.9042, 116.4074',
        sourceLabel: 'Koordinatensystem der Eingabe',
        wgs84: 'WGS84 · GPS / international',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Nachkommastellen',
        submit: 'Umrechnen',
        copy: 'Kopieren',
        copied: 'Kopiert',
        error:
          'Die Koordinaten konnten nicht gelesen werden. Verwenden Sie das Format „Breite, Länge“, z. B. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Koordinatenformat-Umrechner',
        en: 'Koordinatenformat-Umrechner',
        description:
          'Zwischen Dezimalgrad (DD), Grad-Minuten (DM) und Grad-Minuten-Sekunden (DMS) umrechnen; das Eingabeformat wird automatisch erkannt.',
        note: 'DD (39,9042°) ist die schlichte Dezimalform, die Geräte und APIs nutzen; DMS (39°54′15″N) ist in Seefahrt, Luftfahrt und Vermessung üblich; DM (39°54.25′N) wird typischerweise bei Feldaufnahmen verwendet. Das Tool erkennt das Eingabeformat an der Zahl der Zahlengruppen je Hälfte (1 = DD, 2 = DM, 3 = DMS) und gibt alle drei Formen aus, mit N/S/O/W für die Hemisphären.',
        steps: [
          'Ein Koordinatenpaar eingeben – 39.9042, 39°54′15″N und 39°32.5′E funktionieren alle; die beiden Hälften mit einem Komma trennen.',
          'Die Zahl der Nachkommastellen für die Ausgabe wählen.',
          'Auf „Umrechnen“ klicken – alle drei Formate erscheinen; mit „Kopieren“ eines übernehmen.',
        ],
        inputLabel: 'Koordinaten (ein Paar, durch Komma getrennt)',
        inputPlaceholder: 'z. B. 39°54′15″N, 116°24′51″E oder 39.9042, 116.4074',
        precisionLabel: 'Nachkommastellen',
        submit: 'Umrechnen',
        ddLabel: 'Dezimalgrad (DD)',
        dmLabel: 'Grad-Minuten (DM)',
        dmsLabel: 'Grad-Minuten-Sekunden (DMS)',
        copy: 'Kopieren',
        copied: 'Kopiert',
        error:
          'Die Koordinaten konnten nicht gelesen werden. Unterstützt werden z. B. 39.9042, 39°54′15″N und 39°32.5′E, getrennt durch ein Komma.',
      },
      distanceCalculator: {
        title: 'Entfernungsrechner',
        en: 'Entfernungsrechner',
        description:
          'Großkreis-Entfernung zwischen zwei Punkten auf der Erde, dazu der Anfangskurs.',
        note: 'Die Entfernung wird mit der Haversine-Formel (mittlerer Erdradius 6.371,0088 km) berechnet – der kürzeste Weg über die Erdoberfläche. Der Anfangskurs ist die Kompassrichtung vom ersten zum zweiten Punkt, 0° nach Norden und im Uhrzeigersinn zunehmend.',
        steps: [
          'Breite und Länge des Start- und Zielpunkts eingeben.',
          'Auf „Entfernung berechnen“ klicken.',
          'Das Ergebnis in Kilometern, Meilen und Seemeilen erhalten, dazu den Anfangskurs.',
        ],
        fromLabel: 'Von',
        toLabel: 'Nach',
        inputPlaceholder: 'Breite, Länge',
        example: 'Beispiel: Peking → Shanghai',
        submit: 'Entfernung berechnen',
        km: 'km',
        mi: 'mi',
        nmi: 'sm',
        bearing: 'Anfangskurs',
        copy: 'Kopieren',
        copied: 'Kopiert',
        error:
          'Die Koordinaten konnten nicht gelesen werden. Verwenden Sie das Format „Breite, Länge“ mit Breite −90–90 und Länge −180–180.',
      },
    },
  },
};
