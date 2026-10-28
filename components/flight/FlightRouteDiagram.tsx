import { PlaneIcon } from '@/lib/icons';
import type { FlightPlace } from '@/lib/flights';

/**
 * Deterministic schematic of one flight: departure airport, dashed route with
 * the aircraft, arrival airport and the great-circle distance. The flight page
 * uses this as the fallback when either airport has no coordinates, because the
 * Leaflet route map cannot place its markers; everywhere else the interactive
 * map is shown instead.
 */
export default function FlightRouteDiagram({
  origin,
  destination,
  airline,
  distance,
  label,
}: {
  origin: FlightPlace;
  destination: FlightPlace;
  airline: string;
  distance: string | null;
  label: string;
}) {
  return (
    <div
      className="mt-4 flex items-center gap-6 rounded-[14px] border border-line bg-card p-6 [background-image:linear-gradient(135deg,rgba(10,42,67,0.045),transparent_62%)] [box-shadow:var(--shadow-sm)] max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-3 max-[600px]:p-5"
      role="img"
      aria-label={label}
    >
      <div className="flex min-w-[104px] flex-col gap-1 max-[600px]:items-center max-[600px]:text-center">
        <span className="font-display text-[32px] font-semibold leading-none text-navy-800 tabular-nums">
          {origin.iata}
        </span>
        <b className="text-[14px] font-semibold text-ink">{origin.city || origin.name}</b>
        <span className="text-[12px] text-ink-soft">{origin.country}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5 max-[600px]:w-full">
        <span className="font-display text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          {airline}
        </span>
        <div className="relative h-0 w-full border-t-2 border-dashed border-line">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card p-1 text-amber [box-shadow:0_0_0_2px_var(--card)]">
            <PlaneIcon width={18} height={18} aria-hidden="true" />
          </span>
        </div>
        <span className="rounded-full border border-line bg-paper px-3 py-1 font-display text-[12.5px] text-ink-soft">
          {distance ?? '—'}
        </span>
      </div>
      <div className="flex min-w-[104px] flex-col items-end gap-1 text-right max-[600px]:items-center max-[600px]:text-center">
        <span className="font-display text-[32px] font-semibold leading-none text-navy-800 tabular-nums">
          {destination.iata}
        </span>
        <b className="text-[14px] font-semibold text-ink">
          {destination.city || destination.name}
        </b>
        <span className="text-[12px] text-ink-soft">{destination.country}</span>
      </div>
    </div>
  );
}
