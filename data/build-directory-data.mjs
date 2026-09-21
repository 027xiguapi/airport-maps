/**
 * One-off generator: merges the collected airport batch (data/new-airports-a.*)
 * into scripts/directory-data.json, the seed-time source for the extended
 * directory. Run from the repo root:
 *
 *   node data/build-directory-data.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(ROOT, 'data', 'new-airports-a.en.json'), 'utf8'));
const zh = JSON.parse(readFileSync(join(ROOT, 'data', 'new-airports-a.zh.json'), 'utf8'));

/** IATA codes already covered by the editorial seed (legacy-data.json). */
const EDITORIAL = new Set(['ARN', 'ATH', 'AKL']);

/** csvCity strings that name a suburb/settlement rather than the served city. */
const CITY_EN_FIX = {
  AKU: 'Aksu', AJL: 'Aizawl', ALL: 'Albenga', SAY: 'Siena', ISL: 'Istanbul',
  AOT: 'Aosta', AVB: 'Aviano', AVV: 'Geelong', ACV: 'Arcata', SBK: 'Saint-Brieuc',
  LME: 'Le Mans', OBS: 'Aubenas', CPC: 'San Martin de los Andes', ACE: 'Arrecife',
  OVD: 'Asturias', MOL: 'Molde', AKJ: 'Asahikawa', ATH: 'Athens', OUD: 'Oujda',
  ANN: 'Annette Island', ANM: 'Antalaha', AYJ: 'Ayodhya', IXD: 'Allahabad',
  VLY: 'Anglesey', ZCA: 'Menden', OAJ: 'Jacksonville', ACI: 'Alderney',
  AOC: 'Altenburg', EDC: 'Austin', KSO: 'Kastoria', MZI: 'Mopti', ASV: 'Amboseli',
  AUY: 'Aneityum', VBA: 'Ann', JIB: 'Djibouti', ABT: 'Al Baha', IEO: 'Aioun',
  DIE: 'Antsiranana', JTY: 'Astypalaia', WKK: 'Aleknagik', AEG: 'Padang Sidempuan',
  NSK: 'Norilsk', HOF: 'Hofuf', AJF: 'Al Jawf', RCH: 'Riohacha', AOO: 'Altoona',
  BYF: 'Albert', LCG: 'A Coruna', ADB: 'Izmir', XJD: 'Doha', TTQ: 'Tulum',
  BIG: 'Delta Junction', IQA: 'Al Asad', TQD: 'Al Taqaddum',
};

/** Countries the directory adds on top of legacy-data.json's 37. */
const COUNTRIES = {
  AR: { name: '阿根廷', nameEn: 'Argentina', region: '南美洲' },
  BE: { name: '比利时', nameEn: 'Belgium', region: '欧洲' },
  BS: { name: '巴哈马', nameEn: 'Bahamas', region: '北美洲' },
  CG: { name: '刚果(布)', nameEn: 'Republic of the Congo', region: '非洲' },
  CK: { name: '库克群岛', nameEn: 'Cook Islands', region: '大洋洲' },
  CL: { name: '智利', nameEn: 'Chile', region: '南美洲' },
  CO: { name: '哥伦比亚', nameEn: 'Colombia', region: '南美洲' },
  CR: { name: '哥斯达黎加', nameEn: 'Costa Rica', region: '北美洲' },
  CU: { name: '古巴', nameEn: 'Cuba', region: '北美洲' },
  CV: { name: '佛得角', nameEn: 'Cape Verde', region: '非洲' },
  CY: { name: '塞浦路斯', nameEn: 'Cyprus', region: '欧洲' },
  DJ: { name: '吉布提', nameEn: 'Djibouti', region: '非洲' },
  DO: { name: '多米尼加共和国', nameEn: 'Dominican Republic', region: '北美洲' },
  DZ: { name: '阿尔及利亚', nameEn: 'Algeria', region: '非洲' },
  ER: { name: '厄立特里亚', nameEn: 'Eritrea', region: '非洲' },
  ET: { name: '埃塞俄比亚', nameEn: 'Ethiopia', region: '非洲' },
  GG: { name: '根西岛', nameEn: 'Guernsey', region: '欧洲' },
  GL: { name: '格陵兰', nameEn: 'Greenland', region: '北美洲' },
  GU: { name: '关岛', nameEn: 'Guam', region: '大洋洲' },
  HN: { name: '洪都拉斯', nameEn: 'Honduras', region: '北美洲' },
  HT: { name: '海地', nameEn: 'Haiti', region: '北美洲' },
  IQ: { name: '伊拉克', nameEn: 'Iraq', region: '中东' },
  IR: { name: '伊朗', nameEn: 'Iran', region: '中东' },
  IS: { name: '冰岛', nameEn: 'Iceland', region: '欧洲' },
  JO: { name: '约旦', nameEn: 'Jordan', region: '中东' },
  KE: { name: '肯尼亚', nameEn: 'Kenya', region: '非洲' },
  KZ: { name: '哈萨克斯坦', nameEn: 'Kazakhstan', region: '中亚' },
  LK: { name: '斯里兰卡', nameEn: 'Sri Lanka', region: '南亚' },
  MA: { name: '摩洛哥', nameEn: 'Morocco', region: '非洲' },
  MG: { name: '马达加斯加', nameEn: 'Madagascar', region: '非洲' },
  ML: { name: '马里', nameEn: 'Mali', region: '非洲' },
  MM: { name: '缅甸', nameEn: 'Myanmar', region: '东南亚' },
  MN: { name: '蒙古国', nameEn: 'Mongolia', region: '东亚' },
  MR: { name: '毛里塔尼亚', nameEn: 'Mauritania', region: '非洲' },
  NG: { name: '尼日利亚', nameEn: 'Nigeria', region: '非洲' },
  NO: { name: '挪威', nameEn: 'Norway', region: '欧洲' },
  PA: { name: '巴拿马', nameEn: 'Panama', region: '北美洲' },
  PE: { name: '秘鲁', nameEn: 'Peru', region: '南美洲' },
  PF: { name: '法属波利尼西亚', nameEn: 'French Polynesia', region: '大洋洲' },
  PK: { name: '巴基斯坦', nameEn: 'Pakistan', region: '南亚' },
  PR: { name: '波多黎各', nameEn: 'Puerto Rico', region: '北美洲' },
  RO: { name: '罗马尼亚', nameEn: 'Romania', region: '欧洲' },
  SB: { name: '所罗门群岛', nameEn: 'Solomon Islands', region: '大洋洲' },
  SD: { name: '苏丹', nameEn: 'Sudan', region: '非洲' },
  SO: { name: '索马里', nameEn: 'Somalia', region: '非洲' },
  SY: { name: '叙利亚', nameEn: 'Syria', region: '中东' },
  TD: { name: '乍得', nameEn: 'Chad', region: '非洲' },
  TM: { name: '土库曼斯坦', nameEn: 'Turkmenistan', region: '中亚' },
  TT: { name: '特立尼达和多巴哥', nameEn: 'Trinidad and Tobago', region: '北美洲' },
  TZ: { name: '坦桑尼亚', nameEn: 'Tanzania', region: '非洲' },
  UG: { name: '乌干达', nameEn: 'Uganda', region: '非洲' },
  VC: { name: '圣文森特和格林纳丁斯', nameEn: 'Saint Vincent and the Grenadines', region: '北美洲' },
  VE: { name: '委内瑞拉', nameEn: 'Venezuela', region: '南美洲' },
  VU: { name: '瓦努阿图', nameEn: 'Vanuatu', region: '大洋洲' },
  YE: { name: '也门', nameEn: 'Yemen', region: '中东' },
};

const KIND_ZH = { large: '大型', medium: '中型', small: '小型', heliport: '直升机' };

const airports = [];
const problems = [];
for (const a of en) {
  if (EDITORIAL.has(a.iata)) continue;
  const z = zh[a.iata];
  if (!z) { problems.push(`missing zh: ${a.iata}`); continue; }
  if (!COUNTRIES[a.country]) {
    // Not a problem when the country is already seeded editorially — checked below.
  }
  airports.push({
    iata: a.iata,
    icao: a.icao,
    country: a.country,
    kind: a.kind,
    name: z[0],
    city: z[1],
    nameEn: a.nameEn,
    cityEn: CITY_EN_FIX[a.iata] ?? a.cityEn,
  });
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

// Every airport's country must exist either in legacy-data.json or COUNTRIES.
const legacy = JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8'));
const legacyCodes = new Set(Object.keys(legacy.countries));
const missingCountries = [...new Set(airports.map((a) => a.country))]
  .filter((c) => !legacyCodes.has(c) && !COUNTRIES[c]);
if (missingCountries.length) {
  console.error('countries missing from both legacy and COUNTRIES:', missingCountries.join(', '));
  process.exit(1);
}

const out = { countries: COUNTRIES, airports };
const target = join(ROOT, 'scripts', 'directory-data.json');
writeFileSync(target, JSON.stringify(out, null, 1) + '\n');
console.log(`wrote ${target}: ${Object.keys(COUNTRIES).length} countries, ${airports.length} airports`);
