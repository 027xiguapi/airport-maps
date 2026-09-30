import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Blog articles are authored as Markdown and sit in public/ next to
        // their images, so the source `.md` and its derived `.tw.md` are
        // reachable as plain files. The rendered /blog pages are the
        // indexable copies; keep the raw sources out of the index.
        disallow: ['/api/', '/blog/*.md'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
