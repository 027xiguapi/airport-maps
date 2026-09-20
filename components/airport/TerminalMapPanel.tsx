import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/**
 * Terminal map panel: the airport's real terminal-map image when one exists,
 * otherwise the generated SVG layout diagram plus its legend.
 */
export default function TerminalMapPanel({
  locale,
  iata,
  mapImg,
  mapSvg,
}: {
  locale: Locale;
  iata: string;
  mapImg: string | null;
  mapSvg: string;
}) {
  const t = getMessages(locale);

  return (
    <div className="map-panel" id="terminal-map">
      <div className="map-panel-head">
        <div className="map-panel-title">
          <span className="dot" />
          {mapImg ? t.airport.realMapTitle(iata) : t.airport.mapTitle(iata)}
        </div>
        <div className="map-panel-note">{mapImg ? t.airport.realMapNote : t.airport.mapNote}</div>
      </div>
      {mapImg ? (
        <figure className="map-img-wrap">
          <img src={mapImg} alt={t.airport.realMapTitle(iata)} decoding="async" />
        </figure>
      ) : (
        <>
          <div className="map-svg-wrap" dangerouslySetInnerHTML={{ __html: mapSvg }} />
          <div className="map-legend">
            <span className="map-legend-item">
              <span
                className="sw"
                style={{
                  background: 'rgba(46,125,179,.45)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,.6)',
                }}
              >
                {t.airport.legendTerminal}
              </span>
            </span>
            <span className="map-legend-item">
              <span className="sw" style={{ background: '#F2A33C', borderRadius: '50%' }} />
              {t.airport.legendTransit}
            </span>
            <span className="map-legend-item">
              <span
                className="sw"
                style={{
                  background: 'transparent',
                  boxShadow: '0 0 0 1.5px rgba(255,255,255,.5) inset',
                }}
              />
              {t.airport.legendCorridor}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
