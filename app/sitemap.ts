import type { MetadataRoute } from 'next';
import { listPageSlugs } from '@/lib/content';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  SOURCE_LOCALE,
} from '@/lib/i18n/config';
import { getAllCountryCodes, getAirportRoutes } from '@/lib/queries';
import { routeAirportCodes } from '@/lib/routes';
import { SITE_URL } from '@/lib/site';

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
 * One sitemap entry per locale-independent path: `<loc>` is the bare
 * default-locale URL, and `alternates` list every translated URL plus
 * `x-default` (the same bare URL). The localized URLs are deliberately *not*
 * repeated as top-level `<loc>` entries — they are the same page, and repeating
 * the identical alternates block once per language tripled the file and read as
 * the same page listed three times. Crawlers still learn the /zh and /tw URLs
 * from the hreflang annotations here, from the language switcher links on every
 * page, and from each page's own `hreflang` tags.
 */
function localeEntries(path: string, options: EntryOptions): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of PUBLISHED_LOCALES) {
    languages[LOCALE_META[locale].htmlLang] = localeUrl(locale, path);
  }
  languages['x-default'] = localeUrl(DEFAULT_LOCALE, path);

  return [
    {
      url: localeUrl(DEFAULT_LOCALE, path),
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

  return [
    ...localeEntries('', { changeFrequency: 'daily', priority: 1 }),
    ...localeEntries('/airports', { changeFrequency: 'daily', priority: 0.9 }),
    ...localeEntries('/countries', { changeFrequency: 'weekly', priority: 0.8 }),
    ...localeEntries('/tool', { changeFrequency: 'monthly', priority: 0.5 }),
    ...['coordinate-converter', 'dms-converter', 'distance-calculator'].flatMap((slug) =>
      localeEntries(`/tool/${slug}`, { changeFrequency: 'monthly', priority: 0.4 })
    ),
    ...staticPages.flatMap((slug) =>
      localeEntries(`/${slug}`, { changeFrequency: 'monthly', priority: 0.3 })
    ),
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
