/**
 * Regenerates the Traditional Chinese layer from the Chinese source:
 *
 *   lib/i18n/messages/zh.ts  ->  lib/i18n/messages/tw.ts
 *   content/zh/**\/*.md       ->  content/tw/**\/*.md   (guides, country intros, pages)
 *
 * Everything goes through `toHant()` — copy, comments and all — because these
 * files are derived, never hand-edited. The catalog additionally gets a new
 * header and its export renamed; the markdown only changes character forms.
 *
 * Usage:
 *   node scripts/build-hant.mjs            rewrite the tw files
 *   node scripts/build-hant.mjs --check    exit 1 if anything is out of date
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './_env.mjs';
import { toHant } from './_hant.mjs';

const SOURCE = join(ROOT, 'lib', 'i18n', 'messages', 'zh.ts');
const TARGET = join(ROOT, 'lib', 'i18n', 'messages', 'tw.ts');
const CONTENT_SOURCE = join(ROOT, 'content', 'zh');
const CONTENT_TARGET = join(ROOT, 'content', 'tw');

/** Replaces zh.ts's own header; everything after it is converted body. */
const HEADER = `import type { Messages } from './zh';

/**
 * Traditional Chinese (Taiwan) catalog, derived from \`zh.ts\` by
 * \`scripts/build-hant.mjs\` (OpenCC cn->twp plus the wording exceptions in
 * \`content/terminology/tw-phrases.json\`). Re-running the generator overwrites
 * this file, so adjust the phrase list rather than editing copy here.
 */
`;

export function render(source) {
  const body = source
    .replace(/^\/\*\*[\s\S]*?\*\/\n\n?/, '') // zh.ts's header comment
    .replace(
      /\n+\/\*\* Shape every locale catalog must satisfy\. \*\/\nexport type Messages = typeof zh;\s*$/,
      '\n'
    );
  if (!body.includes('export const zh = {')) {
    throw new Error('zh.ts no longer declares `export const zh = {` — update this generator');
  }
  const converted = toHant(body).replace('export const zh = {', 'export const tw: Messages = {');
  // The conversion rewrites text, never code: a phrase entry spanning a `${…}`
  // placeholder would silently break a template string.
  const count = (text) => (text.match(/\$\{/g) ?? []).length;
  if (count(body) !== count(converted)) {
    throw new Error(`interpolation count changed (${count(body)} -> ${count(converted)}) — check tw-phrases.json`);
  }
  return HEADER + converted;
}

/** Relative paths of every markdown file under a content directory. */
function markdownFiles(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? markdownFiles(join(dir, entry.name), base)
      : entry.name.endsWith('.md')
        ? [relative(base, join(dir, entry.name))]
        : []
  );
}

const check = process.argv.includes('--check');
const stale = [];
let written = 0;

const emit = (path, text) => {
  const current = (() => {
    try {
      return readFileSync(path, 'utf8');
    } catch {
      return null;
    }
  })();
  if (current === text) return;
  stale.push(path.replace(ROOT, '.'));
  if (!check) {
    writeFileSync(path, text);
    written++;
  }
};

emit(TARGET, render(readFileSync(SOURCE, 'utf8')));
const sources = markdownFiles(CONTENT_SOURCE);
for (const rel of sources) {
  emit(join(CONTENT_TARGET, rel), toHant(readFileSync(join(CONTENT_SOURCE, rel), 'utf8')));
}
const orphans = (() => {
  try {
    return markdownFiles(CONTENT_TARGET).filter((rel) => !sources.includes(rel));
  } catch {
    return [];
  }
})();

if (check) {
  if (stale.length) {
    console.error(`${stale.length} file(s) out of date — run \`node scripts/build-hant.mjs\`:\n  ${stale.slice(0, 10).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`tw is up to date (${sources.length + 1} files)`);
} else {
  console.log(`wrote ${written} file(s) of ${sources.length + 1} checked (messages + ${sources.length} markdown)`);
}
if (orphans.length) {
  console.warn(`note: content/tw has ${orphans.length} file(s) with no content/zh source (left alone): ${orphans.slice(0, 5).join(', ')}`);
}
