import type { Locale } from './config';

/**
 * Script and punctuation helpers for the UI. The site's tests of "is this a
 * Chinese page?" were written as `locale === 'en'` back when only English and
 * Chinese shipped; German is Latin-script too, so the question is really about
 * the writing system, not about English. These helpers keep that distinction in
 * one place as more Latin-script languages are added.
 */

/** Chinese-script locales: CJK punctuation, 万/亿 units, full-width brackets. */
export function isCjkLocale(locale: Locale): boolean {
  return locale === 'zh' || locale === 'tw';
}

/** "a、b、c" for Chinese, "a, b, c" for every Latin-script locale. */
export function listSeparator(locale: Locale): string {
  return isCjkLocale(locale) ? '、' : ', ';
}

/** Clause separator: "；" for Chinese, "; " for Latin-script locales. */
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
    default:
      return 'en-US';
  }
}

/**
 * Wikipedia language edition to link to. Traditional Chinese pages use the
 * Chinese edition with the article's Traditional title, and German pages use
 * de.wikipedia with the German name.
 */
export function wikipediaLocale(locale: Locale): 'en' | 'zh' | 'de' {
  if (locale === 'en') return 'en';
  if (locale === 'de') return 'de';
  return 'zh';
}

/**
 * Baidu Baike is a simplified-Chinese reference and irrelevant to Western
 * audiences, so its link is offered only on the Chinese and English pages.
 */
export function showsBaike(locale: Locale): boolean {
  return locale !== 'tw' && locale !== 'de';
}
