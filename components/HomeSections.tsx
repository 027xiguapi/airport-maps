import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AirportSummary } from '@/lib/types';

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
    <Card className="overflow-hidden [box-shadow:var(--shadow-sm)]">
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
          <Badge variant="secondary" className="text-[11.5px] font-semibold tracking-[0.05em]">
            {t.common.lastUpdated}
          </Badge>
        </Link>
      ))}
    </Card>
  );
}

/**
 * Homepage popular strip: one horizontally scrollable row of terminal-map
 * cover tiles (the 400px covers in /public/maps) with the airport name under
 * each. The random pick happens in the page — this list is already shuffled.
 */
export function PopularCities({ locale, airports }: { locale: Locale; airports: AirportSummary[] }) {
  return (
    <div className="popular-strip">
      {airports.map((airport) => (
        <Link
          className="popular-tile"
          href={localizedPath(locale, `/airport/${airport.iata}`)}
          key={airport.iata}
        >
          <span className="pic">
            <img
              src={`/maps/${airport.iata}.png`}
              alt={airport.name}
              loading="lazy"
            />
          </span>
          <span className="body">
            <span className="iata">{airport.iata}</span>
            <span className="name">{airport.name}</span>
            <span className="city">
              {airport.city} · {airport.countryName}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
