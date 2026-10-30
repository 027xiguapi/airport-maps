'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatDealLabel } from '@/lib/deal-format';

type SessionUser = {
  id: number;
  name: string;
  email: string | null;
  picture: string | null;
};

type Props = {
  locale: string;
  labels: {
    signIn: string;
    signOut: string;
    submit: string;
    mySubmissions: string;
    admin: string;
    accountMenu: string;
    loading: string;
    signedInAs: string;
  };
};

/**
 * Header account chip.
 *
 * The header is a server component shared by every statically rendered page,
 * so it cannot read the session cookie (that would make the whole directory
 * dynamic). This chip asks /api/auth/session after mount instead, which keeps
 * the 500+ airport pages static and costs one small request per visitor.
 */
export default function AccountMenu({ locale, labels }: Props) {
  const router = useRouter();
  const language = locale as Locale;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/session', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as {
          user?: SessionUser | null;
          admin?: boolean;
        };
        setUser(data.user ?? null);
        setIsAdmin(data.admin === true);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setUser(null);
      })
      .finally(() => setReady(true));
    return () => controller.abort();
  }, []);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      setUser(null);
      setIsAdmin(false);
      router.refresh();
    } catch {
      // The cookie may already be gone; the UI below treats it as signed out.
      setUser(null);
    } finally {
      setSigningOut(false);
    }
  };

  if (!ready) {
    return (
      <span
        className="inline-flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border border-[#d8e4ee] bg-white"
        aria-hidden="true"
      >
        <span className="h-3 w-3 animate-pulse rounded-full bg-[#c9d8e3]" />
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        className="inline-flex h-[34px] flex-none items-center justify-center gap-1.5 rounded-[18px] border border-[#d8e4ee] bg-white px-3 text-[13.5px] font-medium text-[#5e768a] transition-[background-color,border-color,color] duration-150 hover:border-amber hover:bg-[#f4f8fb] hover:text-navy-900 max-[1280px]:w-[34px] max-[1280px]:px-0"
        href={localizedPath(language, '/login')}
        title={labels.signIn}
        aria-label={labels.signIn}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="max-[1280px]:hidden">{labels.signIn}</span>
      </Link>
    );
  }

  const initial = [...user.name][0]?.toUpperCase() ?? '?';
  const signedInAs = formatDealLabel(labels.signedInAs, { name: user.name });

  return (
    <details className="group relative flex-none">
      <summary
        className="inline-flex h-[34px] cursor-pointer list-none items-center gap-1.5 rounded-[18px] border border-[#d8e4ee] bg-white px-1.5 text-[#5e768a] transition-[border-color,background-color] duration-150 hover:border-amber hover:bg-[#f4f8fb] [&::-webkit-details-marker]:hidden"
        aria-label={labels.accountMenu}
        title={labels.accountMenu}
      >
        {user.picture ? (
          <img
            className="h-[26px] w-[26px] flex-none rounded-full object-cover"
            src={user.picture}
            alt=""
            width={26}
            height={26}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <span
            className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-sky-100 font-display text-[13px] font-bold text-sky-600"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        {/* The name lives in the dropdown: a chip wide enough for a real name
            pushed the language switcher off a 1280px window. */}
      </summary>

      <div className="absolute right-0 top-[42px] z-[130] w-[248px] overflow-hidden rounded-xl border border-[#d8e4ee] bg-white text-[#16324b] [box-shadow:var(--shadow-lg)]">
        <div className="border-b border-[#e4edf4] px-4 py-3">
          <b className="block truncate text-[13.5px] font-semibold">{user.name}</b>
          <span className="mt-0.5 block truncate text-[11.5px] text-[#7b8fa1]">
            {user.email ?? signedInAs}
          </span>
        </div>
        {isAdmin && (
          <Link
            className="block border-b border-[#e4edf4] bg-[#f4f8fb] px-4 py-2.5 text-[13.5px] font-semibold text-[#2e6a93] transition-colors hover:bg-[#dcecf7]"
            href="/admin/deals"
          >
            {labels.admin}
          </Link>
        )}
        <Link
          className="block px-4 py-2.5 text-[13.5px] transition-colors hover:bg-[#dcecf7]"
          href={localizedPath(language, '/deals/new')}
        >
          {labels.submit}
        </Link>
        <Link
          className="block px-4 py-2.5 text-[13.5px] transition-colors hover:bg-[#dcecf7]"
          href={localizedPath(language, '/deals/mine')}
        >
          {labels.mySubmissions}
        </Link>
        <button
          type="button"
          className="block w-full border-t border-[#e4edf4] px-4 py-2.5 text-left text-[13.5px] text-[#b04a3a] transition-colors hover:bg-[#fdf0ee] disabled:opacity-60"
          onClick={signOut}
          disabled={signingOut}
        >
          {signingOut ? labels.loading : labels.signOut}
        </button>
      </div>
    </details>
  );
}
