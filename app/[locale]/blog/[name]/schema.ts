import { blogImageBase, blogPostPath, type BlogPost } from '@/lib/blog';
import { getMessages } from '@/lib/i18n';
import { LOCALE_META, localizedPath, type Locale } from '@/lib/i18n/config';
import {
  absoluteUrl,
  EDITORIAL_NODE_ID,
  ORG_NODE_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_NODE_ID,
} from '@/lib/site';

/**
 * The blog article's schema.org graph. Same shape as the airport and country
 * graphs — site identity, authorship, a WebPage wrapper whose main entity is
 * the article — so every page in the site describes the same entities with the
 * same stable node ids.
 */
export function buildBlogPostGraph({
  locale,
  post,
}: {
  locale: Locale;
  post: BlogPost;
}): Record<string, unknown> {
  const t = getMessages(locale);
  const pageUrl = absoluteUrl(localizedPath(locale, blogPostPath(post.slug)));
  const articleId = `${pageUrl}#article`;
  const image = post.cover ? absoluteUrl(`${blogImageBase(post.slug)}${post.cover}`) : null;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png') },
      },
      {
        '@type': 'Person',
        '@id': EDITORIAL_NODE_ID,
        name: t.editorial.authorName,
        description: t.editorial.sourcesNote,
        url: absoluteUrl(localizedPath(locale, '/about')),
        worksFor: { '@id': ORG_NODE_ID },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_NODE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        publisher: { '@id': ORG_NODE_ID },
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: post.title,
        description: post.summary,
        inLanguage: LOCALE_META[locale].htmlLang,
        isPartOf: { '@id': WEBSITE_NODE_ID },
        mainEntity: { '@id': articleId },
        author: { '@id': EDITORIAL_NODE_ID },
        publisher: { '@id': ORG_NODE_ID },
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BlogPosting',
        '@id': articleId,
        headline: post.title,
        description: post.summary,
        inLanguage: LOCALE_META[locale].htmlLang,
        url: pageUrl,
        mainEntityOfPage: { '@id': pageUrl },
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        author: { '@id': EDITORIAL_NODE_ID },
        publisher: { '@id': ORG_NODE_ID },
        isPartOf: { '@id': WEBSITE_NODE_ID },
        // The publishing account the article came from, credited rather than
        // claimed as this site's authorship.
        ...(post.source && { creditText: post.source }),
        ...(post.tags.length > 0 && { keywords: post.tags.join(', ') }),
        ...(image && { image: [image], thumbnailUrl: image }),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t.common.home,
            item: absoluteUrl(localizedPath(locale, '/')),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t.blog.title,
            item: absoluteUrl(localizedPath(locale, '/blog')),
          },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ],
  };
}
