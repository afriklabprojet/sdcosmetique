'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { PaymentMethod, SKIN_TONES } from '@/types';
import { saveOrder, generateOrderNumber } from '@/lib/orders';
import { saveOrderToDB } from '@/lib/orders-db';
import { createClient } from '@/utils/supabase/client';
import { fetchSiteConfigSection, DEFAULT_SITE_CONFIG, applyPromoCode } from '@/lib/site-config';
import type { ShippingConfig, ShippingOption, PromoCode } from '@/lib/site-config';

// Composants extraits
import CartStep from '@/components/checkout/CartStep';

type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'confirmation';

interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

// ── Stepper config ────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'cart',         label: 'Panier',       sub: 'Vérification' },
  { key: 'delivery',     label: 'Informations', sub: 'Adresse & contact' },
  { key: 'payment',      label: 'Paiement',     sub: 'Mode de paiement' },
  { key: 'confirmation', label: 'Confirmation', sub: 'Commande validée' },
] as const;

const STEP_ORDER: CheckoutStep[] = ['cart', 'delivery', 'payment', 'confirmation'];

// ── Payment logos (SVG inline) ────────────────────────────────────────────────
// ── Shared styles ─────────────────────────────────────────────────────────────
const GOLD    = '#C8974A';
const BORDER  = '#E2D9CF';
const BG_ROW  = '#FDFAF7';
const TXT     = '#2C1810';
const TXT2    = '#8C7B6E';
const TXT3    = '#B5A898';

const inputSt: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: `1px solid ${BORDER}`,
  borderRadius: '4px', fontSize: '13px', color: TXT, background: 'white',
  outline: 'none', boxSizing: 'border-box',
};

const MOBILE_METHODS: { id: PaymentMethod; label: string; desc: string; logo: React.ReactNode; badge?: string }[] = [
  { id: 'orange_money', label: 'Orange Money', desc: 'Paiement mobile Orange', logo: <span style={{ fontSize: '24px' }}>🟠</span>, badge: 'Recommandé' },
  { id: 'wave',         label: 'Wave',         desc: 'Paiement rapide via Wave', logo: <span style={{ fontSize: '24px' }}>🌊</span> },
  { id: 'mtn_momo',    label: 'MTN MoMo',    desc: 'Mobile Money MTN', logo: <span style={{ fontSize: '24px' }}>🟡</span> },
  { id: 'moov_money',  label: 'Moov Money',  desc: 'Paiement Moov Money', logo: <span style={{ fontSize: '24px' }}>🔵</span> },
];


// ── Types checkout ────────────────────────────────────────────────────────────
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

interface CartStepProps {
  items: ReturnType<typeof useCart>['items'];
  setStep: (s: CheckoutStep) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
}

interface DeliveryStepProps {
  readonly delivery: DeliveryInfo;
  readonly setDelivery: React.Dispatch<React.SetStateAction<DeliveryInfo>>;
  readonly setStep: (s: CheckoutStep) => void;
  readonly handleDeliverySubmit: (e: React.SyntheticEvent) => void;
  readonly shippingOptions: ShippingOption[];
  readonly selectedShipping: ShippingOption | null;
  readonly setSelectedShipping: (opt: ShippingOption) => void;
}

interface PaymentStepProps {
  readonly paymentMethod: PaymentMethod;
  readonly setPaymentMethod: (m: PaymentMethod) => void;
  readonly mobileNumber: string;
  readonly setMobileNumber: (n: string) => void;
  readonly handlePlaceOrder: (e: React.SyntheticEvent) => Promise<void>;
  readonly processing: boolean;
  readonly setStep: (s: CheckoutStep) => void;
  readonly isMobile: boolean;
}


function Sidebar({ items, totalPrice, shippingCost, discount, total, step, setStep, appliedPromo, promoInput, setPromoInput, promoError, setPromoError, handleApplyPromo, removePromo }: SidebarProps) {
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


function DeliveryStep({ delivery, setDelivery, setStep, handleDeliverySubmit, shippingOptions, selectedShipping, setSelectedShipping }: DeliveryStepProps) {
  const activeOptions = shippingOptions.filter(o => o.active);
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT }}>Informations de livraison</h2>
      </div>
      <div style={{ padding: '24px', paddingBottom: 0 }}>
        {/* ── Sélecteur d'option de livraison ── */}
        {activeOptions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: TXT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Mode de livraison</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeOptions.map(opt => {
                const isSelected = selectedShipping?.id === opt.id;
                const isFree = opt.freeFrom > 0;
                return (
                  <label key={opt.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `2px solid ${isSelected ? GOLD : BORDER}`, borderRadius: '6px', cursor: 'pointer', background: isSelected ? '#FFFBF4' : 'white', transition: 'all 0.15s' }}>
                    <input type="radio" name="shipping" value={opt.id} checked={isSelected} onChange={() => setSelectedShipping(opt)} style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} />
                    {/* Radio */}
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${isSelected ? GOLD : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD }} />}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: TXT, marginBottom: '2px' }}>{opt.label}</p>
                      {opt.description && <p style={{ fontSize: '12px', color: TXT2 }}>{opt.description}</p>}
                      {isFree && <p style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>Gratuite dès {formatPrice(opt.freeFrom)}</p>}
                    </div>
                    {/* Coût */}
                    <span style={{ fontSize: '14px', fontWeight: 700, color: opt.cost === 0 ? '#16A34A' : TXT, flexShrink: 0 }}>
                      {opt.cost === 0 ? 'Gratuit' : formatPrice(opt.cost)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleDeliverySubmit} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="checkout-form-2col" style={{ gap: '16px' }}>
          {([
            { label: 'Prénom *', field: 'firstName' as const, type: 'text' },
            { label: 'Nom *',    field: 'lastName'  as const, type: 'text' },
          ] as const).map(f => (
            <div key={f.field}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: TXT2, marginBottom: '6px' }}>{f.label}</label>
              <input required type={f.type} value={delivery[f.field]} onChange={e => setDelivery(d => ({ ...d, [f.field]: e.target.value }))}
                style={inputSt} onFocus={e => (e.target.style.borderColor = GOLD)} onBlur={e => (e.target.style.borderColor = BORDER)} />
            </div>
          ))}
        </div>
        {([
          { label: 'Email *',     field: 'email'   as const, type: 'email' },
          { label: 'Téléphone *', field: 'phone'   as const, type: 'tel', placeholder: '+225 07 00 00 00 00' },
          { label: 'Adresse *',   field: 'address' as const, type: 'text' },
        ] as const).map(f => (
          <div key={f.field}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: TXT2, marginBottom: '6px' }}>{f.label}</label>
            <input required type={f.type} value={delivery[f.field]} onChange={e => setDelivery(d => ({ ...d, [f.field]: e.target.value }))}
              placeholder={'placeholder' in f ? f.placeholder : ''} style={inputSt}
              onFocus={e => (e.target.style.borderColor = GOLD)} onBlur={e => (e.target.style.borderColor = BORDER)} />
          </div>
        ))}
        <div className="checkout-form-2col" style={{ gap: '16px' }}>
          <div>
            <label htmlFor="delivery-city" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: TXT2, marginBottom: '6px' }}>Ville *</label>
            <input id="delivery-city" required type="text" value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))}
              style={inputSt} onFocus={e => (e.target.style.borderColor = GOLD)} onBlur={e => (e.target.style.borderColor = BORDER)} />
          </div>
          <div>
            <label htmlFor="delivery-country" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: TXT2, marginBottom: '6px' }}>Pays *</label>
            <select id="delivery-country" required value={delivery.country} onChange={e => setDelivery(d => ({ ...d, country: e.target.value }))}
              style={{ ...inputSt, cursor: 'pointer' }}>
              {["Côte d'Ivoire", 'Sénégal', 'Mali', 'Guinée', 'Togo', 'Bénin', 'Burkina Faso', 'Cameroun', 'France', 'Belgique'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type="button" onClick={() => setStep('cart')}
            style={{ padding: '12px 24px', border: `1px solid ${BORDER}`, background: 'white', color: TXT2, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
            ← Retour
          </button>
          <button type="submit"
            style={{ flex: 1, padding: '14px', background: GOLD, color: 'white', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
            Continuer — Paiement →
          </button>
        </div>
      </form>
    </div>
  );
}


function PaymentStep({ paymentMethod, setPaymentMethod, mobileNumber, setMobileNumber, handlePlaceOrder, processing, setStep, isMobile }: PaymentStepProps) {
  return (
    <form onSubmit={handlePlaceOrder}>
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TXT }}>Choisissez votre mode de paiement</h2>
        </div>

        {/* Mobile money rows */}
        <div>
          {MOBILE_METHODS.map((pm, i) => (
            <div key={pm.id}>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', cursor: 'pointer',
                  background: paymentMethod === pm.id ? BG_ROW : 'white',
                  borderLeft: `3px solid ${paymentMethod === pm.id ? GOLD : 'transparent'}`,
                  transition: 'all 0.15s' }}
              >
                <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} />
                {/* Radio */}
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${paymentMethod === pm.id ? GOLD : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}>
                  {paymentMethod === pm.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD }} />}
                </div>
                {/* Logo */}
                <div style={{ flexShrink: 0 }}>{pm.logo}</div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: TXT, marginBottom: '2px' }}>{pm.label}</p>
                  <p style={{ fontSize: '12px', color: TXT2 }}>{pm.desc}</p>
                </div>
                {/* Recommandé badge */}
                {pm.badge && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#DCFCE7', color: '#16A34A', flexShrink: 0 }}>
                    {pm.badge}
                  </span>
                )}
              </label>
              {/* Phone input for selected mobile method */}
              {paymentMethod === pm.id && (
                <div style={{ padding: '0 24px 16px', paddingLeft: '83px', background: BG_ROW, borderLeft: `3px solid ${GOLD}` }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: TXT2, marginBottom: '6px' }}>
                    Numéro {pm.label} *
                  </label>
                  <input required type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    style={{ ...inputSt, maxWidth: '260px' }}
                    onFocus={e => (e.target.style.borderColor = GOLD)} onBlur={e => (e.target.style.borderColor = BORDER)} />
                  <p style={{ fontSize: '11px', color: TXT3, marginTop: '5px' }}>Vous recevrez une demande de confirmation sur ce numéro.</p>
                </div>
              )}
              {i < MOBILE_METHODS.length - 1 && <div style={{ height: '1px', background: '#F0E8E0', margin: '0 24px' }} />}
            </div>
          ))}

        </div>

        {/* Security message */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TXT3} strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: '12px', color: TXT3 }}>Vos informations de paiement sont 100% sécurisées et cryptées.</span>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => setStep('delivery')}
            style={{ padding: '12px 24px', border: `1px solid ${BORDER}`, background: 'white', color: TXT2, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Retour
          </button>
          <button type="submit" disabled={processing || (isMobile && !mobileNumber.trim())}
            style={{ flex: 1, padding: '14px', background: GOLD, color: 'white', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: (processing || (isMobile && !mobileNumber.trim())) ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: processing ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {processing ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Traitement...
              </>
            ) : 'Payer maintenant →'}
          </button>
        </div>
      </div>
    </form>
  );
}


export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', country: "Côte d'Ivoire",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [mobileNumber, setMobileNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [shippingCfg, setShippingCfg] = useState<ShippingConfig>(DEFAULT_SITE_CONFIG.shipping);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(
    DEFAULT_SITE_CONFIG.shipping.options.find(o => o.active) ?? null
  );
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: PromoCode; discount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  useEffect(() => {
    fetchSiteConfigSection('shipping').then(cfg => {
      setShippingCfg(cfg);
      const first = (cfg.options ?? []).find((o: ShippingOption) => o.active);
      if (first) setSelectedShipping(first);
    }).catch(() => {});
    fetchSiteConfigSection('promo_codes').then(setPromoCodes).catch(() => {});
  }, []);

  // Re-valider la promo si le sous-total ou la liste change
  useEffect(() => {
    if (!appliedPromo) return;
    const r = applyPromoCode(totalPrice, appliedPromo.code.code, promoCodes);
    if (r.isValid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (r.discount !== appliedPromo.discount) setAppliedPromo({ code: appliedPromo.code, discount: r.discount });
    } else {
      setAppliedPromo(null);
      setPromoError(r.error ?? 'Code invalide');
    }
  }, [totalPrice, promoCodes, appliedPromo]);

  const handleApplyPromo = () => {
    setPromoError(null);
    const r = applyPromoCode(totalPrice, promoInput, promoCodes);
    if (r.isValid) {
      const codeObj = promoCodes.find(p => p.code.toUpperCase() === promoInput.toUpperCase());
      if (codeObj) setAppliedPromo({ code: codeObj, discount: r.discount });
      setPromoInput('');
    } else {
      setAppliedPromo(null);
      setPromoError(r.error ?? 'Code invalide');
    }
  };
  const removePromo = () => { setAppliedPromo(null); setPromoError(null); };

  const discount = appliedPromo?.discount ?? 0;
  let shippingCost: number;
  if (!selectedShipping) {
    shippingCost = 0;
  } else if (selectedShipping.freeFrom > 0 && totalPrice >= selectedShipping.freeFrom) {
    shippingCost = 0;
  } else {
    shippingCost = selectedShipping.cost;
  }
  const total = Math.max(0, totalPrice + shippingCost - discount);
  const stepIdx = STEP_ORDER.indexOf(step);
  const isMobile = ['orange_money', 'wave', 'mtn_momo', 'moov_money'].includes(paymentMethod);

  const handleDeliverySubmit = (e: React.SyntheticEvent) => { e.preventDefault(); setStep('payment'); };

  const handlePlaceOrder = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setProcessing(true);

    const num = generateOrderNumber();
    const orderData = {
      orderNumber: num, date: new Date().toISOString(), items: [...items],
      subtotal: totalPrice, shippingCost, total, delivery, paymentMethod,
      status: 'confirmed' as const,
    };

    // 1. Sauvegarde locale + DB (payment_status par défaut = 'pending')
    saveOrder(orderData);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await saveOrderToDB(orderData, user?.id ?? undefined);

    // 1.b — Email de confirmation (fire & forget, no-op si Resend non configuré)
    fetch('/api/orders/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    }).catch(() => {});

    // 2. Mobile money → Jeko Africa (redirect hosted checkout)
    if (isMobile) {
      try {
        const res = await fetch('/api/jeko-pay/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber:   num,
            amountXof:     total,
            paymentMethod,                 // 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money'
            payerPhone:    mobileNumber.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.redirectUrl) {
          alert('Le paiement n\'a pas pu être initié. Veuillez réessayer.');
          setProcessing(false);
          return;
        }
        clearCart();
        // Redirection vers le checkout hébergé Jeko
        globalThis.window.location.href = data.redirectUrl as string;
        return;
      } catch {
        alert('Erreur réseau lors de l\'initialisation du paiement.');
        setProcessing(false);
        return;
      }
    }

    setProcessing(false);
  };


  return (
    <div style={{ background: '#F8F4EF', minHeight: '100vh' }}>

      {/* ── Stepper header ── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${BORDER}`, padding: '24px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TXT, textAlign: 'center', marginBottom: '24px' }}>
            Procédure de paiement
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {STEPS.map((s, i) => {
              const idx = STEP_ORDER.indexOf(s.key as CheckoutStep);
              const isActive = step === s.key;
              const isDone = stepIdx > idx;
              let labelColor: string;
              if (isActive) { labelColor = GOLD; } else if (isDone) { labelColor = TXT; } else { labelColor = TXT3; }
              return (
                <React.Fragment key={s.key}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '88px', maxWidth: '100px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isActive || isDone ? GOLD : '#EDE5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isActive || isDone ? 'white' : TXT3 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: labelColor, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                    <span style={{ fontSize: '10px', color: TXT3, textAlign: 'center', lineHeight: 1.2 }}>{s.sub}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ height: '2px', width: '52px', background: stepIdx > i ? GOLD : '#EDE5DC', marginTop: '17px', flexShrink: 0, transition: 'background 0.3s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: step content */}
          <div className="lg:col-span-2">
            {step === 'cart'     && <CartStep onNext={() => setStep('delivery')} />}
            {step === 'delivery' && <DeliveryStep delivery={delivery} setDelivery={setDelivery} setStep={setStep} handleDeliverySubmit={handleDeliverySubmit} shippingOptions={shippingCfg.options ?? []} selectedShipping={selectedShipping} setSelectedShipping={setSelectedShipping} />}
            {step === 'payment'  && <PaymentStep paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} mobileNumber={mobileNumber} setMobileNumber={setMobileNumber} handlePlaceOrder={handlePlaceOrder} processing={processing} setStep={setStep} isMobile={isMobile} />}
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky" style={{ top: '24px' }}>
              <Sidebar items={items} totalPrice={totalPrice} shippingCost={shippingCost} discount={discount} total={total} step={step} setStep={setStep} appliedPromo={appliedPromo} promoInput={promoInput} setPromoInput={setPromoInput} promoError={promoError} setPromoError={setPromoError} handleApplyPromo={handleApplyPromo} removePromo={removePromo} />
            </div>
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div style={{ marginTop: '24px', background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { icon: '🎧', title: "Besoin d'aide ?",     sub: 'Notre service client est disponible 7j/7' },
              { icon: '🔒', title: 'Paiement sécurisé',   sub: 'Toutes vos transactions sont 100% sécurisées' },
              { icon: '🚚', title: 'Livraison rapide',     sub: "Partout en Côte d'Ivoire et à l'international" },
            ].map((t, i) => (
              <div key={t.title} className={`flex items-start gap-3 p-5${i > 0 ? ' sm:border-l' : ''}`} style={{ borderColor: BORDER }}>
                <span style={{ fontSize: '26px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: TXT, marginBottom: '3px' }}>{t.title}</p>
                  <p style={{ fontSize: '12px', color: TXT2, lineHeight: 1.4 }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .checkout-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) { .checkout-form-2col { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
