'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { SKIN_TONES } from '@/types';
import type { PromoCode } from '@/lib/site-config';
import { type CheckoutStep, GOLD, BORDER, TXT, TXT2, TXT3 } from './shared';

interface SidebarProps {
  readonly items: ReturnType<typeof useCart>['items'];
  readonly totalPrice: number;
  readonly shippingCost: number;
  readonly discount: number;
  readonly total: number;
  readonly step: CheckoutStep;
  readonly setStep: (s: CheckoutStep) => void;
  readonly appliedPromo: { code: PromoCode; discount: number } | null;
  readonly promoInput: string;
  readonly setPromoInput: (v: string) => void;
  readonly promoError: string | null;
  readonly setPromoError: (e: string | null) => void;
  readonly handleApplyPromo: () => void;
  readonly removePromo: () => void;
}

export default function Sidebar({ items, totalPrice, shippingCost, discount, total, step, setStep, appliedPromo, promoInput, setPromoInput, promoError, setPromoError, handleApplyPromo, removePromo }: SidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Order summary card */}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT }}>Résumé de la commande</span>
          {step !== 'cart' && (
            <button type="button" onClick={() => setStep('cart')} style={{ fontSize: '12px', color: GOLD, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              Modifier le panier
            </button>
          )}
        </div>
        {/* Items */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map(item => {
            const tone = item.product.skinTones[0]
              ? (SKIN_TONES.find(s => s.id === item.product.skinTones[0])?.label ?? item.product.skinTones[0])
              : null;
            return (
              <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#F5EDE5', border: `1px solid ${BORDER}` }}>
                  <Image src={item.product.images[0] ?? '/placeholder.png'} alt={item.product.name} width={60} height={60} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: TXT, marginBottom: '3px', lineHeight: 1.3 }}>{item.product.name}</p>
                  {tone && <p style={{ fontSize: '11px', color: TXT2, lineHeight: 1.3 }}>Teint {tone}</p>}
                  <p style={{ fontSize: '11px', color: TXT2 }}>Quantité : {item.quantity}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: TXT, flexShrink: 0 }}>
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Totals */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TXT2 }}>
            <span>Sous-total</span><span>{formatPrice(totalPrice)}</span>
          </div>
          {appliedPromo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16A34A' }}>
              <span>Réduction <span style={{ fontSize: '11px', opacity: 0.8 }}>({appliedPromo.code.code})</span></span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TXT2 }}>
            <span>Livraison</span>
            <span style={{ color: shippingCost === 0 ? '#16A34A' : TXT }}>
              {shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: `1px solid ${BORDER}`, marginTop: '2px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: TXT, fontFamily: 'var(--font-heading)' }}>TOTAL</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: TXT, fontFamily: 'var(--font-heading)' }}>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Code promo */}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT, marginBottom: '10px' }}>Code promo</p>
        {appliedPromo ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ {appliedPromo.code.code}</span>
              <span style={{ color: TXT2, marginLeft: '6px' }}>−{formatPrice(appliedPromo.discount)}</span>
            </div>
            <button type="button" onClick={removePromo}
              style={{ fontSize: '11px', color: TXT2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Retirer
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                placeholder="Entrez votre code"
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', outline: 'none' }} />
              <button type="button" onClick={handleApplyPromo}
                style={{ fontSize: '11px', fontWeight: 700, padding: '0 14px', background: GOLD, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                Appliquer
              </button>
            </div>
            {promoError && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '6px' }}>{promoError}</p>}
          </>
        )}
      </div>

      {/* Engagements */}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '16px 20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT, marginBottom: '14px' }}>Nos Engagements</p>
        <div className="checkout-form-2col" style={{ gap: '14px' }}>
          {[
            { icon: '🛡️', l: 'Paiement',      s: '100% sécurisé' },
            { icon: '🚚', l: 'Livraison rapide', s: 'et suivie' },
            { icon: '✅', l: 'Produits',       s: 'authentiques' },
            { icon: '↩️', l: 'Satisfait ou',   s: 'remboursé sous 7 jours' },
          ].map(e => (
            <div key={e.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
              <span style={{ fontSize: '22px' }}>{e.icon}</span>
              <p style={{ fontSize: '11px', fontWeight: 700, color: TXT, lineHeight: 1.3 }}>{e.l}</p>
              <p style={{ fontSize: '10px', color: TXT3, lineHeight: 1.3 }}>{e.s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
