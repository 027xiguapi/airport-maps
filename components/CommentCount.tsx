import { commentCountLabel, type CommentLabels } from '@/lib/comment-labels';
import { CommentIcon } from '@/lib/icons';

/**
 * The small speech-bubble + number badge used on homepage cards (journal rows,
 * terminal-map tiles, guide tiles). Presentational only: the count arrives from
 * the server-rendered page, so these cards add no client JavaScript.
 *
 * `className` carries placement and colour (light-card meta line, navy pill,
 * overlay on a map cover); the component itself stays layout-neutral.
 */
export default function CommentCount({
  count,
  labels,
  className = '',
}: {
  count: number;
  labels: CommentLabels;
  className?: string;
}) {
  const label = commentCountLabel(labels, count);

  return (
    <span
      className={`inline-flex items-center gap-[3px] ${
        count === 0 ? 'opacity-[0.55]' : ''
      } ${className}`}
      title={label}
    >
      <CommentIcon aria-hidden="true" />
      <span aria-hidden="true">{count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
