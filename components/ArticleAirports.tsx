import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { AirportSummary } from '@/lib/types';

/**
 * "Airports in this article": the mirror image of the airport page's blog
 * section. An article that walks through an airport — where the arrivals door
 * is, which train to take — is useful precisely to a reader standing on that
 * airport's page, and the airport page is where the terminal map, ground
 * transport and FAQ live; this block closes the loop so a reader who arrived
 * from /blog can continue on the airport page instead of using the back button.
 *
 * The codes come from lib/blog.ts's `blogPostAirportCodes()` — the airports the
 * article names as airports, curated links first — and are resolved through the
 * directory, so a mention of an airport this site has no page for simply does
 * not render. The airport page cites the article back (JSON-LD `subjectOf`),
 * and the article cites these airports (`about`), so the relation is symmetric
 * for crawlers too.
 */
export default function ArticleAirports({
  locale,
  airports,
}: {
  locale: Locale;
  /** Directory airports this article covers, in the article's own order. */
  airports: AirportSummary[];
}) {
  const t = getMessages(locale);
  if (airports.length === 0) return null;

  return (
    <section className="ap-extra" id="article-airports">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.blog.airportsKicker}</div>
          <h2 className="section-title">
            {t.blog.airportsTitle}
            <span className="en">{t.blog.airportsEn}</span>
          </h2>
          <p className="sec-sub">{t.blog.airportsSub}</p>
        </div>
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-2.5 p-0">
        {airports.map((airport) => (
          <li key={airport.iata} className="min-w-0">
            <Link
              className="flex h-full items-center gap-3 rounded-[9px] border border-line bg-card px-3.5 py-3 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-sky-400"
              href={localizedPath(locale, `/airport/${airport.iata}`)}
            >
              {/* Fixed IATA column, then a truncating name: long airport names
                  must not widen the grid track (the same layout as the airport
                  page's country list, components/airport/RelatedAirports.tsx). */}
              <span className="w-[42px] flex-none font-display text-[15px] font-semibold text-navy-800 dark:text-[#C4DCF0]">
                {airport.iata}
              </span>
              <span className="min-w-0">
                <b className="block truncate text-[13px] font-semibold text-ink">{airport.name}</b>
                <span className="block truncate text-[11.5px] text-ink-soft">
                  {airport.city} · {airport.countryName}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
