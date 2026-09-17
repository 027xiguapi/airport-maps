import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AirportCard, { CountryChips } from '@/components/AirportCard';
import AirportTable from '@/components/AirportTable';
import Breadcrumb from '@/components/Breadcrumb';
import FilterBar from '@/components/FilterBar';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { oneOf, param, type RawSearchParams } from '@/lib/params';
import { getAirportSummaries, getCountries, listAirports } from '@/lib/queries';
import type { AirportSort, AirportSummary } from '@/lib/types';

export const revalidate = 3600;

const SORTS = ['pax', 'name', 'iata', 'updated'] as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const t = getMessages(locale);
  const sp = await searchParams;
  const q = param(sp, 'q');
  const country = param(sp, 'country');
  const sort = oneOf(sp, 'sort', SORTS, 'pax');

  return {
    title: q ? t.search.resultsTitle(q) : t.home.all.title,
    description: t.countries.description,
    alternates: {
      canonical: localizedPath(locale, '/airports'),
      languages: languageAlternates('/airports'),
    },
    // Filtered and re-sorted views duplicate the canonical directory, so keep
    // them out of the index.
    robots:
      q || country || sort !== 'pax'
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

/** Ordering for the flat table view, applied across the whole directory. */
function sortRows(rows: AirportSummary[], sort: AirportSort, locale: Locale): AirportSummary[] {
  const byIata = (a: AirportSummary, b: AirportSummary) => a.iata.localeCompare(b.iata);
  switch (sort) {
    case 'iata':
      return [...rows].sort(byIata);
    case 'updated':
      return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || byIata(a, b));
    case 'name':
      return [...rows].sort((a, b) => a.name.localeCompare(b.name, locale) || byIata(a, b));
    default:
      // The query already returns busiest-first.
      return rows;
  }
}

export default async function AirportsPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const sp = await searchParams;
  const q = param(sp, 'q');
  const country = param(sp, 'country').toUpperCase();
  const sort: AirportSort = oneOf(sp, 'sort', SORTS, 'pax');

  const [countries, searchResult, allAirports] = await Promise.all([
    getCountries(locale),
    // The directory is small enough to sit on one page, so a search caps at
    // the directory size instead of paging.
    q ? listAirports(locale, { q, country, sort, page: 1, perPage: 100 }) : null,
    q ? [] : getAirportSummaries(locale),
  ]);

  const filters = { q, country, sort };
  const activeCountry = countries.find((c) => c.code === country);
  const totalAirports = countries.reduce((sum, c) => sum + c.airportCount, 0);

  // Default view: every airport on one page, grouped under its country. The
  // alternative sorts keep one flat, globally ordered table instead.
  const grouped = !q && sort === 'pax';
  const visible = country
    ? allAirports.filter((airport) => airport.countryCode === country)
    : allAirports;
  const groups = grouped
    ? countries
        .map((c) => ({
          country: c,
          airports: visible.filter((airport) => airport.countryCode === c.code),
        }))
        .filter((group) => group.airports.length > 0)
    : [];

  const total = q ? (searchResult?.total ?? 0) : visible.length;

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t.common.home, href: '/' },
              { label: t.nav.airports, href: q || country ? '/airports' : undefined },
              ...(activeCountry ? [{ label: activeCountry.name }] : []),
              ...(q ? [{ label: t.search.resultsTitle(q) }] : []),
            ]}
          />
          <div className="country-hero">
            <div>
              <h1>
                {q
                  ? t.search.resultsTitle(q)
                  : activeCountry
                    ? t.country.title(activeCountry.name)
                    : t.home.all.title}
              </h1>
              <div className="sub">
                {q ? (
                  t.search.resultsCount(total)
                ) : (
                  <>
                    {t.units.airports(total)}
                    {'. '}
                    {t.home.all.hint}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">
        <FilterBar
          locale={locale}
          filters={filters}
          countries={countries}
          total={totalAirports}
        />

        {q && (
          <p className="result-note">
            {t.search.noResultsHint}{' '}
            <Link href={localizedPath(locale, '/airports')} style={{ color: 'var(--sky-600)', fontWeight: 600 }}>
              {t.search.viewAll(totalAirports)}
            </Link>
            {' · '}
            <Link href={localizedPath(locale, '/countries')} style={{ color: 'var(--sky-600)', fontWeight: 600 }}>
              {t.search.orBrowseByCountry}
            </Link>
          </p>
        )}

        {q ? (
          <div className="cairport-grid">
            {(searchResult?.rows ?? []).map((airport) => (
              <AirportCard locale={locale} airport={airport} key={airport.iata} />
            ))}
          </div>
        ) : grouped ? (
          groups.map((group) => (
            <div className="country-block" key={group.country.code}>
              <div className="country-block-head">
                <img
                  className="flag"
                  src={group.country.flagUrl}
                  alt={group.country.name}
                  loading="lazy"
                />
                <h2>
                  <Link href={localizedPath(locale, `/country/${group.country.code}`)}>
                    {group.country.name}
                  </Link>
                </h2>
                <span className="cnt">{t.units.airports(group.airports.length)}</span>
              </div>
              <div className="cairport-grid">
                {group.airports.map((airport) => (
                  <AirportCard locale={locale} airport={airport} key={airport.iata} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <AirportTable
            locale={locale}
            airports={sortRows(visible, sort, locale)}
            showUpdated={sort === 'updated'}
          />
        )}

        {((q && total === 0) || (grouped && groups.length === 0)) && (
          <div className="empty-state">
            <div className="big">0</div>
            <p>{q ? t.search.noResults : t.table.empty}</p>
          </div>
        )}

        {/* crawlable links to every country so the directory is never a dead end */}
        <div className="section-head" style={{ marginTop: 42 }}>
          <div>
            <div className="section-kicker">{t.countries.title}</div>
            <h2 className="section-title">
              {t.home.countries.title}
              <span className="en">{t.home.countries.en}</span>
            </h2>
          </div>
        </div>
        <CountryChips locale={locale} countries={countries} />
      </section>
    </>
  );
}
