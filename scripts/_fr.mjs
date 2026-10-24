/**
 * French content helpers shared by the seed and the French content generators.
 *
 * The database carries Chinese, Traditional Chinese and English columns only
 * (see db/schema.ts); French reuses the English column as its base and applies
 * the vocabulary in lib/i18n/fr-vocab.json — the same file the running site
 * reads (lib/i18n/fr-data.ts), so a French name cannot mean two things in two
 * places.
 *
 * Everything here is data-derived: no claim comes from outside the repository's
 * own files (airport records, compiled facts, the OpenFlights route dump).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

export const frVocab = JSON.parse(readFileSync(join(ROOT, 'lib', 'i18n', 'fr-vocab.json'), 'utf8'));

const translate = (table) => (value) => table[value] ?? value;

/** English column value -> French proper noun. */
export const frCountry = translate(frVocab.countries);
export const frRegion = translate(frVocab.regions);
export const frCity = translate(frVocab.cities);
export const frAirport = translate(frVocab.airports);

/** Airport class ("large", "medium", …) -> French phrase. */
export function frKind(kind) {
  return frVocab.airportKinds[kind] ?? frVocab.airportKinds.small;
}

/** French number formatting: 70.74 -> "70,74", 1234567 -> "1 234 567". */
export function frNumber(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n);
}

/** 70.74 (millions) -> "environ 70,74 millions"; 1 -> "environ 1 million". */
export function frPax(millions) {
  if (millions == null || !Number.isFinite(millions)) return null;
  const rounded = Number(millions.toFixed(2));
  return `environ ${frNumber(rounded)} million${rounded === 1 ? '' : 's'}`;
}

/** "a, b et c" — the French list conjunction. */
export function frList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

/**
 * Transport modes as a plain noun for prose ("Voiture", not the UI's "Voiture
 * et parking"): a sentence listing the modes into the city reads better without
 * the parking half of the label.
 */
const MODE_NOUN = {
  train: 'train',
  tram: 'tramway',
  bus: 'bus',
  taxi: 'taxi',
  car: 'voiture',
  ferry: 'ferry',
};

/**
 * First paragraph for a directory-batch airport (no editorial copy): the answer
 * to "what is this airport" built from its class, elevation and service status.
 * Mirrors scripts/_describe.mjs, French edition.
 */
export function directoryDescriptionFr(a, country, facts) {
  const elevM = typeof facts?.elevFt === 'number' ? Math.round(facts.elevFt * 0.3048) : null;
  const sched = facts?.scheduled === true;
  const hasMap = typeof facts?.lat === 'number' && typeof facts?.lng === 'number';

  const name = frAirport(a.nameEn) ?? a.nameEn;
  const kind = a.kind ? frKind(a.kind) : null;
  const where = [frCity(a.cityEn) ?? a.cityEn, frCountry(country?.nameEn ?? '')]
    .filter(Boolean)
    .join(', ');

  const head = kind
    ? `${name} est un ${kind}`
    : `${name} se situe ${where ? `à ${where}` : 'dans la région'}`;
  const sentences = [`${head}${elevM != null ? `, à environ ${frNumber(elevM)} m d’altitude` : ''}.`];
  if (sched) {
    sentences.push('L’aéroport accueille des vols passagers réguliers.');
  } else if (facts?.scheduled === false) {
    sentences.push('Il n’accueille actuellement aucun vol passager régulier.');
  }
  sentences.push(
    hasMap
      ? 'Cette page réunit la carte de localisation, les codes de l’aéroport et les informations de voyage.'
      : 'Cette page réunit les codes de l’aéroport et les informations de voyage.'
  );

  return sentences.join(' ');
}

/**
 * First paragraph for a curated airport, derived from the structured fields
 * rather than machine-translated: terminals, gates, passengers, distance and
 * the transport modes into the city.
 */
export function curatedDescriptionFr(a, paxM, distanceKm, modes) {
  const name = frAirport(a.nameEn) ?? a.nameEn;
  const city = frCity(a.cityEn) ?? a.cityEn ?? a.city;
  const country = frCountry(a.countryNameEn ?? '') || a.countryNameEn;
  const terminalCount = a.terminals?.length ?? 0;
  const gates = a.gates ?? 0;
  const transport = [
    ...new Set((a.transit ?? []).map((t) => MODE_NOUN[t.icon] ?? modes[t.icon] ?? t.icon)),
  ];

  const parts = [
    `${name} (${a.iata}) dessert ${city}${country ? ` (${country})` : ''}.`,
    `L’aéroport compte ${terminalCount === 1 ? 'un terminal' : `${terminalCount} terminaux`} et ${gates} portes au total` +
      (paxM != null ? `, et accueille environ ${frNumber(paxM)} millions de passagers par an` : '') +
      '.',
    distanceKm != null
      ? `Il se situe à environ ${frNumber(distanceKm)} km du centre-ville.`
      : null,
    transport.length ? `Accès à la ville : ${frList(transport)}.` : null,
  ];
  return parts.filter(Boolean).join(' ');
}
