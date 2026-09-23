import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import MapDownloads from './MapDownloads';
import MapZoom from './MapZoom';

/**
 * Terminal map panel: the airport's real terminal-map image when one exists,
 * otherwise the generated SVG layout diagram plus its legend. Below the map,
 * the download row offers the map image and the terminal-map PDF — both from
 * /terminal-maps when the repo hosts them, with search/SVG fallbacks. The
 * head carries a zoom button whose lightbox prefers the full-resolution
 * /terminal-maps image and falls back to the cover thumbnail.
 */
export default function TerminalMapPanel({
  locale,
  iata,
  mapImg,
  mapSvg,
  terminalMapUrl,
  terminalPdfUrl,
}: {
  locale: Locale;
  iata: string;
  mapImg: string | null;
  mapSvg: string;
  /** `/terminal-maps/HKG/HKG_large.png` when hosted, else null. */
  terminalMapUrl: string | null;
  /** `/terminal-maps/HKG/HKG.pdf` when hosted, else null. */
  terminalPdfUrl: string | null;
}) {
  const t = getMessages(locale);
  const zoomSrc = terminalMapUrl ?? mapImg;

  return (
      <>
    <div className="map-panel" id="terminal-map">
      <div className="map-panel-head">
        <div className="map-panel-title">
          <span className="dot" />
          {mapImg ? t.airport.realMapTitle(iata) : t.airport.mapTitle(iata)}
        </div>
        <div className="flex flex-none items-center gap-3">
          <div className="map-panel-note">{mapImg ? t.airport.realMapNote : t.airport.mapNote}</div>
          {mapImg && (
            <MapZoom
              src={mapImg}
              alt={t.airport.realMapTitle(iata)}
              label={t.airport.zoomLabel}
              closeLabel={t.airport.zoomClose}
              zoomInLabel={t.airport.zoomIn}
              zoomOutLabel={t.airport.zoomOut}
            />
          )}
        </div>
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
        <div className="section-head" id="download" style={{ marginTop: 46, marginBottom: 18 }}>
          <div>
            <div className="section-kicker">{t.airport.downloadKicker}</div>
            <h2 className="section-title">
              {t.airport.downloadTitle}
              <span className="en">{t.airport.downloadEn}</span>
            </h2>
          </div>
        </div>
        <MapDownloads
            iata={iata}
            mapImg={mapImg}
            mapSvg={mapSvg}
            terminalMapUrl={terminalMapUrl}
            terminalPdfUrl={terminalPdfUrl}
            mapLabel={t.airport.downloadMapLabel(new Date().getFullYear(), iata)}
            pdfLabel={t.airport.downloadPdfLabel(new Date().getFullYear(), iata)}
        />
      </>
  );
}
