import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Routes publiques qui n'ont jamais besoin d'auth → bypass complet (réduit latence + chaîne de redirections)
const PUBLIC_PREFIXES = ['/', '/boutique', '/produit', '/categorie', '/quiz', '/teint', '/avis', '/confirmation'];

function isPublicOnly(pathname: string): boolean {
  // Racine exacte
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.slice(1).some(p => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/admin', '/compte', '/checkout'];
  const authRoutes = ['/connexion', '/inscription', '/mot-de-passe-oublie'];
  
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isAdminLogin;

  const isProtectedRoute = !isAdminLogin && protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // ── Fast-path : routes publiques → skip auth (0 round-trip Supabase) ───────
  if (isPublicOnly(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    // updateSession initialise Supabase, rafraîchit la session et retourne la response finale
    const { session, error, response } = await updateSession(request);

    // Si erreur de refresh token, nettoyer et rediriger
    if (error && (
      error.message?.includes('Invalid Refresh Token') ||
      error.message?.includes('Refresh Token Not Found')
    )) {
      console.warn('🔄 Middleware: Session expirée, nettoyage...');
      
      // Créer une response qui supprime les cookies d'auth
      const redirectResponse = NextResponse.redirect(
        new URL('/connexion', request.url)
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
      return NextResponse.redirect(new URL('/connexion', request.url));
    }

    // Route admin : exiger une session valide
    // Le contrôle ADMIN_EMAILS est fait côté serveur dans requireAdmin() (Node.js, .env.production)
    if (isAdminRoute && !session?.user) {
      console.log('🚫 Accès admin refusé: pas de session');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Utilisateur connecté essayant d'accéder aux pages d'auth publiques (pas admin/login)
    if (isAuthRoute && session) {
      console.log('👤 Redirection: déjà connecté');
      return NextResponse.redirect(new URL('/compte', request.url));
    }

    return response;

  } catch (error) {
    console.error('❌ Erreur middleware:', error);
    
    // En cas d'erreur (ex: env vars manquantes), permettre l'accès aux routes publiques
    if (!isProtectedRoute) {
      return NextResponse.next();
    }
    
    // Pour les routes protégées, rediriger vers login
    return NextResponse.redirect(new URL('/connexion', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api (API routes) → sauf /api/upload qui nécessite une session fraîche
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - tout fichier avec extension (.*\.) — couvre manifest, images, fonts, etc.
     */
    String.raw`/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)`  ,
    '/api/upload',  // inclus pour refresh session avant upload auth check
  ]
};