import { NextResponse } from 'next/server';
import { listFareOffers } from '@/lib/fare-offers';
import type { FareMarket, FareScope } from '@/lib/fare-format';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';

/**
 * Public verified-fare endpoint.
 *
 *   GET /api/fare-offers?locale=en&under=300&scope=domestic&market=us
 *                       &origin=JFK&destination=LAX&nonstop=1&limit=24&offset=0
 *
 * Reads are cheap (one indexed query) and the data changes several times a day,
 * so the response is never cached: a card that says "checked 2 hours ago" must
 * not be re-served from a CDN an hour later.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function publishedLocale(value: unknown): Locale {
  if (typeof value === 'string' && isLocale(value) && PUBLISHED_LOCALES.includes(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}

function finiteNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = publishedLocale(searchParams.get('locale'));

  const scopeParam = searchParams.get('scope');
  const scope: FareScope =
    scopeParam === 'domestic' || scopeParam === 'international' ? scopeParam : 'all';
  const marketParam = searchParams.get('market');
  const market: FareMarket =
    marketParam === 'us' || marketParam === 'cn' ? marketParam : 'all';

  const under = finiteNumber(searchParams.get('under'));
  if (under !== null && (under <= 0 || under > 10_000)) {
    return NextResponse.json({ error: 'invalid_under' }, { status: 400, headers: NO_STORE });
  }

  const origin = (searchParams.get('origin') ?? '').trim().toUpperCase();
  if (origin && !/^[A-Z]{3}$/.test(origin)) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 400, headers: NO_STORE });
  }
  const destination = (searchParams.get('destination') ?? '').trim().toUpperCase();
  if (destination && !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json(
      { error: 'invalid_destination' },
      { status: 400, headers: NO_STORE }
    );
  }

  const limit = finiteNumber(searchParams.get('limit')) ?? 24;
  const offset = finiteNumber(searchParams.get('offset')) ?? 0;

  try {
    const { offers, total } = await listFareOffers(locale, {
      underUsd: under,
      scope,
      market,
      origin: origin || null,
      destination: destination || null,
      nonstopOnly: searchParams.get('nonstop') === '1',
      limit,
      offset,
    });
    return NextResponse.json(
      { offers, total, hasMore: offset + offers.length < total, locale },
      { headers: NO_STORE }
    );
  } catch (error) {
    // A deployment that has not run migration 0004 yet answers 503 and the
    // board shows its empty state instead of the page throwing.
    console.error('[api/fare-offers] query failed', error);
    return NextResponse.json(
      { error: 'fares_unavailable', offers: [], total: 0 },
      { status: 503, headers: NO_STORE }
    );
  }
}
