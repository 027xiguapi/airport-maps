import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';
import { PlaneIcon } from '@/lib/icons';
import { routeImageUrl } from '@/lib/route-images';
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

/** One airport on the homepage route strip: the summary plus its destination count. */
export type RouteNavItem = AirportSummary & { destinationCount: number };

/**
 * Homepage route-map strip: the airports with the widest direct networks, each
 * tile showing its static route-map render (public/route, see
 * scripts/generate-route-images.mjs) above the summary and linking to the
 * standalone route page (/route/<IATA>). The ranking (by destination count,
 * then IATA for a stable order) happens in the page, which already holds every
 * airport summary. Airports without a render yet fall back to the text-only
 * tile.
 */
export function RouteNav({ locale, airports }: { locale: Locale; airports: RouteNavItem[] }) {
  const t = getMessages(locale);

  return (
    <div className="route-strip">
      {airports.map((airport) => {
        const img = routeImageUrl(airport.iata);
        return (
          <Link
            className="route-tile"
            href={localizedPath(locale, `/route/${airport.iata}`)}
            key={airport.iata}
          >
            {img && (
              <span className="pic">
                <img src={img} alt={airport.name} loading="lazy" width={690} height={450} />
              </span>
            )}
            <span className="body">
              <span className="code">
                <PlaneIcon width={16} height={16} aria-hidden="true" />
                {airport.iata}
              </span>
              <span className="city">{airport.city}</span>
              <span className="cnt">
                {t.route.cardMeta(formatNumber(airport.destinationCount, locale))}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}