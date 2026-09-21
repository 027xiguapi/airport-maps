import Link from 'next/link';
import { ArrowIcon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AirportSummary } from '@/lib/types';

/** Cross-links to other airports in the same country, plus the country page. */
export default function RelatedAirports({
  locale,
  countryName,
  countryCode,
  related,
}: {
  locale: Locale;
  countryName: string;
  countryCode: string;
  related: AirportSummary[];
}) {
  const t = getMessages(locale);
  if (related.length === 0) return null;

  return (
    <section className="related">
      <h3>
        {t.airport.relatedTitle(countryName)}{' '}
        <span className="en">{t.airport.relatedEn(countryName)}</span>
      </h3>
      <div className="related-grid">
        {related.map((other) => (
          <Card
            asChild
            key={other.iata}
            className="flex-row cursor-pointer items-center gap-3 rounded-[9px] px-4 py-3.5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-sky-400"
          >
            <Link href={localizedPath(locale, `/airport/${other.iata}`)}>
              {/* Flex rows with a nowrap airport name: without min-width:0 the grid track
                  floors at the full name width (400px for "Hartsfield–Jackson Atlanta
                  International Airport"). */}
              <span className="w-[52px] flex-none font-display text-[17px] font-semibold text-navy-800 dark:text-[#C4DCF0]">
                {other.iata}
              </span>
              <span className="min-w-0">
                <b className="block truncate text-[13.5px] font-semibold">{other.name}</b>
                <span className="text-[12px] text-ink-soft">{other.city}</span>
              </span>
            </Link>
          </Card>
        ))}
      </div>
      <p className="mt-[18px]">
        <Button asChild variant="link" className="h-auto gap-1.5 px-0">
          <Link href={localizedPath(locale, `/country/${countryCode}`)}>
            {t.airport.relatedAll(countryName)}
            <ArrowIcon />
          </Link>
        </Button>
      </p>
    </section>
  );
}
