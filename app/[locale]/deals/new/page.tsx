import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DealSubmitForm from '@/components/deals/DealSubmitForm';
import LogoutButton from '@/components/auth/LogoutButton';
import { getCurrentUser, isGoogleAuthConfigured } from '@/lib/auth';
import { formatDealLabel } from '@/lib/deal-format';
import { parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { getAuthMessages, getDealsMessages } from '@/lib/i18n/deals';

/**
 * Deal submission page. Sign-in is required (attribution is what makes an
 * immediately-published board usable), so an anonymous visitor sees the Google
 * prompt here instead of an empty form.
 */
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ airport?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const d = getDealsMessages(locale);
  return {
    title: d.submitTitle,
    description: d.submitSub,
    // A form page adds nothing for a crawler and must not rank for the fares
    // themselves.
    robots: { index: false, follow: true },
  };
}

export default async function NewDealPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const { airport: rawAirport } = await searchParams;
  const airport = /^[A-Za-z]{3}$/.test((rawAirport ?? '').trim())
    ? (rawAirport ?? '').trim().toUpperCase()
    : undefined;

  const d = getDealsMessages(locale);
  const a = getAuthMessages(locale);
  const user = await getCurrentUser();
  const configured = isGoogleAuthConfigured();

  const returnPath = `${localizedPath(locale, '/deals/new')}${
    airport ? `?airport=${airport}` : ''
  }`;
  const startHref = `/api/auth/google?locale=${locale}&next=${encodeURIComponent(returnPath)}`;

  return (
    <section className="mx-auto max-w-[860px] px-6 pb-20 pt-12">
      <div className="mb-6">
        <Link className="section-more" href={localizedPath(locale, '/deals')}>
          {d.backToDeals}
        </Link>
        <h1 className="mt-3 text-[30px] font-black leading-tight text-ink-heading">
          {d.submitTitle}
        </h1>
        <p className="mt-2 max-w-[720px] text-[14px] leading-[1.8] text-ink-soft">{d.submitSub}</p>
      </div>

      {user ? (
        <>
          <p className="mb-5 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
            <span className="inline-flex items-center gap-2 border border-line bg-card px-3 py-1.5">
              {user.picture ? (
                <img
                  className="h-5 w-5 rounded-full object-cover"
                  src={user.picture}
                  alt=""
                  width={20}
                  height={20}
                  referrerPolicy="no-referrer"
                />
              ) : null}
              {formatDealLabel(a.signedInAs, { name: user.name })}
            </span>
            <LogoutButton locale={locale} label={a.signOut} pendingLabel={a.loading} redirectTo="/" />
          </p>
          <DealSubmitForm
            locale={locale}
            lang={LOCALE_META[locale].htmlLang}
            labels={d}
            authLabels={a}
            defaultAirport={airport}
            signInHref={startHref}
          />
        </>
      ) : (
        <div className="border border-line bg-card p-6 [box-shadow:var(--shadow-sm)] sm:p-8">
          <h2 className="font-display text-[19px] font-bold text-ink-heading">{d.signInTitle}</h2>
          <p className="mt-2 max-w-[620px] text-[13.5px] leading-[1.8] text-ink-soft">
            {d.signInBody}
          </p>
          {configured ? (
            <a
              className="mt-5 inline-flex items-center gap-2.5 bg-amber px-5 py-3 text-[14px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
              href={startHref}
            >
              {d.signInCta}
            </a>
          ) : (
            <div className="mt-5 border border-dashed border-line bg-paper px-4 py-3">
              <b className="block text-[13px] text-ink-heading">{a.notConfiguredTitle}</b>
              <p className="mt-1 text-[12.5px] leading-[1.7] text-ink-soft">{a.notConfiguredBody}</p>
            </div>
          )}
          <p className="mt-5 text-[11.5px] leading-[1.7] text-ink-faint">{a.privacyNote}</p>
        </div>
      )}

      <p className="mt-6 text-[11.5px] leading-[1.7] text-ink-faint">{d.submitNote}</p>
    </section>
  );
}
