import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Icon, type IconName } from '@/lib/icons';
import { Card } from '@/components/ui/card';

export type CategoryCard = {
  /** Locale-independent target. */
  href: string;
  icon: IconName;
  title: string;
  body: string;
  /** Right-hand figure, e.g. "37 countries". Omitted when not applicable. */
  meta?: string;
};

/**
 * Functional-area strip: the ways into the directory, as cards.
 *
 * Every card is a real link — a listing page, a filtered view or an on-page
 * section — so the block is navigation rather than decoration.
 */
export default function CategoryGrid({
  locale,
  cards,
}: {
  locale: Locale;
  cards: CategoryCard[];
}) {
  const t = getMessages(locale);

  return (
    <div className="cat-grid">
      {cards.map((card) => {
        const body = (
          <>
            {/* The icon swaps to a navy well on hover (was `.cat-card:hover .cat-icon`). */}
            <span className="cat-icon transition-[background-color,color] duration-[160ms] group-hover:bg-navy-800 group-hover:text-white">
              <Icon name={card.icon} />
            </span>
            <span className="cat-body">
              <b>{card.title}</b>
              <span>{card.body}</span>
            </span>
            {card.meta && <span className="cat-meta">{card.meta}</span>}
          </>
        );
        const cardClasses =
          'group relative min-h-[126px] cursor-pointer flex-row items-start gap-3.5 px-[22px] py-5 transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-[3px] hover:border-sky-400 hover:[box-shadow:var(--shadow-md)] max-[620px]:min-h-0 max-[620px]:px-[18px] max-[620px]:py-4';

        // On-page anchors keep the default (non-prefixed) behaviour; page links go
        // through the locale prefix so the reader stays in their language.
        return card.href.startsWith('#') ? (
          <Card asChild className={cardClasses} key={card.title}>
            <a href={card.href}>{body}</a>
          </Card>
        ) : (
          <Card asChild className={cardClasses} key={card.title}>
            <Link href={localizedPath(locale, card.href)}>{body}</Link>
          </Card>
        );
      })}
      {/* keeps the grid balanced when the card count is odd */}
      {cards.length % 3 !== 0 && <span className="hidden" aria-hidden="true" />}
    </div>
  );
}
