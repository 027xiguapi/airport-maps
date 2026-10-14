import { query } from './db';
import { SOURCE_LOCALE, type Locale } from './i18n/config';

/**
 * Long-form editorial Markdown — airport guides, country introductions and the
 * static pages — read from the `content_documents` table (db/schema.ts), one
 * row per (kind, subject, locale):
 *
 *   kind='airport'  subject=IATA       optional long-form airport guide
 *   kind='country'  subject=ISO code   optional long-form country introduction
 *   kind='page'     subject=page slug  static pages (about, privacy, terms)
 *
 * The documents used to live on disk under `content/<locale>/`; they were moved
 * into the database so adding a language is an insert rather than a directory of
 * new files. Both representations meet in `scripts/content-import.mjs` /
 * `scripts/content-export.mjs` (file naming and frontmatter live in
 * scripts/content-md.mjs), and `tw` is derived from the Chinese source by
 * `scripts/build-hant.mjs`.
 *
 * Every reader falls back to the authored source language when the requested
 * locale has no row — the same chain the file readers used, so a missing
 * translation never blanks a section.
 */

export type MarkdownDoc = {
  /** `title` column — page heading and metadata title. */
  title?: string;
  /** `summary` column — used as the meta description. */
  summary?: string;
  /** `updated` column (ISO date), the editorial revision date. */
  updated?: string;
  /** Markdown body. */
  body: string;
};

export type ContentKind = 'airport' | 'country' | 'page';

type DocumentRow = {
  title: string | null;
  summary: string | null;
  updated: string | null;
  body: string;
};

/** Columns every document query returns, with `updated` formatted in SQL. */
const DOCUMENT_COLUMNS = 'title, summary, updated::text AS updated, body';

/**
 * `date` comes back from the pg driver as a JS Date; formatting it in SQL keeps
 * it the plain `YYYY-MM-DD` string the frontmatter held, with no timezone shift.
 */
function toDoc(row: DocumentRow): MarkdownDoc {
  return {
    title: row.title ?? undefined,
    summary: row.summary ?? undefined,
    updated: row.updated ?? undefined,
    body: row.body,
  };
}

/** Requested locale first, then the authored source — first match wins. */
function localeChain(locale: Locale): Locale[] {
  return locale === SOURCE_LOCALE ? [locale] : [locale, SOURCE_LOCALE];
}

/** One document in the best available language, or null when none exists. */
async function getDocument(
  kind: ContentKind,
  locale: Locale,
  subject: string
): Promise<MarkdownDoc | null> {
  const chain = localeChain(locale);
  const rows = await query<DocumentRow>(
    `SELECT ${DOCUMENT_COLUMNS}
       FROM content_documents
      WHERE kind = $1 AND subject = $2 AND locale = ANY($3)
      ORDER BY array_position($3::text[], locale)
      LIMIT 1`,
    [kind, subject, chain]
  );
  return rows[0] ? toDoc(rows[0]) : null;
}

/** Long-form guide for an airport, falling back to the source language. */
export function getAirportGuide(locale: Locale, iata: string): Promise<MarkdownDoc | null> {
  return getDocument('airport', locale, iata.toUpperCase());
}

/**
 * Newest `updated` date per airport among the given locales' guides, as a map
 * keyed by IATA. The sitemap needs this for every airport at once — asking
 * per-airport would be 363 round trips for the same rows.
 */
export async function airportGuideUpdatedMap(
  locales: readonly Locale[]
): Promise<Map<string, string>> {
  const rows = await query<{ subject: string; updated: string }>(
    `SELECT subject, max(updated)::text AS updated
       FROM content_documents
      WHERE kind = 'airport' AND locale = ANY($1)
      GROUP BY subject`,
    [locales]
  );
  return new Map(rows.map((row) => [row.subject, row.updated]));
}

/**
 * Long-form introduction for a country page, falling back to the source
 * language. Optional: the country page always renders a data-derived overview,
 * and this article is appended to it when a row exists.
 */
export function getCountryIntro(locale: Locale, code: string): Promise<MarkdownDoc | null> {
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return Promise.resolve(null);
  return getDocument('country', locale, cc);
}

/**
 * Slugs of every static page available in a locale (or its fallback). Pages are
 * authored per locale, so a page that exists in one language and not another
 * would 404 there — the union of the locale and its source is what routes are
 * generated from.
 */
export async function listPageSlugs(locale: Locale): Promise<string[]> {
  const rows = await query<{ subject: string }>(
    `SELECT DISTINCT subject
       FROM content_documents
      WHERE kind = 'page' AND locale = ANY($1)
      ORDER BY subject`,
    [localeChain(locale)]
  );
  return rows.map((row) => row.subject);
}

/** A static Markdown page such as about / privacy / terms. */
export function getPage(locale: Locale, slug: string): Promise<MarkdownDoc | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return Promise.resolve(null);
  return getDocument('page', locale, slug);
}

/** IATA codes that have a guide in this locale (or its source fallback). */
export async function listGuidedAirports(locale: Locale): Promise<string[]> {
  const rows = await query<{ subject: string }>(
    `SELECT DISTINCT subject
       FROM content_documents
      WHERE kind = 'airport' AND locale = ANY($1)
      ORDER BY subject`,
    [localeChain(locale)]
  );
  return rows.map((row) => row.subject);
}
