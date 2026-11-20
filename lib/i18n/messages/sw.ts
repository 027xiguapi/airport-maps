import type { Messages } from './zh';
import { swTransportModes } from '../sw-data';

/** Aina ya uwanja wa ndege kwa sentensi ya utangulizi (aina ya airport ya schema.org). */
const AIRPORT_KIND = {
  large: 'uwanja mkubwa wa ndege',
  medium: 'uwanja wa ndege wa kati',
  small: 'uwanja mdogo wa ndege',
  heliport: 'heliport',
} as const;

/** "terminali 1" / "terminali 2" kwa hesabu zilizopangwa tayari. */
const pluralSw = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * Katalogi ya Kiswahili. Imeandikwa kwa mfumo wa chanzo cha Kichina
 * (`Messages`), hivyo ufunguo unaokosekana au uliobadilishwa hufanya build
 * ishindwe.
 */
export const sw: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Ramani za viwanja vya ndege na terminali',
    description:
      'Vinjari ramani za terminali za viwanja vya ndege zilizopangwa kwa nchi na kanda. Kutoka vituo vikubwa vya kimataifa hadi viwanja vya ndege vya kanda: tazama mipangilio ya malango, maeneo ya kujiandikisha, mikanda ya mizigo, maduka, mikahawa, vyumba vya kupumzika na usafiri wa kuelekea mjini.',
    keywords: [
      'ramani za viwanja vya ndege',
      'ramani za terminali',
      'mpangilio wa terminali ya uwanja wa ndege',
      'malango',
      'usafiri wa uwanja wa ndege',
      'mwongozo wa uwanja wa ndege',
    ],
    numberOfItems: (n: number) =>
      pluralSw(String(n), 'uwanja wa ndege', 'viwanja vya ndege'),
  },

  nav: {
    home: 'Mwanzo',
    airports: 'Viwanja vyote vya ndege',
    countries: 'Kwa nchi',
    tools: 'Zana za mtandaoni',
    about: 'Kuhusu sisi',
    label: 'Urambazaji mkuu',
    languageLabel: 'Lugha',
    switchLanguage: 'Badilisha lugha',
    languagePlanned: 'Inatarajiwa',
    languagePlannedHint: 'Toleo hili la lugha halijachapishwa bado.',
    themeToggle: 'Badilisha hali ya giza',
    menu: 'Menyu',
  },

  common: {
    advertisement: 'Tangazo',
    skipToContent: 'Ruka hadi maudhui',
    backToTop: 'Rudi juu',
    breadcrumbLabel: 'Njia ya urambazaji',
    home: 'Mwanzo',
    viewMap: 'Tazama ramani',
    terminalMap: 'Ramani ya terminali',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralSw(String(counts.terminals), 'terminali', 'terminali')}${
            counts.gates > 0 ? `, ${pluralSw(String(counts.gates), 'lango', 'malango')}` : ''
          } — ramani ya terminali`
        : `${name} (${iata}) — ramani ya mahali na mwongozo ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} ramani ya terminali` : name,
    airportGuide: 'Mwongozo wa uwanja wa ndege',
    lastUpdated: 'Imesasishwa hivi karibuni',
    updatedOn: (date: string) => `Imesasishwa ${date}`,
    publishedOn: (date: string) => `Imechapishwa ${date}`,
    readMore: 'Soma mwongozo kamili',
  },

  units: {
    terminalsFact: 'Terminali',
    gatesFact: 'Malango',
    terminals: (n: number) => pluralSw(String(n), 'terminali', 'terminali'),
    terminalsShort: (n: number) => pluralSw(String(n), 'terminali', 'terminali'),
    gates: (n: number) => pluralSw(String(n), 'lango', 'malango'),
    airports: (n: number) =>
      pluralSw(String(n), 'uwanja wa ndege', 'viwanja vya ndege'),
    airportsChip: (n: number) =>
      pluralSw(String(n), 'uwanja wa ndege', 'viwanja vya ndege'),
    pax: 'Abiria',
    paxFull: 'Abiria kwa mwaka',
    distance: 'Hadi katikati ya mji',
    distanceFrom: (city: string) => `Kutoka katikati ya ${city}`,
    gatesLabel: (range: string) => `Malango ${range}`,
    gatesCount: (n: number) => `${n} malango`,
    satellite: 'Terminali ya satelaiti',
    airlinesLabel: 'Shirika kuu za ndege: ',
  },

  search: {
    ariaLabel: 'Tafuta viwanja vya ndege',
    placeholder: 'Tafuta viwanja vya ndege, miji au misimbo ya IATA',
    heroPlaceholder: 'Tafuta kwa jina la uwanja wa ndege, mji au msimbo wa IATA — k.m. LHR / Dubai / Heathrow',
    submit: 'Tafuta uwanja wa ndege',
    loading: 'Inatafuta…',
    empty: 'Hakuna uwanja wa ndege unaolingana',
    resultsTitle: (term: string) => `Matokeo ya “${term}”`,
    resultsCount: (n: number) =>
      `${pluralSw(String(n), 'uwanja wa ndege unaolingana', 'viwanja vya ndege vinavyolingana')} umepatikana.`,
    noResults: 'Hakuna uwanja wa ndege uliolingana. Jaribu neno lingine, kama jina la mji au msimbo wa IATA.',
    noResultsHint: 'Huwapati uwanja wa ndege unaoutaka?',
    viewAll: (n: number) => `Vinjari viwanja vyote ${n} vya ndege`,
    orBrowseByCountry: 'au vinjari kwa nchi',
    range: (from: number, to: number, total: number) =>
      `Inaonyesha ${from}–${to} kati ya viwanja ${total} vya ndege`,
  },

  hero: {
    eyebrow: 'Saraka ya viwanja vya ndege duniani',
    titleLead: 'Gundua viwanja vya ndege na',
    titleAccent: 'ramani za terminali',
    sub: 'Pata njia yako katika uwanja wowote wa ndege kwa mkusanyiko kamili wa ramani za viwanja na terminali, zilizopangwa kwa nchi na kanda — kutoka vituo vikubwa vya kimataifa hadi viwanja vya ndege vya kanda.',
    stats: {
      countries: 'Nchi / kanda',
      airports: 'Viwanja vya ndege',
      terminals: 'Ramani za terminali',
    },
  },

  home: {
    intro: {
      ariaLabel: 'Kuhusu tovuti hii',
      imageAlt: 'Ndege ya abiria kwenye lango la terminali ya uwanja wa ndege yenye kioo wakati wa mawio',
      blocks: [
        {
          title: 'Pata njia katika uwanja wowote wa ndege kwa ramani za terminali zenye maelezo',
          body: 'Kuabiri viwanja vya ndege na terminali duniani kote unaweza kuwa mgumu. Ramani zetu zinaonyesha mipangilio ya terminali, malango, maeneo ya kujiandikisha, mikanda ya mizigo, maduka, mikahawa, vyumba vya kupumzika na vituo vya usafiri, ili uweze kupanga njia kabla ya kuondoka.',
        },
        {
          title: 'Ramani za terminali na mipango ya sakafu inayoshirikiana',
          body: 'Viwanja vikubwa vya kimataifa vina terminali nyingi na mipangilio tata. Ramani zetu husaidia kupata malango, kutambua huduma, kupanga miunganisho na kupita kwa ufanisi kwenye ukaguzi wa usalama, maeneo ya kuondoka na ukumbi wa kuwasili — bila kurudi nyuma.',
        },
        {
          title: 'Usafiri na ufikiaji wa uwanja wa ndege',
          body: 'Zaidi ya mipangilio ya terminali, miongozo yetu inashughulikia chaguo za usafiri, maegesho na njia za kufikia. Pata njia bora ya kufikia lango lako, kubadilisha kati ya terminali na kutumia usafiri wa ardhini ikiwa ni pamoja na treni, basi, teksi na gari la kukodi.',
        },
      ],
    },
    map: {
      kicker: 'Ramani ya dunia',
      title: 'Ramani ya viwanja vya ndege',
      en: 'Ramani ya viwanja vya ndege',
      sub: (airports: string, world: string) =>
        `Tafuta mahali pa viwanja ${world} vya ndege vyenye safari za kawaida duniani — ${airports} kati yao vina ramani ya terminali hapa. Bonyeza nukta kuona nchi au kanda na maelezo.`,
      all: 'Vyote',
      gEurope: 'Ulaya',
      gAsia: 'Asia',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Oceania',
      legendSite: 'Imejumuishwa hapa · bonyeza kwa ramani za terminali',
      legendWorld: 'Viwanja vingine vya ndege vyenye safari za kawaida',
      countTemplate: 'Viwanja {n} vya ndege vinaonyeshwa',
      download: 'Pakua data',
      downloadTitle: 'Hamisha viwanja vyote vya ndege vya kichujio cha sasa kama CSV (IATA, jina, mji, nchi, kuratibu)',
      openAirport: 'Tazama uwanja wa ndege',
    },
    popular: {
      kicker: 'Ramani za terminali',
      title: 'Ramani maarufu za viwanja vya ndege',
      en: 'Ramani za viwanja vya ndege',
      sub: 'Uteuzi wa jalada za ramani za terminali kutoka viwanja vikubwa vya ndege duniani — fungua ukurasa wa uwanja wa ndege kwa ramani kamili.',
    },
    recent: {
      kicker: 'Imechapishwa hivi karibuni',
      title: 'Imesasishwa hivi karibuni',
      en: 'Imesasishwa hivi karibuni',
      sub: 'Viwanja vipya na vilivyorekebishwa vya ndege, nchi na miongozo ya safari.',
      countriesTitle: 'Nchi zilizosasishwa hivi karibuni',
    },
    routes: {
      kicker: 'Njia',
      title: 'Ramani za njia zenye shughuli nyingi',
      en: 'Ramani za njia',
      sub: 'Viwanja vya ndege vilivyopangwa kwa idadi ya maeneo wanayoruka bila kusimama — fungua kimojawapo kwa ramani ya njia, shirika za ndege na orodha ya marudio.',
      collection: 'Mkusanyiko wa njia',
      tabsLabel: 'Ramani za njia kwa miji',
      explore: (city: string) => `Gundua ${city}`,
      play: 'Anzisha onyesho la slaidi',
      pause: 'Sitisha onyesho la slaidi',
    },
    photos: {
      kicker: 'Picha za hivi karibuni',
      title: 'Picha za hivi karibuni za viwanja vya ndege',
      en: 'Picha za hivi karibuni',
      sub: 'Picha zilizoongezwa hivi karibuni — viwanja sita vipya vya ndege, picha moja kila kimoja.',
      ariaLabel: 'Karuseli ya picha za hivi karibuni za viwanja vya ndege',
      prev: 'Picha iliyotangulia',
      next: 'Picha inayofuata',
      play: 'Anzisha onyesho la slaidi',
      pause: 'Sitisha onyesho la slaidi',
      counter: (index: number, total: number) => `Picha ${index} kati ya ${total}`,
      view: (name: string) => `Tazama ramani ya ${name}`,
      open: 'Fungua ukurasa wa uwanja wa ndege',
    },
    countries: {
      kicker: 'Kwa nchi',
      title: 'Ramani za viwanja vya ndege kwa nchi',
      en: 'Nchi',
      sub: 'Vinjari ramani za terminali zilizopangwa kwa nchi na kanda, kutoka vituo vikubwa vya kimataifa hadi viwanja vya ndege vya kanda.',
      more: 'Nchi zote',
    },
    all: {
      kicker: 'Ramani zote',
      title: 'Ramani zote za viwanja vya ndege',
      en: 'Viwanja vyote vya ndege',
      sub: 'Ramani za viwanja vya ndege vyenye shughuli nyingi duniani na vituo vya safari.',
      hint: 'Chagua uwanja wa ndege kuona mpangilio wa terminali.',
      more: 'Tazama vyote',
    },
    facts: {
      kicker: 'Data ya saraka',
      title: 'Data ya viwanja vya ndege kwa muhtasari',
      en: 'Orodha na majedwali',
      sub: 'Takwimu za saraka kama orodha na majedwali: ufikiaji, viwanja vya ndege vyenye shughuli nyingi vilivyo na takwimu za abiria zilizochapishwa, na mgawanyo wa kanda.',
      note: (pax: string, detailed: string, total: string) =>
        `Takwimu za abiria zinashughulikia ${pax} kati ya viwanja ${total} vya ndege; takwimu za terminali na malango zinashughulikia ${detailed} kati ya ${total}. Hesabu za terminali zinafuata upangaji wa saraka yenyewe na zinaweza kujumuisha kumbi.`,
      coverageTitle: 'Takwimu za ufikiaji',
      coverage: {
        airports: 'Viwanja vya ndege',
        countries: 'Nchi na kanda',
        regions: 'Kanda za saraka',
        cities: 'Majina ya kipekee ya miji',
        terminals: 'Terminali',
        gates: 'Malango',
        routes: 'Viwanja vya ndege vyenye ramani ya njia',
      },
      busiest: {
        title: 'Viwanja vya ndege vyenye shughuli nyingi kwa abiria wa mwaka',
        sub: 'Viwanja kumi na viwili vyenye shughuli nyingi kati ya vilivyo na takwimu za abiria za mwaka zilizochapishwa.',
        caption: 'Viwanja vya ndege vyenye takwimu za abiria za mwaka zilizochapishwa, kwa mpangilio',
        rank: 'Nafasi',
        iata: 'IATA',
        airport: 'Uwanja wa ndege',
        city: 'Mji',
        country: 'Nchi',
        terminals: 'Terminali',
        gates: 'Malango',
        pax: 'Abiria kwa mwaka (mil.)',
      },
      regions: {
        title: 'Viwanja vya ndege kwa kanda ya saraka',
        sub: 'Hesabu za viwanja vya ndege, terminali na malango zilizopangwa kwa lebo za kanda za saraka; baadhi ya nchi na maeneo yako katika kanda mbili.',
        caption: 'Hesabu za viwanja vya ndege kwa kanda ya saraka',
        region: 'Kanda',
        airports: 'Viwanja vya ndege',
        detailed: 'Vyenyewe data ya kina',
        terminals: 'Terminali',
        gates: 'Malango',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Uwanja wa ndege',
    city: 'Mji',
    country: 'Nchi',
    size: 'Ukubwa',
    map: 'Ramani',
    empty: 'Hakuna uwanja wa ndege unaolingana na vichujio hivi. Jaribu kupanua uteuzi.',
  },

  pager: {
    label: 'Uwekaji wa kurasa',
    previous: 'Ukurasa uliopita',
    next: 'Ukurasa unaofuata',
  },

  filters: {
    searchPlaceholder: 'Tafuta viwanja vya ndege, miji au misimbo ya IATA',
    submit: 'Tafuta',
    country: 'Nchi',
    all: 'Vyote',
    sort: 'Panga',
    sortPax: 'Abiria',
    sortName: 'Jina',
    sortIata: 'Msimbo wa IATA',
    sortUpdated: 'Mara ya mwisho kusasishwa',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Ramani zote za viwanja vya ndege vya ${country}${sortLabel ? ` — zimepangwa kwa ${sortLabel}` : ''}`
        : `Ramani zote za viwanja vya ndege — zimepangwa kwa ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Ramani ya kila uwanja wa ndege wa ${country} kwenye ukurasa mmoja: mipangilio ya terminali, maeneo ya malango na usafiri wa ardhini${sortLabel ? `, zimepangwa kwa ${sortLabel}` : ''}.`
        : `Saraka kamili ya ramani za viwanja vya ndege kwenye ukurasa mmoja: mipangilio ya terminali, maeneo ya malango na usafiri wa ardhini${sortLabel ? `, zimepangwa kwa ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Vinjari viwanja vya ndege kwa nchi',
    description:
      'Vinjari saraka ya ramani za terminali duniani kwa nchi na kanda. Kutoka vituo vikubwa vya kimataifa hadi viwanja vya ndege vya kanda: tazama kila nchi ina viwanja vingapi vya ndege na terminali ngapi.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Kutoka vituo vikubwa vya kimataifa hadi viwanja vya ndege vya kanda — nchi na kanda ${countries}, viwanja ${airports} vya ndege na terminali ${terminals} kwa jumla.`,
    regionCount: (countries: number, airports: number) =>
      `Nchi ${countries} · viwanja ${airports} vya ndege`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} ramani ya viwanja vya ndege — vyote ${count}` : `Ramani za viwanja vya ndege: ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} ina viwanja ${total} vya ndege vyenye safari za kawaida; ${count} kati yao vina ukurasa wa mwongozo hapa, pamoja na ramani ya mgawanyo, orodha kamili ya kitaifa na njia za moja kwa moja.`
        : `Ramani za terminali za viwanja ${count} vya ndege katika ${name} (${nameEn}), zikijumuisha vituo vikuu vya kimataifa na viwanja vya ndege vya kanda vya ${region}. Tazama malango, mipangilio ya terminali na usafiri wa ardhini.`,
    chip: (nameEn: string) => `VIWANJA VYA NDEGE: ${nameEn.toUpperCase()}`,
    kicker: 'Ramani za viwanja vya ndege',
    titleOf: (name: string) => `Viwanja vya ndege katika ${name}`,
    en: 'Viwanja vya ndege',
    sub: 'Chagua uwanja wa ndege kuona mpangilio wa terminali, maeneo ya malango na chaguo za usafiri.',
    empty: 'Hakuna viwanja vya ndege vilivyoorodheshwa kwa nchi au kanda hii bado.',
    moreKicker: 'Nchi nyingine',
    moreTitle: 'Vinjari nchi nyingine',
    moreEn: 'Nchi zaidi',
    all: 'Nchi zote',
    notFound: 'Nchi haipatikani',
    introKicker: 'Muhtasari',
    introTitle: (name: string) => `Muhtasari wa viwanja vya ndege: ${name}`,
    introEn: 'Muhtasari wa viwanja vya ndege',
    introSub:
      'Ukubwa wa viwanja vya ndege katika nchi au kanda hii, vituo vyake vikuu na miji inayohudumiwa.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} iko katika ${o.region}. Tovuti hii inashughulikia ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` na ${o.gates}` : ''}.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) ndiyo kubwa zaidi kwa abiria wa mwaka, ikiwa na ${o.busiestPax}.`
        : '') +
      ` Viwanja hivyo vinahudumia miji ikiwa ni pamoja na ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Kila ukurasa wa uwanja wa ndege una ramani ya mahali na misimbo ya uwanja, pamoja na maelezo yoyote ya terminali, malango na usafiri yaliyokusanywa kwa ajili yake.',
    distribution: {
      kicker: 'Mgawanyo',
      title: (name: string) => `Ramani ya mgawanyo wa viwanja vya ndege: ${name}`,
      en: 'Mgawanyo wa viwanja vya ndege',
      sub: (covered: string, total: string) =>
        `Viwanja ${total} vya ndege vyenye safari za kawaida nchini kote (vikubwa, vya kati na vidogo); ${covered} kati yao vina ukurasa wa mwongozo hapa. Orodha kamili inafuata.`,
      mapAlt: (name: string, total: string) =>
        `Ramani ya mgawanyo wa viwanja vya ndege: ${name}, viwanja ${total} vya ndege vyenye safari za kawaida`,
      siteTag: 'Imejumuishwa hapa',
      colAirport: 'Uwanja wa ndege',
      colCity: 'Mji',
      colType: 'Aina',
      types: {
        large: 'Kubwa',
        medium: 'Wa kati',
        small: 'Mdogo',
      },
      empty: 'Orodha ya kitaifa ya viwanja vya ndege haipatikani bado.',
    },
    linksTitle: 'Viungo vinavyohusiana',
    linksEn: 'Viungo vinavyohusiana',
    linksSub: 'Tovuti rasmi na ensaiklopidia za nchi na kila uwanja wake wa ndege.',
    linksCountry: (name: string) => `Marejeo ya ${name}`,
    linksAirports: (name: string) => `Viwanja vya ndege katika ${name}`,
    faqKicker: 'Maswali',
    faqTitle: 'Maswali yanayoulizwa mara kwa mara',
    faqEn: 'Maswali',
    faq: {
      airportTotal: (name: string) => `Kuna viwanja vingapi vya ndege katika ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} ina viwanja ${total} vya ndege vyenye huduma za kawaida za abiria (vikubwa, vya kati na vidogo); tovuti hii inashughulikia ${covered} kati yao kwa kina. Tazama ramani ya mgawanyo na orodha kamili juu.`,
      airportCount: (name: string) => `Ni viwanja vipi vya ndege vinavyoshughulikiwa katika ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Tovuti hii inashughulikia ${count} katika ${name}: ${list}.`,
      busiest: (name: string) => `Ni uwanja gani wa ndege wenye shughuli nyingi zaidi katika ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Kwa abiria wa mwaka, ${busiest} (${iata}) ni mkubwa zaidi kati ya viwanja vinavyoshughulikiwa hapa, ukiwa na ${pax}.`,
      terminals: (name: string) => `Viwanja vya ndege vya ${name} vina terminali ngapi?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Viwanja vinavyoshughulikiwa katika ${name} vina ${terminals} na ${gates} kwa jumla: ${list}.`,
      cities: (name: string) => `Ni miji ipi katika ${name} ina uwanja wa ndege?`,
      citiesAnswer: (name: string, cities: string) =>
        `Viwanja vya ndege vya ${name} vinavyoshughulikiwa hapa vinahudumia miji ikiwa ni pamoja na ${cities}. Unaweza kuvichuja kwa mji au msimbo wa IATA katika saraka ya viwanja vya ndege.`,
      maps: (name: string) => `Je, viwanja vya ndege vya ${name} vina ramani za terminali?`,
      mapsAnswer: (name: string, count: string) =>
        `Baadhi vina. Kurasa za viwanja vya ndege zina ramani ya mahali, misimbo ya uwanja na njia za moja kwa moja, na ${count} vilivyoshughulikiwa katika ${name} vinaonyesha mpangilio wa terminali, maeneo ya malango na usafiri wa ardhini pale maelezo yalipokusanywa. Fungua uwanja wowote kuona kilichopo.`,
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
        ? `${o.name} (${o.iata}) ina ${o.terminals} terminali${o.gates ? ` na ${o.gates} malango` : ''}${
            o.pax ? `, ikihudumia abiria ${o.pax} kwa mwaka` : ''
          }${o.distance ? `, ${o.distance} kutoka katikati ya mji` : ''}. Ramani ya terminali inayoonyesha terminali zote, maeneo ya malango na usafiri wa ardhini.`
        : `${o.name} (${o.iata}) inahudumia ${o.city}, ${o.country}. Ramani ya mahali, misimbo ya uwanja na taarifa za safari.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'uwanja wa ndege';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) ni ${kind} unaohudumia ${where}`;
      return o.terminals > 0
        ? `${head}, ukiwa na ${o.terminals} terminali${o.gates > 0 ? ` na ${o.gates} malango` : ''}${
            o.distance ? `, takriban ${o.distance} kutoka katikati ya ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Mpangilio wa terminali`,
    mapNote: 'MPANGILIO WA TERMINALI',
    realMapTitle: (iata: string) => `${iata} ramani ya terminali — malango na urambazaji`,
    mapAlt: (name: string, iata: string) =>
      `Ramani ya terminali ya ${name} (${iata}) inayoonyesha terminali zote, maeneo ya malango na kumbi`,
    realMapNote: 'RAMANI YA TERMINALI',
    photosKicker: 'Picha',
    photosTitle: 'Picha za uwanja wa ndege',
    photosEn: 'Picha za uwanja wa ndege',
    photosSub:
      'Picha halisi za uwanja huu wa ndege, kila moja ikiwa na ukurasa wa wavuti wa umma ilikopatikana; hakimiliki zinabaki kwa wapiga picha. Bonyeza picha kukuza, au mstari wa chanzo kufungua ukurasa wa chanzo.',
    photosCredit: (host: string) => `Chanzo: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Picha ${index} ya uwanja wa ndege ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Kuza picha ${index} ya ${name}`,
    zoomLabel: 'Kuza',
    zoomClose: 'Funga',
    zoomIn: 'Kuza',
    zoomOut: 'Punguza',
    downloadKicker: 'Pakua',
    downloadTitle: 'Pakua ramani za viwanja vya ndege',
    downloadEn: 'Vipakuliwa',
    downloadMapLabel: (year: number, iata: string) =>
      `Ramani ya hivi karibuni ya terminali na mpango wa sakafu wa ${iata} ${year} kupakuliwa`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Ramani ya hivi karibuni ya terminali ya ${iata} ${year} kama PDF`,
    timeKicker: 'Muda',
    timeTitle: (iata: string) => `Taarifa za muda — saa ya sasa katika ${iata}`,
    timeEn: 'Muda wa uwanja wa ndege',
    timeSub: (iata: string, tz: string) => `Saa ya sasa katika ${iata} (${tz}) ikilinganishwa na saa yako ya ndani.`,
    clockAirport: 'Saa ya sasa ya uwanja wa ndege',
    clockLocal: 'Saa yako ya ndani',
    infoKicker: 'Taarifa',
    infoTitle: 'Taarifa na maelezo ya uwanja wa ndege',
    infoEn: 'Maelezo ya uwanja wa ndege',
    infoIata: 'Msimbo wa IATA wa uwanja',
    infoLocation: 'Mahali pa uwanja wa ndege',
    infoCoords: 'Kuratibu',
    infoTimezone: 'Eneo la saa',
    linksKicker: 'Viungo',
    linksTitle: 'Viungo vinavyohusiana',
    linksEn: 'VIUNGO VINAVYOHUSIANA',
    linksSub: 'Marejeo ya nje kwa uwanja huu: tovuti rasmi, Wikipedia na Baidu Baike.',
    officialSite: 'Tovuti rasmi',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    sourcesLabel: 'Vyanzo: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Data huria ya OurAirports',
    sourcesNote:
      'Misimbo ya viwanja vya ndege, kuratibu na aina ya uwanja zimekusanywa kutoka data huria; maelezo ya ukurasa yanafuata machapisho rasmi ya kila uwanja.',
    mapEmbedKicker: 'Ramani',
    mapEmbedTitle: (name: string) => `Ramani inayoshirikiana — mahali pa ${name}`,
    mapEmbedEn: 'Ramani inayoshirikiana',
    extMapsNote: 'Tazama uwanja huu katika huduma nyingine za ramani:',
    routeMapKicker: 'Njia',
    routeMapTitle: (name: string) => `Ramani ya njia za ${name} — marudio ya moja kwa moja`,
    routeMapEn: 'Ramani ya njia',
    routeMapAria: (name: string) => `Ramani ya njia za moja kwa moja kutoka ${name}`,
    routeLegendTitle: 'Ufunguo wa rangi',
    routeLegendClose: 'Ficha ufunguo',
    routeReset: 'Weka upya ramani',
    routeZoomIn: 'Kuza',
    routeZoomOut: 'Punguza',
    routeFullscreen: 'Skrini nzima',
    routeExitFullscreen: 'Toka kwenye skrini nzima',
    routeOpenAirport: 'Fungua ukurasa wa uwanja wa ndege wa {iata}',
    routeTiers: {
      trunk: 'Shirika 6+ za ndege',
      major: 'Shirika 3–5 za ndege',
      minor: 'Shirika 2 za ndege',
      single: 'Shirika 1 la ndege',
    },
    routeCarriersTpl: 'Shirika {n} za ndege',
    routeTableDest: 'Marudio',
    routeTableCountry: 'Nchi/kanda',
    routeTableDistance: 'Umbali',
    routeTableCarriers: 'Shirika za ndege',
    routeCarriersMore: (n: number) => ` +${n} zaidi`,
    routeMapNote: (date: string) =>
      `Picha ya data ya njia: ${date}; safari za moja kwa moja tu. Chanzo: `,
    legendTerminal: 'Jengo la terminali',
    legendTransit: 'Kituo cha usafiri wa ardhini',
    legendCorridor: 'Kiungo kati ya terminali',
    terminalsKicker: 'Terminali',
    terminalsTitle: 'Mwongozo wa terminali',
    terminalsEn: 'Mwongozo wa terminali',
    terminalsSub: (name: string) =>
      `Maeneo ya malango, shirika kuu za ndege na huduma kwa kila terminali katika ${name}.`,
    transitTitle: 'Usafiri wa ardhini',
    facilitiesTitle: 'Huduma za uwanja wa ndege',
    faqKicker: 'Maswali',
    faqTitle: 'Maswali yanayoulizwa mara kwa mara',
    faqEn: 'Maswali',
    guideKicker: 'Mwongozo',
    guideTitle: 'Mwongozo wa uwanja wa ndege',
    guideEn: 'Mwongozo wa uwanja wa ndege',
    blogKicker: 'Makala',
    blogTitle: (iata: string) => `Miongozo ya uwanja wa ndege ${iata}`,
    blogEn: 'Kutoka blogu',
    blogSub: (iata: string, count: number) =>
      `Makala ${count} kwenye tovuti hii yanahusu ${iata}: kuwasili, usafiri wa ardhini, mizigo na miunganisho.`,
    blogAll: 'Makala zote',
    relatedTitle: (country: string) => `Viwanja vingine vya ndege katika ${country}`,
    relatedEn: (country: string) => `Zaidi katika ${country}`,
    relatedAll: (country: string) => `Viwanja vyote vya ndege katika ${country}`,
    flights: {
      kicker: 'Safari za ndege',
      title: (name: string) => `Safari za ndege kwenda na kutoka ${name} — kuondoka na kuwasili`,
      en: 'Bodi ya safari',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${pluralSw(flights, 'namba ya safari', 'namba za safari')} katika ${pluralSw(
          airlines,
          'shirika la ndege',
          'shirika za ndege'
        )} na ${pluralSw(destinations, 'marudio', 'marudio')}, zimegawanywa kwa mwelekeo. Namba za codeshare zimejumuishwa.`,
      statDepartures: 'Namba za kuondoka',
      statArrivals: 'Namba za kuwasili',
      statAirlines: 'Shirika za ndege',
      statDestinations: 'Marudio',
      note: (date: string) =>
        `Namba za safari na njia kutoka faharasa ya safari ya aviability.com (picha ${date}); namba za codeshare zimejumuishwa na nyakati za kuondoka hazionyeshwi. Chanzo: `,
      source: 'aviability.com',
      tabDepartures: 'Kuondoka',
      tabArrivals: 'Kuwasili',
      search: 'Tafuta namba ya safari, shirika au mji',
      clearSearch: 'Futa utafutaji',
      flight: 'Safari',
      airline: 'Shirika la ndege',
      destination: 'Marudio',
      origin: 'Kutoka',
      country: 'Nchi/kanda',
      empty: 'Hakuna safari inayolingana na utafutaji huu.',
      loading: 'Inapakia safari…',
      error: 'Imeshindwa kupakia safari zaidi.',
      retry: 'Jaribu tena',
      previous: 'Iliyotangulia',
      next: 'Inayofuata',
      pagination: 'Uwekaji wa kurasa',
      showing: 'Inaonyesha {from}–{to} kati ya {total} namba za safari',
      pageOf: 'Ukurasa {page} kati ya {pages}',
    },
    notFound: 'Uwanja wa ndege haupatikani',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Ramani ya hivi karibuni ya njia za ${name} (${iata}) ${year} — marudio ${count} ya moja kwa moja`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Ramani ya njia za moja kwa moja kutoka ${name} (${iata}): marudio ${count} pamoja na shirika za ndege na umbali, pamoja na orodha kamili ya marudio.`,
    heading: (name: string) => `Ramani ya njia za ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} ina marudio ${count} ya moja kwa moja, yenye rangi kulingana na idadi ya shirika zinazohudumia kila moja.`,
    backToAirport: (iata: string) => `Rudi kwenye ukurasa wa uwanja wa ndege ${iata}`,
    flightNumbers: (iata: string) => `Namba za safari za ${iata}`,
    openFull: 'Tazama ramani ya njia',
    previewCta: (iata: string) => `Tazama ramani kamili ya njia za ${iata}`,
    teaserSub: (count: string) => `Marudio ${count} ya moja kwa moja: ramani, shirika za ndege na umbali.`,
    mapSectionTitle: (name: string) => `Ramani ya njia za moja kwa moja kutoka ${name}`,
    tableKicker: (iata: string) => `${iata} · Marudio`,
    tableSectionTitle: (name: string) => `Orodha ya marudio ya moja kwa moja kutoka ${name}`,
    tableSectionEn: (iata: string) => `Marudio ya ${iata}`,
    tableToc: 'Marudio',
    tableSectionSub: (count: string) =>
      `Marudio ${count}, yenye shughuli nyingi kwanza kwa idadi ya shirika, pamoja na umbali na wabebaji.`,
    dataKicker: 'Pakua',
    dataTitle: 'Pakua data ya njia',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `Njia ${count} za moja kwa moja pamoja na marudio, msimbo wa IATA, mji, nchi, umbali na shirika za ndege — tayari kwa laha au skripti.`,
    dataFields: 'CSV inafaa Excel / Numbers, JSON inafaa msimbo; zote mbili ni UTF-8.',
    dataCsv: 'Pakua CSV',
    dataJson: 'Pakua JSON',
    airportMapSub:
      'Mpangilio wa terminali na malango kwa muhtasari — bonyeza picha kwa ramani kamili, huduma za terminali na usafiri wa ardhini kwenye ukurasa wa uwanja wa ndege.',
    airportMapCta: (iata: string) => `Tazama ramani kamili ya terminali ya ${iata}`,
    factDestinations: 'Marudio ya moja kwa moja',
    factAirlines: 'Shirika za ndege',
    factCountries: 'Nchi',
    factSnapshot: 'Picha ya data',
    faqCountQ: (name: string) => `${name} inaruka hadi maeneo mangapi bila kusimama?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) ina marudio ${count} ya moja kwa moja katika nchi na maeneo ${countries}. Ni safari za moja kwa moja tu zinazohesabiwa; safari zenye kusimama hazimo.`,
    faqAirlinesQ: (name: string) => `Shirika ngapi za ndege zinaruka kutoka ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `Shirika ${count} za ndege zinaendesha njia za moja kwa moja kutoka uwanja huu. Mitandao mikubwa zaidi ni ${leaders} (idadi ya marudio kwenye mabano).`,
    faqFarthestQ: (name: string) => `Ni marudio gani ya moja kwa moja yaliyo mbali zaidi kutoka ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Marudio ya moja kwa moja yaliyo mbali zaidi ni ${city}, ${country} ${iata}, takriban km ${km} mbali.`,
    faqBusiestQ: () => 'Ni marudio gani yenye ushindani mkubwa zaidi?',
    faqBusiestA: (count: string, list: string) =>
      `Marudio ${count} yanahudumiwa na shirika tatu au zaidi; yenye shughuli nyingi ni ${list}.`,
    faqSourceQ: () => 'Data ya njia husasishwa mara ngapi?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Njia kwenye ukurasa huu zinatoka kwenye seti huria ya ${source} (${license}), picha ya ${date} na si ratiba ya moja kwa moja — hakikisha tiketi na nyakati kwa shirika la ndege au uwanja.`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Safari ${number} ya ${airline} — ${from} hadi ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Safari ${number} ni namba ya safari inayotumiwa na ${airline} kutoka ${from} hadi ${to}${distance ? `, takriban ${distance}` : ''}. Ramani ya njia, viwanja vya kuondokea na kuwasilia, umbali na safari nyingine kwenye njia.`,
    heading: (number: string) => `Safari ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Safari ${number} ni namba ya safari inayotumiwa na ${airline} kati ya ${from} na ${to}${distance ? `, umbali wa mstari ulionyooka takriban ${distance}` : ''}.`,
    factFlight: 'Namba ya safari',
    factFrom: 'Kutoka',
    factTo: 'Hadi',
    factDistance: 'Umbali',
    overviewKicker: 'Muhtasari',
    overviewTitle: (number: string) => `Kuhusu safari ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} ni namba ya safari inayotumiwa na ${airline} kati ya ${originName} (${originIata}) na ${destName} (${destIata})${distance ? `, takriban ${distance} mbali` : ''}. Ukurasa huu unakusanya namba ya safari, shirika, njia na viwanja viwili kwa utafutaji wa haraka.`,
    overviewNote:
      'Faharasa ya safari haijumuishi nyakati za kuondoka au kuwasili, aina za ndege au siku za utekelezaji; hakikisha ratiba, kujiandikisha na boarding kwa shirika la ndege au uwanja.',
    routeKicker: 'Njia',
    routeTitle: (from: string, to: string) => `Njia ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Mchoro wa njia ya safari ${number}`,
    routeMapAria: (number: string) => `Ramani ya njia ya safari ${number}`,
    airportsKicker: 'Viwanja vya ndege',
    airportsTitle: 'Viwanja vya kuondokea na kuwasilia',
    airportsSub:
      'Viwanja vinavyounganishwa na safari hii. Viwanja vilivyo kwenye saraka hufungua ukurasa wao.',
    originAirport: 'Uwanja wa kuondokea',
    destinationAirport: 'Uwanja wa kuwasilia',
    airportPage: 'Fungua ukurasa wa uwanja',
    detailsKicker: 'Maelezo',
    detailsTitle: 'Maelezo ya safari',
    detailsFlight: 'Namba ya safari',
    detailsAirline: 'Shirika la ndege',
    detailsOrigin: 'Uwanja wa kuondokea',
    detailsDestination: 'Uwanja wa kuwasilia',
    detailsDistance: 'Umbali wa mstari ulionyooka',
    detailsRoutes: 'Njia zilizoorodheshwa',
    detailsSnapshot: 'Picha ya data',
    routesKicker: 'Njia',
    routesTitle: 'Njia chini ya namba hii ya safari',
    routesSub: (count: string) =>
      `Namba hii inaonekana kwenye njia ${count}; namba moja inaweza kutumika tena na washirika wa codeshare.`,
    routesRoute: 'Njia',
    routesAirline: 'Shirika la ndege',
    routesDistance: 'Umbali',
    relatedKicker: 'Vinavyohusiana',
    relatedTitle: 'Safari nyingine kwenye njia hii',
    relatedSub: 'Namba nyingine za safari kati ya viwanja sawa vya kuondokea na kuwasilia.',
    relatedEn: 'Safari zaidi',
    faqKicker: 'Maswali',
    faqTitle: 'Maswali yanayoulizwa mara kwa mara',
    faqEn: 'Maswali',
    faqWhat: (number: string) => `Safari ${number} ni nini?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Safari ${number} ni namba ya safari inayotumiwa na ${airline} kwenye njia ${from} → ${to}${distance ? `, takriban ${distance} mbali` : ''}.`,
    faqRoute: (number: string) => `Safari ${number} inaruka wapi?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Safari ${number} inaruka kutoka ${originName} (${originIata}) hadi ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Nyakati za kuondoka na kuwasili za ${number} ziko wapi?`,
    faqTimesAnswer: (number: string) =>
      `Ukurasa huu unashughulikia namba ya safari, shirika, njia na viwanja vya ${number}. Faharasa ya aviability.com haijumuishi nyakati za kuondoka au kuwasili — angalia ratiba ya sasa kwa shirika la ndege au uwanja.`,
    note: (date: string) =>
      `Namba ya safari, shirika na njia kutoka faharasa ya aviability.com (picha ${date}); nyakati za kuondoka na kuwasili hazijumuishwa. Chanzo: `,
    source: 'aviability.com',
    sourceFlight: 'Tazama kwenye aviability.com',
    viewAirport: (iata: string) => `Fungua ukurasa wa uwanja wa ndege ${iata}`,
    notFound: 'Safari haipatikani',
  },

  faq: {
    terminalCount: (name: string) => `${name} ina terminali ngapi?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) ina terminali ${terminals} na malango ${gates} kwa jumla: ${list}.`,
    gateCount: (name: string) => `${name} ina malango mangapi?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) ina malango ${gates} kwa jumla: ${list}.`,
    whereIs: (iata: string) => `${iata} iko wapi?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} ni msimbo wa IATA wa ${name} (${nameEn}), ulioko ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `${name} iko umbali gani kutoka katikati ya ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} iko takriban ${distance} kutoka katikati ya ${city}. Unaweza kufika mjini kwa ${transit}.`,
    access: (name: string, city: string) => `Nawezaje kutoka ${name} hadi ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `${name} ina huduma gani?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} ina ${facilities}. Tazama mpangilio wa terminali juu kuona jinsi zimegawanywa kati ya terminali.`,
    location: (name: string) => `${name} iko wapi?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, msimbo wa IATA ${iata}) iko ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Ni shirika gani za ndege zinahudumia kila terminali katika ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Shirika kuu kwa terminali katika ${name}: ${list}. Shirika na ugawaji wa malango hubadilika, hivyo angalia kila mara kadi yako ya boarding na alama za uwanja.`,
    timezone: (name: string) => `${name} iko katika eneo gani la saa?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) iko katika eneo la saa ${tz}. Linganisha na saa yako ya ndani kwa saa ya uwanja juu.`,
    flightsCount: (name: string) => `Ni namba ngapi za safari zilizoorodheshwa kwa ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Faharasa ya aviability.com inaorodhesha ${pluralSw(
        departures,
        'namba ya kuondoka',
        'namba za kuondoka'
      )} na ${pluralSw(arrivals, 'namba ya kuwasili', 'namba za kuwasili')} kwa ${name} (${iata}), ikijumuisha ${pluralSw(
        airlines,
        'shirika la ndege',
        'shirika za ndege'
      )} na ${pluralSw(destinations, 'marudio', 'marudio')} (picha ${date}). Namba za codeshare zimejumuishwa na ratiba zinaweza kubadilika — hakikisha kwa shirika kabla ya safari.`,
  },

  editorial: {
    authorName: 'Timu ya uhariri ya World Airport Maps',
    role: 'Iliyokusanywa na kukaguliwa na ',
    sourcesNote: 'Imeokusanywa kutoka vyanzo vya umma na taarifa rasmi za viwanja vya ndege',
  },

  toc: {
    label: 'Kwenye ukurasa huu',
    map: 'Ramani ya terminali',
    photos: 'Picha za uwanja',
    time: 'Muda wa uwanja',
    details: 'Maelezo ya uwanja',
    links: 'Viungo vinavyohusiana',
    location: 'Ramani ya mahali',
    routes: 'Ramani ya njia',
    flights: 'Safari',
    guide: 'Mwongozo wa uwanja',
    blog: 'Miongozo inayohusiana',
    terminals: 'Mwongozo wa terminali',
    transport: 'Usafiri wa ardhini',
    facilities: 'Huduma',
    faq: 'Maswali',
    flightOverview: 'Muhtasari wa safari',
    flightRoute: 'Njia',
    flightAirports: 'Viwanja vya ndege',
    flightDetails: 'Maelezo ya safari',
    flightRoutes: 'Njia zote',
    flightRelated: 'Safari zinazohusiana',
    intro: 'Muhtasari wa viwanja',
    distribution: 'Mgawanyo wa viwanja',
    airports: 'Orodha ya viwanja',
  },

  error: {
    title: 'Ukurasa huu haukuweza kupakiwa',
    sub: 'Kuna hitilafu wakati wa kusoma data ya uwanja wa ndege. Jaribu tena au rudi kwenye ukurasa wa mwanzo.',
    retry: 'Jaribu tena',
    backHome: 'Rudi kwenye ukurasa wa mwanzo',
    notFoundTitle: '404 · Ukurasa haupatikani',
    notFoundSub: 'Ukurasa uliouomba unaweza kuwa umehamishwa au kuondolewa. Jaribu kutafuta uwanja wa ndege au endelea kwa viungo vilivyo chini.',
  },

  footer: {
    sponsored: 'Imedhaminiwa',
    mapsTitle: 'Ramani za terminali zenye maelezo',
    mapsBody:
      'Kuabiri viwanja vya ndege na terminali zao unaweza kuwa mgumu. Ramani zetu zinaonyesha mipangilio ya terminali, malango, maeneo ya kujiandikisha, mikanda ya mizigo, maduka, mikahawa, vyumba vya kupumzika na vituo vya usafiri, ili safari iende kwa urahisi.',
    plansTitle: 'Mipango ya terminali inayoshirikiana',
    plansBody:
      'Viwanja vikubwa vya kimataifa vina terminali nyingi na mipangilio tata. Ramani zetu husaidia kupata lango, huduma, kupanga muunganisho na kupita kwa ufanisi kwenye usalama, kuondoka na kuwasili.',
    transitTitle: 'Usafiri na ufikiaji wa uwanja',
    transitBody:
      'Zaidi ya mipangilio ya terminali tunashughulikia chaguo za usafiri, maegesho na njia za kufikia — jinsi ya kufikia lango lako, kuhamisha kati ya terminali na kutumia treni, basi, teksi na gari la kukodi.',
    stats: (countries: string, airports: string, terminals: string) =>
      `Nchi / kanda ${countries} · viwanja ${airports} vya ndege · terminali ${terminals} · mipangilio ya terminali yenye michoro`,
    fallback: 'Mipangilio ya terminali yenye michoro na miongozo ya usafiri kwa viwanja vya ndege duniani',
    linksLabel: 'Urambazaji wa chini',
    about: 'Kuhusu sisi',
    contact: 'Wasiliana',
    sources: 'Vyanzo vya data',
    privacy: 'Sera ya faragha',
    disclaimer: 'Kanusho',
    terms: 'Masharti ya matumizi',
  },

  transportModes: swTransportModes as Record<string, string>,

  categories: {
    kicker: 'Vinjari',
    title: 'Vinjari kwa eneo',
    en: 'Vinjari kwa eneo',
    sub: 'Ingia kwenye saraka kwa mtazamo wowote: kwa nchi, kanda, mji — au nenda moja kwa moja kwenye vituo vyenye shughuli nyingi, masasisho ya hivi karibuni na miongozo.',
    allAirports: {
      title: 'Viwanja vyote vya ndege',
      body: 'Saraka kamili, iliyopangwa kwa kiasi cha abiria, inayochujwa kwa nchi na kupangwa upya.',
    },
    byCountry: {
      title: 'Kwa nchi',
      body: 'Tazama kila nchi au kanda ina viwanja vingapi vya ndege, terminali na malango.',
    },
    byRegion: {
      title: 'Kwa kanda',
      body: 'Nchi zilizopangwa katika Asia ya Mashariki, Ulaya, Amerika ya Kaskazini na mengine.',
    },
    popularCities: {
      title: 'Miji maarufu',
      body: 'Miji yenye shughuli nyingi za viwanja vya ndege kwa jumla ya abiria wa mwaka, na kila uwanja wa ndege ndani yake.',
    },
    recentlyUpdated: {
      title: 'Imesasishwa hivi karibuni',
      body: 'Rekodi mpya na zilizorekebishwa za viwanja vya ndege, mpya zaidi kwanza.',
    },
    guides: {
      title: 'Miongozo ya viwanja vya ndege',
      body: 'Miongozo ndefu kuhusu kuhamisha kati ya terminali, kufika mjini na vidokezo vya vitendo.',
    },
    routes: {
      title: 'Ramani za njia',
      body: 'Tazama mtandao wa njia za moja kwa moja wa uwanja wa ndege, uliopangwa kwa idadi ya marudio, pamoja na shirika na umbali.',
    },
  },

  guides: {
    kicker: 'Miongozo',
    title: 'Miongozo ya viwanja vya ndege',
    en: 'Miongozo ya viwanja vya ndege',
    sub: 'Zaidi ya michoro ya terminali, tumeandika miongozo ndefu kwa vituo teule: jinsi ya kusoma namba za malango, jinsi ya kuhamisha kati ya terminali na jinsi ya kufika mjini.',
    more: 'Tazama uwanja huu',
  },

  blog: {
    kicker: 'Jarida',
    title: 'Maelezo ya safari',
    nav: 'Blogu',
    en: 'Maelezo ya safari',
    sub: 'Maelezo marefu kutoka dawati letu la uhariri: kuwasili na uhamiaji, kuhamisha, huduma za terminali na mahali pa kupumzika.',
    more: 'Soma',
    all: 'Makala zote',
    morePosts: 'Makala zaidi',
    airportsKicker: 'Viwanja vya ndege',
    airportsTitle: 'Viwanja vya ndege katika makala hii',
    airportsEn: 'Viwanja vilivyoshughulikiwa',
    airportsSub: 'Fungua ukurasa wa uwanja kwa ramani ya terminali, usafiri wa ardhini na maswali.',
    back: 'Rudi kwenye orodha ya makala',
    empty: 'Hakuna makala bado.',
    readingMinutes: (n: number) => `Dakika ${n} za kusoma`,
    source: (name: string) => `Chanzo: ${name}`,
    tags: 'Lebo',
  },

  comments: {
    kicker: 'Maoni',
    title: 'Maoni ya wasomaji',
    en: 'Majadiliano',
    sub: 'Maswali, ripoti za safari na marekebisho yote yanakaribishwa. Maoni ni ya umma.',
    formTitle: 'Acha maoni',
    countOne: 'Maoni 1',
    countMany: 'Maoni {n}',
    empty: 'Hakuna maoni bado — kuwa wa kwanza kuandika.',
    loading: 'Inapakia maoni…',
    loadError: 'Maoni hayapatikani kwa sasa.',
    retry: 'Jaribu tena',
    nameLabel: 'Jina',
    namePlaceholder: 'Tukuitaje?',
    bodyLabel: 'Maoni',
    bodyPlaceholder: 'Shiriki uzoefu wako, uliza swali au ongeza muktadha…',
    submit: 'Chapisha maoni',
    submitting: 'Inachapisha…',
    success: 'Imechapishwa — asante kwa kushiriki.',
    error: 'Maoni hayakuweza kuchapishwa. Jaribu tena baadaye.',
    rateLimited: 'Hiyo ilikuwa haraka sana. Subiri dakika chache na ujaribu tena.',
    nameError: 'Tafadhali weka jina (herufi 2–40).',
    bodyError: 'Tafadhali andika maoni (herufi 5–2000).',
    note: 'Maoni ni ya umma na yanaonyesha maoni ya waandishi wao. Tafadhali kuwa mpole na usichapishe matangazo au taarifa binafsi.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Mpangilio wa terminali ya ${name}`,
    gates: 'Malango',
    terminal: 'Terminali',
    corridor: 'Kiungo',
    transit: 'Usafiri wa ardhini',
    footer: (iata: string) => `${iata} · Mpangilio wa terminali`,
  },

  tool: {
    label: 'Zana za mtandaoni',
    hub: {
      kicker: 'Zana',
      title: 'Zana za ramani na kuratibu',
      en: 'Zana huria',
      sub: 'Zana huria za mtandaoni kwa wasafiri na wapenda jiografia — zinafanya kazi kwenye kivinjari, hakuna cha kusakinisha.',
      description:
        'Zana huria za ramani na kuratibu mtandaoni: ubadilishaji wa WGS84 / GCJ02 / BD09, digrii za desimali ↔ DMS na umbali wa mstari ulionyooka kati ya pointi mbili. Lugha mbili, moja kwa moja kwenye kivinjari.',
      comingTitle: 'Zana zaidi zinazotengenezwa',
      comingSub: 'Kuchagua kuratibu kwenye ramani, kushiriki mahali na vikokotoo vya makadirio vinakuja.',
    },
    howTitle: 'Jinsi ya kutumia',
    relatedTitle: 'Zana zinazohusiana',
    allTools: 'Zana zote',
    tools: {
      coordinateConverter: {
        title: 'Kibadilishi cha kuratibu',
        en: 'Kibadilishi cha kuratibu',
        description:
          'Badilisha kati ya WGS84, GCJ02 na BD09 — suluhisho la tatizo la kuhama kwa ramani nchini China.',
        note: 'WGS84 ni kiwango cha GPS na kimataifa. GCJ02 ni mfumo wa kuratibu uliohamishwa unaohitajika China bara (unaitwa "kuratibu za Mirihi"), unaotumiwa na AMap na Tencent Maps. BD09 huongeza uhamisho mwingine juu ya GCJ02 na hutumiwa na Baidu Maps. Mahali pale panaweza kutofautiana kwa mita 100–700 kati ya mifumo, kwa hiyo badilisha kabla ya kutumia kuratibu tena katika huduma nyingine ya ramani.',
        steps: [
          'Weka kuratibu za desimali kama latitudo, longitudo — k.m. 39.9042, 116.4074.',
          'Chagua mfumo wa kuratibu wa data yako ya kuingiza.',
          'Bonyeza "Badilisha" kupata mifumo mingine miwili; tumia "Nakili" kuhifadhi matokeo.',
        ],
        inputLabel: 'Kuratibu (latitudo, longitudo)',
        inputPlaceholder: 'k.m. 39.9042, 116.4074',
        sourceLabel: 'Mfumo wa kuratibu wa kuingiza',
        wgs84: 'WGS84 · GPS / kimataifa',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Nafasi za desimali',
        submit: 'Badilisha',
        copy: 'Nakili',
        copied: 'Imenakiliwa',
        error: 'Kuratibu hazikuweza kusomwa. Tumia muundo "latitudo, longitudo", k.m. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Kibadilishi cha muundo wa kuratibu',
        en: 'Kibadilishi cha muundo wa kuratibu',
        description:
          'Badilisha kati ya digrii za desimali (DD), digrii-dakika (DM) na digrii-dakika-sekunde (DMS); muundo wa kuingiza hutambuliwa kiotomatiki.',
        note: 'DD (39.9042°) ni muundo wa kawaida wa desimali unaotumiwa na vifaa na API; DMS (39°54′15″N) ni wa kawaida katika bahari, anga na upimaji; DM (39°54.25′N) ni wa kawaida kwa kumbukumbu za uwandani. Zana hutambua muundo kutokana na idadi ya makundi ya tarakimu katika kila nusu (1 = DD, 2 = DM, 3 = DMS) na hutoa mifumo yote mitatu, pamoja na N/S/E/W kwa nusukani.',
        steps: [
          'Weka jozi ya kuratibu — 39.9042, 39°54′15″N na 39°32.5′E zote zinafanya kazi; tenganisha nusu mbili kwa koma.',
          'Chagua idadi ya nafasi za desimali za matokeo.',
          'Bonyeza "Badilisha" — mifumo yote mitatu inaorodheshwa; tumia "Nakili" kuhifadhi mmoja.',
        ],
        inputLabel: 'Kuratibu (jozi moja, iliyotenganishwa kwa koma)',
        inputPlaceholder: 'k.m. 39°54′15″N, 116°24′51″E au 39.9042, 116.4074',
        precisionLabel: 'Nafasi za desimali',
        submit: 'Badilisha',
        ddLabel: 'Digrii za desimali (DD)',
        dmLabel: 'Digrii-dakika (DM)',
        dmsLabel: 'Digrii-dakika-sekunde (DMS)',
        copy: 'Nakili',
        copied: 'Imenakiliwa',
        error: 'Kuratibu hazikuweza kusomwa. Mifumo inayotumika ni pamoja na 39.9042, 39°54′15″N na 39°32.5′E, zikitenganishwa kwa koma.',
      },
      distanceCalculator: {
        title: 'Kikokotoo cha umbali',
        en: 'Kikokotoo cha umbali',
        description:
          'Umbali wa mstari ulionyooka kati ya pointi mbili duniani, pamoja na mwelekeo wa mwanzo.',
        note: 'Umbali hutumia fomula ya Haversine ya mduara mkubwa (radius ya wastani ya Dunia km 6,371.0088) — njia fupi zaidi juu ya uso. Mwelekeo wa mwanzo ni mwelekeo wa dira kutoka pointi ya kwanza kuelekea ya pili, 0° kaskazini na ukiongezeka kwa mwendo wa saa.',
        steps: [
          'Weka latitudo na longitudo ya pointi ya kuanzia na ya mwisho.',
          'Bonyeza "Kokotoa umbali".',
          'Pata matokeo kwa kilomita, maili na maili za baharini, pamoja na mwelekeo wa mwanzo.',
        ],
        fromLabel: 'Kutoka',
        toLabel: 'Hadi',
        inputPlaceholder: 'latitudo, longitudo',
        example: 'Mfano: Beijing → Shanghai',
        submit: 'Kokotoa umbali',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Mwelekeo wa mwanzo',
        copy: 'Nakili',
        copied: 'Imenakiliwa',
        error: 'Kuratibu hazikuweza kusomwa. Tumia muundo "latitudo, longitudo" na latitudo -90–90 na longitudo -180–180.',
      },
    },
  },
};
