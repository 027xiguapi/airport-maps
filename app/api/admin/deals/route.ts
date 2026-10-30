import { NextResponse } from 'next/server';
import {
  createAdminDeal,
  deleteAdminBatch,
  deleteAdminDeals,
  importAdminDeals,
  listAdminDeals,
  updateAdminDeal,
  validateAdminDealInput,
  type ImportDefaults,
} from '@/lib/admin-deals';
import { getAdminUser, isAdminConfigured } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth';
import { isSameOrigin } from '@/lib/http';

/**
 * Administrator deal API.
 *
 *   GET    /api/admin/deals?q=&status=&batch=&limit=&offset=
 *   POST   /api/admin/deals { mode: 'single', deal }
 *                          { mode: 'import', text, defaults, dryRun }
 *   PATCH  /api/admin/deals { id, deal }
 *   DELETE /api/admin/deals { ids: number[] } | { batchId: string }
 *
 * Only Google accounts listed in ADMIN_EMAILS pass the guard. The public deal
 * API is a separate route and never sees hidden/expired rows.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function forbiddenOrigin() {
  return NextResponse.json(
    {
      error: 'forbidden_origin',
      hint: '请求 Origin 与服务端识别的 Host 不一致；检查反向代理是否转发 Host / X-Forwarded-Host。',
    },
    { status: 403, headers: NO_STORE }
  );
}

async function guard(): Promise<
  { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> } | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'sign_in_required' },
        { status: 401, headers: NO_STORE }
      ),
    };
  }
  if (!isAdminConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'admin_not_configured' },
        { status: 503, headers: NO_STORE }
      ),
    };
  }
  if (!(await getAdminUser())) {
    // The most common cause is a Google account that differs from the one in
    // ADMIN_EMAILS (typo, alias, or a different test account). Return the
    // signed-in email — it is the caller's own address — so the mismatch can
    // be fixed without guessing. The allowlist itself is never exposed.
    console.warn('[admin] forbidden', { email: user.email });
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'forbidden',
          signedInAs: user.email,
          hint: '当前登录邮箱不在 ADMIN_EMAILS 中；修改环境变量后重启服务再试。',
        },
        { status: 403, headers: NO_STORE }
      ),
    };
  }
  return { ok: true, user };
}

/** JSON body with a hard size ceiling (imports are the largest payload). */
async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return null;
  }
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > 400_000) return null;
  try {
    const parsed: unknown = await request.json();
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.startsWith('airport_not_found')) {
    return NextResponse.json(
      { error: 'airport_not_found', message: '出发机场不在机场库中。' },
      { status: 400, headers: NO_STORE }
    );
  }
  console.error('[api/admin/deals] failed', error);
  return NextResponse.json({ error: 'admin_deals_unavailable' }, { status: 503, headers: NO_STORE });
}

export async function GET(request: Request) {
  const auth = await guard();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  try {
    const result = await listAdminDeals({
      q: (searchParams.get('q') ?? '').slice(0, 80),
      status: searchParams.get('status'),
      batch: searchParams.get('batch'),
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0,
    });
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const auth = await guard();
  if (!auth.ok) return auth.response;
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE });
  }

  try {
    if (body.mode === 'import') {
      const text = typeof body.text === 'string' ? body.text : '';
      if (!text.trim()) {
        return NextResponse.json({ error: 'empty_import' }, { status: 400, headers: NO_STORE });
      }
      const defaults = (body.defaults ?? {}) as ImportDefaults;
      const result = await importAdminDeals({
        text,
        defaults,
        admin: auth.user,
        dryRun: body.dryRun === true,
      });
      return NextResponse.json(result, { status: 200, headers: NO_STORE });
    }

    const deal = body.deal;
    if (!deal || typeof deal !== 'object' || Array.isArray(deal)) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE });
    }
    const validation = validateAdminDealInput(deal as Record<string, unknown>);
    if (!validation.ok) {
      return NextResponse.json(
        { error: 'invalid_deal', message: validation.message },
        { status: 400, headers: NO_STORE }
      );
    }
    const created = await createAdminDeal(validation.draft, auth.user);
    return NextResponse.json({ ok: true, deal: created }, { status: 201, headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await guard();
  if (!auth.ok) return auth.response;
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE });
  }

  const id = Number(body.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400, headers: NO_STORE });
  }
  const deal = body.deal;
  if (!deal || typeof deal !== 'object' || Array.isArray(deal)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE });
  }

  try {
    const validation = validateAdminDealInput(deal as Record<string, unknown>);
    if (!validation.ok) {
      return NextResponse.json(
        { error: 'invalid_deal', message: validation.message },
        { status: 400, headers: NO_STORE }
      );
    }
    const updated = await updateAdminDeal(id, validation.draft);
    if (!updated) {
      return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json({ ok: true, deal: updated }, { status: 200, headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await guard();
  if (!auth.ok) return auth.response;
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE });
  }

  try {
    if (typeof body.batchId === 'string' && body.batchId.trim()) {
      const deleted = await deleteAdminBatch(body.batchId.trim());
      return NextResponse.json({ ok: true, deleted }, { headers: NO_STORE });
    }
    const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
    const deleted = await deleteAdminDeals(ids);
    return NextResponse.json({ ok: true, deleted }, { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}
