'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import { haversineKm, initialBearing, parseDecimalPair, type LatLng } from '@/lib/geo-convert';
import type { Messages } from '@/lib/i18n/messages/zh';

type Tool = Messages['tool']['tools']['distanceCalculator'];

/** Beijing Tiananmen → Shanghai People's Square, for the one-tap example. */
const EXAMPLE_FROM = '39.9042, 116.4074';
const EXAMPLE_TO = '31.2304, 121.4737';

type Result = {
  km: number;
  bearing: number;
};

/**
 * Great-circle distance between two points (Haversine), plus the initial
 * bearing. Distances are shown in kilometres, miles and nautical miles; all
 * derived from the same km figure so the three rows always agree.
 */
export default function DistanceCalculator({ t }: { t: Tool }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(false);

  const calculate = () => {
    const a = parseDecimalPair(from);
    const b = parseDecimalPair(to);
    if (!a || !b) {
      setResult(null);
      setError(true);
      return;
    }
    setError(false);
    setResult({ km: haversineKm(a, b), bearing: initialBearing(a, b) });
  };

  const fillExample = () => {
    setFrom(EXAMPLE_FROM);
    setTo(EXAMPLE_TO);
    setError(false);
  };

  const summary = result
    ? `${result.km.toFixed(1)} km · ${(result.km * 0.621371).toFixed(1)} mi · ${(result.km * 0.539957).toFixed(1)} nmi`
    : '';

  const rows = result
    ? [
        { label: t.km, value: `${result.km.toFixed(1)} km` },
        { label: t.mi, value: `${(result.km * 0.621371).toFixed(1)} mi` },
        { label: t.nmi, value: `${(result.km * 0.539957).toFixed(1)} nmi` },
        { label: t.bearing, value: `${result.bearing.toFixed(0)}°` },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="tool-label" htmlFor="dc-from">
          {t.fromLabel} ({t.inputPlaceholder})
        </label>
        <input
          id="dc-from"
          className="tool-input"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          placeholder={EXAMPLE_FROM}
          autoComplete="off"
        />
      </div>
      <div>
        <label className="tool-label" htmlFor="dc-to">
          {t.toLabel} ({t.inputPlaceholder})
        </label>
        <input
          id="dc-to"
          className="tool-input"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder={EXAMPLE_TO}
          autoComplete="off"
          onKeyDown={(event) => event.key === 'Enter' && calculate()}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="tool-btn" onClick={calculate}>
          {t.submit}
        </button>
        <button type="button" className="tool-ghost-btn" onClick={fillExample}>
          {t.example}
        </button>
      </div>

      {error && <p className="tool-error">{t.error}</p>}

      {result && (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div className="tool-result" key={row.label}>
              <span className="lbl">{row.label}</span>
              <span className="val">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-end">
            <CopyButton value={summary} label={t.copy} copiedLabel={t.copied} />
          </div>
        </div>
      )}
    </div>
  );
}
