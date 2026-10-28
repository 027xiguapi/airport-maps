'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { AirportFlightBoard, FlightDirection } from '@/lib/types';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { intlLocale } from '@/lib/i18n/display';

/**
 * Searchable, paginated board for one airport's flights. The server renders the
 * first page (so it is in the HTML for no-JS visitors and crawlers); every
 * search, direction switch and page step after that comes from /api/flights,
 * because a hub's full board is far too large to send with the page.
 *
 * Labels arrive as plain strings from the server catalog — no message data is
 * bundled for the client. `{from}`, `{to}`, `{total}`, `{page}` and `{pages}`
 * placeholders are filled here with the page's own number formatting.
 */

export type FlightBoardLabels = {
  departures: string;
  arrivals: string;
  searchPlaceholder: string;
  clearSearch: string;
  flight: string;
  airline: string;
  destination: string;
  origin: string;
  country: string;
  empty: string;
  loading: string;
  error: string;
  retry: string;
  previous: string;
  next: string;
  pagination: string;
  showing: string;
  pageOf: string;
};

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export default function FlightBoard({
  iata,
  locale,
  initial,
  labels,
}: {
  iata: string;
  locale: Locale;
  initial: AirportFlightBoard;
  labels: FlightBoardLabels;
}) {
  const format = (value: number) => new Intl.NumberFormat(intlLocale(locale)).format(value);

  const [direction, setDirection] = useState<FlightDirection>(initial.direction);
  const [rows, setRows] = useState(initial.rows);
  const [page, setPage] = useState(initial.page);
  const [pageCount, setPageCount] = useState(initial.pageCount);
  const [total, setTotal] = useState(initial.total);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The query the current rows were fetched with (not the in-flight input). */
  const appliedRef = useRef('');

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    []
  );

  async function load(next: { direction: FlightDirection; page: number; query: string }) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        locale,
        dir: next.direction,
        page: String(next.page),
        q: next.query,
      });
      const response = await fetch(`/api/flights/${iata}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const board = (await response.json()) as AirportFlightBoard;
      setDirection(board.direction);
      setRows(board.rows);
      setPage(board.page);
      setPageCount(board.pageCount);
      setTotal(board.total);
      appliedRef.current = next.query;
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function scheduleSearch(value: string) {
    setInput(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void load({ direction, page: 1, query: value.trim() });
    }, 350);
  }

  function switchDirection(next: FlightDirection) {
    if (next === direction) return;
    setDirection(next);
    setPage(1);
    void load({ direction: next, page: 1, query: input.trim() });
  }

  function go(nextPage: number) {
    if (nextPage < 1 || nextPage > pageCount) return;
    void load({ direction, page: nextPage, query: appliedRef.current });
  }

  function clearSearch() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInput('');
    void load({ direction, page: 1, query: '' });
  }

  const first = total === 0 ? 0 : (page - 1) * initial.perPage + 1;
  const last = Math.min(page * initial.perPage, total);

  return (
    <div className="mt-5" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
        <div
          className="inline-flex overflow-hidden rounded-full border border-line bg-card [box-shadow:var(--shadow-sm)]"
          role="tablist"
        >
          {(['departures', 'arrivals'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={direction === value}
              className={
                direction === value
                  ? 'cursor-pointer border-0 bg-navy-800 px-4 py-2 font-display text-[13px] font-semibold text-white transition-colors duration-150'
                  : 'cursor-pointer border-0 bg-transparent px-4 py-2 font-display text-[13px] font-semibold text-ink-soft transition-colors duration-150 hover:text-ink'
              }
              onClick={() => switchDirection(value)}
            >
              {value === 'departures' ? labels.departures : labels.arrivals}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px] flex-1 min-[760px]:max-w-[380px]">
          <input
            className="h-[38px] w-full rounded-full border border-line bg-paper px-4 pr-9 text-[14px] text-ink outline-none focus:border-sky-500 [&::-webkit-search-cancel-button]:hidden"
            type="search"
            value={input}
            onChange={(event) => scheduleSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            spellCheck={false}
            autoComplete="off"
          />
          {input && (
            <button
              type="button"
              className="absolute top-1/2 right-1 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[18px] leading-none text-ink-faint hover:bg-paper hover:text-ink"
              onClick={clearSearch}
              aria-label={labels.clearSearch}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-line bg-card [box-shadow:var(--shadow-sm)]">
        <table className="rt-table max-[760px]:[&_th]:px-2.5 max-[760px]:[&_td]:px-2.5">
          <thead>
            <tr>
              <th>{labels.flight}</th>
              {/* The shared .rt-table mobile rule hides every table's second
                  header cell; this table keeps Airline and drops Country. */}
              <th className="max-[760px]:table-cell">{labels.airline}</th>
              <th>{direction === 'departures' ? labels.destination : labels.origin}</th>
              <th className="text-[12.5px] text-ink-soft max-[760px]:hidden">{labels.country}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const counterpart = row.city ? `${row.city} (${row.iata})` : row.iata;
              return (
                <tr key={`${row.number}-${row.iata}-${direction}`}>
                  <td>
                    <Link
                      className="font-display font-semibold whitespace-nowrap text-sky-600 tabular-nums no-underline hover:underline"
                      href={localizedPath(locale, `/flight/${row.number.toLowerCase()}`)}
                    >
                      {row.number}
                    </Link>
                  </td>
                  <td>
                    <span className="text-ink">{row.airline}</span>
                  </td>
                  <td>
                    <div className="dest">
                      <b>
                        {row.airportHref ? (
                          <Link
                            className="text-inherit no-underline hover:text-sky-600"
                            href={row.airportHref}
                          >
                            {counterpart}
                          </Link>
                        ) : (
                          counterpart
                        )}
                      </b>
                    </div>
                    {row.name && row.name !== row.iata && <span className="nm">{row.name}</span>}
                  </td>
                  <td className="text-[12.5px] text-ink-soft max-[760px]:hidden">{row.country}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="m-0 px-5 py-8 text-center text-[13.5px] text-ink-soft">
            {loading ? labels.loading : labels.empty}
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-[10px] border border-line bg-paper px-4 py-2.5 text-[13px] text-ink-soft">
          {labels.error}{' '}
          <button
            type="button"
            className="cursor-pointer font-semibold text-sky-600 underline underline-offset-2"
            onClick={() => void load({ direction, page, query: appliedRef.current })}
          >
            {labels.retry}
          </button>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-soft">
        <span role="status" aria-live="polite">
          {total === 0
            ? ''
            : fill(labels.showing, {
                from: format(first),
                to: format(last),
                total: format(total),
              })}
          {loading && <span className="text-ink-faint"> · {labels.loading}</span>}
        </span>
        <nav className="inline-flex items-center gap-2" aria-label={labels.pagination}>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 font-display text-[12.5px] text-ink-soft transition-colors duration-150 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => go(page - 1)}
            disabled={page <= 1 || loading}
          >
            ‹ {labels.previous}
          </button>
          <span aria-current="page">
            {fill(labels.pageOf, { page: format(page), pages: format(pageCount) })}
          </span>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 font-display text-[12.5px] text-ink-soft transition-colors duration-150 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => go(page + 1)}
            disabled={page >= pageCount || loading}
          >
            {labels.next} ›
          </button>
        </nav>
      </div>
    </div>
  );
}
