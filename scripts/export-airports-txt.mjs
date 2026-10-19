/**
 * Exports the airport directory from the database to a plain-text list — the
 * readable counterpart to the site's CSV/JSON downloads:
 *
 *   node scripts/export-airports-txt.mjs                 → ./airports.txt
 *   node scripts/export-airports-txt.mjs --out <file>    another path
 *   node scripts/export-airports-txt.mjs --locale en     English names instead
 *
 * One airport per line, grouped under its country:
 *
 *   PEK  北京首都国际机场 — 北京
 *
 * Chinese is the editorial source language, so `zh` is the default; `en` uses
 * the authored English names. The file is UTF-8 with a BOM and CRLF line
 * endings, so it opens correctly in Windows Notepad and Excel.
 */
import { isAbsolute, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const args = process.argv.slice(2);
const flagValue = (name, fallback) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return fallback;
  const arg = args[i];
  return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args[i + 1] ?? fallback;
};

const LOCALES = new Set(['zh', 'en']);
const locale = flagValue('--locale', 'zh');
if (!LOCALES.has(locale)) {
  console.error(`unknown --locale: ${locale} (expected zh or en)`);
  process.exit(1);
}
const out = flagValue('--out', 'airports.txt');
const outPath = isAbsolute(out) ? out : join(ROOT, out);

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows } = await client.query(
  `SELECT a.iata,
          a.name,
          a.name_en,
          a.city,
          a.city_en,
          a.country_code,
          c.name        AS country,
          c.name_en     AS country_en,
          c.sort_order
     FROM airports a
     JOIN countries c ON c.code = a.country_code
    ORDER BY c.sort_order, c.code, a.annual_pax_m DESC NULLS LAST, a.iata`
);
await client.end();

if (rows.length === 0) {
  console.error('no airports in the database');
  process.exit(1);
}

const ink = locale === 'zh' ? (row) => row.name : (row) => row.name_en;
const city = locale === 'zh' ? (row) => row.city : (row) => row.city_en || row.city;
const country = locale === 'zh' ? (row) => row.country : (row) => row.country_en;

/** Groups consecutive rows by country, preserving the SQL order. */
const groups = [];
for (const row of rows) {
  const last = groups[groups.length - 1];
  if (last && last.code === row.country_code) last.rows.push(row);
  else groups.push({ code: row.country_code, name: country(row), rows: [row] });
}

const today = new Date().toISOString().slice(0, 10);
const lines = [
  locale === 'zh' ? '全球机场清单 · World Airport Maps' : 'World Airport List · World Airport Maps',
  locale === 'zh'
    ? `${rows.length} 座机场，${groups.length} 个国家 / 地区 · 导出于 ${today}`
    : `${rows.length} airports in ${groups.length} countries / regions · exported ${today}`,
  '',
  locale === 'zh'
    ? '格式：IATA 代码  机场名 — 城市；按国家 / 地区分组，组内按年旅客量排序'
    : 'Format: IATA code  airport — city; grouped by country, busiest first inside a group',
  '',
];

for (const group of groups) {
  lines.push(locale === 'zh' ? `【${group.name}】${group.rows.length} 座` : `[${group.name}] ${group.rows.length}`);
  for (const row of group.rows) {
    lines.push(`  ${row.iata}  ${ink(row)} — ${city(row)}`);
  }
  lines.push('');
}

// Trailing blank line dropped: the file ends with exactly one newline.
while (lines.length && lines[lines.length - 1] === '') lines.pop();

writeFileSync(outPath, `\uFEFF${lines.join('\r\n')}\r\n`, 'utf8');
console.log(`wrote ${rows.length} airport(s) in ${groups.length} country/region group(s) to ${outPath}`);
