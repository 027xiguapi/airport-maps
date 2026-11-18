/**
 * Structural check for a translated long-form content tree — the quality gate
 * between a translation batch and `content-import.mjs`.
 *
 *   node scripts/check-translation-tree.mjs --source <dir>/en --target <dir>/es
 *   node scripts/check-translation-tree.mjs --source ... --target ... --verbose
 *
 * It compares, per subject and kind (airports / countries / pages):
 *   - file set: every source document has a target document, and vice versa;
 *   - frontmatter: `title` and `summary` exist, `updated` matches the source;
 *   - structure: heading count/levels, image count, link count and table-row
 *     count match the source;
 *   - leftovers: a body that is byte-identical to the English source, or that
 *     still contains a long English-looking sentence, is reported.
 *
 * Exit code 1 when any mismatch is found, so a batch runner can stop.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  const arg = args[i];
  return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args[i + 1] ?? null;
};
const VERBOSE = args.includes('--verbose');

const SOURCE = flagValue('--source');
const TARGET = flagValue('--target');
if (!SOURCE || !TARGET) {
  console.error('usage: node scripts/check-translation-tree.mjs --source <en dir> --target <es dir> [--verbose]');
  process.exit(1);
}

function parse(raw) {
  const normalised = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalised);
  const meta = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const trimmed = line.trim();
      const sep = trimmed.indexOf(':');
      if (sep > 0) meta[trimmed.slice(0, sep).trim()] = trimmed.slice(sep + 1).trim();
    }
  }
  return { meta, body: match ? normalised.slice(match[0].length).trim() : normalised.trim() };
}

const headings = (body) => [...body.matchAll(/^(#{1,6}) /gm)].map((m) => m[1].length);
const count = (body, re) => (body.match(re) ?? []).length;

/**
 * English function words that almost never appear in Spanish/Portuguese prose.
 * Counting them is script-safe: unlike a raw "Latin letters" heuristic, it does
 * not flag Spanish sentences full of proper nouns.
 */
const ENGLISH_STOPWORDS =
  /\b(?:the|and|with|from|this|that|these|those|which|would|should|their|there|about|into|after|before|between|during|because|while|where|when|what|how|its|you|your|they|them|has|have|been|was|were|could|will)\b/gi;

/** Number of English function words in the longest sentence of the body. */
function englishRun(body) {
  const withoutCode = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ');
  let best = 0;
  for (const sentence of withoutCode.split(/(?<=[.!?])\s+/)) {
    const hits = (sentence.match(ENGLISH_STOPWORDS) ?? []).length;
    best = Math.max(best, hits);
  }
  return best;
}

const KINDS = ['airports', 'countries', 'pages'];
let problems = 0;
let checked = 0;

for (const kind of KINDS) {
  const sourceDir = join(SOURCE, kind);
  const targetDir = join(TARGET, kind);
  if (!existsSync(sourceDir)) continue;
  const sourceFiles = readdirSync(sourceDir).filter((f) => f.endsWith('.md')).sort();
  const targetFiles = existsSync(targetDir)
    ? readdirSync(targetDir).filter((f) => f.endsWith('.md')).sort()
    : [];
  const missing = sourceFiles.filter((f) => !targetFiles.includes(f));
  const extra = targetFiles.filter((f) => !sourceFiles.includes(f));
  if (missing.length) {
    problems += missing.length;
    console.log(`[${kind}] missing ${missing.length}: ${missing.slice(0, 20).join(' ')}${missing.length > 20 ? ' …' : ''}`);
  }
  if (extra.length) {
    problems += extra.length;
    console.log(`[${kind}] orphan ${extra.length}: ${extra.slice(0, 20).join(' ')}${extra.length > 20 ? ' …' : ''}`);
  }

  for (const file of sourceFiles.filter((f) => targetFiles.includes(f))) {
    checked++;
    const subject = file.replace(/\.md$/, '');
    const src = parse(readFileSync(join(sourceDir, file), 'utf8'));
    const dst = parse(readFileSync(join(targetDir, file), 'utf8'));
    const issues = [];
    if (!dst.meta.title) issues.push('title missing');
    if (!dst.meta.summary) issues.push('summary missing');
    if ((dst.meta.updated ?? '') !== (src.meta.updated ?? '')) {
      issues.push(`updated ${dst.meta.updated ?? '∅'} ≠ ${src.meta.updated ?? '∅'}`);
    }
    const sh = headings(src.body);
    const th = headings(dst.body);
    if (sh.join(',') !== th.join(',')) issues.push(`headings [${sh.join(',')}] ≠ [${th.join(',')}]`);
    const imageRe = /!\[[^\]]*\]\([^)]*\)/g;
    const linkRe = /(?<!!)\[[^\]]*\]\([^)]*\)/g;
    if (count(src.body, imageRe) !== count(dst.body, imageRe)) issues.push('image count differs');
    if (count(src.body, linkRe) !== count(dst.body, linkRe)) issues.push('link count differs');
    const srcRows = count(src.body, /^\s*\|.*\|$/gm);
    const dstRows = count(dst.body, /^\s*\|.*\|$/gm);
    if (srcRows !== dstRows) issues.push(`table rows ${dstRows} ≠ ${srcRows}`);
    if (dst.body && dst.body === src.body) issues.push('body identical to source');
    const run = englishRun(dst.body);
    if (run >= 8) issues.push(`untranslated English sentence (${run} function words)`);
    if (issues.length) {
      problems++;
      console.log(`[${kind}/${subject}] ${issues.join('; ')}`);
    } else if (VERBOSE) {
      console.log(`[${kind}/${subject}] ok (${th.length} headings)`);
    }
  }
}

console.log(
  `${checked} translated document(s) checked, ${problems} problem(s)` +
    (problems ? '' : ' — clean')
);
process.exit(problems ? 1 : 0);
