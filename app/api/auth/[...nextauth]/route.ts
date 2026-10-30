import { handlers } from '@/lib/auth';

/**
 * NextAuth catch-all:
 *   /api/auth/callback/google  — OAuth callback (matches Google Console)
 *   /api/auth/session          — session for the account chip
 *   /api/auth/signin/google    — sign-in start
 *   /api/auth/signout          — sign-out
 *   /api/auth/csrf             — CSRF token
 */
export const { GET, POST } = handlers;
