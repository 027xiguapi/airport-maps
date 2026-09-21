import Link from 'next/link';
import { Fragment } from 'react';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export type Crumb = { label: string; href?: string };

/** Breadcrumb trail on the shadcn primitives; hrefs are locale-independent and get the prefix here. */
export default function Breadcrumb({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const t = getMessages(locale);
  return (
    <BreadcrumbRoot aria-label={t.common.breadcrumbLabel} className="mb-[22px]">
      <BreadcrumbList>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <BreadcrumbItem>
                {item.href && !last ? (
                  <BreadcrumbLink asChild>
                    <Link href={localizedPath(locale, item.href)}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
