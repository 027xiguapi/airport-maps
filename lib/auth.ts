import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { query, queryOne } from '@/lib/db';
import { isSecureRequest, requestOrigin } from '@/lib/http';

/**
 * Google sign-in and server-side sessions (db/schema.ts → `users`, `sessions`).
 *
 * Deliberately dependency-free: Google's OAuth 2.0 authorization-code flow with
 * PKCE is a handful of fetches, and rolling it here keeps the site's Node/Next
 * dependency list unchanged. The flow is:
 *
 *   1. GET /api/auth/google     — mint state + PKCE, redirect to Google.
 *   2. GET /api/auth/google/callback — verify state, swap the code for tokens,
 *      read the OpenID profile, upsert the user, mint a session.
 *
 * The session cookie carries a 32-byte random token; the database stores only
 * its SHA-256. Nothing in the cookie is signed or decryptable, so a leaked
 * cookie is the only thing an attacker can replay — and rotating it (a new
 * login) invalidates the old row.
 *
 * Server-only: the browser talks to the /api/auth/* routes instead.
 */

/** httpOnly cookie carrying the raw session token. */
export const SESSION_COOKIE = 'am_session';
/** OAuth handshake cookies; scoped to the auth routes and short-lived. */
export const OAUTH_STATE_COOKIE = 'am_oauth_state';
export const OAUTH_VERIFIER_COOKIE = 'am_oauth_verifier';
export const OAUTH_NEXT_COOKIE = 'am_oauth_next';
export const OAUTH_LOCALE_COOKIE = 'am_oauth_locale';
/** Shared path of the four handshake cookies. */
export const OAUTH_COOKIE_PATH = '/api/auth/google';

/** How long a login lasts without re-authenticating. */
export const SESSION_DAYS = 30;
/** Handshake cookies expire with the OAuth round-trip, not the login. */
export const OAUTH_TTL_SECONDS = 600;

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  picture: string | null;
};

export type GoogleProfile = {
  sub: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

/** True when both OAuth client credentials are present. */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

/**
 * The redirect URI registered in the Google console. An explicit
 * GOOGLE_REDIRECT_URI wins (needed when the public origin differs from the
 * forwarded host); otherwise it is derived from the request, so localhost and
 * the production domain both work without a rebuild.
 */
export function googleRedirectUri(request: Request): string {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${requestOrigin(request)}/api/auth/google/callback`
  );
}

/** Random URL-safe token. 32 bytes → 43 characters. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** PKCE S256 challenge for a verifier. */
export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/** What the sessions table stores: never the raw cookie token. */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Salted IP hash for abuse review, mirroring the comments table. */
export function authIpHash(ip: string): string {
  const salt = process.env.AUTH_IP_SALT ?? process.env.COMMENTS_IP_SALT ?? 'airport-maps-auth';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/** Google's consent screen URL for the given state/PKCE pair. */
export function googleAuthorizationUrl(options: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  /** Hint which account to use; `select_account` also lets people switch. */
  loginHint?: string;
}): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('redirect_uri', options.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', options.state);
  url.searchParams.set('code_challenge', options.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('prompt', 'select_account');
  if (options.loginHint) url.searchParams.set('login_hint', options.loginHint);
  return url.toString();
}

/**
 * Exchanges the authorization code for an access token and reads the OpenID
 * profile. Returns null instead of throwing for any upstream failure, so the
 * callback can redirect to a friendly error state rather than a 500 page.
 */
export async function exchangeGoogleCode(options: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleProfile | null> {
  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        code: options.code,
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: options.codeVerifier,
      }),
      cache: 'no-store',
    });
    if (!tokenResponse.ok) {
      console.error('[auth] token exchange failed', tokenResponse.status);
      return null;
    }
    const tokens = (await tokenResponse.json()) as { access_token?: unknown };
    if (typeof tokens.access_token !== 'string' || !tokens.access_token) return null;

    const profileResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!profileResponse.ok) {
      console.error('[auth] userinfo failed', profileResponse.status);
      return null;
    }
    const profile = (await profileResponse.json()) as Record<string, unknown>;
    if (typeof profile.sub !== 'string' || !profile.sub) return null;
    if (profile.aud !== undefined && profile.aud !== options.clientId) {
      // The access token was issued to a different client; refuse it.
      console.error('[auth] userinfo audience mismatch');
      return null;
    }

    const email =
      typeof profile.email === 'string' && profile.email.includes('@')
        ? profile.email.trim().slice(0, 200)
        : null;
    const name =
      cleanName(profile.name) ||
      cleanName(email?.split('@')[0]) ||
      'Traveler';

    return {
      sub: profile.sub.slice(0, 200),
      email,
      emailVerified: profile.email_verified === true,
      name,
      picture: safePicture(profile.picture),
    };
  } catch (error) {
    console.error('[auth] Google sign-in failed', error);
    return null;
  }
}

function cleanName(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 80);
}

/** Only https avatars from Google's image host are stored. */
function safePicture(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const googleHost = host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com');
    return url.protocol === 'https:' && googleHost ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Inserts or updates the Google account, returning our user row. */
export async function upsertGoogleUser(profile: GoogleProfile): Promise<AuthUser> {
  const row = await queryOne<{
    id: number;
    name: string;
    email: string | null;
    picture: string | null;
  }>(
    `insert into users (google_sub, email, email_verified, name, picture)
     values ($1, $2, $3, $4, $5)
     on conflict (google_sub) do update
        set email = excluded.email,
            email_verified = excluded.email_verified,
            name = excluded.name,
            picture = excluded.picture,
            last_login_at = now()
     returning id, name, email, picture`,
    [profile.sub, profile.email, profile.emailVerified, profile.name, profile.picture]
  );
  if (!row) throw new Error('upsert into users returned no row');
  return row;
}

/**
 * Creates a login session and returns the raw token for the cookie. Expired
 * rows are reaped on the same round-trip, which is the only maintenance this
 * table needs.
 */
export async function createSession(
  userId: number,
  meta: { ipHash: string | null; userAgent: string | null }
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await query('delete from sessions where expires_at < now()', []);
  await query(
    `insert into sessions (id, user_id, ip_hash, user_agent, expires_at)
     values ($1, $2, $3, $4, $5)`,
    [hashSessionToken(token), userId, meta.ipHash, meta.userAgent, expiresAt]
  );

  return { token, expiresAt };
}

/** Deletes the session row behind a raw token (logout). */
export async function deleteSession(token: string): Promise<void> {
  await query('delete from sessions where id = $1', [hashSessionToken(token)]);
}

/**
 * The signed-in user for the current request, or null.
 *
 * Wrapped in React's `cache` so the layout, page and metadata of one render
 * share a single query. Only used from dynamic routes (the login and
 * submission pages) and route handlers — never from a statically rendered
 * page, which would make cookies() force the whole route dynamic.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token || token.length < 20) return null;

    const row = await queryOne<{
      id: number;
      name: string;
      email: string | null;
      picture: string | null;
    }>(
      `select u.id, u.name, u.email, u.picture
         from sessions s
         join users u on u.id = s.user_id
        where s.id = $1 and s.expires_at > now()`,
      [hashSessionToken(token)]
    );
    return row ?? null;
  } catch (error) {
    // A missing table or a database blip must degrade to "signed out" instead
    // of taking the page down.
    console.error('[auth] session lookup failed', error);
    return null;
  }
});

/** Options for the session cookie, matching the response's security context. */
export function sessionCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  };
}

/** Cookie options for a handshake cookie. */
export function oauthCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_TTL_SECONDS,
  };
}

/**
 * Only same-site absolute paths may be used as post-login destinations. This
 * is the open-redirect guard: `//evil.example` and `https://evil.example` are
 * both rejected, as is anything pointing back into the API.
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const path = value.trim();
  if (!path || path.length > 300) return null;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null;
  if (path.startsWith('/api/') || path === '/api') return null;
  return path;
}

/** Secure-cookie decision for the current request. */
export function secureCookies(request: Request): boolean {
  return isSecureRequest(request) || process.env.NODE_ENV === 'production';
}
