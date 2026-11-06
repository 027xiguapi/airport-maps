import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { coverImageUrl } from '@/lib/map-images';
import type { AirportSummary } from '@/lib/types';

/**
 * "Airports in this article": the mirror image of the airport page's blog
 * section. An article that walks through an airport — where the arrivals door
 * is, which train to take — is useful precisely to a reader standing on that
 * airport's page, and the airport page is where the terminal map, ground
 * transport and FAQ live; this block closes the loop so a reader who arrived
 * from /blog can continue on the airport page instead of using the back button.
 *
 * Each airport is a terminal-map card, the same visual language as the
 * homepage's "Popular airport maps" strip (components/HomeSections.tsx →
 * MapTile): the 400px cover sits on its white sheet inside a navy card, with the
 * IATA code, name and city underneath. A reader recognises the map thumbnail
 * before reading the airport's name, and the block stops being a plain link list
 * sitting on an article made of pictures.
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
      {/* auto-fill, not auto-fit: with one or two airports the track keeps its
          width and the card stays a card, instead of stretching a single map
          across the whole column. */}
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-3.5 p-0">
        {airports.map((airport) => {
          // Only real files: a few small airports have no cover in public/maps,
          // and a broken <img> on a card reads worse than the IATA wordmark.
          const cover = coverImageUrl(airport.iata);
          return (
            <li key={airport.iata} className="min-w-0">
              <Link
                className="group flex h-full flex-col overflow-hidden bg-navy-900 text-white transition-[transform,box-shadow] duration-[180ms] [box-shadow:var(--shadow-sm)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lg)]"
                href={localizedPath(locale, `/airport/${airport.iata}`)}
              >
                <span className="flex h-[158px] flex-none items-center justify-center bg-white p-2">
                  {cover ? (
                    <img
                      className="h-full w-full object-contain"
                      src={cover}
                      alt={airport.name}
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display text-[42px] font-semibold tracking-[0.06em] text-navy-900/10">
                      {airport.iata}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col px-3.5 pb-3.5 pt-3">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[12px] font-semibold tracking-[0.18em] text-amber">
                      {airport.iata}
                    </span>
                    <img
                      className="h-4 w-6 flex-none object-cover [box-shadow:var(--flag-ring)]"
                      src={airport.flagUrl}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <b className="mt-1 line-clamp-2 text-[14px] font-bold leading-snug text-white">
                    {airport.name}
                  </b>
                  <span className="mt-1 truncate text-[11.5px] text-white/60">
                    {airport.city} · {airport.countryName}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
