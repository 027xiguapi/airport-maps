import { NextResponse } from 'next/server';
import {
  googleAuthorizationUrl,
  googleRedirectUri,
  isGoogleAuthConfigured,
  OAUTH_LOCALE_COOKIE,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
  pkceChallenge,
  randomToken,
  safeRedirectPath,
  secureCookies,
} from '@/lib/auth';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { DEFAULT_LOCALE, isLocale, localizedPath, type Locale } from '@/lib/i18n/config';
import { requestOrigin } from '@/lib/http';

/**
 * Starts Google sign-in.
 *
 *   GET /api/auth/google?next=/deals/new&locale=zh
 *
 * Mints a state value and a PKCE verifier, keeps them in short-lived httpOnly
 * cookies and redirects to Google's consent screen. `next` is the same-site
 * path to return to after the callback; it is re-validated there.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pickLocale(value: string | null): Locale {
  if (isLocale(value) && PUBLISHED_LOCALES.includes(value)) return value;
  return DEFAULT_LOCALE;
}

/** The sign-in page for the current language, with an error marker. */
function loginUrl(request: Request, locale: Locale, params: Record<string, string>): URL {
  const url = new URL(`${requestOrigin(request)}${localizedPath(locale, '/login')}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = pickLocale(searchParams.get('locale'));
  const next = safeRedirectPath(searchParams.get('next'));
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    // A deployment without credentials still has a working login page that
    // explains what is missing, instead of a raw 500 from Google's endpoint.
    return NextResponse.redirect(
      loginUrl(request, locale, { error: 'not_configured', next: next ?? '' })
    );
  }

  const state = randomToken(24);
  const verifier = randomToken(48);
  const redirectUri = googleRedirectUri(request);
  const target = googleAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: pkceChallenge(verifier),
  });

  const response = NextResponse.redirect(target);
  const options = oauthCookieOptions(secureCookies(request));
  response.cookies.set(OAUTH_STATE_COOKIE, state, options);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, options);
  response.cookies.set(OAUTH_NEXT_COOKIE, next ?? '', options);
  response.cookies.set(OAUTH_LOCALE_COOKIE, locale, options);
  return response;
}
