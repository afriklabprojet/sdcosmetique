'use client';

/*
 * Carte d'accusé de réception : coche verte, numero, date, suivi, e-mail.
 * Extraite de `app/confirmation/page.tsx` (F-114).
 */

import Link from 'next/link';
import { BORDER, DARK, GOLD, TEXT, TEXT_MUTED, TEXT_BODY, SPARKLES } from '@/features/orders/confirmation.constant';

interface OrderConfirmedCardProps {
  readonly orderNumber: string;
  readonly orderDate: string;
  readonly customerEmail: string;
}

export default function OrderConfirmedCard({ orderNumber, orderDate, customerEmail }: OrderConfirmedCardProps) {
  return (
            <div style={{
              background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px',
              padding: '48px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              {/* Sparkles */}
              {SPARKLES.map((s, i) => (
                <span key={`${s.top}-${s.left}`} aria-hidden="true" style={{
                  position: 'absolute', top: s.top, left: s.left,
                  fontSize: s.size, lineHeight: 1, opacity: s.op,
                  transform: `rotate(${s.rot}deg)`, pointerEvents: 'none',
                  color: i % 2 === 0 ? GOLD : '#C8974A',
                }}>✦</span>
              ))}

              {/* Green checkmark circle */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#F0FDF4', border: '3px solid #22C55E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 800, color: TEXT, fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
                Commande confirmée&nbsp;!
              </h1>
              <p style={{ fontSize: '16px', fontStyle: 'italic', color: GOLD, fontFamily: 'Georgia, serif', marginBottom: '18px' }}>
                Merci pour votre confiance.
              </p>
              <p style={{ fontSize: '14px', color: TEXT_BODY, lineHeight: 1.65, maxWidth: '440px', margin: '0 auto 28px' }}>
                Votre commande a été passée avec succès et est en cours de traitement.
                Vous recevrez bientôt un e-mail de confirmation avec tous les détails.
              </p>

              {/* 2-column info box */}
              <div style={{
                display: 'inline-flex', border: `1px solid ${BORDER}`,
                borderRadius: '6px', overflow: 'hidden', marginBottom: '28px', textAlign: 'left',
              }}>
                {/* Order number */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1"/>
                    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: '4px' }}>
                      Numéro de commande
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: DARK }}>
                      {orderNumber}
                    </p>
                  </div>
                </div>
                <div style={{ width: '1px', background: BORDER }} />
                {/* Order date */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: '4px' }}>
                      Date de commande
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>{orderDate}</p>
                  </div>
                </div>
              </div>

              {/* CTA: track order */}
              <div style={{ marginBottom: '20px' }}>
                <Link href="/compte">
                  <button style={{
                    padding: '14px 40px', background: DARK, color: 'white', border: 'none',
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: '3px',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                  }}>
                    Suivre ma commande
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </Link>
              </div>

              {/* Email confirmation line */}
              {customerEmail && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p style={{ fontSize: '13px', color: TEXT_BODY }}>
                    Un e-mail de confirmation a été envoyé à{' '}
                    <strong style={{ color: TEXT }}>{customerEmail}</strong>
                  </p>
                </div>
              )}
            </div>
  );
}
