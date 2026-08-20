import { NextResponse } from 'next/server';
import { destroySession } from '@/shared/auth/auth.service';

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
