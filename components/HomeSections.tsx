import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';
import { PlaneIcon } from '@/lib/icons';
import { routeImageUrl } from '@/lib/route-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AirportSummary } from '@/lib/types';

/**
 * The homepage's three list blocks, written as utilities rather than the
 * `.update-*`, `.popular-*` and `.route-*` rules that used to live in
 * globals.css. The breakpoints are the ones those rules used (640px, then 480px
 * for the popular strip), so the layouts collapse exactly where they did.
 */

/**
 * Both strips are the same scroller: a row that snaps and scrolls sideways
 * instead of wrapping, so the page stays one column wide at every size.
 */
const STRIP = 'flex overflow-x-auto pb-2 [scroll-snap-type:x_proximity]';

/** The tile chrome shared by both strips: a navy card that lifts on hover. */
const TILE =
  'flex flex-none flex-col overflow-hidden rounded-[14px] bg-navy-900 text-white ' +
  'transition-[transform,box-shadow] duration-[180ms] [scroll-snap-align:start] ' +
  '[box-shadow:var(--shadow-sm)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lg)]';

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
          className="flex cursor-pointer items-center gap-4 border-b border-b-line px-[22px] py-[15px] transition-[background-color] duration-[130ms] last:border-b-0 hover:bg-sky-100 max-[640px]:gap-3 max-[640px]:px-4 max-[640px]:py-[13px]"
          href={localizedPath(locale, `/airport/${airport.iata}`)}
          key={airport.iata}
        >
          <span className="w-[30px] flex-none font-display text-[14px] font-medium text-ink-faint max-[640px]:w-[22px]">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="w-[78px] flex-none font-display text-[20px] font-semibold tracking-[0.04em] text-ink-heading-soft max-[640px]:w-[58px] max-[640px]:text-[18px]">
            {airport.iata}
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[15px] font-semibold">{airport.name}</b>
            <span className="text-[12.5px] text-ink-soft">
              {airport.city} · {airport.countryName}
            </span>
          </div>
          {/* The flag is the first thing to go on a phone: the row is already
              carrying an IATA code and the city · country line. */}
          <img
            className="h-[22px] w-[34px] flex-none rounded-[4px] object-cover [box-shadow:var(--flag-ring)] max-[640px]:hidden"
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
    <div className={`${STRIP} gap-4`}>
      {airports.map((airport) => (
        <Link
          className={`${TILE} w-[230px] max-[480px]:w-[188px]`}
          href={localizedPath(locale, `/airport/${airport.iata}`)}
          key={airport.iata}
        >
          <span className="flex h-[150px] flex-none items-center justify-center bg-white p-2 max-[480px]:h-[124px]">
            <img
              className="h-full w-full object-contain"
              src={`/maps/${airport.iata}.png`}
              alt={airport.name}
              loading="lazy"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col p-3.5">
            <span className="font-display text-[12.5px] font-semibold tracking-[0.18em] text-amber">
              {airport.iata}
            </span>
            <span className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug">
              {airport.name}
            </span>
            <span className="mt-auto truncate pt-1.5 text-[12px] text-white/60">
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
    <div className={`${STRIP} gap-3.5`}>
      {airports.map((airport) => {
        const img = routeImageUrl(airport.iata);
        return (
          <Link
            className={`${TILE} w-[212px]`}
            href={localizedPath(locale, `/route/${airport.iata}`)}
            key={airport.iata}
          >
            {img && (
              <span className="block flex-none bg-navy-950">
                <img
                  className="block h-auto w-full"
                  src={img}
                  alt={airport.name}
                  loading="lazy"
                  width={690}
                  height={450}
                />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col px-[18px] pb-4 pt-3.5">
              {/* Icon sizing rides on the parent: the icons in lib/icons.tsx take
                  no props, so a className on the glyph itself would be dropped. */}
              <span className="flex items-center gap-2 font-display text-[19px] font-semibold tracking-[0.05em] text-white/92 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:flex-none [&>svg]:text-amber">
                <PlaneIcon aria-hidden="true" />
                {airport.iata}
              </span>
              <span className="mt-1 truncate text-[13.5px] font-semibold text-white/80">
                {airport.city}
              </span>
              <span className="mt-auto truncate pt-2 text-[12px] text-white/55">
                {t.route.cardMeta(formatNumber(airport.destinationCount, locale))}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
