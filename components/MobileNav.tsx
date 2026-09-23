'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hamburger control for the primary navigation on small screens.
 *
 * It renders the toggle button and the nav panel as siblings (a fragment) so
 * that, on desktop, the links stay direct flex children of the bar's inner row
 * and the layout is unchanged — utilities simply hide the button above the
 * mobile breakpoint. Keeping the open state here lets `Header` remain a server
 * component. The menu closes on Escape, on a tap/click outside it, when a link
 * is chosen, and whenever the route changes.
 *
 * Both elements carry utilities instead of the old `.nav-toggle` / `.topnav`
 * rules: the bar is white in either theme (see Header.tsx), so the panel
 * surface is written as literals, and `data-[open=true]` replaces the
 * `[data-open="true"]` CSS hook.
 */
const TOGGLE_CLASSES =
  'hidden h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-[10px] border border-[#d8e4ee] bg-white text-[#5e768a] transition-[background-color] duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-[#f4f8fb] hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber aria-expanded:bg-[#f4f8fb] max-[820px]:order-1 max-[820px]:inline-flex';

/** Inline row on desktop; a dropdown panel below the bar at ≤820px. */
const PANEL_CLASSES =
  'flex flex-none items-center gap-1 max-[820px]:absolute max-[820px]:inset-x-0 max-[820px]:top-full max-[820px]:z-[120] max-[820px]:hidden max-[820px]:max-h-[calc(100vh-56px)] max-[820px]:flex-col max-[820px]:gap-1 max-[820px]:overflow-y-auto max-[820px]:border-t max-[820px]:border-t-[rgba(10,42,67,0.1)] max-[820px]:bg-[rgba(255,255,255,0.99)] max-[820px]:px-3 max-[820px]:pb-3.5 max-[820px]:pt-2.5 max-[820px]:[box-shadow:0_20px_34px_-20px_rgba(10,42,67,0.35)] max-[820px]:data-[open=true]:flex';

export default function MobileNav({
  label,
  navLabel,
  children,
}: {
  /** Accessible name for the toggle button (e.g. "Menu"). */
  label: string;
  /** Accessible name for the navigation landmark. */
  navLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Following a link navigates — always collapse the menu afterwards.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes; a pointer press outside the button + panel closes too.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('[data-nav-menu]')) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={TOGGLE_CLASSES}
        data-nav-menu
        aria-label={label}
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>
      <nav
        className={PANEL_CLASSES}
        id="primary-nav"
        data-nav-menu
        data-open={open}
        aria-label={navLabel}
        onClick={(event) => {
          if ((event.target as Element | null)?.closest('a')) setOpen(false);
        }}
      >
        {children}
      </nav>
    </>
  );
}
