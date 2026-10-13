'use client';

import { useEffect, useState } from 'react';
import { ADSTERRA_UNITS, adsterraBannerSrcDoc, type AdsterraUnitId } from '@/lib/ads';

/**
 * Minimum viewport (px) at which each unit still fits where it sits: the
 * leaderboard needs a content column that can hold 728px plus the section
 * padding, while the 160px rail units share the sidebar layout's desktop
 * breakpoint (1081px in globals.css).
 */
const MIN_VIEWPORT_WIDTH: Record<AdsterraUnitId, number> = {
  leaderboard: 800,
  'half-page': 1081,
  skyscraper: 1081,
};

/**
 * A fixed-size Adsterra banner. The snippet runs inside the iframe's own
 * document (see lib/ads.ts for why). The iframe is only
 * mounted once the viewport can show the whole unit, because an iframe parked
 * in a `display:none` box still loads and would book a hidden impression; the
 * wrapper's matching display rules in globals.css only collapse the empty
 * server-rendered box on those same viewports.
 */
export default function AdsterraBanner({
  unit,
  title,
  className,
}: {
  unit: AdsterraUnitId;
  /** Accessible iframe label — callers pass the localized "advertisement". */
  title: string;
  /** Wrapper spacing at the call site (margins); centering comes from CSS. */
  className?: string;
}) {
  const { width, height } = ADSTERRA_UNITS[unit];
  const minWidth = MIN_VIEWPORT_WIDTH[unit];
  const [live, setLive] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setLive(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [minWidth]);

  return (
    <div className={className} data-ad-slot={unit}>
      {live && (
        <iframe
          title={title}
          width={width}
          height={height}
          srcDoc={adsterraBannerSrcDoc(unit)}
          loading="lazy"
          scrolling="no"
          style={{ border: 0, display: 'block' }}
        />
      )}
    </div>
  );
}
