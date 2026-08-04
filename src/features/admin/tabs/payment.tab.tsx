'use client';

/* Onglet «paiement» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import ImageUpload from '@/shared/ui/image.input';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, GOLD, GOLD2, S_SAVE_BG, S_SAVE_T, GOLD_D3 } from '@/features/admin/admin.constant';

interface PaymentTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
}

export default function PaymentTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved }: PaymentTabProps) {
            const ALL_METHODS = [
              { id: 'orange_money',   label: 'Orange Money',      emoji: '🟠', color: '#FF6600', desc: "Orange Money Côte d'Ivoire" },
              { id: 'wave',           label: 'Wave',              emoji: '🔵', color: '#009EE3', desc: 'Wave Mobile Money' },
              { id: 'mtn_momo',       label: 'MTN MoMo',          emoji: '🟡', color: '#FFCC00', desc: 'MTN Mobile Money' },
              { id: 'moov_money',     label: 'Moov Money',        emoji: '🔷', color: '#003087', desc: 'Moov Africa' },
              { id: 'djamo',          label: 'Djamo',             emoji: '🟣', color: '#4C35A8', desc: 'Carte virtuelle Djamo' },
              { id: 'visa_mastercard',label: 'Visa / Mastercard', emoji: '💳', color: '#1A1F71', desc: 'Carte bancaire internationale' },
              { id: 'cash_on_delivery', label: 'Paiement à la livraison', emoji: '💵', color: '#10B981', desc: 'Paiement en espèces à la réception' },
            ];
            const active: string[] = (siteContent as Record<string, unknown>).payment_methods_active
              ? ((siteContent as Record<string, unknown>).payment_methods_active as string[])
              : ALL_METHODS.map(m => m.id);

            const paymentImages: Record<string, string> = (siteContent as Record<string, unknown>).payment_images
              ? ((siteContent as Record<string, unknown>).payment_images as Record<string, string>)
              : {};

            const toggle = (id: string) => {
              const next = active.includes(id) ? active.filter(x => x !== id) : [...active, id];
              setSiteContent((c: SiteConfig) => ({ ...c, payment_methods_active: next } as SiteConfig));
            };

            const setPaymentImage = (id: string, url: string) => {
              const next = { ...paymentImages, [id]: url };
              setSiteContent((c: SiteConfig) => ({ ...c, payment_images: next } as SiteConfig));
            };

            const saveAll = async () => {
              await saveConfigSection('payment_methods_active', active);
              await saveConfigSection('payment_images', paymentImages);
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: GOLD, margin: '0 0 4px' }}>💳 Moyens de Paiement</h2>
                  <p style={{ color: '#8B7355', fontSize: '13px', margin: 0 }}>Activez/désactivez les logos et uploadez une image réelle pour chaque moyen de paiement.</p>
                </div>

                <div style={{ background: SURFACE, borderRadius: '14px', border: `1px solid ${GOLD_D3}`, overflow: 'hidden' }}>
                  {ALL_METHODS.map((m, i) => {
                    const enabled = active.includes(m.id);
                    const imgUrl = paymentImages[m.id] ?? '';
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px', borderBottom: i < ALL_METHODS.length - 1 ? `1px solid ${GOLD_D3}` : 'none', flexWrap: 'wrap' }}>
                        {/* Toggle + infos */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 220px' }}>
                          <span style={{ fontSize: '28px', flexShrink: 0 }}>{m.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#F7EFE5' }}>{m.label}</div>
                            <div style={{ fontSize: '12px', color: '#8B7355' }}>{m.desc}</div>
                          </div>
                          <button
                            onClick={() => toggle(m.id)}
                            style={{ width: '50px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: enabled ? GOLD : '#3A2E20', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
                            title={enabled ? 'Désactiver' : 'Activer'}
                          >
                            <span style={{ position: 'absolute', top: '3px', left: enabled ? '26px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: enabled ? '#1A1410' : '#8B7355', transition: 'left .2s' }} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: enabled ? '#10B981' : '#8B7355', width: '60px', textAlign: 'right', flexShrink: 0 }}>{enabled ? '✓ Actif' : '✗ Masqué'}</span>
                        </div>
                        {/* Upload image */}
                        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {imgUrl && (
                            <div style={{ background: '#1A1410', borderRadius: '8px', padding: '6px', border: `1px solid ${GOLD_D3}`, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '44px', overflow: 'hidden' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt={m.label} width={72} height={36} style={{ maxHeight: '36px', maxWidth: '72px', objectFit: 'contain' }} />
                            </div>
                          )}
                          <div style={{ minWidth: '160px' }}>
                            <ImageUpload
                              value={imgUrl}
                              selectImage={(url) => setPaymentImage(m.id, url)}
                              folder="payments"
                              label={imgUrl ? '📷 Changer' : '📷 Ajouter logo'}
                              previewSize={0}
                            />
                          </div>
                          {imgUrl && (
                            <button
                              onClick={() => setPaymentImage(m.id, '')}
                              title="Supprimer l'image"
                              style={{ background: 'transparent', border: 'none', color: '#8B7355', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                            >✕</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Aperçu */}
                <div style={{ background: 'rgba(212,162,90,0.06)', borderRadius: '12px', border: `1px solid ${GOLD_D3}`, padding: '16px 20px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#C4A574', fontWeight: 600 }}>Aperçu — bande de paiement</p>
                  <div style={{ background: '#3D1A06', borderRadius: '10px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                    {active.length === 0 && <span style={{ fontSize: '12px', color: '#8B7355', fontStyle: 'italic' }}>Aucun moyen de paiement actif</span>}
                    {active.map(id => {
                      const m = ALL_METHODS.find(x => x.id === id);
                      if (!m) return null;
                      const img = paymentImages[id];
                      return img
                        ? (
                          <div key={id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', height: '44px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={m.label} width={80} height={32} style={{ maxHeight: '32px', maxWidth: '80px', objectFit: 'contain' }} />
                          </div>
                        )
                        : <span key={id} style={{ background: m.color, color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{m.emoji} {m.label}</span>;
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)', padding: '12px 16px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#93C5FD' }}>💡 <strong>Conseil :</strong> Uploadez des logos PNG fond transparent (format recommandé : 200×80px). Les logos sans image utilisent un affichage coloré de secours.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={saveAll}
                    disabled={contentSaving.payment_methods_active}
                    style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: contentSaved.payment_methods_active ? S_SAVE_BG : GOLD2, color: contentSaved.payment_methods_active ? S_SAVE_T : BG, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {getSaveButtonText(contentSaved.payment_methods_active, contentSaving.payment_methods_active)}
                  </button>
                </div>
              </div>
            );
}
