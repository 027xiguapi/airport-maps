/**
 * Heading anchors for long-form Markdown (blog articles). Both sides of the
 * table of contents run through here so the ids always line up:
 *
 *   lib/markdown-toc.ts extractHeadings()  → the rail's item list (page side)
 *   components/Markdown.tsx                → the ids rendered onto h2/h3
 *
 * The slug keeps CJK characters (a Chinese heading becomes itself), lowercases
 * Latin text, drops punctuation, and folds whitespace into `-`; duplicates get
 * `-2`, `-3` suffixes in document order.
 */

export type HeadingAnchor = { id: string; label: string; level: 2 | 3 };

const FENCE = /^\s*(?:```|~~~)/;

/** Plain text of a heading line: strips the ATX marks, emphasis, links, code ticks. */
export function plainHeadingText(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1')
    .replace(/[*_~]+/g, '')
    .trim();
}

/** The anchor form of a heading's plain text. Empty input collapses to `section`. */
export function headingSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

/**
 * Unique-id allocator shared by both sides. Feed it the heading's plain text in
 * document order; the first occurrence is bare, later ones get -2, -3, …
 */
export function createIdAllocator(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = headingSlug(text);
    const used = (seen.get(base) ?? 0) + 1;
    seen.set(base, used);
    return used === 1 ? base : `${base}-${used}`;
  };
}

/**
 * The h2/h3 headings of a Markdown document, in order. Headings inside fenced
 * code blocks are ignored.
 */
export function extractHeadings(body: string): HeadingAnchor[] {
  const nextId = createIdAllocator();
  const items: HeadingAnchor[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const label = plainHeadingText(match[2]);
    if (!label) continue;
    items.push({ id: nextId(label), label, level: match[1].length as 2 | 3 });
  }
  return items;
}
