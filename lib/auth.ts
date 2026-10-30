import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import { cache } from 'react';
import { isAdminEmail } from '@/lib/admin-emails';
import { queryOne, withTransaction } from '@/lib/db';

/**
 * Authentication: NextAuth (Auth.js v5) with the Google provider and JWT
 * sessions.
 *
 * Why JWT sessions rather than the Drizzle adapter: this database keeps
 * integer user ids (deals/comments reference `users.id` with an integer FK),
 * while the Auth.js Drizzle adapter requires string ids. The adapter would
 * force a destructive id migration across three tables for no functional
 * gain. NextAuth still owns the OAuth flow, CSRF, cookies and provider
 * plumbing; `auth_accounts` (db/schema.ts) is the durable provider→user map,
 * so adding another provider later only touches this file.
 *
 * The callback URL is NextAuth's own `/api/auth/callback/google` — exactly the
 * path the Google Cloud Console is already configured with.
 */

export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  picture: string | null;
};

/** True when both Google credentials and the NextAuth secret are present. */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.AUTH_SECRET?.trim()
  );
}

const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

const providers: Provider[] = [];
if (googleId && googleSecret) {
  const google = Google({
    clientId: googleId,
    clientSecret: googleSecret,
  });

  // The built-in Google provider is OIDC and otherwise discovers its endpoints
  // from accounts.google.com on every sign-in. Pinning the three documented
  // endpoints avoids that extra round-trip (and a failure mode where the
  // server cannot reach the discovery document but can reach the token API).
  // `type: "oauth"` uses the userinfo endpoint for the profile instead of
  // validating an ID token against a discovered JWKS.
  providers.push({
    ...google,
    type: 'oauth',
    authorization: {
      url: 'https://accounts.google.com/o/oauth2/v2/auth',
      params: { scope: 'openid email profile', response_type: 'code' },
    },
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
    checks: ['pkce', 'state'],
  });
}

function cleanName(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 80);
}

function safePicture(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const allowed = host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com');
    return url.protocol === 'https:' && allowed ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Resolves an OAuth account to a local user id, creating/linking rows as
 * needed. Runs inside a transaction so a concurrent first login cannot leave
 * an account without its user.
 */
async function upsertAuthUser(
  provider: string,
  providerAccountId: string,
  profile: Record<string, unknown> | undefined
): Promise<number | null> {
  if (!provider || !providerAccountId) return null;

  const rawEmail = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : null;
  const email = rawEmail && rawEmail.includes('@') ? rawEmail.slice(0, 200) : null;
  const emailVerified = profile?.email_verified === true;
  const name = cleanName(profile?.name) || cleanName(email?.split('@')[0]) || 'Traveler';
  const picture = safePicture(profile?.picture);
  const googleSub =
    provider === 'google' && typeof profile?.sub === 'string' ? profile.sub.slice(0, 200) : null;

  return withTransaction(async (client) => {
    const linked = await client.query<{ user_id: number }>(
      `select user_id from auth_accounts
        where provider = $1 and provider_account_id = $2`,
      [provider, providerAccountId]
    );
    if (linked.rows[0]) {
      const userId = linked.rows[0].user_id;
      await client.query(
        `update users
            set name = coalesce(nullif($2, ''), name),
                email = coalesce($3, email),
                picture = coalesce($4, picture),
                last_login_at = now()
          where id = $1`,
        [userId, name, email, picture]
      );
      return userId;
    }

    let userId: number | null = null;

    if (googleSub) {
      const bySub = await client.query<{ id: number }>(
        'select id from users where google_sub = $1 limit 1',
        [googleSub]
      );
      if (bySub.rows[0]) userId = bySub.rows[0].id;
    }

    // Link an existing local account only when the provider verified the
    // email; otherwise an unverified address could take over another account.
    if (!userId && email && emailVerified) {
      const byEmail = await client.query<{ id: number }>(
        `select id from users
          where lower(email) = lower($1)
          order by id
          limit 1`,
        [email]
      );
      if (byEmail.rows[0]) userId = byEmail.rows[0].id;
    }

    if (!userId) {
      const inserted = await client.query<{ id: number }>(
        `insert into users (google_sub, email, email_verified, name, picture)
         values ($1, $2, $3, $4, $5)
         returning id`,
        [googleSub, email, emailVerified, name, picture]
      );
      userId = inserted.rows[0]?.id ?? null;
    } else {
      await client.query(
        `update users
            set google_sub = coalesce(google_sub, $2),
                email = coalesce($3, email),
                email_verified = email_verified or $4,
                name = coalesce(nullif($5, ''), name),
                picture = coalesce($6, picture),
                last_login_at = now()
          where id = $1`,
        [userId, googleSub, email, emailVerified, name, picture]
      );
    }

    if (!userId) return null;

    await client.query(
      `insert into auth_accounts (provider, provider_account_id, user_id, email)
       values ($1, $2, $3, $4)
       on conflict (provider, provider_account_id) do nothing`,
      [provider, providerAccountId, userId, email]
    );

    return userId;
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  // The app runs behind a reverse proxy (worldairportmap.com). NextAuth needs
  // this to trust the forwarded host/protocol instead of rejecting it.
  trustHost: true,
  session: {
    strategy: 'jwt',
    // Matches the old custom session lifetime.
    maxAge: 30 * 24 * 60 * 60,
  },
  providers,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider && account.providerAccountId) {
        // With `type: "oauth"` the profile comes from the userinfo endpoint;
        // merge the provider user object as a fallback so a sparse profile
        // still produces a usable local account.
        const merged: Record<string, unknown> = {
          ...(profile as Record<string, unknown> | undefined),
        };
        if (!merged.name && user?.name) merged.name = user.name;
        if (!merged.email && user?.email) merged.email = user.email;
        if (!merged.picture && user?.image) merged.picture = user.image;
        if (!merged.sub) merged.sub = account.providerAccountId;

        const userId = await upsertAuthUser(
          account.provider,
          account.providerAccountId,
          merged
        );
        if (userId) token.uid = userId;
      }
      return token;
    },

    async session({ session, token }) {
      const userId = Number(token.uid);
      if (!userId || !session.user) return session;

      // Read the current name/email/avatar so a Google profile change is
      // reflected without waiting for a new login.
      const row = await queryOne<{
        id: number;
        name: string | null;
        email: string | null;
        picture: string | null;
      }>('select id, name, email, picture from users where id = $1', [userId]);
      if (!row) return session;

      session.user.id = String(row.id);
      session.user.name = row.name || 'Traveler';
      session.user.email = row.email ?? '';
      session.user.image = row.picture;
      session.user.picture = row.picture;
      session.user.admin = isAdminEmail(row.email);
      return session;
    },

    /**
     * Only same-site destinations after login. Auth.js already validates the
     * callback URL, but keeping the check here makes the relative `?next=`
     * paths used by the login page work and documents the intent.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // fall through
      }
      return baseUrl;
    },
  },
});

/**
 * Again only same-site absolute paths may be used as post-login destinations.
 * Kept for the login page and the submissions form.
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const path = value.trim();
  if (!path || path.length > 300) return null;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null;
  if (path.startsWith('/api/') || path === '/api') return null;
  return path;
}

/**
 * The signed-in user for the current request, or null.
 *
 * Wrapped in React's `cache` so one render shares the lookup. Only used from
 * dynamic routes and route handlers — never from a statically rendered page.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const session = await auth();
    const user = session?.user;
    const id = Number(user?.id);
    if (!user || !Number.isSafeInteger(id) || id <= 0) return null;
    return {
      id,
      name: user.name || 'Traveler',
      email: user.email ?? null,
      picture: user.picture ?? user.image ?? null,
    };
  } catch (error) {
    // A missing AUTH_SECRET or a database blip must degrade to "signed out".
    console.error('[auth] session lookup failed', error);
    return null;
  }
});
