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
    <div className="fl-board" aria-busy={loading}>
      <div className="fl-toolbar">
        <div className="fl-tabs" role="tablist">
          {(['departures', 'arrivals'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={direction === value}
              className={direction === value ? 'fl-tab on' : 'fl-tab'}
              onClick={() => switchDirection(value)}
            >
              {value === 'departures' ? labels.departures : labels.arrivals}
            </button>
          ))}
        </div>

        <div className="fl-search">
          <input
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
              className="fl-clear"
              onClick={clearSearch}
              aria-label={labels.clearSearch}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="fl-table-wrap">
        <table className="rt-table fl-table">
          <thead>
            <tr>
              <th>{labels.flight}</th>
              <th>{labels.airline}</th>
              <th>{direction === 'departures' ? labels.destination : labels.origin}</th>
              <th className="fl-ctry">{labels.country}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const counterpart = row.city ? `${row.city} (${row.iata})` : row.iata;
              return (
                <tr key={`${row.number}-${row.iata}-${direction}`}>
                  <td>
                    <Link
                      className="fl-number"
                      href={localizedPath(locale, `/flight/${row.number.toLowerCase()}`)}
                    >
                      {row.number}
                    </Link>
                  </td>
                  <td>
                    <span className="fl-airline">{row.airline}</span>
                  </td>
                  <td>
                    <div className="dest">
                      <b>
                        {row.airportHref ? (
                          <Link href={row.airportHref}>{counterpart}</Link>
                        ) : (
                          counterpart
                        )}
                      </b>
                    </div>
                    {row.name && row.name !== row.iata && <span className="nm">{row.name}</span>}
                  </td>
                  <td className="fl-ctry">{row.country}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="fl-empty">{loading ? labels.loading : labels.empty}</p>}
      </div>

      {error && (
        <p className="fl-error">
          {labels.error}{' '}
          <button
            type="button"
            onClick={() => void load({ direction, page, query: appliedRef.current })}
          >
            {labels.retry}
          </button>
        </p>
      )}

      <div className="fl-footer">
        <span className="fl-showing" role="status" aria-live="polite">
          {total === 0
            ? ''
            : fill(labels.showing, {
                from: format(first),
                to: format(last),
                total: format(total),
              })}
          {loading && <span className="fl-loading"> · {labels.loading}</span>}
        </span>
        <nav className="fl-pager" aria-label={labels.pagination}>
          <button type="button" onClick={() => go(page - 1)} disabled={page <= 1 || loading}>
            ‹ {labels.previous}
          </button>
          <span aria-current="page">
            {fill(labels.pageOf, { page: format(page), pages: format(pageCount) })}
          </span>
          <button type="button" onClick={() => go(page + 1)} disabled={page >= pageCount || loading}>
            {labels.next} ›
          </button>
        </nav>
      </div>
    </div>
  );
}
