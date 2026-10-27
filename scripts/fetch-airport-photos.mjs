/**
 * Bulk-downloads airport photos from Bing image search into public/photos, one
 * folder per IATA code (`<iata>-bing-<n>.webp`), and records provenance for
 * every file in public/photos/manifest.json — the record the airport page's
 * photo gallery renders its credit line from (lib/airport-photos.ts). A file
 * that is not in the manifest never appears on the site.
 *
 * The airport list comes from a GSC-export CSV (`--from-csv`, airport paths
 * only), from the DB (`--from-db`, the default), or from `--codes`. Display
 * names for the search query come from the `airports` table, falling back to
 * `<IATA> airport`; a code whose search returns nothing usable is retried with
 * that fallback query.
 *
 * Bing disallows /images/search? in robots.txt for `User-agent: *`, and Baidu
 * image search disallows its whole site, so the script checks robots.txt and
 * refuses to run in the default `--robots respect` mode; pass `--robots ignore`
 * to proceed, which is the owner's call for their own sourcing (the first batch
 * was fetched this way). Image downloads check each source host's robots.txt
 * too, cached per host, under the same flag.
 *
 * Three sources, picked with --source:
 *   bing (default)  international Bing image search, English queries from the
 *                   DB's name_en. Needs a network where www.bing.com answers
 *                   with real results — the China edge (cn.bing.com) returns
 *                   unrelated content for most English airport queries, so the
 *                   query chain alone cannot fix it there.
 *   baidu           image.baidu.com's web-result JSON, Chinese queries from the
 *                   DB's zh name/city — the source that works from a mainland
 *                   network, and the site's primary audience is Chinese anyway.
 *                   Downloads run through Baidu's own image cache (img*.baidu.com);
 *                   the manifest still credits the original page.
 *   360             image.so.com's JSON endpoint. Rows carry the original page
 *                   URL, so credit is more precise than Baidu's; queries append
 *                   航站楼 / terminal to reduce hotel and flight-sim results.
 *
 * Every download is verified by magic bytes and by real pixel size (a 200 HTML
 * error page can never be saved as .webp, and icons/thumbs below --min-width
 * are discarded), then re-encoded to WebP with sharp. A freshly fetched photo
 * is only *staged*: it renders after an editor has looked at it and written a
 * caption in public/photos/captions/<IATA>.json (or left it out with `_skip`) —
 * the caption is the publication gate. See scripts/build-photo-captions.mjs.
 *
 * Usage:
 *   node scripts/fetch-airport-photos.mjs --from-csv 表格.csv --robots ignore
 *   node scripts/fetch-airport-photos.mjs --codes AAL,ABQ --dry-run
 *   node scripts/fetch-airport-photos.mjs --from-db --limit 20 --offset 20
 *
 * Useful flags:
 *   --out DIR             download root (default ./public/photos, served by Next)
 *   --per-airport 3       photos to keep per airport
 *   --limit N / --offset N  batch the run (codes are processed alphabetically)
 *   --delay 700           ms between request starts (search, robots, downloads)
 *   --min-width 420       discard images narrower than this
 *   --max-width 1600      re-encode cap
 *   --force               re-fetch codes that already have photos
 *   --append              keep existing entries and add this source's photos
 *                         (for adding e.g. Baidu pictures to a satellite-only airport)
 *   --dry-run             list what would be fetched, touch nothing
 *   --robots respect|ignore  default respect (Bing blocks it; see above)
 *
 * The manifest is rewritten after every airport, so an interrupted run keeps
 * the photos it already fetched and the next run simply continues.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import sharp from 'sharp';
import { databaseUrl, ROOT } from './_env.mjs';
import { robotsAllows, sniffImage } from './fetch-airport-images.mjs';

/** Code -> escaped stem for directories Windows cannot name (`AUX`). */
const PHOTO_STEMS = (() => {
  try {
    const file = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photo-file-aliases.json'), 'utf8'));
    return Object.fromEntries(
      Object.entries(file).filter(
        ([code, stem]) => /^[A-Z]{3}$/.test(code) && typeof stem === 'string'
      )
    );
  } catch {
    return {};
  }
})();
const photoStem = (code) => PHOTO_STEMS[code] ?? code;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BING = 'https://www.bing.com';
/** Large-image filter; falls back to an unfiltered query when it returns nothing. */
const SIZE_FILTER = '&qft=+filterui:imagesize-large';

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const opts = {
    fromCsv: '',
    fromDb: false,
    codes: '',
    out: './public/photos',
    perAirport: 3,
    source: 'bing',
    limit: 0,
    offset: 0,
    delay: 700,
    timeout: 25000,
    retries: 2,
    minWidth: 420,
    maxWidth: 1600,
    quality: 80,
    force: false,
    append: false,
    dryRun: false,
    debug: false,
    robots: 'respect',
  };
  const takesValue = new Set([
    'from-csv', 'codes', 'out', 'per-airport', 'source', 'limit', 'offset', 'delay', 'timeout',
    'retries', 'min-width', 'max-width', 'quality', 'robots',
  ]);
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    const key = (eq >= 0 ? raw.slice(2, eq) : raw.slice(2)).toLowerCase();
    const value = eq >= 0 ? raw.slice(eq + 1) : takesValue.has(key) ? argv[++i] : true;
    switch (key) {
      case 'from-csv': opts.fromCsv = String(value); break;
      case 'from-db': opts.fromDb = true; break;
      case 'codes': opts.codes = String(value); break;
      case 'out': opts.out = String(value); break;
      case 'per-airport': opts.perAirport = Number(value); break;
      case 'source': opts.source = String(value); break;
      case 'limit': opts.limit = Number(value); break;
      case 'offset': opts.offset = Number(value); break;
      case 'delay': opts.delay = Number(value); break;
      case 'timeout': opts.timeout = Number(value); break;
      case 'retries': opts.retries = Number(value); break;
      case 'min-width': opts.minWidth = Number(value); break;
      case 'max-width': opts.maxWidth = Number(value); break;
      case 'quality': opts.quality = Number(value); break;
      case 'robots': opts.robots = String(value); break;
      case 'force': opts.force = true; break;
      case 'append': opts.append = true; break;
      case 'dry-run': opts.dryRun = true; break;
      case 'debug': opts.debug = true; break;
      default: throw new Error(`unknown flag --${key}`);
    }
  }
  opts.out = join(ROOT, opts.out);
  return opts;
}

// ---------------------------------------------------------------- requests

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One global pacing gate so search, robots and download requests interleave politely. */
let lastRequest = 0;
async function paced(delay, fn) {
  const wait = lastRequest + delay - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fn();
}

async function fetchWithTimeout(url, { headers, timeout }, tries) {
  let error;
  for (let attempt = 0; attempt <= tries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: controller.signal });
      if (res.status === 429 || res.status >= 500) {
        error = new Error(`HTTP ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      error = err;
    } finally {
      clearTimeout(timer);
    }
    await sleep(1500 * (attempt + 1));
  }
  throw error;
}

// ---------------------------------------------------------------- robots

const robotsCache = new Map();

/**
 * Whether the source host allows fetching `path` (pathname **and** query —
 * robots rules like Bing's own `/images/search?` only match with the query
 * attached). In `respect` mode a host whose robots.txt cannot be read is
 * refused, the way scripts/fetch-airport-images.mjs treats it; `ignore` skips
 * the check entirely (owner's sourcing decision — see the header note on Bing
 * itself).
 */
async function hostAllows(origin, pathAndQuery, opts) {
  if (opts.robots === 'ignore') return { ok: true };
  if (!robotsCache.has(origin)) {
    const res = await paced(opts.delay, () =>
      fetchWithTimeout(`${origin}/robots.txt`, { headers: { 'user-agent': UA }, timeout: opts.timeout }, 0)
    ).catch(() => null);
    robotsCache.set(origin, res && res.ok ? await res.text() : null);
  }
  const text = robotsCache.get(origin);
  if (text === null) return { ok: false, reason: 'robots.txt unavailable' };
  return { ok: robotsAllows(text, pathAndQuery), reason: 'disallowed by robots.txt' };
}

// ---------------------------------------------------------------- search

/** HTML-unescapes the attribute payload Bing wraps its result JSON in. */
function unescapeAttr(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Candidate images for one query, in Bing's own relevance order, deduplicated. */
function parseResults(html) {
  const seen = new Set();
  const out = [];
  const re = /m="(\{[^"]*\})"/g;
  for (const match of html.matchAll(re)) {
    let item;
    try {
      item = JSON.parse(unescapeAttr(match[1]));
    } catch {
      continue;
    }
    const murl = item.murl;
    if (!murl || !/^https?:\/\//.test(murl)) continue;
    if (/\.(svg|gif|ico|bmp|avif)($|\?)/i.test(murl)) continue;
    const key = item.md5 || murl;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ murl, purl: item.purl || '', title: item.t || '', md5: item.md5 || '' });
  }
  return out;
}

/**
 * Generic words that say nothing about *which* airport a picture shows.
 * "Joint Base Andrews" must match on "andrews", not on "joint" — the first
 * dry run happily collected anatomical joint diagrams for ADW.
 */const NAME_STOPWORDS = new Set([
  'international', 'regional', 'municipal', 'national', 'provincial', 'airport', 'airfield',
  'aerodrome', 'air', 'base', 'joint', 'field', 'county', 'city', 'island', 'fort', 'port',
  'harbour', 'harbor', 'station', 'terminal', 'service', 'services', 'group', 'grand',
  'general', 'north', 'south', 'east', 'west', 'new', 'old', 'san', 'santa', 'las', 'los',
  'del', 'de', 'la', 'le', 'les', 'el', 'the',
]);

/** "Airport" in the languages this site sources from. */
const AIRPORT_WORDS =
  /airport|aeroport|aeropuert|lufthavn|flughafen|luchthaven|lotnisko|leti|repul|flygplats|aerodrome|airfield|空港|机场|機場|مطار|αεροδρ|공항|สนามบิน|sân bay/i;

/**
 * Does a search hit plausibly show this airport? Two independent signals are
 * required, and at least one must be specific:
 *
 *   place   a distinctive word of the airport's or city's name ("addison",
 *           "andrews") appears in the title or URL
 *   code    the IATA code appears as its own word — weak on its own, because
 *           codes collide with common acronyms ("ADS" is a design tool,
 *           "AEG" a brand)
 *   anyAirport  the title or URL names an airport at all — weak on its own,
 *           because any airport picture passes it ("Swiss Airline
 *           Headquarters" on a stock-photo host shipped a Zurich photo under
 *           AEG's name in the first untuned run)
 *
 * Accepted: place + airport word (the usual case), place + code, code +
 * airport word. Rejected: a lone code (ADS software tutorials) or a lone
 * airport word (unrelated airports' stock photos). It still cannot judge
 * content — a stock aircraft shot passing all three signals is what the
 * gallery's editorial pass (`_skip`) is for.
 */
/** Case- and accent-insensitive form ("Abéché" → "abeche"), for name matching. */
const fold = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Words a title uses when it is talking about an airport. */
const AIRPORT_NEAR =
  /机场|空港|航站楼|airport|airfield|aerodrome|aeroport|aeropuert|flughafen|lufthavn|aerodromo/i;

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Is `word` used next to an airport word, within `span` characters either side? */
function nearAirportWord(text, word, span) {
  let index = text.indexOf(word);
  while (index >= 0) {
    const window = text.slice(Math.max(0, index - span), index + word.length + span);
    if (AIRPORT_NEAR.test(window)) return true;
    index = text.indexOf(word, index + 1);
  }
  return false;
}

function signalsFor(candidate, iata, info) {
  const title = candidate.title || '';
  const haystack = `${title} ${candidate.purl} ${candidate.murl}`;
  const latinWords = fold(`${info.nameEn} ${info.city}`)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !NAME_STOPWORDS.has(word));
  // A name alone is not evidence of *this* airport: "艾丽丝现身北京机场" is a
  // celebrity photo, "谢列梅捷沃亚历山大普希金国际机场" is Moscow. The latin
  // word must appear within a short span of an airport word (title or URL —
  // host names read "xairport.net"), and the zh name must be the full DB name
  // or its base directly attached to 机场/空港/航站楼.
  const latinHit = latinWords.some((word) => nearAirportWord(fold(`${title} ${candidate.purl}`), word, 30));
  const zhName = info.name || '';
  const zhBase = zhName.replace(/(国际)?机场$/, '').trim();
  const zhHit =
    (zhName.length >= 3 && title.includes(zhName)) ||
    (zhBase.length >= 3 &&
      new RegExp(`${escapeRe(zhBase)}(国际|地区)?(机场|空港|航站楼)`).test(title));
  const place = latinHit || zhHit;
  // The code counts only where airports are actually coded: the result's title
  // or a URL path segment. A bare match anywhere in the URL matched hash
  // fragments and file stems that have nothing to do with the airport.
  let path = '';
  try {
    path = new URL(candidate.purl || candidate.murl).pathname;
  } catch {
    /* unparseable url — no path evidence */
  }
  const code = new RegExp(`(^|[^a-z0-9])${iata}([^a-z0-9]|$)`, 'i');
  return {
    place,
    code: code.test(title) || code.test(path),
    anyAirport: AIRPORT_WORDS.test(haystack),
  };
}

function looksRelevant(candidate, iata, info) {
  const { place, code, anyAirport } = signalsFor(candidate, iata, info);
  return (place && (code || anyAirport)) || (code && anyAirport);
}

async function search(query, opts) {
  const path = `/images/search?q=${encodeURIComponent(query)}&first=1&count=35`;
  const allowed = await hostAllows(BING, path, opts);
  if (!allowed.ok) {
    throw new Error(
      `Bing robots.txt does not allow /images/search (${allowed.reason}). ` +
        'Re-run with --robots ignore if this sourcing decision is yours to make.'
    );
  }
  const res = await paced(opts.delay, () =>
    fetchWithTimeout(
      `${BING}${path}${SIZE_FILTER}`,
      {
        headers: {
          'user-agent': UA,
          'accept-language': 'en-US,en;q=0.9',
          accept: 'text/html,application/xhtml+xml',
        },
        timeout: opts.timeout,
      },
      opts.retries
    )
  );
  if (!res.ok) throw new Error(`Bing answered HTTP ${res.status}`);
  const html = await res.text();
  let candidates = parseResults(html);
  if (candidates.length === 0) {
    // The large-image filter occasionally yields nothing for tiny airfields.
    const plain = await paced(opts.delay, () =>
      fetchWithTimeout(`${BING}/images/search?q=${encodeURIComponent(query)}&first=1&count=35`, {
        headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' },
        timeout: opts.timeout,
      }, opts.retries)
    );
    candidates = parseResults(await plain.text());
  }
  return candidates;
}

// ---------------------------------------------------------------- baidu source

const BAIDU = 'https://image.baidu.com';
const SO360 = 'https://image.so.com';
/** Session cookies from a first page load; the JSON endpoint refuses without them. */
let baiduCookies = null;

async function baiduSession(opts) {
  if (baiduCookies !== null) return;
  const res = await paced(opts.delay, () =>
    fetchWithTimeout(`${BAIDU}/`, { headers: { 'user-agent': UA, accept: 'text/html' }, timeout: opts.timeout }, 0)
  ).catch(() => null);
  const jar = res && res.ok && typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  baiduCookies = jar.map((cookie) => cookie.split(';')[0]).join('; ');
}

/**
 * Baidu's JSON contains escapes JSON does not define (`\'` inside strings), so
 * a straight JSON.parse throws on some result sets; repair those and retry
 * rather than discarding the whole page.
 */
function parseBaiduJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(text.replace(/\\'/g, "'"));
  }
}

/**
 * One query's image results from 360 Images (`image.so.com/j`). Unlike Baidu,
 * each row carries the original page URL and the full-size image URL, so the
 * manifest can credit the page the picture came from. Rows whose declared
 * width is below --min-width are dropped before downloading.
 */
async function so360Search(query, opts) {
  const path = `/j?q=${encodeURIComponent(query)}&pn=0&rn=30`;
  const allowed = await hostAllows(SO360, path, opts);
  if (!allowed.ok) {
    throw new Error(
      `360 image search is not allowed by robots.txt (${allowed.reason}). ` +
        'Re-run with --robots ignore if this sourcing decision is yours to make.'
    );
  }
  const res = await paced(opts.delay, () =>
    fetchWithTimeout(
      `${SO360}${path}`,
      {
        headers: {
          'user-agent': UA,
          accept: 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9',
          referer: `${SO360}/`,
        },
        timeout: opts.timeout,
      },
      opts.retries
    )
  );
  if (!res.ok) throw new Error(`360 answered HTTP ${res.status}`);
  let json;
  try {
    json = JSON.parse(await res.text());
  } catch {
    throw new Error('360 answered with non-JSON (bot check)');
  }
  const seen = new Set();
  const out = [];
  for (const row of json.list ?? []) {
    const murl = row?.img || row?.thumb || '';
    if (!murl || !/^https?:\/\//.test(murl)) continue;
    const width = Number(row.width);
    if (Number.isFinite(width) && width < opts.minWidth) continue;
    const key = row.imgkey || murl;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      murl,
      purl: row.link || '',
      creditHost: row.site || '',
      title: String(row.title || '').replace(/<[^>]*>/g, ''),
      md5: key,
    });
  }
  return out;
}

/**
 * One query's image results from Baidu Images — the same JSON endpoint the
 * page itself calls, with the session cookie it hands out on first load.
 * Downloads run through Baidu's own image cache (img*.baidu.com); the manifest
 * still credits the original page (fromPageURL).
 */
async function baiduSearch(query, opts) {
  const allowed = await hostAllows(BAIDU, '/search/acjson', opts);
  if (!allowed.ok) {
    throw new Error(
      `Baidu robots.txt does not allow its image search (${allowed.reason}). ` +
        'Re-run with --robots ignore if this sourcing decision is yours to make.'
    );
  }
  await baiduSession(opts);
  const url =
    `${BAIDU}/search/acjson?tn=resultjson_com&ie=utf-8&oe=utf-8&pn=0&rn=30` +
    `&word=${encodeURIComponent(query)}`;
  const res = await paced(opts.delay, () =>
    fetchWithTimeout(
      url,
      {
        headers: {
          'user-agent': UA,
          accept: 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9',
          referer: `${BAIDU}/search/index?tn=baiduimage&word=${encodeURIComponent(query)}`,
          ...(baiduCookies ? { cookie: baiduCookies } : {}),
        },
        timeout: opts.timeout,
      },
      opts.retries
    )
  );
  if (!res.ok) throw new Error(`Baidu answered HTTP ${res.status}`);
  const body = await res.text();
  let json;
  try {
    json = parseBaiduJson(body);
  } catch {
    throw new Error('Baidu answered with non-JSON (bot check)');
  }
  if (json.antiFlag) throw new Error('Baidu refused the session (antiFlag) — no cookies');
  const seen = new Set();
  const out = [];
  for (const row of json.data ?? []) {
    const murl = row?.middleURL || row?.thumbURL || '';
    if (!murl || !/^https?:\/\//.test(murl)) continue;
    const key = row?.replaceUrl?.[0]?.ObjURL || row?.objURL || murl;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      murl,
      // This endpoint carries no original page URL (`fromPageURL` is absent):
      // only the source host, which becomes the credit. It must not be used as
      // relevance evidence, so `purl` stays empty and the report title is what
      // the signals read.
      purl: '',
      creditHost: row.fromURLHost || '',
      title: String(row.fromPageTitle || '').replace(/<[^>]*>/g, ''),
      md5: key,
      // Baidu's cache rejects hotlinks from other referers.
      referer: `${BAIDU}/`,
    });
  }
  return out;
}

// ---------------------------------------------------------------- download

/** Fetches one candidate and re-encodes it; null when it is not a usable photo. */
async function grab(candidate, iata, index, opts) {
  const url = new URL(candidate.murl);
  const allowed = await hostAllows(url.origin, url.pathname, opts);
  if (!allowed.ok) return { skipped: `source ${allowed.reason}` };

  const res = await paced(opts.delay, () =>
    fetchWithTimeout(
      candidate.murl,
      {
        headers: {
          'user-agent': UA,
          // Many hosts hotlink-protect on the referer, not on this one, but a
          // real page reference keeps the request honest. Baidu's cache needs
          // its own referer (set on the candidate); everything else uses the
          // page the picture was found on.
          ...((candidate.referer || candidate.purl)
            ? { referer: candidate.referer || candidate.purl }
            : {}),
          accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        },
        timeout: opts.timeout,
      },
      opts.retries
    )
  ).catch((err) => ({ error: err }));
  if (res.error || !res.ok) return { skipped: `download failed (${res.error?.message ?? res.status})` };

  const buf = Buffer.from(await res.arrayBuffer());
  const sniffed = sniffImage(buf);
  if (!sniffed || sniffed.ext === '.gif') return { skipped: 'not a still image' };

  let meta;
  try {
    meta = await sharp(buf).metadata();
  } catch {
    return { skipped: 'undecodable image' };
  }
  if (!meta.width || !meta.height || meta.width < opts.minWidth) {
    return { skipped: `too small (${meta.width ?? '?'}px wide)` };
  }

  const file = `${iata.toLowerCase()}-${opts.source}-${index}.webp`;
  // Credit: the site the picture came from — a source-declared host, else the
  // page it was found on — never the cache that served the bytes (Baidu hands
  // out img*.baidu.com URLs, which tell a reader nothing). With no page URL at
  // all (Baidu rows), the credit links to that site's root.
  let creditHost = url.host;
  let creditUrl = candidate.purl || '';
  if (candidate.creditHost) {
    creditHost = candidate.creditHost;
    creditUrl = creditUrl || `https://${candidate.creditHost}/`;
  } else if (candidate.purl) {
    try {
      creditHost = new URL(candidate.purl).host;
    } catch {
      /* keep the image host */
    }
  }
  const outDir = join(opts.out, photoStem(iata));
  const outPath = join(outDir, file);
  if (opts.dryRun) {
    return {
      entry: {
        file,
        width: meta.width,
        height: meta.height,
        source: opts.source,
        host: creditHost,
        pageUrl: creditUrl,
        imageUrl: candidate.murl,
        title: candidate.title,
        licenseFilter: null,
        query: opts.query,
      },
      dryRun: true,
    };
  }
  await mkdir(outDir, { recursive: true });
  const image = sharp(buf).rotate();
  if (meta.width > opts.maxWidth) image.resize({ width: opts.maxWidth });
  const info = await image.webp({ quality: opts.quality }).toFile(outPath);
  return {
    entry: {
      file,
      width: info.width,
      height: info.height,
      source: opts.source,
      host: creditHost,
      pageUrl: creditUrl,
      imageUrl: candidate.murl,
      title: candidate.title,
      licenseFilter: null,
      query: opts.query,
    },
  };
}

// ---------------------------------------------------------------- airports

/** IATA codes in the GSC-export CSV (`.../airport/XXX,date` rows only). */
async function codesFromCsv(file) {
  const text = await readFile(join(ROOT, file), 'utf8');
  const codes = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/\/airport\/([A-Za-z]{3})(?:,|\/|$)/);
    if (match) codes.add(match[1].toUpperCase());
  }
  return [...codes].sort();
}

async function codesFromDb() {
  const pool = new pg.Pool({ connectionString: databaseUrl(), max: 2 });
  try {
    const rows = await pool.query('SELECT iata FROM airports ORDER BY iata');
    return rows.rows.map((row) => row.iata.toUpperCase());
  } finally {
    await pool.end();
  }
}

/** English display names, zh names and cities for the search queries, from the DB. */
async function namesFor(codes) {
  const pool = new pg.Pool({ connectionString: databaseUrl(), max: 2 });
  try {
    const rows = await pool.query(
      'SELECT iata, name, name_en, city FROM airports WHERE iata = ANY($1)',
      [codes]
    );
    return new Map(
      rows.rows.map((row) => [
        row.iata.toUpperCase(),
        { name: row.name || '', nameEn: row.name_en || '', city: row.city || '' },
      ])
    );
  } finally {
    await pool.end();
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!['bing', 'baidu', '360'].includes(opts.source)) {
    throw new Error(`--source must be bing, baidu or 360 (got "${opts.source}")`);
  }
  const label = (info) => info.nameEn || info.name || '-';
  const manifestPath = join(opts.out, 'manifest.json');
  const manifest = existsSync(manifestPath)
    ? JSON.parse(await readFile(manifestPath, 'utf8'))
    : { note: 'Airport photos with attribution, written by scripts/fetch-airport-photos.mjs.', airports: {} };
  manifest.airports ??= {};

  let codes;
  if (opts.codes) codes = opts.codes.split(/[\s,;]+/).map((c) => c.trim().toUpperCase()).filter(Boolean).sort();
  else if (opts.fromCsv) codes = await codesFromCsv(opts.fromCsv);
  else codes = await codesFromDb();
  if (opts.offset) codes = codes.slice(opts.offset);
  if (opts.limit) codes = codes.slice(0, opts.limit);

  const done = new Set(Object.entries(manifest.airports).filter(([, v]) => v?.length).map(([k]) => k));
  const pending = codes.filter((code) => opts.force || opts.append || !done.has(code));
  console.log(
    `${codes.length} code(s) in scope, ${pending.length} to fetch` +
      (done.size ? `, ${codes.length - pending.length} already have photos` : '')
  );

  const names = await namesFor(pending);
  const failures = [];
  let fetched = 0;

  for (const [i, code] of pending.entries()) {
    const info = names.get(code) ?? { name: '', nameEn: '', city: '' };
    // Query chain, most precise first. Bing searches in English (the airport's
    // DB name and the code; codes alone surface software and brands — see
    // looksRelevant); Baidu searches the zh name, then the English name. The
    // city is deliberately not used on Baidu: a big city's query returns its
    // *other* airports ("达拉斯机场" is DFW, not Addison), and a wrong-airport
    // photo is worse than none. Each query runs only while the previous ones
    // left fewer photos than requested.
    const queries =
      opts.source === 'baidu'
        ? [...(info.name ? [info.name] : []), ...(info.nameEn ? [info.nameEn] : [])]
        : opts.source === '360'
          ? [
              ...(info.name ? [`${info.name} 航站楼`, info.name] : []),
              ...(info.nameEn ? [`${info.nameEn} terminal`, info.nameEn] : []),
            ]
          : [
              ...(info.nameEn ? [info.nameEn, `${code} ${info.nameEn}`] : [`${code} airport`]),
              ...(info.city && !info.nameEn.toLowerCase().includes(info.city.toLowerCase())
                ? [`${info.city} airport`]
                : []),
            ];
    if (opts.force && !opts.append) delete manifest.airports[code];
    const existing = opts.append ? (manifest.airports[code] ?? []) : [];
    // Number new files after the ones this source already contributed, so an
    // append never overwrites an earlier `<code>-baidu-1.webp`.
    const sourceCount = existing.filter((entry) => entry.source === opts.source).length;
    const entries = [];
    const queryErrors = [];
    const searchFn = opts.source === 'baidu' ? baiduSearch : opts.source === '360' ? so360Search : search;

    try {
      for (const query of [...new Set(queries)]) {
        opts.query = query;
        // One query failing (bot check, empty page, network) must not stop the
        // rest of the chain — the city or English fallback may still deliver.
        let raw;
        try {
          raw = await searchFn(query, opts);
        } catch (err) {
          if (opts.debug) process.stdout.write(`  ! ${code} "${query}": ${err.message}\n`);
          queryErrors.push(`${query}: ${err.message}`);
          continue;
        }
        const candidates = raw.filter((candidate) => looksRelevant(candidate, code, info));
        if (opts.debug) {
          process.stdout.write(
            `  ? ${code} "${query}": ${raw.length} result(s), ${candidates.length} relevant\n`
          );
          for (const candidate of raw.slice(0, 30)) {
            const s = signalsFor(candidate, code, info);
            process.stdout.write(
              `      ${s.place ? 'P' : '-'}${s.code ? 'C' : '-'}${s.anyAirport ? 'A' : '-'} ` +
                `${(candidate.title || candidate.murl).slice(0, 80)}\n`
            );
          }
        }
        for (const candidate of candidates) {
          if (entries.length >= opts.perAirport) break;
          const result = await grab(candidate, code, sourceCount + entries.length + 1, opts);
          if (result.entry) {
            entries.push(result.entry);
          } else if (result.skipped) {
            process.stdout.write(`  · ${code} ${candidate.murl.slice(0, 70)}: ${result.skipped}\n`);
          }
        }
        if (entries.length >= opts.perAirport) break;
      }
    } catch (err) {
      failures.push(`${code}: ${err.message}`);
    }

    if (entries.length > 0) {
      manifest.airports[code] = [...existing, ...entries];
      fetched += entries.length;
      console.log(
        `[${i + 1}/${pending.length}] ${code} ${label(info)}: ${entries.length} photo(s) ` +
          `(${entries.map((e) => e.width + 'x' + e.height).join(', ')})`
      );
    } else {
      failures.push(
        `${code}: no usable photo${queryErrors.length ? ` (${queryErrors.join('; ')})` : ''}`
      );
      console.log(`[${i + 1}/${pending.length}] ${code} ${label(info)}: nothing usable`);
    }
    // Persist per airport — an interrupted run keeps what it fetched, and a
    // --force run that found nothing drops the stale entry it replaced.
    if (!opts.dryRun && (entries.length > 0 || (opts.force && !opts.append))) {
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    }
  }

  console.log(
    `\n${fetched} photo(s) ${opts.dryRun ? 'would be written (dry run)' : 'written'} ` +
      `across ${pending.length - failures.length} airport(s)`
  );
  if (failures.length) {
    console.log(`${failures.length} without photos:`);
    for (const line of failures) console.log(`  - ${line}`);
  }
  if (fetched > 0) {
    console.log('\nNew photos are staged, not published: review each picture and write a caption');
    console.log('in public/photos/captions/<IATA>.json (zh + en; "_skip" for anything that is');
    console.log('not the airport), then run: node scripts/build-photo-captions.mjs');
  }
  process.exitCode = failures.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
