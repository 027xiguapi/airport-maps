import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import LogoutButton from '@/components/auth/LogoutButton';
import { getCurrentUser, isGoogleAuthConfigured, safeRedirectPath } from '@/lib/auth';
import { formatDealLabel } from '@/lib/deal-format';
import { getMessages, parseLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/config';
import { getAuthMessages } from '@/lib/i18n/deals';

/**
 * Google sign-in page.
 *
 * Reached from the header chip, the deals CTA and NextAuth's error redirects
 * (`?error=AccessDenied|Configuration|OAuthCallback|…`). Dynamic because it
 * reads the session cookie; deliberate and limited to this one route (the
 * header chip uses /api/auth/session so the rest stays static).
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

  // NextAuth passes its own error codes. `AccessDenied` is the user refusing
  // consent; `Configuration` means the server is missing something (usually
  // AUTH_SECRET); everything else is an OAuth round-trip failure.
  const errorMessage =
    error === 'AccessDenied' || error === 'access_denied'
      ? a.accessDenied
      : error === 'state_error'
        ? a.stateError
        : error
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
              <GoogleSignInButton label={a.signInWithGoogle} redirectTo={continueTo} />
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
