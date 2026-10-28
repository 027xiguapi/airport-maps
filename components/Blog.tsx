import Link from 'next/link';
import CommentCount from '@/components/CommentCount';
import { commentThreadKey } from '@/lib/comment-labels';
import { formatDate } from '@/lib/format';
import { blogCoverUrl, blogPostPath, type BlogPost } from '@/lib/blog';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

/**
 * Blog cards. The /blog index uses the tile grid — navy body, white image
 * frame, amber link, the same anatomy as the homepage guide tiles — while the
 * homepage uses the row list further down (headline left, thumbnail right).
 * Covers arrive at wildly different shapes — scanned terminal diagrams, phone
 * screenshots, posters — which is why the grid shows them object-contain in a
 * fixed white frame; only the homepage thumbnail crops, and it crops from the
 * top so the baked-in poster headline survives.
 */
const CARD =
  'group flex flex-col overflow-hidden bg-navy-900 text-white ' +
  'transition-[transform,box-shadow] duration-[180ms] ' +
  '[box-shadow:var(--shadow-sm)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lg)]';

export function PostCard({ locale, post }: { locale: Locale; post: BlogPost }) {
  const t = getMessages(locale);
  const cover = blogCoverUrl(post);

  return (
    <Link className={CARD} href={localizedPath(locale, blogPostPath(post.slug))}>
      <span className="flex h-[170px] flex-none items-center justify-center bg-white p-2 max-[480px]:h-[140px]">
        {cover ? (
          // The title sits directly underneath, so the cover says nothing new
          // to a screen reader.
          <img className="h-full w-full object-contain" src={cover} alt="" loading="lazy" />
        ) : (
          <span className="font-display text-[40px] font-semibold tracking-[0.06em] text-navy-900/10">
            {post.title.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white">{post.title}</h3>
        {post.summary && (
          <span className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-white/60">
            {post.summary}
          </span>
        )}
        <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[12px] text-white/55">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>{t.blog.readingMinutes(post.minutes)}</span>
        </span>
      </span>
    </Link>
  );
}

/** The tile grid of every article, used by the /blog index. */
export function PostGrid({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3.5">
      {posts.map((post) => (
        <PostCard key={post.slug} locale={locale} post={post} />
      ))}
    </div>
  );
}

/**
 * One row of the homepage list: headline and meta on the left, a fixed-size
 * thumbnail on the right — the compact "text then picture" shape a news feed
 * uses, the opposite trade-off from the /blog grid (which gives the cover a
 * full-width frame). The thumbnail is the only place a cover is cropped, and
 * the row is still readable if it is not: the title sits beside it, so the
 * image is decorative here and carries alt="".
 */
function PostRow({
  locale,
  post,
  commentCount,
}: {
  locale: Locale;
  post: BlogPost;
  commentCount: number;
}) {
  const t = getMessages(locale);
  const cover = blogCoverUrl(post);

  return (
    <Link
      className="group flex items-center gap-4 rounded-[12px] border border-line bg-card p-3.5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-sky-500 hover:[box-shadow:var(--shadow-md)] sm:gap-6 sm:px-5 sm:py-4"
      href={localizedPath(locale, blogPostPath(post.slug))}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-[15.5px] font-bold leading-snug text-ink-heading transition-colors duration-150 group-hover:text-sky-600 sm:text-[18px]">
          {post.title}
        </h3>
        {post.summary && (
          <span className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft max-sm:hidden">
            {post.summary}
          </span>
        )}
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-faint">
          {post.source && (
            <>
              <span className="max-sm:hidden">{post.source}</span>
              <span aria-hidden="true" className="max-sm:hidden">
                ·
              </span>
            </>
          )}
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span aria-hidden="true" className="max-[480px]:hidden">
            ·
          </span>
          <span className="max-[480px]:hidden">{t.blog.readingMinutes(post.minutes)}</span>
          <span aria-hidden="true">·</span>
          <CommentCount count={commentCount} labels={t.comments} className="text-ink-faint" />
        </span>
      </span>
      <span className="h-[78px] w-[104px] flex-none overflow-hidden rounded-[9px] bg-navy-950 sm:h-[118px] sm:w-[184px]">
        {cover ? (
          <img
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
            src={cover}
            alt=""
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--navy-700),var(--navy-900))] font-display text-[30px] font-semibold text-white/15">
            {post.title.slice(0, 1)}
          </span>
        )}
      </span>
    </Link>
  );
}

/**
 * Homepage article list: the newest handful of articles, one per row. The row
 * shape keeps the headline at full reading width, so six titles fit on the page
 * without turning the section into a second grid.
 */
export function LatestPosts({
  locale,
  posts,
  commentCounts,
}: {
  locale: Locale;
  posts: BlogPost[];
  /** Keyed by commentThreadKey('blog', slug); see lib/comments.ts. */
  commentCounts?: Record<string, number>;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostRow
            locale={locale}
            post={post}
            commentCount={commentCounts?.[commentThreadKey('blog', post.slug)] ?? 0}
          />
        </li>
      ))}
    </ul>
  );
}
