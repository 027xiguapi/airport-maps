import Link from 'next/link';
import {
  formatDealDate,
  formatDealDateTime,
  formatDealLabel,
  formatDealPrice,
  type DealCabin,
  type PublicDeal,
} from '@/lib/deal-format';
import type { DealsMessages } from '@/lib/i18n/deals';
import { ArrowIcon, PlaneIcon } from '@/lib/icons';

type Props = {
  deal: PublicDeal;
  /** BCP 47 tag for price/date formatting (`zh-hans`, `en`, …). */
  lang: string;
  labels: DealsMessages;
  /** Localised link to the departure airport's page. */
  airportHref: string;
  /** Own-submission view: show moderation state instead of the booking CTA. */
  status?: 'visible' | 'hidden';
  expired?: boolean;
  className?: string;
};

const CABIN_LABEL: Record<DealCabin, keyof DealsMessages> = {
  economy: 'economy',
  premium: 'premium',
  business: 'business',
  first: 'first',
};

/**
 * One fare. A plain component (no hooks, no server imports) so the homepage,
 * the deals page and the "my submissions" page can all render it, on either
 * side of the server/client boundary.
 *
 * The outbound booking link is marked `nofollow sponsored` and opens in a new
 * tab: this is user-supplied commercial content, not an endorsement.
 */
export default function DealCard({
  deal,
  lang,
  labels,
  airportHref,
  status,
  expired,
  className,
}: Props) {
  const price = formatDealPrice(deal.price, deal.currency, lang);
  const from = formatDealDate(deal.travelFrom, lang);
  const to = formatDealDate(deal.travelTo, lang);
  const travel =
    from && to
      ? `${from} – ${to}`
      : from
        ? `${from}`
        : to
          ? `– ${to}`
          : '';
  const submitted = formatDealLabel(labels.submittedBy, { name: deal.submitterName });
  const submittedAt = formatDealLabel(labels.submittedAt, {
    date: formatDealDateTime(deal.createdAt, lang),
  });
  const expires = formatDealLabel(labels.expires, { date: formatDealDate(deal.expiresAt, lang) });
  const statusLabel =
    status === 'hidden'
      ? labels.statusHidden
      : expired
        ? labels.statusExpired
        : !deal.taxIncluded
          ? labels.taxExcluded
          : labels.unverified;

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
          <span className="block truncate font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
            {deal.airline}
          </span>
          <div className="mt-1.5 flex min-w-0 items-start gap-2">
            <Link
              className="mt-0.5 flex-none font-display text-[19px] font-semibold tracking-[0.03em] text-ink-heading hover:text-sky-600"
              href={airportHref}
            >
              {deal.airport.iata}
            </Link>
            <span className="mt-[3px] flex-none text-ink-faint" aria-hidden="true">
              <PlaneIcon />
            </span>
            {/* English primary, Chinese auxiliary on the line below. Keeping the
                two apart avoids the card truncating the Chinese half of a long
                "English (中文)" destination. */}
            <span className="min-w-0">
              <span className="block break-words text-[15.5px] font-semibold leading-snug text-ink">
                {deal.destination}
              </span>
              {deal.destinationAlt && (
                <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
                  {deal.destinationAlt}
                </span>
              )}
            </span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-ink-soft">
            {deal.airport.flagUrl && (
              <img
                className="h-[12px] w-[18px] flex-none object-cover [box-shadow:var(--flag-ring)]"
                src={deal.airport.flagUrl}
                alt=""
                width={18}
                height={12}
                loading="lazy"
              />
            )}
            <span className="truncate">
              {deal.airport.city} · {deal.airport.name}
            </span>
          </div>
        </div>
        <div className="flex-none text-right">
          <div className="whitespace-nowrap font-display text-[25px] font-bold leading-none tracking-[0.01em] text-ink-heading">
            {price}
          </div>
          <div className="mt-2 inline-flex border border-line px-2 py-[3px] text-[11px] text-ink-soft">
            {labels[CABIN_LABEL[deal.cabin]]} ·{' '}
            {deal.tripType === 'roundtrip' ? labels.roundTrip : labels.oneWay}
          </div>
          {!deal.taxIncluded && (
            <div className="mt-1.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.06em] text-amber">
              {labels.taxExcluded}
            </div>
          )}
        </div>
      </div>

      {travel && (
        <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-none opacity-60"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          <span className="min-w-0 truncate">{travel}</span>
        </div>
      )}

      {deal.notes && (
        <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-[13px] leading-[1.7] text-ink-soft">
          {deal.notes}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="min-w-0 text-[11px] leading-[1.6] text-ink-faint">
          <span className="block truncate">
            {deal.isOfficial ? labels.officialFare : submitted}
          </span>
          <span className="block truncate">{deal.isOfficial ? submitted : submittedAt}</span>
          <span className="block truncate">{deal.isOfficial ? submittedAt : statusLabel}</span>
        </div>
        {status || expired ? (
          <span className="flex-none text-[11px] text-ink-faint">{expires}</span>
        ) : deal.bookingUrl ? (
          <a
            className="inline-flex flex-none items-center gap-1.5 border border-amber bg-amber px-3.5 py-2 text-[12.5px] font-bold text-navy-900 transition-[filter] duration-150 hover:brightness-[1.06]"
            href={deal.bookingUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
          >
            {labels.viewDeal}
            <ArrowIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}
