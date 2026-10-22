/**
 * German content helpers shared by the seed and the German content generators.
 *
 * The database carries Chinese, Traditional Chinese and English columns only
 * (see db/schema.ts); German reuses the English column as its base and applies
 * the vocabulary in lib/i18n/de-vocab.json — the same file the running site
 * reads (lib/i18n/de-data.ts), so a German name cannot mean two things in two
 * places.
 *
 * Everything here is data-derived: no claim comes from outside the repository's
 * own files (airport records, compiled facts, the OpenFlights route dump).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

export const deVocab = JSON.parse(readFileSync(join(ROOT, 'lib', 'i18n', 'de-vocab.json'), 'utf8'));

const translate = (table) => (value) => table[value] ?? value;

/** English column value -> German proper noun. */
export const deCountry = translate(deVocab.countries);
export const deRegion = translate(deVocab.regions);
export const deCity = translate(deVocab.cities);
export const deAirport = translate(deVocab.airports);

/** Airport class ("large", "medium", …) -> German phrase. */
export function deKind(kind) {
  return deVocab.airportKinds[kind] ?? deVocab.airportKinds.small;
}

/** German number formatting: 70.74 -> "70,74", 1234567 -> "1.234.567". */
export function deNumber(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(n);
}

/** 70.74 (millions) -> "ca. 70,74 Millionen"; 1 -> "ca. 1 Million". */
export function dePax(millions) {
  if (millions == null || !Number.isFinite(millions)) return null;
  const rounded = Number(millions.toFixed(2));
  return `ca. ${deNumber(rounded)} ${rounded === 1 ? 'Million' : 'Millionen'}`;
}/** "a, b und c" — the German list conjunction. */
export function deList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

/**
 * Transport modes as a plain noun for prose ("Auto", not the UI's "Auto &
 * Parken"): a sentence listing the modes into the city reads better without
 * the parking half of the label.
 */
const MODE_NOUN = {
  train: 'Bahn',
  tram: 'Tram',
  bus: 'Bus',
  taxi: 'Taxi',
  car: 'Auto',
  ferry: 'Fähre',
};

/**
 * First paragraph for a directory-batch airport (no editorial copy): the answer
 * to "what is this airport" built from its class, elevation and service status.
 * Mirrors scripts/_describe.mjs, German edition.
 */
export function directoryDescriptionDe(a, country, facts) {
  const elevM = typeof facts?.elevFt === 'number' ? Math.round(facts.elevFt * 0.3048) : null;
  const sched = facts?.scheduled === true;
  const hasMap = typeof facts?.lat === 'number' && typeof facts?.lng === 'number';

  const name = deAirport(a.nameEn) ?? a.nameEn;
  const kind = a.kind ? deKind(a.kind) : null;
  const where = [deCity(a.cityEn) ?? a.cityEn, deCountry(country?.nameEn ?? '')].filter(Boolean).join(', ');

  const head = kind ? `${name} ist ein ${kind}` : `${name} liegt in ${where || 'der Region'}`;
  const sentences = [`${head}${elevM != null ? ` auf rund ${deNumber(elevM)} m Höhe` : ''}.`];
  if (sched) {
    sentences.push('Der Flughafen wird planmäßig im Passagierverkehr angeflogen.');
  } else if (facts?.scheduled === false) {
    sentences.push('Planmäßigen Passagierverkehr gibt es derzeit nicht.');
  }
  sentences.push(
    hasMap
      ? 'Diese Seite bündelt den Lageplan, die Flughafencodes und die Reiseinformationen.'
      : 'Diese Seite bündelt die Flughafencodes und die Reiseinformationen.'
  );

  return sentences.join(' ');
}

/**
 * First paragraph for a curated airport, derived from the structured fields
 * rather than machine-translated: terminals, gates, passengers, distance and
 * the transport modes into the city.
 */
export function curatedDescriptionDe(a, paxM, distanceKm, modes) {
  const name = deAirport(a.nameEn) ?? a.nameEn;
  const city = deCity(a.cityEn) ?? a.cityEn ?? a.city;
  const country = deCountry(a.countryNameEn ?? '') || a.countryNameEn;
  const terminalCount = a.terminals?.length ?? 0;
  const gates = a.gates ?? 0;
  const transport = [
    ...new Set((a.transit ?? []).map((t) => MODE_NOUN[t.icon] ?? modes[t.icon] ?? t.icon)),
  ];

  const parts = [
    `${name} (${a.iata}) bedient ${city}${country ? `, ${country}` : ''}.`,
    `Der Flughafen hat ${terminalCount === 1 ? 'ein Terminal' : `${terminalCount} Terminals`} mit insgesamt ${gates} Gates` +
      (paxM != null ? ` und fertigt jährlich rund ${deNumber(paxM)} Millionen Passagiere ab` : '') +
      '.',
    distanceKm != null ? `Er liegt rund ${deNumber(distanceKm)} km vom Stadtzentrum entfernt.` : null,
    transport.length ? `Bodentransport in die Stadt: ${deList(transport)}.` : null,
  ];
  return parts.filter(Boolean).join(' ');
}
