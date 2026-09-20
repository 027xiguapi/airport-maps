import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import LocationMap from '@/components/airport/LocationMap';

/** Interactive Leaflet/OpenStreetMap of the airport plus deep links to other map services. */
export default function LocationMapSection({
  locale,
  airportName,
  geo,
}: {
  locale: Locale;
  airportName: string;
  geo: { lat: number; lng: number };
}) {
  const t = getMessages(locale);
  const { lat, lng } = geo;

  return (
    <section className="ap-extra" id="location-map">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.mapEmbedKicker}</div>
          <h2 className="section-title">
            {t.airport.mapEmbedTitle(airportName)}
            <span className="en">{t.airport.mapEmbedEn}</span>
          </h2>
        </div>
      </div>
      <div className="map-embed">
        <LocationMap lat={lat} lng={lng} label={airportName} />
      </div>
      <p className="ext-note">{t.airport.extMapsNote}</p>
      <div className="ext-links">
        <a
          className="ext-btn"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        >
          Google Maps ↗
        </a>
        <a
          className="ext-btn"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`}
        >
          OpenStreetMap ↗
        </a>
        <a
          className="ext-btn"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.bing.com/maps?q=${lat},${lng}`}
        >
          Bing Maps ↗
        </a>
      </div>
    </section>
  );
}
