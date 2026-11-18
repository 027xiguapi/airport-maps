import AdsterraBanner from './AdsterraBanner';

/**
 * One horizontal banner slot served at the size the viewport can hold: 320×50
 * on phones, 468×60 on tablets and small windows, 728×90 on desktop. The three
 * units' ranges tile the width axis (ADSTERRA_RANGE in lib/ads.ts) and the
 * empty wrappers collapse via CSS, so the slot shows exactly one ad on every
 * viewport — and none below 380px, where even the smallest banner would
 * overflow the section padding.
 */
export default function AdsterraStrip({
  title,
  className,
}: {
  /** Accessible iframe label — callers pass the localized "advertisement". */
  title: string;
  /** Wrapper spacing, applied to whichever unit is live. */
  className?: string;
}) {
  return (
    <>
      <AdsterraBanner unit="mobile-banner" title={title} className={className} />
      <AdsterraBanner unit="full-banner" title={title} className={className} />
      <AdsterraBanner unit="leaderboard" title={title} className={className} />
    </>
  );
}
