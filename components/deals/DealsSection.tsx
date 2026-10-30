import Link from 'next/link';
import DealsBoard from '@/components/deals/DealsBoard';
import type { PublicDeal } from '@/lib/deal-format';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { DealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon } from '@/lib/icons';

type Props = {
  locale: Locale;
  lang: string;
  labels: DealsMessages;
  deals: PublicDeal[];
  total: number;
};

/**
 * Homepage deals strip: the newest offers plus the two actions (browse all,
 * post one). Rendered on the server for SEO, then kept fresh client-side by
 * DealsBoard's mount refresh.
 *
 * The white band is a full-bleed wrapper: `bg-card` is #fff in the light theme
 * (and the card surface in dark), and applying it to the inner `.section`
 * would only paint the 1240px content column, leaving the page's paper
 * background visible in the margins.
 */
export default function DealsSection({ locale, lang, labels, deals, total }: Props) {
  return (
    <div className="bg-card">
      <section className="section pb-14" id="deals">
        <div className="section-head">
          <div>
            <div className="section-kicker">{labels.kicker}</div>
            <h2 className="section-title">
              {labels.title}
              <span className="en">{labels.en}</span>
            </h2>
            <p className="sec-sub">{labels.sub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 max-[820px]:w-full">
            <Link className="section-more" href={localizedPath(locale, '/deals')}>
              {labels.all}
              <ArrowIcon />
            </Link>
            <Link
              className="inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] duration-150 hover:brightness-[1.06]"
              href={localizedPath(locale, '/deals/new')}
            >
              {labels.submit}
              <ArrowIcon />
            </Link>
          </div>
        </div>

        <DealsBoard
          locale={locale}
          lang={lang}
          labels={labels}
          initialDeals={deals}
          initialTotal={total}
          pageSize={6}
        />

        <p className="mt-5 max-w-[760px] text-[12px] leading-[1.7] text-ink-faint">
          {labels.disclaimer}
        </p>
      </section>
    </div>
  );
}
