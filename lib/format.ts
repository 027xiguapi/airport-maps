import { DEFAULT_LOCALE, type Locale } from './i18n/config';
import { getMessages } from './i18n';
import { intlLocale, isCjkLocale } from './i18n/display';

/**
 * Display formatters. Passenger volume is stored in millions and rendered the
 * way each locale expresses it: 万 / 亿 for Chinese, "million" for English,
 * "Millionen" for German, "millions" for French, "milioni" for Italian,
 * "millones" for Spanish, "milhões" for Portuguese and 만 / 억 for Korean.
 */

/** Intl locale per UI locale; unknown locales fall back to en-US. */
const NUMBER_LOCALE: Partial<Record<Locale, string>> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  ko: 'ko-KR',
  id: 'id-ID',
  vi: 'vi-VN',
  ja: 'ja-JP',
  ru: 'ru-RU',
  tr: 'tr-TR',
  th: 'th-TH',
  nl: 'nl-NL',
  sv: 'sv-SE',
  pl: 'pl-PL',
  cs: 'cs-CZ',
  ro: 'ro-RO',
  uk: 'uk-UA',
  hi: 'hi-IN',
  bn: 'bn-BD',
  sw: 'sw-TZ',
  zh: 'zh-CN',
  tw: 'zh-TW',
};

/** Chinese/Japanese locales write the ten-thousand/hundred-million units in their own script. */
const CJK_UNITS: Partial<Record<Locale, { wan: string; yi: string; about: string }>> = {
  zh: { wan: '万', yi: '亿', about: '约' },
  tw: { wan: '萬', yi: '億', about: '約' },
  ja: { wan: '万', yi: '億', about: '約' },
  ko: { wan: '만', yi: '억', about: '약' },
};

export function formatNumber(value: number | string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? NUMBER_LOCALE[DEFAULT_LOCALE]).format(n);
}

export function formatPax(
  millions: number | null | undefined,
  locale: Locale = DEFAULT_LOCALE
): string | null {
  if (millions == null || !Number.isFinite(millions)) return null;
  if (locale === 'de') {
    // "ca. 67 Millionen" / "ca. 1 Million" — a German billion-scale figure is
    // still written in millions, unlike Chinese 亿.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `ca. ${formatNumber(rounded, locale)} ${rounded === 1 ? 'Million' : 'Millionen'}`;
  }
  if (locale === 'fr') {
    // "environ 67 millions" / "environ 1 million" — French keeps the scale in
    // millions and takes a plural "s" above one.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `environ ${formatNumber(rounded, locale)} million${rounded === 1 ? '' : 's'}`;
  }
  if (locale === 'it') {
    // "circa 67 milioni" / "circa 1 milione" — Italian keeps the scale in
    // millions and takes a plural "i" above one.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `circa ${formatNumber(rounded, locale)} milion${rounded === 1 ? 'e' : 'i'}`;
  }
  if (locale === 'es') {
    // "unos 67 millones" / "unos 1 millón" — Spanish keeps the scale in
    // millions and changes the noun, not a suffix, above one.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `unos ${formatNumber(rounded, locale)} ${rounded === 1 ? 'millón' : 'millones'}`;
  }
  if (locale === 'pt') {
    // "cerca de 67 milhões" / "cerca de 1 milhão" — Portuguese likewise.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `cerca de ${formatNumber(rounded, locale)} ${rounded === 1 ? 'milhão' : 'milhões'}`;
  }
  if (locale === 'id') {
    // "sekitar 67 juta" / "sekitar 1 juta" — Indonesian has no plural inflection.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `sekitar ${formatNumber(rounded, locale)} juta`;
  }
  if (locale === 'vi') {
    // "khoảng 67 triệu" / "khoảng 1 triệu".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `khoảng ${formatNumber(rounded, locale)} triệu`;
  }
  if (locale === 'ru') {
    // "около 67 миллионов" / "около 1 миллиона" — Russian plural rules.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    const abs = Math.abs(rounded);
    const mod100 = Math.round(abs * 100) % 100;
    const mod10 = Math.round(abs) % 10;
    const noun = !Number.isInteger(rounded)
      ? 'миллиона'
      : mod100 >= 11 && mod100 <= 14
        ? 'миллионов'
        : mod10 === 1
          ? 'миллион'
          : mod10 >= 2 && mod10 <= 4
            ? 'миллиона'
            : 'миллионов';
    return `около ${formatNumber(rounded, locale)} ${noun}`;
  }
  if (locale === 'tr') {
    // "yaklaşık 67 milyon" — no plural inflection.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `yaklaşık ${formatNumber(rounded, locale)} milyon`;
  }
  if (locale === 'th') {
    // "ประมาณ 67 ล้าน" — no plural inflection.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `ประมาณ ${formatNumber(rounded, locale)} ล้าน`;
  }
  if (locale === 'nl') {
    // "ongeveer 67 miljoen" / "ongeveer 1 miljoen" — miljoen stays invariant.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `ongeveer ${formatNumber(rounded, locale)} miljoen`;
  }
  if (locale === 'sv') {
    // "cirka 67 miljoner" / "cirka 1 miljon".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `cirka ${formatNumber(rounded, locale)} ${rounded === 1 ? 'miljon' : 'miljoner'}`;
  }
  if (locale === 'pl') {
    // "około 67 milionów" / "około 2 miliony" / "około 1 miliona".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    const abs = Math.abs(rounded);
    const mod10 = Math.round(abs) % 10;
    const mod100 = Math.round(abs) % 100;
    const noun =
      abs === 1 || !Number.isInteger(abs)
        ? 'miliona'
        : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
          ? 'miliony'
          : 'milionów';
    return `około ${formatNumber(rounded, locale)} ${noun}`;
  }
  if (locale === 'cs') {
    // "přibližně 67 milionů" / "přibližně 2 miliony" / "přibližně 1 milion".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    const abs = Math.abs(rounded);
    const mod10 = Math.round(abs) % 10;
    const mod100 = Math.round(abs) % 100;
    const noun =
      abs === 1
        ? 'milion'
        : !Number.isInteger(abs)
          ? 'milionu'
          : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
            ? 'miliony'
            : 'milionů';
    return `přibližně ${formatNumber(rounded, locale)} ${noun}`;
  }
  if (locale === 'ro') {
    // "aproximativ 67 de milioane" / "aproximativ 2 milioane" / "aproximativ 1 milion".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    const abs = Math.abs(rounded);
    const mod100 = Math.round(abs) % 100;
    const noun =
      abs === 1 || mod100 === 1
        ? 'milion'
        : abs < 20
          ? 'milioane'
          : 'de milioane';
    return `aproximativ ${formatNumber(rounded, locale)} ${noun}`;
  }
  if (locale === 'uk') {
    // "приблизно 67 мільйонів" / "приблизно 2 мільйони" / "приблизно 1 мільйон".
    const rounded = Number(trimZeros(millions.toFixed(2)));
    const abs = Math.abs(rounded);
    const mod10 = Math.round(abs) % 10;
    const mod100 = Math.round(abs) % 100;
    const noun =
      abs === 1
        ? 'мільйон'
        : !Number.isInteger(abs)
          ? 'мільйона'
          : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
            ? 'мільйони'
            : 'мільйонів';
    return `приблизно ${formatNumber(rounded, locale)} ${noun}`;
  }
  if (locale === 'hi') {
    // Indian numbering: "लगभग 6.7 करोड़" above ten million, else lakh.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    if (rounded >= 10) {
      const crore = Number(trimZeros((rounded / 10).toFixed(2)));
      return `लगभग ${formatNumber(crore, locale)} करोड़`;
    }
    const lakh = Number(trimZeros((rounded * 10).toFixed(2)));
    return `लगभग ${formatNumber(lakh, locale)} लाख`;
  }
  if (locale === 'bn') {
    // Bengali numbering: "প্রায় ৬.৭ কোটি" above ten million, else lakh.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    if (rounded >= 10) {
      const crore = Number(trimZeros((rounded / 10).toFixed(2)));
      return `প্রায় ${formatNumber(crore, locale)} কোটি`;
    }
    const lakh = Number(trimZeros((rounded * 10).toFixed(2)));
    return `প্রায় ${formatNumber(lakh, locale)} লাখ`;
  }
  if (locale === 'sw') {
    // "takriban milioni 67" — the number follows the noun.
    const rounded = Number(trimZeros(millions.toFixed(2)));
    return `takriban milioni ${formatNumber(rounded, locale)}`;
  }
  if (locale === 'ja') {
    // 約6,700万人 / 約1億800万人 — like Chinese, grouped by 10,000 and
    // 100,000,000, but written without spaces.
    if (millions >= 100) {
      const oku = Math.floor(millions / 100);
      const man = Math.round((millions - oku * 100) * 100);
      return man > 0
        ? `約${oku}億${formatNumber(man, locale)}万人`
        : `約${oku}億人`;
    }
    return `約${formatNumber(Math.round(millions * 100), locale)}万人`;
  }
  if (locale === 'ko') {
    // 약 6,700만 명 / 약 1억 800만 명 — Korean groups by 10,000 (만) and
    // 100,000,000 (억); units attach without a space.
    if (millions >= 100) {
      const eok = Math.floor(millions / 100);
      const man = Math.round((millions - eok * 100) * 100);
      return man > 0
        ? `${CJK_UNITS.ko!.about} ${eok}억 ${formatNumber(man, locale)}만 명`
        : `${CJK_UNITS.ko!.about} ${eok}억 명`;
    }
    return `${CJK_UNITS.ko!.about} ${formatNumber(Math.round(millions * 100), locale)}만 명`;
  }
  if (locale === 'en') {
    return `about ${trimZeros(millions.toFixed(2))} million`;
  }
  const cjk = CJK_UNITS[locale] ?? CJK_UNITS.zh!;
  if (millions >= 100) {
    return `${cjk.about} ${trimZeros((millions / 100).toFixed(2))} ${cjk.yi}`;
  }
  return `${cjk.about} ${formatNumber(Math.round(millions * 100), locale)} ${cjk.wan}`;
}

export function formatDistance(km: number | null | undefined, locale: Locale = DEFAULT_LOCALE): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  const value = Number(trimZeros(km.toFixed(1)));
  return `${formatNumber(value, locale)} km`;
}

/** ISO date -> locale-appropriate long form ("22. Oktober 2026", "2026年10月22日"). */
export function formatDate(iso: string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!iso) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  if (!isCjkLocale(locale)) {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
  }
  return `${year}年${Number(month)}月${Number(day)}日`;
}

/** Resolves a transit entry to display text, falling back to its mode label. */
export function transitLabel(
  locale: Locale,
  option: { icon: string; name: string }
): string {
  if (option.name) return option.name;
  const modes = getMessages(locale).transportModes;
  return modes[option.icon] ?? option.icon;
}

function trimZeros(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}
