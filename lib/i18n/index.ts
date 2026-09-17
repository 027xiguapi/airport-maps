import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  isLocale,
  localizedPath,
  type Locale,
} from './config';
import { en } from './messages/en';
import { zh, type Messages } from './messages/zh';

const CATALOGS: Record<Locale, Messages> = { zh, en };

/** Message catalog for a locale, falling back to the default locale. */
export function getMessages(locale: Locale): Messages {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
}

/** Narrows an untrusted route param to a supported locale. */
export function parseLocale(value: string | undefined): Locale | null {
  return isLocale(value) ? value : null;
}

/**
 * `alternates.languages` for Next metadata: one entry per locale plus an
 * `x-default` pointing at the default locale.
 */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_META[locale].htmlLang] = localizedPath(locale, path);
  }
  alternates['x-default'] = localizedPath(DEFAULT_LOCALE, path);
  return alternates;
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, localizedPath };
export type { Locale, Messages };
