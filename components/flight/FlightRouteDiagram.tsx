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
    <div className="fl-diagram" role="img" aria-label={label}>
      <div className="fl-diagram-point">
        <span className="code">{origin.iata}</span>
        <b>{origin.city || origin.name}</b>
        <span className="country">{origin.country}</span>
      </div>
      <div className="fl-diagram-path">
        <span className="airline">{airline}</span>
        <div className="line">
          <span className="plane">
            <PlaneIcon width={18} height={18} aria-hidden="true" />
          </span>
        </div>
        <span className="km">{distance ?? '—'}</span>
      </div>
      <div className="fl-diagram-point arr">
        <span className="code">{destination.iata}</span>
        <b>{destination.city || destination.name}</b>
        <span className="country">{destination.country}</span>
      </div>
    </div>
  );
}
