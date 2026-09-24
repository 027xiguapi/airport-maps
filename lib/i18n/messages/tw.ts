import type { Messages } from './zh';

/**
 * Traditional Chinese (Taiwan) catalog, derived from `zh.ts` by
 * `scripts/build-hant.mjs` (OpenCC cn->twp plus the wording exceptions in
 * `content/terminology/tw-phrases.json`). Re-running the generator overwrites
 * this file, so adjust the phrase list rather than editing copy here.
 */
export const tw: Messages = {
  site: {
    name: '全球機場地圖',
    nameAccent: '地圖',
    nameLead: '全球機場',
    tagline: '探索機場和航站樓地圖',
    description:
      '瀏覽按國家和地區組織的全球機場航站樓地圖。從主要國際樞紐到區域機場，檢視登機口、值機區、行李提取處、商店、餐廳、貴賓室和地面交通的詳細布局。',
    keywords: ['機場地圖', '航站樓地圖', '機場平面圖', '登機口', '機場交通', 'airport maps', 'terminal maps'],
    numberOfItems: (n: number) => `${n} 座機場`,
  },

  nav: {
    home: '首頁',
    airports: '全部機場',
    countries: '按國家瀏覽',
    tools: '線上工具',
    about: '關於',
    label: '主導航',
    languageLabel: '語言',
    switchLanguage: '切換語言',
    themeToggle: '切換深色模式',
    menu: '選單',
  },

  common: {
    skipToContent: '跳到主要內容',
    backToTop: '回到頂部',
    breadcrumbLabel: '麵包屑導航',
    home: '首頁',
    viewMap: '檢視地圖',
    terminalMap: '航站樓地圖',
    /**
     * 機場頁 <title>/og:title：「2026年最新廣州白雲國際機場（CAN）航站樓地圖」。
     * 中文搜尋大量用 IATA 程式碼（"mxp 機場"）和"航站樓地圖/平面圖"，所以標題裡
     * 帶上程式碼與"航站樓"，而不是只有機場名加"地圖"。
     */
    latestAirportTitle: (year: number, name: string, iata: string) =>
      `${year}年最新${name}（${iata}）航站樓地圖`,
    /** 機場頁 H1，與標題同一主詞。 */
    airportHeading: (name: string) => `${name}航站樓地圖`,
    airportGuide: '機場指南',
    lastUpdated: '最近更新',
    updatedOn: (date: string) => `更新於 ${date}`,
    publishedOn: (date: string) => `釋出於 ${date}`,
    readMore: '閱讀完整指南',
  },

  units: {
    /** 機場頁關鍵資料格的標籤（不含數量）。 */
    terminalsFact: '航站樓',
    gatesFact: '登機口',
    terminals: (n: number) => `${n} 座航站樓`,
    terminalsShort: (n: number) => `${n} 航站樓`,
    gates: (n: number) => `${n} 個登機口`,
    airports: (n: number) => `${n} 座機場`,
    airportsChip: (n: number) => `${n} 機場`,
    pax: '年旅客',
    paxFull: '年旅客量',
    distance: '距市中心',
    distanceFrom: (city: string) => `距${city}市中心`,
    gatesLabel: (range: string) => `登機口 ${range}`,
    gatesCount: (n: number) => `${n} 個登機口`,
    satellite: '衛星廳',
    airlinesLabel: '主要航司：',
  },

  search: {
    ariaLabel: '搜尋機場',
    placeholder: '搜尋機場、城市或 IATA 程式碼',
    heroPlaceholder: '搜尋機場名稱、城市或 IATA 程式碼，如 PEK / 杜拜 / 希斯洛',
    submit: '查詢機場',
    loading: '搜尋中…',
    empty: '未找到匹配的機場',
    resultsTitle: (term: string) => `“${term}” 的搜尋結果`,
    resultsCount: (n: number) => `共找到 ${n} 座匹配的機場。`,
    noResults: '沒有找到匹配的機場，請嘗試其他關鍵詞，例如城市名或 IATA 程式碼。',
    noResultsHint: '沒有找到想要的機場？',
    viewAll: (n: number) => `檢視全部 ${n} 座機場`,
    orBrowseByCountry: '按國家瀏覽',
    range: (from: number, to: number, total: number) =>
      `顯示第 ${from}–${to} 條，共 ${total} 座機場`,
  },

  hero: {
    eyebrow: 'World Airport Directory',
    titleLead: '探索機場和',
    titleAccent: '航站樓地圖',
    sub: '使用我們完整的機場和航站樓地圖輕鬆找到您的路。瀏覽按國家和地區組織的機場航站樓地圖，從主要國際樞紐到區域機場。',
    stats: {
      countries: '覆蓋國家 / 地區',
      airports: '收錄機場',
      terminals: '航站樓平面圖',
    },
  },

  home: {
    /**
     * 首頁「網站介紹」區塊：一張機場照片 + 三組小標題與正文。照片排在正文之前，
     * 所以區塊本身沒有 kicker / title，語義名稱由 `ariaLabel` 提供。
     */
    intro: {
      ariaLabel: '關於本站',
      imageAlt: '清晨時分，停在玻璃幕牆航站樓登機口前的客機',
      blocks: [
        {
          title: '用詳細的航站樓地圖，輕鬆導航任何機場',
          body: '在全球機場與航站樓之間穿行並不容易。本站收錄的機場地圖詳細呈現航站樓、登機口、值機區、行李提取、商店、餐廳、休息室與交通樞紐的分佈，讓您在出發前就把路線規劃好，旅途更從容。',
        },
        {
          title: '可互動的機場航站樓地圖與樓層示意圖',
          body: '大型國際機場往往擁有多座航站樓和複雜的內部結構。詳細的機場地圖幫您定位登機口、查詢設施、規劃中轉銜接，並高效通過安檢、出發區與到達大廳，不必再為找路來回折返。',
        },
        {
          title: '機場交通與到達方式資訊',
          body: '除了航站樓佈局，機場指南還收錄了交通方式、停車資訊與到達路線。無論您需要找到通往登機口的最快路徑、在航站樓之間中轉，還是搭乘火車、巴士、計程車或租車前往市區，都能在這裡找到合適的方案。',
        },
      ],
    },
    map: {
      kicker: 'World Map',
      title: '機場分佈地圖',
      en: 'Airport Map',
      sub: (airports: string, world: string) =>
        `在地圖上定位全球 ${world} 座定期航班機場，其中 ${airports} 座已收錄航站樓地圖。點選圓點檢視所屬國家 / 地區與機場詳情。`,
      all: '全部',
      gEurope: '歐洲',
      gAsia: '亞洲',
      gAmericas: '美洲',
      gAfrica: '非洲',
      gOceania: '大洋洲',
      legendSite: '本站收錄 · 點選檢視航站樓地圖',
      legendWorld: '全球其他定期航班機場',
      countTemplate: '顯示 {n} 座機場',
      download: '下載資料',
      downloadTitle: '匯出當前篩選下的全部機場（CSV：IATA、名稱、城市、國家 / 地區、座標）',
      openAirport: '檢視機場詳情',
    },
    popular: {
      kicker: 'Terminal Maps',
      title: '熱門機場地圖',
      en: 'Airport Maps',
      sub: '隨機展示全球機場的航站樓地圖封面，點選進入機場頁面檢視完整大圖。',
    },
    recent: {
      kicker: 'Freshly Published',
      title: '最近更新',
      en: 'Recently Updated',
      sub: '新增和新更新的機場地圖。',
    },
    /** 首頁「航線圖」導航條：直飛目的地最多的機場，鏈到各自的 /route 頁面。 */
    routes: {
      kicker: 'Routes',
      title: '熱門機場航線圖',
      en: 'Route Maps',
      sub: '按直飛目的地數量排序的機場，點選檢視全球航線網路、執飛航司與目的地列表。',
    },
    countries: {
      kicker: 'By Country',
      title: '按國家分類的機場地圖',
      en: 'Countries',
      sub: '瀏覽按國家和地區組織的機場航站樓地圖。從主要國際樞紐到區域機場。',
      more: '全部國家',
    },
    all: {
      kicker: 'All Maps',
      title: '全部機場地圖',
      en: 'All Airports',
      sub: '世界上最繁忙的機場和旅行樞紐的機場地圖。',
      hint: '點選任意機場檢視航站樓平面示意圖。',
      more: '檢視全部',
    },
  },

  table: {
    iata: 'IATA',
    airport: '機場',
    city: '城市',
    country: '國家',
    size: '規模',
    map: '地圖',
    empty: '沒有符合條件的機場，試試放寬篩選條件。',
  },

  pager: {
    label: '分頁',
    previous: '上一頁',
    next: '下一頁',
  },

  filters: {
    searchPlaceholder: '搜尋機場、城市或 IATA 程式碼',
    submit: '搜尋',
    country: '國家',
    all: '全部',
    sort: '排序',
    sortPax: '旅客量',
    sortName: '名稱',
    sortIata: 'IATA 程式碼',
    sortUpdated: '更新時間',
  },

  countries: {
    title: '按國家瀏覽機場',
    description:
      '按國家和地區瀏覽全球機場航站樓地圖目錄，從主要國際樞紐到區域機場，檢視每個國家的機場數量與航站樓資訊。',
    sub: (countries: string, airports: string, terminals: string) =>
      `從主要國際樞紐到區域機場，共 ${countries} 個國家 / 地區、${airports} 座機場、${terminals} 座航站樓。`,
    regionCount: (countries: number, airports: number) =>
      `${countries} 個國家 / 地區 · ${airports} 座機場`,
  },

  country: {
    title: (name: string) => `${name}機場地圖`,
    description: (name: string, nameEn: string, region: string, count: number) =>
      `${name}（${nameEn}）共收錄 ${count} 座機場的航站樓地圖，覆蓋${region}主要國際樞紐與區域機場，可檢視登機口、航站樓佈局與地面交通。`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} AIRPORTS`,
    kicker: 'Airport Maps',
    titleOf: (name: string) => `${name}的機場`,
    en: 'Airports',
    sub: '點選任意機場檢視航站樓平面示意圖、登機口分佈與地面交通方式。',
    empty: '該國家 / 地區暫未收錄機場。',
    moreKicker: 'Other Countries',
    moreTitle: '瀏覽其他國家',
    moreEn: 'More Countries',
    all: '全部國家',
    notFound: '國家不存在',

    /** 機場介紹：由資料庫欄位拼出的概述，長文可另寫 content/<locale>/countries/<CC>.md */
    introKicker: 'Overview',
    introTitle: (name: string) => `${name}機場介紹`,
    introEn: 'Airport Overview',
    introSub: '該國家 / 地區機場的整體規模、主要樞紐與分佈城市。',
    introBody: (o: {
      name: string;
      nameEn: string;
      region: string;
      airports: string;
      terminals: string;
      gates: string;
      cities: string;
      busiest: string | null;
      busiestIata: string;
      busiestPax: string;
      mapsNote: string;
    }) =>
      // `o.nameEn` is empty when it equals `o.name` (both are "日本" / "Japan").
      `${o.name}${o.nameEn ? `（${o.nameEn}）` : ''}位於${o.region}，本站共收錄 ${o.airports}、${o.terminals}、${o.gates}。` +
      (o.busiest ? `其中${o.busiest}（${o.busiestIata}）規模最大，年旅客量${o.busiestPax}。` : '') +
      `機場分佈在${o.cities}等城市，${o.mapsNote}`,
    introMapsNote: '每座機場都有航站樓平面示意圖、登機口分佈與地面交通說明。',

    /** 相關連結 */
    linksTitle: '相關連結',
    linksEn: 'Related Links',
    linksSub: '該國家 / 地區及其機場的官方網站與百科條目等外部參考連結。',
    linksCountry: (name: string) => `${name}資料`,
    linksAirports: (name: string) => `${name}的機場`,

    faqKicker: 'FAQ',
    faqTitle: '常見問題',
    faqEn: 'Questions',
    faq: {
      airportCount: (name: string) => `${name}有哪些機場？`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `本站收錄${name} ${count}：${list}。`,
      busiest: (name: string) => `${name}最繁忙的機場是哪座？`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `按年旅客吞吐量，${busiest}（${iata}）是本站收錄的該國家 / 地區機場中規模最大的，${pax}。`,
      terminals: (name: string) => `${name}的機場共有多少座航站樓？`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}的機場合計 ${terminals}、${gates}：${list}。`,
      cities: (name: string) => `${name}的機場分佈在哪些城市？`,
      citiesAnswer: (name: string, cities: string) =>
        `本站收錄的${name}機場位於${cities}等城市，可按城市或 IATA 程式碼在機場目錄中篩選。`,
      maps: (name: string) => `${name}的機場有航站樓地圖嗎？`,
      mapsAnswer: (name: string, count: string) =>
        `有。本站為${name}收錄的 ${count}都繪製了航站樓平面示意圖，標註航站樓位置、登機口範圍、主要航司與地面交通方式，點選任意機場即可檢視。`,
    },
  },

  airport: {
    /** Meta description assembled from formatted airport facts. Terminals and
        gates are null for directory airports with no compiled counts, and the
        clause drops out instead of reading "共有 0 座航站樓". */
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
      `${o.name}（${o.iata}，${o.nameEn}）位於${o.city}${
        o.terminals ? `，共有 ${o.terminals} 座航站樓、${o.gates} 個登機口` : ''
      }${o.pax ? `，年旅客量${o.pax}` : ''}${o.distance ? `，距市中心約 ${o.distance}` : ''}。檢視航站樓地圖、登機口分佈與地面交通方式。`,
    mapTitle: (iata: string) => `${iata} · 航站樓平面示意圖`,
    mapNote: 'TERMINAL LAYOUT',
    realMapTitle: (iata: string) => `${iata} 機場航站樓地圖 — 登機口與導航`,
    /** 航站樓地圖圖片的 alt：補上機場全稱與程式碼，上方的小標題只有程式碼。 */
    mapAlt: (name: string, iata: string) =>
      `${name}（${iata}）航站樓地圖，含各航站樓、登機口與指廊分佈`,
    realMapNote: 'TERMINAL MAP',
    /** 終端圖下方的下載按鈕：圖片直接下載，PDF 按鈕跳轉谷歌搜尋官方 PDF。 */
    zoomLabel: '放大',
    zoomClose: '關閉',
    zoomIn: '放大',
    zoomOut: '縮小',
    downloadKicker: 'Download',
    downloadTitle: '下載機場地圖',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) => `${year}年最新  ${iata} 機場地圖下載`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}年最新 ${iata} 機場地圖 PDF 下載`,
    timeKicker: 'Time',
    timeTitle: (iata: string) => `機場時間資訊 — ${iata} 當前時間`,
    timeEn: 'Airport Time',
    timeSub: (iata: string, tz: string) => `${iata} 當前時間（${tz}）與您的本地時間對比。`,
    clockAirport: '機場當前時間',
    clockLocal: '您的本地時間',
    infoKicker: 'Info',
    infoTitle: '機場資訊與詳情',
    infoEn: 'Airport Details',
    infoIata: '機場 IATA 程式碼',
    infoLocation: '機場位置',
    infoCoords: '地理座標',
    infoTimezone: '時區',
    /** 「相關連結」板塊：機場官網 / 維基百科 / 百度百科外鏈。 */
    linksKicker: 'Links',
    linksTitle: '相關連結',
    linksEn: 'RELATED LINKS',
    linksSub: '機場官網、維基百科與百度百科等外部參考連結。',
    officialSite: '機場官網',
    wikiLabel: '維基百科',
    baikeLabel: '百度百科',
    mapEmbedKicker: 'Map',
    mapEmbedTitle: (name: string) => `${name}互動地圖 — 機場位置`,
    mapEmbedEn: 'Interactive Map',
    extMapsNote: '在其他地圖服務中檢視該機場：',
    /** 「航線圖」板塊：大圓航線地圖 + 直飛目的地列表。 */
    routeMapKicker: 'Routes',
    routeMapTitle: (name: string) => `${name}航線圖 · 直飛目的地`,
    routeMapEn: 'Route Map',
    routeMapAria: (name: string) => `${name}直飛航線地圖`,
    routeLegendTitle: '顏色說明',
    routeLegendClose: '收起圖例',
    routeReset: '重置地圖',
    routeZoomIn: '放大',
    routeZoomOut: '縮小',
    routeFullscreen: '全屏檢視',
    routeExitFullscreen: '退出全屏',
    /** 可點選的目的地圓點的懸停提示，`{iata}` 由客戶端替換。 */
    routeOpenAirport: '檢視 {iata} 機場頁',
    /** 與 lib/route-tiers.ts 的分級一一對應。 */
    routeTiers: {
      trunk: '6 家以上航司',
      major: '3–5 家航司',
      minor: '2 家航司',
      single: '1 家航司',
    },
    /** 地圖懸停提示裡的航司數量，`{n}` 由客戶端替換。 */
    routeCarriersTpl: '{n} 家航司',
    routeTableDest: '目的地',
    routeTableCountry: '國家/地區',
    routeTableDistance: '距離',
    routeTableCarriers: '執飛航司',
    routeCarriersMore: (n: number) => ` 等 ${n} 家`,
    routeMapNote: (date: string) =>
      `航線資料快照：${date}，僅統計直飛航線。資料來源：`,
    legendTerminal: '航站樓建築',
    legendTransit: '地面交通節點',
    legendCorridor: '航站樓間連廊',
    terminalsKicker: 'Terminals',
    terminalsTitle: '航站樓資訊',
    terminalsEn: 'Terminal Guide',
    terminalsSub: (name: string) => `${name}各航站樓的登機口範圍、主要航司與設施分佈。`,
    transitTitle: '地面交通',
    facilitiesTitle: '航站樓設施',
    faqKicker: 'FAQ',
    faqTitle: '常見問題',
    faqEn: 'Questions',
    guideKicker: 'Guide',
    guideTitle: '機場指南',
    guideEn: 'Airport Guide',
    relatedTitle: (country: string) => `${country}其他機場`,
    relatedEn: (country: string) => `More in ${country}`,
    relatedAll: (country: string) => `${country}全部機場`,
    notFound: '未找到該機場',
  },

  /** 獨立的航線圖頁面（/route/<IATA>）。 */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${year}年最新${name}航線圖 — ${iata} 直飛 ${count} 個目的地`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name}（${iata}）直飛航線圖：共 ${count} 個目的地，含執飛航司、飛行距離與線路示意，並附完整目的地列表。`,
    heading: (name: string) => `${name}航線圖`,
    headingSub: (iata: string, count: string) => `${iata} 共 ${count} 個直飛目的地，按執飛航司數量著色。`,
    backToAirport: (iata: string) => `返回 ${iata} 機場頁`,
    /** 機場頁預覽卡片上的按鈕。 */
    openFull: '檢視航線圖',
    /** 同上，但站點存有該機場的靜態航線渲染圖時，圖片本身就是入口。 */
    previewCta: (iata: string) => `檢視 ${iata} 完整航線圖`,
    teaserSub: (count: string) => `共 ${count} 個直飛目的地：航線示意、執飛航司與飛行距離。`,
    /** 首頁導航條上一格的字數說明。 */
    cardMeta: (count: string) => `${count} 個直飛目的地`,
    /** 各區塊標題都帶上機場名（`en` 行的引數是機場的英文名 / IATA 程式碼）。 */
    mapSectionTitle: (name: string) => `${name}直飛航線圖`,
    tableKicker: (iata: string) => `${iata} · Destinations`,
    tableSectionTitle: (name: string) => `${name}直飛目的地列表`,
    tableSectionEn: (iata: string) => `${iata} Destinations`,
    /** 導航欄裡的短標籤（區塊標題放不下）。 */
    tableToc: '直飛目的地',
    tableSectionSub: (count: string) =>
      `共 ${count} 個目的地，按執飛航司數量由多到少排列，含飛行距離與執飛航司。`,
    dataKicker: 'Download',
    dataTitle: '航線資料下載',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} 條直飛航線資料，含目的地、IATA 程式碼、城市、國家/地區、飛行距離與執飛航司，可用於表格軟體或指令碼處理。`,
    dataFields: 'CSV 適合 Excel / Numbers 等表格軟體，JSON 適合程式處理；均為 UTF-8 編碼。',
    dataCsv: '下載 CSV',
    dataJson: '下載 JSON',
    /** 點選跳轉機場頁的航站樓地圖卡片。 */
    airportMapSub:
      '機場航站樓與登機口分佈示意；點選圖片前往機場頁，檢視完整地圖、航站樓設施與地面交通。',
    airportMapCta: (iata: string) => `檢視 ${iata} 完整航站樓地圖`,
    /** 頁頭指標格。 */
    factDestinations: '直飛目的地',
    factAirlines: '執飛航司',
    factCountries: '國家/地區',
    factSnapshot: '資料快照',
    /** FAQ：全部由航線資料算出。 */
    faqCountQ: (name: string) => `${name}有多少個直飛目的地？`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name}（${iata}）共有 ${count} 個直飛目的地，覆蓋 ${countries} 個國家和地區。這裡只統計直飛航線，中轉行程不計入。`,
    faqAirlinesQ: (name: string) => `有多少家航空公司從${name}執飛？`,
    faqAirlinesA: (count: string, leaders: string) =>
      `共有 ${count} 家航空公司運營從該機場出發的直飛航線。其中執飛目的地最多的是 ${leaders}（括號內為目的地數量）。`,
    faqFarthestQ: (name: string) => `從${name}出發最遠的直飛目的地是哪裡？`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `最遠的直飛目的地是${country}${city} ${iata}，距離約 ${km} 公里。`,
    faqBusiestQ: () => '哪些目的地有多家航司競爭？',
    faqBusiestA: (count: string, list: string) =>
      `有 ${count} 個目的地由 3 家及以上航司執飛，競爭最激烈的是 ${list}。`,
    faqSourceQ: () => '航線資料多久更新一次？',
    faqSourceA: (date: string, source: string, license: string) =>
      `本頁航線來自 ${source} 開放資料集（${license} 授權），為 ${date} 的資料快照，不是即時航班計劃；機票與班次請以航空公司或機場官方渠道為準。`,
  },

  faq: {
    terminalCount: (name: string) => `${name}有幾座航站樓？`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name}（${iata}）共有 ${terminals} 座航站樓，合計 ${gates} 個登機口：${list}。`,
    gateCount: (name: string) => `${name}有多少個登機口？`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name}（${iata}）共有 ${gates} 個登機口：${list}。`,
    distance: (name: string, city: string) => `${name}距離${city}市中心有多遠？`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name}距離${city}市中心約 ${distance}，可搭乘${transit}等交通方式往返市區。`,
    access: (name: string, city: string) => `如何從${name}前往${city}市區？`,
    accessAnswer: (options: string) => `${options}。`,
    facilities: (name: string) => `${name}提供哪些設施與服務？`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}提供${facilities}等設施與服務，各航站樓的具體設施分佈請參考上方的航站樓平面示意圖。`,
    location: (name: string) => `${name}位於哪個城市和國家？`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name}（英文名 ${nameEn}，IATA 程式碼 ${iata}）位於${country}的${city}${
        cityEn ? `（${cityEn}）` : ''
      }。`,
    airlines: (name: string) => `${name}各航站樓主要運營哪些航空公司？`,
    airlinesAnswer: (name: string, list: string) =>
      `${name}各航站樓的主要航空公司：${list}。航司與登機口分配可能調整，請以登機牌與機場現場指引為準。`,
    timezone: (name: string) => `${name}使用什麼時區？`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name}（${iata}）使用 ${tz} 時區，可與頁面上方的機場時鐘對照當前時間。`,
  },

  /** 作者署名與 E-E-A-T 信任訊號，展示在機場頁標題下方。 */
  editorial: {
    authorName: '全球機場地圖編輯團隊',
    role: '編制與審校：',
    sourcesNote: '資料整理自公開來源與機場官方資訊',
  },

  /** 機場頁右側目錄導航（按當前機場實際展示的板塊動態生成）。 */
  toc: {
    label: '頁面導航',
    map: '航站樓地圖',
    time: '機場時間',
    details: '機場資訊',
    links: '相關連結',
    location: '位置地圖',
    routes: '航線圖',
    guide: '機場指南',
    terminals: '航站樓資訊',
    transport: '地面交通',
    facilities: '設施服務',
    faq: '常見問題',
    intro: '機場介紹',
    airports: '收錄機場',
  },

  error: {
    title: '頁面暫時無法載入',
    sub: '讀取機場資料時出現問題。請稍後重試，或返回首頁繼續瀏覽其他機場。',
    retry: '重試',
    backHome: '返回首頁',
    notFoundTitle: '404 · 頁面不存在',
    notFoundSub: '您訪問的頁面可能已被移動或刪除。試試搜尋機場，或從下面的入口繼續瀏覽。',
  },

  footer: {
    mapsTitle: '詳細航站樓地圖',
    mapsBody:
      '導航世界各地的機場和航站樓可能很有挑戰性。我們的機場地圖提供航站樓、登機口、值機區、行李提取處、商店、餐廳、貴賓室和交通樞紐的詳細布局，讓您的旅行體驗更順暢。',
    plansTitle: '互動航站樓平面圖',
    plansBody:
      '主要國際機場擁有多個航站樓和複雜佈局。我們的詳細地圖幫助您定位登機口、找到設施、規劃轉機，並高效地通過安檢點、出發區和到達大廳。',
    transitTitle: '機場交通與出入資訊',
    transitBody:
      '除了航站樓佈局，我們還整理了交通選項、停車資訊和出入路線。找到到達登機口的最佳方式、在航站樓間轉接，以及使用包括火車、巴士、計程車和租車在內的地面交通。',
    stats: (countries: string, airports: string, terminals: string) =>
      `覆蓋 ${countries} 個國家 / 地區 · ${airports} 座機場 · ${terminals} 座航站樓 · 航站樓平面示意圖`,
    fallback: '全球機場航站樓平面示意圖與地面交通指南',
    linksLabel: '頁尾導航',
    about: '關於本站',
    contact: '聯絡我們',
    privacy: '隱私政策',
    terms: '使用條款',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: '軌道交通',
    tram: '有軌電車',
    bus: '巴士',
    taxi: '計程車',
    car: '自駕 / 停車',
    ferry: '渡輪',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Browse',
    title: '按功能分割槽瀏覽',
    en: 'Browse by area',
    sub: '從不同維度進入機場資料庫：按國家、按區域、按城市，或直接檢視最繁忙的樞紐、最近更新與機場指南。',
    allAirports: {
      title: '全部機場',
      body: '按旅客量排序的完整機場目錄，可篩選國家並切換排序方式。',
    },
    byCountry: {
      title: '按國家瀏覽',
      body: '檢視每個國家 / 地區收錄的機場、航站樓與登機口數量。',
    },
    byRegion: {
      title: '按區域瀏覽',
      body: '把國家 / 地區歸入東亞、歐洲、北美等區域，快速定位目標市場。',
    },
    popularCities: {
      title: '熱門機場城市',
      body: '按年旅客吞吐量彙總，最繁忙的機場城市及其全部機場。',
    },
    recentlyUpdated: {
      title: '最近更新',
      body: '新收錄與新修訂的機場資料，按更新時間倒序排列。',
    },
    guides: {
      title: '機場指南',
      body: '航站樓換乘、進城方式與實用提示，長篇圖文指南。',
    },
    routes: {
      title: '航線圖',
      body: '按直飛目的地數量檢視機場的全球航線網路，含執飛航司與目的地列表。',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guides',
    title: '機場指南',
    en: 'Airport guides',
    sub: '除了航站樓示意圖，我們還為部分樞紐撰寫了長篇指南：如何讀懂登機口編號、如何在航站樓之間換乘、如何進城。',
    more: '檢視該機場',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name}航站樓平面示意圖`,
    gates: '登機口',
    terminal: '航站樓',
    corridor: '連廊',
    transit: '地面交通',
    footer: (iata: string) => `${iata} · 航站樓平面示意`,
  },

  /** 工具中心（/tool）與各工具頁。 */
  tool: {
    label: '線上工具',
    hub: {
      kicker: 'Tools',
      title: '地圖與座標工具',
      en: 'Free Tools',
      sub: '為旅行者與地理愛好者準備的免費線上工具，開啟即用，無需安裝。',
      description:
        '免費線上地圖與座標工具：WGS84 / GCJ02 / BD09 座標系轉換、經緯度十進位制度與度分秒互轉、兩點間大圓距離計算。中英雙語，開啟即用。',
      comingTitle: '更多工具開發中',
      comingSub: '座標拾取、位置分享、投影計算等工具正在開發中，完成後會在這裡上線。',
    },
    howTitle: '使用方法',
    relatedTitle: '相關工具',
    allTools: '全部工具',
    tools: {
      coordinateConverter: {
        title: '座標系轉換',
        en: 'Coordinate Converter',
        description: '在 WGS84、GCJ02、BD09 三種座標系之間互轉，解決中國大陸地圖偏移問題。',
        note: 'WGS84 是 GPS 與國際通用的標準；GCJ02 是中國大陸法規要求的加偏座標系（俗稱「火星座標」），高德、騰訊地圖使用；BD09 在 GCJ02 基礎上再次加偏，百度地圖使用。同一地點在不同座標系下可相差 100–700 米，跨地圖服務使用座標前請先轉換。',
        steps: [
          '輸入十進位制經緯度（緯度, 經度），如 39.9042, 116.4074。',
          '選擇輸入座標所屬的座標系。',
          '點選「轉換」，得到另外兩套座標系的結果，點「複製」儲存。',
        ],
        inputLabel: '輸入座標（緯度, 經度）',
        inputPlaceholder: '例如 39.9042, 116.4074',
        sourceLabel: '輸入座標系',
        wgs84: 'WGS84 · GPS / 國際標準',
        gcj02: 'GCJ02 · 高德 / 騰訊',
        bd09: 'BD09 · 百度',
        precisionLabel: '小數位數',
        submit: '轉換',
        copy: '複製',
        copied: '已複製',
        error: '無法解析座標。請使用「緯度, 經度」格式，例如 39.9042, 116.4074。',
      },
      dmsConverter: {
        title: '經緯度格式轉換',
        en: 'Coordinate Format Converter',
        description: '十進位制度（DD）、度分（DM）、度分秒（DMS）三種經緯度寫法互轉，自動識別輸入格式。',
        note: 'DD（39.9042°）是裝置與 API 常用的純小數寫法；DMS（39°54′15″N）常見於航海、航空與測繪；DM（39°54.25′N）多用於野外記錄。工具按輸入中數字段的數量自動識別格式（1 段 DD、2 段 DM、3 段 DMS），一次輸出全部三種寫法，南北緯 / 東西經以 N/S/E/W 表示。',
        steps: [
          '輸入一對座標，支援 39.9042、39°54′15″N、39°32.5′E 等寫法，兩半以逗號分隔。',
          '選擇輸出的小數位數。',
          '點選「轉換」，三種格式的結果都會列出，點「複製」儲存。',
        ],
        inputLabel: '輸入座標（一對，逗號分隔）',
        inputPlaceholder: '例如 39°54′15″N, 116°24′51″E 或 39.9042, 116.4074',
        precisionLabel: '小數位數',
        submit: '轉換',
        ddLabel: '十進位制度（DD）',
        dmLabel: '度分（DM）',
        dmsLabel: '度分秒（DMS）',
        copy: '複製',
        copied: '已複製',
        error: '無法解析座標。支援 39.9042、39°54′15″N、39°32.5′E 等寫法，兩半用逗號分隔。',
      },
      distanceCalculator: {
        title: '兩點距離計算',
        en: 'Distance Calculator',
        description: '用大圓公式計算地球表面兩點間的距離，同時給出初始方位角。',
        note: '距離使用 Haversine 大圓公式（地球平均半徑 6371.0088 公里），即兩點沿地表的最短距離；方位角是從起點看向終點的羅盤方向，以正北為 0°、順時針遞增。',
        steps: [
          '分別輸入起點與終點的緯度、經度。',
          '點選「計算距離」。',
          '得到公里、英里、海里與初始方位角。',
        ],
        fromLabel: '起點',
        toLabel: '終點',
        inputPlaceholder: '緯度, 經度',
        example: '示例：北京 → 上海',
        submit: '計算距離',
        km: '公里',
        mi: '英里',
        nmi: '海里',
        bearing: '初始方位角',
        copy: '複製',
        copied: '已複製',
        error: '無法解析座標。請使用「緯度, 經度」格式，緯度 -90–90，經度 -180–180。',
      },
    },
  },
};
