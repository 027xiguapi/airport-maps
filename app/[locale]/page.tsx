import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AirportMap from '@/components/AirportMap';
import { CountryGrid } from '@/components/AirportCard';
import CategoryGrid, { type CategoryCard } from '@/components/CategoryGrid';
import HeroRoutes from '@/components/HeroRoutes';
import HomeIntro from '@/components/HomeIntro';
import { PopularCities, RouteNav, UpdateList } from '@/components/HomeSections';
import JsonLd from '@/components/JsonLd';
import SearchBox from '@/components/SearchBox';
import { listGuidedAirports } from '@/lib/content';
import { formatNumber } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { ArrowIcon, GlobeIcon, RulerIcon, SwapIcon } from '@/lib/icons';
import { TOOL_CARD_CLASSES, TOOL_SLUGS, toolMessages } from '@/components/tool/shell';
import { Card } from '@/components/ui/card';
import {
  getAirportSummaries,
  getAirportsByCodes,
  getCityCount,
  getCountries,
  getRecentlyUpdated,
  getRegionCount,
  getStats,
} from '@/lib/queries';
import { mapImageCodes } from '@/lib/map-images';
import { routeDestinationCounts } from '@/lib/routes';
import { absoluteUrl, ORG_NODE_ID, SITE_NAME, SITE_URL, WEBSITE_NODE_ID } from '@/lib/site';
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
    openGraph: { siteName: SITE_NAME, url: localizedPath(locale, '/') },
    description: t.site.description,
  };
}

/** Airports offered as one-tap shortcuts under the search box. */
const SHORTCUTS = ['LHR', 'JFK', 'DXB', 'HND', 'SIN', 'PEK'];

/** Fisher–Yates over a copy, so callers can keep the original order. */
function shuffled<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default async function HomePage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const guidedCodes = listGuidedAirports(locale);

  const [stats, popularPool, recent, countries, airports, cityCount, regionCount, guided] =
    await Promise.all([
      getStats(),
      // Random 10 airports that have a /maps cover — reshuffles on every
      // (re)validation of the page.
      getAirportsByCodes(locale, mapImageCodes()),
      getRecentlyUpdated(locale, 5),
      getCountries(locale),
      getAirportSummaries(locale),
      getCityCount(),
      getRegionCount(),
      getAirportsByCodes(locale, guidedCodes),
    ]);

  const popular = shuffled(popularPool).slice(0, 10);
  // Guide tiles show the same 400px /maps covers; a few guided airports have
  // no cover yet and render an IATA wordmark placeholder instead.
  const coverCodes = new Set(mapImageCodes());

  const shortcuts = await getAirportsByCodes(locale, SHORTCUTS);

  // Route-map strip: rank the summaries already loaded above by how many
  // destinations the route dump gives them, keeping the order stable (count,
  // then IATA) so the internal links do not churn between revalidations.
  const routeCounts = routeDestinationCounts();
  const routeNav = airports
    .filter((airport) => routeCounts.has(airport.iata))
    .sort(
      (a, b) =>
        routeCounts.get(b.iata)! - routeCounts.get(a.iata)! || a.iata.localeCompare(b.iata)
    )
    .slice(0, 12)
    .map((airport) => ({ ...airport, destinationCount: routeCounts.get(airport.iata)! }));

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
    {
      href: '#routes',
      icon: 'plane',
      title: t.categories.routes.title,
      body: t.categories.routes.body,
      // Airports the route dump covers, not just the twelve on the strip.
      meta: formatNumber(airports.filter((a) => routeCounts.has(a.iata)).length, locale),
    },
  ];

  const websiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': WEBSITE_NODE_ID,
    name: SITE_NAME,
    alternateName: t.site.name,
    url: absoluteUrl(localizedPath(locale, '/')),
    description: t.site.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    publisher: { '@id': ORG_NODE_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(localizedPath(locale, '/airports'))}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png') },
      },
      websiteNode,
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ---------------------------------------------------------- search hero */}
      {/* The hero's chrome is utilities rather than the old `.hero-*` block in
          globals.css; HeroRoutes carries the animated arcs itself. */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        {/* The backdrop is a CSS background, which the browser's preload
            scanner cannot discover — hoist a preload for it so the hero's
            first paint does not wait for the CSSOM. */}
        <link rel="preload" as="image" href="/world-airport-map.jpg" fetchPriority="high" />
        {/* Two decorative layers: an amber glow top-right falling into the navy
            ramp, then the world-map photo under a scrim so the headline stays
            legible — the scrim's last stop is the flat navy the band continues
            in, which is what the old `.hero-veil` opacity stood in for. The
            photo is an unquoted url() on purpose: this class name also
            round-trips through server-rendered HTML, where quotes come back as
            entities that the bundler then tries to resolve as a module. */}
        <div className="absolute inset-0 [background-image:radial-gradient(120%_100%_at_70%_0%,rgba(242,163,60,0.18)_0%,rgba(242,163,60,0)_60%),linear-gradient(160deg,var(--navy-800)_0%,var(--navy-950)_100%)]" />
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat [background-image:linear-gradient(180deg,rgba(6,26,46,0.84)_0%,rgba(10,42,67,0.55)_55%,var(--navy-900)_100%),url(/world-airport-map.jpg)]" />
        <HeroRoutes />
        <div className="relative mx-auto max-w-[1240px] px-6 pb-[72px] pt-[92px] text-center max-[820px]:px-5 max-[820px]:pb-[52px] max-[820px]:pt-16">
          {/* The rule before the eyebrow is a pseudo-element, as in the old rule. */}
          <div className="mb-[22px] inline-flex items-center justify-center gap-2.5 font-display text-[13px] uppercase tracking-[0.28em] text-amber before:h-[2px] before:w-[34px] before:bg-amber before:content-['']">
            {t.hero.eyebrow}
          </div>
          <h1 className="mx-auto max-w-[760px] text-balance text-[clamp(34px,5.2vw,58px)] font-black leading-[1.18] tracking-[0.01em] max-[820px]:text-[32px]">
            {t.hero.titleLead}
            <br />
            <span className="text-amber">{t.hero.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-[18px] max-w-[620px] text-[16.5px] font-light text-white/82">
            {t.hero.sub}
          </p>

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
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-[520px]:gap-1.5">
              {shortcuts.map((airport) => (
                <Link
                  className="inline-flex items-center gap-[7px] rounded-[20px] border border-white/24 bg-white/10 px-[13px] py-1.5 text-[13px] text-white/90 transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-white/20 max-[520px]:px-[11px] max-[520px]:py-[5px] max-[520px]:text-[12.5px]"
                  href={localizedPath(locale, `/airport/${airport.iata}`)}
                  key={airport.iata}
                >
                  <span className="font-display font-semibold tracking-[0.05em] text-amber">
                    {airport.iata}
                  </span>
                  {airport.city}
                </Link>
              ))}
            </div>
          )}

          <div className="mx-auto mt-11 flex max-w-[560px] flex-wrap gap-0 overflow-hidden rounded-[14px] border border-white/16 bg-white/6 backdrop-blur-[4px]">
            <div className="min-w-[130px] flex-1 border-r border-r-white/14 px-[22px] py-[18px] last:border-r-0">
              <div className="font-display text-[32px] font-semibold leading-[1.1] text-white">
                {formatNumber(stats?.countryCount ?? 0, locale)}
              </div>
              <div className="mt-[3px] text-[12.5px] tracking-[0.04em] text-white/68">
                {t.hero.stats.countries}
              </div>
            </div>
            <div className="min-w-[130px] flex-1 border-r border-r-white/14 px-[22px] py-[18px] last:border-r-0">
              <div className="font-display text-[32px] font-semibold leading-[1.1] text-white">
                {formatNumber(stats?.airportCount ?? 0, locale)}
              </div>
              <div className="mt-[3px] text-[12.5px] tracking-[0.04em] text-white/68">
                {t.hero.stats.airports}
              </div>
            </div>
            <div className="min-w-[130px] flex-1 border-r border-r-white/14 px-[22px] py-[18px] last:border-r-0">
              <div className="font-display text-[32px] font-semibold leading-[1.1] text-white">
                {formatNumber(stats?.terminalCount ?? 0, locale)}
              </div>
              <div className="mt-[3px] text-[12.5px] tracking-[0.04em] text-white/68">
                {t.hero.stats.terminals}
              </div>
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

      {/* ------------------------------------------------------------- tools */}
      <section className="section" id="tools">
        <div className="section-head">
          <div>
            <div className="section-kicker">{t.tool.hub.kicker}</div>
            <h2 className="section-title">
              {t.tool.hub.title}
              <span className="en">{t.tool.hub.en}</span>
            </h2>
            <p className="sec-sub">{t.tool.hub.sub}</p>
          </div>
          <Link className="section-more" href={localizedPath(locale, '/tool')}>
            {t.tool.allTools}
            <ArrowIcon />
          </Link>
        </div>
        <div className="cat-grid">
          {TOOL_SLUGS.map((slug) => {
            const tool = toolMessages(t.tool, slug);
            const Icon =
                slug === 'coordinate-converter' ? SwapIcon : slug === 'dms-converter' ? GlobeIcon : RulerIcon;
            return (
                <Card asChild className={TOOL_CARD_CLASSES} key={slug}>
                <Link href={localizedPath(locale, `/tool/${slug}`)}>
                <span className="cat-icon transition-[background-color,color] duration-[160ms] group-hover:bg-navy-800 group-hover:text-white">
                  <Icon width={20} height={20} />
                </span>
                  <span className="cat-body">
                  <b>{tool.title}</b>
                  <span>{tool.description}</span>
                </span>
                  <span className="cat-meta">
                  <ArrowIcon width={14} height={14} />
                </span>
                </Link>
                </Card>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------- functional-area strip */}
      {/* `.section` is shared with every other page, so only the band and the
          extra bottom padding are local utilities: the inner section keeps
          .section's 64px top padding but needs a real bottom one too, or the
          content would sit on the band's own bottom border. */}
      <section className="border-y border-y-line bg-card" id="browse">
        <div className="section pb-16">
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
        <PopularCities locale={locale} airports={popular} />
      </section>

      {/* ----------------------------------------------------------- route maps */}
      {routeNav.length > 0 && (
        <section className="section" id="routes">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t.home.routes.kicker}</div>
              <h2 className="section-title">
                {t.home.routes.title}
                <span className="en">{t.home.routes.en}</span>
              </h2>
              <p className="sec-sub">{t.home.routes.sub}</p>
            </div>
          </div>
          <RouteNav locale={locale} airports={routeNav} />
        </section>
      )}

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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3.5">
            {guided.map((airport) => (
              <Link
                className="group flex flex-col overflow-hidden rounded-[14px] bg-navy-900 text-white transition-[transform,box-shadow] duration-[180ms] [box-shadow:var(--shadow-sm)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lg)]"
                href={localizedPath(locale, `/airport/${airport.iata}`)}
                key={airport.iata}
              >
                <span className="flex h-[150px] flex-none items-center justify-center bg-white p-2">
                  {coverCodes.has(airport.iata) ? (
                    <img
                      className="h-full w-full object-contain"
                      src={`/maps/${airport.iata}.png`}
                      alt={airport.name}
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display text-[44px] font-semibold tracking-[0.06em] text-navy-900/10">
                      {airport.iata}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col p-4">
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex-none font-display text-[12.5px] font-semibold tracking-[0.18em] text-amber">
                      {airport.iata}
                    </span>
                    <span className="flex min-w-0 items-center gap-[7px] truncate text-[12px] text-white/60">
                      <img
                        className="h-4 w-6 flex-none rounded-[3px] object-cover"
                        src={airport.flagUrl}
                        alt=""
                        loading="lazy"
                      />
                      {airport.city} · {airport.countryName}
                    </span>
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-white">
                    {airport.name}
                  </h3>
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-[20px] bg-white/10 px-2.5 py-[3px] text-[11.5px] text-white/80">
                      {t.units.terminals(airport.terminalCount)}
                    </span>
                    <span className="rounded-[20px] bg-white/10 px-2.5 py-[3px] text-[11.5px] text-white/80">
                      {t.units.gates(airport.gateCount)}
                    </span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 border-t border-dashed border-t-white/18 pt-3 text-[12.5px] font-semibold text-amber [&>svg]:transition-transform [&>svg]:duration-150 group-hover:[&>svg]:translate-x-[3px]">
                    {t.guides.more}
                    <ArrowIcon />
                  </span>
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

      {/* -------------------------------------------------------- site intro */}
      <HomeIntro locale={locale} />

    </>
  );
}
