import { redirect } from 'next/navigation';

/** /admin is just a doorway into the deal manager today. */
export default function AdminIndexPage() {
  redirect('/admin/deals');
}
