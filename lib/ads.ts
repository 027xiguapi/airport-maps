/**
 * Adsterra ad units for worldairportmap.com — banner formats only: the
 * account's other unit types (native banner, smartlink) are intentionally not
 * integrated.
 *
 * The banner snippets work by assigning a global `atOptions` and then loading
 * an invocation script that `document.write`s the ad's iframe. Run directly in
 * the page from a React app both halves misbehave: `atOptions` is a single
 * global (two units on one page clobber each other), and a `document.write`
 * after load replaces the whole document. Each banner therefore renders inside
 * its own <iframe srcDoc> (components/ads/AdsterraBanner.tsx) so the snippet
 * runs in a throwaway document — the integration Adsterra recommends for
 * SPA/React sites.
 */

export type AdsterraUnitId =
  | 'mobile-banner'
  | 'full-banner'
  | 'leaderboard'
  | 'medium-rectangle'
  | 'half-page'
  | 'skyscraper';

/** The units as created in the Adsterra panel (key + iframe creative size). */
export const ADSTERRA_UNITS: Record<
  AdsterraUnitId,
  { key: string; width: number; height: number }
> = {
  'mobile-banner': { key: '6d843dae75b59247d476548f690c73c5', width: 320, height: 50 },
  'full-banner': { key: 'f0f3fad333648961f6aa45f639d07679', width: 468, height: 60 },
  leaderboard: { key: '15408e45dfc74cb0ac05dd375345e42a', width: 728, height: 90 },
  'medium-rectangle': { key: '01cfce8ad49373eb17e32acd53ea0250', width: 300, height: 250 },
  'half-page': { key: 'bd10f7f24dd66b3139e0ae2a5d3fe8be', width: 160, height: 300 },
  skyscraper: { key: '1aeb1815110c8241307e2ada6cb79992', width: 160, height: 600 },
};

/**
 * The viewport window (CSS px) each unit renders in, sized so the creative
 * plus the section's horizontal padding always fits. The three horizontal
 * strips tile the axis without overlap, which is what lets
 * components/ads/AdsterraStrip.tsx stack them as one slot:
 *
 *   320×50  380–519    phones
 *   468×60  520–799    small windows, tablets
 *   728×90  800+       desktop
 *
 * The upper bounds end in .98 so a fractional width (high-DPR) never falls
 * between neighbouring windows. This map is the single source of truth: the
 * component gates mounting on it (matchMedia) and globals.css collapses the
 * empty wrapper whenever no unit is mounted, so there is nothing to keep in
 * step by hand.
 */
export const ADSTERRA_RANGE: Record<AdsterraUnitId, { min: number; max?: number }> = {
  'mobile-banner': { min: 380, max: 519.98 },
  'full-banner': { min: 520, max: 799.98 },
  leaderboard: { min: 800 },
  'medium-rectangle': { min: 360 },
  'half-page': { min: 1081 },
  skyscraper: { min: 1081 },
};

/** Invocation host for the iframe-format units (Adsterra's /22/ path). */
const BANNER_HOST = 'https://bauval.org';

/** The document loaded into a banner's ad iframe: Adsterra's two tags in order. */
export function adsterraBannerSrcDoc(id: AdsterraUnitId): string {
  const { key, width, height } = ADSTERRA_UNITS[id];
  const options = JSON.stringify({ key, format: 'iframe', height, width, params: {} });
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>' +
    '</head><body>' +
    `<script>atOptions=${options};</script>` +
    `<script src="${BANNER_HOST}/22/${key}"></script>` +
    '</body></html>'
  );
}
