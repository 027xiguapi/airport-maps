import Link from 'next/link';
import { ArrowIcon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

/**
 * Route-page cross-link to the airport page: the airport's terminal map as a
 * clickable figure. Only rendered when an image exists for the code (a minority
 * of route pages), so the picture is never a placeholder.
 *
 * It reuses the airport page's `.map-img-wrap` frame and adds `.route-map-card`,
 * which caps the height — poster-shaped maps (FRA is 2000×6726) would otherwise
 * run for thousands of pixels, and the airport page holds the full version.
 */
export default function AirportMapCard({
  locale,
  iata,
  img,
}: {
  locale: Locale;
  iata: string;
  /** `/source-maps/FRA.png`, the high-resolution original from lib/map-images.ts. */
  img: string;
}) {
  const t = getMessages(locale);
  const title = t.airport.realMapTitle(iata);

  return (
    <Link className="route-map-card" href={localizedPath(locale, `/airport/${iata}`)}>
      <figure className="map-img-wrap">
        <img src={img} alt={title} loading="lazy" decoding="async" />
      </figure>
      <span className="route-map-cta">
        {t.route.airportMapCta(iata)}
        <ArrowIcon width={14} height={14} />
      </span>
    </Link>
  );
}
