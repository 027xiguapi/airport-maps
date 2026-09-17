'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, getMessages, LOCALES } from '@/lib/i18n';

/**
 * Rendered when a page throws — most often a database connection problem.
 * Error boundaries must be client components and receive no route params, so
 * the locale is read from the pathname.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname() ?? '';
  const first = pathname.split('/').filter(Boolean)[0] ?? '';
  const locale = (LOCALES as readonly string[]).includes(first)
    ? (first as (typeof LOCALES)[number])
    : DEFAULT_LOCALE;

  const t = getMessages(locale);
  const base = `/${locale}`;

  return (
    <div className="page-head">
      <div className="page-head-inner">
        <div className="country-hero">
          <div>
            <h1>{t.error.title}</h1>
            <div className="sub">{t.error.sub}</div>
            <p className="result-note" style={{ marginTop: 18, color: 'rgba(255,255,255,.6)' }}>
              {error.message}
            </p>
            <div
              className="filterbar"
              style={{ marginTop: 20, background: 'transparent', border: 'none', padding: 0 }}
            >
              <div className="group">
                <button type="button" className="chip on" onClick={reset}>
                  {t.error.retry}
                </button>
                <Link className="chip" href={base}>
                  {t.error.backHome}
                </Link>
                <Link className="chip" href={`${base}/airports`}>
                  {t.nav.airports}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
