import type { Locale } from './config';

/**
 * Copy for the two features added on top of the directory: reader-submitted
 * airfare deals (`deals`) and Google sign-in (`auth`).
 *
 * Kept in one module rather than inside the seven locale catalogs for two
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
type PublishedLocale = 'en' | 'de' | 'fr' | 'it' | 'ko' | 'zh' | 'tw';

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
    sub: '旅行者提交的机场出发特惠机票，按发布时间排序，价格与余票以航空公司或订票页面为准。',
    latest: '最新特惠',
    all: '查看全部特惠',
    submit: '提交特惠',
    empty: '还没有特惠机票。',
    emptyHint: '用 Google 登录后，把你的发现分享给其他旅行者。',
    loadError: '特惠信息暂时无法加载。',
    retry: '重试',
    listingSub: '按机场浏览旅行者提交的低价机票，提交后会立即展示。',
    disclaimer: '价格由用户提交，未经核验，请以航空公司或订票页面为准。',
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
    booking: '订票链接',
    notes: '补充说明（可选）',
    currency: '币种',
    viewDeal: '查看订票',
    submitTitle: '提交特惠机票',
    submitSub: '分享你发现的好价，提交后会立即出现在特惠页面。',
    submitNote:
      '请只提交真实可订的价格，并附上可验证的航空公司或订票页面链接。虚假信息会被删除。',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: '行李额、转机、限购条件等（可选）',
    airportError: '请填写有效的三字机场代码。',
    destinationError: '请填写目的地（2–60 个字符）。',
    airlineError: '请填写航空公司（2–60 个字符）。',
    priceError: '请填写有效价格（大于 0）。',
    currencyError: '请填写三位币种代码，如 CNY。',
    dateError: '日期无效：返程不能早于出发，也不能是过去的日期。',
    urlError: '请填写以 http:// 或 https:// 开头的订票链接。',
    notesError: '补充说明最多 600 个字符。',
    genericError: '提交失败，请稍后重试。',
    submittedBy: '由 {name} 提交',
    submittedAt: '提交于 {date}',
    close: '关闭',
    unverified: '用户提交 · 未核验',
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
    sub: '旅客提交的機場出發特惠機票，依發佈時間排序，價格與機位以航空公司或訂票頁面為準。',
    latest: '最新特惠',
    all: '查看全部特惠',
    submit: '提交特惠',
    empty: '還沒有特惠機票。',
    emptyHint: '用 Google 登入後，把你的發現分享給其他旅客。',
    loadError: '特惠資訊暫時無法載入。',
    retry: '重試',
    listingSub: '依機場瀏覽旅客提交的低價機票，提交後會立即顯示。',
    disclaimer: '價格由使用者提交，未經查核，請以航空公司或訂票頁面為準。',
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
    booking: '訂票連結',
    notes: '補充說明（選填）',
    currency: '幣別',
    viewDeal: '查看訂票',
    submitTitle: '提交特惠機票',
    submitSub: '分享你發現的好價，提交後會立即出現在特惠頁面。',
    submitNote:
      '請只提交真實可訂的價格，並附上可查證的航空公司或訂票頁面連結。虛假資訊會被刪除。',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: '行李額、轉機、限購條件等（選填）',
    airportError: '請填寫有效的三字機場代碼。',
    destinationError: '請填寫目的地（2–60 個字元）。',
    airlineError: '請填寫航空公司（2–60 個字元）。',
    priceError: '請填寫有效價格（大於 0）。',
    currencyError: '請填寫三位幣別代碼，例如 TWD。',
    dateError: '日期無效：回程不能早於出發，也不能是過去的日期。',
    urlError: '請填寫以 http:// 或 https:// 開頭的訂票連結。',
    notesError: '補充說明最多 600 個字元。',
    genericError: '提交失敗，請稍後再試。',
    submittedBy: '由 {name} 提交',
    submittedAt: '提交於 {date}',
    close: '關閉',
    unverified: '使用者提交 · 未查核',
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
    sub: 'Low fares submitted by travellers, newest first. Always confirm the price and availability on the airline or booking page.',
    latest: 'Latest deals',
    all: 'All deals',
    submit: 'Post a deal',
    empty: 'No deals yet.',
    emptyHint: 'Sign in with Google and share the first fare.',
    loadError: 'Deals are temporarily unavailable.',
    retry: 'Retry',
    listingSub: 'Browse low fares by departure airport. New submissions appear immediately.',
    disclaimer:
      'Fares are submitted by users and are not verified. Confirm on the airline or booking page.',
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
    booking: 'Booking link',
    notes: 'Notes (optional)',
    currency: 'Currency',
    viewDeal: 'View deal',
    submitTitle: 'Post a flight deal',
    submitSub: 'Share a fare you found. It goes live on the deals page immediately.',
    submitNote:
      'Post only real, bookable fares with a verifiable airline or booking link. Fake offers are removed.',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: 'Baggage, stops, conditions… (optional)',
    airportError: 'Enter a valid three-letter airport code.',
    destinationError: 'Enter a destination (2–60 characters).',
    airlineError: 'Enter an airline (2–60 characters).',
    priceError: 'Enter a valid price greater than 0.',
    currencyError: 'Enter a three-letter currency code, e.g. USD.',
    dateError: 'Invalid dates: the return cannot precede departure or be in the past.',
    urlError: 'Enter a booking link starting with http:// or https://.',
    notesError: 'Notes can be at most 600 characters.',
    genericError: 'Could not post the deal. Please try again.',
    submittedBy: 'Posted by {name}',
    submittedAt: 'Submitted {date}',
    close: 'Close',
    unverified: 'User-submitted · unverified',
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
    sub: 'Von Reisenden eingereichte günstige Flüge, neueste zuerst. Preis und Verfügbarkeit bitte bei der Airline oder auf der Buchungsseite prüfen.',
    latest: 'Neueste Angebote',
    all: 'Alle Angebote',
    submit: 'Angebot melden',
    empty: 'Noch keine Angebote.',
    emptyHint: 'Mit Google anmelden und den ersten Preis teilen.',
    loadError: 'Angebote sind derzeit nicht verfügbar.',
    retry: 'Erneut versuchen',
    listingSub:
      'Günstige Flüge nach Abflughafen durchsuchen. Neue Angebote erscheinen sofort.',
    disclaimer:
      'Preise werden von Nutzern eingereicht und nicht geprüft. Bitte bei der Airline oder auf der Buchungsseite bestätigen.',
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
    booking: 'Buchungslink',
    notes: 'Hinweise (optional)',
    currency: 'Währung',
    viewDeal: 'Zum Angebot',
    submitTitle: 'Flugangebot einreichen',
    submitSub: 'Teile einen gefundenen Preis. Er erscheint sofort auf der Angebotsseite.',
    submitNote:
      'Bitte nur echte, buchbare Preise mit überprüfbarem Airline- oder Buchungslink einreichen. Falsche Angaben werden entfernt.',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: 'Gepäck, Umstiege, Bedingungen… (optional)',
    airportError: 'Bitte einen gültigen dreistelligen Flughafencode angeben.',
    destinationError: 'Bitte ein Ziel angeben (2–60 Zeichen).',
    airlineError: 'Bitte eine Airline angeben (2–60 Zeichen).',
    priceError: 'Bitte einen gültigen Preis größer als 0 angeben.',
    currencyError: 'Bitte einen dreistelligen Währungscode angeben, z. B. EUR.',
    dateError:
      'Ungültige Daten: Rückreise nicht vor Abreise und nicht in der Vergangenheit.',
    urlError: 'Bitte einen Buchungslink mit http:// oder https:// angeben.',
    notesError: 'Hinweise dürfen höchstens 600 Zeichen haben.',
    genericError: 'Einreichen fehlgeschlagen. Bitte später erneut versuchen.',
    submittedBy: 'Eingereicht von {name}',
    submittedAt: 'Eingereicht am {date}',
    close: 'Schließen',
    unverified: 'Von Nutzern · ungeprüft',
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
    sub: 'Des tarifs soumis par les voyageurs, les plus récents en premier. Vérifiez toujours le prix et les disponibilités sur le site de la compagnie ou de réservation.',
    latest: 'Derniers bons plans',
    all: 'Tous les bons plans',
    submit: 'Publier un bon plan',
    empty: 'Aucun bon plan pour le moment.',
    emptyHint: 'Connectez-vous avec Google et partagez le premier tarif.',
    loadError: 'Les bons plans sont momentanément indisponibles.',
    retry: 'Réessayer',
    listingSub:
      'Parcourez les tarifs par aéroport de départ. Les nouvelles publications apparaissent immédiatement.',
    disclaimer:
      'Les tarifs sont soumis par des utilisateurs et non vérifiés. Confirmez sur le site de la compagnie ou de réservation.',
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
    booking: 'Lien de réservation',
    notes: 'Remarques (facultatif)',
    currency: 'Devise',
    viewDeal: 'Voir l’offre',
    submitTitle: 'Publier un bon plan',
    submitSub:
      'Partagez un tarif trouvé. Il est publié immédiatement sur la page des bons plans.',
    submitNote:
      'Publiez uniquement des tarifs réels et réservables avec un lien vérifiable. Les offres frauduleuses sont supprimées.',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: 'Bagages, escales, conditions… (facultatif)',
    airportError: 'Indiquez un code d’aéroport à trois lettres valide.',
    destinationError: 'Indiquez une destination (2 à 60 caractères).',
    airlineError: 'Indiquez une compagnie (2 à 60 caractères).',
    priceError: 'Indiquez un prix valide supérieur à 0.',
    currencyError: 'Indiquez un code devise à trois lettres, ex. EUR.',
    dateError: 'Dates invalides : le retour ne peut précéder le départ ni être passé.',
    urlError: 'Indiquez un lien de réservation commençant par http:// ou https://.',
    notesError: 'Les remarques sont limitées à 600 caractères.',
    genericError: 'Publication impossible. Réessayez plus tard.',
    submittedBy: 'Publié par {name}',
    submittedAt: 'Soumis le {date}',
    close: 'Fermer',
    unverified: 'Publication d’utilisateur · non vérifiée',
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
    sub: 'Tariffe inviate dai viaggiatori, le più recenti per prime. Verifica sempre prezzo e disponibilità sul sito della compagnia o di prenotazione.',
    latest: 'Ultime offerte',
    all: 'Tutte le offerte',
    submit: 'Pubblica un’offerta',
    empty: 'Nessuna offerta al momento.',
    emptyHint: 'Accedi con Google e condividi la prima tariffa.',
    loadError: 'Le offerte non sono disponibili al momento.',
    retry: 'Riprova',
    listingSub:
      'Sfoglia le tariffe per aeroporto di partenza. Le nuove pubblicazioni compaiono subito.',
    disclaimer:
      'Le tariffe sono inviate dagli utenti e non verificate. Confermale sul sito della compagnia o di prenotazione.',
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
    booking: 'Link di prenotazione',
    notes: 'Note (facoltativo)',
    currency: 'Valuta',
    viewDeal: 'Vedi offerta',
    submitTitle: 'Pubblica un’offerta',
    submitSub: 'Condividi una tariffa trovata. Va online subito nella pagina delle offerte.',
    submitNote:
      'Pubblica solo tariffe reali e prenotabili con un link verificabile. Le offerte false vengono rimosse.',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: 'Bagaglio, scali, condizioni… (facoltativo)',
    airportError: 'Inserisci un codice aeroportuale di tre lettere valido.',
    destinationError: 'Inserisci una destinazione (2–60 caratteri).',
    airlineError: 'Inserisci una compagnia (2–60 caratteri).',
    priceError: 'Inserisci un prezzo valido maggiore di 0.',
    currencyError: 'Inserisci un codice valuta di tre lettere, es. EUR.',
    dateError:
      'Date non valide: il ritorno non può precedere la partenza né essere passato.',
    urlError: 'Inserisci un link di prenotazione che inizi con http:// o https://.',
    notesError: 'Le note possono contenere al massimo 600 caratteri.',
    genericError: 'Pubblicazione non riuscita. Riprova più tardi.',
    submittedBy: 'Pubblicata da {name}',
    submittedAt: 'Inviato il {date}',
    close: 'Chiudi',
    unverified: 'Inviata dagli utenti · non verificata',
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
    sub: '여행자가 올린 특가 항공권을 최신순으로 보여 줍니다. 가격과 좌석은 항공사나 예약 페이지에서 확인하세요.',
    latest: '최신 특가',
    all: '전체 특가',
    submit: '특가 올리기',
    empty: '아직 등록된 특가가 없습니다.',
    emptyHint: 'Google로 로그인하고 첫 특가를 공유해 보세요.',
    loadError: '특가 정보를 불러올 수 없습니다.',
    retry: '다시 시도',
    listingSub: '출발 공항별로 여행자가 올린 특가를 둘러보세요. 새로 올린 특가는 즉시 표시됩니다.',
    disclaimer:
      '가격은 사용자가 올린 정보로 검증되지 않았습니다. 항공사나 예약 페이지에서 확인하세요.',
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
    booking: '예약 링크',
    notes: '추가 정보(선택)',
    currency: '통화',
    viewDeal: '예약 보기',
    submitTitle: '특가 항공권 올리기',
    submitSub: '찾은 특가를 공유하세요. 등록 즉시 특가 페이지에 표시됩니다.',
    submitNote:
      '실제로 예약 가능한 가격만, 확인 가능한 항공사나 예약 링크와 함께 올려 주세요. 허위 정보는 삭제됩니다.',
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
    bookingPlaceholder: 'https://…',
    notesPlaceholder: '수하물, 경유, 조건 등(선택)',
    airportError: '유효한 세 글자 공항 코드를 입력하세요.',
    destinationError: '목적지를 입력하세요(2–60자).',
    airlineError: '항공사를 입력하세요(2–60자).',
    priceError: '0보다 큰 유효한 가격을 입력하세요.',
    currencyError: '세 글자 통화 코드를 입력하세요. 예: KRW.',
    dateError: '날짜가 올바르지 않습니다. 귀국일은 출발일보다 빠르거나 과거일 수 없습니다.',
    urlError: 'http:// 또는 https://로 시작하는 예약 링크를 입력하세요.',
    notesError: '추가 정보는 최대 600자입니다.',
    genericError: '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    submittedBy: '{name} 님이 등록',
    submittedAt: '{date}에 제출됨',
    close: '닫기',
    unverified: '사용자 등록 · 미검증',
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
