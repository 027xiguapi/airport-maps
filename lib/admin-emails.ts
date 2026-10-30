/**
 * Administrator email allowlist.
 *
 * Lives in its own leaf module (no auth/database imports) so both the NextAuth
 * session callback and the admin gate can use it without a circular import.
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
