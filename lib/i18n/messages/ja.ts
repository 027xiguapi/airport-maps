import type { Messages } from './zh';
import { jaTransportModes } from '../ja-data';

/**
 * Japanese catalog. Typed against the Chinese source of truth (`Messages`), so
 * a missing or renamed key fails `npm run typecheck`.
 *
 * Style: polite traveler-facing Japanese (です・ます体), with 「〜してください」
 * for UI instructions. Japanese has no plural forms, so the count helpers keep
 * their signatures but use one counter word for every value.
 */

/** 日本語では単複の区別がないため、one / many には同じ語を渡します。 */
const plural = (value: string, one: string, many: string) =>
  `${value}${value === '1' ? one : many}`;

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: '大型空港',
  medium: '中型空港',
  small: '小型空港',
  heliport: 'ヘリポート',
} as const;

export const ja: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: '空港・ターミナルマップ',
    description:
      '国・地域別に整理された世界の空港ターミナルマップを眺めましょう。主要な国際ハブから地方空港まで、ゲート、チェックインエリア、手荷物受取所、ショップ、レストラン、ラウンジ、地上交通の詳しい配置を確認できます。',
    keywords: [
      '空港マップ',
      'ターミナルマップ',
      '空港ターミナル配置図',
      'ゲート',
      '空港アクセス',
      '空港ガイド',
    ],
    numberOfItems: (n: number) => `${n}空港`,
  },

  nav: {
    home: 'ホーム',
    airports: 'すべての空港',
    countries: '国別に見る',
    tools: 'オンラインツール',
    about: 'このサイトについて',
    label: 'メインナビゲーション',
    languageLabel: '言語',
    switchLanguage: '言語を切り替える',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: '準備中',
    languagePlannedHint: 'この言語版はまだ公開されていません。',
    themeToggle: 'ダークモードを切り替える',
    menu: 'メニュー',
  },

  common: {
    advertisement: '広告',
    skipToContent: 'メインコンテンツへスキップ',
    backToTop: 'ページ上部へ戻る',
    breadcrumbLabel: 'パンくずリスト',
    home: 'ホーム',
    viewMap: '地図を見る',
    terminalMap: 'ターミナルマップ',
    /** Accessible iframe title on the ad slots (components/ads/). */
    /**
     * Airport page <title>/og:title. Airports with compiled data lead with the
     * counts Google is asked for; directory airports without terminal data get
     * an honest location-map title instead of promising a terminal map.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name}（${iata}）：ターミナル${counts.terminals}棟${
            counts.gates > 0 ? `、ゲート${counts.gates}か所` : ''
          } — ターミナルマップ`
        : `${year}年版 ${name}（${iata}） — 位置マップと空港ガイド`,
    /** H1 on the airport page; without terminal data the name stands alone. */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name}ターミナルマップ` : name,
    airportGuide: '空港ガイド',
    lastUpdated: '最近更新',
    updatedOn: (date: string) => `${date}に更新`,
    publishedOn: (date: string) => `${date}に公開`,
    readMore: 'ガイド全文を読む',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'ターミナル',
    gatesFact: 'ゲート',
    terminals: (n: number) => `ターミナル${n}棟`,
    terminalsShort: (n: number) => `ターミナル${n}棟`,
    gates: (n: number) => `ゲート${n}か所`,
    airports: (n: number) => `${n}空港`,
    airportsChip: (n: number) => `${n}空港`,
    pax: '旅客数',
    paxFull: '年間旅客数',
    distance: '市内中心部まで',
    distanceFrom: (city: string) => `${city}中心部から`,
    gatesLabel: (range: string) => `ゲート ${range}`,
    gatesCount: (n: number) => `ゲート${n}か所`,
    satellite: 'サテライトコンコース',
    airlinesLabel: '主な航空会社：',
  },

  search: {
    ariaLabel: '空港を検索',
    placeholder: '空港名、都市名、IATAコードで検索',
    heroPlaceholder: '空港名・都市名・IATAコードで検索 — 例：LHR / ドバイ / ヒースロー',
    submit: '空港を探す',
    loading: '検索中…',
    empty: '該当する空港が見つかりません',
    resultsTitle: (term: string) => `「${term}」の検索結果`,
    resultsCount: (n: number) => `該当する空港が${n}件見つかりました。`,
    noResults: '該当する空港がありません。都市名やIATAコードなど、別のキーワードでお試しください。',
    noResultsHint: 'お探しの空港が見つかりませんか？',
    viewAll: (n: number) => `全${n}空港を見る`,
    orBrowseByCountry: '国別に探す',
    range: (from: number, to: number, total: number) =>
      `全${total}空港中 ${from}〜${to}件を表示`,
  },

  hero: {
    eyebrow: '世界の空港ディレクトリ',
    titleLead: '空港と',
    titleAccent: 'ターミナルマップを巡る',
    sub: '国・地域別に整理された空港・ターミナルマップのコレクションで、主要な国際ハブから地方空港まで、どの空港でも迷わず移動できます。',
    stats: {
      countries: '国・地域',
      airports: '収録空港',
      terminals: 'ターミナルマップ',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs.
     */
    intro: {
      ariaLabel: 'このサイトについて',
      imageAlt: '日の出の頃、ガラス張りのターミナルの搭乗口に駐機する旅客機',
      blocks: [
        {
          title: '詳しいターミナルマップで、どの空港もスムーズに移動',
          body: '世界各地の空港やターミナルを移動するのは簡単ではありません。当サイトの空港マップでは、ターミナル、ゲート、チェックインエリア、手荷物受取所、ショップ、レストラン、ラウンジ、交通ハブの詳しい配置を確認できるので、出発前にルートを計画できます。',
        },
        {
          title: 'インタラクティブな空港ターミナルマップとフロア図',
          body: '主要な国際空港には複数のターミナルがあり、構造も複雑です。詳しい空港マップがあれば、ゲートの場所や設備を確認し、乗り継ぎを計画して、保安検査場、出発エリア、到着ロビーを効率よく移動できます。行き戻りする必要はありません。',
        },
        {
          title: '空港へのアクセスと交通情報',
          body: 'ターミナルの配置だけでなく、空港ガイドでは交通手段、駐車場情報、アクセスルートも紹介しています。搭乗ゲートへの最適な行き方、ターミナル間の移動、電車・バス・タクシー・レンタカーなどの地上交通を確認できます。',
        },
      ],
    },
    map: {
      kicker: '世界地図',
      title: '空港マップ',
      en: '空港マップ',
      sub: (airports: string, world: string) =>
        `世界中の定期便空港${world}か所を地図で確認できます。そのうち${airports}空港は当サイトでターミナルマップを公開しています。ドットをクリックすると、国・地域と詳細が表示されます。`,
      all: 'すべて',
      gEurope: 'ヨーロッパ',
      gAsia: 'アジア',
      gAmericas: 'アメリカ州',
      gAfrica: 'アフリカ',
      gOceania: 'オセアニア',
      legendSite: '当サイト収録 · クリックでターミナルマップ',
      legendWorld: 'その他の世界の定期便空港',
      countTemplate: '{n}空港を表示',
      download: 'データをダウンロード',
      downloadTitle: '現在の絞り込み条件の全空港をCSVで出力（IATA、名称、都市、国・地域、座標）',
      openAirport: '空港を見る',
    },
    popular: {
      kicker: 'ターミナルマップ',
      title: '人気の空港マップ',
      en: '空港マップ',
      sub: '世界の主要空港のターミナルマップ表紙を厳選しました。空港ページを開くと全体図を確認できます。',
    },
    recent: {
      kicker: '新着公開',
      title: '最近更新',
      en: '最近更新',
      sub: '新規追加・更新された空港、国・地域、旅行ガイド。',
      countriesTitle: '最近更新された国・地域',
    },
    /** Homepage route-map showcase: the widest direct networks. */
    routes: {
      kicker: '路線',
      title: '主要空港の路線マップ',
      en: '路線マップ',
      sub: '直行便の就航先が多い順に並べた空港です。開くと路線マップ、就航航空会社、目的地リストを確認できます。',
      collection: '路線マップ集',
      tabsLabel: '都市別の路線マップ',
      explore: (city: string) => `${city}の路線マップを見る`,
      play: 'スライドショーを開始',
      pause: 'スライドショーを一時停止',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: '最新写真',
      title: '最新の空港写真',
      en: '最新写真',
      sub: '最近追加された空港写真です。新着6空港から1枚ずつ掲載しています。',
      ariaLabel: '最新の空港写真カルーセル',
      prev: '前の写真',
      next: '次の写真',
      play: 'スライドショーを開始',
      pause: 'スライドショーを一時停止',
      counter: (index: number, total: number) => `${total}枚中${index}枚目`,
      view: (name: string) => `${name}の地図を見る`,
      /** Button overlaid on each picture: open that airport's page. */
      open: '空港ページを開く',
    },
    countries: {
      kicker: '国別',
      title: '国別の空港マップ',
      en: '国・地域',
      sub: '主要な国際ハブから地方空港まで、国・地域別に整理された空港ターミナルマップを眺められます。',
      more: 'すべての国',
    },
    all: {
      kicker: 'すべてのマップ',
      title: 'すべての空港マップ',
      en: 'すべての空港',
      sub: '世界で最も忙しい空港や旅行ハブの空港マップ。',
      hint: '空港を選ぶとターミナル配置が表示されます。',
      more: 'すべて見る',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose.
     */
    facts: {
      kicker: 'ディレクトリデータ',
      title: '空港データの概要',
      en: 'リストと表',
      sub: 'ディレクトリの数値をリストと表で整理しました。収録状況、年間旅客数が公開されている空港の中での上位、地域別の内訳を確認できます。',
      note: (pax: string, detailed: string, total: string) =>
        `旅客数データは全${total}空港中${pax}空港、ターミナル・ゲートデータは全${total}空港中${detailed}空港を対象としています。ターミナル数は当ディレクトリ独自の区分に基づくため、コンコースを含む場合があります。`,
      coverageTitle: '収録数',
      coverage: {
        airports: '空港',
        countries: '国・地域',
        regions: 'ディレクトリ地域',
        cities: '都市名（重複なし）',
        terminals: 'ターミナル',
        gates: 'ゲート',
        routes: '路線マップあり',
      },
      busiest: {
        title: '年間旅客数が多い空港',
        sub: '年間旅客数が公開されている空港の中から、上位12空港を掲載しています。',
        caption: '年間旅客数が公開されている空港のランキング',
        rank: '順位',
        iata: 'IATA',
        airport: '空港',
        city: '都市',
        country: '国・地域',
        terminals: 'ターミナル',
        gates: 'ゲート',
        pax: '年間旅客数（百万人）',
      },
      regions: {
        title: 'ディレクトリ地域別の空港',
        sub: 'ディレクトリ独自の地域区分で集計した空港、ターミナル、ゲートの数です。一部の国・地域は2つの地域にまたがります。',
        caption: 'ディレクトリ地域別の空港数',
        region: '地域',
        airports: '空港',
        detailed: '詳細データあり',
        terminals: 'ターミナル',
        gates: 'ゲート',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: '空港',
    city: '都市',
    country: '国',
    size: '規模',
    map: '地図',
    empty: '条件に一致する空港がありません。絞り込み条件を広げてみてください。',
  },

  pager: {
    label: 'ページ送り',
    previous: '前のページ',
    next: '次のページ',
  },

  filters: {
    searchPlaceholder: '空港名、都市名、IATAコードで検索',
    submit: '検索',
    country: '国',
    all: 'すべて',
    sort: '並び順',
    sortPax: '旅客数',
    sortName: '名称',
    sortIata: 'IATAコード',
    sortUpdated: '更新日',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `${country}の空港マップ一覧${sortLabel ? ` — ${sortLabel}順` : ''}`
        : `すべての空港マップ${sortLabel ? ` — ${sortLabel}順` : ''}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `ディレクトリに収録された${country}の全空港マップを1ページにまとめました。ターミナル配置、ゲート範囲、地上交通を掲載${sortLabel ? `。${sortLabel}順に並べています` : ''}。`
        : `空港マップディレクトリの全集を1ページにまとめました。ターミナル配置、ゲート範囲、地上交通を掲載${sortLabel ? `。${sortLabel}順に並べています` : ''}。`,
  },

  countries: {
    title: '国別に空港を探す',
    description:
      '国・地域別に世界の空港ターミナルマップディレクトリを眺めましょう。主要な国際ハブから地方空港まで、各国の空港数とターミナル数を確認できます。',
    sub: (countries: string, airports: string, terminals: string) =>
      `主要な国際ハブから地方空港まで、${countries}か国・地域、${airports}空港、ターミナル${terminals}棟を収録しています。`,
    regionCount: (countries: number, airports: number) =>
      `${countries}か国・地域 · ${airports}空港`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name}空港マップ — 全${count}空港` : `${name}の空港マップ`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? `（${nameEn}）` : ''}には${total}か所の定期便空港があり、そのうち${count}空港について当サイトでガイドページを公開しています。空港分布マップ、全国の空港リスト、直行路線もご覧いただけます。`
        : `${name}（${nameEn}）の${count}空港のターミナルマップです。${region}の主要な国際ハブと地方空港を収録し、ゲート、ターミナル配置、地上交通を確認できます。`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} AIRPORTS`,
    kicker: '空港マップ',
    titleOf: (name: string) => `${name}の空港`,
    en: '空港',
    sub: '空港を選ぶと、ターミナル配置、ゲート範囲、地上交通の情報が表示されます。',
    empty: 'この国・地域にはまだ空港が登録されていません。',
    moreKicker: 'その他の国',
    moreTitle: '他の国を見る',
    moreEn: 'その他の国',
    all: 'すべての国',
    notFound: '国が見つかりません',

    /** Airport overview: assembled from database fields. */
    introKicker: '概要',
    introTitle: (name: string) => `${name}の空港概要`,
    introEn: '空港概要',
    introSub: 'この国・地域の空港の規模、主要ハブ、就航都市をご紹介します。',
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
      `${o.name}${o.nameEn ? `（${o.nameEn}）` : ''}は${o.region}にあります。当サイトでは${o.airports}${
        o.terminals ? `、${o.terminals}` : ''
      }${o.gates ? `、${o.gates}` : ''}を収録しています。` +
      (o.busiest
        ? `年間旅客数では${o.busiest}（${o.busiestIata}）が最も多く、${o.busiestPax}です。`
        : '') +
      `空港は${o.cities}などの都市を結んでいます。${o.mapsNote}`,
    introMapsNote:
      '各空港ページには位置マップと空港コードを掲載し、収録されている場合はターミナル、ゲート、地上交通の情報も表示します。',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: '分布',
      title: (name: string) => `${name}の空港分布マップ`,
      en: '空港分布',
      sub: (covered: string, total: string) =>
        `全国の定期便空港は${total}か所（大型・中型・小型）で、そのうち${covered}空港について当サイトでガイドページを公開しています。以下に全リストを掲載します。`,
      mapAlt: (name: string, total: string) =>
        `${name}の空港分布マップ：定期便空港${total}か所`,
      siteTag: '当サイト収録',
      colAirport: '空港',
      colCity: '都市',
      colType: '種類',
      types: {
        large: '大型',
        medium: '中型',
        small: '小型',
      },
      empty: '全国の空港リストはまだありません。',
    },

    /** Related links */
    linksTitle: '関連リンク',
    linksEn: '関連リンク',
    linksSub: 'この国・地域と各空港の公式サイト、百科事典の項目をまとめています。',
    linksCountry: (name: string) => `${name}の参考情報`,
    linksAirports: (name: string) => `${name}の空港`,

    faqKicker: 'よくある質問',
    faqTitle: 'よくある質問',
    faqEn: '質問',
    faq: {
      airportTotal: (name: string) => `${name}には空港がいくつありますか？`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}には定期旅客便が就航する空港が${total}か所あります（大型・中型・小型）。当サイトではそのうち${covered}空港を詳しく紹介しています。上記の分布マップと全リストをご覧ください。`,
      airportCount: (name: string) => `${name}ではどの空港を収録していますか？`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `当サイトでは${name}の${count}空港を収録しています：${list}。`,
      busiest: (name: string) => `${name}で最も忙しい空港はどこですか？`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `年間旅客数では、${busiest}（${iata}）が当サイト収録の空港の中で最大で、${pax}です。`,
      terminals: (name: string) => `${name}の空港にはターミナルがいくつありますか？`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}で収録している空港には${terminals}があり、${gates}を備えています：${list}。`,
      cities: (name: string) => `${name}の空港はどの都市にありますか？`,
      citiesAnswer: (name: string, cities: string) =>
        `当サイトで収録している${name}の空港は、${cities}などの都市を結んでいます。空港ディレクトリでは都市名またはIATAコードで絞り込めます。`,
      maps: (name: string) => `${name}の空港にはターミナルマップがありますか？`,
      mapsAnswer: (name: string, count: string) =>
        `一部の空港にはあります。空港ページには位置マップ、空港コード、直行路線を掲載しており、${name}で収録している${count}空港のうち、情報が揃っている空港ではターミナル配置図、ゲート範囲、地上交通も表示します。各空港を開いてご確認ください。`,
    },
  },

  airport: {
    /**
     * Meta description assembled from formatted airport facts.
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
        ? `${o.name}（${o.iata}）にはターミナル${o.terminals}棟${
            o.gates ? `、ゲート${o.gates}か所` : ''
          }${o.pax ? `があり、年間旅客数は${o.pax}` : ''}${
            o.distance ? `。市内中心部から${o.distance}` : ''
          }。ターミナルマップでは、全ターミナル、ゲート範囲、地上交通を確認できます。`
        : `${o.name}（${o.iata}）は${o.city}、${o.country}にあります。位置マップ、空港コード、旅行情報を掲載しています。`,
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
      const where = o.city === o.country ? o.city : `${o.city}、${o.country}`;
      const kind = o.kind ? AIRPORT_KIND[o.kind] : '空港';
      const head = `${o.name}（IATA: ${o.iata}${o.icao ? `、ICAO: ${o.icao}` : ''}）は${where}にある${kind}です`;
      return o.terminals > 0
        ? `${head}。ターミナル${o.terminals}棟${
            o.gates > 0 ? `、ゲート${o.gates}か所` : ''
          }${o.distance ? `を備え、${o.city}中心部から約${o.distance}です` : 'を備えています'}。`
        : `${head}。`;
    },
    mapTitle: (iata: string) => `${iata} · ターミナル配置`,
    mapNote: 'ターミナル配置',
    realMapTitle: (iata: string) => `${iata} 空港ターミナルマップ — ゲートと構内案内`,
    /** Alt text for the terminal-map images. */
    mapAlt: (name: string, iata: string) =>
      `${name}（${iata}）のターミナルマップ。全ターミナル、ゲート範囲、コンコースを表示`,
    realMapNote: 'ターミナルマップ',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: '写真',
    photosTitle: '空港写真',
    photosEn: '空港写真',
    photosSub:
      'この空港の実際の写真です。いずれも公開ウェブページを出典として明記しており、著作権は撮影者に帰属します。写真をクリックすると拡大表示され、クレジットをクリックすると元のページが開きます。',
    photosCredit: (host: string) => `出典：${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name}（${iata}）の空港写真${index}`,
    photosZoom: (name: string, index: number) => `${name}の写真${index}を拡大表示`,
    /** Download buttons under the map. */
    zoomLabel: 'ズーム',
    zoomClose: '閉じる',
    zoomIn: '拡大',
    zoomOut: '縮小',
    downloadKicker: 'ダウンロード',
    downloadTitle: '空港マップをダウンロード',
    downloadEn: 'ダウンロード',
    downloadMapLabel: (year: number, iata: string) =>
      `${year}年版 ${iata}空港ターミナルマップ・フロア図 ダウンロード`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}年版 ${iata}空港ターミナルマップ PDF ダウンロード`,
    timeKicker: '時刻',
    timeTitle: (iata: string) => `空港の時刻情報 — ${iata}の現在時刻`,
    timeEn: '空港時刻',
    timeSub: (iata: string, tz: string) => `${iata}（${tz}）の現在時刻と、あなたの現地時刻を比較できます。`,
    clockAirport: '空港の現在時刻',
    clockLocal: 'あなたの現地時刻',
    infoKicker: '情報',
    infoTitle: '空港情報と詳細',
    infoEn: '空港の詳細',
    infoIata: '空港のIATAコード',
    infoLocation: '空港の所在地',
    infoCoords: '座標',
    infoTimezone: 'タイムゾーン',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'リンク',
    linksTitle: '関連リンク',
    linksEn: '関連リンク',
    linksSub: 'この空港の外部参考リンクです：公式サイト、Wikipedia、百度百科。',
    officialSite: '公式サイト',
    wikiLabel: 'Wikipedia',
    baikeLabel: '百度百科',
    /** Named sources cited under the link buttons. */
    sourcesLabel: '出典：',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'OurAirports オープンデータ',
    sourcesNote:
      '空港コード、座標、空港区分はオープンデータをもとに整理しています。ページの詳細は各空港の公式情報に基づきます。',
    mapEmbedKicker: '地図',
    mapEmbedTitle: (name: string) => `インタラクティブマップ — ${name}の位置`,
    mapEmbedEn: 'インタラクティブマップ',
    extMapsNote: '他の地図サービスでこの空港を見る：',
    routeMapKicker: '路線',
    routeMapTitle: (name: string) => `${name}の路線マップ — 直行便の目的地`,
    routeMapEn: '路線マップ',
    routeMapAria: (name: string) => `${name}からの直行路線マップ`,
    routeLegendTitle: '色の見方',
    routeLegendClose: '凡例を隠す',
    routeReset: '地図をリセット',
    routeZoomIn: '拡大',
    routeZoomOut: '縮小',
    routeFullscreen: '全画面表示',
    routeExitFullscreen: '全画面表示を終了',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: '{iata}空港ページを開く',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '航空会社6社以上',
      major: '航空会社3〜5社',
      minor: '航空会社2社',
      single: '航空会社1社',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n}社の航空会社',
    routeTableDest: '目的地',
    routeTableCountry: '国・地域',
    routeTableDistance: '距離',
    routeTableCarriers: '就航航空会社',
    routeCarriersMore: (n: number) => ` ほか${n}社`,
    routeMapNote: (date: string) =>
      `路線データのスナップショット：${date}（直行便のみ）。出典：`,
    legendTerminal: 'ターミナル棟',
    legendTransit: '地上交通の拠点',
    legendCorridor: 'ターミナル間連絡通路',
    terminalsKicker: 'ターミナル',
    terminalsTitle: 'ターミナルガイド',
    terminalsEn: 'ターミナルガイド',
    terminalsSub: (name: string) =>
      `${name}の各ターミナルのゲート範囲、主な航空会社、施設をご案内します。`,
    transitTitle: '地上交通',
    facilitiesTitle: '空港施設',
    faqKicker: 'よくある質問',
    faqTitle: 'よくある質問',
    faqEn: '質問',
    guideKicker: 'ガイド',
    guideTitle: '空港ガイド',
    guideEn: '空港ガイド',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: '記事',
    blogTitle: (iata: string) => `${iata}空港ガイド`,
    blogEn: 'ブログから',
    blogSub: (iata: string, count: number) =>
      `当サイトの${count}件の記事で${iata}を特集しています。到着、地上交通、手荷物、乗り継ぎについて解説しています。`,
    blogAll: 'すべての記事',
    relatedTitle: (country: string) => `${country}のその他の空港`,
    relatedEn: (country: string) => `${country}のその他`,
    relatedAll: (country: string) => `${country}のすべての空港`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport.
     */
    flights: {
      kicker: 'フライト',
      title: (name: string) => `${name}発着便 — 出発と到着`,
      en: 'フライトボード',
      sub: (flights: string, airlines: string, destinations: string) =>
        `便名${plural(flights, '件', '件')}、${plural(airlines, '社', '社')}の航空会社、${plural(
          destinations,
          'か所',
          'か所'
        )}の目的地を出発・到着別に掲載しています。コードシェア便も含みます。`,
      statDepartures: '出発便名',
      statArrivals: '到着便名',
      statAirlines: '航空会社',
      statDestinations: '目的地',
      note: (date: string) =>
        `便名と路線はaviability.comのフライトインデックス（スナップショット：${date}）に基づきます。コードシェア便を含み、出発時刻は掲載していません。出典：`,
      source: 'aviability.com',
      tabDepartures: '出発',
      tabArrivals: '到着',
      search: '便名、航空会社、都市で検索',
      clearSearch: '検索をクリア',
      flight: '便',
      airline: '航空会社',
      destination: '目的地',
      origin: '出発地',
      country: '国・地域',
      empty: 'この検索条件に一致する便はありません。',
      loading: 'フライトを読み込み中…',
      error: 'これ以上フライトを読み込めませんでした。',
      retry: 'もう一度試す',
      previous: '前へ',
      next: '次へ',
      pagination: 'ページ送り',
      showing: '全{total}件中 {from}〜{to}件の便名を表示',
      pageOf: '{pages}ページ中{page}ページ',
    },
    notFound: '空港が見つかりません',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${year}年版 ${name}（${iata}）路線マップ — 直行目的地${count}か所`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name}（${iata}）の直行路線マップ。直行目的地${count}か所について、就航航空会社、距離、全目的地リストを掲載しています。`,
    heading: (name: string) => `${name}の路線マップ`,
    headingSub: (iata: string, count: string) =>
      `${iata}の直行目的地は${count}か所で、就航航空会社の数に応じて色分けしています。`,
    backToAirport: (iata: string) => `${iata}空港ページに戻る`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `${iata}の便名`,
    /** Button on the airport page's teaser card. */
    openFull: '路線マップを見る',
    /** Same card, for airports whose network the repo has rendered. */
    previewCta: (iata: string) => `${iata}の路線マップ全体を見る`,
    teaserSub: (count: string) => `直行目的地${count}か所。地図、就航航空会社、距離を掲載しています。`,
    /** Section headings, each naming the airport. */
    mapSectionTitle: (name: string) => `${name}の直行路線マップ`,
    tableKicker: (iata: string) => `${iata} · 目的地`,
    tableSectionTitle: (name: string) => `${name}の直行目的地リスト`,
    tableSectionEn: (iata: string) => `${iata} 目的地`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: '目的地',
    tableSectionSub: (count: string) =>
      `直行目的地${count}か所を、就航航空会社の多い順に掲載しています。距離と就航航空会社も確認できます。`,
    dataKicker: 'ダウンロード',
    dataTitle: '路線データのダウンロード',
    dataEn: 'データ',
    dataSub: (count: number) =>
      `${count}件の直行路線データを収録しています。目的地、IATAコード、都市、国・地域、距離、就航航空会社を含み、表計算ソフトやスクリプトで利用できます。`,
    dataFields: 'CSVはExcel / Numbers、JSONはプログラム向けです。いずれもUTF-8です。',
    dataCsv: 'CSVをダウンロード',
    dataJson: 'JSONをダウンロード',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'ターミナルとゲートの配置をひと目で確認。画像をクリックすると、空港ページで全体マップ、ターミナル施設、地上交通をご覧いただけます。',
    airportMapCta: (iata: string) => `${iata}のターミナルマップ全体を見る`,
    /** Header fact cells. */
    factDestinations: '直行目的地',
    factAirlines: '就航航空会社',
    factCountries: '国・地域',
    factSnapshot: 'データスナップショット',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `${name}から直行便で行ける場所はいくつありますか？`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name}（${iata}）の直行目的地は${count}か所で、${countries}の国・地域にまたがります。直行便のみを数えており、乗り継ぎを伴う旅程は含みません。`,
    faqAirlinesQ: (name: string) => `${name}からは何社の航空会社が運航していますか？`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count}社の航空会社がこの空港からの直行路線を運航しています。路線網が最も広いのは${leaders}です（括弧内は目的地数）。`,
    faqFarthestQ: (name: string) => `${name}からの最長直行目的地はどこですか？`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `最も遠い直行目的地は${country}の${city} ${iata}で、約${km} km離れています。`,
    faqBusiestQ: () => 'どの目的地に最も多くの航空会社が就航していますか？',
    faqBusiestA: (count: string, list: string) =>
      `${count}か所の目的地に3社以上の航空会社が就航しており、最も競争が激しいのは${list}です。`,
    faqSourceQ: () => '路線データはどのくらいの頻度で更新されますか？',
    faqSourceA: (date: string, source: string, license: string) =>
      `このページの路線は${source}のオープンデータセット（${license}）に基づく${date}時点のスナップショットで、リアルタイムの運航計画ではありません。チケットと時刻は航空会社または空港にご確認ください。`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline}便 — ${from}発${to}行`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number}は${airline}が${from}から${to}まで運航する便名です${distance ? `（大円距離 約${distance}）` : ''}。路線マップ、出発・到着空港、距離、同じ路線の他の便を掲載しています。`,
    heading: (number: string) => `${number}便`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number}は${airline}が${from}と${to}の間で運航する便名です${distance ? `（大円距離 約${distance}）` : ''}。`,
    factFlight: '便名',
    factFrom: '出発',
    factTo: '到着',
    factDistance: '距離',
    overviewKicker: '概要',
    overviewTitle: (number: string) => `${number}便の概要`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number}は${airline}が${originName}（${originIata}）と${destName}（${destIata}）の間で運航する便名です${distance ? `（両空港の距離は約${distance}）` : ''}。このページでは便名、航空会社、路線、出発・到着空港をまとめて確認できます。`,
    overviewNote:
      'フライトインデックスには出発・到着時刻、機材、運航日は含まれていません。運航スケジュール、チェックイン、搭乗時刻は航空会社または空港にご確認ください。',
    routeKicker: '路線',
    routeTitle: (from: string, to: string) => `${from} → ${to}の路線`,
    routeDiagramAria: (number: string) => `${number}便の路線図`,
    routeMapAria: (number: string) => `${number}便の路線マップ`,
    airportsKicker: '空港',
    airportsTitle: '出発空港と到着空港',
    airportsSub:
      'この便が結ぶ空港です。ディレクトリに収録されている空港は、それぞれのページを開けます。',
    originAirport: '出発空港',
    destinationAirport: '到着空港',
    airportPage: '空港ページを開く',
    detailsKicker: '詳細',
    detailsTitle: '便の詳細',
    detailsFlight: '便名',
    detailsAirline: '航空会社',
    detailsOrigin: '出発空港',
    detailsDestination: '到着空港',
    detailsDistance: '大円距離',
    detailsRoutes: '掲載路線数',
    detailsSnapshot: 'データスナップショット',
    routesKicker: '路線',
    routesTitle: 'この便名の路線',
    routesSub: (count: string) =>
      `この便名は${count}件の路線に登場します。同じ便名がコードシェアパートナーによって再利用される場合があります。`,
    routesRoute: '路線',
    routesAirline: '航空会社',
    routesDistance: '距離',
    relatedKicker: '関連',
    relatedTitle: '同じ路線の他の便',
    relatedSub: '同じ出発空港から同じ到着空港へ向かう他の便名です。',
    relatedEn: 'その他の便',
    faqKicker: 'よくある質問',
    faqTitle: 'よくある質問',
    faqEn: '質問',
    faqWhat: (number: string) => `${number}便とは何ですか？`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number}は${airline}が${from} → ${to}の路線で使用する便名です${distance ? `（両空港の距離は約${distance}）` : ''}。`,
    faqRoute: (number: string) => `${number}便はどこへ飛びますか？`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `${number}便は${originName}（${originIata}）から${destName}（${destIata}）へ飛びます。`,
    faqTimes: (number: string) => `${number}便の発着時刻はどこで確認できますか？`,
    faqTimesAnswer: (number: string) =>
      `このページでは${number}の便名、航空会社、路線、空港を掲載しています。aviability.comのフライトインデックスには発着時刻が含まれていないため、最新のスケジュールは航空会社または空港にご確認ください。`,
    note: (date: string) =>
      `便名、航空会社、路線はaviability.comのフライトインデックス（スナップショット：${date}）に基づきます。発着時刻は含まれていません。出典：`,
    source: 'aviability.com',
    sourceFlight: 'aviability.comで見る',
    viewAirport: (iata: string) => `${iata}空港ページを開く`,
    notFound: '便が見つかりません',
  },

  faq: {
    terminalCount: (name: string) => `${name}にはターミナルがいくつありますか？`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name}（${iata}）にはターミナル${terminals}棟があり、合計ゲート${gates}か所を備えています：${list}。`,
    gateCount: (name: string) => `${name}にはゲートがいくつありますか？`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name}（${iata}）には合計ゲート${gates}か所があります：${list}。`,
    whereIs: (iata: string) => `${iata}はどこにありますか？`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata}は${name}（${nameEn}）のIATAコードで、${country}の${city}${
        cityEn ? `（${cityEn}）` : ''
      }にあります。`,
    distance: (name: string, city: string) => `${name}は${city}中心部からどのくらい離れていますか？`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name}は${city}中心部から約${distance}です。${transit}などで市内へアクセスできます。`,
    access: (name: string, city: string) => `${name}から${city}市内へはどう行けばいいですか？`,
    accessAnswer: (options: string) => `${options}。`,
    facilities: (name: string) => `${name}にはどんな施設がありますか？`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}には${facilities}などの施設があります。各ターミナルでの配置は上記のターミナル配置図をご覧ください。`,
    location: (name: string) => `${name}はどこにありますか？`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name}（${nameEn}、IATAコード ${iata}）は${country}の${city}${
        cityEn ? `（${cityEn}）` : ''
      }にあります。`,
    airlines: (name: string) => `${name}の各ターミナルではどの航空会社が運航していますか？`,
    airlinesAnswer: (name: string, list: string) =>
      `${name}のターミナル別の主な航空会社：${list}。航空会社とゲートの割り当ては変更される場合があります。搭乗券と空港の案内表示で必ずご確認ください。`,
    timezone: (name: string) => `${name}はどのタイムゾーンですか？`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name}（${iata}）は${tz}のタイムゾーンです。ページ上部の空港時計で現地時刻と比較できます。`,
    flightsCount: (name: string) => `${name}にはいくつの便名が掲載されていますか？`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.comのフライトインデックスには、${name}（${iata}）の出発便名${plural(
        departures,
        '件',
        '件'
      )}と到着便名${plural(arrivals, '件', '件')}が掲載されており、${plural(
        airlines,
        '社',
        '社'
      )}の航空会社と${plural(destinations, 'か所', 'か所')}の目的地をカバーしています（スナップショット：${date}）。コードシェア便を含み、スケジュールは変更される場合があります。旅行前に航空会社へご確認ください。`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'World Airport Maps 編集チーム',
    role: '編集・監修：',
    sourcesNote: '公開情報と空港の公式情報をもとに作成',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'このページの内容',
    map: 'ターミナルマップ',
    photos: '空港写真',
    time: '空港時刻',
    details: '空港情報',
    links: '関連リンク',
    location: '位置マップ',
    routes: '路線マップ',
    flights: 'フライト',
    guide: '空港ガイド',
    blog: '関連ガイド',
    terminals: 'ターミナルガイド',
    transport: '地上交通',
    facilities: '施設',
    faq: 'よくある質問',
    flightOverview: '便の概要',
    flightRoute: '路線',
    flightAirports: '空港',
    flightDetails: '便の詳細',
    flightRoutes: 'すべての路線',
    flightRelated: '関連する便',
    intro: '空港概要',
    distribution: '空港分布',
    airports: '空港リスト',
  },

  error: {
    title: 'このページを読み込めませんでした',
    sub: '空港データの読み込み中に問題が発生しました。もう一度お試しいただくか、ホームページに戻って閲覧を続けてください。',
    retry: 'もう一度試す',
    backHome: 'ホームページに戻る',
    notFoundTitle: '404 · ページが見つかりません',
    notFoundSub: 'お探しのページは移動または削除された可能性があります。空港を検索するか、以下のリンクから閲覧を続けてください。',
  },

  footer: {
    sponsored: '広告',
    mapsTitle: '詳しいターミナルマップ',
    mapsBody:
      '空港やターミナル内の移動は難しいものです。当サイトの空港マップでは、ターミナル、ゲート、チェックインエリア、手荷物受取所、ショップ、レストラン、ラウンジ、交通ターミナルの詳しい配置を確認でき、旅をよりスムーズにします。',
    plansTitle: 'インタラクティブなターミナル配置図',
    plansBody:
      '主要な国際空港は複数のターミナルを持ち、構造も複雑です。詳しいマップでゲートの場所と施設を確認し、乗り継ぎを計画して、保安検査、出発、到着を効率よく移動できます。',
    transitTitle: '空港へのアクセスと交通',
    transitBody:
      'ターミナルの配置だけでなく、交通手段、駐車場、アクセスルートも紹介しています。ゲートへの行き方、ターミナル間の移動、電車・バス・タクシー・レンタカーなどの地上交通を確認できます。',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries}か国・地域 · ${airports}空港 · ターミナル${terminals}棟 · ターミナル配置図付き`,
    fallback: '世界の空港のターミナル配置図と地上交通ガイド',
    linksLabel: 'フッターナビゲーション',
    about: 'このサイトについて',
    contact: 'お問い合わせ',
    sources: 'データ出典',
    privacy: 'プライバシーポリシー',
    disclaimer: '免責事項',
    terms: '利用規約',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: jaTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: '探す',
    title: '分野別に見る',
    en: '分野別に見る',
    sub: '国別、地域別、都市別など、目的に合った切り口でディレクトリに入れます。最も忙しいハブ、最新の更新、空港ガイドへ直接進むこともできます。',
    allAirports: {
      title: 'すべての空港',
      body: '旅客数順に並んだ完全なディレクトリ。国で絞り込み、並び順も変更できます。',
    },
    byCountry: {
      title: '国別',
      body: '各国・地域の空港、ターミナル、ゲートの数を確認できます。',
    },
    byRegion: {
      title: '地域別',
      body: '国・地域を東アジア、ヨーロッパ、北米などに分類し、目的の地域をすばやく見つけられます。',
    },
    popularCities: {
      title: '人気の都市',
      body: '年間旅客数の多い空港都市と、各都市のすべての空港を紹介します。',
    },
    recentlyUpdated: {
      title: '最近更新',
      body: '新規追加・更新された空港情報を、更新日時の新しい順に掲載しています。',
    },
    guides: {
      title: '空港ガイド',
      body: 'ターミナル間の移動、市内へのアクセス、実用的なヒントをまとめた長編ガイドです。',
    },
    routes: {
      title: '路線マップ',
      body: '空港の直行路線網を目的地数順に表示し、就航航空会社と距離も確認できます。',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'ガイド',
    title: '空港ガイド',
    en: '空港ガイド',
    sub: 'ターミナル配置図に加えて、主要ハブ向けの長編ガイドも用意しています。ゲート番号の読み方、ターミナル間の移動方法、市内へのアクセス方法を解説します。',
    more: 'この空港を見る',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the Japanese
   * wording of the same UI.
   */
  blog: {
    kicker: 'ジャーナル',
    title: '旅のノート',
    nav: 'ブログ',
    en: '旅のノート',
    sub: '編集部からの長編ノート。入国・到着、乗り継ぎ、ターミナル施設、休憩スポットなどを紹介します。',
    more: '読む',
    all: 'すべての記事',
    morePosts: 'さらに記事を読む',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: '空港',
    airportsTitle: 'この記事の空港',
    airportsEn: '掲載空港',
    airportsSub: '空港ページを開くと、ターミナルマップ、地上交通、よくある質問を確認できます。',
    back: '記事一覧に戻る',
    empty: '記事はまだありません。',
    readingMinutes: (n: number) => `約${n}分で読めます`,
    source: (name: string) => `出典：${name}`,
    tags: 'タグ',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'コメント',
    title: '読者コメント',
    en: 'ディスカッション',
    sub: '質問、旅行記、訂正など、お気軽にお寄せください。コメントは公開されます。',
    formTitle: 'コメントを書く',
    countOne: '1件のコメント',
    countMany: '{n}件のコメント',
    empty: 'まだコメントはありません。最初のコメントをお寄せください。',
    loading: 'コメントを読み込み中…',
    loadError: '現在コメントを利用できません。',
    retry: 'もう一度試す',
    nameLabel: '名前',
    namePlaceholder: 'お名前をお聞かせください',
    bodyLabel: 'コメント',
    bodyPlaceholder: '体験談、質問、補足情報などをお書きください…',
    submit: 'コメントを投稿',
    submitting: '投稿中…',
    success: '投稿しました。共有いただきありがとうございます。',
    error: 'コメントを投稿できませんでした。しばらくしてからもう一度お試しください。',
    rateLimited: '投稿が早すぎます。数分お待ちいただいてから、もう一度お試しください。',
    nameError: '名前を入力してください（2〜40文字）。',
    bodyError: 'コメントを入力してください（5〜2000文字）。',
    note: 'コメントは公開され、投稿者ご自身の見解を示すものです。礼儀を守り、広告や個人情報は投稿しないでください。',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name}のターミナル配置図`,
    gates: 'ゲート',
    terminal: 'ターミナル',
    corridor: '連絡通路',
    transit: '地上交通',
    footer: (iata: string) => `${iata} · ターミナル配置`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'オンラインツール',
    hub: {
      kicker: 'ツール',
      title: '地図・座標ツール',
      en: '無料ツール',
      sub: '旅行者と地理好きのための無料オンラインツール。ブラウザで開くだけで使え、インストールは不要です。',
      description:
        '無料のオンライン地図・座標ツール：WGS84 / GCJ02 / BD09 の座標変換、十進度と度分秒の相互変換、2地点間の大円距離計算。2言語対応で、ブラウザですぐに使えます。',
      comingTitle: '開発中のツール',
      comingSub: '座標取得、位置共有、投影計算などのツールを準備中です。',
    },
    howTitle: '使い方',
    relatedTitle: '関連ツール',
    allTools: 'すべてのツール',
    tools: {
      coordinateConverter: {
        title: '座標変換',
        en: '座標コンバーター',
        description:
          'WGS84、GCJ02、BD09の間で座標を変換します。中国の地図ずれ問題を解消できます。',
        note: 'WGS84はGPSおよび国際標準の座標系です。GCJ02は中国本土で求められるオフセット座標系（通称「火星座標」）で、Amap（高徳地図）やTencent Maps（騰訊地図）が使用しています。BD09はGCJ02にさらにオフセットを加えたもので、Baidu Maps（百度地図）が使用しています。同じ地点でも座標系によって100〜700 mの差が出るため、別の地図サービスで座標を使う前に変換してください。',
        steps: [
          '緯度、経度の順に十進数の座標を入力します（例：39.9042, 116.4074）。',
          '入力に使う座標系を選択します。',
          '「変換」を押すと残り2つの座標系の結果が表示されます。「コピー」で結果を保存できます。',
        ],
        inputLabel: '座標（緯度, 経度）',
        inputPlaceholder: '例：39.9042, 116.4074',
        sourceLabel: '入力座標系',
        wgs84: 'WGS84 · GPS / 国際標準',
        gcj02: 'GCJ02 · Amap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: '小数点以下の桁数',
        submit: '変換',
        copy: 'コピー',
        copied: 'コピーしました',
        error: '座標を解析できませんでした。「緯度, 経度」の形式で入力してください（例：39.9042, 116.4074）。',
      },
      dmsConverter: {
        title: '座標形式変換',
        en: '座標形式コンバーター',
        description:
          '十進度（DD）、度分（DM）、度分秒（DMS）の間で座標を変換します。入力形式は自動で判別されます。',
        note: 'DD（39.9042°）は機器やAPIで一般的な小数表記です。DMS（39°54′15″N）は海運、航空、測量でよく使われます。DM（39°54.25′N）は野外記録でよく見られます。このツールは緯度・経度それぞれに含まれる数値の組の数（1組＝DD、2組＝DM、3組＝DMS）から入力形式を判別し、3形式すべてを出力します。半球はN/S/E/Wで示します。',
        steps: [
          '座標を1組入力します。39.9042、39°54′15″N、39°32.5′E などの形式に対応しており、2つの値はカンマで区切ります。',
          '出力の小数点以下の桁数を選択します。',
          '「変換」を押すと3形式すべてが表示されます。「コピー」で保存できます。',
        ],
        inputLabel: '座標（1組、カンマ区切り）',
        inputPlaceholder: '例：39°54′15″N, 116°24′51″E または 39.9042, 116.4074',
        precisionLabel: '小数点以下の桁数',
        submit: '変換',
        ddLabel: '十進度（DD）',
        dmLabel: '度分（DM）',
        dmsLabel: '度分秒（DMS）',
        copy: 'コピー',
        copied: 'コピーしました',
        error: '座標を解析できませんでした。39.9042、39°54′15″N、39°32.5′E などの形式に対応しています。2つの値はカンマで区切ってください。',
      },
      distanceCalculator: {
        title: '距離計算',
        en: '距離計算ツール',
        description:
          '地球上の2地点間の大円距離と初期方位角を計算します。',
        note: '距離はHaversineの大円公式（地球の平均半径 6,371.0088 km）を使用しており、地表に沿った最短経路を表します。初期方位角は、1地点目から2地点目へ向かう方角で、北を0°として時計回りに増加します。',
        steps: [
          '始点と終点の緯度・経度を入力します。',
          '「距離を計算」を押します。',
          'キロメートル、マイル、海里での距離と初期方位角が表示されます。',
        ],
        fromLabel: '始点',
        toLabel: '終点',
        inputPlaceholder: '緯度, 経度',
        example: '例：北京 → 上海',
        submit: '距離を計算',
        km: 'km',
        mi: 'mi',
        nmi: 'nmi',
        bearing: '初期方位角',
        copy: 'コピー',
        copied: 'コピーしました',
        error: '座標を解析できませんでした。「緯度, 経度」の形式で、緯度は-90〜90、経度は-180〜180の範囲で入力してください。',
      },
    },
  },
};
