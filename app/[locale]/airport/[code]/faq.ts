import type { FaqItem } from '@/components/Faq';
import { formatNumber, transitLabel } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { isGateRangePhrase } from '@/lib/i18n/de-data';
import { isKoreanGateRangePhrase } from '@/lib/i18n/ko-data';
import { clauseSeparator, isCjkLocale, listSeparator } from '@/lib/i18n/display';
import type { AirportDetail, Terminal } from '@/lib/types';

/**
 * Complete gate phrase for one terminal, worded by the catalog so each locale
 * uses its own script (登机口 / 登機口 / Gates / 게이트). A gate range that names a
 * concourse ("Concourse A–E", "A–E 廊", "Bereich A", "A 콘코스") is already a
 * phrase and stands on its own; anything else is a code list and needs the word
 * "Gates" in front of it.
 */
function gatePhrase(locale: Locale, t: ReturnType<typeof getMessages>, terminal: Terminal): string {
  const { gateRange, gateCount } = terminal;
  if (!gateRange) return t.units.gates(gateCount);
  if (isCjkLocale(locale)) {
    return gateRange.endsWith('廊') ? gateRange : t.units.gatesLabel(gateRange);
  }
  const isPhrase =
    isGateRangePhrase(gateRange) || (locale === 'ko' && isKoreanGateRangePhrase(gateRange));
  return isPhrase ? gateRange : t.units.gatesLabel(gateRange);
}

/** FAQ assembled from database fields, in the requested locale. */
export function buildFaq(
  locale: Locale,
  airport: AirportDetail,
  distance: string | null,
  tz: string | null
): FaqItem[] {
  const t = getMessages(locale);
  const separator = listSeparator(locale);
  const clause = clauseSeparator(locale);
  // Chinese writes bracketed asides full-width, every Latin-script locale in
  // ordinary parentheses; German matches English here.
  const cjk = isCjkLocale(locale);
  const paren = (value: string) => (cjk ? `（${value}）` : ` (${value})`);

  const terminalList = airport.terminals
    .map(
      (terminal) =>
        `${terminal.name}${paren(`${terminal.code}, ${gatePhrase(locale, t, terminal)}`)}`
    )
    .join(separator);

  const airlineList = airport.terminals
    .filter((terminal) => terminal.airlines)
    .map((terminal) =>
      cjk
        ? `${terminal.name}（${terminal.code}）：${terminal.airlines}`
        : `${terminal.name}: ${terminal.airlines}`
    )
    .join(clause);

  /** The same terminals reduced to their gate information alone. */
  const gateList = airport.terminals
    .map((terminal) => `${terminal.name}${paren(gatePhrase(locale, t, terminal))}`)
    .join(separator);

  const transitSummary = airport.transit
    .map((option) => transitLabel(locale, option))
    .join(separator);

  const accessList = airport.transit
    .map((option) => {
      const label = transitLabel(locale, option);
      return option.description ? `${label}${cjk ? '：' : ': '}${option.description}` : label;
    })
    .join(clause);

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
    // The other half of the same demand: "how many gates does X have" is asked
    // as often as the terminal count, and its answer is the gate split.
    ...(airport.terminals.length > 0 && airport.gateCount > 0
      ? [
          {
            q: t.faq.gateCount(airport.name),
            a: t.faq.gateCountAnswer(
              airport.name,
              airport.iata,
              formatNumber(airport.gateCount, locale),
              gateList
            ),
          },
        ]
      : []),
    // "HKG是哪裡" / "where is DXB airport": the code-explainer question phrased
    // the way people type it. Rendered on every airport page — location data
    // exists everywhere, unlike terminal counts.
    {
      q: t.faq.whereIs(airport.iata),
      a: t.faq.whereIsAnswer(
        airport.iata,
        airport.name,
        airport.nameEn,
        airport.city,
        airport.cityEn ?? '',
        airport.countryName
      ),
    },
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
              airport.facilities.map((f) => f.label).join(separator)
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
