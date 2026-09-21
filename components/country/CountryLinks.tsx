import Link from 'next/link';
import {
  airportEncyclopediaTitle,
  baikeUrl,
  countryEncyclopediaTitle,
  wikiUrl,
} from '@/lib/encyclopedia-links';
import { airportWebsite } from '@/lib/airport-links';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import type { AirportSummary, Country } from '@/lib/types';

/**
 * External reference links for a country page: the country's own encyclopedia
 * entries, then one row per airport with its official site (only when the URL
 * is curated in lib/airport-links.ts), the Wikipedia article matching the page
 * locale, and the Baidu Baike entry.
 *
 * The airport pages link to the same references; grouping them here lets a
 * reader reach any airport's sources without opening each airport in turn.
 */
export default function CountryLinks({
  locale,
  country,
  airports,
}: {
  locale: Locale;
  country: Country;
  airports: AirportSummary[];
}) {
  const t = getMessages(locale);

  return (
    <section className="ap-extra" id="related-links">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.airport.linksKicker}</div>
          <h2 className="section-title">
            {t.country.linksTitle}
            <span className="en">{t.country.linksEn}</span>
          </h2>
          <p className="sec-sub">{t.country.linksSub}</p>
        </div>
      </div>

      <div className="link-groups">
        <div className="link-group">
          <div className="link-group-head">
            {t.country.linksCountry(country.name)}
            <span className="meta">{country.nameEn}</span>
          </div>
          <div className="ext-links">
            <ReferenceLinks
              locale={locale}
              nameEn={country.nameEn}
              titleZh={countryEncyclopediaTitle(country.code, country.nameZh)}
              website={null}
            />
          </div>
        </div>

        <div className="link-group">
          <div className="link-group-head">{t.country.linksAirports(country.name)}</div>
          {airports.map((airport) => (
            <div className="link-row" key={airport.iata}>
              <div className="link-row-head">
                <Link className="iata" href={localizedPath(locale, `/airport/${airport.iata}`)}>
                  {airport.iata}
                </Link>
                <span className="nm">{airport.name}</span>
              </div>
              <div className="ext-links">
                <ReferenceLinks
                  locale={locale}
                  nameEn={airport.nameEn}
                  titleZh={airportEncyclopediaTitle(airport.iata, airport.nameZh)}
                  website={airportWebsite(airport.iata)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The three external references for one subject (country or airport). */
function ReferenceLinks({
  locale,
  nameEn,
  titleZh,
  website,
}: {
  locale: Locale;
  nameEn: string;
  titleZh: string;
  website: string | null;
}) {
  const t = getMessages(locale);
  // Wikipedia follows the page language; Baidu Baike is Chinese either way.
  const wikiTitle = locale === 'en' ? nameEn : titleZh;

  return (
    <>
      {website && (
        <Button asChild variant="outline">
          <a href={website} target="_blank" rel="noopener noreferrer">
            {t.airport.officialSite} ↗
          </a>
        </Button>
      )}
      <Button asChild variant="outline">
        <a
          href={wikiUrl(locale === 'en' ? 'en' : 'zh', wikiTitle)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.airport.wikiLabel} ↗
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={baikeUrl(titleZh)} target="_blank" rel="noopener noreferrer">
          {t.airport.baikeLabel} ↗
        </a>
      </Button>
    </>
  );
}
