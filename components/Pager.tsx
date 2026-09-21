import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

/** Shared box for every pager slot; states differ only in colour classes. */
const slot = cn(
  'h-[38px] min-w-[38px] rounded-[10px] border bg-card px-3 font-display text-[14px] tracking-[0.03em] no-underline'
);

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
    <nav
      className="my-[26px] mb-2 flex flex-wrap items-center justify-center gap-2"
      aria-label={t.pager.label}
    >
      {page > 1 ? (
        <Button asChild variant="outline" className={cn(slot, 'text-muted-foreground hover:bg-card hover:text-primary')}>
          <Link href={buildHref(locale, basePath, params, page - 1)} rel="prev" aria-label={t.pager.previous}>
            ‹
          </Link>
        </Button>
      ) : (
        <span aria-hidden="true" className={cn(slot, 'border-transparent bg-transparent opacity-45')}>
          ‹
        </span>
      )}

      {pageWindow(page, pageCount).map((entry, i) =>
        entry === 'gap' ? (
          <span key={`gap-${i}`} className={cn(slot, 'border-none bg-transparent')}>
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className={cn(slot, 'border-navy-800 bg-navy-800 font-semibold text-white')}
          >
            {entry}
          </span>
        ) : (
          <Button
            asChild
            key={entry}
            variant="outline"
            className={cn(slot, 'text-muted-foreground hover:bg-card hover:text-primary')}
          >
            <Link href={buildHref(locale, basePath, params, entry)}>{entry}</Link>
          </Button>
        )
      )}

      {page < pageCount ? (
        <Button asChild variant="outline" className={cn(slot, 'text-muted-foreground hover:bg-card hover:text-primary')}>
          <Link href={buildHref(locale, basePath, params, page + 1)} rel="next" aria-label={t.pager.next}>
            ›
          </Link>
        </Button>
      ) : (
        <span aria-hidden="true" className={cn(slot, 'border-transparent bg-transparent opacity-45')}>
          ›
        </span>
      )}
    </nav>
  );
}
