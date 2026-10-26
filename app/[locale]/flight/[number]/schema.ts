import { formatDistance } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import { LOCALE_META, type Locale } from '@/lib/i18n/config';
import { flightPath, type FlightPageData } from '@/lib/flight-page';
import { absoluteUrl, WEBSITE_NODE_ID, webPageRights } from '@/lib/site';
import type { FaqItem } from '@/components/Faq';

/**
 * schema.org graph for a flight page: breadcrumb, WebPage, the Flight entity
 * itself and the FAQ. The source index has no schedule, so the Flight node
 * deliberately omits departureTime/arrivalTime rather than inventing them.
 */
export function buildFlightGraph(input: {
  locale: Locale;
  flight: FlightPageData;
  faqItems: FaqItem[];
}): Record<string, unknown> {
  const { locale, flight, faqItems } = input;
  const t = getMessages(locale);
  const primary = flight.primary;
  const distance = primary.km != null ? (formatDistance(primary.km, locale) ?? '') : '';
  const fromLabel = primary.origin.city
    ? `${primary.origin.city} (${primary.origin.iata})`
    : primary.origin.iata;
  const toLabel = primary.destination.city
    ? `${primary.destination.city} (${primary.destination.iata})`
    : primary.destination.iata;
  const pageUrl = absoluteUrl(flightPath(locale, flight.number));
  const flightId = `${pageUrl}#flight`;

  const airportNode = (place: typeof primary.origin) => ({
    '@type': 'Airport',
    name: place.name,
    iataCode: place.iata,
    ...(place.href ? { url: absoluteUrl(place.href) } : {}),
    ...(place.country ? { address: { '@type': 'PostalAddress', addressCountry: place.countryCode } } : {}),
  });

  const crumbs = [
    { name: t.common.home, item: absoluteUrl('/') },
    { name: t.nav.airports, item: absoluteUrl('/airports') },
    ...(primary.origin.href
      ? [{ name: primary.origin.name, item: absoluteUrl(primary.origin.href) }]
      : []),
    { name: flight.number, item: pageUrl },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.item,
        })),
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: t.flight.metaTitle(flight.number, flight.airline, fromLabel, toLabel),
        description: t.flight.metaDescription(
          flight.number,
          flight.airline,
          fromLabel,
          toLabel,
          distance
        ),
        inLanguage: LOCALE_META[locale].htmlLang,
        isPartOf: { '@id': WEBSITE_NODE_ID },
        ...webPageRights(locale),
        about: { '@id': flightId },
        mainEntity: { '@id': flightId },
      },
      {
        '@type': 'Flight',
        '@id': flightId,
        url: pageUrl,
        flightNumber: flight.number,
        name: `${flight.number} ${flight.airline}`,
        airline: { '@type': 'Airline', name: flight.airline },
        departureAirport: airportNode(primary.origin),
        arrivalAirport: airportNode(primary.destination),
        ...(primary.km != null
          ? {
              flightDistance: {
                '@type': 'Distance',
                value: primary.km,
                unitCode: 'KMT',
              },
            }
          : {}),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}
