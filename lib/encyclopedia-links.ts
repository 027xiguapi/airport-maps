/**
 * Encyclopedia reference links — Wikipedia (in the page's language) and Baidu
 * Baike (Chinese only). The URL builders and the entry-title tables live
 * together because the airport page and the country page both link out to them.
 *
 * Both tables exist for the same reason: the database carries the standard
 * Chinese and English names, which are also the entry titles for nearly every
 * airport and country here, so an entry is needed only where an encyclopedia
 * files the subject under a different title. A wrong title is worse than a
 * missing link — it sends readers to a dead end.
 */

/** Wikipedia article URL — MediaWiki titles use underscores for spaces. */
export const wikiUrl = (lang: 'en' | 'zh', title: string) =>
  `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** Baidu Baike entry URL — major airports and countries have an entry under their Chinese name. */
export const baikeUrl = (title: string) => `https://baike.baidu.com/item/${encodeURIComponent(title)}`;

/**
 * Canonical Chinese encyclopedia titles for airports whose database name is
 * not the zh-Wikipedia / Baidu Baike entry title (e.g. ICN is stored as
 * "首尔仁川国际机场" while both encyclopedias carry the entry as "仁川国际机
 * 场"). One title serves both encyclopedias; absent entries derive the title
 * from the airport's localized name.
 */
const AIRPORT_ENCYCLOPEDIA_TITLES: Record<string, string> = {
  BKK: '素万那普机场',
  CDG: '巴黎夏尔·戴高乐机场',
  GRU: '圣保罗/瓜鲁柳斯国际机场',
  HND: '羽田机场',
  ICN: '仁川国际机场',
  JFK: '约翰·肯尼迪国际机场',
  KIX: '关西国际机场',
  NRT: '成田国际机场',
  ORD: '奥黑尔国际机场',
  SVO: '谢列梅捷沃国际机场',
  SYD: '悉尼机场',
};

/**
 * Countries whose zh-Wikipedia / Baidu Baike entry title differs from the name
 * stored in the database. Everything else in `countries` is already the
 * encyclopedia title.
 */
const COUNTRY_ENCYCLOPEDIA_TITLES: Record<string, string> = {
  // Both encyclopedias file the entry under the full name, not the short form.
  AE: '阿拉伯联合酋长国',
};

/** zh-Wikipedia / Baidu Baike entry title for the airport. */
export function airportEncyclopediaTitle(iata: string, nameZh: string): string {
  return AIRPORT_ENCYCLOPEDIA_TITLES[iata.toUpperCase()] ?? nameZh;
}

/** zh-Wikipedia / Baidu Baike entry title for the country. */
export function countryEncyclopediaTitle(code: string, nameZh: string): string {
  return COUNTRY_ENCYCLOPEDIA_TITLES[code.toUpperCase()] ?? nameZh;
}
