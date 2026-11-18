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
 * throwaway document (see lib/ads.ts for why), and the iframe only mounts
 * while the viewport sits inside the unit's ADSTERRA_RANGE window — a wrapper
 * outside the window renders no children and collapses via
 * `[data-ad-slot]:empty` (globals.css). A mounted ad is never hidden with CSS:
 * hidden impressions are fraudulent billing. Dev hosts never mount ads at all
 * (DEV_HOST in lib/ads.ts).
 */
export default function AdsterraBanner({
  unit,
  title,
  className,
}: {
  /** Which dashboard unit this slot serves. */
  unit: AdsterraUnitId;
  /** Accessible iframe label — callers pass the localized "advertisement". */
  title: string;
  /** Wrapper spacing, applied whether or not the slot is in range. */
  className?: string;
}) {
  const { width, height } = ADSTERRA_UNITS[unit];
  const { min, max } = ADSTERRA_RANGE[unit];
  const [inRange, setInRange] = useState(false);

  useEffect(() => {
    // An impression booked from a dev host is a fake one against the account.
    if (DEV_HOST.test(window.location.hostname)) return;
    const query = `(min-width: ${min}px)${max ? ` and (max-width: ${max}px)` : ''}`;
    const mql = window.matchMedia(query);
    const apply = () => setInRange(mql.matches);
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [min, max]);

  return (
    <div className={className} data-ad-slot>
      {inRange && (
        <iframe
          height={height}
          scrolling="no"
          srcDoc={adsterraBannerSrcDoc(unit)}
          style={{ border: 0, display: 'block' }}
          title={title}
          width={width}
        />
      )}
    </div>
  );
}
