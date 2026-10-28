'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { ArrowIcon, PauseIcon, PlayIcon } from '@/lib/icons';

/**
 * Homepage route showpiece: the busiest airport's route-map render on the dark
 * left panel, and its city tabs on the light right panel. Picking a tab swaps
 * both the map and the airport card; the slideshow advances on its own until
 * the visitor takes over (hover, keyboard focus, or the pause control).
 *
 * The tabs are real links to /route/<IATA> (so the section keeps its twelve
 * crawlable links) whose click is intercepted to switch the slide instead.
 * Middle-click and "open in new tab" still land on the route page.
 *
 * Every image is keyed on its URL so switching cities replays the fade in
 * globals.css; the next slide's two images are prefetched so that fade lands on
 * a cached file rather than a blank frame.
 */

export type RouteShowcaseSlide = {
  iata: string;
  /** Localized airport name, the card's heading. */
  name: string;
  /** Localized city, the panel title and the tab label. */
  city: string;
  region: string;
  countryName: string;
  /** Static route-map render (public/route), drawn by scripts/generate-route-images.mjs. */
  mapImage: string;
  /** Alt text for the map render. */
  mapAlt: string;
  /** "N direct destinations…" sentence under the airport name. */
  teaser: string;
  /** Localized CTA over the label ("Explore Shanghai"). */
  cta: string;
  /** Localized route page the tab and the CTA both point at. */
  href: string;
  /** The airport's lead photo, when the repo holds a captioned one. */
  photo: {
    src: string;
    alt: string;
    credit: string | null;
    creditUrl: string | null;
  } | null;
};

/** How long one slide stays up; the timeout resets on every switch. */
const SLIDE_MS = 6000;

const TAB_PANEL_ID = 'home-route-panel';

export default function RouteShowcase({
  slides,
  labels,
}: {
  slides: RouteShowcaseSlide[];
  labels: {
    /** Eyebrow on the dark panel ("The route collection"). */
    collection: string;
    /** Accessible name for the tab list. */
    tabsLabel: string;
    play: string;
    pause: string;
  };
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // The slideshow is motion; a visitor who asked the OS to reduce it gets a
  // static first slide and no pause button.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  const auto = playing && !reducedMotion && !hovering && !focusing;

  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(
      () => setActive((index) => (index + 1) % slides.length),
      SLIDE_MS
    );
    return () => window.clearTimeout(timer);
  }, [auto, active, slides.length]);

  // Warm the next city's map and photo while the current one is on screen.
  useEffect(() => {
    const next = slides[(active + 1) % slides.length];
    for (const src of [next?.mapImage, next?.photo?.src]) {
      if (!src) continue;
      const image = new window.Image();
      image.src = src;
    }
  }, [active, slides]);

  // On phones the tab list is a horizontal scroller, so an autoplayed slide can
  // land on a tab that is out of view: keep the active one centred.
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[active];
    if (!list || !tab || list.scrollWidth <= list.clientWidth + 1) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const delta = tabBox.left - listBox.left - (listBox.width - tabBox.width) / 2;
    list.scrollBy({ left: delta, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [active, reducedMotion]);

  const slide = slides[active];
  const total = slides.length;

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

  // Keyboard focus parks the slideshow; a mouse click on a tab does not (its
  // focus is not :focus-visible), so clicking through cities keeps it running.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (typeof target.matches === 'function' && target.matches(':focus-visible')) {
      setFocusing(true);
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusing(false);
  };

  return (
    <div
      className="grid grid-cols-1 overflow-hidden border border-line bg-card [box-shadow:var(--shadow-sm)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
      // Only a real pointer pauses on hover: a tap emulates one on touch and
      // would otherwise keep the slideshow off until the next tap.
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovering(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovering(false);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* -------------------------------------------------- the map panel */}
      <div className="relative flex min-h-[420px] flex-col gap-5 overflow-hidden bg-navy-950 p-6 text-white sm:p-8 lg:min-h-[560px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(95%_70%_at_12%_0%,rgba(242,163,60,0.17)_0%,rgba(242,163,60,0)_62%)]"
        />
        <div className="relative">
          <div className="flex items-center gap-[9px] font-display text-[11.5px] font-semibold uppercase tracking-[0.26em] text-amber before:h-[2px] before:w-[26px] before:bg-amber before:content-['']">
            {labels.collection}
          </div>
          <h3 className="mt-3 text-balance text-[clamp(32px,3.6vw,52px)] font-black leading-[1.06] tracking-[-0.005em] text-white">
            {slide.city}
          </h3>
          <p className="mt-2.5 text-[13.5px] text-white/62">
            {slide.region} · {slide.countryName}
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white p-2 ring-1 ring-white/12">
          <img
            key={slide.mapImage}
            className="h-full w-full object-contain motion-safe:animate-route-fade"
            src={slide.mapImage}
            alt={slide.mapAlt}
            width={690}
            height={450}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <span className="font-display text-[12.5px] font-medium tracking-[0.22em] text-white/55 [font-variant-numeric:tabular-nums]">
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? labels.pause : labels.play}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/22 bg-white/6 text-white/80 transition-colors duration-150 hover:border-amber hover:text-amber [&>svg]:h-[13px] [&>svg]:w-[13px]"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------- the city panel */}
      <div className="flex min-w-0 flex-col gap-6 bg-card p-6 sm:p-8">
        <div
          ref={listRef}
          role="tablist"
          aria-label={labels.tabsLabel}
          onKeyDown={onTabKeys}
          className="flex min-w-0 gap-5 overflow-x-auto pb-1 [scroll-snap-type:x_proximity] sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0"
        >
          {slides.map((item, index) => {
            const current = index === active;
            return (
              <a
                key={item.iata}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`home-route-tab-${item.iata}`}
                role="tab"
                aria-selected={current}
                aria-controls={TAB_PANEL_ID}
                tabIndex={current ? 0 : -1}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(index);
                }}
                className={`group w-[88px] min-w-0 flex-none border-b-2 py-2.5 transition-colors duration-150 [scroll-snap-align:start] sm:w-auto ${
                  current ? 'border-amber' : 'border-transparent hover:border-line'
                }`}
              >
                <span
                  className={`block font-display text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    current ? 'text-amber' : 'text-ink-faint'
                  }`}
                >
                  {item.iata}
                </span>
                <span
                  className={`mt-1 block text-[14px] leading-snug ${
                    current
                      ? 'font-bold text-ink-heading'
                      : 'font-medium text-ink-soft transition-colors duration-150 group-hover:text-ink-heading'
                  }`}
                >
                  {item.city}
                </span>
              </a>
            );
          })}
        </div>

        <div
          id={TAB_PANEL_ID}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`home-route-tab-${slide.iata}`}
          className="flex min-h-0 flex-1 flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
        >
          {slide.photo && (
            <figure className="relative m-0 h-[180px] overflow-hidden bg-sky-100 sm:h-[230px]">
              <img
                key={slide.photo.src}
                className="h-full w-full object-cover motion-safe:animate-route-fade"
                src={slide.photo.src}
                alt={slide.photo.alt}
                loading="lazy"
                decoding="async"
              />
              {slide.photo.credit && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent px-3 pb-2 pt-8 text-[11px] leading-tight text-white/85">
                  {slide.photo.creditUrl ? (
                    <a
                      className="underline decoration-white/45 underline-offset-2 transition-colors duration-150 hover:text-white"
                      href={slide.photo.creditUrl}
                      target="_blank"
                      // Attribution is not an endorsement; keep it out of the
                      // link graph the way the photo gallery's credits are.
                      rel="nofollow noopener noreferrer"
                    >
                      {slide.photo.credit}
                    </a>
                  ) : (
                    slide.photo.credit
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0 flex-1 basis-[min(100%,240px)]">
              <h4 className="text-[15.5px] font-bold leading-snug text-ink-heading">
                {slide.name}
              </h4>
              <p className="mt-1 text-[13px] leading-[1.7] text-ink-soft">{slide.teaser}</p>
            </div>
            <Link
              href={slide.href}
              className="inline-flex flex-none items-center gap-2 border border-ink-heading/35 px-[22px] py-2.5 text-[13.5px] font-semibold text-ink-heading transition-colors duration-150 hover:border-navy-900 hover:bg-navy-900 hover:text-white [&>svg]:transition-transform [&>svg]:duration-150 hover:[&>svg]:translate-x-[3px]"
            >
              {slide.cta}
              <ArrowIcon width={14} height={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
