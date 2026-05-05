import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const supabase = await db();
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return NextResponse.json({ value: null }, { status: 404 });
    }

    return NextResponse.json({ value: data.value }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ value: null }, { status: 500 });
  }
}
