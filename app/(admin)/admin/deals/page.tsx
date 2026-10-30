import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminDealsClient from '@/components/admin/AdminDealsClient';
import LogoutButton from '@/components/auth/LogoutButton';
import { getCurrentUser } from '@/lib/auth';
import { isAdminConfigured, isAdminEmail } from '@/lib/admin';
import { listAdminDeals } from '@/lib/admin-deals';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '特惠机票管理',
  robots: { index: false, follow: false },
};

/**
 * Deal manager. The page itself is the auth boundary for the UI; every API
 * call re-checks the same allowlist, so hiding the page is not what protects
 * the data.
 */
export default async function AdminDealsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent('/admin/deals')}`);
  }

  const configured = isAdminConfigured();
  const allowed = isAdminEmail(user.email);
  const initial = allowed ? await listAdminDeals({ limit: 50 }) : null;

  return (
    <>
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <b className="font-display text-[17px] font-bold tracking-[0.01em]">
              特惠机票管理
            </b>
            <span className="text-[12px] text-white/50">/admin/deals</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[12.5px]">
            <span className="text-white/70">
              {user.name}
              {user.email ? ` · ${user.email}` : ''}
            </span>
            <Link
              className="border border-white/25 px-3 py-1.5 text-white/85 transition-colors hover:border-amber hover:text-amber"
              href="/"
            >
              返回网站
            </Link>
            <LogoutButton
              locale="zh"
              label="退出登录"
              pendingLabel="退出中…"
              redirectTo="/"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        {allowed && initial ? (
          <AdminDealsClient
            initialDeals={initial.deals}
            initialTotal={initial.total}
            adminName={user.name}
          />
        ) : (
          <div className="max-w-[720px] border border-line bg-card p-6 [box-shadow:var(--shadow-sm)]">
            <h1 className="font-display text-[20px] font-bold text-ink-heading">
              {configured ? '当前账号没有管理权限' : '管理后台尚未启用'}
            </h1>
            {configured ? (
              <p className="mt-3 text-[13.5px] leading-[1.8] text-ink-soft">
                当前登录账号
                {user.email ? `（${user.email}）` : ''}
                不在 <code className="bg-paper px-1">ADMIN_EMAILS</code> 中。请让管理员把该邮箱加入
                <code className="mx-1 bg-paper px-1">.env.local</code> 后重启服务。
              </p>
            ) : (
              <>
                <p className="mt-3 text-[13.5px] leading-[1.8] text-ink-soft">
                  需要在 <code className="bg-paper px-1">.env.local</code> 中配置允许进入的
                  Google 邮箱，服务重启后生效：
                </p>
                <pre className="mt-3 overflow-x-auto border border-line bg-paper p-3 text-[12px] text-ink">
{`ADMIN_EMAILS=you@example.com,partner@example.com`}
                </pre>
              </>
            )}
            <Link className="section-more mt-5 inline-flex" href="/">
              返回首页
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
