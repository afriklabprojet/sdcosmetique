'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { PaymentMethod } from '@/types';
import { saveOrder, generateOrderNumber, type OrderDraft } from '@/lib/orders';
import { DEFAULT_SITE_CONFIG, fetchSiteConfigSection, ShippingOption, ShippingConfig, PromoCode, applyPromoCode } from '@/lib/site-config';
import { CheckoutStep, DeliveryInfo, GOLD, BORDER, TXT, TXT2, TXT3 } from '@/components/checkout/shared';

// Composants extraits (lazy)
import CartStep from '@/components/checkout/CartStep';
const Sidebar      = lazy(() => import('@/components/checkout/Sidebar'));
const DeliveryStep = lazy(() => import('@/components/checkout/DeliveryStep'));
const PaymentStep  = lazy(() => import('@/components/checkout/PaymentStep'));

// ── Stepper config ────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'cart',         label: 'Panier',       sub: 'Vérification' },
  { key: 'delivery',     label: 'Informations', sub: 'Adresse & contact' },
  { key: 'payment',      label: 'Paiement',     sub: 'Mode de paiement' },
  { key: 'confirmation', label: 'Confirmation', sub: 'Commande validée' },
] as const;

const STEP_ORDER: CheckoutStep[] = ['cart', 'delivery', 'payment', 'confirmation'];


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
  const [activeMethods, setActiveMethods] = useState<string[]>(['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'cash_on_delivery']);
  useEffect(() => {
    fetchSiteConfigSection('shipping').then(cfg => {
      setShippingCfg(cfg);
      const first = (cfg.options ?? []).find((o: ShippingOption) => o.active);
      if (first) setSelectedShipping(first);
    }).catch(() => {});
    fetchSiteConfigSection('promo_codes').then(setPromoCodes).catch(() => {});
    fetch('/api/config/payment_methods_active')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setActiveMethods(data.value);
        }
      })
      .catch(() => {});
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
  const isMobile = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo'].includes(paymentMethod);

  const handleDeliverySubmit = (e: React.SyntheticEvent) => { e.preventDefault(); setStep('payment'); };

  const handlePlaceOrder = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setProcessing(true);

    const num = generateOrderNumber();
    const orderData = {
      orderNumber: num, date: new Date().toISOString(), items: [...items],
      subtotal: totalPrice, shippingCost, total, delivery, paymentMethod,
      // Mobile money → en attente de confirmation Jeko ; COD → confirmé d'office
      status: (isMobile ? 'pending_payment' : 'confirmed') as OrderDraft['status'],
    };

        // 1. Création de la commande côté serveur — unique source de vérité [ARCH-01/02]
    const createRes = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    }).catch(() => null);

    if (!createRes?.ok) {
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
      setProcessing(false);
      return;
    }

    // 1.b — Sauvegarder localement pour affichage sur /confirmation (lecture client uniquement)
    saveOrder(orderData);

    // 1.c — Email de confirmation (fire & forget, no-op si Resend non configuré)
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
            paymentMethod,                 // 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money' | 'djamo'
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
          <div className="checkout-stepper-row" style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            {STEPS.map((s, i) => {
              const idx = STEP_ORDER.indexOf(s.key as CheckoutStep);
              const isActive = step === s.key;
              const isDone = stepIdx > idx;
              let labelColor: string;
              if (isActive) { labelColor = GOLD; } else if (isDone) { labelColor = TXT; } else { labelColor = TXT3; }
              return (
                <React.Fragment key={s.key}>
                  <div className="checkout-stepper-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                    <div className="checkout-stepper-circle" style={{ width: '36px', height: '36px', borderRadius: '50%', background: isActive || isDone ? GOLD : '#EDE5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isActive || isDone ? 'white' : TXT3 }}>{i + 1}</span>
                    </div>
                    <span className="checkout-stepper-label" style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: labelColor, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                    <span className="checkout-stepper-sub" style={{ fontSize: '10px', color: TXT3, textAlign: 'center', lineHeight: 1.2 }}>{s.sub}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="checkout-stepper-connector" style={{ height: '2px', flexBasis: '52px', maxWidth: '52px', background: stepIdx > i ? GOLD : '#EDE5DC', marginTop: '17px', flexShrink: 1, transition: 'background 0.3s' }} />
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
            <Suspense fallback={null}>
              {step === 'cart'     && <CartStep onNext={() => setStep('delivery')} />}
              {step === 'delivery' && <DeliveryStep delivery={delivery} setDelivery={setDelivery} setStep={setStep} handleDeliverySubmit={handleDeliverySubmit} shippingOptions={shippingCfg.options ?? []} selectedShipping={selectedShipping} setSelectedShipping={setSelectedShipping} />}
              {step === 'payment'  && <PaymentStep paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} mobileNumber={mobileNumber} setMobileNumber={setMobileNumber} handlePlaceOrder={handlePlaceOrder} processing={processing} setStep={setStep} isMobile={isMobile} activeMethods={activeMethods} />}
            </Suspense>
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky" style={{ top: '24px' }}>
              <Suspense fallback={null}>
                <Sidebar items={items} totalPrice={totalPrice} shippingCost={shippingCost} discount={discount} total={total} step={step} setStep={setStep} appliedPromo={appliedPromo} promoInput={promoInput} setPromoInput={setPromoInput} promoError={promoError} setPromoError={setPromoError} handleApplyPromo={handleApplyPromo} removePromo={removePromo} />
              </Suspense>
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

        /* 2-col form grid */
        .checkout-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) { .checkout-form-2col { grid-template-columns: 1fr !important; } }

        /* Cart step layout – stacks on mobile */
        .checkout-cart-layout { display: flex; gap: 24px; }
        .checkout-cart-sidebar { width: 320px; flex-shrink: 0; }
        @media (max-width: 768px) {
          .checkout-cart-layout { flex-direction: column; }
          .checkout-cart-sidebar { width: 100%; }
        }

        /* Responsive stepper */
        .checkout-stepper-row { width: 100%; }
        @media (max-width: 600px) {
          .checkout-stepper-step { gap: 4px !important; }
          .checkout-stepper-connector { flex-basis: 12px !important; max-width: 12px !important; }
          .checkout-stepper-circle { width: 26px !important; height: 26px !important; }
          .checkout-stepper-sub { display: none !important; }
          .checkout-stepper-label { font-size: 9px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; }
        }

        /* Payment phone input indent */
        .checkout-phone-panel { padding: 0 24px 16px; padding-left: 83px; }
        @media (max-width: 600px) {
          .checkout-phone-panel { padding: 0 16px 16px !important; }
        }

        /* Hide payment badge on small screens */
        @media (max-width: 480px) {
          .checkout-payment-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}
