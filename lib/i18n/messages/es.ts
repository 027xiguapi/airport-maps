import type { Messages } from './zh';
import { esTransportModes } from '../es-data';

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'aeropuerto grande',
  medium: 'aeropuerto mediano',
  small: 'aeropuerto pequeño',
  heliport: 'helipuerto',
} as const;

/** "1 número de vuelo" / "2 números de vuelo" for already-formatted counts. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * Spanish catalog. Typed against the Chinese source of truth, so any missing or
 * renamed key fails the build.
 *
 * Style: neutral international Spanish (es-ES), informal address ("tú"), with
 * the established Spanish names for cities and countries (Pekín, Shanghái,
 * Estados Unidos). Airport names keep their international form.
 */
export const es: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Mapas de aeropuertos y terminales',
    description:
      'Explora los mapas de terminales de aeropuertos organizados por país y región. Desde los grandes centros internacionales hasta los aeropuertos regionales, consulta la distribución detallada de puertas, zonas de facturación, recogida de equipajes, tiendas, restaurantes, salas VIP y transporte terrestre.',
    keywords: [
      'mapas de aeropuertos',
      'mapas de terminales',
      'plano de terminal de aeropuerto',
      'puertas de embarque',
      'transporte aeroportuario',
      'guía de aeropuertos',
    ],
    numberOfItems: (n: number) => `${n} aeropuerto${n === 1 ? '' : 's'}`,
  },

  nav: {
    home: 'Inicio',
    airports: 'Todos los aeropuertos',
    countries: 'Por país',
    tools: 'Herramientas en línea',
    about: 'Acerca de',
    label: 'Navegación principal',
    languageLabel: 'Idioma',
    switchLanguage: 'Cambiar de idioma',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'En preparación',
    languagePlannedHint: 'Esta versión del idioma todavía no se ha publicado.',
    themeToggle: 'Activar o desactivar el modo oscuro',
    menu: 'Menú',
  },

  common: {
    advertisement: 'Publicidad',
    skipToContent: 'Saltar al contenido principal',
    backToTop: 'Volver arriba',
    breadcrumbLabel: 'Ruta de navegación',
    home: 'Inicio',
    viewMap: 'Ver mapa',
    terminalMap: 'Mapa de la terminal',
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
        ? `${name} (${iata}): ${counts.terminals} ${
            counts.terminals === 1 ? 'terminal' : 'terminales'
          }${counts.gates > 0 ? `, ${counts.gates} ${counts.gates === 1 ? 'puerta' : 'puertas'}` : ''} — Mapa de la terminal`
        : `${name} (${iata}) — Mapa de ubicación y guía del aeropuerto ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — Mapa de la terminal` : name,
    airportGuide: 'Guía del aeropuerto',
    lastUpdated: 'Actualizado recientemente',
    updatedOn: (date: string) => `Actualizado el ${date}`,
    publishedOn: (date: string) => `Publicado el ${date}`,
    readMore: 'Leer la guía completa',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Terminales',
    gatesFact: 'Puertas',
    terminals: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminales'}`,
    terminalsShort: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminales'}`,
    gates: (n: number) => `${n} ${n === 1 ? 'puerta' : 'puertas'}`,
    airports: (n: number) => `${n} aeropuerto${n === 1 ? '' : 's'}`,
    airportsChip: (n: number) => `${n} aeropuerto${n === 1 ? '' : 's'}`,
    pax: 'Pasajeros',
    paxFull: 'Pasajeros anuales',
    distance: 'Al centro de la ciudad',
    distanceFrom: (city: string) => `Desde el centro de ${city}`,
    gatesLabel: (range: string) => `Puertas ${range}`,
    gatesCount: (n: number) => `${n} puertas`,
    satellite: 'Terminal satélite',
    airlinesLabel: 'Principales aerolíneas: ',
  },

  search: {
    ariaLabel: 'Buscar aeropuertos',
    placeholder: 'Busca aeropuertos, ciudades o códigos IATA',
    heroPlaceholder: 'Busca por nombre de aeropuerto, ciudad o código IATA, p. ej., LHR / Dubái / Heathrow',
    submit: 'Buscar aeropuerto',
    loading: 'Buscando…',
    empty: 'No se han encontrado aeropuertos coincidentes',
    resultsTitle: (term: string) => `Resultados de búsqueda para «${term}»`,
    resultsCount: (n: number) =>
      `Se han encontrado ${n} ${n === 1 ? 'aeropuerto coincidente' : 'aeropuertos coincidentes'}.`,
    noResults: 'No hay aeropuertos que coincidan. Prueba con otra palabra clave, como el nombre de una ciudad o un código IATA.',
    noResultsHint: '¿No encuentras el aeropuerto que buscas?',
    viewAll: (n: number) => `Explora los ${n} aeropuertos`,
    orBrowseByCountry: 'o explora por país',
    range: (from: number, to: number, total: number) =>
      `Mostrando ${from}–${to} de ${total} aeropuertos`,
  },

  hero: {
    eyebrow: 'Directorio mundial de aeropuertos',
    titleLead: 'Explora aeropuertos y',
    titleAccent: 'mapas de terminales',
    sub: 'Oriéntate en cualquier aeropuerto con nuestra colección completa de mapas de aeropuertos y terminales, organizados por país y región: desde los grandes centros internacionales hasta los aeropuertos regionales.',
    stats: {
      countries: 'Países / regiones',
      airports: 'Aeropuertos incluidos',
      terminals: 'Mapas de terminales',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'Acerca de este sitio',
      imageAlt: 'Un avión de pasajeros en la puerta de embarque de una terminal aeroportuaria con fachada de cristal al amanecer',
      blocks: [
        {
          title: 'Oriéntate en cualquier aeropuerto con mapas de terminales detallados',
          body: 'Moverse por aeropuertos y terminales de todo el mundo puede ser complicado. Nuestros completos mapas de aeropuertos ofrecen la distribución detallada de terminales, puertas de embarque, zonas de facturación, recogida de equipajes, tiendas, restaurantes, salas VIP y centros de transporte, para que planifiques tu ruta antes de salir.',
        },
        {
          title: 'Mapas interactivos de terminales y planos de planta',
          body: 'Los grandes aeropuertos internacionales cuentan con varias terminales y distribuciones complejas. Nuestros mapas detallados te ayudan a localizar las puertas de embarque, encontrar servicios, planificar enlaces y moverte con eficacia por los controles de seguridad, las zonas de salida y las salas de llegadas, sin dar rodeos.',
        },
        {
          title: 'Información sobre transporte y acceso al aeropuerto',
          body: 'Además de la distribución de las terminales, nuestras guías de aeropuertos cubren las opciones de transporte, el aparcamiento y las rutas de acceso. Encuentra la mejor forma de llegar a tu puerta de embarque, conectar entre terminales y utilizar el transporte terrestre, incluidos trenes, autobuses, taxis y coches de alquiler.',
        },
      ],
    },
    map: {
      kicker: 'Mapa mundial',
      title: 'Mapa de aeropuertos',
      en: 'Mapa de aeropuertos',
      sub: (airports: string, world: string) =>
        `Localiza los ${world} aeropuertos con vuelos programados de todo el mundo; ${airports} de ellos incluyen mapas de terminales aquí. Haz clic en un punto para ver su país/región y sus detalles.`,
      all: 'Todos',
      gEurope: 'Europa',
      gAsia: 'Asia',
      gAmericas: 'América',
      gAfrica: 'África',
      gOceania: 'Oceanía',
      legendSite: 'Incluidos aquí · haz clic para ver los mapas de terminales',
      legendWorld: 'Otros aeropuertos con vuelos programados en el mundo',
      countTemplate: '{n} aeropuertos mostrados',
      download: 'Descargar datos',
      downloadTitle: 'Exporta todos los aeropuertos del filtro actual en CSV (IATA, nombre, ciudad, país, coordenadas)',
      openAirport: 'Ver aeropuerto',
    },
    popular: {
      kicker: 'Mapas de terminales',
      title: 'Mapas de aeropuertos populares',
      en: 'Mapas de aeropuertos',
      sub: 'Una selección de portadas de mapas de terminales de los principales aeropuertos del mundo; abre la página de un aeropuerto para ver el mapa completo.',
    },
    recent: {
      kicker: 'Recién publicados',
      title: 'Actualizados recientemente',
      en: 'Actualizados recientemente',
      sub: 'Aeropuertos, países y guías de viaje nuevos o recién revisados.',
      countriesTitle: 'Países actualizados recientemente',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Rutas',
      title: 'Mapas de rutas de los aeropuertos con más tráfico',
      en: 'Mapas de rutas',
      sub: 'Aeropuertos ordenados por el número de lugares a los que vuelan sin escalas; abre uno para ver su mapa de rutas, las aerolíneas y la lista de destinos.',
      collection: 'La colección de rutas',
      tabsLabel: 'Mapas de rutas por ciudad',
      explore: (city: string) => `Explora ${city}`,
      play: 'Iniciar la presentación',
      pause: 'Pausar la presentación',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'Últimas fotos',
      title: 'Últimas fotos de aeropuertos',
      en: 'Últimas fotos',
      sub: 'Las fotos de aeropuertos añadidas más recientemente: los seis aeropuertos más nuevos, una imagen de cada uno.',
      ariaLabel: 'Carrusel de las últimas fotos de aeropuertos',
      prev: 'Foto anterior',
      next: 'Foto siguiente',
      play: 'Iniciar la presentación',
      pause: 'Pausar la presentación',
      counter: (index: number, total: number) => `Foto ${index} de ${total}`,
      view: (name: string) => `Ver el mapa de ${name}`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'Abrir la página del aeropuerto',
    },
    countries: {
      kicker: 'Por país',
      title: 'Mapas de aeropuertos por país',
      en: 'Países',
      sub: 'Explora los mapas de terminales de aeropuertos organizados por país y región, desde los grandes centros internacionales hasta los aeropuertos regionales.',
      more: 'Todos los países',
    },
    all: {
      kicker: 'Todos los mapas',
      title: 'Todos los mapas de aeropuertos',
      en: 'Todos los aeropuertos',
      sub: 'Mapas de los aeropuertos y centros de viaje con más tráfico del mundo.',
      hint: 'Selecciona cualquier aeropuerto para ver la distribución de sus terminales.',
      more: 'Ver todos',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Datos del directorio',
      title: 'Los datos de aeropuertos de un vistazo',
      en: 'Listas y tablas',
      sub: 'Las cifras del directorio presentadas como listas y tablas: cobertura, los aeropuertos con más tráfico entre los que publican cifras de pasajeros y el reparto regional.',
      note: (pax: string, detailed: string, total: string) =>
        `Las cifras de pasajeros abarcan ${pax} de ${total} aeropuertos; las de terminales y puertas abarcan ${detailed} de ${total}. El recuento de terminales sigue la agrupación propia de este directorio y puede incluir zonas de embarque.`,
      coverageTitle: 'Cifras de cobertura',
      coverage: {
        airports: 'Aeropuertos',
        countries: 'Países y regiones',
        regions: 'Regiones del directorio',
        cities: 'Ciudades únicas',
        terminals: 'Terminales',
        gates: 'Puertas',
        routes: 'Aeropuertos con mapas de rutas',
      },
      busiest: {
        title: 'Aeropuertos con más tráfico por pasajeros anuales',
        sub: 'Los 12 aeropuertos con más tráfico entre los que publican cifras anuales de pasajeros.',
        caption: 'Aeropuertos con cifras anuales de pasajeros publicadas, por orden',
        rank: 'Puesto',
        iata: 'IATA',
        airport: 'Aeropuerto',
        city: 'Ciudad',
        country: 'País',
        terminals: 'Terminales',
        gates: 'Puertas',
        pax: 'Pasajeros anuales (mill.)',
      },
      regions: {
        title: 'Aeropuertos por región del directorio',
        sub: 'Recuentos de aeropuertos, terminales y puertas agrupados por las etiquetas de región del propio directorio; algunos países y territorios abarcan dos regiones.',
        caption: 'Recuento de aeropuertos agrupado por región del directorio',
        region: 'Región',
        airports: 'Aeropuertos',
        detailed: 'Con datos detallados',
        terminals: 'Terminales',
        gates: 'Puertas',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Aeropuerto',
    city: 'Ciudad',
    country: 'País',
    size: 'Tamaño',
    map: 'Mapa',
    empty: 'Ningún aeropuerto coincide con estos filtros. Prueba a ampliar la selección.',
  },

  pager: {
    label: 'Paginación',
    previous: 'Página anterior',
    next: 'Página siguiente',
  },

  filters: {
    searchPlaceholder: 'Busca aeropuertos, ciudades o códigos IATA',
    submit: 'Buscar',
    country: 'País',
    all: 'Todos',
    sort: 'Ordenar',
    sortPax: 'Pasajeros',
    sortName: 'Nombre',
    sortIata: 'Código IATA',
    sortUpdated: 'Última actualización',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Todos los mapas de aeropuertos de ${country}${sortLabel ? ` — ordenados por ${sortLabel}` : ''}`
        : `Todos los mapas de aeropuertos — ordenados por ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Todos los mapas de aeropuertos de ${country} en una sola página: distribución de terminales, rangos de puertas y transporte terrestre${sortLabel ? `, ordenados por ${sortLabel}` : ''}.`
        : `El directorio completo de mapas de aeropuertos en una sola página: distribución de terminales, rangos de puertas y transporte terrestre${sortLabel ? `, ordenados por ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Explora aeropuertos por país',
    description:
      'Explora el directorio mundial de mapas de terminales de aeropuertos por país y región. Desde los grandes centros internacionales hasta los aeropuertos regionales, descubre cuántos aeropuertos y terminales tiene cada país.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Desde los grandes centros internacionales hasta los aeropuertos regionales: ${countries} países y regiones, ${airports} aeropuertos y ${terminals} terminales en total.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ${countries === 1 ? 'país' : 'países'} · ${airports} ${airports === 1 ? 'aeropuerto' : 'aeropuertos'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count
        ? `Mapa de aeropuertos de ${name} — ${count} ${count === 1 ? 'aeropuerto' : 'aeropuertos'}`
        : `Mapas de aeropuertos de ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} tiene ${total} aeropuertos con vuelos programados; ${count} de ellos tienen una página de guía aquí, con el mapa de distribución de aeropuertos, la lista nacional completa y las rutas directas.`
        : `Mapas de terminales de ${count} ${count === 1 ? 'aeropuerto' : 'aeropuertos'} en ${name} (${nameEn}), que abarcan los principales centros internacionales y aeropuertos regionales de ${region}. Consulta las puertas, la distribución de las terminales y el transporte terrestre.`,
    chip: (nameEn: string) => `AEROPUERTOS DE ${nameEn.toUpperCase()}`,
    kicker: 'Mapas de aeropuertos',
    titleOf: (name: string) => `Aeropuertos en ${name}`,
    en: 'Aeropuertos',
    sub: 'Selecciona cualquier aeropuerto para ver la distribución de sus terminales, los rangos de puertas y las opciones de transporte terrestre.',
    empty: 'Todavía no hay aeropuertos listados para este país o región.',
    moreKicker: 'Otros países',
    moreTitle: 'Explora otros países',
    moreEn: 'Más países',
    all: 'Todos los países',
    notFound: 'País no encontrado',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Resumen',
    introTitle: (name: string) => `Resumen de los aeropuertos de ${name}`,
    introEn: 'Resumen de aeropuertos',
    introSub:
      'La magnitud de los aeropuertos de este país o región, sus principales centros y las ciudades a las que sirven.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} se encuentra en ${o.region}. Este sitio abarca ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` y ${o.gates}` : ''} en total.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) es el mayor por pasajeros anuales, con ${o.busiestPax} de pasajeros.`
        : '') +
      ` Los aeropuertos sirven a ciudades como ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Cada página de aeropuerto incluye su mapa de ubicación y sus códigos de aeropuerto, además de los detalles de terminales, puertas y transporte terrestre que se hayan recopilado.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Distribución',
      title: (name: string) => `Mapa de distribución de aeropuertos de ${name}`,
      en: 'Distribución de aeropuertos',
      sub: (covered: string, total: string) =>
        `${total} aeropuertos con vuelos programados en todo el país (grandes, medianos y pequeños); ${covered} de ellos tienen una página de guía en este sitio. A continuación se muestra la lista completa.`,
      mapAlt: (name: string, total: string) =>
        `Mapa de distribución de aeropuertos de ${name}: ${total} aeropuertos con vuelos programados`,
      siteTag: 'Incluido aquí',
      colAirport: 'Aeropuerto',
      colCity: 'Ciudad',
      colType: 'Tipo',
      types: {
        large: 'Grande',
        medium: 'Mediano',
        small: 'Pequeño',
      },
      empty: 'Todavía no hay una lista nacional de aeropuertos disponible.',
    },

    /** Related links */
    linksTitle: 'Enlaces relacionados',
    linksEn: 'Enlaces relacionados',
    linksSub: 'Sitios oficiales y entradas de enciclopedia sobre el país y cada uno de sus aeropuertos.',
    linksCountry: (name: string) => `Referencia de ${name}`,
    linksAirports: (name: string) => `Aeropuertos en ${name}`,

    faqKicker: 'Preguntas frecuentes',
    faqTitle: 'Preguntas frecuentes',
    faqEn: 'Preguntas',
    faq: {
      airportTotal: (name: string) => `¿Cuántos aeropuertos hay en ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} tiene ${total} aeropuertos con servicio de pasajeros programado (grandes, medianos y pequeños); este sitio abarca ${covered} de ellos en detalle. Consulta el mapa de distribución y la lista completa más arriba.`,
      airportCount: (name: string) => `¿Qué aeropuertos están incluidos en ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Este sitio abarca ${count} en ${name}: ${list}.`,
      busiest: (name: string) => `¿Cuál es el aeropuerto con más tráfico de ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Por pasajeros anuales, ${busiest} (${iata}) es el mayor de los aeropuertos incluidos aquí, con ${pax} de pasajeros.`,
      terminals: (name: string) => `¿Cuántas terminales tienen los aeropuertos de ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Los aeropuertos incluidos en ${name} tienen ${terminals} con ${gates} en total: ${list}.`,
      cities: (name: string) => `¿Qué ciudades de ${name} tienen aeropuerto?`,
      citiesAnswer: (name: string, cities: string) =>
        `Los aeropuertos de ${name} incluidos aquí sirven a ciudades como ${cities}. Puedes filtrarlos por ciudad o código IATA en el directorio de aeropuertos.`,
      maps: (name: string) => `¿Los aeropuertos de ${name} tienen mapas de terminales?`,
      mapsAnswer: (name: string, count: string) =>
        `Algunos sí. Las páginas de aeropuerto incluyen un mapa de ubicación, los códigos de aeropuerto y las rutas directas, y los ${count} incluidos en ${name} muestran un diagrama de la distribución de terminales, rangos de puertas y transporte terrestre siempre que esos datos estén recopilados. Abre cualquier aeropuerto para ver lo que ofrece.`,
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
        ? `${o.name} (${o.iata}) tiene ${o.terminals} ${
            o.terminals === '1' ? 'terminal' : 'terminales'
          }${o.gates ? ` con ${o.gates} ${o.gates === '1' ? 'puerta' : 'puertas'}` : ''}${
            o.pax ? `, y atiende a ${o.pax} de pasajeros al año` : ''
          }${
            o.distance ? `, a ${o.distance} del centro de la ciudad` : ''
          }. Mapa de la terminal con todas las terminales, rangos de puertas y transporte terrestre.`
        : `${o.name} (${o.iata}) presta servicio a ${o.city}, ${o.country}. Mapa de ubicación, códigos de aeropuerto e información de viaje.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'aeropuerto';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, OACI ${o.icao}` : ''}) es un ${kind} que da servicio a ${where}`;
      return o.terminals > 0
        ? `${head}, con ${o.terminals} ${
            o.terminals === 1 ? 'terminal' : 'terminales'
          }${o.gates > 0 ? ` y ${o.gates} ${o.gates === 1 ? 'puerta' : 'puertas'}` : ''}${
            o.distance ? `, a unos ${o.distance} del centro de ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Distribución de la terminal`,
    mapNote: 'DISTRIBUCIÓN DE LA TERMINAL',
    realMapTitle: (iata: string) => `${iata} — Mapa de la terminal del aeropuerto: puertas e indicaciones`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Mapa de la terminal de ${name} (${iata}) con todas las terminales, rangos de puertas y zonas de embarque`,
    realMapNote: 'MAPA DE LA TERMINAL',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Fotos',
    photosTitle: 'Fotos del aeropuerto',
    photosEn: 'Fotos del aeropuerto',
    photosSub:
      'Fotos reales de este aeropuerto, cada una con la referencia de la página web pública donde se encontró; los derechos de autor siguen siendo de los fotógrafos originales. Haz clic en una foto para ampliarla o en la línea de crédito para abrir su página de origen.',
    photosCredit: (host: string) => `Fuente: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Foto ${index} del aeropuerto ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Ampliar la foto ${index} de ${name}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Zoom',
    zoomClose: 'Cerrar',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    downloadKicker: 'Descargar',
    downloadTitle: 'Descargar mapas de aeropuertos',
    downloadEn: 'Descargas',
    downloadMapLabel: (year: number, iata: string) =>
      `Mapa de terminal y plano de planta del aeropuerto ${iata} más reciente (${year}) para descargar`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Mapa de terminal del aeropuerto ${iata} más reciente (${year}) en PDF para descargar`,
    timeKicker: 'Hora',
    timeTitle: (iata: string) => `Información horaria del aeropuerto — hora actual en ${iata}`,
    timeEn: 'Hora del aeropuerto',
    timeSub: (iata: string, tz: string) => `Hora actual en ${iata} (${tz}) en comparación con tu hora local.`,
    clockAirport: 'Hora actual en el aeropuerto',
    clockLocal: 'Tu hora local',
    infoKicker: 'Información',
    infoTitle: 'Información y datos del aeropuerto',
    infoEn: 'Datos del aeropuerto',
    infoIata: 'Código IATA del aeropuerto',
    infoLocation: 'Ubicación del aeropuerto',
    infoCoords: 'Coordenadas',
    infoTimezone: 'Zona horaria',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Enlaces',
    linksTitle: 'Enlaces relacionados',
    linksEn: 'ENLACES RELACIONADOS',
    linksSub: 'Referencias externas de este aeropuerto: el sitio web oficial, Wikipedia y Baidu Baike.',
    officialSite: 'Sitio web oficial',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Fuentes: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Datos abiertos de OurAirports',
    sourcesNote:
      "Los códigos de aeropuerto, las coordenadas y la categoría del aeropuerto se compilan a partir de datos abiertos; los detalles de la página siguen las publicaciones oficiales de cada aeropuerto.",
    mapEmbedKicker: 'Mapa',
    mapEmbedTitle: (name: string) => `Mapa interactivo — ubicación de ${name}`,
    mapEmbedEn: 'Mapa interactivo',
    extMapsNote: 'Consulta este aeropuerto en otros servicios de mapas:',
    routeMapKicker: 'Rutas',
    routeMapTitle: (name: string) => `Mapa de rutas de ${name} — destinos directos`,
    routeMapEn: 'Mapa de rutas',
    routeMapAria: (name: string) => `Mapa de las rutas directas desde ${name}`,
    routeLegendTitle: 'Leyenda de colores',
    routeLegendClose: 'Ocultar la leyenda',
    routeReset: 'Restablecer el mapa',
    routeZoomIn: 'Acercar',
    routeZoomOut: 'Alejar',
    routeFullscreen: 'Ver a pantalla completa',
    routeExitFullscreen: 'Salir de pantalla completa',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Abrir la página del aeropuerto {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6+ aerolíneas',
      major: '3–5 aerolíneas',
      minor: '2 aerolíneas',
      single: '1 aerolínea',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} aerolíneas',
    routeTableDest: 'Destino',
    routeTableCountry: 'País/región',
    routeTableDistance: 'Distancia',
    routeTableCarriers: 'Aerolíneas',
    routeCarriersMore: (n: number) => ` +${n} más`,
    routeMapNote: (date: string) =>
      `Instantánea de los datos de rutas: ${date}; solo vuelos directos. Fuente: `,
    legendTerminal: 'Edificio terminal',
    legendTransit: 'Nodo de transporte terrestre',
    legendCorridor: 'Conexión entre terminales',
    terminalsKicker: 'Terminales',
    terminalsTitle: 'Guía de terminales',
    terminalsEn: 'Guía de terminales',
    terminalsSub: (name: string) =>
      `Rangos de puertas, principales aerolíneas e instalaciones de cada terminal de ${name}.`,
    transitTitle: 'Transporte terrestre',
    facilitiesTitle: 'Instalaciones del aeropuerto',
    faqKicker: 'Preguntas frecuentes',
    faqTitle: 'Preguntas frecuentes',
    faqEn: 'Preguntas',
    guideKicker: 'Guía',
    guideTitle: 'Guía del aeropuerto',
    guideEn: 'Guía del aeropuerto',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'Artículos',
    blogTitle: (iata: string) => `Guías del aeropuerto ${iata}`,
    blogEn: 'Del blog',
    blogSub: (iata: string, count: number) =>
      `${count} artículos de este sitio tratan sobre ${iata}: llegadas, transporte terrestre, equipajes y conexiones.`,
    blogAll: 'Todos los artículos',
    relatedTitle: (country: string) => `Otros aeropuertos de ${country}`,
    relatedEn: (country: string) => `Más en ${country}`,
    relatedAll: (country: string) => `Todos los aeropuertos de ${country}`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'Vuelos',
      title: (name: string) => `Vuelos de ${name} — salidas y llegadas`,
      en: 'Panel de vuelos',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'número de vuelo', 'números de vuelo')} de ${plural(
          airlines,
          'aerolínea',
          'aerolíneas'
        )} y ${plural(destinations, 'destino', 'destinos')}, divididos por dirección. Se incluyen los números de código compartido.`,
      statDepartures: 'Números de vuelo de salida',
      statArrivals: 'Números de vuelo de llegada',
      statAirlines: 'Aerolíneas',
      statDestinations: 'Destinos',
      note: (date: string) =>
        `Números de vuelo y rutas del índice de vuelos de aviability.com (instantánea de ${date}); se incluyen los números de código compartido y no se muestran horarios de salida. Fuente: `,
      source: 'aviability.com',
      tabDepartures: 'Salidas',
      tabArrivals: 'Llegadas',
      search: 'Busca un número de vuelo, aerolínea o ciudad',
      clearSearch: 'Borrar la búsqueda',
      flight: 'Vuelo',
      airline: 'Aerolínea',
      destination: 'Destino',
      origin: 'Origen',
      country: 'País/región',
      empty: 'Ningún vuelo coincide con esta búsqueda.',
      loading: 'Cargando vuelos…',
      error: 'No se han podido cargar más vuelos.',
      retry: 'Volver a intentarlo',
      previous: 'Anterior',
      next: 'Siguiente',
      pagination: 'Paginación',
      showing: 'Mostrando {from}–{to} de {total} números de vuelo',
      pageOf: 'Página {page} de {pages}',
    },
    notFound: 'Aeropuerto no encontrado',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Mapa de rutas ${year} de ${name} (${iata}) — ${count} destinos directos`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Mapa de rutas directas de ${name} (${iata}): ${count} destinos con las aerolíneas que operan y las distancias, además de la lista completa de destinos.`,
    heading: (name: string) => `Mapa de rutas de ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} tiene ${count} destinos directos, coloreados según cuántas aerolíneas los sirven.`,
    backToAirport: (iata: string) => `Volver a la página del aeropuerto ${iata}`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `Números de vuelo de ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Ver el mapa de rutas',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Ver el mapa de rutas completo de ${iata}`,
    teaserSub: (count: string) => `${count} destinos directos: mapa, aerolíneas que operan y distancias.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `Mapa de rutas directas de ${name}`,
    tableKicker: (iata: string) => `${iata} · Destinos`,
    tableSectionTitle: (name: string) => `Lista de destinos directos de ${name}`,
    tableSectionEn: (iata: string) => `Destinos de ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Destinos',
    tableSectionSub: (count: string) =>
      `${count} destinos, de mayor a menor por número de aerolíneas operativas, con distancia y aerolíneas.`,
    dataKicker: 'Descargar',
    dataTitle: 'Descarga de datos de rutas',
    dataEn: 'Datos',
    dataSub: (count: number) =>
      `${count} rutas directas con destino, código IATA, ciudad, país, distancia y aerolíneas operativas, listas para una hoja de cálculo o un script.`,
    dataFields: 'CSV es ideal para Excel / Numbers y JSON para código; ambos en UTF-8.',
    dataCsv: 'Descargar CSV',
    dataJson: 'Descargar JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Distribución de terminales y puertas de un vistazo: haz clic en la imagen para ver el mapa completo, las instalaciones de la terminal y el transporte terrestre en la página del aeropuerto.',
    airportMapCta: (iata: string) => `Ver el mapa completo de la terminal de ${iata}`,
    /** Header fact cells. */
    factDestinations: 'Destinos directos',
    factAirlines: 'Aerolíneas',
    factCountries: 'Países',
    factSnapshot: 'Instantánea de datos',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `¿A cuántos lugares vuela ${name} sin escalas?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) tiene ${count} destinos directos en ${countries} países y territorios. Solo se cuentan las rutas sin escalas; no se incluyen los itinerarios con una parada.`,
    faqAirlinesQ: (name: string) => `¿Cuántas aerolíneas vuelan desde ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} aerolíneas operan rutas directas desde este aeropuerto. Las redes más amplias son ${leaders} (número de destinos entre paréntesis).`,
    faqFarthestQ: (name: string) => `¿Cuál es el destino sin escalas más lejano desde ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `El destino directo más lejano es ${city}, ${country} ${iata}, a unos ${km}.`,
    faqBusiestQ: () => '¿Qué destinos tienen más competencia?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinos reciben servicio de tres o más aerolíneas; los que tienen más competencia son ${list}.`,
    faqSourceQ: () => '¿Con qué frecuencia se actualizan los datos de rutas?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Las rutas de esta página proceden del conjunto de datos abiertos de ${source} (${license}), una instantánea de ${date} y no un horario en tiempo real; consulta con la aerolínea o el aeropuerto para billetes y horarios.`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Vuelo ${number} de ${airline}: de ${from} a ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `El vuelo ${number} es un número de vuelo utilizado por ${airline} de ${from} a ${to}${distance ? `, a unos ${distance}` : ''}. Mapa de la ruta, aeropuertos de salida y llegada, distancia y otros vuelos de la ruta.`,
    heading: (number: string) => `Vuelo ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `El vuelo ${number} es un número de vuelo utilizado por ${airline} entre ${from} y ${to}${distance ? `, a una distancia ortodrómica de unos ${distance}` : ''}.`,
    factFlight: 'Número de vuelo',
    factFrom: 'Desde',
    factTo: 'Hasta',
    factDistance: 'Distancia',
    overviewKicker: 'Resumen',
    overviewTitle: (number: string) => `Acerca del vuelo ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} es un número de vuelo utilizado por ${airline} entre ${originName} (${originIata}) y ${destName} (${destIata})${distance ? `, separados por unos ${distance}` : ''}. Esta página reúne el número de vuelo, la aerolínea, la ruta y los dos aeropuertos para una consulta rápida.`,
    overviewNote:
      'El índice de vuelos no incluye horarios de salida ni de llegada, aeronaves ni fechas de operación; confirma los horarios, la facturación y el embarque con la aerolínea o el aeropuerto.',
    routeKicker: 'Ruta',
    routeTitle: (from: string, to: string) => `Ruta ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Diagrama de la ruta del vuelo ${number}`,
    routeMapAria: (number: string) => `Mapa de la ruta del vuelo ${number}`,
    airportsKicker: 'Aeropuertos',
    airportsTitle: 'Aeropuertos de salida y llegada',
    airportsSub:
      'Los aeropuertos que conecta este vuelo. Los aeropuertos incluidos en el directorio abren su propia página.',
    originAirport: 'Aeropuerto de salida',
    destinationAirport: 'Aeropuerto de llegada',
    airportPage: 'Abrir la página del aeropuerto',
    detailsKicker: 'Detalles',
    detailsTitle: 'Detalles del vuelo',
    detailsFlight: 'Número de vuelo',
    detailsAirline: 'Aerolínea',
    detailsOrigin: 'Aeropuerto de salida',
    detailsDestination: 'Aeropuerto de llegada',
    detailsDistance: 'Distancia ortodrómica',
    detailsRoutes: 'Rutas listadas',
    detailsSnapshot: 'Instantánea de datos',
    routesKicker: 'Rutas',
    routesTitle: 'Rutas con este número de vuelo',
    routesSub: (count: string) =>
      `Este número aparece en ${count} rutas; un mismo número puede reutilizarse entre socios de código compartido.`,
    routesRoute: 'Ruta',
    routesAirline: 'Aerolínea',
    routesDistance: 'Distancia',
    relatedKicker: 'Relacionados',
    relatedTitle: 'Otros vuelos de esta ruta',
    relatedSub: 'Otros números de vuelo entre los mismos aeropuertos de salida y llegada.',
    relatedEn: 'Más vuelos',
    faqKicker: 'Preguntas frecuentes',
    faqTitle: 'Preguntas frecuentes',
    faqEn: 'Preguntas',
    faqWhat: (number: string) => `¿Qué es el vuelo ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `El vuelo ${number} es un número de vuelo utilizado por ${airline} en la ruta ${from} → ${to}${distance ? `, con unos ${distance} de distancia` : ''}.`,
    faqRoute: (number: string) => `¿Qué ruta cubre el vuelo ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `El vuelo ${number} vuela de ${originName} (${originIata}) a ${destName} (${destIata}).`,
    faqTimes: (number: string) => `¿Dónde están los horarios de salida y llegada del vuelo ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Esta página cubre el número de vuelo, la aerolínea, la ruta y los aeropuertos de ${number}. El índice de vuelos de aviability.com no incluye horarios de salida ni de llegada; consulta la aerolínea o el aeropuerto para conocer el horario actual.`,
    note: (date: string) =>
      `Número de vuelo, aerolínea y ruta del índice de vuelos de aviability.com (instantánea de ${date}); no se incluyen horarios de salida ni de llegada. Fuente: `,
    source: 'aviability.com',
    sourceFlight: 'Ver en aviability.com',
    viewAirport: (iata: string) => `Abrir la página del aeropuerto ${iata}`,
    notFound: 'Vuelo no encontrado',
  },

  faq: {
    terminalCount: (name: string) => `¿Cuántas terminales tiene ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) tiene ${terminals} terminales con ${gates} puertas en total: ${list}.`,
    gateCount: (name: string) => `¿Cuántas puertas tiene ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) tiene ${gates} puertas en total: ${list}.`,
    whereIs: (iata: string) => `¿Dónde está ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} es el código IATA de ${name} (${nameEn}), situado en ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `¿A qué distancia está ${name} del centro de ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} está a unos ${distance} del centro de ${city}. Puedes llegar a la ciudad en ${transit}.`,
    access: (name: string, city: string) => `¿Cómo voy desde ${name} hasta ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `¿Qué instalaciones ofrece ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} ofrece ${facilities}. Consulta la distribución de la terminal más arriba para ver cómo se reparten entre las terminales.`,
    location: (name: string) => `¿Dónde se encuentra ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, código IATA ${iata}) se encuentra en ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `¿Qué aerolíneas operan desde cada terminal de ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Principales aerolíneas por terminal en ${name}: ${list}. Las aerolíneas y las asignaciones de puertas cambian, así que confirma siempre en tu tarjeta de embarque y en la señalización del propio aeropuerto.`,
    timezone: (name: string) => `¿En qué zona horaria está ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) está en la zona horaria ${tz}. Compárala con tu hora local usando el reloj del aeropuerto que aparece más arriba.`,
    flightsCount: (name: string) => `¿Cuántos números de vuelo figuran en ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `El índice de vuelos de aviability.com recoge ${plural(
        departures,
        'número de vuelo de salida',
        'números de vuelo de salida'
      )} y ${plural(arrivals, 'número de vuelo de llegada', 'números de vuelo de llegada')} de ${name} (${iata}), que abarcan ${plural(
        airlines,
        'aerolínea',
        'aerolíneas'
      )} y ${plural(destinations, 'destino', 'destinos')} (instantánea de ${date}). Se incluyen los números de código compartido y los horarios pueden cambiar; confirma con la aerolínea antes de viajar.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Equipo editorial de World Airport Maps',
    role: 'Compilado y revisado por ',
    sourcesNote: 'Compilado a partir de fuentes públicas e información oficial de los aeropuertos',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'En esta página',
    map: 'Mapa de la terminal',
    photos: 'Fotos del aeropuerto',
    time: 'Hora del aeropuerto',
    details: 'Datos del aeropuerto',
    links: 'Enlaces relacionados',
    location: 'Mapa de ubicación',
    routes: 'Mapa de rutas',
    flights: 'Vuelos',
    guide: 'Guía del aeropuerto',
    blog: 'Guías relacionadas',
    terminals: 'Guía de terminales',
    transport: 'Transporte terrestre',
    facilities: 'Instalaciones',
    faq: 'Preguntas frecuentes',
    flightOverview: 'Resumen del vuelo',
    flightRoute: 'Ruta',
    flightAirports: 'Aeropuertos',
    flightDetails: 'Detalles del vuelo',
    flightRoutes: 'Todas las rutas',
    flightRelated: 'Vuelos relacionados',
    intro: 'Resumen del aeropuerto',
    distribution: 'Distribución de aeropuertos',
    airports: 'Lista de aeropuertos',
  },

  error: {
    title: 'No se ha podido cargar esta página',
    sub: 'Se ha producido un error al leer los datos del aeropuerto. Vuelve a intentarlo o regresa a la página de inicio para seguir explorando.',
    retry: 'Volver a intentarlo',
    backHome: 'Volver a la página de inicio',
    notFoundTitle: '404 · Página no encontrada',
    notFoundSub: 'Es posible que la página que has solicitado se haya movido o eliminado. Prueba a buscar un aeropuerto o continúa desde los enlaces de abajo.',
  },

  footer: {
    sponsored: 'Patrocinado',
    mapsTitle: 'Mapas detallados de terminales',
    mapsBody:
      'Moverse por los aeropuertos y sus terminales puede ser todo un reto. Nuestros mapas de aeropuertos muestran la distribución detallada de terminales, puertas, zonas de facturación, recogida de equipajes, tiendas, restaurantes, salas VIP e intercambiadores de transporte para que tu viaje sea más fluido.',
    plansTitle: 'Planos interactivos de terminales',
    plansBody:
      'Los grandes aeropuertos internacionales tienen varias terminales y distribuciones complejas. Nuestros mapas detallados te ayudan a localizar tu puerta de embarque, encontrar servicios, planificar un enlace y moverte con eficacia por la seguridad, las salidas y las llegadas.',
    transitTitle: 'Transporte y acceso al aeropuerto',
    transitBody:
      'Además de la distribución de las terminales, también cubrimos las opciones de transporte, el aparcamiento y las rutas de acceso: cómo llegar a tu puerta de embarque, hacer transbordo entre terminales y usar el transporte terrestre, incluidos trenes, autobuses, taxis y alquiler de coches.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} países / regiones · ${airports} aeropuertos · ${terminals} terminales · distribuciones ilustradas de terminales`,
    fallback: 'Distribuciones ilustradas de terminales y guías de transporte terrestre para aeropuertos de todo el mundo',
    linksLabel: 'Navegación del pie de página',
    about: 'Acerca de',
    contact: 'Contacto',
    sources: 'Fuentes de datos',
    privacy: 'Política de privacidad',
    disclaimer: 'Aviso legal',
    terms: 'Términos de uso',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: esTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Explorar',
    title: 'Explora por área',
    en: 'Explora por área',
    sub: 'Entra en el directorio desde el ángulo que prefieras: por país, por región, por ciudad, o directamente a los centros con más tráfico, las últimas actualizaciones y las guías de aeropuertos.',
    allAirports: {
      title: 'Todos los aeropuertos',
      body: 'El directorio completo, ordenado por volumen de pasajeros, filtrable por país y reordenable.',
    },
    byCountry: {
      title: 'Por país',
      body: 'Descubre cuántos aeropuertos, terminales y puertas tiene cada país o región.',
    },
    byRegion: {
      title: 'Por región',
      body: 'Países agrupados en Asia Oriental, Europa, América del Norte y el resto, para acotar la búsqueda más rápido.',
    },
    popularCities: {
      title: 'Ciudades populares',
      body: 'Las ciudades con más tráfico aéreo por pasajeros anuales totales y todos los aeropuertos de cada una.',
    },
    recentlyUpdated: {
      title: 'Actualizados recientemente',
      body: 'Registros de aeropuertos nuevos y recién revisados, los más recientes primero.',
    },
    guides: {
      title: 'Guías de aeropuertos',
      body: 'Guías detalladas sobre transbordos en terminales, cómo llegar a la ciudad y consejos prácticos.',
    },
    routes: {
      title: 'Mapas de rutas',
      body: 'Consulta la red de vuelos sin escalas de un aeropuerto, ordenada por número de destinos, con aerolíneas y distancias.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guías',
    title: 'Guías de aeropuertos',
    en: 'Guías de aeropuertos',
    sub: 'Además de los diagramas de terminales, hemos escrito guías detalladas para centros seleccionados: cómo interpretar la numeración de puertas, cómo moverte entre terminales y cómo llegar a la ciudad.',
    more: 'Ver este aeropuerto',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the English
   * wording of the same UI.
   */
  blog: {
    kicker: 'Diario',
    title: 'Notas de viaje',
    nav: 'Blog',
    en: 'Notas de viaje',
    sub: 'Notas detalladas de nuestra redacción: llegadas e inmigración, transbordos, instalaciones de las terminales y dónde descansar.',
    more: 'Leer',
    all: 'Todos los artículos',
    morePosts: 'Más artículos',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'Aeropuertos',
    airportsTitle: 'Aeropuertos de este artículo',
    airportsEn: 'Aeropuertos tratados',
    airportsSub: 'Abre la página de un aeropuerto para ver su mapa de la terminal, el transporte terrestre y las preguntas frecuentes.',
    back: 'Volver a la lista de artículos',
    empty: 'Todavía no hay artículos.',
    readingMinutes: (n: number) => `${n} min de lectura`,
    source: (name: string) => `Fuente: ${name}`,
    tags: 'Etiquetas',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'Comentarios',
    title: 'Comentarios de los lectores',
    en: 'Debate',
    sub: 'Las preguntas, los relatos de viaje y las correcciones son bienvenidos. Los comentarios son públicos.',
    formTitle: 'Deja un comentario',
    countOne: '1 comentario',
    countMany: '{n} comentarios',
    empty: 'Todavía no hay comentarios; sé el primero en escribir uno.',
    loading: 'Cargando comentarios…',
    loadError: 'Los comentarios no están disponibles en este momento.',
    retry: 'Volver a intentarlo',
    nameLabel: 'Nombre',
    namePlaceholder: '¿Cómo te llamamos?',
    bodyLabel: 'Comentario',
    bodyPlaceholder: 'Comparte tu experiencia, haz una pregunta o añade contexto…',
    submit: 'Publicar comentario',
    submitting: 'Publicando…',
    success: 'Publicado. Gracias por compartir.',
    error: 'No se ha podido publicar tu comentario. Vuelve a intentarlo más tarde.',
    rateLimited: 'Ha sido demasiado rápido. Espera unos minutos y vuelve a intentarlo.',
    nameError: 'Introduce un nombre (2–40 caracteres).',
    bodyError: 'Escribe un comentario (5–2000 caracteres).',
    note: 'Los comentarios son públicos y reflejan las opiniones de sus autores. Mantén un tono respetuoso y no publiques anuncios ni información personal.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Diagrama de la distribución de terminales de ${name}`,
    gates: 'Puertas',
    terminal: 'Terminal',
    corridor: 'Conexión',
    transit: 'Transporte terrestre',
    footer: (iata: string) => `${iata} · Distribución de la terminal`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Herramientas en línea',
    hub: {
      kicker: 'Herramientas',
      title: 'Herramientas de mapas y coordenadas',
      en: 'Herramientas gratuitas',
      sub: 'Herramientas en línea gratuitas para viajeros y amantes de la geografía: se abren en el navegador, sin instalar nada.',
      description:
        'Herramientas gratuitas en línea de mapas y coordenadas: conversión de coordenadas WGS84 / GCJ02 / BD09, formato de grados decimales ↔ DMS y distancia ortodrómica entre dos puntos. Bilingüe, lista para usar en tu navegador.',
      comingTitle: 'Más herramientas en preparación',
      comingSub: 'La selección de coordenadas, el uso compartido de ubicaciones y las calculadoras de proyección están en camino.',
    },
    howTitle: 'Cómo se usan',
    relatedTitle: 'Herramientas relacionadas',
    allTools: 'Todas las herramientas',
    tools: {
      coordinateConverter: {
        title: 'Conversor de coordenadas',
        en: 'Conversor de coordenadas',
        description:
          'Convierte entre WGS84, GCJ02 y BD09: la solución al problema del desfase de los mapas de China.',
        note: 'WGS84 es el estándar GPS e internacional. GCJ02 es el sistema de coordenadas con desfase obligatorio en la China continental (conocido como «coordenadas Marte»), utilizado por AMap y Tencent Maps. BD09 añade otro desfase sobre GCJ02 y lo usa Baidu Maps. Un mismo punto puede variar entre 100 y 700 m según el sistema, así que convierte las coordenadas antes de reutilizarlas en otro servicio de mapas.',
        steps: [
          'Introduce las coordenadas decimales como latitud, longitud; p. ej., 39.9042, 116.4074.',
          'Elige el sistema de coordenadas de tu entrada.',
          'Pulsa «Convertir» para obtener los otros dos sistemas; usa «Copiar» para guardar un resultado.',
        ],
        inputLabel: 'Coordenadas (latitud, longitud)',
        inputPlaceholder: 'p. ej., 39.9042, 116.4074',
        sourceLabel: 'Sistema de coordenadas de entrada',
        wgs84: 'WGS84 · GPS / internacional',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Decimales',
        submit: 'Convertir',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'No se han podido interpretar las coordenadas. Usa el formato «latitud, longitud», p. ej., 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Conversor de formato de coordenadas',
        en: 'Conversor de formato de coordenadas',
        description:
          'Convierte entre grados decimales (DD), grados-minutos (DM) y grados-minutos-segundos (DMS); el formato de entrada se detecta automáticamente.',
        note: 'DD (39.9042°) es el estilo decimal simple que usan los dispositivos y las API; DMS (39°54′15″N) es habitual en náutica, aviación y topografía; DM (39°54.25′N) es típico de los registros de campo. La herramienta detecta el formato de entrada por el número de grupos numéricos de cada mitad (1 = DD, 2 = DM, 3 = DMS) y muestra los tres estilos, con N/S/E/W (norte, sur, este, oeste) para los hemisferios.',
        steps: [
          'Introduce un par de coordenadas; los estilos 39.9042, 39°54′15″N y 39°32.5′E son válidos. Separa las dos mitades con una coma.',
          'Elige el número de decimales de la salida.',
          'Pulsa «Convertir»: se muestran los tres formatos; usa «Copiar» para guardar uno.',
        ],
        inputLabel: 'Coordenadas (un par, separado por coma)',
        inputPlaceholder: 'p. ej., 39°54′15″N, 116°24′51″E o 39.9042, 116.4074',
        precisionLabel: 'Decimales',
        submit: 'Convertir',
        ddLabel: 'Grados decimales (DD)',
        dmLabel: 'Grados-minutos (DM)',
        dmsLabel: 'Grados-minutos-segundos (DMS)',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'No se han podido interpretar las coordenadas. Se admiten estilos como 39.9042, 39°54′15″N y 39°32.5′E, separados por una coma.',
      },
      distanceCalculator: {
        title: 'Calculadora de distancias',
        en: 'Calculadora de distancias',
        description:
          'Distancia ortodrómica entre dos puntos de la Tierra, además del rumbo inicial.',
        note: 'La distancia se calcula con la fórmula de Haversine (radio medio terrestre 6.371,0088 km), el camino más corto sobre la superficie. El rumbo inicial es la dirección de la brújula desde el primer punto hacia el segundo, 0° en el norte y aumentando en sentido horario.',
        steps: [
          'Introduce la latitud y la longitud de los puntos de inicio y fin.',
          'Pulsa «Calcular distancia».',
          'Obtén el resultado en kilómetros, millas y millas náuticas, además del rumbo inicial.',
        ],
        fromLabel: 'Desde',
        toLabel: 'Hasta',
        inputPlaceholder: 'latitud, longitud',
        example: 'Ejemplo: Pekín → Shanghái',
        submit: 'Calcular distancia',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Rumbo inicial',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'No se han podido interpretar las coordenadas. Usa el formato «latitud, longitud» con latitud de -90 a 90 y longitud de -180 a 180.',
      },
    },
  },
};
