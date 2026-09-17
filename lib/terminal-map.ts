import type { Terminal } from './types';
import type { Messages } from './i18n/messages/zh';
import { getMessages } from './i18n';
import type { Locale } from './i18n/config';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text before it is interpolated into the generated SVG markup. */
export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/**
 * Builds the signature "terminal layout" illustration from terminal rows.
 * Terminals flagged as satellites are drawn as round concourses, everything
 * else as rectangular buildings, joined by dashed connectors with a single
 * ground-transport node underneath.
 *
 * All labels come from the locale catalog, so the diagram is localized too.
 */
export function terminalMapSvg(input: {
  iata: string;
  name: string;
  terminals: Pick<Terminal, 'code' | 'gateRange' | 'gateCount' | 'isSatellite'>[];
  locale: Locale;
}): string {
  const messages = getMessages(input.locale);
  const t: Messages['terminalMap'] = messages.terminalMap;
  const units = messages.units;

  const W = 1000;
  const H = 430;
  const pad = 40;
  const c = {
    bg: '#071B30',
    line: 'rgba(255,255,255,.5)',
    lineSoft: 'rgba(255,255,255,.16)',
    bld: 'rgba(46,125,179,.30)',
    bldStroke: 'rgba(255,255,255,.75)',
    amber: '#F2A33C',
    textDim: 'rgba(255,255,255,.5)',
  };

  const terminals = input.terminals.length
    ? input.terminals
    : [{ code: 'T1', gateRange: null, gateCount: 0, isSatellite: false }];

  const n = terminals.length;
  const bw = (W - pad * 2) / n;
  const yTop = 96;
  const hBld = 190;
  const parts: string[] = [];

  parts.push(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(t.ariaLabel(input.name))}">`
  );
  parts.push(`<rect width="${W}" height="${H}" fill="${c.bg}"/>`);
  // runway accents
  parts.push(
    `<line x1="${pad}" y1="${H - 38}" x2="${W - pad}" y2="${H - 38}" stroke="${c.lineSoft}" stroke-width="2" stroke-dasharray="6 10"/>`
  );
  parts.push(
    `<line x1="${pad}" y1="${H - 30}" x2="${W - pad}" y2="${H - 30}" stroke="${c.lineSoft}" stroke-width="2" stroke-dasharray="6 10"/>`
  );

  terminals.forEach((terminal, i) => {
    const x = pad + i * bw + (bw - 40) / 2;
    const w = Math.min(bw - 40, 300);
    const cx = x + w / 2;

    if (terminal.isSatellite) {
      const r = w / 2;
      parts.push(
        `<circle cx="${cx}" cy="${yTop + hBld / 2}" r="${r}" fill="${c.bld}" stroke="${c.bldStroke}" stroke-width="1.6"/>`
      );
      parts.push(
        `<circle cx="${cx}" cy="${yTop + hBld / 2}" r="${r - 14}" fill="none" stroke="${c.lineSoft}" stroke-width="1"/>`
      );
      parts.push(
        `<line x1="${cx}" y1="${yTop + hBld / 2 - 8}" x2="${cx}" y2="${yTop + hBld / 2 - 40}" stroke="${c.amber}" stroke-width="2"/>`
      );
      parts.push(
        `<text x="${cx}" y="${yTop + hBld / 2 - 46}" fill="${c.amber}" font-size="13" text-anchor="middle" font-family="Oswald,sans-serif" letter-spacing="2">${esc(terminal.code)}</text>`
      );
    } else {
      parts.push(
        `<rect x="${x}" y="${yTop}" width="${w}" height="${hBld}" rx="10" fill="${c.bld}" stroke="${c.bldStroke}" stroke-width="1.6"/>`
      );
      parts.push(
        `<rect x="${x}" y="${yTop}" width="${w}" height="34" rx="10" fill="rgba(242,163,60,.16)"/>`
      );
      parts.push(
        `<text x="${cx}" y="${yTop + 23}" fill="${c.amber}" font-size="14" text-anchor="middle" font-family="Oswald,sans-serif" letter-spacing="2" font-weight="600">${esc(terminal.code)}</text>`
      );
      const gates = Math.min(12, Math.max(4, Math.round((terminal.gateCount || 24) / 3)));
      for (let g = 0; g < gates; g++) {
        const gx = x + 18 + ((w - 36) * g) / (gates - 1);
        parts.push(`<circle cx="${gx}" cy="${yTop + hBld - 14}" r="3.4" fill="${c.line}"/>`);
      }
      const label = terminal.gateRange
        ? units.gatesLabel(terminal.gateRange)
        : units.gatesCount(terminal.gateCount);
      parts.push(
        `<text x="${cx}" y="${yTop + hBld + 26}" fill="${c.textDim}" font-size="12" text-anchor="middle" font-family="Oswald,sans-serif" letter-spacing="1.5">${esc(label)}</text>`
      );
    }

    if (i < n - 1) {
      const nx = pad + (i + 1) * bw + (bw - 40) / 2;
      const yC = yTop + hBld / 2;
      parts.push(
        `<line x1="${cx}" y1="${yC}" x2="${nx}" y2="${yC}" stroke="${c.lineSoft}" stroke-width="6"/>`
      );
      parts.push(
        `<line x1="${cx}" y1="${yC}" x2="${nx}" y2="${yC}" stroke="${c.bldStroke}" stroke-width="1.6" stroke-dasharray="4 6"/>`
      );
    }

    if (i === Math.floor((n - 1) / 2)) {
      const gx = cx;
      const gy = H - 56;
      parts.push(
        `<circle cx="${gx}" cy="${gy}" r="7" fill="${c.amber}" stroke="${c.bg}" stroke-width="2"/>`
      );
      parts.push(
        `<line x1="${gx}" y1="${yTop + hBld + 34}" x2="${gx}" y2="${gy - 7}" stroke="${c.lineSoft}" stroke-width="2" stroke-dasharray="3 4"/>`
      );
      parts.push(
        `<text x="${gx}" y="${H - 30}" fill="${c.amber}" font-size="11.5" text-anchor="middle" font-family="Oswald,sans-serif" letter-spacing="2">${esc(t.transit)}</text>`
      );
    }
  });

  parts.push(`<g font-family="Oswald,sans-serif" font-size="11" letter-spacing="1.5" fill="${c.textDim}">`);
  parts.push(`<circle cx="${pad + 8}" cy="30" r="3.4" fill="${c.line}"/><text x="${pad + 18}" y="34">${esc(t.gates)}</text>`);
  parts.push(
    `<rect x="${pad + 92}" y="26" width="14" height="9" rx="2" fill="${c.bld}" stroke="${c.bldStroke}"/><text x="${pad + 114}" y="34">${esc(t.terminal)}</text>`
  );
  parts.push(
    `<line x1="${pad + 176}" y1="31" x2="${pad + 190}" y2="31" stroke="${c.bldStroke}" stroke-dasharray="4 4"/><text x="${pad + 198}" y="34">${esc(t.corridor)}</text>`
  );
  parts.push(
    `<circle cx="${pad + 258}" cy="31" r="4" fill="${c.amber}"/><text x="${pad + 270}" y="34">${esc(t.transit)}</text>`
  );
  parts.push(
    `<text x="${W - pad}" y="34" text-anchor="end" fill="${c.textDim}">${esc(t.footer(input.iata))}</text>`
  );
  parts.push(`</g>`);
  parts.push(`</svg>`);

  return parts.join('');
}
