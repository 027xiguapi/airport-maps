import AirportClock from '@/components/AirportClock';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/** "Airport time" section: current local time vs the airport's time zone. */
export default function AirportTimeSection({
  locale,
  iata,
  timeZone,
}: {
  locale: Locale;
  iata: string;
  timeZone: string;
}) {
  const t = getMessages(locale);

  return (
    <section className="ap-extra" id="airport-time">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.timeKicker}</div>
          <h2 className="section-title">
            {t.airport.timeTitle(iata)}
            <span className="en">{t.airport.timeEn}</span>
          </h2>
          <p className="sec-sub">{t.airport.timeSub(iata, timeZone)}</p>
        </div>
      </div>
      <AirportClock
        locale={locale}
        timeZone={timeZone}
        airportLabel={t.airport.clockAirport}
        localLabel={t.airport.clockLocal}
      />
    </section>
  );
}
