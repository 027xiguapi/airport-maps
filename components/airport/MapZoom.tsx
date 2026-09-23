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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-none items-center gap-[6px] rounded-full border border-white/25 px-3 py-[5px] text-[12px] font-semibold text-white/80 transition-colors duration-150 hover:border-white/60 hover:text-white"
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
