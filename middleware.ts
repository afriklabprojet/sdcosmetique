import { NextResponse, type NextRequest } from "next/server";

// Routes publiques qui n'ont jamais besoin d'auth
const PUBLIC_PREFIXES = ['/', '/boutique', '/produit', '/categorie', '/quiz', '/teint', '/avis', '/confirmation'];

function isPublicOnly(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.slice(1).some(p => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const protectedRoutes = ['/admin', '/compte'];
  const authRoutes = ['/connexion', '/inscription', '/mot-de-passe-oublie'];
  
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isAdminLogin;

  const isProtectedRoute = !isAdminLogin && protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Fast-path : routes publiques
  if (isPublicOnly(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('sd_session')?.value;
  const hasSession = Boolean(sessionCookie);

  // Route protégée sans session
  if (isProtectedRoute && !hasSession) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/connexion', request.url));
  }

  // Route admin : exiger session
  if (isAdminRoute && !hasSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Utilisateur connecté essayant d'accéder aux pages d'auth publiques
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    String.raw`/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)`,
  ]
};
