import type { Locale } from './config';

/**
 * Script and punctuation helpers for the UI. The site's tests of "is this a
 * Chinese page?" were written as `locale === 'en'` back when only English and
 * Chinese shipped; German, French and Korean are not, so the question is really
 * about the punctuation convention, not about English. These helpers keep that
 * in one place as more languages are added.
 */

/**
 * Chinese-script locales with CJK punctuation (、；（）) and 万/亿 units.
 * Korean is *not* included: it writes Western punctuation and spaces, so it
 * follows the comma/semicolon branch even though its script is CJK.
 */
export function isCjkLocale(locale: Locale): boolean {
  return locale === 'zh' || locale === 'tw';
}

/** "a、b、c" for Chinese, "a, b, c" for every other locale. */
export function listSeparator(locale: Locale): string {
  return isCjkLocale(locale) ? '、' : ', ';
}

/** Clause separator: "；" for Chinese, "; " for every other locale. */
export function clauseSeparator(locale: Locale): string {
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
    default:
      return 'en-US';
  }
}

/**
 * Wikipedia language edition to link to. Traditional Chinese pages use the
 * Chinese edition with the article's Traditional title; German, French, Italian
 * and Korean use de./fr./it./ko.wikipedia with the localized name.
 */
export function wikipediaLocale(locale: Locale): 'en' | 'zh' | 'de' | 'fr' | 'it' | 'ko' {
  if (locale === 'en') return 'en';
  if (locale === 'de') return 'de';
  if (locale === 'fr') return 'fr';
  if (locale === 'it') return 'it';
  if (locale === 'ko') return 'ko';
  return 'zh';
}

/**
 * Baidu Baike is a simplified-Chinese reference and irrelevant to Western and
 * Korean audiences, so its link is offered only on the Chinese and English pages.
 */
export function showsBaike(locale: Locale): boolean {
  return locale !== 'tw' && locale !== 'de' && locale !== 'fr' && locale !== 'it' && locale !== 'ko';
}
