import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/config';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';

/**
 * Proxy (formerly `middleware` in Next 15 and earlier) implementing the
 * production URL scheme: the default locale lives on bare paths — `/`,
 * `/airport/PEK` — and every other published locale is prefixed (`/zh/...`).
 *
 *  - Bare paths are rewritten (not redirected) into the default locale's
 *    `[locale]` route, so the visible URL stays the canonical bare one.
 *  - Legacy prefixed default-locale URLs (`/en/...`) 308-redirect to the bare
 *    path, keeping one indexable URL per English page.
 *  - A registered-but-untranslated prefix (`/es/...` before its catalog ships)
 *    or any other two-letter prefix is stripped and redirected to the visitor's
 *    best published language rather than 404ing or serving duplicate English
 *    pages under foreign URLs.
 *  - `/api`, `/_next`, and any request for a file with an extension (flags,
 *    maps, favicon, sitemap.xml …) are left untouched.
 */

const PUBLIC_FILE = /\.[^/]+$/;

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const candidate = cookie && (LOCALES as readonly string[]).includes(cookie)
    ? cookie
    : resolveLocale(request.headers.get('accept-language'));
  // Preference for a locale that has no catalog yet falls back to the default.
  return (PUBLISHED_LOCALES as readonly string[]).includes(candidate)
    ? candidate
    : DEFAULT_LOCALE;
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

  // Published non-default locale: serve as-is (/zh/airport/PEK).
  if (
    firstSegment !== DEFAULT_LOCALE &&
    (PUBLISHED_LOCALES as readonly string[]).includes(firstSegment)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.search = search;

  // Legacy default-locale URLs: /en/... is canonicalized to the bare path.
  if (firstSegment === DEFAULT_LOCALE) {
    const rest = pathname.slice(DEFAULT_LOCALE.length + 1);
    url.pathname = rest || '/';
    return NextResponse.redirect(url, 308);
  }

  // A leading two-letter segment that is not a published locale is a stale or
  // unsupported language prefix (e.g. a shared /de/… link). Strip it and send
  // the visitor to their preferred published language instead of 404ing.
  const looksLikeLocale = /^[a-z]{2}(-[a-z]{2})?$/i.test(firstSegment);
  if (looksLikeLocale) {
    const rest = pathname.slice(firstSegment.length + 1);
    const locale = detectLocale(request);
    url.pathname = locale === DEFAULT_LOCALE ? rest || '/' : `/${locale}${rest}`;
    return NextResponse.redirect(url, 308);
  }

  // Bare path (including `/`): the canonical default-locale URL. Rewrite into
  // the [locale] tree so the app keeps a single route structure while the
  // visible URL stays prefix-free.
  url.pathname = `${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ads.txt).*)'],
};
