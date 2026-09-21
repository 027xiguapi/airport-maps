import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export type FaqItem = { q: string; a: ReactNode };

/** FAQ built on the shadcn accordion (Radix); callers own the FAQPage JSON-LD. */
export default function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <Accordion
      type="multiple"
      className="overflow-hidden rounded-[14px] border border-border bg-card [box-shadow:var(--shadow-sm)] [&_b]:font-semibold [&_b]:text-ink"
    >
      {items.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
