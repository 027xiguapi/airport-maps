import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';
import type { AirportSummary, DirectoryStats } from '@/lib/types';

/** The busiest-airports table is a summary of the directory, not a full ranking. */
const BUSIEST_ROWS = 12;

type RegionRow = { region: string; airports: number; terminals: number; gates: number };

/** One cell grid shared by both tables, so their paddings line up. */
const TH =
  'whitespace-nowrap px-4 py-3 font-display text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint';
const TH_NUM = `${TH} text-right`;
const TD = 'px-4 py-2.5 align-middle text-ink-soft';
const TD_NUM = `${TD} text-right [font-variant-numeric:tabular-nums]`;

/**
 * Homepage "Lists & Tables" block. Every other section presents the directory
 * as cards and strips; this one writes the same figures out as real `<dl>`,
 * `<ul>` and `<table>` markup — captions, `scope`d headers, rows that link to
 * the airport they describe — which is the shape extraction-based search and AI
 * answer engines read and cite. Everything here comes from data the page has
 * already loaded, so the section costs no extra queries.
 */
export default function HomeFacts({
  locale,
  airports,
  stats,
  cityCount,
  regionCount,
  routeCount,
}: {
  locale: Locale;
  airports: AirportSummary[];
  stats: DirectoryStats | null;
  cityCount: number;
  regionCount: number;
  /** Airports with a route page — the route dump intersected with the directory. */
  routeCount: number;
}) {
  const t = getMessages(locale);
  const f = t.home.facts;

  // A stable order: volume first, then IATA, so nothing churns between
  // revalidations when two airports happen to sit on the same figure.
  const busiest = [...airports]
    .filter((airport) => airport.annualPaxM != null)
    .sort((a, b) => b.annualPaxM! - a.annualPaxM! || a.iata.localeCompare(b.iata))
    .slice(0, BUSIEST_ROWS);

  const grouped = new Map<string, RegionRow>();
  for (const airport of airports) {
    const row =
      grouped.get(airport.region) ?? { region: airport.region, airports: 0, terminals: 0, gates: 0 };
    row.airports += 1;
    row.terminals += airport.terminalCount;
    row.gates += airport.gateCount;
    grouped.set(airport.region, row);
  }
  const regions = [...grouped.values()].sort(
    (a, b) => b.airports - a.airports || a.region.localeCompare(b.region)
  );

  const coverage = [
    { label: f.coverage.airports, value: formatNumber(stats?.airportCount ?? airports.length, locale) },
    { label: f.coverage.countries, value: formatNumber(stats?.countryCount ?? 0, locale) },
    { label: f.coverage.regions, value: formatNumber(regionCount, locale) },
    { label: f.coverage.cities, value: formatNumber(cityCount, locale) },
    { label: f.coverage.terminals, value: formatNumber(stats?.terminalCount ?? 0, locale) },
    { label: f.coverage.gates, value: formatNumber(stats?.gateCount ?? 0, locale) },
    { label: f.coverage.routes, value: formatNumber(routeCount, locale) },
  ];

  return (
    <section className="section" id="facts">
      <div className="section-head">
        <div>
          <div className="section-kicker">{f.kicker}</div>
          <h2 className="section-title">
            {f.title}
            <span className="en">{f.en}</span>
          </h2>
          <p className="sec-sub">{f.sub}</p>
        </div>
      </div>

      <h3 className="text-[19px] font-black tracking-[0.01em] text-ink-heading">
        {f.coverageTitle}
      </h3>
      {/* 150px min so the seven figures land on one row at the section's full
          1240px measure; narrower viewports wrap them in pairs. */}
      <dl className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3">
        {coverage.map((item) => (
          <div className="rounded-[12px] border border-line bg-card px-[18px] py-4" key={item.label}>
            <dt className="text-[12px] tracking-[0.03em] text-ink-soft">{item.label}</dt>
            <dd className="mt-1.5 font-display text-[26px] font-semibold leading-none text-ink-heading [font-variant-numeric:tabular-nums]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12">
        <h3 className="text-[19px] font-black tracking-[0.01em] text-ink-heading">
          {f.busiest.title}
        </h3>
        <p className="mt-1.5 text-[14px] text-ink-soft">{f.busiest.sub}</p>
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-line bg-card">
          <table className="w-full min-w-[760px] border-collapse text-left text-[13.5px]">
            <caption className="sr-only">{f.busiest.caption}</caption>
            <thead>
              <tr className="border-b border-b-line">
                <th className={TH} scope="col">
                  {f.busiest.rank}
                </th>
                <th className={TH} scope="col">
                  {f.busiest.iata}
                </th>
                <th className={TH} scope="col">
                  {f.busiest.airport}
                </th>
                <th className={TH} scope="col">
                  {f.busiest.city}
                </th>
                <th className={TH} scope="col">
                  {f.busiest.country}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.busiest.terminals}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.busiest.gates}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.busiest.pax}
                </th>
              </tr>
            </thead>
            <tbody>
              {busiest.map((airport, i) => (
                <tr className="border-b border-b-line last:border-b-0" key={airport.iata}>
                  <td className={`${TD} text-ink-faint [font-variant-numeric:tabular-nums]`}>
                    {i + 1}
                  </td>
                  <th
                    className={`${TD} font-display font-semibold tracking-[0.05em] text-ink-heading`}
                    scope="row"
                  >
                    {airport.iata}
                  </th>
                  <td className={TD}>
                    <Link
                      className="font-semibold text-sky-600 hover:underline"
                      href={localizedPath(locale, `/airport/${airport.iata}`)}
                    >
                      {airport.name}
                    </Link>
                  </td>
                  <td className={TD}>{airport.city}</td>
                  <td className={TD}>{airport.countryName}</td>
                  <td className={TD_NUM}>{formatNumber(airport.terminalCount, locale)}</td>
                  <td className={TD_NUM}>{formatNumber(airport.gateCount, locale)}</td>
                  <td className={TD_NUM}>
                    {airport.annualPaxM != null ? formatNumber(airport.annualPaxM, locale) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-[19px] font-black tracking-[0.01em] text-ink-heading">
          {f.regions.title}
        </h3>
        <p className="mt-1.5 text-[14px] text-ink-soft">{f.regions.sub}</p>
        {/* Narrower than the busiest table on purpose: four columns read better
            as a panel than stretched across the full measure. */}
        <div className="mt-4 max-w-[560px] overflow-x-auto rounded-[12px] border border-line bg-card">
          <table className="w-full min-w-[380px] border-collapse text-left text-[13.5px]">
            <caption className="sr-only">{f.regions.caption}</caption>
            <thead>
              <tr className="border-b border-b-line">
                <th className={TH} scope="col">
                  {f.regions.region}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.regions.airports}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.regions.terminals}
                </th>
                <th className={TH_NUM} scope="col">
                  {f.regions.gates}
                </th>
              </tr>
            </thead>
            <tbody>
              {regions.map((row) => (
                <tr className="border-b border-b-line last:border-b-0" key={row.region}>
                  <th
                    className={`${TD} font-semibold text-ink-heading`}
                    scope="row"
                  >
                    {row.region}
                  </th>
                  <td className={TD_NUM}>{formatNumber(row.airports, locale)}</td>
                  <td className={TD_NUM}>{formatNumber(row.terminals, locale)}</td>
                  <td className={TD_NUM}>{formatNumber(row.gates, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
