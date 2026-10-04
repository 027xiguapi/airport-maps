#!/usr/bin/env node
/**
 * Static route-map renders for public/route, used by the homepage route strip
 * and by the airport page's route section: the world outline plus the
 * great-circle routes out of one airport, rasterised with sharp.
 *
 * The frame is the same for every render — the whole world in longitude across
 * the width, the equator on the middle line — so a new render lines up with the
 * committed ones pixel for pixel and a route always leaves the hub in the same
 * direction it does on the interactive map. Coastlines are Natural Earth via
 * world-atlas, unwrapped so a ring straddling the antimeridian draws as the
 * landmass it is rather than a line across the map.
 *
 * Routes come from the same dump the route pages draw from
 * (data/airport-routes.json) and the destination dots use the same tiers as the
 * interactive map (lib/route-tiers.ts), so a render never disagrees with the
 * page it previews.
 *
 * Default targets are the airports the site covers, ranked by how many
 * destinations the dump gives them — the top 12 the homepage strip shows, so the
 * two cannot drift apart. Existing files are skipped, because renders are
 * expensive and the committed ones are already good; pass --force to redo them,
 * or --codes for airports outside the default set.
 *
 *   node scripts/generate-route-images.mjs                  # top 12, skip existing
 *   node scripts/generate-route-images.mjs --codes ICN,AMS  # specific airports
 *   node scripts/generate-route-images.mjs --force          # redo the top 12
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { feature } from 'topojson-client';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE_DIR = join(ROOT, 'public', 'route');

/** Output size; the SVG is drawn at 2× and downsampled for crisp text and lines. */
const WIDTH = 690;
const HEIGHT = 450;
const SUPERSAMPLE = 2;
const DEG = Math.PI / 180;

/** 360° of longitude across the width, so the frame is the world every time. */
const WORLD_SCALE = WIDTH / 360;

const COLORS = {
  ocean: '#ffffff',
  /** Continents, matching the cover images' light blue-grey. */
  land: '#e2eaf2',
  /** Route lines: one red at low alpha, so overlaps darken the way the map's do. */
  route: 'rgba(226, 94, 85, 0.42)',
  routeWidth: 1.5,
  label: '#5A768B',
  labelSize: 13,
  labelHalo: '#ffffff',
  hubDot: '#F08A3C',
  hubDiameter: 22,
  hubLabel: '#1E3B52',
  hubLabelSize: 16,
};

/** Destination tiers, mirroring lib/route-tiers.ts (plain JS script, so duplicated). */
const TIERS = [
  { min: 6, color: '#2FB457', hollow: false },
  { min: 3, color: '#3B82F6', hollow: false },
  { min: 2, color: '#F08A3C', hollow: false },
  { min: 1, color: '#8FA3B6', hollow: true },
];

/** Most labels a dense network may carry before it stops being readable. */
const MAX_LABELS = 12;

const tierOf = (carrierCount) =>
  TIERS.find((tier) => carrierCount >= tier.min) ?? TIERS[TIERS.length - 1];

/** Rough advance width — good enough to keep label boxes from colliding. */
const textWidth = (text, size, bold = false) => text.length * size * (bold ? 0.54 : 0.5);

const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The place name to print. The world index spells a couple of cities as
 * "Changsha (Changsha)" — the parenthetical is the airport's district and only
 * repeats the name, which reads as a mistake on a label.
 */
const labelText = (place) =>
  (place.city || place.name).replace(/^(.+?)\s*\(\1\)$/i, '$1');

// ------------------------------------------------------------------ arguments

function parseArgs(argv) {
  const options = { codes: null, top: 12, force: false, out: ROUTE_DIR };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--codes')
      options.codes = (argv[++i] ?? '')
        .split(',')
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean);
    else if (arg === '--top') options.top = Number(argv[++i] ?? 0);
    else if (arg === '--out') options.out = join(ROOT, argv[++i] ?? '');
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

// ---------------------------------------------------------------- projections

/** Web Mercator northing for a latitude, in degree-equivalent units. */
function mercatorY(lat) {
  const clamped = Math.max(-85, Math.min(85, lat));
  return -Math.log(Math.tan(Math.PI / 4 + (clamped * DEG) / 2)) / DEG;
}

/** The one frame: `lng` −180…180 across the width, latitude centred on the equator. */
const project = (lat, lng) => [
  (lng + 180) * WORLD_SCALE,
  HEIGHT / 2 + mercatorY(lat) * WORLD_SCALE,
];

/**
 * Points along the great circle from a to b as [lat, lng] pairs — the same
 * interpolation the interactive map uses, so an arc bends the same way here.
 */
function greatCirclePoints(a, b, segments) {
  const [φ1, λ1, φ2, λ2] = [a.lat * DEG, a.lng * DEG, b.lat * DEG, b.lng * DEG];
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
  if (d < 1e-9) return [[a.lat, a.lng], [b.lat, b.lng]];

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    points.push([
      (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI,
      (Math.atan2(y, x) * 180) / Math.PI,
    ]);
  }
  return points;
}

// -------------------------------------------------------------------- drawing

/**
 * Land rings in world coordinates. Natural Earth cuts its polygons at ±180 and
 * repeats the first vertex last, so every ring is unwrapped into one continuous
 * run of longitudes and closed against the vertex that belongs beside its last
 * point — otherwise a ring straddling the antimeridian draws a straight line
 * clean across the map.
 */
function loadLandRings() {
  const topology = JSON.parse(
    readFileSync(join(ROOT, 'node_modules', 'world-atlas', 'land-110m.json'), 'utf8')
  );
  // world-atlas ships `land` as a GeometryCollection, so `feature` hands back a
  // FeatureCollection; either shape has to reduce to a list of polygons.
  const land = feature(topology, topology.objects.land);
  const geometries = (land.type === 'FeatureCollection' ? land.features : [land]).map(
    (item) => item.geometry
  );
  const polygons = geometries.flatMap((geometry) =>
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  );

  const rings = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      // Skip specks: under a degree across they only add scenery noise.
      const xs = ring.map((point) => point[0]);
      const ys = ring.map((point) => point[1]);
      if (Math.max(...xs) - Math.min(...xs) < 0.8 && Math.max(...ys) - Math.min(...ys) < 0.8) continue;

      const unwrapped = [ring[0]];
      for (let i = 1; i < ring.length; i++) {
        let lng = ring[i][0];
        const previous = unwrapped[i - 1][0];
        while (lng - previous > 180) lng -= 360;
        while (previous - lng > 180) lng += 360;
        unwrapped.push([lng, ring[i][1]]);
      }
      const min = Math.min(...unwrapped.map((point) => point[0]));
      const max = Math.max(...unwrapped.map((point) => point[0]));
      rings.push({ ring: unwrapped, min, max });
    }
  }
  return rings;
}

/** The copy of `lng` (±360°) that sits closest to `reference`. */
function nearestCopy(lng, reference) {
  let value = lng;
  while (value - reference > 180) value -= 360;
  while (reference - value > 180) value += 360;
  return value;
}

function landPath(ring, shift) {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i][1], ring[i][0] + shift);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  // Close against the neighbour of the last vertex, not the literal first one,
  // which unwrapping may have left a full turn away.
  const [x, y] = project(ring[0][1], nearestCopy(ring[0][0], ring[ring.length - 1][0]) + shift);
  return `${d}L${x.toFixed(1)} ${y.toFixed(1)}Z`;
}

/**
 * The airport's own marker: an orange dot with a white ring and a plane, nose
 * up-right — the same glyph the homepage tiles and map pins use.
 */
function hubMarker([x, y]) {
  const radius = COLORS.hubDiameter / 2;
  const planeScale = 12.5 / 24;
  // Material "flight" is 24×24 with the nose up; scale it down, then turn 45°.
  return (
    `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">` +
    `<circle r="${(radius + 2.5).toFixed(1)}" fill="${COLORS.labelHalo}"/>` +
    `<circle r="${radius}" fill="${COLORS.hubDot}"/>` +
    `<path transform="rotate(45) scale(${planeScale.toFixed(4)}) translate(-12 -12.5)" fill="${COLORS.labelHalo}" ` +
    `d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>` +
    `</g>`
  );
}

/**
 * A label with a white halo, so it stays legible wherever it lands. The halo is
 * a separate stroked pass under the filled one rather than paint-order, which
 * older librsvg builds ignore (painting the stroke over the glyphs).
 */
function label({ x, y, text, size, color, bold, anchor }) {
  const attributes =
    `x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="${size.toFixed(1)}" text-anchor="${anchor}"` +
    (bold ? ' font-weight="bold"' : '');
  return (
    `<text ${attributes} fill="none" stroke="${COLORS.labelHalo}" stroke-width="${(size * 0.28).toFixed(1)}" ` +
    `stroke-linejoin="round">${esc(text)}</text>` +
    `<text ${attributes} fill="${color}">${esc(text)}</text>`
  );
}

/** Renders one airport's network, mirroring the interactive map's draw order. */
function renderSvg({ iata, city, lat, lng, destinations, land }) {
  const scale = SUPERSAMPLE;
  const at = (lat_, lng_) => {
    const [x, y] = project(lat_, lng_);
    return [x * scale, y * scale];
  };

  const parts = [
    `<rect width="${WIDTH * scale}" height="${HEIGHT * scale}" fill="${COLORS.ocean}"/>`,
  ];

  // Continents. A ring (or a copy of one) shifted a full turn only shows when it
  // reaches past the frame's edge, which is how the cut landmasses on either
  // side of the antimeridian get drawn.
  let continents = '';
  for (const { ring, min, max } of land) {
    for (const shift of [-360, 0, 360]) {
      if (min + shift > 180 || max + shift < -180) continue;
      continents += landPath(ring, shift);
    }
  }
  parts.push(`<g transform="scale(${scale})"><path d="${continents}" fill="${COLORS.land}"/></g>`);

  // Routes: great-circle arcs, unwrapped into one continuous run of longitudes
  // so a route across the antimeridian stays a single line instead of doubling
  // back over the map.
  let routes = '';
  for (const destination of destinations) {
    const segments = Math.min(48, Math.max(8, Math.round(destination.km / 400)));
    const arc = greatCirclePoints({ lat, lng }, destination, segments);
    const unwrapped = [];
    let previous = null;
    for (const [arcLat, arcLng] of arc) {
      let value = arcLng;
      while (previous !== null && value - previous > 180) value -= 360;
      while (previous !== null && previous - value > 180) value += 360;
      previous = value;
      unwrapped.push([arcLat, value]);
    }

    const min = Math.min(...unwrapped.map((point) => point[1]));
    const max = Math.max(...unwrapped.map((point) => point[1]));
    for (const shift of [-360, 0, 360]) {
      if (min + shift > 180 || max + shift < -180) continue;
      let d = '';
      for (const [arcLat, value] of unwrapped) {
        const [x, y] = at(arcLat, value + shift);
        d += `${d === '' ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      routes +=
        `<path d="${d}" fill="none" stroke="${COLORS.route}" ` +
        `stroke-width="${(COLORS.routeWidth * scale).toFixed(1)}" stroke-linecap="round"/>`;
    }
  }
  parts.push(routes);

  // Destination dots, weakest tier first, so busy hubs sit on top.
  let dots = '';
  for (let tierIndex = TIERS.length - 1; tierIndex >= 0; tierIndex--) {
    const tier = TIERS[tierIndex];
    for (const destination of destinations) {
      if (tierOf(destination.carriers.length) !== tier) continue;
      const [x, y] = at(destination.lat, destination.lng);
      const radius = (tier.hollow ? 3.8 : 4) * scale;
      dots += tier.hollow
        ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="none" ` +
          `stroke="${tier.color}" stroke-width="${(1.4 * scale).toFixed(1)}"/>`
        : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="${tier.color}"/>`;
    }
  }
  parts.push(dots);

  // Most-served destinations get a label where one fits without collision. The
  // hub's own label is reserved up front so nothing is placed under it.
  const [hubX, hubY] = at(lat, lng);
  const hubText = `${city} (${iata})`;
  const hubGap = 15 * scale;
  const hubWidth = textWidth(hubText, COLORS.hubLabelSize, true) * scale;
  // Airports near the frame's edge would have their label cut off, so the hub's
  // own label flips to the other side of the dot when the right edge is too near.
  const hubToRight = hubX + hubGap + hubWidth <= WIDTH * scale - scale;
  const hubLabelX = hubToRight ? hubX + hubGap : hubX - hubGap;
  const taken = [
    {
      x: hubToRight ? hubLabelX - 2 * scale : hubLabelX - hubWidth - 2 * scale,
      y: hubY - 9 * scale,
      w: hubWidth + 4 * scale,
      h: 20 * scale,
    },
  ];

  const candidates = [...destinations]
    .filter((destination) => destination.carriers.length >= 2)
    .sort((a, b) => b.carriers.length - a.carriers.length || a.km - b.km);

  let labels = '';
  let placed = 0;
  for (const destination of candidates) {
    if (placed >= MAX_LABELS) break;
    const [x, y] = at(destination.lat, destination.lng);
    const text = labelText(destination);
    const width = textWidth(text, COLORS.labelSize);
    const spots = [
      { x: x + 6 * scale, y: y + 4.4 * scale, anchor: 'start' },
      { x: x - 6 * scale, y: y + 4.4 * scale, anchor: 'end' },
      { x, y: y - 7 * scale, anchor: 'middle' },
      { x, y: y + 13 * scale, anchor: 'middle' },
    ];
    const spot = spots.find((option) => {
      const left =
        option.anchor === 'start'
          ? option.x
          : option.anchor === 'end'
            ? option.x - width * scale
            : option.x - (width * scale) / 2;
      const box = {
        x: left - 2 * scale,
        y: option.y - 11 * scale,
        w: width * scale + 4 * scale,
        h: 15 * scale,
      };
      // Never let a label run off the frame; the ones that would are simply
      // dropped, as the busiest destinations are already labelled.
      if (box.x < 0 || box.x + box.w > WIDTH * scale) return false;
      return !taken.some((other) => overlaps(box, other));
    });
    if (!spot) continue;

    const left =
      spot.anchor === 'start'
        ? spot.x
        : spot.anchor === 'end'
          ? spot.x - width * scale
          : spot.x - (width * scale) / 2;
    taken.push({
      x: left - 2 * scale,
      y: spot.y - 11 * scale,
      w: width * scale + 4 * scale,
      h: 15 * scale,
    });
    labels += label({
      x: spot.x + (spot.anchor === 'start' ? scale : spot.anchor === 'end' ? -scale : 0),
      y: spot.y,
      text,
      size: COLORS.labelSize * scale,
      color: COLORS.label,
      anchor: spot.anchor,
    });
    placed++;
  }
  parts.push(labels);

  parts.push(hubMarker([hubX, hubY]));
  parts.push(
    label({
      x: hubLabelX,
      y: hubY + 5.5 * scale,
      text: hubText,
      size: COLORS.hubLabelSize * scale,
      color: COLORS.hubLabel,
      bold: true,
      anchor: hubToRight ? 'start' : 'end',
    })
  );

  const size = `${WIDTH * scale} ${HEIGHT * scale}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH * scale}" height="${HEIGHT * scale}" viewBox="0 0 ${size}">${parts.join('')}</svg>`;
}

const overlaps = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// ----------------------------------------------------------------------- main

const options = parseArgs(process.argv.slice(2));
const routesFile = JSON.parse(readFileSync(join(ROOT, 'data', 'airport-routes.json'), 'utf8'));
const world = JSON.parse(readFileSync(join(ROOT, 'public', 'data', 'world-airports.json'), 'utf8'));
const places = new Map(
  world.airports.map(([iata, name, city, , , , lat, lng]) => [iata, { name, city, lat, lng }])
);

/** IATA codes the site itself covers: the two seed inputs, minus overlap. */
function siteAirports() {
  const legacy = JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-data.json'), 'utf8'));
  const directory = JSON.parse(readFileSync(join(ROOT, 'scripts', 'directory-data.json'), 'utf8'));
  const codes = new Set(legacy.airports.map((airport) => airport.iata));
  for (const airport of directory.airports) codes.add(airport.iata);
  return codes;
}

/** Explicit --codes, else the site's busiest airports — the homepage strip's ranking. */
function targets() {
  if (options.codes?.length) return options.codes;
  const known = siteAirports();
  return Object.entries(routesFile.airports)
    .filter(([iata, entry]) => known.has(iata) && entry.destinations.length > 0)
    .sort(
      (a, b) => b[1].destinations.length - a[1].destinations.length || a[0].localeCompare(b[0])
    )
    .slice(0, options.top)
    .map(([iata]) => iata);
}

/** The hub plus every destination the world index can place, or null. */
function networkFor(iata) {
  const origin = places.get(iata);
  const raw = routesFile.airports[iata];
  if (!origin || !raw) return null;
  const destinations = raw.destinations.flatMap((destination) => {
    const place = places.get(destination.iata);
    return place
      ? [
          {
            name: place.name,
            city: place.city,
            lat: place.lat,
            lng: place.lng,
            km: destination.km,
            carriers: destination.carriers,
          },
        ]
      : [];
  });
  return destinations.length > 0 ? { ...origin, iata, destinations } : null;
}

const land = loadLandRings();
mkdirSync(options.out, { recursive: true });

let rendered = 0;
let skipped = 0;
for (const iata of targets()) {
  const file = join(options.out, `${iata}.png`);
  if (existsSync(file) && !options.force) {
    skipped++;
    continue;
  }
  const network = networkFor(iata);
  if (!network) {
    console.warn(`${iata}: no route data — skipped`);
    continue;
  }
  const svg = renderSvg({ ...network, land });
  await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(file);
  rendered++;
  console.log(`${iata}: ${network.destinations.length} destinations -> ${file}`);
}

console.log(`Rendered ${rendered}, skipped ${skipped} existing.`);
