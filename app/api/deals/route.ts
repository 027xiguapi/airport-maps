import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createDeal,
  dealAirportExists,
  dealIpHash,
  findRecentDuplicate,
  isDealRateLimited,
  listDeals,
  validateDealInput,
  type DealError,
} from '@/lib/deals';
import { clientIp, isSameOrigin } from '@/lib/http';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';

/**
 * Public airfare-deal endpoint.
 *
 *   GET  /api/deals?locale=en&airport=PEK&q=shanghai&limit=20&offset=0
 *   POST /api/deals  { airportIata, destination, airline, price, currency,
 *                      cabin, tripType, travelFrom, travelTo, bookingUrl,
 *                      notes, website }
 *
 * POST requires a Google session — individual submissions are welcome, but
 * they are attributed, which is what keeps an immediately-published board
 * usable. `website` is the same hidden honeypot the comments form uses.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function publishedLocale(value: unknown): Locale | null {
  if (typeof value !== 'string' || !isLocale(value)) return null;
  return PUBLISHED_LOCALES.includes(value) ? (value as Locale) : null;
}

function badRequest(error: DealError | string) {
  return NextResponse.json({ error }, { status: 400, headers: NO_STORE });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = publishedLocale(searchParams.get('locale')) ?? DEFAULT_LOCALE;
  const airportParam = (searchParams.get('airport') ?? '').trim();
  const airport = /^[A-Za-z]{3}$/.test(airportParam) ? airportParam.toUpperCase() : null;
  if (airportParam && !airport) return badRequest('invalid_airport');

  const limit = Number(searchParams.get('limit')) || 20;
  const offset = Number(searchParams.get('offset')) || 0;

  try {
    const { deals, total } = await listDeals({
      locale,
      airport,
      q: (searchParams.get('q') ?? '').slice(0, 80),
      limit,
      offset,
    });
    return NextResponse.json(
      {
        deals,
        total,
        hasMore: offset + deals.length < total,
        locale,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('[api/deals] list failed', error);
    return NextResponse.json(
      { error: 'deals_unavailable' },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  // A cross-site form post cannot set application/json without a preflight;
  // the Origin check then covers fetch() from another site.
  if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { error: 'unsupported_media_type' },
      { status: 415, headers: NO_STORE }
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE });
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > 20_000) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413, headers: NO_STORE });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await request.json();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    // Malformed JSON is handled by the null check below.
  }
  if (!payload) return badRequest('invalid_request');

  // Honeypot: answer like a success, write nothing.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return NextResponse.json({ ok: true, deal: null }, { status: 202, headers: NO_STORE });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'sign_in_required' },
      { status: 401, headers: NO_STORE }
    );
  }

  const locale = publishedLocale(payload.locale) ?? DEFAULT_LOCALE;
  const validation = validateDealInput(payload);
  if (!validation.ok) return badRequest(validation.error);

  try {
    if (!(await dealAirportExists(validation.draft.airportIata))) {
      return badRequest('invalid_airport');
    }

    const ipHash = dealIpHash(clientIp(request));
    if (await isDealRateLimited(user.id, ipHash)) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { ...NO_STORE, 'Retry-After': '3600' } }
      );
    }

    const duplicateId = await findRecentDuplicate(user.id, validation.draft);
    if (duplicateId) {
      return NextResponse.json(
        { ok: true, duplicate: true, dealId: duplicateId },
        { status: 200, headers: NO_STORE }
      );
    }

    const deal = await createDeal(locale, validation.draft, {
      userId: user.id,
      name: user.name.slice(0, 80),
      ipHash,
    });
    return NextResponse.json({ ok: true, deal }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error('[api/deals] create failed', error);
    return NextResponse.json(
      { error: 'deals_unavailable' },
      { status: 503, headers: NO_STORE }
    );
  }
}
