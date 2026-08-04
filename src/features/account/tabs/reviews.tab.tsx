'use client';

/* Avis produits laissables par le client. Extrait de `app/compte/page.tsx` (F-111). */

import Link from 'next/link';
import type { DisplayOrder } from '@/features/account/account.constant';

interface ReviewsTabProps {
  readonly mobile: boolean;
  readonly ordersForDisplay: DisplayOrder[];
}

export default function ReviewsTab({ mobile, ordersForDisplay }: ReviewsTabProps) {
  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Mes avis produits</h2>
                  {ordersForDisplay.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <p style={{ fontSize: 40, marginBottom: 12 }}>⭐</p>
                      <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 16 }}>Passez votre première commande pour laisser un avis.</p>
                      <Link href="/boutique" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, width: mobile ? '100%' : 'auto', maxWidth: mobile ? 320 : 'none', padding: '10px 24px', background: '#3D1400', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Découvrir nos produits</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ordersForDisplay.slice(0, 5).map(order => (
                        <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FAF8F5', borderRadius: 12, border: '1px solid #EDE8E0' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Commande {order.id}</p>
                            <p style={{ fontSize: 11, color: '#9A8A7A' }}>Livrée le {order.date}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 2, marginRight: 'auto', marginLeft: 20 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: '#F59E0B' }}>★</span>)}
                          </div>
                          <button style={{ padding: '7px 18px', background: '#3D1400', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Laisser un avis</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
  );
}
