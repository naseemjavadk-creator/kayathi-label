import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

// Second check on top of the middleware. The database rules are the final enforcement.
export default async function PanelLayout({ children }) {
  const sb = createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await sb.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin/login?error=forbidden');
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
