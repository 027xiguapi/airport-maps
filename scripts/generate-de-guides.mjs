/**
 * German long-form airport guides — the `content_documents` rows with
 * locale='de' that the airport page renders under "Flughafenführer".
 *
 * English has 366 guides: 60 hand-written editorial ones and 306 generated from
 * the repository's own data by scripts/generate-airport-guides.mjs. German has
 * no editorial translations yet, so rather than showing English prose on a
 * German page (or, worse, Chinese), every German guide is generated from the
 * same data the English generator uses — the seeded airport records, compiled
 * facts, the OpenFlights route dump and the nearest-airport calculation. It
 * invents nothing: sections that need real editorial knowledge (terminal
 * structures, ground transport timetables) are absent instead of guessed.
 *
 * Names come from the database's English columns with the German vocabulary of
 * lib/i18n/de-vocab.json applied — the same tables the running site uses — so a
 * guide never says "北京" or mixes a German city with a Chinese region.
 *
 * The rows written here carry GENERATED_MARKER, so a later editorial
 * translation can replace an airport's row and `--refresh` will never overwrite
 * it.
 *
 * Usage:
 *   node scripts/generate-de-guides.mjs             write the missing guides
 *   node scripts/generate-de-guides.mjs --dry-run   report only
 *   node scripts/generate-de-guides.mjs --refresh   re-render German guides this
 *                                                   script wrote (hand-written
 *                                                   rows are never touched)
 *   node scripts/generate-de-guides.mjs --codes PEK,MUC   restrict
 *
 * Run `node scripts/seed.mjs` first: the script reads the seeded names.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { deAirport, deCity, deCountry, deKind, deNumber, dePax, deRegion } from './_de.mjs';

const DRY = process.argv.includes('--dry-run');
const REFRESH = process.argv.includes('--refresh');
const codesArg = process.argv.find((a) => a.startsWith('--codes'));
const ONLY = codesArg
  ? (codesArg.includes('=')
      ? codesArg.split('=')[1]
      : process.argv[process.argv.indexOf(codesArg) + 1]
    )
      ?.split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean) ?? null
  : null;

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/** The guide's revision date, stamped on every generated document. */
const UPDATED = '2026-10-22';

const legacy = read('scripts/legacy-data.json');
const facts = read('lib/airport-facts.json').airports;
const routes = read('data/airport-routes.json');
/** English display names for destinations outside the directory. */
const worldAirports = read('public/data/world-airports.json').airports;

/** Curated records carry pax/distance/terminals/transit used by the guide. */
const curated = new Map(legacy.airports.map((a) => [a.iata, a]));

const world = new Map(
  worldAirports.map((r) => [String(r[0]).toUpperCase(), { name: r[1], lat: r[6], lng: r[7] }])
);

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

/** English names + region straight from the seeded database. */
const { rows: dbRows } = await client.query(
  `SELECT a.iata, a.name_en, a.city_en, c.name_en AS country_name_en, c.region_en
     FROM airports a
     JOIN countries c ON c.code = a.country_code`
);
const db = new Map(dbRows.map((row) => [row.iata, row]));

/** Coordinates: compiled facts first, then the world-airports dump. */
function coords(iata) {
  const f = facts[iata];
  if (typeof f?.lat === 'number' && typeof f?.lng === 'number') return { lat: f.lat, lng: f.lng };
  const w = world.get(iata);
  return w && Number.isFinite(w.lat) && Number.isFinite(w.lng) ? { lat: w.lat, lng: w.lng } : null;
}

const EARTH_R = 6371.0088;
const haversine = (a, b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
};

/** "约6700万" -> 67 ; "约1.08亿" -> 108 */
function parsePax(text) {
  const m = /约\s*([\d.]+)\s*(亿|万)/.exec(text ?? '');
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return m[2] === '亿' ? Number((n * 100).toFixed(2)) : Number((n / 100).toFixed(2));
}

/** "25 km" -> 25 */
function parseDistance(text) {
  const m = /([\d.]+)\s*km/i.exec(text ?? '');
  return m ? Number(m[1]) : null;
}

/** German airport name for any IATA: database name first, then the world dump. */
function displayName(iata) {
  const own = db.get(iata);
  if (own?.name_en) return deAirport(own.name_en);
  const w = world.get(iata);
  return w ? deAirport(w.name) : iata;
}

function guideData(iata) {
  const info = db.get(iata);
  if (!info) return null;
  const record = curated.get(iata);
  const point = coords(iata);
  const route = routes.airports[iata] ?? null;
  const destinations = route ? [...route.destinations].sort((x, y) => x.km - y.km) : null;
  let nearest = null;
  if (point) {
    nearest = [...db.keys()]
      .filter((code) => code !== iata)
      .map((code) => ({ code, km: haversine(point, coords(code) ?? { lat: 1e9, lng: 1e9 }) }))
      .filter((n) => n.km < 1e8)
      .sort((x, y) => x.km - y.km)
      .slice(0, 3);
  }
  /** Compiled facts know the class for curated airports too; directory rows carry `kind`. */
  const kind = facts[iata]?.type ?? record?.kind ?? 'small';
  return { iata, info, record, point, destinations, nearest, kind };
}

const fmtKm = (km) => (km >= 100 ? Math.round(km) : Math.round(km * 10) / 10);

const KIND_PARAGRAPH = {
  large:
    'Großflughäfen haben mehrere Startbahnen und Terminals und fertigen jährlich Millionen Passagiere ab. Die Wartezeiten an Check-in und Sicherheitskontrolle schwanken stark je nach Tageszeit; für internationale Flüge sollten Sie 2–3 Stunden vor Abflug da sein.',
  medium:
    'Regionalflughäfen sind kompakt: ein überschaubares Terminal, kurze Wege und meist schnellerer Check-in als an einem großen Drehkreuz – dafür gibt es weniger Verbindungen, und ein Umbuchen nach verpasstem Flug ist schwieriger. Planen Sie 90–120 Minuten vor Abflug ein.',
  small:
    'Kleine Flugplätze haben wenige Einrichtungen, meist ein Terminal auf einer Ebene, dessen Check-in-Schalter erst kurz vor dem Abflug öffnen. Der Bodentransport ist dünn; ein eigenes Auto oder ein vorbestellter Transfer ist die sicherere Wahl.',
  heliport:
    'Heliports bedienen ausschließlich Hubschrauberflüge – kein üblicher Terminalablauf. Die Zahl der Sitze und die Flugstrecken sind kurz; kommen Sie zur vom Betreiber genannten Zeit.',
};

/** German guide document: { title, summary, updated, body }. */
function guide({ iata, info, record, point, destinations, nearest, kind }) {
  const name = deAirport(info.name_en);
  const city = deCity(info.city_en ?? '');
  const countryName = deCountry(info.country_name_en);
  const region = info.region_en ? deRegion(info.region_en) : '';
  const kindDe = deKind(kind);
  const paxM = record ? parsePax(record.pax) : null;
  const distanceKm = record ? parseDistance(record.distance) : null;
  const icao = facts[iata]?.icao ?? record?.icao ?? null;

  const title = `${name} – Flughafenführer`;
  const summary =
    `${name} (${iata}) bedient ${city}, ${countryName} als ${kindDe}. ` +
    `Karte, Nonstop-Ziele, Flughäfen in der Nähe und was noch mit der Airline zu klären ist.`;

  const lines = [];
  lines.push(
    `${name} (IATA **${iata}**${icao ? `, ICAO ${icao}` : ''}) bedient ${city}, ${countryName}` +
      `${region ? ` (${region})` : ''} und ist ein ${kindDe}. ` +
      'Diese Seite fasst zusammen, was Datenbank, Karten und Streckendatensatz über den Flughafen aussagt.'
  );
  lines.push('');

  lines.push('## Auf einen Blick');
  lines.push('');
  lines.push('| | |');
  lines.push('| --- | --- |');
  lines.push(`| IATA / ICAO | ${iata} / ${icao ?? '—'} |`);
  lines.push(`| Flughafenklasse | ${kindDe} |`);
  lines.push(`| Lage | ${city}, ${countryName}${region ? ` (${region})` : ''} |`);
  if (point) lines.push(`| Koordinaten | ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} |`);
  if (paxM != null) lines.push(`| Passagiere pro Jahr | ${dePax(paxM)} |`);
  if (distanceKm != null) lines.push(`| Zum Stadtzentrum | ca. ${deNumber(distanceKm)} km |`);
  if (destinations) lines.push(`| Nonstop-Ziele | ${destinations.length} (siehe unten) |`);
  lines.push('');

  lines.push('## Flughafenkarte');
  lines.push('');
  lines.push(
    'Die Karte auf dieser Seite wird aus OpenStreetMap-Daten gerendert: Flughäfen mit Terminalpolygonen zeigen Terminalgebäude, Vorfelder und Zufahrtsstraßen, kleine Plätze den Umriss des Flugfelds und die Startbahn. Symbole für Parken, Busse, Gastronomie, Hotels und Mietwagen folgen dem, was in OSM erfasst ist.'
  );
  lines.push('');
  lines.push(
    '- **Vollbildansicht** – die Kartenkarte auf dieser Seite lässt sich vergrößern; das Original mit 2000 px kann heruntergeladen werden.'
  );
  lines.push(
    '- **Lageplan** – die interaktive Karte lässt sich verschieben und zoomen, um den Flughafen im Verhältnis zu Stadt und Straßennetz zu sehen.'
  );
  lines.push(
    '- **Schema** – die Seite zeichnet zusätzlich ein maßstabsfreies Schema nach der Gate-Zahl; es zeigt die Größenordnung, nicht den tatsächlichen Grundriss.'
  );
  lines.push('');

  lines.push('## Nonstop-Ziele');
  lines.push('');
  if (destinations) {
    lines.push(
      'Nonstop-Ziele, die nächsten zuerst (Streckendatensatz von OpenFlights, Stand 2014 – als Orientierung zu verstehen; maßgeblich sind die Angaben der Airline):'
    );
    lines.push('');
    lines.push('| Ziel | Entfernung | Fluggesellschaften |');
    lines.push('| --- | --- | --- |');
    for (const d of destinations.slice(0, 8)) {
      const carriers = d.carriers
        .slice(0, 2)
        .map((c) => routes.airlines[c] ?? c)
        .join(', ');
      lines.push(`| ${displayName(d.iata)} (${d.iata}) | ca. ${deNumber(fmtKm(d.km))} km | ${carriers} |`);
    }
    lines.push('');
    lines.push(
      `Die vollständige Liste aller ${destinations.length} Nonstop-Ziele steht auf der [Streckenkarte ${name}](/de/route/${iata}).`
    );
    lines.push('');
  } else {
    lines.push(
      'Der Streckendatensatz enthält für diesen Flughafen keine Nonstop-Verbindungen. Regionale Flugpläne ändern sich häufig – fragen Sie vor der Buchung bei der Airline oder am Flughafen nach.'
    );
    lines.push('');
  }

  if (nearest?.length && point) {
    lines.push('## Flughäfen in der Nähe');
    lines.push('');
    lines.push('Wenn nichts Passendes dabei ist, lohnt ein Vergleich mit diesen nahe gelegenen Flughäfen:');
    lines.push('');
    lines.push('| Flughafen | Entfernung |');
    lines.push('| --- | --- |');
    for (const n of nearest) {
      lines.push(`| ${displayName(n.code)} (${n.code}) | ${deNumber(fmtKm(n.km))} km |`);
    }
    lines.push('');
  }

  lines.push('## Anfahrt');
  lines.push('');
  const bits = [];
  if (point) bits.push(`Koordinaten ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
  if (typeof facts[iata]?.elevFt === 'number') {
    bits.push(`Höhe rund ${deNumber(Math.round(facts[iata].elevFt * 0.3048))} m`);
  }
  if (distanceKm != null) bits.push(`rund ${deNumber(distanceKm)} km vom Stadtzentrum`);
  if (facts[iata]?.scheduled === false) {
    bits.push('heute kein planmäßiger Passagierverkehr – überwiegend Allgemeine Luftfahrt und Charter');
  }
  if (bits.length) {
    lines.push(`Der Flughafen: ${bits.join('; ')}.`);
    lines.push('');
  }
  if (point) {
    lines.push(
      `- **Anfahrt planen:** [Google Maps](https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng})`
    );
    lines.push('');
    lines.push(
      'Der Lageplan auf dieser Seite zeigt den Flughafen im Verhältnis zu Stadt und Straßennetz; der Abschnitt „Bodentransport“ listet die erfassten öffentlichen Verkehrsmittel. Für Fahrtrouten, Fahrpläne und Parken sind die Angaben des Flughafens maßgeblich.'
    );
    lines.push('');
  }

  lines.push('## Größe und Einrichtungen');
  lines.push('');
  lines.push(KIND_PARAGRAPH[kind] ?? KIND_PARAGRAPH.small);
  lines.push('');
  lines.push(
    'Terminalpläne, Check-in-Bereiche und Fahrpläne des Bodentransports veröffentlicht der Flughafen selbst; für Details, die am Reisetag stimmen müssen, gilt die Auskunft des Flughafens. Wenn hier etwas falsch aussieht, sagen Sie uns bitte über die Kontaktseite Bescheid.'
  );
  lines.push('');

  lines.push('## Hinweise');
  lines.push('');
  if (destinations?.length) {
    lines.push(
      `- Liegt Ihr Ziel nicht in der Tabelle oben, reisen Sie in der Regel über ${displayName(destinations[0].iata)} (${destinations[0].iata}) oder ein anderes größeres Drehkreuz.`
    );
  }
  lines.push(
    '- Nutzen Sie die Suche oben auf der Seite, um Alternativen zu vergleichen: Geben Sie einen Städtenamen oder einen IATA-Code ein.'
  );
  lines.push(
    '- In der Hochsaison sind auch an kleinen Plätzen Parkplätze und Mietwagen knapp – buchen Sie früh, wenn Sie selbst fahren.'
  );
  lines.push('');

  return { title, summary, updated: UPDATED, body: lines.join('\n').trim() };
}

// ----------------------------------------------------------------------- run
const { rows: existing } = await client.query(
  `SELECT subject, body FROM content_documents WHERE kind = 'airport' AND locale = 'de'`
);
const stored = new Map(existing.map((row) => [row.subject, row.body]));

const all = [...db.keys()].sort();
const targets = all.filter((code) => {
  if (ONLY && !ONLY.includes(code)) return false;
  const body = stored.get(code);
  if (body === undefined) return true;
  return REFRESH && body.includes('Diese Seite fasst zusammen, was Datenbank');
});

console.log(`${targets.length} airport(s) need German guides${DRY ? ' (dry run)' : ''}`);
if (DRY) {
  console.log(targets.slice(0, 40).join(' ') + (targets.length > 40 ? ' …' : ''));
  await client.end();
  process.exit(0);
}

const upsert = `
  INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
  VALUES ('airport', $1, 'de', $2, $3, $4, $5)
  ON CONFLICT (kind, subject, locale) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    updated = EXCLUDED.updated,
    body = EXCLUDED.body,
    updated_at = now()`;

let written = 0;
try {
  await client.query('BEGIN');
  for (const code of targets) {
    const data = guideData(code);
    if (!data) continue;
    const doc = guide(data);
    await client.query(upsert, [code, doc.title, doc.summary, doc.updated, doc.body]);
    written++;
  }
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await client.end();
}
console.log(`wrote ${written} German guide(s)`);
