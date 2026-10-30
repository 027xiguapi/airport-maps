import { randomUUID } from 'node:crypto';
import type { AuthUser } from '@/lib/auth';
import { query, queryOne, withTransaction } from '@/lib/db';
import {
  isDealCabin,
  isDealTripType,
  type DealCabin,
  type DealTripType,
} from '@/lib/deal-format';

/**
 * Administrator-side deal management (see /admin/deals).
 *
 * Reader submissions go through lib/deals.ts, which enforces a booking link
 * and a per-account quota. This module is the trusted write path: it can
 * publish official fares, import a whole price table in one paste, hide rows,
 * edit any field, and delete in bulk. Authentication/authorisation lives in
 * lib/admin.ts — every exported write here assumes the caller already checked.
 */

export type AdminDeal = {
  id: number;
  airportIata: string;
  airportCity: string;
  airportName: string;
  destination: string;
  destinationEn: string | null;
  airline: string;
  airlineEn: string | null;
  price: number;
  currency: string;
  cabin: DealCabin;
  tripType: DealTripType;
  travelFrom: string | null;
  travelTo: string | null;
  bookingUrl: string | null;
  notes: string;
  notesEn: string | null;
  status: 'visible' | 'hidden';
  taxIncluded: boolean;
  isOfficial: boolean;
  submitterName: string;
  batchId: string | null;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
};

type AdminDealRow = {
  id: number;
  airport_iata: string;
  airport_city: string;
  airport_name: string;
  destination: string;
  destination_en: string | null;
  airline: string;
  airline_en: string | null;
  price: string;
  currency: string;
  cabin: DealCabin;
  trip_type: DealTripType;
  travel_from: string | null;
  travel_to: string | null;
  booking_url: string | null;
  notes: string;
  notes_en: string | null;
  status: 'visible' | 'hidden';
  tax_included: boolean;
  is_official: boolean;
  submitter_name: string;
  batch_id: string | null;
  created_at: Date;
  expires_at: Date;
  updated_at: Date;
  total_count?: number;
};

const ADMIN_DEAL_COLUMNS = `
  d.id, d.airport_iata, d.destination, d.destination_en,
  d.airline, d.airline_en, d.price, d.currency,
  d.cabin, d.trip_type,
  d.travel_from::text as travel_from, d.travel_to::text as travel_to,
  d.booking_url, d.notes, d.notes_en, d.status, d.tax_included, d.is_official,
  d.submitter_name, d.batch_id, d.created_at, d.expires_at, d.updated_at,
  a.city as airport_city, a.name as airport_name`;

const ADMIN_DEAL_JOINS = `
  from deals d
  join airports a on a.iata = d.airport_iata`;

function toAdminDeal(row: AdminDealRow): AdminDeal {
  return {
    id: row.id,
    airportIata: row.airport_iata,
    airportCity: row.airport_city,
    airportName: row.airport_name,
    destination: row.destination,
    destinationEn: row.destination_en,
    airline: row.airline,
    airlineEn: row.airline_en,
    price: Number(row.price),
    currency: row.currency,
    cabin: row.cabin,
    tripType: row.trip_type,
    travelFrom: row.travel_from,
    travelTo: row.travel_to,
    bookingUrl: row.booking_url,
    notes: row.notes,
    notesEn: row.notes_en,
    status: row.status,
    taxIncluded: row.tax_included,
    isOfficial: row.is_official,
    submitterName: row.submitter_name,
    batchId: row.batch_id,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function likePattern(value: string): string {
  return `%${value.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** Admin listing: every status, newest first, with a window-function total. */
export async function listAdminDeals(filters: {
  q?: string | null;
  status?: string | null;
  batch?: string | null;
  limit?: number;
  offset?: number;
}): Promise<{ deals: AdminDeal[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.min(Math.max(filters.offset ?? 0, 0), 100_000);
  const q = filters.q?.trim() ? likePattern(filters.q) : null;
  const status = filters.status === 'visible' || filters.status === 'hidden' ? filters.status : null;
  const batch = filters.batch?.trim() ? filters.batch.trim() : null;

  const rows = await query<AdminDealRow>(
    `select ${ADMIN_DEAL_COLUMNS}, count(*) over()::int as total_count
       ${ADMIN_DEAL_JOINS}
      where ($1::text is null
             or d.destination ilike $1 escape '\\'
             or d.destination_en ilike $1 escape '\\'
             or d.airline ilike $1 escape '\\'
             or d.airline_en ilike $1 escape '\\'
             or d.airport_iata ilike $1 escape '\\')
        and ($2::text is null or d.status = $2)
        and ($3::text is null or d.batch_id = $3)
      order by d.created_at desc, d.id desc
      limit $4 offset $5`,
    [q, status, batch, limit, offset]
  );

  return {
    deals: rows.map(toAdminDeal),
    total: rows[0]?.total_count ?? 0,
  };
}

export async function getAdminDeal(id: number): Promise<AdminDeal | null> {
  const row = await queryOne<AdminDealRow>(
    `select ${ADMIN_DEAL_COLUMNS} ${ADMIN_DEAL_JOINS} where d.id = $1`,
    [id]
  );
  return row ? toAdminDeal(row) : null;
}

// ------------------------------------------------------------------ validation

type AdminDraft = {
  airportIata: string;
  destination: string;
  destinationEn: string | null;
  airline: string;
  airlineEn: string | null;
  /** numeric(10,2) as a string. */
  price: string;
  currency: string;
  cabin: DealCabin;
  tripType: DealTripType;
  travelFrom: string | null;
  travelTo: string | null;
  bookingUrl: string | null;
  notes: string;
  notesEn: string | null;
  status: 'visible' | 'hidden';
  taxIncluded: boolean;
  isOfficial: boolean;
  expiresAt: Date;
};

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanLine(value: unknown): string {
  return cleanText(value).replace(/\s+/g, ' ').trim();
}

function parseDateOnly(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return undefined;
  const raw = value.trim();
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) return undefined;
  return raw;
}

function parseExpiry(value: unknown): Date | null {
  const raw = cleanLine(value);
  if (!raw) return new Date(Date.now() + 30 * 86_400_000);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T23:59:59.999Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Normalised admin input, or a Chinese message the admin UI shows inline. */
export function validateAdminDealInput(
  input: Record<string, unknown>
): { ok: true; draft: AdminDraft } | { ok: false; message: string } {
  const airportIata = cleanLine(input.airportIata).toUpperCase();
  if (!/^[A-Z]{3}$/.test(airportIata)) return { ok: false, message: '出发机场需为三字 IATA 代码。' };

  const destination = cleanLine(input.destination);
  if ([...destination].length < 2 || [...destination].length > 60) {
    return { ok: false, message: '目的地需为 2–60 个字符。' };
  }
  const destinationEnRaw = cleanLine(input.destinationEn);
  if (destinationEnRaw && ([...destinationEnRaw].length < 2 || [...destinationEnRaw].length > 60)) {
    return { ok: false, message: '英文目的地需为 2–60 个字符。' };
  }

  const airline = cleanLine(input.airline);
  if ([...airline].length < 2 || [...airline].length > 60) {
    return { ok: false, message: '航空公司需为 2–60 个字符。' };
  }
  const airlineEnRaw = cleanLine(input.airlineEn);
  if (airlineEnRaw && ([...airlineEnRaw].length < 2 || [...airlineEnRaw].length > 60)) {
    return { ok: false, message: '英文航空公司需为 2–60 个字符。' };
  }

  const rawPrice =
    typeof input.price === 'number'
      ? input.price
      : Number(String(input.price ?? '').replace(/[,\s]/g, ''));
  if (!Number.isFinite(rawPrice) || rawPrice <= 0 || rawPrice > 1_000_000) {
    return { ok: false, message: '价格需为大于 0 的数字。' };
  }

  const currency = cleanLine(input.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, message: '币种需为三位代码，如 CNY。' };

  const cabin = input.cabin ?? 'economy';
  if (!isDealCabin(cabin)) return { ok: false, message: '舱位无效。' };
  const tripType = input.tripType ?? 'oneway';
  if (!isDealTripType(tripType)) return { ok: false, message: '行程类型无效。' };

  const travelFrom = parseDateOnly(input.travelFrom);
  const travelTo = parseDateOnly(input.travelTo);
  if (travelFrom === undefined || travelTo === undefined) {
    return { ok: false, message: '出行日期格式应为 YYYY-MM-DD。' };
  }
  if (travelFrom && travelTo && travelTo < travelFrom) {
    return { ok: false, message: '返程日期不能早于出发日期。' };
  }

  const rawUrl = cleanLine(input.bookingUrl);
  let bookingUrl: string | null = null;
  if (rawUrl) {
    if (rawUrl.length > 600) return { ok: false, message: '订票链接过长。' };
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { ok: false, message: '订票链接需以 http(s) 开头。' };
      }
      if (url.username || url.password) return { ok: false, message: '订票链接不能包含账号密码。' };
      if (!url.hostname.includes('.')) return { ok: false, message: '订票链接的域名无效。' };
      bookingUrl = rawUrl;
    } catch {
      return { ok: false, message: '订票链接格式无效。' };
    }
  }

  const notes = cleanText(input.notes);
  if ([...notes].length > 600) return { ok: false, message: '备注最多 600 个字符。' };
  const notesEn = cleanText(input.notesEn);
  if ([...notesEn].length > 600) return { ok: false, message: '英文备注最多 600 个字符。' };

  const status = input.status === 'hidden' ? 'hidden' : 'visible';
  const expiresAt = parseExpiry(input.expiresAt);
  if (!expiresAt) return { ok: false, message: '过期时间格式无效。' };

  return {
    ok: true,
    draft: {
      airportIata,
      destination,
      destinationEn: destinationEnRaw || null,
      airline,
      airlineEn: airlineEnRaw || null,
      price: rawPrice.toFixed(2),
      currency,
      cabin,
      tripType,
      travelFrom,
      travelTo,
      bookingUrl,
      notes,
      notesEn: notesEn || null,
      status,
      taxIncluded: input.taxIncluded !== false,
      isOfficial: input.isOfficial !== false,
      expiresAt,
    },
  };
}

// --------------------------------------------------------------------- writes

export async function createAdminDeal(
  draft: AdminDraft,
  admin: AuthUser
): Promise<AdminDeal> {
  const airport = await queryOne<{ ok: number }>('select 1 as ok from airports where iata = $1', [
    draft.airportIata,
  ]);
  if (!airport) throw new Error(`airport_not_found:${draft.airportIata}`);

  const row = await queryOne<{ id: number }>(
    `insert into deals (airport_iata, destination, destination_en, airline, airline_en,
                        price, currency, cabin, trip_type, travel_from, travel_to,
                        booking_url, notes, notes_en, status, user_id, submitter_name,
                        expires_at, tax_included, is_official)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     returning id`,
    [
      draft.airportIata,
      draft.destination,
      draft.destinationEn,
      draft.airline,
      draft.airlineEn,
      draft.price,
      draft.currency,
      draft.cabin,
      draft.tripType,
      draft.travelFrom,
      draft.travelTo,
      draft.bookingUrl,
      draft.notes,
      draft.notesEn,
      draft.status,
      admin.id,
      admin.name.slice(0, 80),
      draft.expiresAt,
      draft.taxIncluded,
      draft.isOfficial,
    ]
  );
  if (!row) throw new Error('insert into deals returned no row');
  const deal = await getAdminDeal(row.id);
  if (!deal) throw new Error(`deal ${row.id} vanished after insert`);
  return deal;
}

export async function updateAdminDeal(
  id: number,
  draft: AdminDraft
): Promise<AdminDeal | null> {
  const airport = await queryOne<{ ok: number }>('select 1 as ok from airports where iata = $1', [
    draft.airportIata,
  ]);
  if (!airport) throw new Error(`airport_not_found:${draft.airportIata}`);

  const updated = await queryOne<{ id: number }>(
    `update deals
        set airport_iata = $2, destination = $3, destination_en = $4,
            airline = $5, airline_en = $6, price = $7, currency = $8,
            cabin = $9, trip_type = $10, travel_from = $11, travel_to = $12,
            booking_url = $13, notes = $14, notes_en = $15, status = $16,
            expires_at = $17, tax_included = $18, is_official = $19,
            updated_at = now()
      where id = $1
      returning id`,
    [
      id,
      draft.airportIata,
      draft.destination,
      draft.destinationEn,
      draft.airline,
      draft.airlineEn,
      draft.price,
      draft.currency,
      draft.cabin,
      draft.tripType,
      draft.travelFrom,
      draft.travelTo,
      draft.bookingUrl,
      draft.notes,
      draft.notesEn,
      draft.status,
      draft.expiresAt,
      draft.taxIncluded,
      draft.isOfficial,
    ]
  );
  return updated ? getAdminDeal(id) : null;
}

/** Deletes the given rows; returns how many actually existed. */
export async function deleteAdminDeals(ids: number[]): Promise<number> {
  const clean = [...new Set(ids.filter((id) => Number.isSafeInteger(id) && id > 0))];
  if (clean.length === 0) return 0;
  const result = await queryOne<{ deleted: string }>(
    `with removed as (delete from deals where id = any($1::int[]) returning 1)
     select count(*)::text as deleted from removed`,
    [clean]
  );
  return Number(result?.deleted ?? 0);
}

export async function deleteAdminBatch(batchId: string): Promise<number> {
  const result = await queryOne<{ deleted: string }>(
    `with removed as (delete from deals where batch_id = $1 returning 1)
     select count(*)::text as deleted from removed`,
    [batchId]
  );
  return Number(result?.deleted ?? 0);
}

// --------------------------------------------------------------------- import

export type ImportDefaults = {
  airline: string;
  /** English primary shown on non-Chinese pages, with Chinese in parentheses. */
  airlineEn?: string | null;
  currency: string;
  cabin: DealCabin;
  tripType: DealTripType;
  taxIncluded: boolean;
  isOfficial: boolean;
  notes: string;
  /** English primary note; Chinese `notes` is appended in parentheses. */
  notesEn?: string | null;
  bookingUrl: string | null;
  expiresAt: string | null;
};

export type ImportError = { line: number; raw: string; message: string };

export type ImportResult = {
  dryRun: boolean;
  batchId: string | null;
  /** Actual inserts, or the number that would be inserted for a dry run. */
  created: number;
  skipped: number;
  totalRows: number;
  errors: ImportError[];
  sample: { airportIata: string; destination: string; price: number }[];
};

/**
 * Origin-city aliases for the fare cards the site publishes. The map pins the
 * metro's main international airport (Chengdu → TFU, Shanghai → PVG, …);
 * anything else is looked up in the directory by city, and a pasted IATA code
 * always wins. Wenzhou is intentionally listed even though the current
 * directory does not carry WNZ — the importer reports it as unresolved rather
 * than silently dropping those routes.
 */
const CITY_TO_IATA: Record<string, string> = {
  杭州: 'HGH',
  宁波: 'NGB',
  南京: 'NKG',
  上海: 'PVG',
  温州: 'WNZ',
  武汉: 'WUH',
  成都: 'TFU',
  郑州: 'CGO',
  重庆: 'CKG',
  北京: 'PEK',
  青岛: 'TAO',
  长沙: 'CSX',
  福州: 'FOC',
  厦门: 'XMN',
  海口: 'HAK',
  西安: 'XIY',
  乌鲁木齐: 'URC',
};

/**
 * English names for the destinations used by the published fare cards. The
 * importer stores them in `destination_en`; non-Chinese pages render
 * "English (中文)" so the page reads in English first without losing the
 * original wording. An unmapped destination simply falls back to Chinese.
 */
const DESTINATION_EN: Record<string, string> = {
  高雄: 'Kaohsiung',
  台北: 'Taipei',
  曼谷: 'Bangkok',
  金边: 'Phnom Penh',
  马尼拉: 'Manila',
  科伦坡: 'Colombo',
  河内: 'Hanoi',
  胡志明市: 'Ho Chi Minh City',
  悉尼: 'Sydney',
  墨尔本: 'Melbourne',
  珀斯: 'Perth',
  布里斯班: 'Brisbane',
  阿姆斯特丹: 'Amsterdam',
  布鲁塞尔: 'Brussels',
  巴黎: 'Paris',
  法兰克福: 'Frankfurt',
  马德里: 'Madrid',
  米兰: 'Milan',
  伦敦: 'London',
  慕尼黑: 'Munich',
  苏黎世: 'Zurich',
  洛杉矶: 'Los Angeles',
  温哥华: 'Vancouver',
  西雅图: 'Seattle',
  奥克兰: 'Auckland',
  基督城: 'Christchurch',
  多伦多: 'Toronto',
};

function normalizeCity(value: string): string {
  return value.replace(/\s+/g, '').replace(/市$/, '');
}

async function airportExists(iata: string): Promise<boolean> {
  const row = await queryOne<{ ok: number }>('select 1 as ok from airports where iata = $1', [iata]);
  return Boolean(row);
}

/** Resolves one origin cell to an IATA code, with a per-import cache. */
async function resolveOrigin(
  raw: string,
  cache: Map<string, string | null>
): Promise<string | null> {
  const city = normalizeCity(raw);
  if (!city) return null;
  if (cache.has(city)) return cache.get(city) ?? null;

  let resolved: string | null = null;
  if (/^[A-Za-z]{3}$/.test(city)) {
    const code = city.toUpperCase();
    if (await airportExists(code)) resolved = code;
  }
  if (!resolved) {
    const mapped = CITY_TO_IATA[city];
    if (mapped && (await airportExists(mapped))) resolved = mapped;
  }
  if (!resolved) {
    const row = await queryOne<{ iata: string }>(
      `select iata from airports
        where city = $1
        order by annual_pax_m desc nulls last, iata asc
        limit 1`,
      [city]
    );
    if (row) resolved = row.iata;
  }

  cache.set(city, resolved);
  return resolved;
}

function parseImportLines(text: string): {
  rows: { line: number; raw: string; price: number; route: string }[];
  errors: ImportError[];
} {
  const rows: { line: number; raw: string; price: number; route: string }[] = [];
  const errors: ImportError[] = [];
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const line = index + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;
    if (/^(套餐)?价格|price/i.test(trimmed) && /航线|route/i.test(trimmed)) return;

    let columns = trimmed.split('\t');
    if (columns.length < 2) columns = trimmed.split(/\s*\|\s*/);
    if (columns.length < 2 && /[,，]/.test(trimmed)) columns = trimmed.split(/[,，]/);
    if (columns.length < 2) {
      const spaced = trimmed.match(/^([\d.,]+)\s*元?\s+[：:]?\s*(.+)$/);
      if (spaced) columns = [spaced[1], spaced[2]];
    }
    if (columns.length < 2) {
      errors.push({ line, raw: trimmed, message: '每行需要「价格」和「航线」两列。' });
      return;
    }

    const price = Number(String(columns[0]).replace(/[^\d.]/g, ''));
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ line, raw: trimmed, message: '价格无法解析。' });
      return;
    }
    const route = columns.slice(1).join(' ').trim();
    if (!route) {
      errors.push({ line, raw: trimmed, message: '航线为空。' });
      return;
    }
    rows.push({ line, raw: trimmed, price, route });
  });

  return { rows, errors };
}

function splitRoute(route: string): { origins: string[]; destinations: string[] } | null {
  const normalized = route.replace(/＝/g, '=').replace(/→|->/g, '=');
  const parts = normalized.split('=');
  if (parts.length < 2) return null;
  const origins = parts[0]
    .split(/[\/／、,，]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const destinations = parts
    .slice(1)
    .join('=')
    .split(/[\/／、,，]/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (origins.length === 0 || destinations.length === 0) return null;
  return { origins, destinations };
}

type NormalizedImportDefaults = Omit<ImportDefaults, 'expiresAt'> & { expiresAt: Date };

function normalizeImportDefaults(defaults: ImportDefaults):
  | { ok: true; value: NormalizedImportDefaults }
  | { ok: false; message: string } {
  const airline = cleanLine(defaults.airline);
  if ([...airline].length < 2 || [...airline].length > 60) {
    return { ok: false, message: '航空公司需为 2–60 个字符。' };
  }
  const airlineEn = cleanLine(defaults.airlineEn);
  if (airlineEn && ([...airlineEn].length < 2 || [...airlineEn].length > 60)) {
    return { ok: false, message: '英文航空公司需为 2–60 个字符。' };
  }
  const currency = cleanLine(defaults.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, message: '币种需为三位代码。' };
  if (!isDealCabin(defaults.cabin)) return { ok: false, message: '舱位无效。' };
  if (!isDealTripType(defaults.tripType)) return { ok: false, message: '行程类型无效。' };
  const notes = cleanText(defaults.notes);
  if ([...notes].length > 600) return { ok: false, message: '备注最多 600 个字符。' };
  const notesEn = cleanText(defaults.notesEn);
  if ([...notesEn].length > 600) return { ok: false, message: '英文备注最多 600 个字符。' };

  const rawUrl = cleanLine(defaults.bookingUrl);
  let bookingUrl: string | null = null;
  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname.includes('.')) {
        return { ok: false, message: '订票链接需为有效的 http(s) 地址。' };
      }
      bookingUrl = rawUrl;
    } catch {
      return { ok: false, message: '订票链接格式无效。' };
    }
  }

  const expiresAt = parseExpiry(defaults.expiresAt);
  if (!expiresAt) return { ok: false, message: '过期时间格式无效。' };

  return {
    ok: true,
    value: {
      airline,
      airlineEn: airlineEn || null,
      currency,
      cabin: defaults.cabin,
      tripType: defaults.tripType,
      notes,
      notesEn: notesEn || null,
      bookingUrl,
      expiresAt,
      taxIncluded: defaults.taxIncluded,
      isOfficial: defaults.isOfficial,
    },
  };
}

/**
 * Expands a pasted two-column table into one deal per origin × destination.
 *
 *   price<TAB>Hangzhou/Ningbo/.../Wuhan=Taipei/Kaohsiung
 *
 * `dryRun` validates and counts without writing, so the admin can check the
 * preview (especially unresolved cities such as Wenzhou) before committing.
 */
export async function importAdminDeals(options: {
  text: string;
  defaults: ImportDefaults;
  admin: AuthUser;
  dryRun: boolean;
}): Promise<ImportResult> {
  const defaults = normalizeImportDefaults(options.defaults);
  if (!defaults.ok) {
    return {
      dryRun: options.dryRun,
      batchId: null,
      created: 0,
      skipped: 0,
      totalRows: 0,
      errors: [{ line: 0, raw: '', message: defaults.message }],
      sample: [],
    };
  }

  const parsed = parseImportLines(options.text.slice(0, 300_000));
  const errors = [...parsed.errors].slice(0, 50);
  const originCache = new Map<string, string | null>();
  const withinImport = new Set<string>();
  const candidates: {
    airportIata: string;
    destination: string;
    destinationEn: string | null;
    price: string;
  }[] = [];

  let skipped = 0;
  for (const row of parsed.rows) {
    const split = splitRoute(row.route);
    if (!split) {
      if (errors.length < 50) {
        errors.push({ line: row.line, raw: row.raw, message: '航线缺少“=”分隔的出发/目的地。' });
      }
      continue;
    }
    for (const origin of split.origins) {
      const iata = await resolveOrigin(origin, originCache);
      if (!iata) {
        if (errors.length < 50) {
          errors.push({
            line: row.line,
            raw: row.raw,
            message: `找不到出发城市「${origin}」对应的机场（可改用 IATA 代码）。`,
          });
        }
        continue;
      }
      for (const destination of split.destinations) {
        if ([...destination].length < 2 || [...destination].length > 60) {
          if (errors.length < 50) {
            errors.push({ line: row.line, raw: row.raw, message: `目的地「${destination}」长度无效。` });
          }
          continue;
        }
        const price = row.price.toFixed(2);
        const key = `${iata}|${destination}|${price}|${defaults.value.currency}|${defaults.value.taxIncluded}`;
        if (withinImport.has(key)) {
          skipped += 1;
          continue;
        }
        withinImport.add(key);
        // Hard cap keeps one paste from becoming an accidental mass insert.
        if (candidates.length >= 5000) {
          errors.push({ line: row.line, raw: row.raw, message: '单次导入最多 5000 条报价，已截断。' });
          break;
        }
        candidates.push({
          airportIata: iata,
          destination,
          destinationEn: DESTINATION_EN[destination] ?? null,
          price,
        });
      }
    }
  }

  // Skip routes that already exist for this airline at the same price/tax flag.
  const existingRows = await query<{
    airport_iata: string;
    destination: string;
    price: string;
    currency: string;
    tax_included: boolean;
  }>(
    `select airport_iata, destination, price::text as price, currency, tax_included
       from deals
      where airline = $1 and status = 'visible' and expires_at > now()`,
    [defaults.value.airline]
  );
  const existing = new Set(
    existingRows.map(
      (row) =>
        `${row.airport_iata}|${row.destination}|${Number(row.price).toFixed(2)}|${row.currency}|${row.tax_included}`
    )
  );
  const fresh = candidates.filter((row) => {
    const key = `${row.airportIata}|${row.destination}|${row.price}|${defaults.value.currency}|${defaults.value.taxIncluded}`;
    if (existing.has(key)) {
      skipped += 1;
      return false;
    }
    return true;
  });

  const sample = fresh
    .slice(0, 8)
    .map((row) => ({ ...row, price: Number(row.price) }));

  if (options.dryRun || fresh.length === 0) {
    return {
      dryRun: options.dryRun,
      batchId: null,
      created: fresh.length,
      skipped,
      totalRows: parsed.rows.length,
      errors,
      sample,
    };
  }

  const batchId = randomUUID();
  let created = 0;
  const chunkSize = 100;
  // The public list sorts by created_at DESC, then id DESC. Inserting the
  // pasted rows back-to-front therefore makes the *first* row of the pasted
  // table the newest, so a price table opens on its cheapest line instead of
  // on whichever row happened to be inserted last.
  const insertOrder = [...fresh].reverse();
  await withTransaction(async (client) => {
    for (let start = 0; start < insertOrder.length; start += chunkSize) {
      const chunk = insertOrder.slice(start, start + chunkSize);
      const values: unknown[] = [];
      // 22 columns per row, matching the list below.
      const placeholders = chunk.map((row, index) => {
        const base = index * 22;
        values.push(
          row.airportIata,
          row.destination,
          row.destinationEn,
          defaults.value.airline,
          defaults.value.airlineEn,
          row.price,
          defaults.value.currency,
          defaults.value.cabin,
          defaults.value.tripType,
          null, // travel_from
          null, // travel_to
          defaults.value.bookingUrl,
          defaults.value.notes,
          defaults.value.notesEn,
          'visible',
          options.admin.id,
          options.admin.name.slice(0, 80),
          null, // ip_hash
          defaults.value.expiresAt,
          defaults.value.taxIncluded,
          defaults.value.isOfficial,
          batchId
        );
        return `(${Array.from({ length: 22 }, (_, offset) => `$${base + offset + 1}`).join(',')})`;
      });
      const result = await client.query(
        `insert into deals (airport_iata, destination, destination_en, airline, airline_en,
                            price, currency, cabin, trip_type, travel_from, travel_to,
                            booking_url, notes, notes_en, status, user_id, submitter_name,
                            ip_hash, expires_at, tax_included, is_official, batch_id)
         values ${placeholders.join(',')}`,
        values
      );
      created += result.rowCount ?? 0;
    }
  });

  return {
    dryRun: false,
    batchId,
    created,
    skipped,
    totalRows: parsed.rows.length,
    errors,
    sample,
  };
}
