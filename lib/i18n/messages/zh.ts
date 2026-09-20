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
    /** 机场页 <title>/og:title：「2026年最新广州白云国际机场地图」。 */
    latestAirportTitle: (year: number, name: string, _iata: string) =>
      `${year}年最新${name}地图`,
    airportGuide: '机场指南',
    lastUpdated: '最近更新',
    updatedOn: (date: string) => `更新于 ${date}`,
    publishedOn: (date: string) => `发布于 ${date}`,
    readMore: '阅读完整指南',
  },

  units: {
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
    eyebrow: 'Global Airport Directory',
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
      kicker: 'Busiest Hubs',
      title: '热门机场城市',
      en: 'Popular Cities',
      sub: '按年旅客吞吐量汇总，世界上最繁忙的机场城市和主要旅行目的地的航站楼地图。',
    },
    recent: {
      kicker: 'Freshly Published',
      title: '最近更新',
      en: 'Recently Updated',
      sub: '新增和新更新的机场地图。',
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
  },

  airport: {
    /** Meta description assembled from formatted airport facts. */
    metaDescription: (o: {
      name: string;
      nameEn: string;
      iata: string;
      city: string;
      country: string;
      terminals: string;
      gates: string;
      pax: string;
      distance: string;
    }) =>
      `${o.name}（${o.iata}，${o.nameEn}）位于${o.city}，共有 ${o.terminals} 座航站楼、${o.gates} 个登机口${
        o.pax ? `，年旅客量${o.pax}` : ''
      }${o.distance ? `，距市中心约 ${o.distance}` : ''}。查看航站楼平面示意图、登机口分布与地面交通方式。`,
    mapTitle: (iata: string) => `${iata} · 航站楼平面示意图`,
    mapNote: 'TERMINAL LAYOUT',
    realMapTitle: (iata: string) => `${iata} 机场航站楼地图 — 登机口与导航`,
    realMapNote: 'TERMINAL MAP',
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
    mapEmbedKicker: 'Map',
    mapEmbedTitle: (name: string) => `${name}互动地图 — 机场位置`,
    mapEmbedEn: 'Interactive Map',
    extMapsNote: '在其他地图服务中查看该机场：',
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

  faq: {
    terminalCount: (name: string) => `${name}有几座航站楼？`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name}（${iata}）共有 ${terminals} 座航站楼，合计 ${gates} 个登机口：${list}。`,
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
    location: '位置地图',
    guide: '机场指南',
    terminals: '航站楼信息',
    transport: '地面交通',
    facilities: '设施服务',
    faq: '常见问题',
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
};

/** Shape every locale catalog must satisfy. */
export type Messages = typeof zh;
