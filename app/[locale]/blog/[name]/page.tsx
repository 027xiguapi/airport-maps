import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { PostGrid } from '@/components/Blog';
import JsonLd from '@/components/JsonLd';
import Markdown from '@/components/Markdown';
import TocNav from '@/components/TocNav';
import { formatDate } from '@/lib/format';
import {
  blogCoverUrl,
  blogImageBase,
  blogPostAlternates,
  blogPostLocales,
  blogPostPath,
  getBlogPost,
  hasBlog,
  listBlogPosts,
  listBlogSlugs,
} from '@/lib/blog';
import { getMessages, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { extractHeadings } from '@/lib/markdown-toc';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { buildBlogPostGraph } from './schema';

export const revalidate = 3600;

/** Pre-render every article into each locale that has a file for it. */
export async function generateStaticParams() {
  return listBlogSlugs().flatMap((name) =>
    blogPostLocales(name).map((locale) => ({ locale, name }))
  );
}

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, name } = await params;
  const locale = parseLocale(raw);
  if (!locale || !hasBlog(locale)) return {};

  const post = getBlogPost(locale, name);
  if (!post) return {};

  const t = getMessages(locale);
  const path = blogPostPath(post.slug);
  const cover = blogCoverUrl(post);
  const title = post.title;

  return {
    title,
    description: post.summary,
    keywords: post.tags,
    alternates: {
      canonical: localizedPath(locale, path),
      languages: blogPostAlternates(post.slug),
    },
    openGraph: {
      siteName: SITE_NAME,
      type: 'article',
      title: `${title} | ${t.site.name}`,
      description: post.summary,
      url: localizedPath(locale, path),
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      ...(post.tags.length > 0 ? { tags: post.tags } : {}),
      ...(cover ? { images: [{ url: absoluteUrl(cover), alt: title }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: raw, name } = await params;
  const locale = parseLocale(raw);
  if (!locale || !hasBlog(locale)) notFound();

  const post = getBlogPost(locale, name);
  if (!post) notFound();

  const t = getMessages(locale);
  const cover = blogCoverUrl(post);
  // The cover leads the article unless the body already opens with it (some
  // articles carry their cover as the first figure).
  const leadCover = cover && !post.body.includes(`./${post.cover}`) ? cover : null;
  // The right-hand rail's items: the article's h2/h3 headings, ids matching the
  // ones components/Markdown.tsx renders (lib/markdown-toc.ts is shared).
  const toc = extractHeadings(post.body);
  const related = listBlogPosts(locale)
    .filter((other) => other.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={buildBlogPostGraph({ locale, post })} />

      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t.common.home, href: '/' },
              { label: t.blog.title, href: '/blog' },
              { label: post.title },
            ]}
          />
          <div className="country-hero">
            <div>
              <h1>{post.title}</h1>
              {post.summary && <div className="sub">{post.summary}</div>}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-white/62">
                {post.date && (
                  <time className="guide-meta !text-white/62" dateTime={post.date}>
                    {t.common.publishedOn(formatDate(post.date, locale))}
                  </time>
                )}
                <span className="guide-meta !text-white/62">
                  {t.blog.readingMinutes(post.minutes)}
                </span>
                {post.source && (
                  <span className="guide-meta !text-white/62">{t.blog.source(post.source)}</span>
                )}
              </div>
              {post.tags.length > 0 && (
                <ul className="mt-3 flex list-none flex-wrap gap-1.5" aria-label={t.blog.tags}>
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[20px] border border-white/20 px-2.5 py-[3px] text-[11.5px] text-white/75"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Same two-column frame as the airport page: the article beside a sticky
          contents rail (components/TocNav.tsx) that collapses into a chip strip
          on narrow screens. The rail appears from three headings on. */}
      <section className="ap-with-toc">
        {toc.length >= 3 && (
          <aside className="ap-toc">
            <TocNav items={toc} label={t.toc.label} />
          </aside>
        )}

        <div className="ap-body">
          <div className="md-wrap">
            {leadCover && (
              <img
                className="mx-auto mb-6 block h-auto max-h-[560px] w-auto max-w-full rounded-[9px]"
                src={leadCover}
                alt={post.title}
                loading="eager"
              />
            )}
            {/* Article images are referred to relatively and live beside the
                markdown in public/blog/<slug>/ — imageBase turns those into
                servable URLs.

                Height cap: these come from phone screenshots and posters, which
                at full column width would each run 1500px tall and bury the text
                between them. Utilities rather than a `.md` rule because the blog
                is the only surface with images this shape. */}
            <Markdown
              className="[&_img]:mx-auto [&_img]:max-h-[68vh] [&_img]:w-auto [&_img]:object-contain"
              imageBase={blogImageBase(post.slug)}
            >
              {post.body}
            </Markdown>
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <div className="section-head">
                <div>
                  <div className="section-kicker">{t.blog.kicker}</div>
                  <h2 className="section-title">
                    {t.blog.morePosts}
                    <span className="en">{t.blog.en}</span>
                  </h2>
                </div>
                <Link className="section-more" href={localizedPath(locale, '/blog')}>
                  {t.blog.all}
                </Link>
              </div>
              <PostGrid locale={locale} posts={related} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
