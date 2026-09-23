import type { CSSProperties } from 'react';
import { getAirportGeo } from '@/lib/airport-geo';
import { greatCirclePoints } from '@/lib/geo-convert';

/**
 * Animated flight arcs across the hero's world-map backdrop
 * (public/world-airport-map.jpg).
 *
 * Pure server-rendered SVG + CSS: the arcs are real great circles between the
 * directory's own hubs (the same greatCirclePoints the route map draws),
 * projected into the backdrop's own frame. The frame is NOT a plain
 * equirectangular box — it was measured from the file itself
 * (scripts/calibrate-hero-map.cjs) and the constants below are that tool's
 * output:
 *
 *   • the map tiles horizontally with a period of 891 px per 360° of longitude
 *     (autocorrelation peak of the image against itself), with lng −180 falling
 *     at x = 404 in the first copy;
 *   • the vertical mapping is linear through lat +123.8 at y = 0 and −98.2 at
 *     y = 624 — an empirical fit, not a real projection, found by scoring all
 *     3,244 airports against the image's own airport dots (12 of 12 major hubs
 *     land on a dot);
 *   • because the backdrop shows parts of two or three copies at once, each
 *     flight is drawn once per copy so the arcs stay pinned to whichever copy
 *     is on screen at the hero's current size.
 *
 * The SVG uses preserveAspectRatio="slice", the exact analogue of the
 * backdrop's background-size: cover / center, so the two crop identically.
 * Lines are dashed and dim, flowing along the route; endpoints pulse and a
 * small dot travels the arc. Decorative only: aria-hidden, no pointer events,
 * and prefers-reduced-motion stops the movement while keeping the dashes.
 */

/** Backdrop frame in the image's own pixels (world-airport-map.jpg is 1718×624). */
const VIEW_W = 1718;
const VIEW_H = 624;
/** Horizontal period of the tiled map, px per 360° of longitude. */
const PERIOD_X = 891;
/** Where lng −180 sits in the first copy. */
const PHASE_X = 404;
/** Empirical vertical mapping — see the header note. */
const LAT_TOP = 123.8;
const LAT_BOTTOM = -98.2;
/** The copies whose geography can be on screen at once. */
const COPY_OFFSETS = [-PERIOD_X, 0, PERIOD_X];

const project = (lat: number, lng: number, offset: number): [number, number] => [
  PHASE_X + offset + ((lng + 180) / 360) * PERIOD_X,
  ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * VIEW_H,
];

/** One animation cycle, shared by the arc, its dot and its city pulses. */
const CYCLE = '9s';

type Flight = {
  /** SVG path data. */
  d: string;
  from: [number, number];
  to: [number, number];
  delay: string;
};

function buildFlight(pair: [string, string], delay: string, offset: number): Flight | null {
  const [a, b] = pair.map((iata) => getAirportGeo(iata));
  if (!a || !b) return null;

  const points = greatCirclePoints(a, b, 64);
  let d = '';
  let prev: [number, number] | null = null;
  for (const [lat, lng] of points) {
    const p = project(lat, lng, offset);
    d += `${prev ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    prev = p;
  }
  if (prev === null) return null;
  return {
    d,
    from: project(a.lat, a.lng, offset),
    to: project(b.lat, b.lng, offset),
    delay,
  };
}

// Atlantic, Eurasian, African and Australasian pairs only: an arc wrapping the
// antimeridian would project as a line slashing across the whole map.
const PAIRS: [string, string][] = [
  ['LHR', 'JFK'],
  ['DXB', 'LHR'],
  ['PEK', 'FRA'],
  ['SIN', 'SYD'],
  ['GRU', 'CDG'],
  ['ATL', 'AMS'],
];

const FLIGHTS: Flight[] = PAIRS.flatMap((pair, i) =>
  COPY_OFFSETS.map((offset) => buildFlight(pair, `${(i * 1.5).toFixed(1)}s`, offset)).filter(
    (flight): flight is Flight => flight !== null
  )
);

export default function HeroRoutes() {
  return (
    <svg
      className="hero-routes"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {FLIGHTS.map((flight, i) => (
        <g key={`${flight.d}-${i}`}>
          <path
            className="arc"
            d={flight.d}
            style={{ '--cycle': CYCLE, '--delay': flight.delay } as CSSProperties}
          />
          <circle
            className="city"
            cx={flight.from[0]}
            cy={flight.from[1]}
            r="3"
            style={{ '--cycle': CYCLE, '--delay': flight.delay } as CSSProperties}
          />
          <circle
            className="city"
            cx={flight.to[0]}
            cy={flight.to[1]}
            r="3"
            style={{ '--cycle': CYCLE, '--delay': flight.delay } as CSSProperties}
          />
          <circle
            className="fly"
            r="2.2"
            cx="0"
            cy="0"
            style={
              {
                offsetPath: `path('${flight.d}')`,
                '--cycle': CYCLE,
                '--delay': flight.delay,
              } as CSSProperties
            }
          />
        </g>
      ))}
    </svg>
  );
}
