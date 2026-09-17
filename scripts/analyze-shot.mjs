/**
 * Structural analysis of a design-reference screenshot, for use when the model
 * cannot view images. Reports metadata, palette, horizontal section bands and
 * ASCII maps of luminance + edge density so layout structure is readable as text.
 *
 * Usage: node /tmp/analyze-shot.mjs <image.png> [cols]
 */
import sharp from 'sharp';

const file = process.argv[2];
const COLS = Number(process.argv[3] ?? 78);

const meta = await sharp(file).metadata();
const aspect = meta.height / meta.width;
const rows = Math.max(1, Math.round(COLS * aspect * 0.46)); // 0.46 ≈ char cell aspect

const { data, info } = await sharp(file)
  .resize(COLS, rows, { fit: 'fill' })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const ch = info.channels;
const lum = new Float64Array(COLS * rows);
const rgb = new Array(COLS * rows);
for (let i = 0; i < COLS * rows; i++) {
  const r = data[i * ch];
  const g = data[i * ch + 1];
  const b = data[i * ch + 2];
  lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  rgb[i] = [r, g, b];
}

console.log(`FILE      ${file}`);
console.log(`SIZE      ${meta.width} x ${meta.height}  (aspect 1:${aspect.toFixed(2)})`);
console.log(`SAMPLED   ${COLS} x ${rows} cells, ${(meta.width / COLS).toFixed(1)} px per cell`);
console.log();

// ---------------------------------------------------------------- palette
const buckets = new Map();
for (const [r, g, b] of rgb) {
  const key = `${r >> 4},${g >> 4},${b >> 4}`;
  const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
  e.n++; e.r += r; e.g += g; e.b += b;
  buckets.set(key, e);
}
const total = rgb.length;
const hex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
console.log('PALETTE (top 12 by area)');
for (const e of [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 12)) {
  const r = e.r / e.n, g = e.g / e.n, b = e.b / e.n;
  console.log(
    `  ${hex(r, g, b)}  ${((e.n / total) * 100).toFixed(1).padStart(5)}%  rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
  );
}
console.log();

// ------------------------------------------------- section bands (row profile)
// A row is "content" when its luminance deviates from the local background or
// carries high horizontal detail; flat runs of near-identical rows are gutters.
const rowMean = new Float64Array(rows);
const rowDetail = new Float64Array(rows);
for (let y = 0; y < rows; y++) {
  let sum = 0, detail = 0;
  for (let x = 0; x < COLS; x++) {
    const v = lum[y * COLS + x];
    sum += v;
    if (x > 0) detail += Math.abs(v - lum[y * COLS + x - 1]);
  }
  rowMean[y] = sum / COLS;
  rowDetail[y] = detail / (COLS - 1);
}
const pxPerRow = meta.height / rows;
console.log('ROW PROFILE  (y=page px, mean luminance 0-255, detail = horizontal edge energy)');
console.log('  y_start  y_end   height  meanLum  detail');
let y = 0;
const segments = [];
while (y < rows) {
  let end = y;
  // extend while the row character stays similar (same flatness class)
  const flat = rowDetail[y] < 3;
  while (end + 1 < rows && (rowDetail[end + 1] < 3) === flat) end++;
  segments.push({ y, end, flat, mean: rowMean.slice(y, end + 1).reduce((a, b) => a + b, 0) / (end - y + 1) });
  y = end + 1;
}
for (const s of segments) {
  if (s.end - s.y + 1 < 2 && segments.length > 24) continue; // skip 1-row noise on long pages
  console.log(
    `  ${String(Math.round(s.y * pxPerRow)).padStart(7)} ${String(Math.round((s.end + 1) * pxPerRow)).padStart(7)}` +
    ` ${String(Math.round((s.end - s.y + 1) * pxPerRow)).padStart(7)}` +
    ` ${s.mean.toFixed(0).padStart(8)}  ${(s.flat ? 'flat/gutter' : 'content').padStart(12)}`
  );
}
console.log();

// ------------------------------------------------------------- ASCII maps
const RAMP = ' .:-=+*#%@';
function luminanceMap() {
  const vals = [...lum].sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.02)];
  const hi = vals[Math.floor(vals.length * 0.98)];
  const span = Math.max(1, hi - lo);
  const out = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < COLS; x++) {
      const t = Math.min(1, Math.max(0, (lum[y * COLS + x] - lo) / span));
      line += RAMP[Math.round(t * (RAMP.length - 1))];
    }
    out.push(line);
  }
  return out;
}
function edgeMap() {
  const out = [];
  const mag = new Float64Array(COLS * rows);
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < COLS - 1; x++) {
      const gx = lum[y * COLS + x + 1] - lum[y * COLS + x - 1];
      const gy = lum[(y + 1) * COLS + x] - lum[(y - 1) * COLS + x];
      mag[y * COLS + x] = Math.hypot(gx, gy);
    }
  }
  const mx = Math.max(...mag);
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < COLS; x++) {
      const t = Math.min(1, mag[y * COLS + x] / (mx * 0.35));
      line += t < 0.12 ? ' ' : RAMP[Math.round(t * (RAMP.length - 1))];
    }
    out.push(line);
  }
  return out;
}

function printMap(title, lines, from = 0, to = rows) {
  console.log(`${title}  (rows ${Math.round(from * pxPerRow)}–${Math.round(to * pxPerRow)} px)`);
  const gutter = ' '.repeat(String(to).length);
  for (let y = from; y < to; y++) {
    console.log(`  ${String(y).padStart(3)}|${lines[y]}`);
  }
  console.log();
}

const lumMap = luminanceMap();
const edgMap = edgeMap();

console.log('='.repeat(COLS + 6));
console.log('LUMINANCE MAP — whole page (dark=space, light=@)');
console.log('='.repeat(COLS + 6));
printMap('', lumMap, 0, Math.min(rows, 60));
console.log('='.repeat(COLS + 6));
console.log('EDGE MAP — whole page (content/text/card borders show as marks)');
console.log('='.repeat(COLS + 6));
printMap('', edgMap, 0, Math.min(rows, 120));
