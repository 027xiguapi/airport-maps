import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AirportTable from '@/components/AirportTable';
import AirportMap from '@/components/AirportMap';
import { CountryGrid } from '@/components/AirportCard';
import CategoryGrid, { type CategoryCard } from '@/components/CategoryGrid';
import { PopularCities, UpdateList } from '@/components/HomeSections';
import JsonLd from '@/components/JsonLd';
import SearchBox from '@/components/SearchBox';
import { listGuidedAirports } from '@/lib/content';
import { formatNumber } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';
import {
  getAirportSummaries,
  getAirportsByCodes,
  getBusiestCities,
  getCityCount,
  getCountries,
  getRecentlyUpdated,
  getRegionCount,
  getStats,
} from '@/lib/queries';
import { absoluteUrl } from '@/lib/site';
import { getAirportGeo } from '@/lib/airport-geo';
import worldAirportsMeta from '@/lib/world-airports-meta.json';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const t = getMessages(locale);
  return {
    alternates: { canonical: localizedPath(locale, '/'), languages: languageAlternates('/') },
    openGraph: { url: localizedPath(locale, '/') },
    description: t.site.description,
  };
}

/** Airports offered as one-tap shortcuts under the search box. */
const SHORTCUTS = ['LHR', 'JFK', 'DXB', 'HND', 'SIN', 'PEK'];

export default async function HomePage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const guidedCodes = listGuidedAirports(locale);

  const [stats, cities, recent, countries, airports, cityCount, regionCount, guided] =
    await Promise.all([
      getStats(),
      getBusiestCities(locale, 5),
      getRecentlyUpdated(locale, 5),
      getCountries(locale),
      getAirportSummaries(locale),
      getCityCount(),
      getRegionCount(),
      getAirportsByCodes(locale, guidedCodes),
    ]);

  const shortcuts = await getAirportsByCodes(locale, SHORTCUTS);

  // Leaflet world map: the table summaries joined with static coordinates.
  const mapAirports = airports.flatMap((a) => {
    const geo = getAirportGeo(a.iata);
    return geo
      ? [{
          iata: a.iata,
          name: a.name,
          city: a.city,
          countryName: a.countryName,
          countryCode: a.countryCode,
          lat: geo.lat,
          lng: geo.lng,
          paxM: a.annualPaxM,
          region: a.region,
          url: localizedPath(locale, `/airport/${a.iata}`),
        }]
      : [];
  });

  const categoryCards: CategoryCard[] = [
    {
      href: '/airports',
      icon: 'terminal',
      title: t.categories.allAirports.title,
      body: t.categories.allAirports.body,
      meta: formatNumber(stats?.airportCount ?? 0, locale),
    },
    {
      href: '/countries',
      icon: 'globe',
      title: t.categories.byCountry.title,
      body: t.categories.byCountry.body,
      meta: formatNumber(stats?.countryCount ?? 0, locale),
    },
    {
      href: '/countries#regions',
      icon: 'region',
      title: t.categories.byRegion.title,
      body: t.categories.byRegion.body,
      meta: formatNumber(regionCount, locale),
    },
    {
      href: '#popular',
      icon: 'city',
      title: t.categories.popularCities.title,
      body: t.categories.popularCities.body,
      meta: formatNumber(cityCount, locale),
    },
    {
      href: '/airports?sort=updated',
      icon: 'clock',
      title: t.categories.recentlyUpdated.title,
      body: t.categories.recentlyUpdated.body,
    },
    {
      href: '#guides',
      icon: 'book',
      title: t.categories.guides.title,
      body: t.categories.guides.body,
      meta: guidedCodes.length ? formatNumber(guided.length, locale) : undefined,
    },
  ];

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.site.name,
    url: absoluteUrl(localizedPath(locale, '/')),
    description: t.site.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(localizedPath(locale, '/airports'))}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ---------------------------------------------------------- search hero */}
      <section className="hero">
        {/* Decorative layer only — the gradient itself lives on .hero-bg in
            globals.css, so there is no background image to load. */}
        <div className="hero-bg" />
        <div className="hero-veil" />
        <div className="hero-inner">
          <div className="hero-eyebrow">{t.hero.eyebrow}</div>
          <h1>
            {t.hero.titleLead}
            <br />
            <span className="accent">{t.hero.titleAccent}</span>
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>

          <SearchBox
            variant="hero"
            locale={locale}
            labels={{
              placeholder: t.search.heroPlaceholder,
              ariaLabel: t.search.ariaLabel,
              submit: t.search.submit,
              loading: t.search.loading,
              empty: t.search.empty,
            }}
          />

          {shortcuts.length > 0 && (
            <div className="hero-shortcuts">
              {shortcuts.map((airport) => (
                <Link href={localizedPath(locale, `/airport/${airport.iata}`)} key={airport.iata}>
                  <span className="code">{airport.iata}</span>
                  {airport.city}
                </Link>
              ))}
            </div>
          )}

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{formatNumber(stats?.countryCount ?? 0, locale)}</div>
              <div className="lbl">{t.hero.stats.countries}</div>
            </div>
            <div className="hero-stat">
              <div className="num">{formatNumber(stats?.airportCount ?? 0, locale)}</div>
              <div className="lbl">{t.hero.stats.airports}</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                <em>{formatNumber(stats?.terminalCount ?? 0, locale)}</em>
              </div>
              <div className="lbl">{t.hero.stats.terminals}</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- world airport map */}
      {mapAirports.length > 0 && (
        <section className="section" id="map">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t.home.map.kicker}</div>
              <h2 className="section-title">
                {t.home.map.title}
                <span className="en">{t.home.map.en}</span>
              </h2>
              <p className="sec-sub">
                {t.home.map.sub(
                  formatNumber(stats?.airportCount ?? 0, locale),
                  formatNumber(worldAirportsMeta.count, locale)
                )}
              </p>
            </div>
          </div>
          <AirportMap
            airports={mapAirports}
            labels={{
              all: t.home.map.all,
              groups: {
                europe: t.home.map.gEurope,
                asia: t.home.map.gAsia,
                americas: t.home.map.gAmericas,
                africa: t.home.map.gAfrica,
                oceania: t.home.map.gOceania,
              },
              legendSite: t.home.map.legendSite,
              legendWorld: t.home.map.legendWorld,
              countTemplate: t.home.map.countTemplate,
              download: t.home.map.download,
              downloadTitle: t.home.map.downloadTitle,
              openAirport: t.home.map.openAirport,
            }}
          />
        </section>
      )}

      {/* ------------------------------------------------- functional-area strip */}
      <section className="cat-section" id="browse">
        <div className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t.categories.kicker}</div>
              <h2 className="section-title">
                {t.categories.title}
                <span className="en">{t.categories.en}</span>
              </h2>
              <p className="sec-sub">{t.categories.sub}</p>
            </div>
          </div>
          <CategoryGrid locale={locale} cards={categoryCards} />
        </div>
      </section>

      {/* ------------------------------------------------------ popular cities */}
      <section className="section" id="popular">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.home.popular.kicker}</div>
            <h2 className="section-title">
              {t.home.popular.title}
              <span className="en">{t.home.popular.en}</span>
            </h2>
            <p className="sec-sub">{t.home.popular.sub}</p>
          </div>
        </div>
        <PopularCities locale={locale} cities={cities} />
      </section>

      {/* ---------------------------------------------------------- guides */}
      {guided.length > 0 && (
        <section className="section" id="guides">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t.guides.kicker}</div>
              <h2 className="section-title">
                {t.guides.title}
                <span className="en">{t.guides.en}</span>
              </h2>
              <p className="sec-sub">{t.guides.sub}</p>
            </div>
          </div>
          <div className="guide-grid">
            {guided.map((airport) => (
              <Link
                className="guide-card"
                href={localizedPath(locale, `/airport/${airport.iata}`)}
                key={airport.iata}
              >
                <div className="top">
                  <span className="iata">{airport.iata}</span>
                  <div className="flagline">
                    <img src={airport.flagUrl} alt="" loading="lazy" />
                    {airport.city} · {airport.countryName}
                  </div>
                </div>
                <h3>{airport.name}</h3>
                <div className="facts">
                  <span className="fact">{t.units.terminals(airport.terminalCount)}</span>
                  <span className="fact">{t.units.gates(airport.gateCount)}</span>
                </div>
                <span className="more">
                  {t.guides.more}
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ recently updated */}
      <section className="section" id="recent">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.home.recent.kicker}</div>
            <h2 className="section-title">
              {t.home.recent.title}
              <span className="en">{t.home.recent.en}</span>
            </h2>
            <p className="sec-sub">{t.home.recent.sub}</p>
          </div>
          <Link className="section-more" href={localizedPath(locale, '/airports?sort=updated')}>
            {t.home.all.more}
            <ArrowIcon />
          </Link>
        </div>
        <UpdateList locale={locale} airports={recent} />
      </section>

      {/* ------------------------------------------------------------ countries */}
      <section className="section" id="countries">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.home.countries.kicker}</div>
            <h2 className="section-title">
              {t.home.countries.title}
              <span className="en">{t.home.countries.en}</span>
            </h2>
            <p className="sec-sub">{t.home.countries.sub}</p>
          </div>
          <Link className="section-more" href={localizedPath(locale, '/countries')}>
            {t.home.countries.more}
            <ArrowIcon />
          </Link>
        </div>
        <CountryGrid locale={locale} countries={countries} />
      </section>

      {/* --------------------------------------------------------- all airports */}
      <section className="section" id="allairports">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.home.all.kicker}</div>
            <h2 className="section-title">
              {t.home.all.title}
              <span className="en">{t.home.all.en}</span>
            </h2>
            <p className="sec-sub">{t.home.all.sub}</p>
          </div>
          <Link className="section-more" href={localizedPath(locale, '/airports')}>
            {t.home.all.more}
            <ArrowIcon />
          </Link>
        </div>
        <AirportTable locale={locale} airports={airports} />
      </section>
    </>
  );
}
