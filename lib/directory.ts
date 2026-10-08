import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { Messages } from '@/lib/i18n/messages/zh';
import type { AirportSort } from '@/lib/types';

/**
 * URL and label helpers for the airport directory (`/airports` and its filtered
 * views), shared by the page's metadata and the FilterBar chips so both
 * serialise the filters the same way — the canonical tag has to name the exact
 * URL the internal links point at. Leaf module: no components, so metadata can
 * use it without pulling the page tree into the bundle.
 */

/** Sort orders the directory understands; `pax` is the default (busiest first). */
export const DIRECTORY_SORTS: readonly AirportSort[] = ['pax', 'name', 'iata', 'updated'];

export type DirectoryFilters = {
  q: string;
  country: string;
  sort: AirportSort;
};

/** Normalised query string: defaults omitted, always in q › country › sort order. */
function directorySearch(filters: Partial<DirectoryFilters>): string {
  const search = new URLSearchParams();
  if (filters.q) search.set('q', filters.q);
  if (filters.country) search.set('country', filters.country);
  if (filters.sort && filters.sort !== 'pax') search.set('sort', filters.sort);
  return search.toString();
}

/** Locale-independent directory path including its normalised query string. */
export function directoryPath(filters: Partial<DirectoryFilters> = {}): string {
  const qs = directorySearch(filters);
  return `/airports${qs ? `?${qs}` : ''}`;
}

/** Locale-prefixed directory URL — canonical tags and internal links. */
export function directoryHref(locale: Locale, filters: Partial<DirectoryFilters> = {}): string {
  return localizedPath(locale, directoryPath(filters));
}

/**
 * Localized label for one sort order, so the FilterBar chips and the titles of
 * the re-sorted views always say the same thing.
 */
export function directorySortLabel(t: Messages, sort: AirportSort): string {
  switch (sort) {
    case 'name':
      return t.filters.sortName;
    case 'iata':
      return t.filters.sortIata;
    case 'updated':
      return t.filters.sortUpdated;
    default:
      return t.filters.sortPax;
  }
}
