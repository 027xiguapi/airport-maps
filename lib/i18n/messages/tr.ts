import type { Messages } from './zh';
import { trTransportModes } from '../tr-data';

/**
 * Turkish catalog. Typed against the Chinese source of truth (`Messages`), so a
 * missing or renamed key fails `npm run typecheck`.
 *
 * Style: polite second person ("siz"), Turkish typography — “tırnak”, en
 * dashes, decimal comma — and the established Turkish forms of place names.
 * Airport names keep their international form.
 */

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'büyük havalimanı',
  medium: 'orta büyüklükte havalimanı',
  small: 'küçük havalimanı',
  heliport: 'helikopter pisti',
} as const;

export const tr: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Havalimanı ve Terminal Haritaları',
    description:
      'Ülke ve bölgeye göre düzenlenmiş havalimanı terminal haritalarına göz atın. Büyük uluslararası aktarma merkezlerinden bölgesel havalimanlarına kadar kapıların, check-in alanlarının, bagaj alımının, mağazaların, restoranların, yolcu salonlarının ve kara ulaşımının ayrıntılı yerleşimlerini görün.',
    keywords: [
      'havalimanı haritaları',
      'terminal haritaları',
      'havalimanı terminal yerleşimi',
      'kapılar',
      'havalimanı ulaşımı',
      'havalimanı rehberi',
    ],
    numberOfItems: (n: number) => `${n} havalimanı`,
  },

  nav: {
    home: 'Ana sayfa',
    airports: 'Tüm havalimanları',
    countries: 'Ülkeye göre',
    tools: 'Çevrimiçi araçlar',
    about: 'Hakkında',
    label: 'Ana gezinme',
    languageLabel: 'Dil',
    switchLanguage: 'Dili değiştir',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'Hazırlanıyor',
    languagePlannedHint: 'Bu dil sürümü henüz yayımlanmadı.',
    themeToggle: 'Koyu modu aç/kapat',
    menu: 'Menü',
  },

  common: {
    advertisement: 'Reklam',
    skipToContent: 'Ana içeriğe geç',
    backToTop: 'Başa dön',
    breadcrumbLabel: 'Gezinme yolu',
    home: 'Ana sayfa',
    viewMap: 'Haritayı görüntüle',
    terminalMap: 'Terminal haritası',
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
        ? `${name} (${iata}): ${counts.terminals} terminal${
            counts.gates > 0 ? `, ${counts.gates} kapı` : ''
          } — Terminal Haritası`
        : `${name} (${iata}) — Konum Haritası ve Havalimanı Rehberi ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} Terminal Haritası` : name,
    airportGuide: 'Havalimanı rehberi',
    lastUpdated: 'Yakın zamanda güncellendi',
    updatedOn: (date: string) => `Güncellendi: ${date}`,
    publishedOn: (date: string) => `Yayımlandı: ${date}`,
    readMore: 'Rehberin tamamını okuyun',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Terminaller',
    gatesFact: 'Kapılar',
    terminals: (n: number) => `${n} terminal`,
    terminalsShort: (n: number) => `${n} terminal`,
    gates: (n: number) => `${n} kapı`,
    airports: (n: number) => `${n} havalimanı`,
    airportsChip: (n: number) => `${n} havalimanı`,
    pax: 'Yolcu',
    paxFull: 'Yıllık yolcu',
    distance: 'Şehir merkezine',
    distanceFrom: (city: string) => `${city} şehir merkezinden`,
    gatesLabel: (range: string) => `Kapılar ${range}`,
    gatesCount: (n: number) => `${n} kapı`,
    satellite: 'Uydu terminal',
    airlinesLabel: 'Başlıca havayolu şirketleri: ',
  },

  search: {
    ariaLabel: 'Havalimanı ara',
    placeholder: 'Havalimanı, şehir veya IATA kodu arayın',
    heroPlaceholder:
      'Havalimanı adı, şehir veya IATA koduyla arayın — örn. LHR / Dubai / Heathrow',
    submit: 'Havalimanı bul',
    loading: 'Aranıyor…',
    empty: 'Eşleşen havalimanı bulunamadı',
    resultsTitle: (term: string) => `“${term}” için arama sonuçları`,
    resultsCount: (n: number) => `${n} eşleşen havalimanı bulundu.`,
    noResults:
      'Hiçbir havalimanı eşleşmedi. Şehir adı veya IATA kodu gibi farklı bir anahtar kelime deneyin.',
    noResultsHint: 'Aradığınız havalimanını bulamıyor musunuz?',
    viewAll: (n: number) => `Tüm ${n} havalimanına göz atın`,
    orBrowseByCountry: 'ülkeye göre göz atın',
    range: (from: number, to: number, total: number) =>
      `Toplam ${total} havalimanından ${from}–${to} arası gösteriliyor`,
  },

  hero: {
    eyebrow: 'Dünya Havalimanı Dizini',
    titleLead: 'Havalimanlarını ve',
    titleAccent: 'terminal haritalarını keşfedin',
    sub: 'Ülke ve bölgeye göre düzenlenmiş eksiksiz havalimanı ve terminal haritaları koleksiyonumuzla her havalimanında yolunuzu bulun — büyük uluslararası aktarma merkezlerinden bölgesel havalimanlarına kadar.',
    stats: {
      countries: 'Ülkeler / bölgeler',
      airports: 'Kapsanan havalimanları',
      terminals: 'Terminal haritaları',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'Bu site hakkında',
      imageAlt:
        'Gün doğumunda cam cepheli bir havalimanı terminalinin kapısında bekleyen yolcu uçağı',
      blocks: [
        {
          title: 'Ayrıntılı Terminal Haritalarıyla Her Havalimanında Yolunuzu Bulun',
          body: 'Dünya genelindeki havalimanlarında ve terminallerde yön bulmak zor olabilir. Kapsamlı havalimanı haritalarımız terminallerin, kapıların, check-in alanlarının, bagaj alımının, mağazaların, restoranların, yolcu salonlarının ve ulaşım merkezlerinin ayrıntılı yerleşimlerini sunar; böylece yola çıkmadan önce güzergâhınızı planlayabilirsiniz.',
        },
        {
          title: 'Etkileşimli Havalimanı Terminal Haritaları ve Kat Planları',
          body: 'Büyük uluslararası havalimanlarında birden çok terminal ve karmaşık yerleşimler bulunur. Ayrıntılı havalimanı haritalarımız kapıları bulmanıza, olanaklara ulaşmanıza, aktarmaları planlamanıza ve güvenlik kontrollerinden, kalkış alanlarından ve varış salonlarından geri dönmeden verimli biçimde geçmenize yardımcı olur.',
        },
        {
          title: 'Havalimanı Ulaşımı ve Erişim Bilgileri',
          body: 'Havalimanı rehberlerimiz terminal yerleşimlerinin ötesinde ulaşım seçeneklerini, otopark bilgilerini ve erişim güzergâhlarını da kapsar. Kalkış kapınıza ulaşmanın, terminaller arasında aktarma yapmanın ve trenler, otobüsler, taksiler ile kiralık araçlar dahil kara ulaşımını kullanmanın en iyi yolunu bulun.',
        },
      ],
    },
    map: {
      kicker: 'Dünya Haritası',
      title: 'Havalimanı haritası',
      en: 'Havalimanı Haritası',
      sub: (airports: string, world: string) =>
        `Dünya genelinde ${world} tarifeli havalimanını bulun — bunlardan ${airports} tanesi burada terminal haritalarıyla yer alıyor. Ülke/bölge bilgisi ve ayrıntılar için bir noktaya tıklayın.`,
      all: 'Tümü',
      gEurope: 'Avrupa',
      gAsia: 'Asya',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Okyanusya',
      legendSite: 'Burada kapsanıyor · terminal haritaları için tıklayın',
      legendWorld: 'Dünya genelindeki diğer tarifeli havalimanları',
      countTemplate: '{n} havalimanı gösteriliyor',
      download: 'Verileri indir',
      downloadTitle:
        'Geçerli filtredeki tüm havalimanlarını CSV olarak dışa aktarın (IATA, ad, şehir, ülke, koordinatlar)',
      openAirport: 'Havalimanını görüntüle',
    },
    popular: {
      kicker: 'Terminal Haritaları',
      title: 'Popüler havalimanı haritaları',
      en: 'Havalimanı Haritaları',
      sub: 'Dünya genelindeki büyük havalimanlarından seçilmiş terminal haritası kapakları — tam harita için bir havalimanı sayfası açın.',
    },
    recent: {
      kicker: 'Yeni Yayımlananlar',
      title: 'Yakın zamanda güncellendi',
      en: 'Yakın Zamanda Güncellendi',
      sub: 'Yeni eklenen ve güncellenen havalimanları, ülkeler ve seyahat rehberleri.',
      countriesTitle: 'Yakın zamanda güncellenen ülkeler',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Rotalar',
      title: 'En yoğun havalimanı rota haritaları',
      en: 'Rota Haritaları',
      sub: 'Kaç yere aktarmasız uçtuklarına göre sıralanmış havalimanları — rota haritası, havayolu şirketleri ve varış noktası listesi için birini açın.',
      collection: 'Rota koleksiyonu',
      tabsLabel: 'Şehre göre rota haritaları',
      explore: (city: string) => `${city} rotalarını keşfedin`,
      play: 'Slayt gösterisini başlat',
      pause: 'Slayt gösterisini duraklat',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'Son Fotoğraflar',
      title: 'En son havalimanı fotoğrafları',
      en: 'Son Fotoğraflar',
      sub: 'En son eklenen havalimanı fotoğrafları — en yeni altı havalimanı, her biri için bir fotoğraf.',
      ariaLabel: 'En son havalimanı fotoğrafları karuseli',
      prev: 'Önceki fotoğraf',
      next: 'Sonraki fotoğraf',
      play: 'Slayt gösterisini başlat',
      pause: 'Slayt gösterisini duraklat',
      counter: (index: number, total: number) => `Fotoğraf ${index} / ${total}`,
      view: (name: string) => `${name} haritasını görüntüle`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'Havalimanı sayfasını aç',
    },
    countries: {
      kicker: 'Ülkeye Göre',
      title: 'Ülkeye göre havalimanı haritaları',
      en: 'Ülkeler',
      sub: 'Ülke ve bölgeye göre düzenlenmiş havalimanı terminal haritalarına göz atın: büyük uluslararası aktarma merkezlerinden bölgesel havalimanlarına kadar.',
      more: 'Tüm ülkeler',
    },
    all: {
      kicker: 'Tüm Haritalar',
      title: 'Tüm havalimanı haritaları',
      en: 'Tüm Havalimanları',
      sub: 'Dünyanın en yoğun havalimanları ve seyahat merkezleri için havalimanı haritaları.',
      hint: 'Terminal yerleşimini görmek için bir havalimanı seçin.',
      more: 'Tümünü görüntüle',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Dizin Verileri',
      title: 'Bir bakışta havalimanı verileri',
      en: 'Listeler ve Tablolar',
      sub: 'Dizin rakamları liste ve tablo biçiminde: kapsam, yayımlanmış yolcu sayısına sahip havalimanları arasında en yoğun olanlar ve bölgesel dağılım.',
      note: (pax: string, detailed: string, total: string) =>
        `Yolcu verileri ${total} havalimanından ${pax} tanesi için, terminal ve kapı verileri ise ${total} havalimanından ${detailed} tanesi için mevcut. Terminal sayıları bu dizinin kendi gruplamasını izler ve terminal bölümlerini içerebilir.`,
      coverageTitle: 'Kapsam rakamları',
      coverage: {
        airports: 'Havalimanları',
        countries: 'Ülkeler ve bölgeler',
        regions: 'Dizin bölgeleri',
        cities: 'Farklı şehir adları',
        terminals: 'Terminaller',
        gates: 'Kapılar',
        routes: 'Rota haritası olan havalimanları',
      },
      busiest: {
        title: 'Yıllık yolcu sayısına göre en yoğun havalimanları',
        sub: 'Yayımlanmış yıllık yolcu sayısı bulunan havalimanları arasında en yoğun 12 havalimanı.',
        caption: 'Yayımlanmış yıllık yolcu sayısına göre sıralanmış havalimanları',
        rank: 'Sıra',
        iata: 'IATA',
        airport: 'Havalimanı',
        city: 'Şehir',
        country: 'Ülke',
        terminals: 'Terminaller',
        gates: 'Kapılar',
        pax: 'Yıllık yolcu (milyon)',
      },
      regions: {
        title: 'Dizin bölgesine göre havalimanları',
        sub: 'Havalimanı, terminal ve kapı sayıları dizinin kendi bölge etiketlerine göre gruplandırılmıştır; bazı ülkeler ve topraklar iki bölgeye yayılabilir.',
        caption: 'Dizin bölgesine göre gruplandırılmış havalimanı sayıları',
        region: 'Bölge',
        airports: 'Havalimanları',
        detailed: 'Ayrıntılı verilerle',
        terminals: 'Terminaller',
        gates: 'Kapılar',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Havalimanı',
    city: 'Şehir',
    country: 'Ülke',
    size: 'Büyüklük',
    map: 'Harita',
    empty: 'Bu filtrelerle eşleşen havalimanı yok. Seçiminizi genişletmeyi deneyin.',
  },

  pager: {
    label: 'Sayfalama',
    previous: 'Önceki sayfa',
    next: 'Sonraki sayfa',
  },

  filters: {
    searchPlaceholder: 'Havalimanı, şehir veya IATA kodu arayın',
    submit: 'Ara',
    country: 'Ülke',
    all: 'Tümü',
    sort: 'Sırala',
    sortPax: 'Yolcu',
    sortName: 'Ad',
    sortIata: 'IATA kodu',
    sortUpdated: 'Son güncelleme',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `${country} havalimanı haritalarının tümü${sortLabel ? ` — ${sortLabel} ölçütüne göre sıralı` : ''}`
        : `Tüm havalimanı haritaları — ${sortLabel} ölçütüne göre sıralı`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `${country} içindeki tüm havalimanı haritaları tek sayfada: terminal yerleşimleri, kapı aralıkları ve kara ulaşımı${sortLabel ? `, ${sortLabel} ölçütüne göre sıralı` : ''}.`
        : `Havalimanı haritalarının tam dizini tek sayfada: terminal yerleşimleri, kapı aralıkları ve kara ulaşımı${sortLabel ? `, ${sortLabel} ölçütüne göre sıralı` : ''}.`,
  },

  countries: {
    title: 'Ülkeye göre havalimanlarına göz atın',
    description:
      'Küresel havalimanı terminal haritası dizinine ülke ve bölgeye göre göz atın. Büyük uluslararası aktarma merkezlerinden bölgesel havalimanlarına kadar her ülkenin kaç havalimanı ve terminali olduğunu görün.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Büyük uluslararası aktarma merkezlerinden bölgesel havalimanlarına kadar — toplam ${countries} ülke ve bölge, ${airports} havalimanı ve ${terminals} terminal.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ülke · ${airports} havalimanı`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} Havalimanı Haritası — ${count} Havalimanının Tamamı` : `${name} havalimanı haritaları`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} genelinde ${total} tarifeli havalimanı bulunuyor; bunlardan ${count} tanesinin burada rehber sayfası, havalimanı dağılım haritası, tam ulusal liste ve doğrudan rotaları yer alıyor.`
        : `${name} (${nameEn}) içindeki ${count} havalimanı için terminal haritaları: ${region} bölgesinin başlıca uluslararası aktarma merkezleri ve bölgesel havalimanları. Kapıları, terminal yerleşimlerini ve kara ulaşımını görün.`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} HAVALİMANLARI`,
    kicker: 'Havalimanı Haritaları',
    titleOf: (name: string) => `${name} içindeki havalimanları`,
    en: 'Havalimanları',
    sub: 'Terminal yerleşimini, kapı aralıklarını ve kara ulaşımı seçeneklerini görmek için bir havalimanı seçin.',
    empty: 'Bu ülke veya bölge için henüz havalimanı listelenmemiş.',
    moreKicker: 'Diğer Ülkeler',
    moreTitle: 'Diğer ülkelere göz atın',
    moreEn: 'Diğer Ülkeler',
    all: 'Tüm ülkeler',
    notFound: 'Ülke bulunamadı',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Genel Bakış',
    introTitle: (name: string) => `${name} havalimanlarına genel bakış`,
    introEn: 'Havalimanlarına Genel Bakış',
    introSub:
      'Bu ülke veya bölgedeki havalimanlarının ölçeği, başlıca merkezleri ve hizmet verdikleri şehirler.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''}, ${o.region} bölgesinde yer alır. Bu site burada ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` ve ${o.gates}` : ''} kapsıyor.` +
      (o.busiest
        ? ` Yıllık yolcu sayısına göre en büyüğü ${o.busiest} (${o.busiestIata}) olup ${o.busiestPax} yolcu ağırlıyor.`
        : '') +
      ` Havalimanları ${o.cities} gibi şehirlere hizmet veriyor. ${o.mapsNote}`,
    introMapsNote:
      'Her havalimanı sayfasında konum haritası ve havalimanı kodları, ayrıca o havalimanı için derlenmiş terminal, kapı ve kara ulaşımı ayrıntıları yer alır.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Dağılım',
      title: (name: string) => `${name} havalimanı dağılım haritası`,
      en: 'Havalimanı Dağılımı',
      sub: (covered: string, total: string) =>
        `Ülke genelinde ${total} tarifeli havalimanı (büyük, orta ve küçük); bunlardan ${covered} tanesinin bu sitede bir rehber sayfası var. Tam liste aşağıdadır.`,
      mapAlt: (name: string, total: string) =>
        `${name} havalimanı dağılım haritası: ${total} tarifeli havalimanı`,
      siteTag: 'Burada kapsanıyor',
      colAirport: 'Havalimanı',
      colCity: 'Şehir',
      colType: 'Tür',
      types: {
        large: 'Büyük',
        medium: 'Orta',
        small: 'Küçük',
      },
      empty: 'Henüz ulusal havalimanı listesi mevcut değil.',
    },

    /** Related links */
    linksTitle: 'İlgili bağlantılar',
    linksEn: 'İlgili Bağlantılar',
    linksSub: 'Ülke ve ülkedeki her havalimanı için resmî siteler ve ansiklopedi girişleri.',
    linksCountry: (name: string) => `${name} kaynakları`,
    linksAirports: (name: string) => `${name} içindeki havalimanları`,

    faqKicker: 'SSS',
    faqTitle: 'Sıkça sorulan sorular',
    faqEn: 'Sorular',
    faq: {
      airportTotal: (name: string) => `${name} genelinde kaç havalimanı var?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} genelinde tarifeli yolcu seferi yapılan ${total} havalimanı var (büyük, orta ve küçük); bu site bunlardan ${covered} tanesini ayrıntılı olarak kapsıyor. Yukarıdaki dağılım haritasına ve tam listeye bakın.`,
      airportCount: (name: string) => `${name} genelinde hangi havalimanları kapsanıyor?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Bu site ${name} genelinde ${count} havalimanını kapsıyor: ${list}.`,
      busiest: (name: string) => `${name} genelindeki en yoğun havalimanı hangisi?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Yıllık yolcu sayısına göre ${busiest} (${iata}), burada kapsanan havalimanları arasında ${pax} yolcuyla en büyük havalimanıdır.`,
      terminals: (name: string) => `${name} genelindeki havalimanlarının kaç terminali var?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name} genelinde kapsanan havalimanlarında toplam ${terminals} ve ${gates} bulunuyor: ${list}.`,
      cities: (name: string) => `${name} genelinde hangi şehirlerde havalimanı var?`,
      citiesAnswer: (name: string, cities: string) =>
        `Burada kapsanan ${name} havalimanları ${cities} gibi şehirlere hizmet veriyor. Bunları havalimanı dizininde şehre veya IATA koduna göre filtreleyebilirsiniz.`,
      maps: (name: string) => `${name} genelindeki havalimanlarının terminal haritaları var mı?`,
      mapsAnswer: (name: string, count: string) =>
        `Bazılarında var. Havalimanı sayfalarında konum haritası, havalimanı kodları ve doğrudan rotalar yer alıyor; ${name} genelinde kapsanan ${count} havalimanı, bu bilgilerin derlendiği yerlerde terminal yerleşim şeması, kapı aralıkları ve kara ulaşımını gösteriyor. Hangilerinde ne olduğunu görmek için bir havalimanı açın.`,
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
        ? `${o.name} (${o.iata}) havalimanında ${o.terminals} terminal${
            o.gates ? ` ve ${o.gates} kapı` : ''
          } var${o.pax ? `; havalimanı yılda ${o.pax} yolcu ağırlıyor` : ''}${
            o.distance ? ` ve şehir merkezine ${o.distance} uzaklıkta` : ''
          }. Tüm terminalleri, kapı aralıklarını ve kara ulaşımını gösteren terminal haritası.`
        : `${o.name} (${o.iata}), ${o.city} (${o.country}) kentine hizmet veriyor. Konum haritası, havalimanı kodları ve seyahat bilgileri.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'havalimanı';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}), ${where} kentine hizmet veren bir ${kind}dır`;
      return o.terminals > 0
        ? `${head}; havalimanında ${o.terminals} terminal${
            o.gates > 0 ? ` ve ${o.gates} kapı` : ''
          } bulunuyor${o.distance ? `. Havalimanı şehir merkezine yaklaşık ${o.distance} uzaklıkta` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Terminal yerleşimi`,
    mapNote: 'TERMİNAL YERLEŞİMİ',
    realMapTitle: (iata: string) => `${iata} Havalimanı Terminal Haritası — Kapılar ve Yön Bulma`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `${name} (${iata}) terminal haritası: tüm terminaller, kapı aralıkları ve terminal bölümleri`,
    realMapNote: 'TERMİNAL HARİTASI',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Fotoğraflar',
    photosTitle: 'Havalimanı fotoğrafları',
    photosEn: 'Havalimanı Fotoğrafları',
    photosSub:
      'Bu havalimanının gerçek fotoğrafları; her fotoğrafın altında, fotoğrafın bulunduğu kamuya açık web sayfasına bir atıf yer alır ve telif hakkı özgün fotoğrafçılarda kalır. Yakınlaştırmak için bir fotoğrafa, kaynak sayfasını açmak için bir atıf satırına tıklayın.',
    photosCredit: (host: string) => `Kaynak: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata}) havalimanı fotoğrafı ${index}`,
    photosZoom: (name: string, index: number) =>
      `${name} havalimanının ${index}. fotoğrafına yakınlaştır`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Yakınlaştır',
    zoomClose: 'Kapat',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    downloadKicker: 'İndir',
    downloadTitle: 'Havalimanı Haritalarını İndirin',
    downloadEn: 'İndirmeler',
    downloadMapLabel: (year: number, iata: string) =>
      `${year} Güncel ${iata} Havalimanı Terminal Haritası ve Kat Planı İndirme`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year} Güncel ${iata} Havalimanı Terminal Haritası PDF İndirme`,
    timeKicker: 'Saat',
    timeTitle: (iata: string) => `Havalimanı saat bilgisi — ${iata} güncel saat`,
    timeEn: 'Havalimanı Saati',
    timeSub: (iata: string, tz: string) =>
      `${iata} (${tz}) için güncel saat, yerel saatinizle karşılaştırılmıştır.`,
    clockAirport: 'Havalimanındaki güncel saat',
    clockLocal: 'Yerel saatiniz',
    infoKicker: 'Bilgi',
    infoTitle: 'Havalimanı bilgileri ve ayrıntıları',
    infoEn: 'Havalimanı Ayrıntıları',
    infoIata: 'Havalimanı IATA kodu',
    infoLocation: 'Havalimanı konumu',
    infoCoords: 'Koordinatlar',
    infoTimezone: 'Saat dilimi',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Bağlantılar',
    linksTitle: 'İlgili bağlantılar',
    linksEn: 'İLGİLİ BAĞLANTILAR',
    linksSub:
      'Bu havalimanı için dış kaynaklar: resmî web sitesi, Wikipedia ve Baidu Baike.',
    officialSite: 'Resmî web sitesi',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Kaynaklar: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'OurAirports açık verisi',
    sourcesNote:
      'Havalimanı kodları, koordinatlar ve havalimanı sınıfı açık verilerden derlenmiştir; sayfa ayrıntıları her havalimanının resmî yayınlarını izler.',
    mapEmbedKicker: 'Harita',
    mapEmbedTitle: (name: string) => `Etkileşimli harita — ${name} konumu`,
    mapEmbedEn: 'Etkileşimli Harita',
    extMapsNote: 'Bu havalimanını diğer harita hizmetlerinde görüntüleyin:',
    routeMapKicker: 'Rotalar',
    routeMapTitle: (name: string) => `${name} rota haritası — doğrudan varış noktaları`,
    routeMapEn: 'Rota Haritası',
    routeMapAria: (name: string) => `${name} havalimanından doğrudan rotaların haritası`,
    routeLegendTitle: 'Renk anahtarı',
    routeLegendClose: 'Renk anahtarını gizle',
    routeReset: 'Haritayı sıfırla',
    routeZoomIn: 'Yakınlaştır',
    routeZoomOut: 'Uzaklaştır',
    routeFullscreen: 'Tam ekran görüntüle',
    routeExitFullscreen: 'Tam ekrandan çık',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: '{iata} havalimanı sayfasını aç',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6+ havayolu şirketi',
      major: '3–5 havayolu şirketi',
      minor: '2 havayolu şirketi',
      single: '1 havayolu şirketi',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} havayolu şirketi',
    routeTableDest: 'Varış noktası',
    routeTableCountry: 'Ülke/bölge',
    routeTableDistance: 'Mesafe',
    routeTableCarriers: 'Havayolu şirketleri',
    routeCarriersMore: (n: number) => ` +${n} tane daha`,
    routeMapNote: (date: string) =>
      `Rota verisi anlık görüntüsü: ${date}; yalnızca doğrudan uçuşlar. Kaynak: `,
    legendTerminal: 'Terminal binası',
    legendTransit: 'Kara ulaşımı noktası',
    legendCorridor: 'Terminaller arası bağlantı',
    terminalsKicker: 'Terminaller',
    terminalsTitle: 'Terminal rehberi',
    terminalsEn: 'Terminal Rehberi',
    terminalsSub: (name: string) =>
      `${name} havalimanındaki her terminal için kapı aralıkları, başlıca havayolu şirketleri ve olanaklar.`,
    transitTitle: 'Kara ulaşımı',
    facilitiesTitle: 'Havalimanı olanakları',
    faqKicker: 'SSS',
    faqTitle: 'Sıkça sorulan sorular',
    faqEn: 'Sorular',
    guideKicker: 'Rehber',
    guideTitle: 'Havalimanı rehberi',
    guideEn: 'Havalimanı Rehberi',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'Makaleler',
    blogTitle: (iata: string) => `${iata} havalimanı rehberleri`,
    blogEn: 'Blogdan',
    blogSub: (iata: string, count: number) =>
      `Bu sitedeki ${count} makale ${iata} havalimanını kapsıyor: varışlar, kara ulaşımı, bagaj ve aktarmalar.`,
    blogAll: 'Tüm makaleler',
    relatedTitle: (country: string) => `${country} içindeki diğer havalimanları`,
    relatedEn: (country: string) => `${country} içinde daha fazlası`,
    relatedAll: (country: string) => `${country} içindeki tüm havalimanları`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'Uçuşlar',
      title: (name: string) => `${name} uçuşları — kalkışlar ve varışlar`,
      en: 'Uçuş Panosu',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${flights} uçuş numarası, ${airlines} havayolu şirketi ve ${destinations} varış noktası, yönlere göre ayrılmıştır. Ortak uçuş numaraları dahildir.`,
      statDepartures: 'Kalkış uçuş numaraları',
      statArrivals: 'Varış uçuş numaraları',
      statAirlines: 'Havayolu şirketleri',
      statDestinations: 'Varış noktaları',
      note: (date: string) =>
        `Uçuş numaraları ve rotalar aviability.com uçuş dizininden (anlık görüntü: ${date}); ortak uçuş numaraları dahildir ve kalkış saatleri gösterilmez. Kaynak: `,
      source: 'aviability.com',
      tabDepartures: 'Kalkışlar',
      tabArrivals: 'Varışlar',
      search: 'Uçuş numarası, havayolu şirketi veya şehir arayın',
      clearSearch: 'Aramayı temizle',
      flight: 'Uçuş',
      airline: 'Havayolu şirketi',
      destination: 'Varış noktası',
      origin: 'Kalkış noktası',
      country: 'Ülke/bölge',
      empty: 'Bu aramayla eşleşen uçuş yok.',
      loading: 'Uçuşlar yükleniyor…',
      error: 'Daha fazla uçuş yüklenemedi.',
      retry: 'Yeniden deneyin',
      previous: 'Önceki',
      next: 'Sonraki',
      pagination: 'Sayfalama',
      showing: '{total} uçuş numarasından {from}–{to} arası gösteriliyor',
      pageOf: 'Sayfa {page} / {pages}',
    },
    notFound: 'Havalimanı bulunamadı',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Güncel ${name} (${iata}) Rota Haritası ${year} — ${count} doğrudan varış noktası`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name} (${iata}) için doğrudan rota haritası: sefer yapan havayolu şirketleri ve mesafelerle birlikte ${count} varış noktası ve tam varış noktası listesi.`,
    heading: (name: string) => `${name} rota haritası`,
    headingSub: (iata: string, count: string) =>
      `${iata} havalimanının ${count} doğrudan varış noktası var; her biri, kaç havayolu şirketinin hizmet verdiğine göre renklendirilmiştir.`,
    backToAirport: (iata: string) => `${iata} havalimanı sayfasına dön`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `${iata} uçuş numaraları`,
    /** Button on the airport page's teaser card. */
    openFull: 'Rota haritasını görüntüle',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `${iata} havalimanının tam rota haritasını görüntüle`,
    teaserSub: (count: string) =>
      `${count} doğrudan varış noktası: harita, sefer yapan havayolu şirketleri ve mesafeler.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `${name} doğrudan rota haritası`,
    tableKicker: (iata: string) => `${iata} · Varış Noktaları`,
    tableSectionTitle: (name: string) => `${name} doğrudan varış noktası listesi`,
    tableSectionEn: (iata: string) => `${iata} Varış Noktaları`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Varış noktaları',
    tableSectionSub: (count: string) =>
      `${count} varış noktası; sefer yapan havayolu şirketi sayısına göre en yoğundan başlayarak, mesafe ve havayolu şirketleriyle birlikte.`,
    dataKicker: 'İndir',
    dataTitle: 'Rota verisi indirme',
    dataEn: 'Veri',
    dataSub: (count: number) =>
      `${count} doğrudan rota; varış noktası, IATA kodu, şehir, ülke, mesafe ve sefer yapan havayolu şirketleriyle birlikte — elektronik tablo veya betik için hazır.`,
    dataFields: 'CSV Excel / Numbers için, JSON kod için uygundur; her ikisi de UTF-8 kodludur.',
    dataCsv: 'CSV indir',
    dataJson: 'JSON indir',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Terminal ve kapı yerleşimine bir bakışta göz atın — tam harita, terminal olanakları ve kara ulaşımı için havalimanı sayfasındaki görsele tıklayın.',
    airportMapCta: (iata: string) => `${iata} terminal haritasının tamamını görün`,
    /** Header fact cells. */
    factDestinations: 'Doğrudan varış noktaları',
    factAirlines: 'Havayolu şirketleri',
    factCountries: 'Ülkeler',
    factSnapshot: 'Veri anlık görüntüsü',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `${name} havalimanından kaç yere aktarmasız uçuluyor?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) havalimanının ${countries} ülke ve bölgede toplam ${count} doğrudan varış noktası var. Yalnızca aktarmasız rotalar sayılır; duraklı güzergâhlar dahil değildir.`,
    faqAirlinesQ: (name: string) => `${name} havalimanından kaç havayolu şirketi uçuyor?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} havayolu şirketi bu havalimanından doğrudan rota işletiyor. En geniş ağlar: ${leaders} (parantez içinde varış noktası sayısı).`,
    faqFarthestQ: (name: string) =>
      `${name} havalimanından aktarmasız en uzak varış noktası neresi?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `En uzak doğrudan varış noktası ${city}, ${country} ${iata}; yaklaşık ${km} km uzaklıkta.`,
    faqBusiestQ: () => 'Hangi varış noktalarında en fazla rekabet var?',
    faqBusiestA: (count: string, list: string) =>
      `${count} varış noktasına üç veya daha fazla havayolu şirketi uçuyor; en yoğunları ${list}.`,
    faqSourceQ: () => 'Rota verileri ne sıklıkla güncelleniyor?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Bu sayfadaki rotalar ${source} açık veri kümesinden (${license}) geliyor; canlı bir tarife değil, ${date} tarihli bir anlık görüntüdür — bilet ve saatler için havayolu şirketine veya havalimanına bakın.`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} uçuşu — ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number} uçuş numarası ${airline} tarafından ${from} ile ${to} arasında kullanılır${distance ? `, yaklaşık ${distance}` : ''}. Rota haritası, kalkış ve varış havalimanları, mesafe ve rotadaki diğer uçuşlar.`,
    heading: (number: string) => `Uçuş ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number}, ${airline} tarafından ${from} ile ${to} arasında kullanılan bir uçuş numarasıdır${distance ? `, yaklaşık ${distance}’lik büyük daire mesafesiyle` : ''}.`,
    factFlight: 'Uçuş numarası',
    factFrom: 'Nereden',
    factTo: 'Nereye',
    factDistance: 'Mesafe',
    overviewKicker: 'Genel Bakış',
    overviewTitle: (number: string) => `Uçuş ${number} hakkında`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number}, ${airline} tarafından ${originName} (${originIata}) ile ${destName} (${destIata}) arasında kullanılan bir uçuş numarasıdır${distance ? `; aralarındaki mesafe yaklaşık ${distance}` : ''}. Bu sayfa hızlı başvuru için uçuş numarasını, havayolu şirketini, rotayı ve iki havalimanını bir arada sunar.`,
    overviewNote:
      'Uçuş dizininde kalkış veya varış saatleri, uçak tipi ya da işletme tarihleri yer almaz; tarifeleri, check-in ve biniş saatlerini havayolu şirketi veya havalimanıyla doğrulayın.',
    routeKicker: 'Rota',
    routeTitle: (from: string, to: string) => `${from} → ${to} rotası`,
    routeDiagramAria: (number: string) => `${number} uçuşu için rota şeması`,
    routeMapAria: (number: string) => `${number} uçuşu için rota haritası`,
    airportsKicker: 'Havalimanları',
    airportsTitle: 'Kalkış ve varış havalimanları',
    airportsSub:
      'Bu uçuşun bağladığı havalimanları. Dizinde kapsanan havalimanları kendi sayfalarını açar.',
    originAirport: 'Kalkış havalimanı',
    destinationAirport: 'Varış havalimanı',
    airportPage: 'Havalimanı sayfasını aç',
    detailsKicker: 'Ayrıntılar',
    detailsTitle: 'Uçuş ayrıntıları',
    detailsFlight: 'Uçuş numarası',
    detailsAirline: 'Havayolu şirketi',
    detailsOrigin: 'Kalkış havalimanı',
    detailsDestination: 'Varış havalimanı',
    detailsDistance: 'Büyük daire mesafesi',
    detailsRoutes: 'Listelenen rotalar',
    detailsSnapshot: 'Veri anlık görüntüsü',
    routesKicker: 'Rotalar',
    routesTitle: 'Bu uçuş numarası altındaki rotalar',
    routesSub: (count: string) =>
      `Bu numara ${count} rotada görünüyor; bir numara ortak uçuş anlaşmaları kapsamında yeniden kullanılabilir.`,
    routesRoute: 'Rota',
    routesAirline: 'Havayolu şirketi',
    routesDistance: 'Mesafe',
    relatedKicker: 'İlgili',
    relatedTitle: 'Bu rotadaki diğer uçuşlar',
    relatedSub: 'Aynı kalkış ve varış havalimanları arasındaki diğer uçuş numaraları.',
    relatedEn: 'Diğer Uçuşlar',
    faqKicker: 'SSS',
    faqTitle: 'Sıkça sorulan sorular',
    faqEn: 'Sorular',
    faqWhat: (number: string) => `${number} uçuşu nedir?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number}, ${airline} tarafından ${from} → ${to} rotasında kullanılan bir uçuş numarasıdır${distance ? `; aralarındaki mesafe yaklaşık ${distance}` : ''}.`,
    faqRoute: (number: string) => `${number} uçuşu nereye uçuyor?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `${number} uçuşu ${originName} (${originIata}) havalimanından ${destName} (${destIata}) havalimanına uçar.`,
    faqTimes: (number: string) => `${number} için kalkış ve varış saatleri nerede?`,
    faqTimesAnswer: (number: string) =>
      `Bu sayfa ${number} için uçuş numarasını, havayolu şirketini, rotayı ve havalimanlarını kapsar. aviability.com uçuş dizini kalkış veya varış saatlerini içermez — güncel tarife için havayolu şirketine veya havalimanına bakın.`,
    note: (date: string) =>
      `Uçuş numarası, havayolu şirketi ve rota aviability.com uçuş dizininden (anlık görüntü: ${date}); kalkış ve varış saatleri dahil değildir. Kaynak: `,
    source: 'aviability.com',
    sourceFlight: 'aviability.com üzerinde görüntüle',
    viewAirport: (iata: string) => `${iata} havalimanı sayfasını aç`,
    notFound: 'Uçuş bulunamadı',
  },

  faq: {
    terminalCount: (name: string) => `${name} havalimanının kaç terminali var?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) havalimanında toplam ${terminals} ve ${gates} bulunuyor: ${list}.`,
    gateCount: (name: string) => `${name} havalimanının kaç kapısı var?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) havalimanında toplam ${gates} bulunuyor: ${list}.`,
    whereIs: (iata: string) => `${iata} nerede?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata}, ${name} (${nameEn}) için IATA kodudur; havalimanı ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country} konumunda yer alır.`,
    distance: (name: string, city: string) =>
      `${name}, ${city} şehir merkezinden ne kadar uzakta?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name}, ${city} şehir merkezinden yaklaşık ${distance} uzaklıkta. Şehre ${transit} ile ulaşabilirsiniz.`,
    access: (name: string, city: string) =>
      `${name} havalimanından ${city} şehrine nasıl giderim?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `${name} hangi olanakları sunuyor?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}, ${facilities} sunuyor. Bu olanakların terminaller arasında nasıl dağıldığını yukarıdaki terminal yerleşiminde görebilirsiniz.`,
    location: (name: string) => `${name} nerede yer alıyor?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA kodu ${iata}), ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country} konumunda yer alır.`,
    airlines: (name: string) =>
      `${name} havalimanında her terminalde hangi havayolu şirketleri faaliyet gösteriyor?`,
    airlinesAnswer: (name: string, list: string) =>
      `${name} havalimanında terminale göre başlıca havayolu şirketleri: ${list}. Havayolu şirketleri ve kapı atamaları değişebilir; bu nedenle her zaman biniş kartınıza ve havalimanının kendi tabelalarına bakın.`,
    timezone: (name: string) => `${name} hangi saat diliminde?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}), ${tz} saat diliminde. Yukarıdaki havalimanı saatini kullanarak yerel saatinizle karşılaştırabilirsiniz.`,
    flightsCount: (name: string) =>
      `${name} havalimanında kaç uçuş numarası listeleniyor?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.com uçuş dizini ${name} (${iata}) için ${departures} kalkış uçuş numarası ve ${arrivals} varış uçuş numarası listeliyor; bunlar ${airlines} havayolu şirketi ve ${destinations} varış noktasını kapsıyor (anlık görüntü: ${date}). Ortak uçuş numaraları dahildir ve tarifeler değişebilir — seyahatten önce havayolu şirketiyle doğrulayın.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'World Airport Maps Editör Ekibi',
    role: 'Derleyen ve inceleyen: ',
    sourcesNote: 'Kamuya açık kaynaklardan ve resmî havalimanı bilgilerinden derlenmiştir',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'Bu sayfada',
    map: 'Terminal haritası',
    photos: 'Havalimanı fotoğrafları',
    time: 'Havalimanı saati',
    details: 'Havalimanı ayrıntıları',
    links: 'İlgili bağlantılar',
    location: 'Konum haritası',
    routes: 'Rota haritası',
    flights: 'Uçuşlar',
    guide: 'Havalimanı rehberi',
    blog: 'İlgili rehberler',
    terminals: 'Terminal rehberi',
    transport: 'Kara ulaşımı',
    facilities: 'Olanaklar',
    faq: 'SSS',
    flightOverview: 'Uçuşa genel bakış',
    flightRoute: 'Rota',
    flightAirports: 'Havalimanları',
    flightDetails: 'Uçuş ayrıntıları',
    flightRoutes: 'Tüm rotalar',
    flightRelated: 'İlgili uçuşlar',
    intro: 'Havalimanlarına genel bakış',
    distribution: 'Havalimanı dağılımı',
    airports: 'Havalimanı listesi',
  },

  error: {
    title: 'Bu sayfa yüklenemedi',
    sub: 'Havalimanı verileri okunurken bir sorun oluştu. Lütfen yeniden deneyin veya göz atmaya devam etmek için ana sayfaya dönün.',
    retry: 'Yeniden deneyin',
    backHome: 'Ana sayfaya dön',
    notFoundTitle: '404 · Sayfa bulunamadı',
    notFoundSub:
      'İstediğiniz sayfa taşınmış veya kaldırılmış olabilir. Bir havalimanı aramayı deneyin veya aşağıdaki bağlantılardan devam edin.',
  },

  footer: {
    sponsored: 'Sponsorlu',
    mapsTitle: 'Ayrıntılı terminal haritaları',
    mapsBody:
      'Havalimanlarında ve terminallerinde yol bulmak zor olabilir. Havalimanı haritalarımız terminallerin, kapıların, check-in alanlarının, bagaj alımının, mağazaların, restoranların, yolcu salonlarının ve ulaşım aktarma noktalarının ayrıntılı yerleşimlerini göstererek yolculuğunuzun daha sorunsuz geçmesini sağlar.',
    plansTitle: 'Etkileşimli terminal planları',
    plansBody:
      'Büyük uluslararası havalimanlarında birden çok terminal ve karmaşık yerleşimler bulunur. Ayrıntılı haritalarımız kapınızı bulmanıza, olanaklara ulaşmanıza, aktarmayı planlamanıza ve güvenlik, kalkış ve varış alanlarından verimli biçimde geçmenize yardımcı olur.',
    transitTitle: 'Havalimanı ulaşımı ve erişim',
    transitBody:
      'Terminal yerleşimlerinin ötesinde ulaşım seçeneklerini, otoparkı ve erişim güzergâhlarını da kapsıyoruz — kapınıza nasıl ulaşacağınız, terminaller arasında nasıl aktarma yapacağınız ve trenler, otobüsler, taksiler ile araç kiralama dahil kara ulaşımını nasıl kullanacağınız.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} ülke / bölge · ${airports} havalimanı · ${terminals} terminal · çizimli terminal yerleşimleri`,
    fallback:
      'Dünya genelindeki havalimanları için çizimli terminal yerleşimleri ve kara ulaşımı rehberleri',
    linksLabel: 'Alt bilgi gezinmesi',
    about: 'Hakkında',
    contact: 'İletişim',
    sources: 'Veri kaynakları',
    privacy: 'Gizlilik politikası',
    disclaimer: 'Yasal uyarı',
    terms: 'Kullanım koşulları',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: trTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Göz atın',
    title: 'Alana göre göz atın',
    en: 'Alana göre göz atın',
    sub: 'Dizine size uygun açıdan girin: ülkeye, bölgeye, şehre göre — ya da doğrudan en yoğun merkezlere, son güncellemelere ve havalimanı rehberlerine gidin.',
    allAirports: {
      title: 'Tüm havalimanları',
      body: 'Yolcu hacmine göre sıralanmış, ülkeye göre filtrelenebilen ve yeniden sıralanabilen eksiksiz dizin.',
    },
    byCountry: {
      title: 'Ülkeye göre',
      body: 'Her ülkenin veya bölgenin kaç havalimanı, terminali ve kapısı olduğunu görün.',
    },
    byRegion: {
      title: 'Bölgeye göre',
      body: 'Daha hızlı hedefleme için Doğu Asya, Avrupa, Kuzey Amerika ve diğerleri olarak gruplandırılmış ülkeler.',
    },
    popularCities: {
      title: 'Popüler şehirler',
      body: 'Toplam yıllık yolcu sayısına göre en yoğun havalimanı şehirleri ve her birindeki tüm havalimanları.',
    },
    recentlyUpdated: {
      title: 'Yakın zamanda güncellendi',
      body: 'Yeni eklenen ve güncellenen havalimanı kayıtları, en yeniden başlayarak.',
    },
    guides: {
      title: 'Havalimanı rehberleri',
      body: 'Terminal aktarmaları, şehre ulaşım ve pratik ipuçları için uzun biçimli rehberler.',
    },
    routes: {
      title: 'Rota haritaları',
      body: 'Bir havalimanının aktarmasız ağını varış noktası sayısına göre sıralanmış olarak, havayolu şirketleri ve mesafelerle birlikte görün.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Rehberler',
    title: 'Havalimanı rehberleri',
    en: 'Havalimanı rehberleri',
    sub: 'Terminal şemalarının ötesinde, seçili merkezler için uzun biçimli rehberler yazdık: kapı numaralandırması nasıl okunur, terminaller arasında nasıl geçilir ve şehre nasıl ulaşılır.',
    more: 'Bu havalimanını görüntüle',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the English
   * wording of the same UI.
   */
  blog: {
    kicker: 'Dergi',
    title: 'Seyahat notları',
    nav: 'Blog',
    en: 'Seyahat notları',
    sub: 'Yayın masamızdan uzun notlar: varış ve pasaport işlemleri, aktarmalar, terminal olanakları ve nerede dinlenilir.',
    more: 'Oku',
    all: 'Tüm makaleler',
    morePosts: 'Daha fazla makale',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'Havalimanları',
    airportsTitle: 'Bu makaledeki havalimanları',
    airportsEn: 'Kapsanan Havalimanları',
    airportsSub: 'Terminal haritası, kara ulaşımı ve SSS için bir havalimanı sayfası açın.',
    back: 'Makale listesine dön',
    empty: 'Henüz makale yok.',
    readingMinutes: (n: number) => `${n} dakikalık okuma`,
    source: (name: string) => `Kaynak: ${name}`,
    tags: 'Etiketler',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'Yorumlar',
    title: 'Okuyucu yorumları',
    en: 'Tartışma',
    sub: 'Sorular, seyahat deneyimleri ve düzeltmeler memnuniyetle karşılanır. Yorumlar herkese açıktır.',
    formTitle: 'Yorum bırakın',
    countOne: '1 yorum',
    countMany: '{n} yorum',
    empty: 'Henüz yorum yok — ilk yazan siz olun.',
    loading: 'Yorumlar yükleniyor…',
    loadError: 'Yorumlar şu anda kullanılamıyor.',
    retry: 'Yeniden deneyin',
    nameLabel: 'Ad',
    namePlaceholder: 'Size nasıl hitap edelim?',
    bodyLabel: 'Yorum',
    bodyPlaceholder: 'Deneyiminizi paylaşın, bir soru sorun veya ek bilgi verin…',
    submit: 'Yorum gönder',
    submitting: 'Gönderiliyor…',
    success: 'Gönderildi — paylaştığınız için teşekkürler.',
    error: 'Yorumunuz gönderilemedi. Lütfen daha sonra yeniden deneyin.',
    rateLimited: 'Bu çok hızlı oldu. Lütfen birkaç dakika bekleyip yeniden deneyin.',
    nameError: 'Lütfen bir ad girin (2–40 karakter).',
    bodyError: 'Lütfen bir yorum yazın (5–2000 karakter).',
    note: 'Yorumlar herkese açıktır ve yazarlarının kendi görüşlerini yansıtır. Lütfen nazik olun ve reklam veya kişisel bilgi paylaşmayın.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name} için terminal yerleşim şeması`,
    gates: 'Kapılar',
    terminal: 'Terminal',
    corridor: 'Bağlantı',
    transit: 'Kara ulaşımı',
    footer: (iata: string) => `${iata} · Terminal yerleşimi`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Çevrimiçi araçlar',
    hub: {
      kicker: 'Araçlar',
      title: 'Harita ve koordinat araçları',
      en: 'Ücretsiz Araçlar',
      sub: 'Gezginler ve coğrafya meraklıları için ücretsiz çevrimiçi araçlar — tarayıcıda açılır, kurulum gerektirmez.',
      description:
        'Ücretsiz çevrimiçi harita ve koordinat araçları: WGS84 / GCJ02 / BD09 koordinat dönüşümü, ondalık derece ↔ DMS biçimlendirmesi ve iki nokta arasındaki büyük daire mesafesi. İki dilli, tarayıcınızda kullanıma hazır.',
      comingTitle: 'Geliştirilmekte olan diğer araçlar',
      comingSub: 'Koordinat seçici, konum paylaşımı ve projeksiyon hesaplayıcıları yolda.',
    },
    howTitle: 'Nasıl kullanılır',
    relatedTitle: 'İlgili araçlar',
    allTools: 'Tüm araçlar',
    tools: {
      coordinateConverter: {
        title: 'Koordinat dönüştürücü',
        en: 'Koordinat Dönüştürücü',
        description:
          'WGS84, GCJ02 ve BD09 arasında dönüştürün — Çin harita kayması sorununun çözümü.',
        note: 'WGS84, GPS ve uluslararası standarttır. GCJ02, Çin anakarasında zorunlu olan kaydırılmış koordinat sistemidir (“Mars koordinatları” olarak da bilinir) ve AMap ile Tencent Maps tarafından kullanılır. BD09, GCJ02’nin üzerine bir kaydırma daha ekler ve Baidu Maps tarafından kullanılır. Aynı nokta sistemler arasında 100–700 m farklılık gösterebilir; bu nedenle koordinatları başka bir harita hizmetinde yeniden kullanmadan önce dönüştürün.',
        steps: [
          'Ondalık koordinatları enlem, boylam olarak girin — örn. 39.9042, 116.4074.',
          'Girdinizin kullandığı koordinat sistemini seçin.',
          'Diğer iki sistemi elde etmek için “Dönüştür”e basın; bir sonucu kaydetmek için “Kopyala”yı kullanın.',
        ],
        inputLabel: 'Koordinatlar (enlem, boylam)',
        inputPlaceholder: 'örn. 39.9042, 116.4074',
        sourceLabel: 'Girdi koordinat sistemi',
        wgs84: 'WGS84 · GPS / uluslararası',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Ondalık basamak sayısı',
        submit: 'Dönüştür',
        copy: 'Kopyala',
        copied: 'Kopyalandı',
        error:
          'Koordinatlar ayrıştırılamadı. “enlem, boylam” biçimini kullanın, örn. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Koordinat biçimi dönüştürücü',
        en: 'Koordinat Biçimi Dönüştürücü',
        description:
          'Ondalık derece (DD), derece-dakika (DM) ve derece-dakika-saniye (DMS) arasında dönüştürün; girdi biçimi otomatik algılanır.',
        note: 'DD (39.9042°) cihazların ve API’lerin kullandığı düz ondalık biçimdir; DMS (39°54′15″N) denizcilik, havacılık ve haritacılıkta yaygındır; DM (39°54.25′N) tipik olarak saha kayıtlarında kullanılır. Araç, girdi biçimini her yarının içerdiği sayı grubu sayısından algılar (1 = DD, 2 = DM, 3 = DMS) ve üç biçimin tümünü yarımküreler için N/S/E/W ile verir.',
        steps: [
          'Bir koordinat çifti girin — 39.9042, 39°54′15″N ve 39°32.5′E biçimleri çalışır; iki yarıyı virgülle ayırın.',
          'Çıktı için ondalık basamak sayısını seçin.',
          '“Dönüştür”e basın — üç biçim de listelenir; birini kaydetmek için “Kopyala”yı kullanın.',
        ],
        inputLabel: 'Koordinatlar (virgülle ayrılmış bir çift)',
        inputPlaceholder: 'örn. 39°54′15″N, 116°24′51″E veya 39.9042, 116.4074',
        precisionLabel: 'Ondalık basamak sayısı',
        submit: 'Dönüştür',
        ddLabel: 'Ondalık derece (DD)',
        dmLabel: 'Derece-dakika (DM)',
        dmsLabel: 'Derece-dakika-saniye (DMS)',
        copy: 'Kopyala',
        copied: 'Kopyalandı',
        error:
          'Koordinatlar ayrıştırılamadı. Desteklenen biçimler 39.9042, 39°54′15″N ve 39°32.5′E’dir; virgülle ayırın.',
      },
      distanceCalculator: {
        title: 'Mesafe hesaplayıcı',
        en: 'Mesafe Hesaplayıcı',
        description:
          'Dünya üzerindeki iki nokta arasındaki büyük daire mesafesi ve başlangıç yönü.',
        note: 'Mesafe, Haversine büyük daire formülünü kullanır (ortalama Dünya yarıçapı 6.371,0088 km) — yüzey boyunca en kısa yol. Başlangıç yönü, birinci noktadan ikinciye doğru pusula yönüdür; kuzeyde 0° olup saat yönünde artar.',
        steps: [
          'Başlangıç ve bitiş noktalarının enlem ve boylamını girin.',
          '“Mesafeyi hesapla”ya basın.',
          'Sonucu kilometre, mil ve deniz mili olarak, ayrıca başlangıç yönünü alın.',
        ],
        fromLabel: 'Başlangıç',
        toLabel: 'Bitiş',
        inputPlaceholder: 'enlem, boylam',
        example: 'Örnek: Pekin → Şanghay',
        submit: 'Mesafeyi hesapla',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Başlangıç yönü',
        copy: 'Kopyala',
        copied: 'Kopyalandı',
        error:
          'Koordinatlar ayrıştırılamadı. “enlem, boylam” biçimini kullanın; enlem -90–90, boylam -180–180 aralığında olmalıdır.',
      },
    },
  },
};
