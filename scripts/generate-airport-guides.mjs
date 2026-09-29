/**
 * Writes starter guides (content/{zh,en}/airports/<IATA>.md) for airports that
 * have a database row but no guide yet — today the 303 directory-batch fields.
 *
 * The existing 60 curated guides are hand-written editorial; this script never
 * touches them (it skips any airport whose zh OR en file already exists), and it
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
 *   node scripts/generate-airport-guides.mjs --codes AAL,AAR   restrict
 *
 * Afterwards run `node scripts/build-hant.mjs` so content/tw follows.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

const DRY = process.argv.includes('--dry-run');
const codesArg = process.argv.find((a) => a.startsWith('--codes'));
const ONLY = codesArg
  ? (codesArg.includes('=') ? codesArg.split('=')[1] : process.argv[process.argv.indexOf(codesArg) + 1])
    ?.split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean) ?? null
  : null;

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
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

function zhGuide({ a, country, point, destinations, hasCover, nearest, kind }) {
  const lines = [];
  lines.push('---');
  lines.push(`title: ${a.name}指南`);
  lines.push(
    `summary: ${a.name}（${a.iata}）位于${country.name}${a.city}，是一座${kind.zh}。本页汇总它的机场地图、直飞航线与附近机场，并说明哪些信息还需以航司与机场公布为准。`
  );
  lines.push('updated: 2026-09-29');
  lines.push('---');
  lines.push('');
  lines.push(
    `${a.name}（IATA 代码 **${a.iata}**${a.icao ? `，ICAO 代码 ${a.icao}` : ''}）服务于${country.name}${a.city}，按规模分类是一座${kind.zh}。本页把分散在数据库、地图与航线数据集中的信息整理成一页，方便你在订票前后快速核对。`
  );
  lines.push('');
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
  lines.push('- **规模示意图** —— 该机场的航站楼结构数据尚未收录，页面会按登机口规模绘制一张示意图，仅表示体量，不是实际布局。');
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
    `需要说明的是：本站对该机场的航站楼布局、登机口分布、地面交通与设施清单**尚未完成编辑整理**，相关区块会随数据补充而更新。出行前的确定性信息（值机柜台位置、地面交通时刻）请以机场官网或航空公司为准。`
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
  lines.push('');
  return lines.join('\n');
}

function enGuide({ a, country, point, destinations, hasCover, nearest, kind }) {
  const region = country.region ? REGION_EN[country.region] ?? '' : '';
  const cityEn = a.cityEn ?? a.city;
  const lines = [];
  lines.push('---');
  lines.push(`title: ${a.nameEn} Guide`);
  lines.push(
    `summary: ${a.nameEn} (${a.iata}) serves ${cityEn}, ${country.nameEn} as a ${kind.en}. Maps, direct routes, nearby airports and what still needs to be confirmed with the airline.`
  );
  lines.push('updated: 2026-09-29');
  lines.push('---');
  lines.push('');
  lines.push(
    `${a.nameEn} (IATA **${a.iata}**${a.icao ? `, ICAO ${a.icao}` : ''}) serves ${cityEn}, ${country.nameEn}${region ? `, ${region}` : ''}, and is classified as a ${kind.en}. This page gathers what the site's database, maps and route dataset say about it in one place.`
  );
  lines.push('');
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
  lines.push('- **Schematic** — terminal-structure data for this airport is not compiled yet, so the page draws a size-based schematic. It conveys scale, not the actual layout.');
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
    `To be transparent: this site has **not yet compiled** the terminal layout, gate ranges, ground transport or facility list for this airport; those sections will appear as the data is added. For anything that must be right on the day — check-in desk location, ground-transport times — rely on the airport or airline.`
  );
  lines.push('');
  lines.push('## Tips');
  lines.push('');
  if (destinations?.length) {
    lines.push(`- If your destination is not in the table above, you will usually connect via ${displayName(destinations[0].iata, 'en')} (${destinations[0].iata}) or another larger airport.`);
  }
  lines.push('- Use the search box at the top of the page to compare alternatives: type a city name or IATA code.');
  lines.push('- In peak season parking and rental cars run short at small fields too — book ahead if you are driving.');
  lines.push('');
  return lines.join('\n');
}

// ----------------------------------------------------------------------- run
const zhDir = join(ROOT, 'content', 'zh', 'airports');
const enDir = join(ROOT, 'content', 'en', 'airports');
mkdirSync(zhDir, { recursive: true });
mkdirSync(enDir, { recursive: true });

/** Windows DOS device names cannot be git-indexed as `AUX.md`; the content file
    carries a trailing underscore, mirroring the cover file convention
    (scripts/map-file-aliases.json) and lib/content.ts's guideFileName(). */
const RESERVED = new Set(['CON', 'PRN', 'AUX', 'NUL']);
const mdName = (code) => `${RESERVED.has(code) ? `${code}_` : code}.md`;

const all = [...airports.keys()].sort();
const targets = all.filter((code) => {
  if (editorialIatas.has(code)) return false; // curated guides are hand-written
  if (existsSync(join(zhDir, mdName(code))) || existsSync(join(enDir, mdName(code)))) return false;
  return !ONLY || ONLY.includes(code);
});

console.log(`${targets.length} airport(s) need guides${DRY ? ' (dry run)' : ''}`);
if (DRY) {
  console.log(targets.join(' '));
  process.exit(0);
}

let written = 0;
for (const code of targets) {
  const data = guideData(code);
  writeFileSync(join(zhDir, mdName(code)), zhGuide(data) + '\n');
  writeFileSync(join(enDir, mdName(code)), enGuide(data) + '\n');
  written++;
}
console.log(`wrote ${written} guide pair(s) — now run: node scripts/build-hant.mjs`);
