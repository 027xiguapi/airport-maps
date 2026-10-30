import type { Locale } from './config';

/**
 * Copy for the verified-fare surface — the machine-collected, USD-normalised
 * half of `/deals`.
 *
 * Kept apart from lib/i18n/deals.ts (community submissions + official cards)
 * because the two surfaces have different promises: `deals` strings talk about
 * "posted" fares and unverified prices, these talk about "checked" fares and
 * tax-inclusive totals. Sharing one bag of strings would blur that.
 *
 * Same constraints as DealsMessages: plain strings only (they are handed to
 * client components as props), `{name}` placeholders, seven published locales.
 */

export type FaresMessages = {
  /** Nav/section kicker, e.g. "Verified flight deals". */
  kicker: string;
  title: string;
  sub: string;

  /** Badge on a card that passed the last automatic re-check. */
  verified: string;
  /** `{date}`. Footnote over a board: prices were re-checked at this time. */
  verifiedHint: string;
  /** `{date}`. Per-card timestamp. */
  verifiedAt: string;

  empty: string;
  emptyHint: string;
  loadError: string;
  retry: string;
  loadMore: string;
  loadingMore: string;
  /** `{count}` — "24 deals". */
  results: string;

  /** `{price}` — landing-page heading "Under $100". */
  under: string;
  /** `{price}` — its lede. */
  underSub: string;

  domestic: string;
  domesticSub: string;
  international: string;
  internationalSub: string;

  /** `{airport}` — heading for /deals/from/[iata]. */
  fromTitle: string;
  fromSub: string;
  /** `{iata}` — link on the airport page. */
  fromLink: string;

  marketAll: string;
  marketUs: string;
  marketCn: string;
  nonstopOnly: string;

  stopsNonstop: string;
  stopsOne: string;
  /** `{n}` — 2 or more. */
  stopsMany: string;

  seeAll: string;
  /** Affiliate disclosure under the listing. */
  disclosure: string;
};

const FARES: Record<'en' | 'de' | 'fr' | 'it' | 'ko' | 'zh' | 'tw', FaresMessages> = {
  en: {
    kicker: 'Verified flight deals',
    title: 'Cheap flights from the US and China',
    sub: 'Fares checked automatically, taxes included, from airports we cover. Pick a price cap or a destination and book with the airline.',
    verified: 'Verified',
    verifiedHint: 'Prices re-checked automatically. Last run {date}.',
    verifiedAt: 'Checked {date}',
    empty: 'No verified fares yet',
    emptyHint:
      'Once the collector has run, tax-inclusive fares under $300 will appear here. In the meantime, browse the community fares below.',
    loadError: 'Could not load fares.',
    retry: 'Try again',
    loadMore: 'Load more fares',
    loadingMore: 'Loading…',
    results: '{count} fares',
    under: 'Under {price}',
    underSub: 'Tax-inclusive one-way fares below {price}, departing within four months.',
    domestic: 'Domestic flights',
    domesticSub: 'Cheapest fares where departure and arrival are in the same country.',
    international: 'International flights',
    internationalSub: 'Cheapest fares from the US and China to another country.',
    fromTitle: 'Cheap flights from {airport}',
    fromSub: 'Verified fares departing {airport}, cheapest first.',
    fromLink: 'All fares from {iata}',
    marketAll: 'All origins',
    marketUs: 'From the US',
    marketCn: 'From China',
    nonstopOnly: 'Nonstop only',
    stopsNonstop: 'Nonstop',
    stopsOne: '1 stop',
    stopsMany: '{n} stops',
    seeAll: 'See all verified deals',
    disclosure:
      'Booking links are affiliate links: we may earn a commission at no extra cost to you. Prices change quickly — always confirm the total on the airline’s site.',
  },
  zh: {
    kicker: '已验证特价',
    title: '美国与中国出发的低价机票',
    sub: '自动核验、含税、可订的报价，按出发机场与预算筛选，直接跳转航司或 OTA 下单。',
    verified: '已验证',
    verifiedHint: '价格由采集器自动复核，最近一次运行：{date}。',
    verifiedAt: '核验于 {date}',
    empty: '暂时没有已验证的特价',
    emptyHint: '采集器运行后，含税、300 美元以下的报价会出现在这里。你可以先浏览下方的社区特价。',
    loadError: '报价加载失败。',
    retry: '重试',
    loadMore: '加载更多',
    loadingMore: '加载中…',
    results: '共 {count} 条报价',
    under: '{price} 以下',
    underSub: '含税单程报价，价格低于 {price}，出发日期在四个月内。',
    domestic: '国内航线',
    domesticSub: '出发与到达位于同一国家的最低价。',
    international: '国际航线',
    internationalSub: '美国与中国出发飞往其它国家的最低价。',
    fromTitle: '从 {airport} 出发的低价机票',
    fromSub: '{airport} 出发、已核验的报价，按价格从低到高排列。',
    fromLink: '查看 {iata} 的全部特价',
    marketAll: '全部出发地',
    marketUs: '美国出发',
    marketCn: '中国出发',
    nonstopOnly: '仅直飞',
    stopsNonstop: '直飞',
    stopsOne: '经停 1 次',
    stopsMany: '经停 {n} 次',
    seeAll: '查看全部已验证特价',
    disclosure:
      '订票链接为联盟链接，我们可能获得佣金，不影响你支付的价格。机票价格变动频繁，下单前请以航司页面含税总价为准。',
  },
  tw: {
    kicker: '已驗證特價',
    title: '美國與中國出發的低價機票',
    sub: '自動核驗、含稅、可訂的報價，依出發機場與預算篩選，直接前往航空公司或 OTA 下單。',
    verified: '已驗證',
    verifiedHint: '價格由採集器自動複核，最近一次執行：{date}。',
    verifiedAt: '核驗於 {date}',
    empty: '目前沒有已驗證的特價',
    emptyHint: '採集器執行後，含稅、300 美元以下的報價會出現在這裡。你可以先瀏覽下方的社群特價。',
    loadError: '報價載入失敗。',
    retry: '重試',
    loadMore: '載入更多',
    loadingMore: '載入中…',
    results: '共 {count} 條報價',
    under: '{price} 以下',
    underSub: '含稅單程報價，價格低於 {price}，出發日期在四個月內。',
    domestic: '國內航線',
    domesticSub: '出發與抵達位於同一國家的最低價。',
    international: '國際航線',
    internationalSub: '美國與中國出發飛往其他國家的最低價。',
    fromTitle: '從 {airport} 出發的低價機票',
    fromSub: '{airport} 出發、已核驗的報價，依價格由低至高排列。',
    fromLink: '查看 {iata} 的全部特價',
    marketAll: '全部出發地',
    marketUs: '美國出發',
    marketCn: '中國出發',
    nonstopOnly: '僅直飛',
    stopsNonstop: '直飛',
    stopsOne: '經停 1 次',
    stopsMany: '經停 {n} 次',
    seeAll: '查看全部已驗證特價',
    disclosure:
      '訂票連結為聯盟連結，我們可能獲得佣金，不影響你支付的價格。機票價格變動頻繁，下單前請以航空公司頁面含稅總價為準。',
  },
  de: {
    kicker: 'Geprüfte Flugangebote',
    title: 'Günstige Flüge ab USA und China',
    sub: 'Automatisch geprüfte Preise inklusive Steuern, von Flughäfen aus unserem Verzeichnis. Preisgrenze oder Ziel wählen und direkt bei der Airline buchen.',
    verified: 'Geprüft',
    verifiedHint: 'Preise werden automatisch neu geprüft. Letzter Lauf: {date}.',
    verifiedAt: 'Geprüft am {date}',
    empty: 'Noch keine geprüften Angebote',
    emptyHint:
      'Sobald der Sammler gelaufen ist, erscheinen hier Preise inklusive Steuern unter 300 USD. Bis dahin lohnen sich die Community-Angebote weiter unten.',
    loadError: 'Preise konnten nicht geladen werden.',
    retry: 'Erneut versuchen',
    loadMore: 'Weitere Angebote',
    loadingMore: 'Wird geladen…',
    results: '{count} Angebote',
    under: 'Unter {price}',
    underSub: 'One-Way-Preise inklusive Steuern unter {price}, Abflug in den nächsten vier Monaten.',
    domestic: 'Inlandsflüge',
    domesticSub: 'Günstigste Preise, bei denen Abflug und Ankunft im selben Land liegen.',
    international: 'Auslandsflüge',
    internationalSub: 'Günstigste Preise ab USA und China in ein anderes Land.',
    fromTitle: 'Günstige Flüge ab {airport}',
    fromSub: 'Geprüfte Preise ab {airport}, günstigste zuerst.',
    fromLink: 'Alle Angebote ab {iata}',
    marketAll: 'Alle Abflugorte',
    marketUs: 'Ab USA',
    marketCn: 'Ab China',
    nonstopOnly: 'Nur nonstop',
    stopsNonstop: 'Nonstop',
    stopsOne: '1 Stopp',
    stopsMany: '{n} Stopps',
    seeAll: 'Alle geprüften Angebote',
    disclosure:
      'Buchungslinks sind Affiliate-Links: Wir erhalten ggf. eine Provision, ohne dass dir Mehrkosten entstehen. Preise ändern sich schnell – prüfe den Gesamtpreis auf der Airline-Seite.',
  },
  fr: {
    kicker: 'Offres vérifiées',
    title: 'Vols pas chers au départ des États-Unis et de Chine',
    sub: 'Prix vérifiés automatiquement, taxes comprises, depuis les aéroports de notre annuaire. Choisissez un budget ou une destination, puis réservez chez la compagnie.',
    verified: 'Vérifié',
    verifiedHint: 'Les prix sont revérifiés automatiquement. Dernière exécution : {date}.',
    verifiedAt: 'Vérifié le {date}',
    empty: 'Aucune offre vérifiée pour le moment',
    emptyHint:
      'Dès que le collecteur aura tourné, les tarifs taxes comprises sous 300 USD apparaîtront ici. En attendant, parcourez les offres de la communauté ci-dessous.',
    loadError: 'Impossible de charger les tarifs.',
    retry: 'Réessayer',
    loadMore: 'Plus d’offres',
    loadingMore: 'Chargement…',
    results: '{count} offres',
    under: 'Moins de {price}',
    underSub: 'Aller simple taxes comprises sous {price}, départ dans les quatre mois.',
    domestic: 'Vols intérieurs',
    domesticSub: 'Tarifs les plus bas lorsque départ et arrivée sont dans le même pays.',
    international: 'Vols internationaux',
    internationalSub: 'Tarifs les plus bas depuis les États-Unis et la Chine vers un autre pays.',
    fromTitle: 'Vols pas chers au départ de {airport}',
    fromSub: 'Offres vérifiées au départ de {airport}, de la moins chère à la plus chère.',
    fromLink: 'Toutes les offres depuis {iata}',
    marketAll: 'Toutes les origines',
    marketUs: 'Depuis les États-Unis',
    marketCn: 'Depuis la Chine',
    nonstopOnly: 'Direct uniquement',
    stopsNonstop: 'Direct',
    stopsOne: '1 escale',
    stopsMany: '{n} escales',
    seeAll: 'Voir toutes les offres vérifiées',
    disclosure:
      'Les liens de réservation sont affiliés : nous pouvons percevoir une commission, sans surcoût pour vous. Les prix changent vite — vérifiez le total taxes comprises sur le site de la compagnie.',
  },
  it: {
    kicker: 'Offerte verificate',
    title: 'Voli economici da USA e Cina',
    sub: 'Prezzi verificati automaticamente, tasse incluse, dagli aeroporti del nostro elenco. Scegli un budget o una destinazione e prenota con la compagnia.',
    verified: 'Verificato',
    verifiedHint: 'I prezzi vengono riverificati automaticamente. Ultima esecuzione: {date}.',
    verifiedAt: 'Verificato il {date}',
    empty: 'Nessuna offerta verificata per ora',
    emptyHint:
      'Dopo la prima esecuzione del collector, qui compariranno tariffe tasse incluse sotto i 300 USD. Nel frattempo puoi sfogliare le offerte della community qui sotto.',
    loadError: 'Impossibile caricare le tariffe.',
    retry: 'Riprova',
    loadMore: 'Altre offerte',
    loadingMore: 'Caricamento…',
    results: '{count} offerte',
    under: 'Sotto {price}',
    underSub: 'Tariffe solo andata tasse incluse sotto {price}, partenza entro quattro mesi.',
    domestic: 'Voli nazionali',
    domesticSub: 'Le tariffe più basse con partenza e arrivo nello stesso paese.',
    international: 'Voli internazionali',
    internationalSub: 'Le tariffe più basse da USA e Cina verso un altro paese.',
    fromTitle: 'Voli economici da {airport}',
    fromSub: 'Offerte verificate in partenza da {airport}, dalla più economica.',
    fromLink: 'Tutte le offerte da {iata}',
    marketAll: 'Tutte le origini',
    marketUs: 'Dagli USA',
    marketCn: 'Dalla Cina',
    nonstopOnly: 'Solo diretto',
    stopsNonstop: 'Diretto',
    stopsOne: '1 scalo',
    stopsMany: '{n} scali',
    seeAll: 'Vedi tutte le offerte verificate',
    disclosure:
      'I link di prenotazione sono affiliati: potremmo ricevere una commissione, senza costi aggiuntivi per te. I prezzi cambiano rapidamente: verifica il totale tasse incluse sul sito della compagnia.',
  },
  ko: {
    kicker: '검증된 특가 항공권',
    title: '미국·중국 출발 저가 항공권',
    sub: '세금 포함 가격을 자동으로 검증해, 출발 공항과 예산으로 골라 항공사에서 바로 예약할 수 있습니다.',
    verified: '검증 완료',
    verifiedHint: '가격은 자동으로 재검증됩니다. 최근 실행: {date}.',
    verifiedAt: '{date} 확인',
    empty: '아직 검증된 특가가 없습니다',
    emptyHint:
      '수집기가 실행되면 세금 포함 300달러 이하 항공권이 여기에 표시됩니다. 그동안 아래 커뮤니티 특가를 살펴보세요.',
    loadError: '가격을 불러오지 못했습니다.',
    retry: '다시 시도',
    loadMore: '더 보기',
    loadingMore: '불러오는 중…',
    results: '{count}개 항공권',
    under: '{price} 이하',
    underSub: '세금 포함 편도 가격 {price} 미만, 4개월 이내 출발.',
    domestic: '국내선',
    domesticSub: '출발지와 도착지가 같은 국가인 최저가 항공권.',
    international: '국제선',
    internationalSub: '미국과 중국에서 다른 국가로 가는 최저가 항공권.',
    fromTitle: '{airport} 출발 저가 항공권',
    fromSub: '{airport} 출발 검증된 가격을 낮은 순서로 정렬했습니다.',
    fromLink: '{iata} 출발 전체 특가',
    marketAll: '모든 출발지',
    marketUs: '미국 출발',
    marketCn: '중국 출발',
    nonstopOnly: '직항만',
    stopsNonstop: '직항',
    stopsOne: '1회 경유',
    stopsMany: '{n}회 경유',
    seeAll: '검증된 특가 전체 보기',
    disclosure:
      '예약 링크는 제휴 링크로, 추가 비용 없이 일부 수수료를 받을 수 있습니다. 가격은 자주 바뀌므로 항공사 사이트에서 세금 포함 총액을 확인하세요.',
  },
};

/** Copy for one locale, falling back to English for an unpublished one. */
export function getFaresMessages(locale: Locale): FaresMessages {
  return FARES[locale as keyof typeof FARES] ?? FARES.en;
}

/** `{name}` substitution, same convention as formatDealLabel. */
export function formatFareLabel(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
