'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminDeal } from '@/lib/admin-deals';

type Props = {
  /** Null creates a new row; a row edits it in place. */
  deal: AdminDeal | null;
  onClose: () => void;
  onSaved: (deal: AdminDeal) => void;
};

const FIELD_LABEL =
  'mb-1.5 block font-display text-[11px] uppercase tracking-[0.12em] text-ink-faint';
const FIELD_CLASSES =
  'h-[40px] w-full rounded-[8px] border border-input bg-card px-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20';

function todayPlus(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Create/edit dialog for one deal. The form posts the same field names the
 * public submission form uses, plus the admin-only flags; the server validates
 * everything again (lib/admin-deals.ts).
 */
export default function AdminDealForm({ deal, onClose, onSaved }: Props) {
  const [form, setForm] = useState(() => ({
    airportIata: deal?.airportIata ?? '',
    destination: deal?.destination ?? '',
    destinationEn: deal?.destinationEn ?? '',
    airline: deal?.airline ?? '',
    airlineEn: deal?.airlineEn ?? '',
    price: deal ? String(deal.price) : '',
    currency: deal?.currency ?? 'CNY',
    cabin: deal?.cabin ?? 'economy',
    tripType: deal?.tripType ?? 'roundtrip',
    travelFrom: deal?.travelFrom ?? '',
    travelTo: deal?.travelTo ?? '',
    bookingUrl: deal?.bookingUrl ?? '',
    notes: deal?.notes ?? '',
    notesEn: deal?.notesEn ?? '',
    status: deal?.status ?? 'visible',
    taxIncluded: deal?.taxIncluded ?? false,
    isOfficial: deal?.isOfficial ?? true,
    expiresAt: deal ? deal.expiresAt.slice(0, 10) : todayPlus(30),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/deals', {
        method: deal ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          deal ? { id: deal.id, deal: form } : { mode: 'single', deal: form }
        ),
      });
      const data = (await response.json().catch(() => ({}))) as {
        deal?: AdminDeal;
        message?: string;
        error?: string;
      };
      if (response.status === 401) {
        window.location.href = '/login?next=%2Fadmin%2Fdeals';
        return;
      }
      if (!response.ok || !data.deal) {
        setError(data.message ?? (response.status === 403 ? '没有管理权限。' : '保存失败，请重试。'));
        return;
      }
      onSaved(data.deal);
    } catch {
      setError('保存失败，请重试。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-navy-950/50 p-4">
      <form
        className="my-6 w-full max-w-[860px] border border-line bg-card p-5 [box-shadow:var(--shadow-lg)]"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[18px] font-bold text-ink-heading">
              {deal ? `编辑 #${deal.id}` : '新增特惠机票'}
            </h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              官方票价会以「官方票价」展示；不含税会在卡片上标注。
            </p>
          </div>
          <button
            type="button"
            className="border border-line px-2.5 py-1 text-[12px] text-ink-soft transition-colors hover:border-ink-faint"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-airport">
              出发机场 IATA
            </label>
            <Input
              id="admin-airport"
              className={FIELD_CLASSES}
              value={form.airportIata}
              onChange={(event) => update('airportIata', event.target.value.toUpperCase())}
              placeholder="PEK"
              maxLength={3}
              required
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-destination">
              目的地
            </label>
            <Input
              id="admin-destination"
              className={FIELD_CLASSES}
              value={form.destination}
              onChange={(event) => update('destination', event.target.value)}
              placeholder="台北"
              maxLength={60}
              required
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-destination-en">
              英文目的地（可选，英文页主文案）
            </label>
            <Input
              id="admin-destination-en"
              className={FIELD_CLASSES}
              value={form.destinationEn}
              onChange={(event) => update('destinationEn', event.target.value)}
              placeholder="Kaohsiung"
              maxLength={60}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-airline">
              航空公司
            </label>
            <Input
              id="admin-airline"
              className={FIELD_CLASSES}
              value={form.airline}
              onChange={(event) => update('airline', event.target.value)}
              placeholder="国泰航空"
              maxLength={60}
              required
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-airline-en">
              英文航空公司（可选，英文页主文案）
            </label>
            <Input
              id="admin-airline-en"
              className={FIELD_CLASSES}
              value={form.airlineEn}
              onChange={(event) => update('airlineEn', event.target.value)}
              placeholder="Cathay Pacific"
              maxLength={60}
            />
          </div>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <div>
              <label className={FIELD_LABEL} htmlFor="admin-price">
                价格
              </label>
              <Input
                id="admin-price"
                className={FIELD_CLASSES}
                value={form.price}
                onChange={(event) => update('price', event.target.value)}
                placeholder="540"
                inputMode="decimal"
                required
              />
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="admin-currency">
                币种
              </label>
              <Input
                id="admin-currency"
                className={FIELD_CLASSES}
                value={form.currency}
                onChange={(event) => update('currency', event.target.value.toUpperCase())}
                maxLength={3}
                required
              />
            </div>
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-cabin">
              舱位
            </label>
            <select
              id="admin-cabin"
              className={FIELD_CLASSES}
              value={form.cabin}
              onChange={(event) => update('cabin', event.target.value as typeof form.cabin)}
            >
              <option value="economy">经济舱</option>
              <option value="premium">超级经济舱</option>
              <option value="business">商务舱</option>
              <option value="first">头等舱</option>
            </select>
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-trip">
              行程类型
            </label>
            <select
              id="admin-trip"
              className={FIELD_CLASSES}
              value={form.tripType}
              onChange={(event) =>
                update('tripType', event.target.value as typeof form.tripType)
              }
            >
              <option value="roundtrip">往返</option>
              <option value="oneway">单程</option>
            </select>
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-from">
              去程 / 起始日期
            </label>
            <Input
              id="admin-from"
              type="date"
              className={FIELD_CLASSES}
              value={form.travelFrom}
              onChange={(event) => update('travelFrom', event.target.value)}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-to">
              返程 / 截止日期
            </label>
            <Input
              id="admin-to"
              type="date"
              className={FIELD_CLASSES}
              value={form.travelTo}
              onChange={(event) => update('travelTo', event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={FIELD_LABEL} htmlFor="admin-booking">
              订票链接（可选）
            </label>
            <Input
              id="admin-booking"
              className={FIELD_CLASSES}
              value={form.bookingUrl}
              onChange={(event) => update('bookingUrl', event.target.value)}
              placeholder="https://…（官方票价卡可以留空）"
              maxLength={600}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={FIELD_LABEL} htmlFor="admin-notes">
              备注
            </label>
            <textarea
              id="admin-notes"
              className="block min-h-[72px] w-full resize-y rounded-[8px] border border-input bg-card px-3 py-2 text-[13.5px] leading-[1.7] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="单人往返不含税机票卡；价格不含税费，实际以出票为准。"
              maxLength={600}
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={FIELD_LABEL} htmlFor="admin-notes-en">
              英文备注（可选，英文页主文案）
            </label>
            <textarea
              id="admin-notes-en"
              className="block min-h-[60px] w-full resize-y rounded-[8px] border border-input bg-card px-3 py-2 text-[13.5px] leading-[1.7] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
              value={form.notesEn}
              onChange={(event) => update('notesEn', event.target.value)}
              placeholder="Round-trip fare card per person, taxes excluded; taxes are extra and availability is confirmed at booking."
              maxLength={600}
              rows={2}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-expires">
              过期时间（列表截止）
            </label>
            <Input
              id="admin-expires"
              type="date"
              className={FIELD_CLASSES}
              value={form.expiresAt}
              onChange={(event) => update('expiresAt', event.target.value)}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="admin-status">
              状态
            </label>
            <select
              id="admin-status"
              className={FIELD_CLASSES}
              value={form.status}
              onChange={(event) => update('status', event.target.value as 'visible' | 'hidden')}
            >
              <option value="visible">公开</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={form.isOfficial}
              onChange={(event) => update('isOfficial', event.target.checked)}
            />
            官方票价（站点发布，不显示提交者）
          </label>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={form.taxIncluded}
              onChange={(event) => update('taxIncluded', event.target.checked)}
            />
            价格已含税（取消勾选则显示「不含税」）
          </label>
        </div>

        {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? '保存中…' : deal ? '保存修改' : '创建'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
