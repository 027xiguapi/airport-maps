/**
 * Locale registry. Adding a language means adding one entry here plus
 * `lib/i18n/messages/<code>.ts` registered in `lib/i18n/catalogs.ts`; routes,
 * hreflang, sitemap and the switcher all derive from this list. Order is the
 * order shown in the language switcher.
 *
 * URL scheme (mirrors the production sitemap): the default locale lives on
 * bare paths (`/`, `/airport/PEK`) and every other locale is prefixed
 * (`/zh/airport/PEK`), so the site root is a single stable English entry
 * point and `x-default` alternates point at the unprefixed URL.
 */
export const LOCALES = [
  'en', 'es', 'pt', 'fr', 'id', 'de', 'ru', 'zh', 'tw', 'hi', 'bn', 'ja',
  'sw', 'tr', 'vi', 'ko', 'it', 'th', 'pl', 'uk', 'ro', 'nl', 'sv', 'cs',
] as const;

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
  /** Value for <html lang> and hreflang. */
  htmlLang: string;
  /** Value for Open Graph og:locale. */
  ogLocale: string;
  /** Matches against Accept-Language headers, in priority order. */
  acceptLanguage: string[];
  dir: 'ltr' | 'rtl';
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    label: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    acceptLanguage: ['en-us', 'en-gb', 'en-au', 'en-ca', 'en'],
    dir: 'ltr',
  },
  es: {
    code: 'es',
    label: 'Español',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    acceptLanguage: ['es-es', 'es-mx', 'es-ar', 'es-419', 'es'],
    dir: 'ltr',
  },
  pt: {
    code: 'pt',
    label: 'Português',
    htmlLang: 'pt',
    ogLocale: 'pt_BR',
    acceptLanguage: ['pt-br', 'pt-pt', 'pt'],
    dir: 'ltr',
  },
  fr: {
    code: 'fr',
    label: 'Français',
    htmlLang: 'fr',
    ogLocale: 'fr_FR',
    acceptLanguage: ['fr-fr', 'fr-ca', 'fr'],
    dir: 'ltr',
  },
  id: {
    code: 'id',
    label: 'Bahasa Indonesia',
    htmlLang: 'id',
    ogLocale: 'id_ID',
    acceptLanguage: ['id-id', 'id'],
    dir: 'ltr',
  },
  de: {
    code: 'de',
    label: 'Deutsch',
    htmlLang: 'de',
    ogLocale: 'de_DE',
    acceptLanguage: ['de-de', 'de-at', 'de-ch', 'de'],
    dir: 'ltr',
  },
  ru: {
    code: 'ru',
    label: 'Русский',
    htmlLang: 'ru',
    ogLocale: 'ru_RU',
    acceptLanguage: ['ru-ru', 'ru'],
    dir: 'ltr',
  },
  zh: {
    code: 'zh',
    label: '简体中文',
    htmlLang: 'zh-hans',
    ogLocale: 'zh_CN',
    acceptLanguage: ['zh-cn', 'zh-hans', 'zh-sg', 'zh'],
    dir: 'ltr',
  },
  tw: {
    code: 'tw',
    label: '繁體中文',
    htmlLang: 'zh-hant',
    ogLocale: 'zh_TW',
    acceptLanguage: ['zh-tw', 'zh-hant', 'zh-hk'],
    dir: 'ltr',
  },
  hi: {
    code: 'hi',
    label: 'हिन्दी',
    htmlLang: 'hi',
    ogLocale: 'hi_IN',
    acceptLanguage: ['hi-in', 'hi'],
    dir: 'ltr',
  },
  bn: {
    code: 'bn',
    label: 'বাংলা',
    htmlLang: 'bn',
    ogLocale: 'bn_BD',
    acceptLanguage: ['bn-bd', 'bn-in', 'bn'],
    dir: 'ltr',
  },
  ja: {
    code: 'ja',
    label: '日本語',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    acceptLanguage: ['ja-jp', 'ja'],
    dir: 'ltr',
  },
  sw: {
    code: 'sw',
    label: 'Kiswahili',
    htmlLang: 'sw',
    ogLocale: 'sw_KE',
    acceptLanguage: ['sw-ke', 'sw'],
    dir: 'ltr',
  },
  tr: {
    code: 'tr',
    label: 'Türkçe',
    htmlLang: 'tr',
    ogLocale: 'tr_TR',
    acceptLanguage: ['tr-tr', 'tr'],
    dir: 'ltr',
  },
  vi: {
    code: 'vi',
    label: 'Tiếng Việt',
    htmlLang: 'vi',
    ogLocale: 'vi_VN',
    acceptLanguage: ['vi-vn', 'vi'],
    dir: 'ltr',
  },
  ko: {
    code: 'ko',
    label: '한국어',
    htmlLang: 'ko',
    ogLocale: 'ko_KR',
    acceptLanguage: ['ko-kr', 'ko'],
    dir: 'ltr',
  },
  it: {
    code: 'it',
    label: 'Italiano',
    htmlLang: 'it',
    ogLocale: 'it_IT',
    acceptLanguage: ['it-it', 'it'],
    dir: 'ltr',
  },
  th: {
    code: 'th',
    label: 'ไทย',
    htmlLang: 'th',
    ogLocale: 'th_TH',
    acceptLanguage: ['th-th', 'th'],
    dir: 'ltr',
  },
  pl: {
    code: 'pl',
    label: 'Polski',
    htmlLang: 'pl',
    ogLocale: 'pl_PL',
    acceptLanguage: ['pl-pl', 'pl'],
    dir: 'ltr',
  },
  uk: {
    code: 'uk',
    label: 'Українська',
    htmlLang: 'uk',
    ogLocale: 'uk_UA',
    acceptLanguage: ['uk-ua', 'uk'],
    dir: 'ltr',
  },
  ro: {
    code: 'ro',
    label: 'Română',
    htmlLang: 'ro',
    ogLocale: 'ro_RO',
    acceptLanguage: ['ro-ro', 'ro'],
    dir: 'ltr',
  },
  nl: {
    code: 'nl',
    label: 'Nederlands',
    htmlLang: 'nl',
    ogLocale: 'nl_NL',
    acceptLanguage: ['nl-nl', 'nl'],
    dir: 'ltr',
  },
  sv: {
    code: 'sv',
    label: 'Svenska',
    htmlLang: 'sv',
    ogLocale: 'sv_SE',
    acceptLanguage: ['sv-se', 'sv'],
    dir: 'ltr',
  },
  cs: {
    code: 'cs',
    label: 'Čeština',
    htmlLang: 'cs',
    ogLocale: 'cs_CZ',
    acceptLanguage: ['cs-cz', 'cs'],
    dir: 'ltr',
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Locale-independent path -> URL in that locale. The default locale is the
 * canonical bare path (`/airport/PEK`), every other locale is prefixed
 * (`/zh/airport/PEK`).
 */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === '/' || path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean || '/' : `/${locale}${clean}`;
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
