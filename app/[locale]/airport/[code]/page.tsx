import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import TocNav, { type TocItem } from '@/components/TocNav';
import { formatDistance, formatNumber, formatPax } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { getAirportGuide } from '@/lib/content';
import { getAirportByCode, getAirportNameZh, getAirportRoutes, getRelatedAirports } from '@/lib/queries';
import { getAirportGeo } from '@/lib/airport-geo';
import { airportWebsite } from '@/lib/airport-links';
import { mapImageUrl } from '@/lib/map-images';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { terminalMapSvg } from '@/lib/terminal-map';
import { buildAirportGraph, publicationDates } from './schema';
import { buildFaq } from './faq';
import AirportHead from '@/components/airport/AirportHead';
import TerminalMapPanel from '@/components/airport/TerminalMapPanel';
import AirportTimeSection from '@/components/airport/AirportTimeSection';
import AirportDetailsSection from '@/components/airport/AirportDetailsSection';
import RelatedLinks from '@/components/airport/RelatedLinks';
import LocationMapSection from '@/components/airport/LocationMapSection';
import GuideSection from '@/components/airport/GuideSection';
import TerminalsSection from '@/components/airport/TerminalsSection';
import TransitFacilities from '@/components/airport/TransitFacilities';
import RelatedAirports from '@/components/airport/RelatedAirports';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getAirportRoutes();
  return ['zh', 'en'].flatMap((locale) => routes.map((r) => ({ locale, code: r.iata })));
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
  const { published, modified } = publicationDates(airport, getAirportGuide(locale, airport.iata)?.updated);
  // Title is rendered at build/ISR time, so the year rolls over with revalidate.
  const title = t.common.latestAirportTitle(
    new Date().getFullYear(),
    airport.name,
    airport.iata
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
      publishedTime: published,
      modifiedTime: modified,
      authors: [absoluteUrl(localizedPath(locale, '/about'))],
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

  const [related, guide, nameZh] = await Promise.all([
    getRelatedAirports(locale, airport.countryCode, airport.iata, 6),
    Promise.resolve(getAirportGuide(locale, airport.iata)),
    getAirportNameZh(airport.iata),
  ]);

  const geo = getAirportGeo(airport.iata);
  const faqItems = buildFaq(locale, airport, formatDistance(airport.distanceKm, locale), geo?.tz ?? null);
  const { published, modified } = publicationDates(airport, guide?.updated);
  const mapImg = mapImageUrl(airport.iata);
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
    ...(geo ? [{ id: 'airport-time', label: t.toc.time }] : []),
    { id: 'airport-details', label: t.toc.details },
    { id: 'related-links', label: t.toc.links },
    ...(geo ? [{ id: 'location-map', label: t.toc.location }] : []),
    ...(guide ? [{ id: 'guide', label: t.toc.guide }] : []),
    ...(airport.terminals.length > 0 ? [{ id: 'terminals', label: t.toc.terminals }] : []),
    ...(airport.transit.length > 0 ? [{ id: 'transport', label: t.toc.transport }] : []),
    ...(airport.facilities.length > 0 ? [{ id: 'facilities', label: t.toc.facilities }] : []),
    { id: 'faq', label: t.toc.faq },
  ];

  return (
    <>
      <JsonLd data={buildAirportGraph({ locale, airport, guide, faqItems })} />

      <AirportHead locale={locale} airport={airport} published={published} modified={modified} />

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

          <TerminalMapPanel locale={locale} iata={airport.iata} mapImg={mapImg} mapSvg={mapSvg} />

          {geo && <AirportTimeSection locale={locale} iata={airport.iata} timeZone={geo.tz} />}

          <AirportDetailsSection locale={locale} airport={airport} geo={geo} />

          <RelatedLinks
            locale={locale}
            iata={airport.iata}
            nameEn={airport.nameEn}
            nameZh={nameZh ?? airport.name}
            website={airportWebsite(airport.iata)}
          />

          {geo && <LocationMapSection locale={locale} airportName={airport.name} geo={geo} />}

          {guide && <GuideSection locale={locale} guide={guide} />}

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
