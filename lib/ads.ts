/**
 * Adsterra ad units for worldairportmap.com.
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

export type AdsterraUnitId = 'half-page' | 'skyscraper' | 'leaderboard';

/** The units as created in the Adsterra panel (key + iframe creative size). */
export const ADSTERRA_UNITS: Record<
  AdsterraUnitId,
  { key: string; width: number; height: number }
> = {
  'half-page': { key: 'bd10f7f24dd66b3139e0ae2a5d3fe8be', width: 160, height: 300 },
  skyscraper: { key: '1aeb1815110c8241307e2ada6cb79992', width: 160, height: 600 },
  leaderboard: { key: '15408e45dfc74cb0ac05dd375345e42a', width: 728, height: 90 },
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

/** Adsterra native banner: the async script that fills the container below. */
export const ADSTERRA_NATIVE_SRC = 'https://bauval.org/21/0cf14686b418b04e8a3d6b4da581fa43';

/** The remote script looks its container up by this exact id, so a page must
 *  render at most one native unit (components/ads/AdsterraNative.tsx). */
export const ADSTERRA_NATIVE_CONTAINER_ID = 'container-0cf14686b418b04e8a3d6b4da581fa43';

/** Smartlink direct-link offer; the footer links to it as the sponsored entry. */
export const ADSTERRA_SMARTLINK = 'https://araplhn.org/4/4cc3148ce637c5b7a170f36453d6015f';
