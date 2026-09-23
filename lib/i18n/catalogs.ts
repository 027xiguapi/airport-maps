import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';
import { en } from './messages/en';
import { zh, type Messages } from './messages/zh';

/**
 * UI catalogs that exist today, kept in its own leaf module (no Next/server
 * imports) so both the proxy and client components can read `PUBLISHED_LOCALES`
 * without pulling message data or `lib/i18n`'s server helpers into the bundle.
 *
 * A locale is "published" — routable, listed in the language switcher, sitemap
 * and hreflang alternates — exactly when its catalog is registered here. To
 * ship a new language: create `messages/<code>.ts` and add it below; routing
 * (`/es/...`), SEO surfaces and the switcher pick it up automatically. Locales
 * registered in config but not here fall back to the default catalog and their
 * URL prefixes redirect to the visitor's best published language.
 */
const CATALOGS: Partial<Record<Locale, Messages>> = { en, zh };

/** Locales whose UI catalog exists; everything else falls back to the default. */
export const PUBLISHED_LOCALES = LOCALES.filter(
  (locale) => CATALOGS[locale] != null,
) as Locale[];

/** Message catalog for a locale, falling back to the default (English). */
export function catalogFor(locale: Locale): Messages {
  return CATALOGS[locale] ?? en;
}
