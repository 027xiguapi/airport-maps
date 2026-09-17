import './globals.css';
import './additions.css';
import NotFoundContent from '@/components/NotFoundContent';

/** Root 404, used when a URL matches no route at all (e.g. `/en/nope`). */
export default function NotFound() {
  return <NotFoundContent />;
}
