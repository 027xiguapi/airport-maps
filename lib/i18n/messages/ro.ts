import type { Messages } from './zh';
import { roTransportModes } from '../ro-data';

/** Clasa aeroportului în propoziția introductivă (tipul airport din schema.org). */
const AIRPORT_KIND = {
  large: 'aeroport mare',
  medium: 'aeroport mijlociu',
  small: 'aeroport mic',
  heliport: 'heliport',
} as const;

/**
 * Plural românesc: 1 terminal, 2–19 terminale, 20+ „de terminale”; 101 ia din
 * nou forma de singular. `value` vine deja formatat (virgulă zecimală), așa că
 * îl parsăm înapoi.
 */
const pluralRo = (value: string, one: string, many: string) => {
  const n = Number(value.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return `${value} de ${many}`;
  const abs = Math.abs(n);
  if (!Number.isInteger(abs)) return `${value} de ${many}`;
  const mod100 = abs % 100;
  if (abs === 1 || mod100 === 1) return `${value} ${one}`;
  if (abs < 20) return `${value} ${many}`;
  return `${value} de ${many}`;
};

/**
 * Catalogul românesc. Tipizat față de sursa chineză (`Messages`), astfel încât
 * o cheie lipsă sau redenumită oprește compilarea.
 */
export const ro: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Hărți de aeroport și terminale',
    description:
      'Răsfoiți hărți ale terminalelor de aeroport, organizate pe țări și regiuni. De la marile noduri internaționale la aeroporturi regionale: vedeți planuri detaliate ale porților, zonelor de check-in, benzilor de bagaje, magazinelor, restaurantelor, saloanelor și transportului spre oraș.',
    keywords: [
      'hărți de aeroport',
      'hărți de terminale',
      'planul terminalului de aeroport',
      'porți de îmbarcare',
      'transport aeroportuar',
      'ghid de aeroport',
    ],
    numberOfItems: (n: number) =>
      pluralRo(String(n), 'aeroport', 'aeroporturi'),
  },

  nav: {
    home: 'Acasă',
    airports: 'Toate aeroporturile',
    countries: 'După țară',
    tools: 'Instrumente online',
    about: 'Despre noi',
    label: 'Navigare principală',
    languageLabel: 'Limbă',
    switchLanguage: 'Schimbă limba',
    languagePlanned: 'În pregătire',
    languagePlannedHint: 'Această versiune lingvistică nu a fost încă publicată.',
    themeToggle: 'Comută modul întunecat',
    menu: 'Meniu',
  },

  common: {
    advertisement: 'Reclamă',
    skipToContent: 'Sari la conținut',
    backToTop: 'Înapoi sus',
    breadcrumbLabel: 'Firimituri de navigare',
    home: 'Acasă',
    viewMap: 'Vezi harta',
    terminalMap: 'Harta terminalului',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralRo(String(counts.terminals), 'terminal', 'terminale')}${
            counts.gates > 0
              ? `, ${pluralRo(String(counts.gates), 'poartă', 'porți')}`
              : ''
          } — harta terminalului`
        : `${name} (${iata}) — hartă de localizare și ghid ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — harta terminalului` : name,
    airportGuide: 'Ghid de aeroport',
    lastUpdated: 'Actualizat recent',
    updatedOn: (date: string) => `Actualizat ${date}`,
    publishedOn: (date: string) => `Publicat ${date}`,
    readMore: 'Citește ghidul complet',
  },

  units: {
    terminalsFact: 'Terminale',
    gatesFact: 'Porți',
    terminals: (n: number) => pluralRo(String(n), 'terminal', 'terminale'),
    terminalsShort: (n: number) => pluralRo(String(n), 'terminal', 'terminale'),
    gates: (n: number) => pluralRo(String(n), 'poartă', 'porți'),
    airports: (n: number) => pluralRo(String(n), 'aeroport', 'aeroporturi'),
    airportsChip: (n: number) => pluralRo(String(n), 'aeroport', 'aeroporturi'),
    pax: 'Pasageri',
    paxFull: 'Pasageri anual',
    distance: 'Până în centru',
    distanceFrom: (city: string) => `Din centrul ${city}`,
    gatesLabel: (range: string) => `Porți ${range}`,
    gatesCount: (n: number) => `${n} porți`,
    satellite: 'Terminal satelit',
    airlinesLabel: 'Principalele companii aeriene: ',
  },

  search: {
    ariaLabel: 'Caută aeroporturi',
    placeholder: 'Caută aeroporturi, orașe sau coduri IATA',
    heroPlaceholder: 'Caută după numele aeroportului, oraș sau cod IATA — de ex. LHR / Dubai / Heathrow',
    submit: 'Găsește aeroportul',
    loading: 'Se caută…',
    empty: 'Nu s-au găsit aeroporturi potrivite',
    resultsTitle: (term: string) => `Rezultate pentru „${term}”`,
    resultsCount: (n: number) =>
      `S-au găsit ${pluralRo(String(n), 'aeroport potrivit', 'aeroporturi potrivite')}.`,
    noResults: 'Niciun aeroport nu corespunde. Încercați alt cuvânt, de exemplu un nume de oraș sau un cod IATA.',
    noResultsHint: 'Nu găsiți aeroportul dorit?',
    viewAll: (n: number) => `Răsfoiește toate cele ${n} aeroporturi`,
    orBrowseByCountry: 'sau răsfoiește după țară',
    range: (from: number, to: number, total: number) =>
      `Se afișează ${from}–${to} din ${total} aeroporturi`,
  },

  hero: {
    eyebrow: 'Directorul mondial al aeroporturilor',
    titleLead: 'Explorați aeroporturile și',
    titleAccent: 'hărțile terminalelor',
    sub: 'Găsiți-vă drumul în orice aeroport cu colecția completă de hărți de aeroport și terminale, organizate pe țări și regiuni — de la marile noduri internaționale la aeroporturi regionale.',
    stats: {
      countries: 'Țări / regiuni',
      airports: 'Aeroporturi',
      terminals: 'Hărți de terminale',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Despre acest site',
      imageAlt: 'Un avion de pasageri la poarta unui terminal de aeroport cu fațadă de sticlă, în zori',
      blocks: [
        {
          title: 'Orientați-vă în orice aeroport cu hărți detaliate ale terminalelor',
          body: 'Orientarea în aeroporturi și terminale din întreaga lume poate fi dificilă. Hărțile noastre arată planuri detaliate ale terminalelor, porților, zonelor de check-in, benzilor de bagaje, magazinelor, restaurantelor, saloanelor și nodurilor de transport, astfel încât să puteți planifica traseul înainte de plecare.',
        },
        {
          title: 'Hărți interactive ale terminalelor și planuri de etaj',
          body: 'Marile aeroporturi internaționale au mai multe terminale și planuri complexe. Hărțile noastre vă ajută să găsiți porțile, să localizați facilitățile, să planificați legăturile și să treceți eficient prin controlul de securitate, zonele de plecare și sălile de sosire — fără să vă întoarceți.',
        },
        {
          title: 'Transport și acces la aeroport',
          body: 'Dincolo de planurile terminalelor, ghidurile noastre acoperă opțiunile de transport, parcarea și rutele de acces. Găsiți cea mai bună cale spre poarta de îmbarcare, legăturile între terminale și transportul terestru: tren, autobuz, taxi și închiriere auto.',
        },
      ],
    },
    map: {
      kicker: 'Harta lumii',
      title: 'Harta aeroporturilor',
      en: 'Harta aeroporturilor',
      sub: (airports: string, world: string) =>
        `Localizați ${world} aeroporturi cu zboruri regulate din întreaga lume — ${airports} dintre ele au aici o hartă a terminalului. Faceți clic pe un punct pentru țară sau regiune și detalii.`,
      all: 'Toate',
      gEurope: 'Europa',
      gAsia: 'Asia',
      gAmericas: 'America',
      gAfrica: 'Africa',
      gOceania: 'Oceania',
      legendSite: 'Inclus aici · clic pentru hărțile terminalelor',
      legendWorld: 'Alte aeroporturi cu zboruri regulate',
      countTemplate: '{n} aeroporturi afișate',
      download: 'Descarcă datele',
      downloadTitle: 'Exportă toate aeroporturile din filtrul curent ca CSV (IATA, nume, oraș, țară, coordonate)',
      openAirport: 'Vezi aeroportul',
    },
    popular: {
      kicker: 'Hărți de terminale',
      title: 'Hărți populare de aeroporturi',
      en: 'Hărți de aeroporturi',
      sub: 'O selecție de coperte ale hărților de terminale de la marile aeroporturi ale lumii — deschideți pagina unui aeroport pentru harta completă.',
    },
    recent: {
      kicker: 'Publicat recent',
      title: 'Actualizate recent',
      en: 'Actualizate recent',
      sub: 'Aeroporturi, țări și ghiduri noi sau revizuite.',
      countriesTitle: 'Țări actualizate recent',
    },
    routes: {
      kicker: 'Rute',
      title: 'Cele mai aglomerate hărți de rute',
      en: 'Hărți de rute',
      sub: 'Aeroporturi clasate după numărul de locuri deservite fără escală — deschideți unul pentru harta rutelor, companiile aeriene și lista destinațiilor.',
      collection: 'Colecția de rute',
      tabsLabel: 'Hărți de rute pe orașe',
      explore: (city: string) => `Explorează ${city}`,
      play: 'Pornește prezentarea',
      pause: 'Pauză prezentare',
    },
    photos: {
      kicker: 'Cele mai noi fotografii',
      title: 'Cele mai noi fotografii de aeroporturi',
      en: 'Cele mai noi fotografii',
      sub: 'Cele mai recent adăugate fotografii de aeroporturi — cele mai noi șase aeroporturi, câte o fotografie fiecare.',
      ariaLabel: 'Carusel cu cele mai noi fotografii de aeroporturi',
      prev: 'Fotografia anterioară',
      next: 'Fotografia următoare',
      play: 'Pornește prezentarea',
      pause: 'Pauză prezentare',
      counter: (index: number, total: number) => `Fotografia ${index} din ${total}`,
      view: (name: string) => `Vezi harta ${name}`,
      open: 'Deschide pagina aeroportului',
    },
    countries: {
      kicker: 'După țară',
      title: 'Hărți de aeroporturi după țară',
      en: 'Țări',
      sub: 'Răsfoiți hărți ale terminalelor organizate pe țări și regiuni, de la marile noduri internaționale la aeroporturi regionale.',
      more: 'Toate țările',
    },
    all: {
      kicker: 'Toate hărțile',
      title: 'Toate hărțile de aeroporturi',
      en: 'Toate aeroporturile',
      sub: 'Hărți ale celor mai aglomerate aeroporturi și noduri de călătorie din lume.',
      hint: 'Selectați un aeroport pentru a vedea planul terminalului.',
      more: 'Vezi tot',
    },
    facts: {
      kicker: 'Datele directorului',
      title: 'Datele aeroporturilor pe scurt',
      en: 'Liste și tabele',
      sub: 'Cifrele directorului în liste și tabele: acoperirea, cele mai aglomerate aeroporturi cu cifre publicate despre pasageri și distribuția regională.',
      note: (pax: string, detailed: string, total: string) =>
        `Cifrele despre pasageri acoperă ${pax} din ${total} aeroporturi; cifrele despre terminale și porți acoperă ${detailed} din ${total}. Numărul de terminale urmează gruparea proprie a directorului și poate include culoare.`,
      coverageTitle: 'Cifrele acoperirii',
      coverage: {
        airports: 'Aeroporturi',
        countries: 'Țări și regiuni',
        regions: 'Regiunile directorului',
        cities: 'Nume unice de orașe',
        terminals: 'Terminale',
        gates: 'Porți',
        routes: 'Aeroporturi cu hartă de rute',
      },
      busiest: {
        title: 'Cele mai aglomerate aeroporturi după pasageri anuali',
        sub: 'Cele mai aglomerate douăsprezece aeroporturi dintre cele cu cifre anuale publicate despre pasageri.',
        caption: 'Aeroporturi cu cifre anuale publicate, clasate',
        rank: 'Loc',
        iata: 'IATA',
        airport: 'Aeroport',
        city: 'Oraș',
        country: 'Țară',
        terminals: 'Terminale',
        gates: 'Porți',
        pax: 'Pasageri anuali (mil.)',
      },
      regions: {
        title: 'Aeroporturi după regiunea directorului',
        sub: 'Număr de aeroporturi, terminale și porți grupate după regiunile directorului; unele țări și teritorii aparțin de două regiuni.',
        caption: 'Număr de aeroporturi pe regiune',
        region: 'Regiune',
        airports: 'Aeroporturi',
        detailed: 'Cu date detaliate',
        terminals: 'Terminale',
        gates: 'Porți',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Aeroport',
    city: 'Oraș',
    country: 'Țară',
    size: 'Mărime',
    map: 'Hartă',
    empty: 'Niciun aeroport nu corespunde filtrelor. Încercați să extindeți selecția.',
  },

  pager: {
    label: 'Paginare',
    previous: 'Pagina anterioară',
    next: 'Pagina următoare',
  },

  filters: {
    searchPlaceholder: 'Caută aeroporturi, orașe sau coduri IATA',
    submit: 'Caută',
    country: 'Țară',
    all: 'Toate',
    sort: 'Sortează',
    sortPax: 'Pasageri',
    sortName: 'Nume',
    sortIata: 'Cod IATA',
    sortUpdated: 'Ultima actualizare',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Toate hărțile de aeroporturi: ${country}${sortLabel ? ` — sortate după: ${sortLabel}` : ''}`
        : `Toate hărțile de aeroporturi — sortate după: ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Toate hărțile de aeroporturi din ${country} pe o singură pagină: planuri ale terminalelor, zone de porți și transport terestru${sortLabel ? `, ordonate după: ${sortLabel}` : ''}.`
        : `Întregul director de hărți de aeroporturi pe o singură pagină: planuri ale terminalelor, zone de porți și transport terestru${sortLabel ? `, ordonate după: ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Răsfoiește aeroporturile după țară',
    description:
      'Răsfoiți directorul mondial de hărți ale terminalelor după țară și regiune. De la marile noduri internaționale la aeroporturi regionale: vedeți câte aeroporturi și terminale are fiecare țară.',
    sub: (countries: string, airports: string, terminals: string) =>
      `De la marile noduri internaționale la aeroporturi regionale — ${countries} țări și regiuni, ${airports} aeroporturi și ${terminals} terminale în total.`,
    regionCount: (countries: number, airports: number) =>
      `${pluralRo(String(countries), 'țară', 'țări')} · ${pluralRo(String(airports), 'aeroport', 'aeroporturi')}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} — harta aeroporturilor, toate ${count}` : `Hărți de aeroporturi: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} are ${total} aeroporturi cu zboruri regulate; ${count} dintre ele au aici o pagină-ghid, cu harta distribuției, lista națională completă și legăturile directe.`
        : `Hărți ale terminalelor pentru ${count} aeroporturi din ${name} (${nameEn}), acoperind principalele noduri internaționale și aeroporturile regionale din ${region}. Vedeți porțile, planurile terminalelor și transportul terestru.`,
    chip: (nameEn: string) => `AEROPORTURI: ${nameEn.toUpperCase()}`,
    kicker: 'Hărți de aeroporturi',
    titleOf: (name: string) => `Aeroporturi în ${name}`,
    en: 'Aeroporturi',
    sub: 'Selectați un aeroport pentru a vedea planul terminalului, zonele porților și opțiunile de transport.',
    empty: 'Nu există încă aeroporturi listate pentru această țară sau regiune.',
    moreKicker: 'Alte țări',
    moreTitle: 'Răsfoiește alte țări',
    moreEn: 'Mai multe țări',
    all: 'Toate țările',
    notFound: 'Țara nu a fost găsită',
    introKicker: 'Prezentare generală',
    introTitle: (name: string) => `Prezentarea aeroporturilor: ${name}`,
    introEn: 'Prezentarea aeroporturilor',
    introSub:
      'Amploarea aeroporturilor din această țară sau regiune, principalele noduri și orașele deservite.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} se află în ${o.region}. Acest site acoperă ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` și ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) este cel mai mare după pasagerii anuali, cu ${o.busiestPax}.`
        : '') +
      ` Aeroporturile deservesc orașe precum ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Fiecare pagină de aeroport conține harta localizării și codurile aeroportului, plus toate detaliile despre terminale, porți și transport adunate pentru el.',
    distribution: {
      kicker: 'Distribuție',
      title: (name: string) => `Harta distribuției aeroporturilor: ${name}`,
      en: 'Distribuția aeroporturilor',
      sub: (covered: string, total: string) =>
        `${total} aeroporturi cu zboruri regulate în întreaga țară (mari, mijlocii și mici); ${covered} dintre ele au aici o pagină-ghid. Lista completă urmează.`,
      mapAlt: (name: string, total: string) =>
        `Harta distribuției aeroporturilor: ${name}, ${total} aeroporturi cu zboruri regulate`,
      siteTag: 'Inclus aici',
      colAirport: 'Aeroport',
      colCity: 'Oraș',
      colType: 'Tip',
      types: {
        large: 'Mare',
        medium: 'Mijlociu',
        small: 'Mic',
      },
      empty: 'Lista națională a aeroporturilor nu este încă disponibilă.',
    },
    linksTitle: 'Legături conexe',
    linksEn: 'Legături conexe',
    linksSub: 'Site-uri oficiale și enciclopedii pentru țară și fiecare dintre aeroporturile sale.',
    linksCountry: (name: string) => `Referințe despre ${name}`,
    linksAirports: (name: string) => `Aeroporturi în ${name}`,
    faqKicker: 'Întrebări frecvente',
    faqTitle: 'Întrebări frecvente',
    faqEn: 'Întrebări',
    faq: {
      airportTotal: (name: string) => `Câte aeroporturi există în ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} are ${total} aeroporturi cu trafic regulat de pasageri (mari, mijlocii și mici); acest site acoperă în detaliu ${covered} dintre ele. Vedeți harta distribuției și lista completă mai sus.`,
      airportCount: (name: string) => `Ce aeroporturi sunt acoperite în ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Acest site acoperă ${count} în ${name}: ${list}.`,
      busiest: (name: string) => `Care este cel mai aglomerat aeroport din ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `După pasagerii anuali, ${busiest} (${iata}) este cel mai mare dintre aeroporturile acoperite aici, cu ${pax}.`,
      terminals: (name: string) => `Câte terminale au aeroporturile din ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Aeroporturile acoperite în ${name} au ${terminals} cu ${gates} în total: ${list}.`,
      cities: (name: string) => `Ce orașe din ${name} au aeroport?`,
      citiesAnswer: (name: string, cities: string) =>
        `Aeroporturile din ${name} acoperite aici deservesc orașe precum ${cities}. Le puteți filtra după oraș sau cod IATA în directorul de aeroporturi.`,
      maps: (name: string) => `Aeroporturile din ${name} au hărți ale terminalelor?`,
      mapsAnswer: (name: string, count: string) =>
        `Unele da. Paginile de aeroport conțin o hartă a localizării, codurile aeroportului și legăturile directe, iar cele ${count} acoperite în ${name} arată planul terminalului, zonele porților și transportul terestru acolo unde detaliile sunt adunate. Deschideți un aeroport pentru a vedea ce este disponibil.`,
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
        ? `${o.name} (${o.iata}) are ${pluralRo(o.terminals, 'terminal', 'terminale')}${
            o.gates ? ` cu ${pluralRo(o.gates, 'poartă', 'porți')}` : ''
          }${o.pax ? `, deservind ${o.pax} pasageri pe an` : ''}${
            o.distance ? `, ${o.distance} de centrul orașului` : ''
          }. Harta terminalului cu toate terminalele, zonele porților și transportul terestru.`
        : `${o.name} (${o.iata}) deservește ${o.city}, ${o.country}. Hartă de localizare, coduri de aeroport și informații de călătorie.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'aeroport';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) este un ${kind} care deservește ${where}`;
      return o.terminals > 0
        ? `${head}, cu ${pluralRo(String(o.terminals), 'terminal', 'terminale')}${
            o.gates > 0 ? ` și ${pluralRo(String(o.gates), 'poartă', 'porți')}` : ''
          }${o.distance ? `, la aproximativ ${o.distance} de centrul ${o.city}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Planul terminalului`,
    mapNote: 'PLANUL TERMINALULUI',
    realMapTitle: (iata: string) => `${iata} — harta terminalului, porți și navigare`,
    mapAlt: (name: string, iata: string) =>
      `Harta terminalului ${name} (${iata}) cu toate terminalele, zonele porților și culoarele`,
    realMapNote: 'HARTA TERMINALULUI',
    photosKicker: 'Fotografii',
    photosTitle: 'Fotografii ale aeroportului',
    photosEn: 'Fotografii ale aeroportului',
    photosSub:
      'Fotografii reale ale acestui aeroport, fiecare cu pagina web publică unde a fost găsită; drepturile de autor rămân la fotografi. Faceți clic pe o fotografie pentru a o mări sau pe linia sursei pentru a deschide pagina originală.',
    photosCredit: (host: string) => `Sursă: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Fotografia ${index} a aeroportului ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Mărește fotografia ${index} a aeroportului ${name}`,
    zoomLabel: 'Mărește',
    zoomClose: 'Închide',
    zoomIn: 'Apropie',
    zoomOut: 'Depărtează',
    downloadKicker: 'Descarcă',
    downloadTitle: 'Descarcă hărțile aeroportului',
    downloadEn: 'Descărcări',
    downloadMapLabel: (year: number, iata: string) =>
      `Cea mai nouă hartă a terminalului și plan de etaj ${iata} ${year} de descărcat`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Cea mai nouă hartă a terminalului ${iata} ${year} în PDF`,
    timeKicker: 'Ora',
    timeTitle: (iata: string) => `Informații despre oră — ora curentă la ${iata}`,
    timeEn: 'Ora la aeroport',
    timeSub: (iata: string, tz: string) => `Ora curentă la ${iata} (${tz}) comparată cu ora dumneavoastră locală.`,
    clockAirport: 'Ora curentă la aeroport',
    clockLocal: 'Ora dumneavoastră locală',
    infoKicker: 'Info',
    infoTitle: 'Informații și detalii despre aeroport',
    infoEn: 'Detalii aeroport',
    infoIata: 'Codul IATA al aeroportului',
    infoLocation: 'Localizarea aeroportului',
    infoCoords: 'Coordonate',
    infoTimezone: 'Fus orar',
    linksKicker: 'Legături',
    linksTitle: 'Legături conexe',
    linksEn: 'LEGĂTURI CONEXE',
    linksSub: 'Referințe externe pentru acest aeroport: site-ul oficial, Wikipedia și Baidu Baike.',
    officialSite: 'Site oficial',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Surse: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Date deschise OurAirports',
    sourcesNote:
      'Codurile aeroporturilor, coordonatele și clasa aeroportului provin din date deschise; detaliile paginii urmează publicațiile oficiale ale aeroportului.',
    mapEmbedKicker: 'Hartă',
    mapEmbedTitle: (name: string) => `Hartă interactivă — localizarea ${name}`,
    mapEmbedEn: 'Hartă interactivă',
    extMapsNote: 'Vedeți acest aeroport pe alte servicii de hartă:',
    routeMapKicker: 'Rute',
    routeMapTitle: (name: string) => `Harta rutelor ${name} — destinații directe`,
    routeMapEn: 'Harta rutelor',
    routeMapAria: (name: string) => `Harta legăturilor directe din ${name}`,
    routeLegendTitle: 'Legendă',
    routeLegendClose: 'Ascunde legenda',
    routeReset: 'Resetează harta',
    routeZoomIn: 'Apropie',
    routeZoomOut: 'Depărtează',
    routeFullscreen: 'Ecran complet',
    routeExitFullscreen: 'Ieși din ecranul complet',
    routeOpenAirport: 'Deschide pagina aeroportului {iata}',
    routeTiers: {
      trunk: '6+ companii',
      major: '3–5 companii',
      minor: '2 companii',
      single: '1 companie',
    },
    routeCarriersTpl: '{n} companii',
    routeTableDest: 'Destinație',
    routeTableCountry: 'Țară/regiune',
    routeTableDistance: 'Distanță',
    routeTableCarriers: 'Companii',
    routeCarriersMore: (n: number) => ` +${n} altele`,
    routeMapNote: (date: string) =>
      `Instantaneu al datelor despre rute: ${date}; doar zboruri directe. Sursă: `,
    legendTerminal: 'Clădirea terminalului',
    legendTransit: 'Nod de transport terestru',
    legendCorridor: 'Legătură între terminale',
    terminalsKicker: 'Terminale',
    terminalsTitle: 'Ghidul terminalelor',
    terminalsEn: 'Ghidul terminalelor',
    terminalsSub: (name: string) =>
      `Zonele porților, principalele companii aeriene și facilitățile fiecărui terminal de pe ${name}.`,
    transitTitle: 'Transport terestru',
    facilitiesTitle: 'Facilitățile aeroportului',
    faqKicker: 'Întrebări frecvente',
    faqTitle: 'Întrebări frecvente',
    faqEn: 'Întrebări',
    guideKicker: 'Ghid',
    guideTitle: 'Ghidul aeroportului',
    guideEn: 'Ghidul aeroportului',
    blogKicker: 'Articole',
    blogTitle: (iata: string) => `Ghiduri pentru aeroportul ${iata}`,
    blogEn: 'Din blog',
    blogSub: (iata: string, count: number) =>
      `${count} articole de pe acest site tratează ${iata}: sosiri, transport terestru, bagaje și legături.`,
    blogAll: 'Toate articolele',
    relatedTitle: (country: string) => `Alte aeroporturi în ${country}`,
    relatedEn: (country: string) => `Mai multe în ${country}`,
    relatedAll: (country: string) => `Toate aeroporturile în ${country}`,
    flights: {
      kicker: 'Zboruri',
      title: (name: string) => `Zboruri către și din ${name} — plecări și sosiri`,
      en: 'Panou de zboruri',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${pluralRo(flights, 'număr de zbor', 'numere de zbor')} la ${pluralRo(
          airlines,
          'companie aeriană',
          'companii aeriene'
        )} și ${pluralRo(destinations, 'destinație', 'destinații')}, împărțite pe direcții. Numerele codeshare sunt incluse.`,
      statDepartures: 'Numere de plecare',
      statArrivals: 'Numere de sosire',
      statAirlines: 'Companii aeriene',
      statDestinations: 'Destinații',
      note: (date: string) =>
        `Numerele de zbor și rutele provin din indexul aviability.com (instantaneu ${date}); numerele codeshare sunt incluse și nu sunt afișate ore de plecare. Sursă: `,
      source: 'aviability.com',
      tabDepartures: 'Plecări',
      tabArrivals: 'Sosiri',
      search: 'Caută număr de zbor, companie sau oraș',
      clearSearch: 'Șterge căutarea',
      flight: 'Zbor',
      airline: 'Companie aeriană',
      destination: 'Destinație',
      origin: 'Origine',
      country: 'Țară/regiune',
      empty: 'Niciun zbor nu corespunde căutării.',
      loading: 'Se încarcă zborurile…',
      error: 'Nu s-au putut încărca mai multe zboruri.',
      retry: 'Încearcă din nou',
      previous: 'Anterior',
      next: 'Următor',
      pagination: 'Paginare',
      showing: 'Se afișează {from}–{to} din {total} numere de zbor',
      pageOf: 'Pagina {page} din {pages}',
    },
    notFound: 'Aeroportul nu a fost găsit',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Cea mai nouă hartă a rutelor ${name} (${iata}) ${year} — ${count} destinații directe`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Harta legăturilor directe din ${name} (${iata}): ${count} destinații cu companii aeriene și distanțe, plus lista completă a destinațiilor.`,
    heading: (name: string) => `Harta rutelor ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} are ${count} destinații directe, colorate după numărul de companii care le deservesc.`,
    backToAirport: (iata: string) => `Înapoi la pagina aeroportului ${iata}`,
    flightNumbers: (iata: string) => `Numere de zbor ${iata}`,
    openFull: 'Vezi harta rutelor',
    previewCta: (iata: string) => `Vezi harta completă a rutelor ${iata}`,
    teaserSub: (count: string) => `${count} destinații directe: hartă, companii aeriene și distanțe.`,
    mapSectionTitle: (name: string) => `Harta legăturilor directe din ${name}`,
    tableKicker: (iata: string) => `${iata} · Destinații`,
    tableSectionTitle: (name: string) => `Lista destinațiilor directe din ${name}`,
    tableSectionEn: (iata: string) => `Destinațiile ${iata}`,
    tableToc: 'Destinații',
    tableSectionSub: (count: string) =>
      `${count} destinații, cele mai aglomerate mai întâi după numărul de companii, cu distanță și operatori.`,
    dataKicker: 'Descarcă',
    dataTitle: 'Descarcă datele despre rute',
    dataEn: 'Date',
    dataSub: (count: number) =>
      `${count} legături directe cu destinație, cod IATA, oraș, țară, distanță și companii — gata pentru o foaie de calcul sau un script.`,
    dataFields: 'CSV se potrivește pentru Excel / Numbers, JSON pentru cod; ambele în UTF-8.',
    dataCsv: 'Descarcă CSV',
    dataJson: 'Descarcă JSON',
    airportMapSub:
      'Planul terminalelor și al porților pe scurt — faceți clic pe imagine pentru harta completă, facilitățile terminalelor și transportul terestru de pe pagina aeroportului.',
    airportMapCta: (iata: string) => `Vezi harta completă a terminalului ${iata}`,
    factDestinations: 'Destinații directe',
    factAirlines: 'Companii aeriene',
    factCountries: 'Țări',
    factSnapshot: 'Instantaneu al datelor',
    faqCountQ: (name: string) => `Către câte locuri zboară ${name} fără escală?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) are ${count} destinații directe în ${countries} țări și teritorii. Sunt numărate doar zborurile directe; itinerariile cu escală nu.`,
    faqAirlinesQ: (name: string) => `Câte companii aeriene zboară din ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} companii aeriene operează legături directe din acest aeroport. Cele mai mari rețele sunt ${leaders} (numărul destinațiilor între paranteze).`,
    faqFarthestQ: (name: string) => `Care este cea mai îndepărtată destinație directă din ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Cea mai îndepărtată destinație directă este ${city}, ${country} ${iata}, la aproximativ ${km} km.`,
    faqBusiestQ: () => 'Care destinații au cea mai mare concurență?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinații sunt deservite de trei sau mai multe companii; cele mai aglomerate sunt ${list}.`,
    faqSourceQ: () => 'Cât de des sunt actualizate datele despre rute?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Rutele de pe această pagină provin din setul deschis ${source} (${license}), un instantaneu din ${date}, nu un orar live — verificați biletele și orele la compania aeriană sau la aeroport.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Zborul ${number} al ${airline} — ${from} către ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Zborul ${number} este un număr de zbor folosit de ${airline} pe ruta ${from}–${to}${distance ? `, aproximativ ${distance}` : ''}. Harta rutei, aeroporturile de plecare și sosire, distanța și alte zboruri pe rută.`,
    heading: (number: string) => `Zborul ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Zborul ${number} este un număr de zbor folosit de ${airline} între ${from} și ${to}${distance ? `, o distanță în linie dreaptă de aproximativ ${distance}` : ''}.`,
    factFlight: 'Număr de zbor',
    factFrom: 'De la',
    factTo: 'La',
    factDistance: 'Distanță',
    overviewKicker: 'Prezentare generală',
    overviewTitle: (number: string) => `Despre zborul ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} este un număr de zbor folosit de ${airline} între ${originName} (${originIata}) și ${destName} (${destIata})${distance ? `, la aproximativ ${distance} unul de altul` : ''}. Pagina reunește numărul de zbor, compania, ruta și cele două aeroporturi pentru o consultare rapidă.`,
    overviewNote:
      'Indexul de zboruri nu include ore de plecare sau sosire, tipuri de aeronave sau date de operare; confirmați orarul, check-inul și îmbarcarea la compania aeriană sau la aeroport.',
    routeKicker: 'Rută',
    routeTitle: (from: string, to: string) => `Ruta ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Diagrama rutei zborului ${number}`,
    routeMapAria: (number: string) => `Harta rutei zborului ${number}`,
    airportsKicker: 'Aeroporturi',
    airportsTitle: 'Aeroporturile de plecare și sosire',
    airportsSub:
      'Aeroporturile pe care le leagă acest zbor. Aeroporturile acoperite de director își deschid propria pagină.',
    originAirport: 'Aeroport de plecare',
    destinationAirport: 'Aeroport de sosire',
    airportPage: 'Deschide pagina aeroportului',
    detailsKicker: 'Detalii',
    detailsTitle: 'Detaliile zborului',
    detailsFlight: 'Număr de zbor',
    detailsAirline: 'Companie aeriană',
    detailsOrigin: 'Aeroport de plecare',
    detailsDestination: 'Aeroport de sosire',
    detailsDistance: 'Distanță în linie dreaptă',
    detailsRoutes: 'Rute listate',
    detailsSnapshot: 'Instantaneu al datelor',
    routesKicker: 'Rute',
    routesTitle: 'Rute sub acest număr de zbor',
    routesSub: (count: string) =>
      `Numărul apare pe ${count} rute; un număr poate fi refolosit de parteneri codeshare.`,
    routesRoute: 'Rută',
    routesAirline: 'Companie aeriană',
    routesDistance: 'Distanță',
    relatedKicker: 'Asociate',
    relatedTitle: 'Alte zboruri pe această rută',
    relatedSub: 'Alte numere de zbor între aceleași aeroporturi de plecare și sosire.',
    relatedEn: 'Mai multe zboruri',
    faqKicker: 'Întrebări frecvente',
    faqTitle: 'Întrebări frecvente',
    faqEn: 'Întrebări',
    faqWhat: (number: string) => `Ce este zborul ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Zborul ${number} este un număr de zbor folosit de ${airline} pe ruta ${from} → ${to}${distance ? `, la aproximativ ${distance} unul de altul` : ''}.`,
    faqRoute: (number: string) => `Unde zboară zborul ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Zborul ${number} zboară de la ${originName} (${originIata}) la ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Unde sunt orele de plecare și sosire pentru ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Pagina acoperă numărul de zbor, compania, ruta și aeroporturile pentru ${number}. Indexul aviability.com nu include ore de plecare sau sosire — verificați orarul actual la compania aeriană sau la aeroport.`,
    note: (date: string) =>
      `Număr de zbor, companie și rută din indexul aviability.com (instantaneu ${date}); orele de plecare și sosire nu sunt incluse. Sursă: `,
    source: 'aviability.com',
    sourceFlight: 'Vezi pe aviability.com',
    viewAirport: (iata: string) => `Deschide pagina aeroportului ${iata}`,
    notFound: 'Zborul nu a fost găsit',
  },

  faq: {
    terminalCount: (name: string) => `Câte terminale are ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) are ${terminals} terminale cu ${gates} porți în total: ${list}.`,
    gateCount: (name: string) => `Câte porți are ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) are ${gates} porți în total: ${list}.`,
    whereIs: (iata: string) => `Unde se află ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} este codul IATA al aeroportului ${name} (${nameEn}), situat în ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Cât de departe este ${name} de centrul ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} este la aproximativ ${distance} de centrul ${city}. Puteți ajunge în oraș cu: ${transit}.`,
    access: (name: string, city: string) => `Cum ajung de la ${name} în ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Ce facilități oferă ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} oferă ${facilities}. Vedeți planul terminalului mai sus pentru distribuția între terminale.`,
    location: (name: string) => `Unde se află ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, cod IATA ${iata}) se află în ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Ce companii aeriene operează fiecare terminal de pe ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Principalele companii pe terminal la ${name}: ${list}. Companiiile și atribuirea porților se schimbă, așa că verificați întotdeauna cartea de îmbarcare și semnalizarea aeroportului.`,
    timezone: (name: string) => `În ce fus orar se află ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) se află în fusul orar ${tz}. Comparați cu ora locală folosind ceasul aeroportului de mai sus.`,
    flightsCount: (name: string) => `Câte numere de zbor sunt listate pentru ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Indexul aviability.com listează ${pluralRo(
        departures,
        'număr de plecare',
        'numere de plecare'
      )} și ${pluralRo(arrivals, 'număr de sosire', 'numere de sosire')} pentru ${name} (${iata}), acoperind ${pluralRo(
        airlines,
        'companie aeriană',
        'companii aeriene'
      )} și ${pluralRo(destinations, 'destinație', 'destinații')} (instantaneu ${date}). Numerele codeshare sunt incluse, iar orarele se pot schimba — confirmați la companie înainte de călătorie.`,
  },

  editorial: {
    authorName: 'Echipa redacțională World Airport Maps',
    role: 'Compilat și verificat de ',
    sourcesNote: 'Compilat din surse publice și informații oficiale ale aeroporturilor',
  },

  toc: {
    label: 'Pe această pagină',
    map: 'Harta terminalului',
    photos: 'Fotografii ale aeroportului',
    time: 'Ora la aeroport',
    details: 'Detalii aeroport',
    links: 'Legături conexe',
    location: 'Harta localizării',
    routes: 'Harta rutelor',
    flights: 'Zboruri',
    guide: 'Ghidul aeroportului',
    blog: 'Ghiduri conexe',
    terminals: 'Ghidul terminalelor',
    transport: 'Transport terestru',
    facilities: 'Facilități',
    faq: 'Întrebări frecvente',
    flightOverview: 'Prezentarea zborului',
    flightRoute: 'Rută',
    flightAirports: 'Aeroporturi',
    flightDetails: 'Detaliile zborului',
    flightRoutes: 'Toate rutele',
    flightRelated: 'Zboruri conexe',
    intro: 'Prezentarea aeroporturilor',
    distribution: 'Distribuția aeroporturilor',
    airports: 'Lista aeroporturilor',
  },

  error: {
    title: 'Pagina nu a putut fi încărcată',
    sub: 'Ceva a mers greșit la citirea datelor aeroportului. Încercați din nou sau reveniți la pagina principală.',
    retry: 'Încearcă din nou',
    backHome: 'Înapoi la pagina principală',
    notFoundTitle: '404 · Pagina nu a fost găsită',
    notFoundSub: 'Pagina solicitată poate fi mutată sau eliminată. Căutați un aeroport sau continuați cu legăturile de mai jos.',
  },

  footer: {
    sponsored: 'Sponsorizat',
    mapsTitle: 'Hărți detaliate ale terminalelor',
    mapsBody:
      'Orientarea în aeroporturi și terminalele lor poate fi dificilă. Hărțile noastre arată planuri detaliate ale terminalelor, porților, zonelor de check-in, benzilor de bagaje, magazinelor, restaurantelor, saloanelor și nodurilor de transport, astfel încât călătoria să fie mai fluidă.',
    plansTitle: 'Planuri interactive ale terminalelor',
    plansBody:
      'Marile aeroporturi internaționale au mai multe terminale și planuri complexe. Hărțile noastre vă ajută să găsiți poarta, facilitățile, să planificați o legătură și să treceți eficient prin securitate, plecări și sosiri.',
    transitTitle: 'Transport și acces la aeroport',
    transitBody:
      'Dincolo de planurile terminalelor acoperim opțiunile de transport, parcarea și rutele de acces — cum să ajungeți la poartă, să vă deplasați între terminale și să folosiți trenul, autobuzul, taxiul și închirierea auto.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} țări / regiuni · ${airports} aeroporturi · ${terminals} terminale · planuri ilustrate ale terminalelor`,
    fallback: 'Planuri ilustrate ale terminalelor și ghiduri de transport pentru aeroporturi din întreaga lume',
    linksLabel: 'Navigare în subsol',
    about: 'Despre noi',
    contact: 'Contact',
    sources: 'Surse de date',
    privacy: 'Politica de confidențialitate',
    disclaimer: 'Declinarea răspunderii',
    terms: 'Termeni de utilizare',
  },

  transportModes: roTransportModes as Record<string, string>,

  categories: {
    kicker: 'Răsfoiește',
    title: 'Răsfoiește după zonă',
    en: 'Răsfoiește după zonă',
    sub: 'Intrați în director din orice unghi: după țară, regiune, oraș — sau mergeți direct la cele mai aglomerate noduri, actualizările recente și ghiduri.',
    allAirports: {
      title: 'Toate aeroporturile',
      body: 'Directorul complet, clasat după volumul de pasageri, filtrabil după țară și resortabil.',
    },
    byCountry: {
      title: 'După țară',
      body: 'Vedeți câte aeroporturi, terminale și porți are fiecare țară sau regiune.',
    },
    byRegion: {
      title: 'După regiune',
      body: 'Țări grupate în Asia de Est, Europa, America de Nord și restul lumii.',
    },
    popularCities: {
      title: 'Orașe populare',
      body: 'Cele mai aglomerate orașe aeroportuare după pasagerii anuali totali și fiecare aeroport din ele.',
    },
    recentlyUpdated: {
      title: 'Actualizate recent',
      body: 'Înregistrări de aeroporturi nou adăugate și revizuite, cele mai recente primele.',
    },
    guides: {
      title: 'Ghiduri de aeroport',
      body: 'Ghiduri ample despre legături, deplasarea în oraș și sfaturi practice.',
    },
    routes: {
      title: 'Hărți de rute',
      body: 'Vedeți rețeaua de legături directe a unui aeroport, clasată după numărul de destinații, cu companii și distanțe.',
    },
  },

  guides: {
    kicker: 'Ghiduri',
    title: 'Ghiduri de aeroport',
    en: 'Ghiduri de aeroport',
    sub: 'Dincolo de planurile terminalelor, am scris ghiduri ample pentru noduri selectate: cum se citește numerotarea porților, cum se face legătura între terminale și cum ajungeți în oraș.',
    more: 'Vezi acest aeroport',
  },

  blog: {
    kicker: 'Jurnal',
    title: 'Note de călătorie',
    nav: 'Blog',
    en: 'Note de călătorie',
    sub: 'Note ample de la redacția noastră: sosire și imigrare, legături, facilități ale terminalelor și locuri de odihnă.',
    more: 'Citește',
    all: 'Toate articolele',
    morePosts: 'Mai multe articole',
    airportsKicker: 'Aeroporturi',
    airportsTitle: 'Aeroporturi în acest articol',
    airportsEn: 'Aeroporturi acoperite',
    airportsSub: 'Deschideți pagina unui aeroport pentru harta terminalului, transport terestru și întrebări frecvente.',
    back: 'Înapoi la lista de articole',
    empty: 'Încă nu există articole.',
    readingMinutes: (n: number) => `${n} min de citit`,
    source: (name: string) => `Sursă: ${name}`,
    tags: 'Etichete',
  },

  comments: {
    kicker: 'Comentarii',
    title: 'Comentariile cititorilor',
    en: 'Discuție',
    sub: 'Întrebările, relatările de călătorie și corectările sunt binevenite. Comentariile sunt publice.',
    formTitle: 'Lasă un comentariu',
    countOne: '1 comentariu',
    countMany: '{n} comentarii',
    empty: 'Încă nu există comentarii — fiți primul.',
    loading: 'Se încarcă comentariile…',
    loadError: 'Comentariile nu sunt disponibile momentan.',
    retry: 'Încearcă din nou',
    nameLabel: 'Nume',
    namePlaceholder: 'Cum să vă adresăm?',
    bodyLabel: 'Comentariu',
    bodyPlaceholder: 'Împărtășiți experiența, puneți o întrebare sau adăugați context…',
    submit: 'Publică comentariul',
    submitting: 'Se publică…',
    success: 'Publicat — mulțumim pentru împărtășire.',
    error: 'Comentariul nu a putut fi publicat. Încercați mai târziu.',
    rateLimited: 'A fost prea rapid. Așteptați câteva minute și încercați din nou.',
    nameError: 'Introduceți un nume (2–40 de caractere).',
    bodyError: 'Scrieți un comentariu (5–2000 de caractere).',
    note: 'Comentariile sunt publice și reflectă opiniile autorilor. Fiți politicos și nu publicați reclame sau date personale.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Planul terminalului ${name}`,
    gates: 'Porți',
    terminal: 'Terminal',
    corridor: 'Legătură',
    transit: 'Transport terestru',
    footer: (iata: string) => `${iata} · Planul terminalului`,
  },

  tool: {
    label: 'Instrumente online',
    hub: {
      kicker: 'Instrumente',
      title: 'Instrumente pentru hărți și coordonate',
      en: 'Instrumente gratuite',
      sub: 'Instrumente online gratuite pentru călători și iubitorii de geografie — rulează în browser, nimic de instalat.',
      description:
        'Instrumente online gratuite pentru hărți și coordonate: conversie WGS84 / GCJ02 / BD09, grade zecimale ↔ DMS și distanța în linie dreaptă între două puncte. Bilingve, direct în browser.',
      comingTitle: 'Mai multe instrumente în pregătire',
      comingSub: 'Selectarea coordonatelor pe hartă, partajarea locației și calculatoare de proiecție sunt pe drum.',
    },
    howTitle: 'Cum se folosește',
    relatedTitle: 'Instrumente conexe',
    allTools: 'Toate instrumentele',
    tools: {
      coordinateConverter: {
        title: 'Convertor de coordonate',
        en: 'Convertor de coordonate',
        description:
          'Convertiți între WGS84, GCJ02 și BD09 — soluția pentru problema decalajului hărților din China.',
        note: 'WGS84 este standardul GPS și internațional. GCJ02 este sistemul de coordonate decalat obligatoriu în China continentală (poreclit „coordonate marțiene”), folosit de AMap și Tencent Maps. BD09 adaugă un decalaj suplimentar peste GCJ02 și este folosit de Baidu Maps. Același loc poate diferi cu 100–700 m între sisteme, așa că convertiți înainte de a reutiliza coordonatele într-un alt serviciu de hartă.',
        steps: [
          'Introduceți coordonate zecimale ca latitudine, longitudine — de ex. 39.9042, 116.4074.',
          'Alegeți sistemul de coordonate al datelor de intrare.',
          'Apăsați „Convertește” pentru celelalte două sisteme; folosiți „Copiază” pentru a salva un rezultat.',
        ],
        inputLabel: 'Coordonate (latitudine, longitudine)',
        inputPlaceholder: 'de ex. 39.9042, 116.4074',
        sourceLabel: 'Sistemul de coordonate de intrare',
        wgs84: 'WGS84 · GPS / internațional',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Zecimale',
        submit: 'Convertește',
        copy: 'Copiază',
        copied: 'Copiat',
        error: 'Coordonatele nu au putut fi citite. Folosiți formatul „latitudine, longitudine”, de ex. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Convertor de format al coordonatelor',
        en: 'Convertor de format al coordonatelor',
        description:
          'Convertiți între grade zecimale (DD), grade-minute (DM) și grade-minute-secunde (DMS); formatul de intrare este detectat automat.',
        note: 'DD (39.9042°) este formatul zecimal obișnuit folosit de dispozitive și API-uri; DMS (39°54′15″N) este comun în navigație maritimă, aviație și topografie; DM (39°54.25′N) este tipic pentru notițele de teren. Instrumentul detectează formatul de intrare după numărul de grupuri de cifre din fiecare jumătate (1 = DD, 2 = DM, 3 = DMS) și afișează toate cele trei formate, cu N/S/E/V pentru emisfere.',
        steps: [
          'Introduceți o pereche de coordonate — 39.9042, 39°54′15″N și 39°32.5′E funcționează; separați cele două jumătăți cu virgulă.',
          'Alegeți numărul de zecimale pentru rezultat.',
          'Apăsați „Convertește” — sunt listate toate cele trei formate; folosiți „Copiază” pentru a salva unul.',
        ],
        inputLabel: 'Coordonate (o pereche, separate prin virgulă)',
        inputPlaceholder: 'de ex. 39°54′15″N, 116°24′51″E sau 39.9042, 116.4074',
        precisionLabel: 'Zecimale',
        submit: 'Convertește',
        ddLabel: 'Grade zecimale (DD)',
        dmLabel: 'Grade-minute (DM)',
        dmsLabel: 'Grade-minute-secunde (DMS)',
        copy: 'Copiază',
        copied: 'Copiat',
        error: 'Coordonatele nu au putut fi citite. Formatele acceptate includ 39.9042, 39°54′15″N și 39°32.5′E, separate prin virgulă.',
      },
      distanceCalculator: {
        title: 'Calculator de distanță',
        en: 'Calculator de distanță',
        description:
          'Distanța în linie dreaptă între două puncte de pe Pământ, plus azimutul inițial.',
        note: 'Distanța folosește formula Haversine pentru cercul mare (raza medie a Pământului 6.371,0088 km) — cea mai scurtă cale pe suprafață. Azimutul inițial este direcția busolei de la primul punct spre al doilea, 0° la nord și crescând în sensul acelor de ceasornic.',
        steps: [
          'Introduceți latitudinea și longitudinea punctului de start și de sosire.',
          'Apăsați „Calculează distanța”.',
          'Obțineți rezultatul în kilometri, mile și mile marine, plus azimutul inițial.',
        ],
        fromLabel: 'De la',
        toLabel: 'La',
        inputPlaceholder: 'latitudine, longitudine',
        example: 'Exemplu: Beijing → Shanghai',
        submit: 'Calculează distanța',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Azimut inițial',
        copy: 'Copiază',
        copied: 'Copiat',
        error: 'Coordonatele nu au putut fi citite. Folosiți formatul „latitudine, longitudine” cu latitudinea -90–90 și longitudinea -180–180.',
      },
    },
  },
};
