import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

type Props = {
  locale: Locale;
  page: number;
  pageCount: number;
  /** Locale-independent path, e.g. `/airports`. */
  basePath: string;
  /** Current query params; `page` is appended/overwritten. */
  params?: Record<string, string | undefined>;
};

function buildHref(
  locale: Locale,
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set('page', String(page));
  const qs = search.toString();
  return `${localizedPath(locale, basePath)}${qs ? `?${qs}` : ''}`;
}

/** Compact windowed pagination: 1 … 4 5 6 … 20 */
function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) {
    [pageCount - 1, pageCount - 2, pageCount - 3].forEach((p) => pages.add(p));
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) out.push('gap');
    out.push(p);
    previous = p;
  }
  return out;
}

export default function Pager({ locale, page, pageCount, basePath, params = {} }: Props) {
  const t = getMessages(locale);
  if (pageCount <= 1) return null;

  return (
    <nav className="pager" aria-label={t.pager.label}>
      {page > 1 ? (
        <Link
          href={buildHref(locale, basePath, params, page - 1)}
          rel="prev"
          aria-label={t.pager.previous}
        >
          ‹
        </Link>
      ) : (
        <span className="off" aria-hidden="true">
          ‹
        </span>
      )}

      {pageWindow(page, pageCount).map((entry, i) =>
        entry === 'gap' ? (
          <span className="gap" key={`gap-${i}`}>
            …
          </span>
        ) : entry === page ? (
          <span className="on" key={entry} aria-current="page">
            {entry}
          </span>
        ) : (
          <Link href={buildHref(locale, basePath, params, entry)} key={entry}>
            {entry}
          </Link>
        )
      )}

      {page < pageCount ? (
        <Link
          href={buildHref(locale, basePath, params, page + 1)}
          rel="next"
          aria-label={t.pager.next}
        >
          ›
        </Link>
      ) : (
        <span className="off" aria-hidden="true">
          ›
        </span>
      )}
    </nav>
  );
}
