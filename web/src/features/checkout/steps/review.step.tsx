'use client';

import React from 'react';
import { PaymentMethod } from '@/shared/types/domain.type';
import type { DeliveryInfo } from '@/features/checkout/checkout.type';
import type { ShippingOption } from '@/features/site-config/site-config.type';
import { CHECKOUT_PALETTE } from '@/features/checkout/checkout.constant';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.ORANGE_MONEY]: 'Orange Money',
  [PaymentMethod.WAVE]: 'Wave',
  [PaymentMethod.MTN_MOMO]: 'MTN MoMo',
  [PaymentMethod.MOOV_MONEY]: 'Moov Money',
  [PaymentMethod.DJAMO]: 'Djamo',
  [PaymentMethod.CASH_ON_DELIVERY]: 'Paiement à la livraison',
};

interface ReviewStepProps {
  readonly delivery: DeliveryInfo;
  readonly selectedShipping: ShippingOption | null;
  readonly paymentMethod: PaymentMethod;
  readonly editDelivery: () => void;
  readonly editPayment: () => void;
  readonly confirmOrder: () => Promise<void>;
  readonly processing: boolean;
}

/*
 * Dernier écran avant la création réelle de la commande : récapitule adresse
 * et mode de paiement (le récapitulatif panier/prix vit déjà dans la sidebar,
 * visible à chaque étape — pas de doublon ici) et n'agit qu'au clic sur
 * "Confirmer ma commande", pour laisser un vrai temps de vérification avant
 * de facturer le client.
 */
export default function ReviewStep({ delivery, selectedShipping, paymentMethod, editDelivery, editPayment, confirmOrder, processing }: ReviewStepProps) {
  const onConfirm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await confirmOrder();
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
    padding: '16px 0', borderBottom: `1px solid ${CHECKOUT_PALETTE.border}`,
  };

  return (
    <div style={{ background: 'white', border: `1px solid ${CHECKOUT_PALETTE.border}`, borderRadius: '8px', padding: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: CHECKOUT_PALETTE.text, marginBottom: '20px' }}>
        Récapitulatif de la commande
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Livraison */}
        <div style={rowStyle}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: CHECKOUT_PALETTE.textMuted, marginBottom: '6px' }}>Livrer à</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: CHECKOUT_PALETTE.text, lineHeight: 1.5 }}>
              {delivery.firstName} {delivery.lastName}<br />
              {delivery.address}, {delivery.city}<br />
              {delivery.country}
              {delivery.phone && <><br />{delivery.phone}</>}
            </p>
            <p style={{ fontSize: '12px', color: CHECKOUT_PALETTE.textMuted, marginTop: '4px' }}>{delivery.email}</p>
          </div>
          <button type="button" onClick={editDelivery}
            style={{ fontSize: '12px', color: CHECKOUT_PALETTE.accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', padding: 0 }}>
            Modifier
          </button>
        </div>

        {/* Mode de livraison */}
        {selectedShipping && (
          <div style={rowStyle}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: CHECKOUT_PALETTE.textMuted, marginBottom: '6px' }}>Mode de livraison</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: CHECKOUT_PALETTE.text }}>{selectedShipping.label}</p>
              <p style={{ fontSize: '12px', color: CHECKOUT_PALETTE.textMuted, marginTop: '2px' }}>{selectedShipping.description}</p>
            </div>
            <button type="button" onClick={editDelivery}
              style={{ fontSize: '12px', color: CHECKOUT_PALETTE.accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', padding: 0 }}>
              Modifier
            </button>
          </div>
        )}

        {/* Paiement */}
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: CHECKOUT_PALETTE.textMuted, marginBottom: '6px' }}>Mode de paiement</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: CHECKOUT_PALETTE.text }}>{METHOD_LABELS[paymentMethod]}</p>
          </div>
          <button type="button" onClick={editPayment}
            style={{ fontSize: '12px', color: CHECKOUT_PALETTE.accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', padding: 0 }}>
            Modifier
          </button>
        </div>
      </div>

      <form onSubmit={onConfirm} style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'space-between' }}>
        <button type="button" onClick={editPayment}
          style={{ fontSize: '12px', color: CHECKOUT_PALETTE.textMuted, background: 'none', border: `1px solid ${CHECKOUT_PALETTE.border}`, borderRadius: '4px', padding: '10px 18px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button type="submit" disabled={processing}
          style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', padding: '12px 28px', background: processing ? '#ccc' : CHECKOUT_PALETTE.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {processing && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
          {processing ? 'Traitement…' : 'Confirmer ma commande →'}
        </button>
      </form>
      <p style={{ fontSize: '10px', color: CHECKOUT_PALETTE.textSubtle, textAlign: 'center', marginTop: '12px' }}>
        En confirmant, vous acceptez nos conditions générales de vente.
      </p>
    </div>
  );
}
