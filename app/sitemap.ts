import type { MetadataRoute } from 'next';
import { listPageSlugs } from '@/lib/content';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  SOURCE_LOCALE,
  type Locale,
} from '@/lib/i18n/config';
import { getAllCountryCodes, getAirportRoutes } from '@/lib/queries';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

type EntryOptions = {
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  lastModified?: Date;
};

/**
 * Emits one sitemap entry per locale for a locale-independent path, each
 * carrying `alternates` that list every translation plus `x-default`. That is
 * what tells a crawler the /zh and /en pages are translations of each other
 * rather than competing duplicates.
 */
function localeEntries(path: string, options: EntryOptions): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].htmlLang] = `${SITE_URL}/${locale}${path}`;
  }
  languages['x-default'] = `${SITE_URL}/${DEFAULT_LOCALE}${path}`;

  return (LOCALES as readonly Locale[]).map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [airports, countries] = await Promise.all([getAirportRoutes(), getAllCountryCodes()]);
  const staticPages = listPageSlugs(SOURCE_LOCALE);

  return [
    ...localeEntries('', { changeFrequency: 'daily', priority: 1 }),
    ...localeEntries('/airports', { changeFrequency: 'daily', priority: 0.9 }),
    ...localeEntries('/countries', { changeFrequency: 'weekly', priority: 0.8 }),
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
  ];
}
