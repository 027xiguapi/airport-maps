import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportDetail } from '@/lib/types';

/** Static airport facts: IATA code, location, coordinates and time zone. */
export default function AirportDetailsSection({
  locale,
  airport,
  geo,
}: {
  locale: Locale;
  airport: AirportDetail;
  geo: { lat: number; lng: number; tz: string } | null;
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
        {geo && (
          <>
            <div className="detail-item">
              <div className="k">{t.airport.infoCoords}</div>
              <div className="v">
                {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </div>
            </div>
            <div className="detail-item">
              <div className="k">{t.airport.infoTimezone}</div>
              <div className="v">{geo.tz}</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
