import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/shared/auth/auth.service';

export async function POST(req: NextRequest) {
  try {
    const { email, password, prenom, nom, telephone } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const { user, error } = await registerUser({ email, password, prenom, nom, telephone });
    if (error || !user) {
      return NextResponse.json({ error: error ?? 'Erreur lors de l\'inscription.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('[auth/register] Error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
