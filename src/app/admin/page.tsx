/**
 * page.tsx — Server Component wrapper pour l'interface admin.
 *
 * Responsabilités :
 * 1. Vérification auth côté serveur (défense en profondeur après le middleware).
 * 2. Import dynamique d'AdminDashboard pour séparer son bundle JS du reste de l'app.
 */
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const user = await requireAdmin();
  if (!user) redirect('/admin/login?error=unauthorized');

  return <AdminDashboardClient />;
}
