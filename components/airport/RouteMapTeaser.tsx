import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { ArrowIcon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

/**
 * Airport-page pointer to the standalone route map at /route/<IATA>. The map
 * itself lives on its own page — a Leaflet canvas plus a destination table of
 * up to ~200 rows — so here it only advertises the destination count and links
 * across, which also keeps the SEO weight on one route-map URL per airport.
 *
 * When the repo holds a static render of the network (public/route, written by
 * scripts/generate-route-images.mjs), that picture becomes the link, the way the
 * route page uses the terminal map; the button is what remains for the airports
 * without one, so the section never shows a placeholder.
 */
export default function RouteMapTeaser({
  locale,
  iata,
  airportName,
  destinationCount,
  image,
}: {
  locale: Locale;
  iata: string;
  /** Localized airport name, for the heading and the picture's alt text. */
  airportName: string;
  destinationCount: number;
  /** `/route/<IATA>.png` when a render exists, else null. */
  image?: string | null;
}) {
  const t = getMessages(locale);
  const href = localizedPath(locale, `/route/${iata}`);

  return (
    <section className="ap-extra" id="airport-routes">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.routeMapKicker}</div>
          <h2 className="section-title">
            {t.airport.routeMapTitle(airportName)}
            <span className="en">{t.airport.routeMapEn}</span>
          </h2>
          <p className="sec-sub">{t.route.teaserSub(formatNumber(destinationCount, locale))}</p>
        </div>
      </div>

      {image ? (
        <Link className="route-map-card" href={href}>
          <figure className="map-img-wrap">
            <img
              src={image}
              alt={t.airport.routeMapAria(airportName)}
              width={690}
              height={450}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <span className="route-map-cta">
            {t.route.previewCta(iata)}
            <ArrowIcon width={14} height={14} />
          </span>
        </Link>
      ) : (
        <div className="ext-links">
          <Button asChild>
            <Link href={href}>
              {t.route.openFull}
              <ArrowIcon width={14} height={14} />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
