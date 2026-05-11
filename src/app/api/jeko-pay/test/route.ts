import { NextResponse } from 'next/server';
import { listStores, createRedirectPayment, JekoPayError } from '@/lib/jeko-pay/client';

export const runtime = 'nodejs';

/**
 * GET /api/jeko-pay/test
 * Diagnostic : vérifie les credentials Jeko sans créer de vrai paiement.
 * À SUPPRIMER après résolution du problème de paiement.
 */
export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Vérifier que les env vars sont présentes
  results.env = {
    JEKO_API_KEY:      process.env.JEKO_API_KEY ? `✅ présent (${process.env.JEKO_API_KEY.slice(0, 10)}...)` : '❌ MANQUANT',
    JEKO_API_KEY_ID:   process.env.JEKO_API_KEY_ID ? `✅ ${process.env.JEKO_API_KEY_ID}` : '❌ MANQUANT',
    JEKO_STORE_ID:     process.env.JEKO_STORE_ID ? `✅ ${process.env.JEKO_STORE_ID}` : '❌ MANQUANT',
    JEKO_API_BASE_URL: process.env.JEKO_API_BASE_URL ?? '(défaut: https://api.jeko.africa)',
    SITE_URL: process.env.SITE_URL ?? '❌ MANQUANT',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '❌ MANQUANT → localhost:3000',
  };

  // 2. Tester l'appel GET /partner_api/stores (ne crée rien)
  try {
    const stores = await listStores();
    results.stores = { ok: true, count: stores.length, data: stores };
  } catch (e) {
    if (e instanceof JekoPayError) {
      results.stores = { ok: false, httpStatus: e.status, message: e.message, body: e.body };
    } else {
      results.stores = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // 3. Tester un paiement fictif avec Wave (montant minimum 100 centimes = 1 XOF)
  // On utilise une référence unique pour ce test
  try {
    const testRef = `TEST-DIAG-${Date.now()}`;
    const base = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const payment = await createRedirectPayment({
      amountCents: 10000, // 100 XOF * 100 centimes
      reference: testRef,
      paymentMethod: 'wave',
      successUrl: `${base}/confirmation?ref=${testRef}&status=success`,
      errorUrl: `${base}/checkout?ref=${testRef}&status=error`,
    });
    results.testPayment = { ok: true, id: payment.id, redirectUrl: payment.redirectUrl ?? '❌ redirectUrl absent' };
  } catch (e) {
    if (e instanceof JekoPayError) {
      results.testPayment = { ok: false, httpStatus: e.status, message: e.message, body: e.body };
    } else {
      results.testPayment = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
