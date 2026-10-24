/**
 * Language readiness report for the 24 registered locales.
 *
 * The site's locale registry (lib/i18n/config.ts) intentionally carries more
 * languages than are published: the switcher shows the planned ones, and this
 * command reports what each of them still needs. It is the starting point when
 * picking up the next language:
 *
 *   node scripts/locale-status.mjs
 *
 * "published" means `lib/i18n/messages/<code>.ts` exists (which is also what
 * lib/i18n/catalogs.ts requires). Everything else — long-form guides, country
 * introductions, static pages, blog articles — is counted per locale so the gap
 * is visible instead of guessed:
 *
 *   guides    content_documents kind='airport'   (zh/en/tw: 366, de: 363)
 *   country   content_documents kind='country'
 *   pages     content_documents kind='page'
 *   blog      public/blog/<slug>/<slug>.<suffix>.md
 *
 * A locale with no database rows yet is read-only: the counts are 0 and the
 * report still runs (the DB is only queried when reachable).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

/** The LOCALES literal from lib/i18n/config.ts, in registry order. */
function registeredLocales() {
  const source = readFileSync(join(ROOT, 'lib', 'i18n', 'config.ts'), 'utf8');
  const block = /export const LOCALES = \[([\s\S]*?)\] as const;/.exec(source);
  if (!block) throw new Error('could not find the LOCALES literal in lib/i18n/config.ts');
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/** label + htmlLang from LOCALE_META, without importing TypeScript. */
function localeMeta(locales) {
  const source = readFileSync(join(ROOT, 'lib', 'i18n', 'config.ts'), 'utf8');
  const meta = {};
  for (const locale of locales) {
    const entry = new RegExp(
      `\\b${locale}: \\{\\s*code: '${locale}',\\s*label: '([^']*)',\\s*htmlLang: '([^']*)'`
    ).exec(source);
    meta[locale] = entry
      ? { label: entry[1], htmlLang: entry[2] }
      : { label: locale, htmlLang: locale };
  }
  return meta;
}

/** Article files per locale, by the same suffix rules as lib/blog.ts. */
function blogCounts(locales) {
  const dir = join(ROOT, 'public', 'blog');
  const counts = Object.fromEntries(locales.map((l) => [l, 0]));
  if (!existsSync(dir)) return counts;
  const suffixFor = (locale) =>
    locale === 'en'
      ? '.en.md'
      : locale === 'de'
        ? '.de.md'
        : locale === 'fr'
          ? '.fr.md'
          : locale === 'it'
            ? '.it.md'
            : locale === 'ko'
              ? '.ko.md'
              : locale === 'tw'
                ? '.tw.md'
                : locale === 'zh'
                  ? '.md'
                  : null;
  const articles = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  for (const locale of locales) {
    const suffix = suffixFor(locale);
    if (!suffix) continue;
    for (const slug of articles) {
      if (existsSync(join(dir, slug, `${slug}${suffix}`))) counts[locale]++;
    }
  }
  return counts;
}

/** content_documents rows per locale and kind (0 when the DB is unreachable). */
async function documentCounts(locales) {
  const empty = Object.fromEntries(
    locales.map((l) => [l, { airport: 0, country: 0, page: 0 }])
  );
  const client = new pg.Client({ connectionString: databaseUrl() });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT locale, kind, count(*)::int AS n FROM content_documents GROUP BY 1, 2`
    );
    for (const row of rows) {
      if (empty[row.locale]) empty[row.locale][row.kind] = row.n;
    }
    return empty;
  } catch (error) {
    console.warn(`(database unavailable: ${error.message})`);
    return empty;
  } finally {
    await client.end().catch(() => {});
  }
}

const locales = registeredLocales();
const meta = localeMeta(locales);
const docs = await documentCounts(locales);
const blogs = blogCounts(locales);

const rows = locales.map((locale) => {
  const published = existsSync(join(ROOT, 'lib', 'i18n', 'messages', `${locale}.ts`));
  return {
    code: locale,
    hreflang: meta[locale].htmlLang,
    label: meta[locale].label,
    catalog: published ? 'yes' : '—',
    guides: published ? docs[locale].airport : '—',
    countries: published ? docs[locale].country : '—',
    pages: published ? docs[locale].page : '—',
    blog: published ? blogs[locale] : '—',
    state: published ? 'published' : 'planned',
  };
});

console.table(rows);
console.log(
  `${rows.filter((r) => r.state === 'published').length} published · ` +
    `${rows.filter((r) => r.state === 'planned').length} planned`
);
console.log('\nTo publish one: create lib/i18n/messages/<code>.ts (typed `Messages`),');
console.log('register it in lib/i18n/catalogs.ts, then translate the content and rebuild.');
