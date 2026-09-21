import { airportEncyclopediaTitle, baikeUrl, wikiUrl } from '@/lib/encyclopedia-links';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';

/**
 * External reference links: the official website (curated table in
 * lib/airport-links.ts — the button is omitted when no URL is curated), the
 * Wikipedia article matching the page locale, and the Baidu Baike entry.
 */
export default function RelatedLinks({
  locale,
  iata,
  nameEn,
  nameZh,
  website,
}: {
  locale: Locale;
  iata: string;
  nameEn: string;
  nameZh: string;
  website: string | null;
}) {
  const t = getMessages(locale);
  const titleZh = airportEncyclopediaTitle(iata, nameZh);
  const wikiTitle = locale === 'en' ? nameEn : titleZh;

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
      </div>
    </section>
  );
}
