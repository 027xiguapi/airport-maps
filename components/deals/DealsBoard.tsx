'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import DealCard from '@/components/deals/DealCard';
import { formatDealLabel, type PublicDeal } from '@/lib/deal-format';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { DealsMessages } from '@/lib/i18n/deals';
import { SearchIcon } from '@/lib/icons';

type Props = {
  locale: string;
  /** BCP 47 tag used for price and date formatting. */
  lang: string;
  labels: DealsMessages;
  initialDeals: PublicDeal[];
  initialTotal: number;
  /** Cards per request; also the page size of the pagination. */
  pageSize?: number;
  /** Fixed departure-airport filter (airport page, airport query). */
  airport?: string | null;
  /** Show the destination/airline search field (the deals index page). */
  showSearch?: boolean;
  /** Page number the server rendered (1-based); only for `paginated`. */
  initialPage?: number;
  /** Search term the server rendered from `?q=`; only for `paginated`. */
  initialSearch?: string;
  /**
   * `true` shows numbered pagination (the /deals index). `false` keeps the
   * "load more" behaviour used by the homepage strip.
   */
  paginated?: boolean;
};

const NO_STORE = { cache: 'no-store' as const, headers: { Accept: 'application/json' } };

/** 1 … 4 5 6 … 12, with a bounded number of visible pages. */
function paginationItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const items: (number | 'ellipsis')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

/**
 * The live deals list.
 *
 * The server renders the first page for SEO and first paint; this component
 * refetches it on mount so a submission made a moment ago appears without
 * waiting for the page's ISR window. Search and pagination go through
 * /api/deals, which is also what keeps the list fresh when the visitor stays
 * on the page.
 */
export default function DealsBoard({
  locale,
  lang,
  labels,
  initialDeals,
  initialTotal,
  pageSize = 24,
  airport = null,
  showSearch = false,
  initialPage = 1,
  initialSearch = '',
  paginated = false,
}: Props) {
  const language = locale as Locale;
  const [deals, setDeals] = useState<PublicDeal[]>(initialDeals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);
  const [query, setQuery] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  // A stale response from a previous query must never overwrite a newer one.
  const requestId = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Debounce the search box. Only a real change resets to page 1, so the
  // server-rendered `?page=3` is not thrown away on mount.
  useEffect(() => {
    const next = query.trim();
    if (next === search) return;
    const timer = setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  const endpoint = useCallback(
    (offset: number) => {
      const params = new URLSearchParams({
        locale,
        limit: String(pageSize),
        offset: String(offset),
      });
      if (airport) params.set('airport', airport);
      if (search) params.set('q', search);
      return `/api/deals?${params.toString()}`;
    },
    [locale, pageSize, airport, search]
  );

  // Initial load, search change and page change all take this path.
  useEffect(() => {
    const controller = new AbortController();
    const id = ++requestId.current;
    const offset = paginated ? (page - 1) * pageSize : 0;
    setLoading(true);
    setFailed(false);

    fetch(endpoint(offset), { ...NO_STORE, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { deals?: PublicDeal[]; total?: number };
        if (!Array.isArray(data.deals)) throw new Error('malformed response');
        if (id !== requestId.current) return;
        setDeals(data.deals);
        setTotal(typeof data.total === 'number' ? data.total : data.deals.length);
        if (paginated) {
          // Keep the URL shareable/refresh-safe without a server round-trip:
          // both the search term and the page are part of it, so a refresh or
          // a shared link restores exactly this view.
          const url = new URL(window.location.href);
          if (search) url.searchParams.set('q', search);
          else url.searchParams.delete('q');
          if (page > 1) url.searchParams.set('page', String(page));
          else url.searchParams.delete('page');
          window.history.replaceState(window.history.state, '', url);
        }
      })
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError' || id !== requestId.current) return;
        setFailed(true);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });

    return () => controller.abort();
  }, [endpoint, reloadToken, page, paginated, pageSize]);

  // A page can disappear after its rows were deleted; step back to the last
  // page that still exists instead of showing an empty grid.
  useEffect(() => {
    if (!paginated) return;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (page > pages) setPage(pages);
  }, [paginated, page, total, pageSize]);

  // Keep the new page's first row in view when moving between pages.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (paginated) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page, paginated]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(endpoint(deals.length), NO_STORE);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { deals?: PublicDeal[]; total?: number };
      if (!Array.isArray(data.deals)) throw new Error('malformed response');
      setDeals((current) => {
        const seen = new Set(current.map((deal) => deal.id));
        return [...current, ...data.deals!.filter((deal) => !seen.has(deal.id))];
      });
      if (typeof data.total === 'number') setTotal(data.total);
    } catch {
      setFailed(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = deals.length < total;
  const submitHref = localizedPath(language, '/deals/new');

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages);
    if (target !== page) setPage(target);
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      {showSearch && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] max-w-[420px] flex-1">
            <input
              type="search"
              className="h-[42px] w-full border border-line bg-card pl-4 pr-11 text-[14px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus:border-sky-500 focus:[box-shadow:0_0_0_3px_rgba(46,125,179,0.15)]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              maxLength={80}
            />
            <span className="pointer-events-none absolute right-3.5 top-[13px] text-ink-faint">
              <SearchIcon />
            </span>
          </div>
          {loading && (
            <span className="text-[12.5px] text-ink-faint" role="status">
              {labels.loadingMore}
            </span>
          )}
        </div>
      )}

      {failed && deals.length === 0 ? (
        <div className="border border-dashed border-line bg-card px-6 py-9 text-center">
          <p className="m-0 text-[13.5px] text-ink-soft">{labels.loadError}</p>
          <button
            type="button"
            className="mt-3 border border-line bg-card px-4 py-2 text-[13px] font-semibold text-sky-600 transition-colors hover:border-sky-400"
            onClick={() => setReloadToken((value) => value + 1)}
          >
            {labels.retry}
          </button>
        </div>
      ) : deals.length === 0 ? (
        <div className="border border-dashed border-line bg-card px-6 py-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink-heading">
            {search ? labels.searchEmpty : labels.empty}
          </div>
          {!search && (
            <>
              <p className="mx-auto mt-2 max-w-[460px] text-[13.5px] leading-[1.75] text-ink-soft">
                {labels.emptyHint}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
                href={submitHref}
              >
                {labels.submit}
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                lang={lang}
                labels={labels}
                airportHref={localizedPath(language, `/airport/${deal.airport.iata}`)}
              />
            ))}
          </div>

          {paginated ? (
            totalPages > 1 && (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
                aria-label={labels.paginationLabel}
              >
                <button
                  type="button"
                  className="border border-line bg-card px-3 py-2 text-[12.5px] font-semibold text-sky-600 transition-colors hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  {labels.previousPage}
                </button>
                {paginationItems(page, totalPages).map((item, index) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1.5 text-[12.5px] text-ink-faint"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`min-w-[34px] border px-2.5 py-2 text-[12.5px] font-semibold transition-colors ${
                        item === page
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-line bg-card text-sky-600 hover:border-sky-400'
                      }`}
                      aria-current={item === page ? 'page' : undefined}
                      aria-label={formatDealLabel(labels.pageOf, {
                        page: item,
                        total: totalPages,
                      })}
                      onClick={() => goToPage(item)}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="border border-line bg-card px-3 py-2 text-[12.5px] font-semibold text-sky-600 transition-colors hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  {labels.nextPage}
                </button>
              </nav>
            )
          ) : (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[12.5px] text-ink-faint" role="status">
                {failed ? labels.loadError : ''}
              </span>
              {hasMore && (
                <button
                  type="button"
                  className="border border-line bg-card px-5 py-2.5 text-[13px] font-semibold text-sky-600 transition-colors hover:border-sky-400 disabled:opacity-60"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? labels.loadingMore : labels.loadMore}
                </button>
              )}
            </div>
          )}

          {paginated && (
            <p className="mt-3 text-center text-[12px] text-ink-faint">
              {formatDealLabel(labels.pageOf, { page, total: totalPages })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
