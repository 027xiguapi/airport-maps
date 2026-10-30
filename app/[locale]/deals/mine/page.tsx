import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import DealCard from '@/components/deals/DealCard';
import { getCurrentUser } from '@/lib/auth';
import { listUserDeals } from '@/lib/deals';
import { parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { getDealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon } from '@/lib/icons';

/**
 * The signed-in submitter's own offers, including hidden and expired ones, so
 * the page can explain what happened to a submission instead of silently
 * dropping it from the list.
 */
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const d = getDealsMessages(locale);
  return {
    title: d.mineTitle,
    robots: { index: false, follow: false },
  };
}

export default async function MyDealsPage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `${localizedPath(locale, '/login')}?next=${encodeURIComponent(
        localizedPath(locale, '/deals/mine')
      )}`
    );
  }

  const d = getDealsMessages(locale);
  const lang = LOCALE_META[locale].htmlLang;
  const deals = await listUserDeals(locale, user.id);
  const now = Date.now();

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-20 pt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-kicker">{d.kicker}</div>
          <h1 className="text-[28px] font-black leading-tight text-ink-heading">{d.mineTitle}</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-soft">
            {user.name}
            {user.email ? ` · ${user.email}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="section-more" href={localizedPath(locale, '/deals')}>
            {d.backToDeals}
            <ArrowIcon />
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
            href={localizedPath(locale, '/deals/new')}
          >
            {d.submit}
            <ArrowIcon />
          </Link>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="border border-dashed border-line bg-card px-6 py-10 text-center">
          <p className="m-0 text-[14px] text-ink-soft">{d.mineEmpty}</p>
          <Link
            className="mt-4 inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
            href={localizedPath(locale, '/deals/new')}
          >
            {d.submit}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              lang={lang}
              labels={d}
              airportHref={localizedPath(locale, `/airport/${deal.airport.iata}`)}
              status={deal.status}
              expired={new Date(deal.expiresAt).getTime() < now}
            />
          ))}
        </div>
      )}

      <p className="mt-6 max-w-[760px] text-[11.5px] leading-[1.7] text-ink-faint">
        {d.disclaimer}
      </p>
    </section>
  );
}
