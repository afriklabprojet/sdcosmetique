'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLastOrder, formatOrderDate, OrderDraft } from '@/lib/orders';
import { formatPrice } from '@/lib/products';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';

// ── Coordonnées de contact (centralisées dans le config) ──────────────────────
const CONTACT_PHONE = DEFAULT_SITE_CONFIG.legal_contact.contactPhone ?? '';   // '+225 07 49 49 49 49'
const CONTACT_PHONE_TEL = CONTACT_PHONE.replaceAll(/\s/g, '');          // 'tel:+2250749494949'
const CONTACT_EMAIL = DEFAULT_SITE_CONFIG.legal_contact.contactEmail;   // 'contact@sdcosmetique.ci'
const CONTACT_WA    = `https://wa.me/${CONTACT_PHONE_TEL.replaceAll('+', '')}`;  


// ── Palette ───────────────────────────────────────────────────────────────────
const DARK   = '#3D1400';
const GOLD   = '#8F5922';
const BORDER = '#EDE8E0';
const TXT    = '#1A1A1A';
const TXT2   = '#9A8A7A';
const TXT3   = '#7A6A5A';
const BG     = '#F8F4EF';

// ── Step icons ────────────────────────────────────────────────────────────────
const IconClipboard = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);
const IconBox = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);
const IconTruck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconHome = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const NEXT_STEPS = [
  { id: 1, label: 'Confirmation', desc: 'Nous avons bien reçu votre commande.',        Icon: IconClipboard, active: true  },
  { id: 2, label: 'Préparation',  desc: 'Votre commande est en cours de préparation.', Icon: IconBox,       active: false },
  { id: 3, label: 'Expédition',   desc: 'Votre commande sera expédiée très bientôt.', Icon: IconTruck,     active: false },
  { id: 4, label: 'Livraison',    desc: "Vous serez livré à l'adresse indiquée.",       Icon: IconHome,      active: false },
];

// ── Sparkle positions ─────────────────────────────────────────────────────────
const SPARKLES = [
  { top: '7%',  left: '3%',  size: 10, rot: 15,  op: 0.5  },
  { top: '3%',  left: '17%', size: 7,  rot: -20, op: 0.35 },
  { top: '13%', left: '29%', size: 9,  rot: 40,  op: 0.45 },
  { top: '5%',  left: '53%', size: 8,  rot: -10, op: 0.4  },
  { top: '9%',  left: '69%', size: 7,  rot: 25,  op: 0.35 },
  { top: '2%',  left: '83%', size: 10, rot: -35, op: 0.45 },
  { top: '19%', left: '93%', size: 6,  rot: 55,  op: 0.3  },
  { top: '17%', left: '8%',  size: 6,  rot: -45, op: 0.3  },
  { top: '27%', left: '41%', size: 8,  rot: 30,  op: 0.35 },
  { top: '1%',  left: '63%', size: 6,  rot: -55, op: 0.25 },
];

export default function ConfirmationPage() {
  const router = useRouter();
  const [order] = useState<OrderDraft | null>(() => getLastOrder());

  // SEC-04 : si aucune commande en localStorage, l'utilisateur n'arrive pas du checkout
  // → rediriger vers la boutique pour éviter l'affichage d'une fausse "confirmation"
  useEffect(() => {
    if (order === null) {
      router.replace('/boutique');
    }
  }, [order, router]);

  const orderDate = order
    ? formatOrderDate(order.date)
    : new Date().toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

  const customerEmail = order?.delivery?.email ?? '';

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════ LEFT (2 cols) ═══════════ */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* ── Confirmation hero card ── */}
            <div style={{
              background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px',
              padding: '48px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              {/* Sparkles */}
              {SPARKLES.map((s, i) => (
                <span key={`${s.top}-${s.left}`} aria-hidden="true" style={{
                  position: 'absolute', top: s.top, left: s.left,
                  fontSize: s.size, lineHeight: 1, opacity: s.op,
                  transform: `rotate(${s.rot}deg)`, pointerEvents: 'none',
                  color: i % 2 === 0 ? GOLD : '#C8974A',
                }}>✦</span>
              ))}

              {/* Green checkmark circle */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#F0FDF4', border: '3px solid #22C55E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 800, color: TXT, fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
                Commande confirmée&nbsp;!
              </h1>
              <p style={{ fontSize: '16px', fontStyle: 'italic', color: GOLD, fontFamily: 'Georgia, serif', marginBottom: '18px' }}>
                Merci pour votre confiance.
              </p>
              <p style={{ fontSize: '14px', color: TXT3, lineHeight: 1.65, maxWidth: '440px', margin: '0 auto 28px' }}>
                Votre commande a été passée avec succès et est en cours de traitement.
                Vous recevrez bientôt un e-mail de confirmation avec tous les détails.
              </p>

              {/* 2-column info box */}
              <div style={{
                display: 'inline-flex', border: `1px solid ${BORDER}`,
                borderRadius: '6px', overflow: 'hidden', marginBottom: '28px', textAlign: 'left',
              }}>
                {/* Order number */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TXT2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1"/>
                    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TXT2, marginBottom: '4px' }}>
                      Numéro de commande
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: DARK }}>
                      {order?.orderNumber ?? '—'}
                    </p>
                  </div>
                </div>
                <div style={{ width: '1px', background: BORDER }} />
                {/* Order date */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TXT2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TXT2, marginBottom: '4px' }}>
                      Date de commande
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: TXT }}>{orderDate}</p>
                  </div>
                </div>
              </div>

              {/* CTA: track order */}
              <div style={{ marginBottom: '20px' }}>
                <Link href="/compte">
                  <button style={{
                    padding: '14px 40px', background: DARK, color: 'white', border: 'none',
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: '3px',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                  }}>
                    Suivre ma commande
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </Link>
              </div>

              {/* Email confirmation line */}
              {customerEmail && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TXT2} strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p style={{ fontSize: '13px', color: TXT3 }}>
                    Un e-mail de confirmation a été envoyé à{' '}
                    <strong style={{ color: TXT }}>{customerEmail}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* ── Next steps card ── */}
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '32px 32px 36px' }}>
              <h2 style={{
                fontSize: '12px', fontWeight: 800, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: DARK, textAlign: 'center', marginBottom: '32px',
              }}>
                Quelles sont les prochaines étapes&nbsp;?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
                {/* Dashed connectors */}
                {[0, 1, 2].map(i => (
                  <div key={i} aria-hidden="true" style={{
                    position: 'absolute', top: '24px',
                    left: `calc(${(i + 1) * 25}% - 8px)`,
                    width: 'calc(25% - 16px)', height: '1px',
                    borderTop: `2px dashed ${BORDER}`, zIndex: 0,
                  }} />
                ))}

                {NEXT_STEPS.map(s => (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: s.active ? '#FDF4E8' : '#FAF8F5',
                      border: `1px solid ${s.active ? '#D4A25A' : BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px', flexShrink: 0,
                    }}>
                      <s.Icon />
                    </div>
                    {/* Number badge */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: s.active ? DARK : '#EDE8E0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: s.active ? 'white' : TXT2 }}>{s.id}</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: s.active ? DARK : TXT, textAlign: 'center', marginBottom: '5px', lineHeight: 1.3 }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: '11px', color: TXT2, textAlign: 'center', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Back to home button ── */}
            <Link href="/" style={{ display: 'block' }}>
              <button style={{
                width: '100%', padding: '16px', background: DARK, color: 'white',
                border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Retourner à l&apos;accueil
              </button>
            </Link>
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* ── Order summary ── */}
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
                          <p style={{ fontSize: '13px', fontWeight: 600, color: TXT, lineHeight: 1.3, marginBottom: '3px' }}>
                            {item.product.name}
                          </p>
                          {item.product.skinTones?.[0] && (
                            <p style={{ fontSize: '11px', color: TXT2 }}>Teint {item.product.skinTones[0]}</p>
                          )}
                          <p style={{ fontSize: '11px', color: TXT2 }}>Quantité : {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: TXT, flexShrink: 0 }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TXT2 }}>
                      <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TXT2 }}>
                      <span>Livraison</span>
                      <span style={{ color: order.shippingCost === 0 ? '#16A34A' : TXT }}>
                        {order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      paddingTop: '10px', borderTop: `1px solid ${BORDER}`, marginTop: '2px',
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: TXT, fontFamily: 'Georgia, serif' }}>TOTAL</span>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: TXT, fontFamily: 'Georgia, serif' }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ padding: '20px', fontSize: '13px', color: TXT2, textAlign: 'center' }}>
                  Votre commande a été passée avec succès.
                </p>
              )}
            </div>

            {/* ── Help ── */}
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: DARK, marginBottom: '8px' }}>
                Besoin d&apos;aide ?
              </p>
              <p style={{ fontSize: '12px', color: TXT3, marginBottom: '16px', lineHeight: 1.5 }}>
                Notre équipe est disponible pour vous accompagner.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href={`tel:${CONTACT_PHONE_TEL}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#FAF8F5', border: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.55 5.55l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 21 16.92z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: TXT }}>{CONTACT_PHONE}</span>
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#FAF8F5', border: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: TXT }}>{CONTACT_EMAIL}</span>
                </a>
                <a href={CONTACT_WA} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#FAF8F5', border: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ── Review CTA ── */}
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: DARK, marginBottom: '6px' }}>
                Partagez votre expérience
              </p>
              <p style={{ fontSize: '12px', color: TXT3, marginBottom: '16px', lineHeight: 1.5 }}>
                Donnez votre avis et gagnez des points fidélité&nbsp;!
              </p>
              <Link href="/avis">
                <button style={{
                  width: '100%', padding: '12px', background: DARK, color: 'white', border: 'none',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: '3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFCC00" stroke="#FFCC00" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Donner mon avis
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
