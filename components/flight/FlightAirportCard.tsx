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
    <div className="fl-airport-card">
      <div className="k">{label}</div>
      <div className="hd">
        <span className="code">{place.iata}</span>
        <h3>
          {place.href ? <Link href={place.href}>{place.name}</Link> : place.name}
        </h3>
      </div>
      <p className="meta">
        {place.city && place.country
          ? `${place.city} · ${place.country}`
          : place.city || place.country || '—'}
      </p>
      {place.href && (
        <Link className="more" href={place.href}>
          {pageLabel} →
        </Link>
      )}
    </div>
  );
}
