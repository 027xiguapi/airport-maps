/**
 * Writes starter guides for airports that have a database row but no guide yet
 * — today the 303 directory-batch fields. Guides live in the `content_documents`
 * table (db/schema.ts), one row per (kind='airport', subject=IATA, locale), so
 * this script writes rows rather than files; `node scripts/content-export.mjs`
 * turns them back into a `.md` tree if one is ever needed.
 *
 * The existing curated guides are hand-written editorial; this script never
 * touches them (it skips any airport whose zh OR en row already exists), and it
 * deliberately does not invent facts: everything it writes comes from the repo's
 * own data — codes, names, airport class, coordinates, the OpenFlights route
 * dump (data/airport-routes.json, 2014-06) and the nearest-airport calculation
 * over those coordinates. Sections that would need real editorial knowledge
 * (terminal structures, ground transport, facilities) are explicitly marked as
 * not yet compiled rather than padded with guesses.
 *
 * Usage:
 *   node scripts/generate-airport-guides.mjs            write what is missing
 *   node scripts/generate-airport-guides.mjs --dry-run  report only
 *   node scripts/generate-airport-guides.mjs --refresh  re-render the guides this
 *                                                       script previously wrote
 *                                                       (hand-written guides are
 *                                                       still never touched)
 *   node scripts/generate-airport-guides.mjs --codes AAL,AAR   restrict
 *
 * Afterwards run `node scripts/build-hant.mjs` so the derived tw rows follow.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const DRY = process.argv.includes('--dry-run');
const REFRESH = process.argv.includes('--refresh');
const codesArg = process.argv.find((a) => a.startsWith('--codes'));
const ONLY = codesArg
  ? (codesArg.includes('=') ? codesArg.split('=')[1] : process.argv[process.argv.indexOf(codesArg) + 1])
    ?.split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean) ?? null
  : null;

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/** Code -> escaped stem for filenames Windows cannot use (`AUX`). */
const PHOTO_STEMS = (() => {
  try {
    const file = read('scripts/photo-file-aliases.json');
    return Object.fromEntries(
      Object.entries(file).filter(
        ([code, stem]) => /^[A-Z]{3}$/.test(code) && typeof stem === 'string'
      )
    );
  } catch {
    return {};
  }
})();
const photoStem = (code) => PHOTO_STEMS[code] ?? code;
const legacy = read('scripts/legacy-data.json');
const directory = read('scripts/directory-data.json');
const worldAirports = read('public/data/world-airports.json').airports;
const handCoords = read('scripts/airport-coords.json');
const routes = read('data/airport-routes.json');
/** Optional: covers whose file name differs from <IATA>.png (DOS device names). */
const aliases = (() => {
  try {
    return read('scripts/map-file-aliases.json');
  } catch {
    return {};
  }
})();

/**
 * Authored 「机场历史」 lines (scripts/airport-history.json), keyed by IATA —
 * written from the raw extracts in scripts/airport-history.raw.json
 * (airports-worldwide.com, a Wikipedia CC BY-SA mirror; see
 * scripts/fetch-airport-history.mjs). Airports without an entry simply have no
 * history section rather than a padded one.
 */
const history = (() => {
  try {
    return read('scripts/airport-history.json');
  } catch {
    return {};
  }
})();

/** Compiled hard facts (elevation, scheduled service) for the navigation block. */
const hardFacts = (() => {
  try {
    return read('lib/airport-facts.json').airports ?? {};
  } catch {
    return {};
  }
})();

/** The guide's revision date, stamped on every generated document. */
const UPDATED = '2026-10-27';

/** Published gallery photos for a code (public/photos/captions/<IATA>.json). */
function photosFor(code, locale) {
  try {
    const doc = JSON.parse(
      readFileSync(join(ROOT, 'public', 'photos', 'captions', `${photoStem(code)}.json`), 'utf8')
    );
    return Object.entries(doc)
      .filter(([file, value]) => !file.startsWith('_') && value && typeof value === 'object' && value[locale])
      .map(([file, value]) => ({ file, caption: value[locale] }));
  } catch {
    return [];
  }
}

/**
 * 「机场实景」 — the page's published photos, image then caption, in manifest
 * order. Only captioned photos exist here (the caption is the gallery's
 * publication gate), so the guide never shows an un-reviewed picture.
 */
function photoBlock(lines, code, locale) {
  const photos = photosFor(code, locale);
  if (!photos.length) return;
  lines.push(locale === 'zh' ? '## 机场实景' : '## Airport photos', '');
  for (const photo of photos) {
    lines.push(`![${photo.caption}](/photos/${code}/${photo.file})`, '');
    lines.push(photo.caption, '');
  }
  lines.push(
    locale === 'zh'
      ? '照片来自公开网络来源，版权归原作者所有；每张图的完整署名与原始出处见本页「机场实景照片」图集。'
      : 'The photos come from public web sources and remain the copyright of their photographers; full credits and source links sit in the photo gallery on this page.',
    ''
  );
}

/** 「机场历史」 — only where an authored, sourced paragraph exists. */
function historyBlock(lines, code, locale) {
  const entry = history[code];
  const text = entry?.[locale];
  if (!text) return;
  lines.push(locale === 'zh' ? '## 机场历史与概况' : '## History & profile', '');
  lines.push(text, '');
  if (entry.source) {
    lines.push(
      locale === 'zh'
        ? `资料参考：[${entry.sourceTitle ?? '机场条目'}](${entry.source})（内容源自维基百科，按自由许可使用，由本站整理改写）。`
        : `Source: [${entry.sourceTitle ?? 'airport entry'}](${entry.source}) — content from Wikipedia under its free licence, condensed and rewritten by this site.`,
      ''
    );
  }
}

/**
 * 「机场导航」 — what the page knows for actually getting to the field:
 * coordinates, elevation, service status, city distance when the curated data
 * has it, and one-tap links into the three mapping services. Details it cannot
 * know (driving routes, timetables, parking) stay with the airport's own
 * information, as the closing note says.
 */
function navBlock(lines, { a, point }, locale) {
  const facts = hardFacts[a.iata] ?? {};
  const name = locale === 'zh' ? a.name : a.nameEn ?? a.name;
  lines.push(locale === 'zh' ? '## 机场导航' : '## Getting there', '');
  const bits = [];
  if (point) {
    bits.push(
      locale === 'zh'
        ? `坐标为 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`
        : `coordinates ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`
    );
  }
  if (facts.elevFt != null) {
    const metres = Math.round(facts.elevFt * 0.3048);
    bits.push(locale === 'zh' ? `海拔约 ${metres} 米` : `elevation about ${metres} m`);
  }
  if (a.distance) {
    bits.push(locale === 'zh' ? `距市中心约 ${a.distance}` : `about ${a.distance} from the city centre`);
  }
  if (facts.scheduled === false) {
    bits.push(
      locale === 'zh'
        ? '目前没有定期客运航班，主要用于通用航空与包机'
        : 'no scheduled passenger service today — mostly general aviation and charters'
    );
  }
  if (bits.length) {
    lines.push(locale === 'zh' ? `机场${bits.join('，')}。` : `The airport: ${bits.join('; ')}.`, '');
  }
  if (point) {
    const lat = point.lat.toFixed(4);
    const lng = point.lng.toFixed(4);
    const encoded = encodeURIComponent(name);
    lines.push(locale === 'zh' ? '直接导航到机场：' : 'Navigate straight to the field:', '');
    const links = [
      `[高德地图](https://uri.amap.com/marker?position=${lng},${lat}&name=${encoded}&coordinate=wgs84)`,
      `[百度地图](https://api.map.baidu.com/marker?location=${lat},${lng}&title=${encoded}&content=${encoded}&output=html&coord_type=wgs84&zoom=15)`,
      `[Google Maps](https://www.google.com/maps/search/?api=1&query=${lat},${lng})`,
    ];
    lines.push(
      locale === 'zh' ? `- 驾车/打车：${links.join('｜')}` : `- Driving / taxi: ${links.join(' | ')}`,
      ''
    );
    lines.push(
      locale === 'zh'
        ? '本页「位置地图」可以查看机场与城市、路网的相对位置；「地面交通」列出已收录的公共交通方式。驾车路线、班次与停车信息请以机场官网公布为准。'
        : 'The location map on this page shows the field against the city and road network, and the ground-transport section lists the public transport recorded for it. For driving routes, timetables and parking, rely on the airport\'s own information.',
      ''
    );
  }
}

const countries = { ...legacy.countries, ...directory.countries };
const editorialIatas = new Set(legacy.airports.map((a) => a.iata));
/** Every DB airport with its base fields (curated entries keep their richer shape). */
const airports = new Map();
for (const a of legacy.airports) airports.set(a.iata, a);
for (const a of directory.airports) if (!airports.has(a.iata)) airports.set(a.iata, a);

/** Coordinates: same chain the map generator uses (json -> csv -> hand-checked).
    The CSV is parsed once and memoised — nearest-airport math calls this ~130k
    times, and re-reading 12 MB per call stalled the first run entirely. */
let csvIndex = null;
function coords(iata) {
  const hit = worldAirports.find((r) => String(r[0]).toUpperCase() === iata);
  if (hit) return { lat: hit[6], lng: hit[7] };
  if (!csvIndex) {
    csvIndex = new Map();
    const csv = readFileSync(join(ROOT, 'data', 'world-airports.csv'), 'utf8').split(/\r?\n/);
    const head = csv[0].split(',');
    const iIata = head.indexOf('iata_code');
    const iLat = head.indexOf('latitude_deg');
    const iLng = head.indexOf('longitude_deg');
    for (const line of csv) {
      const cols = line.split(',');
      const code = (cols[iIata] || '').replace(/"/g, '').toUpperCase();
      const lat = Number(cols[iLat]);
      const lng = Number(cols[iLng]);
      if (code && Number.isFinite(lat) && Number.isFinite(lng) && !csvIndex.has(code)) {
        csvIndex.set(code, { lat, lng });
      }
    }
  }
  return csvIndex.get(iata) ?? handCoords[iata] ?? null;
}

const KIND = {
  large: { zh: '大型机场', en: 'large airport' },
  medium: { zh: '中型机场', en: 'medium-sized airport' },
  small: { zh: '小型机场', en: 'small airport' },
  heliport: { zh: '直升机场', en: 'heliport' },
};
const REGION_EN = {
  东亚: 'East Asia', 东南亚: 'Southeast Asia', 南亚: 'South Asia', 中亚: 'Central Asia',
  中东: 'the Middle East', '中东 / 欧洲': 'the Middle East and Europe', 欧洲: 'Europe',
  '欧洲 / 亚洲': 'Europe and Asia', 北美洲: 'North America', 南美洲: 'South America',
  大洋洲: 'Oceania', 非洲: 'Africa',
};
const EARTH_R = 6371.0088;
const haversine = (a, b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
};

/** zh/en display name for any IATA (DB name when we have it, else the world dump). */
function displayName(iata, locale) {
  const own = airports.get(iata);
  if (own) return locale === 'zh' ? own.name : own.nameEn;
  const world = worldAirports.find((r) => String(r[0]).toUpperCase() === iata);
  return world ? world[1] : iata;
}

function guideData(iata) {
  const a = airports.get(iata);
  const country = countries[a.country] ?? { name: a.country, nameEn: a.country, region: '' };
  const point = coords(iata);
  const route = routes.airports[iata] ?? null;
  const destinations = route
    ? [...route.destinations].sort((x, y) => x.km - y.km)
    : null;
  const hasCover = existsSync(join(ROOT, 'public', 'maps', aliases[iata] ?? `${iata}.png`));
  let nearest = null;
  if (point) {
    nearest = [...airports.keys()]
      .filter((code) => code !== iata)
      .map((code) => ({ code, km: haversine(point, coords(code) ?? { lat: 1e9, lng: 1e9 }) }))
      .filter((n) => n.km < 1e8)
      .sort((x, y) => x.km - y.km)
      .slice(0, 3);
  }
  return { a, country, point, route, destinations, hasCover, nearest, kind: KIND[a.kind] ?? KIND.small };
}

const fmtKm = (km) => (km >= 100 ? Math.round(km) : Math.round(km * 10) / 10);
const airlineNames = (codes) =>
  codes.slice(0, 2).map((c) => routes.airlines[c] ?? c).join('、');

/** Returns the stored document shape: { title, summary, updated, body }. */
function zhGuide({ a, country, point, destinations, hasCover, nearest, kind }) {
  const title = `${a.name}指南`;
  const summary = `${a.name}（${a.iata}）位于${country.name}${a.city}，是一座${kind.zh}。本页汇总它的机场地图、直飞航线与附近机场，并说明哪些信息还需以航司与机场公布为准。`;
  const lines = [];
  lines.push(
    `${a.name}（IATA 代码 **${a.iata}**${a.icao ? `，ICAO 代码 ${a.icao}` : ''}）服务于${country.name}${a.city}，按规模分类是一座${kind.zh}。本页把分散在数据库、地图与航线数据集中的信息整理成一页，方便你在订票前后快速核对。`
  );
  lines.push('');
  photoBlock(lines, a.iata, 'zh');
  lines.push('## 基本信息');
  lines.push('');
  lines.push('| 项目 | 信息 |');
  lines.push('| --- | --- |');
  lines.push(`| IATA / ICAO | ${a.iata} / ${a.icao ?? '—'} |`);
  lines.push(`| 机场规模 | ${kind.zh} |`);
  lines.push(`| 所在地 | ${country.name} · ${a.city}${country.region ? `（${country.region}）` : ''} |`);
  if (point) lines.push(`| 坐标 | ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} |`);
  if (destinations) lines.push(`| 直飞目的地 | ${destinations.length} 个（见下表） |`);
  lines.push('');
  historyBlock(lines, a.iata, 'zh');
  lines.push('## 机场地图');
  lines.push('');
  if (hasCover) {
    lines.push(
      '本页的机场地图由 OpenStreetMap 数据渲染：有航站楼多边形的机场会画出航站楼、停机坪与进场道路，小型机场则呈现机场轮廓与跑道；地图同时标注停车、巴士、餐饮、酒店、租车等符号（以 OSM 实际收录为准）。'
    );
  } else {
    lines.push('本页暂无封面地图，提供的是交互式位置地图与规模示意图。');
  }
  lines.push('');
  if (hasCover) {
    lines.push('- **查看大图** —— 机场页的地图卡片可放大查看，2000px 原图支持下载保存。');
  }
  lines.push('- **位置地图** —— 页面内的交互式地图可平移缩放，确认机场与城市、周边路网的相对位置。');
  lines.push('- **规模示意图** —— 页面另按登机口规模绘制一张示意图，用来说明机场体量，不是实际布局。');
  lines.push('');
  if (destinations) {
    lines.push('## 直飞航线');
    lines.push('');
    lines.push('按飞行距离由近到远列出的直飞目的地（数据来自 OpenFlights 航线数据集，2014 年收录，供参考；实际航线以航司与机场公布为准）：');
    lines.push('');
    lines.push('| 目的地 | 距离 | 主要航司 |');
    lines.push('| --- | --- | --- |');
    for (const d of destinations.slice(0, 8)) {
      lines.push(`| ${displayName(d.iata, 'zh')}（${d.iata}） | 约 ${fmtKm(d.km)} km | ${airlineNames(d.carriers)} |`);
    }
    lines.push('');
    lines.push(`完整列表见[${a.name}航线图](/route/${a.iata})页面，含全部 ${destinations.length} 个直飞目的地。`);
    lines.push('');
  } else {
    lines.push('## 直飞航线');
    lines.push('');
    lines.push('航线数据集暂未收录该机场的直飞航线。支线机场的航线调整较频繁，出行前请直接向航司或机场确认。');
    lines.push('');
  }
  if (nearest?.length && point) {
    lines.push('## 附近机场');
    lines.push('');
    lines.push('若无合适航班或票价过高，可以比较附近这些机场：');
    lines.push('');
    lines.push('| 机场 | 直线距离 |');
    lines.push('| --- | --- |');
    for (const n of nearest) {
      lines.push(`| ${displayName(n.code, 'zh')}（${n.code}） | ${fmtKm(n.km)} km |`);
    }
    lines.push('');
  }
  navBlock(lines, { a, point }, 'zh');
  lines.push('## 规模与设施说明');
  lines.push('');
  const scale = {
    large: '大型机场通常拥有多条跑道与多座航站楼、全年吞吐数百至上千万旅客，值机、安检与行李提取的排队时间受时段影响明显，国际航班建议按「起飞前 2–3 小时到达」安排。',
    medium: '中型机场多为区域枢纽：航站楼集中、步行距离可控，值机与安检通常快于大型枢纽，但航班频次较低，误机后改签的余地也更小，建议按「起飞前 90–120 分钟到达」安排。',
    small: '小型机场设施精简，航站楼通常只有一层，值机柜台在航班起飞前才开放；地面交通班次有限，自驾或预约接送往往是更稳妥的选择。',
    heliport: '直升机场仅处理直升机航班，没有常规航站楼流程；座位少、航程短，按运营方指定时间提前到达即可。',
  };
  lines.push(scale[a.kind] ?? scale.small);
  lines.push('');
  lines.push(
    `机场的航站楼平面图、值机区域位置与地面交通时刻由机场官方发布，现场细节请以机场官网为准；若本页信息有误，欢迎通过「联系我们」告知，我们核实后会更正。`
  );
  lines.push('');
  lines.push('## 出行提示');
  lines.push('');
  if (destinations?.length) {
    lines.push(
      `- 若你的目的地不在上表中，通常需要经${displayName(destinations[0].iata, 'zh')}（${destinations[0].iata}）等较大机场中转。`
    );
  }
  lines.push('- 用页面顶部的搜索框可以直接比较其他机场：输入城市名或 IATA 代码即可查看附近的替代选择。');
  lines.push('- 旺季（节假日、大型活动期间）小机场的停车位与租车辆也紧张，如需自驾建议提前预订。');
  return { title, summary, updated: UPDATED, body: lines.join('\n').trim() };
}

/** Returns the stored document shape: { title, summary, updated, body }. */
function enGuide({ a, country, point, destinations, hasCover, nearest, kind }) {
  const region = country.region ? REGION_EN[country.region] ?? '' : '';
  const cityEn = a.cityEn ?? a.city;
  const title = `${a.nameEn} Guide`;
  const summary = `${a.nameEn} (${a.iata}) serves ${cityEn}, ${country.nameEn} as a ${kind.en}. Maps, direct routes, nearby airports and what still needs to be confirmed with the airline.`;
  const lines = [];
  lines.push(
    `${a.nameEn} (IATA **${a.iata}**${a.icao ? `, ICAO ${a.icao}` : ''}) serves ${cityEn}, ${country.nameEn}${region ? `, ${region}` : ''}, and is classified as a ${kind.en}. This page gathers what the site's database, maps and route dataset say about it in one place.`
  );
  lines.push('');
  photoBlock(lines, a.iata, 'en');
  lines.push('## Facts at a glance');
  lines.push('');
  lines.push('| | |');
  lines.push('| --- | --- |');
  lines.push(`| IATA / ICAO | ${a.iata} / ${a.icao ?? '—'} |`);
  lines.push(`| Airport class | ${kind.en} |`);
  lines.push(`| Location | ${cityEn}, ${country.nameEn}${region ? ` (${region})` : ''} |`);
  if (point) lines.push(`| Coordinates | ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} |`);
  if (destinations) lines.push(`| Direct destinations | ${destinations.length} (see below) |`);
  lines.push('');
  historyBlock(lines, a.iata, 'en');
  lines.push('## Airport map');
  lines.push('');
  if (hasCover) {
    lines.push(
      'The map on this page is rendered from OpenStreetMap data: airports with terminal polygons show the terminal buildings, aprons and access roads, while small fields show the airfield outline and runway. Icons for parking, buses, food, hotels and car rentals follow whatever OSM has mapped.'
    );
  } else {
    lines.push('No cover map is available for this airport yet; the page offers the interactive location map and a schematic instead.');
  }
  lines.push('');
  if (hasCover) {
    lines.push('- **Full-size view** — open the map card on this page to zoom in; the 2000 px original can be downloaded.');
  }
  lines.push('- **Location map** — the interactive map lets you pan and zoom to see the field against the city and road network.');
  lines.push('- **Schematic** — the page also draws a size-based schematic to indicate the airport\'s scale; it is not the actual layout.');
  lines.push('');
  if (destinations) {
    lines.push('## Direct routes');
    lines.push('');
    lines.push('Non-stop destinations, nearest first (OpenFlights route dataset, compiled 2014 — treat as indicative and confirm with the airline):');
    lines.push('');
    lines.push('| Destination | Distance | Main carriers |');
    lines.push('| --- | --- | --- |');
    for (const d of destinations.slice(0, 8)) {
      lines.push(`| ${displayName(d.iata, 'en')} (${d.iata}) | ~${fmtKm(d.km)} km | ${d.carriers.slice(0, 2).map((c) => routes.airlines[c] ?? c).join(', ')} |`);
    }
    lines.push('');
    lines.push(`See the [${a.nameEn} route map](/route/${a.iata}) for the full list of ${destinations.length} non-stop destinations.`);
    lines.push('');
  } else {
    lines.push('## Direct routes');
    lines.push('');
    lines.push('The route dataset carries no non-stop services for this airport. Regional schedules change often — confirm with the airline or airport before booking.');
    lines.push('');
  }
  if (nearest?.length && point) {
    lines.push('## Nearby airports');
    lines.push('');
    lines.push('If nothing fits, these nearby fields are worth comparing:');
    lines.push('');
    lines.push('| Airport | Distance |');
    lines.push('| --- | --- |');
    for (const n of nearest) {
      lines.push(`| ${displayName(n.code, 'en')} (${n.code}) | ${fmtKm(n.km)} km |`);
    }
    lines.push('');
  }
  navBlock(lines, { a, point }, 'en');
  lines.push('## Size and facilities');
  lines.push('');
  const scale = {
    large: 'Large airports run multiple runways and terminals and handle millions of passengers a year. Queue times at check-in and security vary strongly by time of day; for international flights plan to arrive 2–3 hours before departure.',
    medium: 'Medium-sized airports are regional hubs: one compact terminal, walkable distances and usually faster check-in than a major hub — but with fewer frequencies, so rebooking after a missed flight is harder. Aim for 90–120 minutes before departure.',
    small: 'Small fields have minimal facilities, usually a single-level terminal whose check-in desks open shortly before a flight. Ground transport is sparse; driving or a pre-booked transfer is the safer choice.',
    heliport: 'Heliports handle helicopter services only — no conventional terminal flow. Seats and legs are short; arrive at the time the operator specifies.',
  };
  lines.push(scale[a.kind] ?? scale.small);
  lines.push('');
  lines.push(
    `Terminal plans, check-in locations and ground-transport timetables are published by the airport itself; for detail that must be right on the day, rely on the airport's own information. If something here looks wrong, please tell us via the Contact page and we will check it.`
  );
  lines.push('');
  lines.push('## Tips');
  lines.push('');
  if (destinations?.length) {
    lines.push(`- If your destination is not in the table above, you will usually connect via ${displayName(destinations[0].iata, 'en')} (${destinations[0].iata}) or another larger airport.`);
  }
  lines.push('- Use the search box at the top of the page to compare alternatives: type a city name or IATA code.');
  lines.push('- In peak season parking and rental cars run short at small fields too — book ahead if you are driving.');
  return { title, summary, updated: UPDATED, body: lines.join('\n').trim() };
}

// ----------------------------------------------------------------------- run
/**
 * A guide this generator produced: its intro sentence is the stable marker.
 * Anything without it — the hand-written guides — is never overwritten, even
 * under --refresh, so re-rendering the template cannot destroy editorial work.
 */
const GENERATED_MARKER = '本页把分散在数据库';

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const { rows: existing } = await client.query(
  `SELECT subject, locale, body FROM content_documents WHERE kind = 'airport' AND locale = ANY($1)`,
  [['zh', 'en']]
);
const stored = new Map(existing.map((row) => [`${row.subject}|${row.locale}`, row.body]));
const present = (code) => stored.has(`${code}|zh`) || stored.has(`${code}|en`);
const generated = (code) =>
  [stored.get(`${code}|zh`), stored.get(`${code}|en`)].some(
    (body) => body !== undefined && body.includes(GENERATED_MARKER)
  );

const all = [...airports.keys()].sort();
const targets = all.filter((code) => {
  if (editorialIatas.has(code)) return false; // curated guides are hand-written
  if (present(code) && !(REFRESH && generated(code))) return false;
  return !ONLY || ONLY.includes(code);
});

console.log(`${targets.length} airport(s) need guides${DRY ? ' (dry run)' : ''}`);
if (DRY) {
  console.log(targets.join(' '));
  await client.end();
  process.exit(0);
}

const upsert = `
  INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
  VALUES ('airport', $1, $2, $3, $4, $5, $6)
  ON CONFLICT (kind, subject, locale) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    updated = EXCLUDED.updated,
    body = EXCLUDED.body,
    updated_at = now()`;

let written = 0;
try {
  await client.query('BEGIN');
  for (const code of targets) {
    const data = guideData(code);
    const zh = zhGuide(data);
    const en = enGuide(data);
    await client.query(upsert, [code, 'zh', zh.title, zh.summary, zh.updated, zh.body]);
    await client.query(upsert, [code, 'en', en.title, en.summary, en.updated, en.body]);
    written++;
  }
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await client.end();
}
console.log(`wrote ${written} guide pair(s) — now run: node scripts/build-hant.mjs`);
