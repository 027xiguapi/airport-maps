import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { commentThreadKey } from '@/lib/comment-labels';
import { query, queryOne } from '@/lib/db';
import { PUBLISHED_LOCALES } from '@/lib/i18n/catalogs';
import { isLocale, type Locale } from '@/lib/i18n/config';

/**
 * Reader comments (db/schema.ts → `comments`).
 *
 * A thread is the triple (kind, key, locale), mirroring the page a reader was
 * on: the same airport has one conversation per language version rather than
 * one mixed-language thread. These helpers are server-only — the browser talks
 * to /api/comments and never imports this module.
 */

/** Page kinds eligible for a comment thread. */
export const COMMENT_KINDS = ['airport', 'country', 'blog', 'page'] as const;
export type CommentKind = (typeof COMMENT_KINDS)[number];

/** Static Markdown pages that carry a thread (kind='page'). */
export const COMMENT_PAGE_SLUGS = ['about', 'contact', 'sources', 'privacy', 'terms'] as const;
export type CommentPageSlug = (typeof COMMENT_PAGE_SLUGS)[number];

/** Mirrors the `comments_author_len_chk` constraint (display-name snapshot). */
export const MAX_AUTHOR_LENGTH = 40;
export const MAX_BODY_LENGTH = 2000;
export const MIN_BODY_LENGTH = 5;

/** How many comments one thread sends to the browser. */
const THREAD_LIMIT = 200;
/** Submissions allowed per IP in this window, across every thread. */
const RATE_WINDOW_MINUTES = 10;
const RATE_LIMIT = 5;
/** Submissions allowed per signed-in account in the same window. */
const USER_RATE_LIMIT = 10;
/** A repeated submission inside this window is treated as a double click. */
const DUPLICATE_WINDOW_MINUTES = 2;

export type PublicComment = {
  id: number;
  author: string;
  /** Google avatar of the author, when the account still exists. */
  picture: string | null;
  body: string;
  /** ISO 8601, so the browser can format it in the reader's time zone. */
  createdAt: string;
};

/** The signed-in author a comment is attributed to. */
export type CommentAuthor = {
  userId: number;
  name: string;
  picture: string | null;
};

export type CommentThread = {
  kind: CommentKind;
  key: string;
  locale: Locale;
};

export function isCommentKind(value: unknown): value is CommentKind {
  return typeof value === 'string' && (COMMENT_KINDS as readonly string[]).includes(value);
}

/**
 * Normalises a page key for its kind, returning null when the shape is wrong.
 * Airport codes and country codes are case-insensitive on input and stored
 * upper case; blog and page slugs are lower case.
 */
export function normalizePageKey(kind: CommentKind, value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  if (kind === 'airport') {
    const key = raw.toUpperCase();
    return /^[A-Z]{3}$/.test(key) ? key : null;
  }
  if (kind === 'country') {
    const key = raw.toUpperCase();
    return /^[A-Z]{2}$/.test(key) ? key : null;
  }
  if (kind === 'blog') {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw) && raw.length <= 120 ? raw : null;
  }
  return (COMMENT_PAGE_SLUGS as readonly string[]).includes(raw) ? raw : null;
}

/** Only locales whose pages are actually served can host a thread. */
export function normalizeCommentLocale(value: unknown): Locale | null {
  if (typeof value !== 'string' || !isLocale(value)) return null;
  return PUBLISHED_LOCALES.includes(value) ? value : null;
}

/**
 * The page really exists, so a typo in the API cannot create a thread that no
 * page will ever display. Static pages are already pinned by the slug list.
 */
export async function commentPageExists(kind: CommentKind, key: string): Promise<boolean> {
  if (kind === 'airport') {
    return !!(await queryOne<{ ok: number }>('select 1 as ok from airports where iata = $1', [key]));
  }
  if (kind === 'country') {
    return !!(await queryOne<{ ok: number }>('select 1 as ok from countries where code = $1', [key]));
  }
  if (kind === 'blog') {
    return existsSync(join(process.cwd(), 'public', 'blog', key));
  }
  return true;
}

/** Client address for rate limiting, never stored in the clear. */
export function commentIpHash(ip: string): string {
  const salt = process.env.COMMENTS_IP_SALT ?? 'airport-maps-comments';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/** Strips control characters and collapses runaway blank lines / trailing space. */
function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type CommentDraft = { body: string };

export type CommentValidation =
  | { ok: true; draft: CommentDraft }
  | { ok: false; error: 'invalid_body' };

/**
 * Length-checks a submission and returns the body as it will be stored. The
 * author is no longer part of the payload: the API derives it from the Google
 * session, so nobody can post under another person's name.
 */
export function validateCommentBody(body: unknown): CommentValidation {
  const cleanBody = cleanText(body);
  // Count by code point so a 2000-character CJK comment is not rejected for
  // being "4000" UTF-16 units.
  const length = [...cleanBody].length;
  if (length < MIN_BODY_LENGTH || length > MAX_BODY_LENGTH) {
    return { ok: false, error: 'invalid_body' };
  }

  return { ok: true, draft: { body: cleanBody } };
}

/** Display name snapshot, cleaned and cut to the column's 40 code points. */
export function commentAuthorName(name: string): string {
  const cleaned = cleanText(name).replace(/\s+/g, ' ');
  return [...cleaned].slice(0, MAX_AUTHOR_LENGTH).join('') || 'Traveler';
}

type CommentRow = {
  id: number;
  author: string;
  picture: string | null;
  body: string;
  created_at: Date;
};

function toPublicComment(row: CommentRow): PublicComment {
  return {
    id: row.id,
    author: row.author,
    picture: row.picture,
    createdAt: row.created_at.toISOString(),
    body: row.body,
  };
}

/** Visible comments for a thread, oldest first — the order people read replies in. */
export async function listComments(thread: CommentThread): Promise<PublicComment[]> {
  // Take the *latest* THREAD_LIMIT rows, then restore reading order: ordering
  // ascending before the LIMIT would pin the thread to its first 200 comments
  // and hide everything posted afterwards.
  const rows = await query<CommentRow>(
    `select id, author, picture, body, created_at
       from (
         select c.id, c.author, u.picture, c.body, c.created_at
           from comments c
           left join users u on u.id = c.user_id
          where c.page_kind = $1 and c.page_key = $2 and c.locale = $3
            and c.status = 'visible'
          order by c.created_at desc, c.id desc
          limit $4
       ) latest
      order by created_at asc, id asc`,
    [thread.kind, thread.key, thread.locale, THREAD_LIMIT]
  );
  return rows.map(toPublicComment);
}

/** Total visible comments in a thread, independent of the per-request limit. */
export async function countComments(thread: CommentThread): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count
       from comments
      where page_kind = $1 and page_key = $2 and locale = $3 and status = 'visible'`,
    [thread.kind, thread.key, thread.locale]
  );
  return Number(row?.count ?? 0);
}

/**
 * Visible-comment counts for many pages at once — one query for the homepage's
 * journal, map and guide cards. Threads with no comments are absent from the
 * result, so callers read with `?? 0`.
 *
 * A missing table (a deployment that has not run the comments migration yet)
 * must not take the homepage down, so a failed count degrades to zero rather
 * than rejecting the page render.
 */
export async function getCommentCounts(
  locale: Locale,
  pages: readonly { kind: CommentKind; key: string }[]
): Promise<Record<string, number>> {
  if (pages.length === 0) return {};

  try {
    const rows = await query<{ page_kind: CommentKind; page_key: string; count: string }>(
      `select page_kind, page_key, count(*)::text as count
         from comments
        where locale = $1 and status = 'visible'
          and (page_kind, page_key) in (
            select kind, key from unnest($2::text[], $3::text[]) as t(kind, key)
          )
        group by page_kind, page_key`,
      [locale, pages.map((page) => page.kind), pages.map((page) => page.key)]
    );

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[commentThreadKey(row.page_kind, row.page_key)] = Number(row.count);
    }
    return counts;
  } catch (error) {
    console.error('[comments] count query failed', error);
    return {};
  }
}

/** True when this address has posted too often in the recent window. */
export async function isCommentRateLimited(ipHash: string): Promise<boolean> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count
       from comments
      where ip_hash = $1 and created_at > now() - ($2 || ' minutes')::interval`,
    [ipHash, RATE_WINDOW_MINUTES]
  );
  return Number(row?.count ?? 0) >= RATE_LIMIT;
}

/** True when this account has posted too often in the recent window. */
export async function isCommentUserRateLimited(userId: number): Promise<boolean> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count
       from comments
      where user_id = $1 and created_at > now() - ($2 || ' minutes')::interval`,
    [userId, RATE_WINDOW_MINUTES]
  );
  return Number(row?.count ?? 0) >= USER_RATE_LIMIT;
}

/**
 * Inserts a comment, or returns the one a double click just created. Both
 * branches return a public row so the browser can append it immediately.
 * `author` is derived from the session by the API, never from the payload.
 */
export async function createComment(
  thread: CommentThread,
  draft: CommentDraft,
  author: CommentAuthor,
  ipHash: string
): Promise<PublicComment> {
  const duplicate = await queryOne<CommentRow>(
    `select c.id, c.author, u.picture, c.body, c.created_at
       from comments c
       left join users u on u.id = c.user_id
      where c.page_kind = $1 and c.page_key = $2 and c.locale = $3
        and c.user_id = $4 and c.body = $5 and c.status = 'visible'
        and c.created_at > now() - ($6 || ' minutes')::interval
      order by c.created_at desc
      limit 1`,
    [
      thread.kind,
      thread.key,
      thread.locale,
      author.userId,
      draft.body,
      DUPLICATE_WINDOW_MINUTES,
    ]
  );
  if (duplicate) return toPublicComment(duplicate);

  const inserted = await queryOne<{
    id: number;
    author: string;
    body: string;
    created_at: Date;
  }>(
    `insert into comments (page_kind, page_key, locale, user_id, author, body, ip_hash)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, author, body, created_at`,
    [
      thread.kind,
      thread.key,
      thread.locale,
      author.userId,
      commentAuthorName(author.name),
      draft.body,
      ipHash,
    ]
  );
  if (!inserted) throw new Error('insert into comments returned no row');
  return toPublicComment({ ...inserted, picture: author.picture });
}
