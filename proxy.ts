import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, resolveLocale } from '@/lib/i18n/config';

/**
 * Proxy (formerly `middleware` in Next 15 and earlier) that puts every page
 * behind a locale prefix.
 *
 *  - `/` redirects once to the default language (`/en`), so the site root is a
 *    single stable entry point.
 *  - Other bare paths — the pre-i18n URLs such as `/airport/PEK` — redirect to
 *    the visitor's preferred language and stay shareable.
 *  - Unsupported language prefixes are stripped rather than 404ed.
 *  - `/api`, `/_next`, and any request for a file with an extension (flags,
 *    hero.svg, favicon, sitemap.xml …) are left untouched.
 */

const PUBLIC_FILE = /\.[^/]+$/;


function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;
  return resolveLocale(request.headers.get('accept-language'));
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split('/')[1] ?? '';
  if ((LOCALES as readonly string[]).includes(firstSegment)) {
    return NextResponse.next();
  }

  // A leading 2-letter segment that is not a supported locale is a stale or
  // unsupported language prefix (e.g. a shared /de/… link). Strip it and serve
  // the requested page in the default language rather than 404ing.
  const looksLikeLocale = /^[a-z]{2}(-[a-z]{2})?$/i.test(firstSegment);
  const rest = looksLikeLocale ? pathname.slice(firstSegment.length + 1) : pathname;

  // The homepage always lands on the default language, so `/` stays a single
  // stable, indexable entry point. Deeper bare paths — the pre-i18n URLs such as
  // `/airport/PEK` — follow the visitor's stored or advertised preference.
  const isHome = !rest || rest === '/';
  const locale = looksLikeLocale || isHome ? DEFAULT_LOCALE : detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = isHome ? `/${locale}` : `/${locale}${rest}`;
  url.search = search;

  // 308 keeps the old single-language URLs pointing at the canonical localized
  // version instead of losing their search history.
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ads.txt).*)'],
};
