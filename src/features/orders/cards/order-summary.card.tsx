'use client';

/*
 * Recapitulatif de la commande passee : lignes, sous-total, livraison, total.
 * Extrait de `app/confirmation/page.tsx` (F-114).
 */

import Image from 'next/image';
import { formatPrice } from '@/features/catalog/product.query';
import type { OrderDraft } from '@/features/orders/order.store';
import { BORDER, GOLD, TEXT, TEXT_MUTED } from '@/features/orders/confirmation.constant';

interface OrderSummaryCardProps {
  readonly order: OrderDraft | null;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD }}>
                  Résumé de la commande
                </p>
              </div>

              {order && order.items.length > 0 ? (
                <>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {order.items.map(item => (
                      <div key={item.product.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: '4px', overflow: 'hidden',
                          flexShrink: 0, background: '#F7F2EA', border: `1px solid ${BORDER}`,
                        }}>
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={56} height={56}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT, lineHeight: 1.3, marginBottom: '3px' }}>
                            {item.product.name}
                          </p>
                          {item.product.skinTones?.[0] && (
                            <p style={{ fontSize: '11px', color: TEXT_MUTED }}>Teint {item.product.skinTones[0]}</p>
                          )}
                          <p style={{ fontSize: '11px', color: TEXT_MUTED }}>Quantité : {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, flexShrink: 0 }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TEXT_MUTED }}>
                      <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TEXT_MUTED }}>
                      <span>Livraison</span>
                      <span style={{ color: order.shippingCost === 0 ? '#16A34A' : TEXT }}>
                        {order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      paddingTop: '10px', borderTop: `1px solid ${BORDER}`, marginTop: '2px',
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: TEXT, fontFamily: 'Georgia, serif' }}>TOTAL</span>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: TEXT, fontFamily: 'Georgia, serif' }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ padding: '20px', fontSize: '13px', color: TEXT_MUTED, textAlign: 'center' }}>
                  Votre commande a été passée avec succès.
                </p>
              )}
            </div>
  );
}
