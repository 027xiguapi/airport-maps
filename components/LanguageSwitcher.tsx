'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n/config';

type Props = {
  current: Locale;
  label: string;
  switchLabel: string;
};

/**
 * Language switcher. Uses <details> so the menu works without JavaScript, and
 * renders real links to each locale's equivalent path so crawlers discover the
 * translations. Selecting a language also records the choice in a cookie that
 * middleware reads when resolving a bare path.
 */
export default function LanguageSwitcher({ current, label, switchLabel }: Props) {
  const pathname = usePathname() ?? `/${current}`;

  // Strip the leading locale segment to get the locale-independent path.
  const segments = pathname.split('/').filter(Boolean);
  const rest = (LOCALES as readonly string[]).includes(segments[0] ?? '')
    ? segments.slice(1)
    : segments;
  const suffix = rest.length ? `/${rest.join('/')}` : '';

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
        {LOCALES.map((locale) => (
          <Link
            key={locale}
            href={`/${locale}${suffix}`}
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
