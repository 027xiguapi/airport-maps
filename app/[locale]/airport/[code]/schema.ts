import { getMessages } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber, formatPax, formatDistance } from '@/lib/format';
import type { MarkdownDoc } from '@/lib/content';
import { getAirportGeo } from '@/lib/airport-geo';
import {
  absoluteUrl,
  EDITORIAL_NODE_ID,
  ORG_NODE_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_NODE_ID,
} from '@/lib/site';
import type { AirportDetail } from '@/lib/types';
import type { FaqItem } from '@/components/Faq';

/**
 * Machine-readable publication dates for the airport page: dateModified is the
 * latest of the airport record's `updated_at` and the guide's frontmatter
 * date, datePublished the earliest signal we have (guide date, else the record
 * date). Both are `YYYY-MM-DD` strings, which compare lexicographically.
 */
export function publicationDates(airport: AirportDetail, guideUpdated?: string) {
  const candidates = [airport.updatedAt, guideUpdated].filter(Boolean) as string[];
  const modified = candidates.sort().pop();
  const published = guideUpdated ?? airport.updatedAt;
  return { published, modified };
}

/**
 * The airport page's schema.org graph. Each node the page references is
 * defined here so the graph is self-contained: site identity (Organization,
 * WebSite), authorship (Person + the byline's E-E-A-T signals), the page
 * wrapper (WebPage with dates), and the entities themselves (Airport with
 * geo, BreadcrumbList, FAQPage).
 */
export function buildAirportGraph(input: {
  locale: Locale;
  airport: AirportDetail;
  guide: MarkdownDoc | null;
  faqItems: FaqItem[];
}): Record<string, unknown> {
  const { locale, airport, guide, faqItems } = input;
  const t = getMessages(locale);
  const geo = getAirportGeo(airport.iata);
  const { published, modified } = publicationDates(airport, guide?.updated);

  const pax = formatPax(airport.annualPaxM, locale);
  const distance = formatDistance(airport.distanceKm, locale);
  const pageTitle = t.common.latestAirportTitle(
    new Date().getFullYear(),
    airport.name,
    airport.iata
  );
  const pageDescription = t.airport.metaDescription({
    name: airport.name,
    nameEn: airport.nameEn,
    iata: airport.iata,
    city: airport.city,
    country: airport.countryName,
    terminals:
      airport.terminals.length > 0 ? formatNumber(airport.terminals.length, locale) : null,
    gates: airport.gateCount > 0 ? formatNumber(airport.gateCount, locale) : null,
    pax: pax ?? '',
    distance: distance ?? '',
  });
  const pageUrl = absoluteUrl(localizedPath(locale, `/airport/${airport.iata}`));
  const airportNodeId = `${SITE_URL}/#airport-${airport.iata}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Site identity, one exact brand spelling across every machine-
      // readable field (og:site_name and these nodes all use SITE_NAME).
      {
        '@type': 'Organization',
        '@id': ORG_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png') },
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
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        inLanguage: LOCALE_META[locale].htmlLang,
        isPartOf: { '@id': WEBSITE_NODE_ID },
        about: { '@id': airportNodeId },
        mainEntity: { '@id': airportNodeId },
        author: { '@id': EDITORIAL_NODE_ID },
        publisher: { '@id': ORG_NODE_ID },
        datePublished: published,
        dateModified: modified,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'Airport',
        '@id': airportNodeId,
        name: airport.name,
        alternateName: airport.nameEn,
        iataCode: airport.iata,
        description: airport.descriptionMd,
        url: pageUrl,
        inLanguage: LOCALE_META[locale].htmlLang,
        address: {
          '@type': 'PostalAddress',
          addressLocality: airport.city,
          addressCountry: airport.countryCode,
        },
        containedInPlace: { '@type': 'Country', name: airport.countryName },
        ...(geo && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: geo.lat,
            longitude: geo.lng,
          },
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
            name: t.nav.airports,
            item: absoluteUrl(localizedPath(locale, '/airports')),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: airport.countryName,
            item: absoluteUrl(localizedPath(locale, `/country/${airport.countryCode}`)),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: airport.name,
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
