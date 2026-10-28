import type { Messages } from './zh';

/** "1 numéro de vol" / "2 numéros de vol" for already-formatted counts. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * Airport class wording for the lead sentence (schema.org's airport type).
 */
const AIRPORT_KIND = {
  large: 'grand aéroport',
  medium: 'aéroport de taille moyenne',
  small: 'petit aéroport',
  heliport: 'héliport',
} as const;

/**
 * "à" / "de" before a city name. French exonyms that carry an article need the
 * contracted form — "au Caire", not "à Le Caire" — and both helpers are applied
 * to the handful of city values that do (Le Caire, Le Cap, La Havane, La
 * Valette); every other name takes the plain preposition.
 */
const cityA = (city: string) =>
  /^Le /.test(city) ? `au ${city.slice(3)}` : /^Les /.test(city) ? `aux ${city.slice(4)}` : `à ${city}`;
const cityDe = (city: string) =>
  /^Le /.test(city) ? `du ${city.slice(3)}` : /^Les /.test(city) ? `des ${city.slice(4)}` : `de ${city}`;

/**
 * Airport names in running French take a definite article — "l'aéroport de
 * Munich compte 2 terminaux", not "Aéroport de Munich compte" — while the same
 * name stands bare in headings and metadata titles. These helpers add the
 * article only where a sentence needs it; directory airports still carry their
 * English name ("Anaa Airport") and are left alone.
 */
const air = (name: string) => (/^Aéroport/i.test(name) ? `l’${name[0].toLowerCase()}${name.slice(1)}` : name);
const airDe = (name: string) =>
  /^Aéroport/i.test(name)
    ? `de l’${name[0].toLowerCase()}${name.slice(1)}`
    : /^[AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜ]/.test(name)
      ? `d’${name}`
      : `de ${name}`;
const airA = (name: string) => (/^Aéroport/i.test(name) ? `à l’${name[0].toLowerCase()}${name.slice(1)}` : `à ${name}`);

/** Sentence-initial form of `air()`: "L’aéroport …" always starts capitalised. */
const airStart = (name: string) => {
  const value = air(name);
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * French catalog. Typed against the Chinese source of truth, so any missing or
 * renamed key fails the build.
 *
 * Sentences are written so that a country name can always sit in apposition
 * ("Aéroports — France", "Combien d'aéroports compte la France ?") instead of
 * after a preposition: French needs "en France" but "au Japon", "aux
 * États-Unis" and "à Singapour", and a generic template cannot pick the right
 * one from the name alone. City names use the `de`/`à` contractions for the
 * handful of exonyms that carry an article (Le Caire, Le Cap, La Havane, La
 * Valette).
 */
export const fr: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Cartes des aéroports et des terminaux',
    description:
      'Parcourez les plans des terminaux d’aéroports, classés par pays et par région. Des grandes plateformes internationales aux aéroports régionaux, découvrez la disposition détaillée des portes, des zones d’enregistrement, des tapis bagages, des boutiques, des restaurants, des salons et des liaisons terrestres.',
    keywords: [
      'cartes des aéroports',
      'plans des terminaux',
      'plan terminal aéroport',
      'portes d’embarquement',
      'transports aéroport',
      'guide aéroport',
    ],
    numberOfItems: (n: number) => `${n} aéroport${n === 1 ? '' : 's'}`,
  },

  nav: {
    home: 'Accueil',
    airports: 'Tous les aéroports',
    countries: 'Par pays',
    tools: 'Outils en ligne',
    about: 'À propos',
    label: 'Navigation principale',
    languageLabel: 'Langue',
    switchLanguage: 'Changer de langue',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'En préparation',
    languagePlannedHint: 'Cette version linguistique n’est pas encore publiée.',
    themeToggle: 'Basculer le mode sombre',
    menu: 'Menu',
  },

  common: {
    skipToContent: 'Aller au contenu principal',
    backToTop: 'Retour en haut',
    breadcrumbLabel: 'Fil d’Ariane',
    home: 'Accueil',
    viewMap: 'Voir la carte',
    terminalMap: 'Plan du terminal',
    /** Accessible iframe title on the ad slots (components/ads/). */
    advertisement: 'Publicité',
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
        ? `${name} (${iata}) : ${counts.terminals} ${
            counts.terminals === 1 ? 'terminal' : 'terminaux'
          }${counts.gates > 0 ? `, ${counts.gates} porte${counts.gates === 1 ? '' : 's'}` : ''} — plan des terminaux`
        : `${name} (${iata}) — carte de localisation et guide ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — plan des terminaux` : name,
    airportGuide: 'Guide de l’aéroport',
    lastUpdated: 'Récemment mis à jour',
    updatedOn: (date: string) => `Mis à jour le ${date}`,
    publishedOn: (date: string) => `Publié le ${date}`,
    readMore: 'Lire le guide complet',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Terminaux',
    gatesFact: 'Portes',
    terminals: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminaux'}`,
    terminalsShort: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminaux'}`,
    gates: (n: number) => `${n} porte${n === 1 ? '' : 's'}`,
    airports: (n: number) => `${n} aéroport${n === 1 ? '' : 's'}`,
    airportsChip: (n: number) => `${n} aéroport${n === 1 ? '' : 's'}`,
    pax: 'Passagers',
    paxFull: 'Passagers par an',
    distance: 'Du centre-ville',
    distanceFrom: (city: string) => `Depuis le centre-ville ${cityDe(city)}`,
    gatesLabel: (range: string) => `Portes ${range}`,
    gatesCount: (n: number) => `${n} portes`,
    satellite: 'Satellite',
    airlinesLabel: 'Principales compagnies : ',
  },

  search: {
    ariaLabel: 'Rechercher un aéroport',
    placeholder: 'Rechercher un aéroport, une ville ou un code IATA',
    heroPlaceholder: 'Recherchez par nom d’aéroport, ville ou code IATA — ex. LHR / Dubaï / Heathrow',
    submit: 'Trouver l’aéroport',
    loading: 'Recherche en cours…',
    empty: 'Aucun aéroport correspondant',
    resultsTitle: (term: string) => `Résultats pour « ${term} »`,
    resultsCount: (n: number) => `${n} aéroport${n === 1 ? ' correspondant trouvé' : 's correspondants trouvés'}.`,
    noResults: 'Aucun aéroport ne correspond. Essayez un autre mot-clé, comme un nom de ville ou un code IATA.',
    noResultsHint: 'Vous ne trouvez pas l’aéroport recherché ?',
    viewAll: (n: number) => `Parcourir les ${n} aéroports`,
    orBrowseByCountry: 'parcourir par pays',
    range: (from: number, to: number, total: number) =>
      `Affichage de ${from} à ${to} sur ${total} aéroports`,
  },

  hero: {
    eyebrow: 'Annuaire mondial des aéroports',
    titleLead: 'Explorez les aéroports et les',
    titleAccent: 'plans des terminaux',
    sub: 'Repérez-vous dans n’importe quel aéroport grâce à notre collection complète de cartes d’aéroports et de plans de terminaux, classés par pays et par région — des grandes plateformes internationales aux aéroports régionaux.',
    stats: {
      countries: 'Pays et régions',
      airports: 'Aéroports couverts',
      terminals: 'Plans de terminaux',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'À propos de ce site',
      imageAlt: 'Un avion de ligne à la porte d’un terminal vitré au lever du soleil',
      blocks: [
        {
          title: 'Se repérer dans tous les aéroports avec des plans de terminaux détaillés',
          body: 'S’orienter dans les aéroports et les terminaux du monde entier peut être compliqué. Nos cartes complètes présentent la disposition détaillée des terminaux, des portes, des zones d’enregistrement, des tapis bagages, des boutiques, des restaurants, des salons et des pôles de transport, pour préparer votre itinéraire avant le départ.',
        },
        {
          title: 'Plans interactifs des terminaux et des niveaux',
          body: 'Les grands aéroports internationaux comptent plusieurs terminaux et des agencements complexes. Nos plans détaillés vous aident à trouver votre porte, repérer les services, préparer une correspondance et traverser efficacement les contrôles de sécurité, les zones de départ et les halls d’arrivée — sans revenir sur vos pas.',
        },
        {
          title: 'Transports et accès à l’aéroport',
          body: 'Au-delà des plans, nos guides d’aéroport détaillent les moyens de transport, les parkings et les itinéraires d’accès. Trouvez la meilleure façon de rejoindre votre porte, de passer d’un terminal à l’autre et d’utiliser les transports terrestres : train, bus, taxi ou voiture de location.',
        },
      ],
    },
    map: {
      kicker: 'Carte mondiale',
      title: 'Carte des aéroports',
      en: 'Carte des aéroports',
      sub: (airports: string, world: string) =>
        `Localisez ${world} aéroports à vols réguliers dans le monde — dont ${airports} avec un plan des terminaux sur ce site. Cliquez sur un point pour son pays ou sa région et ses détails.`,
      all: 'Tous',
      gEurope: 'Europe',
      gAsia: 'Asie',
      gAmericas: 'Amériques',
      gAfrica: 'Afrique',
      gOceania: 'Océanie',
      legendSite: 'Couvert ici · cliquez pour les plans de terminaux',
      legendWorld: 'Autres aéroports à vols réguliers dans le monde',
      countTemplate: '{n} aéroports affichés',
      download: 'Télécharger les données',
      downloadTitle: 'Exporter tous les aéroports du filtre actuel au format CSV (IATA, nom, ville, pays, coordonnées)',
      openAirport: 'Voir l’aéroport',
    },
    popular: {
      kicker: 'Plans de terminaux',
      title: 'Cartes d’aéroports populaires',
      en: 'Cartes des aéroports',
      sub: 'Une sélection de couvertures de plans de terminaux de grands aéroports mondiaux — ouvrez la page d’un aéroport pour le plan complet.',
    },
    recent: {
      kicker: 'Nouveautés',
      title: 'Récemment mis à jour',
      en: 'Mises à jour récentes',
      sub: 'Aéroports, pays et guides de voyage nouveaux ou révisés.',
      countriesTitle: 'Pays récemment mis à jour',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Liaisons',
      title: 'Cartes des liaisons les plus fréquentées',
      en: 'Cartes des liaisons',
      sub: 'Aéroports classés selon le nombre de destinations desservies sans escale — ouvrez-en un pour sa carte, ses compagnies et la liste des destinations.',
      collection: 'La collection de liaisons',
      tabsLabel: 'Cartes des liaisons par ville',
      explore: (city: string) => `Explorer ${city}`,
      play: 'Lancer le diaporama',
      pause: 'Mettre le diaporama en pause',
    },
    countries: {
      kicker: 'Par pays',
      title: 'Cartes d’aéroports par pays',
      en: 'Pays',
      sub: 'Parcourez les plans de terminaux classés par pays et par région, des grandes plateformes internationales aux aéroports régionaux.',
      more: 'Tous les pays',
    },
    all: {
      kicker: 'Toutes les cartes',
      title: 'Toutes les cartes d’aéroports',
      en: 'Tous les aéroports',
      sub: 'Cartes des aéroports les plus fréquentés et des grands pôles de voyage dans le monde.',
      hint: 'Sélectionnez un aéroport pour voir la disposition de ses terminaux.',
      more: 'Tout voir',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Données de l’annuaire',
      title: 'Les données aéroportuaires en un coup d’œil',
      en: 'Listes et tableaux',
      sub: 'Les chiffres de l’annuaire présentés en listes et en tableaux : couverture, aéroports les plus fréquentés parmi ceux dont le trafic est publié, et répartition régionale.',
      note: (pax: string, detailed: string, total: string) =>
        `Les chiffres de passagers couvrent ${pax} aéroports sur ${total} ; ceux des terminaux et des portes, ${detailed} sur ${total}. Le nombre de terminaux suit la nomenclature de l’annuaire et peut inclure des concourses.`,
      coverageTitle: 'Couverture chiffrée',
      coverage: {
        airports: 'Aéroports',
        countries: 'Pays et régions',
        regions: 'Régions de l’annuaire',
        cities: 'Noms de villes uniques',
        terminals: 'Terminaux',
        gates: 'Portes',
        routes: 'Aéroports avec cartes des liaisons',
      },
      busiest: {
        title: 'Aéroports les plus fréquentés par passagers annuels',
        sub: 'Les 12 aéroports les plus fréquentés parmi ceux dont le trafic annuel est publié.',
        caption: 'Aéroports dont le trafic annuel est publié, classés',
        rank: 'Rang',
        iata: 'IATA',
        airport: 'Aéroport',
        city: 'Ville',
        country: 'Pays',
        terminals: 'Terminaux',
        gates: 'Portes',
        pax: 'Passagers annuels (M)',
      },
      regions: {
        title: 'Aéroports par région de l’annuaire',
        sub: 'Nombre d’aéroports, de terminaux et de portes selon les régions de l’annuaire ; certains pays et territoires couvrent deux régions.',
        caption: 'Nombre d’aéroports par région de l’annuaire',
        region: 'Région',
        airports: 'Aéroports',
        detailed: 'Avec données détaillées',
        terminals: 'Terminaux',
        gates: 'Portes',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Aéroport',
    city: 'Ville',
    country: 'Pays',
    size: 'Taille',
    map: 'Carte',
    empty: 'Aucun aéroport ne correspond à ces filtres. Essayez d’élargir votre sélection.',
  },

  pager: {
    label: 'Pagination',
    previous: 'Page précédente',
    next: 'Page suivante',
  },

  filters: {
    searchPlaceholder: 'Rechercher un aéroport, une ville ou un code IATA',
    submit: 'Rechercher',
    country: 'Pays',
    all: 'Tous',
    sort: 'Trier',
    sortPax: 'Passagers',
    sortName: 'Nom',
    sortIata: 'Code IATA',
    sortUpdated: 'Dernière mise à jour',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Toutes les cartes d’aéroport — ${country}${sortLabel ? `, triées par ${sortLabel}` : ''}`
        : `Toutes les cartes d’aéroport — triées par ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Toutes les cartes d’aéroport de la catégorie « ${country} » sur une seule page : plans des terminaux, plages de portes et accès terrestres${sortLabel ? `, classées par ${sortLabel}` : ''}.`
        : `L’annuaire complet des cartes d’aéroport sur une seule page : plans des terminaux, plages de portes et accès terrestres${sortLabel ? `, classés par ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Parcourir les aéroports par pays',
    description:
      'Parcourez l’annuaire mondial des plans de terminaux par pays et par région. Des grandes plateformes internationales aux aéroports régionaux, découvrez combien chaque pays compte d’aéroports et de terminaux.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Des grandes plateformes internationales aux aéroports régionaux — ${countries} pays et régions, ${airports} aéroports et ${terminals} terminaux au total.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} pays · ${airports} aéroport${airports === 1 ? '' : 's'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} — cartes des aéroports, ${count} aéroports` : `${name} — cartes des aéroports`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} : ${total} aéroports à vols réguliers, dont ${count} traités sur ce site. Carte de répartition, liste nationale complète et liaisons directes. Région : ${region}.`
        : `${name} (${nameEn}) : plans de terminaux pour ${count} aéroport${count === 1 ? '' : 's'}, des grandes plateformes internationales aux aéroports régionaux. Portes, disposition des terminaux et accès terrestres. Région : ${region}.`,
    chip: (nameEn: string) => `AÉROPORTS — ${nameEn.toUpperCase()}`,
    kicker: 'Cartes des aéroports',
    titleOf: (name: string) => `Aéroports — ${name}`,
    en: 'Aéroports',
    sub: 'Sélectionnez un aéroport pour voir la disposition de ses terminaux, ses plages de portes et ses solutions de transport terrestre.',
    empty: 'Aucun aéroport n’est encore répertorié pour ce pays ou cette région.',
    moreKicker: 'Autres pays',
    moreTitle: 'Parcourir d’autres pays',
    moreEn: 'Plus de pays',
    all: 'Tous les pays',
    notFound: 'Pays introuvable',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Aperçu',
    introTitle: (name: string) => `${name} — aperçu des aéroports`,
    introEn: 'Aperçu des aéroports',
    introSub:
      'L’ampleur du réseau aéroportuaire du pays ou de la région, ses principaux pôles et les villes desservies.',
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
      // leads as a label ("Chine — région : Asie de l'Est") because French
      // country names take an article as subject ("la Chine", "le Japon", "les
      // États-Unis") and a single template cannot pick the right one.
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} — région : ${o.region}. Ce site y recense ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` et ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${airStart(o.busiest)} (${o.busiestIata}) est le plus fréquenté en passagers annuels, avec ${o.busiestPax}.`
        : '') +
      ` Les aéroports desservent notamment ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Chaque page d’aéroport réunit la carte de localisation et les codes, ainsi que les informations compilées sur les terminaux, les portes et les transports terrestres.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Répartition',
      title: (name: string) => `${name} — carte de répartition des aéroports`,
      en: 'Répartition des aéroports',
      sub: (covered: string, total: string) =>
        `${total} aéroports à vols réguliers sur l’ensemble du territoire (grands, moyens et petits) ; ${covered} d’entre eux ont leur page dédiée sur ce site. La liste complète suit.`,
      mapAlt: (name: string, total: string) =>
        `Carte de répartition des aéroports — ${name} : ${total} aéroports à vols réguliers`,
      siteTag: 'Couvert ici',
      colAirport: 'Aéroport',
      colCity: 'Ville',
      colType: 'Type',
      types: {
        large: 'Grand',
        medium: 'Moyen',
        small: 'Petit',
      },
      empty: 'Aucune liste nationale d’aéroports disponible pour le moment.',
    },

    /** Related links */
    linksTitle: 'Liens utiles',
    linksEn: 'Liens utiles',
    linksSub: 'Sites officiels et notices encyclopédiques sur le pays et chacun de ses aéroports.',
    linksCountry: (name: string) => `${name} — références`,
    linksAirports: (name: string) => `Aéroports — ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Questions fréquentes',
    faqEn: 'Questions',
    faq: {
      airportTotal: (name: string) => `Combien d’aéroports compte ${name} ?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} compte ${total} aéroports assurant un service passagers régulier (grands, moyens et petits) ; ce site en détaille ${covered}. Voir la carte de répartition et la liste complète ci-dessus.`,
      airportCount: (name: string) => `Quels aéroports sont couverts ici ?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Ce site couvre ${count} aéroports pour ${name}, à savoir : ${list}.`,
      busiest: (name: string) => `Quel est l’aéroport le plus fréquenté de ce pays ?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `En passagers annuels, ${busiest} (${iata}) est le plus important des aéroports couverts ici, avec ${pax}.`,
      terminals: (name: string) => `Combien de terminaux comptent les aéroports de ce pays ?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Les aéroports couverts pour ${name} comptent ${terminals} et ${gates} au total : ${list}.`,
      cities: (name: string) => `Quelles villes de ce pays disposent d’un aéroport ?`,
      citiesAnswer: (name: string, cities: string) =>
        `Les aéroports couverts pour ${name} desservent notamment ${cities}. Vous pouvez les filtrer par ville ou par code IATA dans l’annuaire.`,
      maps: (name: string) => `Les aéroports de ce pays ont-ils des plans de terminaux ?`,
      mapsAnswer: (name: string, count: string) =>
        `En partie. Les pages d’aéroport réunissent la carte de localisation, les codes et les liaisons directes ; celles qui disposent de données sur les terminaux affichent en plus un schéma des terminaux, les plages de portes et les transports terrestres. Ouvrez un aéroport pour voir ce qu’il contient — ${count} sont couverts pour ${name}.`,
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
        ? `${airStart(o.name)} (${o.iata}) compte ${o.terminals} ${
            o.terminals === '1' ? 'terminal' : 'terminaux'
          }${o.gates ? ` et ${o.gates} porte${o.gates === '1' ? '' : 's'}` : ''}${
            o.pax ? `, avec ${o.pax} de passagers par an` : ''
          }${
            o.distance ? `, à ${o.distance} du centre-ville` : ''
          }. Plan des terminaux, plages de portes et accès terrestres.`
        : `${airStart(o.name)} (${o.iata}) dessert ${o.city} (${o.country}). Carte de localisation, codes aéroportuaires et informations pratiques.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'aéroport';
      const head = `${airStart(o.name)} (IATA : ${o.iata}${o.icao ? `, OACI ${o.icao}` : ''}) est un ${kind} qui dessert ${where}`;
      return o.terminals > 0
        ? `${head}, avec ${o.terminals} ${
            o.terminals === 1 ? 'terminal' : 'terminaux'
          }${o.gates > 0 ? ` et ${o.gates} porte${o.gates === 1 ? '' : 's'}` : ''}${
            o.distance ? `, à environ ${o.distance} du centre-ville` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Disposition des terminaux`,
    mapNote: 'DISPOSITION DES TERMINAUX',
    realMapTitle: (iata: string) => `Plan des terminaux de l’aéroport ${iata} — portes et orientation`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Plan des terminaux de ${name} (${iata}) : terminaux, plages de portes et halls`,
    realMapNote: 'PLAN DES TERMINAUX',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Photos',
    photosTitle: 'Photos de l’aéroport',
    photosEn: 'Photos de l’aéroport',
    photosSub:
      'De vraies photos de cet aéroport, chacune créditée à la page web publique où elle a été trouvée ; le droit d’auteur reste celui des photographes d’origine. Cliquez sur une photo pour l’agrandir, ou sur une mention de source pour ouvrir sa page.',
    photosCredit: (host: string) => `Source : ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Photo ${index} de l’aéroport ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Agrandir la photo ${index} ${airDe(name)}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Zoom',
    zoomClose: 'Fermer',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    downloadKicker: 'Téléchargement',
    downloadTitle: 'Télécharger les cartes de l’aéroport',
    downloadEn: 'Téléchargements',
    downloadMapLabel: (year: number, iata: string) =>
      `Plan des terminaux ${iata} ${year} — carte et plan des niveaux à télécharger`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Plan des terminaux ${iata} ${year} — téléchargement PDF`,
    timeKicker: 'Heure',
    timeTitle: (iata: string) => `Heure à l’aéroport — heure actuelle à ${iata}`,
    timeEn: 'Heure de l’aéroport',
    timeSub: (iata: string, tz: string) => `Heure actuelle à ${iata} (${tz}) comparée à votre heure locale.`,
    clockAirport: 'Heure actuelle à l’aéroport',
    clockLocal: 'Votre heure locale',
    infoKicker: 'Infos',
    infoTitle: 'Informations et détails sur l’aéroport',
    infoEn: 'Détails de l’aéroport',
    infoIata: 'Code IATA de l’aéroport',
    infoLocation: 'Localisation de l’aéroport',
    infoCoords: 'Coordonnées',
    infoTimezone: 'Fuseau horaire',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Liens',
    linksTitle: 'Liens utiles',
    linksEn: 'LIENS UTILES',
    linksSub: 'Références externes sur cet aéroport : site officiel, Wikipédia et Baidu Baike.',
    officialSite: 'Site officiel',
    wikiLabel: 'Wikipédia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Sources : ',
    sourcesWikipedia: 'Wikipédia',
    sourcesOurAirports: 'données ouvertes OurAirports',
    sourcesNote:
      'Les codes, les coordonnées et la classe de l’aéroport proviennent de données ouvertes ; les détails de la page suivent les publications officielles de chaque aéroport.',
    mapEmbedKicker: 'Carte',
    mapEmbedTitle: (name: string) => `Carte interactive — localisation de ${name}`,
    mapEmbedEn: 'Carte interactive',
    extMapsNote: 'Voir cet aéroport sur d’autres services de cartes :',
    routeMapKicker: 'Liaisons',
    routeMapTitle: (name: string) => `${name} — carte des liaisons directes`,
    routeMapEn: 'Carte des liaisons',
    routeMapAria: (name: string) => `Carte des liaisons directes depuis ${name}`,
    routeLegendTitle: 'Légende',
    routeLegendClose: 'Masquer la légende',
    routeReset: 'Réinitialiser la carte',
    routeZoomIn: 'Zoom avant',
    routeZoomOut: 'Zoom arrière',
    routeFullscreen: 'Afficher en plein écran',
    routeExitFullscreen: 'Quitter le plein écran',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Ouvrir la page de l’aéroport {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6 compagnies et plus',
      major: '3 à 5 compagnies',
      minor: '2 compagnies',
      single: '1 compagnie',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} compagnies',
    routeTableDest: 'Destination',
    routeTableCountry: 'Pays ou région',
    routeTableDistance: 'Distance',
    routeTableCarriers: 'Compagnies',
    routeCarriersMore: (n: number) => ` +${n} de plus`,
    routeMapNote: (date: string) =>
      `Instantané des données de liaison : ${date} ; vols directs uniquement. Source : `,
    legendTerminal: 'Bâtiment terminal',
    legendTransit: 'Pôle de transport terrestre',
    legendCorridor: 'Liaison entre terminaux',
    terminalsKicker: 'Terminaux',
    terminalsTitle: 'Guide des terminaux',
    terminalsEn: 'Guide des terminaux',
    terminalsSub: (name: string) =>
      `Plages de portes, principales compagnies et services de chaque terminal ${airDe(name)}.`,
    transitTitle: 'Transports terrestres',
    facilitiesTitle: 'Services de l’aéroport',
    faqKicker: 'FAQ',
    faqTitle: 'Questions fréquentes',
    faqEn: 'Questions',
    guideKicker: 'Guide',
    guideTitle: 'Guide de l’aéroport',
    guideEn: 'Guide de l’aéroport',
    blogKicker: 'Articles',
    blogTitle: (iata: string) => `Guides aéroport — ${iata}`,
    blogEn: 'Du blog',
    blogSub: (iata: string, count: number) =>
      `${count} articles du site traitent de ${iata} : arrivée, transports, bagages et correspondances.`,
    blogAll: 'Tous les articles',
    relatedTitle: (country: string) => `Autres aéroports — ${country}`,
    relatedEn: (country: string) => `Plus d’aéroports — ${country}`,
    relatedAll: (country: string) => `Tous les aéroports — ${country}`,
    /** Tableau des vols : numéros au départ et à l’arrivée (aviability.com). */
    flights: {
      kicker: 'Vols',
      title: (name: string) => `${name} : vols — départs et arrivées`,
      en: 'Flight Board',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'numéro de vol', 'numéros de vol')} de ${plural(
          airlines,
          'compagnie',
          'compagnies'
        )} vers ${plural(destinations, 'destination', 'destinations')}, séparés par sens. Les numéros en partage de code sont inclus.`,
      statDepartures: 'Numéros au départ',
      statArrivals: 'Numéros à l’arrivée',
      statAirlines: 'Compagnies',
      statDestinations: 'Destinations',
      note: (date: string) =>
        `Numéros de vol et liaisons issus de l’index de vols aviability.com (instantané du ${date}) ; les numéros en partage de code sont inclus et aucun horaire de départ n’est affiché. Source : `,
      source: 'aviability.com',
      tabDepartures: 'Départs',
      tabArrivals: 'Arrivées',
      search: 'Rechercher un numéro de vol, une compagnie ou une ville',
      clearSearch: 'Effacer la recherche',
      flight: 'Vol',
      airline: 'Compagnie',
      destination: 'Destination',
      origin: 'Provenance',
      country: 'Pays/région',
      empty: 'Aucun vol ne correspond à cette recherche.',
      loading: 'Chargement des vols…',
      error: 'Impossible de charger la suite des vols.',
      retry: 'Réessayer',
      previous: 'Précédent',
      next: 'Suivant',
      pagination: 'Pagination',
      showing: '{from}–{to} sur {total} numéros de vol',
      pageOf: 'Page {page} sur {pages}',
    },
    notFound: 'Aéroport introuvable',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Carte des liaisons ${name} (${iata}) ${year} — ${count} destinations directes`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Carte des liaisons directes ${airDe(name)} (${iata}) : ${count} destinations avec les compagnies, les distances et la liste complète des destinations.`,
    heading: (name: string) => `${name} — carte des liaisons`,
    headingSub: (iata: string, count: string) =>
      `${iata} compte ${count} destinations directes, colorées selon le nombre de compagnies qui les desservent.`,
    backToAirport: (iata: string) => `Retour à la page de l’aéroport ${iata}`,
    /** Lien de la carte des liaisons vers le tableau des vols de l’aéroport. */
    flightNumbers: (iata: string) => `Numéros de vol pour ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Voir la carte des liaisons',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Voir la carte complète des liaisons ${iata}`,
    teaserSub: (count: string) => `${count} destinations directes : carte, compagnies et distances.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `${name} — carte des liaisons directes`,
    tableKicker: (iata: string) => `${iata} · Destinations`,
    tableSectionTitle: (name: string) => `${name} — liste des destinations directes`,
    tableSectionEn: (iata: string) => `Destinations ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Destinations',
    tableSectionSub: (count: string) =>
      `${count} destinations, les plus desservies d’abord par nombre de compagnies, avec distance et opérateurs.`,
    dataKicker: 'Téléchargement',
    dataTitle: 'Télécharger les données de liaison',
    dataEn: 'Données',
    dataSub: (count: number) =>
      `${count} liaisons directes avec destination, code IATA, ville, pays, distance et compagnies — prêtes pour un tableur ou un script.`,
    dataFields: 'CSV pour Excel / Numbers, JSON pour le code ; les deux en UTF-8.',
    dataCsv: 'Télécharger le CSV',
    dataJson: 'Télécharger le JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Disposition des terminaux et des portes en un coup d’œil — cliquez sur l’image pour le plan complet, les services et les transports terrestres sur la page de l’aéroport.',
    airportMapCta: (iata: string) => `Voir le plan complet des terminaux ${iata}`,
    /** Header fact cells. */
    factDestinations: 'Destinations directes',
    factAirlines: 'Compagnies',
    factCountries: 'Pays',
    factSnapshot: 'Instantané des données',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `Combien de destinations ${air(name)} dessert-il sans escale ?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${airStart(name)} (${iata}) compte ${count} destinations directes dans ${countries} pays et territoires. Seules les liaisons sans escale sont comptées ; les itinéraires avec correspondance ne le sont pas.`,
    faqAirlinesQ: (name: string) => `Combien de compagnies partent ${airDe(name)} ?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} compagnies aériennes opèrent des liaisons directes depuis cet aéroport. Les réseaux les plus étendus sont ${leaders} (nombre de destinations entre parenthèses).`,
    faqFarthestQ: (name: string) => `Quelle est la destination directe la plus lointaine depuis ${air(name)} ?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `La destination directe la plus lointaine est ${city}, ${country} (${iata}), à environ ${km} km.`,
    faqBusiestQ: () => 'Quelles destinations sont les plus concurrentielles ?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinations sont desservies par au moins trois compagnies ; les plus concurrencées sont ${list}.`,
    faqSourceQ: () => 'À quelle fréquence les données de liaison sont-elles mises à jour ?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Les liaisons présentées ici proviennent du jeu de données ouvert ${source} (${license}), un instantané de ${date} et non un horaire en temps réel — vérifiez billets et horaires auprès de la compagnie ou de l’aéroport.`,
  },

  /** Page d’un numéro de vol (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} — vol ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Le vol ${number} est un numéro de vol de la compagnie ${airline} reliant ${from} à ${to}${distance ? `, à environ ${distance} à vol d’oiseau` : ''}. Carte de la liaison, aéroports de départ et d’arrivée, distance et autres vols sur la liaison.`,
    heading: (number: string) => `Vol ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Le vol ${number} est un numéro de vol de la compagnie ${airline} entre ${from} et ${to}${distance ? `, à environ ${distance} à vol d’oiseau` : ''}.`,
    factFlight: 'Numéro de vol',
    factFrom: 'Départ',
    factTo: 'Arrivée',
    factDistance: 'Distance',
    overviewKicker: 'Aperçu',
    overviewTitle: (number: string) => `À propos du vol ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `Le vol ${number} est un numéro de vol de la compagnie ${airline} entre ${originName} (${originIata}) et ${destName} (${destIata})${distance ? `, à environ ${distance}` : ''}. Cette page rassemble le numéro, la compagnie, la liaison et les deux aéroports pour une recherche rapide.`,
    overviewNote:
      'L’index des vols ne contient ni horaires de départ ou d’arrivée, ni appareil, ni jours d’exploitation ; vérifiez les horaires, l’enregistrement et l’embarquement auprès de la compagnie ou de l’aéroport.',
    routeKicker: 'Liaison',
    routeTitle: (from: string, to: string) => `Liaison ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Schéma de la liaison du vol ${number}`,
    routeMapAria: (number: string) => `Carte de la liaison du vol ${number}`,
    airportsKicker: 'Aéroports',
    airportsTitle: 'Aéroports de départ et d’arrivée',
    airportsSub:
      'Les deux aéroports de cette liaison. Ceux couverts par le répertoire ouvrent leur propre page.',
    originAirport: 'Aéroport de départ',
    destinationAirport: 'Aéroport d’arrivée',
    airportPage: 'Ouvrir la page de l’aéroport',
    detailsKicker: 'Détails',
    detailsTitle: 'Détails du vol',
    detailsFlight: 'Numéro de vol',
    detailsAirline: 'Compagnie',
    detailsOrigin: 'Aéroport de départ',
    detailsDestination: 'Aéroport d’arrivée',
    detailsDistance: 'Distance à vol d’oiseau',
    detailsRoutes: 'Liaisons répertoriées',
    detailsSnapshot: 'Instantané des données',
    routesKicker: 'Liaisons',
    routesTitle: 'Liaisons sous ce numéro de vol',
    routesSub: (count: string) =>
      `Ce numéro apparaît sur ${count} liaisons ; un même numéro peut être partagé par des compagnies en partage de code.`,
    routesRoute: 'Liaison',
    routesAirline: 'Compagnie',
    routesDistance: 'Distance',
    relatedKicker: 'Associés',
    relatedTitle: 'Autres vols sur cette liaison',
    relatedSub: 'D’autres numéros de vol entre les mêmes aéroports de départ et d’arrivée.',
    relatedEn: 'Plus de vols',
    faqKicker: 'FAQ',
    faqTitle: 'Questions fréquentes',
    faqEn: 'Questions',
    faqWhat: (number: string) => `Qu’est-ce que le vol ${number} ?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Le vol ${number} est un numéro de vol de la compagnie ${airline} sur la liaison ${from} → ${to}${distance ? `, à environ ${distance}` : ''}.`,
    faqRoute: (number: string) => `Où va le vol ${number} ?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Le vol ${number} relie ${originName} (${originIata}) à ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Où trouver les horaires du vol ${number} ?`,
    faqTimesAnswer: (number: string) =>
      `Cette page présente le numéro, la compagnie, la liaison et les aéroports du vol ${number}. L’index aviability.com ne fournit pas les horaires de départ ou d’arrivée — consultez la compagnie ou l’aéroport pour l’horaire en vigueur.`,
    note: (date: string) =>
      `Numéro de vol, compagnie et liaison issus de l’index de vols aviability.com (instantané du ${date}) ; les horaires de départ et d’arrivée ne sont pas inclus. Source : `,
    source: 'aviability.com',
    sourceFlight: 'Voir sur aviability.com',
    viewAirport: (iata: string) => `Ouvrir la page de l’aéroport ${iata}`,
    notFound: 'Vol introuvable',
  },

  faq: {
    terminalCount: (name: string) => `Combien de terminaux compte ${air(name)} ?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${airStart(name)} (${iata}) compte ${terminals} ${
        terminals === '1' ? 'terminal' : 'terminaux'
      } et ${gates} ${gates === '1' ? 'porte' : 'portes'} au total : ${list}.`,
    gateCount: (name: string) => `Combien de portes compte ${air(name)} ?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${airStart(name)} (${iata}) compte ${gates} ${gates === '1' ? 'porte' : 'portes'} au total : ${list}.`,
    whereIs: (iata: string) => `Où se trouve ${iata} ?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} est le code IATA ${airDe(name)} (${nameEn}), situé ${cityA(city)}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Quelle distance sépare ${air(name)} du centre-ville ?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${airStart(name)} se trouve à environ ${distance} du centre-ville. Vous pouvez rejoindre la ville en ${transit}.`,
    access: (name: string, city: string) => `Comment rejoindre le centre-ville depuis ${air(name)} ?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Quels services propose ${air(name)} ?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${airStart(name)} propose ${facilities}. Voir la disposition des terminaux ci-dessus pour leur répartition.`,
    location: (name: string) => `Où se situe ${air(name)} ?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${airStart(name)} (${nameEn}, code IATA ${iata}) se situe ${cityA(city)}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Quelles compagnies opèrent depuis chaque terminal ${airDe(name)} ?`,
    airlinesAnswer: (name: string, list: string) =>
      `Principales compagnies par terminal ${airA(name)} : ${list}. Les compagnies et les affectations de portes changent : vérifiez toujours sur votre carte d’embarquement et la signalétique de l’aéroport.`,
    timezone: (name: string) => `Dans quel fuseau horaire se trouve ${air(name)} ?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${airStart(name)} (${iata}) se trouve dans le fuseau horaire ${tz}. Comparez avec votre heure locale grâce à l’horloge de l’aéroport ci-dessus.`,
    flightsCount: (name: string) => `Combien de numéros de vol sont répertoriés ${airA(name)} ?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `L’index de vols aviability.com répertorie ${plural(
        departures,
        'numéro de vol au départ',
        'numéros de vol au départ'
      )} et ${plural(arrivals, 'numéro de vol à l’arrivée', 'numéros de vol à l’arrivée')} ${airDe(name)} (${iata}), opérés par ${plural(
        airlines,
        'compagnie',
        'compagnies'
      )} vers ${plural(destinations, 'destination', 'destinations')} (instantané du ${date}). Les numéros en partage de code sont inclus ; les horaires peuvent changer, vérifiez auprès de la compagnie avant de voyager.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Rédaction de World Airport Maps',
    role: 'Compilé et vérifié par ',
    sourcesNote: 'Établi à partir de sources publiques et d’informations officielles des aéroports',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'Sur cette page',
    map: 'Plan du terminal',
    photos: 'Photos de l’aéroport',
    time: 'Heure de l’aéroport',
    details: 'Détails de l’aéroport',
    links: 'Liens utiles',
    location: 'Carte de localisation',
    routes: 'Carte des liaisons',
    flights: 'Vols',
    guide: 'Guide de l’aéroport',
    blog: 'Guides liés',
    terminals: 'Guide des terminaux',
    transport: 'Transports terrestres',
    facilities: 'Services',
    faq: 'FAQ',
    flightOverview: 'Aperçu du vol',
    flightRoute: 'Liaison',
    flightAirports: 'Aéroports',
    flightDetails: 'Détails du vol',
    flightRoutes: 'Toutes les liaisons',
    flightRelated: 'Vols associés',
    intro: 'Aperçu de l’aéroport',
    distribution: 'Répartition des aéroports',
    airports: 'Liste des aéroports',
  },

  error: {
    title: 'Impossible de charger cette page',
    sub: 'Une erreur s’est produite lors de la lecture des données de l’aéroport. Réessayez, ou revenez à l’accueil pour continuer la navigation.',
    retry: 'Réessayer',
    backHome: 'Retour à l’accueil',
    notFoundTitle: '404 · Page introuvable',
    notFoundSub: 'La page demandée a peut-être été déplacée ou supprimée. Essayez de rechercher un aéroport, ou continuez avec les liens ci-dessous.',
  },

  footer: {
    mapsTitle: 'Plans détaillés des terminaux',
    mapsBody:
      'S’orienter dans les aéroports et leurs terminaux peut être un défi. Nos cartes montrent la disposition détaillée des terminaux, des portes, des zones d’enregistrement, des tapis bagages, des boutiques, des restaurants, des salons et des pôles de transport, pour un voyage plus fluide.',
    plansTitle: 'Plans interactifs des terminaux',
    plansBody:
      'Les grands aéroports internationaux comptent plusieurs terminaux et des agencements complexes. Nos plans détaillés vous aident à trouver votre porte, repérer les services, préparer une correspondance et traverser efficacement la sécurité, les départs et les arrivées.',
    transitTitle: 'Transports et accès à l’aéroport',
    transitBody:
      'Au-delà des terminaux, nous couvrons aussi les moyens de transport, les parkings et les itinéraires d’accès — comment rejoindre votre porte, passer d’un terminal à l’autre et utiliser train, bus, taxi ou voiture de location.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} pays et régions · ${airports} aéroports · ${terminals} terminaux · schémas illustrés des terminaux`,
    fallback: 'Schémas de terminaux et guides de transport terrestre pour les aéroports du monde entier',
    linksLabel: 'Navigation du pied de page',
    about: 'À propos',
    contact: 'Contact',
    sources: 'Sources des données',
    privacy: 'Confidentialité',
    terms: 'Conditions d’utilisation',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: 'Train',
    tram: 'Tramway',
    bus: 'Bus',
    taxi: 'Taxi',
    car: 'Voiture et parking',
    ferry: 'Ferry',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Parcourir',
    title: 'Parcourir par thème',
    en: 'Parcourir par thème',
    sub: 'Entrez dans l’annuaire par l’angle qui vous convient : par pays, par région, par ville — ou allez directement aux plateformes les plus fréquentées, aux dernières mises à jour et aux guides d’aéroport.',
    allAirports: {
      title: 'Tous les aéroports',
      body: 'L’annuaire complet, classé par trafic passagers, filtrable par pays et re-triable.',
    },
    byCountry: {
      title: 'Par pays',
      body: 'Découvrez le nombre d’aéroports, de terminaux et de portes de chaque pays ou région.',
    },
    byRegion: {
      title: 'Par région',
      body: 'Les pays regroupés par Asie de l’Est, Europe, Amérique du Nord et le reste du monde, pour cibler plus vite.',
    },
    popularCities: {
      title: 'Villes populaires',
      body: 'Les villes aéroportuaires les plus fréquentées par trafic annuel total, et tous leurs aéroports.',
    },
    recentlyUpdated: {
      title: 'Récemment mis à jour',
      body: 'Fiches d’aéroport ajoutées ou révisées récemment, les plus récentes d’abord.',
    },
    guides: {
      title: 'Guides d’aéroport',
      body: 'Guides détaillés sur les correspondances, l’accès à la ville et les conseils pratiques.',
    },
    routes: {
      title: 'Cartes des liaisons',
      body: 'Le réseau direct d’un aéroport, classé par nombre de destinations, avec compagnies et distances.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guides',
    title: 'Guides d’aéroport',
    en: 'Guides d’aéroport',
    sub: 'Au-delà des schémas de terminaux, nous avons rédigé des guides détaillés pour certains pôles : comment lire la numérotation des portes, comment passer d’un terminal à l’autre et comment rejoindre la ville.',
    more: 'Voir cet aéroport',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the French
   * wording of the same UI.
   */
  blog: {
    kicker: 'Journal',
    title: 'Carnet de voyage',
    nav: 'Blog',
    en: 'Carnet de voyage',
    sub: 'Notes détaillées de notre rédaction : arrivée et immigration, correspondances, services en terminal et où se reposer.',
    more: 'Lire',
    all: 'Tous les articles',
    morePosts: 'Plus d’articles',
    back: 'Retour à la liste des articles',
    empty: 'Aucun article pour le moment.',
    readingMinutes: (n: number) => `${n} min de lecture`,
    source: (name: string) => `Source : ${name}`,
    tags: 'Mots-clés',
  },

  comments: {
    kicker: 'Commentaires',
    title: 'Commentaires des lecteurs',
    en: 'Discussion',
    sub: 'Questions, récits de voyage et corrections sont les bienvenus. Les commentaires sont publics.',
    formTitle: 'Laisser un commentaire',
    countOne: '1 commentaire',
    countMany: '{n} commentaires',
    empty: 'Aucun commentaire pour l’instant — soyez le premier à écrire.',
    loading: 'Chargement des commentaires…',
    loadError: 'Les commentaires sont momentanément indisponibles.',
    retry: 'Réessayer',
    nameLabel: 'Nom',
    namePlaceholder: 'Comment vous appeler ?',
    bodyLabel: 'Commentaire',
    bodyPlaceholder: 'Partagez votre expérience, posez une question ou ajoutez des précisions…',
    submit: 'Publier le commentaire',
    submitting: 'Publication…',
    success: 'Publié — merci pour votre contribution.',
    error: 'Impossible de publier le commentaire. Réessayez plus tard.',
    rateLimited: 'C’était trop rapide. Patientez quelques minutes avant de réessayer.',
    nameError: 'Saisissez un nom (2 à 40 caractères).',
    bodyError: 'Écrivez un commentaire (5 à 2000 caractères).',
    note: 'Les commentaires sont publics et reflètent l’opinion de leurs auteurs. Restez courtois et ne publiez ni publicité ni données personnelles.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Schéma des terminaux de ${name}`,
    gates: 'Portes',
    terminal: 'Terminal',
    corridor: 'Liaison',
    transit: 'Transports terrestres',
    footer: (iata: string) => `${iata} · Disposition des terminaux`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Outils en ligne',
    hub: {
      kicker: 'Outils',
      title: 'Outils de cartes et de coordonnées',
      en: 'Outils gratuits',
      sub: 'Des outils en ligne gratuits pour les voyageurs et les amoureux de géographie — directement dans le navigateur, sans rien installer.',
      description:
        'Outils gratuits de cartes et de coordonnées : conversion WGS84 / GCJ02 / BD09, degrés décimaux ↔ DMS et distance orthodromique entre deux points. Bilingue, prêt dans votre navigateur.',
      comingTitle: 'D’autres outils en préparation',
      comingSub: 'Sélection de points sur carte, partage de position et calculateurs de projection arrivent bientôt.',
    },
    howTitle: 'Mode d’emploi',
    relatedTitle: 'Outils associés',
    allTools: 'Tous les outils',
    tools: {
      coordinateConverter: {
        title: 'Convertisseur de coordonnées',
        en: 'Convertisseur de coordonnées',
        description:
          'Convertissez entre WGS84, GCJ02 et BD09 — la solution au décalage des cartes en Chine.',
        note: 'Le WGS84 est la norme GPS internationale. Le GCJ02 est le système de coordonnées décalé obligatoire en Chine continentale (surnommé « coordonnées Mars »), utilisé par AMap et Tencent Maps. Le BD09 ajoute un décalage supplémentaire au GCJ02 et est utilisé par Baidu Maps. Un même lieu peut varier de 100 à 700 m d’un système à l’autre : convertissez avant de réutiliser des coordonnées dans un autre service cartographique.',
        steps: [
          'Saisissez des coordonnées décimales au format latitude, longitude — par ex. 39.9042, 116.4074.',
          'Choisissez le système de coordonnées de votre saisie.',
          'Cliquez sur « Convertir » pour obtenir les deux autres systèmes ; utilisez « Copier » pour enregistrer un résultat.',
        ],
        inputLabel: 'Coordonnées (latitude, longitude)',
        inputPlaceholder: 'ex. 39.9042, 116.4074',
        sourceLabel: 'Système de coordonnées saisi',
        wgs84: 'WGS84 · GPS / international',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Décimales',
        submit: 'Convertir',
        copy: 'Copier',
        copied: 'Copié',
        error: 'Impossible d’analyser les coordonnées. Utilisez le format « latitude, longitude », par ex. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Convertisseur de format de coordonnées',
        en: 'Convertisseur de format',
        description:
          'Convertissez entre degrés décimaux (DD), degrés-minutes (DM) et degrés-minutes-secondes (DMS) ; le format saisi est détecté automatiquement.',
        note: 'Le DD (39.9042°) est le style décimal utilisé par les appareils et les API ; le DMS (39°54′15″N) est courant en maritime, en aviation et en topographie ; le DM (39°54.25′N) est typique des relevés de terrain. L’outil déduit le format saisi du nombre de groupes de chiffres de chaque moitié (1 = DD, 2 = DM, 3 = DMS) et produit les trois styles, avec N/S/E/O pour les hémisphères.',
        steps: [
          'Saisissez une paire de coordonnées — les styles 39.9042, 39°54′15″N et 39°32.5′E fonctionnent ; séparez les deux moitiés par une virgule.',
          'Choisissez le nombre de décimales pour le résultat.',
          'Cliquez sur « Convertir » — les trois formats sont listés ; utilisez « Copier » pour en enregistrer un.',
        ],
        inputLabel: 'Coordonnées (une paire, séparée par une virgule)',
        inputPlaceholder: 'ex. 39°54′15″N, 116°24′51″E ou 39.9042, 116.4074',
        precisionLabel: 'Décimales',
        submit: 'Convertir',
        ddLabel: 'Degrés décimaux (DD)',
        dmLabel: 'Degrés-minutes (DM)',
        dmsLabel: 'Degrés-minutes-secondes (DMS)',
        copy: 'Copier',
        copied: 'Copié',
        error: 'Impossible d’analyser les coordonnées. Formats acceptés : 39.9042, 39°54′15″N et 39°32.5′E, séparés par une virgule.',
      },
      distanceCalculator: {
        title: 'Calculateur de distance',
        en: 'Calculateur de distance',
        description:
          'Distance orthodromique entre deux points du globe, avec l’azimut initial.',
        note: 'La distance utilise la formule de Haversine (rayon terrestre moyen 6 371,0088 km) — le chemin le plus court à la surface du globe. L’azimut initial est la direction de la boussole du premier point vers le second : 0° au nord, croissant dans le sens horaire.',
        steps: [
          'Saisissez la latitude et la longitude du point de départ et d’arrivée.',
          'Cliquez sur « Calculer la distance ».',
          'Obtenez le résultat en kilomètres, miles et milles marins, ainsi que l’azimut initial.',
        ],
        fromLabel: 'Départ',
        toLabel: 'Arrivée',
        inputPlaceholder: 'latitude, longitude',
        example: 'Exemple : Pékin → Shanghai',
        submit: 'Calculer la distance',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Azimut initial',
        copy: 'Copier',
        copied: 'Copié',
        error: 'Impossible d’analyser les coordonnées. Utilisez le format « latitude, longitude » avec une latitude entre -90 et 90 et une longitude entre -180 et 180.',
      },
    },
  },
};
