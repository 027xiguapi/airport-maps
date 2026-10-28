import type { Messages } from '@/lib/i18n/messages/zh';

/**
 * The few comment strings shared by the server-rendered count badge and the
 * client comment block. Plain strings only, typed against the Chinese catalog,
 * and no server imports — safe on both sides of the boundary.
 */
export type CommentLabels = Messages['comments'];

/** "{n} comments", with the singular form for exactly one. */
export function commentCountLabel(labels: CommentLabels, count: number): string {
  return (count === 1 ? labels.countOne : labels.countMany).replace('{n}', String(count));
}

/**
 * Shared key format for a comment thread: `kind:key`. Kept in this render-safe
 * module so card components can look counts up without importing the
 * database-facing lib/comments.ts.
 */
export function commentThreadKey(kind: string, key: string): string {
  return `${kind}:${key}`;
}
