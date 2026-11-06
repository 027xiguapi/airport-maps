import Link from 'next/link';
import { PostGrid } from '@/components/Blog';
import { ArrowIcon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { BlogPost } from '@/lib/blog';

/**
 * Articles from /blog that cover this airport (lib/blog.ts builds the index from
 * each article's airport links and its `（IATA）` mentions). It sits beside the
 * database guide because the two sources complement each other: the guide is a
 * short reference page, while the articles carry the first-hand walkthroughs —
 * where the arrivals sign is, which door the coach leaves from — that the
 * directory data cannot know. Renders nothing when no article is translated
 * into this locale, so non-English pages never show Chinese tiles.
 *
 * The relation is deliberately two-way: the cards link to the articles, and each
 * article page lists the airports it covers back
 * (components/ArticleAirports.tsx). `total` is the full number of articles
 * behind the section — the grid shows the newest four, while the subtitle counts
 * them all, so "N articles cover LHR" stays true when N is larger than four.
 */
export default function BlogPostsSection({
  locale,
  iata,
  posts,
  total = posts.length,
}: {
  locale: Locale;
  iata: string;
  posts: BlogPost[];
  /** All articles for this airport, including the ones the grid leaves out. */
  total?: number;
}) {
  const t = getMessages(locale);
  if (posts.length === 0) return null;

  return (
    <section id="blog">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.airport.blogKicker}</div>
          <h2 className="section-title">
            {t.airport.blogTitle(iata)}
            <span className="en">{t.airport.blogEn}</span>
          </h2>
          <p className="sec-sub">{t.airport.blogSub(iata, total)}</p>
        </div>
        <Link className="section-more" href={localizedPath(locale, '/blog')}>
          {t.airport.blogAll}
          <ArrowIcon />
        </Link>
      </div>
      <PostGrid locale={locale} posts={posts} />
    </section>
  );
}
