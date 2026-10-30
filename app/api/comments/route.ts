import { NextResponse } from 'next/server';
import {
  commentIpHash,
  commentPageExists,
  countComments,
  createComment,
  isCommentKind,
  isCommentRateLimited,
  isCommentUserRateLimited,
  listComments,
  normalizeCommentLocale,
  normalizePageKey,
  validateCommentBody,
} from '@/lib/comments';
import { getCurrentUser } from '@/lib/auth';
import { isSameOrigin } from '@/lib/http';

/**
 * Public comment endpoint.
 *
 *   GET  /api/comments?kind=airport&key=JFK&locale=en
 *   POST /api/comments  { kind, key, locale, body, website }
 *
 * Posting requires a Google session: the author's name and avatar come from
 * the account, never from the request, so a comment cannot be posted under
 * somebody else's name. Reading is public. Rows written before sign-in was
 * required keep their old nickname and simply have no avatar.
 *
 * `website` is a honeypot: it is hidden in the form and must stay empty. The
 * handler answers a filled honeypot with the same success shape as a real post
 * but writes nothing, so bots do not learn which field tripped them.
 *
 * Moderation is deliberately not exposed here — only rows with status
 * 'visible' are ever returned, and hiding a comment is a database operation
 * (scripts/comments.mjs).
 */

// pg needs the Node.js runtime; the default, but stated so an edge
// misconfiguration fails at build time rather than on the first request.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400, headers: NO_STORE });
}

/** First hop of X-Forwarded-For, with the usual proxy fallbacks. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || '0.0.0.0';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind');
  const locale = normalizeCommentLocale(searchParams.get('locale'));

  if (!isCommentKind(kind) || !locale) return badRequest('invalid_page');
  const key = normalizePageKey(kind, searchParams.get('key'));
  if (!key) return badRequest('invalid_page');

  try {
    const [comments, total] = await Promise.all([
      listComments({ kind, key, locale }),
      countComments({ kind, key, locale }),
    ]);
    return NextResponse.json({ comments, total }, { headers: NO_STORE });
  } catch (error) {
    console.error('[api/comments] list failed', error);
    return NextResponse.json(
      { error: 'comments_unavailable' },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  // The form sends JSON; refusing other content types keeps a cross-site
  // <form> post (which cannot set application/json without a preflight) away.
  if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { error: 'unsupported_media_type' },
      { status: 415, headers: NO_STORE }
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE });
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > 10_000) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413, headers: NO_STORE });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await request.json();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    // Malformed JSON is handled by the null check below.
  }
  if (!payload) return badRequest('invalid_request');

  // Honeypot — accepted silently, never stored.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return NextResponse.json({ ok: true, comment: null }, { status: 202, headers: NO_STORE });
  }

  // The author is the signed-in Google account, not a form field. Checked
  // before validating the body so an anonymous post gets a clear 401 the
  // client can turn into a sign-in prompt.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'sign_in_required' },
      { status: 401, headers: NO_STORE }
    );
  }

  const kind = payload.kind;
  const locale = normalizeCommentLocale(payload.locale);
  if (!isCommentKind(kind) || !locale) return badRequest('invalid_page');
  const key = normalizePageKey(kind, payload.key);
  if (!key) return badRequest('invalid_page');

  const validation = validateCommentBody(payload.body);
  if (!validation.ok) return badRequest(validation.error);

  // Two link-heavy comments are enough to make a thread look like a billboard.
  if ((validation.draft.body.match(/https?:\/\//gi) ?? []).length > 2) {
    return badRequest('invalid_body');
  }

  try {
    if (!(await commentPageExists(kind, key))) return badRequest('invalid_page');

    const ipHash = commentIpHash(clientIp(request));
    const [ipLimited, userLimited] = await Promise.all([
      isCommentRateLimited(ipHash),
      isCommentUserRateLimited(user.id),
    ]);
    if (ipLimited || userLimited) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { ...NO_STORE, 'Retry-After': '600' } }
      );
    }

    const comment = await createComment(
      { kind, key, locale },
      validation.draft,
      { userId: user.id, name: user.name, picture: user.picture },
      ipHash
    );
    return NextResponse.json({ ok: true, comment }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error('[api/comments] create failed', error);
    return NextResponse.json(
      { error: 'comments_unavailable' },
      { status: 503, headers: NO_STORE }
    );
  }
}
