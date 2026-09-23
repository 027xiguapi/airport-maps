import RouteMap from '@/components/airport/RouteMap';
import { formatNumber } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { routeTier } from '@/lib/route-tiers';
import type { AirportRouteMap } from '@/lib/types';

/**
 * The route page's two data blocks — the great-circle map (id="route-map") and
 * the destination table it draws (id="destinations") — kept as one component so
 * the two always agree on the destination set. The airport page only links here
 * (RouteMapTeaser). Place names are English from the source dump except for
 * airports the directory itself covers — see lib/routes.ts.
 */
export default function RouteMapSection({
  locale,
  airportName,
  city,
  iata,
  map,
}: {
  locale: Locale;
  /** Localized airport name, for the map's accessible name. */
  airportName: string;
  /** Localized city, for the label pinned on the hub marker. */
  city: string;
  iata: string;
  map: AirportRouteMap;
}) {
  const t = getMessages(locale);
  const { destinations } = map;
  // Chinese joins airline names with 、, English with a comma.
  const separator = locale === 'en' ? ', ' : '、';

  return (
    <>
      <section className="ap-extra" id="route-map">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.airport.routeMapKicker}</div>
            <h2 className="section-title">
              {t.route.mapSectionTitle(airportName)}
              <span className="en">{t.airport.routeMapEn}</span>
            </h2>
            <p className="sec-sub">{t.route.headingSub(iata, formatNumber(destinations.length, locale))}</p>
          </div>
        </div>

        <div className="rt-embed">
          <RouteMap
            lat={map.lat}
            lng={map.lng}
            label={t.airport.routeMapAria(airportName)}
            centerLabel={`${city} (${iata})`}
            destinations={destinations}
            labels={{
              legendTitle: t.airport.routeLegendTitle,
              legendClose: t.airport.routeLegendClose,
              reset: t.airport.routeReset,
              zoomIn: t.airport.routeZoomIn,
              zoomOut: t.airport.routeZoomOut,
              fullscreen: t.airport.routeFullscreen,
              exitFullscreen: t.airport.routeExitFullscreen,
              tiers: t.airport.routeTiers,
              carriers: t.airport.routeCarriersTpl,
              openAirport: t.airport.routeOpenAirport,
              numberLocale: locale === 'en' ? 'en-US' : 'zh-CN',
            }}
          />
        </div>

        <p className="rt-note">
          {t.airport.routeMapNote(map.dataDate)}{' '}
          <a href={map.source.url} target="_blank" rel="noopener noreferrer">
            {map.source.name} · {map.source.license} ↗
          </a>
        </p>
      </section>

      <section className="ap-extra" id="destinations">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.route.tableKicker(iata)}</div>
            <h2 className="section-title">
              {t.route.tableSectionTitle(airportName)}
              <span className="en">{t.route.tableSectionEn(iata)}</span>
            </h2>
            <p className="sec-sub">{t.route.tableSectionSub(formatNumber(destinations.length, locale))}</p>
          </div>
        </div>

        <div className="rt-table-wrap">
          <table className="rt-table">
            <thead>
              <tr>
                <th>{t.airport.routeTableDest}</th>
                <th>{t.airport.routeTableCountry}</th>
                <th className="num">{t.airport.routeTableDistance}</th>
                <th>{t.airport.routeTableCarriers}</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((destination) => {
                const tier = routeTier(destination.carriers.length);
                const names = destination.carriers.map((carrier) => carrier.name);
                const shown = names.slice(0, 3).join(separator);
                const rest = names.length - 3;
                return (
                  <tr key={destination.iata}>
                    <td>
                      <div className="dest">
                        <i
                          className={tier.hollow ? 'rt-mark hollow' : 'rt-mark'}
                          style={tier.hollow ? { borderColor: tier.color } : { background: tier.color }}
                        />
                        <b>
                          {destination.city} ({destination.iata})
                        </b>
                      </div>
                      <span className="nm">{destination.name}</span>
                    </td>
                    <td className="ctry">{destination.country}</td>
                    <td className="num">{formatNumber(destination.km, locale)} km</td>
                    <td className="carr" title={names.join(separator)}>
                      {shown}
                      {rest > 0 && <span className="more">{t.airport.routeCarriersMore(rest)}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
