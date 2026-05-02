import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'magiclink' | null;
  const next = searchParams.get('next') ?? '/compte';

  // Cas d'erreur renvoyé directement par Supabase (lien expiré, etc.)
  const error_code = searchParams.get('error_code');
  if (error_code === 'otp_expired') {
    return NextResponse.redirect(`${origin}/connexion?lien=expire`);
  }
  const error = searchParams.get('error');
  if (error) {
    return NextResponse.redirect(`${origin}/connexion?lien=expire`);
  }

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/connexion`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (verifyError) {
    return NextResponse.redirect(`${origin}/connexion?lien=expire`);
  }

  // Succès : rediriger vers la destination
  return NextResponse.redirect(`${origin}${next}`);
}
