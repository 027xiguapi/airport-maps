import { query, queryOne } from './db';
import { SOURCE_LOCALE, type Locale } from './i18n/config';
import {
  germanAirportName,
  germanCity,
  germanCountry,
  germanGateRange,
  germanLabel,
  germanRegion,
  germanSearchAlias,
  germanTerminalName,
} from './i18n/de-data';
import {
  frenchAirportName,
  frenchCity,
  frenchCountry,
  frenchGateRange,
  frenchLabel,
  frenchRegion,
  frenchSearchAlias,
  frenchTerminalName,
} from './i18n/fr-data';
import {
  italianAirportName,
  italianCity,
  italianCountry,
  italianGateRange,
  italianLabel,
  italianRegion,
  italianSearchAlias,
  italianTerminalName,
} from './i18n/it-data';
import {
  koreanAirportName,
  koreanCity,
  koreanCountry,
  koreanGateRange,
  koreanLabel,
  koreanRegion,
  koreanSearchAlias,
  koreanTerminalName,
} from './i18n/ko-data';
import {
  spanishAirportName,
  spanishCity,
  spanishCountry,
  spanishGateRange,
  spanishLabel,
  spanishRegion,
  spanishSearchAlias,
  spanishTerminalName,
} from './i18n/es-data';
import {
  portugueseAirportName,
  portugueseCity,
  portugueseCountry,
  portugueseGateRange,
  portugueseLabel,
  portugueseRegion,
  portugueseSearchAlias,
  portugueseTerminalName,
} from './i18n/pt-data';
import {
  indonesianAirportName,
  indonesianCity,
  indonesianCountry,
  indonesianGateRange,
  indonesianLabel,
  indonesianRegion,
  indonesianSearchAlias,
  indonesianTerminalName,
} from './i18n/id-data';
import {
  vietnameseAirportName,
  vietnameseCity,
  vietnameseCountry,
  vietnameseGateRange,
  vietnameseLabel,
  vietnameseRegion,
  vietnameseSearchAlias,
  vietnameseTerminalName,
} from './i18n/vi-data';
import {
  japaneseAirportName,
  japaneseCity,
  japaneseCountry,
  japaneseGateRange,
  japaneseLabel,
  japaneseRegion,
  japaneseSearchAlias,
  japaneseTerminalName,
} from './i18n/ja-data';
import {
  russianAirportName,
  russianCity,
  russianCountry,
  russianGateRange,
  russianLabel,
  russianRegion,
  russianSearchAlias,
  russianTerminalName,
} from './i18n/ru-data';
import {
  turkishAirportName,
  turkishCity,
  turkishCountry,
  turkishGateRange,
  turkishLabel,
  turkishRegion,
  turkishSearchAlias,
  turkishTerminalName,
} from './i18n/tr-data';
import {
  thaiAirportName,
  thaiCity,
  thaiCountry,
  thaiGateRange,
  thaiLabel,
  thaiRegion,
  thaiSearchAlias,
  thaiTerminalName,
} from './i18n/th-data';
import {
  dutchAirportName,
  dutchCity,
  dutchCountry,
  dutchGateRange,
  dutchLabel,
  dutchRegion,
  dutchSearchAlias,
  dutchTerminalName,
} from './i18n/nl-data';
import {
  swedishAirportName,
  swedishCity,
  swedishCountry,
  swedishGateRange,
  swedishLabel,
  swedishRegion,
  swedishSearchAlias,
  swedishTerminalName,
} from './i18n/sv-data';
import {
  polishAirportName,
  polishCity,
  polishCountry,
  polishGateRange,
  polishLabel,
  polishRegion,
  polishSearchAlias,
  polishTerminalName,
} from './i18n/pl-data';
import {
  czechAirportName,
  czechCity,
  czechCountry,
  czechGateRange,
  czechLabel,
  czechRegion,
  czechSearchAlias,
  czechTerminalName,
} from './i18n/cs-data';
import {
  romanianAirportName,
  romanianCity,
  romanianCountry,
  romanianGateRange,
  romanianLabel,
  romanianRegion,
  romanianSearchAlias,
  romanianTerminalName,
} from './i18n/ro-data';
import {
  ukrainianAirportName,
  ukrainianCity,
  ukrainianCountry,
  ukrainianGateRange,
  ukrainianLabel,
  ukrainianRegion,
  ukrainianSearchAlias,
  ukrainianTerminalName,
} from './i18n/uk-data';
import {
  hindiAirportName,
  hindiCity,
  hindiCountry,
  hindiGateRange,
  hindiLabel,
  hindiRegion,
  hindiSearchAlias,
  hindiTerminalName,
} from './i18n/hi-data';
import {
  bengaliAirportName,
  bengaliCity,
  bengaliCountry,
  bengaliGateRange,
  bengaliLabel,
  bengaliRegion,
  bengaliSearchAlias,
  bengaliTerminalName,
} from './i18n/bn-data';
import {
  swahiliAirportName,
  swahiliCity,
  swahiliCountry,
  swahiliGateRange,
  swahiliLabel,
  swahiliRegion,
  swahiliSearchAlias,
  swahiliTerminalName,
} from './i18n/sw-data';
import type {
  AirportDetail,
  AirportListParams,
  AirportSort,
  AirportSummary,
  Amenity,
  CityHub,
  CountryWithCount,
  Country,
  DirectoryStats,
  SearchHit,
  Terminal,
  TransitOption,
} from './types';

/** Escapes LIKE wildcards so user input cannot inject patterns. */
function likePattern(value: string): string {
  return `%${value.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Picks the localized value, falling back to English or the Chinese source.
 * `tw` is the derived Traditional-Chinese layer (see scripts/_hant.mjs).
 *
 * German, French, Italian, Korean, Spanish, Portuguese, Indonesian, Vietnamese
 * and Japanese have no `_de`/`_fr`/… columns: they localize the English column
 * and translate the closed vocabularies (lib/i18n/*-data.ts), so a per-locale
 * translator is passed for fields where the language differs (city, country,
 * terminal name, …). Fields without one keep their English value.
 */
type Translator = (value: string) => string;

/** Fields that have a closed per-locale vocabulary (lib/i18n/<code>-data.ts). */
type NameField =
  | 'airportName'
  | 'city'
  | 'country'
  | 'region'
  | 'terminalName'
  | 'label'
  | 'gateRange';

/**
 * Per-locale translators for the structured-data fields above. A locale without
 * a `_<code>` database column localizes the English value through this map;
 * adding a language means one entry here (plus its `messages/<code>.ts`).
 */
const VOCAB: Partial<Record<Locale, Partial<Record<NameField, Translator>>>> = {
  de: {
    airportName: germanAirportName,
    city: germanCity,
    country: germanCountry,
    region: germanRegion,
    terminalName: germanTerminalName,
    label: germanLabel,
    gateRange: germanGateRange,
  },
  fr: {
    airportName: frenchAirportName,
    city: frenchCity,
    country: frenchCountry,
    region: frenchRegion,
    terminalName: frenchTerminalName,
    label: frenchLabel,
    gateRange: frenchGateRange,
  },
  it: {
    airportName: italianAirportName,
    city: italianCity,
    country: italianCountry,
    region: italianRegion,
    terminalName: italianTerminalName,
    label: italianLabel,
    gateRange: italianGateRange,
  },
  ko: {
    airportName: koreanAirportName,
    city: koreanCity,
    country: koreanCountry,
    region: koreanRegion,
    terminalName: koreanTerminalName,
    label: koreanLabel,
    gateRange: koreanGateRange,
  },
  es: {
    airportName: spanishAirportName,
    city: spanishCity,
    country: spanishCountry,
    region: spanishRegion,
    terminalName: spanishTerminalName,
    label: spanishLabel,
    gateRange: spanishGateRange,
  },
  pt: {
    airportName: portugueseAirportName,
    city: portugueseCity,
    country: portugueseCountry,
    region: portugueseRegion,
    terminalName: portugueseTerminalName,
    label: portugueseLabel,
    gateRange: portugueseGateRange,
  },
  id: {
    airportName: indonesianAirportName,
    city: indonesianCity,
    country: indonesianCountry,
    region: indonesianRegion,
    terminalName: indonesianTerminalName,
    label: indonesianLabel,
    gateRange: indonesianGateRange,
  },
  vi: {
    airportName: vietnameseAirportName,
    city: vietnameseCity,
    country: vietnameseCountry,
    region: vietnameseRegion,
    terminalName: vietnameseTerminalName,
    label: vietnameseLabel,
    gateRange: vietnameseGateRange,
  },
  ja: {
    airportName: japaneseAirportName,
    city: japaneseCity,
    country: japaneseCountry,
    region: japaneseRegion,
    terminalName: japaneseTerminalName,
    label: japaneseLabel,
    gateRange: japaneseGateRange,
  },
  ru: {
    airportName: russianAirportName,
    city: russianCity,
    country: russianCountry,
    region: russianRegion,
    terminalName: russianTerminalName,
    label: russianLabel,
    gateRange: russianGateRange,
  },
  tr: {
    airportName: turkishAirportName,
    city: turkishCity,
    country: turkishCountry,
    region: turkishRegion,
    terminalName: turkishTerminalName,
    label: turkishLabel,
    gateRange: turkishGateRange,
  },
  th: {
    airportName: thaiAirportName,
    city: thaiCity,
    country: thaiCountry,
    region: thaiRegion,
    terminalName: thaiTerminalName,
    label: thaiLabel,
    gateRange: thaiGateRange,
  },
  nl: {
    airportName: dutchAirportName,
    city: dutchCity,
    country: dutchCountry,
    region: dutchRegion,
    terminalName: dutchTerminalName,
    label: dutchLabel,
    gateRange: dutchGateRange,
  },
  sv: {
    airportName: swedishAirportName,
    city: swedishCity,
    country: swedishCountry,
    region: swedishRegion,
    terminalName: swedishTerminalName,
    label: swedishLabel,
    gateRange: swedishGateRange,
  },
  pl: {
    airportName: polishAirportName,
    city: polishCity,
    country: polishCountry,
    region: polishRegion,
    terminalName: polishTerminalName,
    label: polishLabel,
    gateRange: polishGateRange,
  },
  cs: {
    airportName: czechAirportName,
    city: czechCity,
    country: czechCountry,
    region: czechRegion,
    terminalName: czechTerminalName,
    label: czechLabel,
    gateRange: czechGateRange,
  },
  ro: {
    airportName: romanianAirportName,
    city: romanianCity,
    country: romanianCountry,
    region: romanianRegion,
    terminalName: romanianTerminalName,
    label: romanianLabel,
    gateRange: romanianGateRange,
  },
  uk: {
    airportName: ukrainianAirportName,
    city: ukrainianCity,
    country: ukrainianCountry,
    region: ukrainianRegion,
    terminalName: ukrainianTerminalName,
    label: ukrainianLabel,
    gateRange: ukrainianGateRange,
  },
  hi: {
    airportName: hindiAirportName,
    city: hindiCity,
    country: hindiCountry,
    region: hindiRegion,
    terminalName: hindiTerminalName,
    label: hindiLabel,
    gateRange: hindiGateRange,
  },
  bn: {
    airportName: bengaliAirportName,
    city: bengaliCity,
    country: bengaliCountry,
    region: bengaliRegion,
    terminalName: bengaliTerminalName,
    label: bengaliLabel,
    gateRange: bengaliGateRange,
  },
  sw: {
    airportName: swahiliAirportName,
    city: swahiliCity,
    country: swahiliCountry,
    region: swahiliRegion,
    terminalName: swahiliTerminalName,
    label: swahiliLabel,
    gateRange: swahiliGateRange,
  },
};

/**
 * Per-locale exonym lookup for the search box: the visitor's localized place
 * name is translated back to the English column value, so "Peking", "Pékin" or
 * "Pekín" all find Beijing in `airports.search_blob` (which only carries the
 * Chinese, English and Traditional names).
 */
const SEARCH_ALIASES: Partial<Record<Locale, (term: string) => string | null>> = {
  de: germanSearchAlias,
  fr: frenchSearchAlias,
  it: italianSearchAlias,
  ko: koreanSearchAlias,
  es: spanishSearchAlias,
  pt: portugueseSearchAlias,
  id: indonesianSearchAlias,
  vi: vietnameseSearchAlias,
  ja: japaneseSearchAlias,
  ru: russianSearchAlias,
  tr: turkishSearchAlias,
  th: thaiSearchAlias,
  nl: dutchSearchAlias,
  sv: swedishSearchAlias,
  pl: polishSearchAlias,
  cs: czechSearchAlias,
  ro: romanianSearchAlias,
  uk: ukrainianSearchAlias,
  hi: hindiSearchAlias,
  bn: bengaliSearchAlias,
  sw: swahiliSearchAlias,
};

/** Translator for one field of a locale, when that locale has a vocabulary. */
function tr(locale: Locale, field: NameField): Translator | undefined {
  return VOCAB[locale]?.[field];
}

/**
 * Picks the localized value: English and Traditional Chinese have their own
 * columns, Chinese is the authored source, and every other locale localizes
 * the English value through its vocabulary translator. Fields without one keep
 * their English value.
 */
function pick(
  locale: Locale,
  zh: string | null,
  tw: string | null,
  en: string | null,
  translator?: Translator
): string {
  if (locale === 'en') return en ?? zh ?? '';
  if (locale === 'tw') return tw ?? zh ?? en ?? '';
  if (locale === 'zh') return zh ?? en ?? '';
  const base = en ?? zh ?? '';
  return translator ? translator(base) : base;
}

/** Picks the localized value, or null when that locale has no translation. */
function pickStrict(
  locale: Locale,
  zh: string | null,
  tw: string | null,
  en: string | null,
  translator?: Translator
): string | null {
  if (locale === 'en') return en;
  if (locale === 'tw') return tw;
  if (locale === 'zh') return zh;
  return en == null ? null : translator ? translator(en) : en;
}

// -------------------------------------------------------------- raw SQL rows

type AirportRow = {
  iata: string;
  slug: string;
  name_zh: string;
  name_tw: string | null;
  name_en: string;
  city_zh: string;
  city_tw: string | null;
  city_en: string | null;
  country_code: string;
  country_name_zh: string;
  country_name_tw: string | null;
  country_name_en: string;
  region_zh: string;
  region_tw: string | null;
  region_en: string;
  flag_url: string;
  gate_count: number;
  annual_pax_m: number | null;
  distance_km: number | null;
  updated_at: string;
  terminal_count: number;
};

type TerminalJson = {
  id: number;
  code: string;
  name_zh: string;
  name_tw: string | null;
  name_en: string | null;
  gate_range_zh: string | null;
  gate_range_tw: string | null;
  gate_range_en: string | null;
  gate_count: number;
  airlines_zh: string | null;
  airlines_tw: string | null;
  airlines_en: string | null;
  is_satellite: boolean;
  amenities: {
    icon: string;
    label_zh: string;
    label_tw: string | null;
    label_en: string | null;
  }[];
};

type FacilityJson = {
  icon: string;
  label_zh: string;
  label_tw: string | null;
  label_en: string | null;
};

type TransitJson = {
  icon: string;
  name_zh: string;
  name_tw: string | null;
  name_en: string | null;
  description_zh: string;
  description_tw: string | null;
  description_en: string | null;
};

type AirportDetailRow = AirportRow & {
  description_md: string;
  terminals: TerminalJson[];
  facilities: FacilityJson[];
  transit: TransitJson[];
};

// --------------------------------------------------------------- projections

const AIRPORT_SUMMARY = `
  a.iata,
  a.slug,
  a.name     AS name_zh,
  a.name_tw,
  a.name_en,
  a.city     AS city_zh,
  a.city_tw,
  a.city_en,
  a.country_code,
  c.name     AS country_name_zh,
  c.name_tw  AS country_name_tw,
  c.name_en  AS country_name_en,
  c.region   AS region_zh,
  c.region_tw,
  c.region_en,
  c.flag_url,
  a.gate_count,
  a.annual_pax_m::float8 AS annual_pax_m,
  a.distance_km::float8  AS distance_km,
  a.updated_at::date::text AS updated_at,
  (SELECT count(*) FROM terminals t WHERE t.airport_iata = a.iata)::int AS terminal_count
`;

const AIRPORT_JOINS = `
  FROM airports a
  JOIN countries c ON c.code = a.country_code
`;

function sortSql(sort: AirportSort, locale: Locale): string {
  switch (sort) {
    case 'iata':
      return 'a.iata ASC';
    case 'updated':
      return 'a.updated_at DESC, a.iata ASC';
    case 'name':
      // Chinese sorts by the collation's pinyin order; every translated locale
      // sorts by the English source column its names are derived from.
      return locale === 'zh' || locale === 'tw'
        ? 'a.name ASC, a.iata ASC'
        : 'a.name_en ASC, a.iata ASC';
    case 'pax':
    default:
      return 'a.annual_pax_m DESC NULLS LAST, a.iata ASC';
  }
}

// -------------------------------------------------------------------- mappers

function toSummary(row: AirportRow, locale: Locale): AirportSummary {
  return {
    iata: row.iata,
    slug: row.slug,
    name: pick(
      locale,
      row.name_zh,
      row.name_tw,
      row.name_en,
      tr(locale, 'airportName')
    ),
    nameZh: row.name_zh,
    nameEn: row.name_en,
    city: pick(locale, row.city_zh, row.city_tw, row.city_en, tr(locale, 'city')),
    cityEn: row.city_en,
    countryCode: row.country_code,
    countryName: pick(
      locale,
      row.country_name_zh,
      row.country_name_tw,
      row.country_name_en,
      tr(locale, 'country')
    ),
    countryNameEn: row.country_name_en,
    region: pick(
      locale,
      row.region_zh,
      row.region_tw,
      row.region_en,
      tr(locale, 'region')
    ),
    flagUrl: row.flag_url,
    gateCount: row.gate_count,
    annualPaxM: row.annual_pax_m,
    distanceKm: row.distance_km,
    updatedAt: row.updated_at,
    terminalCount: row.terminal_count,
  };
}

function toTerminal(row: TerminalJson, locale: Locale): Terminal {
  return {
    id: row.id,
    code: row.code,
    name: pick(
      locale,
      row.name_zh,
      row.name_tw,
      row.name_en,
      tr(locale, 'terminalName')
    ),
    gateRange:
      pick(
        locale,
        row.gate_range_zh,
        row.gate_range_tw,
        row.gate_range_en,
        tr(locale, 'gateRange')
      ) || null,
    gateCount: row.gate_count,
    // Editorial airline lists are not machine-translatable, so a missing
    // translation yields null and the UI omits the line.
    airlines: pickStrict(locale, row.airlines_zh, row.airlines_tw, row.airlines_en),
    isSatellite: row.is_satellite,
    amenities: (row.amenities ?? []).map<Amenity>((a) => ({
      icon: a.icon,
      label: pick(locale, a.label_zh, a.label_tw, a.label_en, tr(locale, 'label')),
    })),
  };
}

// ---------------------------------------------------------------- aggregate

export async function getStats(): Promise<DirectoryStats | null> {
  const row = await queryOne<{
    country_count: number;
    airport_count: number;
    terminal_count: number;
    gate_count: number;
  }>(`SELECT country_count::int, airport_count::int, terminal_count::int, gate_count::int FROM directory_stats`);
  if (!row) return null;
  return {
    countryCount: row.country_count,
    airportCount: row.airport_count,
    terminalCount: row.terminal_count,
    gateCount: row.gate_count,
  };
}

/**
 * Airport cities ranked by total passenger volume across every airport in the
 * city — the homepage "busiest hubs" strip.
 */
export async function getBusiestCities(locale: Locale, limit = 5): Promise<CityHub[]> {
  const rows = await query<{
    city_zh: string;
    city_tw: string | null;
    city_en: string | null;
    country_code: string;
    country_name_zh: string;
    country_name_tw: string | null;
    country_name_en: string;
    flag_url: string;
    airport_count: number;
    total_pax_m: number | null;
    lead_iata: string;
    lead_name_zh: string;
    lead_name_tw: string | null;
    lead_name_en: string;
    lead_slug: string;
    iatas: string[];
  }>(
    `WITH ranked AS (
       SELECT
         a.city, a.city_en, a.country_code, a.iata,
         a.name AS name_zh, a.name_tw, a.name_en, a.slug,
         c.name AS country_name_zh, c.name_tw AS country_name_tw, c.name_en AS country_name_en, c.flag_url,
         sum(a.annual_pax_m) OVER (PARTITION BY a.city)::float8 AS total_pax_m,
         count(*)            OVER (PARTITION BY a.city)::int    AS airport_count,
         row_number()        OVER (PARTITION BY a.city
                                   ORDER BY a.annual_pax_m DESC NULLS LAST, a.iata) AS rn
       FROM airports a
       JOIN countries c ON c.code = a.country_code
     )
     SELECT
       city AS city_zh, city_tw, city_en, country_code,
       country_name_zh, country_name_tw, country_name_en, flag_url,
       airport_count, total_pax_m,
       iata AS lead_iata, name_zh AS lead_name_zh, name_tw AS lead_name_tw,
       name_en AS lead_name_en, slug AS lead_slug,
       -- every IATA in the city, busiest first (a window aggregate cannot take
       -- its own ORDER BY, so this is a correlated subquery)
       (SELECT array_agg(x.iata ORDER BY x.annual_pax_m DESC NULLS LAST, x.iata)
          FROM airports x WHERE x.city = ranked.city) AS iatas
     FROM ranked
     WHERE rn = 1
     ORDER BY total_pax_m DESC NULLS LAST, city ASC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    city: pick(locale, row.city_zh, row.city_tw, row.city_en, tr(locale, 'city')),
    cityEn: row.city_en,
    countryCode: row.country_code,
    countryName: pick(
      locale,
      row.country_name_zh,
      row.country_name_tw,
      row.country_name_en,
      tr(locale, 'country')
    ),
    flagUrl: row.flag_url,
    airportCount: row.airport_count,
    totalPaxM: row.total_pax_m,
    leadIata: row.lead_iata,
    leadName: pick(
      locale,
      row.lead_name_zh,
      row.lead_name_tw,
      row.lead_name_en,
      tr(locale, 'airportName')
    ),
    leadSlug: row.lead_slug,
    iatas: row.iatas ?? [],
  }));
}

export async function getRecentlyUpdated(locale: Locale, limit = 5): Promise<AirportSummary[]> {
  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS} ORDER BY a.updated_at DESC, a.iata ASC LIMIT $1`,
    [limit]
  );
  return rows.map((row) => toSummary(row, locale));
}

// ------------------------------------------------------------------ countries

export async function getCountries(locale: Locale): Promise<CountryWithCount[]> {
  const rows = await query<{
    code: string;
    name_zh: string;
    name_tw: string | null;
    name_en: string;
    region_zh: string;
    region_tw: string | null;
    region_en: string;
    flag_url: string;
    sort_order: number;
    airport_count: number;
    terminal_count: number;
  }>(
    `SELECT c.code, c.name AS name_zh, c.name_tw, c.name_en,
            c.region AS region_zh, c.region_tw, c.region_en, c.flag_url, c.sort_order,
            count(a.iata)::int AS airport_count,
            coalesce(sum((SELECT count(*) FROM terminals t WHERE t.airport_iata = a.iata)), 0)::int
              AS terminal_count
       FROM countries c
       LEFT JOIN airports a ON a.country_code = c.code
      GROUP BY c.code
      ORDER BY c.sort_order ASC`
  );

  return rows.map((row) => ({
    code: row.code,
    name: pick(
      locale,
      row.name_zh,
      row.name_tw,
      row.name_en,
      tr(locale, 'country')
    ),
    nameZh: row.name_zh,
    nameEn: row.name_en,
    region: pick(
      locale,
      row.region_zh,
      row.region_tw,
      row.region_en,
      tr(locale, 'region')
    ),
    flagUrl: row.flag_url,
    sortOrder: row.sort_order,
    airportCount: row.airport_count,
    terminalCount: row.terminal_count,
  }));
}

export async function getCountry(locale: Locale, code: string): Promise<Country | null> {
  const row = await queryOne<{
    code: string;
    name_zh: string;
    name_tw: string | null;
    name_en: string;
    region_zh: string;
    region_tw: string | null;
    region_en: string;
    flag_url: string;
    sort_order: number;
  }>(
    `SELECT code, name AS name_zh, name_tw, name_en, region AS region_zh,
            region_tw, region_en, flag_url, sort_order
       FROM countries WHERE code = $1`,
    [code.toUpperCase()]
  );
  if (!row) return null;
  return {
    code: row.code,
    name: pick(
      locale,
      row.name_zh,
      row.name_tw,
      row.name_en,
      tr(locale, 'country')
    ),
    nameZh: row.name_zh,
    nameEn: row.name_en,
    region: pick(
      locale,
      row.region_zh,
      row.region_tw,
      row.region_en,
      tr(locale, 'region')
    ),
    flagUrl: row.flag_url,
    sortOrder: row.sort_order,
  };
}

/** All country codes — used by sitemap and static param generation. */
export function getAllCountryCodes(): Promise<{ code: string }[]> {
  return query(`SELECT code FROM countries ORDER BY code`);
}

// ------------------------------------------------------------------- airports

export async function getAirportSummaries(locale: Locale, limit?: number) {
  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS}
      ORDER BY a.annual_pax_m DESC NULLS LAST, a.iata ASC
      ${limit ? 'LIMIT ' + Number(limit) : ''}`
  );
  return rows.map((row) => toSummary(row, locale));
}

export async function getAirportsByCountry(
  locale: Locale,
  code: string
): Promise<AirportSummary[]> {
  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS}
      WHERE a.country_code = $1
      ORDER BY a.annual_pax_m DESC NULLS LAST, a.iata ASC`,
    [code.toUpperCase()]
  );
  return rows.map((row) => toSummary(row, locale));
}

/**
 * Full airport record. `code` accepts an IATA code (any case) or the
 * descriptive slug, so both addresses resolve.
 */
export async function getAirportByCode(
  locale: Locale,
  code: string
): Promise<AirportDetail | null> {
  const row = await queryOne<AirportDetailRow>(
    `SELECT
       ${AIRPORT_SUMMARY},
       coalesce(
         at.description_md,
         (SELECT x.description_md FROM airport_translations x
           WHERE x.airport_iata = a.iata AND x.locale = $2)
       ) AS description_md,
       coalesce(t.terminals, '[]'::json) AS terminals,
       coalesce(f.facilities, '[]'::json) AS facilities,
       coalesce(g.transit, '[]'::json)    AS transit
     ${AIRPORT_JOINS}
     LEFT JOIN airport_translations at
            ON at.airport_iata = a.iata AND at.locale = $3
     LEFT JOIN LATERAL (
       SELECT json_agg(json_build_object(
                'id',            t.id,
                'code',          t.code,
                'name_zh',       t.name,
                'name_tw',       t.name_tw,
                'name_en',       t.name_en,
                'gate_range_zh', t.gate_range,
                'gate_range_tw', t.gate_range_tw,
                'gate_range_en', t.gate_range_en,
                'gate_count',    t.gate_count,
                'airlines_zh',   t.airlines,
                'airlines_tw',   t.airlines_tw,
                'airlines_en',   t.airlines_en,
                'is_satellite',  t.is_satellite,
                'amenities', coalesce((
                  SELECT json_agg(json_build_object(
                           'icon', am.icon, 'label_zh', am.label,
                           'label_tw', am.label_tw, 'label_en', am.label_en)
                         ORDER BY am.sort_order)
                    FROM terminal_amenities am WHERE am.terminal_id = t.id
                ), '[]'::json)
              ) ORDER BY t.sort_order) AS terminals
         FROM terminals t
        WHERE t.airport_iata = a.iata
     ) t ON true
     LEFT JOIN LATERAL (
       SELECT json_agg(json_build_object(
                'icon', af.icon, 'label_zh', af.label,
                'label_tw', af.label_tw, 'label_en', af.label_en)
              ORDER BY af.sort_order) AS facilities
         FROM airport_facilities af WHERE af.airport_iata = a.iata
     ) f ON true
     LEFT JOIN LATERAL (
       SELECT json_agg(json_build_object(
                'icon', gt.icon,
                'name_zh', gt.name, 'name_tw', gt.name_tw, 'name_en', gt.name_en,
                'description_zh', gt.description, 'description_tw', gt.description_tw,
                'description_en', gt.description_en)
              ORDER BY gt.sort_order) AS transit
         FROM ground_transport gt WHERE gt.airport_iata = a.iata
     ) g ON true
     WHERE a.iata = upper($1) OR a.slug = lower($1)
     LIMIT 1`,
    // Missing descriptions fall back to the authored source language only for
    // the Chinese locales; every translated locale falls back to English: a
    // Chinese paragraph inside those pages would be less useful than the
    // English one.
    [
      code.trim(),
      locale === 'zh' || locale === 'tw' ? SOURCE_LOCALE : 'en',
      locale,
    ]
  );

  if (!row) return null;

  return {
    ...toSummary(row, locale),
    descriptionMd: row.description_md ?? '',
    terminals: (row.terminals ?? []).map((t) => toTerminal(t, locale)),
    facilities: (row.facilities ?? []).map<Amenity>((f) => ({
      icon: f.icon,
      label: pick(locale, f.label_zh, f.label_tw, f.label_en, tr(locale, 'label')),
    })),
    transit: (row.transit ?? []).map<TransitOption>((t) => ({
      icon: t.icon,
      // Empty strings signal "no translation" so the UI can show the mode label.
      name: pickStrict(locale, t.name_zh, t.name_tw, t.name_en) ?? '',
      description: pickStrict(locale, t.description_zh, t.description_tw, t.description_en) ?? '',
    })),
  };
}

/** Other airports in the same country, busiest first. */
export async function getRelatedAirports(
  locale: Locale,
  countryCode: string,
  excludeIata: string,
  limit = 6
): Promise<AirportSummary[]> {
  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS}
      WHERE a.country_code = $1 AND a.iata <> $2
      ORDER BY a.annual_pax_m DESC NULLS LAST, a.iata ASC
      LIMIT $3`,
    [countryCode.toUpperCase(), excludeIata.toUpperCase(), limit]
  );
  return rows.map((row) => toSummary(row, locale));
}

/**
 * The Chinese name for an airport, regardless of the page locale — outbound
 * links (zh Wikipedia, Baidu Baike) need it even on the English pages.
 */
export async function getAirportNameZh(iata: string): Promise<string | null> {
  const row = await queryOne<{ name: string }>(`SELECT name FROM airports WHERE iata = $1`, [
    iata.toUpperCase(),
  ]);
  return row?.name ?? null;
}

// --------------------------------------------------------------------- search

export async function searchAirports(
  locale: Locale,
  term: string,
  limit = 8
): Promise<SearchHit[]> {
  const value = term.trim();
  if (!value) return [];

  const rows = await query<{
    iata: string;
    slug: string;
    name_zh: string;
    name_tw: string | null;
    name_en: string;
    city_zh: string;
    city_tw: string | null;
    city_en: string | null;
    country_code: string;
    country_name_zh: string;
    country_name_tw: string | null;
    country_name_en: string;
    flag_url: string;
  }>(
    // search_blob carries every locale's names, so one query serves all locales.
    // German additionally searches its own exonym's English counterpart
    // ("Peking" -> "Beijing"), because the blob has no German names.
    `SELECT a.iata, a.slug,
            a.name AS name_zh, a.name_tw, a.name_en,
            a.city AS city_zh, a.city_tw, a.city_en,
            a.country_code, c.name AS country_name_zh, c.name_tw AS country_name_tw,
            c.name_en AS country_name_en, c.flag_url
       FROM airports a
       JOIN countries c ON c.code = a.country_code
      WHERE a.search_blob ILIKE $2 ESCAPE '\\'
         OR c.name        ILIKE $2 ESCAPE '\\'
         OR c.name_en     ILIKE $2 ESCAPE '\\'
         OR ($3::text IS NOT NULL AND (
              a.search_blob ILIKE $3 ESCAPE '\\' OR c.name_en ILIKE $3 ESCAPE '\\'
            ))
      ORDER BY
        -- match quality first, so a city hit (LHR for "lon") beats a long
        -- airport-name hit (London Stansted) before volume breaks ties
        CASE
          WHEN a.iata = upper($1)                              THEN 0
          WHEN a.iata ILIKE $1 || '%'                          THEN 1
          WHEN a.city = $1 OR c.name = $1
            OR a.city_en ILIKE $1 OR c.name_en ILIKE $1        THEN 2
          WHEN a.city ILIKE $1 || '%' OR a.city_en ILIKE $1 || '%'
            OR c.name ILIKE $1 || '%' OR c.name_en ILIKE $1 || '%' THEN 3
          WHEN a.name ILIKE $1 || '%'                          THEN 4
          WHEN a.name_en ILIKE $1 || '%'                       THEN 5
          ELSE 6
        END,
        a.annual_pax_m DESC NULLS LAST,
        a.iata ASC
      LIMIT $4`,
    [
      value,
      likePattern(value),
      (() => {
        const alias = SEARCH_ALIASES[locale]?.(value) ?? null;
        return alias ? likePattern(alias) : null;
      })(),
      limit,
    ]
  );

  return rows.map((row) => ({
    iata: row.iata,
    slug: row.slug,
    name: pick(
      locale,
      row.name_zh,
      row.name_tw,
      row.name_en,
      tr(locale, 'airportName')
    ),
    nameEn: row.name_en,
    city: pick(locale, row.city_zh, row.city_tw, row.city_en, tr(locale, 'city')),
    countryCode: row.country_code,
    countryName: pick(
      locale,
      row.country_name_zh,
      row.country_name_tw,
      row.country_name_en,
      tr(locale, 'country')
    ),
    flagUrl: row.flag_url,
  }));
}

// ------------------------------------------------- directory listing + paging

export type AirportListResult = {
  rows: AirportSummary[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export async function listAirports(
  locale: Locale,
  params: AirportListParams = {}
): Promise<AirportListResult> {
  const perPage = Math.min(Math.max(params.perPage ?? 24, 1), 100);
  const sort: AirportSort =
    params.sort && ['pax', 'name', 'iata', 'updated'].includes(params.sort) ? params.sort : 'pax';
  const term = params.q?.trim() ?? '';
  const country = params.country?.trim().toUpperCase() ?? '';

  const where: string[] = [];
  const args: unknown[] = [];
  if (country) {
    args.push(country);
    where.push(`a.country_code = $${args.length}`);
  }
  if (term) {
    args.push(term);
    const termIndex = args.length;
    args.push(likePattern(term));
    const patternIndex = args.length;
    const clauses = [
      `a.search_blob ILIKE $${patternIndex} ESCAPE '\\'`,
      `c.name      ILIKE $${patternIndex} ESCAPE '\\'`,
      `c.name_en   ILIKE $${patternIndex} ESCAPE '\\'`,
      `a.iata = upper($${termIndex})`,
    ];
    // Translated-locale exonym typed instead of the English name ("Peking",
    // "Pékin", "Pechino", "도쿄", "Pekín", "Pequim", "Bắc Kinh", "北京", "Пекин", "Pekin").
    const alias = SEARCH_ALIASES[locale]?.(term) ?? null;
    if (alias) {
      args.push(likePattern(alias));
      clauses.push(`a.search_blob ILIKE $${args.length} ESCAPE '\\'`);
    }
    where.push(`(${clauses.join(' OR ')})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRow = await queryOne<{ total: number }>(
    `SELECT count(*)::int AS total ${AIRPORT_JOINS} ${whereSql}`,
    args
  );
  const total = totalRow?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(params.page ?? 1, 1), pageCount);

  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS} ${whereSql}
      ORDER BY ${sortSql(sort, locale)}
      LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
    [...args, perPage, (page - 1) * perPage]
  );

  return { rows: rows.map((row) => toSummary(row, locale)), total, page, perPage, pageCount };
}

// ------------------------------------------------------------------ sitemap

/** IATA codes and slugs for every airport — sitemap and static params. */
export function getAirportRoutes(): Promise<
  { iata: string; slug: string; updated_at: string }[]
> {
  return query(
    `SELECT iata, slug, updated_at::date::text AS updated_at FROM airports ORDER BY iata`
  );
}

/** Distinct-city count, for the homepage category strip. */
export async function getCityCount(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT count(DISTINCT city)::int AS n FROM airports`
  );
  return row?.n ?? 0;
}

/** Distinct-region count, for the homepage category strip. */
export async function getRegionCount(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT count(DISTINCT region)::int AS n FROM countries`
  );
  return row?.n ?? 0;
}

/** Airports whose IATA code is in `codes`, busiest first. */
export async function getAirportsByCodes(
  locale: Locale,
  codes: string[]
): Promise<AirportSummary[]> {
  if (codes.length === 0) return [];
  const rows = await query<AirportRow>(
    `SELECT ${AIRPORT_SUMMARY} ${AIRPORT_JOINS}
      WHERE a.iata = ANY($1::char(3)[])
      ORDER BY a.annual_pax_m DESC NULLS LAST, a.iata ASC`,
    [codes.map((c) => c.toUpperCase())]
  );
  return rows.map((row) => toSummary(row, locale));
}
