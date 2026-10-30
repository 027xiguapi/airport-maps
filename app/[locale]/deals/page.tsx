import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import DealsBoard from '@/components/deals/DealsBoard';
import { listDeals } from '@/lib/deals';
import type { PublicDeal } from '@/lib/deal-format';
import { getMessages, languageAlternates, parseLocale } from '@/lib/i18n';
import { LOCALE_META, localizedPath } from '@/lib/i18n/config';
import { getDealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon } from '@/lib/icons';

/**
 * Deals index. The requested page is rendered on the server (SEO, no-JS,
 * refresh-safe `?page=N`) and refreshed on mount by DealsBoard, so a freshly
 * posted fare shows up without a rebuild. Search params make this route
 * dynamic; the rest of the site keeps its ISR/static pages.
 */
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** 1-based page number from `?page=`, clamped to a sane starting point. */
function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const d = getDealsMessages(locale);
  return {
    title: d.title,
    description: d.sub,
    alternates: {
      canonical: localizedPath(locale, '/deals'),
      languages: languageAlternates('/deals'),
    },
    openGraph: {
      type: 'website',
      title: d.title,
      description: d.sub,
      url: localizedPath(locale, '/deals'),
      locale: LOCALE_META[locale].ogLocale,
    },
  };
}

export default async function DealsPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();

  const t = getMessages(locale);
  const d = getDealsMessages(locale);
  const lang = LOCALE_META[locale].htmlLang;
  const { page: pageParam, q } = await searchParams;
  const page = parsePage(pageParam);
  const search = (q ?? '').trim().slice(0, 80);

  let deals: PublicDeal[] = [];
  let total = 0;
  try {
    ({ deals, total } = await listDeals({
      locale,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      q: search,
    }));
  } catch (error) {
    // A deployment that has not run the migration yet should still serve the
    // page shell and its empty state rather than a 500.
    console.error('[deals] listing failed', error);
  }

  // A stale/shared link past the last page lands on the last real page instead
  // of an empty grid.
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total > 0 && page > totalPages) {
    const target = new URLSearchParams();
    if (search) target.set('q', search);
    target.set('page', String(totalPages));
    redirect(`${localizedPath(locale, '/deals')}?${target.toString()}`);
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[{ label: t.common.home, href: '/' }, { label: d.kicker }]}
          />
          <div className="country-hero">
            <div>
              <h1>{d.title}</h1>
              <div className="sub">{d.listingSub}</div>
            </div>
            <Link
              className="inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
              href={localizedPath(locale, '/deals/new')}
            >
              {d.submit}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>

      <section className="section pt-8">
        <DealsBoard
          locale={locale}
          lang={lang}
          labels={d}
          initialDeals={deals}
          initialTotal={total}
          initialPage={page}
          initialSearch={search}
          pageSize={PAGE_SIZE}
          showSearch
          paginated
        />
        <p className="mt-6 max-w-[820px] text-[12px] leading-[1.7] text-ink-faint">
          {d.disclaimer}
        </p>
      </section>
    </>
  );
}
