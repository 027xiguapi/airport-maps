import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALE_META, SOURCE_LOCALE, localizedPath, type Locale } from './i18n/config';

/**
 * Blog content store. Articles live in `public/blog/<slug>/` — one directory per
 * article, images beside the text — so an article is a self-contained folder
 * that can be dropped in from the publishing tool of the day and checked by
 * `scripts/check-blog.mjs`. The Markdown is read at build time; the images are
 * served straight out of `public/`, which is why they live there rather than in
 * `content/` (see lib/content.ts for the long-form guides that travel with the
 * build instead).
 *
 *   public/blog/<slug>/<slug>.md      article: flat frontmatter + Markdown body
 *   public/blog/<slug>/<slug>.en.md   English version
 *   public/blog/<slug>/<slug>.tw.md   derived Traditional Chinese, written by
 *                                     scripts/build-hant.mjs
 *   public/blog/<slug>/images/N.ext   referenced from the body as ./images/N.ext
 *
 * Language coverage: the articles are written in Chinese and translated into
 * English, so a locale shows the blog only where files for it exist, and a
 * missing translation means the article is simply absent from that locale's
 * list — never Chinese text on an English page, the same rule the country
 * introductions follow.
 */

/** Locales the blog can appear in, in switcher order. */
export const BLOG_LOCALES: Locale[] = ['en', 'zh', 'tw'];

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

/** Reading time: CJK text counts characters, Latin text words. */
function readingMinutes(body: string): number {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const words = (text.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ').match(/[\w'-]+/g) ?? []).length;
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
 * `en` deliberately has no fallback: an article that has not been translated is
 * absent from the English blog rather than shown in Chinese. `tw` falls back to
 * the Chinese source only as a safety net — the derived file is written by
 * scripts/build-hant.mjs and normally always present.
 */
function articleNames(slug: string, locale: Locale): string[] {
  if (locale === 'tw') return [`${slug}.tw.md`, `${slug}.md`];
  if (locale === 'en') return [`${slug}.en.md`];
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
