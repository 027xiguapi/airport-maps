import {
  airportEncyclopediaTitle,
  baikeUrl,
  OURAIRPORTS_DATA_URL,
  wikiUrl,
} from '@/lib/encyclopedia-links';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { showsBaike, wikipediaLocale } from '@/lib/i18n/display';
import { Button } from '@/components/ui/button';

/**
 * External reference links: the official website (curated table in
 * lib/airport-links.ts — the button is omitted when no URL is curated), the
 * Wikipedia article matching the page locale, and the Baidu Baike entry.
 * Underneath them the sources line names the reference works the page's data
 * is compiled from, with outbound links — the citation half of the
 * answer-first audit (the machine-readable mirror lives in the WebPage node's
 * `citation` set in app/[locale]/airport/[code]/schema.ts).
 */
export default function RelatedLinks({
  locale,
  iata,
  name,
  nameEn,
  nameZh,
  website,
}: {
  locale: Locale;
  iata: string;
  /** Localized airport name — the German Wikipedia article title. */
  name: string;
  nameEn: string;
  nameZh: string;
  website: string | null;
}) {
  const t = getMessages(locale);
  const titleZh = airportEncyclopediaTitle(iata, nameZh);
  const wikiLang = wikipediaLocale(locale);
  // The German/Korean editions file the article under the localized airport
  // name ("Flughafen München", "인천국제공항"), the English one under the
  // international name.
  const wikiTitle =
    locale === 'en' ? nameEn : locale === 'de' || locale === 'ko' ? name : titleZh;
  const wikiHref = wikiUrl(wikiLang, wikiTitle);

  return (
    <section className="ap-extra" id="related-links">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.linksKicker}</div>
          <h2 className="section-title">
            {t.airport.linksTitle}
            <span className="en">{t.airport.linksEn}</span>
          </h2>
          <p className="sec-sub">{t.airport.linksSub}</p>
        </div>
      </div>
      <div className="ext-links">
        {website && (
          <Button asChild variant="outline">
            <a href={website} target="_blank" rel="noopener noreferrer">
              {t.airport.officialSite} ↗
            </a>
          </Button>
        )}
        <Button asChild variant="outline">
          <a href={wikiHref} target="_blank" rel="noopener noreferrer">
            {t.airport.wikiLabel} ↗
          </a>
        </Button>
        {/* Baidu Baike is simplified-Chinese only, so it is left off /tw and
            German pages. */}
        {showsBaike(locale) && (
          <Button asChild variant="outline">
            <a href={baikeUrl(titleZh)} target="_blank" rel="noopener noreferrer">
              {t.airport.baikeLabel} ↗
            </a>
          </Button>
        )}
      </div>
      <p className="ap-sources">
        <span>{t.airport.sourcesLabel}</span>
        <a href={wikiHref} target="_blank" rel="noopener noreferrer">
          {t.airport.sourcesWikipedia}
        </a>
        <span className="sep">·</span>
        <a href={OURAIRPORTS_DATA_URL} target="_blank" rel="noopener noreferrer">
          {t.airport.sourcesOurAirports}
        </a>
        <span className="sep">—</span>
        <span>{t.airport.sourcesNote}</span>
      </p>
    </section>
  );
}
