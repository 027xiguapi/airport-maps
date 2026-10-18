/** Site-wide constants that do not vary by locale. */

import { localizedPath, type Locale } from '@/lib/i18n/config';

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

/**
 * The site's own picture — the 1718×624 photo the homepage hero draws. Structured
 * data uses it for the site identity nodes (Organization, WebSite) and as the
 * fallback for a page whose subject has no picture of its own.
 */
export const SITE_IMAGE_URL = absoluteUrl('/world-airport-map.jpg');

/** The same image as an ImageObject, for the places that want dimensions. */
export const SITE_IMAGE = {
  '@type': 'ImageObject',
  url: SITE_IMAGE_URL,
  width: 1718,
  height: 624,
} as const;

/**
 * The three rights fields shared by page-level (WebPage) and image-level
 * (ImageObject) structured data. The terms page is the licence the site offers
 * its content under; the contact page is where permission beyond those terms
 * can be requested. `license` points at the terms page rather than a Creative
 * Commons deed because that is what the terms actually grant (personal use and
 * attributed quoting, no wholesale reproduction).
 */
function rightsFields(locale: Locale) {
  return {
    license: absoluteUrl(localizedPath(locale, '/terms')),
    acquireLicensePage: absoluteUrl(localizedPath(locale, '/contact')),
    copyrightNotice: `© ${new Date().getFullYear()} ${SITE_NAME}`,
  };
}

/**
 * Page-level attribution for a page's WebPage node: the site's Organization is
 * the creator of the page, referenced so the graph stays self-contained.
 */
export function webPageRights(locale: Locale) {
  return { creator: { '@id': ORG_NODE_ID }, ...rightsFields(locale) };
}

/**
 * Image-level attribution for images the site itself renders (terminal maps,
 * route network renders). Unlike webPageRights the creator is inlined with
 * @type and name, so consumers that do not resolve @id references still see
 * who made the image.
 */
export function imageRights(locale: Locale) {
  return {
    creator: { '@type': 'Organization', '@id': ORG_NODE_ID, name: SITE_NAME },
    creditText: SITE_NAME,
    ...rightsFields(locale),
  };
}
