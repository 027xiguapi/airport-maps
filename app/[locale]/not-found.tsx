import '../globals.css';
import '../additions.css';
import NotFoundContent from '@/components/NotFoundContent';

/**
 * 404 for the `[locale]` segment (a `notFound()` call inside a route). See
 * NotFoundContent for why this is a server component and why the stylesheets
 * are imported here — Next renders this document outside the locale layout.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
