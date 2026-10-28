import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Comments from '@/components/Comments';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import TocNav, { type TocItem } from '@/components/TocNav';
import { formatDistance, formatNumber, formatPax } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { getAirportGuide } from '@/lib/content';
import { blogAirportDates, blogPostPath, listBlogPostsForAirport } from '@/lib/blog';
import { getAirportByCode, getAirportRoutes, getRelatedAirports } from '@/lib/queries';
import { getAirportFacts } from '@/lib/airport-facts';
import { getAirportGeo } from '@/lib/airport-geo';
import { getAirportPhotos } from '@/lib/airport-photos';
import { getAirportRouteMap } from '@/lib/routes';
import { getAirportFlights } from '@/lib/flights';
import { routeImageUrl } from '@/lib/route-images';
import { airportWebsite } from '@/lib/airport-links';
import { mapImageUrl, terminalMapDownloads } from '@/lib/map-images';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { terminalMapSvg } from '@/lib/terminal-map';
import { buildAirportGraph, publicationDates } from './schema';
import { buildFaq, buildFlightFaq } from './faq';
import AirportHead from '@/components/airport/AirportHead';
import TerminalMapPanel from '@/components/airport/TerminalMapPanel';
import AirportTimeSection from '@/components/airport/AirportTimeSection';
import AirportDetailsSection from '@/components/airport/AirportDetailsSection';
import RelatedLinks from '@/components/airport/RelatedLinks';
import LocationMapSection from '@/components/airport/LocationMapSection';
import RouteMapTeaser from '@/components/airport/RouteMapTeaser';
import FlightsSection from '@/components/airport/FlightsSection';
import GuideSection from '@/components/airport/GuideSection';
import BlogPostsSection from '@/components/airport/BlogPostsSection';
import PhotosSection from '@/components/airport/PhotosSection';
import TerminalsSection from '@/components/airport/TerminalsSection';
import TransitFacilities from '@/components/airport/TransitFacilities';
import RelatedAirports from '@/components/airport/RelatedAirports';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getAirportRoutes();
  return PUBLISHED_LOCALES.flatMap((locale) => routes.map((r) => ({ locale, code: r.iata })));
}

type Props = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) return {};

  const t = getMessages(locale);
  const airport = await getAirportByCode(locale, code);
  // Resolved here rather than in the page body: a notFound() thrown before the
  // HTML shell is flushed renders the 404 into the initial document, whereas one
  // thrown during the page render can only reach the client through the RSC
  // stream (leaving a blank page for no-JS visitors).
  if (!airport) notFound();

  const pax = formatPax(airport.annualPaxM, locale);
  const distance = formatDistance(airport.distanceKm, locale);
  const guide = await getAirportGuide(locale, airport.iata);
  // Gallery photos double as the link-preview picture when the repo holds any
  // for this code; airports without a photo batch keep whatever the layout sets.
  const photos = getAirportPhotos(locale, airport.iata);
  const leadPhoto = photos[0];
  // A freshly published article about this airport counts as fresh content for
  // the page, even when the airport record itself has not been touched.
  const { published, modified } = publicationDates(
    airport,
    [guide?.updated, blogAirportDates().get(airport.iata)].filter(Boolean).sort().pop()
  );
  // Title is rendered at build/ISR time, so the year rolls over with revalidate.
  const title = t.common.latestAirportTitle(
    new Date().getFullYear(),
    airport.name,
    airport.iata,
    airport.terminals.length > 0
      ? { terminals: airport.terminals.length, gates: airport.gateCount }
      : undefined
  );
  const description = t.airport.metaDescription({
    name: airport.name,
    nameEn: airport.nameEn,
    iata: airport.iata,
    city: airport.city,
    country: airport.countryName,
    terminals: airport.terminals.length > 0 ? formatNumber(airport.terminals.length, locale) : null,
    gates: airport.gateCount > 0 ? formatNumber(airport.gateCount, locale) : null,
    pax: pax ?? '',
    distance: distance ?? '',
  });

  return {
    title,
    description,
    keywords: [
      airport.name,
      `${airport.iata} ${t.common.terminalMap}`,
      airport.nameEn,
      `${airport.iata} terminal map`,
    ],
    alternates: {
      canonical: localizedPath(locale, `/airport/${airport.iata}`),
      languages: languageAlternates(`/airport/${airport.iata}`),
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: `${title} | ${t.site.name}`,
      description,
      url: localizedPath(locale, `/airport/${airport.iata}`),
      locale: LOCALE_META[locale].ogLocale,
      publishedTime: published,
      modifiedTime: modified,
      authors: [absoluteUrl(localizedPath(locale, '/about'))],
      ...(leadPhoto && {
        images: [
          {
            url: absoluteUrl(leadPhoto.src),
            ...(leadPhoto.width && leadPhoto.height
              ? { width: leadPhoto.width, height: leadPhoto.height }
              : {}),
            alt: leadPhoto.caption ?? t.airport.photosAlt(airport.name, airport.iata, 1),
          },
        ],
      }),
    },
  };
}

export default async function AirportPage({ params }: Props) {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) notFound();

  const t = getMessages(locale);
  const airport = await getAirportByCode(locale, code);
  if (!airport) notFound();

  // Canonicalise descriptive slugs to the short IATA URL within this locale.
  if (code.toUpperCase() !== airport.iata) {
    permanentRedirect(localizedPath(locale, `/airport/${airport.iata}`));
  }

  const [related, guide, routeMap, flights] = await Promise.all([
    getRelatedAirports(locale, airport.countryCode, airport.iata, 6),
    getAirportGuide(locale, airport.iata),
    getAirportRouteMap(locale, airport.iata),
    // aviability.com flight numbers for this airport (departures and arrivals).
    // Null for airports the flight index does not cover — the section is skipped.
    getAirportFlights(locale, airport.iata),
  ]);

  const geo = getAirportGeo(airport.iata);
  const facts = getAirportFacts(airport.iata);
  // Articles from /blog that cover this airport, newest first. Rendered as a
  // section of its own and cited in the JSON-LD, so the walkthrough content the
  // blog holds is discoverable from the airport page rather than only through
  // the blog index.
  const blogPosts = listBlogPostsForAirport(locale, airport.iata, 4);
  // Real photos of this airport, when a batch has been downloaded for the code
  // (public/photos + manifest). Empty for most airports today.
  const photos = getAirportPhotos(locale, airport.iata);
  // Coordinates power the location map and the FAQ/service details that do not
  // need a timezone: hand-checked values first, the compiled facts otherwise.
  // The time section still requires the hand-checked timezone.
  const coords = geo
    ? { lat: geo.lat, lng: geo.lng }
    : facts?.lat != null && facts.lng != null
      ? { lat: facts.lat, lng: facts.lng }
      : null;
  const faqItems = [
    ...buildFaq(locale, airport, formatDistance(airport.distanceKm, locale), geo?.tz ?? null),
    ...(flights ? buildFlightFaq(locale, airport, flights) : []),
  ];
  // Newest of the record, the guide and the articles about this airport, which
  // both dateModified and the JSON-LD cite.
  const contentUpdated = [guide?.updated, blogAirportDates().get(airport.iata)]
    .filter(Boolean)
    .sort()
    .pop();
  const { published, modified } = publicationDates(airport, contentUpdated);
  const mapImg = mapImageUrl(airport.iata);
  const terminalMap = terminalMapDownloads(airport.iata);
  const mapSvg = terminalMapSvg({
    iata: airport.iata,
    name: airport.name,
    terminals: airport.terminals,
    locale,
  });

  /** Sections that actually render on this airport's page, in order. The
      terminals/transport/facilities entries drop out for directory batch
      airports whose data has not been compiled yet. */
  const tocItems: TocItem[] = [
    { id: 'terminal-map', label: t.toc.map },
    ...(photos.length > 0 ? [{ id: 'photos', label: t.toc.photos }] : []),
    ...(geo ? [{ id: 'airport-time', label: t.toc.time }] : []),
    ...(routeMap ? [{ id: 'airport-routes', label: t.toc.routes }] : []),
    ...(flights ? [{ id: 'flights', label: t.toc.flights }] : []),
    { id: 'airport-details', label: t.toc.details },
    { id: 'related-links', label: t.toc.links },
    ...(coords ? [{ id: 'location-map', label: t.toc.location }] : []),
    ...(guide ? [{ id: 'guide', label: t.toc.guide }] : []),
    ...(blogPosts.length > 0 ? [{ id: 'blog', label: t.toc.blog }] : []),
    ...(airport.terminals.length > 0 ? [{ id: 'terminals', label: t.toc.terminals }] : []),
    ...(airport.transit.length > 0 ? [{ id: 'transport', label: t.toc.transport }] : []),
    ...(airport.facilities.length > 0 ? [{ id: 'facilities', label: t.toc.facilities }] : []),
    { id: 'faq', label: t.toc.faq },
    { id: 'comments', label: t.comments.title },
  ];

  return (
    <>
      <JsonLd
        data={buildAirportGraph({
          locale,
          airport,
          guide,
          faqItems,
          photos,
          articles: blogPosts.map((post) => ({
            title: post.title,
            url: localizedPath(locale, blogPostPath(post.slug)),
            date: post.updated ?? post.date,
          })),
          contentUpdated,
        })}
      />

      <AirportHead
        locale={locale}
        airport={airport}
        published={published}
        modified={modified}
        title={t.common.airportHeading(airport.name, airport.terminals.length > 0)}
      />

      {/* Aside precedes the body in DOM so it stays on top when the rail
          collapses to a horizontal strip on narrow screens; on desktop the
          flex order places it on the right. */}
      <div className="ap-with-toc">
        <aside className="ap-toc">
          <TocNav items={tocItems} label={t.toc.label} />
        </aside>

        <div className="ap-body">
          {/* Descriptions are Markdown, stored per locale in airport_translations. */}
          <Markdown className="ap-desc">{airport.descriptionMd}</Markdown>

          <TerminalMapPanel
            locale={locale}
            iata={airport.iata}
            name={airport.name}
            mapImg={mapImg}
            mapSvg={mapSvg}
            terminalMapUrl={terminalMap.png}
            terminalPdfUrl={terminalMap.pdf}
          />

          {photos.length > 0 && (
            <PhotosSection locale={locale} iata={airport.iata} name={airport.name} photos={photos} />
          )}

          {geo && <AirportTimeSection locale={locale} iata={airport.iata} timeZone={geo.tz} />}

          {routeMap && (
            <RouteMapTeaser
              locale={locale}
              iata={airport.iata}
              airportName={airport.name}
              destinationCount={routeMap.destinations.length}
              image={routeImageUrl(airport.iata)}
            />
          )}

          {flights && (
            <FlightsSection
              locale={locale}
              airportName={airport.name}
              iata={airport.iata}
              board={flights}
            />
          )}

          <AirportDetailsSection
            locale={locale}
            airport={airport}
            coords={coords}
            tz={geo?.tz ?? null}
          />

          <RelatedLinks
            locale={locale}
            iata={airport.iata}
            name={airport.name}
            nameEn={airport.nameEn}
            // Encyclopedia entry title: the page's own wording on a Traditional
            // page, the source Chinese name otherwise (Baidu Baike is simplified).
            nameZh={locale === 'tw' ? airport.name : airport.nameZh}
            website={airportWebsite(airport.iata)}
          />

          {coords && <LocationMapSection locale={locale} airportName={airport.name} geo={coords} />}

          {guide && <GuideSection locale={locale} guide={guide} />}

          <BlogPostsSection locale={locale} iata={airport.iata} posts={blogPosts} />

          <TerminalsSection
            locale={locale}
            airportName={airport.name}
            terminals={airport.terminals}
          />

          <TransitFacilities locale={locale} transit={airport.transit} facilities={airport.facilities} />

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

          <Comments
            pageKind="airport"
            pageKey={airport.iata}
            locale={locale}
            lang={LOCALE_META[locale].htmlLang}
            labels={t.comments}
          />
        </div>
      </div>

      <RelatedAirports
        locale={locale}
        countryName={airport.countryName}
        countryCode={airport.countryCode}
        related={related}
      />
    </>
  );
}
