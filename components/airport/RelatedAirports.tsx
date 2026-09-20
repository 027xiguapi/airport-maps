import Link from 'next/link';
import { ArrowIcon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { AirportSummary } from '@/lib/types';

/** Cross-links to other airports in the same country, plus the country page. */
export default function RelatedAirports({
  locale,
  countryName,
  countryCode,
  related,
}: {
  locale: Locale;
  countryName: string;
  countryCode: string;
  related: AirportSummary[];
}) {
  const t = getMessages(locale);
  if (related.length === 0) return null;

  return (
    <section className="related">
      <h3>
        {t.airport.relatedTitle(countryName)}{' '}
        <span className="en">{t.airport.relatedEn(countryName)}</span>
      </h3>
      <div className="related-grid">
        {related.map((other) => (
          <Link
            className="related-card"
            href={localizedPath(locale, `/airport/${other.iata}`)}
            key={other.iata}
          >
            <span className="iata">{other.iata}</span>
            <div className="nm">
              <b>{other.name}</b>
              <span>{other.city}</span>
            </div>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 18 }}>
        <Link href={localizedPath(locale, `/country/${countryCode}`)} className="btn">
          {t.airport.relatedAll(countryName)}
          <ArrowIcon />
        </Link>
      </p>
    </section>
  );
}
