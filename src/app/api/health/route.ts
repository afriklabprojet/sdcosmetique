import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    commit: 'f0a1b2c',
    timestamp: new Date().toISOString(),
    env: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      site_url: process.env.NEXT_PUBLIC_SITE_URL ?? 'not set',
      redis: !!process.env.UPSTASH_REDIS_REST_URL,
    },
  });
}
