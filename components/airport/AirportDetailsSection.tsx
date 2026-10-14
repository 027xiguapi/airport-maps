import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportDetail } from '@/lib/types';

/**
 * Static airport facts: IATA code, location, coordinates and time zone.
 * Coordinates and timezone are separate props because their coverage differs:
 * compiled coordinates exist for ~all airports, the hand-checked timezone only
 * for the major ones — so each row drops out on its own rather than hiding both.
 */
export default function AirportDetailsSection({
  locale,
  airport,
  coords,
  tz,
}: {
  locale: Locale;
  airport: AirportDetail;
  coords: { lat: number; lng: number } | null;
  tz: string | null;
}) {
  const t = getMessages(locale);

  return (
    <section className="ap-extra" id="airport-details">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.infoKicker}</div>
          <h2 className="section-title">
            {t.airport.infoTitle}
            <span className="en">{t.airport.infoEn}</span>
          </h2>
        </div>
      </div>
      <div className="detail-list">
        <div className="detail-item">
          <div className="k">{t.airport.infoIata}</div>
          <div className="v">{airport.iata}</div>
        </div>
        <div className="detail-item">
          <div className="k">{t.airport.infoLocation}</div>
          <div className="v">
            {airport.city} · {airport.countryName}
          </div>
        </div>
        {coords && (
          <div className="detail-item">
            <div className="k">{t.airport.infoCoords}</div>
            <div className="v">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
          </div>
        )}
        {tz && (
          <div className="detail-item">
            <div className="k">{t.airport.infoTimezone}</div>
            <div className="v">{tz}</div>
          </div>
        )}
      </div>
    </section>
  );
}
