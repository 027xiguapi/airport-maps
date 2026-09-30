import type { MetadataRoute } from 'next';
import {
  blogLocalesWithContent,
  blogPostLocales,
  listBlogPosts,
  listBlogSlugs,
} from '@/lib/blog';
import { listPageSlugs } from '@/lib/content';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  SOURCE_LOCALE,
  type Locale,
} from '@/lib/i18n/config';
import { getAllCountryCodes, getAirportRoutes } from '@/lib/queries';
import { routeAirportCodes } from '@/lib/routes';
import { SITE_URL } from '@/lib/site';
import { TOOL_SLUGS } from '@/lib/tools';

export const revalidate = 3600;

type EntryOptions = {
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  lastModified?: Date;
};

/** Locale-prefixed URL for a path; the default locale is the bare URL. */
function localeUrl(locale: string, path: string): string {
  return `${SITE_URL}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${path}`;
}

/**
 * One sitemap entry per locale-independent path: `<loc>` is the canonical URL
 * of the language the page is authored in, and `alternates` list every
 * translated URL plus `x-default` (the same canonical URL). The localized URLs
 * are deliberately *not* repeated as top-level `<loc>` entries — they are the
 * same page, and repeating the identical alternates block once per language
 * tripled the file and read as the same page listed three times. Crawlers still
 * learn the /zh and /tw URLs from the hreflang annotations here, from the
 * language switcher links on every page, and from each page's own `hreflang`
 * tags.
 *
 * `locales` and `primary` narrow both lists for content that exists in a subset
 * of languages — a blog article that has not been translated, for instance,
 * keeps its Chinese URL as the canonical one.
 */
function localeEntries(
  path: string,
  options: EntryOptions,
  locales: readonly Locale[] = PUBLISHED_LOCALES,
  primary: Locale = DEFAULT_LOCALE
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[LOCALE_META[locale].htmlLang] = localeUrl(locale, path);
  }
  languages['x-default'] = localeUrl(primary, path);

  return [
    {
      url: localeUrl(primary, path),
      changeFrequency: options.changeFrequency,
      priority: options.priority,
      ...(options.lastModified ? { lastModified: options.lastModified } : {}),
      alternates: { languages },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [airports, countries] = await Promise.all([getAirportRoutes(), getAllCountryCodes()]);
  const staticPages = listPageSlugs(SOURCE_LOCALE);
  // Route maps exist for a subset of the directory only; publishing URLs for the
  // rest would just be a crawl of 404s.
  const withRoutes = new Set(routeAirportCodes());
  // The blog is translated per article, so both its canonical locale and the
  // alternate list come from the files on disk: an article with no English
  // version keeps its Chinese URL as the canonical one instead of advertising
  // an English URL that 404s.
  const posts = new Map(listBlogPosts(SOURCE_LOCALE).map((post) => [post.slug, post]));
  const blogLocales = blogLocalesWithContent();

  return [
    ...localeEntries('', { changeFrequency: 'daily', priority: 1 }),
    ...localeEntries('/airports', { changeFrequency: 'daily', priority: 0.9 }),
    ...localeEntries('/countries', { changeFrequency: 'weekly', priority: 0.8 }),
    ...localeEntries('/tool', { changeFrequency: 'monthly', priority: 0.5 }),
    // The list lives in one place (lib/tools.ts) so a new tool page cannot be
    // added without showing up here.
    ...TOOL_SLUGS.flatMap((slug) =>
      localeEntries(`/tool/${slug}`, { changeFrequency: 'monthly', priority: 0.4 })
    ),
    ...staticPages.flatMap((slug) =>
      localeEntries(`/${slug}`, { changeFrequency: 'monthly', priority: 0.3 })
    ),
    ...(blogLocales.length > 0
      ? localeEntries(
          '/blog',
          { changeFrequency: 'weekly', priority: 0.6 },
          blogLocales,
          blogLocales[0]
        )
      : []),
    ...listBlogSlugs().flatMap((slug) => {
      const locales = blogPostLocales(slug);
      if (locales.length === 0) return [];
      const post = posts.get(slug);
      return localeEntries(
        `/blog/${slug}`,
        {
          changeFrequency: 'monthly',
          priority: 0.5,
          ...(post?.date ? { lastModified: new Date(post.updated ?? post.date) } : {}),
        },
        locales,
        locales[0]
      );
    }),
    ...countries.flatMap((country) =>
      localeEntries(`/country/${country.code}`, { changeFrequency: 'weekly', priority: 0.7 })
    ),
    ...airports.flatMap((airport) =>
      localeEntries(`/airport/${airport.iata}`, {
        changeFrequency: 'weekly',
        priority: 0.8,
        lastModified: new Date(airport.updated_at),
      })
    ),
    ...airports
      .filter((airport) => withRoutes.has(airport.iata))
      .flatMap((airport) =>
        localeEntries(`/route/${airport.iata}`, {
          changeFrequency: 'weekly',
          priority: 0.6,
          lastModified: new Date(airport.updated_at),
        })
      ),
  ];
}
