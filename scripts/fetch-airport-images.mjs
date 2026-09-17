/**
 * Bulk-downloads one image per airport (IATA code) from a source you are
 * allowed to copy from, and records where each file came from.
 *
 * The airport list comes from a listing page *you* saved in your browser
 * (`--from-html`), a plain code list, or an existing DB dump — this script
 * never crawls a site to discover codes, and it honours robots.txt by default.
 * It is not a challenge-solving scraper: if a host answers with a bot
 * protection page instead of an image, that is reported as a failure.
 *
 * Every download is verified to really be an image (magic bytes), not just a
 * 200 response, and each file's sha256 + source URL + licence note is written
 * to maps-manifest.json. That manifest is the provenance record you need for
 * attribution, and for AdSense review of third-party media.
 *
 * Usage:
 *   node scripts/fetch-airport-images.mjs \
 *     --from-html ~/Downloads/airports-listing.html \
 *     --url-template 'https://cdn.example.com/maps/cover/{IATA}.png' \
 *     --out ./maps-import \
 *     --source-rights 'CC0 / OurAirports public-domain data, rendered by us'
 *
 *   node scripts/fetch-airport-images.mjs --codes AUH,ADL,PEK --url-template ... --source-rights ...
 *   node scripts/fetch-airport-images.mjs --codes-file codes.txt --url-template ... --source-rights ...
 *   node scripts/fetch-airport-images.mjs --from-csv airports.csv --url-template ... --source-rights ...
 *
 * `--from-csv` takes the airport list from a CSV (any of the columns `iata`,
 * `name`, `city`, `countryCode`, `path`, `coverUrl` are picked up when present;
 * a `coverUrl` column is recorded as `referenceUrl` in the manifest, never
 * fetched). The download URL still comes from `--url-template`, so the same
 * list can be pointed at whichever source you are allowed to use.
 *
 * Useful flags:
 *   --dry-run              list what would be fetched, touch nothing
 *   --force                re-download files that already exist
 *   --concurrency 2        parallel requests (keep it low; be a good citizen)
 *   --delay 250            ms between request starts
 *   --limit 20             only the first N airports
 *   --robots ignore        skip the robots.txt check (only for sources you own)
 *   --header 'Cookie: x=y' extra request header (repeatable)
 *   --ext .png             extension for saved files (default: from URL)
 *
 * Exit code is 1 if any airport failed, so CI/cron can notice.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const opts = {
    fromHtml: [],
    fromCsv: [],
    codes: '',
    codesFile: '',
    urlTemplate: '',
    out: './maps-import',
    sourceRights: '',
    concurrency: 2,
    delay: 250,
    timeout: 20000,
    retries: 3,
    limit: 0,
    ext: '',
    robots: 'respect',
    dryRun: false,
    force: false,
    headers: [],
  };
  const takesValue = new Set([
    'from-html', 'from-csv', 'codes', 'codes-file', 'url-template', 'out', 'source-rights',
    'concurrency', 'delay', 'timeout', 'retries', 'limit', 'ext', 'robots', 'header',
  ]);
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    const key = (eq < 0 ? raw.slice(2) : raw.slice(2, eq)).toLowerCase();
    let value = eq < 0 ? '' : raw.slice(eq + 1);
    if (!value && takesValue.has(key)) value = argv[++i] ?? '';
    switch (key) {
      case 'from-html': opts.fromHtml.push(value); break;
      case 'from-csv': opts.fromCsv.push(value); break;
      case 'codes': opts.codes = value; break;
      case 'codes-file': opts.codesFile = value; break;
      case 'url-template': opts.urlTemplate = value; break;
      case 'out': opts.out = value; break;
      case 'source-rights': opts.sourceRights = value; break;
      case 'concurrency': opts.concurrency = Number(value) || 2; break;
      case 'delay': opts.delay = Number(value) || 0; break;
      case 'timeout': opts.timeout = Number(value) || 20000; break;
      case 'retries': opts.retries = Number(value) || 0; break;
      case 'limit': opts.limit = Number(value) || 0; break;
      case 'ext': opts.ext = value; break;
      case 'robots': opts.robots = value || 'respect'; break;
      case 'header': opts.headers.push(value); break;
      case 'dry-run': opts.dryRun = true; break;
      case 'force': opts.force = true; break;
      case 'help': opts.help = true; break;
      default: throw new Error(`unknown flag --${key}`);
    }
  }
  return opts;
}

const IATA = /^[A-Z]{3}$/;

/**
 * Minimal RFC-4180-style CSV reader: quoted fields, doubled quotes inside
 * quotes, CRLF or LF line endings, blank rows dropped. Returns row objects
 * keyed by the header line, so column order does not matter.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (ch === '\r') continue;
    field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const [header, ...body] = rows.filter((cells) => cells.some((c) => c !== ''));
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((name, index) => [name.trim(), (cells[index] ?? '').trim()]))
  );
}

/**
 * Collects IATA codes from saved HTML, a CSV export, --codes and --codes-file.
 * Returns a Map of code -> { source, meta }: `source` records where the code
 * came from, `meta` carries any per-airport detail the CSV supplied (used for
 * the manifest, and for reporting the airport name on failures).
 */
async function collectCodes(opts) {
  const found = new Map();

  const add = (code, source, meta = null) => {
    if (IATA.test(code) && !found.has(code)) found.set(code, { source, meta });
  };

  for (const file of opts.fromHtml) {
    const html = await readFile(file, 'utf8');
    // Saved-listing pages carry the code in several places; take them all and
    // let the strongest signal (the IATA badge) win for provenance reporting.
    const patterns = [
      [/class="[^"]*airport-iata[^"]*"[^>]*>\s*([A-Za-z]{3})\s*</g, 'iata badge'],
      [/\/maps\/cover\/([A-Za-z]{3})\.(?:png|jpg|jpeg|webp)/g, 'cover image path'],
      [/\/airport\/([A-Za-z]{3})(?=["'/?])/g, 'airport link'],
    ];
    for (const [re, label] of patterns) {
      for (const m of html.matchAll(re)) add(m[1].toUpperCase(), `${basename(file)} (${label})`);
    }
  }

  for (const file of opts.fromCsv) {
    const rows = parseCsv(await readFile(file, 'utf8'));
    let skipped = 0;
    rows.forEach((row, index) => {
      const code = (row.iata || row.IATA || '').toUpperCase();
      if (!IATA.test(code)) { skipped++; return; }
      add(code, basename(file), {
        name: row.name || '',
        city: row.city || '',
        countryCode: (row.countryCode || '').toUpperCase(),
        path: row.path || '',
        row: index + 2,
        // Recorded for provenance only — this script never fetches it.
        referenceUrl: row.coverUrl || '',
      });
    });
    console.log(`read ${rows.length} rows from ${basename(file)}` + (skipped ? `, skipped ${skipped} without a valid IATA code` : ''));
  }

  for (const chunk of [opts.codes]) {
    for (const piece of chunk.split(/[\s,;]+/)) add(piece.trim().toUpperCase(), '--codes');
  }

  if (opts.codesFile) {
    const text = await readFile(opts.codesFile, 'utf8');
    for (const piece of text.split(/[\s,;]+/)) add(piece.trim().toUpperCase(), `--codes-file ${basename(opts.codesFile)}`);
  }

  return found;
}

// ---------------------------------------------------------------- robots.txt

/**
 * Minimal robots.txt evaluation for one user-agent: longest matching
 * Allow/Disallow rule wins, which is how Google's crawler resolves conflicts.
 */
export function robotsAllows(text, path, agent = '*') {
  let applies = false;
  const rules = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      applies = value === '*' || value.toLowerCase() === agent.toLowerCase();
    } else if (applies && (field === 'allow' || field === 'disallow')) {
      if (value) rules.push({ allow: field === 'allow', path: value });
    }
  }
  const matches = rules.filter((r) => {
    // '/' and '*' are the only wildcards worth supporting here.
    if (r.path === '/') return true;
    const pattern = r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${pattern}`).test(path);
  });
  if (!matches.length) return true;
  matches.sort((a, b) => b.path.length - a.path.length);
  return matches[0].allow;
}

async function fetchRobots(origin, headers, timeout) {
  try {
    const res = await fetchWithTimeout(`${origin}/robots.txt`, { headers }, timeout);
    if (!res.ok) return { ok: false, reason: `robots.txt returned HTTP ${res.status}` };
    return { ok: true, text: await res.text() };
  } catch (err) {
    return { ok: false, reason: `robots.txt unavailable (${err.message})` };
  }
}

// ---------------------------------------------------------------- fetching

async function fetchWithTimeout(url, { headers, method = 'GET' }, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { method, headers, redirect: 'follow', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sniffs the container so an HTML error/challenge page can never be saved as .png. */
export function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') return { type: 'image/png', ext: '.png' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { type: 'image/jpeg', ext: '.jpg' };
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return { type: 'image/webp', ext: '.webp' };
  if (buf.toString('latin1', 0, 3) === 'GIF') return { type: 'image/gif', ext: '.gif' };
  if (buf[0] === 0x42 && buf[1] === 0x4d) return { type: 'image/bmp', ext: '.bmp' };
  return null;
}

/** Detects the "200 but it's a bot check / error page" case by its content. */
function looksLikeBlockPage(buf) {
  const head = buf.toString('utf8', 0, Math.min(buf.length, 4096)).toLowerCase();
  return (
    head.includes('<!doctype html') || head.includes('<html')
  ) && (
    head.includes('just a moment') ||
    head.includes('cloudflare') ||
    head.includes('enable javascript') ||
    head.includes('attention required') ||
    head.includes('access denied') ||
    head.includes('captcha')
  );
}

async function downloadOne(code, opts, ctx) {
  const url = opts.urlTemplate.replace(/\{IATA\}/g, code).replace(/\{iata\}/g, code.toLowerCase());
  const parsed = new URL(url);
  const ext = opts.ext || extname(parsed.pathname) || '.png';
  const target = join(ctx.outDir, `${code}${ext}`);

  if (!opts.force) {
    try {
      const info = await stat(target);
      if (info.size > 0) return { code, url, status: 'skipped', bytes: info.size, target };
    } catch { /* not there yet */ }
  }
  if (opts.dryRun) return { code, url, status: 'would-fetch', target };

  if (opts.robots === 'respect' && !robotsAllows(ctx.robotsText, parsed.pathname)) {
    return { code, url, status: 'blocked-by-robots', target };
  }

  const headers = { 'user-agent': ctx.userAgent, accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' };
  for (const h of opts.headers) {
    const idx = h.indexOf(':');
    if (idx > 0) headers[h.slice(0, idx).trim().toLowerCase()] = h.slice(idx + 1).trim();
  }

  let lastReason = '';
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    if (ctx.aborted) return { code, url, status: 'aborted', reason: ctx.abortReason, target };
    try {
      const res = await fetchWithTimeout(url, { headers }, opts.timeout);
      if (res.status === 429 || res.status === 403 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after')) || 0;
        if (res.status === 429 || res.status >= 500) {
          lastReason = `HTTP ${res.status}`;
          await sleep(retryAfter ? retryAfter * 1000 : 1000 * 2 ** attempt);
          continue;
        }
        // 403: keep the failure, and stop the run if the host clearly blocks us.
        lastReason = 'HTTP 403 (blocked or not authorised for this client)';
        ctx.consecutive403++;
        if (ctx.consecutive403 >= 5) {
          ctx.aborted = true;
          ctx.abortReason = 'five consecutive HTTP 403 responses — the host is serving a bot check or refusing this client';
        }
        return { code, url, status: 'failed', reason: lastReason, target };
      }
      if (!res.ok) {
        lastReason = `HTTP ${res.status}`;
        if (res.status >= 400 && res.status < 500) return { code, url, status: 'failed', reason: lastReason, target };
        continue;
      }
      ctx.consecutive403 = 0;
      const buf = Buffer.from(await res.arrayBuffer());
      const sniffed = sniffImage(buf);
      if (!sniffed) {
        return {
          code, url, status: 'failed', target,
          reason: looksLikeBlockPage(buf)
            ? 'host returned an HTML page (bot check / error) instead of an image'
            : `not an image (${buf.length} bytes, content-type ${res.headers.get('content-type') ?? 'unknown'})`,
        };
      }
      await writeFile(target, buf);
      return {
        code, url, status: 'ok', target,
        bytes: buf.length,
        contentType: sniffed.type,
        sha256: createHash('sha256').update(buf).digest('hex'),
      };
    } catch (err) {
      lastReason = err.name === 'AbortError' ? `timeout after ${opts.timeout}ms` : err.message;
      await sleep(500 * 2 ** attempt);
    }
  }
  return { code, url, status: 'failed', reason: lastReason, target };
}

// ---------------------------------------------------------------- main

async function main() {
  // `node ... | head` closes stdout early; report it as a clean stop instead of
  // crashing mid-run with an unhandled EPIPE.
  process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') process.exit(0);
  });

  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(await readFile(new URL(import.meta.url), 'utf8').then((t) => t.split('*/')[0].replace(/^\/\*\*?/, '')));
    return;
  }
  if (!opts.urlTemplate || opts.urlTemplate.includes('CHANGE-ME')) {
    throw new Error('--url-template is required, e.g. --url-template "https://cdn.example.com/maps/cover/{IATA}.png"');
  }
  if (!opts.sourceRights) {
    throw new Error(
      "--source-rights is required: describe the licence or permission that lets you copy these images\n" +
      "  (it is recorded in the manifest next to every file). Only download media you have the right to use."
    );
  }
  if (!/{IATA}|{iata}/.test(opts.urlTemplate)) {
    throw new Error('--url-template must contain {IATA} (uppercase) or {iata} (lowercase)');
  }

  const codes = await collectCodes(opts);
  if (!codes.size) {
    throw new Error('no IATA codes found — pass --from-html, --codes or --codes-file');
  }
  let list = [...codes.keys()].sort();
  if (opts.limit > 0) list = list.slice(0, opts.limit);

  const origin = new URL(opts.urlTemplate.replace(/\{IATA\}|\{iata\}/g, 'AAA')).origin;
  const outDir = resolve(opts.out);
  await mkdir(outDir, { recursive: true });

  const userAgent = 'airport-images-fetcher/1.0 (+personal archiving; contact: site owner)';
  let robotsText = '';
  let robotsNote = 'not checked (--robots ignore)';
  if (opts.robots === 'respect') {
    const robots = await fetchRobots(origin, { 'user-agent': userAgent }, opts.timeout);
    if (robots.ok) {
      robotsText = robots.text;
      robotsNote = `checked (${origin}/robots.txt)`;
    } else {
      robotsNote = `unavailable — proceeding with a polite rate limit (${robots.reason})`;
    }
  }

  console.log(`source      ${origin}`);
  console.log(`airports    ${list.length} codes from ${new Set([...codes.values()].map((v) => v.source)).size} source(s)`);
  console.log(`output      ${outDir}`);
  console.log(`robots.txt  ${robotsNote}`);
  console.log(`rate        concurrency ${opts.concurrency}, ${opts.delay}ms between starts${opts.dryRun ? '  [DRY RUN]' : ''}`);
  console.log(`rights      ${opts.sourceRights}\n`);

  const ctx = { outDir, robotsText, userAgent, aborted: false, abortReason: '', consecutive403: 0 };
  const results = [];
  const queue = [...list];
  const workers = Array.from({ length: Math.max(1, opts.concurrency) }, async () => {
    while (queue.length && !ctx.aborted) {
      const code = queue.shift();
      const res = await downloadOne(code, opts, ctx);
      res.meta = codes.get(code)?.meta ?? null;
      results.push(res);
      const flag = { ok: '✓', skipped: '=', 'would-fetch': '·' }[res.status] ?? '✗';
      const detail = res.status === 'ok' ? `${(res.bytes / 1024).toFixed(1)} KB`
        : res.status === 'skipped' ? 'already present'
        : res.reason ?? '';
      console.log(`${flag} ${code}  ${res.status}${detail ? `  ${detail}` : ''}`);
      if (opts.delay) await sleep(opts.delay);
    }
  });
  await Promise.all(workers);

  const by = (s) => results.filter((r) => r.status === s);
  const ok = by('ok');
  const failed = by('failed');
  const skipped = by('skipped');
  const blocked = [...by('blocked-by-robots'), ...by('aborted')];

  console.log(`\n${ok.length} downloaded, ${skipped.length} already present, ${failed.length} failed, ${blocked.length} skipped by policy`);
  if (ctx.abortReason) console.log(`stopped early: ${ctx.abortReason}`);

  if (!opts.dryRun) {
    const manifestPath = join(outDir, 'maps-manifest.json');
    let previous = { files: {} };
    if (existsSync(manifestPath)) {
      try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* rewrite it */ }
    }
    const files = { ...(previous.files ?? {}) };
    for (const r of ok) {
      files[r.code] = {
        ...(r.meta?.name ? { name: r.meta.name } : {}),
        ...(r.meta?.city ? { city: r.meta.city } : {}),
        ...(r.meta?.countryCode ? { countryCode: r.meta.countryCode } : {}),
        ...(r.meta?.referenceUrl ? { referenceUrl: r.meta.referenceUrl } : {}),
        url: r.url, bytes: r.bytes, contentType: r.contentType, sha256: r.sha256,
        file: basename(r.target), sourceRights: opts.sourceRights,
        retrievedAt: new Date().toISOString(),
      };
    }
    await writeFile(manifestPath, JSON.stringify({
      note: 'Provenance for downloaded map images. Keep this next to the images: it is the record of where each file came from and under what right it was copied.',
      source: origin,
      sourceRights: opts.sourceRights,
      updatedAt: new Date().toISOString(),
      count: Object.keys(files).length,
      files,
    }, null, 2) + '\n');

    const failures = [...failed, ...blocked];
    if (failures.length) {
      await writeFile(
        join(outDir, 'failures.txt'),
        failures.map((f) => `${f.code}\t${f.status}\t${f.reason ?? ''}\t${f.url}`).join('\n') + '\n'
      );
      console.log(`failures written to ${join(outDir, 'failures.txt')}`);
    }
    console.log(`manifest written to ${manifestPath}`);
  }

  if (failed.length || blocked.length) process.exitCode = 1;
}

// Only run when invoked directly, so `robotsAllows` / `sniffImage` stay importable in tests.
const isEntryPoint =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    console.error(`\nerror: ${err.message}`);
    process.exitCode = 2;
  });
}
