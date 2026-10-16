/**
 * Fetches airport photos from *specific pages* — a JSON map of IATA → page
 * URLs — for airports where image search came up empty, so the best available
 * evidence is the page's own pictures (an airport's official gallery, a
 * spotters' report, a tourism guide).
 *
 * Same storage and provenance conventions as scripts/fetch-airport-photos.mjs:
 * files land in public/photos/<IATA>/<iata>-page-<n>.webp, every download is
 * verified by magic bytes and minimum width, re-encoded with sharp, recorded
 * in public/photos/manifest.json (source 'page', pageUrl + imageUrl + page
 * title), and stays **staged** — invisible until an editor writes a caption —
 * so nothing reaches a page unreviewed.
 *
 * Candidate extraction per page, in order:
 *   1. og:image / twitter:image meta tags (the page's own representative image)
 *   2. literal <img src> URLs that look like photographs (jpg/jpeg/png/webp,
 *      skipping logo/icon/avatar/sprite/banner/svg), in document order
 * Relative URLs are resolved against the page; each host's robots.txt is
 * checked once (respect mode by default, `--robots ignore` for owner sourcing).
 *
 * Usage:
 *   node scripts/fetch-airport-photos-from-pages.mjs --from .next/photo-pages.json
 *   ... --per-airport 2 --min-width 500 --dry-run --debug
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';
import { robotsAllows, sniffImage } from './fetch-airport-images.mjs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const withEq = args.find((a) => a.startsWith(`--${name}=`));
  if (withEq) return withEq.split('=').slice(1).join('=');
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};
const FROM = flag('from');
const PER = Number(flag('per-airport', '2'));
const MIN_WIDTH = Number(flag('min-width', '500'));
const MAX_WIDTH = Number(flag('max-width', '1600'));
const DELAY = Number(flag('delay', '700'));
const ROBOTS = flag('robots', 'respect');
const DRY = args.includes('--dry-run');
const DEBUG = args.includes('--debug');
if (!FROM) throw new Error('pass --from <json file: { "AAA": ["url", …] }>');

const photosDir = join(ROOT, 'public', 'photos');
const manifestPath = join(photosDir, 'manifest.json');
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { note: 'Airport photos with attribution.', airports: {} };
manifest.airports ??= {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;
async function paced(fn) {
  const wait = lastRequest + DELAY - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fn();
}

async function fetchWithTimeout(url, headers, timeout = 25000, tries = 2) {
  let error;
  for (let attempt = 0; attempt <= tries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: controller.signal });
      if (res.status === 429 || res.status >= 500) error = new Error(`HTTP ${res.status}`);
      else return res;
    } catch (err) {
      error = err;
    } finally {
      clearTimeout(timer);
    }
    await sleep(1200 * (attempt + 1));
  }
  throw error;
}

const robotsCache = new Map();
/**
 * Robots policy, slightly more standard than the sibling fetcher's: a host
 * that serves no robots.txt (404) publishes no restrictions, so it is allowed;
 * only a robots.txt that exists is evaluated, and only a *network* failure to
 * read one is treated as a refusal. (fetch-airport-images.mjs refuses on
 * everything unavailable; for these one-image-per-page pulls that is stricter
 * than the robots standard requires.)
 */
async function allowed(origin, pathAndQuery) {
  if (ROBOTS === 'ignore') return true;
  if (!robotsCache.has(origin)) {
    const res = await paced(() => fetchWithTimeout(`${origin}/robots.txt`, { 'user-agent': UA }, 15000, 0)).catch(() => 'error');
    if (res === 'error') robotsCache.set(origin, { text: null, missing: false });
    else robotsCache.set(origin, res.ok ? { text: await res.text(), missing: false } : { text: null, missing: true });
  }
  const cached = robotsCache.get(origin);
  if (cached.text === null) return cached.missing;
  return robotsAllows(cached.text, pathAndQuery);
}

const unescapeJson = (text) =>
  text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Template-level chrome that never shows the subject, wherever it appears. */
const CHROME =
  /logo|icon|avatar|sprite|placeholder|blank|pixel|default|navbar|header|footer|share|social|card|app-store|app-image|google-play|whatsapp|favicon|arrow|button|banner|reklama/i;

/** Image candidates on a page, og:image first. */
function pageImages(html, pageUrl) {
  const out = [];
  const push = (url, how) => {
    try {
      const resolved = new URL(unescapeJson(url.trim()), pageUrl).href;
      if (!/^https?:/.test(resolved)) return;
      if (CHROME.test(resolved)) return;
      // Same base path at another size (srcset variants, ?width= resizes) is
      // the same picture — keep the first, largest one only.
      const base = resolved.split('?')[0];
      if (out.some((entry) => entry.url.split('?')[0] === base)) return;
      out.push({ url: resolved, how });
    } catch {
      /* unparseable — skip */
    }
  };
  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/gi)) {
    const content = match[0].match(/content=["']([^"']+)["']/i);
    if (content) push(content[1], 'meta');
  }
  // srcset entries are candidates too — take the widest descriptor of each.
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    const parts = match[1].split(',').map((piece) => piece.trim().split(/\s+/)[0]).filter(Boolean);
    if (parts.length) push(parts[parts.length - 1], 'img');
  }
  // <img> tags first: their src may be extension-less (FlightAware serves
  // /photos/retriever/<hash>), so only obvious non-images are skipped here —
  // the download step verifies magic bytes either way.
  for (const match of html.matchAll(/<img[^>]*?(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (/\.(js|css|svg|json|html?)(\?|$)/i.test(src)) continue;
    push(src, 'img');
  }
  // Other elements: keep the extension requirement.
  for (const match of html.matchAll(/(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(src)) continue;
    push(src, 'img');
  }
  return out;
}

const from = JSON.parse(readFileSync(join(ROOT, FROM), 'utf8'));
let saved = 0;
const missing = [];

for (const [code, pages] of Object.entries(from)) {
  const entries = [];
  for (const pageUrl of pages) {
    if (entries.length >= PER) break;
    try {
      const page = new URL(pageUrl);
      if (!(await allowed(page.origin, page.pathname + page.search))) {
        if (DEBUG) console.log(`  ${code} ${pageUrl}: robots disallows`);
        continue;
      }
      // A URL that is itself an image (an agency's image server, say) is its
      // own single candidate — there is no HTML to extract candidates from.
      const direct = /\.(jpe?g|png|webp)$/i.test(page.pathname);
      const res = direct ? null : await paced(() => fetchWithTimeout(pageUrl, { 'user-agent': UA, accept: 'text/html,*/*' }));
      const html = res ? await res.text() : '';
      const title = res ? ((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '').trim().slice(0, 120) : '';
      const candidates = direct ? [{ url: pageUrl, how: 'direct' }] : pageImages(html, pageUrl);
      if (DEBUG) {
        console.log(`  ${code} ${pageUrl}: ${candidates.length} candidate(s), html ${html.length}B, retriever mentions ${(html.match(/retriever/g)||[]).length} — ${title.slice(0, 60)}`);
        candidates.slice(0, 4).forEach((c) => console.log(`    ? ${c.how} ${c.url.slice(0, 100)}`));
      }
      for (const candidate of candidates) {
        if (entries.length >= PER) break;
        const imageUrl = new URL(candidate.url);
        if (!(await allowed(imageUrl.origin, imageUrl.pathname + imageUrl.search))) continue;
        const img = await paced(() => fetchWithTimeout(candidate.url, {
          'user-agent': UA,
          ...(candidate.how === 'img' ? { referer: pageUrl } : {}),
          accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        })).catch((err) => ({ error: err }));
        if (img.error || !img.ok) {
          if (DEBUG) console.log(`    ✗ ${candidate.url.slice(0, 80)}: ${img.error?.message ?? img.status}`);
          continue;
        }
        const buf = Buffer.from(await img.arrayBuffer());
        const sniffed = sniffImage(buf);
        if (!sniffed || sniffed.ext === '.gif') {
          if (DEBUG) console.log(`    ✗ ${candidate.url.slice(0, 80)}: not a still image`);
          continue;
        }
        let meta;
        try {
          meta = await sharp(buf).metadata();
        } catch {
          continue;
        }
        if (!meta.width || meta.width < MIN_WIDTH) {
          if (DEBUG) console.log(`    ✗ ${candidate.url.slice(0, 80)}: too small (${meta.width ?? '?'}px)`);
          continue;
        }
        // Banner-shaped strips (site headers, 670x100 artwork) are not pictures
        // of anything — anything past 4:1 is chrome, not a photo.
        if (meta.height && meta.width / meta.height > 4) {
          if (DEBUG) console.log(`    ✗ ${candidate.url.slice(0, 80)}: banner aspect ${meta.width}x${meta.height}`);
          continue;
        }
        const nextIndex =
          Math.max(
            0,
            ...(manifest.airports[code] ?? [])
              .map((entry) => Number((entry.file.match(/-page-(\d+)\.webp$/) || [])[1] ?? 0))
              .filter((n) => Number.isFinite(n))
          ) + entries.length + 1;
        const file = `${code.toLowerCase()}-page-${nextIndex}.webp`;
        if (DRY) {
          entries.push({ file, width: meta.width, height: meta.height });
          console.log(`  [dry] ${code} ${file} ← ${candidate.url.slice(0, 90)} (${meta.width}x${meta.height}, ${candidate.how})`);
          continue;
        }
        const outDir = join(photosDir, code);
        const image = sharp(buf).rotate();
        if (meta.width > MAX_WIDTH) image.resize({ width: MAX_WIDTH });
        const info = await image.webp({ quality: 80 }).toFile(join(outDir, file));
        entries.push({
          file,
          width: info.width,
          height: info.height,
          source: 'page',
          host: imageUrl.host,
          pageUrl,
          imageUrl: candidate.url,
          title: title || candidate.how,
          licenseFilter: null,
          query: `page:${imageUrl.host}`,
        });
        console.log(`  ${code} ${file} ← ${candidate.url.slice(0, 90)} (${info.width}x${info.height})`);
      }
    } catch (err) {
      if (DEBUG) console.log(`  ✗ ${code} ${pageUrl}: ${err.message}`);
    }
  }
  if (entries.length > 0 && !DRY) {
    manifest.airports[code] = [...(manifest.airports[code] ?? []), ...entries];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    saved += entries.length;
  } else if (entries.length === 0) {
    missing.push(code);
    console.log(`  ${code}: nothing usable`);
  }
  await sleep(DELAY);
}

console.log(`\n${DRY ? 'would save' : 'saved'} ${saved || (DRY ? '' : 0)} photo(s)${missing.length ? `; no photo for: ${missing.join(', ')}` : ''}`);
if (!DRY && saved > 0) {
  console.log('Photos are staged: review each picture and write captions in public/photos/captions/<IATA>.json,');
  console.log('then run node scripts/build-photo-captions.mjs and refresh the affected guides.');
}
