'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import { formatDmsParts, parseDmsPair } from '@/lib/geo-convert';
import type { Messages } from '@/lib/i18n/messages/zh';

type Tool = Messages['tool']['tools']['dmsConverter'];

/**
 * Coordinate format converter: paste a pair in any common notation, get all
 * three (DD / DM / DMS) back. The input format is detected from the number of
 * number groups per half, so no input-format selector is needed — the parsing
 * lives in lib/geo-convert.ts next to the rest of the coordinate math.
 */
export default function DmsConverterTool({ t }: { t: Tool }) {
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(4);
  const [result, setResult] = useState<{ dd: string; dm: string; dms: string } | null>(null);
  const [error, setError] = useState(false);

  const convert = () => {
    const parts = parseDmsPair(input);
    if (!parts) {
      setResult(null);
      setError(true);
      return;
    }
    setError(false);
    setResult(formatDmsParts(parts, precision));
  };

  const rows = result
    ? [
        { label: t.ddLabel, value: result.dd },
        { label: t.dmLabel, value: result.dm },
        { label: t.dmsLabel, value: result.dms },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="tool-label" htmlFor="dms-input">
          {t.inputLabel}
        </label>
        <input
          id="dms-input"
          className="tool-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.inputPlaceholder}
          autoComplete="off"
          onKeyDown={(event) => event.key === 'Enter' && convert()}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[120px]">
          <label className="tool-label" htmlFor="dms-precision">
            {t.precisionLabel}
          </label>
          <select
            id="dms-precision"
            className="tool-select"
            value={precision}
            onChange={(event) => setPrecision(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
            <div className="tool-result" key={row.label}>
              <span className="lbl">{row.label}</span>
              <span className="val">{row.value}</span>
              <CopyButton value={row.value} label={t.copy} copiedLabel={t.copied} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
