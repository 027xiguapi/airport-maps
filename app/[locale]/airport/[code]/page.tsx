import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Faq, { type FaqItem } from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import AirportClock from '@/components/AirportClock';
import TocNav, { type TocItem } from '@/components/TocNav';
import { formatDate, formatDistance, formatNumber, formatPax } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon, Icon, ShopIcon, TrainIcon } from '@/lib/icons';
import { getAirportGuide } from '@/lib/content';
import { getAirportByCode, getAirportRoutes, getRelatedAirports } from '@/lib/queries';
import { getAirportGeo } from '@/lib/airport-geo';
import { mapImageUrl } from '@/lib/map-images';
import {
  absoluteUrl,
  EDITORIAL_NODE_ID,
  ORG_NODE_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_NODE_ID,
} from '@/lib/site';
import { terminalMapSvg } from '@/lib/terminal-map';
import type { AirportDetail } from '@/lib/types';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getAirportRoutes();
  return ['zh', 'en'].flatMap((locale) => routes.map((r) => ({ locale, code: r.iata })));
}

type Props = { params: Promise<{ locale: string; code: string }> };

/**
 * Machine-readable publication dates: dateModified is the latest of the
 * airport record's `updated_at` and the guide's frontmatter date, datePublished
 * the earliest signal we have (guide date, else the record date). Both are
 * `YYYY-MM-DD` strings, which compare lexicographically.
 */
function publicationDates(airport: AirportDetail, guideUpdated?: string) {
  const candidates = [airport.updatedAt, guideUpdated].filter(Boolean) as string[];
  const modified = candidates.sort().pop();
  const published = guideUpdated ?? airport.updatedAt;
  return { published, modified };
}

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
    terminals: formatNumber(airport.terminalCount, locale),
    gates: formatNumber(airport.gateCount, locale),
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

/** Resolves a transit entry to display text, falling back to its mode label. */
function transitLabel(
  locale: Locale,
  option: { icon: string; name: string }
): string {
  if (option.name) return option.name;
  const modes = getMessages(locale).transportModes;
  return modes[option.icon] ?? option.icon;
}

/** FAQ assembled from database fields, in the requested locale. */
function buildFaq(
  locale: Locale,
  airport: AirportDetail,
  distance: string | null,
  tz: string | null
): FaqItem[] {
  const t = getMessages(locale);
  const listSeparator = locale === 'en' ? ', ' : '、';
  const clauseSeparator = locale === 'en' ? '; ' : '；';

  const terminalList = airport.terminals
    .map((terminal) =>
      locale === 'en'
        ? `${terminal.name} (${terminal.code}, ${
            terminal.gateRange ? `gates ${terminal.gateRange}` : `${terminal.gateCount} gates`
          })`
        : `${terminal.name}（${terminal.code}，登机口 ${
            terminal.gateRange ?? `${terminal.gateCount} 个`
          }）`
    )
    .join(listSeparator);

  const airlineList = airport.terminals
    .filter((terminal) => terminal.airlines)
    .map((terminal) =>
      locale === 'en'
        ? `${terminal.name}: ${terminal.airlines}`
        : `${terminal.name}（${terminal.code}）：${terminal.airlines}`
    )
    .join(clauseSeparator);

  const transitSummary = airport.transit
    .map((option) => transitLabel(locale, option))
    .join(listSeparator);

  const accessList = airport.transit
    .map((option) => {
      const label = transitLabel(locale, option);
      return option.description ? `${label}${locale === 'en' ? ': ' : '：'}${option.description}` : label;
    })
    .join(clauseSeparator);

  return [
    {
      q: t.faq.terminalCount(airport.name),
      a: t.faq.terminalCountAnswer(
        airport.name,
        airport.iata,
        formatNumber(airport.terminals.length, locale),
        formatNumber(airport.gateCount, locale),
        terminalList
      ),
    },
    ...(airlineList
      ? [
          {
            q: t.faq.airlines(airport.name),
            a: t.faq.airlinesAnswer(airport.name, airlineList),
          },
        ]
      : []),
    {
      q: t.faq.distance(airport.name, airport.city),
      a: t.faq.distanceAnswer(airport.name, airport.city, distance ?? '—', transitSummary),
    },
    {
      q: t.faq.access(airport.name, airport.city),
      a: t.faq.accessAnswer(accessList),
    },
    {
      q: t.faq.facilities(airport.name),
      a: t.faq.facilitiesAnswer(
        airport.name,
        airport.facilities.map((f) => f.label).join(listSeparator)
      ),
    },
    {
      q: t.faq.location(airport.name),
      a: t.faq.locationAnswer(
        airport.name,
        airport.nameEn,
        airport.iata,
        airport.city,
        airport.cityEn ?? '',
        airport.countryName
      ),
    },
    ...(tz
      ? [
          {
            q: t.faq.timezone(airport.name),
            a: t.faq.timezoneAnswer(airport.name, airport.iata, tz),
          },
        ]
      : []),
  ];
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

  const [related, guide] = await Promise.all([
    getRelatedAirports(locale, airport.countryCode, airport.iata, 6),
    Promise.resolve(getAirportGuide(locale, airport.iata)),
  ]);

  const pax = formatPax(airport.annualPaxM, locale);
  const distance = formatDistance(airport.distanceKm, locale);
  const geo = getAirportGeo(airport.iata);
  const faqItems = buildFaq(locale, airport, distance, geo?.tz ?? null);
  const mapImg = mapImageUrl(airport.iata);
  const mapSvg = terminalMapSvg({
    iata: airport.iata,
    name: airport.name,
    terminals: airport.terminals,
    locale,
  });

  const { published, modified } = publicationDates(airport, guide?.updated);
  const pageTitle = t.common.latestAirportTitle(
    new Date().getFullYear(),
    airport.name,
    airport.iata
  );
  const pageDescription = t.airport.metaDescription({
    name: airport.name,
    nameEn: airport.nameEn,
    iata: airport.iata,
    city: airport.city,
    country: airport.countryName,
    terminals: formatNumber(airport.terminals.length, locale),
    gates: formatNumber(airport.gateCount, locale),
    pax: pax ?? '',
    distance: distance ?? '',
  });
  const pageUrl = absoluteUrl(localizedPath(locale, `/airport/${airport.iata}`));
  const airportNodeId = `${SITE_URL}/#airport-${airport.iata}`;

  /** Sections that actually render on this airport's page, in order. */
  const tocItems: TocItem[] = [
    { id: 'terminal-map', label: t.toc.map },
    ...(geo ? [{ id: 'airport-time', label: t.toc.time }] : []),
    { id: 'airport-details', label: t.toc.details },
    ...(geo ? [{ id: 'location-map', label: t.toc.location }] : []),
    ...(guide ? [{ id: 'guide', label: t.toc.guide }] : []),
    { id: 'terminals', label: t.toc.terminals },
    { id: 'transport', label: t.toc.transport },
    { id: 'facilities', label: t.toc.facilities },
    { id: 'faq', label: t.toc.faq },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            // Site identity, one exact brand spelling across every machine-
            // readable field (og:site_name and these nodes all use SITE_NAME).
            {
              '@type': 'Organization',
              '@id': ORG_NODE_ID,
              name: SITE_NAME,
              url: `${SITE_URL}/`,
              logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png') },
            },
            {
              '@type': 'Person',
              '@id': EDITORIAL_NODE_ID,
              name: t.editorial.authorName,
              description: t.editorial.sourcesNote,
              url: absoluteUrl(localizedPath(locale, '/about')),
              worksFor: { '@id': ORG_NODE_ID },
            },
            {
              '@type': 'WebSite',
              '@id': WEBSITE_NODE_ID,
              name: SITE_NAME,
              url: `${SITE_URL}/`,
              publisher: { '@id': ORG_NODE_ID },
            },
            {
              '@type': 'WebPage',
              '@id': pageUrl,
              url: pageUrl,
              name: pageTitle,
              description: pageDescription,
              inLanguage: LOCALE_META[locale].htmlLang,
              isPartOf: { '@id': WEBSITE_NODE_ID },
              about: { '@id': airportNodeId },
              mainEntity: { '@id': airportNodeId },
              author: { '@id': EDITORIAL_NODE_ID },
              publisher: { '@id': ORG_NODE_ID },
              datePublished: published,
              dateModified: modified,
              breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
            },
            {
              '@type': 'Airport',
              '@id': airportNodeId,
              name: airport.name,
              alternateName: airport.nameEn,
              iataCode: airport.iata,
              description: airport.descriptionMd,
              url: pageUrl,
              inLanguage: LOCALE_META[locale].htmlLang,
              address: {
                '@type': 'PostalAddress',
                addressLocality: airport.city,
                addressCountry: airport.countryCode,
              },
              containedInPlace: { '@type': 'Country', name: airport.countryName },
              ...(geo && {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: geo.lat,
                  longitude: geo.lng,
                },
              }),
            },
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
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: t.nav.airports,
                  item: absoluteUrl(localizedPath(locale, '/airports')),
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: airport.countryName,
                  item: absoluteUrl(localizedPath(locale, `/country/${airport.countryCode}`)),
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: airport.name,
                  item: absoluteUrl(localizedPath(locale, `/airport/${airport.iata}`)),
                },
              ],
            },
            {
              '@type': 'FAQPage',
              inLanguage: LOCALE_META[locale].htmlLang,
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ],
        }}
      />

      <div className="ap-head">
        <div className="ap-head-inner">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t.common.home, href: '/' },
              { label: t.nav.airports, href: '/airports' },
              { label: airport.countryName, href: `/country/${airport.countryCode}` },
              { label: airport.name },
            ]}
          />
          <div className="ap-title-row">
            <div className="ap-iata">{airport.iata}</div>
            <div className="ap-title">
              <h1>{airport.name}</h1>
              <div className="city">
                <img className="flag" src={airport.flagUrl} alt={airport.countryName} />
                <span>
                  {airport.city} · {airport.countryName}
                </span>
                <span style={{ opacity: 0.55 }}>· {airport.nameEn}</span>
              </div>
            </div>
          </div>
          {/* E-E-A-T byline: visible author attribution and freshness dates. */}
          <p className="ap-byline">
            <span>
              {t.editorial.role}
              <Link href={localizedPath(locale, '/about')}>{t.editorial.authorName}</Link>
            </span>
            {published && published !== modified && (
              <>
                <span className="sep">·</span>
                <span>{t.common.publishedOn(formatDate(published, locale))}</span>
              </>
            )}
            {modified && (
              <>
                <span className="sep">·</span>
                <span>{t.common.updatedOn(formatDate(modified, locale))}</span>
              </>
            )}
          </p>
          <div className="ap-facts">
            <div className="ap-fact">
              <div className="num">{formatNumber(airport.terminals.length, locale)}</div>
              <div className="lbl">{locale === 'en' ? 'Terminals' : '航站楼'}</div>
            </div>
            <div className="ap-fact">
              <div className="num">{formatNumber(airport.gateCount, locale)}</div>
              <div className="lbl">{locale === 'en' ? 'Gates' : '登机口'}</div>
            </div>
            <div className="ap-fact">
              <div className="num">{pax ?? '—'}</div>
              <div className="lbl">{t.units.paxFull}</div>
            </div>
            <div className="ap-fact">
              <div className="num">{distance ?? '—'}</div>
              <div className="lbl">{t.units.distance}</div>
            </div>
          </div>
        </div>
      </div>

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

        <div className="map-panel" id="terminal-map">
          <div className="map-panel-head">
            <div className="map-panel-title">
              <span className="dot" />
              {mapImg ? t.airport.realMapTitle(airport.iata) : t.airport.mapTitle(airport.iata)}
            </div>
            <div className="map-panel-note">{mapImg ? t.airport.realMapNote : t.airport.mapNote}</div>
          </div>
          {mapImg ? (
            <figure className="map-img-wrap">
              <img src={mapImg} alt={t.airport.realMapTitle(airport.iata)} decoding="async" />
            </figure>
          ) : (
            <>
              <div className="map-svg-wrap" dangerouslySetInnerHTML={{ __html: mapSvg }} />
              <div className="map-legend">
                <span className="map-legend-item">
                  <span
                    className="sw"
                    style={{
                      background: 'rgba(46,125,179,.45)',
                      boxShadow: '0 0 0 1px rgba(255,255,255,.6)',
                    }}
                  />
                  {t.airport.legendTerminal}
                </span>
                <span className="map-legend-item">
                  <span className="sw" style={{ background: '#F2A33C', borderRadius: '50%' }} />
                  {t.airport.legendTransit}
                </span>
                <span className="map-legend-item">
                  <span
                    className="sw"
                    style={{
                      background: 'transparent',
                      boxShadow: '0 0 0 1.5px rgba(255,255,255,.5) inset',
                    }}
                  />
                  {t.airport.legendCorridor}
                </span>
              </div>
            </>
          )}
        </div>

        {geo && (
          <section className="ap-extra" id="airport-time">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.airport.timeKicker}</div>
                <h2 className="section-title">
                  {t.airport.timeTitle(airport.iata)}
                  <span className="en">{t.airport.timeEn}</span>
                </h2>
                <p className="sec-sub">{t.airport.timeSub(airport.iata, geo.tz)}</p>
              </div>
            </div>
            <AirportClock
              locale={locale}
              timeZone={geo.tz}
              airportLabel={t.airport.clockAirport}
              localLabel={t.airport.clockLocal}
            />
          </section>
        )}

        <section className="ap-extra" id="airport-details">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t.airport.infoKicker}</div>
              <h2 className="section-title">
                {t.airport.infoTitle}
                <span className="en">{t.airport.infoEn}</span>
              </h2>
            </div>
          </div>
          <div className="detail-list">
            <div className="detail-item">
              <div className="k">{t.airport.infoIata}</div>
              <div className="v">{airport.iata}</div>
            </div>
            <div className="detail-item">
              <div className="k">{t.airport.infoLocation}</div>
              <div className="v">
                {airport.city} · {airport.countryName}
              </div>
            </div>
            {geo && (
              <>
                <div className="detail-item">
                  <div className="k">{t.airport.infoCoords}</div>
                  <div className="v">
                    {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="k">{t.airport.infoTimezone}</div>
                  <div className="v">{geo.tz}</div>
                </div>
              </>
            )}
          </div>
        </section>

        {geo && (
          <section className="ap-extra" id="location-map">
            <div className="section-head">
              <div>
                <div className="section-kicker">{t.airport.mapEmbedKicker}</div>
                <h2 className="section-title">
                  {t.airport.mapEmbedTitle(airport.name)}
                  <span className="en">{t.airport.mapEmbedEn}</span>
                </h2>
              </div>
            </div>
            <div className="map-embed">
              <iframe
                title={t.airport.mapEmbedTitle(airport.name)}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo.lng - 0.07}%2C${
                  geo.lat - 0.04
                }%2C${geo.lng + 0.07}%2C${geo.lat + 0.04}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
                loading="lazy"
              />
            </div>
            <p className="ext-note">{t.airport.extMapsNote}</p>
            <div className="ext-links">
              <a
                className="ext-btn"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`}
              >
                Google Maps ↗
              </a>
              <a
                className="ext-btn"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=13/${geo.lat}/${geo.lng}`}
              >
                OpenStreetMap ↗
              </a>
              <a
                className="ext-btn"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.bing.com/maps?q=${geo.lat},${geo.lng}`}
              >
                Bing Maps ↗
              </a>
            </div>
          </section>
        )}

        {/* Optional long-form guide from content/<locale>/airports/<IATA>.md */}
        {guide && (
          <section id="guide">
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <div className="section-kicker">{t.airport.guideKicker}</div>
                <h2 className="section-title">
                  {guide.title ?? t.airport.guideTitle}
                  <span className="en">{t.airport.guideEn}</span>
                </h2>
              </div>
              {guide.updated && (
                <span className="guide-meta">
                  {t.common.updatedOn(formatDate(guide.updated, locale))}
                </span>
              )}
            </div>
            <div className="md-wrap">
              <Markdown>{guide.body}</Markdown>
            </div>
          </section>
        )}

        <div className="section-head" id="terminals" style={{ marginTop: 46, marginBottom: 18 }}>
          <div>
            <div className="section-kicker">{t.airport.terminalsKicker}</div>
            <h2 className="section-title">
              {t.airport.terminalsTitle}
              <span className="en">{t.airport.terminalsEn}</span>
            </h2>
            <p className="sec-sub">{t.airport.terminalsSub(airport.name)}</p>
          </div>
        </div>
        <div className="terminal-list">
          {airport.terminals.map((terminal) => (
            <div className="terminal-card" key={terminal.id}>
              <div className="terminal-badge">{terminal.code}</div>
              <div className="terminal-main">
                <h3>{terminal.name}</h3>
                <div className="gates">
                  {terminal.gateRange
                    ? t.units.gatesLabel(terminal.gateRange)
                    : t.units.gatesCount(terminal.gateCount)}
                  {terminal.isSatellite && ` · ${t.units.satellite}`}
                </div>
                {terminal.airlines && (
                  <div className="airlines">
                    <b>{t.units.airlinesLabel}</b>
                    {terminal.airlines}
                  </div>
                )}
              </div>
              {terminal.amenities.length > 0 && (
                <div className="terminal-fac">
                  {terminal.amenities.map((amenity) => (
                    <span key={`${terminal.id}-${amenity.label}`}>
                      <Icon name={amenity.icon} />
                      {amenity.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="info-panel" id="transport">
            <h3>
              <TrainIcon />
              {t.airport.transitTitle}
            </h3>
            <div className="transit-list">
              {airport.transit.map((option, i) => (
                <div className="transit-row" key={`${option.icon}-${i}`}>
                  <span className="transit-icon">
                    <Icon name={option.icon} />
                  </span>
                  <div>
                    <b>{transitLabel(locale, option)}</b>
                    {option.description && <span>{option.description}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="info-panel" id="facilities">
            <h3>
              <ShopIcon />
              {t.airport.facilitiesTitle}
            </h3>
            <div className="fac-grid">
              {airport.facilities.map((facility, i) => (
                <div className="fac-item" key={`${facility.label}-${i}`}>
                  <Icon name={facility.icon} />
                  <span>{facility.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

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

      {related.length > 0 && (
        <section className="related">
          <h3>
            {t.airport.relatedTitle(airport.countryName)}{' '}
            <span className="en">{t.airport.relatedEn(airport.countryName)}</span>
          </h3>
          <div className="related-grid">
            {related.map((other) => (
              <Link
                className="related-card"
                href={localizedPath(locale, `/airport/${other.iata}`)}
                key={other.iata}
              >
                <span className="iata">{other.iata}</span>
                <div className="nm">
                  <b>{other.name}</b>
                  <span>{other.city}</span>
                </div>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 18 }}>
            <Link href={localizedPath(locale, `/country/${airport.countryCode}`)} className="btn">
              {t.airport.relatedAll(airport.countryName)}
              <ArrowIcon />
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
