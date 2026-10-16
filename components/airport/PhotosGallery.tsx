'use client';

/**
 * Photo grid for the airport page's gallery section, plus the shared lightbox
 * it opens into. Client-side only because the lightbox holds open/index state;
 * the photos themselves are server data (lib/airport-photos.ts).
 *
 * Built on the same yet-another-react-lightbox as the terminal-map zoom control
 * (components/airport/MapZoom.tsx) so both viewers behave and look alike; here
 * the whole photo set is one slide deck, so the lightbox's own arrows walk the
 * gallery.
 */

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

export type GalleryPhoto = {
  src: string;
  width: number | null;
  height: number | null;
  /** Editorial caption, else the localized descriptive fallback (never empty). */
  alt: string;
  /** Editorial one-liner; null renders the figure without a caption paragraph. */
  caption: string | null;
  /** Credit line under the figure; null when the source host is unknown. */
  credit: { label: string; url: string | null; title: string | null } | null;
  /** Accessible label for the button that opens the lightbox. */
  zoomLabel: string;
};

export default function PhotosGallery({
  photos,
  label,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
}: {
  photos: GalleryPhoto[];
  /** Accessible name for the lightbox dialog. */
  label: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
}) {
  const [index, setIndex] = useState(-1);

  // A lone photo would stretch the full prose column at its natural aspect
  // ratio; two share a row; three or more fill the standard 3-up grid.
  const grid =
    photos.length === 1
      ? 'mx-auto grid max-w-[560px] gap-5'
      : photos.length === 2
        ? 'grid gap-5 sm:grid-cols-2'
        : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <div className={grid}>
        {photos.map((photo, i) => (
          <figure
            key={photo.src}
            className="overflow-hidden rounded-[14px] border border-line bg-card"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full cursor-zoom-in"
              aria-label={photo.zoomLabel}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width ?? undefined}
                height={photo.height ?? undefined}
                // The first picture is the section's lead; the rest defer.
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="aspect-[3/2] w-full bg-paper object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
            {(photo.caption || photo.credit) && (
              <figcaption className="px-4 py-3">
                {photo.caption && (
                  <p className="m-0 text-[13px] leading-[1.7] text-ink">{photo.caption}</p>
                )}
                {photo.credit && (
                  <p className="m-0 mt-1 text-[12px] text-ink-faint">
                    {photo.credit.url ? (
                      <a
                        href={photo.credit.url}
                        target="_blank"
                        // Attribution links are not endorsements; keep them out
                        // of the link graph the way the source line's other
                        // outbound links are handled.
                        rel="nofollow noopener noreferrer"
                        title={photo.credit.title ?? undefined}
                        className="underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-sky-600"
                      >
                        {photo.credit.label}
                      </a>
                    ) : (
                      photo.credit.label
                    )}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        slides={photos.map((photo) => ({
          src: photo.src,
          alt: photo.alt,
          title: photo.caption ?? undefined,
        }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
        labels={{
          Lightbox: label,
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
