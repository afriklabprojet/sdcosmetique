import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/admin', '/compte', '/checkout'];
  const authRoutes = ['/auth/login', '/auth/register', '/auth/reset'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  try {
    // Récupérer la session utilisateur
    const { data: { session }, error } = await supabase.auth.getSession();

    // Si erreur de refresh token, nettoyer et rediriger
    if (error && (
      error.message?.includes('Invalid Refresh Token') ||
      error.message?.includes('Refresh Token Not Found')
    )) {
      console.warn('🔄 Middleware: Session expirée, nettoyage...');
      
      // Créer une response qui supprime les cookies d'auth
      const redirectResponse = NextResponse.redirect(
        new URL('/auth/login', request.url)
      );
      
      // Supprimer tous les cookies Supabase
      redirectResponse.cookies.delete('sb-access-token');
      redirectResponse.cookies.delete('sb-refresh-token');
      
      // Nettoyer tous les cookies qui commencent par 'sb-'
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          redirectResponse.cookies.delete(cookie.name);
        }
      });
      
      return redirectResponse;
    }

    // Route protégée sans session valide
    if (isProtectedRoute && !session) {
      console.log('🔒 Redirection vers login: route protégée sans auth');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Utilisateur connecté essayant d'accéder aux pages d'auth
    if (isAuthRoute && session) {
      console.log('👤 Redirection vers compte: déjà connecté');
      return NextResponse.redirect(new URL('/compte', request.url));
    }

    return response;

  } catch (error) {
    console.error('❌ Erreur middleware:', error);
    
    // En cas d'erreur, permettre l'accès aux routes publiques
    if (!isProtectedRoute) {
      return response;
    }
    
    // Pour les routes protégées, rediriger vers login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - fichiers publics (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"
  ]
};