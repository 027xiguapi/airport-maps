import { DEFAULT_LOCALE, type Locale } from './i18n/config';
import { getMessages } from './i18n';

/**
 * Display formatters. Passenger volume is stored in millions and rendered the
 * way each locale expresses it: 万 / 亿 for Chinese, "million" for English.
 */

/**
 * Intl locale per UI locale; untranslated locales fall back to the default's
 * formatting until they get their own catalog entry here.
 */
const NUMBER_LOCALE: Partial<Record<Locale, string>> = {
  en: 'en-US',
  zh: 'zh-CN',
  tw: 'zh-TW',
};

/** Chinese locales write the ten-thousand/hundred-million units in their own script. */
const CJK_UNITS: Partial<Record<Locale, { wan: string; yi: string; about: string }>> = {
  zh: { wan: '万', yi: '亿', about: '约' },
  tw: { wan: '萬', yi: '億', about: '約' },
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
  if (locale === 'en') {
    return `about ${trimZeros(millions.toFixed(2))} million`;
  }
  const cjk = CJK_UNITS[locale] ?? CJK_UNITS.zh!;
  if (millions >= 100) {
    return `${cjk.about} ${trimZeros((millions / 100).toFixed(2))} ${cjk.yi}`;
  }
  return `${cjk.about} ${formatNumber(Math.round(millions * 100), locale)} ${cjk.wan}`;
}

export function formatDistance(km: number | null | undefined, _locale: Locale = DEFAULT_LOCALE): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  return `${trimZeros(km.toFixed(1))} km`;
}

/** ISO date -> locale-appropriate long form. */
export function formatDate(iso: string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!iso) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
      new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    );
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
