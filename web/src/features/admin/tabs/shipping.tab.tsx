'use client';

/* Onglet «livraison» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React, { useEffect, useState } from 'react';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { formatPrice } from '@/features/catalog/product.query';
import { deleteAdminDeliveryMethod, fetchAdminDeliveryMethods, saveAdminDeliveryMethod } from '@/shared/api/admin';
import { type ShippingOption, type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, BORDER, GOLD, TEXT, TEXT2, TEXT3, TITLE, GOLD2, S_OK_BG, S_OK_T, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface ShippingTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
}

export default function ShippingTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved }: ShippingTabProps) {
            const s = siteContent.shipping;
            const [opts, setOpts] = useState<ShippingOption[]>([]);
            useEffect(() => {
              fetchAdminDeliveryMethods().then(setOpts).catch(() => setOpts([]));
            }, []);
            const save = async () => {
              for (const opt of opts) {
                await saveAdminDeliveryMethod(opt, opt.id.startsWith('opt-'));
              }
              setOpts(await fetchAdminDeliveryMethods());
              await saveConfigSection('shipping', { ...siteContent.shipping, options: opts });
            };
            const addOpt = () => {
              const newOpt: ShippingOption = { 
                id: `opt-${Date.now()}`, 
                label: 'Nouvelle option', 
                description: '', 
                cost: 0, 
                freeFrom: 0, 
                active: true,
              };
              setOpts((current) => [...current, newOpt]);
            };
            const updateOpt = (id: string, patch: Partial<ShippingOption>) => {
              setOpts((current) => current.map((o) => o.id === id ? { ...o, ...patch } : o));
            };
            const removeOpt = (id: string) => {
              if (!id.startsWith('opt-')) {
                void deleteAdminDeliveryMethod(id);
              }
              setOpts((current) => current.filter((o) => o.id !== id));
            };
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>Options de livraison</h1>
                  <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>Configurez les modes de livraison proposés au checkout. Le client choisira parmi les options actives.</p>
                </div>

                {/* Liste des options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {opts.map((opt, idx) => (
                    <div key={opt.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Header option */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Option #{idx + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Toggle active */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={opt.active}
                            onClick={() => updateOpt(opt.id, { active: !opt.active })}
                            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); updateOpt(opt.id, { active: !opt.active }); } }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: opt.active ? S_OK_T : TEXT3, background: 'none', border: 'none', padding: 0 }}>
                            <div style={{ width: '34px', height: '18px', borderRadius: '99px', background: opt.active ? S_OK_BG : BORDER, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                              <div style={{ position: 'absolute', top: '2px', left: opt.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: opt.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                            </div>
                            {opt.active ? 'Active' : 'Inactive'}
                          </button>
                          {/* Delete */}
                          <button onClick={() => removeOpt(opt.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>
                            Supprimer
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Nom *</span>
                          <input value={opt.label} onChange={e => updateOpt(opt.id, { label: e.target.value })}
                            placeholder="ex: Livraison standard"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Description (délai, zone…)</span>
                          <input value={opt.description} onChange={e => updateOpt(opt.id, { description: e.target.value })}
                            placeholder="ex: 3-5 jours ouvrés"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Coût (FCFA)</span>
                          <input type="number" min={0} value={opt.cost} onChange={e => updateOpt(opt.id, { cost: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Gratuite dès (FCFA, 0 = jamais)</span>
                          <input type="number" min={0} value={opt.freeFrom} onChange={e => updateOpt(opt.id, { freeFrom: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                      </div>

                      {/* Aperçu rapide */}
                      <div style={{ fontSize: '11px', color: TEXT3, background: BG, borderRadius: '6px', padding: '8px 12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>📦 <strong style={{ color: TEXT2 }}>{formatPrice(opt.cost ?? 0)}</strong></span>
                        {(opt.freeFrom ?? 0) > 0 && <span>🎁 Gratuite dès <strong style={{ color: S_OK_T }}>{formatPrice(opt.freeFrom ?? 0)}</strong></span>}
                      </div>
                    </div>
                  ))}

                  <button onClick={addOpt}
                    style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                    + Ajouter une option de livraison
                  </button>
                </div>

                {/* Message livraison gratuite global */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '560px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT }}>Message livraison gratuite (panier)</p>
                  <input value={s.freeShippingMessage} onChange={e => setSiteContent((c) => ({ ...c, shipping: { ...c.shipping, freeShippingMessage: e.target.value } }))}
                    placeholder="ex: Livraison gratuite à partir de 25 000 FCFA"
                    style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                  <span style={{ fontSize: '10px', color: TEXT3 }}>Affiché dans la barre de progression du panier.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={save} disabled={contentSaving.shipping}
                    style={{ background: contentSaved.shipping ? S_SAVE_BG : GOLD2, color: contentSaved.shipping ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    {getSaveButtonText(contentSaved.shipping, contentSaving.shipping)}
                  </button>
                </div>
              </div>
            );
}
