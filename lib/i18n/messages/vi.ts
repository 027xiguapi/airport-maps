import type { Messages } from './zh';
import { viTransportModes } from '../vi-data';

/**
 * Vietnamese catalog. Typed against the Chinese source of truth (`Messages`), so
 * a missing or renamed key fails `npm run typecheck`.
 *
 * Style: natural traveller-facing Vietnamese, second person "bạn", sentence
 * case for headings and labels. Vietnamese does not inflect for number, so the
 * plural helper keeps its signature but both forms are the same word. Airport
 * names, IATA/ICAO codes, URLs and airline names stay in their international
 * form.
 */

/** "1 số hiệu chuyến bay" / "2 số hiệu chuyến bay" — Vietnamese has no plural. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'sân bay lớn',
  medium: 'sân bay trung bình',
  small: 'sân bay nhỏ',
  heliport: 'sân bay trực thăng',
} as const;

export const vi: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'Bản đồ sân bay và nhà ga',
    description:
      'Duyệt bản đồ nhà ga sân bay theo quốc gia và khu vực. Từ các trung tâm quốc tế lớn đến sân bay khu vực, xem sơ đồ chi tiết của cổng, khu check-in, nhận hành lý, cửa hàng, nhà hàng, phòng chờ và giao thông mặt đất.',
    keywords: [
      'bản đồ sân bay',
      'bản đồ nhà ga',
      'sơ đồ nhà ga sân bay',
      'cổng',
      'giao thông sân bay',
      'hướng dẫn sân bay',
    ],
    numberOfItems: (n: number) => `${n} sân bay`,
  },

  nav: {
    home: 'Trang chủ',
    airports: 'Tất cả sân bay',
    countries: 'Theo quốc gia',
    tools: 'Công cụ trực tuyến',
    about: 'Giới thiệu',
    label: 'Điều hướng chính',
    languageLabel: 'Ngôn ngữ',
    switchLanguage: 'Chuyển ngôn ngữ',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'Đang chuẩn bị',
    languagePlannedHint: 'Phiên bản ngôn ngữ này chưa được phát hành.',
    themeToggle: 'Bật/tắt chế độ tối',
    menu: 'Menu',
  },

  common: {
    advertisement: 'Quảng cáo',
    skipToContent: 'Chuyển đến nội dung chính',
    backToTop: 'Về đầu trang',
    breadcrumbLabel: 'Đường dẫn',
    home: 'Trang chủ',
    viewMap: 'Xem bản đồ',
    terminalMap: 'Bản đồ nhà ga',
    /** Accessible iframe title on the ad slots (components/ads/). */
    /**
     * Airport page <title>/og:title. Airports with compiled data lead with the
     * counts Google is asked for; directory airports without terminal data get
     * an honest location-map title.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} nhà ga${
            counts.gates > 0 ? `, ${counts.gates} cổng` : ''
          } — Bản đồ nhà ga`
        : `${name} (${iata}) — Bản đồ vị trí & Hướng dẫn sân bay ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone. */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `Bản đồ nhà ga ${name}` : name,
    airportGuide: 'Hướng dẫn sân bay',
    lastUpdated: 'Mới cập nhật',
    updatedOn: (date: string) => `Cập nhật ${date}`,
    publishedOn: (date: string) => `Đăng ${date}`,
    readMore: 'Đọc hướng dẫn đầy đủ',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'Nhà ga',
    gatesFact: 'Cổng',
    terminals: (n: number) => `${n} nhà ga`,
    terminalsShort: (n: number) => `${n} nhà ga`,
    gates: (n: number) => `${n} cổng`,
    airports: (n: number) => `${n} sân bay`,
    airportsChip: (n: number) => `${n} sân bay`,
    pax: 'Hành khách',
    paxFull: 'Hành khách hằng năm',
    distance: 'Đến trung tâm thành phố',
    distanceFrom: (city: string) => `Từ trung tâm ${city}`,
    gatesLabel: (range: string) => `Cổng ${range}`,
    gatesCount: (n: number) => `${n} cổng`,
    satellite: 'Nhà ga vệ tinh',
    airlinesLabel: 'Hãng hàng không chính: ',
  },

  search: {
    ariaLabel: 'Tìm kiếm sân bay',
    placeholder: 'Tìm sân bay, thành phố hoặc mã IATA',
    heroPlaceholder: 'Tìm theo tên sân bay, thành phố hoặc mã IATA — ví dụ: LHR / Dubai / Heathrow',
    submit: 'Tìm sân bay',
    loading: 'Đang tìm kiếm…',
    empty: 'Không tìm thấy sân bay phù hợp',
    resultsTitle: (term: string) => `Kết quả tìm kiếm cho “${term}”`,
    resultsCount: (n: number) => `Tìm thấy ${n} sân bay phù hợp.`,
    noResults: 'Không có sân bay nào phù hợp. Hãy thử từ khóa khác, chẳng hạn tên thành phố hoặc mã IATA.',
    noResultsHint: 'Không tìm thấy sân bay bạn muốn?',
    viewAll: (n: number) => `Xem tất cả ${n} sân bay`,
    orBrowseByCountry: 'hoặc duyệt theo quốc gia',
    range: (from: number, to: number, total: number) =>
      `Hiển thị ${from}–${to} trong ${total} sân bay`,
  },

  hero: {
    eyebrow: 'Danh mục sân bay thế giới',
    titleLead: 'Khám phá sân bay và',
    titleAccent: 'bản đồ nhà ga',
    sub: 'Tìm đường tại bất kỳ sân bay nào với bộ sưu tập đầy đủ bản đồ sân bay và nhà ga, được sắp xếp theo quốc gia và khu vực — từ các trung tâm quốc tế lớn đến sân bay khu vực.',
    stats: {
      countries: 'Quốc gia / khu vực',
      airports: 'Sân bay được đề cập',
      terminals: 'Bản đồ nhà ga',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'Giới thiệu về trang web này',
      imageAlt: 'Một máy bay chở khách tại cổng của nhà ga sân bay mặt kính vào lúc bình minh',
      blocks: [
        {
          title: 'Đi lại tại mọi sân bay với bản đồ nhà ga chi tiết',
          body: 'Việc đi lại tại các sân bay và nhà ga trên khắp thế giới có thể khá phức tạp. Bản đồ sân bay đầy đủ của chúng tôi cung cấp sơ đồ chi tiết về nhà ga, cổng, khu check-in, nhận hành lý, cửa hàng, nhà hàng, phòng chờ và trung tâm giao thông, để bạn lên kế hoạch lộ trình trước khi khởi hành.',
        },
        {
          title: 'Bản đồ nhà ga sân bay và mặt bằng tương tác',
          body: 'Các sân bay quốc tế lớn có nhiều nhà ga và bố cục phức tạp. Bản đồ sân bay chi tiết giúp bạn xác định vị trí cổng, tìm tiện ích, lên kế hoạch nối chuyến và di chuyển hiệu quả qua các điểm kiểm tra an ninh, khu khởi hành và sảnh đến — mà không phải quay lại.',
        },
        {
          title: 'Thông tin giao thông và tiếp cận sân bay',
          body: 'Ngoài bố cục nhà ga, hướng dẫn sân bay của chúng tôi còn đề cập các lựa chọn giao thông, thông tin bãi đỗ xe và tuyến đường tiếp cận. Tìm cách tốt nhất để đến cổng khởi hành, di chuyển giữa các nhà ga và sử dụng giao thông mặt đất bao gồm tàu, xe buýt, taxi và xe cho thuê.',
        },
      ],
    },
    map: {
      kicker: 'Bản đồ thế giới',
      title: 'Bản đồ sân bay',
      en: 'Bản đồ sân bay',
      sub: (airports: string, world: string) =>
        `Định vị ${world} sân bay có lịch trình trên toàn thế giới — ${airports} trong số đó có bản đồ nhà ga tại đây. Nhấp vào một điểm để xem quốc gia/khu vực và thông tin chi tiết.`,
      all: 'Tất cả',
      gEurope: 'Châu Âu',
      gAsia: 'Châu Á',
      gAmericas: 'Châu Mỹ',
      gAfrica: 'Châu Phi',
      gOceania: 'Châu Đại Dương',
      legendSite: 'Có tại đây · nhấp để xem bản đồ nhà ga',
      legendWorld: 'Các sân bay có lịch trình khác trên thế giới',
      countTemplate: '{n} sân bay được hiển thị',
      download: 'Tải dữ liệu',
      downloadTitle: 'Xuất mọi sân bay trong bộ lọc hiện tại dưới dạng CSV (IATA, tên, thành phố, quốc gia, tọa độ)',
      openAirport: 'Xem sân bay',
    },
    popular: {
      kicker: 'Bản đồ nhà ga',
      title: 'Bản đồ sân bay phổ biến',
      en: 'Bản đồ sân bay',
      sub: 'Tuyển chọn ảnh bìa bản đồ nhà ga của các sân bay lớn trên thế giới — mở trang sân bay để xem bản đồ đầy đủ.',
    },
    recent: {
      kicker: 'Mới xuất bản',
      title: 'Mới cập nhật',
      en: 'Mới cập nhật',
      sub: 'Sân bay, quốc gia và hướng dẫn du lịch mới hoặc vừa được chỉnh sửa.',
      countriesTitle: 'Quốc gia mới cập nhật',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'Tuyến bay',
      title: 'Bản đồ tuyến bay nhộn nhịp nhất',
      en: 'Bản đồ tuyến bay',
      sub: 'Các sân bay được xếp hạng theo số điểm bay thẳng — mở một sân bay để xem bản đồ tuyến bay, hãng hàng không và danh sách điểm đến.',
      collection: 'Bộ sưu tập tuyến bay',
      tabsLabel: 'Bản đồ tuyến bay theo thành phố',
      explore: (city: string) => `Khám phá ${city}`,
      play: 'Bắt đầu trình chiếu',
      pause: 'Tạm dừng trình chiếu',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'Ảnh mới nhất',
      title: 'Ảnh sân bay mới nhất',
      en: 'Ảnh mới nhất',
      sub: 'Những bức ảnh sân bay được thêm gần đây nhất — sáu sân bay mới nhất, mỗi sân bay một ảnh.',
      ariaLabel: 'Băng chuyền ảnh sân bay mới nhất',
      prev: 'Ảnh trước',
      next: 'Ảnh tiếp theo',
      play: 'Bắt đầu trình chiếu',
      pause: 'Tạm dừng trình chiếu',
      counter: (index: number, total: number) => `Ảnh ${index} / ${total}`,
      view: (name: string) => `Xem bản đồ ${name}`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'Mở trang sân bay',
    },
    countries: {
      kicker: 'Theo quốc gia',
      title: 'Bản đồ sân bay theo quốc gia',
      en: 'Quốc gia',
      sub: 'Duyệt bản đồ nhà ga sân bay theo quốc gia và khu vực, từ các trung tâm quốc tế lớn đến sân bay khu vực.',
      more: 'Tất cả quốc gia',
    },
    all: {
      kicker: 'Tất cả bản đồ',
      title: 'Tất cả bản đồ sân bay',
      en: 'Tất cả sân bay',
      sub: 'Bản đồ cho những sân bay và trung tâm du lịch nhộn nhịp nhất thế giới.',
      hint: 'Chọn một sân bay để xem sơ đồ nhà ga.',
      more: 'Xem tất cả',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'Dữ liệu danh mục',
      title: 'Dữ liệu sân bay trong nháy mắt',
      en: 'Danh sách & bảng',
      sub: 'Số liệu danh mục được trình bày dưới dạng danh sách và bảng: phạm vi bao phủ, các sân bay nhộn nhịp nhất trong số những sân bay có công bố số liệu hành khách, và phân bố theo khu vực.',
      note: (pax: string, detailed: string, total: string) =>
        `Số liệu hành khách bao gồm ${pax} trong ${total} sân bay; số liệu nhà ga và cổng bao gồm ${detailed} trong ${total}. Số lượng nhà ga theo cách phân nhóm của danh mục này và có thể bao gồm các khu nhà ga.`,
      coverageTitle: 'Số liệu bao phủ',
      coverage: {
        airports: 'Sân bay',
        countries: 'Quốc gia & khu vực',
        regions: 'Khu vực trong danh mục',
        cities: 'Tên thành phố duy nhất',
        terminals: 'Nhà ga',
        gates: 'Cổng',
        routes: 'Sân bay có bản đồ tuyến bay',
      },
      busiest: {
        title: 'Sân bay nhộn nhịp nhất theo hành khách hằng năm',
        sub: '12 sân bay nhộn nhịp nhất trong số những sân bay có công bố số liệu hành khách hằng năm.',
        caption: 'Các sân bay có công bố số liệu hành khách hằng năm, theo thứ hạng',
        rank: 'Hạng',
        iata: 'IATA',
        airport: 'Sân bay',
        city: 'Thành phố',
        country: 'Quốc gia',
        terminals: 'Nhà ga',
        gates: 'Cổng',
        pax: 'Hành khách hằng năm (triệu)',
      },
      regions: {
        title: 'Sân bay theo khu vực trong danh mục',
        sub: 'Số lượng sân bay, nhà ga và cổng được nhóm theo nhãn khu vực của danh mục; một số quốc gia và vùng lãnh thổ thuộc hai khu vực.',
        caption: 'Số lượng sân bay được nhóm theo khu vực trong danh mục',
        region: 'Khu vực',
        airports: 'Sân bay',
        detailed: 'Có dữ liệu chi tiết',
        terminals: 'Nhà ga',
        gates: 'Cổng',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'Sân bay',
    city: 'Thành phố',
    country: 'Quốc gia',
    size: 'Quy mô',
    map: 'Bản đồ',
    empty: 'Không có sân bay nào khớp với bộ lọc. Hãy thử mở rộng lựa chọn.',
  },

  pager: {
    label: 'Phân trang',
    previous: 'Trang trước',
    next: 'Trang sau',
  },

  filters: {
    searchPlaceholder: 'Tìm sân bay, thành phố hoặc mã IATA',
    submit: 'Tìm kiếm',
    country: 'Quốc gia',
    all: 'Tất cả',
    sort: 'Sắp xếp',
    sortPax: 'Hành khách',
    sortName: 'Tên',
    sortIata: 'Mã IATA',
    sortUpdated: 'Cập nhật gần nhất',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `Tất cả bản đồ sân bay ${country}${sortLabel ? ` — sắp xếp theo ${sortLabel}` : ''}`
        : `Tất cả bản đồ sân bay — sắp xếp theo ${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `Mọi bản đồ sân bay ${country} trong danh mục trên một trang: sơ đồ nhà ga, phạm vi cổng và giao thông mặt đất${sortLabel ? `, sắp xếp theo ${sortLabel}` : ''}.`
        : `Toàn bộ danh mục bản đồ sân bay trên một trang: sơ đồ nhà ga, phạm vi cổng và giao thông mặt đất${sortLabel ? `, sắp xếp theo ${sortLabel}` : ''}.`,
  },

  countries: {
    title: 'Duyệt sân bay theo quốc gia',
    description:
      'Duyệt danh mục bản đồ nhà ga sân bay toàn cầu theo quốc gia và khu vực. Từ các trung tâm quốc tế lớn đến sân bay khu vực, xem mỗi quốc gia có bao nhiêu sân bay và nhà ga.',
    sub: (countries: string, airports: string, terminals: string) =>
      `Từ các trung tâm quốc tế lớn đến sân bay khu vực — tổng cộng ${countries} quốc gia và khu vực, ${airports} sân bay và ${terminals} nhà ga.`,
    regionCount: (countries: number, airports: number) =>
      `${countries} quốc gia · ${airports} sân bay`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `Bản đồ sân bay ${name} — Tất cả ${count} sân bay` : `Bản đồ sân bay ${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} có ${total} sân bay có lịch trình; ${count} trong số đó có trang hướng dẫn tại đây, với bản đồ phân bố sân bay, danh sách đầy đủ toàn quốc và các tuyến bay thẳng.`
        : `Bản đồ nhà ga cho ${count} sân bay tại ${name} (${nameEn}), bao gồm các trung tâm quốc tế chính và sân bay khu vực của ${region}. Xem cổng, sơ đồ nhà ga và giao thông mặt đất.`,
    chip: (nameEn: string) => `SÂN BAY — ${nameEn.toUpperCase()}`,
    kicker: 'Bản đồ sân bay',
    titleOf: (name: string) => `Sân bay tại ${name}`,
    en: 'Sân bay',
    sub: 'Chọn một sân bay để xem sơ đồ nhà ga, phạm vi cổng và các lựa chọn giao thông mặt đất.',
    empty: 'Chưa có sân bay nào được liệt kê cho quốc gia hoặc khu vực này.',
    moreKicker: 'Quốc gia khác',
    moreTitle: 'Duyệt các quốc gia khác',
    moreEn: 'Thêm quốc gia',
    all: 'Tất cả quốc gia',
    notFound: 'Không tìm thấy quốc gia',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'Tổng quan',
    introTitle: (name: string) => `Tổng quan sân bay ${name}`,
    introEn: 'Tổng quan sân bay',
    introSub:
      'Quy mô sân bay của quốc gia hoặc khu vực này, các trung tâm chính và những thành phố chúng phục vụ.',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} nằm ở ${o.region}. Trang web này đề cập ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` và ${o.gates}` : ''} tại đây.` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) là sân bay lớn nhất theo hành khách hằng năm, với ${o.busiestPax}.`
        : '') +
      ` Các sân bay phục vụ những thành phố như ${o.cities}. ${o.mapsNote}`,
    introMapsNote:
      'Mỗi trang sân bay đều có bản đồ vị trí và mã sân bay, cùng mọi thông tin chi tiết về nhà ga, cổng và giao thông mặt đất được biên soạn cho sân bay đó.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'Phân bố',
      title: (name: string) => `Bản đồ phân bố sân bay ${name}`,
      en: 'Phân bố sân bay',
      sub: (covered: string, total: string) =>
        `${total} sân bay có lịch trình trên toàn quốc (lớn, trung bình và nhỏ); ${covered} trong số đó có trang hướng dẫn trên trang web này. Danh sách đầy đủ ở bên dưới.`,
      mapAlt: (name: string, total: string) =>
        `Bản đồ phân bố sân bay ${name}: ${total} sân bay có lịch trình`,
      siteTag: 'Có tại đây',
      colAirport: 'Sân bay',
      colCity: 'Thành phố',
      colType: 'Loại',
      types: {
        large: 'Lớn',
        medium: 'Trung bình',
        small: 'Nhỏ',
      },
      empty: 'Chưa có danh sách sân bay quốc gia.',
    },

    /** Related links */
    linksTitle: 'Liên kết liên quan',
    linksEn: 'Liên kết liên quan',
    linksSub: 'Trang web chính thức và mục bách khoa cho quốc gia và từng sân bay.',
    linksCountry: (name: string) => `Thông tin tham khảo về ${name}`,
    linksAirports: (name: string) => `Sân bay tại ${name}`,

    faqKicker: 'Hỏi đáp',
    faqTitle: 'Câu hỏi thường gặp',
    faqEn: 'Câu hỏi',
    faq: {
      airportTotal: (name: string) => `${name} có bao nhiêu sân bay?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} có ${total} sân bay khai thác chuyến bay chở khách theo lịch (lớn, trung bình và nhỏ); trang web này đề cập chi tiết ${covered} trong số đó. Xem bản đồ phân bố và danh sách đầy đủ ở trên.`,
      airportCount: (name: string) => `Những sân bay nào được đề cập tại ${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `Trang web này đề cập ${count} tại ${name}: ${list}.`,
      busiest: (name: string) => `Sân bay nào nhộn nhịp nhất tại ${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `Theo hành khách hằng năm, ${busiest} (${iata}) là sân bay lớn nhất trong số các sân bay được đề cập tại đây, với ${pax}.`,
      terminals: (name: string) => `Các sân bay tại ${name} có bao nhiêu nhà ga?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `Các sân bay được đề cập tại ${name} có ${terminals} với tổng cộng ${gates}: ${list}.`,
      cities: (name: string) => `Những thành phố nào tại ${name} có sân bay?`,
      citiesAnswer: (name: string, cities: string) =>
        `Các sân bay ${name} được đề cập tại đây phục vụ những thành phố như ${cities}. Bạn có thể lọc theo thành phố hoặc mã IATA trong danh mục sân bay.`,
      maps: (name: string) => `Các sân bay tại ${name} có bản đồ nhà ga không?`,
      mapsAnswer: (name: string, count: string) =>
        `Một số sân bay có. Trang sân bay có bản đồ vị trí, mã sân bay và tuyến bay thẳng, còn ${count} sân bay được đề cập tại ${name} hiển thị sơ đồ nhà ga, phạm vi cổng và giao thông mặt đất ở những nơi có thông tin chi tiết. Mở bất kỳ sân bay nào để xem nội dung hiện có.`,
    },
  },

  airport: {
    /**
     * Meta description assembled from formatted airport facts. Terminals and
     * gates are null for directory airports with no compiled counts, and the
     * clause drops out instead of reading "0 terminals".
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
        ? `${o.name} (${o.iata}) có ${o.terminals} nhà ga${
            o.gates ? ` với ${o.gates} cổng` : ''
          }${o.pax ? `, phục vụ ${o.pax} hành khách mỗi năm` : ''}${
            o.distance ? `, cách trung tâm thành phố ${o.distance}` : ''
          }. Bản đồ nhà ga hiển thị tất cả nhà ga, phạm vi cổng và giao thông mặt đất.`
        : `${o.name} (${o.iata}) phục vụ ${o.city}, ${o.country}. Bản đồ vị trí, mã sân bay và thông tin du lịch.`,
    /**
     * Lead answer sentence under the H1: the full-sentence answer to "what is
     * this airport / where is it" plus the terminal and gate counts.
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'sân bay';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) là một ${kind} phục vụ ${where}`;
      return o.terminals > 0
        ? `${head}, với ${o.terminals} nhà ga${
            o.gates > 0 ? ` và ${o.gates} cổng` : ''
          }${o.distance ? `, cách trung tâm ${o.city} khoảng ${o.distance}` : ''}.`
        : `${head}.`;
    },
    mapTitle: (iata: string) => `${iata} · Sơ đồ nhà ga`,
    mapNote: 'SƠ ĐỒ NHÀ GA',
    realMapTitle: (iata: string) => `Bản đồ nhà ga sân bay ${iata} — Cổng & Chỉ đường`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `Bản đồ nhà ga ${name} (${iata}) hiển thị tất cả nhà ga, phạm vi cổng và khu nhà ga`,
    realMapNote: 'BẢN ĐỒ NHÀ GA',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'Ảnh',
    photosTitle: 'Ảnh sân bay',
    photosEn: 'Ảnh sân bay',
    photosSub:
      'Ảnh thực tế của sân bay này, mỗi ảnh đều ghi nguồn từ trang web công khai nơi tìm thấy ảnh; bản quyền thuộc về nhiếp ảnh gia gốc. Nhấp vào ảnh để phóng to, hoặc nhấp vào dòng ghi nguồn để mở trang nguồn.',
    photosCredit: (host: string) => `Nguồn: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `Ảnh sân bay ${name} (${iata}) số ${index}`,
    photosZoom: (name: string, index: number) => `Phóng to ảnh ${index} của ${name}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'Thu phóng',
    zoomClose: 'Đóng',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    downloadKicker: 'Tải xuống',
    downloadTitle: 'Tải bản đồ sân bay',
    downloadEn: 'Tải xuống',
    downloadMapLabel: (year: number, iata: string) =>
      `Tải bản đồ nhà ga sân bay ${iata} mới nhất ${year} & sơ đồ mặt bằng`,
    downloadPdfLabel: (year: number, iata: string) =>
      `Tải PDF bản đồ nhà ga sân bay ${iata} mới nhất ${year}`,
    timeKicker: 'Giờ',
    timeTitle: (iata: string) => `Thông tin giờ sân bay — giờ hiện tại ở ${iata}`,
    timeEn: 'Giờ sân bay',
    timeSub: (iata: string, tz: string) => `Giờ hiện tại ở ${iata} (${tz}) so với giờ địa phương của bạn.`,
    clockAirport: 'Giờ hiện tại của sân bay',
    clockLocal: 'Giờ địa phương của bạn',
    infoKicker: 'Thông tin',
    infoTitle: 'Thông tin & chi tiết sân bay',
    infoEn: 'Chi tiết sân bay',
    infoIata: 'Mã IATA của sân bay',
    infoLocation: 'Vị trí sân bay',
    infoCoords: 'Tọa độ',
    infoTimezone: 'Múi giờ',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'Liên kết',
    linksTitle: 'Liên kết liên quan',
    linksEn: 'LIÊN KẾT LIÊN QUAN',
    linksSub: 'Tham khảo bên ngoài cho sân bay này: trang web chính thức, Wikipedia và Baidu Baike.',
    officialSite: 'Trang web chính thức',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'Nguồn: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'Dữ liệu mở OurAirports',
    sourcesNote:
      'Mã sân bay, tọa độ và phân loại sân bay được biên soạn từ dữ liệu mở; chi tiết trang theo các ấn phẩm chính thức của từng sân bay.',
    mapEmbedKicker: 'Bản đồ',
    mapEmbedTitle: (name: string) => `Bản đồ tương tác — vị trí ${name}`,
    mapEmbedEn: 'Bản đồ tương tác',
    extMapsNote: 'Xem sân bay này trên các dịch vụ bản đồ khác:',
    routeMapKicker: 'Tuyến bay',
    routeMapTitle: (name: string) => `Bản đồ tuyến bay ${name} — điểm đến thẳng`,
    routeMapEn: 'Bản đồ tuyến bay',
    routeMapAria: (name: string) => `Bản đồ các tuyến bay thẳng từ ${name}`,
    routeLegendTitle: 'Chú giải màu',
    routeLegendClose: 'Ẩn chú giải',
    routeReset: 'Đặt lại bản đồ',
    routeZoomIn: 'Phóng to',
    routeZoomOut: 'Thu nhỏ',
    routeFullscreen: 'Xem toàn màn hình',
    routeExitFullscreen: 'Thoát toàn màn hình',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'Mở trang sân bay {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6+ hãng hàng không',
      major: '3–5 hãng hàng không',
      minor: '2 hãng hàng không',
      single: '1 hãng hàng không',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} hãng hàng không',
    routeTableDest: 'Điểm đến',
    routeTableCountry: 'Quốc gia/khu vực',
    routeTableDistance: 'Khoảng cách',
    routeTableCarriers: 'Hãng hàng không',
    routeCarriersMore: (n: number) => ` +${n} hãng khác`,
    routeMapNote: (date: string) =>
      `Ảnh chụp dữ liệu tuyến bay: ${date}; chỉ gồm chuyến bay thẳng. Nguồn: `,
    legendTerminal: 'Nhà ga',
    legendTransit: 'Điểm giao thông mặt đất',
    legendCorridor: 'Đường nối giữa các nhà ga',
    terminalsKicker: 'Nhà ga',
    terminalsTitle: 'Hướng dẫn nhà ga',
    terminalsEn: 'Hướng dẫn nhà ga',
    terminalsSub: (name: string) =>
      `Phạm vi cổng, hãng hàng không chính và tiện ích của từng nhà ga tại ${name}.`,
    transitTitle: 'Giao thông mặt đất',
    facilitiesTitle: 'Tiện ích sân bay',
    faqKicker: 'Hỏi đáp',
    faqTitle: 'Câu hỏi thường gặp',
    faqEn: 'Câu hỏi',
    guideKicker: 'Hướng dẫn',
    guideTitle: 'Hướng dẫn sân bay',
    guideEn: 'Hướng dẫn sân bay',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'Bài viết',
    blogTitle: (iata: string) => `Hướng dẫn sân bay ${iata}`,
    blogEn: 'Từ blog',
    blogSub: (iata: string, count: number) =>
      `${count} bài viết trên trang web này đề cập ${iata}: điểm đến, giao thông mặt đất, hành lý và nối chuyến.`,
    blogAll: 'Tất cả bài viết',
    relatedTitle: (country: string) => `Các sân bay khác tại ${country}`,
    relatedEn: (country: string) => `Thêm sân bay tại ${country}`,
    relatedAll: (country: string) => `Tất cả sân bay tại ${country}`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'Chuyến bay',
      title: (name: string) => `Chuyến bay tại ${name} — khởi hành & đến`,
      en: 'Bảng chuyến bay',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'số hiệu chuyến bay', 'số hiệu chuyến bay')} của ${plural(
          airlines,
          'hãng hàng không',
          'hãng hàng không'
        )}, kết nối ${plural(destinations, 'điểm đến', 'điểm đến')}, phân theo chiều bay. Bao gồm số hiệu liên danh.`,
      statDepartures: 'Số hiệu chuyến bay khởi hành',
      statArrivals: 'Số hiệu chuyến bay đến',
      statAirlines: 'Hãng hàng không',
      statDestinations: 'Điểm đến',
      note: (date: string) =>
        `Số hiệu chuyến bay và tuyến bay từ chỉ mục chuyến bay aviability.com (ảnh chụp ${date}); bao gồm số hiệu liên danh và không hiển thị giờ khởi hành. Nguồn: `,
      source: 'aviability.com',
      tabDepartures: 'Khởi hành',
      tabArrivals: 'Đến',
      search: 'Tìm số hiệu chuyến bay, hãng hàng không hoặc thành phố',
      clearSearch: 'Xóa tìm kiếm',
      flight: 'Chuyến bay',
      airline: 'Hãng hàng không',
      destination: 'Điểm đến',
      origin: 'Điểm khởi hành',
      country: 'Quốc gia/khu vực',
      empty: 'Không có chuyến bay nào khớp với tìm kiếm này.',
      loading: 'Đang tải chuyến bay…',
      error: 'Không thể tải thêm chuyến bay.',
      retry: 'Thử lại',
      previous: 'Trước',
      next: 'Tiếp',
      pagination: 'Phân trang',
      showing: 'Hiển thị {from}–{to} trong {total} số hiệu chuyến bay',
      pageOf: 'Trang {page} / {pages}',
    },
    notFound: 'Không tìm thấy sân bay',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `Bản đồ tuyến bay ${name} (${iata}) mới nhất ${year} — ${count} điểm đến thẳng`,
    metaDescription: (name: string, iata: string, count: string) =>
      `Bản đồ tuyến bay thẳng của ${name} (${iata}): ${count} điểm đến cùng hãng hàng không khai thác và khoảng cách, kèm danh sách điểm đến đầy đủ.`,
    heading: (name: string) => `Bản đồ tuyến bay ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} có ${count} điểm đến thẳng, được tô màu theo số hãng hàng không khai thác mỗi điểm.`,
    backToAirport: (iata: string) => `Quay lại trang sân bay ${iata}`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `Số hiệu chuyến bay ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'Xem bản đồ tuyến bay',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `Xem bản đồ tuyến bay ${iata} đầy đủ`,
    teaserSub: (count: string) => `${count} điểm đến thẳng: bản đồ, hãng hàng không khai thác và khoảng cách.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `Bản đồ tuyến bay thẳng ${name}`,
    tableKicker: (iata: string) => `${iata} · Điểm đến`,
    tableSectionTitle: (name: string) => `Danh sách điểm đến thẳng ${name}`,
    tableSectionEn: (iata: string) => `Điểm đến ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'Điểm đến',
    tableSectionSub: (count: string) =>
      `${count} điểm đến, xếp theo số hãng hàng không khai thác, nhiều nhất trước, kèm khoảng cách và hãng.`,
    dataKicker: 'Tải xuống',
    dataTitle: 'Tải dữ liệu tuyến bay',
    dataEn: 'Dữ liệu',
    dataSub: (count: number) =>
      `${count} tuyến bay thẳng với điểm đến, mã IATA, thành phố, quốc gia, khoảng cách và hãng hàng không khai thác — sẵn sàng cho bảng tính hoặc đoạn mã.`,
    dataFields: 'CSV phù hợp với Excel / Numbers, JSON phù hợp với lập trình; cả hai đều là UTF-8.',
    dataCsv: 'Tải CSV',
    dataJson: 'Tải JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'Sơ đồ nhà ga và cổng trong nháy mắt — nhấp vào hình để xem bản đồ đầy đủ, tiện ích nhà ga và giao thông mặt đất trên trang sân bay.',
    airportMapCta: (iata: string) => `Xem bản đồ nhà ga ${iata} đầy đủ`,
    /** Header fact cells. */
    factDestinations: 'Điểm đến thẳng',
    factAirlines: 'Hãng hàng không',
    factCountries: 'Quốc gia',
    factSnapshot: 'Ảnh chụp dữ liệu',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `${name} bay thẳng đến bao nhiêu nơi?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) có ${count} điểm đến thẳng trên ${countries} quốc gia và vùng lãnh thổ. Chỉ tính các tuyến bay thẳng; hành trình có điểm dừng không được tính.`,
    faqAirlinesQ: (name: string) => `Có bao nhiêu hãng hàng không bay từ ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} hãng hàng không khai thác tuyến bay thẳng từ sân bay này. Các mạng bay rộng nhất là ${leaders} (số điểm đến trong ngoặc).`,
    faqFarthestQ: (name: string) => `Điểm đến thẳng xa nhất từ ${name} là đâu?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `Điểm đến thẳng xa nhất là ${city}, ${country} ${iata}, cách khoảng ${km} km.`,
    faqBusiestQ: () => 'Những điểm đến nào có nhiều hãng cạnh tranh nhất?',
    faqBusiestA: (count: string, list: string) =>
      `${count} điểm đến được ba hãng hàng không trở lên khai thác; nhộn nhịp nhất là ${list}.`,
    faqSourceQ: () => 'Dữ liệu tuyến bay được cập nhật bao lâu một lần?',
    faqSourceA: (date: string, source: string, license: string) =>
      `Các tuyến bay trên trang này đến từ bộ dữ liệu mở ${source} (${license}), là ảnh chụp ngày ${date} chứ không phải lịch bay trực tiếp — hãy kiểm tra với hãng hàng không hoặc sân bay để biết vé và giờ bay.`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} — chuyến bay ${from} đến ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Chuyến bay ${number} là số hiệu do ${airline} sử dụng từ ${from} đến ${to}${distance ? `, khoảng ${distance}` : ''}. Bản đồ tuyến bay, sân bay khởi hành và đến, khoảng cách và các chuyến bay khác trên tuyến.`,
    heading: (number: string) => `Chuyến bay ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Chuyến bay ${number} là số hiệu do ${airline} sử dụng giữa ${from} và ${to}${distance ? `, khoảng cách đường tròn lớn khoảng ${distance}` : ''}.`,
    factFlight: 'Số hiệu chuyến bay',
    factFrom: 'Từ',
    factTo: 'Đến',
    factDistance: 'Khoảng cách',
    overviewKicker: 'Tổng quan',
    overviewTitle: (number: string) => `Giới thiệu chuyến bay ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} là số hiệu chuyến bay do ${airline} sử dụng giữa ${originName} (${originIata}) và ${destName} (${destIata})${distance ? `, cách nhau khoảng ${distance}` : ''}. Trang này tổng hợp số hiệu chuyến bay, hãng hàng không, tuyến bay và hai sân bay để tra cứu nhanh.`,
    overviewNote:
      'Chỉ mục chuyến bay không bao gồm giờ khởi hành, giờ đến, máy bay hay ngày khai thác; hãy xác nhận lịch bay, giờ check-in và giờ lên máy bay với hãng hàng không hoặc sân bay.',
    routeKicker: 'Tuyến bay',
    routeTitle: (from: string, to: string) => `Tuyến ${from} → ${to}`,
    routeDiagramAria: (number: string) => `Sơ đồ tuyến bay ${number}`,
    routeMapAria: (number: string) => `Bản đồ tuyến bay ${number}`,
    airportsKicker: 'Sân bay',
    airportsTitle: 'Sân bay khởi hành và đến',
    airportsSub:
      'Các sân bay mà chuyến bay này kết nối. Những sân bay có trong danh mục sẽ mở trang riêng.',
    originAirport: 'Sân bay khởi hành',
    destinationAirport: 'Sân bay đến',
    airportPage: 'Mở trang sân bay',
    detailsKicker: 'Chi tiết',
    detailsTitle: 'Chi tiết chuyến bay',
    detailsFlight: 'Số hiệu chuyến bay',
    detailsAirline: 'Hãng hàng không',
    detailsOrigin: 'Sân bay khởi hành',
    detailsDestination: 'Sân bay đến',
    detailsDistance: 'Khoảng cách đường tròn lớn',
    detailsRoutes: 'Tuyến bay được liệt kê',
    detailsSnapshot: 'Ảnh chụp dữ liệu',
    routesKicker: 'Tuyến bay',
    routesTitle: 'Các tuyến bay dưới số hiệu này',
    routesSub: (count: string) =>
      `Số hiệu này xuất hiện trên ${count} tuyến bay; một số hiệu có thể được các đối tác liên danh dùng chung.`,
    routesRoute: 'Tuyến bay',
    routesAirline: 'Hãng hàng không',
    routesDistance: 'Khoảng cách',
    relatedKicker: 'Liên quan',
    relatedTitle: 'Các chuyến bay khác trên tuyến này',
    relatedSub: 'Các số hiệu chuyến bay khác giữa cùng sân bay khởi hành và đến.',
    relatedEn: 'Thêm chuyến bay',
    faqKicker: 'Hỏi đáp',
    faqTitle: 'Câu hỏi thường gặp',
    faqEn: 'Câu hỏi',
    faqWhat: (number: string) => `Chuyến bay ${number} là gì?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `Chuyến bay ${number} là số hiệu do ${airline} sử dụng trên tuyến ${from} → ${to}${distance ? `, cách nhau khoảng ${distance}` : ''}.`,
    faqRoute: (number: string) => `Chuyến bay ${number} bay đến đâu?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `Chuyến bay ${number} bay từ ${originName} (${originIata}) đến ${destName} (${destIata}).`,
    faqTimes: (number: string) => `Xem giờ khởi hành và đến của ${number} ở đâu?`,
    faqTimesAnswer: (number: string) =>
      `Trang này cung cấp số hiệu chuyến bay, hãng hàng không, tuyến bay và sân bay cho ${number}. Chỉ mục chuyến bay aviability.com không bao gồm giờ khởi hành hay giờ đến — hãy kiểm tra với hãng hàng không hoặc sân bay để biết lịch bay hiện tại.`,
    note: (date: string) =>
      `Số hiệu chuyến bay, hãng hàng không và tuyến bay từ chỉ mục chuyến bay aviability.com (ảnh chụp ${date}); không bao gồm giờ khởi hành và đến. Nguồn: `,
    source: 'aviability.com',
    sourceFlight: 'Xem trên aviability.com',
    viewAirport: (iata: string) => `Mở trang sân bay ${iata}`,
    notFound: 'Không tìm thấy chuyến bay',
  },

  faq: {
    terminalCount: (name: string) => `${name} có bao nhiêu nhà ga?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) có ${terminals} nhà ga với tổng cộng ${gates} cổng: ${list}.`,
    gateCount: (name: string) => `${name} có bao nhiêu cổng?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) có tổng cộng ${gates} cổng: ${list}.`,
    whereIs: (iata: string) => `${iata} ở đâu?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} là mã IATA của ${name} (${nameEn}), tọa lạc tại ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    distance: (name: string, city: string) => `${name} cách trung tâm ${city} bao xa?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} cách trung tâm ${city} khoảng ${distance}. Bạn có thể vào thành phố bằng ${transit}.`,
    access: (name: string, city: string) => `Làm thế nào để đi từ ${name} vào ${city}?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `${name} có những tiện ích gì?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} có ${facilities}. Xem sơ đồ nhà ga ở trên để biết các tiện ích được phân bố giữa các nhà ga như thế nào.`,
    location: (name: string) => `${name} nằm ở đâu?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, mã IATA ${iata}) tọa lạc tại ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}.`,
    airlines: (name: string) => `Những hãng hàng không nào khai thác từ mỗi nhà ga tại ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `Các hãng hàng không chính theo nhà ga tại ${name}: ${list}. Hãng hàng không và cổng có thể thay đổi, vì vậy hãy luôn xác nhận trên thẻ lên máy bay và biển chỉ dẫn của sân bay.`,
    timezone: (name: string) => `${name} ở múi giờ nào?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) nằm ở múi giờ ${tz}. So sánh với giờ địa phương của bạn bằng đồng hồ sân bay ở trên.`,
    flightsCount: (name: string) => `Có bao nhiêu số hiệu chuyến bay được liệt kê tại ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `Chỉ mục chuyến bay aviability.com liệt kê ${plural(
        departures,
        'số hiệu chuyến bay khởi hành',
        'số hiệu chuyến bay khởi hành'
      )} và ${plural(arrivals, 'số hiệu chuyến bay đến', 'số hiệu chuyến bay đến')} cho ${name} (${iata}), bao gồm ${plural(
        airlines,
        'hãng hàng không',
        'hãng hàng không'
      )} và ${plural(destinations, 'điểm đến', 'điểm đến')} (ảnh chụp ${date}). Bao gồm số hiệu liên danh và lịch bay có thể thay đổi — hãy xác nhận với hãng hàng không trước khi đi.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'Nhóm biên tập World Airport Maps',
    role: 'Biên soạn & kiểm duyệt bởi ',
    sourcesNote: 'Biên soạn từ các nguồn công khai và thông tin chính thức của sân bay',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'Trong trang này',
    map: 'Bản đồ nhà ga',
    photos: 'Ảnh sân bay',
    time: 'Giờ sân bay',
    details: 'Chi tiết sân bay',
    links: 'Liên kết liên quan',
    location: 'Bản đồ vị trí',
    routes: 'Bản đồ tuyến bay',
    flights: 'Chuyến bay',
    guide: 'Hướng dẫn sân bay',
    blog: 'Hướng dẫn liên quan',
    terminals: 'Hướng dẫn nhà ga',
    transport: 'Giao thông mặt đất',
    facilities: 'Tiện ích',
    faq: 'Hỏi đáp',
    flightOverview: 'Tổng quan chuyến bay',
    flightRoute: 'Tuyến bay',
    flightAirports: 'Sân bay',
    flightDetails: 'Chi tiết chuyến bay',
    flightRoutes: 'Tất cả tuyến bay',
    flightRelated: 'Chuyến bay liên quan',
    intro: 'Tổng quan sân bay',
    distribution: 'Phân bố sân bay',
    airports: 'Danh sách sân bay',
  },

  error: {
    title: 'Không thể tải trang này',
    sub: 'Đã xảy ra lỗi khi đọc dữ liệu sân bay. Vui lòng thử lại, hoặc quay về trang chủ để tiếp tục duyệt.',
    retry: 'Thử lại',
    backHome: 'Về trang chủ',
    notFoundTitle: '404 · Không tìm thấy trang',
    notFoundSub: 'Trang bạn yêu cầu có thể đã được di chuyển hoặc xóa. Hãy thử tìm kiếm một sân bay, hoặc tiếp tục từ các liên kết bên dưới.',
  },

  footer: {
    sponsored: 'Được tài trợ',
    mapsTitle: 'Bản đồ nhà ga chi tiết',
    mapsBody:
      'Việc đi lại tại sân bay và nhà ga có thể là một thách thức. Bản đồ sân bay của chúng tôi hiển thị sơ đồ chi tiết của nhà ga, cổng, khu check-in, nhận hành lý, cửa hàng, nhà hàng, phòng chờ và trung tâm trung chuyển để hành trình của bạn diễn ra suôn sẻ hơn.',
    plansTitle: 'Sơ đồ nhà ga tương tác',
    plansBody:
      'Các sân bay quốc tế lớn có nhiều nhà ga và bố cục phức tạp. Bản đồ chi tiết giúp bạn tìm cổng, tìm tiện ích, lên kế hoạch nối chuyến và di chuyển hiệu quả qua an ninh, khu khởi hành và khu đến.',
    transitTitle: 'Giao thông và tiếp cận sân bay',
    transitBody:
      'Ngoài bố cục nhà ga, chúng tôi còn đề cập các lựa chọn giao thông, bãi đỗ xe và tuyến đường tiếp cận — cách đến cổng, trung chuyển giữa các nhà ga và sử dụng giao thông mặt đất bao gồm tàu, xe buýt, taxi và thuê xe.',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} quốc gia / khu vực · ${airports} sân bay · ${terminals} nhà ga · sơ đồ nhà ga minh họa`,
    fallback: 'Sơ đồ nhà ga minh họa và hướng dẫn giao thông mặt đất cho các sân bay trên toàn thế giới',
    linksLabel: 'Điều hướng chân trang',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
    sources: 'Nguồn dữ liệu',
    privacy: 'Chính sách quyền riêng tư',
    disclaimer: 'Tuyên bố miễn trừ',
    terms: 'Điều khoản sử dụng',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: viTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Duyệt',
    title: 'Duyệt theo lĩnh vực',
    en: 'Duyệt theo lĩnh vực',
    sub: 'Bắt đầu khám phá danh mục theo cách phù hợp với bạn: theo quốc gia, theo khu vực, theo thành phố — hoặc đi thẳng đến các trung tâm nhộn nhịp nhất, các cập nhật mới nhất và hướng dẫn sân bay.',
    allAirports: {
      title: 'Tất cả sân bay',
      body: 'Danh mục đầy đủ, xếp theo lưu lượng hành khách, có thể lọc theo quốc gia và sắp xếp lại.',
    },
    byCountry: {
      title: 'Theo quốc gia',
      body: 'Xem mỗi quốc gia hoặc khu vực có bao nhiêu sân bay, nhà ga và cổng.',
    },
    byRegion: {
      title: 'Theo khu vực',
      body: 'Các quốc gia được nhóm thành Đông Á, Châu Âu, Bắc Mỹ và các khu vực còn lại, để tra cứu nhanh hơn.',
    },
    popularCities: {
      title: 'Thành phố phổ biến',
      body: 'Các thành phố sân bay nhộn nhịp nhất theo tổng hành khách hằng năm, và mọi sân bay trong mỗi thành phố.',
    },
    recentlyUpdated: {
      title: 'Mới cập nhật',
      body: 'Hồ sơ sân bay mới được thêm và mới được chỉnh sửa, gần nhất trước.',
    },
    guides: {
      title: 'Hướng dẫn sân bay',
      body: 'Hướng dẫn chi tiết về trung chuyển nhà ga, vào thành phố và các mẹo thực tế.',
    },
    routes: {
      title: 'Bản đồ tuyến bay',
      body: 'Xem mạng bay thẳng của một sân bay, xếp theo số điểm đến, kèm hãng hàng không và khoảng cách.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Hướng dẫn',
    title: 'Hướng dẫn sân bay',
    en: 'Hướng dẫn sân bay',
    sub: 'Ngoài sơ đồ nhà ga, chúng tôi còn viết hướng dẫn chi tiết cho một số trung tâm được chọn: cách đọc cách đánh số cổng, cách di chuyển giữa các nhà ga và cách vào thành phố.',
    more: 'Xem sân bay này',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the Vietnamese
   * wording of the same UI.
   */
  blog: {
    kicker: 'Tạp chí',
    title: 'Ghi chú du lịch',
    nav: 'Blog',
    en: 'Ghi chú du lịch',
    sub: 'Ghi chú chi tiết từ ban biên tập: khi đến và thủ tục nhập cảnh, trung chuyển, tiện ích nhà ga và nơi nghỉ ngơi.',
    more: 'Đọc',
    all: 'Tất cả bài viết',
    morePosts: 'Thêm bài viết',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'Sân bay',
    airportsTitle: 'Sân bay trong bài viết này',
    airportsEn: 'Sân bay được đề cập',
    airportsSub: 'Mở trang sân bay để xem bản đồ nhà ga, giao thông mặt đất và câu hỏi thường gặp.',
    back: 'Quay lại danh sách bài viết',
    empty: 'Chưa có bài viết.',
    readingMinutes: (n: number) => `${n} phút đọc`,
    source: (name: string) => `Nguồn: ${name}`,
    tags: 'Thẻ',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'Bình luận',
    title: 'Bình luận của độc giả',
    en: 'Thảo luận',
    sub: 'Hoan nghênh mọi câu hỏi, báo cáo chuyến đi và góp ý chỉnh sửa. Bình luận được công khai.',
    formTitle: 'Để lại bình luận',
    countOne: '1 bình luận',
    countMany: '{n} bình luận',
    empty: 'Chưa có bình luận nào — hãy là người đầu tiên viết.',
    loading: 'Đang tải bình luận…',
    loadError: 'Hiện không thể xem bình luận.',
    retry: 'Thử lại',
    nameLabel: 'Tên',
    namePlaceholder: 'Chúng tôi nên gọi bạn là gì?',
    bodyLabel: 'Bình luận',
    bodyPlaceholder: 'Chia sẻ trải nghiệm, đặt câu hỏi hoặc bổ sung thông tin…',
    submit: 'Đăng bình luận',
    submitting: 'Đang đăng…',
    success: 'Đã đăng — cảm ơn bạn đã chia sẻ.',
    error: 'Không thể đăng bình luận của bạn. Vui lòng thử lại sau.',
    rateLimited: 'Thao tác quá nhanh. Vui lòng đợi vài phút rồi thử lại.',
    nameError: 'Vui lòng nhập tên (2–40 ký tự).',
    bodyError: 'Vui lòng viết bình luận (5–2000 ký tự).',
    note: 'Bình luận được công khai và phản ánh quan điểm riêng của tác giả. Vui lòng giữ văn minh và không đăng quảng cáo hay thông tin cá nhân.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `Sơ đồ nhà ga của ${name}`,
    gates: 'Cổng',
    terminal: 'Nhà ga',
    corridor: 'Đường nối',
    transit: 'Giao thông mặt đất',
    footer: (iata: string) => `${iata} · Sơ đồ nhà ga`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'Công cụ trực tuyến',
    hub: {
      kicker: 'Công cụ',
      title: 'Công cụ bản đồ và tọa độ',
      en: 'Công cụ miễn phí',
      sub: 'Công cụ trực tuyến miễn phí cho du khách và những người yêu địa lý — mở trong trình duyệt, không cần cài đặt.',
      description:
        'Công cụ bản đồ và tọa độ trực tuyến miễn phí: chuyển đổi tọa độ WGS84 / GCJ02 / BD09, định dạng độ thập phân ↔ DMS và khoảng cách đường tròn lớn giữa hai điểm. Song ngữ, sẵn sàng trong trình duyệt của bạn.',
      comingTitle: 'Các công cụ đang phát triển',
      comingSub: 'Công cụ chọn tọa độ, chia sẻ vị trí và công cụ tính phép chiếu đang được triển khai.',
    },
    howTitle: 'Cách sử dụng',
    relatedTitle: 'Công cụ liên quan',
    allTools: 'Tất cả công cụ',
    tools: {
      coordinateConverter: {
        title: 'Chuyển đổi tọa độ',
        en: 'Bộ chuyển đổi tọa độ',
        description:
          'Chuyển đổi giữa WGS84, GCJ02 và BD09 — giải pháp cho vấn đề lệch bản đồ Trung Quốc.',
        note: 'WGS84 là tiêu chuẩn GPS và quốc tế. GCJ02 là hệ tọa độ lệch được yêu cầu tại Trung Quốc đại lục (thường gọi là “tọa độ Sao Hỏa”), được AMap và Tencent Maps sử dụng. BD09 thêm một độ lệch nữa trên GCJ02 và được Baidu Maps sử dụng. Cùng một điểm có thể lệch 100–700 m giữa các hệ, vì vậy hãy chuyển đổi trước khi dùng lại tọa độ trong dịch vụ bản đồ khác.',
        steps: [
          'Nhập tọa độ thập phân theo dạng vĩ độ, kinh độ — ví dụ 39.9042, 116.4074.',
          'Chọn hệ tọa độ của dữ liệu đầu vào.',
          'Nhấn "Chuyển đổi" để nhận hai hệ còn lại; dùng "Sao chép" để lưu kết quả.',
        ],
        inputLabel: 'Tọa độ (vĩ độ, kinh độ)',
        inputPlaceholder: 'ví dụ 39.9042, 116.4074',
        sourceLabel: 'Hệ tọa độ đầu vào',
        wgs84: 'WGS84 · GPS / quốc tế',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'Số chữ số thập phân',
        submit: 'Chuyển đổi',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        error: 'Không thể phân tích tọa độ. Hãy dùng định dạng "vĩ độ, kinh độ", ví dụ 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: 'Chuyển đổi định dạng tọa độ',
        en: 'Bộ chuyển đổi định dạng tọa độ',
        description:
          'Chuyển đổi giữa độ thập phân (DD), độ-phút (DM) và độ-phút-giây (DMS); định dạng đầu vào được tự động nhận diện.',
        note: 'DD (39.9042°) là kiểu thập phân thuần mà thiết bị và API sử dụng; DMS (39°54′15″N) phổ biến trong hàng hải, hàng không và trắc địa; DM (39°54.25′N) thường dùng cho ghi chép thực địa. Công cụ nhận diện định dạng đầu vào qua số nhóm số trong mỗi nửa (1 = DD, 2 = DM, 3 = DMS) và xuất cả ba kiểu, với N/S/E/W cho các bán cầu.',
        steps: [
          'Nhập một cặp tọa độ — các kiểu 39.9042, 39°54′15″N và 39°32.5′E đều được; phân tách hai nửa bằng dấu phẩy.',
          'Chọn số chữ số thập phân cho kết quả.',
          'Nhấn "Chuyển đổi" — cả ba định dạng được liệt kê; dùng "Sao chép" để lưu một định dạng.',
        ],
        inputLabel: 'Tọa độ (một cặp, cách nhau bằng dấu phẩy)',
        inputPlaceholder: 'ví dụ 39°54′15″N, 116°24′51″E hoặc 39.9042, 116.4074',
        precisionLabel: 'Số chữ số thập phân',
        submit: 'Chuyển đổi',
        ddLabel: 'Độ thập phân (DD)',
        dmLabel: 'Độ-phút (DM)',
        dmsLabel: 'Độ-phút-giây (DMS)',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        error: 'Không thể phân tích tọa độ. Các kiểu hỗ trợ gồm 39.9042, 39°54′15″N và 39°32.5′E, phân tách bằng dấu phẩy.',
      },
      distanceCalculator: {
        title: 'Máy tính khoảng cách',
        en: 'Máy tính khoảng cách',
        description:
          'Khoảng cách đường tròn lớn giữa hai điểm trên Trái Đất, kèm góc phương vị ban đầu.',
        note: 'Khoảng cách dùng công thức Haversine cho đường tròn lớn (bán kính Trái Đất trung bình 6.371,0088 km) — đường ngắn nhất dọc bề mặt. Góc phương vị ban đầu là hướng la bàn từ điểm thứ nhất tới điểm thứ hai, 0° ở hướng bắc và tăng theo chiều kim đồng hồ.',
        steps: [
          'Nhập vĩ độ và kinh độ của điểm đầu và điểm cuối.',
          'Nhấn "Tính khoảng cách".',
          'Nhận kết quả bằng km, dặm và hải lý, kèm góc phương vị ban đầu.',
        ],
        fromLabel: 'Từ',
        toLabel: 'Đến',
        inputPlaceholder: 'vĩ độ, kinh độ',
        example: 'Ví dụ: Bắc Kinh → Thượng Hải',
        submit: 'Tính khoảng cách',
        km: 'km',
        mi: 'dặm',
        nmi: 'hải lý',
        bearing: 'Góc phương vị ban đầu',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        error: 'Không thể phân tích tọa độ. Hãy dùng định dạng "vĩ độ, kinh độ" với vĩ độ -90–90 và kinh độ -180–180.',
      },
    },
  },
};
