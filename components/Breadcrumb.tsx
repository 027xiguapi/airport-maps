import Link from 'next/link';
import { Fragment } from 'react';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

export type Crumb = { label: string; href?: string };

/** Breadcrumb trail; hrefs are locale-independent and get the prefix here. */
export default function Breadcrumb({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const t = getMessages(locale);
  return (
    <nav className="crumb" aria-label={t.common.breadcrumbLabel}>
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <span className="sep">/</span>}
          {item.href ? (
            <Link href={localizedPath(locale, item.href)}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
