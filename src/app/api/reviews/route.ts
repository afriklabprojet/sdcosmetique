import { NextResponse } from 'next/server';
import { fetchAllReviews } from '@/features/catalog/review.repository';

export async function GET() {
  const data = await fetchAllReviews();
  return NextResponse.json(data);
}
