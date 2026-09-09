'use client';

import React, { useEffect, useState } from 'react';
import { PaymentMethod } from '@/shared/types/domain.type';
import { CHECKOUT_PALETTE, CHECKOUT_INPUT_STYLE } from '@/features/checkout/checkout.constant';
import { fetchPublicSetting } from '@/shared/api/settings';

/*
 * Repli tant que le logo officiel (Admin → Paiements → `payment_images`) n'a
 * pas encore été chargé — même logique que `PaymentBand` sur l'accueil.
 */
const FALLBACK_LOGOS: Record<PaymentMethod, React.ReactNode> = {
  [PaymentMethod.ORANGE_MONEY]: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#FF6600', color: '#fff', fontSize: '9px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>OM</span>,
  [PaymentMethod.WAVE]: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#1A9BE6', color: '#fff', fontSize: '9px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>W</span>,
  [PaymentMethod.MTN_MOMO]: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#FFCC00', color: '#1A1A1A', fontSize: '8px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>MTN</span>,
  [PaymentMethod.MOOV_MONEY]: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#00A651', color: '#fff', fontSize: '8px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>MOOV</span>,
  [PaymentMethod.DJAMO]: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#6C3CE1', color: '#fff', fontSize: '8px', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>DJA</span>,
  [PaymentMethod.CASH_ON_DELIVERY]: null,
};

const MOBILE_METHODS: { id: PaymentMethod; label: string; badge?: string }[] = [
  { id: PaymentMethod.ORANGE_MONEY, label: 'Orange Money' },
  { id: PaymentMethod.WAVE, label: 'Wave', badge: 'Recommandé' },
  { id: PaymentMethod.MTN_MOMO, label: 'MTN MoMo' },
  { id: PaymentMethod.MOOV_MONEY, label: 'Moov Money' },
  { id: PaymentMethod.DJAMO, label: 'Djamo' },
];

interface PaymentStepProps {
  readonly paymentMethod: PaymentMethod;
  readonly selectMethod: (m: PaymentMethod) => void;
  readonly placeOrder: (mobileNumber: string) => Promise<void>;
  readonly processing: boolean;
  readonly back: () => void;
  readonly activeMethods?: string[];
}

/*
 * Le numero de payeur est une saisie : il n'existe que le temps du formulaire,
 * et le tunnel ne le recoit qu'au moment de la commande. Le mode de paiement
 * reste dehors : il decide du statut de la commande et du parcours qui suit.
 *
 * Tuiles carrées à taille fixe (icône au-dessus, libellé dessous) : `1fr` sur
 * une grille à 3 colonnes les aurait étirées à la largeur du conteneur (donc
 * bien plus grandes sur tablette/desktop) — `auto-fill` avec une piste figée
 * les garde identiques, petites, partout, et laisse juste plus de tuiles se
 * placer par ligne quand la largeur le permet.
 */
export default function PaymentStep({ paymentMethod, selectMethod, placeOrder, processing, back, activeMethods = Object.values(PaymentMethod) }: PaymentStepProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPublicSetting('payment_images')
      .then((value) => {
        if (value && typeof value === 'object') setImages(value);
      })
      .catch(() => {});
  }, []);

  const submitForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await placeOrder(mobileNumber);
  };
  const visibleMobile = MOBILE_METHODS.filter(m => activeMethods.includes(m.id));

  return (
    <div style={{ background: 'white', border: `1px solid ${CHECKOUT_PALETTE.border}`, borderRadius: '8px', padding: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: CHECKOUT_PALETTE.text, marginBottom: '20px' }}>Mode de paiement</h2>
      <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Mobile money methods */}
        {visibleMobile.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: CHECKOUT_PALETTE.textMuted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paiement Mobile</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 76px)', gap: '8px' }}>
            {visibleMobile.map(m => {
              const selected = paymentMethod === m.id;
              const imgUrl = images[m.id];
              return (
                <div key={m.id} role="radio" aria-checked={selected} aria-label={m.label} tabIndex={0}
                  onClick={() => selectMethod(m.id)}
                  onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectMethod(m.id); } }}
                  style={{ position: 'relative', width: '76px', height: '76px', padding: '4px', border: `1.5px solid ${selected ? CHECKOUT_PALETTE.accent : CHECKOUT_PALETTE.border}`, borderRadius: '10px', cursor: 'pointer', background: selected ? CHECKOUT_PALETTE.rowBackground : 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', textAlign: 'center', transition: 'border-color .15s' }}>
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={m.label} style={{ maxWidth: '64px', maxHeight: '38px', objectFit: 'contain' }} />
                  ) : (
                    <>
                      {FALLBACK_LOGOS[m.id]}
                      <span style={{ fontSize: '9px', fontWeight: 600, color: CHECKOUT_PALETTE.text, lineHeight: 1.1 }}>{m.label}</span>
                    </>
                  )}
                  {m.badge && (
                    <span className="checkout-payment-badge" style={{ position: 'absolute', top: '-7px', right: '0', fontSize: '6.5px', fontWeight: 700, padding: '2px 4px', background: CHECKOUT_PALETTE.accent, color: 'white', borderRadius: '99px', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{m.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Phone number */}
        <div className="checkout-phone-panel">
          <label htmlFor="pay-mobile-number" style={{ fontSize: '11px', fontWeight: 600, color: CHECKOUT_PALETTE.textMuted, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numéro de téléphone *</label>
          <input id="pay-mobile-number" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="+225 00 00 00 00 00" style={CHECKOUT_INPUT_STYLE} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'space-between' }}>
          <button type="button" onClick={back}
            style={{ fontSize: '12px', color: CHECKOUT_PALETTE.textMuted, background: 'none', border: `1px solid ${CHECKOUT_PALETTE.border}`, borderRadius: '4px', padding: '10px 18px', cursor: 'pointer' }}>
            ← Retour
          </button>
          <button type="submit" disabled={processing}
            style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', padding: '12px 28px', background: processing ? '#ccc' : CHECKOUT_PALETTE.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {processing && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
            {processing ? 'Traitement…' : 'Continuer →'}
          </button>
        </div>
      </form>
      <p style={{ fontSize: '10px', color: CHECKOUT_PALETTE.textSubtle, textAlign: 'center', marginTop: '12px' }}>Vos données sont protégées par un chiffrement SSL.</p>
    </div>
  );
}
