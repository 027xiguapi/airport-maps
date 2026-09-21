/**
 * Seeds PostgreSQL from scripts/legacy-data.json (extracted from the original
 * single-file version of the site). Idempotent: truncates then re-inserts.
 *
 * Usage: node scripts/seed.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const CITY_EN = {
  上海: 'Shanghai', 东京: 'Tokyo', 亚特兰大: 'Atlanta', 伊斯坦布尔: 'Istanbul',
  伦敦: 'London', 俄克拉荷马城: 'Oklahoma City', 利雅得: 'Riyadh', 北京: 'Beijing',
  华盛顿: 'Washington', 吉隆坡: 'Kuala Lumpur', 哥本哈根: 'Copenhagen', 圣保罗: 'Sao Paulo',
  塔什干: 'Tashkent', 墨西哥城: 'Mexico City', 多伦多: 'Toronto', 多哈: 'Doha',
  大阪: 'Osaka', 奥克兰: 'Auckland', 巴塞罗那: 'Barcelona', 巴黎: 'Paris',
  广州: 'Guangzhou', 开普敦: 'Cape Town', 开罗: 'Cairo', 德里: 'Delhi',
  悉尼: 'Sydney', 慕尼黑: 'Munich', 斯德哥尔摩: 'Stockholm', 新加坡: 'Singapore',
  旧金山: 'San Francisco', 曼谷: 'Bangkok', 法兰克福: 'Frankfurt', 洛杉矶: 'Los Angeles',
  温哥华: 'Vancouver', 米兰: 'Milan', 纽约: 'New York', 维也纳: 'Vienna',
  罗马: 'Rome', 胡志明市: 'Ho Chi Minh City', 芝加哥: 'Chicago', 苏黎世: 'Zurich',
  莫斯科: 'Moscow', 西雅图: 'Seattle', 迈阿密: 'Miami', 迪拜: 'Dubai',
  都柏林: 'Dublin', 里斯本: 'Lisbon', 阿姆斯特丹: 'Amsterdam', 雅典: 'Athens',
  雅加达: 'Jakarta', 首尔: 'Seoul', 香港: 'Hong Kong', 马尼拉: 'Manila',
  马德里: 'Madrid',
};

/** Region display order used across the country listings. */
const REGION_ORDER = [
  '东亚', '东南亚', '南亚', '中亚', '中东', '中东 / 欧洲',
  '欧洲', '欧洲 / 亚洲', '北美洲', '南美洲', '大洋洲', '非洲',
];

/** English labels for the Chinese region values stored on countries. */
const REGION_EN = {
  东亚: 'East Asia',
  东南亚: 'Southeast Asia',
  南亚: 'South Asia',
  中亚: 'Central Asia',
  中东: 'the Middle East',
  '中东 / 欧洲': 'the Middle East and Europe',
  欧洲: 'Europe',
  '欧洲 / 亚洲': 'Europe and Asia',
  北美洲: 'North America',
  南美洲: 'South America',
  大洋洲: 'Oceania',
  非洲: 'Africa',
};

/**
 * Locales seeded into airport_translations. Must match lib/i18n/config.ts.
 *
 * `zh` is the editorial source language (see SOURCE_LOCALE in
 * lib/i18n/config.ts): its descriptions come from the legacy content and its
 * terminology needs no file. `en` is generated + looked up in
 * content/terminology/en.json. Order here does not matter.
 */
const SEED_LOCALES = ['zh', 'en'];

/**
 * Loads a locale's closed-vocabulary terminology. Chinese is the source
 * language, so it needs no file.
 */
function loadTerminology(locale) {
  const path = join(ROOT, 'content', 'terminology', `${locale}.json`);
  if (locale === 'zh') return null;
  if (!existsSync(path)) {
    throw new Error(`missing terminology file: content/terminology/${locale}.json`);
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  for (const key of ['terminalNames', 'labels']) {
    if (!data[key] || typeof data[key] !== 'object') {
      throw new Error(`content/terminology/${locale}.json is missing "${key}"`);
    }
  }
  return data;
}

/**
 * Gate ranges are a small pattern language, so they are translated by rule
 * rather than by an exhaustive dictionary. Callers assert the result has no
 * CJK left, which surfaces any range pattern this does not yet handle.
 */
function translateGateRange(value) {
  if (!value) return null;
  return value
    .replace(/值机\/到达/g, 'Check-in / Arrivals')
    .replace(/值机大厅/g, 'Check-in hall')
    .replace(/([A-Za-z0-9/–,—\-\s]+?)\s*廊道?/g, (_m, prefix) => `Concourse ${prefix.trim()}`)
    .replace(/([A-Za-z0-9/–,—\-\s]+?)\s*厅/g, (_m, prefix) => `Hall ${prefix.trim()}`);
}

const HAS_CJK = /[\u3400-\u4dbf\u4e00-\u9fff]/;

/** Airports surfaced as "recently updated" in the original build. */
const MOST_RECENT = ['CPT', 'SGN', 'TAS'];

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "约6700万" -> 67 ; "约1.08亿" -> 108 */
function parsePax(text) {
  const m = /约\s*([\d.]+)\s*(亿|万)/.exec(text ?? '');
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return m[2] === '亿' ? Number((n * 100).toFixed(2)) : Number((n / 100).toFixed(2));
}

/** "25 km" -> 25 */
function parseDistance(text) {
  const m = /([\d.]+)\s*km/i.exec(text ?? '');
  return m ? Number(m[1]) : null;
}

/** 67 -> "67", 1.08 -> "1.08" */
function trimZeros(value) {
  const s = String(value);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/**
 * English description derived from the structured fields rather than machine
 * translated, so every claim traces back to data. Transport is described by
 * mode (rail, bus, taxi…) because the per-service names are editorial Chinese.
 * Replace with editorial copy when translations are available (see README).
 */
function englishDescription(a, paxM, distanceKm, modes) {
  const country = countries[a.country].nameEn;
  const city = a.cityEn ?? CITY_EN[a.city];
  const terminalCount = a.terminals.length;
  // Deduplicate modes: several services may share the same one.
  const transportTerms = [
    ...new Set((a.transit ?? []).map((t) => modes[t.icon] ?? t.icon)),
  ];
  const parts = [
    `${a.nameEn} (${a.iata}) serves ${city}, ${country}.`,
    `It has ${terminalCount} terminal${terminalCount === 1 ? '' : 's'} with ${a.gates} gates in total` +
      (paxM != null ? ` and handles about ${trimZeros(paxM)} million passengers a year` : '') +
      '.',
    distanceKm != null ? `The airport is about ${trimZeros(distanceKm)} km from the city centre.` : null,
    transportTerms.length ? `Ground transport into the city: ${joinList(transportTerms)}.` : null,
  ];
  return parts.filter(Boolean).join(' ');
}

const KIND_ZH = { large: '大型', medium: '中型', small: '小型', heliport: '直升机' };
const KIND_EN = {
  large: 'large airport',
  medium: 'medium-sized airport',
  small: 'small airport',
  heliport: 'heliport',
};

/**
 * Description for the directory batch (scripts/directory-data.json), derived
 * purely from its own fields — those airports carry no editorial copy yet.
 * Returns the [zh, en] pair for airport_translations.
 */
function directoryDescriptions(a) {
  const country = countries[a.country];
  const kindZh = KIND_ZH[a.kind] ?? '';
  const kindEn = KIND_EN[a.kind] ?? 'airport';
  return [
    `${a.name}(IATA:${a.iata})位于${country.name}${a.city}，是一座${kindZh}机场。详细航站楼、登机口及交通信息将陆续补充。`,
    `${a.nameEn} (${a.iata}) is a ${kindEn} serving ${a.cityEn}, ${country.nameEn}. ` +
      'Terminal, gate and ground-transport details will be added as they are compiled.',
  ];
}

/** "a, b and c" */
function joinList(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const legacy = JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8'));
const { countries, airports } = legacy;

// Directory batch: name/city/country records collected separately, generated
// into scripts/directory-data.json by data/build-directory-data.mjs. They ride
// the same seed so a re-seed cannot drop them, and carry no editorial content
// (no terminals, facilities or pax figures) until those are written.
const directory = JSON.parse(readFileSync(join(ROOT, 'scripts', 'directory-data.json'), 'utf8'));
Object.assign(countries, directory.countries);
const editorialIatas = new Set(airports.map((a) => a.iata));
const directoryAirports = directory.airports.filter((a) => !editorialIatas.has(a.iata));

// ---------------------------------------------------------------- validation
const missingCities = [...new Set(airports.map((a) => a.city))].filter((c) => !CITY_EN[c]);
if (missingCities.length) throw new Error(`CITY_EN is missing: ${missingCities.join(', ')}`);

const unknownRegions = [...new Set(Object.values(countries).map((c) => c.region))].filter(
  (r) => !REGION_ORDER.includes(r)
);
if (unknownRegions.length) throw new Error(`REGION_ORDER is missing: ${unknownRegions.join(', ')}`);

const missingRegionEn = [...new Set(Object.values(countries).map((c) => c.region))].filter(
  (r) => !REGION_EN[r]
);
if (missingRegionEn.length) throw new Error(`REGION_EN is missing: ${missingRegionEn.join(', ')}`);

const unknownLocales = SEED_LOCALES.filter((l) => !/^[a-z]{2}$/.test(l));
if (unknownLocales.length) throw new Error(`bad locale codes: ${unknownLocales.join(', ')}`);

for (const a of airports) {
  const sum = a.terminals.reduce((s, t) => s + (t.gates ?? 0), 0);
  if (sum !== a.gates) {
    console.warn(`  note: ${a.iata} terminal gates (${sum}) != airport gates (${a.gates})`);
  }
  if (parsePax(a.pax) === null) throw new Error(`${a.iata}: unparseable pax "${a.pax}"`);
  if (parseDistance(a.distance) === null) throw new Error(`${a.iata}: unparseable distance "${a.distance}"`);
}

// --------------------------------------------------------------------- order
const ordered = [
  ...MOST_RECENT.map((code) => airports.find((a) => a.iata === code)).filter(Boolean),
  ...airports.filter((a) => !MOST_RECENT.includes(a.iata)),
];

const countryCodes = Object.keys(countries).sort((a, b) => {
  const ra = REGION_ORDER.indexOf(countries[a].region);
  const rb = REGION_ORDER.indexOf(countries[b].region);
  return ra - rb || countries[a].name.localeCompare(countries[b].name, 'zh');
});

// ---------------------------------------------------------------------- seed
const terminology = Object.fromEntries(SEED_LOCALES.map((l) => [l, loadTerminology(l)]));
const enTerms = terminology.en;

// Every closed-vocabulary string must have a translation in every non-source
// locale, otherwise that locale would silently fall back mid-page.
const missingTerms = [];
for (const locale of SEED_LOCALES) {
  const terms = terminology[locale];
  if (!terms) continue;
  for (const a of airports) {
    for (const t of a.terminals) {
      if (!terms.terminalNames[t.name]) missingTerms.push(`${locale} terminalNames: ${t.name}`);
    }
    for (const f of [...(a.facilities ?? []), ...a.terminals.flatMap((t) => t.facilities ?? [])]) {
      if (f?.label && !terms.labels[f.label]) missingTerms.push(`${locale} labels: ${f.label}`);
    }
  }
}
if (missingTerms.length) {
  throw new Error(
    `content/terminology/*.json is incomplete:\n  ${[...new Set(missingTerms)].join('\n  ')}`
  );
}

// Gate ranges go through a rule-based pass; fail loudly if anything survived.
const badGateRanges = [];
for (const a of airports) {
  for (const t of a.terminals) {
    const translated = translateGateRange(t.gateRange);
    if (translated && HAS_CJK.test(translated)) {
      badGateRanges.push(`${t.gateRange} -> ${translated}`);
    }
  }
}
if (badGateRanges.length) {
  throw new Error(
    `gate ranges still contain CJK after translation:\n  ${[...new Set(badGateRanges)].join('\n  ')}`
  );
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

try {
  await client.query('BEGIN');
  await client.query(
    'TRUNCATE terminal_amenities, airport_facilities, ground_transport, terminals, airport_translations, airports, countries RESTART IDENTITY CASCADE'
  );

  for (const [i, code] of countryCodes.entries()) {
    const c = countries[code];
    await client.query(
      `INSERT INTO countries (code, name, name_en, region, region_en, flag_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [code, c.name, c.nameEn, c.region, REGION_EN[c.region], `/flags/${code.toLowerCase()}.jpg`, i]
    );
  }

  // `now() - i days` gives the homepage "recently updated" list a stable order:
  // the first entries of `ordered` are the freshest.
  for (const [i, a] of ordered.entries()) {
    const slug = `${slugify(a.nameEn)}-${a.iata.toLowerCase()}`;
    const paxM = parsePax(a.pax);
    const distanceKm = parseDistance(a.distance);

    await client.query(
      `INSERT INTO airports
         (iata, slug, name, name_en, city, city_en, country_code,
          gate_count, annual_pax_m, distance_km, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now() - ($11 || ' days')::interval)`,
      [a.iata, slug, a.name, a.nameEn, a.city, CITY_EN[a.city], a.country, a.gates, paxM, distanceKm, i]
    );

    // descriptions are Markdown; zh keeps the editorial copy, en is data-derived
    await client.query(
      `INSERT INTO airport_translations (airport_iata, locale, description_md)
       VALUES ($1, 'zh', $2), ($1, 'en', $3)`,
      [a.iata, a.desc, englishDescription(a, paxM, distanceKm, enTerms.transportModes)]
    );

    for (const [ti, t] of a.terminals.entries()) {
      const isSatellite = /卫星/.test(t.name);
      const { rows } = await client.query(
        `INSERT INTO terminals
           (airport_iata, code, name, name_en, gate_range, gate_range_en,
            gate_count, airlines, airlines_en, is_satellite, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [
          a.iata, t.code, t.name, enTerms.terminalNames[t.name],
          t.gateRange ?? null, translateGateRange(t.gateRange),
          t.gates ?? 0, t.airlines ?? null, enTerms.airlines?.[t.airlines] ?? null,
          isSatellite, ti,
        ]
      );
      for (const [fi, f] of (t.facilities ?? []).entries()) {
        if (!f?.label) continue;
        await client.query(
          `INSERT INTO terminal_amenities (terminal_id, icon, label, label_en, sort_order)
           VALUES ($1,$2,$3,$4,$5)`,
          [rows[0].id, f.icon || 'shop', f.label, enTerms.labels[f.label], fi]
        );
      }
    }

    for (const [fi, f] of (a.facilities ?? []).entries()) {
      if (!f?.label) continue;
      await client.query(
        `INSERT INTO airport_facilities (airport_iata, icon, label, label_en, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [a.iata, f.icon || 'shop', f.label, enTerms.labels[f.label], fi]
      );
    }

    for (const [si, t] of (a.transit ?? []).entries()) {
      if (!t?.name) continue;
      await client.query(
        `INSERT INTO ground_transport
           (airport_iata, icon, name, name_en, description, description_en, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          a.iata, t.icon || 'bus', t.name,
          enTerms.transit?.[t.name]?.name ?? null,
          t.desc ?? '',
          enTerms.transit?.[t.name]?.description ?? null,
          si,
        ]
      );
    }
  }

  // Directory batch: base row plus data-derived descriptions only. The day
  // stagger continues after the editorial set, so every editorial airport
  // stays above them in the homepage "recently updated" strip.
  for (const [di, a] of directoryAirports.entries()) {
    const slug = `${slugify(a.nameEn)}-${a.iata.toLowerCase()}`;
    await client.query(
      `INSERT INTO airports
         (iata, slug, name, name_en, city, city_en, country_code, gate_count, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0, now() - ($8 || ' days')::interval)`,
      [a.iata, slug, a.name, a.nameEn, a.city, a.cityEn, a.country, ordered.length + di]
    );
    const [descZh, descEn] = directoryDescriptions(a);
    await client.query(
      `INSERT INTO airport_translations (airport_iata, locale, description_md)
       VALUES ($1, 'zh', $2), ($1, 'en', $3)`,
      [a.iata, descZh, descEn]
    );
  }

  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
}

const { rows: stats } = await client.query('SELECT * FROM directory_stats');

// Report how much editorial copy is still untranslated per locale, so a
// partially localized dataset is visible rather than a silent gap.
const { rows: coverage } = await client.query(
  `SELECT
     (SELECT count(*) FROM terminals WHERE name_en IS NULL)::int      AS terminals_missing_en,
     (SELECT count(*) FROM terminals WHERE airlines_en IS NULL)::int  AS airlines_missing_en,
     (SELECT count(*) FROM ground_transport
       WHERE name_en IS NULL OR description_en IS NULL)::int          AS transit_missing_en`
);

console.log('seeded:', stats[0]);
console.log('untranslated (en):', coverage[0]);
await client.end();
