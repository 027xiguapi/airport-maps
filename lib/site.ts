/** Site-wide constants that do not vary by locale. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  ''
);

/** Airports listed per page in the directory. */
export const PAGE_SIZE = 24;

/** Absolute URL for a locale-prefixed path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
