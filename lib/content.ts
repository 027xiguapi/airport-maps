import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCE_LOCALE, type Locale } from './i18n/config';

/**
 * Markdown content store. Long-form editorial text lives on disk under
 * `content/<locale>/` (versioned, reviewable); structured airport data lives in
 * PostgreSQL. Both render through the same Markdown component.
 *
 *   content/<locale>/airports/<IATA>.md   optional long-form airport guide
 *   content/<locale>/countries/<CC>.md    optional long-form country introduction
 *   content/<locale>/pages/<slug>.md      static pages (about, privacy, terms)
 *
 * Every path is built inline from `process.cwd()` so the bundler can statically
 * scope file tracing to the `content` directory instead of the whole project.
 */

export type MarkdownDoc = {
  /** Frontmatter `title`, when present. */
  title?: string;
  /** Frontmatter `summary` — used as the meta description. */
  summary?: string;
  /** Frontmatter `updated` (ISO date), when present. */
  updated?: string;
  /** Markdown body with frontmatter stripped. */
  body: string;
};

/**
 * Splits a leading `---` frontmatter block from the body. Values are flat
 * `key: value` pairs — deliberately not a YAML parser, so nothing silently
 * acquires structure it was not meant to have.
 */
function parseFrontmatter(raw: string): MarkdownDoc {
  const normalised = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalised);

  if (!match) return { body: normalised.trim() };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return {
    title: meta.title,
    summary: meta.summary,
    updated: meta.updated,
    body: normalised.slice(match[0].length).trim(),
  };
}

function readMarkdown(...segments: string[]): MarkdownDoc | null {
  const path = join(process.cwd(), 'content', ...segments);
  if (!existsSync(path)) return null;
  return parseFrontmatter(readFileSync(path, 'utf8'));
}

/**
 * Windows reserves the DOS device names (CON, PRN, AUX, NUL), so a file named
 * `AUX.md` cannot be indexed by git from a Windows checkout — the same
 * constraint that gives the AUX cover its `AUX_.png` name (see
 * scripts/map-file-aliases.json). Guide files for such codes carry a trailing
 * underscore on disk; these two helpers map code ↔ file name.
 */
const RESERVED_DEVICE_NAMES = new Set(['CON', 'PRN', 'AUX', 'NUL']);

function guideFileName(code: string): string {
  return `${RESERVED_DEVICE_NAMES.has(code) ? `${code}_` : code}.md`;
}

function guideFileCode(fileName: string): string {
  const stem = fileName.slice(0, -3);
  return stem.endsWith('_') && RESERVED_DEVICE_NAMES.has(stem.slice(0, -1))
    ? stem.slice(0, -1)
    : stem;
}

/** Long-form guide for an airport, falling back to the source language. */
export function getAirportGuide(locale: Locale, iata: string): MarkdownDoc | null {
  const file = guideFileName(iata.toUpperCase());
  return (
    readMarkdown(locale, 'airports', file) ??
    readMarkdown(SOURCE_LOCALE, 'airports', file)
  );
}

/**
 * Newest frontmatter `updated` date among the given locales' guides for an
 * airport, or undefined when no guide carries one. All guide dates are
 * `YYYY-MM-DD`, so a lexicographic max is the chronological one. The airport
 * page folds this into its JSON-LD dateModified; the sitemap uses the same
 * value for `<lastmod>` so both surfaces report the same freshness.
 */
export function latestAirportGuideUpdated(
  iata: string,
  locales: readonly Locale[]
): string | undefined {
  let latest: string | undefined;
  for (const locale of locales) {
    const updated = getAirportGuide(locale, iata)?.updated;
    if (updated && (!latest || updated > latest)) latest = updated;
  }
  return latest;
}

/**
 * Long-form introduction for a country page, falling back to the source
 * language. Optional: the country page always renders a data-derived overview,
 * and this article is appended to it when the file exists.
 */
export function getCountryIntro(locale: Locale, code: string): MarkdownDoc | null {
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return null;
  return (
    readMarkdown(locale, 'countries', `${cc}.md`) ??
    readMarkdown(SOURCE_LOCALE, 'countries', `${cc}.md`)
  );
}

/** Slugs of every static page available in a locale (or its fallback). */
export function listPageSlugs(locale: Locale): string[] {
  const slugs = new Set<string>();
  for (const dir of [locale, SOURCE_LOCALE]) {
    const path = join(process.cwd(), 'content', dir, 'pages');
    if (!existsSync(path)) continue;
    for (const file of readdirSync(path)) {
      if (file.endsWith('.md')) slugs.add(file.slice(0, -3));
    }
  }
  return [...slugs].sort();
}

/** A static Markdown page such as about / privacy / terms. */
export function getPage(locale: Locale, slug: string): MarkdownDoc | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return (
    readMarkdown(locale, 'pages', `${slug}.md`) ??
    readMarkdown(SOURCE_LOCALE, 'pages', `${slug}.md`)
  );
}

/** IATA codes that have a guide, used to decide whether to link one. */
export function hasAirportGuide(iata: string): boolean {
  const file = guideFileName(iata.toUpperCase());
  return (
    existsSync(join(process.cwd(), 'content', SOURCE_LOCALE, 'airports', file)) ||
    existsSync(join(process.cwd(), 'content', 'en', 'airports', file))
  );
}

/** IATA codes that have a guide in this locale, newest-first is not meaningful — sorted by code. */
export function listGuidedAirports(locale: Locale): string[] {
  const codes = new Set<string>();
  for (const dir of [locale, SOURCE_LOCALE]) {
    const path = join(process.cwd(), 'content', dir, 'airports');
    if (!existsSync(path)) continue;
    for (const file of readdirSync(path)) {
      if (file.endsWith('.md')) codes.add(guideFileCode(file).toUpperCase());
    }
  }
  return [...codes].sort();
}
