import type { ReactNode } from 'react';

export type FaqItem = { q: string; a: ReactNode };

/** Progressive-enhancement FAQ built on <details>, plus matching FAQPage JSON-LD. */
export default function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <div className="a">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
