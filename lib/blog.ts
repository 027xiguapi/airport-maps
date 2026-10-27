import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALE_META, SOURCE_LOCALE, localizedPath, type Locale } from './i18n/config';

/**
 * Blog content store. Articles live in `public/blog/<slug>/` — one directory per
 * article, images beside the text — so an article is a self-contained folder
 * that can be dropped in from the publishing tool of the day and checked by
 * `scripts/check-blog.mjs`. The Markdown is read at build time; the images are
 * served straight out of `public/`, which is why they live there rather than in
 * the database with the long-form guides (lib/content.ts) — an article is a
 * folder of images with text, not a single document.
 *
 *   public/blog/<slug>/<slug>.md      article: flat frontmatter + Markdown body
 *   public/blog/<slug>/<slug>.en.md   English version
 *   public/blog/<slug>/<slug>.de.md   German version (translated from the English one)
 *   public/blog/<slug>/<slug>.fr.md   French version (translated from the English one)
 *   public/blog/<slug>/<slug>.it.md   Italian version (translated from the English one)
 *   public/blog/<slug>/<slug>.ko.md   Korean version (translated from the English one)
 *   public/blog/<slug>/<slug>.tw.md   derived Traditional Chinese, written by
 *                                     scripts/build-hant.mjs
 *   public/blog/<slug>/images/N.ext   referenced from the body as ./images/N.ext
 *
 * Language coverage: the articles are written in Chinese, translated into
 * English, German, French, Italian and Korean, and derived into Traditional
 * Chinese. A locale shows the blog only where files for it exist, and a missing
 * translation means the article is simply absent from that locale's list —
 * never Chinese text on an English, German, French, Italian or Korean page, the
 * same rule the country introductions follow.
 */

/** Locales the blog can appear in, in switcher order. */
export const BLOG_LOCALES: Locale[] = ['en', 'de', 'fr', 'it', 'ko', 'zh', 'tw'];

export type BlogPost = {
  /** Directory name and URL segment. */
  slug: string;
  title: string;
  /** Card and meta-description text. */
  summary: string;
  /** Publication date, `YYYY-MM-DD`. */
  date: string;
  /** Optional revision date, `YYYY-MM-DD`. */
  updated?: string;
  /** Where the article came from (the publishing account), when recorded. */
  source?: string;
  tags: string[];
  /** Cover image path relative to the article directory, e.g. `images/0.webp`. */
  cover: string | null;
  /** Markdown body, images referenced as `./images/N.ext`. */
  body: string;
  /** Rough reading time in minutes. */
  minutes: number;
};

/** Frontmatter is flat `key: value` — the same reader as lib/content.ts. */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { meta: {}, body: text.trim() };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator < 0) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[trimmed.slice(0, separator).trim()] = value;
  }
  return { meta, body: text.slice(match[0].length).trim() };
}

/**
 * Reading time: CJK and Hangul text counts characters, Latin text words.
 * Hangul syllables are in U+AC00–D7AF (not the CJK ideograph range), so Korean
 * would otherwise be counted as zero words and always read "1 min".
 */
const CJK_TEXT = /[\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;
function readingMinutes(body: string): number {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const cjk = (text.match(CJK_TEXT) ?? []).length;
  const words = (text.replace(CJK_TEXT, ' ').match(/[\w'-]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}

/** Directory of every article on disk, newest first is decided by the caller. */
function articleDirs(): string[] {
  const dir = join(process.cwd(), 'public', 'blog');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name))
    .map((entry) => entry.name);
}

/** Slugs of every article, for generateStaticParams and the sitemap. */
export function listBlogSlugs(): string[] {
  return articleDirs().sort();
}

function articlePath(slug: string, locale: Locale): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const dir = join(process.cwd(), 'public', 'blog', slug);
  for (const name of articleNames(slug, locale)) {
    const path = join(dir, name);
    if (existsSync(path)) return path;
  }
  return null;
}

/**
 * Candidate file names for an article, most specific first.
 *
 * `en`, `de`, `fr`, `it` and `ko` deliberately have no fallback: an article
 * that has not been translated is absent from that language's blog rather than
 * shown in Chinese. `tw` falls back to the Chinese source only as a safety net —
 * the derived file is written by scripts/build-hant.mjs and normally always present.
 */
function articleNames(slug: string, locale: Locale): string[] {
  if (locale === 'tw') return [`${slug}.tw.md`, `${slug}.md`];
  if (locale === 'en') return [`${slug}.en.md`];
  if (locale === 'de') return [`${slug}.de.md`];
  if (locale === 'fr') return [`${slug}.fr.md`];
  if (locale === 'it') return [`${slug}.it.md`];
  if (locale === 'ko') return [`${slug}.ko.md`];
  return [`${slug}.md`];
}

function readPost(slug: string, locale: Locale): BlogPost | null {
  const path = articlePath(slug, locale);
  if (!path) return null;
  const { meta, body } = parseFrontmatter(readFileSync(path, 'utf8'));
  if (!meta.title) return null;

  return {
    slug,
    title: meta.title,
    summary: meta.summary ?? '',
    date: meta.date ?? '',
    updated: meta.updated,
    source: meta.source,
    tags: (meta.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    cover: meta.cover ? meta.cover.replace(/^\.\//, '') : null,
    body,
    minutes: readingMinutes(body),
  };
}

/** Every article in a locale, newest first (undated articles last). */
export function listBlogPosts(locale: Locale): BlogPost[] {
  const posts = articleDirs().flatMap((slug) => {
    const post = readPost(slug, locale);
    return post ? [post] : [];
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** One article, or null when the slug is unknown in this locale. */
export function getBlogPost(locale: Locale, slug: string): BlogPost | null {
  return readPost(slug, locale);
}

/** Newest articles for the homepage strip; empty when the locale has no blog. */
export function getLatestBlogPosts(locale: Locale, limit = 3): BlogPost[] {
  return hasBlog(locale) ? listBlogPosts(locale).slice(0, limit) : [];
}

/** Locales that publish at least one article — where the blog is linked and routed. */
export function blogLocalesWithContent(): Locale[] {
  return BLOG_LOCALES.filter((locale) => articleDirs().some((slug) => articlePath(slug, locale)));
}

/** True when this locale has a blog to show. */
export function hasBlog(locale: Locale): boolean {
  return BLOG_LOCALES.includes(locale) && articleDirs().some((slug) => articlePath(slug, locale));
}

/** Locales that have this particular article, in BLOG_LOCALES order. */
export function blogPostLocales(slug: string): Locale[] {
  return BLOG_LOCALES.filter((locale) => articlePath(slug, locale));
}

/**
 * The canonical locale for blog URLs — the first published language, which for
 * this site is English. Articles fall back to whichever locale has the text.
 */
function primaryBlogLocale(locales: Locale[]): Locale {
  return locales[0] ?? SOURCE_LOCALE;
}

/** Locale-independent path of an article, for `localizedPath` and metadata. */
export function blogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

/**
 * Public URL prefix an article's own images resolve against. Markdown refers to
 * them relatively (`./images/0.webp`); the reader passes this to `Markdown`.
 */
export function blogImageBase(slug: string): string {
  return `/blog/${slug}/`;
}

/** Absolute-from-root URL of an article's cover, for `<img src>`. */
export function blogCoverUrl(post: BlogPost): string | null {
  return post.cover ? `${blogImageBase(post.slug)}${post.cover}` : null;
}

/** Homepage/index link to the article list in a locale. */
export function blogIndexPath(): string {
  return '/blog';
}

/**
 * `alternates.languages` for a blog path: only the locales that actually have
 * the text, plus `x-default` on the canonical one. The site-wide
 * `languageAlternates` would advertise URLs for languages a given article was
 * never translated into.
 */
function blogLanguages(path: string, locales: Locale[]): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[LOCALE_META[locale].htmlLang] = localizedPath(locale, path);
  }
  languages['x-default'] = localizedPath(primaryBlogLocale(locales), path);
  return languages;
}

/** Alternates for the article list in every locale that publishes one. */
export function blogAlternates(path: string = blogIndexPath()): Record<string, string> {
  return blogLanguages(path, blogLocalesWithContent());
}

/** Alternates for one article, listing only the locales that carry it. */
export function blogPostAlternates(slug: string): Record<string, string> {
  return blogLanguages(blogPostPath(slug), blogPostLocales(slug));
}

/* ------------------------------------------------- airport ↔ article index */

/**
 * Three-letter tokens that collide with an IATA code but mean something else in
 * these articles: ATM machines, Vienna's CAT train, the Paris RER, Chicago's
 * CTA, the US TSA, Priority Pass, Airports Council International, Singapore's
 * GST, Batumi's "BUS" signage and so on. Skipped while indexing so an article
 * can never attach itself to an unrelated airport page.
 */
const NON_AIRPORT_CODES = new Set([
  'ATM', 'BUS', 'CAT', 'RER', 'ACI', 'GST', 'CTA', 'TSA', 'PPS',
  'CNY', 'CNN', 'THE', 'MAS', 'FOR', 'PRM', 'SAT', 'INN', 'LED', 'TER', 'CHS',
]);

/** One article's claim on an airport code. */
type ArticleRef = {
  slug: string;
  /** True when the article links the airport page itself (curated, strongest). */
  linked: boolean;
  /** Publication date, `YYYY-MM-DD`, from the Chinese source. */
  date: string;
};

let airportIndexCache: { signature: string; index: Map<string, ArticleRef[]> } | null = null;

/** Fingerprint of the article tree, so an edit or a new folder rebuilds the index. */
function articleSignature(): string {
  const dir = join(process.cwd(), 'public', 'blog');
  if (!existsSync(dir)) return '';
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      try {
        return `${entry.name}:${statSync(join(dir, entry.name, `${entry.name}.md`)).mtimeMs}`;
      } catch {
        return `${entry.name}:0`;
      }
    })
    .join('|');
}

/**
 * Airport code -> the articles that cover it. Built from the Chinese source of
 * every article (all of them have one) and cached for the process: the airport
 * pages ask for it once each, and re-reading 88 files per page would be silly.
 *
 * A code counts when the article links `/airport/<CODE>` or names it as an
 * airport — `（LHR）` in a table, `机场代码 **WUH**` in a fact box. Prose that
 * merely happens to contain three capitals is ignored by design.
 */
function articleAirportIndex(): Map<string, ArticleRef[]> {
  const signature = articleSignature();
  if (airportIndexCache?.signature === signature) return airportIndexCache.index;

  const index = new Map<string, ArticleRef[]>();
  for (const slug of articleDirs()) {
    const path = join(process.cwd(), 'public', 'blog', slug, `${slug}.md`);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');

    const linked = new Set([...text.matchAll(/\/airport\/([A-Z]{3})\b/g)].map((m) => m[1]));
    const named = new Set([
      ...[...text.matchAll(/[（(]([A-Z]{3})[）)]/g)].map((m) => m[1]),
      ...[...text.matchAll(/机场代码\s*\*{0,2}([A-Z]{3})/g)].map((m) => m[1]),
    ]);
    const date = /^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m.exec(text)?.[1] ?? '';

    for (const code of new Set([...linked, ...named])) {
      if (NON_AIRPORT_CODES.has(code)) continue;
      if (!index.has(code)) index.set(code, []);
      index.get(code)!.push({ slug, linked: linked.has(code), date });
    }
  }

  airportIndexCache = { signature, index };
  return index;
}

/**
 * Articles that cover one airport, newest first, with the ones that link the
 * airport page ranked above list-style pieces that merely mention it. Returns
 * only posts that exist in `locale`, so an untranslated article never surfaces
 * as Chinese text on another language's page.
 */
export function listBlogPostsForAirport(locale: Locale, iata: string, limit = 4): BlogPost[] {
  const refs = articleAirportIndex().get(iata.toUpperCase()) ?? [];
  return refs
    .map((ref) => ({ ref, post: readPost(ref.slug, locale) }))
    .filter((entry): entry is { ref: ArticleRef; post: BlogPost } => entry.post !== null)
    .sort(
      (a, b) =>
        Number(b.ref.linked) - Number(a.ref.linked) ||
        b.post.date.localeCompare(a.post.date) ||
        a.post.slug.localeCompare(b.post.slug)
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}

/**
 * Airport code -> its newest article date. The homepage's "recently updated"
 * list and the sitemap use it so a fresh guide counts as fresh content for the
 * airport it covers, even when the airport record itself has not changed.
 */
export function blogAirportDates(): Map<string, string> {
  const dates = new Map<string, string>();
  for (const [code, refs] of articleAirportIndex()) {
    const newest = refs.reduce((latest, ref) => (ref.date > latest ? ref.date : latest), '');
    if (newest) dates.set(code, newest);
  }
  return dates;
}
