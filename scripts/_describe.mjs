/**
 * Directory-batch airport descriptions — the first body paragraph for the
 * ~300 airports that carry no editorial copy. Shared by the seed (fresh
 * installs, scripts/seed.mjs) and the updater that rewrites an existing
 * database (scripts/update-airport-descriptions.mjs), so both paths produce
 * byte-identical text.
 *
 * Content contract: every clause traces back to repo data — airport class and
 * ICAO code from scripts/directory-data.json, elevation and scheduled service
 * from lib/airport-facts.json (compiled from the OurAirports export). The
 * closing sentence only promises what the page actually renders (the location
 * map needs coordinates).
 *
 * The copy replaced a placeholder that ended "详细航站楼、登机口及交通信息将陆续
 * 补充。" — an answer-first paragraph with real facts instead of a promise of
 * future content (2026-10-14, GSC "discovered – not indexed" pass).
 */
const KIND_ZH = { large: '大型机场', medium: '中型机场', small: '小型机场', heliport: '直升机场' };
const KIND_EN = {
  large: 'large airport',
  medium: 'medium-sized airport',
  small: 'small airport',
  heliport: 'heliport',
};
/** The old wording, kept verbatim for the updater's hand-edit guard. */
const KIND_ZH_LEGACY = { large: '大型', medium: '中型', small: '小型', heliport: '直升机' };

const ftToM = (ft) => Math.round(ft * 0.3048);

/** The templates previously seeded into airport_translations, zh + en. */
export function legacyDirectoryDescriptions(a, country) {
  return [
    `${a.name}(IATA:${a.iata})位于${country.name}${a.city}，是一座${KIND_ZH_LEGACY[a.kind] ?? ''}机场。详细航站楼、登机口及交通信息将陆续补充。`,
    `${a.nameEn} (${a.iata}) is a ${KIND_EN[a.kind] ?? 'airport'} serving ${a.cityEn}, ${country.nameEn}. Terminal, gate and ground-transport details will be added as they are compiled.`,
  ];
}

/**
 * Answer-first description for one directory airport. `a` is its
 * scripts/directory-data.json record, `facts` its lib/airport-facts.json entry
 * (either may be missing pieces; the clauses drop out).
 */
export function directoryDescriptions(a, country, facts) {
  const elevM = typeof facts?.elevFt === 'number' ? ftToM(facts.elevFt) : null;
  const sched = facts?.scheduled === true;
  const hasMap = typeof facts?.lat === 'number' && typeof facts?.lng === 'number';

  const kindZh = KIND_ZH[a.kind] ?? null;
  const zhHead = kindZh ? `${a.name}是一座${kindZh}` : a.name;
  const zhClauses = [
    elevM != null ? `海拔约 ${elevM} 米` : null,
    sched ? '有定期客运航班' : null,
  ].filter(Boolean);
  const zh = [
    `${zhHead}${zhClauses.length ? `，${zhClauses.join('，')}` : ''}。`,
    hasMap ? '本页整理该机场的位置地图、代码与交通信息。' : '本页整理该机场的代码与交通信息。',
  ].join('');

  const kindEn = KIND_EN[a.kind] ?? null;
  const enHead = kindEn ? `${a.nameEn} is a ${kindEn}` : a.nameEn;
  const enClauses = [
    typeof facts?.elevFt === 'number'
      ? `at an elevation of about ${facts.elevFt.toLocaleString('en-US')} ft`
      : null,
    sched ? 'with scheduled passenger service' : null,
  ].filter(Boolean);
  const en = [
    `${enHead}${enClauses.length ? `, ${enClauses.join(', ')}` : ''}.`,
    hasMap
      ? 'This page gathers its location map, airport codes and travel information.'
      : 'This page gathers its airport codes and travel information.',
  ].join(' ');

  return [zh, en];
}
