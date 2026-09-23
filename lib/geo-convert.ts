/**
 * Pure coordinate math for the tool pages — no DOM, no Node APIs, safe to
 * import from client components.
 *
 * The WGS84 ↔ GCJ02 transform is the standard public approximation used
 * across the ecosystem; GCJ02 ↔ BD09 is Baidu's published offset pair. The
 * WGS84 → GCJ02 direction is the accurate one; the inverse runs the forward
 * transform and subtracts, which is accurate to well under a metre — far
 * below the inherent ~100 m+ offset between the systems.
 */

export type LatLng = { lat: number; lng: number };

const PI = Math.PI;
/** Krassovsky ellipsoid semi-major axis and squared eccentricity, as used by the GCJ02 algorithm. */
const GCJ_A = 6378245;
const GCJ_EE = 0.00669342162296594323;
/** Mean Earth radius in km, IUGG value. */
export const EARTH_RADIUS_KM = 6371.0088;

function outOfChinaMainland(lat: number, lng: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret =
    -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
  ret += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
  ret += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
  ret += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
  ret += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
  return ret;
}

/** WGS84 → GCJ02. Points outside mainland China are returned unchanged. */
export function wgs84ToGcj02(lat: number, lng: number): LatLng {
  if (outOfChinaMainland(lat, lng)) return { lat, lng };
  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - GCJ_EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const offsetLat = (dLat * 180) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * PI);
  const offsetLng = (dLng * 180) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat + offsetLat, lng: lng + offsetLng };
}

/** GCJ02 → WGS84 (approximate inverse, sub-metre accurate). */
export function gcj02ToWgs84(lat: number, lng: number): LatLng {
  const gcj = wgs84ToGcj02(lat, lng);
  return { lat: lat * 2 - gcj.lat, lng: lng * 2 - gcj.lng };
}

/** GCJ02 → BD09. */
export function gcj02ToBd09(lat: number, lng: number): LatLng {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin((lat * PI * 3000) / 180);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos((lng * PI * 3000) / 180);
  return { lat: z * Math.sin(theta) + 0.006, lng: z * Math.cos(theta) + 0.0065 };
}

/** BD09 → GCJ02. */
export function bd09ToGcj02(lat: number, lng: number): LatLng {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin((y * PI * 3000) / 180);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos((x * PI * 3000) / 180);
  return { lat: z * Math.sin(theta), lng: z * Math.cos(theta) };
}

/** WGS84 → BD09 (via GCJ02). */
export function wgs84ToBd09(lat: number, lng: number): LatLng {
  const gcj = wgs84ToGcj02(lat, lng);
  return gcj02ToBd09(gcj.lat, gcj.lng);
}

/** BD09 → WGS84 (via GCJ02). */
export function bd09ToWgs84(lat: number, lng: number): LatLng {
  const gcj = bd09ToGcj02(lat, lng);
  return gcj02ToWgs84(gcj.lat, gcj.lng);
}

/** Haversine great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d / 180) * PI;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b, degrees clockwise from true north (0–360). */
export function initialBearing(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d / 180) * PI;
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (((Math.atan2(y, x) * 180) / PI) + 360) % 360;
}

/**
 * Points along the great circle from a to b, as [lat, lng] pairs — what a route
 * map has to draw so a flight looks like the arc it flies. A straight lat/lng
 * line instead cuts a chord, which on a Mercator map bends the wrong way for
 * every long route. `segments` is the number of straight pieces the arc is
 * approximated with.
 */
export function greatCirclePoints(a: LatLng, b: LatLng, segments = 48): [number, number][] {
  const toRad = (d: number) => (d / 180) * PI;
  const φ1 = toRad(a.lat);
  const λ1 = toRad(a.lng);
  const φ2 = toRad(b.lat);
  const λ2 = toRad(b.lng);
  const d =
    2 *
    Math.asin(
      Math.min(
        1,
        Math.sqrt(
          Math.sin((φ2 - φ1) / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
        )
      )
    );
  // Coincident (or antipodal-to-rounding) endpoints: nothing to interpolate.
  if (d < 1e-9) return [[a.lat, a.lng], [b.lat, b.lng]];

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    points.push([(Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / PI, (Math.atan2(y, x) * 180) / PI]);
  }
  return points;
}

/** Parses "lat, lng" (decimal degrees) tolerating spaces, full-width commas and
 * a trailing hemisphere letter that agrees with the sign. Returns null when the
 * text is not a valid pair (|lat| ≤ 90, |lng| ≤ 180). */
export function parseDecimalPair(text: string): LatLng | null {
  const normalised = text.trim().replace(/[，、;；]/g, ',');
  const parts = normalised.split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;

  const parse = (raw: string, limit: number): number | null => {
    const letter = raw.match(/[NSEWnsew]/)?.[0]?.toUpperCase();
    const digits = raw.match(/-?\d+(?:\.\d+)?/);
    if (!digits) return null;
    let value = parseFloat(digits[0]);
    if (Number.isNaN(value)) return null;
    if ((letter === 'S' || letter === 'W') && value > 0) value = -value;
    if (Math.abs(value) > limit) return null;
    return value;
  };

  const lat = parse(parts[0], 90);
  const lng = parse(parts[1], 180);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

// ---------------------------------------------------------------- DMS formats

/** One hemisphere of a coordinate: ±decimal degrees, plus the letter when given. */
export type CoordPart = { value: number; letter: string | null };

const DMS_NUMBER = /-?\d+(?:\.\d+)?/g;

/**
 * Parses one half of a coordinate ("39°54′15″N", "39°32.5′E", "-74.006") by
 * counting number groups: 1 = DD, 2 = DM, 3 = DMS. A trailing S/W flips the
 * sign; a leading minus sign does the same. Returns null when unparseable or
 * the minutes/seconds are out of range.
 */
export function parseCoordPart(raw: string): CoordPart | null {
  const text = raw.trim();
  const numbers = text.match(DMS_NUMBER);
  if (!numbers || numbers.length === 0 || numbers.length > 3) return null;

  const values = numbers.map(Number);
  if (values.some((v) => Number.isNaN(v))) return null;

  const degrees = Math.abs(values[0]);
  const minutes = values[1] ?? 0;
  const seconds = values[2] ?? 0;
  if (minutes >= 60 || seconds >= 60) return null;

  const letter = text.match(/[NSEWnsew]/)?.[0]?.toUpperCase() ?? null;
  let value = degrees + minutes / 60 + seconds / 3600;
  if (values[0] < 0 || letter === 'S' || letter === 'W') value = -value;
  return { value, letter };
}

/** Parses a "lat, lng" pair whose halves may be in any DD/DM/DMS notation. */
export function parseDmsPair(text: string): [CoordPart, CoordPart] | null {
  const parts = text.trim().replace(/[，、;；]/g, ',').split(',');
  if (parts.length !== 2) return null;
  const lat = parseCoordPart(parts[0]);
  const lng = parseCoordPart(parts[1]);
  if (!lat || !lng) return null;
  if (Math.abs(lat.value) > 90 || Math.abs(lng.value) > 180) return null;
  return [lat, lng];
}

function hemisphereLetter(value: number, positive: 'N' | 'E', negative: 'S' | 'W') {
  return value >= 0 ? positive : negative;
}

/**
 * Formats one hemisphere pair as decimal degrees / degrees-minutes /
 * degrees-minutes-seconds at the requested precision.
 */
export function formatDmsParts(
  parts: [CoordPart, CoordPart],
  precision: number,
): { dd: string; dm: string; dms: string } {
  const [lat, lng] = parts;

  const dd = (p: CoordPart, pos: 'N' | 'E', neg: 'S' | 'W') =>
    `${Math.abs(p.value).toFixed(precision)}°${hemisphereLetter(p.value, pos, neg)}`;

  const dm = (p: CoordPart, pos: 'N' | 'E', neg: 'S' | 'W') => {
    const abs = Math.abs(p.value);
    const deg = Math.floor(abs);
    const min = (abs - deg) * 60;
    return `${deg}°${min.toFixed(precision)}′${hemisphereLetter(p.value, pos, neg)}`;
  };

  const dms = (p: CoordPart, pos: 'N' | 'E', neg: 'S' | 'W') => {
    const abs = Math.abs(p.value);
    const deg = Math.floor(abs);
    const minFull = (abs - deg) * 60;
    const min = Math.floor(minFull);
    const sec = (minFull - min) * 60;
    return `${deg}°${min}′${sec.toFixed(precision)}″${hemisphereLetter(p.value, pos, neg)}`;
  };

  return {
    dd: `${dd(lat, 'N', 'S')}, ${dd(lng, 'E', 'W')}`,
    dm: `${dm(lat, 'N', 'S')}, ${dm(lng, 'E', 'W')}`,
    dms: `${dms(lat, 'N', 'S')}, ${dms(lng, 'E', 'W')}`,
  };
}
