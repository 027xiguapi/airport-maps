import { DEFAULT_LOCALE, type Locale } from './i18n/config';

/**
 * Display formatters. Passenger volume is stored in millions and rendered the
 * way each locale expresses it: 万 / 亿 for Chinese, "million" for English.
 */

const NUMBER_LOCALE: Record<Locale, string> = { zh: 'zh-CN', en: 'en-US' };

export function formatNumber(value: number | string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(n);
}

export function formatPax(
  millions: number | null | undefined,
  locale: Locale = DEFAULT_LOCALE
): string | null {
  if (millions == null || !Number.isFinite(millions)) return null;
  if (locale === 'en') {
    return `about ${trimZeros(millions.toFixed(2))} million`;
  }
  if (millions >= 100) {
    return `约 ${trimZeros((millions / 100).toFixed(2))} 亿`;
  }
  return `约 ${formatNumber(Math.round(millions * 100), locale)} 万`;
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

function trimZeros(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}
