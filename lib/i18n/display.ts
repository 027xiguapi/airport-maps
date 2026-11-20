import type { Locale } from './config';

/**
 * Script and punctuation helpers for the UI. The site's tests of "is this a
 * Chinese page?" were written as `locale === 'en'` back when only English and
 * Chinese shipped; German, French and Korean are not, so the question is really
 * about the punctuation convention, not about English. These helpers keep that
 * in one place as more languages are added.
 */

/**
 * Chinese-script locales with Chinese punctuation (、；（）) and 万/亿 units.
 * Korean is *not* included: it writes Western punctuation and spaces, so it
 * follows the comma/semicolon branch even though its script is CJK. Japanese
 * gets its own branches below (、 for lists, 。 for clauses).
 */
export function isCjkLocale(locale: Locale): boolean {
  return locale === 'zh' || locale === 'tw';
}

/** "a、b、c" for Chinese and Japanese, "a, b, c" for every other locale. */
export function listSeparator(locale: Locale): string {
  return isCjkLocale(locale) || locale === 'ja' ? '、' : ', ';
}

/** Clause separator: "；" for Chinese, "。" for Japanese, "; " otherwise. */
export function clauseSeparator(locale: Locale): string {
  if (locale === 'ja') return '。';
  return isCjkLocale(locale) ? '；' : '; ';
}

/** Intl tag used for numbers, dates and times. */
export function intlLocale(locale: Locale): string {
  switch (locale) {
    case 'zh':
      return 'zh-CN';
    case 'tw':
      return 'zh-TW';
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'it':
      return 'it-IT';
    case 'ko':
      return 'ko-KR';
    case 'es':
      return 'es-ES';
    case 'pt':
      // The catalog is Brazilian Portuguese (see LOCALE_META.acceptLanguage).
      return 'pt-BR';
    case 'id':
      return 'id-ID';
    case 'vi':
      return 'vi-VN';
    case 'ja':
      return 'ja-JP';
    case 'ru':
      return 'ru-RU';
    case 'tr':
      return 'tr-TR';
    case 'th':
      return 'th-TH';
    case 'nl':
      return 'nl-NL';
    case 'sv':
      return 'sv-SE';
    case 'pl':
      return 'pl-PL';
    case 'cs':
      return 'cs-CZ';
    case 'ro':
      return 'ro-RO';
    case 'uk':
      return 'uk-UA';
    case 'hi':
      return 'hi-IN';
    case 'bn':
      return 'bn-BD';
    case 'sw':
      return 'sw-TZ';
    default:
      return 'en-US';
  }
}

/**
 * Wikipedia language edition to link to. Traditional Chinese pages use the
 * Chinese edition with the article's Traditional title; every translated
 * locale uses its own edition with the localized name.
 */
export function wikipediaLocale(
  locale: Locale
):
  | 'en'
  | 'zh'
  | 'de'
  | 'fr'
  | 'it'
  | 'ko'
  | 'es'
  | 'pt'
  | 'id'
  | 'vi'
  | 'ja'
  | 'ru'
  | 'tr'
  | 'th'
  | 'nl'
  | 'sv'
  | 'pl'
  | 'cs'
  | 'ro'
  | 'uk'
  | 'hi'
  | 'bn'
  | 'sw' {
  if (locale === 'en') return 'en';
  if (locale === 'de') return 'de';
  if (locale === 'fr') return 'fr';
  if (locale === 'it') return 'it';
  if (locale === 'ko') return 'ko';
  if (locale === 'es') return 'es';
  if (locale === 'pt') return 'pt';
  if (locale === 'id') return 'id';
  if (locale === 'vi') return 'vi';
  if (locale === 'ja') return 'ja';
  if (locale === 'ru') return 'ru';
  if (locale === 'tr') return 'tr';
  if (locale === 'th') return 'th';
  if (locale === 'nl') return 'nl';
  if (locale === 'sv') return 'sv';
  if (locale === 'pl') return 'pl';
  if (locale === 'cs') return 'cs';
  if (locale === 'ro') return 'ro';
  if (locale === 'uk') return 'uk';
  if (locale === 'hi') return 'hi';
  if (locale === 'bn') return 'bn';
  if (locale === 'sw') return 'sw';
  return 'zh';
}

/**
 * Baidu Baike is a simplified-Chinese reference and irrelevant to Western and
 * Korean audiences, so its link is offered only on the Chinese and English pages.
 */
export function showsBaike(locale: Locale): boolean {
  return locale === 'zh' || locale === 'en';
}
