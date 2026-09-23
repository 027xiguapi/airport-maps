import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';
import { formatNumber, formatPax } from '@/lib/format';
import { mapImageUrl } from '@/lib/map-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  const cover = mapImageUrl(airport.iata);

  return (
    <Card
      asChild
      className="group cursor-pointer gap-1 overflow-hidden p-[22px] transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-[3px] hover:border-sky-400 hover:[box-shadow:var(--shadow-md)]"
    >
      <Link href={localizedPath(locale, `/airport/${airport.iata}`)}>
        {/* Cover bleeds out over the card's own padding on three sides, and
            falls back to a navy plate carrying the IATA code when there is none. */}
        <span
          className={`-mx-[22px] -mt-[22px] mb-2.5 flex aspect-[4/3] flex-none items-center justify-center overflow-hidden rounded-t-[13px] ${
            cover ? 'bg-navy-900' : 'bg-[linear-gradient(135deg,var(--navy-700),var(--navy-900))]'
          }`}
        >
          {cover ? (
            <img
              src={cover}
              alt={`${airport.iata} ${airport.nameEn}`}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover"
            />
          ) : (
            <span
              className="font-display text-[36px] font-semibold tracking-[0.08em] text-white/[0.14]"
              aria-hidden="true"
            >
              {airport.iata}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3.5">
          <span className="font-display text-[30px] font-semibold leading-none text-navy-800 dark:text-[#C4DCF0]">
            {airport.iata}
          </span>
          <div className="min-w-0">
            <b className="block text-[15.5px] font-bold">{airport.name}</b>
            <span className="text-[12.5px] text-ink-soft">
              {airport.city} · {airport.nameEn}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Directory batch airports have no compiled terminal data yet, so
              the two count badges stay hidden instead of reading "0". */}
          {(airport.terminalCount > 0 || airport.gateCount > 0) && (
            <>
              <Badge variant="outline">{t.units.terminals(airport.terminalCount)}</Badge>
              <Badge variant="outline">{t.units.gates(airport.gateCount)}</Badge>
            </>
          )}
          {pax && <Badge variant="outline">{pax}</Badge>}
        </div>
        <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-border pt-3">
          <span className="font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint">
            {airport.countryName}
          </span>
          <span className="inline-flex items-center gap-[5px] text-[13px] font-semibold text-sky-600 [&>svg]:transition-transform [&>svg]:duration-150 group-hover:[&>svg]:translate-x-[3px]">
            {t.common.terminalMap}
            <ArrowIcon />
          </span>
        </div>
      </Link>
    </Card>
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
    // One column below 560px: two would leave a card ~126px, too narrow for the
    // flag, the name and the count chip once the labels are English. (The 480px
    // two-column rule this replaced was never the winner — the 560px rule sat
    // later in the sheet and applied at every width below it.)
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-3.5 max-[560px]:grid-cols-1 max-[480px]:gap-2.5">
      {countries.map((country) => (
        <Card
          asChild
          key={country.code}
          className="min-w-0 cursor-pointer flex-row items-center gap-3.5 p-[18px] transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-[3px] hover:border-sky-400 hover:[box-shadow:var(--shadow-md)]"
        >
          <Link href={localizedPath(locale, `/country/${country.code}`)}>
            <img
              className="h-[34px] w-[52px] flex-none rounded-[6px] object-cover shadow-[0_0_0_1px_rgba(10,42,67,0.10),var(--shadow-sm)]"
              src={country.flagUrl}
              alt={country.name}
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[15.5px] font-bold text-navy-900 dark:text-[#E9F2FA]">
                {country.name}
              </b>
              <span className="block truncate text-[12.5px] text-ink-soft">{country.region}</span>
            </div>
            {/* `.cnt` is a flex item and the name is unbounded, so both must be allowed to
                shrink and truncate rather than set the row's min-content width. */}
            <Badge
              variant="secondary"
              className="min-w-0 flex-[0_1_auto] truncate rounded-2xl font-display text-[15px] font-semibold"
            >
              {t.units.airportsChip(country.airportCount)}
            </Badge>
          </Link>
        </Card>
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
