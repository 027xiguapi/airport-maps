import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { parseLocale } from '@/lib/i18n';
import { getAirportRouteMap } from '@/lib/routes';

export const revalidate = 3600;

/**
 * CSV / JSON download of one airport's direct destinations, behind the buttons
 * in the route page's data section. Served from the server (rather than built
 * in the browser) so the download needs no JavaScript and the table markup is
 * not duplicated into a data URL.
 *
 * `?locale=` picks the language of the place names, matching the page the
 * visitor downloaded from. Column headers stay English — a data file traded
 * between tools reads better with stable field names.
 */

/** Quotes a CSV field only when it has to be quoted. */
function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams.get('locale') ?? '') ?? DEFAULT_LOCALE;
  const iata = code.toUpperCase();

  const map = await getAirportRouteMap(locale, iata);
  if (!map) return new Response('No route data for this airport', { status: 404 });

  const json = url.searchParams.get('format') === 'json';
  const headers = {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Content-Disposition': `attachment; filename="${iata}-routes.${json ? 'json' : 'csv'}"`,
  };

  if (json) {
    return Response.json(
      {
        iata,
        lat: map.lat,
        lng: map.lng,
        source: map.source,
        dataDate: map.dataDate,
        destinations: map.destinations,
      },
      { headers }
    );
  }

  const rows = [
    ['destination', 'iata', 'city', 'country', 'distance_km', 'airlines'],
    ...map.destinations.map((destination) => [
      destination.name,
      destination.iata,
      destination.city,
      destination.country,
      String(destination.km),
      destination.carriers.map((carrier) => carrier.name).join('; '),
    ]),
  ];
  // Leading BOM so Excel opens the UTF-8 Chinese place names correctly.
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;

  return new Response(csv, {
    headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8' },
  });
}
