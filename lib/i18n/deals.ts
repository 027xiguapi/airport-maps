import type { Locale } from './config';

/**
 * Copy for the two features added on top of the directory: reader-submitted
 * airfare deals (`deals`) and Google sign-in (`auth`).
 *
 * Kept in one module rather than inside the individual locale catalogs for two
 * reasons: a new string is translated in one place and cannot drift between
 * languages, and `lib/i18n/messages/tw.ts` is *generated* from the Chinese
 * catalog by `scripts/build-hant.mjs` — hand-added keys there would be
 * overwritten on the next run. Components read these through
 * `getDealsMessages` / `getAuthMessages` alongside the regular `t` catalog.
 *
 * Every value is a plain string: `deals`/`auth` are handed to client
 * components as props, and functions cannot cross the server/client boundary.
 * Interpolation uses `{name}` / `{date}` placeholders filled by
 * `formatDealLabel` (lib/deal-format.ts).
 */

/** Locales whose UI catalog exists (lib/i18n/catalogs.ts). */
type PublishedLocale =
  | 'en'
  | 'de'
  | 'fr'
  | 'it'
  | 'ko'
  | 'zh'
  | 'tw'
  | 'es'
  | 'pt'
  | 'ja'
  | 'id'
  | 'vi'
  | 'ru'
  | 'tr'
  | 'th';

export type DealsMessages = {
  // section & pages
  kicker: string;
  title: string;
  en: string;
  sub: string;
  latest: string;
  all: string;
  submit: string;
  empty: string;
  emptyHint: string;
  loadError: string;
  retry: string;
  listingSub: string;
  disclaimer: string;
  searchPlaceholder: string;
  searchEmpty: string;
  loadMore: string;
  loadingMore: string;
  previousPage: string;
  nextPage: string;
  /** `{page}` / `{total}` placeholders. */
  pageOf: string;
  paginationLabel: string;
  mineTitle: string;
  mineEmpty: string;
  statusHidden: string;
  statusExpired: string;
  backToDeals: string;

  // field labels
  from: string;
  to: string;
  airline: string;
  price: string;
  cabin: string;
  trip: string;
  travelDates: string;
  /** Date inputs, left and right of the travel window. */
  dateFromLabel: string;
  dateToLabel: string;
  booking: string;
  /** Hint under the booking-link field: individual affiliate links are allowed. */
  bookingHint: string;
  notes: string;
  currency: string;
  /** Button on a card that opens the airline/OTA booking page. */
  viewDeal: string;

  // submission form
  submitTitle: string;
  submitSub: string;
  submitNote: string;
  submitting: string;
  success: string;
  rateLimited: string;
  signInTitle: string;
  signInBody: string;
  signInCta: string;
  airportPlaceholder: string;
  destinationPlaceholder: string;
  airlinePlaceholder: string;
  pricePlaceholder: string;
  currencyPlaceholder: string;
  bookingPlaceholder: string;
  notesPlaceholder: string;

  // validation
  airportError: string;
  destinationError: string;
  airlineError: string;
  priceError: string;
  currencyError: string;
  dateError: string;
  urlError: string;
  notesError: string;
  genericError: string;

  // card
  submittedBy: string;
  /** Submission timestamp, e.g. "Submitted Oct 30, 2026, 07:09". */
  submittedAt: string;
  /** Close button of the submission dialog. */
  close: string;
  unverified: string;
  /** Badge on an official fare whose price excludes taxes. */
  taxExcluded: string;
  /** Byline on an offer published by the site instead of a reader. */
  officialFare: string;
  expires: string;
  oneWay: string;
  roundTrip: string;
  economy: string;
  premium: string;
  business: string;
  first: string;
};

export type AuthMessages = {
  signInTitle: string;
  signInSub: string;
  signInWithGoogle: string;
  signOut: string;
  signedInAs: string;
  notConfiguredTitle: string;
  notConfiguredBody: string;
  oauthError: string;
  accessDenied: string;
  stateError: string;
  continueCta: string;
  mySubmissions: string;
  /** Header/menu label for the administrator area. */
  admin: string;
  /** Prompt shown in place of the comment form for signed-out visitors. */
  commentSignInTitle: string;
  commentSignInBody: string;
  privacyNote: string;
  loading: string;
  retry: string;
  accountMenu: string;
  backHome: string;
};

export const DEALS: Record<PublishedLocale, DealsMessages> = {
  zh: {
    kicker: '特惠机票',
    title: '机场特惠机票',
    en: 'Flight Deals',
    sub: '旅客和旅行创作者提交的机场出发特惠机票，也接受个人联盟（affiliate）推广链接；按发布时间排序，价格与余票以航空公司或订票页面为准。',
    latest: '最新特惠',
    all: '查看全部特惠',
    submit: '提交特惠',
    empty: '还没有特惠机票。',
    emptyHint: '用 Google 登录后，分享你发现的好价，或个人联盟推广链接。',
    loadError: '特惠信息暂时无法加载。',
    retry: '重试',
    listingSub: '按机场浏览低价机票，个人也可以提交自己的联盟推广链接，提交后立即展示。',
    disclaimer:
      '部分订票链接为提交者的联盟/推广链接，提交者可能获得佣金。价格由用户提交、未经核验，请以航空公司或订票页面为准。',
    searchPlaceholder: '搜索目的地或航空公司',
    searchEmpty: '没有匹配的特惠，换个关键词试试。',
    loadMore: '加载更多',
    loadingMore: '正在加载…',
    previousPage: '上一页',
    nextPage: '下一页',
    pageOf: '第 {page} / {total} 页',
    paginationLabel: '分页',
    mineTitle: '我的提交',
    mineEmpty: '你还没有提交过特惠机票。',
    statusHidden: '已隐藏',
    statusExpired: '已过期',
    backToDeals: '返回特惠列表',
    from: '出发机场',
    to: '目的地',
    airline: '航空公司',
    price: '价格',
    cabin: '舱位',
    trip: '行程类型',
    travelDates: '出行日期',
    dateFromLabel: '去程 / 起始日期',
    dateToLabel: '返程 / 截止日期',
    booking: '订票 / 联盟链接',
    bookingHint: '支持个人联盟链接；请在上方「补充说明」注明这是推广链接，方便读者识别。',
    notes: '补充说明（可选）',
    currency: '币种',
    viewDeal: '查看订票',
    submitTitle: '提交特惠机票',
    submitSub: '分享你发现的好价，或个人联盟（affiliate）推广链接；提交后会立即出现在特惠页面。',
    submitNote:
      '个人也可以提交自己的联盟（affiliate）链接。请确保价格真实可订，并在备注中说明这是推广链接；虚假、过期或误导信息会被删除。',
    submitting: '正在提交…',
    success: '提交成功，已展示在特惠页面。',
    rateLimited: '今天提交的次数已达上限，请明天再来。',
    signInTitle: '登录后提交',
    signInBody: '为防止垃圾信息并方便联系，提交特惠机票需要使用 Google 账号登录。',
    signInCta: '使用 Google 登录',
    airportPlaceholder: '三字码，如 PEK',
    destinationPlaceholder: '城市或机场，如 上海 / PVG',
    airlinePlaceholder: '如 中国国际航空',
    pricePlaceholder: '含税总价，如 680',
    currencyPlaceholder: 'CNY',
    bookingPlaceholder: 'https://…（航空公司、OTA 或你的联盟链接）',
    notesPlaceholder: '行李额、转机、限购条件；联盟链接请注明「推广链接」（可选）',
    airportError: '请填写有效的三字机场代码。',
    destinationError: '请填写目的地（2–60 个字符）。',
    airlineError: '请填写航空公司（2–60 个字符）。',
    priceError: '请填写有效价格（大于 0）。',
    currencyError: '请填写三位币种代码，如 CNY。',
    dateError: '日期无效：返程不能早于出发，也不能是过去的日期。',
    urlError: '请填写以 http:// 或 https:// 开头的订票或联盟链接。',
    notesError: '补充说明最多 600 个字符。',
    genericError: '提交失败，请稍后重试。',
    submittedBy: '由 {name} 提交',
    submittedAt: '提交于 {date}',
    close: '关闭',
    unverified: '未核验 · 可能含推广链接',
    taxExcluded: '不含税',
    officialFare: '官方票价',
    expires: '{date} 前有效',
    oneWay: '单程',
    roundTrip: '往返',
    economy: '经济舱',
    premium: '超级经济舱',
    business: '商务舱',
    first: '头等舱',
  },

  tw: {
    kicker: '特惠機票',
    title: '機場特惠機票',
    en: 'Flight Deals',
    sub: '旅客與旅行創作者提交的機場出發特惠機票，也接受個人聯盟（affiliate）推廣連結；依發佈時間排序，價格與機位以航空公司或訂票頁面為準。',
    latest: '最新特惠',
    all: '查看全部特惠',
    submit: '提交特惠',
    empty: '還沒有特惠機票。',
    emptyHint: '用 Google 登入後，分享你發現的好價，或個人聯盟推廣連結。',
    loadError: '特惠資訊暫時無法載入。',
    retry: '重試',
    listingSub: '依機場瀏覽低價機票，個人也可以提交自己的聯盟推廣連結，提交後會立即顯示。',
    disclaimer:
      '部分訂票連結為提交者的聯盟／推廣連結，提交者可能獲得佣金。價格由使用者提交、未經查核，請以航空公司或訂票頁面為準。',
    searchPlaceholder: '搜尋目的地或航空公司',
    searchEmpty: '沒有符合的特惠，換個關鍵字試試。',
    loadMore: '載入更多',
    loadingMore: '正在載入…',
    previousPage: '上一頁',
    nextPage: '下一頁',
    pageOf: '第 {page} / {total} 頁',
    paginationLabel: '分頁',
    mineTitle: '我的提交',
    mineEmpty: '你還沒有提交過特惠機票。',
    statusHidden: '已隱藏',
    statusExpired: '已過期',
    backToDeals: '返回特惠列表',
    from: '出發機場',
    to: '目的地',
    airline: '航空公司',
    price: '價格',
    cabin: '艙等',
    trip: '行程類型',
    travelDates: '出行日期',
    dateFromLabel: '去程 / 起始日期',
    dateToLabel: '回程 / 截止日期',
    booking: '訂票 / 聯盟連結',
    bookingHint: '支援個人聯盟連結；請在上方「補充說明」註明這是推廣連結，方便讀者識別。',
    notes: '補充說明（選填）',
    currency: '幣別',
    viewDeal: '查看訂票',
    submitTitle: '提交特惠機票',
    submitSub: '分享你發現的好價，或個人聯盟（affiliate）推廣連結；提交後會立即出現在特惠頁面。',
    submitNote:
      '個人也可以提交自己的聯盟（affiliate）連結。請確保價格真實可訂，並在備註中註明這是推廣連結；虛假、過期或誤導資訊會被刪除。',
    submitting: '正在提交…',
    success: '提交成功，已顯示在特惠頁面。',
    rateLimited: '今天提交的次數已達上限，請明天再試。',
    signInTitle: '登入後提交',
    signInBody: '為防止垃圾訊息並方便聯絡，提交特惠機票需要使用 Google 帳號登入。',
    signInCta: '使用 Google 登入',
    airportPlaceholder: '三字碼，例如 PEK',
    destinationPlaceholder: '城市或機場，例如 上海 / PVG',
    airlinePlaceholder: '例如 中華航空',
    pricePlaceholder: '含稅總價，例如 680',
    currencyPlaceholder: 'TWD',
    bookingPlaceholder: 'https://…（航空公司、OTA 或你的聯盟連結）',
    notesPlaceholder: '行李額、轉機、限購條件；聯盟連結請註明「推廣連結」（選填）',
    airportError: '請填寫有效的三字機場代碼。',
    destinationError: '請填寫目的地（2–60 個字元）。',
    airlineError: '請填寫航空公司（2–60 個字元）。',
    priceError: '請填寫有效價格（大於 0）。',
    currencyError: '請填寫三位幣別代碼，例如 TWD。',
    dateError: '日期無效：回程不能早於出發，也不能是過去的日期。',
    urlError: '請填寫以 http:// 或 https:// 開頭的訂票或聯盟連結。',
    notesError: '補充說明最多 600 個字元。',
    genericError: '提交失敗，請稍後再試。',
    submittedBy: '由 {name} 提交',
    submittedAt: '提交於 {date}',
    close: '關閉',
    unverified: '未查核 · 可能含推廣連結',
    taxExcluded: '不含稅',
    officialFare: '官方票價',
    expires: '{date} 前有效',
    oneWay: '單程',
    roundTrip: '來回',
    economy: '經濟艙',
    premium: '豪華經濟艙',
    business: '商務艙',
    first: '頭等艙',
  },

  en: {
    kicker: 'Flight deals',
    title: 'Airport flight deals',
    en: 'Deals',
    sub: 'Low fares from airports, submitted by travellers and individual creators — including their own affiliate links. Newest first; always confirm the price and availability on the airline or booking page.',
    latest: 'Latest deals',
    all: 'All deals',
    submit: 'Post a deal',
    empty: 'No deals yet.',
    emptyHint: 'Sign in with Google and share the first fare, or your own affiliate link.',
    loadError: 'Deals are temporarily unavailable.',
    retry: 'Retry',
    listingSub:
      'Browse low fares by departure airport. Individuals can post their own affiliate links too — new submissions appear immediately.',
    disclaimer:
      'Some booking links are the submitter’s affiliate links, and the submitter may earn a commission. Fares are user-submitted and unverified — always confirm on the airline or booking page.',
    searchPlaceholder: 'Search destination or airline',
    searchEmpty: 'No matching deals. Try another search.',
    loadMore: 'Load more',
    loadingMore: 'Loading…',
    previousPage: 'Previous',
    nextPage: 'Next',
    pageOf: 'Page {page} of {total}',
    paginationLabel: 'Pagination',
    mineTitle: 'My submissions',
    mineEmpty: 'You have not posted a deal yet.',
    statusHidden: 'Hidden',
    statusExpired: 'Expired',
    backToDeals: 'Back to deals',
    from: 'Departure airport',
    to: 'Destination',
    airline: 'Airline',
    price: 'Price',
    cabin: 'Cabin',
    trip: 'Trip type',
    travelDates: 'Travel dates',
    dateFromLabel: 'Departure date',
    dateToLabel: 'Return / last date',
    booking: 'Booking / affiliate link',
    bookingHint:
      'Affiliate links are welcome — note the affiliate relationship in the notes above so readers can tell.',
    notes: 'Notes (optional)',
    currency: 'Currency',
    viewDeal: 'View deal',
    submitTitle: 'Post a flight deal',
    submitSub:
      'Share a fare you found, or your own affiliate link. It goes live on the deals page immediately.',
    submitNote:
      'Individuals may post their own affiliate links. Make sure the fare is real and bookable, and say in the notes that the link is an affiliate link. Fake, expired or misleading offers are removed.',
    submitting: 'Posting…',
    success: 'Posted — your deal is live on the deals page.',
    rateLimited: 'You have reached today’s submission limit. Try again tomorrow.',
    signInTitle: 'Sign in to post',
    signInBody: 'To keep the board free of spam, posting a deal requires a Google account.',
    signInCta: 'Sign in with Google',
    airportPlaceholder: 'IATA code, e.g. PEK',
    destinationPlaceholder: 'City or airport, e.g. Shanghai / PVG',
    airlinePlaceholder: 'e.g. Air China',
    pricePlaceholder: 'Total incl. taxes, e.g. 680',
    currencyPlaceholder: 'USD',
    bookingPlaceholder: 'https://… (airline, OTA, or your affiliate link)',
    notesPlaceholder: 'Baggage, stops, conditions; mark affiliate links as such… (optional)',
    airportError: 'Enter a valid three-letter airport code.',
    destinationError: 'Enter a destination (2–60 characters).',
    airlineError: 'Enter an airline (2–60 characters).',
    priceError: 'Enter a valid price greater than 0.',
    currencyError: 'Enter a three-letter currency code, e.g. USD.',
    dateError: 'Invalid dates: the return cannot precede departure or be in the past.',
    urlError: 'Enter a booking or affiliate link starting with http:// or https://.',
    notesError: 'Notes can be at most 600 characters.',
    genericError: 'Could not post the deal. Please try again.',
    submittedBy: 'Posted by {name}',
    submittedAt: 'Submitted {date}',
    close: 'Close',
    unverified: 'Unverified · may contain affiliate links',
    taxExcluded: 'Excl. taxes',
    officialFare: 'Official fare',
    expires: 'Valid until {date}',
    oneWay: 'One way',
    roundTrip: 'Round trip',
    economy: 'Economy',
    premium: 'Premium economy',
    business: 'Business',
    first: 'First',
  },

  de: {
    kicker: 'Flugangebote',
    title: 'Flugangebote ab Flughäfen',
    en: 'Deals',
    sub: 'Von Reisenden und einzelnen Creators eingereichte günstige Flüge ab Flughäfen – auch eigene Affiliate-Links. Neueste zuerst; Preis und Verfügbarkeit bitte bei der Airline oder auf der Buchungsseite prüfen.',
    latest: 'Neueste Angebote',
    all: 'Alle Angebote',
    submit: 'Angebot melden',
    empty: 'Noch keine Angebote.',
    emptyHint: 'Mit Google anmelden und den ersten Preis oder den eigenen Affiliate-Link teilen.',
    loadError: 'Angebote sind derzeit nicht verfügbar.',
    retry: 'Erneut versuchen',
    listingSub:
      'Günstige Flüge nach Abflughafen durchsuchen. Auch Einzelpersonen können eigene Affiliate-Links einreichen – neue Angebote erscheinen sofort.',
    disclaimer:
      'Einige Buchungslinks sind Affiliate-Links der Einreichenden, die dafür eine Provision erhalten können. Preise werden von Nutzern eingereicht und nicht geprüft – bitte bei der Airline oder auf der Buchungsseite bestätigen.',
    searchPlaceholder: 'Ziel oder Airline suchen',
    searchEmpty: 'Keine passenden Angebote. Andere Suche versuchen.',
    loadMore: 'Mehr laden',
    loadingMore: 'Wird geladen…',
    previousPage: 'Zurück',
    nextPage: 'Weiter',
    pageOf: 'Seite {page} von {total}',
    paginationLabel: 'Seiten',
    mineTitle: 'Meine Beiträge',
    mineEmpty: 'Du hast noch kein Angebot eingereicht.',
    statusHidden: 'Ausgeblendet',
    statusExpired: 'Abgelaufen',
    backToDeals: 'Zurück zu den Angeboten',
    from: 'Abflughafen',
    to: 'Ziel',
    airline: 'Airline',
    price: 'Preis',
    cabin: 'Kabine',
    trip: 'Reiseart',
    travelDates: 'Reisedaten',
    dateFromLabel: 'Hinflugdatum',
    dateToLabel: 'Rückflug / letztes Datum',
    booking: 'Buchungs-/Affiliate-Link',
    bookingHint:
      'Affiliate-Links sind willkommen – bitte die Provisionsbeziehung oben in den Hinweisen nennen, damit Leser sie erkennen.',
    notes: 'Hinweise (optional)',
    currency: 'Währung',
    viewDeal: 'Zum Angebot',
    submitTitle: 'Flugangebot einreichen',
    submitSub:
      'Teile einen gefundenen Preis oder deinen eigenen Affiliate-Link. Er erscheint sofort auf der Angebotsseite.',
    submitNote:
      'Einzelpersonen dürfen eigene Affiliate-Links einreichen. Der Preis muss real und buchbar sein, und in den Hinweisen muss stehen, dass es ein Affiliate-Link ist. Falsche, abgelaufene oder irreführende Angebote werden entfernt.',
    submitting: 'Wird gesendet…',
    success: 'Eingereicht – dein Angebot ist jetzt online.',
    rateLimited: 'Tageslimit für Einreichungen erreicht. Morgen erneut versuchen.',
    signInTitle: 'Zum Einreichen anmelden',
    signInBody:
      'Damit die Liste spamfrei bleibt, ist für ein Angebot ein Google-Konto nötig.',
    signInCta: 'Mit Google anmelden',
    airportPlaceholder: 'IATA-Code, z. B. FRA',
    destinationPlaceholder: 'Stadt oder Flughafen, z. B. Shanghai / PVG',
    airlinePlaceholder: 'z. B. Lufthansa',
    pricePlaceholder: 'Gesamtpreis inkl. Steuern, z. B. 680',
    currencyPlaceholder: 'EUR',
    bookingPlaceholder: 'https://… (Airline, OTA oder dein Affiliate-Link)',
    notesPlaceholder: 'Gepäck, Umstiege, Bedingungen; Affiliate-Links bitte kennzeichnen… (optional)',
    airportError: 'Bitte einen gültigen dreistelligen Flughafencode angeben.',
    destinationError: 'Bitte ein Ziel angeben (2–60 Zeichen).',
    airlineError: 'Bitte eine Airline angeben (2–60 Zeichen).',
    priceError: 'Bitte einen gültigen Preis größer als 0 angeben.',
    currencyError: 'Bitte einen dreistelligen Währungscode angeben, z. B. EUR.',
    dateError:
      'Ungültige Daten: Rückreise nicht vor Abreise und nicht in der Vergangenheit.',
    urlError: 'Bitte einen Buchungs- oder Affiliate-Link mit http:// oder https:// angeben.',
    notesError: 'Hinweise dürfen höchstens 600 Zeichen haben.',
    genericError: 'Einreichen fehlgeschlagen. Bitte später erneut versuchen.',
    submittedBy: 'Eingereicht von {name}',
    submittedAt: 'Eingereicht am {date}',
    close: 'Schließen',
    unverified: 'Ungeprüft · evtl. Affiliate-Links',
    taxExcluded: 'Zzgl. Steuern',
    officialFare: 'Offizieller Tarif',
    expires: 'Gültig bis {date}',
    oneWay: 'Einfach',
    roundTrip: 'Hin und zurück',
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First',
  },

  fr: {
    kicker: 'Bons plans vols',
    title: 'Bons plans vols au départ des aéroports',
    en: 'Deals',
    sub: 'Des tarifs aériens au départ d’aéroports, proposés par des voyageurs et des créateurs indépendants — y compris leurs propres liens d’affiliation. Les plus récents en premier ; vérifiez toujours le prix et les disponibilités sur le site de la compagnie ou de réservation.',
    latest: 'Derniers bons plans',
    all: 'Tous les bons plans',
    submit: 'Publier un bon plan',
    empty: 'Aucun bon plan pour le moment.',
    emptyHint:
      'Connectez-vous avec Google et partagez le premier tarif, ou votre propre lien d’affiliation.',
    loadError: 'Les bons plans sont momentanément indisponibles.',
    retry: 'Réessayer',
    listingSub:
      'Parcourez les tarifs par aéroport de départ. Les particuliers peuvent aussi publier leurs propres liens d’affiliation — les nouvelles publications apparaissent immédiatement.',
    disclaimer:
      'Certains liens de réservation sont des liens d’affiliation de l’auteur, qui peut percevoir une commission. Les tarifs sont soumis par des utilisateurs et non vérifiés — confirmez sur le site de la compagnie ou de réservation.',
    searchPlaceholder: 'Rechercher une destination ou une compagnie',
    searchEmpty: 'Aucun bon plan correspondant. Essayez une autre recherche.',
    loadMore: 'Charger plus',
    loadingMore: 'Chargement…',
    previousPage: 'Précédent',
    nextPage: 'Suivant',
    pageOf: 'Page {page} sur {total}',
    paginationLabel: 'Pagination',
    mineTitle: 'Mes publications',
    mineEmpty: 'Vous n’avez pas encore publié de bon plan.',
    statusHidden: 'Masqué',
    statusExpired: 'Expiré',
    backToDeals: 'Retour aux bons plans',
    from: 'Aéroport de départ',
    to: 'Destination',
    airline: 'Compagnie',
    price: 'Prix',
    cabin: 'Cabine',
    trip: 'Type de voyage',
    travelDates: 'Dates de voyage',
    dateFromLabel: 'Date aller',
    dateToLabel: 'Retour / dernière date',
    booking: 'Lien de réservation / d’affiliation',
    bookingHint:
      'Les liens d’affiliation sont acceptés — précisez la relation d’affiliation dans les remarques ci-dessus pour que les lecteurs puissent la reconnaître.',
    notes: 'Remarques (facultatif)',
    currency: 'Devise',
    viewDeal: 'Voir l’offre',
    submitTitle: 'Publier un bon plan',
    submitSub:
      'Partagez un tarif trouvé ou votre propre lien d’affiliation. Il est publié immédiatement sur la page des bons plans.',
    submitNote:
      'Les particuliers peuvent publier leurs propres liens d’affiliation. Le tarif doit être réel et réservable, et les remarques doivent préciser qu’il s’agit d’un lien d’affiliation. Les offres fausses, expirées ou trompeuses sont supprimées.',
    submitting: 'Publication…',
    success: 'Publié — votre bon plan est en ligne.',
    rateLimited: 'Limite quotidienne de publications atteinte. Réessayez demain.',
    signInTitle: 'Connectez-vous pour publier',
    signInBody:
      'Pour éviter le spam, la publication d’un bon plan nécessite un compte Google.',
    signInCta: 'Se connecter avec Google',
    airportPlaceholder: 'Code IATA, ex. CDG',
    destinationPlaceholder: 'Ville ou aéroport, ex. Shanghai / PVG',
    airlinePlaceholder: 'ex. Air France',
    pricePlaceholder: 'Total taxes comprises, ex. 680',
    currencyPlaceholder: 'EUR',
    bookingPlaceholder: 'https://… (compagnie, OTA ou votre lien d’affiliation)',
    notesPlaceholder:
      'Bagages, escales, conditions ; précisez « lien d’affiliation » le cas échéant… (facultatif)',
    airportError: 'Indiquez un code d’aéroport à trois lettres valide.',
    destinationError: 'Indiquez une destination (2 à 60 caractères).',
    airlineError: 'Indiquez une compagnie (2 à 60 caractères).',
    priceError: 'Indiquez un prix valide supérieur à 0.',
    currencyError: 'Indiquez un code devise à trois lettres, ex. EUR.',
    dateError: 'Dates invalides : le retour ne peut précéder le départ ni être passé.',
    urlError: 'Indiquez un lien de réservation ou d’affiliation commençant par http:// ou https://.',
    notesError: 'Les remarques sont limitées à 600 caractères.',
    genericError: 'Publication impossible. Réessayez plus tard.',
    submittedBy: 'Publié par {name}',
    submittedAt: 'Soumis le {date}',
    close: 'Fermer',
    unverified: 'Non vérifié · liens d’affiliation possibles',
    taxExcluded: 'Hors taxes',
    officialFare: 'Tarif officiel',
    expires: 'Valable jusqu’au {date}',
    oneWay: 'Aller simple',
    roundTrip: 'Aller-retour',
    economy: 'Économique',
    premium: 'Premium',
    business: 'Affaires',
    first: 'Première',
  },

  it: {
    kicker: 'Offerte voli',
    title: 'Offerte voli dagli aeroporti',
    en: 'Deals',
    sub: 'Tariffe per voli in partenza da aeroporti, inviate da viaggiatori e creatori individuali — compresi i loro link di affiliazione. Le più recenti per prime; verifica sempre prezzo e disponibilità sul sito della compagnia o di prenotazione.',
    latest: 'Ultime offerte',
    all: 'Tutte le offerte',
    submit: 'Pubblica un’offerta',
    empty: 'Nessuna offerta al momento.',
    emptyHint:
      'Accedi con Google e condividi la prima tariffa, o il tuo link di affiliazione.',
    loadError: 'Le offerte non sono disponibili al momento.',
    retry: 'Riprova',
    listingSub:
      'Sfoglia le tariffe per aeroporto di partenza. Anche i privati possono pubblicare i propri link di affiliazione — le nuove pubblicazioni compaiono subito.',
    disclaimer:
      'Alcuni link di prenotazione sono link di affiliazione di chi pubblica, che può ricevere una commissione. Le tariffe sono inviate dagli utenti e non verificate — confermale sul sito della compagnia o di prenotazione.',
    searchPlaceholder: 'Cerca destinazione o compagnia',
    searchEmpty: 'Nessuna offerta corrispondente. Prova un’altra ricerca.',
    loadMore: 'Carica altre',
    loadingMore: 'Caricamento…',
    previousPage: 'Precedente',
    nextPage: 'Successiva',
    pageOf: 'Pagina {page} di {total}',
    paginationLabel: 'Paginazione',
    mineTitle: 'Le mie pubblicazioni',
    mineEmpty: 'Non hai ancora pubblicato offerte.',
    statusHidden: 'Nascosta',
    statusExpired: 'Scaduta',
    backToDeals: 'Torna alle offerte',
    from: 'Aeroporto di partenza',
    to: 'Destinazione',
    airline: 'Compagnia',
    price: 'Prezzo',
    cabin: 'Cabina',
    trip: 'Tipo di viaggio',
    travelDates: 'Date di viaggio',
    dateFromLabel: 'Data di andata',
    dateToLabel: 'Ritorno / ultima data',
    booking: 'Link di prenotazione / affiliazione',
    bookingHint:
      'I link di affiliazione sono benvenuti — indica il rapporto di affiliazione nelle note qui sopra, così i lettori possono riconoscerlo.',
    notes: 'Note (facoltativo)',
    currency: 'Valuta',
    viewDeal: 'Vedi offerta',
    submitTitle: 'Pubblica un’offerta',
    submitSub:
      'Condividi una tariffa trovata o il tuo link di affiliazione. Va online subito nella pagina delle offerte.',
    submitNote:
      'I privati possono pubblicare i propri link di affiliazione. La tariffa deve essere reale e prenotabile, e nelle note va indicato che il link è di affiliazione. Le offerte false, scadute o fuorvianti vengono rimosse.',
    submitting: 'Invio…',
    success: 'Pubblicata — la tua offerta è online.',
    rateLimited: 'Limite giornaliero raggiunto. Riprova domani.',
    signInTitle: 'Accedi per pubblicare',
    signInBody: 'Per evitare lo spam, pubblicare un’offerta richiede un account Google.',
    signInCta: 'Accedi con Google',
    airportPlaceholder: 'Codice IATA, es. FCO',
    destinationPlaceholder: 'Città o aeroporto, es. Shanghai / PVG',
    airlinePlaceholder: 'es. ITA Airways',
    pricePlaceholder: 'Totale tasse incluse, es. 680',
    currencyPlaceholder: 'EUR',
    bookingPlaceholder: 'https://… (compagnia, OTA o il tuo link di affiliazione)',
    notesPlaceholder: 'Bagaglio, scali, condizioni; segnala i link di affiliazione… (facoltativo)',
    airportError: 'Inserisci un codice aeroportuale di tre lettere valido.',
    destinationError: 'Inserisci una destinazione (2–60 caratteri).',
    airlineError: 'Inserisci una compagnia (2–60 caratteri).',
    priceError: 'Inserisci un prezzo valido maggiore di 0.',
    currencyError: 'Inserisci un codice valuta di tre lettere, es. EUR.',
    dateError:
      'Date non valide: il ritorno non può precedere la partenza né essere passato.',
    urlError: 'Inserisci un link di prenotazione o affiliazione che inizi con http:// o https://.',
    notesError: 'Le note possono contenere al massimo 600 caratteri.',
    genericError: 'Pubblicazione non riuscita. Riprova più tardi.',
    submittedBy: 'Pubblicata da {name}',
    submittedAt: 'Inviato il {date}',
    close: 'Chiudi',
    unverified: 'Non verificata · possibili link di affiliazione',
    taxExcluded: 'Tasse escluse',
    officialFare: 'Tariffa ufficiale',
    expires: 'Valida fino al {date}',
    oneWay: 'Solo andata',
    roundTrip: 'Andata e ritorno',
    economy: 'Economy',
    premium: 'Premium economy',
    business: 'Business',
    first: 'Prima',
  },

  ko: {
    kicker: '특가 항공권',
    title: '공항 항공권 특가',
    en: 'Deals',
    sub: '여행자와 개인 크리에이터가 올린 공항 출발 특가 항공권입니다. 개인의 제휴(어필리에이트) 링크도 포함하며, 최신순으로 보여 줍니다. 가격과 좌석은 항공사나 예약 페이지에서 확인하세요.',
    latest: '최신 특가',
    all: '전체 특가',
    submit: '특가 올리기',
    empty: '아직 등록된 특가가 없습니다.',
    emptyHint: 'Google로 로그인하고 첫 특가나 자신의 제휴 링크를 공유해 보세요.',
    loadError: '특가 정보를 불러올 수 없습니다.',
    retry: '다시 시도',
    listingSub:
      '출발 공항별로 여행자가 올린 특가를 둘러보세요. 개인도 자신의 제휴 링크를 올릴 수 있으며, 새로 올린 특가는 즉시 표시됩니다.',
    disclaimer:
      '일부 예약 링크는 제출자의 제휴 링크이며, 제출자가 수수료를 받을 수 있습니다. 가격은 사용자가 올린 정보로 검증되지 않았으니 항공사나 예약 페이지에서 확인하세요.',
    searchPlaceholder: '목적지 또는 항공사 검색',
    searchEmpty: '일치하는 특가가 없습니다. 다른 검색어를 입력해 보세요.',
    loadMore: '더 보기',
    loadingMore: '불러오는 중…',
    previousPage: '이전',
    nextPage: '다음',
    pageOf: '{page} / {total} 페이지',
    paginationLabel: '페이지 이동',
    mineTitle: '내가 올린 특가',
    mineEmpty: '아직 올린 특가가 없습니다.',
    statusHidden: '숨김',
    statusExpired: '만료됨',
    backToDeals: '특가 목록으로',
    from: '출발 공항',
    to: '목적지',
    airline: '항공사',
    price: '가격',
    cabin: '좌석 등급',
    trip: '여정 유형',
    travelDates: '여행 날짜',
    dateFromLabel: '가는 날',
    dateToLabel: '오는 날 / 마지막 날',
    booking: '예약 / 제휴 링크',
    bookingHint: '개인 제휴 링크도 환영합니다. 위 추가 정보에 제휴 관계를 밝혀 주세요.',
    notes: '추가 정보(선택)',
    currency: '통화',
    viewDeal: '예약 보기',
    submitTitle: '특가 항공권 올리기',
    submitSub: '찾은 특가나 자신의 제휴 링크를 공유하세요. 등록 즉시 특가 페이지에 표시됩니다.',
    submitNote:
      '개인도 자신의 제휴(어필리에이트) 링크를 올릴 수 있습니다. 가격이 실제로 예약 가능해야 하며, 추가 정보에 제휴 링크임을 밝혀 주세요. 허위·만료·오해를 부르는 정보는 삭제됩니다.',
    submitting: '등록 중…',
    success: '등록 완료 — 특가 페이지에 표시됩니다.',
    rateLimited: '오늘 등록 한도를 초과했습니다. 내일 다시 시도해 주세요.',
    signInTitle: '로그인 후 등록',
    signInBody: '스팸을 막기 위해 특가 등록에는 Google 계정 로그인이 필요합니다.',
    signInCta: 'Google로 로그인',
    airportPlaceholder: 'IATA 코드, 예: ICN',
    destinationPlaceholder: '도시 또는 공항, 예: 상하이 / PVG',
    airlinePlaceholder: '예: 대한항공',
    pricePlaceholder: '세금 포함 총액, 예: 680',
    currencyPlaceholder: 'KRW',
    bookingPlaceholder: 'https://… (항공사, OTA 또는 내 제휴 링크)',
    notesPlaceholder: '수하물, 경유, 조건 등; 제휴 링크는 "제휴 링크"라고 표시해 주세요(선택)',
    airportError: '유효한 세 글자 공항 코드를 입력하세요.',
    destinationError: '목적지를 입력하세요(2–60자).',
    airlineError: '항공사를 입력하세요(2–60자).',
    priceError: '0보다 큰 유효한 가격을 입력하세요.',
    currencyError: '세 글자 통화 코드를 입력하세요. 예: KRW.',
    dateError: '날짜가 올바르지 않습니다. 귀국일은 출발일보다 빠르거나 과거일 수 없습니다.',
    urlError: 'http:// 또는 https://로 시작하는 예약 또는 제휴 링크를 입력하세요.',
    notesError: '추가 정보는 최대 600자입니다.',
    genericError: '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    submittedBy: '{name} 님이 등록',
    submittedAt: '{date}에 제출됨',
    close: '닫기',
    unverified: '미검증 · 제휴 링크 포함 가능',
    taxExcluded: '세금 별도',
    officialFare: '공식 요금',
    expires: '{date}까지 유효',
    oneWay: '편도',
    roundTrip: '왕복',
    economy: '이코노미',
    premium: '프리미엄 이코노미',
    business: '비즈니스',
    first: '퍼스트',
  },

  es: {
    kicker: 'Ofertas de vuelos',
    title: 'Ofertas de vuelos desde aeropuertos',
    en: 'Ofertas',
    sub: 'Vuelos baratos desde aeropuertos, publicados por viajeros y creadores individuales, incluidos sus propios enlaces de afiliado. Los más recientes primero; confirma siempre el precio y la disponibilidad en la aerolínea o en la página de reserva.',
    latest: 'Últimas ofertas',
    all: 'Todas las ofertas',
    submit: 'Publicar una oferta',
    empty: 'Todavía no hay ofertas.',
    emptyHint: 'Inicia sesión con Google y comparte la primera tarifa, o tu propio enlace de afiliado.',
    loadError: 'Las ofertas no están disponibles temporalmente.',
    retry: 'Volver a intentarlo',
    listingSub:
      'Explora tarifas baratas por aeropuerto de salida. Los particulares también pueden publicar sus propios enlaces de afiliado; las ofertas nuevas aparecen al instante.',
    disclaimer:
      'Algunos enlaces de reserva son enlaces de afiliado del autor, que puede recibir una comisión. Las tarifas las envían los usuarios y no están verificadas; confírmalas siempre en la aerolínea o en la página de reserva.',
    searchPlaceholder: 'Busca un destino o una aerolínea',
    searchEmpty: 'No hay ofertas que coincidan. Prueba con otra búsqueda.',
    loadMore: 'Cargar más',
    loadingMore: 'Cargando…',
    previousPage: 'Anterior',
    nextPage: 'Siguiente',
    pageOf: 'Página {page} de {total}',
    paginationLabel: 'Paginación',
    mineTitle: 'Mis envíos',
    mineEmpty: 'Todavía no has publicado ninguna oferta.',
    statusHidden: 'Oculta',
    statusExpired: 'Caducada',
    backToDeals: 'Volver a las ofertas',
    from: 'Aeropuerto de salida',
    to: 'Destino',
    airline: 'Aerolínea',
    price: 'Precio',
    cabin: 'Cabina',
    trip: 'Tipo de viaje',
    travelDates: 'Fechas de viaje',
    dateFromLabel: 'Fecha de ida',
    dateToLabel: 'Vuelta / última fecha',
    booking: 'Enlace de reserva o de afiliado',
    bookingHint:
      'Los enlaces de afiliado son bienvenidos; indica la relación de afiliado en las notas de arriba para que los lectores puedan reconocerla.',
    notes: 'Notas (opcional)',
    currency: 'Moneda',
    viewDeal: 'Ver oferta',
    submitTitle: 'Publicar una oferta de vuelo',
    submitSub:
      'Comparte una tarifa que hayas encontrado o tu propio enlace de afiliado. Se publica al instante en la página de ofertas.',
    submitNote:
      'Los particulares pueden publicar sus propios enlaces de afiliado. Asegúrate de que la tarifa sea real y reservable, e indica en las notas que el enlace es de afiliado. Las ofertas falsas, caducadas o engañosas se eliminan.',
    submitting: 'Publicando…',
    success: 'Publicado: tu oferta ya está en la página de ofertas.',
    rateLimited: 'Has alcanzado el límite de envíos de hoy. Vuelve a intentarlo mañana.',
    signInTitle: 'Inicia sesión para publicar',
    signInBody:
      'Para evitar el spam, publicar una oferta requiere una cuenta de Google.',
    signInCta: 'Iniciar sesión con Google',
    airportPlaceholder: 'Código IATA, p. ej., PEK',
    destinationPlaceholder: 'Ciudad o aeropuerto, p. ej., Shanghái / PVG',
    airlinePlaceholder: 'p. ej., Air China',
    pricePlaceholder: 'Total con impuestos, p. ej., 680',
    currencyPlaceholder: 'EUR',
    bookingPlaceholder: 'https://… (aerolínea, OTA o tu enlace de afiliado)',
    notesPlaceholder: 'Equipaje, escalas, condiciones; marca los enlaces de afiliado como tales… (opcional)',
    airportError: 'Introduce un código de aeropuerto válido de tres letras.',
    destinationError: 'Introduce un destino (2–60 caracteres).',
    airlineError: 'Introduce una aerolínea (2–60 caracteres).',
    priceError: 'Introduce un precio válido mayor que 0.',
    currencyError: 'Introduce un código de moneda de tres letras, p. ej., EUR.',
    dateError: 'Fechas no válidas: la vuelta no puede ser anterior a la ida ni estar en el pasado.',
    urlError: 'Introduce un enlace de reserva o de afiliado que empiece por http:// o https://.',
    notesError: 'Las notas pueden tener como máximo 600 caracteres.',
    genericError: 'No se ha podido publicar la oferta. Vuelve a intentarlo.',
    submittedBy: 'Publicado por {name}',
    submittedAt: 'Enviado el {date}',
    close: 'Cerrar',
    unverified: 'Sin verificar · puede contener enlaces de afiliado',
    taxExcluded: 'Impuestos no incluidos',
    officialFare: 'Tarifa oficial',
    expires: 'Válida hasta el {date}',
    oneWay: 'Solo ida',
    roundTrip: 'Ida y vuelta',
    economy: 'Económica',
    premium: 'Económica premium',
    business: 'Ejecutiva',
    first: 'Primera',
  },

  pt: {
    kicker: 'Ofertas de voos',
    title: 'Ofertas de voos saindo de aeroportos',
    en: 'Ofertas',
    sub: 'Passagens baratas saindo de aeroportos, enviadas por viajantes e criadores individuais — incluindo seus próprios links de afiliado. Mais recentes primeiro; confirme sempre o preço e a disponibilidade no site da companhia aérea ou de reserva.',
    latest: 'Últimas ofertas',
    all: 'Todas as ofertas',
    submit: 'Publicar oferta',
    empty: 'Ainda não há ofertas.',
    emptyHint: 'Entre com o Google e compartilhe a primeira tarifa, ou seu próprio link de afiliado.',
    loadError: 'As ofertas estão temporariamente indisponíveis.',
    retry: 'Tentar novamente',
    listingSub:
      'Navegue por tarifas baixas por aeroporto de partida. Pessoas físicas também podem publicar seus próprios links de afiliado — novas ofertas aparecem na hora.',
    disclaimer:
      'Alguns links de reserva são links de afiliado do autor, que pode receber uma comissão. As tarifas são enviadas por usuários e não verificadas — confirme sempre no site da companhia aérea ou de reserva.',
    searchPlaceholder: 'Buscar destino ou companhia aérea',
    searchEmpty: 'Nenhuma oferta encontrada. Tente outra busca.',
    loadMore: 'Carregar mais',
    loadingMore: 'Carregando…',
    previousPage: 'Anterior',
    nextPage: 'Próxima',
    pageOf: 'Página {page} de {total}',
    paginationLabel: 'Paginação',
    mineTitle: 'Minhas publicações',
    mineEmpty: 'Você ainda não publicou nenhuma oferta.',
    statusHidden: 'Oculta',
    statusExpired: 'Expirada',
    backToDeals: 'Voltar às ofertas',
    from: 'Aeroporto de partida',
    to: 'Destino',
    airline: 'Companhia aérea',
    price: 'Preço',
    cabin: 'Cabine',
    trip: 'Tipo de viagem',
    travelDates: 'Datas da viagem',
    dateFromLabel: 'Data de ida',
    dateToLabel: 'Volta / última data',
    booking: 'Link de reserva ou de afiliado',
    bookingHint:
      'Links de afiliado são bem-vindos — indique a relação de afiliado nas observações acima para que os leitores possam identificar.',
    notes: 'Observações (opcional)',
    currency: 'Moeda',
    viewDeal: 'Ver oferta',
    submitTitle: 'Publicar oferta de voo',
    submitSub:
      'Compartilhe uma tarifa que você encontrou ou seu próprio link de afiliado. Ela entra no ar imediatamente na página de ofertas.',
    submitNote:
      'Pessoas físicas podem publicar seus próprios links de afiliado. Certifique-se de que a tarifa é real e reservável, e diga nas observações que o link é de afiliado. Ofertas falsas, expiradas ou enganosas são removidas.',
    submitting: 'Publicando…',
    success: 'Publicado — sua oferta já está na página de ofertas.',
    rateLimited: 'Você atingiu o limite de publicações de hoje. Tente novamente amanhã.',
    signInTitle: 'Entre para publicar',
    signInBody:
      'Para evitar spam, publicar uma oferta exige uma conta do Google.',
    signInCta: 'Entrar com o Google',
    airportPlaceholder: 'Código IATA, ex. PEK',
    destinationPlaceholder: 'Cidade ou aeroporto, ex. Xangai / PVG',
    airlinePlaceholder: 'ex. Air China',
    pricePlaceholder: 'Total com impostos, ex. 680',
    currencyPlaceholder: 'BRL',
    bookingPlaceholder: 'https://… (companhia aérea, OTA ou seu link de afiliado)',
    notesPlaceholder: 'Bagagem, conexões, condições; marque links de afiliado como tais… (opcional)',
    airportError: 'Informe um código de aeroporto válido de três letras.',
    destinationError: 'Informe um destino (2–60 caracteres).',
    airlineError: 'Informe uma companhia aérea (2–60 caracteres).',
    priceError: 'Informe um preço válido maior que 0.',
    currencyError: 'Informe um código de moeda de três letras, ex. BRL.',
    dateError: 'Datas inválidas: a volta não pode ser anterior à ida nem estar no passado.',
    urlError: 'Informe um link de reserva ou de afiliado que comece com http:// ou https://.',
    notesError: 'As observações podem ter no máximo 600 caracteres.',
    genericError: 'Não foi possível publicar a oferta. Tente novamente.',
    submittedBy: 'Publicado por {name}',
    submittedAt: 'Enviado em {date}',
    close: 'Fechar',
    unverified: 'Não verificado · pode conter links de afiliado',
    taxExcluded: 'Impostos não incluídos',
    officialFare: 'Tarifa oficial',
    expires: 'Válida até {date}',
    oneWay: 'Somente ida',
    roundTrip: 'Ida e volta',
    economy: 'Econômica',
    premium: 'Econômica premium',
    business: 'Executiva',
    first: 'Primeira classe',
  },

  ja: {
    kicker: '航空券のお得情報',
    title: '空港発の航空券お得情報',
    en: 'お得情報',
    sub: '旅行者や個人クリエイターが投稿した、空港発の格安航空券です。ご自身のアフィリエイトリンクも含まれます。新着順で表示しています。料金と空席状況は、必ず航空会社または予約ページでご確認ください。',
    latest: '最新のお得情報',
    all: 'すべてのお得情報',
    submit: 'お得情報を投稿',
    empty: 'まだお得情報はありません。',
    emptyHint:
      'Google でログインして、最初の運賃やご自身のアフィリエイトリンクを共有しましょう。',
    loadError: 'お得情報を一時的に読み込めません。',
    retry: '再試行',
    listingSub:
      '出発空港ごとに格安運賃を探せます。個人の方もご自身のアフィリエイトリンクを投稿でき、投稿後すぐに表示されます。',
    disclaimer:
      '一部の予約リンクは投稿者のアフィリエイトリンクであり、投稿者が手数料を受け取る場合があります。運賃はユーザー投稿で未確認のため、航空会社または予約ページで必ずご確認ください。',
    searchPlaceholder: '目的地または航空会社を検索',
    searchEmpty: '一致するお得情報がありません。別のキーワードでお試しください。',
    loadMore: 'さらに読み込む',
    loadingMore: '読み込み中…',
    previousPage: '前へ',
    nextPage: '次へ',
    pageOf: '{page} / {total} ページ',
    paginationLabel: 'ページ送り',
    mineTitle: '自分の投稿',
    mineEmpty: 'まだお得情報を投稿していません。',
    statusHidden: '非表示',
    statusExpired: '期限切れ',
    backToDeals: 'お得情報一覧に戻る',
    from: '出発空港',
    to: '目的地',
    airline: '航空会社',
    price: '料金',
    cabin: '座席クラス',
    trip: '旅程タイプ',
    travelDates: '旅行日',
    dateFromLabel: '往路 / 開始日',
    dateToLabel: '復路 / 最終日',
    booking: '予約 / アフィリエイトリンク',
    bookingHint:
      '個人のアフィリエイトリンクも歓迎です。読者が判別できるよう、上のメモにアフィリエイトの関係を記載してください。',
    notes: 'メモ（任意）',
    currency: '通貨',
    viewDeal: 'お得情報を見る',
    submitTitle: '航空券のお得情報を投稿',
    submitSub:
      '見つけた運賃やご自身のアフィリエイトリンクを共有してください。投稿するとすぐにお得情報ページに表示されます。',
    submitNote:
      '個人の方もご自身のアフィリエイトリンクを投稿できます。運賃が実際に予約可能であることを確認し、メモにアフィリエイトリンクである旨を記載してください。虚偽、期限切れ、誤解を招く情報は削除されます。',
    submitting: '投稿中…',
    success: '投稿しました。お得情報ページに表示されています。',
    rateLimited: '本日の投稿上限に達しました。明日もう一度お試しください。',
    signInTitle: 'ログインして投稿',
    signInBody:
      'スパム防止のため、お得情報の投稿には Google アカウントでのログインが必要です。',
    signInCta: 'Google でログイン',
    airportPlaceholder: 'IATA コード（例：PEK）',
    destinationPlaceholder: '都市または空港（例：上海 / PVG）',
    airlinePlaceholder: '例：中国国際航空',
    pricePlaceholder: '税込総額（例：680）',
    currencyPlaceholder: 'JPY',
    bookingPlaceholder: 'https://…（航空会社、OTA、ご自身のアフィリエイトリンク）',
    notesPlaceholder:
      '手荷物、乗り継ぎ、条件など。アフィリエイトリンクはその旨を明記してください（任意）',
    airportError: '有効な 3 文字の空港コードを入力してください。',
    destinationError: '目的地を入力してください（2〜60 文字）。',
    airlineError: '航空会社を入力してください（2〜60 文字）。',
    priceError: '0 より大きい有効な料金を入力してください。',
    currencyError: '3 文字の通貨コードを入力してください（例：JPY）。',
    dateError: '日付が正しくありません。復路は往路より前、または過去の日付にできません。',
    urlError: 'http:// または https:// で始まる予約またはアフィリエイトリンクを入力してください。',
    notesError: 'メモは 600 文字以内で入力してください。',
    genericError: '投稿できませんでした。しばらくしてからもう一度お試しください。',
    submittedBy: '{name} さんの投稿',
    submittedAt: '投稿日：{date}',
    close: '閉じる',
    unverified: '未確認 · アフィリエイトリンクを含む場合があります',
    taxExcluded: '税別',
    officialFare: '公式運賃',
    expires: '{date} まで有効',
    oneWay: '片道',
    roundTrip: '往復',
    economy: 'エコノミー',
    premium: 'プレミアムエコノミー',
    business: 'ビジネス',
    first: 'ファースト',
  },

  id: {
    kicker: 'Oferta penerbangan',
    title: 'Oferta penerbangan dari bandara',
    en: 'Oferta',
    sub: 'Tarif murah dari bandara yang dikirim oleh pelancong dan kreator perorangan, termasuk tautan afiliasi milik mereka sendiri. Terbaru lebih dulu; selalu konfirmasi harga dan ketersediaan di situs maskapai atau pemesanan.',
    latest: 'Oferta terbaru',
    all: 'Semua oferta',
    submit: 'Kirim oferta',
    empty: 'Belum ada oferta.',
    emptyHint: 'Masuk dengan Google dan bagikan tarif pertama, atau tautan afiliasi Anda sendiri.',
    loadError: 'Oferta sementara tidak tersedia.',
    retry: 'Coba lagi',
    listingSub:
      'Jelajahi tarif murah berdasarkan bandara keberangkatan. Perorangan juga dapat mengirim tautan afiliasi sendiri — kiriman baru langsung tampil.',
    disclaimer:
      'Beberapa tautan pemesanan adalah tautan afiliasi pengirim, dan pengirim dapat menerima komisi. Tarif dikirim oleh pengguna dan belum diverifikasi — selalu konfirmasi di situs maskapai atau pemesanan.',
    searchPlaceholder: 'Cari tujuan atau maskapai',
    searchEmpty: 'Tidak ada oferta yang cocok. Coba kata kunci lain.',
    loadMore: 'Muat lebih banyak',
    loadingMore: 'Memuat…',
    previousPage: 'Sebelumnya',
    nextPage: 'Berikutnya',
    pageOf: 'Halaman {page} dari {total}',
    paginationLabel: 'Paginasi',
    mineTitle: 'Kiriman saya',
    mineEmpty: 'Anda belum mengirim oferta.',
    statusHidden: 'Disembunyikan',
    statusExpired: 'Kedaluwarsa',
    backToDeals: 'Kembali ke oferta',
    from: 'Bandara keberangkatan',
    to: 'Tujuan',
    airline: 'Maskapai',
    price: 'Harga',
    cabin: 'Kelas kabin',
    trip: 'Jenis perjalanan',
    travelDates: 'Tanggal perjalanan',
    dateFromLabel: 'Tanggal berangkat',
    dateToLabel: 'Kepulangan / tanggal terakhir',
    booking: 'Tautan pemesanan / afiliasi',
    bookingHint:
      'Tautan afiliasi dipersilakan — sebutkan hubungan afiliasi di catatan di atas agar pembaca mengetahuinya.',
    notes: 'Catatan (opsional)',
    currency: 'Mata uang',
    viewDeal: 'Lihat oferta',
    submitTitle: 'Kirim oferta penerbangan',
    submitSub:
      'Bagikan tarif yang Anda temukan, atau tautan afiliasi Anda sendiri. Oferta langsung tampil di halaman oferta.',
    submitNote:
      'Perorangan boleh mengirim tautan afiliasi sendiri. Pastikan tarifnya nyata dan dapat dipesan, dan sebutkan di catatan bahwa tautan tersebut adalah tautan afiliasi. Oferta palsu, kedaluwarsa, atau menyesatkan akan dihapus.',
    submitting: 'Mengirim…',
    success: 'Terkirim — oferta Anda sudah tampil di halaman oferta.',
    rateLimited: 'Batas kiriman hari ini telah tercapai. Coba lagi besok.',
    signInTitle: 'Masuk untuk mengirim',
    signInBody: 'Agar bebas spam, mengirim oferta memerlukan akun Google.',
    signInCta: 'Masuk dengan Google',
    airportPlaceholder: 'Kode IATA, mis. CGK',
    destinationPlaceholder: 'Kota atau bandara, mis. Jakarta / CGK',
    airlinePlaceholder: 'mis. Garuda Indonesia',
    pricePlaceholder: 'Total termasuk pajak, mis. 680',
    currencyPlaceholder: 'IDR',
    bookingPlaceholder: 'https://… (maskapai, OTA, atau tautan afiliasi Anda)',
    notesPlaceholder: 'Bagasi, transit, ketentuan; tandai tautan afiliasi… (opsional)',
    airportError: 'Masukkan kode bandara tiga huruf yang valid.',
    destinationError: 'Masukkan tujuan (2–60 karakter).',
    airlineError: 'Masukkan maskapai (2–60 karakter).',
    priceError: 'Masukkan harga yang valid lebih dari 0.',
    currencyError: 'Masukkan kode mata uang tiga huruf, mis. IDR.',
    dateError: 'Tanggal tidak valid: kepulangan tidak boleh sebelum keberangkatan atau di masa lalu.',
    urlError: 'Masukkan tautan pemesanan atau afiliasi yang diawali http:// atau https://.',
    notesError: 'Catatan maksimal 600 karakter.',
    genericError: 'Oferta tidak dapat dikirim. Silakan coba lagi nanti.',
    submittedBy: 'Dikirim oleh {name}',
    submittedAt: 'Dikirim {date}',
    close: 'Tutup',
    unverified: 'Belum diverifikasi · mungkin berisi tautan afiliasi',
    taxExcluded: 'Tidak termasuk pajak',
    officialFare: 'Tarif resmi',
    expires: 'Berlaku hingga {date}',
    oneWay: 'Sekali jalan',
    roundTrip: 'Pulang pergi',
    economy: 'Ekonomi',
    premium: 'Ekonomi premium',
    business: 'Bisnis',
    first: 'Kelas satu',
  },

  vi: {
    kicker: 'Ưu đãi vé máy bay',
    title: 'Ưu đãi vé máy bay từ sân bay',
    en: 'Ưu đãi',
    sub: 'Vé giá rẻ khởi hành từ sân bay, do du khách và người sáng tạo cá nhân gửi lên — bao gồm cả liên kết tiếp thị của chính họ. Mới nhất trước; hãy luôn kiểm tra giá và tình trạng chỗ trên trang của hãng bay hoặc trang đặt vé.',
    latest: 'Ưu đãi mới nhất',
    all: 'Tất cả ưu đãi',
    submit: 'Đăng ưu đãi',
    empty: 'Chưa có ưu đãi nào.',
    emptyHint:
      'Đăng nhập bằng Google và chia sẻ mức giá đầu tiên, hoặc liên kết tiếp thị của bạn.',
    loadError: 'Tạm thời không tải được ưu đãi.',
    retry: 'Thử lại',
    listingSub:
      'Duyệt giá rẻ theo sân bay khởi hành. Cá nhân cũng có thể đăng liên kết tiếp thị của mình — bài đăng mới hiển thị ngay.',
    disclaimer:
      'Một số liên kết đặt vé là liên kết tiếp thị của người gửi, và người gửi có thể nhận hoa hồng. Giá do người dùng gửi lên và chưa được xác minh — hãy luôn kiểm tra trên trang của hãng bay hoặc trang đặt vé.',
    searchPlaceholder: 'Tìm điểm đến hoặc hãng bay',
    searchEmpty: 'Không có ưu đãi phù hợp. Hãy thử từ khóa khác.',
    loadMore: 'Tải thêm',
    loadingMore: 'Đang tải…',
    previousPage: 'Trước',
    nextPage: 'Tiếp',
    pageOf: 'Trang {page} / {total}',
    paginationLabel: 'Phân trang',
    mineTitle: 'Bài đăng của tôi',
    mineEmpty: 'Bạn chưa đăng ưu đãi nào.',
    statusHidden: 'Đã ẩn',
    statusExpired: 'Đã hết hạn',
    backToDeals: 'Quay lại danh sách ưu đãi',
    from: 'Sân bay khởi hành',
    to: 'Điểm đến',
    airline: 'Hãng bay',
    price: 'Giá',
    cabin: 'Hạng ghế',
    trip: 'Loại hành trình',
    travelDates: 'Ngày đi',
    dateFromLabel: 'Ngày khởi hành',
    dateToLabel: 'Ngày về / ngày cuối',
    booking: 'Liên kết đặt vé / tiếp thị',
    bookingHint:
      'Liên kết tiếp thị được hoan nghênh — hãy ghi rõ mối quan hệ tiếp thị trong phần ghi chú ở trên để người đọc nhận biết.',
    notes: 'Ghi chú (không bắt buộc)',
    currency: 'Tiền tệ',
    viewDeal: 'Xem ưu đãi',
    submitTitle: 'Đăng ưu đãi vé máy bay',
    submitSub:
      'Chia sẻ mức giá bạn tìm được hoặc liên kết tiếp thị của bạn. Bài đăng sẽ hiển thị ngay trên trang ưu đãi.',
    submitNote:
      'Cá nhân có thể đăng liên kết tiếp thị của mình. Hãy đảm bảo giá là thật và có thể đặt được, đồng thời ghi trong phần ghi chú rằng đây là liên kết tiếp thị. Các ưu đãi giả, hết hạn hoặc gây hiểu nhầm sẽ bị xóa.',
    submitting: 'Đang đăng…',
    success: 'Đã đăng — ưu đãi của bạn đã hiển thị trên trang ưu đãi.',
    rateLimited: 'Bạn đã đạt giới hạn đăng bài hôm nay. Hãy thử lại vào ngày mai.',
    signInTitle: 'Đăng nhập để đăng bài',
    signInBody: 'Để tránh spam, việc đăng ưu đãi cần có tài khoản Google.',
    signInCta: 'Đăng nhập bằng Google',
    airportPlaceholder: 'Mã IATA, ví dụ SGN',
    destinationPlaceholder: 'Thành phố hoặc sân bay, ví dụ Hà Nội / HAN',
    airlinePlaceholder: 'ví dụ Vietnam Airlines',
    pricePlaceholder: 'Tổng giá đã gồm thuế, ví dụ 680',
    currencyPlaceholder: 'VND',
    bookingPlaceholder: 'https://… (hãng bay, OTA hoặc liên kết tiếp thị của bạn)',
    notesPlaceholder: 'Hành lý, điểm dừng, điều kiện; ghi rõ liên kết tiếp thị… (không bắt buộc)',
    airportError: 'Vui lòng nhập mã sân bay ba chữ cái hợp lệ.',
    destinationError: 'Vui lòng nhập điểm đến (2–60 ký tự).',
    airlineError: 'Vui lòng nhập hãng bay (2–60 ký tự).',
    priceError: 'Vui lòng nhập giá hợp lệ lớn hơn 0.',
    currencyError: 'Vui lòng nhập mã tiền tệ ba chữ cái, ví dụ VND.',
    dateError: 'Ngày không hợp lệ: ngày về không được trước ngày đi hoặc ở trong quá khứ.',
    urlError:
      'Vui lòng nhập liên kết đặt vé hoặc tiếp thị bắt đầu bằng http:// hoặc https://.',
    notesError: 'Ghi chú tối đa 600 ký tự.',
    genericError: 'Không thể đăng ưu đãi. Vui lòng thử lại sau.',
    submittedBy: 'Đăng bởi {name}',
    submittedAt: 'Gửi lúc {date}',
    close: 'Đóng',
    unverified: 'Chưa xác minh · có thể chứa liên kết tiếp thị',
    taxExcluded: 'Chưa gồm thuế',
    officialFare: 'Giá chính thức',
    expires: 'Có hiệu lực đến {date}',
    oneWay: 'Một chiều',
    roundTrip: 'Khứ hồi',
    economy: 'Phổ thông',
    premium: 'Phổ thông cao cấp',
    business: 'Thương gia',
    first: 'Hạng nhất',
  },

  ru: {
    kicker: 'Выгодные билеты',
    title: 'Выгодные авиабилеты из аэропортов',
    en: 'Предложения',
    sub: 'Дешёвые авиабилеты из аэропортов от путешественников и независимых авторов, включая их партнёрские ссылки. Сначала новые; всегда проверяйте цену и наличие мест на сайте авиакомпании или на странице бронирования.',
    latest: 'Последние предложения',
    all: 'Все предложения',
    submit: 'Добавить предложение',
    empty: 'Пока нет предложений.',
    emptyHint: 'Войдите через Google и поделитесь первой находкой или своей партнёрской ссылкой.',
    loadError: 'Предложения временно недоступны.',
    retry: 'Повторить',
    listingSub:
      'Просматривайте дешёвые билеты по аэропорту вылета. Частные лица тоже могут добавлять свои партнёрские ссылки — новые предложения появляются сразу.',
    disclaimer:
      'Некоторые ссылки на бронирование — партнёрские ссылки авторов, и они могут получать комиссию. Цены добавлены пользователями и не проверены — всегда уточняйте на сайте авиакомпании или на странице бронирования.',
    searchPlaceholder: 'Поиск по пункту назначения или авиакомпании',
    searchEmpty: 'Подходящих предложений нет. Попробуйте другой запрос.',
    loadMore: 'Показать ещё',
    loadingMore: 'Загрузка…',
    previousPage: 'Назад',
    nextPage: 'Вперёд',
    pageOf: 'Страница {page} из {total}',
    paginationLabel: 'Постраничная навигация',
    mineTitle: 'Мои предложения',
    mineEmpty: 'Вы ещё не добавляли предложений.',
    statusHidden: 'Скрыто',
    statusExpired: 'Истекло',
    backToDeals: 'Назад к предложениям',
    from: 'Аэропорт вылета',
    to: 'Пункт назначения',
    airline: 'Авиакомпания',
    price: 'Цена',
    cabin: 'Класс обслуживания',
    trip: 'Тип поездки',
    travelDates: 'Даты поездки',
    dateFromLabel: 'Дата вылета',
    dateToLabel: 'Дата возвращения / последняя дата',
    booking: 'Ссылка на бронирование / партнёрская ссылка',
    bookingHint:
      'Партнёрские ссылки приветствуются — укажите партнёрские отношения в примечаниях выше, чтобы читатели могли их распознать.',
    notes: 'Примечания (необязательно)',
    currency: 'Валюта',
    viewDeal: 'Посмотреть предложение',
    submitTitle: 'Добавить предложение по авиабилету',
    submitSub:
      'Поделитесь найденной ценой или своей партнёрской ссылкой. Предложение сразу появится на странице предложений.',
    submitNote:
      'Частные лица могут добавлять свои партнёрские ссылки. Убедитесь, что тариф реальный и по нему можно забронировать, и укажите в примечаниях, что ссылка партнёрская. Ложные, истёкшие и вводящие в заблуждение предложения удаляются.',
    submitting: 'Отправка…',
    success: 'Готово — ваше предложение опубликовано на странице предложений.',
    rateLimited: 'Вы достигли дневного лимита отправок. Попробуйте завтра.',
    signInTitle: 'Войдите, чтобы добавить предложение',
    signInBody:
      'Чтобы на доске не было спама, для добавления предложения нужен аккаунт Google.',
    signInCta: 'Войти через Google',
    airportPlaceholder: 'Код IATA, например PEK',
    destinationPlaceholder: 'Город или аэропорт, например Шанхай / PVG',
    airlinePlaceholder: 'например, Air China',
    pricePlaceholder: 'Итоговая цена с налогами, например 680',
    currencyPlaceholder: 'USD',
    bookingPlaceholder: 'https://… (авиакомпания, OTA или ваша партнёрская ссылка)',
    notesPlaceholder:
      'Багаж, пересадки, условия; партнёрские ссылки помечайте как таковые… (необязательно)',
    airportError: 'Укажите действительный трёхбуквенный код аэропорта.',
    destinationError: 'Укажите пункт назначения (от 2 до 60 символов).',
    airlineError: 'Укажите авиакомпанию (от 2 до 60 символов).',
    priceError: 'Укажите действительную цену больше 0.',
    currencyError: 'Укажите трёхбуквенный код валюты, например USD.',
    dateError:
      'Неверные даты: дата возвращения не может быть раньше даты вылета или в прошлом.',
    urlError:
      'Укажите ссылку на бронирование или партнёрскую ссылку, начинающуюся с http:// или https://.',
    notesError: 'Примечания могут содержать не более 600 символов.',
    genericError: 'Не удалось добавить предложение. Попробуйте позже.',
    submittedBy: 'Добавлено пользователем {name}',
    submittedAt: 'Отправлено {date}',
    close: 'Закрыть',
    unverified: 'Не проверено · возможны партнёрские ссылки',
    taxExcluded: 'Без налогов',
    officialFare: 'Официальный тариф',
    expires: 'Действует до {date}',
    oneWay: 'В одну сторону',
    roundTrip: 'Туда и обратно',
    economy: 'Эконом',
    premium: 'Премиум-эконом',
    business: 'Бизнес',
    first: 'Первый класс',
  },

  tr: {
    kicker: 'Uçak bileti fırsatları',
    title: 'Havalimanlarından uçak bileti fırsatları',
    en: 'Fırsatlar',
    sub: 'Gezginler ve bireysel içerik üreticileri tarafından paylaşılan, havalimanlarından kalkan ucuz uçuşlar — kendi ortaklık bağlantıları dahil. En yeniler önce; fiyatı ve müsaitliği her zaman havayolu veya rezervasyon sayfasından doğrulayın.',
    latest: 'En yeni fırsatlar',
    all: 'Tüm fırsatlar',
    submit: 'Fırsat paylaş',
    empty: 'Henüz fırsat yok.',
    emptyHint:
      'Google ile giriş yapın ve ilk fırsatı ya da kendi ortaklık bağlantınızı paylaşın.',
    loadError: 'Fırsatlar şu anda kullanılamıyor.',
    retry: 'Tekrar dene',
    listingSub:
      'Kalkış havalimanına göre ucuz biletlere göz atın. Bireyler de kendi ortaklık bağlantılarını paylaşabilir — yeni paylaşımlar anında görünür.',
    disclaimer:
      'Bazı rezervasyon bağlantıları paylaşan kişinin ortaklık bağlantılarıdır ve paylaşan kişi komisyon kazanabilir. Fiyatlar kullanıcılar tarafından paylaşılır ve doğrulanmamıştır — her zaman havayolu veya rezervasyon sayfasından teyit edin.',
    searchPlaceholder: 'Varış noktası veya havayolu ara',
    searchEmpty: 'Eşleşen fırsat yok. Başka bir arama deneyin.',
    loadMore: 'Daha fazla yükle',
    loadingMore: 'Yükleniyor…',
    previousPage: 'Önceki',
    nextPage: 'Sonraki',
    pageOf: 'Sayfa {page} / {total}',
    paginationLabel: 'Sayfalama',
    mineTitle: 'Paylaşımlarım',
    mineEmpty: 'Henüz bir fırsat paylaşmadınız.',
    statusHidden: 'Gizli',
    statusExpired: 'Süresi dolmuş',
    backToDeals: 'Fırsatlara dön',
    from: 'Kalkış havalimanı',
    to: 'Varış noktası',
    airline: 'Havayolu',
    price: 'Fiyat',
    cabin: 'Kabin',
    trip: 'Seyahat türü',
    travelDates: 'Seyahat tarihleri',
    dateFromLabel: 'Gidiş tarihi',
    dateToLabel: 'Dönüş / son tarih',
    booking: 'Rezervasyon / ortaklık bağlantısı',
    bookingHint:
      'Ortaklık bağlantıları memnuniyetle karşılanır — okuyucuların fark edebilmesi için ortaklık ilişkisini yukarıdaki notlarda belirtin.',
    notes: 'Notlar (isteğe bağlı)',
    currency: 'Para birimi',
    viewDeal: 'Fırsatı gör',
    submitTitle: 'Uçak bileti fırsatı paylaş',
    submitSub:
      'Bulduğunuz bir fiyatı veya kendi ortaklık bağlantınızı paylaşın. Fırsat hemen fırsatlar sayfasında yayınlanır.',
    submitNote:
      'Bireyler kendi ortaklık bağlantılarını paylaşabilir. Fiyatın gerçek ve rezerve edilebilir olduğundan emin olun ve notlarda bağlantının ortaklık bağlantısı olduğunu belirtin. Sahte, süresi dolmuş veya yanıltıcı fırsatlar kaldırılır.',
    submitting: 'Paylaşılıyor…',
    success: 'Paylaşıldı — fırsatınız fırsatlar sayfasında yayında.',
    rateLimited: 'Bugünkü paylaşım sınırına ulaştınız. Yarın tekrar deneyin.',
    signInTitle: 'Paylaşmak için giriş yapın',
    signInBody:
      'Panonun spam içermemesi için fırsat paylaşmak Google hesabı gerektirir.',
    signInCta: 'Google ile giriş yap',
    airportPlaceholder: 'IATA kodu, ör. PEK',
    destinationPlaceholder: 'Şehir veya havalimanı, ör. Şanghay / PVG',
    airlinePlaceholder: 'ör. Türk Hava Yolları',
    pricePlaceholder: 'Vergiler dahil toplam, ör. 680',
    currencyPlaceholder: 'TRY',
    bookingPlaceholder: 'https://… (havayolu, OTA veya kendi ortaklık bağlantınız)',
    notesPlaceholder:
      'Bagaj, aktarmalar, koşullar; ortaklık bağlantılarını belirtin… (isteğe bağlı)',
    airportError: 'Geçerli üç harfli bir havalimanı kodu girin.',
    destinationError: 'Bir varış noktası girin (2–60 karakter).',
    airlineError: 'Bir havayolu girin (2–60 karakter).',
    priceError: '0’dan büyük geçerli bir fiyat girin.',
    currencyError: 'Üç harfli bir para birimi kodu girin, ör. TRY.',
    dateError: 'Geçersiz tarihler: dönüş, gidişten önce veya geçmişte olamaz.',
    urlError:
      'http:// veya https:// ile başlayan bir rezervasyon veya ortaklık bağlantısı girin.',
    notesError: 'Notlar en fazla 600 karakter olabilir.',
    genericError: 'Fırsat paylaşılamadı. Lütfen daha sonra tekrar deneyin.',
    submittedBy: '{name} tarafından paylaşıldı',
    submittedAt: '{date} tarihinde gönderildi',
    close: 'Kapat',
    unverified: 'Doğrulanmadı · ortaklık bağlantıları içerebilir',
    taxExcluded: 'Vergiler hariç',
    officialFare: 'Resmi tarife',
    expires: '{date} tarihine kadar geçerli',
    oneWay: 'Tek yön',
    roundTrip: 'Gidiş-dönüş',
    economy: 'Ekonomi',
    premium: 'Premium ekonomi',
    business: 'Business',
    first: 'First',
  },

  th: {
    kicker: 'โปรโมชั่นตั๋วเครื่องบิน',
    title: 'โปรโมชั่นตั๋วเครื่องบินจากสนามบิน',
    en: 'ดีล',
    sub: 'ตั๋วเครื่องบินราคาประหยัดจากสนามบินที่นักเดินทางและครีเอเตอร์รายบุคคลส่งเข้ามา รวมถึงลิงก์พันธมิตรของพวกเขาเอง เรียงจากใหม่สุดก่อน และควรตรวจสอบราคาและที่นั่งว่างกับสายการบินหรือหน้าจองอีกครั้งเสมอ',
    latest: 'ดีลล่าสุด',
    all: 'ดีลทั้งหมด',
    submit: 'โพสต์ดีล',
    empty: 'ยังไม่มีดีล',
    emptyHint: 'เข้าสู่ระบบด้วย Google แล้วแชร์ดีลแรกหรือลิงก์พันธมิตรของคุณ',
    loadError: 'ไม่สามารถโหลดดีลได้ชั่วคราว',
    retry: 'ลองอีกครั้ง',
    listingSub:
      'เรียกดูตั๋วราคาถูกตามสนามบินต้นทาง บุคคลทั่วไปก็โพสต์ลิงก์พันธมิตรของตัวเองได้ และดีลใหม่จะแสดงทันที',
    disclaimer:
      'ลิงก์จองบางรายการเป็นลิงก์พันธมิตรของผู้ส่ง และผู้ส่งอาจได้รับค่าคอมมิชชัน ราคาเป็นข้อมูลที่ผู้ใช้ส่งเข้ามาและยังไม่ได้ตรวจสอบ โปรดยืนยันกับสายการบินหรือหน้าจองเสมอ',
    searchPlaceholder: 'ค้นหาจุดหมายหรือสายการบิน',
    searchEmpty: 'ไม่พบดีลที่ตรงกัน ลองค้นหาด้วยคำอื่น',
    loadMore: 'โหลดเพิ่ม',
    loadingMore: 'กำลังโหลด…',
    previousPage: 'ก่อนหน้า',
    nextPage: 'ถัดไป',
    pageOf: 'หน้า {page} จาก {total}',
    paginationLabel: 'การแบ่งหน้า',
    mineTitle: 'ดีลที่ฉันโพสต์',
    mineEmpty: 'คุณยังไม่ได้โพสต์ดีล',
    statusHidden: 'ซ่อนอยู่',
    statusExpired: 'หมดอายุ',
    backToDeals: 'กลับไปที่ดีล',
    from: 'สนามบินต้นทาง',
    to: 'จุดหมายปลายทาง',
    airline: 'สายการบิน',
    price: 'ราคา',
    cabin: 'ชั้นโดยสาร',
    trip: 'ประเภทการเดินทาง',
    travelDates: 'วันที่เดินทาง',
    dateFromLabel: 'วันที่ขาออก',
    dateToLabel: 'วันที่ขากลับ / วันสุดท้าย',
    booking: 'ลิงก์จอง / ลิงก์พันธมิตร',
    bookingHint:
      'ยินดีรับลิงก์พันธมิตร โปรดระบุความสัมพันธ์แบบพันธมิตรในหมายเหตุด้านบนเพื่อให้ผู้อ่านทราบ',
    notes: 'หมายเหตุ (ไม่บังคับ)',
    currency: 'สกุลเงิน',
    viewDeal: 'ดูดีล',
    submitTitle: 'โพสต์ดีลตั๋วเครื่องบิน',
    submitSub:
      'แชร์ราคาที่คุณพบหรือลิงก์พันธมิตรของคุณ ดีลจะแสดงบนหน้าดีลทันที',
    submitNote:
      'บุคคลทั่วไปสามารถโพสต์ลิงก์พันธมิตรของตัวเองได้ โปรดตรวจสอบว่าราคาเป็นจริงและจองได้ และระบุในหมายเหตุว่าเป็นลิงก์พันธมิตร ดีลที่เป็นเท็จ หมดอายุ หรือทำให้เข้าใจผิดจะถูกลบ',
    submitting: 'กำลังโพสต์…',
    success: 'โพสต์แล้ว ดีลของคุณแสดงอยู่บนหน้าดีล',
    rateLimited: 'คุณโพสต์ครบจำนวนสูงสุดของวันนี้แล้ว โปรดลองใหม่พรุ่งนี้',
    signInTitle: 'เข้าสู่ระบบเพื่อโพสต์',
    signInBody: 'เพื่อป้องกันสแปม การโพสต์ดีลต้องใช้บัญชี Google',
    signInCta: 'เข้าสู่ระบบด้วย Google',
    airportPlaceholder: 'รหัส IATA เช่น PEK',
    destinationPlaceholder: 'เมืองหรือสนามบิน เช่น เซี่ยงไฮ้ / PVG',
    airlinePlaceholder: 'เช่น Air China',
    pricePlaceholder: 'ราคารวมภาษี เช่น 680',
    currencyPlaceholder: 'THB',
    bookingPlaceholder: 'https://… (สายการบิน OTA หรือลิงก์พันธมิตรของคุณ)',
    notesPlaceholder:
      'น้ำหนักสัมภาระ จุดต่อเครื่อง เงื่อนไข; ลิงก์พันธมิตรโปรดระบุให้ชัดเจน… (ไม่บังคับ)',
    airportError: 'โปรดกรอกรหัสสนามบินสามตัวอักษรที่ถูกต้อง',
    destinationError: 'โปรดกรอกจุดหมายปลายทาง (2–60 ตัวอักษร)',
    airlineError: 'โปรดกรอกสายการบิน (2–60 ตัวอักษร)',
    priceError: 'โปรดกรอกราคาที่ถูกต้องมากกว่า 0',
    currencyError: 'โปรดกรอกรหัสสกุลเงินสามตัวอักษร เช่น THB',
    dateError:
      'วันที่ไม่ถูกต้อง: วันขากลับต้องไม่ก่อนวันขาออกและต้องไม่เป็นวันที่ผ่านมาแล้ว',
    urlError:
      'โปรดกรอกลิงก์จองหรือลิงก์พันธมิตรที่ขึ้นต้นด้วย http:// หรือ https://',
    notesError: 'หมายเหตุมีความยาวได้ไม่เกิน 600 ตัวอักษร',
    genericError: 'ไม่สามารถโพสต์ดีลได้ โปรดลองอีกครั้งภายหลัง',
    submittedBy: 'โพสต์โดย {name}',
    submittedAt: 'ส่งเมื่อ {date}',
    close: 'ปิด',
    unverified: 'ยังไม่ได้ตรวจสอบ · อาจมีลิงก์พันธมิตร',
    taxExcluded: 'ไม่รวมภาษี',
    officialFare: 'ราคาทางการ',
    expires: 'ใช้ได้ถึง {date}',
    oneWay: 'เที่ยวเดียว',
    roundTrip: 'ไป-กลับ',
    economy: 'ชั้นประหยัด',
    premium: 'พรีเมียมอีโคโนมี',
    business: 'ชั้นธุรกิจ',
    first: 'ชั้นเฟิร์สต์',
  },
};

export const AUTH: Record<PublishedLocale, AuthMessages> = {
  zh: {
    signInTitle: '登录',
    signInSub: '使用 Google 账号登录，即可提交特惠机票、发表评论并查看自己的提交。',
    signInWithGoogle: '使用 Google 登录',
    signOut: '退出登录',
    signedInAs: '已登录为 {name}',
    notConfiguredTitle: 'Google 登录尚未配置',
    notConfiguredBody:
      '管理员需要在 .env.local 中配置 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET 才能启用登录。',
    oauthError: '登录失败，请重试。',
    accessDenied: '你取消了 Google 授权。',
    stateError: '登录会话已过期，请重新登录。',
    continueCta: '继续',
    mySubmissions: '我的提交',
    admin: '管理后台',
    commentSignInTitle: '登录后评论',
    commentSignInBody: '评论已改为 Google 账号登录，登录后即可以你的昵称和头像发表评论。',
    privacyNote:
      '登录仅用于识别提交者与评论者。我们只保存 Google 提供的昵称、邮箱和头像地址，不会获取其他数据。',
    loading: '正在加载…',
    retry: '重试',
    accountMenu: '账户菜单',
    backHome: '返回首页',
  },

  tw: {
    signInTitle: '登入',
    signInSub: '使用 Google 帳號登入，即可提交特惠機票、發表留言並查看自己的提交。',
    signInWithGoogle: '使用 Google 登入',
    signOut: '登出',
    signedInAs: '已登入為 {name}',
    notConfiguredTitle: 'Google 登入尚未設定',
    notConfiguredBody:
      '管理員需要在 .env.local 中設定 GOOGLE_CLIENT_ID 與 GOOGLE_CLIENT_SECRET 才能啟用登入。',
    oauthError: '登入失敗，請重試。',
    accessDenied: '你取消了 Google 授權。',
    stateError: '登入工作階段已過期，請重新登入。',
    continueCta: '繼續',
    mySubmissions: '我的提交',
    admin: '管理後台',
    commentSignInTitle: '登入後留言',
    commentSignInBody: '留言已改為 Google 帳號登入，登入後即可以你的暱稱和頭像發表留言。',
    privacyNote:
      '登入僅用於識別提交者與留言者。我們只儲存 Google 提供的暱稱、電子郵件與頭像網址，不會取得其他資料。',
    loading: '正在載入…',
    retry: '重試',
    accountMenu: '帳戶選單',
    backHome: '返回首頁',
  },

  en: {
    signInTitle: 'Sign in',
    signInSub:
      'Sign in with Google to post flight deals, join the discussion and see your submissions.',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign out',
    signedInAs: 'Signed in as {name}',
    notConfiguredTitle: 'Google sign-in is not configured',
    notConfiguredBody:
      'An administrator must set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to enable sign-in.',
    oauthError: 'Sign-in failed. Please try again.',
    accessDenied: 'You cancelled the Google authorization.',
    stateError: 'Your sign-in session expired. Please sign in again.',
    continueCta: 'Continue',
    mySubmissions: 'My submissions',
    admin: 'Admin',
    commentSignInTitle: 'Sign in to comment',
    commentSignInBody:
      'Comments now use Google sign-in, so your name and avatar appear with what you post.',
    privacyNote:
      'Sign-in is only used to identify people posting deals or comments. We store just the name, email and avatar URL Google provides.',
    loading: 'Loading…',
    retry: 'Retry',
    accountMenu: 'Account menu',
    backHome: 'Back to home',
  },

  de: {
    signInTitle: 'Anmelden',
    signInSub:
      'Mit Google anmelden, um Flugangebote zu veröffentlichen, mitzudiskutieren und eigene Beiträge zu sehen.',
    signInWithGoogle: 'Mit Google anmelden',
    signOut: 'Abmelden',
    signedInAs: 'Angemeldet als {name}',
    notConfiguredTitle: 'Google-Anmeldung ist nicht konfiguriert',
    notConfiguredBody:
      'Ein Administrator muss GOOGLE_CLIENT_ID und GOOGLE_CLIENT_SECRET in .env.local setzen.',
    oauthError: 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
    accessDenied: 'Du hast die Google-Autorisierung abgebrochen.',
    stateError: 'Deine Sitzung ist abgelaufen. Bitte erneut anmelden.',
    continueCta: 'Weiter',
    mySubmissions: 'Meine Beiträge',
    admin: 'Verwaltung',
    commentSignInTitle: 'Zum Kommentieren anmelden',
    commentSignInBody:
      'Kommentare nutzen jetzt die Google-Anmeldung; Name und Avatar erscheinen an deinem Beitrag.',
    privacyNote:
      'Die Anmeldung dient nur zur Identifikation von Beitragenden und Kommentierenden. Gespeichert werden nur Name, E-Mail und Avatar-URL von Google.',
    loading: 'Wird geladen…',
    retry: 'Erneut versuchen',
    accountMenu: 'Kontomenü',
    backHome: 'Zur Startseite',
  },

  fr: {
    signInTitle: 'Se connecter',
    signInSub:
      'Connectez-vous avec Google pour publier des bons plans, participer aux commentaires et voir vos publications.',
    signInWithGoogle: 'Se connecter avec Google',
    signOut: 'Se déconnecter',
    signedInAs: 'Connecté en tant que {name}',
    notConfiguredTitle: 'La connexion Google n’est pas configurée',
    notConfiguredBody:
      'Un administrateur doit définir GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env.local.',
    oauthError: 'Connexion impossible. Réessayez.',
    accessDenied: 'Vous avez annulé l’autorisation Google.',
    stateError: 'Votre session a expiré. Reconnectez-vous.',
    continueCta: 'Continuer',
    mySubmissions: 'Mes publications',
    admin: 'Administration',
    commentSignInTitle: 'Connectez-vous pour commenter',
    commentSignInBody:
      'Les commentaires utilisent désormais la connexion Google : votre nom et votre avatar apparaissent avec votre message.',
    privacyNote:
      'La connexion sert uniquement à identifier les auteurs de bons plans et de commentaires. Nous conservons seulement le nom, l’e-mail et l’URL d’avatar fournis par Google.',
    loading: 'Chargement…',
    retry: 'Réessayer',
    accountMenu: 'Menu du compte',
    backHome: 'Retour à l’accueil',
  },

  it: {
    signInTitle: 'Accedi',
    signInSub:
      'Accedi con Google per pubblicare offerte, partecipare ai commenti e vedere le tue pubblicazioni.',
    signInWithGoogle: 'Accedi con Google',
    signOut: 'Esci',
    signedInAs: 'Accesso come {name}',
    notConfiguredTitle: 'L’accesso con Google non è configurato',
    notConfiguredBody:
      'Un amministratore deve impostare GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET in .env.local.',
    oauthError: 'Accesso non riuscito. Riprova.',
    accessDenied: 'Hai annullato l’autorizzazione Google.',
    stateError: 'La sessione è scaduta. Accedi di nuovo.',
    continueCta: 'Continua',
    mySubmissions: 'Le mie pubblicazioni',
    admin: 'Amministrazione',
    commentSignInTitle: 'Accedi per commentare',
    commentSignInBody:
      'I commenti ora usano l’accesso con Google: nome e avatar compaiono con il tuo messaggio.',
    privacyNote:
      'L’accesso serve solo a identificare chi pubblica offerte o commenti. Salviamo solo nome, email e URL dell’avatar forniti da Google.',
    loading: 'Caricamento…',
    retry: 'Riprova',
    accountMenu: 'Menu account',
    backHome: 'Torna alla home',
  },

  ko: {
    signInTitle: '로그인',
    signInSub:
      'Google로 로그인하면 항공 특가를 올리고, 댓글을 남기고, 내 제출 내역을 볼 수 있습니다.',
    signInWithGoogle: 'Google로 로그인',
    signOut: '로그아웃',
    signedInAs: '{name}(으)로 로그인됨',
    notConfiguredTitle: 'Google 로그인이 설정되지 않았습니다',
    notConfiguredBody:
      '관리자가 .env.local에 GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 설정해야 합니다.',
    oauthError: '로그인하지 못했습니다. 다시 시도해 주세요.',
    accessDenied: 'Google 인증을 취소했습니다.',
    stateError: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
    continueCta: '계속',
    mySubmissions: '내 제출 내역',
    admin: '관리자',
    commentSignInTitle: '로그인 후 댓글 작성',
    commentSignInBody:
      '댓글은 이제 Google 로그인을 사용합니다. 작성한 댓글에 이름과 프로필 사진이 표시됩니다.',
    privacyNote:
      '로그인은 특가 제출자와 댓글 작성자를 식별하는 데만 사용됩니다. Google이 제공하는 이름, 이메일, 프로필 사진 URL만 저장합니다.',
    loading: '불러오는 중…',
    retry: '다시 시도',
    accountMenu: '계정 메뉴',
    backHome: '홈으로',
  },

  es: {
    signInTitle: 'Iniciar sesión',
    signInSub:
      'Inicia sesión con Google para publicar ofertas de vuelos, participar en la conversación y ver tus envíos.',
    signInWithGoogle: 'Iniciar sesión con Google',
    signOut: 'Cerrar sesión',
    signedInAs: 'Sesión iniciada como {name}',
    notConfiguredTitle: 'El inicio de sesión con Google no está configurado',
    notConfiguredBody:
      'Un administrador debe configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local para activar el inicio de sesión.',
    oauthError: 'No se ha podido iniciar sesión. Vuelve a intentarlo.',
    accessDenied: 'Has cancelado la autorización de Google.',
    stateError: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
    continueCta: 'Continuar',
    mySubmissions: 'Mis envíos',
    admin: 'Administración',
    commentSignInTitle: 'Inicia sesión para comentar',
    commentSignInBody:
      'Los comentarios ahora usan el inicio de sesión con Google, así que tu nombre y tu avatar aparecen con lo que publicas.',
    privacyNote:
      'El inicio de sesión solo se usa para identificar a quienes publican ofertas o comentarios. Solo guardamos el nombre, el correo electrónico y la URL del avatar que proporciona Google.',
    loading: 'Cargando…',
    retry: 'Volver a intentarlo',
    accountMenu: 'Menú de la cuenta',
    backHome: 'Volver al inicio',
  },

  pt: {
    signInTitle: 'Entrar',
    signInSub:
      'Entre com o Google para publicar ofertas de voos, participar da discussão e ver suas publicações.',
    signInWithGoogle: 'Entrar com o Google',
    signOut: 'Sair',
    signedInAs: 'Você entrou como {name}',
    notConfiguredTitle: 'O login com o Google não está configurado',
    notConfiguredBody:
      'Um administrador precisa definir GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local para ativar o login.',
    oauthError: 'Não foi possível entrar. Tente novamente.',
    accessDenied: 'Você cancelou a autorização do Google.',
    stateError: 'Sua sessão expirou. Entre novamente.',
    continueCta: 'Continuar',
    mySubmissions: 'Minhas publicações',
    admin: 'Administração',
    commentSignInTitle: 'Entre para comentar',
    commentSignInBody:
      'Os comentários agora usam o login com o Google, então seu nome e avatar aparecem com o que você publicar.',
    privacyNote:
      'O login é usado apenas para identificar quem publica ofertas ou comentários. Armazenamos somente o nome, o e-mail e a URL do avatar fornecidos pelo Google.',
    loading: 'Carregando…',
    retry: 'Tentar novamente',
    accountMenu: 'Menu da conta',
    backHome: 'Voltar ao início',
  },

  ja: {
    signInTitle: 'ログイン',
    signInSub:
      'Google アカウントでログインすると、航空券のお得情報の投稿、コメントの利用、自分の投稿の確認ができます。',
    signInWithGoogle: 'Google でログイン',
    signOut: 'ログアウト',
    signedInAs: '{name} としてログイン中',
    notConfiguredTitle: 'Google ログインが設定されていません',
    notConfiguredBody:
      '管理者が .env.local に GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET を設定すると、ログインを有効にできます。',
    oauthError: 'ログインに失敗しました。もう一度お試しください。',
    accessDenied: 'Google の認証をキャンセルしました。',
    stateError: 'ログインセッションの有効期限が切れました。もう一度ログインしてください。',
    continueCta: '続ける',
    mySubmissions: '自分の投稿',
    admin: '管理',
    commentSignInTitle: 'ログインしてコメント',
    commentSignInBody:
      'コメントは Google ログインが必要になりました。ログインすると、あなたの名前とアイコンがコメントに表示されます。',
    privacyNote:
      'ログインは投稿者とコメントした方を識別するためだけに使用します。Google が提供する名前、メールアドレス、アイコンの URL のみを保存します。',
    loading: '読み込み中…',
    retry: '再試行',
    accountMenu: 'アカウントメニュー',
    backHome: 'ホームに戻る',
  },

  id: {
    signInTitle: 'Masuk',
    signInSub:
      'Masuk dengan Google untuk mengirim oferta penerbangan, ikut berkomentar, dan melihat kiriman Anda.',
    signInWithGoogle: 'Masuk dengan Google',
    signOut: 'Keluar',
    signedInAs: 'Masuk sebagai {name}',
    notConfiguredTitle: 'Login Google belum dikonfigurasi',
    notConfiguredBody:
      'Administrator harus mengatur GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di .env.local untuk mengaktifkan login.',
    oauthError: 'Gagal masuk. Silakan coba lagi.',
    accessDenied: 'Anda membatalkan otorisasi Google.',
    stateError: 'Sesi login Anda telah berakhir. Silakan masuk lagi.',
    continueCta: 'Lanjutkan',
    mySubmissions: 'Kiriman saya',
    admin: 'Admin',
    commentSignInTitle: 'Masuk untuk berkomentar',
    commentSignInBody:
      'Komentar kini menggunakan login Google, sehingga nama dan avatar Anda tampil bersama komentar.',
    privacyNote:
      'Login hanya digunakan untuk mengidentifikasi pengirim oferta atau komentar. Kami hanya menyimpan nama, email, dan URL avatar yang diberikan Google.',
    loading: 'Memuat…',
    retry: 'Coba lagi',
    accountMenu: 'Menu akun',
    backHome: 'Kembali ke beranda',
  },

  vi: {
    signInTitle: 'Đăng nhập',
    signInSub:
      'Đăng nhập bằng Google để đăng ưu đãi vé máy bay, tham gia bình luận và xem các bài đăng của bạn.',
    signInWithGoogle: 'Đăng nhập bằng Google',
    signOut: 'Đăng xuất',
    signedInAs: 'Đã đăng nhập với tên {name}',
    notConfiguredTitle: 'Đăng nhập Google chưa được cấu hình',
    notConfiguredBody:
      'Quản trị viên cần thiết lập GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env.local để bật đăng nhập.',
    oauthError: 'Đăng nhập thất bại. Vui lòng thử lại.',
    accessDenied: 'Bạn đã hủy ủy quyền Google.',
    stateError: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
    continueCta: 'Tiếp tục',
    mySubmissions: 'Bài đăng của tôi',
    admin: 'Quản trị',
    commentSignInTitle: 'Đăng nhập để bình luận',
    commentSignInBody:
      'Bình luận hiện dùng đăng nhập Google, nên tên và ảnh đại diện của bạn sẽ hiển thị cùng nội dung bạn đăng.',
    privacyNote:
      'Đăng nhập chỉ dùng để nhận diện người đăng ưu đãi hoặc bình luận. Chúng tôi chỉ lưu tên, email và URL ảnh đại diện do Google cung cấp.',
    loading: 'Đang tải…',
    retry: 'Thử lại',
    accountMenu: 'Menu tài khoản',
    backHome: 'Về trang chủ',
  },

  ru: {
    signInTitle: 'Вход',
    signInSub:
      'Войдите через Google, чтобы добавлять предложения по авиабилетам, участвовать в обсуждении и видеть свои предложения.',
    signInWithGoogle: 'Войти через Google',
    signOut: 'Выйти',
    signedInAs: 'Вы вошли как {name}',
    notConfiguredTitle: 'Вход через Google не настроен',
    notConfiguredBody:
      'Чтобы включить вход, администратор должен указать GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env.local.',
    oauthError: 'Не удалось войти. Попробуйте ещё раз.',
    accessDenied: 'Вы отменили авторизацию Google.',
    stateError: 'Сеанс входа истёк. Войдите снова.',
    continueCta: 'Продолжить',
    mySubmissions: 'Мои предложения',
    admin: 'Администрирование',
    commentSignInTitle: 'Войдите, чтобы оставить комментарий',
    commentSignInBody:
      'Комментарии теперь используют вход через Google, поэтому ваше имя и аватар будут видны рядом с сообщением.',
    privacyNote:
      'Вход используется только для того, чтобы определить авторов предложений и комментариев. Мы храним только имя, адрес электронной почты и URL аватара, которые предоставляет Google.',
    loading: 'Загрузка…',
    retry: 'Повторить',
    accountMenu: 'Меню аккаунта',
    backHome: 'На главную',
  },

  tr: {
    signInTitle: 'Giriş yap',
    signInSub:
      'Uçak bileti fırsatları paylaşmak, sohbete katılmak ve paylaşımlarınızı görmek için Google ile giriş yapın.',
    signInWithGoogle: 'Google ile giriş yap',
    signOut: 'Çıkış yap',
    signedInAs: '{name} olarak giriş yapıldı',
    notConfiguredTitle: 'Google ile giriş yapılandırılmamış',
    notConfiguredBody:
      'Girişi etkinleştirmek için bir yöneticinin .env.local dosyasında GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET ayarlarını yapması gerekir.',
    oauthError: 'Giriş yapılamadı. Lütfen tekrar deneyin.',
    accessDenied: 'Google yetkilendirmesini iptal ettiniz.',
    stateError: 'Giriş oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
    continueCta: 'Devam et',
    mySubmissions: 'Paylaşımlarım',
    admin: 'Yönetim',
    commentSignInTitle: 'Yorum yapmak için giriş yapın',
    commentSignInBody:
      'Yorumlar artık Google ile girişi kullanıyor; adınız ve avatarınız paylaştığınız içerikle birlikte görünür.',
    privacyNote:
      'Giriş yalnızca fırsat veya yorum paylaşan kişileri tanımlamak için kullanılır. Yalnızca Google’ın sağladığı ad, e-posta adresi ve avatar URL’sini saklarız.',
    loading: 'Yükleniyor…',
    retry: 'Tekrar dene',
    accountMenu: 'Hesap menüsü',
    backHome: 'Ana sayfaya dön',
  },

  th: {
    signInTitle: 'เข้าสู่ระบบ',
    signInSub:
      'เข้าสู่ระบบด้วย Google เพื่อโพสต์ดีลตั๋วเครื่องบิน ร่วมแสดงความคิดเห็น และดูดีลที่คุณโพสต์',
    signInWithGoogle: 'เข้าสู่ระบบด้วย Google',
    signOut: 'ออกจากระบบ',
    signedInAs: 'เข้าสู่ระบบในชื่อ {name}',
    notConfiguredTitle: 'ยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google',
    notConfiguredBody:
      'ผู้ดูแลระบบต้องตั้งค่า GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน .env.local เพื่อเปิดใช้การเข้าสู่ระบบ',
    oauthError: 'เข้าสู่ระบบไม่สำเร็จ โปรดลองอีกครั้ง',
    accessDenied: 'คุณยกเลิกการอนุญาตของ Google แล้ว',
    stateError: 'เซสชันการเข้าสู่ระบบหมดอายุ โปรดเข้าสู่ระบบอีกครั้ง',
    continueCta: 'ดำเนินการต่อ',
    mySubmissions: 'ดีลที่ฉันโพสต์',
    admin: 'ผู้ดูแลระบบ',
    commentSignInTitle: 'เข้าสู่ระบบเพื่อแสดงความคิดเห็น',
    commentSignInBody:
      'ความคิดเห็นใช้การเข้าสู่ระบบด้วย Google แล้ว ชื่อและรูปโปรไฟล์ของคุณจะแสดงพร้อมกับสิ่งที่คุณโพสต์',
    privacyNote:
      'การเข้าสู่ระบบใช้เพียงเพื่อระบุตัวผู้ที่โพสต์ดีลหรือความคิดเห็น เราเก็บเฉพาะชื่อ อีเมล และ URL รูปโปรไฟล์ที่ Google ให้มาเท่านั้น',
    loading: 'กำลังโหลด…',
    retry: 'ลองอีกครั้ง',
    accountMenu: 'เมนูบัญชี',
    backHome: 'กลับหน้าแรก',
  },
};

/**
 * Copy for a published locale, falling back to English for a locale without a
 * catalog (it cannot be routed, but keeps server helpers total).
 */
export function getDealsMessages(locale: Locale): DealsMessages {
  return DEALS[locale as PublishedLocale] ?? DEALS.en;
}

export function getAuthMessages(locale: Locale): AuthMessages {
  return AUTH[locale as PublishedLocale] ?? AUTH.en;
}
