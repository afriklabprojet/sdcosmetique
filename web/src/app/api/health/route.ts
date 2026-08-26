import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    commit: 'f0a1b2c',
    timestamp: new Date().toISOString(),
  });
}
