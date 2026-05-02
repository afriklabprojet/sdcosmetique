import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Helper server-side Supabase client pour les lib functions (Server Components).
 * Ne jamais appeler depuis un Client Component.
 */
export async function db() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
