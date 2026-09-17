import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';
import { formatNumber, formatPax } from '@/lib/format';
import type { AirportSummary } from '@/lib/types';

/** Card used on country pages and search results. */
export default function AirportCard({
  locale,
  airport,
}: {
  locale: Locale;
  airport: AirportSummary;
}) {
  const t = getMessages(locale);
  const pax = formatPax(airport.annualPaxM, locale);

  return (
    <Link className="cairport-card" href={localizedPath(locale, `/airport/${airport.iata}`)}>
      <div className="top">
        <span className="iata">{airport.iata}</span>
        <div className="nm">
          <b>{airport.name}</b>
          <span>
            {airport.city} · {airport.nameEn}
          </span>
        </div>
      </div>
      <div className="facts">
        <span className="fact">{t.units.terminals(airport.terminalCount)}</span>
        <span className="fact">{t.units.gates(airport.gateCount)}</span>
        {pax && <span className="fact">{pax}</span>}
      </div>
      <div className="foot">
        <span className="zone">{airport.countryName}</span>
        <span className="map-mini">
          {t.common.terminalMap}
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

/** Country flag grid, used on the homepage and /countries. */
export function CountryGrid({
  locale,
  countries,
}: {
  locale: Locale;
  countries: { code: string; name: string; region: string; flagUrl: string; airportCount: number }[];
}) {
  const t = getMessages(locale);
  return (
    <div className="country-grid">
      {countries.map((country) => (
        <Link
          className="country-card"
          href={localizedPath(locale, `/country/${country.code}`)}
          key={country.code}
        >
          <img className="country-flag" src={country.flagUrl} alt={country.name} loading="lazy" />
          <div className="country-info">
            <b>{country.name}</b>
            <span>{country.region}</span>
          </div>
          <span className="cnt">{t.units.airportsChip(country.airportCount)}</span>
        </Link>
      ))}
    </div>
  );
}

/** Crawlable country chip strip, reused on directory and airport pages. */
export function CountryChips({
  locale,
  countries,
}: {
  locale: Locale;
  countries: { code: string; name: string; airportCount: number }[];
}) {
  return (
    <div className="filterbar">
      <div className="group">
        {countries
          .filter((country) => country.airportCount > 0)
          .map((country) => (
            <Link
              className="chip"
              href={localizedPath(locale, `/country/${country.code}`)}
              key={country.code}
            >
              {country.name}
              <span className="n">{formatNumber(country.airportCount, locale)}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
