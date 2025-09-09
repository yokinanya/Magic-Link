import { redirect } from 'next/navigation';

// This component redirects the user from the base /admin route to the /admin/create page.
export default function AdminRootPage() {
  redirect('/admin/create');
}
