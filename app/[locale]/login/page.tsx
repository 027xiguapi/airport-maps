import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import { getCurrentUser, isGoogleAuthConfigured, safeRedirectPath } from '@/lib/auth';
import { formatDealLabel } from '@/lib/deal-format';
import { getMessages, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { getAuthMessages } from '@/lib/i18n/deals';

/**
 * Google sign-in page.
 *
 * Reached from the header chip, the deals CTA and the OAuth error redirects
 * (`?error=not_configured|oauth_failed|access_denied|state_error`). Dynamic
 * because it reads the session cookie; that is deliberate and limited to this
 * one route (the header chip uses /api/auth/session so the rest stays static).
 */
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const a = getAuthMessages(locale);
  return {
    title: a.signInTitle,
    description: a.signInSub,
    // A sign-in page carries no indexable content and must not compete with
    // the pages it serves.
    robots: { index: false, follow: true },
  };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const { next: rawNext, error } = await searchParams;
  const a = getAuthMessages(locale);
  const t = getMessages(locale);
  const next = safeRedirectPath(rawNext);
  const user = await getCurrentUser();
  const configured = isGoogleAuthConfigured();

  const continueTo = next ?? localizedPath(locale, '/deals');
  const startHref = `/api/auth/google?locale=${locale}${
    next ? `&next=${encodeURIComponent(next)}` : ''
  }`;

  const errorMessage =
    error === 'access_denied'
      ? a.accessDenied
      : error === 'state_error'
        ? a.stateError
        : error === 'oauth_failed'
          ? a.oauthError
          : null;

  return (
    <section className="mx-auto max-w-[560px] px-6 pb-20 pt-14">
      <div className="border border-line bg-card p-6 [box-shadow:var(--shadow-sm)] sm:p-8">
        <div className="font-display text-[11.5px] font-semibold uppercase tracking-[0.2em] text-sky-600">
          {t.site.name}
        </div>
        <h1 className="mt-2 text-[28px] font-black leading-tight text-ink-heading">
          {a.signInTitle}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.8] text-ink-soft">{a.signInSub}</p>

        {user ? (
          <div className="mt-6">
            <div className="flex items-center gap-3 border border-line bg-paper px-4 py-3">
              {user.picture ? (
                <img
                  className="h-10 w-10 flex-none rounded-full object-cover"
                  src={user.picture}
                  alt=""
                  width={40}
                  height={40}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sky-100 font-display text-[16px] font-bold text-sky-600">
                  {[...user.name][0]?.toUpperCase() ?? '?'}
                </span>
              )}
              <div className="min-w-0">
                <b className="block truncate text-[14px] text-ink-heading">{user.name}</b>
                <span className="block truncate text-[12px] text-ink-soft">
                  {formatDealLabel(a.signedInAs, { name: user.name })}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
                href={continueTo}
              >
                {a.continueCta}
              </Link>
              <Link className="section-more" href={localizedPath(locale, '/deals/mine')}>
                {a.mySubmissions}
              </Link>
              <LogoutButton
                locale={locale}
                label={a.signOut}
                pendingLabel={a.loading}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {errorMessage && (
              <p className="mb-4 border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
                {errorMessage}
              </p>
            )}

            {configured ? (
              <a
                className="inline-flex h-[46px] w-full items-center justify-center gap-2.5 border border-[#d8e4ee] bg-white px-5 text-[14.5px] font-semibold text-[#1f3b52] transition-[border-color,box-shadow] duration-150 hover:border-[#2e7db3] hover:[box-shadow:0_2px_10px_rgba(10,42,67,0.12)]"
                href={startHref}
              >
                <GoogleMark />
                {a.signInWithGoogle}
              </a>
            ) : (
              <div className="border border-dashed border-line bg-paper px-4 py-4">
                <b className="block text-[13.5px] text-ink-heading">{a.notConfiguredTitle}</b>
                <p className="mt-1.5 text-[12.5px] leading-[1.75] text-ink-soft">
                  {a.notConfiguredBody}
                </p>
              </div>
            )}


          </div>
        )}

        <p className="mt-7 border-t border-line pt-4 text-[11.5px] leading-[1.75] text-ink-faint">
          {a.privacyNote}
        </p>
      </div>

      <div className="mt-5 text-center">
        <Link className="section-more" href={localizedPath(locale, '/')}>
          {a.backHome}
        </Link>
      </div>
    </section>
  );
}

/** Google's four-colour "G", inlined so the page makes no extra request. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="flex-none">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
