import type { DefaultSession } from 'next-auth';

/**
 * NextAuth session/JWT additions used by this app:
 *   - `user.id`   — the local integer user id (serialised as a string)
 *   - `user.admin` — email is in ADMIN_EMAILS
 *   - `user.picture` — avatar URL alias for `user.image`
 *   - `token.uid` — the same local id, carried in the JWT between requests
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      admin: boolean;
      picture: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    admin?: boolean;
    picture?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: number;
  }
}
