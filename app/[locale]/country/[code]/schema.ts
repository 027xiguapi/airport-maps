import { getMessages } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import {
  absoluteUrl,
  EDITORIAL_NODE_ID,
  ORG_NODE_ID,
  SITE_IMAGE,
  SITE_NAME,
  SITE_URL,
  WEBSITE_NODE_ID,
} from '@/lib/site';
import { coverImageUrl } from '@/lib/map-images';
import type { MarkdownDoc } from '@/lib/content';
import type { AirportSummary, Country } from '@/lib/types';
import type { FaqItem } from '@/components/Faq';

/**
 * The country page's schema.org graph. Same shape as the airport page's: the
 * site identity nodes, the page wrapper (WebPage, dated from the intro article
 * when one exists) and the entities the page describes — the country, its
 * airports as an ItemList, the breadcrumb trail, and the FAQ.
 */
export function buildCountryGraph(input: {
  locale: Locale;
  country: Country;
  airports: AirportSummary[];
  intro: MarkdownDoc | null;
  faqItems: FaqItem[];
}): Record<string, unknown> {
  const { locale, country, airports, intro, faqItems } = input;
  const t = getMessages(locale);
  const title = t.country.title(country.name);
  const description = t.country.description(
    country.name,
    country.nameEn,
    country.region,
    airports.length
  );
  const pageUrl = absoluteUrl(localizedPath(locale, `/country/${country.code}`));
  const countryNodeId = `${SITE_URL}/#country-${country.code}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png') },
        image: SITE_IMAGE,
      },
      {
        '@type': 'Person',
        '@id': EDITORIAL_NODE_ID,
        name: t.editorial.authorName,
        description: t.editorial.sourcesNote,
        url: absoluteUrl(localizedPath(locale, '/about')),
        worksFor: { '@id': ORG_NODE_ID },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        publisher: { '@id': ORG_NODE_ID },
        image: SITE_IMAGE.url,
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description,
        inLanguage: LOCALE_META[locale].htmlLang,
        isPartOf: { '@id': WEBSITE_NODE_ID },
        about: { '@id': countryNodeId },
        mainEntity: { '@id': countryNodeId },
        author: { '@id': EDITORIAL_NODE_ID },
        publisher: { '@id': ORG_NODE_ID },
        // No photo of a country exists, so the page wrapper carries the site photo.
        image: SITE_IMAGE.url,
        primaryImageOfPage: SITE_IMAGE,
        ...(intro?.updated && { dateModified: intro.updated }),
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'Country',
        '@id': countryNodeId,
        name: country.name,
        alternateName: country.nameEn,
        url: pageUrl,
        inLanguage: LOCALE_META[locale].htmlLang,
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#airports`,
        name: title,
        inLanguage: LOCALE_META[locale].htmlLang,
        numberOfItems: airports.length,
        itemListElement: airports.map((airport, i) => {
          // Airports with a cover carry it on their list entry; the rest say
          // nothing rather than pointing at an image that is not there.
          const cover = coverImageUrl(airport.iata);
          return {
            '@type': 'ListItem',
            position: i + 1,
            name: `${airport.name} (${airport.iata})`,
            url: absoluteUrl(localizedPath(locale, `/airport/${airport.iata}`)),
            ...(cover && { image: absoluteUrl(cover) }),
          };
        }),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t.common.home,
            item: absoluteUrl(localizedPath(locale, '/')),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t.nav.countries,
            item: absoluteUrl(localizedPath(locale, '/countries')),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: country.name,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        inLanguage: LOCALE_META[locale].htmlLang,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}
