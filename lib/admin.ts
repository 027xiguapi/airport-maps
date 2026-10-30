import { getCurrentUser, type AuthUser } from '@/lib/auth';

/**
 * Administrator gate.
 *
 * There is no role column: an administrator is simply a signed-in Google
 * account whose email appears in `ADMIN_EMAILS` (comma-separated, case
 * insensitive). Keeping the allowlist in the environment means adding or
 * removing an admin is a restart, not a migration — and it cannot be granted
 * by another admin through the UI.
 *
 * With `ADMIN_EMAILS` unset nobody is an administrator; /admin explains that
 * instead of falling back to "any signed-in user", which would be dangerous.
 */

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return adminEmails().includes(normalized);
}

export function isAdminConfigured(): boolean {
  return adminEmails().length > 0;
}

/** The signed-in administrator, or null for anyone else (including guests). */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  return user && isAdminEmail(user.email) ? user : null;
}
