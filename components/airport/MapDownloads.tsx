'use client';

/**
 * Download row under the terminal map. The green button saves the map image
 * itself: the real PNG from /public/maps when one exists, otherwise the
 * generated SVG diagram (re-packed into a Blob so it downloads as a file).
 * The blue button links out to a Google search for the airport's terminal-map
 * PDF — the site does not host PDFs, and searches such as "JFK airport
 * terminal map pdf" surface the official downloadable files.
 *
 * Both are shadcn Buttons; the green/blue branding comes in as classes so
 * the base (focus ring, sizing, transitions) stays shared.
 */

import { DownloadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
      <Button
        type="button"
        size="lg"
        onClick={downloadMap}
        className="max-sm:w-full gap-[9px] rounded-[10px] bg-[#1E8E4B] font-bold text-white shadow-[0_8px_18px_-10px_rgba(30,142,75,0.85)] hover:bg-[#1E8E4B] hover:brightness-110"
      >
        <DownloadIcon className="opacity-95" />
        {mapLabel}
      </Button>
      <Button asChild size="lg" className="max-sm:w-full gap-[9px] rounded-[10px] bg-[#0D6EFD] font-bold text-white shadow-[0_8px_18px_-10px_rgba(13,110,253,0.85)] hover:bg-[#0D6EFD] hover:brightness-110">
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`${iata} airport terminal map pdf`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DownloadIcon className="opacity-95" />
          {pdfLabel}
        </a>
      </Button>
    </div>
  );
}
