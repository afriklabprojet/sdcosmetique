import { NextRequest, NextResponse } from 'next/server';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { db } from '@/shared/db';
import { newsletterSubscribers, quizSubmissions } from '@/shared/db/schema';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: Record<string, number | string> = {};

  try {
    const cutoffNewsletter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db
      .delete(newsletterSubscribers)
      .where(and(eq(newsletterSubscribers.unsubscribed, true), lt(newsletterSubscribers.createdAt, cutoffNewsletter)));
    results.newsletter = 'ok';
  } catch (err: unknown) {
    results.newsletter = `error: ${err instanceof Error ? err.message : err}`;
  }

  try {
    const cutoffQuiz = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await db
      .delete(quizSubmissions)
      .where(and(isNull(quizSubmissions.userEmail), lt(quizSubmissions.createdAt, cutoffQuiz)));
    results.quiz = 'ok';
  } catch (err: unknown) {
    results.quiz = `error: ${err instanceof Error ? err.message : err}`;
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), results });
}
