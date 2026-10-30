'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { PLANNED_LOCALES, PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';

type Props = {
  current: Locale;
  label: string;
  switchLabel: string;
  /** Heading of the registered-but-untranslated slice. */
  plannedLabel: string;
  /** Tooltip on a disabled language row. */
  plannedHint: string;
};

/**
 * Language switcher: every registered language — the four published ones as
 * real links to the equivalent path, the twenty planned ones as disabled rows
 * under "in preparation".
 *
 * The full 24-language list ships before the translations do, so the roadmap is
 * visible and adding a language later is a catalog file plus a sitemap rebuild
 * rather than a UI change. Planned rows are deliberately *not* links: their URL
 * prefixes are not routable yet (proxy.ts redirects them to the visitor's best
 * published language), so a link would silently bounce the visitor back to the
 * page they were already on.
 *
 * Uses <details> so the menu opens without JavaScript, and every active link is
 * a real anchor to the current page's equivalent path, which also lets crawlers
 * discover the translations. Selecting a language records the choice in a
 * cookie that the proxy reads when redirecting an unsupported prefix.
 */
export default function LanguageSwitcher({
  current,
  label,
  switchLabel,
  plannedLabel,
  plannedHint,
}: Props) {
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
      <summary
        className="inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[18px] border border-[#d8e4ee] bg-white px-2.5 text-[13.5px] font-medium text-[#5e768a] transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-[#f4f8fb] hover:text-navy-900"
        title={label}
      >
        {/* The full "Language" word cost ~45px and pushed the pill off a
            1280px window once the account chip joined the bar; the current
            language code is the same information in a tenth of the width. */}
        <span className="font-display text-[11.5px] font-semibold uppercase tracking-[0.08em]">
          {current}
        </span>
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
      <div className="absolute right-0 top-[42px] z-[130] max-h-[min(70vh,560px)] w-[228px] overflow-y-auto overscroll-contain rounded-xl border border-[#d8e4ee] bg-white [box-shadow:var(--shadow-lg)] max-[820px]:top-[38px]">
        {PUBLISHED_LOCALES.map((locale) => (
          <Link
            key={locale}
            href={localizedPath(locale, suffix)}
            hrefLang={LOCALE_META[locale].htmlLang}
            lang={LOCALE_META[locale].htmlLang}
            aria-current={locale === current ? 'true' : undefined}
            onClick={() => remember(locale)}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[14px] text-[#16324b] transition-[background-color] duration-[120ms] hover:bg-[#dcecf7] aria-[current=true]:bg-[#dcecf7] aria-[current=true]:font-bold aria-[current=true]:text-navy-800"
          >
            <span>{LOCALE_META[locale].label}</span>
            <span className="font-display text-[11px] uppercase tracking-[0.1em] text-[#8ca2b5]">
              {LOCALE_META[locale].htmlLang}
            </span>
          </Link>
        ))}

        {PLANNED_LOCALES.length > 0 && (
          <>
            <div className="border-t border-[#e4edf4] px-3.5 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#9db0c0]">
              {plannedLabel}
            </div>
            {PLANNED_LOCALES.map((locale) => (
              <div
                key={locale}
                aria-disabled="true"
                title={plannedHint}
                className="flex cursor-not-allowed items-center justify-between gap-3 px-3.5 py-2 text-[13.5px] text-[#9db0c0]"
              >
                <span lang={LOCALE_META[locale].htmlLang}>{LOCALE_META[locale].label}</span>
                <span className="font-display text-[10.5px] uppercase tracking-[0.1em] text-[#b6c6d3]">
                  {LOCALE_META[locale].htmlLang}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </details>
  );
}
