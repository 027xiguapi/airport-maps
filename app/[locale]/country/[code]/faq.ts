import type { FaqItem } from '@/components/Faq';
import { formatNumber, formatPax } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportSummary, Country } from '@/lib/types';

/**
 * Country-page FAQ, assembled from the same database fields the page renders.
 * `airports` arrives ordered by annual passengers (see getAirportsByCountry),
 * so the first entry with a figure is the busiest.
 *
 * Answers are plain strings, not JSX: the FAQPage JSON-LD reuses them verbatim
 * as the `acceptedAnswer` text.
 */
export function buildCountryFaq(
  locale: Locale,
  country: Country,
  airports: AirportSummary[]
): FaqItem[] {
  if (airports.length === 0) return [];

  const t = getMessages(locale);
  const listSeparator = locale === 'en' ? ', ' : '、';
  const airportsCount = formatNumber(airports.length, locale);
  const terminals = airports.reduce((sum, a) => sum + a.terminalCount, 0);
  const gates = airports.reduce((sum, a) => sum + a.gateCount, 0);
  const busiest = airports.find((a) => a.annualPaxM !== null) ?? null;

  // "Tokyo Haneda (HND)" / "东京羽田（HND）" — the same shape the airport page uses.
  const airportList = airports
    .map((a) =>
      locale === 'en' ? `${a.name} (${a.iata})` : `${a.name}（${a.iata}）`
    )
    .join(listSeparator);

  const terminalList = airports
    .map((a) =>
      locale === 'en'
        ? `${a.name} (${a.iata}, ${a.terminalCount} terminals, ${a.gateCount} gates)`
        : `${a.name}（${a.iata}，${a.terminalCount} 座航站楼、${a.gateCount} 个登机口）`
    )
    .join(listSeparator);

  // Distinct cities, in the order the airports appear.
  const cities = [...new Set(airports.map((a) => a.city))].join(listSeparator);

  return [
    {
      q: t.country.faq.airportCount(country.name),
      a: t.country.faq.airportCountAnswer(
        country.name,
        t.units.airports(airports.length),
        airportList
      ),
    },
    ...(busiest
      ? [
          {
            q: t.country.faq.busiest(country.name),
            a: t.country.faq.busiestAnswer(
              busiest.name,
              busiest.iata,
              formatPax(busiest.annualPaxM, locale) ?? ''
            ),
          },
        ]
      : []),
    {
      q: t.country.faq.terminals(country.name),
      a: t.country.faq.terminalsAnswer(
        country.name,
        t.units.terminals(terminals),
        t.units.gates(gates),
        terminalList
      ),
    },
    {
      q: t.country.faq.cities(country.name),
      a: t.country.faq.citiesAnswer(country.name, cities),
    },
    {
      q: t.country.faq.maps(country.name),
      a: t.country.faq.mapsAnswer(country.name, airportsCount),
    },
  ];
}
