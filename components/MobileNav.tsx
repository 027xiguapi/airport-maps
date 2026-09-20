'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hamburger control for the primary navigation on small screens.
 *
 * It renders the toggle button and the `.topnav` panel as siblings (a fragment)
 * so that, on desktop, the links stay direct flex children of `.topbar-inner`
 * and the layout is unchanged — CSS simply hides the button above the mobile
 * breakpoint. Keeping the open state here lets `Header` remain a server
 * component. The menu closes on Escape, on a tap/click outside it, when a link
 * is chosen, and whenever the route changes.
 */
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
        className="nav-toggle"
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
        className="topnav"
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
