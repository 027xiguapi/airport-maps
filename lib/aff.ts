import type { DealKind } from '@/lib/deal-format';

/**
 * Affiliate link resolution for outbound booking CTAs.
 *
 * Two sources, in order:
 *
 *   1. `deals.aff_url` — an explicit link written by the admin screen or the
 *      collector. It wins verbatim; nothing is appended to it.
 *   2. For machine-collected fares (`kind = 'fare'`) only, the site-wide
 *      parameters from the environment are merged into `booking_url`:
 *        AFF_QUERY=marker=123456&campaign=airport-maps   (full query string)
 *        AFF_PARAM=marker AFF_VALUE=123456               (single parameter)
 *      Reader-submitted and official links are never rewritten: the URL belongs
 *      to whoever submitted it, and appending our marker to it would be wrong.
 *
 * Server-only (`process.env`). Callers hand the result to the client as
 * `PublicDeal.affUrl`; the card uses it as `affUrl ?? bookingUrl`.
 */
export function resolveAffiliateUrl(
  kind: DealKind,
  bookingUrl: string | null,
  affUrl: string | null
): string | null {
  if (affUrl) return affUrl;
  if (kind !== 'fare' || !bookingUrl) return null;

  const params = affiliateParams();
  if (!params) return null;

  try {
    const url = new URL(bookingUrl);
    for (const [name, value] of params) url.searchParams.set(name, value);
    return url.toString();
  } catch {
    // A malformed provider link must not take the listing down; the card falls
    // back to the clean URL.
    return null;
  }
}

/** Affiliate parameters from the environment, or null when not configured. */
function affiliateParams(): URLSearchParams | null {
  const query = process.env.AFF_QUERY?.trim();
  if (query) {
    const params = new URLSearchParams(query.replace(/^\?/, ''));
    return [...params.keys()].length > 0 ? params : null;
  }

  const name = process.env.AFF_PARAM?.trim();
  const value = process.env.AFF_VALUE?.trim();
  if (!name || !value) return null;
  return new URLSearchParams({ [name]: value });
}
