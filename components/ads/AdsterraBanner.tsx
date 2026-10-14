'use client';

import { useEffect, useState } from 'react';
import {
  ADSTERRA_RANGE,
  ADSTERRA_UNITS,
  DEV_HOST,
  adsterraBannerSrcDoc,
  type AdsterraUnitId,
} from '@/lib/ads';

/**
 * A fixed-size Adsterra banner. The snippet runs inside the iframe's own
 * document (see lib/ads.ts for why). The iframe only mounts while the viewport
 * sits inside the unit's ADSTERRA_RANGE window — an iframe parked in a
 * `display:none` box still loads and would book a hidden impression — so
 * outside the window the component renders an empty wrapper, which
 * globals.css collapses with `:empty`. A mounted ad is never hidden.
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
  const { min, max } = ADSTERRA_RANGE[unit];
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (DEV_HOST.test(window.location.hostname)) return;
    const query = window.matchMedia(
      `(min-width: ${min}px)${max ? ` and (max-width: ${max}px)` : ''}`
    );
    const sync = () => setLive(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [min, max]);

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
