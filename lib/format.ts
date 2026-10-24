import { DEFAULT_LOCALE, type Locale } from './i18n/config';
import { getMessages } from './i18n';
import { intlLocale, isCjkLocale } from './i18n/display';

/**
 * Display formatters. Passenger volume is stored in millions and rendered the
 * way each locale expresses it: 万 / 亿 for Chinese, "million" for English,
 * "Millionen" for German, "millions" for French, "milioni" for Italian and
 * 만 / 억 for Korean.
 */

/** Intl locale per UI locale; unknown locales fall back to en-US. */
const NUMBER_LOCALE: Partial<Record<Locale, string>> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  ko: 'ko-KR',
  zh: 'zh-CN',
  tw: 'zh-TW',
};

/** Chinese locales write the ten-thousand/hundred-million units in their own script. */
const CJK_UNITS: Partial<Record<Locale, { wan: string; yi: string; about: string }>> = {
  zh: { wan: '万', yi: '亿', about: '约' },
  tw: { wan: '萬', yi: '億', about: '約' },
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
