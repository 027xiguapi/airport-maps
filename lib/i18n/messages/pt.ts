import type { Messages } from './zh';
import { portugueseTransportModes } from '../pt-data';

/**
 * Catálogo em português do Brasil. Tipado contra a fonte de verdade em chinês
 * (`Messages`), então qualquer chave ausente ou renomeada quebra o build.
 *
 * Estilo: português brasileiro, tratamento por "você" e imperativo nas ações
 * ("Explore", "Busque"), tipografia portuguesa — aspas curvas, travessão — e
 * os nomes consagrados em português para cidades e países (Londres, Pequim,
 * Estados Unidos). Os nomes de aeroporto mantêm a forma localizada
 * ("Aeroporto de Heathrow (LHR)").
 */

/** "1 número de voo" / "2 números de voo" para contagens já formatadas. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Como o tipo do aeroporto aparece na frase de abertura (tipo do schema.org). */
const AIRPORT_KIND = {
  large: 'aeroporto grande',
  medium: 'aeroporto de porte médio',
  small: 'aeroporto pequeno',
  heliport: 'heliponto',
} as const;

export const pt: Messages = {
  site: {
    name: 'World Airport Maps',
    // A marca é dividida para que a cor de destaque realce parte dela.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Mapas de aeroportos e terminais',
    description:
      'Explore mapas de terminais de aeroportos organizados por país e região. Dos grandes hubs internacionais aos aeroportos regionais, veja layouts detalhados de portões, áreas de check-in, retirada de bagagem, lojas, restaurantes, salas VIP e transporte terrestre.',
    keywords: [
      'mapas de aeroportos',
      'mapas de terminais',
      'layout do terminal do aeroporto',
      'portões de embarque',
      'transporte aeroportuário',
      'guia de aeroporto',
    ],
    numberOfItems: (n: number) => `${n} ${n === 1 ? 'aeroporto' : 'aeroportos'}`,
  },

  nav: {
    home: 'Início',
    airports: 'Todos os aeroportos',
    countries: 'Por país',
    tools: 'Ferramentas online',
    about: 'Sobre',
    label: 'Navegação principal',
    languageLabel: 'Idioma',
    switchLanguage: 'Mudar de idioma',
    /** Título da seção para os idiomas registrados mas ainda não traduzidos. */
    languagePlanned: 'Em preparação',
    languagePlannedHint: 'Esta versão do idioma ainda não foi publicada.',
    themeToggle: 'Alternar modo escuro',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Publicidade',
    skipToContent: 'Ir para o conteúdo principal',
    backToTop: 'Voltar ao topo',
    breadcrumbLabel: 'Trilha de navegação',
    home: 'Início',
    viewMap: 'Ver mapa',
    terminalMap: 'Mapa do terminal',
    /** Título acessível do iframe nos espaços de anúncio (components/ads/). */
    /**
     * <title>/og:title da página do aeroporto. Aeroportos com dados compilados
     * começam pelas contagens que o Google pede ("quantos terminais/portões o X
     * tem"); os 303 aeroportos do diretório sem dados de terminal recebem um
     * título honesto de mapa de localização, em vez de prometer um mapa de
     * terminal que a página não mostra.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} ${
            counts.terminals === 1 ? 'terminal' : 'terminais'
          }${counts.gates > 0 ? `, ${counts.gates} ${counts.gates === 1 ? 'portão' : 'portões'}` : ''} — mapa do terminal`
        : `${name} (${iata}) — mapa de localização e guia do aeroporto ${year}`,
    /** H1 da página do aeroporto; sem dados de terminal o nome fica sozinho
        (ele já termina em "Aeroporto"), para que H1 e título nunca leiam
        "Aeroporto … Aeroporto". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — mapa do terminal` : name,
    airportGuide: 'Guia do aeroporto',
    lastUpdated: 'Atualizado recentemente',
    updatedOn: (date: string) => `Atualizado em ${date}`,
    publishedOn: (date: string) => `Publicado em ${date}`,
    readMore: 'Ler o guia completo',
  },

  units: {
    /** Rótulos das células de dados na página do aeroporto (sem contagem). */
    terminalsFact: 'Terminais',
    gatesFact: 'Portões',
    terminals: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminais'}`,
    terminalsShort: (n: number) => `${n} ${n === 1 ? 'terminal' : 'terminais'}`,
    gates: (n: number) => `${n} ${n === 1 ? 'portão' : 'portões'}`,
    airports: (n: number) => `${n} ${n === 1 ? 'aeroporto' : 'aeroportos'}`,
    airportsChip: (n: number) => `${n} ${n === 1 ? 'aeroporto' : 'aeroportos'}`,
    pax: 'Passageiros',
    paxFull: 'Passageiros por ano',
    distance: 'Até o centro',
    distanceFrom: (city: string) => `Do centro de ${city}`,
    gatesLabel: (range: string) => `Portões ${range}`,
    gatesCount: (n: number) => `${n} ${n === 1 ? 'portão' : 'portões'}`,
    satellite: 'Píer satélite',
    airlinesLabel: 'Principais companhias aéreas: ',
  },

  search: {
    ariaLabel: 'Buscar aeroportos',
    placeholder: 'Busque aeroportos, cidades ou códigos IATA',
    heroPlaceholder: 'Busque por nome do aeroporto, cidade ou código IATA — ex.: LHR / Dubai / Heathrow',
    submit: 'Encontrar aeroporto',
    loading: 'Buscando…',
    empty: 'Nenhum aeroporto correspondente encontrado',
    resultsTitle: (term: string) => `Resultados da busca por “${term}”`,
    resultsCount: (n: number) =>
      `${n} ${n === 1 ? 'aeroporto correspondente encontrado' : 'aeroportos correspondentes encontrados'}.`,
    noResults: 'Nenhum aeroporto corresponde. Tente outra palavra-chave, como o nome de uma cidade ou um código IATA.',
    noResultsHint: 'Não encontrou o aeroporto que procura?',
    viewAll: (n: number) => `Ver todos os ${n} aeroportos`,
    orBrowseByCountry: 'navegue por país',
    range: (from: number, to: number, total: number) =>
      `Mostrando ${from}–${to} de ${total} aeroportos`,
  },

  hero: {
    eyebrow: 'Diretório mundial de aeroportos',
    titleLead: 'Explore aeroportos e',
    titleAccent: 'mapas de terminais',
    sub: 'Encontre o caminho em qualquer aeroporto com nossa coleção completa de mapas de aeroportos e terminais, organizados por país e região — dos grandes hubs internacionais aos aeroportos regionais.',
    stats: {
      countries: 'Países / regiões',
      airports: 'Aeroportos cobertos',
      terminals: 'Mapas de terminais',
    },
  },

  home: {
    /**
     * Bloco "o que é este site" da página inicial: uma foto de aeroporto acima
     * de três pares título/parágrafo. A foto conduz, então o bloco não tem
     * kicker nem título de seção — `ariaLabel` o nomeia para tecnologias
     * assistivas.
     */
    intro: {
      ariaLabel: 'Sobre este site',
      imageAlt: 'Um avião de passageiros no portão de um terminal de aeroporto com fachada de vidro ao nascer do sol',
      blocks: [
        {
          title: 'Navegue por qualquer aeroporto com mapas de terminais detalhados',
          body: 'Navegar por aeroportos e terminais no mundo todo pode ser um desafio. Nossos mapas abrangentes mostram layouts detalhados de terminais, portões, áreas de check-in, retirada de bagagem, lojas, restaurantes, salas VIP e polos de transporte, para você planejar o trajeto antes de partir.',
        },
        {
          title: 'Mapas interativos de terminais e plantas baixas',
          body: 'Os grandes aeroportos internacionais têm vários terminais e layouts complexos. Nossos mapas detalhados ajudam você a localizar portões, encontrar serviços, planejar conexões e passar com eficiência pelos controles de segurança, áreas de embarque e saguões de chegada — sem voltar pelo mesmo caminho.',
        },
        {
          title: 'Informações de transporte e acesso ao aeroporto',
          body: 'Além dos layouts dos terminais, nossos guias de aeroporto cobrem opções de transporte, informações de estacionamento e rotas de acesso. Descubra a melhor forma de chegar ao seu portão de embarque, de se locomover entre terminais e de usar o transporte terrestre, incluindo trens, ônibus, táxis e carros alugados.',
        },
      ],
    },
    map: {
      kicker: 'Mapa mundial',
      title: 'Mapa de aeroportos',
      en: 'Mapa de aeroportos',
      sub: (airports: string, world: string) =>
        `Localize ${world} aeroportos com voos regulares no mundo — ${airports} deles com mapa do terminal aqui. Clique em um ponto para ver o país/região e os detalhes.`,
      all: 'Todos',
      gEurope: 'Europa',
      gAsia: 'Ásia',
      gAmericas: 'Américas',
      gAfrica: 'África',
      gOceania: 'Oceania',
      legendSite: 'Coberto aqui · clique para mapas de terminais',
      legendWorld: 'Outros aeroportos com voos regulares no mundo',
      countTemplate: '{n} aeroportos exibidos',
      download: 'Baixar dados',
      downloadTitle: 'Exporte todos os aeroportos do filtro atual em CSV (IATA, nome, cidade, país, coordenadas)',
      openAirport: 'Ver aeroporto',
    },
    popular: {
      kicker: 'Mapas de terminais',
      title: 'Mapas de aeroportos populares',
      en: 'Mapas de aeroportos',
      sub: 'Uma seleção de capas de mapas de terminais dos principais aeroportos do mundo — abra a página de um aeroporto para ver o mapa completo.',
    },
    recent: {
      kicker: 'Recém-publicados',
      title: 'Atualizados recentemente',
      en: 'Atualizados recentemente',
      sub: 'Aeroportos, países e guias de viagem novos e recém-revisados.',
      countriesTitle: 'Países atualizados recentemente',
    },
    /** Vitrine de mapas de rotas da página inicial: as redes diretas mais amplas,
        mapa à esquerda e abas de cidades à direita. */
    routes: {
      kicker: 'Rotas',
      title: 'Mapas de rotas dos aeroportos mais movimentados',
      en: 'Mapas de rotas',
      sub: 'Aeroportos classificados pelo número de lugares atendidos sem escala — abra um para ver o mapa de rotas, as companhias aéreas e a lista de destinos.',
      collection: 'A coleção de rotas',
      tabsLabel: 'Mapas de rotas por cidade',
      explore: (city: string) => `Explore ${city}`,
      play: 'Iniciar a apresentação de slides',
      pause: 'Pausar a apresentação de slides',
    },
    /** Carrossel da página inicial: o lote de fotos mais recente, uma imagem por aeroporto. */
    photos: {
      kicker: 'Fotos recentes',
      title: 'Últimas fotos de aeroportos',
      en: 'Fotos recentes',
      sub: 'As fotos de aeroporto adicionadas mais recentemente — os seis aeroportos mais novos, uma foto de cada.',
      ariaLabel: 'Carrossel das últimas fotos de aeroportos',
      prev: 'Foto anterior',
      next: 'Próxima foto',
      play: 'Iniciar a apresentação de slides',
      pause: 'Pausar a apresentação de slides',
      counter: (index: number, total: number) => `Foto ${index} de ${total}`,
      view: (name: string) => `Ver mapa do ${name}`,
      /** Botão sobreposto a cada foto: abre a página daquele aeroporto. */
      open: 'Abrir a página do aeroporto',
    },
    countries: {
      kicker: 'Por país',
      title: 'Mapas de aeroportos por país',
      en: 'Países',
      sub: 'Explore mapas de terminais organizados por país e região, dos grandes hubs internacionais aos aeroportos regionais.',
      more: 'Todos os países',
    },
    all: {
      kicker: 'Todos os mapas',
      title: 'Todos os mapas de aeroportos',
      en: 'Todos os aeroportos',
      sub: 'Mapas dos aeroportos e hubs de viagem mais movimentados do mundo.',
      hint: 'Selecione um aeroporto para ver o layout do terminal.',
      more: 'Ver tudo',
    },
    /**
     * Bloco "Listas e tabelas" da página inicial: os dados de cobertura
     * reorganizados como listas e tabelas de verdade, em vez de texto corrido,
     * para que buscadores e motores de IA possam extrair e citar os números.
     */
    facts: {
      kicker: 'Dados do diretório',
      title: 'Os dados dos aeroportos em um relance',
      en: 'Listas e tabelas',
      sub: 'Os números do diretório organizados em listas e tabelas: cobertura, os aeroportos mais movimentados entre os que têm números de passageiros publicados e a divisão regional.',
      note: (pax: string, detailed: string, total: string) =>
        `Os números de passageiros cobrem ${pax} de ${total} aeroportos; os de terminais e portões cobrem ${detailed} de ${total}. A contagem de terminais segue o agrupamento deste diretório e pode incluir píeres.`,
      coverageTitle: 'Números da cobertura',
      coverage: {
        airports: 'Aeroportos',
        countries: 'Países e regiões',
        regions: 'Regiões do diretório',
        cities: 'Nomes de cidades únicos',
        terminals: 'Terminais',
        gates: 'Portões',
        routes: 'Aeroportos com mapas de rotas',
      },
      busiest: {
        title: 'Aeroportos mais movimentados por passageiros anuais',
        sub: 'Os 12 aeroportos mais movimentados entre os que têm números anuais de passageiros publicados.',
        caption: 'Aeroportos com números anuais de passageiros publicados, classificados',
        rank: 'Posição',
        iata: 'IATA',
        airport: 'Aeroporto',
        city: 'Cidade',
        country: 'País',
        terminals: 'Terminais',
        gates: 'Portões',
        pax: 'Passageiros anuais (milhões)',
      },
      regions: {
        title: 'Aeroportos por região do diretório',
        sub: 'Contagens de aeroportos, terminais e portões agrupadas pelos rótulos de região do próprio diretório; alguns países e territórios abrangem duas regiões.',
        caption: 'Contagem de aeroportos por região do diretório',
        region: 'Região',
        airports: 'Aeroportos',
        detailed: 'Com dados detalhados',
        terminals: 'Terminais',
        gates: 'Portões',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Aeroporto',
    city: 'Cidade',
    country: 'País',
    size: 'Porte',
    map: 'Mapa',
    empty: 'Nenhum aeroporto corresponde a estes filtros. Tente ampliar sua seleção.',
  },

  pager: {
    label: 'Paginação',
    previous: 'Página anterior',
    next: 'Próxima página',
  },

  filters: {
    searchPlaceholder: 'Busque aeroportos, cidades ou códigos IATA',
    submit: 'Buscar',
    country: 'País',
    all: 'Todos',
    sort: 'Ordenar',
    sortPax: 'Passageiros',
    sortName: 'Nome',
    sortIata: 'Código IATA',
    sortUpdated: 'Última atualização',
    /**
     * Títulos e descrições das visões indexáveis `?country=` / `?sort=` do
     * diretório: texto distinto, para não parecerem cópias do diretório puro
     * nem da página de um país.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Todos os mapas de aeroportos — ${country}${sortLabel ? `, ordenados por ${sortLabel}` : ''}`
        : `Todos os mapas de aeroportos — ordenados por ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Todos os mapas de aeroportos da categoria “${country}” em uma só página: layouts de terminais, faixas de portões e transporte terrestre${sortLabel ? `, ordenados por ${sortLabel}` : ''}.`
        : `O diretório completo de mapas de aeroportos em uma só página: layouts de terminais, faixas de portões e transporte terrestre${sortLabel ? `, ordenados por ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Explore aeroportos por país',
    description:
      'Explore o diretório mundial de mapas de terminais por país e região. Dos grandes hubs internacionais aos aeroportos regionais, veja quantos aeroportos e terminais cada país tem.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Dos grandes hubs internacionais aos aeroportos regionais — ${countries} países e regiões, ${airports} aeroportos e ${terminals} terminais no total.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ${countries === 1 ? 'país' : 'países'} · ${airports} ${airports === 1 ? 'aeroporto' : 'aeroportos'}`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name}: mapa de aeroportos — todos os ${count} aeroportos` : `${name}: mapas de aeroportos`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''}: ${total} aeroportos com voos regulares, dos quais ${count} têm página neste site. Mapa de distribuição, lista nacional completa e rotas diretas.`
        : `${name} (${nameEn}): mapas de terminais para ${count} ${count === 1 ? 'aeroporto' : 'aeroportos'}, dos grandes hubs internacionais aos aeroportos regionais. Portões, layout dos terminais e transporte terrestre. Região: ${region}.`,
    chip: (nameEn: string) => `AEROPORTOS — ${nameEn.toUpperCase()}`,
    kicker: 'Mapas de aeroportos',
    titleOf: (name: string) => `Aeroportos — ${name}`,
    en: 'Aeroportos',
    sub: 'Selecione um aeroporto para ver o layout do terminal, as faixas de portões e as opções de transporte terrestre.',
    empty: 'Ainda não há aeroportos listados para este país ou região.',
    moreKicker: 'Outros países',
    moreTitle: 'Explore outros países',
    moreEn: 'Mais países',
    all: 'Todos os países',
    notFound: 'País não encontrado',

    /** Visão geral do aeroporto: montada a partir de campos do banco; um artigo
        mais longo pode viver no armazenamento content_documents (kind='country') */
    introKicker: 'Visão geral',
    introTitle: (name: string) => `${name}: visão geral dos aeroportos`,
    introEn: 'Visão geral dos aeroportos',
    introSub:
      'A escala dos aeroportos deste país ou região, seus principais hubs e as cidades que eles atendem.',
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
      // `o.nameEn` fica vazio quando é igual a `o.name` (ambos são "Japão"). O
      // nome abre como rótulo ("Japão — região: Ásia Oriental") porque nomes de
      // países em português pedem artigo como sujeito ("o Japão", "a França") e
      // um único template não consegue escolher o correto.
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} — região: ${o.region}. Este site cobre ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` e ${o.gates}` : ''} aqui.` +
      (o.busiest
        ? ` O ${o.busiest} (${o.busiestIata}) é o maior em passageiros anuais, com ${o.busiestPax}.`
        : '') +
      ` Os aeroportos atendem cidades como ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Cada página de aeroporto traz seu mapa de localização e códigos aeroportuários, além dos detalhes de terminais, portões e transporte terrestre compilados para ele.',

    /** "Distribuição dos aeroportos": a lista nacional e seu mapa. */
    distribution: {
      kicker: 'Distribuição',
      title: (name: string) => `${name} — mapa de distribuição dos aeroportos`,
      en: 'Distribuição dos aeroportos',
      sub: (covered: string, total: string) =>
        `${total} aeroportos com voos regulares no país (grandes, médios e pequenos); ${covered} deles têm uma página de guia neste site. A lista completa vem a seguir.`,
      mapAlt: (name: string, total: string) =>
        `${name} — mapa de distribuição dos aeroportos: ${total} aeroportos com voos regulares`,
      siteTag: 'Coberto aqui',
      colAirport: 'Aeroporto',
      colCity: 'Cidade',
      colType: 'Tipo',
      types: {
        large: 'Grande',
        medium: 'Médio',
        small: 'Pequeno',
      },
      empty: 'Nenhuma lista nacional de aeroportos disponível ainda.',
    },

    /** Links relacionados */
    linksTitle: 'Links relacionados',
    linksEn: 'Links relacionados',
    linksSub: 'Sites oficiais e verbetes de enciclopédia sobre o país e cada um de seus aeroportos.',
    linksCountry: (name: string) => `Referências: ${name}`,
    linksAirports: (name: string) => `Aeroportos — ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Perguntas frequentes',
    faqEn: 'Perguntas',
    faq: {
      airportTotal: (name: string) => `${name}: quantos aeroportos existem?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}: ${total} aeroportos com serviço regular de passageiros (grandes, médios e pequenos); este site cobre ${covered} deles em detalhes. Veja o mapa de distribuição e a lista completa acima.`,
      airportCount: (name: string) => `${name}: quais aeroportos são cobertos aqui?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `${name}: este site cobre ${count}, ou seja, ${list}.`,
      busiest: (name: string) => `${name}: qual é o aeroporto mais movimentado?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Em passageiros anuais, o ${busiest} (${iata}) é o maior dos aeroportos cobertos aqui, com ${pax}.`,
      terminals: (name: string) => `${name}: quantos terminais os aeroportos têm?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}: ${terminals} e ${gates} no total: ${list}.`,
      cities: (name: string) => `${name}: quais cidades têm aeroportos?`,
      citiesAnswer: (name: string, cities: string) =>
        `${name}: os aeroportos cobertos aqui atendem cidades como ${cities}. Você pode filtrá-los por cidade ou código IATA no diretório de aeroportos.`,
      maps: (name: string) => `${name}: os aeroportos têm mapas de terminais?`,
      mapsAnswer: (name: string, count: string) =>
        `Em parte. As páginas de aeroporto trazem mapa de localização, códigos aeroportuários e rotas diretas; onde há dados compilados, mostram também o diagrama do terminal, as faixas de portões e o transporte terrestre. ${name}: abra qualquer aeroporto para ver o que ele oferece — são ${count} cobertos.`,
    },
  },

  airport: {
    /**
     * Meta description montada a partir de dados formatados do aeroporto.
     * Terminais e portões são nulos nos aeroportos do diretório sem contagens
     * compiladas, e a cláusula desaparece em vez de ler "0 terminais". A
     * pergunta de contagem que o Google recebe ("quantos portões o X tem") é
     * respondida na primeira cláusula, porque é esse o texto que um snippet
     * exibe.
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
        ? `O ${o.name} (${o.iata}) tem ${o.terminals} ${
            o.terminals === '1' ? 'terminal' : 'terminais'
          }${o.gates ? ` e ${o.gates} ${o.gates === '1' ? 'portão' : 'portões'}` : ''}${
            o.pax ? `, atendendo ${o.pax} passageiros por ano` : ''
          }${
            o.distance ? `, a ${o.distance} do centro` : ''
          }. Mapa do terminal com todos os terminais, faixas de portões e transporte terrestre.`
        : `O ${o.name} (${o.iata}) atende ${o.city}, ${o.country}. Mapa de localização, códigos aeroportuários e informações de viagem.`,
    /**
     * Frase-resposta de abertura sob o H1: a resposta completa para "o que é
     * este aeroporto / onde fica", além das contagens de terminais e portões
     * que o FAQ esconderia em um acordeão fechado. kind/icao vêm de
     * lib/airport-facts.json; cidade e país colapsam em um só quando são iguais
     * (Singapura), para a frase nunca ler "atendendo Singapura, Singapura".
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'aeroporto';
      const head = `O ${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) é um ${kind} que atende ${where}`;
      return o.terminals > 0
        ? `${head}, com ${o.terminals} ${
            o.terminals === 1 ? 'terminal' : 'terminais'
          }${o.gates > 0 ? ` e ${o.gates} ${o.gates === 1 ? 'portão' : 'portões'}` : ''}${
            o.distance ? `, a cerca de ${o.distance} do centro de ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Layout do terminal`,
    mapNote: 'LAYOUT DO TERMINAL',
    realMapTitle: (iata: string) => `Mapa do terminal do aeroporto ${iata} — portões e navegação`,
    /** Texto alternativo das imagens do terminal: nome completo do aeroporto e
        código, que o rótulo do painel acima delas omite. */
    mapAlt: (name: string, iata: string) =>
      `${name} (${iata}): mapa do terminal com todos os terminais, faixas de portões e píeres`,
    realMapNote: 'MAPA DO TERMINAL',
    /** Galeria de fotos: fontes públicas da web, cada uma creditada sob a imagem. */
    photosKicker: 'Fotos',
    photosTitle: 'Fotos do aeroporto',
    photosEn: 'Fotos do aeroporto',
    photosSub:
      'Fotos reais deste aeroporto, cada uma creditada à página pública da web onde foi encontrada; os direitos autorais continuam com os fotógrafos originais. Clique em uma foto para ampliar ou em uma linha de crédito para abrir a página de origem.',
    photosCredit: (host: string) => `Fonte: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata}): foto ${index} do aeroporto`,
    photosZoom: (name: string, index: number) => `Ampliar a foto ${index} do ${name}`,
    /** Botões de download sob o mapa: a imagem baixa diretamente, o botão de PDF
        leva a uma busca no Google pelo PDF oficial. */
    zoomLabel: 'Zoom',
    zoomClose: 'Fechar',
    zoomIn: 'Aproximar',
    zoomOut: 'Afastar',
    downloadKicker: 'Download',
    downloadTitle: 'Baixar mapas do aeroporto',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) =>
      `${year}: mapa e planta do terminal do aeroporto ${iata} para baixar`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}: mapa do terminal do aeroporto ${iata} em PDF para baixar`,
    timeKicker: 'Horário',
    timeTitle: (iata: string) => `Horário do aeroporto — horário atual em ${iata}`,
    timeEn: 'Horário do aeroporto',
    timeSub: (iata: string, tz: string) => `Horário atual em ${iata} (${tz}) comparado ao seu horário local.`,
    clockAirport: 'Horário atual no aeroporto',
    clockLocal: 'Seu horário local',
    infoKicker: 'Informações',
    infoTitle: 'Informações e detalhes do aeroporto',
    infoEn: 'Detalhes do aeroporto',
    infoIata: 'Código IATA do aeroporto',
    infoLocation: 'Localização do aeroporto',
    infoCoords: 'Coordenadas',
    infoTimezone: 'Fuso horário',
    /** Seção "Links relacionados": site oficial / Wikipédia / Baidu Baike. */
    linksKicker: 'Links',
    linksTitle: 'Links relacionados',
    linksEn: 'LINKS RELACIONADOS',
    linksSub: 'Referências externas sobre este aeroporto: site oficial, Wikipédia e Baidu Baike.',
    officialSite: 'Site oficial',
    wikiLabel: 'Wikipédia',
    baikeLabel: 'Baidu Baike',
    /** Fontes nomeadas citadas sob os botões de link (auditoria answer-first). */
    sourcesLabel: 'Fontes: ',
    sourcesWikipedia: 'Wikipédia',
    sourcesOurAirports: 'dados abertos do OurAirports',
    sourcesNote:
      'Códigos de aeroporto, coordenadas e classe do aeroporto são compilados a partir de dados abertos; os detalhes da página seguem as publicações oficiais de cada aeroporto.',
    mapEmbedKicker: 'Mapa',
    mapEmbedTitle: (name: string) => `Mapa interativo — localização do ${name}`,
    mapEmbedEn: 'Mapa interativo',
    extMapsNote: 'Veja este aeroporto em outros serviços de mapas:',
    routeMapKicker: 'Rotas',
    routeMapTitle: (name: string) => `${name}: mapa de rotas — destinos diretos`,
    routeMapEn: 'Mapa de rotas',
    routeMapAria: (name: string) => `Mapa das rotas diretas do ${name}`,
    routeLegendTitle: 'Legenda',
    routeLegendClose: 'Ocultar a legenda',
    routeReset: 'Redefinir mapa',
    routeZoomIn: 'Aproximar',
    routeZoomOut: 'Afastar',
    routeFullscreen: 'Ver em tela cheia',
    routeExitFullscreen: 'Sair da tela cheia',
    /** Dica ao passar o mouse nos destinos clicáveis; `{iata}` é substituído no cliente. */
    routeOpenAirport: 'Abrir a página do aeroporto {iata}',
    /** Espelha as faixas de lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6 ou mais companhias',
      major: '3 a 5 companhias',
      minor: '2 companhias',
      single: '1 companhia',
    },
    /** Contagem de companhias no tooltip do mapa; `{n}` é substituído no cliente. */
    routeCarriersTpl: '{n} companhias',
    routeTableDest: 'Destino',
    routeTableCountry: 'País/região',
    routeTableDistance: 'Distância',
    routeTableCarriers: 'Companhias aéreas',
    routeCarriersMore: (n: number) => ` +${n} a mais`,
    routeMapNote: (date: string) =>
      `Instantâneo dos dados de rotas: ${date}; apenas voos diretos. Fonte: `,
    legendTerminal: 'Edifício do terminal',
    legendTransit: 'Ponto de transporte terrestre',
    legendCorridor: 'Ligação entre terminais',
    terminalsKicker: 'Terminais',
    terminalsTitle: 'Guia dos terminais',
    terminalsEn: 'Guia dos terminais',
    terminalsSub: (name: string) =>
      `Faixas de portões, principais companhias aéreas e instalações de cada terminal do ${name}.`,
    transitTitle: 'Transporte terrestre',
    facilitiesTitle: 'Instalações do aeroporto',
    faqKicker: 'FAQ',
    faqTitle: 'Perguntas frequentes',
    faqEn: 'Perguntas',
    guideKicker: 'Guia',
    guideTitle: 'Guia do aeroporto',
    guideEn: 'Guia do aeroporto',
    /** Seção do blog: os artigos de /blog que cobrem este aeroporto (lib/blog.ts). */
    blogKicker: 'Artigos',
    blogTitle: (iata: string) => `${iata}: guias do aeroporto`,
    blogEn: 'Do blog',
    blogSub: (iata: string, count: number) =>
      `${count} artigos deste site cobrem ${iata}: chegadas, transporte terrestre, bagagem e conexões.`,
    blogAll: 'Todos os artigos',
    relatedTitle: (country: string) => `Outros aeroportos — ${country}`,
    relatedEn: (country: string) => `Mais aeroportos — ${country}`,
    relatedAll: (country: string) => `Todos os aeroportos — ${country}`,
    /**
     * Painel de voos: todos os números de voo no índice da aviability.com que
     * partem deste aeroporto ou chegam a ele. Sem horários — os sitemaps da
     * fonte não os trazem.
     */
    flights: {
      kicker: 'Voos',
      title: (name: string) => `${name}: voos — partidas e chegadas`,
      en: 'Painel de voos',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'número de voo', 'números de voo')} de ${plural(
          airlines,
          'companhia aérea',
          'companhias aéreas'
        )} para ${plural(destinations, 'destino', 'destinos')}, separados por direção. Números de codeshare estão incluídos.`,
      statDepartures: 'Números de voo de partida',
      statArrivals: 'Números de voo de chegada',
      statAirlines: 'Companhias aéreas',
      statDestinations: 'Destinos',
      note: (date: string) =>
        `Números de voo e rotas do índice de voos da aviability.com (instantâneo de ${date}); números de codeshare estão incluídos e nenhum horário de partida é exibido. Fonte: `,
      source: 'aviability.com',
      tabDepartures: 'Partidas',
      tabArrivals: 'Chegadas',
      search: 'Busque número de voo, companhia aérea ou cidade',
      clearSearch: 'Limpar a busca',
      flight: 'Voo',
      airline: 'Companhia aérea',
      destination: 'Destino',
      origin: 'Origem',
      country: 'País/região',
      empty: 'Nenhum voo corresponde a esta busca.',
      loading: 'Carregando voos…',
      error: 'Não foi possível carregar mais voos.',
      retry: 'Tentar novamente',
      previous: 'Anterior',
      next: 'Próximo',
      pagination: 'Paginação',
      showing: 'Mostrando {from}–{to} de {total} números de voo',
      pageOf: 'Página {page} de {pages}',
    },
    notFound: 'Aeroporto não encontrado',
  },

  /** Página autônoma de mapa de rotas (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${name} (${iata}) — mapa de rotas ${year}, ${count} destinos diretos`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Mapa de rotas diretas do ${name} (${iata}): ${count} destinos com companhias aéreas em operação e distâncias, além da lista completa de destinos.`,
    heading: (name: string) => `${name}: mapa de rotas`,
    headingSub: (iata: string, count: string) =>
      `${iata} tem ${count} destinos diretos, coloridos pelo número de companhias aéreas que os atendem.`,
    backToAirport: (iata: string) => `Voltar para a página do aeroporto ${iata}`,
    /** Link da página de rotas para o painel de voos da página do aeroporto. */
    flightNumbers: (iata: string) => `${iata}: números de voo`,
    /** Botão no cartão de prévia da página do aeroporto. */
    openFull: 'Ver mapa de rotas',
    /** Mesmo cartão, para os aeroportos cuja rede o repositório já renderizou: a imagem é o link. */
    previewCta: (iata: string) => `Ver o mapa de rotas completo de ${iata}`,
    teaserSub: (count: string) => `${count} destinos diretos: mapa, companhias aéreas em operação e distâncias.`,
    /** Títulos de seção, cada um com o nome do aeroporto (`en` usa o código IATA). */
    mapSectionTitle: (name: string) => `${name}: mapa de rotas diretas`,
    tableKicker: (iata: string) => `${iata} · Destinos`,
    tableSectionTitle: (name: string) => `${name}: lista de destinos diretos`,
    tableSectionEn: (iata: string) => `Destinos ${iata}`,
    /** Rótulo curto para o índice de conteúdo, onde o título completo quebraria. */
    tableToc: 'Destinos',
    tableSectionSub: (count: string) =>
      `${count} destinos, os mais movimentados primeiro pelo número de companhias aéreas em operação, com distância e companhias.`,
    dataKicker: 'Download',
    dataTitle: 'Download dos dados de rotas',
    dataEn: 'Dados',
    dataSub: (count: number) =>
      `${count} rotas diretas com destino, código IATA, cidade, país, distância e companhias aéreas em operação — prontas para uma planilha ou um script.`,
    dataFields: 'CSV para Excel / Numbers, JSON para código; ambos em UTF-8.',
    dataCsv: 'Baixar CSV',
    dataJson: 'Baixar JSON',
    /** Cartão clicável do mapa do terminal apontando para a página do aeroporto. */
    airportMapSub:
      'Layout do terminal e dos portões em um relance — clique na imagem para ver o mapa completo, as instalações do terminal e o transporte terrestre na página do aeroporto.',
    airportMapCta: (iata: string) => `Ver o mapa completo do terminal ${iata}`,
    /** Células de dados do cabeçalho. */
    factDestinations: 'Destinos diretos',
    factAirlines: 'Companhias aéreas',
    factCountries: 'Países',
    factSnapshot: 'Instantâneo dos dados',
    /** FAQ — cada resposta é calculada a partir dos dados de rotas. */
    faqCountQ: (name: string) => `Para quantos lugares o ${name} voa sem escala?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `O ${name} (${iata}) tem ${count} destinos diretos em ${countries} países e territórios. Apenas rotas sem escala são contadas; itinerários com parada não entram.`,
    faqAirlinesQ: (name: string) => `Quantas companhias aéreas voam a partir do ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} companhias aéreas operam rotas diretas deste aeroporto. As redes mais amplas são ${leaders} (número de destinos entre parênteses).`,
    faqFarthestQ: (name: string) => `Qual é o destino direto mais distante a partir do ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `O destino direto mais distante é ${city}, ${country} (${iata}), a cerca de ${km} km.`,
    faqBusiestQ: () => 'Quais destinos têm mais concorrência?',
    faqBusiestA: (count: string, list: string) =>
      `${count} destinos são atendidos por três ou mais companhias aéreas; os mais disputados são ${list}.`,
    faqSourceQ: () => 'Com que frequência os dados de rotas são atualizados?',
    faqSourceA: (date: string, source: string, license: string) =>
      `As rotas desta página vêm do conjunto de dados abertos ${source} (${license}), um instantâneo de ${date} e não uma programação ao vivo — confira passagens e horários com a companhia aérea ou o aeroporto.`,
  },

  /** Página autônoma de número de voo (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline}: voo ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `O voo ${number} é um número de voo da ${airline} de ${from} para ${to}${distance ? `, a cerca de ${distance}` : ''}. Mapa de rota, aeroportos de partida e chegada, distância e outros voos na rota.`,
    heading: (number: string) => `Voo ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `O voo ${number} é um número de voo da ${airline} entre ${from} e ${to}${distance ? `, a cerca de ${distance} em linha reta` : ''}.`,
    factFlight: 'Número de voo',
    factFrom: 'De',
    factTo: 'Para',
    factDistance: 'Distância',
    overviewKicker: 'Visão geral',
    overviewTitle: (number: string) => `Sobre o voo ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `O voo ${number} é um número de voo da ${airline} entre o ${originName} (${originIata}) e o ${destName} (${destIata})${distance ? `, a cerca de ${distance} um do outro` : ''}. Esta página reúne o número de voo, a companhia aérea, a rota e os dois aeroportos para consulta rápida.`,
    overviewNote:
      'O índice de voos não inclui horários de partida ou chegada, aeronave nem datas de operação; confirme horários, check-in e embarque com a companhia aérea ou o aeroporto.',
    routeKicker: 'Rota',
    routeTitle: (from: string, to: string) => `Rota ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Diagrama da rota do voo ${number}`,
    routeMapAria: (number: string) => `Mapa da rota do voo ${number}`,
    airportsKicker: 'Aeroportos',
    airportsTitle: 'Aeroportos de partida e chegada',
    airportsSub:
      'Os aeroportos que este voo conecta. Os aeroportos cobertos pelo diretório abrem sua própria página.',
    originAirport: 'Aeroporto de partida',
    destinationAirport: 'Aeroporto de chegada',
    airportPage: 'Abrir a página do aeroporto',
    detailsKicker: 'Detalhes',
    detailsTitle: 'Detalhes do voo',
    detailsFlight: 'Número de voo',
    detailsAirline: 'Companhia aérea',
    detailsOrigin: 'Aeroporto de partida',
    detailsDestination: 'Aeroporto de chegada',
    detailsDistance: 'Distância em linha reta',
    detailsRoutes: 'Rotas listadas',
    detailsSnapshot: 'Instantâneo dos dados',
    routesKicker: 'Rotas',
    routesTitle: 'Rotas com este número de voo',
    routesSub: (count: string) =>
      `Este número aparece em ${count} rotas; um mesmo número pode ser reutilizado por parceiros de codeshare.`,
    routesRoute: 'Rota',
    routesAirline: 'Companhia aérea',
    routesDistance: 'Distância',
    relatedKicker: 'Relacionados',
    relatedTitle: 'Outros voos nesta rota',
    relatedSub: 'Outros números de voo entre os mesmos aeroportos de partida e chegada.',
    relatedEn: 'Mais voos',
    faqKicker: 'FAQ',
    faqTitle: 'Perguntas frequentes',
    faqEn: 'Perguntas',
    faqWhat: (number: string) => `O que é o voo ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `O voo ${number} é um número de voo da ${airline} na rota ${from} → ${to}${distance ? `, a cerca de ${distance}` : ''}.`,
    faqRoute: (number: string) => `Para onde vai o voo ${number}?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `O voo ${number} vai do ${originName} (${originIata}) para o ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Onde estão os horários de partida e chegada do voo ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Esta página cobre o número de voo, a companhia aérea, a rota e os aeroportos do voo ${number}. O índice de voos da aviability.com não inclui horários de partida ou chegada — consulte a companhia aérea ou o aeroporto para a programação atual.`,
    note: (date: string) =>
      `Número de voo, companhia aérea e rota do índice de voos da aviability.com (instantâneo de ${date}); horários de partida e chegada não estão incluídos. Fonte: `,
    source: 'aviability.com',
    sourceFlight: 'Ver no aviability.com',
    viewAirport: (iata: string) => `Abrir a página do aeroporto ${iata}`,
    notFound: 'Voo não encontrado',
  },

  faq: {
    terminalCount: (name: string) => `Quantos terminais o ${name} tem?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `O ${name} (${iata}) tem ${terminals} ${
        terminals === '1' ? 'terminal' : 'terminais'
      } com ${gates} ${gates === '1' ? 'portão' : 'portões'} no total: ${list}.`,
    gateCount: (name: string) => `Quantos portões o ${name} tem?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `O ${name} (${iata}) tem ${gates} ${gates === '1' ? 'portão' : 'portões'} no total: ${list}.`,
    whereIs: (iata: string) => `Onde fica ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} é o código IATA do ${name} (${nameEn}), localizado em ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `A que distância o ${name} fica do centro de ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `O ${name} fica a cerca de ${distance} do centro de ${city}. Você pode chegar à cidade por ${transit}.`,
    access: (name: string, city: string) => `Como chego do ${name} até ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Quais instalações o ${name} oferece?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `O ${name} oferece ${facilities}. Veja o layout do terminal acima para saber como elas se distribuem entre os terminais.`,
    location: (name: string) => `Onde fica o ${name}?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `O ${name} (${nameEn}, código IATA ${iata}) fica em ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Quais companhias aéreas operam em cada terminal do ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Principais companhias aéreas por terminal do ${name}: ${list}. As companhias e as atribuições de portões mudam, então confirme sempre no seu cartão de embarque e na sinalização do aeroporto.`,
    timezone: (name: string) => `Em que fuso horário fica o ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `O ${name} (${iata}) está no fuso horário ${tz}. Compare com seu horário local usando o relógio do aeroporto acima.`,
    flightsCount: (name: string) => `Quantos números de voo estão listados para o ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `O índice de voos da aviability.com lista ${plural(
        departures,
        'número de voo de partida',
        'números de voo de partida'
      )} e ${plural(arrivals, 'número de voo de chegada', 'números de voo de chegada')} para o ${name} (${iata}), abrangendo ${plural(
        airlines,
        'companhia aérea',
        'companhias aéreas'
      )} e ${plural(destinations, 'destino', 'destinos')} (instantâneo de ${date}). Números de codeshare estão incluídos, e os horários podem mudar — confirme com a companhia aérea antes de viajar.`,
  },

  /** Assinatura editorial e sinais de confiança E-E-A-T sob o título do aeroporto. */
  editorial: {
    authorName: 'Equipe editorial da World Airport Maps',
    role: 'Compilado e revisado por ',
    sourcesNote: 'Compilado a partir de fontes públicas e informações oficiais dos aeroportos',
  },

  /** Navegação "nesta página" na coluna direita da página do aeroporto. */
  toc: {
    label: 'Nesta página',
    map: 'Mapa do terminal',
    photos: 'Fotos do aeroporto',
    time: 'Horário do aeroporto',
    details: 'Detalhes do aeroporto',
    links: 'Links relacionados',
    location: 'Mapa de localização',
    routes: 'Mapa de rotas',
    flights: 'Voos',
    guide: 'Guia do aeroporto',
    blog: 'Guias relacionados',
    terminals: 'Guia dos terminais',
    transport: 'Transporte terrestre',
    facilities: 'Instalações',
    faq: 'FAQ',
    flightOverview: 'Visão geral do voo',
    flightRoute: 'Rota',
    flightAirports: 'Aeroportos',
    flightDetails: 'Detalhes do voo',
    flightRoutes: 'Todas as rotas',
    flightRelated: 'Voos relacionados',
    intro: 'Visão geral do aeroporto',
    distribution: 'Distribuição dos aeroportos',
    airports: 'Lista de aeroportos',
  },

  error: {
    title: 'Não foi possível carregar esta página',
    sub: 'Algo deu errado ao ler os dados do aeroporto. Tente novamente ou volte para a página inicial para continuar navegando.',
    retry: 'Tentar novamente',
    backHome: 'Voltar para a página inicial',
    notFoundTitle: '404 · Página não encontrada',
    notFoundSub: 'A página que você solicitou pode ter sido movida ou removida. Tente buscar um aeroporto ou continue pelos links abaixo.',
  },

  footer: {
    sponsored: 'Patrocinado',
    mapsTitle: 'Mapas de terminais detalhados',
    mapsBody:
      'Navegar por aeroportos e seus terminais pode ser um desafio. Nossos mapas mostram layouts detalhados de terminais, portões, áreas de check-in, retirada de bagagem, lojas, restaurantes, salas VIP e polos de transporte, para que sua viagem flua melhor.',
    plansTitle: 'Plantas interativas de terminais',
    plansBody:
      'Os grandes aeroportos internacionais têm vários terminais e layouts complexos. Nossos mapas detalhados ajudam você a localizar seu portão, encontrar instalações, planejar uma conexão e passar com eficiência pela segurança, pelo embarque e pela chegada.',
    transitTitle: 'Transporte e acesso ao aeroporto',
    transitBody:
      'Além dos layouts dos terminais, também cobrimos opções de transporte, estacionamento e rotas de acesso — como chegar ao seu portão, transferir entre terminais e usar o transporte terrestre, incluindo trens, ônibus, táxis e aluguel de carros.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} países / regiões · ${airports} aeroportos · ${terminals} terminais · layouts ilustrados de terminais`,
    fallback: 'Layouts ilustrados de terminais e guias de transporte terrestre para aeroportos no mundo todo',
    linksLabel: 'Navegação do rodapé',
    about: 'Sobre',
    contact: 'Contato',
    sources: 'Fontes de dados',
    privacy: 'Política de privacidade',
    disclaimer: 'Aviso legal',
    terms: 'Termos de uso',
  },

  /** Rótulos de modalidade indexados pelo ícone de transporte em
   *  ground_transport.icon. Usados quando um idioma não tem nome traduzido
   *  para um serviço específico. */
  transportModes: portugueseTransportModes as Record<string, string>,

  /** Faixa de categorias por área funcional na página inicial. */
  categories: {
    kicker: 'Explore',
    title: 'Explore por área',
    en: 'Explore por área',
    sub: 'Entre no diretório pelo ângulo que preferir: por país, por região, por cidade — ou vá direto aos hubs mais movimentados, às últimas atualizações e aos guias de aeroporto.',
    allAirports: {
      title: 'Todos os aeroportos',
      body: 'O diretório completo, classificado por volume de passageiros, com filtro por país e reordenação.',
    },
    byCountry: {
      title: 'Por país',
      body: 'Veja quantos aeroportos, terminais e portões cada país ou região tem.',
    },
    byRegion: {
      title: 'Por região',
      body: 'Países agrupados em Ásia Oriental, Europa, América do Norte e demais regiões, para uma busca mais rápida.',
    },
    popularCities: {
      title: 'Cidades populares',
      body: 'As cidades com aeroportos mais movimentadas por total de passageiros anuais e todos os aeroportos de cada uma.',
    },
    recentlyUpdated: {
      title: 'Atualizados recentemente',
      body: 'Registros de aeroportos recém-adicionados e recém-revisados, dos mais recentes para os mais antigos.',
    },
    guides: {
      title: 'Guias de aeroporto',
      body: 'Guias completos sobre conexões no terminal, como chegar à cidade e dicas práticas.',
    },
    routes: {
      title: 'Mapas de rotas',
      body: 'Veja a malha de voos diretos de um aeroporto, classificada por número de destinos, com companhias aéreas e distâncias.',
    },
  },

  /** Seção da página inicial que lista os aeroportos com guia em Markdown. */
  guides: {
    kicker: 'Guias',
    title: 'Guias de aeroporto',
    en: 'Guias de aeroporto',
    sub: 'Além dos diagramas de terminais, escrevemos guias completos para hubs selecionados: como ler a numeração dos portões, como se locomover entre terminais e como chegar à cidade.',
    more: 'Ver este aeroporto',
  },

  /**
   * Blog (`public/blog`). Os artigos são publicados em chinês, então as rotas
   * /blog só existem onde esse conteúdo existe; estas strings são a redação em
   * português da mesma interface.
   */
  blog: {
    kicker: 'Diário',
    title: 'Notas de viagem',
    nav: 'Blog',
    en: 'Notas de viagem',
    sub: 'Notas completas da nossa equipe editorial: chegada e imigração, conexões, instalações do terminal e onde descansar.',
    more: 'Ler',
    all: 'Todos os artigos',
    morePosts: 'Mais artigos',
    /** Bloco "aeroportos neste artigo" da página do artigo (lib/blog.ts). */
    airportsKicker: 'Aeroportos',
    airportsTitle: 'Aeroportos neste artigo',
    airportsEn: 'Aeroportos cobertos',
    airportsSub: 'Abra a página de um aeroporto para ver o mapa do terminal, o transporte terrestre e as perguntas frequentes.',
    back: 'Voltar para a lista de artigos',
    empty: 'Ainda não há artigos.',
    readingMinutes: (n: number) => `${n} min de leitura`,
    source: (name: string) => `Fonte: ${name}`,
    tags: 'Tags',
  },

  /**
   * Comentários dos leitores ao pé de cada página de conteúdo
   * (components/Comments.tsx). Somente strings: funções não atravessam a
   * fronteira servidor/cliente, e `{n}` em countMany é substituído no navegador.
   */
  comments: {
    kicker: 'Comentários',
    title: 'Comentários dos leitores',
    en: 'Discussão',
    sub: 'Perguntas, relatos de viagem e correções são bem-vindos. Os comentários são públicos.',
    formTitle: 'Deixe um comentário',
    countOne: '1 comentário',
    countMany: '{n} comentários',
    empty: 'Ainda não há comentários — seja o primeiro a escrever.',
    loading: 'Carregando comentários…',
    loadError: 'Os comentários estão indisponíveis no momento.',
    retry: 'Tentar novamente',
    nameLabel: 'Nome',
    namePlaceholder: 'Como devemos chamar você?',
    bodyLabel: 'Comentário',
    bodyPlaceholder: 'Compartilhe sua experiência, faça uma pergunta ou acrescente contexto…',
    submit: 'Publicar comentário',
    submitting: 'Publicando…',
    success: 'Publicado — obrigado por compartilhar.',
    error: 'Não foi possível publicar seu comentário. Tente novamente mais tarde.',
    rateLimited: 'Isso foi rápido demais. Aguarde alguns minutos e tente novamente.',
    nameError: 'Digite um nome (2 a 40 caracteres).',
    bodyError: 'Escreva um comentário (5 a 2000 caracteres).',
    note: 'Os comentários são públicos e refletem a opinião de seus autores. Mantenha o respeito e não publique anúncios nem informações pessoais.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Diagrama do terminal do ${name}`,
    gates: 'Portões',
    terminal: 'Terminal',
    corridor: 'Ligação',
    transit: 'Transporte terrestre',
    footer: (iata: string) => `${iata} · Layout do terminal`,
  },

  /** Central de ferramentas (/tool) e as páginas de cada ferramenta. */
  tool: {
    label: 'Ferramentas online',
    hub: {
      kicker: 'Ferramentas',
      title: 'Ferramentas de mapas e coordenadas',
      en: 'Ferramentas gratuitas',
      sub: 'Ferramentas online gratuitas para viajantes e amantes da geografia — abra no navegador, sem instalar nada.',
      description:
        'Ferramentas online gratuitas de mapas e coordenadas: conversão entre WGS84 / GCJ02 / BD09, graus decimais ↔ DMS e distância em linha reta entre dois pontos. Bilíngues, prontas para usar no navegador.',
      comingTitle: 'Mais ferramentas em desenvolvimento',
      comingSub: 'Seleção de coordenadas no mapa, compartilhamento de localização e calculadoras de projeção estão a caminho.',
    },
    howTitle: 'Como usar',
    relatedTitle: 'Ferramentas relacionadas',
    allTools: 'Todas as ferramentas',
    tools: {
      coordinateConverter: {
        title: 'Conversor de coordenadas',
        en: 'Conversor de coordenadas',
        description:
          'Converta entre WGS84, GCJ02 e BD09 — a solução para o deslocamento dos mapas na China.',
        note: 'O WGS84 é o padrão GPS internacional. O GCJ02 é o sistema de coordenadas com deslocamento exigido na China continental (apelidado de “coordenadas de Marte”), usado pelo AMap e pelo Tencent Maps. O BD09 adiciona outro deslocamento sobre o GCJ02 e é usado pelo Baidu Maps. Um mesmo ponto pode variar de 100 a 700 m entre os sistemas, então converta antes de reutilizar coordenadas em outro serviço de mapas.',
        steps: [
          'Insira as coordenadas decimais como latitude, longitude — por exemplo, 39.9042, 116.4074.',
          'Escolha o sistema de coordenadas da sua entrada.',
          'Clique em “Converter” para obter os outros dois sistemas; use “Copiar” para salvar um resultado.',
        ],
        inputLabel: 'Coordenadas (latitude, longitude)',
        inputPlaceholder: 'ex.: 39.9042, 116.4074',
        sourceLabel: 'Sistema de coordenadas de entrada',
        wgs84: 'WGS84 · GPS / internacional',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Casas decimais',
        submit: 'Converter',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'Não foi possível interpretar as coordenadas. Use o formato “latitude, longitude”, por exemplo, 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Conversor de formato de coordenadas',
        en: 'Conversor de formato de coordenadas',
        description:
          'Converta entre graus decimais (DD), graus-minutos (DM) e graus-minutos-segundos (DMS); o formato de entrada é detectado automaticamente.',
        note: 'O DD (39.9042°) é o estilo decimal simples usado por dispositivos e APIs; o DMS (39°54′15″N) é comum em navegação marítima, aviação e topografia; o DM (39°54.25′N) é típico de registros de campo. A ferramenta detecta o formato de entrada pelo número de grupos numéricos em cada metade (1 = DD, 2 = DM, 3 = DMS) e gera os três estilos, com N/S/E/W para os hemisférios.',
        steps: [
          'Insira um par de coordenadas — os estilos 39.9042, 39°54′15″N e 39°32.5′E funcionam; separe as duas metades com uma vírgula.',
          'Escolha o número de casas decimais para o resultado.',
          'Clique em “Converter” — os três formatos são listados; use “Copiar” para salvar um.',
        ],
        inputLabel: 'Coordenadas (um par, separado por vírgula)',
        inputPlaceholder: 'ex.: 39°54′15″N, 116°24′51″E ou 39.9042, 116.4074',
        precisionLabel: 'Casas decimais',
        submit: 'Converter',
        ddLabel: 'Graus decimais (DD)',
        dmLabel: 'Graus-minutos (DM)',
        dmsLabel: 'Graus-minutos-segundos (DMS)',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'Não foi possível interpretar as coordenadas. Formatos aceitos incluem 39.9042, 39°54′15″N e 39°32.5′E, separados por vírgula.',
      },
      distanceCalculator: {
        title: 'Calculadora de distância',
        en: 'Calculadora de distância',
        description:
          'Distância em linha reta entre dois pontos da Terra, além do azimute inicial.',
        note: 'A distância usa a fórmula de Haversine (raio médio da Terra de 6.371,0088 km) — o caminho mais curto pela superfície. O azimute inicial é a direção da bússola do primeiro ponto em relação ao segundo, 0° no norte e aumentando no sentido horário.',
        steps: [
          'Insira a latitude e a longitude dos pontos de partida e de chegada.',
          'Clique em “Calcular distância”.',
          'Veja o resultado em quilômetros, milhas e milhas náuticas, além do azimute inicial.',
        ],
        fromLabel: 'De',
        toLabel: 'Para',
        inputPlaceholder: 'latitude, longitude',
        example: 'Exemplo: Pequim → Xangai',
        submit: 'Calcular distância',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Azimute inicial',
        copy: 'Copiar',
        copied: 'Copiado',
        error: 'Não foi possível interpretar as coordenadas. Use o formato “latitude, longitude” com latitude entre -90 e 90 e longitude entre -180 e 180.',
      },
    },
  },
};
