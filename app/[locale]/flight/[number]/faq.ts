import type { FaqItem } from '@/components/Faq';
import { formatDistance } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { FlightPageData } from '@/lib/flight-page';

/** FAQ for one flight number, computed from the same data the page renders. */
export function buildFlightPageFaq(locale: Locale, flight: FlightPageData): FaqItem[] {
  const t = getMessages(locale);
  const primary = flight.primary;
  const distance = primary.km != null ? (formatDistance(primary.km, locale) ?? '') : '';
  const fromLabel = primary.origin.city
    ? `${primary.origin.city} (${primary.origin.iata})`
    : primary.origin.iata;
  const toLabel = primary.destination.city
    ? `${primary.destination.city} (${primary.destination.iata})`
    : primary.destination.iata;

  return [
    {
      q: t.flight.faqWhat(flight.number),
      a: t.flight.faqWhatAnswer(
        flight.number,
        flight.airline,
        fromLabel,
        toLabel,
        distance
      ),
    },
    {
      q: t.flight.faqRoute(flight.number),
      a: t.flight.faqRouteAnswer(
        flight.number,
        primary.origin.name,
        primary.origin.iata,
        primary.destination.name,
        primary.destination.iata
      ),
    },
    {
      q: t.flight.faqTimes(flight.number),
      a: t.flight.faqTimesAnswer(flight.number),
    },
  ];
}
