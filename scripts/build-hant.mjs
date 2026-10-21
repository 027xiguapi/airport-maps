/**
 * Regenerates the Traditional Chinese layer from the Chinese source:
 *
 *   lib/i18n/messages/zh.ts          ->  lib/i18n/messages/tw.ts
 *   content_documents (locale 'zh')  ->  content_documents (locale 'tw')
 *   public/blog/<slug>/<slug>.md     ->  public/blog/<slug>/<slug>.tw.md
 *
 * The content documents used to be `content/zh/**\/*.md` files; they now live in
 * the `content_documents` table (db/schema.ts), so this script reads the zh rows
 * and upserts their tw counterparts in place — same kind/subject, locale 'tw'.
 *
 * Everything goes through `toHant()` — copy, comments and all — because these
 * rows are derived, never hand-edited. The catalog additionally gets a new
 * header and its export renamed; the documents only change character forms
 * (title/summary/body; the `updated` date is ASCII and passes through), except
 * that a blog article's internal link prefixes and Baidu Baike bullet are
 * adjusted for the tw side — see `twBlogArticle()`.
 *
 * Usage:
 *   node scripts/build-hant.mjs            rewrite the tw layer
 *   node scripts/build-hant.mjs --check    exit 1 if anything is out of date
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { toHant } from './_hant.mjs';

const SOURCE = join(ROOT, 'lib', 'i18n', 'messages', 'zh.ts');
const TARGET = join(ROOT, 'lib', 'i18n', 'messages', 'tw.ts');
const BLOG = join(ROOT, 'public', 'blog');

/** Replaces zh.ts's own header; everything after it is converted body. */
const HEADER = `import type { Messages } from './zh';

/**
 * Traditional Chinese (Taiwan) catalog, derived from \`zh.ts\` by
 * \`scripts/build-hant.mjs\` (OpenCC cn->twp plus the wording exceptions in
 * \`db/terminology/tw-phrases.json\`). Re-running the generator overwrites
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

const check = process.argv.includes('--check');
const stale = [];
let written = 0;

/** File emit for the catalog: unchanged only when byte-identical. */
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

/**
 * Markdown emit for the blog articles. Blank-line runs and line endings are
 * ignored when deciding whether a file is out of date: the checked-in `.tw.md`
 * files carry CRLF and an occasional extra blank line from the tooling that
 * wrote them, and none of that changes what Markdown renders — comparing
 * exactly flagged all 14 articles as "stale" while their text was already the
 * derived one. A real content difference still rewrites the file (canonically,
 * LF and collapsed).
 */
const emitMarkdown = (path, text) => {
  const normalise = (value) => value.replace(/\r\n/g, '\n').trim().replace(/\n{2,}/g, '\n\n');
  const current = (() => {
    try {
      return readFileSync(path, 'utf8');
    } catch {
      return null;
    }
  })();
  if (current !== null && normalise(current) === normalise(text)) return;
  stale.push(path.replace(ROOT, '.'));
  if (!check) {
    writeFileSync(path, text);
    written++;
  }
};

/**
 * Blog articles: `public/blog/<slug>/<slug>.md` gets a `<slug>.tw.md` sibling
 * (same directory, so the relative `./images/...` references keep resolving).
 * Only the article itself is derived — `images/` is language-neutral. Articles
 * stay on disk; only the guides/intros/pages moved into the database.
 */
function blogArticles() {
  if (!existsSync(BLOG)) return [];
  return readdirSync(BLOG, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => `${entry.name}/${entry.name}.md`)
    .filter((rel) => existsSync(join(BLOG, rel)));
}

/**
 * A blog article's source is written from the Chinese side, so its internal
 * links carry the `/zh/` prefix; the derived file has to point at `/tw/…` or a
 * reader who clicks one is dropped into the simplified layer. The Baidu Baike
 * bullet goes the other way: the encyclopedia is simplified-only, so the site's
 * own /tw surfaces leave it out (components/airport/RelatedLinks.tsx) and the
 * derived article does the same. Only link targets and that one bullet line are
 * touched — no prose.
 */
function twBlogArticle(text) {
  return toHant(text)
    .replace(/\]\(\/zh\//g, '](/tw/')
    // `[^\r\n]*` rather than `.*`: a CRLF source would otherwise leave the
    // `\r` behind and emit a stray blank line where the bullet used to be.
    .replace(/^- \*\*百度百科\*\*：[^\r\n]*\r?\n?/gm, '');
}

/** The tw document a zh document derives to. */
function derive(zh) {
  return {
    title: toHant(zh.title),
    summary: toHant(zh.summary),
    updated: zh.updated,
    body: toHant(zh.body),
  };
}

/**
 * Content documents: read every zh row, compare/upsert its tw counterpart on
 * (kind, subject, locale='tw'). Reports rows that differ (or are missing) and,
 * as a warning, tw rows whose zh source has been deleted — left alone rather
 * than dropped, since only re-running the seed or a hand edit removes content.
 */
async function syncDocuments() {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    const { rows: zhRows } = await client.query(
      `SELECT kind, subject, title, summary, updated::text AS updated, body
         FROM content_documents WHERE locale = 'zh' ORDER BY kind, subject`
    );
    const { rows: twRows } = await client.query(
      `SELECT id, kind, subject, title, summary, updated::text AS updated, body
         FROM content_documents WHERE locale = 'tw'`
    );
    const twByKey = new Map(twRows.map((r) => [`${r.kind}|${r.subject}`, r]));
    const zhKeys = new Set(zhRows.map((r) => `${r.kind}|${r.subject}`));

    await client.query('BEGIN');
    let changed = 0;
    for (const zh of zhRows) {
      const expected = derive(zh);
      const current = twByKey.get(`${zh.kind}|${zh.subject}`);
      const identical =
        current &&
        (current.title ?? null) === (expected.title ?? null) &&
        (current.summary ?? null) === (expected.summary ?? null) &&
        (current.updated ?? null) === (expected.updated ?? null) &&
        current.body === expected.body;
      if (identical) continue;
      stale.push(`content_documents ${zh.kind} ${zh.subject} tw`);
      changed++;
      if (!check) {
        await client.query(
          `INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
           VALUES ($1, $2, 'tw', $3, $4, $5, $6)
           ON CONFLICT (kind, subject, locale) DO UPDATE SET
             title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             updated = EXCLUDED.updated,
             body = EXCLUDED.body,
             updated_at = now()`,
          [zh.kind, zh.subject, expected.title, expected.summary, expected.updated, expected.body]
        );
      }
    }
    await client.query(check ? 'ROLLBACK' : 'COMMIT');
    written += changed;

    const orphaned = twRows.filter((r) => !zhKeys.has(`${r.kind}|${r.subject}`));
    if (orphaned.length) {
      console.warn(
        `note: ${orphaned.length} tw document(s) with no zh source (left alone): ` +
          orphaned.slice(0, 5).map((r) => `${r.kind}:${r.subject}`).join(', ')
      );
    }
    return { total: zhRows.length, changed };
  } finally {
    await client.end();
  }
}

// The catalog is re-rendered rather than only transliterated, and `render()`
// matches zh.ts's header and trailing type declaration with LF patterns — a
// CRLF checkout would leave both in the output and emit a tw.ts that redeclares
// `Messages`.
emit(TARGET, render(readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n')));
const articles = blogArticles();
for (const rel of articles) {
  emitMarkdown(join(BLOG, rel.replace(/\.md$/, '.tw.md')), twBlogArticle(readFileSync(join(BLOG, rel), 'utf8')));
}
const documents = await syncDocuments();

const total = documents.total + articles.length + 1;

if (check) {
  if (stale.length) {
    console.error(`${stale.length} target(s) out of date — run \`node scripts/build-hant.mjs\`:\n  ${stale.slice(0, 30).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`tw is up to date (messages + ${documents.total} document(s) + ${articles.length} blog article)`);
} else {
  console.log(
    `wrote ${written} target(s) of ${total} checked (messages + ${documents.total} document(s), ${documents.changed} changed + ${articles.length} blog article)`
  );
}
