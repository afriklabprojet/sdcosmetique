'use client';

/*
 * Page de confirmation. Apres la vague `split` (F-114) elle ne fait plus que
 * lire la derniere commande, garder la porte fermee si elle n'existe pas, et
 * poser les quatre cartes extraites dans `features/orders/cards/`.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLastOrder, formatOrderDate, OrderDraft } from '@/features/orders/order.store';
import { BG, BORDER, DARK, TEXT_BODY } from '@/features/orders/confirmation.constant';
import OrderConfirmedCard from '@/features/orders/cards/order-confirmed.card';
import OrderStepsCard from '@/features/orders/cards/order-steps.card';
import OrderSummaryCard from '@/features/orders/cards/order-summary.card';
import SupportContactCard from '@/features/orders/cards/support-contact.card';

export default function ConfirmationPage() {
  const router = useRouter();
  const [order] = useState<OrderDraft | null>(() => getLastOrder());

  // SEC-04 : si aucune commande en localStorage, l'utilisateur n'arrive pas du checkout
  // → rediriger vers la boutique pour éviter l'affichage d'une fausse "confirmation"
  useEffect(() => {
    if (order === null) {
      router.replace('/boutique');
    }
  }, [order, router]);

  const orderDate = order
    ? formatOrderDate(order.date)
    : new Date().toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

  const customerEmail = order?.delivery?.email ?? '';

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════ LEFT (2 cols) ═══════════ */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            <OrderConfirmedCard
              orderNumber={order?.orderNumber ?? '—'}
              orderDate={orderDate}
              customerEmail={customerEmail}
            />

            <OrderStepsCard />

            {/* ── Back to home button ── */}
            <Link href="/" style={{ display: 'block' }}>
              <button style={{
                width: '100%', padding: '16px', background: DARK, color: 'white',
                border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Retourner à l&apos;accueil
              </button>
            </Link>
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            <OrderSummaryCard order={order} />

            <SupportContactCard />

            {/* ── Review CTA ── */}
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: DARK, marginBottom: '6px' }}>
                Partagez votre expérience
              </p>
              <p style={{ fontSize: '12px', color: TEXT_BODY, marginBottom: '16px', lineHeight: 1.5 }}>
                Donnez votre avis et gagnez des points fidélité&nbsp;!
              </p>
              <Link href="/avis">
                <button style={{
                  width: '100%', padding: '12px', background: DARK, color: 'white', border: 'none',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: '3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFCC00" stroke="#FFCC00" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Donner mon avis
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
