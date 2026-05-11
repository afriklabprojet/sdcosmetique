'use client';

import React from 'react';
import { formatPrice } from '@/lib/products';
import type { ShippingOption } from '@/lib/site-config';
import { type CheckoutStep, type DeliveryInfo, GOLD, BORDER, TXT, TXT2, inputSt } from './shared';

interface DeliveryStepProps {
  readonly delivery: DeliveryInfo;
  readonly setDelivery: React.Dispatch<React.SetStateAction<DeliveryInfo>>;
  readonly setStep: (s: CheckoutStep) => void;
  readonly handleDeliverySubmit: (e: React.SyntheticEvent) => void;
  readonly shippingOptions: ShippingOption[];
  readonly selectedShipping: ShippingOption | null;
  readonly setSelectedShipping: (opt: ShippingOption) => void;
}

export default function DeliveryStep({ delivery, setDelivery, setStep, handleDeliverySubmit, shippingOptions, selectedShipping, setSelectedShipping }: DeliveryStepProps) {
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT, marginBottom: '24px' }}>
        Informations de livraison
      </h2>
      <form onSubmit={handleDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="checkout-form-2col">
          <div>
            <label htmlFor="del-firstName" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prénom *</label>
            <input id="del-firstName" required value={delivery.firstName} onChange={e => setDelivery(d => ({ ...d, firstName: e.target.value }))} placeholder="Votre prénom" style={inputSt} />
          </div>
          <div>
            <label htmlFor="del-lastName" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
            <input id="del-lastName" required value={delivery.lastName} onChange={e => setDelivery(d => ({ ...d, lastName: e.target.value }))} placeholder="Votre nom" style={inputSt} />
          </div>
        </div>
        <div>
          <label htmlFor="del-email" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
          <input id="del-email" required type="email" value={delivery.email} onChange={e => setDelivery(d => ({ ...d, email: e.target.value }))} placeholder="votre@email.com" style={inputSt} />
        </div>
        <div>
          <label htmlFor="del-phone" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Téléphone *</label>
          <input id="del-phone" required value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))} placeholder="+225 00 00 00 00 00" style={inputSt} />
        </div>
        <div>
          <label htmlFor="del-address" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adresse *</label>
          <input id="del-address" required value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} placeholder="Rue, quartier, commune..." style={inputSt} />
        </div>
        <div className="checkout-form-2col">
          <div>
            <label htmlFor="del-city" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ville *</label>
            <input id="del-city" required value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))} placeholder="Abidjan, Dakar..." style={inputSt} />
          </div>
          <div>
            <label htmlFor="del-country" style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pays *</label>
            <input id="del-country" required value={delivery.country} onChange={e => setDelivery(d => ({ ...d, country: e.target.value }))} placeholder="Côte d'Ivoire" style={inputSt} />
          </div>
        </div>

        {/* Mode de livraison */}
        {shippingOptions.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: TXT2, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mode de livraison *</p>
            <div role="radiogroup" aria-label="Mode de livraison" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shippingOptions.map(opt => {
                const isFree = opt.freeFrom != null;
                const isSelected = selectedShipping?.id === opt.id;
                return (
                  <div key={opt.id} role="radio" aria-checked={isSelected} tabIndex={0}
                    onClick={() => setSelectedShipping(opt)}
                    onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSelectedShipping(opt); } }}
                    style={{ padding: '12px 14px', border: `1.5px solid ${isSelected ? GOLD : BORDER}`, borderRadius: '6px', cursor: 'pointer', background: isSelected ? '#FDFAF7' : 'white', transition: 'border-color .15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isSelected ? GOLD : '#ccc'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD, display: 'block' }} />}
                      </span>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: TXT }}>{opt.label}</p>
                        {opt.description && <p style={{ fontSize: '11px', color: TXT2 }}>{opt.description}</p>}
                        {isFree && <p style={{ fontSize: '11px', color: '#16A34A' }}>Gratuite dès {formatPrice(opt.freeFrom)}</p>}
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: opt.cost === 0 ? '#16A34A' : TXT, flexShrink: 0 }}>
                      {opt.cost === 0 ? 'Gratuit' : formatPrice(opt.cost)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => setStep('cart')}
            style={{ fontSize: '12px', color: TXT2, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '10px 18px', cursor: 'pointer' }}>
            ← Retour
          </button>
          <button type="submit"
            style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', padding: '12px 28px', background: GOLD, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Continuer vers le paiement →
          </button>
        </div>
      </form>
    </div>
  );
}
