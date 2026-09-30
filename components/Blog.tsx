import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { blogCoverUrl, blogPostPath, type BlogPost } from '@/lib/blog';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

/**
 * Blog tiles. Same anatomy as the homepage guide tiles (navy body, white image
 * frame, amber link) so the article section reads as one more editorial block
 * on a page full of them. Covers arrive at wildly different shapes — scanned
 * terminal diagrams, phone screenshots, posters — so they sit object-contain in
 * a fixed white frame and are never cropped.
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

/** A row of article tiles, used by the homepage section and the /blog index. */
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
 * One slide-like tile of the homepage showcase: the cover fills the card edge
 * to edge, a navy scrim keeps the overlaid text readable, and the whole card is
 * the link. Covers arrive at wildly different shapes (scanned diagrams, phone
 * screenshots, posters), so they are cropped here — object-cover is the point
 * of the style — which is also why alt="" : the title is on the image.
 */
function OverlayCard({
  locale,
  post,
  large = false,
  className = '',
}: {
  locale: Locale;
  post: BlogPost;
  large?: boolean;
  className?: string;
}) {
  const t = getMessages(locale);
  const cover = blogCoverUrl(post);

  return (
    <Link
      className={
        'group relative block overflow-hidden rounded-[14px] bg-navy-950 ' +
        '[box-shadow:var(--shadow-sm)] transition-[transform,box-shadow] duration-[180ms] ' +
        'hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lg)] ' +
        className
      }
      href={localizedPath(locale, blogPostPath(post.slug))}
    >
      {cover ? (
        <img
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={cover}
          alt=""
          loading="lazy"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,var(--navy-700),var(--navy-900))]">
          <span className="font-display text-[52px] font-semibold tracking-[0.06em] text-white/10">
            {post.title.slice(0, 1)}
          </span>
        </span>
      )}
      {/* Scrim: strongest behind the text, fading out towards the top. */}
      <span className="absolute inset-0 bg-gradient-to-t from-navy-950/92 via-navy-950/35 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 lg:p-5">
        <h3
          className={
            large
              ? 'line-clamp-2 text-[19px] font-bold leading-snug text-white lg:text-[22px]'
              : 'line-clamp-2 text-[14px] font-bold leading-snug text-white'
          }
        >
          {post.title}
        </h3>
        {large && post.summary && (
          <span className="line-clamp-2 text-[12.5px] leading-relaxed text-white/70 max-lg:hidden">
            {post.summary}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-x-2 text-[12px] text-white/62">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>{t.blog.readingMinutes(post.minutes)}</span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Homepage blog showcase: slide-style cards with the text on the image. On
 * desktop the newest article takes a large tile on the left and the next four
 * fill a two-by-two grid on the right; on narrow screens everything stacks,
 * with the small tiles keeping two columns.
 */
export function BlogShowcase({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const small = rest.slice(0, 4);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1 lg:h-[440px]">
      <OverlayCard locale={locale} post={lead} large className="h-[230px] lg:h-full" />
      {small.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:h-full">
          {small.map((post) => (
            <OverlayCard
              key={post.slug}
              locale={locale}
              post={post}
              className="h-[150px] lg:h-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
