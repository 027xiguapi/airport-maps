import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { PostGrid } from '@/components/Blog';
import { blogAlternates, blogLocalesWithContent, hasBlog, listBlogPosts } from '@/lib/blog';
import { getMessages, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

/** One index page per locale that has articles to list. */
export function generateStaticParams() {
  return blogLocalesWithContent().map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale || !hasBlog(locale)) return {};

  const t = getMessages(locale);
  const description = t.blog.sub;

  return {
    title: t.blog.title,
    description,
    alternates: {
      canonical: localizedPath(locale, '/blog'),
      languages: blogAlternates('/blog'),
    },
    openGraph: {
      siteName: SITE_NAME,
      title: `${t.blog.title} | ${t.site.name}`,
      description,
      url: localizedPath(locale, '/blog'),
    },
  };
}

export default async function BlogIndexPage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale || !hasBlog(locale)) notFound();

  const t = getMessages(locale);
  const posts = listBlogPosts(locale);

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[{ label: t.common.home, href: '/' }, { label: t.blog.title }]}
          />
          <div className="country-hero">
            <div>
              <h1>{t.blog.title}</h1>
              <div className="sub">{t.blog.sub}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">
        {posts.length > 0 ? (
          <PostGrid locale={locale} posts={posts} />
        ) : (
          <p className="md text-ink-soft">{t.blog.empty}</p>
        )}
      </section>
    </>
  );
}
