import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  authIpHash,
  createSession,
  exchangeGoogleCode,
  googleRedirectUri,
  isGoogleAuthConfigured,
  OAUTH_LOCALE_COOKIE,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
  safeRedirectPath,
  secureCookies,
  SESSION_COOKIE,
  sessionCookieOptions,
  upsertGoogleUser,
} from '@/lib/auth';
import { clientIp, requestOrigin } from '@/lib/http';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { DEFAULT_LOCALE, isLocale, localizedPath, type Locale } from '@/lib/i18n/config';
import type { NextRequest } from 'next/server';

/**
 * Google's OAuth callback.
 *
 *   GET /api/auth/google/callback?code=…&state=…
 *
 * Validates the state cookie, exchanges the code (with the PKCE verifier),
 * upserts the account and mints the session cookie. Every failure lands on the
 * login page with an error code, so a shared/expired link never 500s.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pickLocale(value: string | undefined): Locale {
  return isLocale(value) && PUBLISHED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

/** Constant-time-ish comparison for the OAuth state value. */
function secureEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function clearHandshake(response: NextResponse, secure: boolean) {
  const expired = { ...oauthCookieOptions(secure), maxAge: 0 };
  for (const name of [
    OAUTH_STATE_COOKIE,
    OAUTH_VERIFIER_COOKIE,
    OAUTH_NEXT_COOKIE,
    OAUTH_LOCALE_COOKIE,
  ]) {
    response.cookies.set(name, '', expired);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secure = secureCookies(request);
  const store = await cookies();
  const locale = pickLocale(store.get(OAUTH_LOCALE_COOKIE)?.value);
  const next = safeRedirectPath(store.get(OAUTH_NEXT_COOKIE)?.value);
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = store.get(OAUTH_VERIFIER_COOKIE)?.value;

  const fail = (error: string) => {
    const url = new URL(`${requestOrigin(request)}${localizedPath(locale, '/login')}`);
    url.searchParams.set('error', error);
    if (next) url.searchParams.set('next', next);
    const response = NextResponse.redirect(url);
    clearHandshake(response, secure);
    return response;
  };

  // Google reports a refusal (or a bad client) on this same endpoint.
  if (searchParams.get('error')) return fail('access_denied');

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state || !expectedState || !secureEqual(state, expectedState)) {
    return fail('state_error');
  }
  if (!verifier) return fail('state_error');

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret || !isGoogleAuthConfigured()) return fail('not_configured');

  const profile = await exchangeGoogleCode({
    code,
    codeVerifier: verifier,
    clientId,
    clientSecret,
    redirectUri: googleRedirectUri(request),
  });
  if (!profile) return fail('oauth_failed');

  try {
    const user = await upsertGoogleUser(profile);
    const session = await createSession(user.id, {
      ipHash: authIpHash(clientIp(request)),
      userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
    });

    const target = new URL(
      `${requestOrigin(request)}${next ?? localizedPath(locale, '/deals')}`
    );
    const response = NextResponse.redirect(target);
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(secure)
    );
    clearHandshake(response, secure);
    return response;
  } catch (error) {
    console.error('[auth] callback failed', error);
    return fail('oauth_failed');
  }
}
