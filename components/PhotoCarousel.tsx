'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { ArrowIcon, BackIcon, PauseIcon, PlayIcon } from '@/lib/icons';

/**
 * Homepage "latest airport photos" carousel: one picture per airport, six
 * slides, each linking to its airport page.
 *
 * The stage fills the left panel; the right panel carries the airport, the
 * editorial caption and the credit. Under the card sits a thumbnail strip —
 * real links to the six airport pages (so the section keeps six crawlable
 * links), whose click is intercepted to switch the slide instead, the same
 * pattern the route showcase's city tabs use. Middle-click and "open in new
 * tab" still land on the airport page. Every picture — the stage and each
 * thumbnail — also carries a visible button that goes straight to its airport
 * page without changing the slide first.
 *
 * It advances on its own until the visitor takes over — a real pointer
 * hovering it, keyboard focus inside it, or the pause button — and never
 * autoplays for a visitor who asked the OS to reduce motion. The next picture
 * is prefetched so the fade lands on a cached file, and the fade itself is the
 * shared `animate-route-fade` the route showcase uses.
 */

export type PhotoCarouselSlide = {
  iata: string;
  /** Localized airport name. */
  name: string;
  city: string;
  countryName: string;
  /** `/photos/<IATA>/<file>` */
  src: string;
  width: number | null;
  height: number | null;
  /** Editorial one-liner, already localized. */
  caption: string | null;
  /** Source credit, when the manifest knows one. */
  credit: { label: string; url: string | null } | null;
  /** Localized airport page. */
  href: string;
  /** Localized CTA / link text ("View Beijing Capital map"). */
  cta: string;
};

/** How long one picture stays up; the timeout resets on every switch. */
const SLIDE_MS = 6000;

export default function PhotoCarousel({
  slides,
  labels,
}: {
  slides: PhotoCarouselSlide[];
  labels: {
    ariaLabel: string;
    prev: string;
    next: string;
    play: string;
    pause: string;
    /**
     * Accessible name of each thumbnail ("Photo 3 of 6"), localized on the
     * server — functions cannot cross the server/client boundary.
     */
    dotLabels: string[];
    /** Label of the button overlaid on every picture ("Open airport page"). */
    open: string;
  };
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  const total = slides.length;
  const auto = playing && !reducedMotion && !hovering && !focusing;

  useEffect(() => {
    if (!auto || total < 2) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [auto, active, total]);

  // Warm the next picture while the current one is on screen.
  useEffect(() => {
    const next = slides[(active + 1) % total];
    if (!next?.src) return;
    const image = new window.Image();
    image.src = next.src;
  }, [active, slides, total]);

  const go = (delta: number) => setActive((index) => (index + delta + total) % total);

  /** Arrow keys in the tab strip select and focus the neighbouring airport. */
  const focusTab = (index: number) => {
    const next = (index + total) % total;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onTabKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const targets: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: total - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusTab(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  // Keyboard focus parks the carousel; a mouse click on a control does not
  // (its focus is not :focus-visible), so clicking through keeps it running.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (typeof target.matches === 'function' && target.matches(':focus-visible')) {
      setFocusing(true);
    }
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusing(false);
  };

  const slide = slides[active];
  if (!slide) return null;

  return (
    <div
      ref={regionRef}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerEnter={(event) => {
        // Only a real pointer pauses on hover: a tap emulates one on touch and
        // would otherwise keep the carousel off until the next tap.
        if (event.pointerType === 'mouse') setHovering(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovering(false);
      }}
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <div className="grid grid-cols-1 overflow-hidden border border-line bg-card [box-shadow:var(--shadow-sm)] lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
        {/* -------------------------------------------------- picture stage */}
        <div className="relative min-h-[300px] overflow-hidden bg-navy-950 sm:min-h-[380px] lg:min-h-[520px]">
          <Link
            href={slide.href}
            aria-label={slide.cta}
            className="group absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          >
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.caption ?? slide.name}
              width={slide.width ?? undefined}
              height={slide.height ?? undefined}
              loading={active === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 motion-safe:animate-route-fade motion-safe:group-hover:scale-[1.02]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy-950/80 to-transparent"
            />
          </Link>

          {/* A visible button on the picture itself: the stage's image link is
              easy to miss, and this is the affordance the strip repeats. */}
          <Link
            href={slide.href}
            aria-label={`${labels.open}: ${slide.name}`}
            title={labels.open}
            className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 border border-white/32 bg-navy-950/60 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-[3px] transition-colors duration-150 hover:border-amber hover:bg-amber hover:text-navy-950 sm:right-4 sm:top-4"
          >
            {labels.open}
            <ArrowIcon width={12} height={12} />
          </Link>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.prev}
                className="absolute left-3.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-navy-950/45 text-white/90 backdrop-blur-[3px] transition-colors duration-150 hover:border-amber hover:bg-amber hover:text-navy-950 sm:left-4"
              >
                <BackIcon />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={labels.next}
                className="absolute right-3.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-navy-950/45 text-white/90 backdrop-blur-[3px] transition-colors duration-150 hover:border-amber hover:bg-amber hover:text-navy-950 sm:right-4"
              >
                <ArrowIcon />
              </button>
            </>
          )}

          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <span className="inline-flex items-center gap-2 bg-navy-950/72 px-3 py-1.5 font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-amber backdrop-blur-[2px]">
              {slide.iata}
            </span>
            <span className="font-display text-[12.5px] font-medium tracking-[0.18em] text-white/85 [font-variant-numeric:tabular-nums]">
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Screen readers hear which picture of the set is showing; the strip
            below announces the airport names themselves. */}
        <p aria-live="polite" className="sr-only">
          {labels.dotLabels[active]}
        </p>

        {/* ------------------------------------------------------ text panel */}
        <div
          id="home-photo-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`home-photo-tab-${slide.iata}`}
          onKeyDown={onKeyDown}
          className="flex min-w-0 flex-col gap-5 p-6 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sky-500 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-balance text-[clamp(22px,2.2vw,30px)] font-black leading-[1.12] tracking-[0.005em] text-ink-heading">
                {slide.name}
              </h3>
              <p className="mt-1.5 text-[13.5px] text-ink-soft">
                {slide.city}
                <span aria-hidden="true"> · </span>
                {slide.countryName}
              </p>
            </div>
            {!reducedMotion && total > 1 && (
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? labels.pause : labels.play}
                title={playing ? labels.pause : labels.play}
                className="inline-flex h-9 w-9 flex-none items-center justify-center border border-line text-ink-soft transition-colors duration-150 hover:border-navy-900 hover:text-ink-heading [&>svg]:h-[12px] [&>svg]:w-[12px]"
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
            )}
          </div>

          {slide.caption && (
            <p className="m-0 border-l-2 border-amber pl-4 text-[15px] leading-[1.75] text-ink">
              {slide.caption}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-4">
            {slide.credit && (
              <p className="m-0 text-[11.5px] text-ink-faint">
                {slide.credit.url ? (
                  <a
                    href={slide.credit.url}
                    target="_blank"
                    // Attribution is not an endorsement; keep it out of the link
                    // graph the way the photo gallery's credits are.
                    rel="nofollow noopener noreferrer"
                    className="underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-sky-600"
                  >
                    {slide.credit.label}
                  </a>
                ) : (
                  slide.credit.label
                )}
              </p>
            )}

            <Link
              href={slide.href}
              className="inline-flex w-fit items-center gap-2 border border-ink-heading/35 px-[22px] py-2.5 text-[13.5px] font-semibold text-ink-heading transition-colors duration-150 hover:border-navy-900 hover:bg-navy-900 hover:text-white [&>svg]:transition-transform [&>svg]:duration-150 hover:[&>svg]:translate-x-[3px]"
            >
              {slide.cta}
              <ArrowIcon width={14} height={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- thumbnail strip */}
      {total > 1 && (
        <div
          role="tablist"
          aria-label={labels.ariaLabel}
          onKeyDown={onTabKeys}
          className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6"
        >
          {slides.map((item, index) => (
            <div
              key={item.iata}
              className={`group relative overflow-hidden border transition-colors duration-150 ${
                index === active ? 'border-amber' : 'border-line hover:border-navy-900/35'
              }`}
            >
              <Link
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                href={item.href}
                id={`home-photo-tab-${item.iata}`}
                role="tab"
                aria-selected={index === active}
                aria-controls="home-photo-panel"
                tabIndex={index === active ? 0 : -1}
                aria-label={`${item.name} (${item.iata})`}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(index);
                }}
                className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-500"
              >
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/2] w-full object-cover transition-[opacity,transform] duration-200 group-hover:opacity-95 motion-safe:group-hover:scale-[1.03]"
                />
                <span
                  className={`absolute left-2 top-2 inline-flex items-center bg-navy-950/72 px-1.5 py-0.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] backdrop-blur-[2px] ${
                    index === active ? 'text-amber' : 'text-white/85'
                  }`}
                >
                  {item.iata}
                </span>
              </Link>

              {/* Every picture carries its own jump button, so a visitor can
                  leave for the airport page without first selecting the slide. */}
              <Link
                href={item.href}
                aria-label={`${labels.open}: ${item.name}`}
                title={labels.open}
                className="absolute bottom-1.5 right-1.5 inline-flex h-[22px] w-[22px] items-center justify-center border border-white/35 bg-navy-950/70 text-white backdrop-blur-[2px] transition-colors duration-150 hover:border-amber hover:bg-amber hover:text-navy-950 [&>svg]:h-[11px] [&>svg]:w-[11px] [&>svg]:-rotate-45"
              >
                <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
