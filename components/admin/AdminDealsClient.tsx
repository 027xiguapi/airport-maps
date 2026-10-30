'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminDealForm from '@/components/admin/AdminDealForm';
import AdminImportPanel from '@/components/admin/AdminImportPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminDeal, ImportResult } from '@/lib/admin-deals';

type Props = {
  initialDeals: AdminDeal[];
  initialTotal: number;
  adminName: string;
};

const PAGE_SIZE = 50;

const DATE_FORMAT = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai',
});
const PRICE_FORMAT = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });

function formatDate(value: string): string {
  try {
    return DATE_FORMAT.format(new Date(value));
  } catch {
    return value;
  }
}

function statusText(status: 'visible' | 'hidden'): string {
  return status === 'visible' ? '公开' : '隐藏';
}

/**
 * Admin deal table plus its edit/import dialogs. The server page renders the
 * first page for a fast load; every filter change, save and delete refetches
 * the same API, which is the single source of truth.
 */
export default function AdminDealsClient({ initialDeals, initialTotal, adminName }: Props) {
  const [deals, setDeals] = useState<AdminDeal[]>(initialDeals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<AdminDeal | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (search) params.set('q', search);
    if (status) params.set('status', status);
    if (batch.trim()) params.set('batch', batch.trim());

    try {
      const response = await fetch(`/api/admin/deals?${params.toString()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 401) {
        window.location.href = '/login?next=%2Fadmin%2Fdeals';
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        deals?: AdminDeal[];
        total?: number;
        error?: string;
      };
      if (!response.ok || !Array.isArray(data.deals)) {
        setNotice({ tone: 'error', text: '加载失败，请稍后重试。' });
        return;
      }
      setDeals(data.deals);
      setTotal(typeof data.total === 'number' ? data.total : data.deals.length);
      setSelected(new Set());
    } catch {
      setNotice({ tone: 'error', text: '加载失败，请检查网络。' });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, batch]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const refresh = () => setReloadToken((value) => value + 1);

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = deals.length > 0 && deals.every((deal) => selected.has(deal.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(deals.map((deal) => deal.id)));

  const toggleStatus = async (deal: AdminDeal) => {
    if (busyId) return;
    setBusyId(deal.id);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: deal.id,
          deal: { ...deal, status: deal.status === 'visible' ? 'hidden' : 'visible' },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setNotice({ tone: 'error', text: data.message ?? '状态修改失败。' });
        return;
      }
      setNotice({
        tone: 'ok',
        text: `#${deal.id} 已${deal.status === 'visible' ? '隐藏' : '公开'}。`,
      });
      refresh();
    } catch {
      setNotice({ tone: 'error', text: '状态修改失败。' });
    } finally {
      setBusyId(null);
    }
  };

  const removeIds = async (ids: number[], label: string) => {
    if (ids.length === 0) return;
    if (!window.confirm(`${label} ${ids.length} 条报价？此操作不可撤销。`)) return;
    try {
      const response = await fetch('/api/admin/deals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = (await response.json().catch(() => ({}))) as { deleted?: number };
      if (!response.ok) {
        setNotice({ tone: 'error', text: '删除失败，请稍后重试。' });
        return;
      }
      setNotice({ tone: 'ok', text: `已删除 ${data.deleted ?? ids.length} 条。` });
      setSelected(new Set());
      if (ids.length >= deals.length && page > 0) setPage((value) => value - 1);
      else refresh();
    } catch {
      setNotice({ tone: 'error', text: '删除失败。' });
    }
  };

  const removeBatch = async () => {
    if (!batch.trim()) return;
    if (!window.confirm('删除该批次导入的全部报价？此操作不可撤销。')) return;
    try {
      const response = await fetch('/api/admin/deals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ batchId: batch.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { deleted?: number };
      if (!response.ok) {
        setNotice({ tone: 'error', text: '删除批次失败。' });
        return;
      }
      setNotice({ tone: 'ok', text: `已删除该批次 ${data.deleted ?? 0} 条。` });
      setBatch('');
      setPage(0);
      refresh();
    } catch {
      setNotice({ tone: 'error', text: '删除批次失败。' });
    }
  };

  const onImported = (result: ImportResult) => {
    setImporting(false);
    setNotice({
      tone: 'ok',
      text: `导入完成：新增 ${result.created} 条，跳过重复 ${result.skipped} 条，${
        result.errors.length
      } 行有问题。批次 ${result.batchId?.slice(0, 8) ?? '—'}。`,
    });
    if (result.batchId) setBatch(result.batchId);
    setPage(0);
    refresh();
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[21px] font-bold text-ink-heading">特惠机票列表</h1>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            共 <b className="text-ink-heading">{total}</b> 条 · 当前管理员 {adminName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={refresh} disabled={loading}>
            {loading ? '加载中…' : '刷新'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setImporting(true)}>
            批量导入
          </Button>
          <Button type="button" onClick={() => setCreating(true)}>
            新增单条
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={`mt-4 border px-4 py-2.5 text-[13px] ${
            notice.tone === 'ok'
              ? 'border-sky-300 bg-sky-50 text-sky-700'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
          role="status"
        >
          {notice.text}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border border-line bg-card p-3">
        <Input
          className="h-[38px] w-[240px]"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索机场 / 目的地 / 航司"
          aria-label="搜索"
        />
        <select
          className="h-[38px] rounded-[8px] border border-input bg-card px-2.5 text-[13px] text-ink"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }}
          aria-label="状态筛选"
        >
          <option value="">全部状态</option>
          <option value="visible">公开</option>
          <option value="hidden">隐藏</option>
        </select>
        <Input
          className="h-[38px] w-[280px] font-mono text-[12px]"
          value={batch}
          onChange={(event) => {
            setBatch(event.target.value);
            setPage(0);
          }}
          placeholder="批次 ID（导入后自动填入）"
          aria-label="批次筛选"
        />
        {(search || status || batch) && (
          <button
            type="button"
            className="text-[12.5px] text-sky-600 underline-offset-2 hover:underline"
            onClick={() => {
              setQuery('');
              setSearch('');
              setStatus('');
              setBatch('');
              setPage(0);
            }}
          >
            清除筛选
          </button>
        )}
        {batch.trim() && (
          <button
            type="button"
            className="text-[12.5px] text-destructive underline-offset-2 hover:underline"
            onClick={removeBatch}
          >
            删除该批次
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border border-amber/40 bg-amber/10 px-4 py-2.5 text-[13px]">
          <span>
            已选 <b>{selected.size}</b> 条
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeIds([...selected], '删除选中')}
          >
            批量删除
          </Button>
          <button
            type="button"
            className="text-[12.5px] text-ink-soft underline-offset-2 hover:underline"
            onClick={() => setSelected(new Set())}
          >
            取消选择
          </button>
        </div>
      )}

      <div className="mt-3 overflow-x-auto border border-line bg-card">
        <table className="w-full min-w-[1180px] border-collapse text-[12.5px]">
          <thead className="bg-paper text-left text-ink-soft">
            <tr>
              <th className="w-[40px] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="全选本页"
                />
              </th>
              <th className="px-3 py-2.5 font-medium">ID</th>
              <th className="px-3 py-2.5 font-medium">出发</th>
              <th className="px-3 py-2.5 font-medium">目的地</th>
              <th className="px-3 py-2.5 font-medium">航司</th>
              <th className="px-3 py-2.5 font-medium">价格</th>
              <th className="px-3 py-2.5 font-medium">类型</th>
              <th className="px-3 py-2.5 font-medium">税</th>
              <th className="px-3 py-2.5 font-medium">官方</th>
              <th className="px-3 py-2.5 font-medium">状态</th>
              <th className="px-3 py-2.5 font-medium">批次</th>
              <th className="px-3 py-2.5 font-medium">创建时间</th>
              <th className="px-3 py-2.5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-ink-soft">
                  {loading ? '加载中…' : '没有符合条件的报价。'}
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr key={deal.id} className="align-top hover:bg-paper">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(deal.id)}
                      onChange={() => toggle(deal.id)}
                      aria-label={`选择 #${deal.id}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-ink-soft">{deal.id}</td>
                  <td className="px-3 py-2.5">
                    <b className="font-display text-[13px] text-ink-heading">{deal.airportIata}</b>
                    <span className="ml-1 text-ink-soft">{deal.airportCity}</span>
                  </td>
                  <td className="px-3 py-2.5 text-ink">{deal.destination}</td>
                  <td className="px-3 py-2.5 text-ink">{deal.airline}</td>
                  <td className="px-3 py-2.5 tabular-nums text-ink">
                    {PRICE_FORMAT.format(deal.price)}{' '}
                    <span className="text-[11px] text-ink-soft">{deal.currency}</span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-soft">
                    {deal.tripType === 'roundtrip' ? '往返' : '单程'} · {deal.cabin}
                  </td>
                  <td className="px-3 py-2.5">
                    {deal.taxIncluded ? (
                      <span className="text-ink-soft">含税</span>
                    ) : (
                      <span className="text-amber">不含税</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {deal.isOfficial ? (
                      <span className="border border-sky-300 bg-sky-50 px-1.5 py-[1px] text-[11px] text-sky-700">
                        官方
                      </span>
                    ) : (
                      <span className="text-ink-faint">用户</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        deal.status === 'visible'
                          ? 'text-sky-700'
                          : 'text-ink-faint'
                      }
                    >
                      {statusText(deal.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {deal.batchId ? (
                      <button
                        type="button"
                        className="font-mono text-[11.5px] text-sky-600 underline-offset-2 hover:underline"
                        title={deal.batchId}
                        onClick={() => {
                          setBatch(deal.batchId ?? '');
                          setPage(0);
                        }}
                      >
                        {deal.batchId.slice(0, 8)}
                      </button>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[11.5px] text-ink-faint">
                    {formatDate(deal.createdAt)}
                    <br />
                    到期 {formatDate(deal.expiresAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <button
                      type="button"
                      className="text-sky-600 underline-offset-2 hover:underline"
                      onClick={() => setEditing(deal)}
                    >
                      编辑
                    </button>
                    <span className="mx-1.5 text-line">|</span>
                    <button
                      type="button"
                      className="text-ink-soft underline-offset-2 hover:underline disabled:opacity-50"
                      onClick={() => toggleStatus(deal)}
                      disabled={busyId === deal.id}
                    >
                      {deal.status === 'visible' ? '隐藏' : '公开'}
                    </button>
                    <span className="mx-1.5 text-line">|</span>
                    <button
                      type="button"
                      className="text-destructive underline-offset-2 hover:underline"
                      onClick={() => removeIds([deal.id], '删除')}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-soft">
        <span>
          第 {page + 1} / {pageCount} 页 · 共 {total} 条
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            上一页
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page + 1 >= pageCount || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            下一页
          </Button>
        </div>
      </div>

      {(creating || editing) && (
        <AdminDealForm
          deal={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            setCreating(false);
            setEditing(null);
            setNotice({ tone: 'ok', text: `已保存 #${saved.id}。` });
            refresh();
          }}
        />
      )}

      {importing && (
        <AdminImportPanel onClose={() => setImporting(false)} onImported={onImported} />
      )}
    </div>
  );
}
