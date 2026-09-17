import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CountryGrid } from '@/components/AirportCard';
import Breadcrumb from '@/components/Breadcrumb';
import { formatNumber } from '@/lib/format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { getCountries, getStats } from '@/lib/queries';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const t = getMessages(locale);
  return {
    title: t.countries.title,
    description: t.countries.description,
    alternates: {
      canonical: localizedPath(locale, '/countries'),
      languages: languageAlternates('/countries'),
    },
  };
}

export default async function CountriesPage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const [countries, stats] = await Promise.all([getCountries(locale), getStats()]);

  // Grouped by region, preserving the region order the query already applies.
  const byRegion: { region: string; countries: typeof countries }[] = [];
  for (const country of countries) {
    const bucket = byRegion.find((r) => r.region === country.region);
    if (bucket) bucket.countries.push(country);
    else byRegion.push({ region: country.region, countries: [country] });
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[{ label: t.common.home, href: '/' }, { label: t.nav.countries }]}
          />
          <div className="country-hero">
            <div>
              <h1>{t.countries.title}</h1>
              <div className="sub">
                {t.countries.sub(
                  formatNumber(stats?.countryCount ?? countries.length, locale),
                  formatNumber(stats?.airportCount ?? 0, locale),
                  formatNumber(stats?.terminalCount ?? 0, locale)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">
        {/* jump strip so a region is one click away on a long page */}
        <div className="region-jump" id="regions">
          {byRegion.map((group) => (
            <a className="chip" href={`#region-${encodeURIComponent(group.region)}`} key={group.region}>
              {group.region}
              <span className="n">{group.countries.length}</span>
            </a>
          ))}
        </div>

        {byRegion.map((group) => (
          <div
            className="region-block"
            id={`region-${encodeURIComponent(group.region)}`}
            key={group.region}
          >
            <div className="region-head">
              <h2>{group.region}</h2>
              <span className="n">REGION</span>
              <span className="cnt">
                {t.countries.regionCount(
                  group.countries.length,
                  group.countries.reduce((sum, c) => sum + c.airportCount, 0)
                )}
              </span>
            </div>
            <CountryGrid locale={locale} countries={group.countries} />
          </div>
        ))}
      </section>
    </>
  );
}
