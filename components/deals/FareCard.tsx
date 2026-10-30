import Link from 'next/link';
import {
  formatDuration,
  formatFareDate,
  formatUsd,
  type FareOffer,
} from '@/lib/fare-format';
import { formatDealDateTime } from '@/lib/deal-format';
import { formatFareLabel, type FaresMessages } from '@/lib/i18n/fares';
import type { DealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon, PlaneIcon } from '@/lib/icons';

type Props = {
  offer: FareOffer;
  /** BCP 47 tag for price and date formatting. */
  lang: string;
  labels: FaresMessages;
  /** Cabin and trip-type words are shared with the community cards. */
  deals: DealsMessages;
  /** Localised link to the departure airport's page. */
  originHref: string;
  className?: string;
};

const CABIN_LABEL = {
  economy: 'economy',
  premium: 'premium',
  business: 'business',
  first: 'first',
} as const;

/**
 * One machine-verified fare.
 *
 * A sibling of DealCard rather than a variant: this card carries things a
 * community submission cannot (stop count, flight time, baseline price, a
 * verification timestamp) and it always speaks in USD. Keeping them separate
 * means neither type grows a pile of optional fields.
 *
 * The booking link goes through /go so the click is recorded before the
 * affiliate redirect; it is still marked `nofollow sponsored`.
 */
export default function FareCard({ offer, lang, labels, deals, originHref, className }: Props) {
  const price = formatUsd(offer.priceUsd, lang);
  const depart = formatFareDate(offer.departDate, lang);
  const back = formatFareDate(offer.returnDate, lang);
  const duration = formatDuration(offer.durationMinutes, lang);
  const stops =
    offer.stops === 0
      ? labels.stopsNonstop
      : offer.stops === 1
        ? labels.stopsOne
        : formatFareLabel(labels.stopsMany, { n: offer.stops });
  const verified = offer.verifiedAt
    ? formatFareLabel(labels.verifiedAt, { date: formatDealDateTime(offer.verifiedAt, lang) })
    : '';
  const discount = offer.discountPct != null && offer.discountPct >= 15 ? offer.discountPct : null;

  return (
    <article
      className={[
        'group flex flex-col border border-line bg-card p-5 [box-shadow:var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 hover:border-sky-300 hover:[box-shadow:var(--shadow-md)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 truncate font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
            {offer.airline}
            {offer.airlineCode && (
              <span className="font-normal tracking-[0.04em] text-ink-faint">
                {offer.airlineCode}
              </span>
            )}
          </span>
          <div className="mt-1.5 flex min-w-0 items-start gap-2">
            <Link
              className="mt-0.5 flex-none font-display text-[19px] font-semibold tracking-[0.03em] text-ink-heading hover:text-sky-600"
              href={originHref}
            >
              {offer.origin.iata}
            </Link>
            <span className="mt-[3px] flex-none text-ink-faint" aria-hidden="true">
              <PlaneIcon />
            </span>
            <span className="min-w-0">
              <span className="block break-words font-display text-[17px] font-semibold leading-snug text-ink">
                {offer.destination.iata}
              </span>
              {offer.destination.city && (
                <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-ink-soft">
                  {offer.destination.city}
                </span>
              )}
            </span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-ink-soft">
            {offer.origin.flagUrl && (
              <img
                className="h-[12px] w-[18px] flex-none object-cover [box-shadow:var(--flag-ring)]"
                src={offer.origin.flagUrl}
                alt=""
                width={18}
                height={12}
                loading="lazy"
              />
            )}
            <span className="truncate">
              {offer.origin.city} · {offer.origin.iata}
            </span>
          </div>
        </div>
        <div className="flex-none text-right">
          <div className="whitespace-nowrap font-display text-[25px] font-bold leading-none tracking-[0.01em] text-ink-heading">
            {price}
          </div>
          <div className="mt-2 inline-flex border border-line px-2 py-[3px] text-[11px] text-ink-soft">
            {deals[CABIN_LABEL[offer.cabin]]} ·{' '}
            {offer.tripType === 'roundtrip' ? deals.roundTrip : deals.oneWay}
          </div>
          {discount !== null && (
            <div className="mt-1.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.06em] text-amber">
              −{discount}%
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
        <span className="min-w-0 truncate">
          {back ? `${depart} – ${back}` : depart}
        </span>
        <span className="flex-none text-ink-faint" aria-hidden="true">
          ·
        </span>
        <span className="flex-none">{stops}</span>
        {duration && (
          <>
            <span className="flex-none text-ink-faint" aria-hidden="true">
              ·
            </span>
            <span className="flex-none">{duration}</span>
          </>
        )}
        {offer.flights && (
          <span className="w-full truncate text-[11.5px] text-ink-faint">{offer.flights}</span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="min-w-0 text-[11px] leading-[1.6] text-ink-faint">
          <span className="inline-flex items-center gap-1 border border-line px-1.5 py-[2px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-sky-600">
            {labels.verified}
          </span>
          {verified && <span className="mt-1 block truncate">{verified}</span>}
        </div>
        <a
          className="inline-flex flex-none items-center gap-1.5 border border-amber bg-amber px-3.5 py-2 text-[12.5px] font-bold text-navy-900 transition-[filter] duration-150 hover:brightness-[1.06]"
          href={`/go/fare/${offer.id}`}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
        >
          {deals.viewDeal}
          <ArrowIcon />
        </a>
      </div>
    </article>
  );
}
