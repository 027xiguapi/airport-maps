'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';

type Props = {
  current: Locale;
  label: string;
  switchLabel: string;
};

/**
 * Language switcher. Uses <details> so the menu works without JavaScript, and
 * renders real links to each published locale's equivalent path so crawlers
 * discover the translations. Selecting a language also records the choice in a
 * cookie that the proxy reads when redirecting an unsupported locale prefix.
 */
export default function LanguageSwitcher({ current, label, switchLabel }: Props) {
  const pathname = usePathname() ?? `/${current}`;

  // Strip the leading locale segment to get the locale-independent path. Bare
  // default-locale URLs (/airport/PEK) have no locale segment by design.
  const segments = pathname.split('/').filter(Boolean);
  const rest = (LOCALES as readonly string[]).includes(segments[0] ?? '')
    ? segments.slice(1)
    : segments;
  const suffix = rest.length ? `/${rest.join('/')}` : '/';

  const remember = (locale: Locale) => {
    document.cookie = `preferred-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <details className="group relative flex-none" aria-label={switchLabel}>
      {/* Utilities replace the old `.lang*` rules; colours are literals because
          the bar is white in either theme (see Header.tsx). The chevron's
          `group-open:` rotation was intended by the old CSS, but its
          `[data-open="true"]` hook was never set — this is the first time it
          actually runs. */}
      <summary className="inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[18px] border border-[#d8e4ee] bg-white px-3 text-[13.5px] font-medium text-[#5e768a] transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-[#f4f8fb] hover:text-navy-900 max-[820px]:px-2.5 max-[820px]:text-[13px]">
        <span>{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="opacity-70 transition-transform duration-150 group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute right-0 top-[42px] z-[130] min-w-[150px] overflow-hidden rounded-xl border border-[#d8e4ee] bg-white [box-shadow:var(--shadow-lg)] max-[820px]:top-[38px]">
        {PUBLISHED_LOCALES.map((locale) => (
          <Link
            key={locale}
            href={localizedPath(locale, suffix)}
            hrefLang={LOCALE_META[locale].htmlLang}
            aria-current={locale === current ? 'true' : undefined}
            onClick={() => remember(locale)}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[14px] text-[#16324b] transition-[background-color] duration-[120ms] hover:bg-[#dcecf7] aria-[current=true]:bg-[#dcecf7] aria-[current=true]:font-bold aria-[current=true]:text-navy-800"
          >
            <span>{LOCALE_META[locale].label}</span>
            <span className="font-display text-[11px] uppercase tracking-[0.1em] text-[#8ca2b5]">
              {locale}
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}
