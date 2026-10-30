import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { getCurrentUser, isGoogleAuthConfigured } from '@/lib/auth';

/**
 * Current visitor's login state, for the client-side account chip.
 *
 *   GET /api/auth/session → { user, configured }
 *
 * The header cannot read cookies server-side without making every page
 * dynamic, so it asks this endpoint after mount instead.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    {
      user,
      configured: isGoogleAuthConfigured(),
      // Lets the account menu offer the admin link without a second request;
      // the admin pages/APIs still enforce the allowlist themselves.
      admin: user ? isAdminEmail(user.email) : false,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
