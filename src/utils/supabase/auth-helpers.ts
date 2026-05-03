/**
 * Helpers pour gérer les erreurs d'authentification Supabase
 */

import { createClient } from './client';

/**
 * Nettoie les sessions corrompues et redirige vers login
 */
export async function handleAuthError(error: any) {
  // Vérifier si c'est une erreur de refresh token
  if (
    error?.message?.includes('Invalid Refresh Token') ||
    error?.message?.includes('Refresh Token Not Found') ||
    error?.code === 'invalid_grant'
  ) {
    console.warn('🔄 Session expirée ou corrompue, nettoyage en cours...');
    
    try {
      const supabase = createClient();
      
      // Déconnecter proprement l'utilisateur
      await supabase.auth.signOut({ scope: 'local' });
      
      // Nettoyer le localStorage (tokens corrompus)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
      }
      
      // Optionnel : rediriger vers login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage de session:', cleanupError);
    }
    
    return true; // Erreur gérée
  }
  
  return false; // Autre type d'erreur
}

/**
 * Wrapper pour les appels Supabase avec gestion automatique des erreurs
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const handled = await handleAuthError(error);
    
    if (!handled) {
      // Re-throw si ce n'est pas une erreur d'auth
      throw error;
    }
    
    return null;
  }
}

/**
 * Vérifie et rafraîchit la session si nécessaire
 */
export async function ensureValidSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await handleAuthError(error);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    // Vérifier si le token expire bientôt (moins de 5 minutes)
    const expiresAt = (session.expires_at ?? 0) * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt - now < fiveMinutes) {
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        await handleAuthError(refreshError);
        return null;
      }
      
      return data.session;
    }
    
    return session;
    
  } catch (error) {
    await handleAuthError(error);
    return null;
  }
}