import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Comments from '@/components/Comments';
import Markdown from '@/components/Markdown';
import { formatDate } from '@/lib/format';
import { getMessages, languageAlternates } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import { getAuthMessages } from '@/lib/i18n/deals';
import { getPage } from '@/lib/content';

/** Slugs available to the about / contact / sources / privacy / terms routes. */
export type PageSlug = 'about' | 'contact' | 'sources' | 'privacy' | 'terms';

/** Shared metadata for a Markdown page, driven by its stored title/summary. */
export async function contentPageMetadata(locale: Locale, slug: PageSlug): Promise<Metadata> {
  const doc = await getPage(locale, slug);
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
 * Renders a static Markdown page from the `content_documents` store
 * (kind='page'). Missing translations fall back to the default locale (see
 * lib/content.ts).
 */
export default async function ContentPage({ locale, slug }: { locale: Locale; slug: PageSlug }) {
  const doc = await getPage(locale, slug);
  if (!doc) notFound();

  const t = getMessages(locale);
  const navLabel = {
    about: t.footer.about,
    contact: t.footer.contact,
    sources: t.footer.sources,
    privacy: t.footer.privacy,
    terms: t.footer.terms,
  }[slug];

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

        <Comments
          pageKind="page"
          pageKey={slug}
          locale={locale}
          lang={LOCALE_META[locale].htmlLang}
          labels={t.comments}
          authLabels={getAuthMessages(locale)}
        />
      </section>
    </>
  );
}
