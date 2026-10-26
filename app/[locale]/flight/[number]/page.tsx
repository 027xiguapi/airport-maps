import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import TocNav, { type TocItem } from '@/components/TocNav';
import FlightHead from '@/components/flight/FlightHead';
import FlightAirportCard from '@/components/flight/FlightAirportCard';
import FlightRouteDiagram from '@/components/flight/FlightRouteDiagram';
import FlightRouteMap from '@/components/flight/FlightRouteMap';
import AdsterraBanner from '@/components/ads/AdsterraBanner';
import AdsterraStrip from '@/components/ads/AdsterraStrip';
import { Button } from '@/components/ui/button';
import { formatDate, formatDistance, formatNumber } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { flightPath, getFlightPage } from '@/lib/flight-page';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { buildFlightGraph } from './schema';
import { buildFlightPageFaq } from './faq';

export const revalidate = 3600;

/**
 * Standalone page for one flight number (/flight/<number>), laid out like the
 * airport page: navy header, then a two-column body with the contents rail on
 * the right. The source index has no timetable, so sections cover the route,
 * the two airports, distance, related flights and the FAQ instead.
 *
 * The route is intentionally dynamic: the index holds 300k+ numbers and
 * pre-rendering all of them would dwarf the rest of the build. Pages are cached
 * by ISR after the first request.
 */

type Props = { params: Promise<{ locale: string; number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, number } = await params;
  const locale = parseLocale(raw);
  if (!locale) return {};

  const flight = await getFlightPage(locale, number);
  if (!flight) notFound();

  const t = getMessages(locale);
  const primary = flight.primary;
  const distance = primary.km != null ? (formatDistance(primary.km, locale) ?? '') : '';
  const fromLabel = primary.origin.city
    ? `${primary.origin.city} (${primary.origin.iata})`
    : primary.origin.iata;
  const toLabel = primary.destination.city
    ? `${primary.destination.city} (${primary.destination.iata})`
    : primary.destination.iata;
  const title = t.flight.metaTitle(flight.number, flight.airline, fromLabel, toLabel);
  const description = t.flight.metaDescription(
    flight.number,
    flight.airline,
    fromLabel,
    toLabel,
    distance
  );
  const path = flightPath(locale, flight.number);

  return {
    title,
    description,
    keywords: [
      flight.number,
      `${flight.number} flight`,
      `${flight.airline} ${flight.number}`,
      `${primary.origin.name} ${primary.destination.name}`,
    ],
    alternates: {
      canonical: path,
      languages: languageAlternates(`/flight/${flight.number.toLowerCase()}`),
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: `${title} | ${t.site.name}`,
      description,
      url: path,
      locale: LOCALE_META[locale].ogLocale,
      ...(flight.dataDate ? { modifiedTime: flight.dataDate } : {}),
      authors: [absoluteUrl(localizedPath(locale, '/about'))],
    },
  };
}

function placeLabel(place: { city: string; iata: string }): string {
  return place.city ? `${place.city} (${place.iata})` : place.iata;
}

export default async function FlightPage({ params }: Props) {
  const { locale: raw, number } = await params;
  const locale = parseLocale(raw);
  if (!locale) notFound();

  const flight = await getFlightPage(locale, number);
  if (!flight) notFound();

  // Canonicalise to the lower-case flight number used by aviability and the
  // site's own links; the body accepts either case so existing links keep working.
  if (number !== flight.number.toLowerCase()) {
    permanentRedirect(flightPath(locale, flight.number));
  }

  const t = getMessages(locale);
  const primary = flight.primary;
  const fromLabel = placeLabel(primary.origin);
  const toLabel = placeLabel(primary.destination);
  const distance = primary.km != null ? formatDistance(primary.km, locale) : null;
  const hasRouteMap =
    primary.origin.lat != null &&
    primary.origin.lng != null &&
    primary.destination.lat != null &&
    primary.destination.lng != null;
  const faqItems = buildFlightPageFaq(locale, flight);
  const trail = [
    { label: t.common.home, href: '/' },
    { label: t.nav.airports, href: '/airports' },
    ...(primary.origin.href
      ? [{ label: primary.origin.name, href: `/airport/${primary.origin.iata}` }]
      : []),
    { label: flight.number },
  ];

  const tocItems: TocItem[] = [
    { id: 'flight-overview', label: t.toc.flightOverview },
    { id: 'flight-route', label: t.toc.flightRoute },
    { id: 'flight-airports', label: t.toc.flightAirports },
    { id: 'flight-details', label: t.toc.flightDetails },
    ...(flight.routes.length > 1 ? [{ id: 'flight-routes', label: t.toc.flightRoutes }] : []),
    ...(flight.related.length > 0 ? [{ id: 'flight-related', label: t.toc.flightRelated }] : []),
    { id: 'faq', label: t.toc.faq },
  ];

  return (
    <>
      <JsonLd data={buildFlightGraph({ locale, flight, faqItems })} />

      <FlightHead
        locale={locale}
        flight={flight}
        fromLabel={fromLabel}
        toLabel={toLabel}
        distance={distance}
        trail={trail}
      />

      <div className="ap-with-toc">
        <aside className="ap-toc">
          <TocNav items={tocItems} label={t.toc.label} />
          <AdsterraBanner unit="half-page" title={t.common.advertisement} className="mt-6" />
        </aside>

        <div className="ap-body">
          <section className="ap-extra" id="flight-overview" style={{ marginTop: 0 }}>
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.flight.overviewKicker}</div>
                <h2 className="section-title">
                  {t.flight.overviewTitle(flight.number)}
                  <span className="en">{t.flight.heading(flight.number)}</span>
                </h2>
              </div>
            </div>
            <p className="ap-desc">
              {t.flight.overviewBody(
                flight.number,
                flight.airline,
                primary.origin.name,
                primary.origin.iata,
                primary.destination.name,
                primary.destination.iata,
                distance ?? ''
              )}
            </p>
            <p className="ap-desc" style={{ opacity: 0.8 }}>
              {t.flight.overviewNote}
            </p>
          </section>

          <AdsterraStrip title={t.common.advertisement} className="my-12" />

          <section className="ap-extra" id="flight-route">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.flight.routeKicker}</div>
                <h2 className="section-title">
                  {t.flight.routeTitle(primary.origin.city, primary.destination.city)}
                  <span className="en">{t.toc.flightRoute}</span>
                </h2>
                <p className="sec-sub">
                  {primary.origin.iata} → {primary.destination.iata}
                  {distance ? ` · ${distance}` : ''}
                </p>
              </div>
            </div>
            {hasRouteMap ? (
              <FlightRouteMap
                origin={primary.origin}
                destination={primary.destination}
                labels={{
                  aria: t.flight.routeMapAria(flight.number),
                  reset: t.airport.routeReset,
                  zoomIn: t.airport.routeZoomIn,
                  zoomOut: t.airport.routeZoomOut,
                }}
              />
            ) : (
              <FlightRouteDiagram
                origin={primary.origin}
                destination={primary.destination}
                airline={flight.airline}
                distance={distance}
                label={t.flight.routeDiagramAria(flight.number)}
              />
            )}
          </section>

          <section className="ap-extra" id="flight-airports">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.flight.airportsKicker}</div>
                <h2 className="section-title">
                  {t.flight.airportsTitle}
                  <span className="en">{t.toc.flightAirports}</span>
                </h2>
                <p className="sec-sub">{t.flight.airportsSub}</p>
              </div>
            </div>
            <div className="fl-airports">
              <FlightAirportCard
                label={t.flight.originAirport}
                place={primary.origin}
                pageLabel={t.flight.viewAirport(primary.origin.iata)}
              />
              <FlightAirportCard
                label={t.flight.destinationAirport}
                place={primary.destination}
                pageLabel={t.flight.viewAirport(primary.destination.iata)}
              />
            </div>
          </section>

          <section className="ap-extra" id="flight-details">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.flight.detailsKicker}</div>
                <h2 className="section-title">
                  {t.flight.detailsTitle}
                  <span className="en">{t.toc.flightDetails}</span>
                </h2>
              </div>
            </div>
            <div className="detail-list fl-summary">
              <div className="detail-item">
                <div className="k">{t.flight.detailsFlight}</div>
                <div className="v">{flight.number}</div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsAirline}</div>
                <div className="v">{flight.airline}</div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsOrigin}</div>
                <div className="v">
                  {primary.origin.name} ({primary.origin.iata})
                </div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsDestination}</div>
                <div className="v">
                  {primary.destination.name} ({primary.destination.iata})
                </div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsDistance}</div>
                <div className="v">{distance ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsRoutes}</div>
                <div className="v">{formatNumber(flight.routes.length, locale)}</div>
              </div>
              <div className="detail-item">
                <div className="k">{t.flight.detailsSnapshot}</div>
                <div className="v">{flight.dataDate ? formatDate(flight.dataDate, locale) : '—'}</div>
              </div>
            </div>
            <div className="ext-links" style={{ marginTop: 18 }}>
              <Button asChild variant="outline">
                <a href={primary.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {t.flight.sourceFlight} ↗
                </a>
              </Button>
            </div>
          </section>

          {flight.routes.length > 1 && (
            <section className="ap-extra" id="flight-routes">
              <div className="section-head">
                <div>
                  <div className="section-kicker">{t.flight.routesKicker}</div>
                  <h2 className="section-title">
                    {t.flight.routesTitle}
                    <span className="en">{t.toc.flightRoutes}</span>
                  </h2>
                  <p className="sec-sub">
                    {t.flight.routesSub(formatNumber(flight.routes.length, locale))}
                  </p>
                </div>
              </div>
              <div className="rt-table-wrap">
                <table className="rt-table fl-routes-table">
                  <thead>
                    <tr>
                      <th>{t.flight.routesRoute}</th>
                      <th>{t.flight.routesAirline}</th>
                      <th className="num">{t.flight.routesDistance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flight.routes.map((route) => (
                      <tr key={`${route.origin.iata}-${route.destination.iata}-${route.airlineSlug}`}>
                        <td>
                          <b>
                            {route.origin.iata} → {route.destination.iata}
                          </b>
                          <span className="nm">
                            {route.origin.city} → {route.destination.city}
                          </span>
                        </td>
                        <td className="carr">{route.airline}</td>
                        <td className="num">
                          {route.km != null ? formatDistance(route.km, locale) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {flight.related.length > 0 && (
            <section className="ap-extra" id="flight-related">
              <div className="section-head">
                <div>
                  <div className="section-kicker">{t.flight.relatedKicker}</div>
                  <h2 className="section-title">
                    {t.flight.relatedTitle}
                    <span className="en">{t.flight.relatedEn}</span>
                  </h2>
                  <p className="sec-sub">{t.flight.relatedSub}</p>
                </div>
              </div>
              <ul className="fl-related">
                {flight.related.map((item) => (
                  <li key={item.number}>
                    <Link className="num" href={item.href}>
                      {item.number}
                    </Link>
                    <span>{item.airline}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AdsterraBanner
            unit="medium-rectangle"
            title={t.common.advertisement}
            className="my-12"
          />

          <div className="section-head" id="faq" style={{ marginTop: 46, marginBottom: 18 }}>
            <div>
              <div className="section-kicker">{t.flight.faqKicker}</div>
              <h2 className="section-title">
                {t.flight.faqTitle}
                <span className="en">{t.flight.faqEn}</span>
              </h2>
            </div>
          </div>
          <Faq items={faqItems} />

          <p className="rt-note">
            {t.flight.note(flight.dataDate ? formatDate(flight.dataDate, locale) : '—')}
            <a href="https://aviability.com/" target="_blank" rel="noopener noreferrer">
              {t.flight.source} ↗
            </a>
          </p>

          <div className="ext-links" style={{ marginTop: 26 }}>
            {primary.origin.href && (
              <Button asChild variant="outline">
                <Link href={primary.origin.href}>{t.flight.viewAirport(primary.origin.iata)}</Link>
              </Button>
            )}
            {primary.destination.href && (
              <Button asChild variant="outline">
                <Link href={primary.destination.href}>
                  {t.flight.viewAirport(primary.destination.iata)}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
