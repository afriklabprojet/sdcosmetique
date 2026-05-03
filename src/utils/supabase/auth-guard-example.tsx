/**
 * Exemple d'utilisation des auth helpers
 * Ajoutez ceci dans vos composants qui utilisent l'authentification
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ensureValidSession, handleAuthError } from '@/utils/supabase/auth-helpers';

export function useAuthGuard() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await ensureValidSession();
        
        if (!session) {
          // Pas de session valide, rediriger vers login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erreur de vérification auth:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session && event === 'SIGNED_OUT') {
            router.push('/auth/login');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
}

// Exemple d'utilisation dans une page protégée
export default function ProtectedPage() {
  useAuthGuard(); // ← Ajoutez ceci dans vos pages admin

  return (
    <div>
      <h1>Page protégée</h1>
      {/* Votre contenu */}
    </div>
  );
}