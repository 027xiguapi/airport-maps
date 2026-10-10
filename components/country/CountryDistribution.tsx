import Link from 'next/link';
import { formatNumber } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { countryMapUrl } from '@/lib/map-images';
import type { CountryAirportList } from '@/lib/country-airports';
import type { Country } from '@/lib/types';

/**
 * "Airport distribution" block on the country page: the generated map of every
 * scheduled airport in the country, plus the full national list. The queries it
 * answers ("X 有多少座机场", "X airport distribution", "X 機場分布圖") ask for
 * the whole country, while the card grid above only shows the airports this
 * site has compiled — the map and table supply the difference and link back to
 * the detail pages that exist.
 */
export default function CountryDistribution({
  locale,
  country,
  national,
  covered,
}: {
  locale: Locale;
  country: Country;
  national: CountryAirportList;
  /** IATA codes with a detail page on this site — rendered as links. */
  covered: Set<string>;
}) {
  const t = getMessages(locale);
  const map = countryMapUrl(country.code);
  const total = formatNumber(national.total, locale);
  const coveredCount = formatNumber(
    national.airports.filter((a) => covered.has(a.iata)).length,
    locale
  );

  return (
    <section className="ap-extra" id="airport-distribution">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.country.distribution.kicker}</div>
          <h2 className="section-title">
            {t.country.distribution.title(country.name)}
            <span className="en">{t.country.distribution.en}</span>
          </h2>
          <p className="sec-sub">{t.country.distribution.sub(coveredCount, total)}</p>
        </div>
      </div>

      {map && (
        <figure className="cdist-map">
          <img
            src={map}
            alt={t.country.distribution.mapAlt(country.name, total)}
            loading="lazy"
          />
        </figure>
      )}

      <div className="cdist-scroll">
        <table className="cdist-table">
          <thead>
            <tr>
              <th>IATA</th>
              <th>{t.country.distribution.colAirport}</th>
              <th>{t.country.distribution.colCity}</th>
              <th>{t.country.distribution.colType}</th>
            </tr>
          </thead>
          <tbody>
            {national.airports.map((airport) => {
              const hasPage = covered.has(airport.iata);
              return (
                <tr key={airport.iata} className={hasPage ? 'is-site' : undefined}>
                  <td className="iata">{airport.iata}</td>
                  <td>
                    {hasPage ? (
                      <Link href={localizedPath(locale, `/airport/${airport.iata}`)}>
                        {airport.name}
                      </Link>
                    ) : (
                      airport.name
                    )}
                    {hasPage && (
                      <span className="cdist-tag">{t.country.distribution.siteTag}</span>
                    )}
                  </td>
                  <td>{airport.city || '—'}</td>
                  <td>{t.country.distribution.types[airport.type]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
