'use client';

/**
 * Zoom control for the terminal-map panel: a small pill button that opens a
 * full-screen lightbox with the full-resolution map (the /terminal-maps image
 * when the repo hosts one, else the cover thumbnail). Built on the open-source
 * yet-another-react-lightbox with its Zoom plugin, which supplies wheel /
 * double-click / pinch zoom with drag-to-pan, plus backdrop-click, X-button
 * and Escape close, body-scroll locking and focus handling.
 */

import { useState } from 'react';
import { ZoomInIcon } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

export default function MapZoom({
  src,
  alt,
  label,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
}: {
  /** Full-size image URL shown in the lightbox. */
  src: string;
  alt: string;
  /** Button label ("放大" / "Zoom"). */
  label: string;
  /** Accessible label for the close button. */
  closeLabel: string;
  /** Titles for the lightbox zoom-in / zoom-out toolbar buttons. */
  zoomInLabel: string;
  zoomOutLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Dark-on-light to match the white terminal-map card (the panel used to
          be navy). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-none items-center gap-[6px] rounded-full border border-[#d8e4ee] px-3 py-[5px] text-[12px] font-semibold text-[#5e768a] transition-colors duration-150 hover:border-[#0f3454] hover:text-navy-900"
      >
        <ZoomInIcon className="h-[14px] w-[14px]" />
        {label}
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt }]}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
        labels={{
          Lightbox: alt,
          Close: closeLabel,
          'Zoom in': zoomInLabel,
          'Zoom out': zoomOutLabel,
        }}
        controller={{ closeOnPullDown: true }}
        styles={{
          container: {
            backgroundColor: 'rgba(7,27,48,0.93)',
            backdropFilter: 'blur(4px)',
          },
        }}
      />
    </>
  );
}
