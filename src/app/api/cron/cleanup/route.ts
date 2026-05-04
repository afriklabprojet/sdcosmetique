/**
 * GET /api/cron/cleanup
 * Nettoyage périodique de la base de données.
 * À appeler via un scheduler (Vercel Cron, GitHub Actions, etc.).
 *
 * Header requis : Authorization: Bearer <CRON_SECRET>
 *
 * Tâches :
 *  1. Suppression des abonnés newsletter désabonnés depuis > 30 jours
 *  2. Suppression des soumissions quiz orphelines (sans email) > 90 jours
 *
 * Configuration Vercel Cron (vercel.json) :
 *   { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * 1" }] }
 *   → chaque lundi à 03h00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = createServiceClient();
  const results: Record<string, number | string> = {};

  // 1. Newsletter : désabonnés depuis > 30 jours
  const cutoffNewsletter = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { count: deletedNewsletter, error: errNewsletter } = await sb
    .from('newsletter_subscribers')
    .delete({ count: 'exact' })
    .eq('unsubscribed', true)
    .lt('updated_at', cutoffNewsletter);

  if (errNewsletter) {
    results.newsletter = `error: ${errNewsletter.message}`;
  } else {
    results.newsletter_deleted = deletedNewsletter ?? 0;
  }

  // 2. Quiz : soumissions anonymes (sans email) > 90 jours
  const cutoffQuiz = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { count: deletedQuiz, error: errQuiz } = await sb
    .from('quiz_submissions')
    .delete({ count: 'exact' })
    .is('user_email', null)
    .lt('created_at', cutoffQuiz);

  if (errQuiz) {
    results.quiz = `error: ${errQuiz.message}`;
  } else {
    results.quiz_deleted = deletedQuiz ?? 0;
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), results });
}
