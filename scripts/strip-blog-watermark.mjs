#!/usr/bin/env node
/**
 * 去掉博客图片右下角的「服务号 · 懿旅航空票务」水印。
 *
 *   node scripts/strip-blog-watermark.mjs [图片目录] [--out DIR] [--dry-run]
 *                                         [--ref FILE] [--crop-bottom N]
 *
 * ---------------------------------------------------------------------------
 * 这批图的共同点：水印是**同一个**叠加层，锚在右下角、大小只有 1~2% 的差别。
 * 它不是一个不透明的浅灰字，而是**一层约 30.7% 不透明度的黑**（`lib` 实测）：
 * 白底参考图上字心读数 177 = 255×0.693，而 T2 层示意图里被压在字下的黑色标签
 * 读数 21 ≈ 30×0.693 —— 不透明的浅灰字不可能让底下的黑字透出来，只有「压暗」
 * 才会。代入 alpha 与叠加色解得 alpha≈0.307、叠加色≈黑：白底 177 ✓、黑字 21 ✓。
 *
 * 所以**被水印盖住的内容是可以反解回来的**，不需要涂抹、模糊或内容感知填充：
 *
 *   observed = alpha * C + (1 - alpha) * background      （C ≈ 黑）
 *   background = (observed - alpha * C) / (1 - alpha)
 *
 * 逐像素反解在 alpha 取得准的时候是**恒等还原**（误差 < 0.5 灰阶）：本目录里
 * 2/4/8/9/12 五张与参考图同批次的图，反解后原水印位置回到精确的 255。其余图
 * 因为经过缩放重采样，水印的亚像素位置/边缘抗锯齿与参考图不同（实测缩放系数
 * 0.98~1.005），单靠 alpha 反解会留下 5~15 灰阶的残影。对这部分图再补一道：
 * 「只在笔画内部」用闭运算（dilate→erode）估出局部背景，把**对比度低于
 * THRESH** 的像素替换成该背景——残影是低对比度的，会被抹平；压在字下的地图
 * 标签是高对比度的，被保留。实测标签（如「国际、港澳台候机厅」）完整保留，
 * 只有抗锯齿边缘略变淡。
 *
 * 区域始终按「距右下角的像素数」表示（REGION），因此只要求图的**宽度**与参考
 * 图一致（宽度决定水印的缩放比例）；高度不同不影响对齐。宽度不同的是另一批
 * 素材（水印大小也不同，如 0.png 那种浅色水印压在卫星照片上），用
 * `--crop-bottom` 直接裁掉那一条更干净。
 *
 * 参考图必须满足「水印范围内没有任何非白内容」，否则 alpha 会被算大。默认
 * 2.png；换目录时要先把参考图的水印区域裁出来看一眼再定。
 */

import sharp from 'sharp';
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

/** 水印范围，按「距右下角的像素数」表示。 */
const REGION = { left: 405, top: 75 };
/** 反解时向外多算几像素，避免边界上留下一条没处理的缝。 */
const MARGIN = 6;

/** 叠加层颜色；实测接近纯黑。 */
const VEIL = 1;
/** 只在这个不透明度以上的笔画内部做第二道「抹平」。 */
const MASK = 0.05;
/** 与局部背景相差超过这个灰阶的像素视为真实内容，保留；以下是残影，抹平。 */
const THRESH = 60;

/** alpha 反解的下限，低于此值认为该像素没被水印覆盖。 */
const MIN_COVERAGE = 0.006;
/** 参考图上覆盖度超过这个值，就认为该像素在水印笔画上（不拿来当背景样本）。 */
const COVERED = 0.02;
/** 叠加层不透明度的上限：量出来的 alpha 超过它就说明底下是内容，卡住。 */
const ALPHA_MAX = 0.34;

const args = process.argv.slice(2);
const flagValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const dir = args.find((a) => !a.startsWith('--')) ?? 'public/blog/shanghai-pudong-airport-map/images';
const refName = flagValue('--ref') ?? '2.png';
const outDir = flagValue('--out') ?? null;
const cropBottom = Number(flagValue('--crop-bottom') ?? 0);
const dryRun = args.includes('--dry-run');
/** 照片类素材：抹平那一步会把纹理替换成局部最亮值，看起来是亮的涂抹，关掉它。 */
const noFlatten = args.includes('--no-flatten');

/** sRGB 亮度，和 PIL 的 convert('L') 同一套权重。 */
const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

async function main() {
  const files = (await readdir(dir)).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).sort();

  // --- 参考图 -> alpha 表（按距右下角的偏移索引） ----------------------------
  // 亮度要和后面每张图用的公式完全一致，否则同批次的图在 (1,0,0) 处都算不出精确
  // 的 0，拟合会漂到旁边去（实测踩过：sharp 的 greyscale 走的是 BT.709）。
  const refRGB = await sharp(await readFile(join(dir, refName))).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const rw = refRGB.info.width;
  const rh = refRGB.info.height;
  const rc = refRGB.info.channels;
  const refGray = new Float32Array(rw * rh);
  for (let p = 0, q = 0; p < rw * rh; p++, q += rc) {
    refGray[p] = luma(refRGB.data[q], refRGB.data[q + 1], refRGB.data[q + 2]);
  }
  const W = REGION.left;
  const H = REGION.top;
  const alpha = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const v = refGray[(rh - H + j) * rw + (rw - W + i)];
      alpha[j * W + i] = Math.min(0.95, Math.max(0, (255 - v) / (255 - VEIL)));
    }
  }

  const out = outDir ?? dir;
  if (!dryRun) await mkdir(out, { recursive: true });
  console.log(`参考图 ${refName}（${rw}×${rh}），区域 ${W}×${H}\n`);

  for (const file of files) {
    const src = join(dir, file);
    // 先把文件读进内存：sharp 在 Windows 上会按住输入文件的句柄，
    // 就地覆盖时 writeFile 会以 UNKNOWN(-4094) 失败。
    const input = await readFile(src);
    const meta = await sharp(input).metadata();

    // 水印锚在右下角、并且**跟着图一起缩放**（实测：宽 1033 的图上水印连边距
    // 都是 1080 那张的 0.956 倍）。所以宽度不同的图不是「另一批素材」，只要宽度
    // 比例接近就按比例换算出参考图里的水印坐标；差得太多才是真换了素材
    // （比如同一篇文章里那张手机截图式的大图），交给 --crop-bottom。
    const s0 = meta.width / rw;
    if (Math.abs(s0 - 1) > 0.2) {
      if (!cropBottom) {
        console.log(`跳过 ${file}（宽 ${meta.width}，是参考图的 ${s0.toFixed(3)} 倍，水印比例差太多）`);
        continue;
      }
      const height = meta.height - cropBottom;
      console.log(`${file}: 裁掉底部 ${cropBottom}px → ${meta.width}×${height}`);
      if (!dryRun) {
        // 保持原格式：写成 PNG 却留着 .webp 后缀会被 `check-blog.mjs` 抓出来
        // （它按内容判断格式），文章也拿不到正确的 Content-Type。
        const cropped = sharp(input).extract({ left: 0, top: 0, width: meta.width, height });
        const buf = extname(file).toLowerCase() === '.webp'
          ? await cropped.webp({ quality: 100, effort: 6 }).toBuffer()
          : await cropped.png({ compressionLevel: 9, palette: false }).toBuffer();
        await writeFile(join(out, file), buf);
      }
      continue;
    }

    const { data, info } = await sharp(input).removeAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const at = (x, y) => (y * w + x) * ch;
    const gray = new Float32Array(w * h);
    for (let p = 0, q = 0; p < w * h; p++, q += ch) {
      gray[p] = luma(data[q], data[q + 1], data[q + 2]);
    }
    const lum = (x, y) => gray[y * w + x];

    // --- 1. 拟合水印的缩放与偏移 ------------------------------------------
    const fit = fitTransform({ gray, w, h, alpha, W, H, s0 });

    // 幂等保护：水印已经不在的图直接跳过。这个脚本对同一张图跑第二遍会把水印
    // 位置再反解一次（图上已经是白底，会被过曝/提亮），所以要挡住。
    let seen = 0;
    let seenN = 0;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        if (alpha[j * W + i] < 0.26) continue;
        const x = Math.round(w + (i - W) * fit.s + fit.tx);
        const y = Math.round(h + (j - H) * fit.s + fit.ty);
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        seen += (255 - gray[y * w + x]) / 254;
        seenN++;
      }
    }
    if (seenN === 0 || seen / seenN < 0.1) {
      console.log(`跳过 ${file}（水印位置已无压暗，像是处理过了）`);
      continue;
    }

    // --- 2. 逐像素反解 -----------------------------------------------------
    // 位置（缩放/偏移）靠参考图拟合，但**每个像素的 alpha 从这张图自己量**：
    //   alpha = (局部背景 − 观测) / 局部背景
    // 局部背景取「不在水印覆盖范围内的邻居」的中位数（9×9 窗口里最多三成是笔画
    // 自己，中位数仍然落在背景上；压着地图标签的地方，标签自己的像素也在样本里，
    // 于是同样自洽）。
    //
    // 为什么不用参考图那套 alpha：水印是**跟着图一起缩放**的，各张图缩放比不同
    // （实测 0.972~1.003），参考图的字形边距哪怕差 1%，落到图上也差两三个像素，
    // 反解就过度提亮，留下一圈发亮的字形——比原来的水印还显眼（北京这批一开始
    // 就是这样）。量出来的 alpha 没有这个问题：背景是什么、水印压了多少，都是
    // 就地读出来的，缩放对不对都不影响。
    //
    // 上限 ALPHA_MAX 卡在实测的最大不透明度附近：压在字下的深色标签量出来的
    // 「alpha」会超过它，卡住之后 `obs / (1 − ALPHA_MAX)` 恰好把标签还原得差不多。
    const x0 = Math.max(0, w - W - MARGIN);
    const y0 = Math.max(0, h - H - MARGIN);
    const coverage = new Float32Array((w - x0) * (h - y0));
    for (let y = y0; y < h; y++) {
      for (let x = x0; x < w; x++) {
        coverage[(y - y0) * (w - x0) + (x - x0)] = sampleAlpha(
          alpha, W, H, (x - w - fit.tx) / fit.s + W, (y - h - fit.ty) / fit.s + H
        );
      }
    }
    const covAt = (x, y) =>
      x < x0 || y < y0 || x >= w || y >= h ? 0 : coverage[(y - y0) * (w - x0) + (x - x0)];

    // 门控用**膨胀过的**覆盖度：拟合出来的字形整体可能偏 2~4px（各图缩放比不同），
    // 只按覆盖度开洞会漏掉真正被压住的像素，那些像素就留下字影。膨胀开洞不会误伤
    // ——没被压住的地方量出来的 alpha ≈ 0，反解就是恒等变换。
    const GATE_R = 4;
    const gate = new Float32Array(coverage.length);
    for (let y = y0; y < h; y++) {
      for (let x = x0; x < w; x++) {
        let mx = 0;
        for (let dy = -GATE_R; dy <= GATE_R && mx <= COVERED; dy++) {
          for (let dx = -GATE_R; dx <= GATE_R; dx++) {
            const m = covAt(x + dx, y + dy);
            if (m > mx) mx = m;
          }
        }
        gate[(y - y0) * (w - x0) + (x - x0)] = mx;
      }
    }

    const FR = 4;                       // 取背景用的邻域半径
    const pool = new Uint8Array((2 * FR + 1) ** 2);
    for (let y = y0; y < h; y++) {
      for (let x = x0; x < w; x++) {
        if (gate[(y - y0) * (w - x0) + (x - x0)] < MIN_COVERAGE) continue;
        let n = 0;
        for (let dy = -FR; dy <= FR; dy++) {
          for (let dx = -FR; dx <= FR; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
            if (covAt(xx, yy) > COVERED) continue;      // 只收覆盖范围外的邻居
            const q = at(xx, yy);
            pool[n++] = luma(data[q], data[q + 1], data[q + 2]);
          }
        }
        const p = at(x, y);
        const obs = luma(data[p], data[p + 1], data[p + 2]);
        let m = coverage[(y - y0) * (w - x0) + (x - x0)];
        if (n >= 8) {
          const s = pool.subarray(0, n);
          s.sort();
          const bg = s[n >> 1];
          if (bg > 1) m = Math.min(ALPHA_MAX, Math.max(0, (bg - obs) / bg));
        }
        if (m < MIN_COVERAGE) continue;
        const k = 1 - m;
        data[p] = clamp((data[p] - m * VEIL) / k);
        data[p + 1] = clamp((data[p + 1] - m * VEIL) / k);
        data[p + 2] = clamp((data[p + 2] - m * VEIL) / k);
      }
    }

    // --- 3. 笔画内部抹掉残余（用「覆盖区外邻居的中位数」估局部背景）---------
    // 反解在 alpha 拟合得准时是恒等还原，拟合差一点就留下几到几十灰阶的字形残影。
    // 这一步把残影抹掉，做法是：在笔画内部，用**不在水印覆盖范围内的邻居**的中位数
    // 当局部背景，凡是与它相差不到 THRESH 的像素就替换成它——残影是低对比度的，
    // 被抹平；压在字下的地图标签是高对比度的，被下面的判据保住。
    //
    // 两个踩过的坑：
    //  · 判据必须拿**反解之后**的亮度比。拿原图比的话，水印自身的压暗（最深 78 灰阶）
    //    就超过 THRESH，残影像素会被当成内容全留下来。
    //  · 背景**不能**用闭运算（局部最亮值）估。背景是浅灰、旁边是白底时，闭运算会把
    //    白带进浅灰区域，抹出一圈发亮的字形（北京这批就是这样）。取邻居中位数不会
    //    串色：窗口里最多三成是笔画自己，中位数仍然落在背景上。
    //  · 也别用 sharp 的 .dilate()/.erode()：实测它们不是方形闭运算，会把整张图塌成
    //    一个常数。
    // 照片类素材用 --no-flatten 关掉这一步（纹理里没有「局部背景」可言）。
    let flattened = 0;
    if (!noFlatten) {
      for (let p = 0, q = 0; p < w * h; p++, q += ch) {
        gray[p] = luma(data[q], data[q + 1], data[q + 2]);
      }
      const R = 2;                                // 5×5 邻域
      const samples = [new Uint8Array((2 * R + 1) ** 2), new Uint8Array((2 * R + 1) ** 2),
                       new Uint8Array((2 * R + 1) ** 2)];
      for (let y = y0; y < h; y++) {
        for (let x = x0; x < w; x++) {
          if (covAt(x, y) < MASK) continue;
          let n = 0;
          for (let dy = -R; dy <= R; dy++) {
            for (let dx = -R; dx <= R; dx++) {
              const xx = x + dx;
              const yy = y + dy;
              if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
              if (covAt(xx, yy) > 0.02) continue;          // 只收覆盖范围外的邻居
              const p = at(xx, yy);
              samples[0][n] = data[p];
              samples[1][n] = data[p + 1];
              samples[2][n] = data[p + 2];
              n++;
            }
          }
          if (n < 8) continue;                              // 陷在笔画内部（如图标），交给反解
          const bg = [0, 0, 0];
          for (let k = 0; k < SUB; k++) {
            const s = samples[k].subarray(0, n);
            s.sort();
            bg[k] = s[n >> 1];
          }
          const bgGray = luma(bg[0], bg[1], bg[2]);
          if (Math.abs(lum(x, y) - bgGray) >= THRESH) continue;   // 真实内容，保留
          const p = at(x, y);
          data[p] = bg[0];
          data[p + 1] = bg[1];
          data[p + 2] = bg[2];
          flattened++;
        }
      }
    }

    // --- 4. 写回原格式 -----------------------------------------------------
    // PNG 是无损格式，但 sharp 的 `effort`（以及 `palette`）会走 libimagequant
    // 调色板量化，把 color_type 6 写成 3：文件小一半，但颜色被换成最近的调色板
    // 项（实测一个深橄榄色标签被量化成灰）。要无损就显式 `palette: false`，并且
    // **不要**传 effort。WebP 没有无损以外的精确选项，用最高质量的**有损**档——
    // 无损 WebP 会让这些图从 ~20KB 涨到 ~150KB，得不偿失。
    const ext = extname(file).toLowerCase();
    const pipeline = sharp(Buffer.from(data), { raw: { width: w, height: h, channels: ch } });
    const encoded = ext === '.webp'
      ? await pipeline.webp({ quality: 100, effort: 6 }).toBuffer()
      : await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer();
    console.log(
      `${file}: ${w}×${h} s=${fit.s.toFixed(4)} tx=${fit.tx} ty=${fit.ty}` +
      ` inliers=${(fit.score * 100).toFixed(0)}% 能量=${fit.energy.toFixed(1)}  抹平 ${flattened} px → ${(encoded.length / 1024).toFixed(0)}KB`
    );
    if (!dryRun) await writeFile(join(out, file), encoded);
  }

  if (dryRun) console.log('\n--dry-run：没有写任何文件');
  else if (!outDir) console.log('\n已就地覆盖');
  else console.log(`\n输出目录: ${outDir}`);
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/** 参与运算的通道数：闭运算与反解都只用 RGB，第 4 通道（若有）原样带回。 */
const SUB = 3;


/** 双线性取 alpha 表；表按 (i,j) = (距右边 i 像素, 距底边 j 像素) 索引。 */
function sampleAlpha(alpha, W, H, i, j) {
  if (i < 0 || j < 0 || i >= W - 1 || j >= H - 1) return 0;
  const i0 = i | 0;
  const j0 = j | 0;
  const fi = i - i0;
  const fj = j - j0;
  const a = alpha[j0 * W + i0];
  const b = alpha[j0 * W + i0 + 1];
  const c = alpha[(j0 + 1) * W + i0];
  const d = alpha[(j0 + 1) * W + i0 + 1];
  return (a * (1 - fi) + b * fi) * (1 - fj) + (c * (1 - fi) + d * fi) * fj;
}

/**
 * 拟合这张图的水印是参考图的哪个 (缩放, 平移)。
 *
 * 指标直接对准残影：只看「背景是白的」那些被覆盖像素，求
 *   E = Σ |observed/alpha − 1|
 * 的最小值。alpha 取得准时这项为 0（同批次那五张图实测就是精确的 0），取不准时
 * 它就等于残影本身的大小。压在字下的地图标签不参与这项统计（那些像素的四周
 * 不白），所以指标对内容天然免疫——比「相关性」稳健得多：相关性会被地图内容
 * 拉低到 0.7~0.95 从而挑错缩放，能量指标则不会。
 *
 * 缩放从**宽度比例**起步（水印跟着图一起缩放），只在它附近 ±3% 搜，再在邻域里
 * 精修平移与缩放。
 */
function fitTransform({ gray, w, h, alpha, W, H, s0 }) {
  const inImage = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  /** 参考图坐标 -> 图像坐标 */
  const mapX = (i, s, tx) => Math.round(w + (i - W) * s + tx);
  const mapY = (j, s, ty) => Math.round(h + (j - H) * s + ty);

  // 样本：被水印覆盖、且四周是白的像素——残影只长在这里。白底判据要按 s0 换算
  // 后的位置去量，否则缩放过的图会在错误的地方取样。
  const pts = [];
  const reach = Math.ceil(12 * Math.max(1, s0));
  for (let j = 0; j < H; j += 2) {
    for (let i = 0; i < W; i += 2) {
      if (alpha[j * W + i] < 0.03) continue;
      const x = mapX(i, s0, 0);
      const y = mapY(j, s0, 0);
      let mx = 0;
      for (let rx = -reach; rx <= reach; rx += Math.max(1, Math.round(reach / 2))) {
        for (let ry = -reach; ry <= reach; ry += Math.max(1, Math.round(reach / 2))) {
          const xx = x + rx;
          const yy = y + ry;
          if (inImage(xx, yy)) mx = Math.max(mx, gray[yy * w + xx]);
        }
      }
      if (mx >= 250) pts.push(i, j);
    }
  }

  const energy = (s, tx, ty) => {
    let e = 0;
    for (let k = 0; k < pts.length; k += 2) {
      const i = pts[k];
      const j = pts[k + 1];
      const x = mapX(i, s, tx);
      const y = mapY(j, s, ty);
      if (!inImage(x, y)) continue;
      e += Math.abs((255 - gray[y * w + x]) / (255 - VEIL) - alpha[j * W + i]);
    }
    return e;
  };

  /** 内点比例，只用来在日志里说明这张图的水印跟参考图像到什么程度。 */
  const inlierRatio = (s, tx, ty) => {
    let ok = 0;
    let n = 0;
    for (let k = 0; k < pts.length; k += 2) {
      const i = pts[k];
      const j = pts[k + 1];
      const x = mapX(i, s, tx);
      const y = mapY(j, s, ty);
      if (!inImage(x, y)) continue;
      const aRef = alpha[j * W + i];
      const aObs = (255 - gray[y * w + x]) / (255 - VEIL);
      n++;
      if (Math.abs(aObs / aRef - 1) < 0.25) ok++;
    }
    return n ? ok / n : 0;
  };

  let best = { s: 1, tx: 0, ty: 0, energy: Infinity };
  // 粗搜：以宽度比例 s0 为中心 ±3%，平移 2px 步长
  for (let si = -6; si <= 6; si++) {
    const s = s0 * (1 + si * 0.005);
    for (let tx = -8; tx <= 8; tx += 2) {
      for (let ty = -8; ty <= 8; ty += 2) {
        const e = energy(s, tx, ty);
        if (e < best.energy) best = { s, tx, ty, energy: e };
      }
    }
  }
  // 精修：缩放 ±0.005（步长 0.0005）、平移 ±2px（步长 0.25）
  for (let ds = -10; ds <= 10; ds++) {
    const s = best.s + ds * 0.0005;
    for (let dtx = -8; dtx <= 8; dtx++) {
      for (let dty = -8; dty <= 8; dty++) {
        const tx = best.tx + dtx * 0.25;
        const ty = best.ty + dty * 0.25;
        const e = energy(s, tx, ty);
        if (e < best.energy) best = { s, tx, ty, energy: e };
      }
    }
  }
  return { ...best, score: inlierRatio(best.s, best.tx, best.ty) };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
