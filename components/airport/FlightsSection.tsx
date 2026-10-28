import FlightBoard, { type FlightBoardLabels } from './FlightBoard';
import { formatDate, formatNumber } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportFlightBoard } from '@/lib/types';

/**
 * Airport-page flight section: board figures, the searchable departure/arrival
 * tables and the source note. Data comes from aviability.com's flight sitemaps
 * (lib/flights.ts, scripts/fetch-flights.mjs); an airport without flights in the
 * snapshot simply never renders this section.
 */
export default function FlightsSection({
  locale,
  airportName,
  iata,
  board,
}: {
  locale: Locale;
  airportName: string;
  iata: string;
  board: AirportFlightBoard;
}) {
  const t = getMessages(locale);
  const flights = t.airport.flights;
  const { counts } = board;
  const total = counts.departures + counts.arrivals;

  const labels: FlightBoardLabels = {
    departures: flights.tabDepartures,
    arrivals: flights.tabArrivals,
    searchPlaceholder: flights.search,
    clearSearch: flights.clearSearch,
    flight: flights.flight,
    airline: flights.airline,
    destination: flights.destination,
    origin: flights.origin,
    country: flights.country,
    empty: flights.empty,
    loading: flights.loading,
    error: flights.error,
    retry: flights.retry,
    previous: flights.previous,
    next: flights.next,
    pagination: flights.pagination,
    showing: flights.showing,
    pageOf: flights.pageOf,
  };

  return (
    <section className="ap-extra" id="flights">
      <div className="section-head">
        <div>
          <div className="section-kicker">{flights.kicker}</div>
          <h2 className="section-title">
            {flights.title(airportName)}
            <span className="en">{flights.en}</span>
          </h2>
          <p className="sec-sub">
            {flights.sub(
              formatNumber(total, locale),
              formatNumber(counts.airlines, locale),
              formatNumber(counts.destinations, locale)
            )}
          </p>
        </div>
      </div>

      <div className="detail-list grid-cols-2 min-[760px]:grid-cols-4">
        <div className="detail-item">
          <div className="k">{flights.statDepartures}</div>
          <div className="v">{formatNumber(counts.departures, locale)}</div>
        </div>
        <div className="detail-item">
          <div className="k">{flights.statArrivals}</div>
          <div className="v">{formatNumber(counts.arrivals, locale)}</div>
        </div>
        <div className="detail-item">
          <div className="k">{flights.statAirlines}</div>
          <div className="v">{formatNumber(counts.airlines, locale)}</div>
        </div>
        <div className="detail-item">
          <div className="k">{flights.statDestinations}</div>
          <div className="v">{formatNumber(counts.destinations, locale)}</div>
        </div>
      </div>

      <FlightBoard locale={locale} iata={iata} initial={board} labels={labels} />

      <p className="rt-note">
        {flights.note(formatDate(board.dataDate, locale))}
        <a href="https://aviability.com/" target="_blank" rel="noopener noreferrer">
          {flights.source} ↗
        </a>
      </p>
    </section>
  );
}
