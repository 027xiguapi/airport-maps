import Link from 'next/link';
import type { FlightPlace } from '@/lib/flights';

/**
 * Departure/arrival airport card on the flight page. Airports the directory
 * covers link to their airport page; the rest stay plain text.
 */
export default function FlightAirportCard({
  label,
  place,
  pageLabel,
}: {
  label: string;
  place: FlightPlace;
  pageLabel: string;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-5 [box-shadow:var(--shadow-sm)]">
      <div className="font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
      <div className="mt-2 flex items-start gap-3">
        <span className="flex-none rounded-[8px] bg-navy-800 px-2.5 py-1 font-display text-[14px] font-semibold text-white tabular-nums">
          {place.iata}
        </span>
        <h3 className="m-0 text-[17px] font-bold leading-[1.3] text-navy-800">
          {place.href ? (
            <Link className="text-inherit no-underline hover:text-sky-600" href={place.href}>
              {place.name}
            </Link>
          ) : (
            place.name
          )}
        </h3>
      </div>
      <p className="mt-2 text-[13px] text-ink-soft">
        {place.city && place.country
          ? `${place.city} · ${place.country}`
          : place.city || place.country || '—'}
      </p>
      {place.href && (
        <Link
          className="mt-2 inline-block font-display text-[12.5px] font-semibold text-sky-600 no-underline hover:underline"
          href={place.href}
        >
          {pageLabel} →
        </Link>
      )}
    </div>
  );
}
