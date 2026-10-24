/**
 * Italian content helpers shared by the seed and the Italian content generators.
 *
 * The database carries Chinese, Traditional Chinese and English columns only
 * (see db/schema.ts); Italian reuses the English column as its base and applies
 * the vocabulary in lib/i18n/it-vocab.json — the same file the running site
 * reads (lib/i18n/it-data.ts), so an Italian name cannot mean two things in two
 * places.
 *
 * Everything here is data-derived: no claim comes from outside the repository's
 * own files (airport records, compiled facts, the OpenFlights route dump).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

export const itVocab = JSON.parse(readFileSync(join(ROOT, 'lib', 'i18n', 'it-vocab.json'), 'utf8'));

const translate = (table) => (value) => table[value] ?? value;

/** English column value -> Italian proper noun. */
export const itCountry = translate(itVocab.countries);
export const itRegion = translate(itVocab.regions);
export const itCity = translate(itVocab.cities);
export const itAirport = translate(itVocab.airports);

/** Airport class ("large", "medium", …) -> Italian phrase. */
export function itKind(kind) {
  return itVocab.airportKinds[kind] ?? itVocab.airportKinds.small;
}

/** Italian number formatting: 70.74 -> "70,74", 1234567 -> "1.234.567". */
export function itNumber(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(n);
}

/** 70.74 (millions) -> "circa 70,74 milioni"; 1 -> "circa 1 milione". */
export function itPax(millions) {
  if (millions == null || !Number.isFinite(millions)) return null;
  const rounded = Number(millions.toFixed(2));
  return `circa ${itNumber(rounded)} milion${rounded === 1 ? 'e' : 'i'}`;
}

/** "a, b e c" — the Italian list conjunction. */
export function itList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/**
 * Transport modes as a plain noun for prose ("Auto", not the UI's "Auto e
 * parcheggio"): a sentence listing the modes into the city reads better without
 * the parking half of the label.
 */
const MODE_NOUN = {
  train: 'treno',
  tram: 'tram',
  bus: 'bus',
  taxi: 'taxi',
  car: 'auto',
  ferry: 'traghetto',
};

/**
 * First paragraph for a directory-batch airport (no editorial copy): the answer
 * to "what is this airport" built from its class, elevation and service status.
 * Mirrors scripts/_describe.mjs, Italian edition.
 */
export function directoryDescriptionIt(a, country, facts) {
  const elevM = typeof facts?.elevFt === 'number' ? Math.round(facts.elevFt * 0.3048) : null;
  const sched = facts?.scheduled === true;
  const hasMap = typeof facts?.lat === 'number' && typeof facts?.lng === 'number';

  const name = itAirport(a.nameEn) ?? a.nameEn;
  const kind = a.kind ? itKind(a.kind) : null;
  const where = [itCity(a.cityEn) ?? a.cityEn, itCountry(country?.nameEn ?? '')]
    .filter(Boolean)
    .join(', ');

  const head = kind ? `${name} è un ${kind}` : `${name} si trova ${where ? `a ${where}` : 'nella regione'}`;
  const sentences = [`${head}${elevM != null ? `, a circa ${itNumber(elevM)} m di altitudine` : ''}.`];
  if (sched) {
    sentences.push('L’aeroporto è servito da voli passeggeri di linea.');
  } else if (facts?.scheduled === false) {
    sentences.push('Al momento non è servito da voli passeggeri di linea.');
  }
  sentences.push(
    hasMap
      ? 'Questa pagina raccoglie la mappa della posizione, i codici dell’aeroporto e le informazioni di viaggio.'
      : 'Questa pagina raccoglie i codici dell’aeroporto e le informazioni di viaggio.'
  );

  return sentences.join(' ');
}

/**
 * First paragraph for a curated airport, derived from the structured fields
 * rather than machine-translated: terminals, gates, passengers, distance and
 * the transport modes into the city.
 */
export function curatedDescriptionIt(a, paxM, distanceKm, modes) {
  const name = itAirport(a.nameEn) ?? a.nameEn;
  const city = itCity(a.cityEn) ?? a.cityEn ?? a.city;
  const country = itCountry(a.countryNameEn ?? '') || a.countryNameEn;
  const terminalCount = a.terminals?.length ?? 0;
  const gates = a.gates ?? 0;
  const transport = [
    ...new Set((a.transit ?? []).map((t) => MODE_NOUN[t.icon] ?? modes[t.icon] ?? t.icon)),
  ];

  const parts = [
    `${name} (${a.iata}) serve ${city}${country ? ` (${country})` : ''}.`,
    `L’aeroporto ha ${terminalCount === 1 ? 'un terminal' : `${terminalCount} terminal`} e ${gates} gate in totale` +
      (paxM != null ? `, con circa ${itNumber(paxM)} milioni di passeggeri l’anno` : '') +
      '.',
    distanceKm != null ? `Si trova a circa ${itNumber(distanceKm)} km dal centro.` : null,
    transport.length ? `Trasporti per la città: ${itList(transport)}.` : null,
  ];
  return parts.filter(Boolean).join(' ');
}
