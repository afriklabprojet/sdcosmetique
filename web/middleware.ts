import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ['/', '/boutique', '/produit', '/categorie', '/quiz', '/teint', '/avis', '/confirmation'];

function isPublicOnly(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.slice(1).some(p => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isAdminLogin;

  if (isPublicOnly(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get('sd_session')?.value);

  if (isAdminRoute && !hasSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    String.raw`/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)`,
  ]
};
