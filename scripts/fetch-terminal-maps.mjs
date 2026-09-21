/**
 * Bulk-downloads the terminal-map PNG + PDF for every airport (IATA code):
 *
 *   {base}/{IATA}/{IATA}_large.png    e.g. .../HKG/HKG_large.png
 *   {base}/{IATA}/{IATA}.pdf          e.g. .../HKG/HKG.pdf
 *
 * The airport list comes from the `airports` table by default, so the download
 * set is exactly the directory the site serves. `--codes` / `--codes-file`
 * override it. Like scripts/fetch-airport-images.mjs, this never crawls to
 * discover codes, honours robots.txt by default, verifies every file by magic
 * bytes (a 200 HTML error page is never saved as .png/.pdf), and records
 * provenance (URL + sha256) in terminal-maps-manifest.json next to the files.
 *
 * Files land in per-code folders mirroring the source:
 *   {out}/{CODE}/{CODE}_large.png
 *   {out}/{CODE}/{CODE}.pdf
 *
 * Usage:
 *   node scripts/fetch-terminal-maps.mjs                       # all airports in the DB
 *   node scripts/fetch-terminal-maps.mjs --codes HKG,PEK,TAS   # just these
 *   node scripts/fetch-terminal-maps.mjs --codes-file codes.txt
 *   node scripts/fetch-terminal-maps.mjs --pdf-only --limit 10
 *
 * Useful flags:
 *   --out DIR              download root (default ./public/terminal-maps, so
 *                          Next serves the files at /terminal-maps/...; pass
 *                          e.g. --out ./maps-import to keep them out of git)
 *   --base URL             source root (default https://www.eoob.com/images/terminal-maps)
 *   --png-only / --pdf-only  fetch only one of the two artefacts
 *   --dry-run              list what would be fetched, touch nothing
 *   --force                re-download files that already exist
 *   --concurrency 3        parallel airports (keep it low; be a good citizen)
 *   --delay 150            ms between request starts
 *   --retries 3            retries for 429/5xx/network errors
 *   --limit 20             only the first N airports
 *   --robots ignore        skip the robots.txt check (only for sources you own)
 *   --source-rights '...'  licence note recorded in the manifest
 *
 * Exit code is 1 if any download failed (a 404 "source has no map for this
 * airport" is reported separately and does not fail the run).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { robotsAllows, sniffImage } from './fetch-airport-images.mjs';

const DEFAULT_BASE = 'https://www.eoob.com/images/terminal-maps';
const DEFAULT_OUT = './public/terminal-maps';
const DEFAULT_RIGHTS =
  'unverified — terminal maps from eoob.com; permission to publish has not been established';

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const opts = {
    codes: '',
    codesFile: '',
    out: DEFAULT_OUT,
    base: DEFAULT_BASE,
    concurrency: 3,
    delay: 150,
    timeout: 30000,
    retries: 3,
    limit: 0,
    robots: 'respect',
    sourceRights: '',
    pngOnly: false,
    pdfOnly: false,
    dryRun: false,
    force: false,
  };
  const flags = new Set(['png-only', 'pdf-only', 'dry-run', 'force', 'help']);
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    const key = (eq < 0 ? raw.slice(2) : raw.slice(2, eq)).toLowerCase();
    let value = eq < 0 ? '' : raw.slice(eq + 1);
    if (!value && !flags.has(key)) value = argv[++i] ?? '';
    switch (key) {
      case 'codes': opts.codes = value; break;
      case 'codes-file': opts.codesFile = value; break;
      case 'out': opts.out = value; break;
      case 'base': opts.base = value.replace(/\/+$/, ''); break;
      case 'concurrency': opts.concurrency = Number(value) || 3; break;
      case 'delay': opts.delay = Number(value) || 0; break;
      case 'timeout': opts.timeout = Number(value) || 30000; break;
      case 'retries': opts.retries = Number(value) || 0; break;
      case 'limit': opts.limit = Number(value) || 0; break;
      case 'robots': opts.robots = value || 'respect'; break;
      case 'source-rights': opts.sourceRights = value; break;
      case 'png-only': opts.pngOnly = true; break;
      case 'pdf-only': opts.pdfOnly = true; break;
      case 'dry-run': opts.dryRun = true; break;
      case 'force': opts.force = true; break;
      case 'help': opts.help = true; break;
      default: throw new Error(`unknown flag --${key}`);
    }
  }
  return opts;
}

const IATA = /^[A-Z]{3}$/;

/** URL + filename for one artefact of one airport. */
export function artefactUrl(base, code, kind) {
  if (kind === 'png') {
    return { url: `${base}/${code}/${code}_large.png`, file: `${code}_large.png`, pathname: `/images/terminal-maps/${code}/${code}_large.png` };
  }
  return { url: `${base}/${code}/${code}.pdf`, file: `${code}.pdf`, pathname: `/images/terminal-maps/${code}/${code}.pdf` };
}

/** Airport codes + display meta, either from --codes/--codes-file or the DB. */
async function collectCodes(opts) {
  if (!opts.codes && !opts.codesFile) {
    const client = new pg.Client({ connectionString: databaseUrl() });
    await client.connect();
    try {
      const { rows } = await client.query(
        'SELECT iata, name_en, city_en, country_code FROM airports ORDER BY iata'
      );
      const found = new Map();
      for (const row of rows) {
        found.set(row.iata, {
          name: row.name_en || '',
          city: row.city_en || '',
          countryCode: row.country_code || '',
        });
      }
      return { found, source: 'airports table' };
    } finally {
      await client.end();
    }
  }

  const found = new Map();
  const add = (code, source) => {
    if (IATA.test(code) && !found.has(code)) found.set(code, {});
  };
  for (const piece of opts.codes.split(/[\s,;]+/)) add(piece.trim().toUpperCase(), '--codes');
  if (opts.codesFile) {
    const text = await readFile(opts.codesFile, 'utf8');
    for (const piece of text.split(/[\s,;]+/)) add(piece.trim().toUpperCase(), `--codes-file ${basename(opts.codesFile)}`);
  }
  return { found, source: opts.codes ? '--codes' : `--codes-file ${basename(opts.codesFile)}` };
}

// ---------------------------------------------------------------- fetching

async function fetchWithTimeout(url, { headers }, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { headers, redirect: 'follow', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** PDF container check, the counterpart of sniffImage() for documents. */
export function sniffPdf(buf) {
  return buf.length >= 5 && buf.toString('latin1', 0, 5) === '%PDF-';
}

/** Detects the "200 but it's an error page" case by its content. */
function looksLikeErrorPage(buf) {
  const head = buf.toString('utf8', 0, Math.min(buf.length, 4096)).toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html');
}

/**
 * Downloads one artefact. Returns one of:
 *   ok | skipped | would-fetch | missing (404) | blocked-by-robots | failed
 */
async function downloadOne(code, kind, opts, ctx) {
  const { url, file, pathname } = artefactUrl(ctx.base, code, kind);
  const target = join(ctx.outDir, code, file);
  const artefact = { kind, code, url, file, target };

  if (!opts.force) {
    try {
      const info = await stat(target);
      if (info.size > 0) return { ...artefact, status: 'skipped', bytes: info.size };
    } catch { /* not there yet */ }
  }
  if (opts.dryRun) return { ...artefact, status: 'would-fetch' };

  if (opts.robots === 'respect' && !robotsAllows(ctx.robotsText, pathname)) {
    return { ...artefact, status: 'blocked-by-robots' };
  }

  const headers = {
    'user-agent': ctx.userAgent,
    accept: kind === 'png'
      ? 'image/png,image/*;q=0.8,*/*;q=0.5'
      : 'application/pdf,*/*;q=0.5',
  };

  let lastReason = '';
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    if (ctx.aborted) return { ...artefact, status: 'aborted', reason: ctx.abortReason };
    try {
      const res = await fetchWithTimeout(url, { headers }, opts.timeout);
      if (res.status === 429 || res.status >= 500) {
        lastReason = `HTTP ${res.status}`;
        const retryAfter = Number(res.headers.get('retry-after')) || 0;
        await sleep(retryAfter ? retryAfter * 1000 : 1000 * 2 ** attempt);
        continue;
      }
      if (res.status === 403) {
        // Keep the per-file failure, and stop the run if the host is clearly
        // refusing this client — hammering a bot check helps nobody.
        ctx.consecutive403++;
        if (ctx.consecutive403 >= 5) {
          ctx.aborted = true;
          ctx.abortReason = 'five consecutive HTTP 403 responses — the host is refusing this client';
        }
        return { ...artefact, status: 'failed', reason: 'HTTP 403 (blocked or not authorised for this client)' };
      }
      if (res.status === 404) {
        return { ...artefact, status: 'missing', reason: 'HTTP 404 — no map for this code at the source' };
      }
      if (!res.ok) {
        return { ...artefact, status: 'failed', reason: `HTTP ${res.status}` };
      }
      ctx.consecutive403 = 0;

      const buf = Buffer.from(await res.arrayBuffer());
      if (kind === 'pdf') {
        if (!sniffPdf(buf)) {
          return {
            ...artefact, status: 'failed',
            reason: looksLikeErrorPage(buf)
              ? 'host returned an HTML page instead of a PDF'
              : `not a PDF (${buf.length} bytes, content-type ${res.headers.get('content-type') ?? 'unknown'})`,
          };
        }
      } else {
        const sniffed = sniffImage(buf);
        if (!sniffed) {
          return {
            ...artefact, status: 'failed',
            reason: looksLikeErrorPage(buf)
              ? 'host returned an HTML page instead of an image'
              : `not an image (${buf.length} bytes, content-type ${res.headers.get('content-type') ?? 'unknown'})`,
          };
        }
        if (sniffed.ext !== '.png') {
          // Saved under the real extension so a browser/`next start` never
          // serves JPEG bytes labelled image/png; the manifest records it.
          artefact.file = `${code}_large${sniffed.ext}`;
          artefact.target = join(ctx.outDir, code, artefact.file);
          artefact.extMismatch = sniffed.ext;
        }
        artefact.contentType = sniffed.type;
      }

      await mkdir(join(ctx.outDir, code), { recursive: true });
      await writeFile(artefact.target, buf);
      return {
        ...artefact,
        status: 'ok',
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
      };
    } catch (err) {
      lastReason = err.name === 'AbortError' ? `timeout after ${opts.timeout}ms` : err.message;
      await sleep(500 * 2 ** attempt);
    }
  }
  return { ...artefact, status: 'failed', reason: lastReason };
}

// ---------------------------------------------------------------- main

async function main() {
  // `node ... | head` closes stdout early; stop cleanly instead of crashing.
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
  if (opts.pngOnly && opts.pdfOnly) throw new Error('--png-only and --pdf-only are mutually exclusive');
  if (!/^https?:\/\//.test(opts.base)) throw new Error(`--base must be an http(s) URL, got: ${opts.base}`);

  const kinds = opts.pdfOnly ? ['pdf'] : opts.pngOnly ? ['png'] : ['png', 'pdf'];
  const { found, source } = await collectCodes(opts);
  if (!found.size) throw new Error('no IATA codes found — is the database seeded? pass --codes or --codes-file otherwise');
  let list = [...found.keys()].sort();
  if (opts.limit > 0) list = list.slice(0, opts.limit);

  const outDir = resolve(ROOT, opts.out);
  const userAgent = 'airport-terminal-maps-fetcher/1.0 (+personal archiving; contact: site owner)';

  let robotsText = '';
  let robotsNote = 'not checked (--robots ignore)';
  if (opts.robots === 'respect') {
    try {
      const res = await fetchWithTimeout(new URL(opts.base).origin + '/robots.txt', { headers: { 'user-agent': userAgent } }, opts.timeout);
      if (res.ok) {
        robotsText = await res.text();
        robotsNote = `checked (${new URL(opts.base).origin}/robots.txt)`;
      } else {
        robotsNote = `unavailable (HTTP ${res.status}) — proceeding with a polite rate limit`;
      }
    } catch (err) {
      robotsNote = `unavailable (${err.message}) — proceeding with a polite rate limit`;
    }
  }

  console.log(`source      ${opts.base}/{IATA}/{IATA}_large.png + .pdf`);
  console.log(`airports    ${list.length} codes from ${source}`);
  console.log(`artefacts   ${kinds.join(' + ')}`);
  console.log(`output      ${outDir}`);
  console.log(`robots.txt  ${robotsNote}`);
  console.log(`rate        concurrency ${opts.concurrency}, ${opts.delay}ms between starts${opts.dryRun ? '  [DRY RUN]' : ''}`);
  if (!opts.dryRun) console.log(`rights      ${opts.sourceRights || DEFAULT_RIGHTS}\n`);

  const ctx = { base: opts.base, outDir, robotsText, userAgent, aborted: false, abortReason: '', consecutive403: 0 };
  const results = [];
  const queue = [...list];
  const workers = Array.from({ length: Math.max(1, opts.concurrency) }, async () => {
    while (queue.length && !ctx.aborted) {
      const code = queue.shift();
      // Both artefacts per code before the next code keeps the per-airport
      // log line together and halves the skip-stat calls vs a flat queue.
      const files = [];
      for (const kind of kinds) {
        const res = await downloadOne(code, kind, opts, ctx);
        results.push(res);
        files.push(res);
        if (ctx.aborted) break;
      }
      const meta = found.get(code) ?? {};
      const flag = files.every((f) => ['ok', 'skipped'].includes(f.status)) ? '✓'
        : files.some((f) => f.status === 'failed') ? '✗' : '·';
      const detail = files
        .map((f) => {
          if (f.status === 'ok') return `${f.kind} ${(f.bytes / 1024).toFixed(0)}KB`;
          if (f.status === 'skipped') return `${f.kind} =`;
          if (f.status === 'would-fetch') return `${f.kind} ·`;
          if (f.status === 'missing') return `${f.kind} missing(404)`;
          return `${f.kind} ${f.reason ?? f.status}`;
        })
        .join('  ');
      const name = [meta.name, meta.city].filter(Boolean).join(', ');
      console.log(`${flag} ${code}${name ? `  ${name}` : ''}  ${detail}`);
      if (opts.delay) await sleep(opts.delay);
    }
  });
  await Promise.all(workers);

  const by = (s) => results.filter((r) => r.status === s);
  const ok = by('ok');
  const skipped = by('skipped');
  const missing = by('missing');
  const failed = [...by('failed'), ...by('blocked-by-robots'), ...by('aborted')];

  console.log(
    `\n${ok.length} downloaded, ${skipped.length} already present, ${missing.length} missing at source, ${failed.length} failed` +
    (ctx.abortReason ? `\nstopped early: ${ctx.abortReason}` : '')
  );
  if (missing.length) {
    console.log(`missing (no map at the source): ${missing.map((m) => `${m.code}/${m.kind}`).join(', ')}`);
  }

  if (!opts.dryRun) {
    const manifestPath = join(outDir, 'terminal-maps-manifest.json');
    let previous = { files: {} };
    if (existsSync(manifestPath)) {
      try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* rewrite it */ }
    }
    const files = { ...(previous.files ?? {}) };
    const rights = opts.sourceRights || DEFAULT_RIGHTS;
    const retrievedAt = new Date().toISOString();
    for (const code of new Set(ok.map((r) => r.code))) {
      const meta = found.get(code) ?? {};
      const prev = files[code] ?? {};
      const entry = (kind) => {
        const r = ok.find((x) => x.code === code && x.kind === kind);
        if (!r) return prev[kind] ?? null; // --png-only runs keep the other artefact's record
        return {
          url: r.url, file: r.file, bytes: r.bytes, sha256: r.sha256,
          contentType: r.contentType ?? 'application/pdf',
          ...(r.extMismatch ? { note: `source served ${r.contentType} at a .png URL; saved under the real extension` } : {}),
          retrievedAt,
        };
      };
      files[code] = {
        ...(meta.name ? { name: meta.name } : {}),
        ...(meta.city ? { city: meta.city } : {}),
        ...(meta.countryCode ? { countryCode: meta.countryCode } : {}),
        png: kinds.includes('png') ? entry('png') : (prev.png ?? null),
        pdf: kinds.includes('pdf') ? entry('pdf') : (prev.pdf ?? null),
        sourceRights: rights,
      };
    }
    await writeFile(manifestPath, JSON.stringify({
      note: 'Provenance for downloaded terminal maps. Keep this next to the files: it records where each file came from and under what right it was copied.',
      source: opts.base,
      sourceRights: rights,
      updatedAt: retrievedAt,
      count: Object.keys(files).length,
      files,
    }, null, 2) + '\n');
    console.log(`manifest written to ${manifestPath}`);

    if (failed.length) {
      await writeFile(
        join(outDir, 'failures.txt'),
        failed.map((f) => `${f.code}/${f.kind}\t${f.status}\t${f.reason ?? ''}\t${f.url}`).join('\n') + '\n'
      );
      console.log(`failures written to ${join(outDir, 'failures.txt')}`);
    }
  }

  if (failed.length) process.exitCode = 1;
}

// Only run when invoked directly, so the helpers stay importable in tests.
const isEntryPoint =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    console.error(`\nerror: ${err.message}`);
    process.exitCode = 2;
  });
}
