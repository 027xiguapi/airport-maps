import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  deleteSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  secureCookies,
} from '@/lib/auth';
import { isSameOrigin } from '@/lib/http';

/**
 * Signs the visitor out: deletes the session row and clears the cookie.
 *
 *   POST /api/auth/logout
 *
 * POST-only (with an Origin check) so a cross-site image or link cannot log
 * people out silently; the account chip calls it with fetch().
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await deleteSession(token);
    } catch (error) {
      // Clearing the cookie is still the right outcome; a stale session row
      // expires on its own.
      console.error('[auth] logout failed to delete session', error);
    }
  }

  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions(secureCookies(request)),
    maxAge: 0,
  });
  return response;
}
