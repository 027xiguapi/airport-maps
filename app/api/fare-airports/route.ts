import { NextResponse } from 'next/server';
import { getFareMapPoints } from '@/lib/fare-offers';

/**
 * Map overlay data: `[{ iata, minUsd, count }]` for every origin with a live
 * deal. Fetched only when the visitor turns the deals layer on, so it is cached
 * for five minutes at the edge and revalidated in the background.
 */
export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  try {
    const points = await getFareMapPoints();
    return NextResponse.json(
      { points, generatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    // Missing table before migration 0004: the map simply has no overlay.
    console.error('[api/fare-airports] query failed', error);
    return NextResponse.json(
      { points: [], generatedAt: new Date().toISOString() },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
