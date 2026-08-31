/**
 * page.tsx — Admin dashboard. Auth is enforced by Laravel (`/admin/session`)
 * inside the client view: Next cannot see `laravel_session` on :8000.
 */
import AdminDashboardClient from '@/features/admin/admin-dashboard-client';

export default function AdminPage() {
  return <AdminDashboardClient />;
}
