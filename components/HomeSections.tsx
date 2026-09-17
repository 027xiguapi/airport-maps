import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';
import { formatPax } from '@/lib/format';
import type { AirportSummary, CityHub } from '@/lib/types';

/** "Recently updated" panel on the homepage. */
export function UpdateList({
  locale,
  airports,
}: {
  locale: Locale;
  airports: AirportSummary[];
}) {
  const t = getMessages(locale);
  return (
    <div className="update-list">
      {airports.map((airport, i) => (
        <Link
          className="update-row"
          href={localizedPath(locale, `/airport/${airport.iata}`)}
          key={airport.iata}
        >
          <span className="update-no">{String(i + 1).padStart(2, '0')}</span>
          <span className="update-iata">{airport.iata}</span>
          <div className="update-name">
            <b>{airport.name}</b>
            <span>
              {airport.city} · {airport.countryName}
            </span>
          </div>
          <img
            className="update-flag"
            src={airport.flagUrl}
            alt={airport.countryName}
            loading="lazy"
          />
          <span className="update-tag">{t.common.lastUpdated}</span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Homepage "busiest hubs" cards. The order comes from the query, which ranks
 * airport cities by total annual passenger volume.
 */
export function PopularCities({ locale, cities }: { locale: Locale; cities: CityHub[] }) {
  const t = getMessages(locale);
  return (
    <div className="popular-grid">
      {cities.map((city, i) => (
        <Link
          className="popular-card"
          href={localizedPath(locale, `/airport/${city.leadIata}`)}
          key={`${city.leadIata}-${i}`}
        >
          <span className="popular-rank">{String(i + 1).padStart(2, '0')}</span>
          <div className="iata">{city.leadIata}</div>
          <div className="city">{city.city}</div>
          <div className="airport">{city.leadName}</div>
          <div className="city-airports">
            <span className="lead">{formatPax(city.totalPaxM, locale)}</span>
            <span>{t.units.airports(city.airportCount)}</span>
          </div>
          <span className="go">
            {t.common.viewMap}
            <ArrowIcon />
          </span>
        </Link>
      ))}
    </div>
  );
}
