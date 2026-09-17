/**
 * One-off extraction of the dataset embedded in the legacy index.html.
 * Emits scripts/legacy-data.json so the DB seed can be generated from it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const html = readFileSync(join(root, 'index.html'), 'utf8');

const start = html.indexOf('const COUNTRIES');
const endMarker = '/* ================================================================\n   工具';
const end = html.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) {
  throw new Error('could not locate the data block in index.html');
}

const block = html.slice(start, end);
const factory = new Function(`${block}\nreturn { COUNTRIES, AIRPORTS };`);
const { COUNTRIES, AIRPORTS } = factory();

// integrity checks
const problems = [];
for (const a of AIRPORTS) {
  if (!COUNTRIES[a.country]) problems.push(`${a.iata}: unknown country ${a.country}`);
  if (!a.terminals?.length) problems.push(`${a.iata}: no terminals`);
  for (const t of a.terminals ?? []) {
    if (t.gates != null && !Number.isFinite(t.gates)) problems.push(`${a.iata}/${t.code}: bad gates`);
  }
}
const dupes = AIRPORTS.map((a) => a.iata).filter((c, i, all) => all.indexOf(c) !== i);

const shapes = new Set();
const extraKeys = new Set();
for (const a of AIRPORTS) {
  for (const t of a.terminals) {
    if (t.shape) shapes.add(t.shape);
    Object.keys(t).forEach((k) => extraKeys.add(k));
    for (const f of t.facilities ?? []) Object.keys(f).forEach((k) => extraKeys.add('fac:' + k));
  }
}

const out = {
  countries: COUNTRIES,
  airports: AIRPORTS,
};
writeFileSync(join(here, 'legacy-data.json'), JSON.stringify(out, null, 2), 'utf8');

console.log('countries:', Object.keys(COUNTRIES).length);
console.log('airports :', AIRPORTS.length);
console.log('terminals:', AIRPORTS.reduce((s, a) => s + a.terminals.length, 0));
console.log('duplicate IATA:', dupes.length ? dupes.join(',') : 'none');
console.log('terminal shapes used:', [...shapes].join(',') || 'none');
console.log('terminal keys:', [...extraKeys].sort().join(', '));
console.log('problems:', problems.length ? problems : 'none');
console.log('wrote scripts/legacy-data.json');
