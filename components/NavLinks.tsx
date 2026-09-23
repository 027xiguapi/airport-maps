'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, localizedPath, type Locale } from '@/lib/i18n/config';

export type NavItem = { href: string; label: string };

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
            className={[className, isActive ? 'active' : ''].filter(Boolean).join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
