import type { Messages } from './zh';

/**
 * Korean catalog. Typed against the Chinese source of truth (`Messages`), so a
 * missing or renamed key fails `npm run typecheck`.
 *
 * Style: formal polite prose (합니다/습니다체), noun-phrase labels for buttons and
 * table headers, Korean punctuation (`, ` `.` `·`) with “smart quotes”; airport
 * names, IATA/ICAO codes, URLs and airline names stay in their international
 * form. Counted nouns use the Korean `${n}개 …` pattern, and both numeric
 * arguments that arrive pre-formatted and raw numbers are handled the same way.
 */

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: '대형 공항',
  medium: '중형 공항',
  small: '소형 공항',
  heliport: '헬리포트',
} as const;

export const ko: Messages = {
  site: {
    name: '세계 공항 지도',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: '세계 공항',
    nameAccent: '지도',
    tagline: '공항 및 터미널 지도',
    description:
      '국가와 지역별로 정리된 전 세계 공항 터미널 지도를 살펴보세요. 주요 국제 허브부터 지역 공항까지 게이트, 체크인 구역, 수하물 수취대, 상점, 레스토랑, 라운지, 지상 교통의 상세한 배치를 확인할 수 있습니다.',
    keywords: [
      '공항 지도',
      '터미널 지도',
      '공항 평면도',
      '게이트',
      '공항 교통',
      'airport maps',
      'terminal maps',
    ],
    numberOfItems: (n: number) => `${n}개 공항`,
  },

  nav: {
    home: '홈',
    airports: '전체 공항',
    countries: '국가별 보기',
    tools: '온라인 도구',
    about: '소개',
    label: '주요 내비게이션',
    languageLabel: '언어',
    switchLanguage: '언어 변경',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: '준비 중',
    languagePlannedHint: '해당 언어 버전은 아직 공개되지 않았습니다.',
    themeToggle: '다크 모드 전환',
    menu: '메뉴',
  },

  common: {
    skipToContent: '본문으로 건너뛰기',
    backToTop: '맨 위로',
    breadcrumbLabel: '이동 경로',
    home: '홈',
    viewMap: '지도 보기',
    terminalMap: '터미널 지도',
    /** Accessible iframe title on the ad slots (components/ads/). */
    advertisement: '광고',
    /**
     * Airport page <title>/og:title. Airports with compiled terminal data lead
     * with the counts the search queries ask for; directory airports without
     * that data get an honest location-map title.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name}(${iata}) 터미널 지도: 터미널 ${counts.terminals}개${
            counts.gates > 0 ? `, 게이트 ${counts.gates}개` : ''
          }`
        : `${year}년 최신 ${name}(${iata}) 위치 및 지도`,
    /** H1 on the airport page; without terminal data the name stands alone. */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} 터미널 지도` : name,
    airportGuide: '공항 안내',
    lastUpdated: '최근 업데이트',
    updatedOn: (date: string) => `${date} 업데이트`,
    publishedOn: (date: string) => `${date} 게시`,
    readMore: '전체 안내 보기',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: '터미널',
    gatesFact: '게이트',
    terminals: (n: number) => `${n}개 터미널`,
    terminalsShort: (n: number) => `${n}개 터미널`,
    gates: (n: number) => `${n}개 게이트`,
    airports: (n: number) => `${n}개 공항`,
    airportsChip: (n: number) => `${n}개 공항`,
    pax: '연간 여객',
    paxFull: '연간 여객 수',
    distance: '시내까지',
    distanceFrom: (city: string) => `${city} 시내까지`,
    gatesLabel: (range: string) => `게이트 ${range}`,
    gatesCount: (n: number) => `${n}개 게이트`,
    satellite: '위성 터미널',
    airlinesLabel: '주요 항공사: ',
  },

  search: {
    ariaLabel: '공항 검색',
    placeholder: '공항, 도시 또는 IATA 코드 검색',
    heroPlaceholder: '공항 이름, 도시 또는 IATA 코드로 검색하세요. 예: ICN / 두바이 / 히스로',
    submit: '공항 찾기',
    loading: '검색 중…',
    empty: '일치하는 공항이 없습니다',
    resultsTitle: (term: string) => `“${term}” 검색 결과`,
    resultsCount: (n: number) => `일치하는 공항 ${n}개를 찾았습니다.`,
    noResults: '일치하는 공항이 없습니다. 도시 이름이나 IATA 코드 등 다른 검색어를 입력해 보세요.',
    noResultsHint: '원하는 공항을 찾지 못하셨나요?',
    viewAll: (n: number) => `공항 ${n}개 모두 보기`,
    orBrowseByCountry: '국가별로 찾아보기',
    range: (from: number, to: number, total: number) =>
      `${total}개 공항 중 ${from}–${to} 표시`,
  },

  hero: {
    eyebrow: '세계 공항 디렉터리',
    titleLead: '공항과',
    titleAccent: '터미널 지도',
    sub: '공항과 터미널 지도를 한데 모아, 어느 공항에서든 길을 쉽게 찾으세요. 국가와 지역별로 정리된 지도로 주요 국제 허브부터 지역 공항까지 살펴볼 수 있습니다.',
    stats: {
      countries: '수록 국가 / 지역',
      airports: '수록 공항',
      terminals: '터미널 지도',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: '사이트 소개',
      imageAlt: '일출 무렵 유리 외벽 터미널의 게이트에 정박한 여객기',
      blocks: [
        {
          title: '상세한 터미널 지도로 어느 공항이든 쉽게 이동하세요',
          body: '전 세계 공항과 터미널을 오가는 일은 쉽지 않습니다. 사이트에 수록된 공항 지도는 터미널, 게이트, 체크인 구역, 수하물 수취대, 상점, 레스토랑, 라운지, 교통 거점의 배치를 상세히 보여 주어, 출발 전에 미리 경로를 계획하고 여유롭게 이동할 수 있습니다.',
        },
        {
          title: '인터랙티브 공항 터미널 지도와 층별 안내',
          body: '대형 국제 공항은 터미널이 여러 개이고 내부 구조도 복잡합니다. 상세한 공항 지도는 게이트를 찾고, 편의 시설을 확인하고, 환승 동선을 계획하며, 보안 검색대와 출발 구역, 도착 홀을 효율적으로 통과하도록 도와줍니다.',
        },
        {
          title: '공항 교통과 접근 방법 안내',
          body: '터미널 배치뿐 아니라 교통수단, 주차 정보, 접근 경로도 공항 안내에 담았습니다. 게이트로 가는 가장 빠른 길, 터미널 간 이동, 기차·버스·택시·렌터카를 이용한 시내 이동까지 이곳에서 확인하세요.',
        },
      ],
    },
    map: {
      kicker: '세계 지도',
      title: '공항 분포 지도',
      en: '공항 지도',
      sub: (airports: string, world: string) =>
        `전 세계 정기편 공항 ${world}개를 지도에서 찾아보세요. 이 중 ${airports}개는 터미널 지도도 제공합니다. 점을 클릭하면 국가 / 지역과 공항 정보를 확인할 수 있습니다.`,
      all: '전체',
      gEurope: '유럽',
      gAsia: '아시아',
      gAmericas: '아메리카',
      gAfrica: '아프리카',
      gOceania: '오세아니아',
      legendSite: '사이트 수록 · 클릭하면 터미널 지도',
      legendWorld: '전 세계 기타 정기편 공항',
      countTemplate: '{n}개 공항 표시',
      download: '데이터 다운로드',
      downloadTitle:
        '현재 필터의 모든 공항을 CSV로 내려받기 (IATA, 이름, 도시, 국가 / 지역, 좌표)',
      openAirport: '공항 상세 보기',
    },
    popular: {
      kicker: '터미널 지도',
      title: '인기 공항 지도',
      en: '공항 지도',
      sub: '전 세계 주요 공항의 터미널 지도 표지를 엄선해 보여 줍니다. 공항 페이지에서 전체 지도를 확인하세요.',
    },
    recent: {
      kicker: '최근 게시',
      title: '최근 업데이트',
      en: '최근 업데이트',
      sub: '새로 추가되거나 새로 수정된 공항, 국가, 여행 가이드입니다.',
      countriesTitle: '최근 업데이트된 국가',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: '노선',
      title: '인기 공항 노선도',
      en: '노선도',
      sub: '직항 목적지 수가 많은 순서로 정렬한 공항입니다. 클릭하면 전 세계 노선망, 운항 항공사, 목적지 목록을 볼 수 있습니다.',
      collection: '노선 컬렉션',
      tabsLabel: '도시별 노선도',
      explore: (city: string) => `${city} 노선도 보기`,
      play: '자동 넘김 시작',
      pause: '자동 넘김 일시정지',
    },
    countries: {
      kicker: '국가별',
      title: '국가별 공항 지도',
      en: '국가',
      sub: '국가와 지역별로 정리된 공항 터미널 지도를 살펴보세요. 주요 국제 허브부터 지역 공항까지 포함합니다.',
      more: '전체 국가',
    },
    all: {
      kicker: '전체 지도',
      title: '전체 공항 지도',
      en: '전체 공항',
      sub: '세계에서 가장 붐비는 공항과 여행 허브의 공항 지도입니다.',
      hint: '공항을 클릭하면 터미널 평면도를 볼 수 있습니다.',
      more: '전체 보기',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables so search and AI engines can lift and cite the figures.
     */
    facts: {
      kicker: '데이터 개요',
      title: '공항 데이터 한눈에 보기',
      en: '목록과 표',
      sub: '사이트에 수록된 공항 데이터를 목록과 표로 정리했습니다. 수록 현황, 연간 여객 수가 공개된 공항의 순위, 지역별 분포를 확인하세요.',
      note: (pax: string, detailed: string, total: string) =>
        `여객 수 데이터는 전체 ${total}개 공항 중 ${pax}곳, 터미널·게이트 데이터는 ${detailed}곳을 포함합니다. 터미널 수는 이 사이트의 집계 기준을 따르며 일부 공항은 콘코스를 포함합니다.`,
      coverageTitle: '수록 수치',
      coverage: {
        airports: '공항',
        countries: '국가 및 지역',
        regions: '지역 구분',
        cities: '고유 도시명',
        terminals: '터미널',
        gates: '게이트',
        routes: '노선도 보유 공항',
      },
      busiest: {
        title: '연간 여객 수가 가장 많은 공항',
        sub: '연간 여객 수가 공개된 공항 중 가장 붐비는 12곳입니다.',
        caption: '연간 여객 수가 공개된 공항 순위',
        rank: '순위',
        iata: 'IATA',
        airport: '공항',
        city: '도시',
        country: '국가 / 지역',
        terminals: '터미널',
        gates: '게이트',
        pax: '연간 여객 수(백만 명)',
      },
      regions: {
        title: '지역 구분별 공항 분포',
        sub: '사이트의 지역 구분에 따른 공항, 터미널, 게이트 수입니다. 일부 국가·지역은 두 지역에 걸쳐 있습니다.',
        caption: '지역 구분별 공항 수',
        region: '대륙',
        airports: '공항',
        detailed: '상세 데이터 보유',
        terminals: '터미널',
        gates: '게이트',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: '공항',
    city: '도시',
    country: '국가',
    size: '규모',
    map: '지도',
    empty: '조건에 맞는 공항이 없습니다. 필터 조건을 넓혀 보세요.',
  },

  pager: {
    label: '페이지 이동',
    previous: '이전 페이지',
    next: '다음 페이지',
  },

  filters: {
    searchPlaceholder: '공항, 도시 또는 IATA 코드 검색',
    submit: '검색',
    country: '국가',
    all: '전체',
    sort: '정렬',
    sortPax: '여객 수',
    sortName: '이름',
    sortIata: 'IATA 코드',
    sortUpdated: '업데이트 날짜',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `${country} 전체 공항 지도${sortLabel ? ` — ${sortLabel} 기준 정렬` : ''}`
        : sortLabel
          ? `전체 공항 지도 — ${sortLabel} 기준 정렬`
          : '전체 공항 지도',
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `${country}의 모든 공항 지도를 한 페이지에 모았습니다: 터미널 평면도, 게이트 분포, 지상 교통${
            sortLabel ? `, ${sortLabel} 기준 정렬` : ''
          }.`
        : `사이트에 수록된 모든 공항 지도를 한 페이지에 모았습니다: 터미널 평면도, 게이트 분포, 지상 교통${
            sortLabel ? `, ${sortLabel} 기준 정렬` : ''
          }.`,
  },

  countries: {
    title: '국가별 공항 찾아보기',
    description:
      '국가와 지역별로 정리된 전 세계 공항 터미널 지도 목록을 살펴보세요. 주요 국제 허브부터 지역 공항까지, 각 국가의 공항 수와 터미널 정보를 확인할 수 있습니다.',
    sub: (countries: string, airports: string, terminals: string) =>
      `주요 국제 허브부터 지역 공항까지, 모두 ${countries}개 국가 / 지역, ${airports}개 공항, ${terminals}개 터미널을 수록했습니다.`,
    regionCount: (countries: number, airports: number) =>
      `${countries}개 국가 / 지역 · ${airports}개 공항`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} 공항 지도: 전체 ${count}개 공항 분포도` : `${name} 공항 지도`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}(${nameEn})에는 정기편이 취항하는 공항이 ${total}개 있으며, 이 중 ${count}개를 이 사이트에서 소개합니다. ${region}의 공항 분포도와 전체 공항 목록, 직항 노선을 확인하세요.`
        : `${name}(${nameEn})의 공항 ${count}개에 대한 터미널 지도를 수록했습니다. ${region}의 주요 국제 허브와 지역 공항을 아우르며, 게이트, 터미널 배치, 지상 교통을 확인할 수 있습니다.`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} AIRPORTS`,
    kicker: '공항 지도',
    titleOf: (name: string) => `${name}의 공항`,
    en: '공항',
    sub: '공항을 클릭하면 터미널 평면도, 게이트 분포, 지상 교통수단을 확인할 수 있습니다.',
    empty: '이 국가 / 지역에는 아직 등록된 공항이 없습니다.',
    moreKicker: '다른 국가',
    moreTitle: '다른 국가 둘러보기',
    moreEn: '더 많은 국가',
    all: '전체 국가',
    notFound: '국가를 찾을 수 없습니다',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: '개요',
    introTitle: (name: string) => `${name} 공항 소개`,
    introEn: '공항 개요',
    introSub: '해당 국가 / 지역 공항의 전체 규모, 주요 허브, 분포 도시를 정리했습니다.',
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
      // `o.nameEn` is empty when it equals `o.name` ("일본" / "Japan").
      // Terminals and gates drop out for countries whose airports have no
      // compiled counts, rather than reading "0개 터미널".
      `${o.name}${o.nameEn ? `(${o.nameEn})` : ''}의 공항은 ${o.region}에 있습니다. 사이트 수록 규모는 ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? `, ${o.gates}` : ''}입니다.` +
      (o.busiest
        ? ` 이 중 ${o.busiest}(${o.busiestIata})가 연간 여객 ${o.busiestPax}으로 가장 규모가 큽니다.`
        : '') +
      ` 공항은 ${o.cities} 등 여러 도시에 분포하며, ${o.mapsNote}`,
    introMapsNote: '모든 공항 페이지에는 위치 지도와 공항 코드가 있으며, 수록된 터미널·게이트·지상 교통 정보가 함께 표시됩니다.',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: '분포',
      title: (name: string) => `${name} 공항 분포도`,
      en: '공항 분포',
      sub: (covered: string, total: string) =>
        `전국에 정기편 공항이 ${total}개(대형·중형·소형 포함) 있으며, 이 중 ${covered}개는 이 사이트에 전용 페이지가 있습니다. 아래에 전체 목록이 있습니다.`,
      mapAlt: (name: string, total: string) =>
        `${name} 공항 분포도: 정기편 공항 ${total}개`,
      siteTag: '사이트 수록',
      colAirport: '공항',
      colCity: '도시',
      colType: '유형',
      types: {
        large: '대형',
        medium: '중형',
        small: '소형',
      },
      empty: '아직 전국 공항 목록 데이터가 없습니다.',
    },

    /** Related links */
    linksTitle: '관련 링크',
    linksEn: '관련 링크',
    linksSub:
      '해당 국가 / 지역과 그 공항의 공식 홈페이지 및 백과사전 항목 등 외부 참고 링크입니다.',
    linksCountry: (name: string) => `${name} 자료`,
    linksAirports: (name: string) => `${name}의 공항`,

    faqKicker: 'FAQ',
    faqTitle: '자주 묻는 질문',
    faqEn: '질문',
    faq: {
      airportTotal: (name: string) => `${name}에는 공항이 몇 개 있나요?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}에는 정기편이 취항하는 공항이 ${total}개(대형·중형·소형 포함) 있으며, 이 사이트에는 이 중 ${covered}개의 상세 정보를 수록했습니다. 전체 목록은 위의 공항 분포도를 참고하세요.`,
      airportCount: (name: string) => `${name}에는 어떤 공항이 있나요?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `이 사이트에는 ${name}의 ${count}이 수록되어 있습니다: ${list}.`,
      busiest: (name: string) => `${name}에서 가장 붐비는 공항은 어디인가요?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `연간 여객 수 기준으로 ${busiest}(${iata})가 이 사이트에 수록된 공항 중 규모가 가장 크며, 연간 여객은 ${pax}입니다.`,
      terminals: (name: string) => `${name}의 공항에는 터미널이 모두 몇 개 있나요?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}의 공항에는 ${terminals}, ${gates}가 있습니다: ${list}.`,
      cities: (name: string) => `${name}의 공항은 어느 도시에 분포하나요?`,
      citiesAnswer: (name: string, cities: string) =>
        `이 사이트에 수록된 ${name}의 공항은 ${cities} 등 여러 도시에 있으며, 공항 목록에서 도시나 IATA 코드로 필터링할 수 있습니다.`,
      maps: (name: string) => `${name}의 공항에는 터미널 지도가 있나요?`,
      mapsAnswer: (name: string, count: string) =>
        `일부 공항만 제공합니다. 공항 페이지에는 위치 지도, 공항 코드, 직항 노선이 담겨 있고, 터미널 자료가 수록된 공항은 터미널 평면도와 게이트 범위, 지상 교통 안내도 함께 표시됩니다. ${name}의 공항 ${count}개 중 해당 자료가 있는 곳에서 확인할 수 있습니다.`,
    },
  },

  airport: {
    /**
     * Meta description assembled from formatted airport facts. Terminals and
     * gates are null for directory airports with no compiled counts, and the
     * clause drops out instead of reading "0개 터미널".
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
      `${o.name}(${o.iata}, ${o.nameEn})은 ${o.city}에 위치한 공항입니다.${
        o.terminals
          ? ` 터미널은 ${o.terminals}개${o.gates ? `, 게이트는 ${o.gates}개` : ''}입니다.`
          : ''
      }${o.pax ? ` 연간 여객은 ${o.pax}입니다.` : ''}${
        o.distance ? ` 시내 중심에서 약 ${o.distance} 떨어져 있습니다.` : ''
      }${
        o.terminals
          ? ' 터미널 지도, 게이트 분포, 지상 교통 정보를 확인하세요.'
          : ' 공항 위치 지도, 코드, 이용 정보를 확인하세요.'
      }`,
    /**
     * Lead answer sentence under the H1: the full-sentence answer to "what is
     * this airport / where is it" plus the terminal and gate counts the FAQ
     * otherwise hides inside a collapsed accordion. city and country collapse
     * into one when equal (Singapore).
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
      const where = o.city === o.country ? o.city : `${o.country} ${o.city}`;
      const kind = o.kind ? AIRPORT_KIND[o.kind] : '공항';
      const head = `${o.name}(IATA: ${o.iata}${o.icao ? `, ICAO: ${o.icao}` : ''})은 ${where}에 위치한 ${kind}입니다.`;
      return o.terminals > 0
        ? `${head} 터미널은 ${o.terminals}개${
            o.gates > 0 ? `, 게이트는 ${o.gates}개` : ''
          }${
            o.distance ? `이며, ${o.city} 시내 중심에서 약 ${o.distance} 떨어져 있습니다` : '입니다'
          }.`
        : `${head}`;
    },
    mapTitle: (iata: string) => `${iata} · 터미널 평면도`,
    mapNote: '터미널 배치',
    realMapTitle: (iata: string) => `${iata} 공항 터미널 지도 — 게이트 및 길 찾기`,
    /** Alt text for the terminal-map images: full airport name and code. */
    mapAlt: (name: string, iata: string) =>
      `${name}(${iata}) 터미널 지도: 각 터미널, 게이트 범위, 탑승동 배치`,
    realMapNote: '터미널 지도',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: '사진',
    photosTitle: '공항 실제 사진',
    photosEn: '공항 사진',
    photosSub:
      '다음은 이 공항의 실제 사진으로, 모두 공개된 인터넷 출처에서 가져왔으며 사진마다 출처를 표시했습니다. 저작권은 원저작자에게 있습니다. 사진을 클릭하면 크게 볼 수 있고, 출처를 클릭하면 원본 페이지가 열립니다.',
    photosCredit: (host: string) => `출처: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name}(${iata}) 공항 실제 사진 ${index}`,
    photosZoom: (name: string, index: number) => `${name}의 ${index}번째 사진 크게 보기`,
    /** Download buttons under the map. */
    zoomLabel: '확대',
    zoomClose: '닫기',
    zoomIn: '확대',
    zoomOut: '축소',
    downloadKicker: '다운로드',
    downloadTitle: '공항 지도 다운로드',
    downloadEn: '다운로드',
    downloadMapLabel: (year: number, iata: string) =>
      `${year}년 최신 ${iata} 공항 지도 및 평면도 다운로드`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year}년 최신 ${iata} 공항 터미널 평면도 PDF 다운로드`,
    timeKicker: '시간',
    timeTitle: (iata: string) => `공항 시간 정보 — ${iata} 현재 시간`,
    timeEn: '공항 시간',
    timeSub: (iata: string, tz: string) =>
      `${iata}의 현재 시간(${tz})과 현지 시간을 비교합니다.`,
    clockAirport: '공항 현재 시간',
    clockLocal: '현지 시간',
    infoKicker: '정보',
    infoTitle: '공항 정보 및 상세',
    infoEn: '공항 상세',
    infoIata: '공항 IATA 코드',
    infoLocation: '공항 위치',
    infoCoords: '지리 좌표',
    infoTimezone: '시간대',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: '링크',
    linksTitle: '관련 링크',
    linksEn: '관련 링크',
    linksSub: '공항 공식 홈페이지, 위키백과, 바이두 백과 등 외부 참고 링크입니다.',
    officialSite: '공항 공식 홈페이지',
    wikiLabel: '위키백과',
    baikeLabel: '바이두 백과',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: '자료 출처: ',
    sourcesWikipedia: '위키백과',
    sourcesOurAirports: 'OurAirports 오픈 데이터',
    sourcesNote:
      '공항 코드, 좌표, 규모 등 기본 데이터는 오픈 데이터에서 정리했으며, 페이지 정보는 공항 공식 홈페이지를 기준으로 합니다.',
    mapEmbedKicker: '지도',
    mapEmbedTitle: (name: string) => `${name} 인터랙티브 지도 — 공항 위치`,
    mapEmbedEn: '인터랙티브 지도',
    extMapsNote: '다른 지도 서비스에서 이 공항 보기:',
    routeMapKicker: '노선',
    routeMapTitle: (name: string) => `${name} 노선도 · 직항 목적지`,
    routeMapEn: '노선도',
    routeMapAria: (name: string) => `${name} 직항 노선 지도`,
    routeLegendTitle: '색상 안내',
    routeLegendClose: '범례 접기',
    routeReset: '지도 초기화',
    routeZoomIn: '확대',
    routeZoomOut: '축소',
    routeFullscreen: '전체 화면으로 보기',
    routeExitFullscreen: '전체 화면 종료',
    routeOpenAirport: '{iata} 공항 페이지 보기',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6개 이상 항공사',
      major: '3–5개 항공사',
      minor: '2개 항공사',
      single: '1개 항공사',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n}개 항공사',
    routeTableDest: '목적지',
    routeTableCountry: '국가/지역',
    routeTableDistance: '거리',
    routeTableCarriers: '운항 항공사',
    routeCarriersMore: (n: number) => ` 외 ${n}개`,
    routeMapNote: (date: string) =>
      `노선 데이터 스냅샷: ${date}, 직항 노선만 집계. 데이터 출처: `,
    legendTerminal: '터미널 건물',
    legendTransit: '지상 교통 거점',
    legendCorridor: '터미널 간 연결 통로',
    terminalsKicker: '터미널',
    terminalsTitle: '터미널 안내',
    terminalsEn: '터미널 안내',
    terminalsSub: (name: string) =>
      `${name} 각 터미널의 게이트 범위, 주요 항공사, 시설 분포를 정리했습니다.`,
    transitTitle: '지상 교통',
    facilitiesTitle: '공항 시설',
    faqKicker: 'FAQ',
    faqTitle: '자주 묻는 질문',
    faqEn: '질문',
    guideKicker: '안내',
    guideTitle: '공항 안내',
    guideEn: '공항 안내',
    blogKicker: '아티클',
    blogTitle: (iata: string) => `${iata} 공항 가이드`,
    blogEn: '블로그에서',
    blogSub: (iata: string, count: number) =>
      `이 사이트의 아티클 ${count}편이 ${iata}를 다룹니다. 입국, 교통, 수하물, 환승 정보입니다.`,
    blogAll: '전체 아티클',
    relatedTitle: (country: string) => `${country}의 다른 공항`,
    relatedEn: (country: string) => `${country}의 다른 공항`,
    relatedAll: (country: string) => `${country} 전체 공항`,
    /** 항공편 게시판: 이 공항에서 출발·도착하는 항공편 번호 (aviability.com). */
    flights: {
      kicker: '항공편',
      title: (name: string) => `${name} 항공편 — 출발 및 도착`,
      en: 'Flight Board',
      sub: (flights: string, airlines: string, destinations: string) =>
        `항공사 ${airlines}곳과 목적지 ${destinations}곳을 잇는 항공편 번호 ${flights}개를 출발·도착으로 나눠 정리했습니다. 코드셰어 편명도 포함됩니다.`,
      statDepartures: '출발 항공편 번호',
      statArrivals: '도착 항공편 번호',
      statAirlines: '항공사',
      statDestinations: '목적지',
      note: (date: string) =>
        `항공편 번호와 노선은 aviability.com 항공편 색인 기준입니다(기준일 ${date}). 코드셰어 편명이 포함되며 출발 시각은 제공하지 않습니다. 출처: `,
      source: 'aviability.com',
      tabDepartures: '출발',
      tabArrivals: '도착',
      search: '항공편 번호, 항공사 또는 도시 검색',
      clearSearch: '검색 지우기',
      flight: '항공편',
      airline: '항공사',
      destination: '목적지',
      origin: '출발지',
      country: '국가/지역',
      empty: '검색 조건에 맞는 항공편이 없습니다.',
      loading: '항공편을 불러오는 중…',
      error: '항공편을 더 불러오지 못했습니다.',
      retry: '다시 시도',
      previous: '이전',
      next: '다음',
      pagination: '페이지 이동',
      showing: '{total}개 항공편 번호 중 {from}–{to} 표시',
      pageOf: '{page} / {pages} 페이지',
    },
    notFound: '공항을 찾을 수 없습니다',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${year}년 최신 ${name} 노선도 — ${iata} 직항 ${count}개 목적지`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name}(${iata})의 직항 노선도: 총 ${count}개 목적지와 운항 항공사, 비행 거리, 노선 약도를 한눈에 보고 전체 목적지 목록까지 확인할 수 있습니다.`,
    heading: (name: string) => `${name} 노선도`,
    headingSub: (iata: string, count: string) =>
      `${iata}의 직항 목적지는 ${count}개이며, 운항 항공사 수에 따라 색상이 다릅니다.`,
    backToAirport: (iata: string) => `${iata} 공항 페이지로 돌아가기`,
    /** 노선도에서 공항 항공편 게시판으로 가는 링크. */
    flightNumbers: (iata: string) => `${iata} 항공편 번호`,
    /** Button on the airport page's teaser card. */
    openFull: '노선도 보기',
    /** Same card, for the airports whose network the repo has rendered. */
    previewCta: (iata: string) => `${iata} 전체 노선도 보기`,
    teaserSub: (count: string) =>
      `직항 목적지 ${count}개: 노선도, 운항 항공사, 비행 거리.`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `${name} 직항 노선도`,
    tableKicker: (iata: string) => `${iata} · 목적지`,
    tableSectionTitle: (name: string) => `${name} 직항 목적지 목록`,
    tableSectionEn: (iata: string) => `${iata} 목적지`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: '직항 목적지',
    tableSectionSub: (count: string) =>
      `목적지 ${count}개가 운항 항공사 수가 많은 순서로 정렬되어 있으며, 비행 거리와 운항 항공사를 함께 표시합니다.`,
    dataKicker: '다운로드',
    dataTitle: '노선 데이터 다운로드',
    dataEn: '데이터',
    dataSub: (count: number) =>
      `직항 노선 ${count}건의 데이터입니다. 목적지, IATA 코드, 도시, 국가/지역, 비행 거리, 운항 항공사를 담고 있어 스프레드시트나 스크립트로 처리할 수 있습니다.`,
    dataFields: 'CSV는 Excel / Numbers 같은 스프레드시트에, JSON은 프로그램 처리에 적합하며 모두 UTF-8로 인코딩됩니다.',
    dataCsv: 'CSV 다운로드',
    dataJson: 'JSON 다운로드',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      '공항 터미널과 게이트 분포를 간략히 보여 줍니다. 이미지를 클릭하면 공항 페이지에서 전체 지도, 터미널 시설, 지상 교통을 확인할 수 있습니다.',
    airportMapCta: (iata: string) => `${iata} 전체 터미널 지도 보기`,
    /** Header fact cells. */
    factDestinations: '직항 목적지',
    factAirlines: '운항 항공사',
    factCountries: '국가/지역',
    factSnapshot: '데이터 기준일',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `${name}의 직항 목적지는 몇 개인가요?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name}(${iata})의 직항 목적지는 ${count}개이며, ${countries}개 국가와 지역에 걸쳐 있습니다. 직항 노선만 집계했으며 경유 일정은 포함하지 않습니다.`,
    faqAirlinesQ: (name: string) => `${name}에서 출발하는 항공사는 몇 개인가요?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `총 ${count}개 항공사가 이 공항에서 출발하는 직항 노선을 운항합니다. 목적지가 가장 많은 항공사는 ${leaders}입니다(괄호 안은 목적지 수).`,
    faqFarthestQ: (name: string) => `${name}에서 가장 먼 직항 목적지는 어디인가요?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `가장 먼 직항 목적지는 ${country} ${city} ${iata}이며, 거리는 약 ${km} km입니다.`,
    faqBusiestQ: () => '어떤 목적지에 여러 항공사가 취항하나요?',
    faqBusiestA: (count: string, list: string) =>
      `${count}개 목적지에 3개 이상 항공사가 취항하며, 경쟁이 가장 치열한 곳은 ${list}입니다.`,
    faqSourceQ: () => '노선 데이터는 얼마나 자주 업데이트되나요?',
    faqSourceA: (date: string, source: string, license: string) =>
      `이 페이지의 노선은 ${source} 오픈 데이터셋(${license} 라이선스)을 바탕으로 한 ${date} 기준 스냅샷이며, 실시간 운항 일정이 아닙니다. 항공권과 운항 시간은 항공사나 공항 공식 채널에서 확인하세요.`,
  },

  /** 개별 항공편 번호 페이지 (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} 항공편 — ${from} → ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number} 항공편은 ${airline}의 항공편 번호로 ${from}에서 ${to} 노선에 사용됩니다${distance ? `, 직선거리 약 ${distance}` : ''}. 노선 지도, 출발·도착 공항, 거리와 같은 노선의 다른 항공편을 확인하세요.`,
    heading: (number: string) => `${number} 항공편`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number} 항공편은 ${airline}의 항공편 번호이며 ${from}과 ${to} 노선에 사용됩니다${distance ? `, 직선거리 약 ${distance}` : ''}.`,
    factFlight: '항공편 번호',
    factFrom: '출발',
    factTo: '도착',
    factDistance: '거리',
    overviewKicker: '개요',
    overviewTitle: (number: string) => `${number} 항공편 개요`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} 항공편은 ${airline}의 항공편 번호로 ${originName}(${originIata})과 ${destName}(${destIata}) 노선에 사용됩니다${distance ? `, 직선거리 약 ${distance}` : ''}. 이 페이지에는 항공편 번호, 항공사, 노선과 두 공항 정보를 정리했습니다.`,
    overviewNote:
      '항공편 색인에는 출발·도착 시각, 기종, 운항 날짜가 포함되지 않습니다. 운항 일정과 체크인·탑승 시간은 항공사나 공항 공식 채널에서 확인하세요.',
    routeKicker: '노선',
    routeTitle: (from: string, to: string) => `${from} → ${to} 노선`,
    routeDiagramAria: (number: string) => `${number} 항공편 노선 약도`,
    routeMapAria: (number: string) => `${number} 항공편 노선 지도`,
    airportsKicker: '공항',
    airportsTitle: '출발·도착 공항',
    airportsSub: '이 항공편이 연결하는 두 공항입니다. 목록에 있는 공항은 공항 페이지로 이동할 수 있습니다.',
    originAirport: '출발 공항',
    destinationAirport: '도착 공항',
    airportPage: '공항 페이지 열기',
    detailsKicker: '상세',
    detailsTitle: '항공편 정보',
    detailsFlight: '항공편 번호',
    detailsAirline: '항공사',
    detailsOrigin: '출발 공항',
    detailsDestination: '도착 공항',
    detailsDistance: '직선거리',
    detailsRoutes: '등록된 노선',
    detailsSnapshot: '데이터 스냅샷',
    routesKicker: '노선',
    routesTitle: '이 항공편 번호의 노선',
    routesSub: (count: string) =>
      `이 번호는 ${count}개 노선에 사용됩니다. 같은 번호를 코드셰어 항공사가 함께 사용할 수 있습니다.`,
    routesRoute: '노선',
    routesAirline: '항공사',
    routesDistance: '거리',
    relatedKicker: '관련',
    relatedTitle: '같은 노선의 다른 항공편',
    relatedSub: '같은 출발·도착 공항을 잇는 다른 항공편 번호입니다.',
    relatedEn: '다른 항공편',
    faqKicker: 'FAQ',
    faqTitle: '자주 묻는 질문',
    faqEn: '질문',
    faqWhat: (number: string) => `${number} 항공편은 무엇인가요?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `${number} 항공편은 ${airline}의 항공편 번호이며 ${from} → ${to} 노선에 사용됩니다${distance ? `, 직선거리 약 ${distance}` : ''}.`,
    faqRoute: (number: string) => `${number} 항공편은 어디에서 어디로 가나요?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `${number} 항공편은 ${originName}(${originIata})에서 ${destName}(${destIata})로 가는 노선에 사용됩니다.`,
    faqTimes: (number: string) => `${number} 항공편의 출발·도착 시각은 어디서 보나요?`,
    faqTimesAnswer: (number: string) =>
      `이 페이지는 ${number} 항공편의 번호, 항공사, 노선과 공항을 정리합니다. aviability.com 항공편 색인에는 출발·도착 시각이 없으므로 최신 운항 일정은 항공사나 공항에서 확인하세요.`,
    note: (date: string) =>
      `항공편 번호, 항공사와 노선은 aviability.com 항공편 색인 기준입니다(기준일 ${date}). 출발·도착 시각은 포함되지 않습니다. 출처: `,
    source: 'aviability.com',
    sourceFlight: 'aviability.com에서 보기',
    viewAirport: (iata: string) => `${iata} 공항 페이지 열기`,
    notFound: '항공편을 찾을 수 없습니다',
  },

  faq: {
    terminalCount: (name: string) => `${name}에는 터미널이 몇 개 있나요?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name}(${iata})에는 터미널이 ${terminals}개, 게이트가 총 ${gates}개 있습니다: ${list}.`,
    gateCount: (name: string) => `${name}에는 게이트가 몇 개 있나요?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name}(${iata})에는 게이트가 총 ${gates}개 있습니다: ${list}.`,
    whereIs: (iata: string) => `${iata}는 어디에 있나요?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata}는 ${name}(${nameEn})의 IATA 코드이며, 공항은 ${country} ${city}${
        cityEn ? `(${cityEn})` : ''
      }에 있습니다.`,
    distance: (name: string, city: string) => `${name}은 ${city} 시내에서 얼마나 떨어져 있나요?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name}은 ${city} 시내 중심에서 약 ${distance} 떨어져 있으며, ${transit} 등으로 시내를 오갈 수 있습니다.`,
    access: (name: string, city: string) => `${name}에서 ${city} 시내로 가려면 어떻게 해야 하나요?`,
    accessAnswer: (options: string) => `${options}.`,
    facilities: (name: string) => `${name}에는 어떤 시설과 서비스가 있나요?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}에는 ${facilities} 등의 시설과 서비스가 있으며, 터미널별 배치는 위의 터미널 평면도를 참고하세요.`,
    location: (name: string) => `${name}은 어느 도시와 국가에 있나요?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name}(영문명 ${nameEn}, IATA 코드 ${iata})은 ${country} ${city}${
        cityEn ? `(${cityEn})` : ''
      }에 있습니다.`,
    airlines: (name: string) => `${name}의 각 터미널에서는 어떤 항공사가 주로 운항하나요?`,
    airlinesAnswer: (name: string, list: string) =>
      `${name}의 터미널별 주요 항공사: ${list}. 항공사와 게이트 배정은 변경될 수 있으므로 탑승권과 공항 현장 안내를 확인하세요.`,
    timezone: (name: string) => `${name}은 어떤 시간대를 사용하나요?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name}(${iata})은 ${tz} 시간대를 사용합니다. 페이지 위의 공항 시계에서 현지 시간과 비교해 보세요.`,
    flightsCount: (name: string) => `${name}에는 항공편 번호가 몇 개 있나요?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.com 항공편 색인에는 ${name}(${iata}) 출발 항공편 번호 ${departures}개, 도착 항공편 번호 ${arrivals}개가 등록되어 있으며, 항공사 ${airlines}곳과 목적지 ${destinations}곳을 잇습니다(기준일 ${date}). 코드셰어 편명이 포함되며 운항 일정은 변경될 수 있으므로 여행 전 항공사에서 확인하세요.`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: '세계 공항 지도 편집팀',
    role: '기획 및 감수: ',
    sourcesNote: '공개 자료와 공항 공식 정보를 바탕으로 정리했습니다',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: '페이지 안내',
    map: '터미널 지도',
    photos: '실제 사진',
    time: '공항 시간',
    details: '공항 정보',
    links: '관련 링크',
    location: '위치 지도',
    routes: '노선도',
    flights: '항공편',
    guide: '공항 안내',
    blog: '관련 가이드',
    terminals: '터미널 안내',
    transport: '지상 교통',
    facilities: '시설 및 서비스',
    faq: '자주 묻는 질문',
    flightOverview: '항공편 개요',
    flightRoute: '노선',
    flightAirports: '공항',
    flightDetails: '항공편 정보',
    flightRoutes: '전체 노선',
    flightRelated: '관련 항공편',
    intro: '공항 소개',
    distribution: '공항 분포',
    airports: '수록 공항',
  },

  error: {
    title: '페이지를 불러올 수 없습니다',
    sub: '공항 데이터를 읽는 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 홈으로 돌아가 다른 공항을 둘러보세요.',
    retry: '다시 시도',
    backHome: '홈으로 돌아가기',
    notFoundTitle: '404 · 페이지를 찾을 수 없습니다',
    notFoundSub: '요청하신 페이지가 이동되었거나 삭제되었을 수 있습니다. 공항을 검색하거나 아래 링크에서 계속 둘러보세요.',
  },

  footer: {
    mapsTitle: '상세 터미널 지도',
    mapsBody:
      '전 세계 공항과 터미널을 오가는 일은 쉽지 않습니다. 저희 공항 지도는 터미널, 게이트, 체크인 구역, 수하물 수취대, 상점, 레스토랑, 라운지, 교통 거점의 배치를 상세히 보여 주어 여행이 한결 수월해집니다.',
    plansTitle: '인터랙티브 터미널 평면도',
    plansBody:
      '주요 국제 공항은 터미널이 여러 개이고 구조도 복잡합니다. 상세 지도는 게이트를 찾고, 시설을 이용하고, 환승을 계획하며, 보안 검색대와 출발 구역, 도착 홀을 효율적으로 통과하는 데 도움을 줍니다.',
    transitTitle: '공항 교통과 접근 정보',
    transitBody:
      '터미널 배치 외에도 교통수단, 주차 정보, 접근 경로를 정리했습니다. 게이트로 가는 최선의 방법, 터미널 간 이동, 기차·버스·택시·렌터카 등 지상 교통 이용 방법을 확인하세요.',
    stats: (countries: string, airports: string, terminals: string) =>
      `국가 / 지역 ${countries}개 · 공항 ${airports}개 · 터미널 ${terminals}개 · 터미널 평면도`,
    fallback: '전 세계 공항의 터미널 평면도와 지상 교통 안내',
    linksLabel: '푸터 내비게이션',
    about: '사이트 소개',
    contact: '문의하기',
    sources: '데이터 출처',
    privacy: '개인정보 처리방침',
    terms: '이용약관',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: {
    train: '철도',
    tram: '트램',
    bus: '버스',
    taxi: '택시',
    car: '자가용 / 주차',
    ferry: '페리',
  } as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: '둘러보기',
    title: '분야별로 둘러보기',
    en: '분야별 보기',
    sub: '국가별, 지역별, 도시별 등 원하는 방식으로 공항 자료를 찾아보세요. 가장 붐비는 허브, 최근 업데이트, 공항 안내로 바로 이동할 수도 있습니다.',
    allAirports: {
      title: '전체 공항',
      body: '여객 수 순으로 정렬된 전체 공항 목록으로, 국가 필터와 정렬 방식을 바꿀 수 있습니다.',
    },
    byCountry: {
      title: '국가별 보기',
      body: '국가 / 지역별로 수록된 공항, 터미널, 게이트 수를 확인하세요.',
    },
    byRegion: {
      title: '지역별 보기',
      body: '국가 / 지역을 동아시아, 유럽, 북미 등으로 묶어 원하는 지역을 빠르게 찾아보세요.',
    },
    popularCities: {
      title: '인기 공항 도시',
      body: '연간 여객 수 기준으로 가장 붐비는 공항 도시와 해당 도시의 모든 공항을 정리했습니다.',
    },
    recentlyUpdated: {
      title: '최근 업데이트',
      body: '새로 수록되었거나 수정된 공항 정보를 업데이트 순으로 보여 줍니다.',
    },
    guides: {
      title: '공항 안내',
      body: '터미널 환승, 시내 이동 방법, 실용적인 팁을 담은 장문 안내입니다.',
    },
    routes: {
      title: '노선도',
      body: '직항 목적지 수를 기준으로 공항의 글로벌 노선망을 살펴보고, 운항 항공사와 목적지 목록도 확인하세요.',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: '안내',
    title: '공항 안내',
    en: '공항 안내',
    sub: '터미널 평면도 외에도 주요 허브 공항을 위한 장문 안내를 준비했습니다. 게이트 번호 읽는 법, 터미널 간 이동 방법, 시내로 나가는 방법을 다룹니다.',
    more: '이 공항 보기',
  },

  blog: {
    kicker: '저널',
    title: '공항 여행 안내',
    /** Short label used by the top bar / footer navigation. */
    nav: '블로그',
    en: '여행 노트',
    sub: '입국 심사, 환승, 터미널 시설, 휴식 팁까지 직접 확인한 동선을 정리해 소개합니다.',
    more: '보기',
    all: '전체 글',
    /** Related-post list at the bottom of an article. */
    morePosts: '더 많은 글',
    back: '글 목록으로 돌아가기',
    empty: '아직 글이 없습니다.',
    readingMinutes: (n: number) => `약 ${n}분 소요`,
    source: (name: string) => `출처: ${name}`,
    tags: '태그',
  },

  comments: {
    kicker: '댓글',
    title: '독자 댓글',
    en: '토론',
    sub: '질문, 여행 후기, 정정 모두 환영합니다. 댓글은 공개됩니다.',
    formTitle: '댓글 남기기',
    countOne: '댓글 1개',
    countMany: '댓글 {n}개',
    empty: '아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.',
    loading: '댓글을 불러오는 중…',
    loadError: '지금은 댓글을 불러올 수 없습니다.',
    retry: '다시 시도',
    nameLabel: '이름',
    namePlaceholder: '어떻게 불러 드릴까요?',
    bodyLabel: '댓글 내용',
    bodyPlaceholder: '경험이나 질문, 보충 정보를 남겨 주세요…',
    submit: '댓글 등록',
    submitting: '등록 중…',
    success: '등록되었습니다. 공유해 주셔서 감사합니다.',
    error: '댓글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    rateLimited: '너무 빨리 작성했습니다. 몇 분 후 다시 시도해 주세요.',
    nameError: '이름을 입력해 주세요(2–40자).',
    bodyError: '댓글 내용을 입력해 주세요(5–2000자).',
    note: '댓글은 공개되며 작성자의 개인 의견입니다. 서로 존중해 주시고 광고나 개인정보는 올리지 마세요.',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name} 터미널 평면도`,
    gates: '게이트',
    terminal: '터미널',
    corridor: '연결 통로',
    transit: '지상 교통',
    footer: (iata: string) => `${iata} · 터미널 평면도`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: '온라인 도구',
    hub: {
      kicker: '도구',
      title: '지도 및 좌표 도구',
      en: '무료 도구',
      sub: '여행자와 지리 애호가를 위한 무료 온라인 도구입니다. 설치 없이 브라우저에서 바로 사용할 수 있습니다.',
      description:
        '무료 온라인 지도 및 좌표 도구: WGS84 / GCJ02 / BD09 좌표계 변환, 십진수 도·분·초 상호 변환, 두 지점 간 대권 거리 계산. 설치 없이 브라우저에서 바로 사용할 수 있습니다.',
      comingTitle: '더 많은 도구 준비 중',
      comingSub: '좌표 추출, 위치 공유, 투영 계산 등의 도구를 준비하고 있으며, 완성되면 이곳에 공개됩니다.',
    },
    howTitle: '사용 방법',
    relatedTitle: '관련 도구',
    allTools: '전체 도구',
    tools: {
      coordinateConverter: {
        title: '좌표계 변환',
        en: '좌표계 변환',
        description:
          'WGS84, GCJ02, BD09 세 좌표계 간에 상호 변환하여 중국 본토 지도의 좌표 편차 문제를 해결합니다.',
        note: 'WGS84는 GPS와 국제 표준 좌표계입니다. GCJ02는 중국 본토 법규가 요구하는 오프셋 좌표계로 ‘화성 좌표’라고도 하며, AMap(고덕 지도)과 텐센트 지도가 사용합니다. BD09는 GCJ02에 다시 오프셋을 더한 좌표계로 바이두 지도가 사용합니다. 같은 지점도 좌표계에 따라 100–700 m까지 차이가 날 수 있으므로, 다른 지도 서비스에서 좌표를 사용하기 전에 먼저 변환하세요.',
        steps: [
          '십진수 좌표를 ‘위도, 경도’ 순으로 입력합니다. 예: 39.9042, 116.4074.',
          '입력한 좌표의 좌표계를 선택합니다.',
          '‘변환’을 클릭하면 나머지 두 좌표계의 결과가 표시되며, ‘복사’로 저장할 수 있습니다.',
        ],
        inputLabel: '좌표 입력(위도, 경도)',
        inputPlaceholder: '예: 39.9042, 116.4074',
        sourceLabel: '입력 좌표계',
        wgs84: 'WGS84 · GPS / 국제 표준',
        gcj02: 'GCJ02 · AMap / 텐센트',
        bd09: 'BD09 · 바이두',
        precisionLabel: '소수 자릿수',
        submit: '변환',
        copy: '복사',
        copied: '복사됨',
        error:
          '좌표를 해석할 수 없습니다. ‘위도, 경도’ 형식으로 입력하세요. 예: 39.9042, 116.4074.',
      },
      dmsConverter: {
        title: '위경도 형식 변환',
        en: '위경도 형식 변환',
        description:
          '십진수 도(DD), 도분(DM), 도분초(DMS) 세 가지 표기법을 상호 변환하며 입력 형식을 자동으로 인식합니다.',
        note: 'DD(39.9042°)는 기기와 API에서 흔히 쓰는 순수 소수 표기입니다. DMS(39°54′15″N)는 해양, 항공, 측량에서 자주 쓰이며, DM(39°54.25′N)은 야외 기록에 주로 사용됩니다. 이 도구는 입력된 숫자 묶음의 수로 형식을 자동 인식하고(1개 DD, 2개 DM, 3개 DMS) 세 가지 표기를 모두 출력하며, 남북위 / 동서경은 N/S/E/W로 표시합니다.',
        steps: [
          '좌표 한 쌍을 입력합니다. 39.9042, 39°54′15″N, 39°32.5′E 등의 표기를 지원하며 두 값은 쉼표로 구분합니다.',
          '출력할 소수 자릿수를 선택합니다.',
          '‘변환’을 클릭하면 세 가지 형식의 결과가 모두 표시되며, ‘복사’로 저장할 수 있습니다.',
        ],
        inputLabel: '좌표 입력(한 쌍, 쉼표로 구분)',
        inputPlaceholder: '예: 39°54′15″N, 116°24′51″E 또는 39.9042, 116.4074',
        precisionLabel: '소수 자릿수',
        submit: '변환',
        ddLabel: '십진수 도(DD)',
        dmLabel: '도분(DM)',
        dmsLabel: '도분초(DMS)',
        copy: '복사',
        copied: '복사됨',
        error:
          '좌표를 해석할 수 없습니다. 39.9042, 39°54′15″N, 39°32.5′E 등의 표기를 지원하며 두 값은 쉼표로 구분하세요.',
      },
      distanceCalculator: {
        title: '두 지점 거리 계산',
        en: '두 지점 거리 계산',
        description: '대권 공식을 사용해 지구 표면 두 지점 사이의 거리를 계산하고 초기 방위각도 함께 제공합니다.',
        note: '거리는 Haversine 대권 공식(지구 평균 반지름 6,371.0088 km)으로 계산한 지표면 최단 거리입니다. 방위각은 출발점에서 도착점을 바라보는 나침반 방향으로, 정북이 0°이며 시계 방향으로 증가합니다.',
        steps: [
          '출발점과 도착점의 위도와 경도를 각각 입력합니다.',
          '‘거리 계산’을 클릭합니다.',
          '킬로미터, 마일, 해리 단위의 거리와 초기 방위각을 확인합니다.',
        ],
        fromLabel: '출발점',
        toLabel: '도착점',
        inputPlaceholder: '위도, 경도',
        example: '예: 베이징 → 상하이',
        submit: '거리 계산',
        km: '킬로미터',
        mi: '마일',
        nmi: '해리',
        bearing: '초기 방위각',
        copy: '복사',
        copied: '복사됨',
        error:
          '좌표를 해석할 수 없습니다. ‘위도, 경도’ 형식으로 입력하고, 위도는 -90–90, 경도는 -180–180 범위여야 합니다.',
      },
    },
  },
};
