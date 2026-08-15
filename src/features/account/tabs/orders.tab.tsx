'use client';

/* Liste complete des commandes du client. Extrait de `app/compte/page.tsx` (F-111). */

import Link from 'next/link';
import { STATUS_CONFIG, type DisplayOrder } from '@/features/account/account.constant';

interface OrdersTabProps {
  readonly ordersForDisplay: DisplayOrder[];
}

export default function OrdersTab({ ordersForDisplay }: OrdersTabProps) {
  return (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #F5F0E8' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes commandes</h2>
                </div>
                {ordersForDisplay.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>📦</p>
                    <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 8 }}>Vous n&apos;avez pas encore passé de commande.</p>
                    <Link href="/boutique" style={{ fontSize: 13, color: '#C8974A', fontWeight: 600 }}>Découvrir la boutique →</Link>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5' }}>
                        {['Commande', 'Date', 'Statut', 'Montant', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8A7A' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ordersForDisplay.map(order => {
                        const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['Confirmée'];
                        return (
                          <tr key={order.id} style={{ borderTop: '1px solid #F5F0E8' }}>
                            <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{order.id}</td>
                            <td style={{ padding: '13px 20px', fontSize: 13, color: '#7A6A5A' }}>{order.date}</td>
                            <td style={{ padding: '13px 20px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                background: st.bg, color: st.color,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                                {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{order.total}</td>
                            <td style={{ padding: '13px 20px' }}>
                              <button style={{
                                padding: '6px 16px', background: '#FAF8F5', border: '1px solid #EDE8E0',
                                borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#6B3D14', cursor: 'pointer',
                              }}>Détails</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
  );
}
