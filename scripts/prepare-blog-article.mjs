/**
 * Prepares one imported WeChat article for editing under `public/blog/<slug>/`:
 * converts every image the source Markdown references into a size-capped WebP
 * (`images/0.webp`, `1.webp`, … in source order, exact duplicates collapsed),
 * and writes `figures.json` describing each one so the rewritten article can
 * place them deliberately.
 *
 * The article text is *not* rewritten here — that is an editorial step. After
 * the new `<slug>.md` / `<slug>.en.md` exist, delete `figures.json`; only the
 * Markdown and `images/` belong in the published folder (see check-blog.mjs).
 *
 *   node scripts/prepare-blog-article.mjs \
 *     --from "public/blog/<imported folder>" \
 *     --slug <slug>
 *
 * Options:
 *   --quality N    WebP quality (default 85)
 *   --max-width N  longest edge cap in px (default 1600; never enlarges)
 *   --force        overwrite an existing target images/ folder
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const args = process.argv.slice(2);
const value = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1] ?? null;
};

const from = value('--from');
const slug = value('--slug');
const quality = Number(value('--quality') ?? 85);
const maxWidth = Number(value('--max-width') ?? 1600);
const force = args.includes('--force');

if (!from || !slug) {
  console.error('usage: node scripts/prepare-blog-article.mjs --from <import dir> --slug <slug> [--force]');
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`slug must be kebab-case: ${slug}`);
  process.exit(1);
}

const srcDir = resolve(ROOT, from);
const targetDir = join(ROOT, 'public', 'blog', slug);
const imagesDir = join(targetDir, 'images');

const mdFile = readdirSync(srcDir).find((f) => f.endsWith('.md'));
if (!mdFile) {
  console.error(`no .md in ${srcDir}`);
  process.exit(1);
}
const markdown = readFileSync(join(srcDir, mdFile), 'utf8');

/** Every `![alt](images/x.ext)` reference, in order. */
const refs = [...markdown.matchAll(/!\[([^\]]*)\]\((\.\/)?(images\/[^)\s]+)\)/g)].map((m) => ({
  alt: m[1],
  ref: m[3],
}));
if (!refs.length) {
  console.error(`${mdFile} references no images/… paths`);
  process.exit(1);
}

if (existsSync(imagesDir) && !force) {
  console.error(`target images/ already exists: ${imagesDir} (pass --force to overwrite)`);
  process.exit(1);
}
mkdirSync(imagesDir, { recursive: true });
if (force) {
  for (const file of readdirSync(imagesDir)) rmSync(join(imagesDir, file), { force: true });
}

const figures = [];
const byHash = new Map();
let unique = 0;
let skipped = 0;
let before = 0;
let after = 0;

for (const { alt, ref } of refs) {
  const path = join(srcDir, ref.replace(/^\.\//, ''));
  if (!existsSync(path)) {
    console.warn(`  missing: ${ref}`);
    skipped++;
    continue;
  }
  const bytes = readFileSync(path);
  const hash = createHash('sha1').update(bytes).digest('hex');
  if (byHash.has(hash)) {
    figures.push({ ...byHash.get(hash), alt, duplicateOf: byHash.get(hash).n });
    continue;
  }

  // Animated GIF/WebP: sharp reports the height of *all* stacked frames, so
  // divide it by the frame count to record the visible size.
  const meta = await sharp(bytes, { animated: true }).metadata();
  const pages = meta.pages ?? 1;
  const image = sharp(bytes, { animated: true });
  const out = join(imagesDir, `${unique}.webp`);
  const resized = await image
    .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  writeFileSync(out, resized);

  before += statSync(path).size;
  after += resized.length;
  const figure = {
    n: unique,
    file: `images/${unique}.webp`,
    source: basename(path),
    alt,
    width: meta.width,
    height: Math.round((meta.height ?? 0) / pages),
    animated: pages > 1,
    pages,
    addedKB: Math.round(statSync(path).size / 1024),
    webpKB: Math.round(resized.length / 1024),
  };
  figures.push(figure);
  byHash.set(hash, figure);
  unique++;
}

writeFileSync(
  join(targetDir, 'figures.json'),
  JSON.stringify({ slug, source: from, article: `${srcDir}/${mdFile}`, figures }, null, 2)
);

console.log(`${slug}: ${figures.length} figure(s), ${skipped} missing reference(s)`);
for (const f of figures) {
  console.log(
    `  ${String(f.n).padStart(2, '0')}.webp  ${f.width}x${f.height}${f.animated ? ' animated' : ''}  ` +
      `${f.addedKB}KB -> ${f.webpKB}KB  ${f.source}  "${f.alt}"${f.duplicateOf !== undefined ? '  (duplicate)' : ''}`
  );
}
console.log(`total: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
