import type { Locale } from './config';
import { isGateRangePhrase } from './de-data';
import { isFrenchGateRangePhrase } from './fr-data';
import { isItalianGateRangePhrase } from './it-data';
import { isKoreanGateRangePhrase } from './ko-data';
import { isSpanishGateRangePhrase } from './es-data';
import { isPortugueseGateRangePhrase } from './pt-data';
import { isIndonesianGateRangePhrase } from './id-data';
import { isVietnameseGateRangePhrase } from './vi-data';
import { isJapaneseGateRangePhrase } from './ja-data';
import { isRussianGateRangePhrase } from './ru-data';
import { isTurkishGateRangePhrase } from './tr-data';
import { isThaiGateRangePhrase } from './th-data';
import { isDutchGateRangePhrase } from './nl-data';
import { isSwedishGateRangePhrase } from './sv-data';
import { isPolishGateRangePhrase } from './pl-data';
import { isCzechGateRangePhrase } from './cs-data';
import { isRomanianGateRangePhrase } from './ro-data';
import { isUkrainianGateRangePhrase } from './uk-data';
import { isHindiGateRangePhrase } from './hi-data';
import { isBengaliGateRangePhrase } from './bn-data';
import { isSwahiliGateRangePhrase } from './sw-data';

/**
 * Whether a localized gate range already reads as a phrase ("Concourse A–E",
 * "Bereich A", "Hall A", "Satellite A", "A 콘코스") and can stand on its own,
 * rather than being a bare code list ("A1–A20") that needs the word "Gates"
 * in front of it.
 *
 * The base test covers the English/German phrasing every vocabulary shares;
 * each language adds its own words through the map below, so adding a language
 * means one entry here and nothing in the FAQ builder.
 */
const LOCALE_PHRASES: Partial<Record<Locale, (value: string) => boolean>> = {
  fr: isFrenchGateRangePhrase,
  it: isItalianGateRangePhrase,
  ko: isKoreanGateRangePhrase,
  es: isSpanishGateRangePhrase,
  pt: isPortugueseGateRangePhrase,
  id: isIndonesianGateRangePhrase,
  vi: isVietnameseGateRangePhrase,
  ja: isJapaneseGateRangePhrase,
  ru: isRussianGateRangePhrase,
  tr: isTurkishGateRangePhrase,
  th: isThaiGateRangePhrase,
  nl: isDutchGateRangePhrase,
  sv: isSwedishGateRangePhrase,
  pl: isPolishGateRangePhrase,
  cs: isCzechGateRangePhrase,
  ro: isRomanianGateRangePhrase,
  uk: isUkrainianGateRangePhrase,
  hi: isHindiGateRangePhrase,
  bn: isBengaliGateRangePhrase,
  sw: isSwahiliGateRangePhrase,
};

export function isLocalizedGateRangePhrase(locale: Locale, value: string): boolean {
  if (isGateRangePhrase(value)) return true;
  return LOCALE_PHRASES[locale]?.(value) ?? false;
}
