import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Mode maintenance (bascule dans le tableau de bord admin, réglage public
 * "maintenance"). L'admin peut bloquer tout le site le temps d'une mise à
 * jour, mais /admin reste toujours accessible pour pouvoir le redésactiver,
 * et le développeur garde un accès normal via un lien secret
 * (`?preview=<MAINTENANCE_BYPASS_SECRET>`) qui pose un cookie — jamais géré
 * depuis le tableau de bord, c'est un secret d'infrastructure, pas une
 * donnée métier.
 *
 * Fichier volontairement autonome (pas d'import du client API partagé) :
 * un proxy est censé pouvoir tourner isolé du reste de l'app.
 */

const BYPASS_COOKIE = 'sdc_preview';
const BYPASS_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

/** Comparaison à temps constant — évite de laisser fuir le secret octet par octet via le timing réseau. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

async function fetchMaintenanceSetting(): Promise<{ enabled: boolean; message: string } | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/settings/maintenance`, {
      next: { revalidate: 30, tags: ['site-config'] },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as { data?: { value?: unknown } };
    const value = body.data?.value;
    if (!value || typeof value !== 'object') return null;

    const { enabled, message } = value as { enabled?: unknown; message?: unknown };
    return {
      enabled: enabled === true,
      message: typeof message === 'string' ? message : '',
    };
  } catch {
    // L'API est injoignable : ne jamais bloquer le site pour ça — on
    // considère la maintenance comme désactivée plutôt que de risquer de
    // planter tout le trafic sur une panne réseau transitoire.
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  const previewToken = searchParams.get('preview');
  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
  if (previewToken && bypassSecret && safeEqual(previewToken, bypassSecret)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('preview');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(BYPASS_COOKIE, '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: BYPASS_MAX_AGE,
      path: '/',
    });
    return response;
  }

  if (request.cookies.get(BYPASS_COOKIE)?.value === '1') {
    return NextResponse.next();
  }

  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  const setting = await fetchMaintenanceSetting();
  if (!setting?.enabled) {
    return NextResponse.next();
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = '/maintenance';
  const response = NextResponse.rewrite(maintenanceUrl, { status: 503 });
  response.headers.set('Retry-After', '3600');
  return response;
}

export const config = {
  matcher: [
    '/((?!admin|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
