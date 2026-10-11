/**
 * Remove the 小红书 (Xiaohongshu) watermark - the rounded "小红书" badge and the
 * "小红书号：<id>" caption - from the bottom-right corner of post images.
 *
 * Usage: node scripts/strip-xiaohongshu-watermark.mjs <dir> <file.webp> [more files...]
 * The watermark sits at fixed coordinates on these 1080x1445 poster images.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const W = 1080, H = 1445, N = W * H;

const THRESH = 140;    // watermark ink/fill is far brighter than any background here
const DIL_CORE = 3;    // swallow the antialiased outline of the glyphs/badge
const DIL_ALPHA = 2;   // extra ring that gets feathered
const FEATHER_R = 2;

// "小红书" badge and "小红书号：<id>" caption, with a few px of margin. The mask
// may never leave these boxes, so photo content outside them is untouched.
const BADGE = { x0: 962, x1: 1054, y0: 1345, y1: 1388 };
const CAPTION = { x0: 778, x1: 1060, y0: 1387, y1: 1424 };

// Some posts have a divider rule running under the last bullet, just above the
// badge. Those rows must survive untouched, so they are never masked and the
// fill must not treat them as a brightness source either.
const RULE_ROWS = [1344, 1345, 1346];

const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

function boxBlur(src, r, passes) {
  let cur = src;
  for (let p = 0; p < passes; p++) {
    const tmp = new Float32Array(N);
    for (let y = 0; y < H; y++) {
      let sum = 0;
      for (let x = -r; x <= r; x++) sum += cur[y * W + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = sum / (2 * r + 1);
        sum -= cur[y * W + Math.max(0, x - r)];
        sum += cur[y * W + Math.min(W - 1, x + r + 1)];
      }
    }
    const out = new Float32Array(N);
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let y = -r; y <= r; y++) sum += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        out[y * W + x] = sum / (2 * r + 1);
        sum -= tmp[Math.max(0, y - r) * W + x];
        sum += tmp[Math.min(H - 1, y + r + 1) * W + x];
      }
    }
    cur = out;
  }
  return cur;
}

function dilate(m, r, roi, protect) {
  const out = new Uint8Array(N);
  for (let y = roi.y0; y <= roi.y1; y++) {
    if (protect?.has(y)) continue;
    for (let x = roi.x0; x <= roi.x1; x++) {
      let hit = 0;
      for (let dy = -r; dy <= r && !hit; dy++) {
        const ny = y + dy; if (ny < roi.y0 || ny > roi.y1) continue;
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx; if (nx < roi.x0 || nx > roi.x1) continue;
          if (m[ny * W + nx]) { hit = 1; break; }
        }
      }
      if (hit) out[y * W + x] = 1;
    }
  }
  return out;
}

/** pixels enclosed by mask ink: the dark 小红书 glyphs inside the badge */function fillHoles(m, roi, protect) {
  const out = Uint8Array.from(m);
  const seen = new Uint8Array(N);
  const stack = [];
  for (let x = roi.x0; x <= roi.x1; x++) stack.push(roi.y0 * W + x, roi.y1 * W + x);
  for (let y = roi.y0; y <= roi.y1; y++) stack.push(y * W + roi.x0, y * W + roi.x1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || out[i] || protect?.has((i / W) | 0)) continue;
    seen[i] = 1;
    const x = i % W, y = (i / W) | 0;
    if (x > roi.x0) stack.push(i - 1);
    if (x < roi.x1) stack.push(i + 1);
    if (y > roi.y0) stack.push(i - W);
    if (y < roi.y1) stack.push(i + W);
  }
  for (let y = roi.y0; y <= roi.y1; y++)
    for (let x = roi.x0; x <= roi.x1; x++) {
      const i = y * W + x;
      if (!out[i] && !seen[i]) out[i] = 1;
    }
  return out;
}

/**
 * The divider rule above the badge is bright; letting it act as the fill's
 * ceiling smears a glow underneath it. Borrow the darkness from the row above.
 */
function overrideRuleRows(src, buf) {
  const srcRow = (RULE_ROWS[0] - 1) * W;
  for (const y of RULE_ROWS)
    for (let x = BADGE.x0 - 2; x <= BADGE.x1 + 2; x++) {
      const j = (y * W + x) * 3, k = (srcRow + x) * 3;
      buf[j] = src[k]; buf[j + 1] = src[k + 1]; buf[j + 2] = src[k + 2];
    }
}

/** fraction of masked pixels where `buf` is more than `tol` brighter than `ref` */
function brighterFraction(buf, ref, mask, tol) {
  let hit = 0, total = 0;
  for (let i = 0; i < N; i++) {
    if (!mask[i]) continue;
    const j = i * 3;
    const a = 0.299 * buf[j] + 0.587 * buf[j + 1] + 0.114 * buf[j + 2];
    const b = 0.299 * ref[j] + 0.587 * ref[j + 1] + 0.114 * ref[j + 2];
    total++;
    if (a - b > tol) hit++;
  }
  return total ? hit / total : 0;
}

/**
 * Diffusion fill (SOR): solve the Laplace equation inside the mask, using the
 * surrounding photo as the Dirichlet boundary. Gives a smooth, plausible fill
 * on flat backgrounds.
 */
function diffusionFill(src, ch, mask, protect, listIn) {
  const list = listIn ?? [];
  if (!listIn) for (let i = 0; i < N; i++) if (mask[i]) list.push(i);

  for (const i of list) {
    const x = i % W, y = (i / W) | 0, j = i * 3;
    let s0 = 0, s1 = 0, s2 = 0, n = 0;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const ni = ny * W + nx;
      if (mask[ni]) continue;
      const k = ni * 3; s0 += ch[k]; s1 += ch[k + 1]; s2 += ch[k + 2]; n++;
    }
    if (n) { ch[j] = s0 / n; ch[j + 1] = s1 / n; ch[j + 2] = s2 / n; }
    else { ch[j] = ch[j + 1] = ch[j + 2] = 0; }
  }

  const omega = 1.9;
  for (let it = 0; it < 3500; it++) {
    for (let li = 0; li < list.length; li++) {
      const i = list[li], x = i % W, y = (i / W) | 0, j = i * 3;
      const a = (y > 0 ? i - W : i) * 3, b = (y < H - 1 ? i + W : i) * 3;
      const c = (x > 0 ? i - 1 : i) * 3, d = (x < W - 1 ? i + 1 : i) * 3;
      for (let k = 0; k < 3; k++) {
        const v = (ch[a + k] + ch[b + k] + ch[c + k] + ch[d + k]) * 0.25;
        ch[j + k] += omega * (v - ch[j + k]);
      }
    }
  }
}

/**
 * Copy-based fill: look for the nearby patch whose border best matches the
 * border of what we are erasing, then clone it. This keeps real texture (wood
 * grain, floor shading) and reconnects edges that run into the watermark.
 */
function cloneFill(src, hole, union, bbox, minOff, maxOff, step) {
  const { x0, y0, x1, y1 } = bbox;
  // integral image of the whole watermark mask, so a source that would copy any
  // watermark pixel (including the other box's) gets rejected
  const pw = W + 1;
  const integral = new Int32Array(pw * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += union[y * W + x];
      integral[(y + 1) * pw + (x + 1)] = integral[y * pw + (x + 1)] + row;
    }
  }
  const overlap = (ax, ay, bx, by) => {
    ax = Math.max(0, ax); ay = Math.max(0, ay);
    bx = Math.min(W - 1, bx); by = Math.min(H - 1, by);
    if (ax > bx || ay > by) return 1;
    return integral[(by + 1) * pw + (bx + 1)] - integral[ay * pw + (bx + 1)]
         - integral[(by + 1) * pw + ax] + integral[ay * pw + ax];
  };

  // ring = the photo immediately around the hole, our matching target
  const RING = 4;
  const ring = [];
  for (let y = y0 - RING; y <= y1 + RING; y++) {
    if (y < 0 || y >= H) continue;
    for (let x = x0 - RING; x <= x1 + RING; x++) {
      if (x < 0 || x >= W) continue;
      const i = y * W + x;
      if (hole[i]) continue;
      let near = 0;
      for (let dy = -RING; dy <= RING && !near; dy++)
        for (let dx = -RING; dx <= RING; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
          if (hole[ny * W + nx]) { near = 1; break; }
        }
      if (near) ring.push(i);
    }
  }

  const target = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (hole[y * W + x]) target.push(y * W + x);

  // coarse-to-fine offset search
  const search = (to, stp, best) => {
    for (let dy = -to; dy <= to; dy += stp) {
      for (let dx = -to; dx <= to; dx += stp) {
        if (Math.abs(dx) < minOff && Math.abs(dy) < minOff) continue;
        if (overlap(x0 + dx, y0 + dy, x1 + dx, y1 + dy)) continue;   // would copy the watermark
        let cost = 0;
        for (let ri = 0; ri < ring.length; ri++) {
          const p = ring[ri];
          const q = p + dy * W + dx;
          if (q < 0 || q >= N) { cost = Infinity; break; }
          const a = p * 3, b = q * 3;
          cost += Math.abs(src[a] - src[b]) + Math.abs(src[a + 1] - src[b + 1]) + Math.abs(src[a + 2] - src[b + 2]);
          if (cost >= (best?.cost ?? Infinity)) { cost = Infinity; break; }
        }
        if (cost < (best?.cost ?? Infinity)) best = { cost, dx, dy };
      }
    }
    return best;
  };
  let best = search(maxOff, step, null);
  if (best) best = search(2 * step, 1, best);
  if (!best || !isFinite(best.cost)) return null;

  // Match the cloned patch's level to the destination (seamless-clone style):
  // otherwise a patch copied from darker floor reads as a visible dark block.
  const d0 = [], d1 = [], d2 = [];
  for (const p of ring) {
    const q = p + best.dy * W + best.dx;
    if (q < 0 || q >= N) continue;
    const a = p * 3, b = q * 3;
    d0.push(src[a] - src[b]); d1.push(src[a + 1] - src[b + 1]); d2.push(src[a + 2] - src[b + 2]);
  }
  const med = (arr) => { arr.sort((x, y) => x - y); return arr[arr.length >> 1] ?? 0; };
  const shift = [med(d0), med(d1), med(d2)];

  const fill = new Float32Array(N * 3);
  for (const i of target) {
    const q = i + best.dy * W + best.dx;
    const a = i * 3, b = q * 3;
    for (let k = 0; k < 3; k++) {
      const v = src[b + k] + shift[k];
      fill[a + k] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  return { fill, dx: best.dx, dy: best.dy, shift };
}

export async function dewatermark(srcPath, dstPath) {
  const fileBuf = fs.readFileSync(srcPath);   // no lingering handle, so dst can be renamed over src
  const { data: src } = await sharp(fileBuf).raw().toBuffer({ resolveWithObject: true });
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) { const j = i * 3; lum[i] = 0.299 * src[j] + 0.587 * src[j + 1] + 0.114 * src[j + 2]; }

  // only guard the divider rule when one is actually present next to the badge
  const ruleRow = RULE_ROWS[1];
  let hasRule = false;
  for (let x = BADGE.x0; x <= BADGE.x1; x++) if (lum[ruleRow * W + x] > 150) hasRule = true;
  const protect = hasRule ? new Set(RULE_ROWS) : null;

  const FILL = process.env.FILL || 'clone';   // 'clone' | 'diffusion'

  const core = new Uint8Array(N), alphaMask = new Uint8Array(N);
  const rois = [];
  for (const roi of [BADGE, CAPTION]) {
    const ink = new Uint8Array(N);
    for (let y = roi.y0; y <= roi.y1; y++) {
      if (protect?.has(y)) continue;
      for (let x = roi.x0; x <= roi.x1; x++) if (lum[y * W + x] > THRESH) ink[y * W + x] = 1;
    }
    const c = dilate(fillHoles(ink, roi, protect), DIL_CORE, roi, protect);
    const a = dilate(c, DIL_ALPHA, roi, protect);
    let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
    for (let y = roi.y0; y <= roi.y1; y++) for (let x = roi.x0; x <= roi.x1; x++) {
      if (!c[y * W + x]) continue;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
    rois.push({ core: c, alphaMask: a, bbox: { x0: bx0, y0: by0, x1: bx1, y1: by1 } });
    for (let i = 0; i < N; i++) { if (c[i]) core[i] = 1; if (a[i]) alphaMask[i] = 1; }
  }

  const list = [];
  for (let i = 0; i < N; i++) if (core[i]) list.push(i);

  const ch = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const j = i * 3; ch[j] = src[j]; ch[j + 1] = src[j + 1]; ch[j + 2] = src[j + 2]; }


  const copyInto = (dst, srcBuf, mask, from, to) => {
    for (let i = from; i < to; i++) {
      if (!mask[i]) continue;
      const j = i * 3;
      dst[j] = srcBuf[j]; dst[j + 1] = srcBuf[j + 1]; dst[j + 2] = srcBuf[j + 2];
    }
  };

  if (FILL === 'clone') {
    // The badge lands on real content - a bag strap, wood grain - so cloning the
    // best-matching nearby patch keeps that texture and reconnects those edges.
    // The caption always sits on flat ground, where diffusion is already clean.
    for (const { core: c, bbox } of rois) {
      const isBadge = bbox.y1 < CAPTION.y0;
      const scratch = () => { const b = new Float32Array(N * 3); b.set(src); return b; };

      // smooth, seam-consistent reference fill for this hole
      const dRef = scratch();
      if (protect) overrideRuleRows(src, dRef);
      diffusionFill(src, dRef, c, protect);

      let use = dRef;
      if (isBadge) {
        const hit = cloneFill(src, c, core, bbox, 30, 260, 2);
        if (!hit) {
          console.log('   clone: no candidate, using diffusion');
        } else {
          // A clone that is markedly brighter over a solid chunk of the hole has
          // grabbed foreign content (a lit wall, another rule); prefer the smooth
          // seam-consistent fill there instead.
          const frac = brighterFraction(hit.fill, dRef, c, 25);
          const ok = frac <= 0.02;
          console.log(`   clone dx=${hit.dx} dy=${hit.dy} shift=[${hit.shift.map(v => v.toFixed(0))}] brighter-than-smooth ${(frac * 100).toFixed(1)}% -> ${ok ? 'clone' : 'smooth'}`);
          if (ok) use = hit.fill;
        }
      }
      copyInto(ch, use, c, 0, N);
    }
  } else {
    overrideRuleRows(src, ch);
    diffusionFill(src, ch, core, protect, list);
  }

  // grain matched to the surrounding photo, so the patch is not suspiciously flat
  let m1 = 0, m2 = 0, cnt = 0;
  for (let y = 1430; y < H - 1; y++) for (let x = 700; x < 1050; x++) {
    const i = y * W + x;
    let n = 0;
    for (const d of [-W - 1, -W, -W + 1, -1, 0, 1, W - 1, W, W + 1]) n += lum[i + d];
    const res = lum[i] - n / 9; m1 += res; m2 += res * res; cnt++;
  }
  const sigma = Math.sqrt(Math.max(0, m2 / cnt - (m1 / cnt) ** 2));
  const grain = FILL === 'clone' ? 0 : Math.min(sigma, 8) * 0.9;
  if (grain) for (const i of list) { const j = i * 3; const g = gauss() * grain; ch[j] += g; ch[j + 1] += g; ch[j + 2] += g; }

  const aRaw = new Float32Array(N);
  for (let i = 0; i < N; i++) aRaw[i] = alphaMask[i] ? 1 : 0;
  const feather = boxBlur(aRaw, FEATHER_R, 2);
  // Inside the mask the replacement has to be total: a half-blended edge row would
  // leak the bright watermark outline straight back in. Feather outward only.
  for (let i = 0; i < N; i++) if (alphaMask[i]) feather[i] = 1;

  const out = Buffer.from(src);
  for (let i = 0; i < N; i++) {
    const a = feather[i]; if (a <= 0.002) continue;
    const j = i * 3;
    for (let k = 0; k < 3; k++) {
      const v = src[j + k] * (1 - a) + ch[j + k] * a;
      out[j + k] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
    }
  }
  if (protect) {                      // rule rows are design, keep them bit-exact
    for (const y of RULE_ROWS) {
      const off = y * W * 3;
      src.copy(out, off, off, off + W * 3);
    }
  }

  // match the original's file size rather than blindly re-encoding at a fixed q
  const target = fs.statSync(srcPath).size;
  const raw = { raw: { width: W, height: H, channels: 3 } };
  let best = null;
  for (const q of [95, 92, 90, 88, 86, 84, 82, 80, 78, 75, 72]) {
    const buf = await sharp(out, raw).webp({ quality: q, effort: 6 }).toBuffer();
    if (best === null || buf.length < best.length) best = buf;
    if (buf.length <= target) { best = buf; break; }
  }
  fs.writeFileSync(dstPath, best);
  return { replaced: list.length, sigma, size: best.length, target, rule: hasRule };
}

if (process.argv[1] && process.argv[1].endsWith('strip-xiaohongshu-watermark.mjs')) {
  const dir = process.argv[2];
  for (const f of process.argv.slice(3)) {
    const p = path.join(dir, f);
    const r = await dewatermark(p, p + '.tmp.webp');
    fs.renameSync(p + '.tmp.webp', p);
    console.log(`${f}: inpainted ${r.replaced}px  sigma=${r.sigma.toFixed(2)}  rule=${r.rule}  ${r.target} -> ${r.size} bytes`);
  }
}
