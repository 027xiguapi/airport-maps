/**
 * Rewrites the directory-batch airport descriptions in airport_translations to
 * the current answer-first template (scripts/_describe.mjs), without touching
 * the ~60 hand-written editorial airports or any row that has since been
 * edited by hand.
 *
 * Why a script and not just a re-seed: the site's content lives in the
 * database, and `node scripts/seed.mjs` on an already-populated database is a
 * full TRUNCATE-and-reinsert. This updater changes only the description_md
 * rows of the affected airports, so it is safe to run on a live deployment:
 *
 *   node scripts/update-airport-descriptions.mjs --dry-run   report only
 *   node scripts/update-airport-descriptions.mjs             apply
 *
 * Guards: the zh and en rows are rewritten only while they still carry the
 * exact previous template (anything else is reported and left alone). The tw
 * row is derived content — it follows its zh source whenever the zh row is
 * regenerated or already current.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { directoryDescriptions, legacyDirectoryDescriptions } from './_describe.mjs';
import { toHant } from './_hant.mjs';

const DRY = process.argv.includes('--dry-run');

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const legacy = read('scripts/legacy-data.json');
const directory = read('scripts/directory-data.json');
const facts = (() => {
  try {
    return read('lib/airport-facts.json').airports;
  } catch {
    return {};
  }
})();
const countries = { ...legacy.countries, ...directory.countries };

/** iata -> { zh: [old, new], en: [old, new], tw: new }, for the directory batch. */
const plan = new Map();
for (const a of directory.airports) {
  const country = countries[a.country];
  if (!country) {
    console.warn(`skip ${a.iata}: no country record for ${a.country}`);
    continue;
  }
  const [oldZh, oldEn] = legacyDirectoryDescriptions(a, country);
  const [newZh, newEn] = directoryDescriptions(a, country, facts[a.iata]);
  plan.set(a.iata, { zh: [oldZh, newZh], en: [oldEn, newEn], tw: toHant(newZh) });
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const { rows } = await client.query(
  `SELECT airport_iata, locale, description_md FROM airport_translations WHERE airport_iata = ANY($1)`,
  [[...plan.keys()]]
);
const current = new Map(rows.map((r) => [`${r.airport_iata}:${r.locale}`, r.description_md]));

const updates = [];
const skipped = [];
const missing = [];
for (const [iata, texts] of plan) {
  const zhNow = current.get(`${iata}:zh`);
  const enNow = current.get(`${iata}:en`);
  const twNow = current.get(`${iata}:tw`);
  if (zhNow === undefined || enNow === undefined || twNow === undefined) {
    missing.push(iata);
    continue;
  }
  const zhEdited = zhNow !== texts.zh[0] && zhNow !== texts.zh[1];
  const enEdited = enNow !== texts.en[0] && enNow !== texts.en[1];
  if (zhEdited) skipped.push(`${iata}:zh`);
  if (enEdited) skipped.push(`${iata}:en`);
  if (!zhEdited && zhNow !== texts.zh[1]) updates.push([iata, 'zh', texts.zh[1]]);
  if (!enEdited && enNow !== texts.en[1]) updates.push([iata, 'en', texts.en[1]]);
  // tw is derived from the zh source; regenerate whenever zh is eligible.
  if (!zhEdited && twNow !== texts.tw) updates.push([iata, 'tw', texts.tw]);
}

if (missing.length) console.warn(`missing rows (not touched): ${missing.join(', ')}`);
if (skipped.length) {
  console.warn(
    `hand-edited rows left alone (${skipped.length}): ${skipped.slice(0, 20).join(', ')}${
      skipped.length > 20 ? ' …' : ''
    }`
  );
}

if (updates.length && !DRY) {
  const values = updates.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
  await client.query('BEGIN');
  await client.query(
    `UPDATE airport_translations AS t
        SET description_md = v.md
       FROM (VALUES ${values}) AS v(iata, locale, md)
      WHERE t.airport_iata = v.iata AND t.locale = v.locale`,
    updates.flat()
  );
  await client.query('COMMIT');
}

console.log(
  `${DRY ? 'would update' : 'updated'} ${updates.length} row(s) across ${plan.size} directory airports ` +
    `(${new Set(updates.map(([iata]) => iata)).size} airports; skipped ${skipped.length}, missing ${missing.length})`
);
if (DRY && updates.length) {
  const sample = updates.find(([iata, locale]) => iata === 'AAX' && locale === 'zh') ?? updates[0];
  console.log(`sample [${sample[0]}:${sample[1]}] ${sample[2]}`);
}

await client.end();
