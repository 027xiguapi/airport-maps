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
 */
export default function RouteMapTeaser({
  locale,
  iata,
  airportName,
  destinationCount,
}: {
  locale: Locale;
  iata: string;
  /** Localized airport name, for the heading. */
  airportName: string;
  destinationCount: number;
}) {
  const t = getMessages(locale);

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
      <div className="ext-links">
        <Button asChild>
          <Link href={localizedPath(locale, `/route/${iata}`)}>
            {t.route.openFull}
            <ArrowIcon width={14} height={14} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
