// ==UserScript==
// @name         Airport Directory Extractor (read-only)
// @namespace    airport-maps/tools
// @version      1.1.0
// @description  收集机场列表页上的 机场代码/名称/城市/国家 与封面图 URL，累积到本地并导出 JSON/CSV；封面图可手动触发批量下载。扫描只读取当前页面，不导航、不点击、不发任何额外请求。
// @author       airport-maps
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

/**
 * What this does
 * --------------
 * Reads the airport rows already rendered on the page you are looking at and
 * accumulates them in localStorage, so that paging through a directory normally
 * (a human click per page) builds up a complete list you can export as JSON or
 * CSV. Useful for auditing a directory, building a code list for your own
 * dataset, or documenting where each cover image URL came from.
 *
 * What it deliberately does NOT do
 * --------------------------------
 *   - no fetch/XHR/beacon while scanning: scanning only reads rendered DOM
 *   - no automatic navigation, clicking, or pagination walking
 *   - no automatic image downloading: cover URLs are recorded as references;
 *     images are fetched only when you click 下载图片 or call
 *     downloadImages() — one at a time, with a pause between requests
 * Scanning stays passive; downloading is an explicit, throttled, user-triggered
 * action, so the script still cannot be turned into a bulk harvester.
 *
 * Install
 * -------
 * Tampermonkey/Violentmonkey: add as a new userscript and paste this file.
 * Or, for a one-off: open DevTools on the listing page and paste this file into
 * the console (image download then falls back to plain fetch, which CORS
 * limits to same-origin, since the GM grant only applies when installed).
 * Then use the panel, or the API:
 *
 *   __airportExtract.scan()          // re-scan the current page
 *   __airportExtract.rows()          // all accumulated rows
 *   __airportExtract.exportJson()    // download JSON
 *   __airportExtract.exportCsv()     // copy CSV to clipboard
 *   __airportExtract.downloadImages({overwrite, delayMs})  // download covers as <IATA>.<ext>
 *   __airportExtract.reset()         // clear the accumulator
 */
(() => {
  'use strict';

  const VERSION = '1.1.0';
  const STORE_KEY = 'airport-directory-extract:v1';
  // With a GM grant the script runs sandboxed; expose the console API on the
  // real page window so DevTools can still reach it.
  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  if (pageWindow.__airportExtract && pageWindow.__airportExtract.version === VERSION) return;

  // Selectors cover the markup shape used by Bootstrap-based airport
  // directories; every field also has a fallback so one missing class does not
  // drop the row.
  const SEL = {
    item: '.airport-item, .airport-card, li.airport, [data-iata]',
    iata: '.airport-iata, .badge.airport-iata, [data-iata]',
    name: '.airport-name, h6.airport-name, .card-title',
    city: '.airport-location, .airport-city',
    img: 'img.airport-image, .airport-thumb img, img[src*="/maps/"]',
    flag: 'img.flag, img[src*="/flags/"]',
    link: 'a.airport-link[href], a[href*="/airport/"]',
  };

  const abs = (url) => {
    try { return new URL(url, location.href).href; } catch { return ''; }
  };
  const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
  const IATA_RE = /\b([A-Z]{3})\b/;

  /** Pulls the IATA code from the badge, a data attribute, or either URL. */
  function pickIata(item) {
    const badge = item.querySelector(SEL.iata);
    if (badge) {
      const fromAttr = clean(badge.getAttribute?.('data-iata'));
      if (fromAttr && /^[A-Za-z]{3}$/.test(fromAttr)) return fromAttr.toUpperCase();
      const fromText = clean(badge.textContent);
      if (/^[A-Za-z]{3}$/.test(fromText)) return fromText.toUpperCase();
    }
    for (const candidate of [
      item.querySelector(SEL.link)?.getAttribute('href'),
      item.querySelector(SEL.img)?.getAttribute('src'),
    ]) {
      if (!candidate) continue;
      const m = candidate.match(/\/airport\/([A-Za-z]{3})(?=["'/?#]|$)/) || candidate.match(/\/maps\/[^/]*\/([A-Za-z]{3})\./);
      if (m) return m[1].toUpperCase();
    }
    const any = clean(item.textContent).match(IATA_RE);
    return any ? any[1] : '';
  }

  /** Country code when the row carries a local flag asset (/flags/cn.jpg). */
  function pickCountry(item) {
    const src = item.querySelector(SEL.flag)?.getAttribute('src') || '';
    const m = src.match(/\/flags\/([A-Za-z]{2})\./);
    return m ? m[1].toUpperCase() : '';
  }

  function extractRow(item) {
    const iata = pickIata(item);
    if (!iata) return null;
    const img = item.querySelector(SEL.img);
    const link = item.querySelector(SEL.link);
    const href = link?.getAttribute('href') ?? '';
    let path = '';
    if (href) {
      try {
        const u = new URL(href, location.href);
        path = u.pathname + u.search;
      } catch { /* leave empty */ }
    }
    const nameEl = item.querySelector(SEL.name);
    const cityEl = item.querySelector(SEL.city);
    return {
      iata,
      name: clean(nameEl?.textContent) || clean(img?.getAttribute('alt')).replace(/\s+map$/i, ''),
      city: clean(cityEl?.textContent),
      countryCode: pickCountry(item),
      path,
      url: href ? abs(href) : '',
      coverUrl: img ? abs(img.getAttribute('src')) : '',
      sourcePage: location.pathname + location.search,
      seenAt: new Date().toISOString(),
    };
  }

  /**
   * Rows on the current page, one per IATA code. A page that repeats an airport
   * (e.g. a card plus a highlighted copy) is merged field-by-field so the
   * richest version wins rather than the first one encountered.
   */
  function scan() {
    const byCode = new Map();
    for (const item of document.querySelectorAll(SEL.item)) {
      const row = extractRow(item);
      if (!row) continue;
      const existing = byCode.get(row.iata);
      if (!existing) { byCode.set(row.iata, row); continue; }
      for (const [key, value] of Object.entries(row)) if (value && !existing[key]) existing[key] = value;
    }
    return [...byCode.values()];
  }

  // ---------------------------------------------------------------- storage
  // localStorage is unavailable on file:// and in some privacy modes, so fall
  // back to an in-memory map: the panel still works for the current session.
  const memory = new Map();
  let savedImages = new Set(); // IATA codes whose cover image was already downloaded
  let storeWorks = true;
  function load() {
    if (!storeWorks) return new Map(memory);
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      savedImages = new Set(parsed?.savedImages ?? []);
      return new Map(parsed?.airports?.map((a) => [a.iata, a]) ?? []);
    } catch { storeWorks = false; return new Map(memory); }
  }
  function save(map) {
    if (storeWorks) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({
          version: VERSION, updatedAt: new Date().toISOString(), airports: [...map.values()],
          savedImages: [...savedImages],
        }));
      } catch { storeWorks = false; }
    }
    memory.clear();
    for (const [k, v] of map) memory.set(k, v);
  }

  function accumulate(rows) {
    const map = load();
    let added = 0;
    for (const row of rows) {
      const existing = map.get(row.iata);
      // Keep the richer record if a later page has more fields filled in.
      if (!existing) { map.set(row.iata, row); added++; continue; }
      const merged = { ...existing };
      for (const [k, v] of Object.entries(row)) if (v && !merged[k]) merged[k] = v;
      map.set(row.iata, merged);
    }
    save(map);
    return { added, total: map.size };
  }

  // ---------------------------------------------------------------- export
  const csvCell = (v) => (/[",\n]/.test(String(v ?? '')) ? `"${String(v ?? '').replace(/"/g, '""')}"` : String(v ?? ''));

  function toCsv(rows) {
    const cols = ['iata', 'name', 'city', 'countryCode', 'path', 'coverUrl', 'sourcePage', 'seenAt'];
    return [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n') + '\n';
  }

  function payload(rows) {
    return {
      note: 'Airport directory rows read from pages visited in the browser. Cover images are downloaded only when explicitly requested via downloadImages().',
      source: location.origin,
      collectedAt: new Date().toISOString(),
      count: rows.length,
      airports: rows,
    };
  }

  function saveBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function download(filename, text, type) { saveBlob(filename, new Blob([text], { type })); }

  const rows = () => [...load().values()].sort((a, b) => a.iata.localeCompare(b.iata));

  function exportJson() {
    const list = rows();
    download(`airport-directory-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload(list), null, 2), 'application/json');
    return list.length;
  }
  async function exportCsv() {
    const csv = toCsv(rows());
    try { await navigator.clipboard.writeText(csv); return { copied: true, lines: rows().length }; }
    catch { download(`airport-directory-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv'); return { copied: false, lines: rows().length }; }
  }
  function reset() { savedImages.clear(); save(new Map()); render(0, 0, 0); return true; }

  // ------------------------------------------------------- image download
  // Manual only: fetches each accumulated coverUrl one at a time with a pause
  // between requests and saves it as <IATA>.<ext>. Downloaded codes are
  // remembered, so clicking again resumes instead of re-fetching.
  const extFromUrl = (url) => {
    const m = url.split(/[?#]/)[0].match(/\.([A-Za-z0-9]{2,5})$/);
    return m ? `.${m[1].toLowerCase()}` : '.jpg';
  };

  function fetchBlob(url) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET', url, responseType: 'blob', timeout: 30000,
          onload: (res) => (res.status === 200 && res.response ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`))),
          onerror: () => reject(new Error('网络错误')),
          ontimeout: () => reject(new Error('超时')),
        });
      } else {
        // Console-paste fallback: plain fetch, so CORS limits it to same-origin.
        fetch(url).then((r) => (r.ok ? resolve(r.blob()) : reject(new Error(`HTTP ${r.status}`)))).catch(reject);
      }
    });
  }

  let downloading = false;
  async function downloadImages({ overwrite = false, delayMs = 800 } = {}) {
    if (downloading) return { busy: true };
    const list = rows().filter((r) => r.coverUrl && (overwrite || !savedImages.has(r.iata)));
    if (!list.length) return { attempted: 0, ok: 0, fail: 0, errors: [] };
    downloading = true;
    let ok = 0;
    const errors = [];
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      flash(`下载图片 ${i + 1}/${list.length} · 成功 ${ok} · 失败 ${errors.length}`);
      try {
        saveBlob(`${r.iata}${extFromUrl(r.coverUrl)}`, await fetchBlob(r.coverUrl));
        savedImages.add(r.iata);
        ok++;
      } catch (e) {
        errors.push(`${r.iata}: ${e.message}`);
      }
      if (i < list.length - 1) await new Promise((res) => setTimeout(res, delayMs));
    }
    downloading = false;
    save(load()); // persist the downloaded-code markers
    if (errors.length) console.warn('[airport-extract] 下载失败的图片:', errors);
    return { attempted: list.length, ok, fail: errors.length, errors };
  }

  // ---------------------------------------------------------------- panel
  let panelHost = null;
  let shadow = null;

  function buildPanel() {
    panelHost = document.createElement('div');
    panelHost.style.cssText = 'all:initial;position:fixed;z-index:2147483647;right:16px;bottom:16px;';
    shadow = panelHost.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .box{font:12px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:#0A2A43;color:#eaf2f8;
             border-radius:10px;padding:10px 12px;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:260px}
        .n{font-weight:600;font-size:13px;color:#fff;margin-bottom:2px}
        .s{color:#9fc0d6;margin-bottom:8px}
        .r{display:flex;gap:6px;flex-wrap:wrap}
        button{font:inherit;border:1px solid #2f5d80;background:#123c5c;color:#eaf2f8;border-radius:6px;
               padding:4px 8px;cursor:pointer}
        button:hover{background:#1b5a86}
        .h{border-color:transparent;background:transparent;color:#9fc0d6}
      </style>
      <div class="box">
        <div class="n">Airport Extractor</div>
        <div class="s" id="stat"></div>
        <div class="r">
          <button id="json">导出 JSON</button>
          <button id="csv">复制 CSV</button>
          <button id="imgs">下载图片</button>
          <button id="rescan">重扫本页</button>
          <button id="reset">清空</button>
          <button id="hide" class="h">隐藏</button>
        </div>
      </div>`;
    document.documentElement.appendChild(panelHost);
    const $ = (id) => shadow.getElementById(id);
    $('json').addEventListener('click', () => { const n = exportJson(); flash(`已导出 ${n} 条`); });
    $('csv').addEventListener('click', async () => {
      const r = await exportCsv();
      flash(r.copied ? `已复制 ${r.lines} 行 CSV` : `剪贴板不可用，已下载 ${r.lines} 行 CSV`);
    });
    $('imgs').addEventListener('click', async () => {
      const r = await downloadImages();
      if (r.busy) { flash('已有下载在进行，请稍候'); return; }
      flash(r.attempted ? `图片下载完成：成功 ${r.ok} · 失败 ${r.fail}` : '没有待下载的封面图');
    });
    $('rescan').addEventListener('click', () => { const { added, total } = accumulate(scan()); render(scan().length, added, total); });
    $('reset').addEventListener('click', () => reset());
    $('hide').addEventListener('click', () => { panelHost.style.display = 'none'; });
  }

  let flashMsg = '';
  function flash(msg) { flashMsg = msg; render(lastPageCount, lastAdded, rows().length); setTimeout(() => { flashMsg = ''; render(lastPageCount, lastAdded, rows().length); }, 2500); }

  let lastPageCount = 0, lastAdded = 0;
  function render(pageCount, added, total) {
    lastPageCount = pageCount; lastAdded = added;
    if (!shadow) return;
    shadow.getElementById('stat').textContent =
      flashMsg || `本页 ${pageCount} 条 · 新增 ${added} · 累计 ${total} 个机场`;
  }

  // ---------------------------------------------------------------- run
  function run({ autoPanel = true } = {}) {
    const found = scan();
    if (!found.length) return { pageCount: 0, added: 0, total: rows().length };
    const { added, total } = accumulate(found);
    if (autoPanel) {
      if (!panelHost) buildPanel();
      panelHost.style.display = '';
      render(found.length, added, total);
    }
    return { pageCount: found.length, added, total };
  }

  pageWindow.__airportExtract = { version: VERSION, scan, rows, run, accumulate, exportJson, exportCsv, downloadImages, reset, toCsv, payload };

  // Auto-collect on pages that actually look like an airport listing.
  const result = run();
  if (result.pageCount) {
    console.info(`[airport-extract] 本页 ${result.pageCount} 条，新增 ${result.added}，累计 ${result.total}。用 __airportExtract.exportCsv() 导出。`);
  }
})();
