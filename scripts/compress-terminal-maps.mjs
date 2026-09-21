/**
 * Compresses the terminal-map images downloaded by fetch-terminal-maps.mjs in
 * place: 2000x2000 24-bit PNGs of line-art maps quantize to an 8-bit palette
 * with no visible loss (measured 711KB → 191KB on HKG, gate numbers and labels
 * stay crisp), while dimensions are preserved so the maps stay zoomable.
 *
 * PDFs are left alone. Files only get overwritten when the compressed version
 * is actually smaller; every replacement is recorded in the manifest under
 * `compressed` (bytes + sha256 + settings), next to the untouched source
 * provenance (url + sha256 of the original download), so re-downloading the
 * original always remains possible.
 *
 * Usage:
 *   node scripts/compress-terminal-maps.mjs                # all images
 *   node scripts/compress-terminal-maps.mjs --quality 90   # higher fidelity
 *   node scripts/compress-terminal-maps.mjs --max-width 1600  # also shrink
 *   node scripts/compress-terminal-maps.mjs --limit 3      # trial run
 *
 * Flags:
 *   --quality 80      palette quantization quality, 1-100 (sharp/libimagequant)
 *   --max-width 0     downscale images wider than this; 0 keeps dimensions
 *   --dir PATH        terminal-map root (default ./public/terminal-maps)
 *   --limit N         only the first N images (alphabetical)
 *   --force           recompress even if the manifest already has a record
 *   --dry-run         report what would happen, write nothing
 *
 * Exit code is 0 unless something errored; images that would not get smaller
 * are reported as "kept original", not failures.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const opts = {
    quality: 80,
    maxWidth: 0,
    dir: './public/terminal-maps',
    limit: 0,
    force: false,
    dryRun: false,
  };
  const flags = new Set(['force', 'dry-run', 'help']);
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    const key = (eq < 0 ? raw.slice(2) : raw.slice(2, eq)).toLowerCase();
    let value = eq < 0 ? '' : raw.slice(eq + 1);
    if (!value && !flags.has(key)) value = argv[++i] ?? '';
    switch (key) {
      case 'quality': opts.quality = Number(value) || 80; break;
      case 'max-width': opts.maxWidth = Number(value) || 0; break;
      case 'dir': opts.dir = value; break;
      case 'limit': opts.limit = Number(value) || 0; break;
      case 'force': opts.force = true; break;
      case 'dry-run': opts.dryRun = true; break;
      case 'help': opts.help = true; break;
      default: throw new Error(`unknown flag --${key}`);
    }
  }
  return opts;
}

/** One image per code folder: {CODE}_large.png (the only format the fetcher
 *  has produced; non-PNG _large files are reported for a manual look). */
async function findImages(rootDir) {
  const files = [];
  const others = [];
  for (const entry of (await readdir(rootDir, { withFileTypes: true }))) {
    if (!entry.isDirectory()) continue;
    const code = entry.name;
    for (const f of (await readdir(join(rootDir, code)))) {
      if (!/_large\.(png|jpe?g|webp)$/i.test(f)) continue;
      if (f.endsWith('.png')) {
        files.push({ code, path: join(rootDir, code, f), file: f });
      } else {
        others.push(`${code}/${f}`);
      }
    }
  }
  return { files: files.sort((a, b) => a.code.localeCompare(b.code)), others };
}

/** The `compressed` block written into the manifest for one image. */
function compressedRecord(buf, meta, opts) {
  return {
    bytes: buf.length,
    sha256: createHash('sha256').update(buf).digest('hex'),
    width: meta.width,
    height: meta.height,
    paletteQuality: opts.quality,
    maxWidth: opts.maxWidth || null,
    // The download's url + sha256 next to this stay untouched: that is the
    // original we can re-fetch if this copy ever needs redoing.
    compressedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- main

async function main() {
  process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') process.exit(0);
  });

  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      (await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0].replace(/^\/\*\*?/, '')
    );
    return;
  }
  if (opts.quality < 1 || opts.quality > 100) throw new Error('--quality must be 1-100');

  const rootDir = resolve(ROOT, opts.dir);
  const manifestPath = join(rootDir, 'terminal-maps-manifest.json');
  let manifest = { files: {} };
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* rewrite it */ }
  }

  const { files: found, others } = await findImages(rootDir);
  if (!found.length) throw new Error(`no *_large.png images found under ${rootDir}`);
  let images = found;
  if (opts.limit > 0) images = images.slice(0, opts.limit);

  console.log(`images     ${images.length} under ${rootDir}`);
  if (others.length) console.log(`ignored    non-PNG _large files (inspect manually): ${others.join(', ')}`);
  console.log(`settings   palette quality ${opts.quality}` +
    (opts.maxWidth ? `, max-width ${opts.maxWidth}px` : ', dimensions preserved') +
    (opts.dryRun ? '  [DRY RUN]' : '') + '\n');

  const compressed = [];
  const kept = [];
  let skipped = 0;
  let inBytes = 0;
  let outBytes = 0;

  for (const img of images) {
    const entry = manifest.files?.[img.code];
    if (entry?.png?.compressed && !opts.force) { skipped++; continue; }

    const original = await stat(img.path);
    inBytes += original.size;

    let pipeline = sharp(img.path);
    if (opts.maxWidth > 0) {
      pipeline = pipeline.resize({ width: opts.maxWidth, withoutEnlargement: true });
    }
    const buf = await pipeline
      .png({ palette: true, quality: opts.quality, effort: 9, compressionLevel: 9 })
      .toBuffer();

    if (buf.length >= original.size) {
      kept.push(img.code);
      outBytes += original.size;
      console.log(`= ${img.code}  kept original (${Math.round(original.size / 1024)}KB, compression would not help)`);
      continue;
    }

    outBytes += buf.length;
    compressed.push({ ...img, from: original.size, to: buf.length, buf });
    const pct = Math.round((1 - buf.length / original.size) * 100);
    console.log(`✓ ${img.code}  ${Math.round(original.size / 1024)}KB → ${Math.round(buf.length / 1024)}KB  (-${pct}%)`);
  }

  console.log(`\n${compressed.length} compressed, ${kept.length} kept original, ${skipped} already done`);
  if (inBytes > 0) {
    console.log(`total ${Math.round(inBytes / 1024 / 1024 * 10) / 10}MB → ${Math.round(outBytes / 1024 / 1024 * 10) / 10}MB` +
      (inBytes > outBytes ? `  (saved ${Math.round((inBytes - outBytes) / 1024 / 1024 * 10) / 10}MB)` : ''));
  }

  if (opts.dryRun || compressed.length === 0) return;

  for (const { code, path, file, buf } of compressed) {
    // Atomic replace so an interrupted run never leaves a truncated image.
    await writeFile(path + '.tmp', buf);
    await rename(path + '.tmp', path);
    const meta = await sharp(buf).metadata();
    const prev = manifest.files[code] ?? {};
    manifest.files[code] = {
      ...prev,
      // Download provenance (url + sha256 of the original) is preserved when
      // the entry already exists; images with no entry get a minimal one so no
      // compressed file is an orphan in the manifest.
      png: {
        ...(prev.png ?? {}),
        file,
        compressed: compressedRecord(buf, meta, opts),
        ...(prev.png ? {} : { sourceRights: 'compressed in place; original source not recorded' }),
      },
    };
  }

  manifest.updatedAt = new Date().toISOString();
  await mkdir(rootDir, { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`manifest written to ${manifestPath}`);
}

const isEntryPoint =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    console.error(`\nerror: ${err.message}`);
    process.exitCode = 2;
  });
}
