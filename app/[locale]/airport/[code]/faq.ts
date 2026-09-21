import type { FaqItem } from '@/components/Faq';
import { formatNumber, transitLabel } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportDetail } from '@/lib/types';

/** FAQ assembled from database fields, in the requested locale. */
export function buildFaq(
  locale: Locale,
  airport: AirportDetail,
  distance: string | null,
  tz: string | null
): FaqItem[] {
  const t = getMessages(locale);
  const listSeparator = locale === 'en' ? ', ' : '、';
  const clauseSeparator = locale === 'en' ? '; ' : '；';

  const terminalList = airport.terminals
    .map((terminal) =>
      locale === 'en'
        ? `${terminal.name} (${terminal.code}, ${
            terminal.gateRange ? `gates ${terminal.gateRange}` : `${terminal.gateCount} gates`
          })`
        : `${terminal.name}（${terminal.code}，登机口 ${
            terminal.gateRange ?? `${terminal.gateCount} 个`
          }）`
    )
    .join(listSeparator);

  const airlineList = airport.terminals
    .filter((terminal) => terminal.airlines)
    .map((terminal) =>
      locale === 'en'
        ? `${terminal.name}: ${terminal.airlines}`
        : `${terminal.name}（${terminal.code}）：${terminal.airlines}`
    )
    .join(clauseSeparator);

  const transitSummary = airport.transit
    .map((option) => transitLabel(locale, option))
    .join(listSeparator);

  const accessList = airport.transit
    .map((option) => {
      const label = transitLabel(locale, option);
      return option.description ? `${label}${locale === 'en' ? ': ' : '：'}${option.description}` : label;
    })
    .join(clauseSeparator);

  return [
    // Directory batch airports have no compiled terminal data, so the count
    // question would answer "0" — drop it until data exists.
    ...(airport.terminals.length > 0
      ? [
          {
            q: t.faq.terminalCount(airport.name),
            a: t.faq.terminalCountAnswer(
              airport.name,
              airport.iata,
              formatNumber(airport.terminals.length, locale),
              formatNumber(airport.gateCount, locale),
              terminalList
            ),
          },
        ]
      : []),
    ...(airlineList
      ? [
          {
            q: t.faq.airlines(airport.name),
            a: t.faq.airlinesAnswer(airport.name, airlineList),
          },
        ]
      : []),
    ...(distance
      ? [
          {
            q: t.faq.distance(airport.name, airport.city),
            a: t.faq.distanceAnswer(airport.name, airport.city, distance, transitSummary),
          },
        ]
      : []),
    ...(accessList
      ? [
          {
            q: t.faq.access(airport.name, airport.city),
            a: t.faq.accessAnswer(accessList),
          },
        ]
      : []),
    ...(airport.facilities.length > 0
      ? [
          {
            q: t.faq.facilities(airport.name),
            a: t.faq.facilitiesAnswer(
              airport.name,
              airport.facilities.map((f) => f.label).join(listSeparator)
            ),
          },
        ]
      : []),
    {
      q: t.faq.location(airport.name),
      a: t.faq.locationAnswer(
        airport.name,
        airport.nameEn,
        airport.iata,
        airport.city,
        airport.cityEn ?? '',
        airport.countryName
      ),
    },
    ...(tz
      ? [
          {
            q: t.faq.timezone(airport.name),
            a: t.faq.timezoneAnswer(airport.name, airport.iata, tz),
          },
        ]
      : []),
  ];
}
