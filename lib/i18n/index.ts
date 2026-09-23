import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_META,
  localizedPath,
  type Locale,
} from './config';
import { catalogFor, PUBLISHED_LOCALES } from './catalogs';
import type { Messages } from './messages/zh';

/** Message catalog for a locale, falling back to the default locale. */
export function getMessages(locale: Locale): Messages {
  return catalogFor(locale);
}

/** Narrows an untrusted route param to a supported locale. */
export function parseLocale(value: string | undefined): Locale | null {
  return isLocale(value) ? value : null;
}

/**
 * `alternates.languages` for Next metadata: one entry per published locale
 * plus an `x-default` pointing at the bare default-locale path.
 */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of PUBLISHED_LOCALES) {
    alternates[LOCALE_META[locale].htmlLang] = localizedPath(locale, path);
  }
  alternates['x-default'] = localizedPath(DEFAULT_LOCALE, path);
  return alternates;
}

export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  LOCALE_META,
  localizedPath,
} from './config';
export { PUBLISHED_LOCALES } from './catalogs';
export type { Locale, Messages };
