'use client';

import { useEffect, useState } from 'react';

export type TocItem = { id: string; label: string };

/**
 * "On this page" rail for the airport page. Links are native hash anchors —
 * `html{scroll-behavior:smooth}` animates the jump — and a passive scroll
 * listener highlights whichever section currently sits at the top guideline
 * (the sticky topbar is 64px tall, so the guideline sits just below it).
 */
export default function TocNav({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const update = () => {
      const guideline = 100;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= guideline) current = el.id;
      }
      setActive(current);
    };

    // Called synchronously rather than via requestAnimationFrame: rAF is
    // suspended in background tabs, and reading ~8 rects is cheap anyway.
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav className="toc-nav" aria-label={label}>
      <div className="toc-title">{label}</div>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-active={active === item.id || undefined}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
