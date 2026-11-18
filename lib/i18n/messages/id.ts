import type { Messages } from './zh';
import { idTransportModes } from '../id-data';

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'bandara besar',
  medium: 'bandara sedang',
  small: 'bandara kecil',
  heliport: 'heliport',
} as const;

/**
 * Indonesian catalog. Typed against the Chinese source of truth (`Messages`), so
 * a missing or renamed key fails `npm run typecheck`.
 *
 * Style: formal, neutral Indonesian with the polite second person "Anda" and the
 * established air-travel vocabulary (bandara, terminal, gerbang, maskapai).
 * Indonesian does not inflect nouns for number, so counted strings use the noun
 * unchanged ("1 bandara", "12 bandara").
 */
export const id: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Peta Bandara & Terminal',
    description:
      'Jelajahi peta terminal bandara yang disusun berdasarkan negara dan wilayah. Dari hub internasional utama hingga bandara regional, lihat tata letak terperinci gerbang, area check-in, pengambilan bagasi, toko, restoran, lounge, dan transportasi darat.',
    keywords: [
      'peta bandara',
      'peta terminal',
      'denah terminal bandara',
      'gerbang',
      'transportasi bandara',
      'panduan bandara',
    ],
    numberOfItems: (n: number) => `${n} bandara`,
  },

  nav: {
    home: 'Beranda',
    airports: 'Semua bandara',
    countries: 'Berdasarkan negara',
    tools: 'Alat online',
    about: 'Tentang',
    label: 'Navigasi utama',
    languageLabel: 'Bahasa',
    switchLanguage: 'Ganti bahasa',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'Dalam persiapan',
    languagePlannedHint: 'Versi bahasa ini belum diterbitkan.',
    themeToggle: 'Ubah mode gelap',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Iklan',
    skipToContent: 'Langsung ke konten utama',
    backToTop: 'Kembali ke atas',
    breadcrumbLabel: 'Jejak navigasi',
    home: 'Beranda',
    viewMap: 'Lihat peta',
    terminalMap: 'Peta terminal',
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
            counts.gates > 0 ? `, ${counts.gates} gerbang` : ''
          } — Peta Terminal`
        : `${name} (${iata}) — Peta Lokasi & Panduan Bandara ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone
        (it already ends in "Airport"), so H1/title never read "Airport … Airport". */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} — Peta Terminal` : name,
    airportGuide: 'Panduan bandara',
    lastUpdated: 'Baru diperbarui',
    updatedOn: (date: string) => `Diperbarui ${date}`,
    publishedOn: (date: string) => `Diterbitkan ${date}`,
    readMore: 'Baca panduan lengkap',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Terminal',
    gatesFact: 'Gerbang',
    terminals: (n: number) => `${n} terminal`,
    terminalsShort: (n: number) => `${n} terminal`,
    gates: (n: number) => `${n} gerbang`,
    airports: (n: number) => `${n} bandara`,
    airportsChip: (n: number) => `${n} bandara`,
    pax: 'Penumpang',
    paxFull: 'Penumpang tahunan',
    distance: 'Ke pusat kota',
    distanceFrom: (city: string) => `Dari pusat kota ${city}`,
    gatesLabel: (range: string) => `Gerbang ${range}`,
    gatesCount: (n: number) => `${n} gerbang`,
    satellite: 'Concourse satelit',
    airlinesLabel: 'Maskapai utama: ',
  },

  search: {
    ariaLabel: 'Cari bandara',
    placeholder: 'Cari bandara, kota, atau kode IATA',
    heroPlaceholder: 'Cari berdasarkan nama bandara, kota, atau kode IATA — mis. LHR / Dubai / Heathrow',
    submit: 'Cari bandara',
    loading: 'Mencari…',
    empty: 'Tidak ada bandara yang cocok',
    resultsTitle: (term: string) => `Hasil pencarian untuk “${term}”`,
    resultsCount: (n: number) => `Ditemukan ${n} bandara yang cocok.`,
    noResults: 'Tidak ada bandara yang cocok. Coba kata kunci lain, seperti nama kota atau kode IATA.',
    noResultsHint: 'Tidak menemukan bandara yang Anda cari?',
    viewAll: (n: number) => `Jelajahi semua ${n} bandara`,
    orBrowseByCountry: 'jelajahi berdasarkan negara',
    range: (from: number, to: number, total: number) =>
      `Menampilkan ${from}–${to} dari ${total} bandara`,
  },

  hero: {
    eyebrow: 'Direktori Bandara Dunia',
    titleLead: 'Jelajahi bandara dan',
    titleAccent: 'peta terminal',
    sub: 'Temukan jalan Anda di bandara mana pun dengan koleksi lengkap peta bandara dan terminal kami, yang disusun berdasarkan negara dan wilayah — dari hub internasional utama hingga bandara regional.',
    stats: {
      countries: 'Negara / wilayah',
      airports: 'Bandara tercakup',
      terminals: 'Peta terminal',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'Tentang situs ini',
      imageAlt: 'Pesawat penumpang di gerbang terminal bandara berfasad kaca saat matahari terbit',
      blocks: [
        {
          title: 'Navigasi Bandara Mana Pun dengan Peta Terminal yang Terperinci',
          body: 'Bernavigasi di bandara dan terminal di seluruh dunia bisa menjadi tantangan. Peta bandara komprehensif kami menyediakan tata letak terperinci terminal, gerbang, area check-in, pengambilan bagasi, toko, restoran, lounge, dan pusat transportasi, sehingga Anda dapat merencanakan rute sebelum berangkat.',
        },
        {
          title: 'Peta Terminal Bandara Interaktif dan Denah Lantai',
          body: 'Bandara internasional utama memiliki beberapa terminal dan tata letak yang rumit. Peta bandara terperinci kami membantu Anda menemukan gerbang, menemukan fasilitas, merencanakan transit, dan bergerak efisien melalui pos pemeriksaan keamanan, area keberangkatan, dan aula kedatangan — tanpa harus berbalik arah.',
        },
        {
          title: 'Informasi Transportasi dan Akses Bandara',
          body: 'Selain tata letak terminal, panduan bandara kami mencakup pilihan transportasi, informasi parkir, dan rute akses. Temukan cara terbaik untuk mencapai gerbang keberangkatan, berpindah antarterminal, dan menggunakan transportasi darat termasuk kereta, bus, taksi, dan mobil sewaan.',
        },
      ],
    },
    map: {
      kicker: 'Peta Dunia',
      title: 'Peta bandara',
      en: 'Peta Bandara',
      sub: (airports: string, world: string) =>
        `Lokasikan ${world} bandara berjadwal di seluruh dunia — ${airports} di antaranya memiliki peta terminal di sini. Klik titik untuk melihat negara/wilayah dan detailnya.`,
      all: 'Semua',
      gEurope: 'Eropa',
      gAsia: 'Asia',
      gAmericas: 'Amerika',
      gAfrica: 'Afrika',
      gOceania: 'Oseania',
      legendSite: 'Tercakup di sini · klik untuk peta terminal',
      legendWorld: 'Bandara berjadwal lainnya di seluruh dunia',
      countTemplate: '{n} bandara ditampilkan',
      download: 'Unduh data',
      downloadTitle: 'Ekspor setiap bandara dari filter saat ini sebagai CSV (IATA, nama, kota, negara, koordinat)',
      openAirport: 'Lihat bandara',
    },
    popular: {
      kicker: 'Peta Terminal',
      title: 'Peta bandara populer',
      en: 'Peta Bandara',
      sub: 'Pilihan sampul peta terminal dari bandara utama di seluruh dunia — buka halaman bandara untuk peta lengkapnya.',
    },
    recent: {
      kicker: 'Baru Diterbitkan',
      title: 'Baru diperbarui',
      en: 'Baru Diperbarui',
      sub: 'Bandara, negara, dan panduan perjalanan yang baru ditambahkan atau baru direvisi.',
      countriesTitle: 'Negara yang baru diperbarui',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Rute',
      title: 'Peta rute bandara tersibuk',
      en: 'Peta Rute',
      sub: 'Bandara diperingkat berdasarkan jumlah tempat yang dilayani tanpa henti — buka salah satunya untuk peta rute, maskapai, dan daftar tujuan.',
      collection: 'Koleksi rute',
      tabsLabel: 'Peta rute berdasarkan kota',
      explore: (city: string) => `Jelajahi ${city}`,
      play: 'Mulai tayangan slide',
      pause: 'Jeda tayangan slide',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'Foto Terbaru',
      title: 'Foto bandara terbaru',
      en: 'Foto Terbaru',
      sub: 'Foto bandara yang paling baru ditambahkan — enam bandara terbaru, satu foto per bandara.',
      ariaLabel: 'Korsel foto bandara terbaru',
      prev: 'Foto sebelumnya',
      next: 'Foto berikutnya',
      play: 'Mulai tayangan slide',
      pause: 'Jeda tayangan slide',
      counter: (index: number, total: number) => `Foto ${index} dari ${total}`,
      view: (name: string) => `Lihat peta ${name}`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'Buka halaman bandara',
    },
    countries: {
      kicker: 'Berdasarkan Negara',
      title: 'Peta bandara berdasarkan negara',
      en: 'Negara',
      sub: 'Jelajahi peta terminal bandara yang disusun berdasarkan negara dan wilayah, dari hub internasional utama hingga bandara regional.',
      more: 'Semua negara',
    },
    all: {
      kicker: 'Semua Peta',
      title: 'Semua peta bandara',
      en: 'Semua Bandara',
      sub: 'Peta bandara untuk bandara tersibuk dan hub perjalanan di dunia.',
      hint: 'Pilih bandara mana pun untuk melihat tata letak terminalnya.',
      more: 'Lihat semua',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Data Direktori',
      title: 'Data bandara sekilas',
      en: 'Daftar & Tabel',
      sub: 'Angka direktori disajikan sebagai daftar dan tabel: cakupan, bandara tersibuk di antara yang memiliki angka penumpang terbit, dan pembagian menurut wilayah.',
      note: (pax: string, detailed: string, total: string) =>
        `Angka penumpang mencakup ${pax} dari ${total} bandara; angka terminal dan gerbang mencakup ${detailed} dari ${total}. Jumlah terminal mengikuti pengelompokan direktori ini dan dapat mencakup concourse.`,
      coverageTitle: 'Angka cakupan',
      coverage: {
        airports: 'Bandara',
        countries: 'Negara & wilayah',
        regions: 'Wilayah direktori',
        cities: 'Nama kota unik',
        terminals: 'Terminal',
        gates: 'Gerbang',
        routes: 'Bandara dengan peta rute',
      },
      busiest: {
        title: 'Bandara tersibuk berdasarkan penumpang tahunan',
        sub: '12 bandara tersibuk di antara yang memiliki angka penumpang tahunan terbit.',
        caption: 'Bandara dengan angka penumpang tahunan terbit, diperingkat',
        rank: 'Peringkat',
        iata: 'IATA',
        airport: 'Bandara',
        city: 'Kota',
        country: 'Negara',
        terminals: 'Terminal',
        gates: 'Gerbang',
        pax: 'Penumpang tahunan (juta)',
      },
      regions: {
        title: 'Bandara menurut wilayah direktori',
        sub: 'Jumlah bandara, terminal, dan gerbang yang dikelompokkan berdasarkan label wilayah direktori; beberapa negara dan teritori mencakup dua wilayah.',
        caption: 'Jumlah bandara menurut wilayah direktori',
        region: 'Wilayah',
        airports: 'Bandara',
        detailed: 'Dengan data terperinci',
        terminals: 'Terminal',
        gates: 'Gerbang',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Bandara',
    city: 'Kota',
    country: 'Negara',
    size: 'Ukuran',
    map: 'Peta',
    empty: 'Tidak ada bandara yang cocok dengan filter ini. Coba perluas pilihan Anda.',
  },

  pager: {
    label: 'Paginasi',
    previous: 'Halaman sebelumnya',
    next: 'Halaman berikutnya',
  },

  filters: {
    searchPlaceholder: 'Cari bandara, kota, atau kode IATA',
    submit: 'Cari',
    country: 'Negara',
    all: 'Semua',
    sort: 'Urutkan',
    sortPax: 'Penumpang',
    sortName: 'Nama',
    sortIata: 'Kode IATA',
    sortUpdated: 'Terakhir diperbarui',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Semua peta bandara ${country}${sortLabel ? ` — diurutkan berdasarkan ${sortLabel}` : ''}`
        : `Semua peta bandara — diurutkan berdasarkan ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Setiap peta bandara ${country} dalam direktori di satu halaman: tata letak terminal, rentang gerbang, dan transportasi darat${sortLabel ? `, diurutkan berdasarkan ${sortLabel}` : ''}.`
        : `Direktori peta bandara lengkap di satu halaman: tata letak terminal, rentang gerbang, dan transportasi darat${sortLabel ? `, diurutkan berdasarkan ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Jelajahi bandara berdasarkan negara',
    description:
      'Jelajahi direktori peta terminal bandara global berdasarkan negara dan wilayah. Dari hub internasional utama hingga bandara regional, lihat berapa banyak bandara dan terminal di setiap negara.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Dari hub internasional utama hingga bandara regional — ${countries} negara dan wilayah, ${airports} bandara, dan ${terminals} terminal secara total.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} negara · ${airports} bandara`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `Peta Bandara ${name} — Semua ${count} Bandara` : `Peta bandara ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} memiliki ${total} bandara berjadwal; ${count} di antaranya memiliki halaman panduan di sini, lengkap dengan peta persebaran bandara, daftar nasional lengkap, dan rute langsung.`
        : `Peta terminal untuk ${count} bandara di ${name} (${nameEn}), mencakup hub internasional utama dan bandara regional di ${region}. Lihat gerbang, tata letak terminal, dan transportasi darat.`,
    chip: (nameEn: string) => `BANDARA — ${nameEn.toUpperCase()}`,
    kicker: 'Peta Bandara',
    titleOf: (name: string) => `Bandara di ${name}`,
    en: 'Bandara',
    sub: 'Pilih bandara mana pun untuk melihat tata letak terminal, rentang gerbang, dan pilihan transportasi daratnya.',
    empty: 'Belum ada bandara yang terdaftar untuk negara atau wilayah ini.',
    moreKicker: 'Negara Lain',
    moreTitle: 'Jelajahi negara lain',
    moreEn: 'Negara Lainnya',
    all: 'Semua negara',
    notFound: 'Negara tidak ditemukan',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Ringkasan',
    introTitle: (name: string) => `Ringkasan bandara ${name}`,
    introEn: 'Ringkasan Bandara',
    introSub:
      'Skala bandara di negara atau wilayah ini, hub utamanya, dan kota-kota yang dilayaninya.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} terletak di ${o.region}. Situs ini mencakup ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` dan ${o.gates}` : ''} di sana.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) adalah yang terbesar berdasarkan penumpang tahunan, dengan ${o.busiestPax}.`
        : '') +
      ` Bandara-bandara tersebut melayani kota-kota antara lain ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Setiap halaman bandara memuat peta lokasi dan kode bandaranya, ditambah detail terminal, gerbang, dan transportasi darat yang tersusun untuk bandara tersebut.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Persebaran',
      title: (name: string) => `Peta persebaran bandara ${name}`,
      en: 'Persebaran Bandara',
      sub: (covered: string, total: string) =>
        `${total} bandara berjadwal di seluruh negeri (besar, sedang, dan kecil); ${covered} di antaranya memiliki halaman panduan di situs ini. Daftar lengkapnya sebagai berikut.`,
      mapAlt: (name: string, total: string) =>
        `Peta persebaran bandara ${name}: ${total} bandara berjadwal`,
      siteTag: 'Tercakup di sini',
      colAirport: 'Bandara',
      colCity: 'Kota',
      colType: 'Jenis',
      types: {
        large: 'Besar',
        medium: 'Sedang',
        small: 'Kecil',
      },
      empty: 'Daftar bandara nasional belum tersedia.',
    },

    /** Related links */
    linksTitle: 'Tautan terkait',
    linksEn: 'Tautan Terkait',
    linksSub: 'Situs resmi dan entri ensiklopedia untuk negara ini dan setiap bandaranya.',
    linksCountry: (name: string) => `Referensi ${name}`,
    linksAirports: (name: string) => `Bandara di ${name}`,

    faqKicker: 'FAQ',
    faqTitle: 'Pertanyaan yang sering diajukan',
    faqEn: 'Pertanyaan',
    faq: {
      airportTotal: (name: string) => `Berapa banyak bandara di ${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} memiliki ${total} bandara dengan layanan penumpang berjadwal (besar, sedang, dan kecil); situs ini mencakup ${covered} di antaranya secara terperinci. Lihat peta persebaran dan daftar lengkap di atas.`,
      airportCount: (name: string) => `Bandara mana saja yang tercakup di ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Situs ini mencakup ${count} bandara di ${name}: ${list}.`,
      busiest: (name: string) => `Bandara mana yang tersibuk di ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Berdasarkan penumpang tahunan, ${busiest} (${iata}) adalah yang terbesar di antara bandara yang tercakup di sini, dengan ${pax}.`,
      terminals: (name: string) => `Berapa banyak terminal yang dimiliki bandara di ${name}?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Bandara yang tercakup di ${name} memiliki ${terminals} dengan total ${gates}: ${list}.`,
      cities: (name: string) => `Kota mana saja di ${name} yang memiliki bandara?`,
      citiesAnswer: (name: string, cities: string) =>
        `Bandara ${name} yang tercakup di sini melayani kota-kota antara lain ${cities}. Anda dapat memfilternya berdasarkan kota atau kode IATA di direktori bandara.`,
      maps: (name: string) => `Apakah bandara di ${name} memiliki peta terminal?`,
      mapsAnswer: (name: string, count: string) =>
        `Sebagian. Halaman bandara memuat peta lokasi, kode bandara, dan rute langsung, dan ${count} bandara yang tercakup di ${name} menampilkan diagram tata letak terminal, rentang gerbang, dan transportasi darat di mana pun detail tersebut tersedia. Buka bandara mana pun untuk melihat isinya.`,
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
        ? `${o.name} (${o.iata}) memiliki ${o.terminals} terminal${
            o.gates ? ` dengan ${o.gates} gerbang` : ''
          }${
            o.pax ? `, melayani ${o.pax} penumpang per tahun` : ''
          }${
            o.distance ? `, ${o.distance} dari pusat kota` : ''
          }. Peta terminal yang menampilkan semua terminal, rentang gerbang, dan transportasi darat.`
        : `${o.name} (${o.iata}) melayani ${o.city}, ${o.country}. Peta lokasi, kode bandara, dan informasi perjalanan.`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'bandara';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) adalah ${kind} yang melayani ${where}`;
      return o.terminals > 0
        ? `${head}, dengan ${o.terminals} terminal${
            o.gates > 0 ? ` dan ${o.gates} gerbang` : ''
          }${
            o.distance ? `, sekitar ${o.distance} dari pusat kota ${o.city}` : ''
          }.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Tata letak terminal`,
    mapNote: 'TATA LETAK TERMINAL',
    realMapTitle: (iata: string) => `Peta Terminal Bandara ${iata} — Gerbang & Navigasi`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Peta terminal ${name} (${iata}) yang menampilkan semua terminal, rentang gerbang, dan concourse`,
    realMapNote: 'PETA TERMINAL',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Foto',
    photosTitle: 'Foto bandara',
    photosEn: 'Foto Bandara',
    photosSub:
      'Foto asli bandara ini, masing-masing dikreditkan ke halaman web publik tempat foto ditemukan; hak cipta tetap milik fotografer aslinya. Klik foto untuk memperbesar, atau baris kredit untuk membuka halaman sumbernya.',
    photosCredit: (host: string) => `Sumber: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Foto bandara ${index} ${name} (${iata})`,
    photosZoom: (name: string, index: number) => `Perbesar foto ${index} dari ${name}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Perbesar',
    zoomClose: 'Tutup',
    zoomIn: 'Perbesar',
    zoomOut: 'Perkecil',
    downloadKicker: 'Unduh',
    downloadTitle: 'Unduh Peta Bandara',
    downloadEn: 'Unduhan',
    downloadMapLabel: (year: number, iata: string) =>
      `Unduhan Peta Terminal & Denah Lantai Bandara ${iata} Terbaru ${year}`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Unduhan PDF Peta Terminal Bandara ${iata} Terbaru ${year}`,
    timeKicker: 'Waktu',
    timeTitle: (iata: string) => `Informasi waktu bandara — waktu saat ini di ${iata}`,
    timeEn: 'Waktu Bandara',
    timeSub: (iata: string, tz: string) => `Waktu saat ini di ${iata} (${tz}) dibandingkan dengan waktu lokal Anda.`,
    clockAirport: 'Waktu saat ini di bandara',
    clockLocal: 'Waktu lokal Anda',
    infoKicker: 'Info',
    infoTitle: 'Informasi & detail bandara',
    infoEn: 'Detail Bandara',
    infoIata: 'Kode IATA bandara',
    infoLocation: 'Lokasi bandara',
    infoCoords: 'Koordinat',
    infoTimezone: 'Zona waktu',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Tautan',
    linksTitle: 'Tautan terkait',
    linksEn: 'TAUTAN TERKAIT',
    linksSub: 'Referensi eksternal untuk bandara ini: situs resmi, Wikipedia, dan Baidu Baike.',
    officialSite: 'Situs resmi',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Sumber: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Data terbuka OurAirports',
    sourcesNote:
      'Kode bandara, koordinat, dan kelas bandara disusun dari data terbuka; detail halaman mengikuti publikasi resmi masing-masing bandara.',
    mapEmbedKicker: 'Peta',
    mapEmbedTitle: (name: string) => `Peta interaktif — lokasi ${name}`,
    mapEmbedEn: 'Peta Interaktif',
    extMapsNote: 'Lihat bandara ini di layanan peta lain:',
    routeMapKicker: 'Rute',
    routeMapTitle: (name: string) => `Peta rute ${name} — tujuan langsung`,
    routeMapEn: 'Peta Rute',
    routeMapAria: (name: string) => `Peta rute langsung dari ${name}`,
    routeLegendTitle: 'Keterangan warna',
    routeLegendClose: 'Sembunyikan keterangan',
    routeReset: 'Atur ulang peta',
    routeZoomIn: 'Perbesar',
    routeZoomOut: 'Perkecil',
    routeFullscreen: 'Lihat layar penuh',
    routeExitFullscreen: 'Keluar dari layar penuh',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Buka halaman bandara {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6+ maskapai',
      major: '3–5 maskapai',
      minor: '2 maskapai',
      single: '1 maskapai',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} maskapai',
    routeTableDest: 'Tujuan',
    routeTableCountry: 'Negara/wilayah',
    routeTableDistance: 'Jarak',
    routeTableCarriers: 'Maskapai',
    routeCarriersMore: (n: number) => ` +${n} lainnya`,
    routeMapNote: (date: string) =>
      `Cuplikan data rute: ${date}; hanya penerbangan langsung. Sumber: `,
    legendTerminal: 'Gedung terminal',
    legendTransit: 'Simpul transportasi darat',
    legendCorridor: 'Penghubung antarterminal',
    terminalsKicker: 'Terminal',
    terminalsTitle: 'Panduan terminal',
    terminalsEn: 'Panduan Terminal',
    terminalsSub: (name: string) =>
      `Rentang gerbang, maskapai utama, dan fasilitas untuk setiap terminal di ${name}.`,
    transitTitle: 'Transportasi darat',
    facilitiesTitle: 'Fasilitas bandara',
    faqKicker: 'FAQ',
    faqTitle: 'Pertanyaan yang sering diajukan',
    faqEn: 'Pertanyaan',
    guideKicker: 'Panduan',
    guideTitle: 'Panduan bandara',
    guideEn: 'Panduan Bandara',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'Artikel',
    blogTitle: (iata: string) => `Panduan bandara ${iata}`,
    blogEn: 'Dari Blog',
    blogSub: (iata: string, count: number) =>
      `${count} artikel di situs ini membahas ${iata}: kedatangan, transportasi darat, bagasi, dan transit.`,
    blogAll: 'Semua artikel',
    relatedTitle: (country: string) => `Bandara lain di ${country}`,
    relatedEn: (country: string) => `Lainnya di ${country}`,
    relatedAll: (country: string) => `Semua bandara di ${country}`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'Penerbangan',
      title: (name: string) => `Penerbangan ${name} — keberangkatan & kedatangan`,
      en: 'Papan Penerbangan',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${flights} nomor penerbangan dari ${airlines} maskapai dan ${destinations} tujuan, dipisahkan menurut arah. Nomor codeshare disertakan.`,
      statDepartures: 'Nomor penerbangan keberangkatan',
      statArrivals: 'Nomor penerbangan kedatangan',
      statAirlines: 'Maskapai',
      statDestinations: 'Tujuan',
      note: (date: string) =>
        `Nomor penerbangan dan rute dari indeks penerbangan aviability.com (cuplikan ${date}); nomor codeshare disertakan dan waktu keberangkatan tidak ditampilkan. Sumber: `,
      source: 'aviability.com',
      tabDepartures: 'Keberangkatan',
      tabArrivals: 'Kedatangan',
      search: 'Cari nomor penerbangan, maskapai, atau kota',
      clearSearch: 'Hapus pencarian',
      flight: 'Penerbangan',
      airline: 'Maskapai',
      destination: 'Tujuan',
      origin: 'Asal',
      country: 'Negara/wilayah',
      empty: 'Tidak ada penerbangan yang cocok dengan pencarian ini.',
      loading: 'Memuat penerbangan…',
      error: 'Tidak dapat memuat lebih banyak penerbangan.',
      retry: 'Coba lagi',
      previous: 'Sebelumnya',
      next: 'Berikutnya',
      pagination: 'Paginasi',
      showing: 'Menampilkan {from}–{to} dari {total} nomor penerbangan',
      pageOf: 'Halaman {page} dari {pages}',
    },
    notFound: 'Bandara tidak ditemukan',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Peta Rute ${name} (${iata}) Terbaru ${year} — ${count} Tujuan Langsung`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Peta rute langsung untuk ${name} (${iata}): ${count} tujuan dengan maskapai yang beroperasi dan jaraknya, plus daftar tujuan lengkap.`,
    heading: (name: string) => `Peta rute ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} memiliki ${count} tujuan langsung, diwarnai berdasarkan jumlah maskapai yang melayani masing-masing tujuan.`,
    backToAirport: (iata: string) => `Kembali ke halaman bandara ${iata}`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `Nomor penerbangan ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Lihat peta rute',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Lihat peta rute ${iata} lengkap`,
    teaserSub: (count: string) => `${count} tujuan langsung: peta, maskapai yang beroperasi, dan jarak.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `Peta rute langsung ${name}`,
    tableKicker: (iata: string) => `${iata} · Tujuan`,
    tableSectionTitle: (name: string) => `Daftar tujuan langsung ${name}`,
    tableSectionEn: (iata: string) => `Tujuan ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Tujuan',
    tableSectionSub: (count: string) =>
      `${count} tujuan, tersibuk lebih dulu berdasarkan jumlah maskapai yang beroperasi, beserta jarak dan maskapai.`,
    dataKicker: 'Unduh',
    dataTitle: 'Unduhan data rute',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} rute langsung dengan tujuan, kode IATA, kota, negara, jarak, dan maskapai yang beroperasi — siap untuk spreadsheet atau skrip.`,
    dataFields: 'CSV cocok untuk Excel / Numbers, JSON cocok untuk kode; keduanya UTF-8.',
    dataCsv: 'Unduh CSV',
    dataJson: 'Unduh JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Tata letak terminal dan gerbang sekilas — klik gambar untuk peta lengkap, fasilitas terminal, dan transportasi darat di halaman bandara.',
    airportMapCta: (iata: string) => `Lihat peta terminal ${iata} lengkap`,
    /** Header fact cells. */
    factDestinations: 'Tujuan langsung',
    factAirlines: 'Maskapai',
    factCountries: 'Negara',
    factSnapshot: 'Cuplikan data',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `Berapa banyak tempat yang dilayani ${name} tanpa henti?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) memiliki ${count} tujuan langsung di ${countries} negara dan wilayah. Hanya rute tanpa henti yang dihitung; itinerari dengan persinggahan tidak termasuk.`,
    faqAirlinesQ: (name: string) => `Berapa banyak maskapai yang terbang dari ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} maskapai mengoperasikan rute langsung dari bandara ini. Jaringan terluas adalah ${leaders} (jumlah tujuan dalam tanda kurung).`,
    faqFarthestQ: (name: string) => `Apa tujuan tanpa henti terjauh dari ${name}?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Tujuan langsung terjauh adalah ${city}, ${country} ${iata}, sekitar ${km} km.`,
    faqBusiestQ: () => 'Tujuan mana yang memiliki persaingan paling ketat?',
    faqBusiestA: (count: string, list: string) =>
      `${count} tujuan dilayani oleh tiga maskapai atau lebih; yang tersibuk adalah ${list}.`,
    faqSourceQ: () => 'Seberapa sering data rute diperbarui?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Rute di halaman ini berasal dari dataset terbuka ${source} (${license}), cuplikan tanggal ${date}, bukan jadwal langsung — periksa maskapai atau bandara untuk tiket dan waktu.`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `Penerbangan ${number} ${airline} — ${from} ke ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Penerbangan ${number} adalah nomor penerbangan yang digunakan ${airline} dari ${from} ke ${to}${distance ? `, sekitar ${distance}` : ''}. Peta rute, bandara keberangkatan dan kedatangan, jarak, dan penerbangan lain pada rute ini.`,
    heading: (number: string) => `Penerbangan ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Penerbangan ${number} adalah nomor penerbangan yang digunakan ${airline} antara ${from} dan ${to}${distance ? `, dengan jarak lingkaran besar sekitar ${distance}` : ''}.`,
    factFlight: 'Nomor penerbangan',
    factFrom: 'Dari',
    factTo: 'Ke',
    factDistance: 'Jarak',
    overviewKicker: 'Ringkasan',
    overviewTitle: (number: string) => `Tentang penerbangan ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} adalah nomor penerbangan yang digunakan ${airline} antara ${originName} (${originIata}) dan ${destName} (${destIata})${distance ? `, berjarak sekitar ${distance}` : ''}. Halaman ini mengumpulkan nomor penerbangan, maskapai, rute, dan kedua bandara untuk pencarian cepat.`,
    overviewNote:
      'Indeks penerbangan tidak mencakup waktu keberangkatan atau kedatangan, pesawat, maupun tanggal operasi; konfirmasikan jadwal, check-in, dan waktu boarding dengan maskapai atau bandara.',
    routeKicker: 'Rute',
    routeTitle: (from: string, to: string) => `Rute ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Diagram rute untuk penerbangan ${number}`,
    routeMapAria: (number: string) => `Peta rute untuk penerbangan ${number}`,
    airportsKicker: 'Bandara',
    airportsTitle: 'Bandara keberangkatan dan kedatangan',
    airportsSub:
      'Bandara yang dihubungkan oleh penerbangan ini. Bandara yang tercakup dalam direktori akan membuka halamannya sendiri.',
    originAirport: 'Bandara keberangkatan',
    destinationAirport: 'Bandara kedatangan',
    airportPage: 'Buka halaman bandara',
    detailsKicker: 'Detail',
    detailsTitle: 'Detail penerbangan',
    detailsFlight: 'Nomor penerbangan',
    detailsAirline: 'Maskapai',
    detailsOrigin: 'Bandara keberangkatan',
    detailsDestination: 'Bandara kedatangan',
    detailsDistance: 'Jarak lingkaran besar',
    detailsRoutes: 'Rute terdaftar',
    detailsSnapshot: 'Cuplikan data',
    routesKicker: 'Rute',
    routesTitle: 'Rute dengan nomor penerbangan ini',
    routesSub: (count: string) =>
      `Nomor ini muncul pada ${count} rute; satu nomor dapat digunakan kembali oleh mitra codeshare.`,
    routesRoute: 'Rute',
    routesAirline: 'Maskapai',
    routesDistance: 'Jarak',
    relatedKicker: 'Terkait',
    relatedTitle: 'Penerbangan lain pada rute ini',
    relatedSub: 'Nomor penerbangan lain antara bandara keberangkatan dan kedatangan yang sama.',
    relatedEn: 'Penerbangan Lainnya',
    faqKicker: 'FAQ',
    faqTitle: 'Pertanyaan yang sering diajukan',
    faqEn: 'Pertanyaan',
    faqWhat: (number: string) => `Apa itu penerbangan ${number}?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Penerbangan ${number} adalah nomor penerbangan yang digunakan ${airline} pada rute ${from} → ${to}${distance ? `, berjarak sekitar ${distance}` : ''}.`,
    faqRoute: (number: string) => `Ke mana penerbangan ${number} terbang?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Penerbangan ${number} terbang dari ${originName} (${originIata}) ke ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Di mana saya dapat melihat waktu keberangkatan dan kedatangan untuk ${number}?`,
    faqTimesAnswer: (number: string) =>
      `Halaman ini mencakup nomor penerbangan, maskapai, rute, dan bandara untuk ${number}. Indeks penerbangan aviability.com tidak mencakup waktu keberangkatan atau kedatangan — periksa maskapai atau bandara untuk jadwal terkini.`,
    note: (date: string) =>
      `Nomor penerbangan, maskapai, dan rute dari indeks penerbangan aviability.com (cuplikan ${date}); waktu keberangkatan dan kedatangan tidak disertakan. Sumber: `,
    source: 'aviability.com',
    sourceFlight: 'Lihat di aviability.com',
    viewAirport: (iata: string) => `Buka halaman bandara ${iata}`,
    notFound: 'Penerbangan tidak ditemukan',
  },

  faq: {
    terminalCount: (name: string) => `Berapa banyak terminal yang dimiliki ${name}?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) memiliki ${terminals} terminal dengan total ${gates} gerbang: ${list}.`,
    gateCount: (name: string) => `Berapa banyak gerbang yang dimiliki ${name}?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) memiliki total ${gates} gerbang: ${list}.`,
    whereIs: (iata: string) => `Di mana ${iata}?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} adalah kode IATA untuk ${name} (${nameEn}), yang terletak di ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `Seberapa jauh ${name} dari pusat kota ${city}?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} berjarak sekitar ${distance} dari pusat kota ${city}. Anda dapat mencapai kota dengan ${transit}.`,
    access: (name: string, city: string) => `Bagaimana cara saya pergi dari ${name} ke ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `Fasilitas apa yang ditawarkan ${name}?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} menawarkan ${facilities}. Lihat tata letak terminal di atas untuk mengetahui bagaimana fasilitas ini tersebar antarterminal.`,
    location: (name: string) => `Di mana ${name} berada?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, kode IATA ${iata}) terletak di ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Maskapai mana yang beroperasi dari setiap terminal di ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Maskapai utama berdasarkan terminal di ${name}: ${list}. Maskapai dan penugasan gerbang dapat berubah, jadi selalu konfirmasi pada boarding pass Anda dan papan petunjuk bandara.`,
    timezone: (name: string) => `Zona waktu apa yang digunakan ${name}?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) berada di zona waktu ${tz}. Bandingkan dengan waktu lokal Anda menggunakan jam bandara di atas.`,
    flightsCount: (name: string) => `Berapa banyak nomor penerbangan yang terdaftar di ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Indeks penerbangan aviability.com mencantumkan ${departures} nomor penerbangan keberangkatan dan ${arrivals} nomor penerbangan kedatangan untuk ${name} (${iata}), mencakup ${airlines} maskapai dan ${destinations} tujuan (cuplikan ${date}). Nomor codeshare disertakan, dan jadwal dapat berubah — konfirmasikan dengan maskapai sebelum bepergian.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Tim Editorial World Airport Maps',
    role: 'Disusun & ditinjau oleh ',
    sourcesNote: 'Disusun dari sumber publik dan informasi resmi bandara',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'Di halaman ini',
    map: 'Peta terminal',
    photos: 'Foto bandara',
    time: 'Waktu bandara',
    details: 'Detail bandara',
    links: 'Tautan terkait',
    location: 'Peta lokasi',
    routes: 'Peta rute',
    flights: 'Penerbangan',
    guide: 'Panduan bandara',
    blog: 'Panduan terkait',
    terminals: 'Panduan terminal',
    transport: 'Transportasi darat',
    facilities: 'Fasilitas',
    faq: 'FAQ',
    flightOverview: 'Ringkasan penerbangan',
    flightRoute: 'Rute',
    flightAirports: 'Bandara',
    flightDetails: 'Detail penerbangan',
    flightRoutes: 'Semua rute',
    flightRelated: 'Penerbangan terkait',
    intro: 'Ringkasan bandara',
    distribution: 'Persebaran bandara',
    airports: 'Daftar bandara',
  },

  error: {
    title: 'Halaman ini tidak dapat dimuat',
    sub: 'Terjadi kesalahan saat membaca data bandara. Silakan coba lagi, atau kembali ke beranda untuk terus menjelajah.',
    retry: 'Coba lagi',
    backHome: 'Kembali ke beranda',
    notFoundTitle: '404 · Halaman tidak ditemukan',
    notFoundSub: 'Halaman yang Anda minta mungkin telah dipindahkan atau dihapus. Coba cari bandara, atau lanjutkan dari tautan di bawah.',
  },

  footer: {
    sponsored: 'Disponsori',
    mapsTitle: 'Peta terminal yang terperinci',
    mapsBody:
      'Bernavigasi di bandara dan terminalnya bisa menjadi tantangan. Peta bandara kami menampilkan tata letak terperinci terminal, gerbang, area check-in, pengambilan bagasi, toko, restoran, lounge, dan simpul transportasi agar perjalanan Anda berjalan lebih lancar.',
    plansTitle: 'Denah terminal interaktif',
    plansBody:
      'Bandara internasional utama memiliki beberapa terminal dan tata letak yang rumit. Peta terperinci kami membantu Anda menemukan gerbang, menemukan fasilitas, merencanakan transit, dan bergerak efisien melalui keamanan, keberangkatan, dan kedatangan.',
    transitTitle: 'Transportasi dan akses bandara',
    transitBody:
      'Selain tata letak terminal, kami juga membahas pilihan transportasi, parkir, dan rute akses — cara mencapai gerbang, berpindah antarterminal, dan menggunakan transportasi darat termasuk kereta, bus, taksi, dan sewa mobil.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} negara / wilayah · ${airports} bandara · ${terminals} terminal · tata letak terminal bergambar`,
    fallback: 'Tata letak terminal bergambar dan panduan transportasi darat untuk bandara di seluruh dunia',
    linksLabel: 'Navigasi footer',
    about: 'Tentang',
    contact: 'Kontak',
    sources: 'Sumber data',
    privacy: 'Kebijakan privasi',
    disclaimer: 'Penafian',
    terms: 'Syarat penggunaan',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: idTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Jelajahi',
    title: 'Jelajahi berdasarkan area',
    en: 'Jelajahi berdasarkan area',
    sub: 'Masuki direktori dari sudut mana pun yang sesuai untuk Anda: berdasarkan negara, wilayah, kota — atau langsung ke hub tersibuk, pembaruan terbaru, dan panduan bandara.',
    allAirports: {
      title: 'Semua bandara',
      body: 'Direktori lengkap, diperingkat berdasarkan volume penumpang, dapat difilter berdasarkan negara dan diurutkan ulang.',
    },
    byCountry: {
      title: 'Berdasarkan negara',
      body: 'Lihat berapa banyak bandara, terminal, dan gerbang di setiap negara atau wilayah.',
    },
    byRegion: {
      title: 'Berdasarkan wilayah',
      body: 'Negara dikelompokkan ke Asia Timur, Eropa, Amerika Utara, dan lainnya, agar lebih mudah menemukan yang Anda butuhkan.',
    },
    popularCities: {
      title: 'Kota populer',
      body: 'Kota bandara tersibuk berdasarkan total penumpang tahunan, dan setiap bandara di masing-masing kota.',
    },
    recentlyUpdated: {
      title: 'Baru diperbarui',
      body: 'Catatan bandara yang baru ditambahkan dan baru direvisi, yang terbaru lebih dulu.',
    },
    guides: {
      title: 'Panduan bandara',
      body: 'Panduan panjang tentang transit terminal, cara masuk ke kota, dan tips praktis.',
    },
    routes: {
      title: 'Peta rute',
      body: 'Lihat jaringan tanpa henti sebuah bandara, diperingkat berdasarkan jumlah tujuan, beserta maskapai dan jaraknya.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Panduan',
    title: 'Panduan bandara',
    en: 'Panduan bandara',
    sub: 'Selain diagram terminal, kami telah menulis panduan panjang untuk hub tertentu: cara membaca penomoran gerbang, cara berpindah antarterminal, dan cara masuk ke kota.',
    more: 'Lihat bandara ini',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the English
   * wording of the same UI.
   */
  blog: {
    kicker: 'Jurnal',
    title: 'Catatan perjalanan',
    nav: 'Blog',
    en: 'Catatan perjalanan',
    sub: 'Catatan panjang dari meja redaksi kami: kedatangan dan imigrasi, transit, fasilitas terminal, dan tempat beristirahat.',
    more: 'Baca',
    all: 'Semua artikel',
    morePosts: 'Artikel lainnya',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'Bandara',
    airportsTitle: 'Bandara dalam artikel ini',
    airportsEn: 'Bandara yang Dibahas',
    airportsSub: 'Buka halaman bandara untuk peta terminal, transportasi darat, dan FAQ-nya.',
    back: 'Kembali ke daftar artikel',
    empty: 'Belum ada artikel.',
    readingMinutes: (n: number) => `${n} menit baca`,
    source: (name: string) => `Sumber: ${name}`,
    tags: 'Tag',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'Komentar',
    title: 'Komentar pembaca',
    en: 'Diskusi',
    sub: 'Pertanyaan, laporan perjalanan, dan koreksi sangat kami harapkan. Komentar bersifat publik.',
    formTitle: 'Tinggalkan komentar',
    countOne: '1 komentar',
    countMany: '{n} komentar',
    empty: 'Belum ada komentar — jadilah yang pertama menulis.',
    loading: 'Memuat komentar…',
    loadError: 'Komentar tidak tersedia saat ini.',
    retry: 'Coba lagi',
    nameLabel: 'Nama',
    namePlaceholder: 'Bagaimana kami harus menyapa Anda?',
    bodyLabel: 'Komentar',
    bodyPlaceholder: 'Bagikan pengalaman Anda, ajukan pertanyaan, atau tambahkan konteks…',
    submit: 'Kirim komentar',
    submitting: 'Mengirim…',
    success: 'Terkirim — terima kasih telah berbagi.',
    error: 'Komentar Anda tidak dapat dikirim. Silakan coba lagi nanti.',
    rateLimited: 'Terlalu cepat mengirim. Tunggu beberapa menit dan coba lagi.',
    nameError: 'Masukkan nama (2–40 karakter).',
    bodyError: 'Tulis komentar (5–2000 karakter).',
    note: 'Komentar bersifat publik dan mencerminkan pandangan penulisnya sendiri. Mohon tetap sopan dan jangan mengirim iklan atau informasi pribadi.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Diagram tata letak terminal untuk ${name}`,
    gates: 'Gerbang',
    terminal: 'Terminal',
    corridor: 'Penghubung',
    transit: 'Transportasi darat',
    footer: (iata: string) => `${iata} · Tata letak terminal`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Alat online',
    hub: {
      kicker: 'Alat',
      title: 'Alat peta dan koordinat',
      en: 'Alat Gratis',
      sub: 'Alat online gratis untuk pelancong dan pecinta geografi — buka di browser, tanpa perlu instalasi.',
      description:
        'Alat peta dan koordinat online gratis: konversi koordinat WGS84 / GCJ02 / BD09, format derajat desimal ↔ DMS, dan jarak lingkaran besar antara dua titik. Dwibahasa, siap di browser Anda.',
      comingTitle: 'Lebih banyak alat sedang dikembangkan',
      comingSub: 'Pemilih koordinat, berbagi lokasi, dan kalkulator proyeksi akan segera hadir.',
    },
    howTitle: 'Cara menggunakan',
    relatedTitle: 'Alat terkait',
    allTools: 'Semua alat',
    tools: {
      coordinateConverter: {
        title: 'Konverter koordinat',
        en: 'Konverter Koordinat',
        description:
          'Konversi antara WGS84, GCJ02, dan BD09 — solusi untuk masalah pergeseran peta Tiongkok.',
        note: 'WGS84 adalah standar GPS dan internasional. GCJ02 adalah sistem koordinat tergeser yang diwajibkan di Tiongkok daratan (dijuluki “koordinat Mars”), digunakan oleh AMap dan Tencent Maps. BD09 menambahkan pergeseran lebih lanjut di atas GCJ02 dan digunakan oleh Baidu Maps. Titik yang sama dapat berbeda 100–700 m antarsistem, jadi konversikan sebelum menggunakan kembali koordinat di layanan peta lain.',
        steps: [
          'Masukkan koordinat desimal sebagai lintang, bujur — mis. 39.9042, 116.4074.',
          'Pilih sistem koordinat yang digunakan input Anda.',
          'Tekan “Konversi” untuk mendapatkan dua sistem lainnya; gunakan “Salin” untuk menyimpan hasil.',
        ],
        inputLabel: 'Koordinat (lintang, bujur)',
        inputPlaceholder: 'mis. 39.9042, 116.4074',
        sourceLabel: 'Sistem koordinat input',
        wgs84: 'WGS84 · GPS / internasional',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Jumlah desimal',
        submit: 'Konversi',
        copy: 'Salin',
        copied: 'Disalin',
        error: 'Koordinat tidak dapat diurai. Gunakan format “lintang, bujur”, mis. 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Konverter format koordinat',
        en: 'Konverter Format Koordinat',
        description:
          'Konversi antara derajat desimal (DD), derajat-menit (DM), dan derajat-menit-detik (DMS); format input dideteksi secara otomatis.',
        note: 'DD (39.9042°) adalah gaya desimal biasa yang digunakan perangkat dan API; DMS (39°54′15″N) umum dalam pelayaran, penerbangan, dan survei; DM (39°54.25′N) lazim untuk catatan lapangan. Alat ini mendeteksi format input dari jumlah kelompok angka di setiap bagian (1 = DD, 2 = DM, 3 = DMS) dan menampilkan ketiga gaya, dengan N/S/E/W untuk belahan bumi.',
        steps: [
          'Masukkan sepasang koordinat — gaya 39.9042, 39°54′15″N, dan 39°32.5′E semuanya berfungsi; pisahkan kedua bagian dengan koma.',
          'Pilih jumlah tempat desimal untuk output.',
          'Tekan “Konversi” — ketiga format ditampilkan; gunakan “Salin” untuk menyimpan salah satunya.',
        ],
        inputLabel: 'Koordinat (satu pasang, dipisahkan koma)',
        inputPlaceholder: 'mis. 39°54′15″N, 116°24′51″E atau 39.9042, 116.4074',
        precisionLabel: 'Jumlah desimal',
        submit: 'Konversi',
        ddLabel: 'Derajat desimal (DD)',
        dmLabel: 'Derajat-menit (DM)',
        dmsLabel: 'Derajat-menit-detik (DMS)',
        copy: 'Salin',
        copied: 'Disalin',
        error: 'Koordinat tidak dapat diurai. Gaya yang didukung antara lain 39.9042, 39°54′15″N, dan 39°32.5′E, dipisahkan dengan koma.',
      },
      distanceCalculator: {
        title: 'Kalkulator jarak',
        en: 'Kalkulator Jarak',
        description:
          'Jarak lingkaran besar antara dua titik di Bumi, plus arah awal.',
        note: 'Jarak menggunakan rumus lingkaran besar Haversine (radius rata-rata Bumi 6.371,0088 km) — jalur terpendek di sepanjang permukaan. Arah awal adalah arah kompas dari titik pertama menuju titik kedua, 0° di utara dan bertambah searah jarum jam.',
        steps: [
          'Masukkan lintang dan bujur titik awal dan akhir.',
          'Tekan “Hitung jarak”.',
          'Dapatkan hasil dalam kilometer, mil, dan mil laut, plus arah awal.',
        ],
        fromLabel: 'Dari',
        toLabel: 'Ke',
        inputPlaceholder: 'lintang, bujur',
        example: 'Contoh: Beijing → Shanghai',
        submit: 'Hitung jarak',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: 'Arah awal',
        copy: 'Salin',
        copied: 'Disalin',
        error: 'Koordinat tidak dapat diurai. Gunakan format “lintang, bujur” dengan lintang -90–90 dan bujur -180–180.',
      },
    },
  },
};
