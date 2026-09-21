'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import {
  bd09ToWgs84,
  gcj02ToBd09,
  gcj02ToWgs84,
  parseDecimalPair,
  wgs84ToBd09,
  wgs84ToGcj02,
  type LatLng,
} from '@/lib/geo-convert';
import type { Messages } from '@/lib/i18n/messages/zh';

type Tool = Messages['tool']['tools']['coordinateConverter'];

type Source = 'wgs84' | 'gcj02' | 'bd09';

/** Converts any supported source system into WGS84. */
function toWgs84(source: Source, point: LatLng): LatLng {
  if (source === 'gcj02') return gcj02ToWgs84(point.lat, point.lng);
  if (source === 'bd09') return bd09ToWgs84(point.lat, point.lng);
  return point;
}

/** Converts WGS84 into the requested target system. */
function fromWgs84(target: Source, point: LatLng): LatLng {
  if (target === 'gcj02') return wgs84ToGcj02(point.lat, point.lng);
  if (target === 'bd09') return wgs84ToBd09(point.lat, point.lng);
  return point;
}

/**
 * WGS84 / GCJ02 / BD09 coordinate converter. Everything routes through WGS84 —
 * the chosen source is converted there first, then out to the other two
 * systems — so 3 inputs × 2 outputs need only the primitives in
 * lib/geo-convert.ts.
 */
export default function CoordinateConverter({ t }: { t: Tool }) {
  const [input, setInput] = useState('');
  const [source, setSource] = useState<Source>('wgs84');
  const [precision, setPrecision] = useState(6);
  const [result, setResult] = useState<Record<Source, LatLng> | null>(null);
  const [error, setError] = useState(false);

  const convert = () => {
    const point = parseDecimalPair(input);
    if (!point) {
      setResult(null);
      setError(true);
      return;
    }
    setError(false);
    const wgs84 = toWgs84(source, point);
    setResult({
      wgs84,
      gcj02: fromWgs84('gcj02', wgs84),
      bd09: fromWgs84('bd09', wgs84),
    });
  };

  const format = (point: LatLng) =>
    `${point.lat.toFixed(precision)}, ${point.lng.toFixed(precision)}`;

  const rows: { key: Source; label: string; point: LatLng }[] = result
    ? [
        { key: 'wgs84', label: t.wgs84, point: result.wgs84 },
        { key: 'gcj02', label: t.gcj02, point: result.gcj02 },
        { key: 'bd09', label: t.bd09, point: result.bd09 },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="tool-label" htmlFor="cc-input">
          {t.inputLabel}
        </label>
        <input
          id="cc-input"
          className="tool-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.inputPlaceholder}
          inputMode="text"
          autoComplete="off"
          onKeyDown={(event) => event.key === 'Enter' && convert()}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="tool-label" htmlFor="cc-source">
            {t.sourceLabel}
          </label>
          <select
            id="cc-source"
            className="tool-select"
            value={source}
            onChange={(event) => setSource(event.target.value as Source)}
          >
            <option value="wgs84">{t.wgs84}</option>
            <option value="gcj02">{t.gcj02}</option>
            <option value="bd09">{t.bd09}</option>
          </select>
        </div>
        <div className="w-[120px]">
          <label className="tool-label" htmlFor="cc-precision">
            {t.precisionLabel}
          </label>
          <select
            id="cc-precision"
            className="tool-select"
            value={precision}
            onChange={(event) => setPrecision(Number(event.target.value))}
          >
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="tool-btn" onClick={convert}>
          {t.submit}
        </button>
      </div>

      {error && <p className="tool-error">{t.error}</p>}

      {result && (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div className="tool-result" key={row.key}>
              <span className="lbl">{row.label}</span>
              <span className="val">{format(row.point)}</span>
              <CopyButton value={format(row.point)} label={t.copy} copiedLabel={t.copied} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
