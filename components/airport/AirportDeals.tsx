import Link from 'next/link';
import DealCard from '@/components/deals/DealCard';
import type { PublicDeal } from '@/lib/deal-format';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { DealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon } from '@/lib/icons';

type Props = {
  locale: Locale;
  lang: string;
  labels: DealsMessages;
  iata: string;
  deals: PublicDeal[];
};

/**
 * Deals departing from one airport, on its detail page. Hidden entirely when
 * the airport has no current offer, so the 500+ directory pages stay clean
 * until someone posts a fare for them. Covered by the page's ISR window.
 */
export default function AirportDeals({ locale, lang, labels, iata, deals }: Props) {
  if (deals.length === 0) return null;

  return (
    <section className="mt-12" id="airport-deals">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{labels.kicker}</div>
          <h2 className="section-title">
            {labels.latest}
            <span className="en">{labels.en}</span>
          </h2>
          <p className="sec-sub">{labels.disclaimer}</p>
        </div>
        <Link
          className="section-more"
          href={localizedPath(locale, `/deals/new?airport=${iata}`)}
        >
          {labels.submit}
          <ArrowIcon />
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            lang={lang}
            labels={labels}
            airportHref={localizedPath(locale, `/airport/${deal.airport.iata}`)}
          />
        ))}
      </div>
    </section>
  );
}
