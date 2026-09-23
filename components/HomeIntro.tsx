import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/** The photo is the source asset in /public, so the intrinsic size is fixed here. */
const COVER = { src: '/terminal-maps.png', width: 1023, height: 600 };

/**
 * Homepage "what this site is" block: the terminal photo leads, then the three
 * heading/paragraph pairs from the catalog explain what the maps cover.
 *
 * Unlike the other homepage sections this one has no kicker or heading of its
 * own — the photo is the first thing the reader sees — so the section is named
 * by `ariaLabel` for assistive tech instead.
 *
 * Everything specific to this block is utility classes here rather than rules in
 * globals.css (the same move the header and CategoryGrid cards make). The 880px
 * measure is deliberately narrower than .section's 1240px so the running text
 * stays readable.
 *
 * The photo is a fixed-height banner: the height is the same at every viewport
 * width, so the block's layout does not change with the measure, and
 * `object-cover` crops the overhang rather than squashing the aircraft — the
 * source is 1023×600 (1.7:1), so any banner shorter than that trims top and
 * bottom. `object-[50%_40%]` biases the crop upwards to keep the aircraft (and
 * its nose, which sits high in the frame) whole. Phones get their own height:
 * a 420px band on a 390px screen would be nearly square and crop the plane out.
 * `space-y` supplies the gaps between the photo and each block.
 *
 * The one shared piece is `.section` on the outer element, the same container
 * every sibling section uses — that is what keeps the block's vertical rhythm in
 * step with the rest of the page.
 */
export default function HomeIntro({ locale }: { locale: Locale }) {
  const t = getMessages(locale);

  return (
    <section className="section" id="intro" aria-label={t.home.intro.ariaLabel}>
      <div className="mx-auto space-y-8 max-[640px]:space-y-7">
        <img
          className="block h-[320px] w-full object-cover object-[50%_40%] [box-shadow:var(--shadow-md)]"
          src={COVER.src}
          alt={t.home.intro.imageAlt}
          width={COVER.width}
          height={COVER.height}
          loading="lazy"
        />
        {t.home.intro.blocks.map((block) => (
          <div key={block.title}>
            <h2 className="text-[23px] font-black leading-snug tracking-[0.01em] text-ink-heading max-[640px]:text-[20px]">
              {block.title}
            </h2>
            <p className="mt-3 text-[15px] leading-[1.9] text-ink-soft max-[640px]:text-[14.5px] max-[640px]:leading-[1.85]">
              {block.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
