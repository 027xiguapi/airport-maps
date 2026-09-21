import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AirportCard, { CountryChips } from '@/components/AirportCard';
import Breadcrumb from '@/components/Breadcrumb';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import TocNav, { type TocItem } from '@/components/TocNav';
import CountryIntro from '@/components/country/CountryIntro';
import CountryLinks from '@/components/country/CountryLinks';
import { getCountryIntro } from '@/lib/content';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { getAirportsByCountry, getAllCountryCodes, getCountries, getCountry } from '@/lib/queries';
import { SITE_NAME } from '@/lib/site';
import { buildCountryFaq } from './faq';
import { buildCountryGraph } from './schema';

export const revalidate = 3600;

/** Pre-render every locale × country pair. */
export async function generateStaticParams() {
  const countries = await getAllCountryCodes();
  return ['zh', 'en'].flatMap((locale) => countries.map((c) => ({ locale, code: c.code })));
}

type Props = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) return {};

  const t = getMessages(locale);
  const country = await getCountry(locale, code);
  if (!country) notFound();

  const airports = await getAirportsByCountry(locale, country.code);
  const title = t.country.title(country.name);
  const description = t.country.description(
    country.name,
    country.nameEn,
    country.region,
    airports.length
  );

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(locale, `/country/${country.code}`),
      languages: languageAlternates(`/country/${country.code}`),
    },
    openGraph: {
      siteName: SITE_NAME,
      title: `${title} | ${t.site.name}`,
      description,
      url: localizedPath(locale, `/country/${country.code}`),
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { locale: raw, code } = await params;
  const locale = parseLocale(raw);
  if (!locale) notFound();

  const t = getMessages(locale);
  const country = await getCountry(locale, code);
  if (!country) notFound();

  const [airports, allCountries] = await Promise.all([
    getAirportsByCountry(locale, country.code),
    getCountries(locale),
  ]);

  const intro = getCountryIntro(locale, country.code);
  const faqItems = buildCountryFaq(locale, country, airports);
  const terminalTotal = airports.reduce((sum, a) => sum + a.terminalCount, 0);
  const gateTotal = airports.reduce((sum, a) => sum + a.gateCount, 0);

  // Onward navigation: other countries with airports, current one excluded.
  const neighbours = allCountries
    .filter((c) => c.code !== country.code && c.airportCount > 0)
    .slice(0, 12);

  /** Sections that actually render on this country's page, in order. */
  const tocItems: TocItem[] =
    airports.length > 0
      ? [
          { id: 'airport-intro', label: t.toc.intro },
          { id: 'airport-list', label: t.toc.airports },
          { id: 'related-links', label: t.toc.links },
          ...(faqItems.length > 0 ? [{ id: 'faq', label: t.toc.faq }] : []),
        ]
      : [];

  return (
    <>
      <JsonLd data={buildCountryGraph({ locale, country, airports, intro, faqItems })} />

      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t.common.home, href: '/' },
              { label: t.nav.countries, href: '/countries' },
              { label: country.name },
            ]}
          />
          <div className="country-hero">
            <img className="flag" src={country.flagUrl} alt={country.name} />
            <div>
              <h1>{country.name}</h1>
              <div className="sub">
                {country.region} · {t.units.airports(airports.length)} ·{' '}
                {t.units.terminals(terminalTotal)} · {t.units.gates(gateTotal)}
              </div>
              <span className="iata-chip">{t.country.chip(country.nameEn)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aside precedes the body in DOM so it stays on top when the rail
          collapses to a horizontal strip on narrow screens; on desktop the
          flex order places it on the right. */}
      <div className="ap-with-toc">
        {/* Only when there are sections to navigate: TocNav renders nothing
            below three items, and an empty rail would still take its column. */}
        {airports.length > 0 && (
          <aside className="ap-toc">
            <TocNav items={tocItems} label={t.toc.label} />
          </aside>
        )}

        <div className="ap-body">
          {airports.length > 0 && (
            <CountryIntro locale={locale} country={country} airports={airports} intro={intro} />
          )}

          <section className="ap-extra" id="airport-list">
            {airports.length > 0 ? (
              <>
                <div className="section-head" style={{ marginBottom: 18 }}>
                  <div>
                    <div className="section-kicker">{t.country.kicker}</div>
                    <h2 className="section-title">
                      {t.country.titleOf(country.name)}
                      <span className="en">{t.country.en}</span>
                    </h2>
                    <p className="sec-sub">{t.country.sub}</p>
                  </div>
                </div>
                <div className="cairport-grid">
                  {airports.map((airport) => (
                    <AirportCard locale={locale} airport={airport} key={airport.iata} />
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="big">0</div>
                <p>{t.country.empty}</p>
              </div>
            )}
          </section>

          {airports.length > 0 && (
            <CountryLinks locale={locale} country={country} airports={airports} />
          )}

          {faqItems.length > 0 && (
            <section className="ap-extra" id="faq">
              <div className="section-head" style={{ marginBottom: 18 }}>
                <div>
                  <div className="section-kicker">{t.country.faqKicker}</div>
                  <h2 className="section-title">
                    {t.country.faqTitle}
                    <span className="en">{t.country.faqEn}</span>
                  </h2>
                </div>
              </div>
              <Faq items={faqItems} />
            </section>
          )}
        </div>
      </div>

      <section className="country-airports">
        <div className="section-head" style={{ marginBottom: 18 }}>
          <div>
            <div className="section-kicker">{t.country.moreKicker}</div>
            <h2 className="section-title">
              {t.country.moreTitle}
              <span className="en">{t.country.moreEn}</span>
            </h2>
          </div>
          <Link className="section-more" href={localizedPath(locale, '/countries')}>
            {t.country.all}
          </Link>
        </div>
        <CountryChips locale={locale} countries={neighbours} />
      </section>
    </>
  );
}
