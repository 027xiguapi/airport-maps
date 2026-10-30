'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ImportResult } from '@/lib/admin-deals';

type Props = {
  onClose: () => void;
  onImported: (result: ImportResult) => void;
};

const FIELD_LABEL =
  'mb-1.5 block font-display text-[11px] uppercase tracking-[0.12em] text-ink-faint';
const FIELD_CLASSES =
  'h-[38px] w-full rounded-[8px] border border-input bg-card px-3 text-[13px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20';

function todayPlus(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Paste-import dialog. The textarea takes the two-column table straight out of
 * Excel (price, route), expands each row to one deal per origin × destination,
 * and shows a dry-run preview before anything is written.
 */
export default function AdminImportPanel({ onClose, onImported }: Props) {
  const [text, setText] = useState('');
  const [airline, setAirline] = useState('国泰航空');
  const [airlineEn, setAirlineEn] = useState('');
  const [currency, setCurrency] = useState('CNY');
  const [cabin, setCabin] = useState('economy');
  const [tripType, setTripType] = useState('roundtrip');
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [isOfficial, setIsOfficial] = useState(true);
  const [notes, setNotes] = useState(
    '单人往返不含税机票卡；价格不含税费，实际以出票和税费为准。'
  );
  const [notesEn, setNotesEn] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(todayPlus(30));
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaults = {
    airline,
    airlineEn,
    currency,
    cabin,
    tripType,
    taxIncluded,
    isOfficial,
    notes,
    notesEn,
    bookingUrl,
    expiresAt,
  };

  const run = async (dryRun: boolean) => {
    if (loading) return;
    if (!text.trim()) {
      setError('请先粘贴表格。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ mode: 'import', text, defaults, dryRun }),
      });
      const data = (await response.json().catch(() => ({}))) as ImportResult & {
        error?: string;
        message?: string;
      };
      if (response.status === 401) {
        window.location.href = '/login?next=%2Fadmin%2Fdeals';
        return;
      }
      if (!response.ok) {
        setError(data.message ?? '导入失败，请检查后重试。');
        return;
      }
      if (dryRun) {
        setPreview(data);
      } else {
        onImported(data);
      }
    } catch {
      setError('导入失败，请检查网络后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-navy-950/50 p-4">
      <div className="my-6 w-full max-w-[1000px] border border-line bg-card p-5 [box-shadow:var(--shadow-lg)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[18px] font-bold text-ink-heading">批量导入特惠机票</h2>
            <p className="mt-1 max-w-[760px] text-[12.5px] leading-[1.7] text-ink-soft">
              从 Excel 复制「价格 + 航线」两列粘贴到下面；可再加第三列「订票链接」，
              每行链接优先于下方的统一链接。每行会按出发城市 ×
              目的地展开；出发城市可写中文城市名或 IATA 代码，用
              <code className="mx-1 bg-paper px-1">/</code>
              分隔，起降之间用
              <code className="mx-1 bg-paper px-1">=</code>
              分隔。先「解析预览」检查，再「确认导入」。
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className={FIELD_LABEL} htmlFor="import-airline">
              航空公司
            </label>
            <Input
              id="import-airline"
              className={FIELD_CLASSES}
              value={airline}
              onChange={(event) => setAirline(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-[1fr_86px] gap-2">
            <div>
              <label className={FIELD_LABEL} htmlFor="import-currency">
                币种
              </label>
              <Input
                id="import-currency"
                className={FIELD_CLASSES}
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="import-expires">
                过期日
              </label>
              <Input
                id="import-expires"
                type="date"
                className={FIELD_CLASSES}
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={FIELD_LABEL} htmlFor="import-cabin">
                舱位
              </label>
              <select
                id="import-cabin"
                className={FIELD_CLASSES}
                value={cabin}
                onChange={(event) => setCabin(event.target.value)}
              >
                <option value="economy">经济舱</option>
                <option value="premium">超级经济舱</option>
                <option value="business">商务舱</option>
                <option value="first">头等舱</option>
              </select>
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="import-trip">
                行程
              </label>
              <select
                id="import-trip"
                className={FIELD_CLASSES}
                value={tripType}
                onChange={(event) => setTripType(event.target.value)}
              >
                <option value="roundtrip">往返</option>
                <option value="oneway">单程</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={FIELD_LABEL} htmlFor="import-notes">
              统一备注
            </label>
            <Input
              id="import-notes"
              className={FIELD_CLASSES}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={600}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="import-booking">
              统一订票链接（可选）
            </label>
            <Input
              id="import-booking"
              className={FIELD_CLASSES}
              value={bookingUrl}
              onChange={(event) => setBookingUrl(event.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={FIELD_LABEL} htmlFor="import-airline-en">
              英文航空公司（可选，英文页主文案）
            </label>
            <Input
              id="import-airline-en"
              className={FIELD_CLASSES}
              value={airlineEn}
              onChange={(event) => setAirlineEn(event.target.value)}
              placeholder="Cathay Pacific"
              maxLength={60}
            />
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor="import-notes-en">
              英文备注（可选，英文页主文案）
            </label>
            <Input
              id="import-notes-en"
              className={FIELD_CLASSES}
              value={notesEn}
              onChange={(event) => setNotesEn(event.target.value)}
              placeholder="Round-trip fare card per person, taxes excluded…"
              maxLength={600}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5 text-[12.5px] text-ink">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isOfficial}
              onChange={(event) => setIsOfficial(event.target.checked)}
            />
            官方票价
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={taxIncluded}
              onChange={(event) => setTaxIncluded(event.target.checked)}
            />
            价格已含税
          </label>
          <span className="text-ink-faint">默认按「不含税」导入，卡片会显示不含税标识。</span>
        </div>

        <textarea
          className="mt-4 block min-h-[220px] w-full resize-y rounded-[8px] border border-input bg-paper px-3 py-2 font-mono text-[12.5px] leading-[1.7] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setPreview(null);
          }}
          placeholder={`540\t杭州/宁波/南京/上海/温州/武汉=高雄/台北\n640\t成都/杭州/宁波/南京/上海/温州/武汉=曼谷\n1210\t厦门=布里斯班`}
          spellCheck={false}
        />

        {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => run(true)} disabled={loading}>
            {loading ? '处理中…' : '解析预览'}
          </Button>
          <Button type="button" onClick={() => run(false)} disabled={loading || !preview}>
            {loading ? '导入中…' : '确认导入'}
          </Button>
          {preview && (
            <span className="text-[12.5px] text-ink-soft">
              将新增 <b className="text-ink-heading">{preview.created}</b> 条，跳过重复{' '}
              <b className="text-ink-heading">{preview.skipped}</b> 条，问题{' '}
              <b className="text-ink-heading">{preview.errors.length}</b> 条
            </span>
          )}
        </div>

        {preview && (
          <div className="mt-5 border-t border-line pt-4">
            {preview.errors.length > 0 && (
              <div className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <b className="text-[12.5px] text-destructive">未能解析 / 未导入的行</b>
                <ul className="mt-1.5 max-h-[180px] list-none space-y-1 overflow-y-auto p-0 text-[12px] leading-[1.6] text-ink-soft">
                  {preview.errors.slice(0, 20).map((item, index) => (
                    <li key={`${item.line}-${index}`}>
                      第 {item.line} 行：{item.message}
                      {item.raw ? ` — ${item.raw.slice(0, 80)}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {preview.sample.length > 0 && (
              <div>
                <b className="text-[12.5px] text-ink-heading">预览（前 {preview.sample.length} 条）</b>
                <div className="mt-2 overflow-x-auto border border-line">
                  <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
                    <thead className="bg-paper text-left text-ink-soft">
                      <tr>
                        <th className="px-3 py-2 font-medium">出发</th>
                        <th className="px-3 py-2 font-medium">目的地</th>
                        <th className="px-3 py-2 font-medium">价格</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {preview.sample.map((row, index) => (
                        <tr key={`${row.airportIata}-${row.destination}-${index}`}>
                          <td className="px-3 py-1.5 font-mono">{row.airportIata}</td>
                          <td className="px-3 py-1.5">{row.destination}</td>
                          <td className="px-3 py-1.5 tabular-nums">
                            {row.price.toLocaleString('zh-CN')} {currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
