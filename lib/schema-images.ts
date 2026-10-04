import { coverImageUrl } from './map-images';
import { routeImageUrl } from './route-images';
import { absoluteUrl, SITE_IMAGE } from './site';

/**
 * The picture to hand schema.org for a page, as an absolute URL.
 *
 * Each page uses the picture it actually shows: an airport page its terminal-map
 * cover (public/maps, 262 of them), a route page the network render it draws as
 * its hero (public/route, 13 of them). Everything else falls back to the site
 * photo — the point being that structured data never points at a URL that 404s,
 * so the lookups go through the same directory indexes the pages render from
 * (see lib/map-images.ts and lib/route-images.ts, both server-only).
 */

/** An airport page's own image: its cover, else the site photo. */
export function airportSchemaImage(iata: string): string {
  const cover = coverImageUrl(iata);
  return cover ? absoluteUrl(cover) : SITE_IMAGE.url;
}

/**
 * A route page's own image: the route render, else the airport's cover, else the
 * site photo. Airports outside the 13 rendered networks still get a real picture.
 */
export function routeSchemaImage(iata: string): string {
  const render = routeImageUrl(iata);
  return render ? absoluteUrl(render) : airportSchemaImage(iata);
}
