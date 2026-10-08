import Link from 'next/link';
import {
  DIRECTORY_SORTS,
  directoryHref,
  directorySortLabel,
  type DirectoryFilters,
} from '@/lib/directory';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { CountryWithCount } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Country + sort filters for the directory. Every control is a plain link or a
 * GET form, so filtering works without JavaScript. Those links also point at
 * the canonical URL of each filtered view — the views are indexable, so link
 * and canonical must not drift (see lib/directory.ts).
 */
export default function FilterBar({
  locale,
  filters,
  countries,
  total,
}: {
  locale: Locale;
  filters: DirectoryFilters;
  countries: CountryWithCount[];
  total: number;
}) {
  const t = getMessages(locale);

  return (
    <div className="filterbar">
      <form action={localizedPath(locale, '/airports')} method="get" role="search">
        {filters.country && <input type="hidden" name="country" value={filters.country} />}
        {filters.sort && filters.sort !== 'pax' && (
          <input type="hidden" name="sort" value={filters.sort} />
        )}
        <label className="sr-only" htmlFor="directory-q">
          {t.search.ariaLabel}
        </label>
        <Input
          id="directory-q"
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder={t.filters.searchPlaceholder}
          className="flex-1 rounded-[19px] bg-paper focus-visible:bg-card"
        />
        <Button type="submit" className="rounded-[19px]">
          {t.filters.submit}
        </Button>
      </form>

      <div className="group">
        <span className="label">{t.filters.country}</span>
        <Link
          className={`chip${filters.country ? '' : ' on'}`}
          href={directoryHref(locale, { ...filters, country: '' })}
        >
          {t.filters.all}
          <span className="n">{total}</span>
        </Link>
        {countries
          .filter((country) => country.airportCount > 0)
          .map((country) => (
            <Link
              className={`chip${filters.country === country.code ? ' on' : ''}`}
              href={directoryHref(locale, { ...filters, country: country.code })}
              key={country.code}
            >
              {country.name}
              <span className="n">{country.airportCount}</span>
            </Link>
          ))}
      </div>

      <div className="group">
        <span className="label">{t.filters.sort}</span>
        {DIRECTORY_SORTS.map((value) => (
          <Link
            className={`chip${filters.sort === value ? ' on' : ''}`}
            href={directoryHref(locale, { ...filters, sort: value })}
            key={value}
          >
            {directorySortLabel(t, value)}
          </Link>
        ))}
      </div>
    </div>
  );
}
