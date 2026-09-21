import Markdown from '@/components/Markdown';
import { formatDate, formatPax } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { MarkdownDoc } from '@/lib/content';
import type { AirportSummary, Country } from '@/lib/types';

/**
 * Airport overview: the scale of the country's airports, its largest hub and
 * the cities they serve. The opening paragraph is assembled from database
 * fields so the section renders for every country; the optional article from
 * content/<locale>/countries/<CC>.md is appended to it in the same prose
 * column, which keeps paragraph spacing and the `.md` typography uniform.
 *
 * `airports` arrives ordered by annual passengers (see getAirportsByCountry),
 * so the first entry with a figure is the busiest.
 */
export default function CountryIntro({
  locale,
  country,
  airports,
  intro,
}: {
  locale: Locale;
  country: Country;
  airports: AirportSummary[];
  intro: MarkdownDoc | null;
}) {
  const t = getMessages(locale);
  const terminals = airports.reduce((sum, a) => sum + a.terminalCount, 0);
  const gates = airports.reduce((sum, a) => sum + a.gateCount, 0);
  const busiest = airports.find((a) => a.annualPaxM !== null) ?? null;
  // Distinct cities, in the order the airports appear.
  const cities = [...new Set(airports.map((a) => a.city))];

  const summary = t.country.introBody({
    name: country.name,
    // Suppressed when the two coincide (Japan / 日本), so the sentence reads
    // "Japan lies in East Asia" rather than "Japan (Japan) lies in …".
    nameEn: country.nameEn === country.name ? '' : country.nameEn,
    region: country.region,
    airports: t.units.airports(airports.length),
    terminals: t.units.terminals(terminals),
    gates: t.units.gates(gates),
    cities: cities.join(locale === 'en' ? ', ' : '、'),
    busiest: busiest?.name ?? null,
    busiestIata: busiest?.iata ?? '',
    busiestPax: busiest ? (formatPax(busiest.annualPaxM, locale) ?? '') : '',
    mapsNote: t.country.introMapsNote,
  });

  return (
    <section id="airport-intro">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.country.introKicker}</div>
          <h2 className="section-title">
            {intro?.title ?? t.country.introTitle(country.name)}
            <span className="en">{t.country.introEn}</span>
          </h2>
          <p className="sec-sub">{t.country.introSub}</p>
        </div>
        {intro?.updated && (
          <span className="guide-meta">{t.common.updatedOn(formatDate(intro.updated, locale))}</span>
        )}
      </div>
      <div className="md-wrap">
        <Markdown>{intro ? `${summary}\n\n${intro.body}` : summary}</Markdown>
      </div>
    </section>
  );
}
