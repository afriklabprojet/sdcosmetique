import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/shared/auth/auth.service';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const { user, error } = await loginUser({ email, password });
    if (error || !user) {
      return NextResponse.json({ error: error ?? 'Identifiants invalides.' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
