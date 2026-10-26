import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { parseLocale } from '@/lib/i18n';
import { getAirportFlights } from '@/lib/flights';

export const revalidate = 3600;

/**
 * One page of an airport's flight board, for the search/pager in
 * components/airport/FlightBoard.tsx.
 *
 * The full board can run to tens of thousands of flight numbers (ATL alone has
 * ~29k), so the page is server-rendered with its first page and this endpoint
 * supplies later pages and search results without shipping the whole file to
 * the browser. `?locale=` localizes the counterpart airport names, matching the
 * page the visitor is on.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams.get('locale') ?? '') ?? DEFAULT_LOCALE;
  const direction = url.searchParams.get('dir') === 'arrivals' ? 'arrivals' : 'departures';
  const page = Number(url.searchParams.get('page') ?? '1');
  const perPage = Number(url.searchParams.get('perPage') ?? '20');
  const query = (url.searchParams.get('q') ?? '').slice(0, 80);

  const board = await getAirportFlights(locale, code, {
    direction,
    page: Number.isFinite(page) ? page : 1,
    perPage: Number.isFinite(perPage) ? perPage : 20,
    query,
  });
  if (!board) return new Response('No flight data for this airport', { status: 404 });

  return Response.json(board, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
