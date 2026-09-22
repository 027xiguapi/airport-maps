/** Site-wide constants that do not vary by locale. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  ''
);

/**
 * The one exact brand string used in every machine-readable field — og:site_name,
 * JSON-LD publisher/organization nodes, schema names. Visible wordmarks may be
 * localized (全球机场地图), but crawlers and AI platforms should always see this
 * single spelling so brand signals are not split across variants.
 */
export const SITE_NAME = 'World Airport Maps';

/** Stable schema.org node ids, so pages can cross-reference the same entity. */
export const ORG_NODE_ID = `${SITE_URL}/#organization`;
export const EDITORIAL_NODE_ID = `${SITE_URL}/#editorial-team`;
export const WEBSITE_NODE_ID = `${SITE_URL}/#website`;


/** Airports listed per page in the directory. */
export const PAGE_SIZE = 24;

/** Absolute URL for a locale-prefixed path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
