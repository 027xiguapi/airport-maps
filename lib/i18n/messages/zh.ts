/**
 * Chinese message catalog — the source of truth for the message shape.
 * `en.ts` is typed against this object, so a missing or misspelled key in any
 * translation is a compile error. Count-dependent strings are functions because
 * English needs plural forms and Chinese does not.
 */
export const zh = {
  site: {
    name: '全球机场地图',
    nameAccent: '地图',
    nameLead: '全球机场',
    tagline: '探索机场和航站楼地图',
    description:
      '浏览按国家和地区组织的全球机场航站楼地图。从主要国际枢纽到区域机场，查看登机口、值机区、行李提取处、商店、餐厅、贵宾室和地面交通的详细布局。',
    keywords: ['机场地图', '航站楼地图', '机场平面图', '登机口', '机场交通', 'airport maps', 'terminal maps'],
    numberOfItems: (n: number) => `${n} 座机场`,
  },

  nav: {
    home: '首页',
    airports: '全部机场',
    countries: '按国家浏览',
    tools: '在线工具',
    about: '关于',
    label: '主导航',
    languageLabel: '语言',
    switchLanguage: '切换语言',
    themeToggle: '切换深色模式',
    menu: '菜单',
  },

  common: {
    skipToContent: '跳到主要内容',
    backToTop: '回到顶部',
    breadcrumbLabel: '面包屑导航',
    home: '首页',
    viewMap: '查看地图',
    terminalMap: '航站楼地图',
    /**
     * 机场页 <title>/og:title：「2026年最新广州白云国际机场（CAN）航站楼地图」。
     * 中文搜索大量用 IATA 代码（"mxp 機場"）和"航站楼地图/平面图"，所以标题里
     * 带上代码与"航站楼"，而不是只有机场名加"地图"。
     */
    latestAirportTitle: (year: number, name: string, iata: string) =>
      `${year}年最新${name}（${iata}）航站楼地图`,
    /** 机场页 H1，与标题同一主词。 */
    airportHeading: (name: string) => `${name}航站楼地图`,
    airportGuide: '机场指南',
    lastUpdated: '最近更新',
    updatedOn: (date: string) => `更新于 ${date}`,
    publishedOn: (date: string) => `发布于 ${date}`,
    readMore: '阅读完整指南',
  },

  units: {
    /** 机场页关键数据格的标签（不含数量）。 */
    terminalsFact: '航站楼',
    gatesFact: '登机口',
    terminals: (n: number) => `${n} 座航站楼`,
    terminalsShort: (n: number) => `${n} 航站楼`,
    gates: (n: number) => `${n} 个登机口`,
    airports: (n: number) => `${n} 座机场`,
    airportsChip: (n: number) => `${n} 机场`,
    pax: '年旅客',
    paxFull: '年旅客量',
    distance: '距市中心',
    distanceFrom: (city: string) => `距${city}市中心`,
    gatesLabel: (range: string) => `登机口 ${range}`,
    gatesCount: (n: number) => `${n} 个登机口`,
    satellite: '卫星厅',
    airlinesLabel: '主要航司：',
  },

  search: {
    ariaLabel: '搜索机场',
    placeholder: '搜索机场、城市或 IATA 代码',
    heroPlaceholder: '搜索机场名称、城市或 IATA 代码，如 PEK / 迪拜 / 希思罗',
    submit: '查找机场',
    loading: '搜索中…',
    empty: '未找到匹配的机场',
    resultsTitle: (term: string) => `“${term}” 的搜索结果`,
    resultsCount: (n: number) => `共找到 ${n} 座匹配的机场。`,
    noResults: '没有找到匹配的机场，请尝试其他关键词，例如城市名或 IATA 代码。',
    noResultsHint: '没有找到想要的机场？',
    viewAll: (n: number) => `查看全部 ${n} 座机场`,
    orBrowseByCountry: '按国家浏览',
    range: (from: number, to: number, total: number) =>
      `显示第 ${from}–${to} 条，共 ${total} 座机场`,
  },

  hero: {
    eyebrow: 'World Airport Directory',
    titleLead: '探索机场和',
    titleAccent: '航站楼地图',
    sub: '使用我们完整的机场和航站楼地图轻松找到您的路。浏览按国家和地区组织的机场航站楼地图，从主要国际枢纽到区域机场。',
    stats: {
      countries: '覆盖国家 / 地区',
      airports: '收录机场',
      terminals: '航站楼平面图',
    },
  },

  home: {
    /**
     * 首页「网站介绍」区块：一张机场照片 + 三组小标题与正文。照片排在正文之前，
     * 所以区块本身没有 kicker / title，语义名称由 `ariaLabel` 提供。
     */
    intro: {
      ariaLabel: '关于本站',
      imageAlt: '清晨时分，停在玻璃幕墙航站楼登机口前的客机',
      blocks: [
        {
          title: '用详细的航站楼地图，轻松导航任何机场',
          body: '在全球机场与航站楼之间穿行并不容易。本站收录的机场地图详细呈现航站楼、登机口、值机区、行李提取、商店、餐厅、休息室与交通枢纽的分布，让您在出发前就把路线规划好，旅途更从容。',
        },
        {
          title: '可交互的机场航站楼地图与楼层示意图',
          body: '大型国际机场往往拥有多座航站楼和复杂的内部结构。详细的机场地图帮您定位登机口、查找设施、规划中转衔接，并高效通过安检、出发区与到达大厅，不必再为找路来回折返。',
        },
        {
          title: '机场交通与到达方式信息',
          body: '除了航站楼布局，机场指南还收录了交通方式、停车信息与到达路线。无论您需要找到通往登机口的最快路径、在航站楼之间中转，还是搭乘火车、巴士、出租车或租车前往市区，都能在这里找到合适的方案。',
        },
      ],
    },
    map: {
      kicker: 'World Map',
      title: '机场分布地图',
      en: 'Airport Map',
      sub: (airports: string, world: string) =>
        `在地图上定位全球 ${world} 座定期航班机场，其中 ${airports} 座已收录航站楼地图。点击圆点查看所属国家 / 地区与机场详情。`,
      all: '全部',
      gEurope: '欧洲',
      gAsia: '亚洲',
      gAmericas: '美洲',
      gAfrica: '非洲',
      gOceania: '大洋洲',
      legendSite: '本站收录 · 点击查看航站楼地图',
      legendWorld: '全球其他定期航班机场',
      countTemplate: '显示 {n} 座机场',
      download: '下载数据',
      downloadTitle: '导出当前筛选下的全部机场（CSV：IATA、名称、城市、国家 / 地区、坐标）',
      openAirport: '查看机场详情',
    },
    popular: {
      kicker: 'Terminal Maps',
      title: '热门机场地图',
      en: 'Airport Maps',
      sub: '随机展示全球机场的航站楼地图封面，点击进入机场页面查看完整大图。',
    },
    recent: {
      kicker: 'Freshly Published',
      title: '最近更新',
      en: 'Recently Updated',
      sub: '新增和新更新的机场地图。',
    },
    /** 首页「航线图」导航条：直飞目的地最多的机场，链到各自的 /route 页面。 */
    routes: {
      kicker: 'Routes',
      title: '热门机场航线图',
      en: 'Route Maps',
      sub: '按直飞目的地数量排序的机场，点击查看全球航线网络、执飞航司与目的地列表。',
    },
    countries: {
      kicker: 'By Country',
      title: '按国家分类的机场地图',
      en: 'Countries',
      sub: '浏览按国家和地区组织的机场航站楼地图。从主要国际枢纽到区域机场。',
      more: '全部国家',
    },
    all: {
      kicker: 'All Maps',
      title: '全部机场地图',
      en: 'All Airports',
      sub: '世界上最繁忙的机场和旅行枢纽的机场地图。',
      hint: '点击任意机场查看航站楼平面示意图。',
      more: '查看全部',
    },
  },

  table: {
    iata: 'IATA',
    airport: '机场',
    city: '城市',
    country: '国家',
    size: '规模',
    map: '地图',
    empty: '没有符合条件的机场，试试放宽筛选条件。',
  },

  pager: {
    label: '分页',
    previous: '上一页',
    next: '下一页',
  },

  filters: {
    searchPlaceholder: '搜索机场、城市或 IATA 代码',
    submit: '搜索',
    country: '国家',
    all: '全部',
    sort: '排序',
    sortPax: '旅客量',
    sortName: '名称',
    sortIata: 'IATA 代码',
    sortUpdated: '更新时间',
  },

  countries: {
    title: '按国家浏览机场',
    description:
      '按国家和地区浏览全球机场航站楼地图目录，从主要国际枢纽到区域机场，查看每个国家的机场数量与航站楼信息。',
    sub: (countries: string, airports: string, terminals: string) =>
      `从主要国际枢纽到区域机场，共 ${countries} 个国家 / 地区、${airports} 座机场、${terminals} 座航站楼。`,
    regionCount: (countries: number, airports: number) =>
      `${countries} 个国家 / 地区 · ${airports} 座机场`,
  },

  country: {
    title: (name: string) => `${name}机场地图`,
    description: (name: string, nameEn: string, region: string, count: number) =>
      `${name}（${nameEn}）共收录 ${count} 座机场的航站楼地图，覆盖${region}主要国际枢纽与区域机场，可查看登机口、航站楼布局与地面交通。`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} AIRPORTS`,
    kicker: 'Airport Maps',
    titleOf: (name: string) => `${name}的机场`,
    en: 'Airports',
    sub: '点击任意机场查看航站楼平面示意图、登机口分布与地面交通方式。',
    empty: '该国家 / 地区暂未收录机场。',
    moreKicker: 'Other Countries',
    moreTitle: '浏览其他国家',
    moreEn: 'More Countries',
    all: '全部国家',
    notFound: '国家不存在',

    /** 机场介绍：由数据库字段拼出的概述，长文可另写 content/<locale>/countries/<CC>.md */
    introKicker: 'Overview',
    introTitle: (name: string) => `${name}机场介绍`,
    introEn: 'Airport Overview',
    introSub: '该国家 / 地区机场的整体规模、主要枢纽与分布城市。',
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
      `${o.name}${o.nameEn ? `（${o.nameEn}）` : ''}位于${o.region}，本站共收录 ${o.airports}、${o.terminals}、${o.gates}。` +
      (o.busiest ? `其中${o.busiest}（${o.busiestIata}）规模最大，年旅客量${o.busiestPax}。` : '') +
      `机场分布在${o.cities}等城市，${o.mapsNote}`,
    introMapsNote: '每座机场都有航站楼平面示意图、登机口分布与地面交通说明。',

    /** 相关链接 */
    linksTitle: '相关链接',
    linksEn: 'Related Links',
    linksSub: '该国家 / 地区及其机场的官方网站与百科条目等外部参考链接。',
    linksCountry: (name: string) => `${name}资料`,
    linksAirports: (name: string) => `${name}的机场`,

    faqKicker: 'FAQ',
    faqTitle: '常见问题',
    faqEn: 'Questions',
    faq: {
      airportCount: (name: string) => `${name}有哪些机场？`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `本站收录${name} ${count}：${list}。`,
      busiest: (name: string) => `${name}最繁忙的机场是哪座？`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `按年旅客吞吐量，${busiest}（${iata}）是本站收录的该国家 / 地区机场中规模最大的，${pax}。`,
      terminals: (name: string) => `${name}的机场共有多少座航站楼？`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}的机场合计 ${terminals}、${gates}：${list}。`,
      cities: (name: string) => `${name}的机场分布在哪些城市？`,
      citiesAnswer: (name: string, cities: string) =>
        `本站收录的${name}机场位于${cities}等城市，可按城市或 IATA 代码在机场目录中筛选。`,
      maps: (name: string) => `${name}的机场有航站楼地图吗？`,
      mapsAnswer: (name: string, count: string) =>
        `有。本站为${name}收录的 ${count}都绘制了航站楼平面示意图，标注航站楼位置、登机口范围、主要航司与地面交通方式，点击任意机场即可查看。`,
    },
  },

  airport: {
    /** Meta description assembled from formatted airport facts. Terminals and
        gates are null for directory airports with no compiled counts, and the
        clause drops out instead of reading "共有 0 座航站楼". */
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
      `${o.name}（${o.iata}，${o.nameEn}）位于${o.city}${
        o.terminals ? `，共有 ${o.terminals} 座航站楼、${o.gates} 个登机口` : ''
      }${o.pax ? `，年旅客量${o.pax}` : ''}${o.distance ? `，距市中心约 ${o.distance}` : ''}。查看航站楼地图、登机口分布与地面交通方式。`,
    mapTitle: (iata: string) => `${iata} · 航站楼平面示意图`,
    mapNote: 'TERMINAL LAYOUT',
    realMapTitle: (iata: string) => `${iata} 机场航站楼地图 — 登机口与导航`,
    /** 航站楼地图图片的 alt：补上机场全称与代码，上方的小标题只有代码。 */
    mapAlt: (name: string, iata: string) =>
      `${name}（${iata}）航站楼地图，含各航站楼、登机口与指廊分布`,
    realMapNote: 'TERMINAL MAP',
    /** 终端图下方的下载按钮：图片直接下载，PDF 按钮跳转谷歌搜索官方 PDF。 */
    zoomLabel: '放大',
    zoomClose: '关闭',
    zoomIn: '放大',
    zoomOut: '缩小',
    downloadKicker: 'Download',
    downloadTitle: '下载机场地图',
    downloadEn: 'Downloads',
    downloadMapLabel: (year: number, iata: string) => `${year}年最新  ${iata} 机场地图下载`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}年最新 ${iata} 机场地图 PDF 下载`,
    timeKicker: 'Time',
    timeTitle: (iata: string) => `机场时间信息 — ${iata} 当前时间`,
    timeEn: 'Airport Time',
    timeSub: (iata: string, tz: string) => `${iata} 当前时间（${tz}）与您的本地时间对比。`,
    clockAirport: '机场当前时间',
    clockLocal: '您的本地时间',
    infoKicker: 'Info',
    infoTitle: '机场信息与详情',
    infoEn: 'Airport Details',
    infoIata: '机场 IATA 代码',
    infoLocation: '机场位置',
    infoCoords: '地理坐标',
    infoTimezone: '时区',
    /** 「相关链接」板块：机场官网 / 维基百科 / 百度百科外链。 */
    linksKicker: 'Links',
    linksTitle: '相关链接',
    linksEn: 'RELATED LINKS',
    linksSub: '机场官网、维基百科与百度百科等外部参考链接。',
    officialSite: '机场官网',
    wikiLabel: '维基百科',
    baikeLabel: '百度百科',
    mapEmbedKicker: 'Map',
    mapEmbedTitle: (name: string) => `${name}互动地图 — 机场位置`,
    mapEmbedEn: 'Interactive Map',
    extMapsNote: '在其他地图服务中查看该机场：',
    /** 「航线图」板块：大圆航线地图 + 直飞目的地列表。 */
    routeMapKicker: 'Routes',
    routeMapTitle: (name: string) => `${name}航线图 · 直飞目的地`,
    routeMapEn: 'Route Map',
    routeMapAria: (name: string) => `${name}直飞航线地图`,
    routeLegendTitle: '颜色说明',
    routeLegendClose: '收起图例',
    routeReset: '重置地图',
    routeZoomIn: '放大',
    routeZoomOut: '缩小',
    routeFullscreen: '全屏查看',
    routeExitFullscreen: '退出全屏',
    /** 可点击的目的地圆点的悬停提示，`{iata}` 由客户端替换。 */
    routeOpenAirport: '查看 {iata} 机场页',
    /** 与 lib/route-tiers.ts 的分级一一对应。 */
    routeTiers: {
      trunk: '6 家以上航司',
      major: '3–5 家航司',
      minor: '2 家航司',
      single: '1 家航司',
    },
    /** 地图悬停提示里的航司数量，`{n}` 由客户端替换。 */
    routeCarriersTpl: '{n} 家航司',
    routeTableDest: '目的地',
    routeTableCountry: '国家/地区',
    routeTableDistance: '距离',
    routeTableCarriers: '执飞航司',
    routeCarriersMore: (n: number) => ` 等 ${n} 家`,
    routeMapNote: (date: string) =>
      `航线数据快照：${date}，仅统计直飞航线。数据来源：`,
    legendTerminal: '航站楼建筑',
    legendTransit: '地面交通节点',
    legendCorridor: '航站楼间连廊',
    terminalsKicker: 'Terminals',
    terminalsTitle: '航站楼信息',
    terminalsEn: 'Terminal Guide',
    terminalsSub: (name: string) => `${name}各航站楼的登机口范围、主要航司与设施分布。`,
    transitTitle: '地面交通',
    facilitiesTitle: '航站楼设施',
    faqKicker: 'FAQ',
    faqTitle: '常见问题',
    faqEn: 'Questions',
    guideKicker: 'Guide',
    guideTitle: '机场指南',
    guideEn: 'Airport Guide',
    relatedTitle: (country: string) => `${country}其他机场`,
    relatedEn: (country: string) => `More in ${country}`,
    relatedAll: (country: string) => `${country}全部机场`,
    notFound: '未找到该机场',
  },

  /** 独立的航线图页面（/route/<IATA>）。 */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${year}年最新${name}航线图 — ${iata} 直飞 ${count} 个目的地`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name}（${iata}）直飞航线图：共 ${count} 个目的地，含执飞航司、飞行距离与线路示意，并附完整目的地列表。`,
    heading: (name: string) => `${name}航线图`,
    headingSub: (iata: string, count: string) => `${iata} 共 ${count} 个直飞目的地，按执飞航司数量着色。`,
    backToAirport: (iata: string) => `返回 ${iata} 机场页`,
    /** 机场页预览卡片上的按钮。 */
    openFull: '查看航线图',
    /** 同上，但站点存有该机场的静态航线渲染图时，图片本身就是入口。 */
    previewCta: (iata: string) => `查看 ${iata} 完整航线图`,
    teaserSub: (count: string) => `共 ${count} 个直飞目的地：航线示意、执飞航司与飞行距离。`,
    /** 首页导航条上一格的字数说明。 */
    cardMeta: (count: string) => `${count} 个直飞目的地`,
    /** 各区块标题都带上机场名（`en` 行的参数是机场的英文名 / IATA 代码）。 */
    mapSectionTitle: (name: string) => `${name}直飞航线图`,
    tableKicker: (iata: string) => `${iata} · Destinations`,
    tableSectionTitle: (name: string) => `${name}直飞目的地列表`,
    tableSectionEn: (iata: string) => `${iata} Destinations`,
    /** 导航栏里的短标签（区块标题放不下）。 */
    tableToc: '直飞目的地',
    tableSectionSub: (count: string) =>
      `共 ${count} 个目的地，按执飞航司数量由多到少排列，含飞行距离与执飞航司。`,
    dataKicker: 'Download',
    dataTitle: '航线数据下载',
    dataEn: 'Data',
    dataSub: (count: number) =>
      `${count} 条直飞航线数据，含目的地、IATA 代码、城市、国家/地区、飞行距离与执飞航司，可用于表格软件或脚本处理。`,
    dataFields: 'CSV 适合 Excel / Numbers 等表格软件，JSON 适合程序处理；均为 UTF-8 编码。',
    dataCsv: '下载 CSV',
    dataJson: '下载 JSON',
    /** 点击跳转机场页的航站楼地图卡片。 */
    airportMapSub:
      '机场航站楼与登机口分布示意；点击图片前往机场页，查看完整地图、航站楼设施与地面交通。',
    airportMapCta: (iata: string) => `查看 ${iata} 完整航站楼地图`,
    /** 页头指标格。 */
    factDestinations: '直飞目的地',
    factAirlines: '执飞航司',
    factCountries: '国家/地区',
    factSnapshot: '数据快照',
    /** FAQ：全部由航线数据算出。 */
    faqCountQ: (name: string) => `${name}有多少个直飞目的地？`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name}（${iata}）共有 ${count} 个直飞目的地，覆盖 ${countries} 个国家和地区。这里只统计直飞航线，中转行程不计入。`,
    faqAirlinesQ: (name: string) => `有多少家航空公司从${name}执飞？`,
    faqAirlinesA: (count: string, leaders: string) =>
      `共有 ${count} 家航空公司运营从该机场出发的直飞航线。其中执飞目的地最多的是 ${leaders}（括号内为目的地数量）。`,
    faqFarthestQ: (name: string) => `从${name}出发最远的直飞目的地是哪里？`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `最远的直飞目的地是${country}${city} ${iata}，距离约 ${km} 公里。`,
    faqBusiestQ: () => '哪些目的地有多家航司竞争？',
    faqBusiestA: (count: string, list: string) =>
      `有 ${count} 个目的地由 3 家及以上航司执飞，竞争最激烈的是 ${list}。`,
    faqSourceQ: () => '航线数据多久更新一次？',
    faqSourceA: (date: string, source: string, license: string) =>
      `本页航线来自 ${source} 开放数据集（${license} 授权），为 ${date} 的数据快照，不是实时航班计划；机票与班次请以航空公司或机场官方渠道为准。`,
  },

  faq: {
    terminalCount: (name: string) => `${name}有几座航站楼？`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name}（${iata}）共有 ${terminals} 座航站楼，合计 ${gates} 个登机口：${list}。`,
    gateCount: (name: string) => `${name}有多少个登机口？`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name}（${iata}）共有 ${gates} 个登机口：${list}。`,
    distance: (name: string, city: string) => `${name}距离${city}市中心有多远？`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name}距离${city}市中心约 ${distance}，可搭乘${transit}等交通方式往返市区。`,
    access: (name: string, city: string) => `如何从${name}前往${city}市区？`,
    accessAnswer: (options: string) => `${options}。`,
    facilities: (name: string) => `${name}提供哪些设施与服务？`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}提供${facilities}等设施与服务，各航站楼的具体设施分布请参考上方的航站楼平面示意图。`,
    location: (name: string) => `${name}位于哪个城市和国家？`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name}（英文名 ${nameEn}，IATA 代码 ${iata}）位于${country}的${city}${
        cityEn ? `（${cityEn}）` : ''
      }。`,
    airlines: (name: string) => `${name}各航站楼主要运营哪些航空公司？`,
    airlinesAnswer: (name: string, list: string) =>
      `${name}各航站楼的主要航空公司：${list}。航司与登机口分配可能调整，请以登机牌与机场现场指引为准。`,
    timezone: (name: string) => `${name}使用什么时区？`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name}（${iata}）使用 ${tz} 时区，可与页面上方的机场时钟对照当前时间。`,
  },

  /** 作者署名与 E-E-A-T 信任信号，展示在机场页标题下方。 */
  editorial: {
    authorName: '全球机场地图编辑团队',
    role: '编制与审校：',
    sourcesNote: '资料整理自公开来源与机场官方信息',
  },

  /** 机场页右侧目录导航（按当前机场实际展示的板块动态生成）。 */
  toc: {
    label: '页面导航',
    map: '航站楼地图',
    time: '机场时间',
    details: '机场信息',
    links: '相关链接',
    location: '位置地图',
    routes: '航线图',
    guide: '机场指南',
    terminals: '航站楼信息',
    transport: '地面交通',
    facilities: '设施服务',
    faq: '常见问题',
    intro: '机场介绍',
    airports: '收录机场',
  },

  error: {
    title: '页面暂时无法加载',
    sub: '读取机场数据时出现问题。请稍后重试，或返回首页继续浏览其他机场。',
    retry: '重试',
    backHome: '返回首页',
    notFoundTitle: '404 · 页面不存在',
    notFoundSub: '您访问的页面可能已被移动或删除。试试搜索机场，或从下面的入口继续浏览。',
  },

  footer: {
    mapsTitle: '详细航站楼地图',
    mapsBody:
      '导航世界各地的机场和航站楼可能很有挑战性。我们的机场地图提供航站楼、登机口、值机区、行李提取处、商店、餐厅、贵宾室和交通枢纽的详细布局，让您的旅行体验更顺畅。',
    plansTitle: '互动航站楼平面图',
    plansBody:
      '主要国际机场拥有多个航站楼和复杂布局。我们的详细地图帮助您定位登机口、找到设施、规划转机，并高效地通过安检点、出发区和到达大厅。',
    transitTitle: '机场交通与出入信息',
    transitBody:
      '除了航站楼布局，我们还整理了交通选项、停车信息和出入路线。找到到达登机口的最佳方式、在航站楼间转接，以及使用包括火车、巴士、出租车和租车在内的地面交通。',
    stats: (countries: string, airports: string, terminals: string) =>
      `覆盖 ${countries} 个国家 / 地区 · ${airports} 座机场 · ${terminals} 座航站楼 · 航站楼平面示意图`,
    fallback: '全球机场航站楼平面示意图与地面交通指南',
    linksLabel: '页脚导航',
    about: '关于本站',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '使用条款',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: '轨道交通',
    tram: '有轨电车',
    bus: '巴士',
    taxi: '出租车',
    car: '自驾 / 停车',
    ferry: '渡轮',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'Browse',
    title: '按功能分区浏览',
    en: 'Browse by area',
    sub: '从不同维度进入机场资料库：按国家、按区域、按城市，或直接查看最繁忙的枢纽、最近更新与机场指南。',
    allAirports: {
      title: '全部机场',
      body: '按旅客量排序的完整机场目录，可筛选国家并切换排序方式。',
    },
    byCountry: {
      title: '按国家浏览',
      body: '查看每个国家 / 地区收录的机场、航站楼与登机口数量。',
    },
    byRegion: {
      title: '按区域浏览',
      body: '把国家 / 地区归入东亚、欧洲、北美等区域，快速定位目标市场。',
    },
    popularCities: {
      title: '热门机场城市',
      body: '按年旅客吞吐量汇总，最繁忙的机场城市及其全部机场。',
    },
    recentlyUpdated: {
      title: '最近更新',
      body: '新收录与新修订的机场资料，按更新时间倒序排列。',
    },
    guides: {
      title: '机场指南',
      body: '航站楼换乘、进城方式与实用提示，长篇图文指南。',
    },
    routes: {
      title: '航线图',
      body: '按直飞目的地数量查看机场的全球航线网络，含执飞航司与目的地列表。',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'Guides',
    title: '机场指南',
    en: 'Airport guides',
    sub: '除了航站楼示意图，我们还为部分枢纽撰写了长篇指南：如何读懂登机口编号、如何在航站楼之间换乘、如何进城。',
    more: '查看该机场',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name}航站楼平面示意图`,
    gates: '登机口',
    terminal: '航站楼',
    corridor: '连廊',
    transit: '地面交通',
    footer: (iata: string) => `${iata} · 航站楼平面示意`,
  },

  /** 工具中心（/tool）与各工具页。 */
  tool: {
    label: '在线工具',
    hub: {
      kicker: 'Tools',
      title: '地图与坐标工具',
      en: 'Free Tools',
      sub: '为旅行者与地理爱好者准备的免费在线工具，打开即用，无需安装。',
      description:
        '免费在线地图与坐标工具：WGS84 / GCJ02 / BD09 坐标系转换、经纬度十进制度与度分秒互转、两点间大圆距离计算。中英双语，打开即用。',
      comingTitle: '更多工具开发中',
      comingSub: '坐标拾取、位置分享、投影计算等工具正在开发中，完成后会在这里上线。',
    },
    howTitle: '使用方法',
    relatedTitle: '相关工具',
    allTools: '全部工具',
    tools: {
      coordinateConverter: {
        title: '坐标系转换',
        en: 'Coordinate Converter',
        description: '在 WGS84、GCJ02、BD09 三种坐标系之间互转，解决中国大陆地图偏移问题。',
        note: 'WGS84 是 GPS 与国际通用的标准；GCJ02 是中国大陆法规要求的加偏坐标系（俗称「火星坐标」），高德、腾讯地图使用；BD09 在 GCJ02 基础上再次加偏，百度地图使用。同一地点在不同坐标系下可相差 100–700 米，跨地图服务使用坐标前请先转换。',
        steps: [
          '输入十进制经纬度（纬度, 经度），如 39.9042, 116.4074。',
          '选择输入坐标所属的坐标系。',
          '点击「转换」，得到另外两套坐标系的结果，点「复制」保存。',
        ],
        inputLabel: '输入坐标（纬度, 经度）',
        inputPlaceholder: '例如 39.9042, 116.4074',
        sourceLabel: '输入坐标系',
        wgs84: 'WGS84 · GPS / 国际标准',
        gcj02: 'GCJ02 · 高德 / 腾讯',
        bd09: 'BD09 · 百度',
        precisionLabel: '小数位数',
        submit: '转换',
        copy: '复制',
        copied: '已复制',
        error: '无法解析坐标。请使用「纬度, 经度」格式，例如 39.9042, 116.4074。',
      },
      dmsConverter: {
        title: '经纬度格式转换',
        en: 'Coordinate Format Converter',
        description: '十进制度（DD）、度分（DM）、度分秒（DMS）三种经纬度写法互转，自动识别输入格式。',
        note: 'DD（39.9042°）是设备与 API 常用的纯小数写法；DMS（39°54′15″N）常见于航海、航空与测绘；DM（39°54.25′N）多用于野外记录。工具按输入中数字段的数量自动识别格式（1 段 DD、2 段 DM、3 段 DMS），一次输出全部三种写法，南北纬 / 东西经以 N/S/E/W 表示。',
        steps: [
          '输入一对坐标，支持 39.9042、39°54′15″N、39°32.5′E 等写法，两半以逗号分隔。',
          '选择输出的小数位数。',
          '点击「转换」，三种格式的结果都会列出，点「复制」保存。',
        ],
        inputLabel: '输入坐标（一对，逗号分隔）',
        inputPlaceholder: '例如 39°54′15″N, 116°24′51″E 或 39.9042, 116.4074',
        precisionLabel: '小数位数',
        submit: '转换',
        ddLabel: '十进制度（DD）',
        dmLabel: '度分（DM）',
        dmsLabel: '度分秒（DMS）',
        copy: '复制',
        copied: '已复制',
        error: '无法解析坐标。支持 39.9042、39°54′15″N、39°32.5′E 等写法，两半用逗号分隔。',
      },
      distanceCalculator: {
        title: '两点距离计算',
        en: 'Distance Calculator',
        description: '用大圆公式计算地球表面两点间的距离，同时给出初始方位角。',
        note: '距离使用 Haversine 大圆公式（地球平均半径 6371.0088 公里），即两点沿地表的最短距离；方位角是从起点看向终点的罗盘方向，以正北为 0°、顺时针递增。',
        steps: [
          '分别输入起点与终点的纬度、经度。',
          '点击「计算距离」。',
          '得到公里、英里、海里与初始方位角。',
        ],
        fromLabel: '起点',
        toLabel: '终点',
        inputPlaceholder: '纬度, 经度',
        example: '示例：北京 → 上海',
        submit: '计算距离',
        km: '公里',
        mi: '英里',
        nmi: '海里',
        bearing: '初始方位角',
        copy: '复制',
        copied: '已复制',
        error: '无法解析坐标。请使用「纬度, 经度」格式，纬度 -90–90，经度 -180–180。',
      },
    },
  },
};

/** Shape every locale catalog must satisfy. */
export type Messages = typeof zh;
