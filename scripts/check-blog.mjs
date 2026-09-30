/**
 * Checks the blog content tree under `public/blog` — the source of the /blog
 * pages (see lib/blog.ts) — and can repair the mechanical defects it finds.
 * Read-only without `--fix`; safe to run any time.
 *
 * Expected shape, one directory per article:
 *
 *   public/blog/<slug>/
 *     <slug>.md          article: frontmatter (slug, title, summary, date …) + body
 *     <slug>.en.md       English version, same frontmatter and images
 *     <slug>.tw.md       derived Traditional Chinese body (scripts/build-hant.mjs)
 *     images/N.ext       images referenced from the body as ./images/N.ext
 *
 * What it checks:
 *   1. directory name == frontmatter `slug`, article file == `<slug>.md`
 *   2. frontmatter carries slug / title / summary / date
 *   3. every `./images/...` reference (and `cover:`) resolves to a real file
 *   4. each image's extension matches its actual payload — WeChat exports serve
 *      WebP under `.png` / `.jpg` names, and a mismatch ships the wrong
 *      Content-Type for a file that is served straight out of public/
 *   5. no root-level images (everything lives in `images/`)
 *   6. no unreferenced images (reported, not an error: an image may be kept on
 *      purpose, but usually it is leftover scraper chrome)
 *   7. no WeChat reader chrome left in the text (`在小说阅读器读本章` …)
 *   8. every translation (<slug>.en.md, <slug>.tw.md) matches the source: same
 *      slug and cover, its own title / summary / date, every reference
 *      resolving, and the same set of images — a translation that drops or
 *      duplicates a figure is the easiest mistake to make and the hardest to
 *      see
 *
 * `--fix` renames files and directories into shape (1, 4, 5) — rewriting the
 * references and `cover:` that name them, in the translations too — and
 * normalises scraped whitespace (7). It never edits prose, rewrites links or
 * deletes an image: what an article keeps is an editing decision, not a
 * mechanical one.
 *
 * Usage:
 *   node scripts/check-blog.mjs          report, exit 1 when something is wrong
 *   node scripts/check-blog.mjs --fix    repair the mechanical defects
 */
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const FIX = process.argv.includes('--fix');
const BLOG = join(ROOT, 'public', 'blog');
const REQUIRED = ['slug', 'title', 'summary', 'date'];
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
/** Payload format -> canonical extension. */
const EXT_FOR_FORMAT = { png: '.png', jpeg: '.jpg', webp: '.webp', gif: '.gif', avif: '.avif', svg: '.svg' };
/** Per-locale article files: `<slug>.en.md`, `<slug>.tw.md`. */
const VARIANT_SUFFIXES = ['.en.md', '.tw.md'];
const isVariant = (file) => VARIANT_SUFFIXES.some((suffix) => file.endsWith(suffix));

const problems = [];
const notes = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Windows hands out EBUSY/EPERM on a rename when anything holds the file open —
 * an indexer, a virus scanner, or a dev server watching public/. Those are
 * transient, so retry briefly before giving up.
 */
async function move(from, to) {
  for (let attempt = 0; ; attempt++) {
    try {
      renameSync(from, to);
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM', 'EACCES'].includes(error.code) || attempt >= 9) throw error;
      await sleep(150 * (attempt + 1));
    }
  }
}

/** Same flat `key: value` reading as lib/blog.ts, on the raw file text. */
function frontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const meta = {};
  if (!match) return { meta, body: text, prefix: '' };
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf(':');
    if (at < 0) continue;
    let value = trimmed.slice(at + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[trimmed.slice(0, at).trim()] = value;
  }
  return { meta, body: text.slice(match[0].length), prefix: match[0] };
}

/** Image references in the body, in order of appearance. */
function imageRefs(body) {
  return [...body.matchAll(/!\[[^\]]*\]\((\.\/images\/[^)\s]+)\)/g)].map((m) => m[1]);
}

/** Scraper chrome: the WeChat reader UI block, `****` bold nesting, nbsp padding. */
const CHROME = [/^\s*在小说阅读器读本章\s*$/m, /^\s*去阅读\s*$/m, /^\s*在公众号小说中沉浸阅读\s*$/m, /&nbsp;/, /\*{4}/];

function normalise(body) {
  return (
    body
      .replace(/^\s*在小说阅读器读本章\s*$/gm, '')
      .replace(/^\s*去阅读\s*$/gm, '')
      .replace(/^\s*在公众号小说中沉浸阅读\s*$/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\*{4}/g, '**')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\n+/, '')
      .replace(/\s+$/, '') + '\n'
  );
}

const dirs = readdirSync(BLOG, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
  .map((entry) => entry.name)
  .sort();

let articles = 0;
let imageCount = 0;

for (const dirName of dirs) {
  const dir = join(BLOG, dirName);
  const at = (name) => join(dir, name);
  const found = readdirSync(dir).filter((f) => f.endsWith('.md') && !isVariant(f));
  if (found.length !== 1) {
    fail(dirName, `expected exactly one article markdown, found ${found.length}`);
    continue;
  }

  const raw = readFileSync(at(found[0]), 'utf8');
  const { meta, body, prefix } = frontmatter(raw);
  const slug = meta.slug;

  if (!slug) fail(dirName, `frontmatter has no \`slug\` (found: ${Object.keys(meta).join(', ') || 'none'})`);
  for (const key of REQUIRED) {
    if (slug && !meta[key]) fail(dirName, `frontmatter has no \`${key}\``);
  }
  if (!slug) continue;

  // 1. names on disk match the declared slug
  const mdFile = `${slug}.md`;
  if (found[0] !== mdFile) {
    fail(dirName, `article file is ${found[0]}, expected ${mdFile}`);
    if (FIX) {
      await move(at(found[0]), at(mdFile));
      notes.push(`renamed ${dirName}/${found[0]} -> ${mdFile}`);
    }
  }
  if (dirName !== slug) {
    fail(dirName, `directory is not named after the slug (\`${slug}\`)`);
    if (FIX) {
      await move(dir, join(BLOG, slug));
      notes.push(`renamed directory ${dirName} -> ${slug}`);
      continue; // paths below are stale; the next run picks up the new directory
    }
  }

  // 4./5. image extensions match their payload, and images live in images/
  const imagesDir = at('images');
  const onDisk = existsSync(imagesDir) ? readdirSync(imagesDir) : [];
  const renames = new Map();

  for (const file of onDisk) {
    const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
    let format;
    try {
      // Buffered on purpose: sharp on a path keeps a handle open, which then
      // blocks the rename below with EBUSY on Windows.
      format = (await sharp(readFileSync(join(imagesDir, file))).metadata()).format;
    } catch (error) {
      fail(dirName, `images/${file} is not a readable image (${error.message})`);
      continue;
    }
    const want = EXT_FOR_FORMAT[format];
    if (want && ext !== want && !(ext === '.jpeg' && want === '.jpg')) {
      fail(dirName, `images/${file} is ${format} — rename it to ${want}`);
      if (FIX) {
        const target = file.slice(0, file.lastIndexOf('.')) + want;
        await move(join(imagesDir, file), join(imagesDir, target));
        renames.set(file, target);
        notes.push(`${slug}: images/${file} -> images/${target}`);
      }
    }
  }
  for (const entry of readdirSync(dir)) {
    if (!IMAGE_FILE.test(entry)) continue;
    fail(dirName, `${entry} sits next to the article; images belong in images/`);
    if (FIX) {
      const ext = entry.slice(entry.lastIndexOf('.')).toLowerCase();
      let index = 0;
      while (existsSync(join(imagesDir, `${index}${ext}`))) index++;
      await move(at(entry), join(imagesDir, `${index}${ext}`));
      notes.push(`${slug}: moved ${entry} -> images/${index}${ext}`);
    }
  }
  imageCount += onDisk.length;

  // 3./7. rewrite what --fix renamed, normalise chrome, then validate the result
  let nextBody = body;
  let touched = false;
  if (renames.size) {
    nextBody = nextBody.replace(/!\[([^\]]*)\]\((\.\/images\/[^)\s]+)\)/g, (whole, alt, ref) => {
      const target = renames.get(ref.slice('./images/'.length));
      return target ? `![${alt}](./images/${target})` : whole;
    });
    touched = true;
  }
  if (CHROME.some((pattern) => pattern.test(nextBody))) {
    fail(dirName, 'scraper chrome (reader UI / **** / &nbsp;) is still in the body');
    if (FIX) {
      nextBody = normalise(nextBody);
      touched = true;
      notes.push(`${slug}: normalised whitespace and scraper chrome`);
    }
  }

  let cover = meta.cover;
  const coverFile = cover ? cover.replace(/^\.\//, '').replace(/^images\//, '') : '';
  if (coverFile && renames.has(coverFile)) {
    cover = `images/${renames.get(coverFile)}`;
  }

  if (FIX && touched) {
    const nextPrefix =
      cover === meta.cover ? prefix : prefix.replace(/^cover:.*$/m, `cover: ${cover}`);
    if (cover !== meta.cover) notes.push(`${slug}: cover -> ${cover}`);
    writeFileSync(at(mdFile), nextPrefix + nextBody);
  }

  const refs = imageRefs(nextBody);
  const referenced = new Set(refs.map((ref) => ref.slice('./images/'.length)));
  if (cover) {
    const rel = cover.replace(/^\.\//, '');
    if (!rel.startsWith('images/')) {
      fail(dirName, `cover \`${cover}\` must be a path under images/`);
    } else {
      referenced.add(rel.slice('images/'.length));
      if (!existsSync(at(rel))) fail(dirName, `cover \`${cover}\` does not exist`);
    }
  }
  for (const ref of refs) {
    if (!existsSync(at(ref))) fail(dirName, `reference ${ref} does not exist`);
  }
  const unused = onDisk.filter((file) => !referenced.has(renames.get(file) ?? file));
  if (unused.length) {
    notes.push(`${slug}: ${unused.length} unreferenced image(s): ${unused.join(' ')}`);
  }

  // 8. every translation on disk describes the same article and the same images
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md') && f !== mdFile)) {
    const where = `${dirName}/${file}`;
    const variant = frontmatter(readFileSync(at(file), 'utf8'));
    if (variant.meta.slug !== slug) {
      fail(where, `slug is \`${variant.meta.slug ?? 'missing'}\`, expected \`${slug}\``);
    }
    for (const key of ['title', 'summary', 'date']) {
      if (!variant.meta[key]) fail(where, `frontmatter has no \`${key}\``);
    }
    const variantCover = (variant.meta.cover ?? '').replace(/^\.\//, '');
    if (variantCover !== (meta.cover ?? '').replace(/^\.\//, '')) {
      fail(where, `cover is \`${variantCover || 'missing'}\`, the source says \`${meta.cover ?? 'missing'}\``);
    }

    let nextVariant = variant.body;
    let variantTouched = false;
    if (renames.size) {
      nextVariant = nextVariant.replace(/!\[([^\]]*)\]\((\.\/images\/[^)\s]+)\)/g, (whole, alt, ref) => {
        const target = renames.get(ref.slice('./images/'.length));
        return target ? `![${alt}](./images/${target})` : whole;
      });
      variantTouched = true;
    }
    if (CHROME.some((pattern) => pattern.test(nextVariant))) {
      fail(where, 'scraper chrome (reader UI / **** / &nbsp;) is still in the body');
      if (FIX) {
        nextVariant = normalise(nextVariant);
        variantTouched = true;
      }
    }
    if (FIX && variantTouched) {
      // The cover is shared with the source, so the source's repaired value wins.
      writeFileSync(at(file), variant.prefix.replace(/^cover:.*$/m, `cover: ${cover}`) + nextVariant);
      notes.push(`${slug}: updated ${file}`);
    }

    const variantRefs = imageRefs(nextVariant);
    for (const ref of variantRefs) {
      if (!existsSync(at(ref))) fail(where, `reference ${ref} does not exist`);
    }
    const missing = refs.filter((ref) => !variantRefs.includes(ref));
    const extra = variantRefs.filter((ref) => !refs.includes(ref));
    if (missing.length || extra.length) {
      fail(
        where,
        `image references differ from the source — missing ${missing.join(' ') || 'none'}, extra ${extra.join(' ') || 'none'}`
      );
    }
  }

  articles++;
}

console.log(`checked ${articles} article(s), ${imageCount} image(s)`);
for (const note of notes) console.log(`  note  ${note}`);
for (const problem of problems) console.log(`  FAIL  ${problem}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s)${FIX ? ' — re-run to confirm' : '; run with --fix to repair'}`);
  process.exit(1);
}
console.log('all good');
