import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Markdown from '@/components/Markdown';
import { formatDate } from '@/lib/format';
import { getMessages, languageAlternates } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { getPage } from '@/lib/content';

/** Slugs available to the about / contact / privacy / terms routes. */
export type PageSlug = 'about' | 'contact' | 'privacy' | 'terms';

/** Shared metadata for a Markdown page, driven by its frontmatter. */
export async function contentPageMetadata(locale: Locale, slug: PageSlug): Promise<Metadata> {
  const doc = getPage(locale, slug);
  if (!doc) return { title: getMessages(locale).error.notFoundTitle };

  return {
    title: doc.title,
    description: doc.summary,
    alternates: {
      canonical: localizedPath(locale, `/${slug}`),
      languages: languageAlternates(`/${slug}`),
    },
  };
}

/**
 * Renders a static Markdown page from content/<locale>/pages/<slug>.md. Missing
 * translations fall back to the default locale (see lib/content.ts).
 */
export default function ContentPage({ locale, slug }: { locale: Locale; slug: PageSlug }) {
  const doc = getPage(locale, slug);
  if (!doc) notFound();

  const t = getMessages(locale);
  const navLabel =
    slug === 'about'
      ? t.footer.about
      : slug === 'contact'
        ? t.footer.contact
        : slug === 'privacy'
          ? t.footer.privacy
          : t.footer.terms;

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[{ label: t.common.home, href: '/' }, { label: navLabel }]}
          />
          <div className="country-hero">
            <div>
              <h1>{doc.title ?? navLabel}</h1>
              {doc.summary && <div className="sub">{doc.summary}</div>}
              {doc.updated && (
                <span className="guide-meta" style={{ display: 'inline-block', marginTop: 10 }}>
                  {t.common.updatedOn(formatDate(doc.updated, locale))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">
        <div className="md-wrap">
          <Markdown>{doc.body}</Markdown>
        </div>
      </section>
    </>
  );
}
