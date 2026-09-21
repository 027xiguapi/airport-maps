'use client';

/**
 * Download row under the terminal map. The green button saves the map image
 * itself: the real PNG from /public/maps when one exists, otherwise the
 * generated SVG diagram (re-packed into a Blob so it downloads as a file).
 * The blue button links out to a Google search for the airport's terminal-map
 * PDF — the site does not host PDFs, and searches such as "JFK airport
 * terminal map pdf" surface the official downloadable files.
 */

const dlIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export default function MapDownloads({
  iata,
  mapImg,
  mapSvg,
  mapLabel,
  pdfLabel,
}: {
  iata: string;
  /** `/maps/JFK.png` when a real map image exists, else null (SVG fallback). */
  mapImg: string | null;
  /** Generated terminal-layout diagram — the download payload without an image. */
  mapSvg: string;
  mapLabel: string;
  pdfLabel: string;
}) {
  const downloadMap = () => {
    const svg = !mapImg;
    const href = svg
      ? URL.createObjectURL(new Blob([mapSvg], { type: 'image/svg+xml;charset=utf-8' }))
      : mapImg;
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${iata}-terminal-map.${svg ? 'svg' : 'png'}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (svg) URL.revokeObjectURL(href);
  };

  return (
    <div className="map-dl-row">
      <button type="button" className="map-dl map" onClick={downloadMap}>
        {dlIcon}
        {mapLabel}
      </button>
      <a
        className="map-dl pdf"
        href={`https://www.google.com/search?q=${encodeURIComponent(`${iata} airport terminal map pdf`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {dlIcon}
        {pdfLabel}
      </a>
    </div>
  );
}
