/**
 * Locale registry. Adding a language means adding one entry here plus
 * `lib/i18n/messages/<code>.ts`; routes, hreflang, sitemap and the switcher all
 * derive from this list. Order is the order shown in the language switcher.
 */
export const LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Primary language of the site: where bare paths land, what `x-default` points
 * at, and the last-resort fallback for a missing message catalog.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Language new editorial content is authored in first, used only as a *content*
 * fallback (Markdown guides, pages and airport descriptions) when a translation
 * is missing. Kept separate from `DEFAULT_LOCALE` so changing the site's primary
 * language never causes one language's text to appear on another's pages.
 */
export const SOURCE_LOCALE: Locale = 'zh';

/** Cookie remembering an explicit language choice, read by proxy. */
export const LOCALE_COOKIE = 'preferred-locale';

export type LocaleMeta = {
  code: Locale;
  /** Endonym, shown in the language switcher. */
  label: string;
  /** Value for <html lang>. */
  htmlLang: string;
  /** Value for Open Graph og:locale. */
  ogLocale: string;
  /** Matches against Accept-Language headers, in priority order. */
  acceptLanguage: string[];
  dir: 'ltr' | 'rtl';
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  zh: {
    code: 'zh',
    label: '中文',
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    acceptLanguage: ['zh-cn', 'zh-hans', 'zh-sg', 'zh-tw', 'zh-hk', 'zh'],
    dir: 'ltr',
  },
  en: {
    code: 'en',
    label: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    acceptLanguage: ['en-us', 'en-gb', 'en-au', 'en-ca', 'en'],
    dir: 'ltr',
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** `/airport/PEK` -> `/en/airport/PEK` */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === '/' || path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Picks the best locale for an Accept-Language header, falling back to
 * `DEFAULT_LOCALE`. Tag weighting (`q=`) is respected.
 */
export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    for (const locale of LOCALES) {
      if (LOCALE_META[locale].acceptLanguage.includes(tag)) return locale;
    }
    // "en-GB" style tags not listed explicitly still map by primary subtag.
    const primary = tag.split('-')[0];
    for (const locale of LOCALES) {
      if (primary === locale) return locale;
    }
  }

  return DEFAULT_LOCALE;
}
