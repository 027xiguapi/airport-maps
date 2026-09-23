/**
 * Colour tiers for the route map's destination markers.
 *
 * The OpenFlights dump records *which* carriers fly a route, never how often,
 * so destinations are graded by how many airlines serve them — the closest
 * honest proxy for how well connected a city is. The thresholds follow the real
 * spread of the data: the median destination has a single carrier, so the top
 * tier stays rare on purpose.
 *
 * Free of server imports — both the server section and the client map import it.
 */
export type RouteTierId = 'trunk' | 'major' | 'minor' | 'single';

export type RouteTier = {
  id: RouteTierId;
  /** Fewest carriers a destination needs to land in this tier. */
  min: number;
  color: string;
  /** Single-carrier destinations are drawn as hollow rings, not filled dots. */
  hollow?: boolean;
};

/** Strongest first: the legend renders it top down and `routeTier` scans it. */
export const ROUTE_TIERS: readonly RouteTier[] = [
  { id: 'trunk', min: 6, color: '#2FB457' },
  { id: 'major', min: 3, color: '#3B82F6' },
  { id: 'minor', min: 2, color: '#F08A3C' },
  { id: 'single', min: 1, color: '#8FA3B6', hollow: true },
];

/** The tier a destination belongs to; a carrier-less row (never generated) reads as the last tier. */
export function routeTier(carrierCount: number): RouteTier {
  for (const tier of ROUTE_TIERS) {
    if (carrierCount >= tier.min) return tier;
  }
  return ROUTE_TIERS[ROUTE_TIERS.length - 1];
}
