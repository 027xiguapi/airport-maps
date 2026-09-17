import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AirportCard, { CountryChips } from '@/components/AirportCard';
import AirportTable from '@/components/AirportTable';
import Breadcrumb from '@/components/Breadcrumb';
import FilterBar from '@/components/FilterBar';
import Pager from '@/components/Pager';
import { formatNumber } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { intParam, oneOf, param, type RawSearchParams } from '@/lib/params';
import { getCountries, listAirports } from '@/lib/queries';
import { PAGE_SIZE } from '@/lib/site';
import type { AirportSort } from '@/lib/types';

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
  const page = intParam(sp, 'page');

  const title = q
    ? t.search.resultsTitle(q)
    : page > 1
      ? `${t.home.all.title} (${page})`
      : t.home.all.title;

  return {
    title,
    description: t.countries.description,
    alternates: {
      canonical: localizedPath(locale, '/airports'),
      languages: languageAlternates('/airports'),
    },
    // Filtered views duplicate the country pages, so keep them out of the index.
    robots:
      q || country || page > 1
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export default async function AirportsPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const sp = await searchParams;
  const q = param(sp, 'q');
  const country = param(sp, 'country').toUpperCase();
  const sort: AirportSort = oneOf(sp, 'sort', SORTS, 'pax');
  const page = intParam(sp, 'page');

  const [result, countries] = await Promise.all([
    listAirports(locale, { q, country, sort, page, perPage: PAGE_SIZE }),
    getCountries(locale),
  ]);

  const filters = { q, country, sort };
  const activeCountry = countries.find((c) => c.code === country);
  const totalAirports = countries.reduce((sum, c) => sum + c.airportCount, 0);

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
                  t.search.resultsCount(result.total)
                ) : (
                  <>
                    {t.units.airports(result.total)}
                    {result.pageCount > 1 &&
                      ` · ${formatNumber(result.page, locale)} / ${formatNumber(result.pageCount, locale)}`}
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
            {result.rows.map((airport) => (
              <AirportCard locale={locale} airport={airport} key={airport.iata} />
            ))}
          </div>
        ) : (
          <AirportTable locale={locale} airports={result.rows} showUpdated={sort === 'updated'} />
        )}

        {result.total === 0 && (
          <div className="empty-state">
            <div className="big">0</div>
            <p>{t.search.noResults}</p>
          </div>
        )}

        <Pager
          locale={locale}
          page={result.page}
          pageCount={result.pageCount}
          basePath="/airports"
          params={{ q, country, sort: sort === 'pax' ? '' : sort }}
        />

        {result.pageCount > 1 && (
          <p className="result-note" style={{ justifyContent: 'center', marginTop: 4 }}>
            {t.search.range(
              (result.page - 1) * result.perPage + 1,
              Math.min(result.page * result.perPage, result.total),
              result.total
            )}
          </p>
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
