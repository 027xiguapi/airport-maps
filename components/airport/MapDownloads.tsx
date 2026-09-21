'use client';

/**
 * Download row under the terminal map. The green button saves the map image —
 * the full-res map from /terminal-maps when the repo has one, else the cover
 * thumbnail from /public/maps, else the generated SVG diagram (re-packed into
 * a Blob so it downloads as a file). The blue button downloads the hosted
 * terminal-map PDF from /terminal-maps, falling back to a Google search for
 * airports whose PDF the site does not host.
 *
 * When a real file exists both buttons render as plain anchors with a
 * `download` attribute, so they work without JavaScript and are visible to
 * crawlers; only the SVG fallback needs the click handler.
 *
 * Both are shadcn Buttons; the green/blue branding comes in as classes so
 * the base (focus ring, sizing, transitions) stays shared.
 */

import { DownloadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const PDF_SEARCH_URL = (iata: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${iata} airport terminal map pdf`)}`;

export default function MapDownloads({
  iata,
  mapImg,
  mapSvg,
  mapLabel,
  pdfLabel,
  terminalMapUrl,
  terminalPdfUrl,
}: {
  iata: string;
  /** `/maps/JFK.png` when a cover image exists, else null (SVG fallback). */
  mapImg: string | null;
  /** Generated terminal-layout diagram — the download payload without an image. */
  mapSvg: string;
  /** `/terminal-maps/JFK/JFK_large.png` (full-res map) when hosted, else null. */
  terminalMapUrl: string | null;
  /** `/terminal-maps/JFK/JFK.pdf` when hosted, else null (search fallback). */
  terminalPdfUrl: string | null;
  mapLabel: string;
  pdfLabel: string;
}) {
  const imageHref = terminalMapUrl ?? mapImg;
  const imageExt = imageHref ? (imageHref.split('.').pop() ?? 'png') : 'svg';

  const downloadSvg = () => {
    const href = URL.createObjectURL(new Blob([mapSvg], { type: 'image/svg+xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${iata}-terminal-map.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  };

  const icon = <DownloadIcon className="opacity-95" />;

  return (
    <div className="map-dl-row">
      {imageHref ? (
        <Button
          asChild
          size="lg"
          className="max-sm:w-full gap-[9px] rounded-[10px] bg-[#1E8E4B] font-bold text-white shadow-[0_8px_18px_-10px_rgba(30,142,75,0.85)] hover:bg-[#1E8E4B] hover:brightness-110"
        >
          <a href={imageHref} download={`${iata}-terminal-map.${imageExt}`}>
            {icon}
            {mapLabel}
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          onClick={downloadSvg}
          className="max-sm:w-full gap-[9px] rounded-[10px] bg-[#1E8E4B] font-bold text-white shadow-[0_8px_18px_-10px_rgba(30,142,75,0.85)] hover:bg-[#1E8E4B] hover:brightness-110"
        >
          {icon}
          {mapLabel}
        </Button>
      )}
      <Button asChild size="lg" className="max-sm:w-full gap-[9px] rounded-[10px] bg-[#0D6EFD] font-bold text-white shadow-[0_8px_18px_-10px_rgba(13,110,253,0.85)] hover:bg-[#0D6EFD] hover:brightness-110">
        {terminalPdfUrl ? (
          <a href={terminalPdfUrl} download={`${iata}-terminal-map.pdf`}>
            {icon}
            {pdfLabel}
          </a>
        ) : (
          <a href={PDF_SEARCH_URL(iata)} target="_blank" rel="noopener noreferrer">
            {icon}
            {pdfLabel}
          </a>
        )}
      </Button>
    </div>
  );
}
