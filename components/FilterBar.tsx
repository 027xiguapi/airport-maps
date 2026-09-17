import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { CountryWithCount } from '@/lib/types';

export type DirectoryFilters = {
  q: string;
  country: string;
  sort: string;
};

const SORT_VALUES = ['pax', 'name', 'iata', 'updated'] as const;

function href(
  locale: Locale,
  filters: DirectoryFilters,
  patch: Partial<DirectoryFilters>
) {
  const next = { ...filters, ...patch };
  const search = new URLSearchParams();
  if (next.q) search.set('q', next.q);
  if (next.country) search.set('country', next.country);
  if (next.sort && next.sort !== 'pax') search.set('sort', next.sort);
  const qs = search.toString();
  const base = localizedPath(locale, '/airports');
  return qs ? `${base}?${qs}` : base;
}

/**
 * Country + sort filters for the directory. Every control is a plain link or a
 * GET form, so filtering works without JavaScript and stays crawlable.
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
  const sortLabels: Record<string, string> = {
    pax: t.filters.sortPax,
    name: t.filters.sortName,
    iata: t.filters.sortIata,
    updated: t.filters.sortUpdated,
  };

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
        <input
          id="directory-q"
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder={t.filters.searchPlaceholder}
        />
        <button type="submit">{t.filters.submit}</button>
      </form>

      <div className="group">
        <span className="label">{t.filters.country}</span>
        <Link
          className={`chip${filters.country ? '' : ' on'}`}
          href={href(locale, filters, { country: '' })}
        >
          {t.filters.all}
          <span className="n">{total}</span>
        </Link>
        {countries
          .filter((country) => country.airportCount > 0)
          .map((country) => (
            <Link
              className={`chip${filters.country === country.code ? ' on' : ''}`}
              href={href(locale, filters, { country: country.code })}
              key={country.code}
            >
              {country.name}
              <span className="n">{country.airportCount}</span>
            </Link>
          ))}
      </div>

      <div className="group">
        <span className="label">{t.filters.sort}</span>
        {SORT_VALUES.map((value) => (
          <Link
            className={`chip${filters.sort === value ? ' on' : ''}`}
            href={href(locale, filters, { sort: value })}
            key={value}
          >
            {sortLabels[value]}
          </Link>
        ))}
      </div>
    </div>
  );
}
