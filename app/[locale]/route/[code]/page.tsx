import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import TocNav, { type TocItem } from '@/components/TocNav';
import AirportHead from '@/components/airport/AirportHead';
import AirportMapCard from '@/components/airport/AirportMapCard';
import RouteDataDownloads from '@/components/airport/RouteDataDownloads';
import RouteMapSection from '@/components/airport/RouteMapSection';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { BackIcon } from '@/lib/icons';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { mapImageUrl } from '@/lib/map-images';
import { getAirportByCode, getAirportRoutes } from '@/lib/queries';
import { getAirportRouteMap, routeAirportCodes, routeStats } from '@/lib/routes';
import { absoluteUrl, SITE_NAME, WEBSITE_NODE_ID } from '@/lib/site';
import { buildRouteFaq } from './faq';

export const revalidate = 3600;

/**
 * Standalone route map for one airport, laid out like the airport page it
 * belongs to: navy header, then a two-column body with the contents rail on the
 * right. Sections are the map, the destination table, the data download and an
 * FAQ computed from the route data. Only airports the route dump covers get a
 * page — everything else is left out of generateStaticParams and 404s.
 */
export async function generateStaticParams() {
  const [covered, airports] = await Promise.all([routeAirportCodes(), getAirportRoutes()]);
  const withRoutes = new Set(covered);
  return PUBLISHED_LOCALES.flatMap((locale) =>
    airports
      .filter((airport) => withRoutes.has(airport.iata))
      .map((airport) => ({ locale, code: airport.iata }))
  );
}

type Props = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) return {};

  const t = getMessages(locale);
  const airport = await getAirportByCode(locale, code);
  // Resolved here, not in the page body, for the reason documented on the
  // airport page: a notFound() thrown before the shell is flushed renders a
  // real 404 document instead of a blank RSC stream.
  if (!airport) notFound();
  const map = await getAirportRouteMap(locale, airport.iata);
  if (!map) notFound();

  const count = formatNumber(map.destinations.length, locale);
  // Rendered at build/ISR time, so the year rolls over with revalidate.
  const title = t.route.metaTitle(new Date().getFullYear(), airport.name, airport.iata, count);
  const description = t.route.metaDescription(airport.name, airport.iata, count);

  return {
    title,
    description,
    keywords: [
      airport.name,
      `${airport.iata} ${t.toc.routes}`,
      airport.nameEn,
      `${airport.iata} route map`,
      `${airport.iata} direct destinations`,
    ],
    alternates: {
      canonical: localizedPath(locale, `/route/${airport.iata}`),
      languages: languageAlternates(`/route/${airport.iata}`),
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: `${title} | ${t.site.name}`,
      description,
      url: localizedPath(locale, `/route/${airport.iata}`),
      modifiedTime: airport.updatedAt,
      authors: [absoluteUrl(localizedPath(locale, '/about'))],
    },
  };
}

export default async function AirportRoutePage({ params }: Props) {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) notFound();

  const t = getMessages(locale);
  const airport = await getAirportByCode(locale, code);
  if (!airport) notFound();

  // Canonicalise descriptive slugs to the short IATA URL within this locale.
  if (code.toUpperCase() !== airport.iata) {
    permanentRedirect(localizedPath(locale, `/route/${airport.iata}`));
  }

  const map = await getAirportRouteMap(locale, airport.iata);
  if (!map) notFound();

  const stats = routeStats(map);
  const count = formatNumber(stats.destinationCount, locale);
  const faqItems = buildRouteFaq(locale, airport.name, airport.iata, map);
  // Terminal-map picture for this code, when the repo has one (roughly a third
  // of route pages do) — the section and its contents-rail entry drop out
  // otherwise, rather than showing a placeholder.
  const mapImg = mapImageUrl(airport.iata);
  const pageUrl = absoluteUrl(localizedPath(locale, `/route/${airport.iata}`));
  const airportUrl = absoluteUrl(localizedPath(locale, `/airport/${airport.iata}`));

  /** Sections that render, in order — drives the contents rail. */
  const tocItems: TocItem[] = [
    { id: 'route-map', label: t.toc.routes },
    { id: 'destinations', label: t.route.tableToc },
    ...(mapImg ? [{ id: 'airport-map', label: t.toc.map }] : []),
    { id: 'route-data', label: t.route.dataTitle },
    { id: 'faq', label: t.airport.faqTitle },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              '@id': `${pageUrl}#breadcrumb`,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: t.common.home,
                  item: absoluteUrl(localizedPath(locale, '/')),
                },
                { '@type': 'ListItem', position: 2, name: airport.name, item: airportUrl },
                { '@type': 'ListItem', position: 3, name: t.toc.routes, item: pageUrl },
              ],
            },
            {
              '@type': 'WebPage',
              '@id': pageUrl,
              url: pageUrl,
              name: t.route.metaTitle(
                new Date().getFullYear(),
                airport.name,
                airport.iata,
                count
              ),
              description: t.route.metaDescription(airport.name, airport.iata, count),
              inLanguage: LOCALE_META[locale].htmlLang,
              isPartOf: { '@id': WEBSITE_NODE_ID },
              about: {
                '@type': 'Airport',
                name: airport.name,
                iataCode: airport.iata,
                url: airportUrl,
              },
            },
            {
              '@type': 'FAQPage',
              '@id': `${pageUrl}#faq`,
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ],
        }}
      />

      <AirportHead
        locale={locale}
        airport={airport}
        modified={airport.updatedAt}
        trail={[
          { label: t.common.home, href: '/' },
          { label: t.nav.airports, href: '/airports' },
          { label: airport.countryName, href: `/country/${airport.countryCode}` },
          { label: airport.name, href: `/airport/${airport.iata}` },
          { label: t.toc.routes },
        ]}
        title={t.route.heading(airport.name)}
        facts={[
          { num: count, label: t.route.factDestinations },
          { num: formatNumber(stats.airlineCount, locale), label: t.route.factAirlines },
          { num: formatNumber(stats.countryCount, locale), label: t.route.factCountries },
          { num: map.dataDate, label: t.route.factSnapshot },
        ]}
      />

      {/* Aside precedes the body in DOM so it stays on top when the rail
          collapses to a horizontal strip on narrow screens. */}
      <div className="ap-with-toc">
        <aside className="ap-toc">
          <TocNav items={tocItems} label={t.toc.label} />
        </aside>

        <div className="ap-body">
          <RouteMapSection
            locale={locale}
            airportName={airport.name}
            city={airport.city}
            iata={airport.iata}
            map={map}
          />

          <section className="ap-extra" id="route-data">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.route.dataKicker}</div>
                <h2 className="section-title">
                  {t.route.dataTitle}
                  <span className="en">{t.route.dataEn}</span>
                </h2>
              </div>
            </div>
            <RouteDataDownloads locale={locale} iata={airport.iata} map={map} />
          </section>

          {mapImg && (
            <section className="ap-extra" id="airport-map">
              <div className="section-head">
                <div>
                  <div className="section-kicker">{t.airport.mapEmbedKicker}</div>
                  <h2 className="section-title">
                    {t.airport.realMapTitle(airport.iata)}
                    <span className="en">{t.airport.realMapNote}</span>
                  </h2>
                  <p className="sec-sub">{t.route.airportMapSub}</p>
                </div>
              </div>
              <AirportMapCard locale={locale} iata={airport.iata} img={mapImg} />
            </section>
          )}

          <div className="section-head" id="faq" style={{ marginTop: 46, marginBottom: 18 }}>
            <div>
              <div className="section-kicker">{t.airport.faqKicker}</div>
              <h2 className="section-title">
                {t.airport.faqTitle}
                <span className="en">{t.airport.faqEn}</span>
              </h2>
            </div>
          </div>
          <Faq items={faqItems} />

          <div className="ext-links" style={{ marginTop: 26 }}>
            <Button asChild variant="outline">
              <Link href={localizedPath(locale, `/airport/${airport.iata}`)}>
                <BackIcon width={14} height={14} />
                {t.route.backToAirport(airport.iata)}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
