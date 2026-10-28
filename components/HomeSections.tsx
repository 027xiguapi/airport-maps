import Link from 'next/link';
import CommentCount from '@/components/CommentCount';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { commentThreadKey } from '@/lib/comment-labels';
import { formatDate } from '@/lib/format';
import { coverUrl } from '@/lib/map-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AirportSummary } from '@/lib/types';

/**
 * The homepage's list blocks, written as utilities rather than the `.update-*`
 * and `.popular-*` rules that used to live in globals.css. The breakpoints are
 * the ones those rules used (640px, then 480px for the old popular strip), so
 * the layouts collapse where they did. The route showcase lives in
 * components/RouteShowcase.tsx.
 */

const TILE =
  'flex flex-none flex-col overflow-hidden bg-navy-900 text-white ' +
  'transition-[transform,box-shadow] duration-[180ms] [scroll-snap-align:start] ' +
  '[box-shadow:var(--shadow-sm)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lg)]';

/** One airport on the "recently updated" panel, with the date that put it there. */
export type UpdateRow = { airport: AirportSummary; date: string };

/**
 * "Recently updated" panel on the homepage. The date shown is the newest of the
 * airport record and any article about it (see blogAirportDates), so a fresh
 * guide promotes the airport it covers instead of leaving it further down the
 * list. Dates are the ISO strings the directory already stores.
 */
export function UpdateList({
  locale,
  rows,
}: {
  locale: Locale;
  rows: UpdateRow[];
}) {
  return (
    <Card className="overflow-hidden rounded-none [box-shadow:var(--shadow-sm)]">
      {rows.map(({ airport, date }, i) => (
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
            className="h-[22px] w-[34px] flex-none object-cover [box-shadow:var(--flag-ring)] max-[640px]:hidden"
            src={airport.flagUrl}
            alt={airport.countryName}
            loading="lazy"
          />
          <Badge variant="secondary" className="rounded-none text-[11.5px] font-semibold tracking-[0.05em]">
            <time dateTime={date}>{formatDate(date, locale)}</time>
          </Badge>
        </Link>
      ))}
    </Card>
  );
}

/** One country on the "recently updated" strip. */
export type CountryUpdateRow = { code: string; name: string; flagUrl: string; date: string };

/**
 * Countries whose airports (or the articles about them) changed most recently,
 * under the airport list. A country page has no timestamp of its own, so the
 * date is the newest one among its airports — the same signal the list above
 * uses, grouped by country.
 */
export function CountryUpdates({ locale, rows }: { locale: Locale; rows: CountryUpdateRow[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-2.5">
      {rows.map((row) => (
        <Link
          className="flex items-center gap-3 border border-line bg-card px-3.5 py-2.5 transition-[border-color,box-shadow] duration-150 hover:border-sky-500 hover:[box-shadow:var(--shadow-sm)]"
          href={localizedPath(locale, `/country/${row.code}`)}
          key={row.code}
        >
          <img
            className="h-[18px] w-[26px] flex-none object-cover [box-shadow:var(--flag-ring)]"
            src={row.flagUrl}
            alt=""
            loading="lazy"
          />
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink-heading">
            {row.name}
          </span>
          <time className="flex-none text-[12px] text-ink-faint" dateTime={row.date}>
            {formatDate(row.date, locale)}
          </time>
        </Link>
      ))}
    </div>
  );
}

/**
 * One terminal-map tile: the 400px cover in /public/maps sits on its white
 * sheet inside the navy card, name and city in the caption strip under it.
 * The cover is never cropped — it is a map, not a photo — so the white frame
 * keeps whatever aspect ratio the sheet has and the card shows the whole
 * diagram at every size.
 */
function MapTile({
  locale,
  airport,
  large = false,
  commentCount,
}: {
  locale: Locale;
  airport: AirportSummary;
  large?: boolean;
  /** Visible comments on this airport's page; 0 when the thread is empty. */
  commentCount: number;
}) {
  const t = getMessages(locale);

  return (
    <Link
      className={`${TILE} ${large ? 'h-[300px] lg:h-full' : 'h-[168px] lg:h-full'}`}
      href={localizedPath(locale, `/airport/${airport.iata}`)}
    >
      <span
        className={`relative flex min-h-0 flex-1 items-center justify-center bg-white ${
          large ? 'p-3 lg:p-4' : 'p-2'
        }`}
      >
        <img
          className="h-full w-full object-contain"
          src={coverUrl(airport.iata)}
          alt={airport.name}
          loading="lazy"
        />
        <span className="absolute right-2 top-2 inline-flex items-center bg-navy-950/75 px-2 py-[3px] text-[11px] font-semibold text-white backdrop-blur-[2px]">
          <CommentCount count={commentCount} labels={t.comments} />
        </span>
      </span>
      <span
        className={`flex min-w-0 flex-none flex-col ${
          large ? 'px-4 pb-4 pt-3 lg:px-5 lg:pb-5 lg:pt-4' : 'px-3.5 pb-3 pt-2.5'
        }`}
      >
        <span className="font-display text-[12px] font-semibold tracking-[0.18em] text-amber">
          {airport.iata}
        </span>
        <span
          className={`mt-1 line-clamp-2 font-bold leading-snug text-white ${
            large ? 'text-[16px] lg:text-[19px]' : 'text-[13.5px]'
          }`}
        >
          {airport.name}
        </span>
        <span
          className={`mt-1 truncate text-white/60 ${
            large ? 'text-[12.5px]' : 'text-[11.5px] max-sm:hidden'
          }`}
        >
          {airport.city} · {airport.countryName}
        </span>
      </span>
    </Link>
  );
}

/**
 * Homepage popular block: one large terminal-map cover on the left and the
 * next four as a 2×2 of small tiles on the right. The random pick happens in
 * the page — this list is already shuffled and five long.
 */
export function PopularMaps({
  locale,
  airports,
  commentCounts,
}: {
  locale: Locale;
  airports: AirportSummary[];
  /** Keyed by commentThreadKey('airport', iata); see lib/comments.ts. */
  commentCounts?: Record<string, number>;
}) {
  const [lead, ...rest] = airports;
  if (!lead) return null;

  return (
    <div className="grid gap-4 lg:h-[440px] lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1">
      <MapTile
        locale={locale}
        airport={lead}
        large
        commentCount={commentCounts?.[commentThreadKey('airport', lead.iata)] ?? 0}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-rows-2 lg:gap-4">
        {rest.slice(0, 4).map((airport) => (
          <MapTile
            key={airport.iata}
            locale={locale}
            airport={airport}
            commentCount={commentCounts?.[commentThreadKey('airport', airport.iata)] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
