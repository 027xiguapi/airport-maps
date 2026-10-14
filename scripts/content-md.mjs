/**
 * Shared file ⇄ database mapping for the long-form content documents
 * (`content_documents`; see db/schema.ts). Used by `scripts/content-import.mjs`
 * and `scripts/content-export.mjs` so both sides agree on the on-disk layout,
 * the frontmatter format and the file naming rules.
 *
 *   <root>/<locale>/airports/<IATA>.md    kind='airport'
 *   <root>/<locale>/countries/<CC>.md     kind='country'
 *   <root>/<locale>/pages/<slug>.md       kind='page'
 *
 * The frontmatter reader mirrors lib/content.ts exactly: flat `key: value`
 * lines, no YAML — the parser is the contract between the two representations,
 * so a round trip has to be lossless through it.
 */

/** kind ↔ directory name. */
export const KIND_DIRS = { airport: 'airports', country: 'countries', page: 'pages' };
export const DIR_KINDS = Object.fromEntries(
  Object.entries(KIND_DIRS).map(([kind, dir]) => [dir, kind])
);

/**
 * Windows reserves the DOS device names, so a file named `AUX.md` cannot be
 * indexed by git from a Windows checkout. Guide files for such codes carry a
 * trailing underscore on disk. The database has no such restriction — these
 * helpers only exist for the file-side of a round trip.
 */
const DOS_RESERVED = new Set(['CON', 'PRN', 'AUX', 'NUL']);

/** File name (without extension) for a subject in a given kind. */
export function fileStem(kind, subject) {
  return kind === 'airport' && DOS_RESERVED.has(subject) ? `${subject}_` : subject;
}

/** Subject for a file name (without extension) in a given kind. */
export function subjectFromStem(kind, stem) {
  if (kind === 'airport' && stem.endsWith('_') && DOS_RESERVED.has(stem.slice(0, -1))) {
    return stem.slice(0, -1);
  }
  return stem;
}

/**
 * Splits a leading `---` frontmatter block from the body, exactly like
 * lib/content.ts: flat `key: value` pairs, matching quotes stripped, body
 * trimmed, line endings normalised. Values are returned as strings; the caller
 * decides what is mandatory.
 */
export function parseDocument(raw) {
  const normalised = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalised);
  if (!match) return { title: undefined, summary: undefined, updated: undefined, body: normalised.trim() };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return {
    title: meta.title,
    summary: meta.summary,
    updated: meta.updated,
    body: normalised.slice(match[0].length).trim(),
  };
}

/**
 * Serialises a document back to the on-disk form: frontmatter with the three
 * known keys (each omitted when null), a blank line, the body, a trailing
 * newline. Always LF — importing normalises anyway, and the app never sees
 * line endings.
 */
export function renderDocument({ title, summary, updated, body }) {
  const lines = ['---'];
  if (title != null) lines.push(`title: ${title}`);
  if (summary != null) lines.push(`summary: ${summary}`);
  if (updated != null) lines.push(`updated: ${updated}`);
  lines.push('---', '', String(body).trim(), '');
  return lines.join('\n');
}
