import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Icon, type IconName } from '@/lib/icons';

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
        const Card = (
          <>
            <span className="cat-icon">
              <Icon name={card.icon} />
            </span>
            <span className="cat-body">
              <b>{card.title}</b>
              <span>{card.body}</span>
            </span>
            {card.meta && <span className="cat-meta">{card.meta}</span>}
          </>
        );

        // On-page anchors keep the default (non-prefixed) behaviour; page links go
        // through the locale prefix so the reader stays in their language.
        return card.href.startsWith('#') ? (
          <a className="cat-card" href={card.href} key={card.title}>
            {Card}
          </a>
        ) : (
          <Link className="cat-card" href={localizedPath(locale, card.href)} key={card.title}>
            {Card}
          </Link>
        );
      })}
      {/* keeps the grid balanced when the card count is odd */}
      {cards.length % 3 !== 0 && <span className="cat-filler" aria-hidden="true" />}
    </div>
  );
}
