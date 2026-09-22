'use client';

/**
 * Zoom control for the terminal-map panel: a small pill button that opens a
 * full-screen lightbox with the full-resolution map (the /terminal-maps image
 * when the repo hosts one, else the cover thumbnail). Closes on backdrop
 * click, the X button or Escape, and locks body scroll while open.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, ZoomInIcon } from 'lucide-react';

export default function MapZoom({
  src,
  alt,
  label,
  closeLabel,
}: {
  /** Full-size image URL shown in the lightbox. */
  src: string;
  alt: string;
  /** Button label ("放大" / "Zoom"). */
  label: string;
  /** Accessible label for the close button. */
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
      {/* Portal to <body>: ancestors like .map-panel-head carry their own
          z-index stacking context, which would bury the lightbox below the
          sticky topbar. */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(7,27,48,0.93)] p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors duration-150 hover:border-white/60 hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[86vh] max-w-full rounded-lg bg-navy-900 object-contain shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            />
          </div>,
          document.body
        )}
    </>
  );
}
