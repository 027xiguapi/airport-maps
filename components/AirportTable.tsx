import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';
import type { AirportSummary } from '@/lib/types';

/**
 * The directory table shared by the homepage and /airports. Column order must
 * match the grid template in globals.css (`.airport-row`).
 */
export default function AirportTable({
  locale,
  airports,
  showUpdated = false,
}: {
  locale: Locale;
  airports: AirportSummary[];
  showUpdated?: boolean;
}) {
  const t = getMessages(locale);

  if (airports.length === 0) {
    return (
      <div className="airport-table">
        <div className="empty-state">
          <div className="big">0</div>
          <p>{t.table.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="airport-table">
      <div className="table-head">
        <span>{t.table.iata}</span>
        <span>{t.table.airport}</span>
        <span>{t.table.city}</span>
        <span>{t.table.country}</span>
        <span>{t.table.size}</span>
        <span style={{ textAlign: 'right' }}>
          {showUpdated ? t.common.lastUpdated : t.table.map}
        </span>
      </div>
      {airports.map((airport) => (
        <Link
          className="airport-row"
          href={localizedPath(locale, `/airport/${airport.iata}`)}
          key={airport.iata}
        >
          <span className="iata">{airport.iata}</span>
          <div className="nm">
            <b>{airport.name}</b>
            <span>
              {airport.iata} · {airport.nameEn}
            </span>
          </div>
          <div className="meta">{airport.city}</div>
          <img className="flag" src={airport.flagUrl} alt={airport.countryName} loading="lazy" />
          {/* Directory batch airports have no compiled terminal count yet. */}
          <div className="meta">{airport.terminalCount > 0 ? t.units.terminals(airport.terminalCount) : '—'}</div>
          {showUpdated ? (
            <span className="btn">
              {airport.updatedAt}
              <ArrowIcon />
            </span>
          ) : (
            <span className="btn">
              {t.common.terminalMap}
              <ArrowIcon />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
