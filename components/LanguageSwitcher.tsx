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
    <details className="lang" aria-label={switchLabel}>
      <summary className="lang-toggle" title={switchLabel}>
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
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="lang-menu">
        {PUBLISHED_LOCALES.map((locale) => (
          <Link
            key={locale}
            href={localizedPath(locale, suffix)}
            hrefLang={LOCALE_META[locale].htmlLang}
            aria-current={locale === current ? 'true' : undefined}
            onClick={() => remember(locale)}
          >
            <span>{LOCALE_META[locale].label}</span>
            <span className="code">{locale}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
