import type { FaqItem } from '@/components/Faq';
import { formatNumber } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { routeStats } from '@/lib/routes';
import type { AirportRouteMap } from '@/lib/types';

/**
 * FAQ for the standalone route page, assembled from the route data itself so
 * every answer is a real figure rather than marketing copy. Callers own the
 * FAQPage JSON-LD.
 */
export function buildRouteFaq(
  locale: Locale,
  airportName: string,
  iata: string,
  map: AirportRouteMap
): FaqItem[] {
  const t = getMessages(locale);
  const stats = routeStats(map);
  const listSeparator = locale === 'en' ? ', ' : '、';
  // Chinese writes the figure in full-width brackets, English in parentheses.
  const withCount = (name: string, count: number) =>
    locale === 'en' ? `${name} (${count})` : `${name}（${count}）`;

  const carrierList = stats.topCarriers
    .map((carrier) => withCount(carrier.name, carrier.destinations))
    .join(listSeparator);
  const busiestList = stats.busiest
    .slice(0, 5)
    .map((destination) => `${destination.city} (${destination.iata})`)
    .join(listSeparator);
  const farthest = stats.farthest;

  return [
    {
      q: t.route.faqCountQ(airportName),
      a: t.route.faqCountA(
        airportName,
        iata,
        formatNumber(stats.destinationCount, locale),
        formatNumber(stats.countryCount, locale)
      ),
    },
    {
      q: t.route.faqAirlinesQ(airportName),
      a: t.route.faqAirlinesA(formatNumber(stats.airlineCount, locale), carrierList),
    },
    ...(farthest
      ? [
          {
            q: t.route.faqFarthestQ(airportName),
            a: t.route.faqFarthestA(
              farthest.city,
              farthest.country,
              `(${farthest.iata})`,
              formatNumber(farthest.km, locale)
            ),
          },
        ]
      : []),
    ...(stats.busiest.length > 0
      ? [
          {
            q: t.route.faqBusiestQ(),
            a: t.route.faqBusiestA(formatNumber(stats.busiest.length, locale), busiestList),
          },
        ]
      : []),
    {
      q: t.route.faqSourceQ(),
      a: t.route.faqSourceA(map.dataDate, map.source.name, map.source.license),
    },
  ];
}
