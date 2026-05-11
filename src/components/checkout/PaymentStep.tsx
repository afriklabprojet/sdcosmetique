'use client';

import React from 'react';
import { type PaymentMethod } from '@/types';
import { type CheckoutStep, GOLD, BORDER, BG_ROW, TXT, TXT2, TXT3, inputSt } from './shared';

const MOBILE_METHODS: { id: PaymentMethod; label: string; desc: string; logo: React.ReactNode; badge?: string }[] = [
  {
    id: 'orange_money', label: 'Orange Money', desc: 'Paiement mobile Orange', badge: 'Recommandé',
    logo: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#FF6600', color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>OM</span>,
  },
  {
    id: 'wave', label: 'Wave', desc: 'Paiement rapide via Wave',
    logo: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#1A9BE6', color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>W</span>,
  },
  {
    id: 'mtn_momo', label: 'MTN MoMo', desc: 'Mobile Money MTN',
    logo: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#FFCC00', color: '#1A1A1A', fontSize: '10px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>MTN</span>,
  },
  {
    id: 'moov_money', label: 'Moov Money', desc: 'Paiement Moov Money',
    logo: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#00A651', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>MOOV</span>,
  },
  {
    id: 'djamo', label: 'Djamo', desc: 'Paiement par carte Djamo',
    logo: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#6C3CE1', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>DJA</span>,
  },
];

interface PaymentStepProps {
  readonly paymentMethod: PaymentMethod;
  readonly setPaymentMethod: (m: PaymentMethod) => void;
  readonly mobileNumber: string;
  readonly setMobileNumber: (n: string) => void;
  readonly handlePlaceOrder: (e: React.SyntheticEvent) => Promise<void>;
  readonly processing: boolean;
  readonly setStep: (s: CheckoutStep) => void;
  readonly isMobile: boolean;
  readonly activeMethods?: string[];
}

export default function PaymentStep({ paymentMethod, setPaymentMethod, mobileNumber, setMobileNumber, handlePlaceOrder, processing, setStep, isMobile, activeMethods = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'cash_on_delivery'] }: PaymentStepProps) {
  const showMobileInput = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo'].includes(paymentMethod);
  const visibleMobile = MOBILE_METHODS.filter(m => activeMethods.includes(m.id));
  const showCashOnDelivery = activeMethods.includes('cash_on_delivery');
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT, marginBottom: '20px' }}>Mode de paiement</h2>
      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Mobile money methods */}
        {visibleMobile.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: TXT2, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paiement Mobile</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleMobile.map(m => {
              const isSelected = paymentMethod === m.id;
              return (
                <div key={m.id} role="radio" aria-checked={isSelected} tabIndex={0}
                  onClick={() => setPaymentMethod(m.id)}
                  onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPaymentMethod(m.id); } }}
                  style={{ padding: '12px 14px', border: `1.5px solid ${isSelected ? GOLD : BORDER}`, borderRadius: '6px', cursor: 'pointer', background: isSelected ? BG_ROW : 'white', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color .15s' }}>
                  {m.logo}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: TXT }}>{m.label}</p>
                    <p style={{ fontSize: '11px', color: TXT2 }}>{m.desc}</p>
                  </div>
                  {m.badge && <span className="checkout-payment-badge" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', background: GOLD, color: 'white', borderRadius: '99px', letterSpacing: '0.05em' }}>{m.badge}</span>}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Phone number (shown when mobile payment selected) */}
        {showMobileInput && (
          <div className="checkout-phone-panel">
            <label htmlFor="pay-mobile-number" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numéro de téléphone *</label>
            <input id="pay-mobile-number" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="+225 00 00 00 00 00" style={inputSt} />
          </div>
        )}

        {/* Cash on delivery — visible uniquement si activé en admin */}
        {showCashOnDelivery && (
        <div role="radio" aria-checked={paymentMethod === 'cash_on_delivery'} tabIndex={0}
          onClick={() => setPaymentMethod('cash_on_delivery')}
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPaymentMethod('cash_on_delivery'); } }}
          style={{ padding: '12px 14px', border: `1.5px solid ${paymentMethod === 'cash_on_delivery' ? GOLD : BORDER}`, borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'cash_on_delivery' ? BG_ROW : 'white', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color .15s' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#10B981', color: '#fff', fontSize: '18px', flexShrink: 0 }}>💵</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: TXT }}>Paiement à la livraison</p>
            <p style={{ fontSize: '11px', color: TXT2 }}>Payez en espèces à la réception</p>
          </div>
        </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => setStep('delivery')}
            style={{ fontSize: '12px', color: TXT2, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '10px 18px', cursor: 'pointer' }}>
            ← Retour
          </button>
          <button type="submit" disabled={processing}
            style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', padding: '12px 28px', background: processing ? '#ccc' : GOLD, color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {processing && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
            {processing ? 'Traitement…' : 'Confirmer la commande →'}
          </button>
        </div>
      </form>
      {isMobile && <p style={{ fontSize: '10px', color: TXT3, textAlign: 'center', marginTop: '12px' }}>Vos données sont protégées par un chiffrement SSL.</p>}
    </div>
  );
}
