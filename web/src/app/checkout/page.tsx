'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/cart.store';
import { apiErrorMessage } from '@/shared/api';
import {
  commitOrder,
  fetchDeliveryMethods,
  putCheckoutContact,
  putCheckoutDelivery,
  putCheckoutPayment,
  startPayment,
  toLaravelGateway,
} from '@/shared/api/checkout';
import { PaymentMethod } from '@/shared/types/domain.type';
import { cacheOrder } from '@/features/orders/order.store';
import type { ShippingOption, PromoCode } from '@/features/site-config/site-config.type';
import { CheckoutStep, DeliveryInfo } from '@/features/checkout/checkout.type';
import { CHECKOUT_PALETTE } from '@/features/checkout/checkout.constant';

// Composants extraits (lazy)
import CartStep from '@/features/checkout/steps/cart.step';
const Sidebar      = lazy(() => import('@/features/checkout/sidebars/checkout.sidebar'));
const DeliveryStep = lazy(() => import('@/features/checkout/steps/delivery.step'));
const PaymentStep  = lazy(() => import('@/features/checkout/steps/payment.step'));

// ── Stepper config ────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'cart',         label: 'Panier',       sub: 'Vérification' },
  { key: 'delivery',     label: 'Informations', sub: 'Adresse & contact' },
  { key: 'payment',      label: 'Paiement',     sub: 'Mode de paiement' },
  { key: 'confirmation', label: 'Confirmation', sub: 'Commande validée' },
] as const;

const STEP_ORDER: CheckoutStep[] = ['cart', 'delivery', 'payment', 'confirmation'];


export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, discount, couponCode, applyCoupon, removeCoupon, refresh } = useCart();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', country: "Côte d'Ivoire",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ORANGE_MONEY);
  const [processing, setProcessing] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [activeMethods] = useState<PaymentMethod[]>(Object.values(PaymentMethod));

  useEffect(() => {
    fetchDeliveryMethods()
      .then((methods) => {
        setShippingOptions(methods);
        setSelectedShipping((current) => current ?? methods[0] ?? null);
      })
      .catch(() => setShippingOptions([]));
  }, []);

  const appliedPromo = couponCode
    ? { code: { code: couponCode, type: 'fixed' as const, value: discount, active: true } satisfies PromoCode, discount }
    : null;

  const applyPromo = (typedCode: string) => {
    setPromoError(null);
    applyCoupon(typedCode).catch((err) => {
      setPromoError(apiErrorMessage(err, 'Code invalide'));
    });
  };
  const removePromo = () => {
    setPromoError(null);
    void removeCoupon();
  };

  const shippingCost = selectedShipping?.cost ?? 0;
  const total = Math.max(0, totalPrice + shippingCost - discount);
  const stepIdx = STEP_ORDER.indexOf(step);

  const submitDelivery = (info: DeliveryInfo) => { setDelivery(info); setStep('payment'); };

  const placeOrder = async (_mobileNumber: string) => {
    if (!selectedShipping) {
      alert('Choisissez un mode de livraison.');
      return;
    }
    setProcessing(true);
    const gateway = toLaravelGateway(paymentMethod);
    try {
      await putCheckoutContact(delivery.email);
      await putCheckoutDelivery(delivery, Number(selectedShipping.id));
      await putCheckoutPayment(gateway);
      const placed = await commitOrder();
      cacheOrder({
        orderNumber: placed.orderNumber,
        date: placed.date,
        items: [...items],
        subtotal: totalPrice,
        shippingCost,
        total,
        delivery,
        paymentMethod,
        status: gateway === 'null' ? 'confirmed' : 'pending_payment',
        paymentStatus: gateway === 'null' ? 'pending' : 'pending',
        shippingOptionId: selectedShipping.id,
        promoCode: couponCode ?? undefined,
      });
      await refresh();

      if (gateway === 'null') {
        setProcessing(false);
        router.push(`/confirmation?ref=${encodeURIComponent(placed.orderNumber)}`);
        return;
      }

      const payment = await startPayment(placed.orderNumber);
      if (!payment.redirect_url) {
        throw new Error("Le paiement n'a pas pu être initié.");
      }
      globalThis.window.location.href = payment.redirect_url;
    } catch (err) {
      alert(apiErrorMessage(err, 'Erreur lors de la création de la commande. Veuillez réessayer.'));
      setProcessing(false);
    }
  };


  return (
    <div style={{ background: '#F8F4EF', minHeight: '100vh' }}>

      {/* ── Stepper header ── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${CHECKOUT_PALETTE.border}`, padding: '24px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: CHECKOUT_PALETTE.text, textAlign: 'center', marginBottom: '24px' }}>
            Procédure de paiement
          </p>
          <div className="checkout-stepper-row" style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            {STEPS.map((s, i) => {
              const idx = STEP_ORDER.indexOf(s.key as CheckoutStep);
              const active = step === s.key;
              const done = stepIdx > idx;
              let labelColor: string;
              if (active) { labelColor = CHECKOUT_PALETTE.accent; } else if (done) { labelColor = CHECKOUT_PALETTE.text; } else { labelColor = CHECKOUT_PALETTE.textSubtle; }
              return (
                <React.Fragment key={s.key}>
                  <div className="checkout-stepper-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                    <div className="checkout-stepper-circle" style={{ width: '36px', height: '36px', borderRadius: '50%', background: active || done ? CHECKOUT_PALETTE.accent : '#EDE5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: active || done ? 'white' : CHECKOUT_PALETTE.textSubtle }}>{i + 1}</span>
                    </div>
                    <span className="checkout-stepper-label" style={{ fontSize: '12px', fontWeight: active ? 700 : 500, color: labelColor, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                    <span className="checkout-stepper-sub" style={{ fontSize: '10px', color: CHECKOUT_PALETTE.textSubtle, textAlign: 'center', lineHeight: 1.2 }}>{s.sub}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="checkout-stepper-connector" style={{ height: '2px', flexBasis: '52px', maxWidth: '52px', background: stepIdx > i ? CHECKOUT_PALETTE.accent : '#EDE5DC', marginTop: '17px', flexShrink: 1, transition: 'background 0.3s' }} />
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
              {step === 'cart'     && <CartStep next={() => setStep('delivery')} />}
              {step === 'delivery' && <DeliveryStep initialDelivery={delivery} submitDelivery={submitDelivery} back={() => setStep('cart')} shippingOptions={shippingOptions} selectedShipping={selectedShipping} selectShipping={setSelectedShipping} />}
              {step === 'payment'  && <PaymentStep paymentMethod={paymentMethod} selectMethod={setPaymentMethod} placeOrder={placeOrder} processing={processing} back={() => setStep('delivery')} activeMethods={activeMethods} />}
            </Suspense>
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky" style={{ top: '24px' }}>
              <Suspense fallback={null}>
                <Sidebar items={items} totalPrice={totalPrice} shippingCost={shippingCost} discount={discount} total={total} step={step} editCart={() => setStep('cart')} appliedPromo={appliedPromo} promoError={promoError} applyPromo={applyPromo} dismissPromoError={() => setPromoError(null)} removePromo={removePromo} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div style={{ marginTop: '24px', background: 'white', border: `1px solid ${CHECKOUT_PALETTE.border}`, borderRadius: '8px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { icon: '🎧', title: "Besoin d'aide ?",     sub: 'Notre service client est disponible 7j/7' },
              { icon: '🔒', title: 'Paiement sécurisé',   sub: 'Toutes vos transactions sont 100% sécurisées' },
              { icon: '🚚', title: 'Livraison rapide',     sub: "Partout en Côte d'Ivoire et à l'international" },
            ].map((t, i) => (
              <div key={t.title} className={`flex items-start gap-3 p-5${i > 0 ? ' sm:border-l' : ''}`} style={{ borderColor: CHECKOUT_PALETTE.border }}>
                <span style={{ fontSize: '26px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: CHECKOUT_PALETTE.text, marginBottom: '3px' }}>{t.title}</p>
                  <p style={{ fontSize: '12px', color: CHECKOUT_PALETTE.textMuted, lineHeight: 1.4 }}>{t.sub}</p>
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
