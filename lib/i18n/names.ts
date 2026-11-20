import type { Locale } from './config';
import { germanAirportName, germanCity, germanCountry } from './de-data';
import { frenchAirportName, frenchCity, frenchCountry } from './fr-data';
import { italianAirportName, italianCity, italianCountry } from './it-data';
import { koreanAirportName, koreanCity, koreanCountry } from './ko-data';
import { spanishAirportName, spanishCity, spanishCountry } from './es-data';
import { portugueseAirportName, portugueseCity, portugueseCountry } from './pt-data';
import { indonesianAirportName, indonesianCity, indonesianCountry } from './id-data';
import { vietnameseAirportName, vietnameseCity, vietnameseCountry } from './vi-data';
import { japaneseAirportName, japaneseCity, japaneseCountry } from './ja-data';
import { russianAirportName, russianCity, russianCountry } from './ru-data';
import { turkishAirportName, turkishCity, turkishCountry } from './tr-data';
import { thaiAirportName, thaiCity, thaiCountry } from './th-data';
import { dutchAirportName, dutchCity, dutchCountry } from './nl-data';
import { swedishAirportName, swedishCity, swedishCountry } from './sv-data';
import { polishAirportName, polishCity, polishCountry } from './pl-data';
import { czechAirportName, czechCity, czechCountry } from './cs-data';
import { romanianAirportName, romanianCity, romanianCountry } from './ro-data';
import { ukrainianAirportName, ukrainianCity, ukrainianCountry } from './uk-data';
import { hindiAirportName, hindiCity, hindiCountry } from './hi-data';
import { bengaliAirportName, bengaliCity, bengaliCountry } from './bn-data';
import { swahiliAirportName, swahiliCity, swahiliCountry } from './sw-data';

/**
 * Name translators for the bulk airport index (`public/data/world-airports.json`),
 * used by the route map and the flight-number pages. Those datasets carry only
 * English place names, so a translated page localizes airport, city and country
 * through the same vocabularies `lib/queries.ts` uses for the directory rows.
 *
 * Chinese, Traditional Chinese and English are absent on purpose: their names
 * come from the database columns (or are already English), not a vocabulary.
 */
export type NameVocab = {
  airport: (value: string) => string;
  city: (value: string) => string;
  country: (value: string) => string;
};

export const NAME_VOCAB: Partial<Record<Locale, NameVocab>> = {
  de: { airport: germanAirportName, city: germanCity, country: germanCountry },
  fr: { airport: frenchAirportName, city: frenchCity, country: frenchCountry },
  it: { airport: italianAirportName, city: italianCity, country: italianCountry },
  ko: { airport: koreanAirportName, city: koreanCity, country: koreanCountry },
  es: { airport: spanishAirportName, city: spanishCity, country: spanishCountry },
  pt: { airport: portugueseAirportName, city: portugueseCity, country: portugueseCountry },
  id: { airport: indonesianAirportName, city: indonesianCity, country: indonesianCountry },
  vi: { airport: vietnameseAirportName, city: vietnameseCity, country: vietnameseCountry },
  ja: { airport: japaneseAirportName, city: japaneseCity, country: japaneseCountry },
  ru: { airport: russianAirportName, city: russianCity, country: russianCountry },
  tr: { airport: turkishAirportName, city: turkishCity, country: turkishCountry },
  th: { airport: thaiAirportName, city: thaiCity, country: thaiCountry },
  nl: { airport: dutchAirportName, city: dutchCity, country: dutchCountry },
  sv: { airport: swedishAirportName, city: swedishCity, country: swedishCountry },
  pl: { airport: polishAirportName, city: polishCity, country: polishCountry },
  cs: { airport: czechAirportName, city: czechCity, country: czechCountry },
  ro: { airport: romanianAirportName, city: romanianCity, country: romanianCountry },
  uk: { airport: ukrainianAirportName, city: ukrainianCity, country: ukrainianCountry },
  hi: { airport: hindiAirportName, city: hindiCity, country: hindiCountry },
  bn: { airport: bengaliAirportName, city: bengaliCity, country: bengaliCountry },
  sw: { airport: swahiliAirportName, city: swahiliCity, country: swahiliCountry },
};

/** Translators for a translated locale, or null for zh / tw / en. */
export function nameVocab(locale: Locale): NameVocab | null {
  return NAME_VOCAB[locale] ?? null;
}
