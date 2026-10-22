import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';
import { de } from './messages/de';
import { en } from './messages/en';
import { tw } from './messages/tw';
import { zh, type Messages } from './messages/zh';

/**
 * UI catalogs that exist today, kept in its own leaf module (no Next/server
 * imports) so both the proxy and client components can read `PUBLISHED_LOCALES`
 * without pulling message data or `lib/i18n`'s server helpers into the bundle.
 *
 * A locale is "published" — routable, listed in the language switcher's active
 * links, sitemap and hreflang alternates — exactly when its catalog is
 * registered here. To ship a new language: create `messages/<code>.ts` and add
 * it below; routing (`/es/...`), SEO surfaces and the switcher pick it up
 * automatically. Locales registered in config but not here are *planned*: they
 * appear in the switcher as disabled entries and their URL prefixes redirect to
 * the visitor's best published language.
 */
const CATALOGS: Partial<Record<Locale, Messages>> = { en, de, zh, tw };

/** Locales whose UI catalog exists; everything else falls back to the default. */
export const PUBLISHED_LOCALES = LOCALES.filter(
  (locale) => CATALOGS[locale] != null,
) as Locale[];

/**
 * Registered languages that are not published yet, in registry order. They are
 * the 24-language roadmap made visible: the switcher lists them as prepared but
 * inactive, and `npm run locale:status` reports how far each one is. Publishing
 * one is still just adding its catalog to CATALOGS above.
 */
export const PLANNED_LOCALES = LOCALES.filter(
  (locale) => CATALOGS[locale] == null,
) as Locale[];

/** Message catalog for a locale, falling back to the default (English). */
export function catalogFor(locale: Locale): Messages {
  return CATALOGS[locale] ?? en;
}
