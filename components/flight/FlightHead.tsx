import Link from 'next/link';
import Breadcrumb, { type Crumb } from '@/components/Breadcrumb';
import { PlaneIcon } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { FlightPageData } from '@/lib/flight-page';

/**
 * Dark navy header for the standalone flight page. Mirrors AirportHead's
 * breadcrumb / badge / title / lead / facts layout, but the badge is the flight
 * number and the facts describe the route rather than terminal counts.
 */
export default function FlightHead({
  locale,
  flight,
  fromLabel,
  toLabel,
  distance,
  trail,
}: {
  locale: Locale;
  flight: FlightPageData;
  fromLabel: string;
  toLabel: string;
  distance: string | null;
  trail: Crumb[];
}) {
  const t = getMessages(locale);
  const primary = flight.primary;

  return (
    <div className="ap-head fl-head">
      <div className="ap-head-inner">
        <Breadcrumb locale={locale} items={trail} />
        <div className="ap-title-row">
          <div className="fl-head-badge" aria-hidden="true">
            <PlaneIcon width={40} height={40} />
          </div>
          <div className="ap-title">
            <h1>{t.flight.heading(flight.number)}</h1>
            <div className="city">
              <span>{t.flight.subtitle(flight.airline, fromLabel, toLabel)}</span>
            </div>
          </div>
        </div>
        <p className="ap-lead">
          {t.flight.lead(
            flight.number,
            flight.airline,
            fromLabel,
            toLabel,
            distance ?? ''
          )}
        </p>
        <p className="ap-byline">
          <span>
            {t.editorial.role}
            <Link href={localizedPath(locale, '/about')}>{t.editorial.authorName}</Link>
          </span>
          {flight.dataDate && (
            <>
              <span className="sep">·</span>
              <span>
                {t.flight.detailsSnapshot} {formatDate(flight.dataDate, locale)}
              </span>
            </>
          )}
        </p>
        <div className="ap-facts">
          <div className="ap-fact">
            <div className="num">{flight.number}</div>
            <div className="lbl">{t.flight.factFlight}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{primary.origin.iata}</div>
            <div className="lbl">{t.flight.factFrom}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{primary.destination.iata}</div>
            <div className="lbl">{t.flight.factTo}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{distance ?? '—'}</div>
            <div className="lbl">{t.flight.factDistance}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
