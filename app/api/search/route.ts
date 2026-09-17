import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config';
import { searchAirports } from '@/lib/queries';

/**
 * Suggestion endpoint for the header/hero search boxes.
 * GET /api/search?q=lon&limit=7&locale=en
 *
 * Results are localized; the underlying match covers every locale's names, so
 * searching "北京" works on the English site too.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').slice(0, 80);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 7, 1), 20);
  const requested = searchParams.get('locale') ?? undefined;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  if (!q.trim()) {
    return NextResponse.json({ query: q, locale, results: [] });
  }

  try {
    const results = await searchAirports(locale, q, limit);
    return NextResponse.json(
      { query: q, locale, results },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('[api/search] failed', error);
    return NextResponse.json({ error: 'Search is temporarily unavailable' }, { status: 500 });
  }
}
