/**
 * Tidies one finished blog article folder:
 *
 *   - checks that `<slug>.md` and `<slug>.en.md` reference the same images in
 *     the same order (check-blog.mjs enforces this later, but failing now gives
 *     a precise message),
 *   - renumbers the figures the article actually uses to `0.webp … N.webp`
 *     (two-phase rename, so a used file is never overwritten),
 *   - rewrites every reference and the `cover:` line in both language files,
 *   - deletes images the article does not use and the temporary `figures.json`.
 *
 *   node scripts/finalize-blog-article.mjs --slug hong-kong-airport-worlds-best-airport
 *
 * Run after the prose is written, before `build-hant.mjs`.
 */
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--slug');
const slug = i >= 0 ? args[i + 1] : null;
if (!slug) {
  console.error('usage: node scripts/finalize-blog-article.mjs --slug <slug>');
  process.exit(1);
}

const dir = join(ROOT, 'public', 'blog', slug);
const zhPath = join(dir, `${slug}.md`);
const enPath = join(dir, `${slug}.en.md`);
const imagesDir = join(dir, 'images');

if (!existsSync(zhPath)) {
  console.error(`missing ${zhPath}`);
  process.exit(1);
}

const zh = readFileSync(zhPath, 'utf8');
const en = existsSync(enPath) ? readFileSync(enPath, 'utf8') : null;
const refsOf = (text) => [...text.matchAll(/!\[[^\]]*\]\(\.\/images\/(\d+)\.webp\)/g)].map((m) => Number(m[1]));
const zhRefs = refsOf(zh);
const enRefs = en ? refsOf(en) : zhRefs;

if (en && (zhRefs.length !== enRefs.length || zhRefs.some((n, k) => n !== enRefs[k]))) {
  console.error('zh and en reference different images (same order required)');
  console.error('  zh:', zhRefs.join(', '));
  console.error('  en:', enRefs.join(', '));
  process.exit(1);
}
if (!zhRefs.length) {
  console.error('no ./images/N.webp references found');
  process.exit(1);
}

const used = [...new Set(zhRefs)];
const missing = used.filter((n) => !existsSync(join(imagesDir, `${n}.webp`)));
if (missing.length) {
  console.error(`missing image files: ${missing.join(', ')}`);
  process.exit(1);
}

const map = new Map(used.map((n, k) => [n, k]));

// Two-phase rename so 1 -> 0 never clobbers a file that is itself being kept.
const staged = [];
for (const n of used) {
  const tmp = join(imagesDir, `.stage-${n}.webp`);
  renameSync(join(imagesDir, `${n}.webp`), tmp);
  staged.push([tmp, map.get(n)]);
}
for (const [tmp, next] of staged) renameSync(tmp, join(imagesDir, `${next}.webp`));

// Delete every other image (QR codes, follow banners, the animated title card…).
// After the renumber every kept file is 0..used.length-1.
let removed = 0;
for (const file of readdirSync(imagesDir)) {
  const match = /^(\d+)\.webp$/.exec(file);
  if (!match || Number(match[1]) >= used.length) {
    rmSync(join(imagesDir, file), { force: true });
    removed++;
  }
}

const rewrite = (text) => {
  let out = text.replace(/!\[([^\]]*)\]\(\.\/images\/(\d+)\.webp\)/g, (whole, alt, n) => {
    const next = map.get(Number(n));
    return next === undefined ? whole : `![${alt}](./images/${next}.webp)`;
  });
  out = out.replace(/^cover:\s*\.?\/?images\/(\d+)\.webp\s*$/m, (whole, n) => {
    const next = map.get(Number(n));
    return next === undefined ? whole : `cover: images/${next}.webp`;
  });
  return out;
};

let nextZh = rewrite(zh);
// A cover that did not survive the cull would ship a broken card image; point
// it at the article's first figure instead (the page then suppresses the
// leading duplicate, which is exactly the behaviour we want).
const coverMatch = /^cover:\s*images\/(\d+)\.webp\s*$/m.exec(nextZh);
if (!coverMatch || Number(coverMatch[1]) >= used.length) {
  nextZh = nextZh.replace(/^cover:.*$/m, `cover: images/0.webp`);
  console.log(`  cover reset to images/0.webp`);
}

writeFileSync(zhPath, nextZh);
if (en) writeFileSync(enPath, rewrite(en));
rmSync(join(dir, 'figures.json'), { force: true });

console.log(`${slug}: ${used.length} figure(s) renumbered, ${removed} unused file(s) removed`);
