'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, localizedPath, type Locale } from '@/lib/i18n/config';

export type NavItem = { href: string; label: string };

/**
 * Link styling for the top-bar navigation, as utilities (it used to be the
 * `.topnav a` rules in globals.css). Breakpoints match the old media blocks:
 * 1080px tightens the inline row, and 820px turns each link into a full-height
 * row inside MobileNav's dropdown panel — the `bg-white/6` there is inherited
 * from the dark-bar era and reads as no fill on the now-white panel.
 *
 * The resting colour is the brand navy (`text-navy-800`, 12.8:1 on white)
 * rather than the muted grey-blue the nav carried over from the dark bar
 * (4.7:1); hover still steps up to `navy-900` so the state change stays visible.
 */
const LINK_CLASSES =
  'whitespace-nowrap rounded-lg px-3 py-2 text-[14px] text-navy-800 transition-[background-color,color] duration-150 hover:bg-[rgba(10,42,67,0.06)] hover:text-navy-900 max-[1080px]:px-[9px] max-[1080px]:py-2 max-[1080px]:text-[13.5px] max-[820px]:flex max-[820px]:min-h-[44px] max-[820px]:items-center max-[820px]:rounded-[10px] max-[820px]:bg-white/6 max-[820px]:px-3.5 max-[820px]:py-[11px] max-[820px]:text-[15px]';
/** Current page: the brand's amber pill. */
const ACTIVE_CLASSES = 'bg-amber font-semibold text-navy-900';

/**
 * Top-bar navigation. Rendered as a client component only because the active
 * state needs the current pathname; the labels and hrefs arrive as props from
 * the server so no message catalog is bundled.
 */
export default function NavLinks({
  locale,
  items,
  className,
}: {
  locale: Locale;
  items: NavItem[];
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;

  const rest = (() => {
    const segments = pathname.split('/').filter(Boolean);
    const body = (LOCALES as readonly string[]).includes(segments[0] ?? '')
      ? segments.slice(1)
      : segments;
    return body.length ? `/${body.join('/')}` : '/';
  })();

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.href === '/' ? rest === '/' : rest === item.href || rest.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={localizedPath(locale, item.href)}
            className={[LINK_CLASSES, isActive ? ACTIVE_CLASSES : '', className]
              .filter(Boolean)
              .join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
