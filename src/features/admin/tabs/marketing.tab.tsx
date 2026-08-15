'use client';

/* Onglet «marketing» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type MarketingConfig, type PromoBanner, type PromoCode, type SiteConfig, type UpsellRule, type WelcomePopup } from '@/features/site-config/site-config.type';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, TITLE, GOLD2, S_OK_BG, S_OK_T, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface MarketingTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
  readonly mktSubTab: 'banners' | 'popup' | 'promos' | 'upsell' | 'tracking';
  readonly setMktSubTab: (t: 'banners' | 'popup' | 'promos' | 'upsell' | 'tracking') => void;
}

export default function MarketingTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved, mktSubTab, setMktSubTab }: MarketingTabProps) {
            const mkt: MarketingConfig = siteContent.marketing ?? { banners: [], welcomePopup: { enabled: false, title: '', subtitle: '', delaySeconds: 5, bgColor: '#1C1610', ctaLabel: "Profiter de l'offre" }, upsellRules: [] };

            const saveMkt = async () => { await saveConfigSection('marketing', mkt); };

            const updateMkt = (patch: Partial<MarketingConfig>) =>
              setSiteContent((c: SiteConfig) => ({ ...c, marketing: { ...c.marketing, ...patch } }));

            // Bannières
            const addBanner = () => {
              const b: PromoBanner = { id: `bn-${Date.now()}`, text: 'Nouvelle bannière', bgColor: '#1C1610', textColor: '#D4A25A', active: false };
              updateMkt({ banners: [...(mkt.banners ?? []), b] });
            };
            const updBanner = (id: string, patch: Partial<PromoBanner>) =>
              updateMkt({ banners: (mkt.banners ?? []).map(b => b.id === id ? { ...b, ...patch } : b) });
            const delBanner = (id: string) =>
              updateMkt({ banners: (mkt.banners ?? []).filter(b => b.id !== id) });

            // Codes promo
            const promos: PromoCode[] = siteContent.promo_codes ?? [];
            const savePromos = async () => { await saveConfigSection('promo_codes', siteContent.promo_codes); };
            const addPromo = () => setSiteContent((c: SiteConfig) => ({ ...c, promo_codes: [...(c.promo_codes ?? []), { code: '', type: 'percent', value: 10, active: true }] }));
            const updPromo = (i: number, patch: Partial<PromoCode>) => {
              const next = (siteContent.promo_codes ?? []).map((p: PromoCode, j: number) => j === i ? { ...p, ...patch } : p);
              setSiteContent((c: SiteConfig) => ({ ...c, promo_codes: next }));
            };
            const delPromo = (i: number) => {
              const next = (siteContent.promo_codes ?? []).filter((_: PromoCode, j: number) => j !== i);
              setSiteContent((c: SiteConfig) => ({ ...c, promo_codes: next }));
            };

            // Upsell
            const addUpsell = () => {
              const u: UpsellRule = { id: `up-${Date.now()}`, triggerProductIds: [], suggestedProductIds: [], label: 'Complétez votre routine', active: true };
              updateMkt({ upsellRules: [...(mkt.upsellRules ?? []), u] });
            };
            const updUpsell = (id: string, patch: Partial<UpsellRule>) =>
              updateMkt({ upsellRules: (mkt.upsellRules ?? []).map(u => u.id === id ? { ...u, ...patch } : u) });
            const delUpsell = (id: string) =>
              updateMkt({ upsellRules: (mkt.upsellRules ?? []).filter(u => u.id !== id) });

            const parseIds = (raw: string): string[] => raw.split(',').map(s => s.trim()).filter(Boolean);

            const updPopup = (patch: Partial<WelcomePopup>) =>
              updateMkt({ welcomePopup: { ...mkt.welcomePopup, ...patch } });

            const SUB_TABS = [
              { id: 'banners' as const,  label: '📢 Bannières' },
              { id: 'popup' as const,    label: '🎁 Pop-up Bienvenue' },
              { id: 'promos' as const,   label: '🏷 Codes Promo' },
              { id: 'upsell' as const,   label: '⬆ Upsell' },
              { id: 'tracking' as const, label: '📊 Tracking' },
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>📣 Marketing</h1>
                  <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>Bannières, pop-ups, codes promo et règles de vente additionnelle.</p>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: '4px', background: SURFACE, borderRadius: '10px', padding: '4px', border: `1px solid ${BORDER}`, width: 'fit-content' }}>
                  {SUB_TABS.map(st => (
                    <button key={st.id} onClick={() => setMktSubTab(st.id)}
                      style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: mktSubTab === st.id ? 700 : 400, cursor: 'pointer', border: 'none', background: mktSubTab === st.id ? GOLD2 : 'transparent', color: mktSubTab === st.id ? BG : TEXT2, transition: 'all .15s' }}>
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* ── Bannières ── */}
                {mktSubTab === 'banners' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Les bannières actives s&apos;affichent en top-bar sur le site. Seule la première active sera visible.</p>
                    {(mkt.banners ?? []).map((b, idx) => (
                      <div key={b.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Bannière #{idx + 1}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={b.active}
                              onClick={() => updBanner(b.id, { active: !b.active })}
                              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); updBanner(b.id, { active: !b.active }); } }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: b.active ? S_OK_T : TEXT3, background: 'none', border: 'none', padding: 0 }}>
                              <div style={{ width: '34px', height: '18px', borderRadius: '99px', background: b.active ? S_OK_BG : BORDER, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: b.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: b.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {b.active ? 'Active' : 'Inactive'}
                            </button>
                            <button onClick={() => delBanner(b.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Texte *</span>
                            <input value={b.text} onChange={e => updBanner(b.id, { text: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Emoji</span>
                            <input value={b.emoji ?? ''} onChange={e => updBanner(b.id, { emoji: e.target.value })}
                              placeholder="🚚"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '16px', outline: 'none', textAlign: 'center' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Lien (optionnel)</span>
                            <input value={b.link ?? ''} onChange={e => updBanner(b.id, { link: e.target.value })}
                              placeholder="/boutique"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Fond (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={b.bgColor} onChange={e => updBanner(b.id, { bgColor: e.target.value })} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer' }} />
                              <input value={b.bgColor} onChange={e => updBanner(b.id, { bgColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Texte (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={b.textColor} onChange={e => updBanner(b.id, { textColor: e.target.value })} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer' }} />
                              <input value={b.textColor} onChange={e => updBanner(b.id, { textColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Début (optionnel)</span>
                            <input type="date" value={b.startsAt ?? ''} onChange={e => updBanner(b.id, { startsAt: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Fin (optionnel)</span>
                            <input type="date" value={b.endsAt ?? ''} onChange={e => updBanner(b.id, { endsAt: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                        </div>
                        {/* Preview */}
                        <div style={{ borderRadius: '6px', padding: '10px 16px', background: b.bgColor, color: b.textColor, fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                          {b.emoji && <span style={{ marginRight: '6px' }}>{b.emoji}</span>}{b.text}
                        </div>
                      </div>
                    ))}
                    <button onClick={addBanner}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter une bannière
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {getSaveButtonText(contentSaved.marketing, contentSaving.marketing)}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Pop-up Bienvenue ── */}
                {mktSubTab === 'popup' && (() => {
                  const p = mkt.welcomePopup;
                  const editPopupField = (e: React.ChangeEvent<HTMLInputElement>) => {
                    updPopup({ [e.currentTarget.dataset.field as keyof WelcomePopup]: e.currentTarget.value });
                  };
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
                      <p style={{ fontSize: '12px', color: TEXT3 }}>Affiché une seule fois au visiteur (flag localStorage) après le délai configuré. Utilisez un code promo existant pour inciter à l&apos;achat.</p>
                      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Toggle */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={p.enabled}
                          onClick={() => updPopup({ enabled: !p.enabled })}
                          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); updPopup({ enabled: !p.enabled }); } }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                          <div style={{ width: '40px', height: '22px', borderRadius: '99px', background: p.enabled ? S_OK_BG : BORDER, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: '3px', left: p.enabled ? '20px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: p.enabled ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: p.enabled ? S_OK_T : TEXT2 }}>{p.enabled ? 'Pop-up activé' : 'Pop-up désactivé'}</span>
                        </button>
                        {([
                          ['title', 'Titre', 'Bienvenue chez SD Cosmétique'],
                          ['subtitle', 'Sous-titre', 'Bénéficiez de 10% sur votre première commande'],
                          ['discountCode', 'Code promo à afficher (optionnel)', 'BIENVENUE10'],
                          ['ctaLabel', 'Label du bouton CTA', "Profiter de l'offre"],
                        ] as [keyof WelcomePopup, string, string][]).map(([key, label, ph]) => (
                          <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>{label}</span>
                            <input value={(p[key] as string) ?? ''} placeholder={ph} data-field={key}
                              onChange={editPopupField}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                        ))}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Délai d&apos;affichage (secondes)</span>
                            <input type="number" min={0} max={60} value={p.delaySeconds}
                              onChange={e => updPopup({ delaySeconds: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Couleur fond (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={p.bgColor} onChange={e => updPopup({ bgColor: e.target.value })} style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
                              <input value={p.bgColor} onChange={e => updPopup({ bgColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                        </div>

                        {/* Aperçu */}
                        <div style={{ borderRadius: '12px', padding: '28px 24px', background: p.bgColor, border: `1px solid ${BORDER2}`, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: GOLD }}>{p.title || '…'}</div>
                          <div style={{ fontSize: '12px', color: TEXT2 }}>{p.subtitle || '…'}</div>
                          {p.discountCode && <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.14em', color: GOLD, background: 'rgba(200,151,74,0.12)', padding: '8px 16px', borderRadius: '8px', border: `1px dashed ${GOLD}` }}>{p.discountCode}</div>}
                          <button style={{ background: GOLD2, color: BG, border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}>{p.ctaLabel || '…'}</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={saveMkt} disabled={contentSaving.marketing}
                          style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                          {getSaveButtonText(contentSaved.marketing, contentSaving.marketing)}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Codes Promo ── */}
                {mktSubTab === 'promos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Les codes s&apos;appliquent au checkout. Le client saisit le code et la réduction est calculée en temps réel.</p>
                    {promos.map((pc, i) => (
                      <div key={pc.code ? `promo-${pc.code}` : `promo-idx-${i}`} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>{pc.code || `Code #${i + 1}`}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={pc.active}
                              onClick={() => updPromo(i, { active: !pc.active })}
                              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); updPromo(i, { active: !pc.active }); } }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: pc.active ? S_OK_T : TEXT3, background: 'none', border: 'none', padding: 0 }}>
                              <div style={{ width: '34px', height: '18px', borderRadius: '99px', background: pc.active ? S_OK_BG : BORDER, position: 'relative', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: pc.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: pc.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {pc.active ? 'Actif' : 'Inactif'}
                            </button>
                            <button onClick={() => delPromo(i)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Code *</span>
                            <input value={pc.code} onChange={e => updPromo(i, { code: e.target.value.toUpperCase() })}
                              placeholder="PROMO20"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: GOLD, fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', outline: 'none', textTransform: 'uppercase' as const }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Type</span>
                            <select value={pc.type} onChange={e => updPromo(i, { type: e.target.value as 'percent' | 'fixed' })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                              <option value="percent">Pourcentage (%)</option>
                              <option value="fixed">Montant fixe (FCFA)</option>
                            </select>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Valeur {pc.type === 'percent' ? '(%)' : '(FCFA)'}</span>
                            <input type="number" min={0} value={pc.value} onChange={e => updPromo(i, { value: Number.parseFloat(e.target.value) || 0 })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Min. panier (FCFA, 0=∅)</span>
                            <input type="number" min={0} value={pc.minSubtotal ?? 0} onChange={e => updPromo(i, { minSubtotal: Number.parseInt(e.target.value, 10) || 0 })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>Expiration (optionnel)</span>
                          <input type="date" value={pc.expiresAt ?? ''} onChange={e => updPromo(i, { expiresAt: e.target.value || undefined })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                      </div>
                    ))}
                    <button onClick={addPromo}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter un code promo
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={savePromos} disabled={contentSaving.promo_codes}
                        style={{ background: contentSaved.promo_codes ? S_SAVE_BG : GOLD2, color: contentSaved.promo_codes ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {getSaveButtonText(contentSaved.promo_codes, contentSaving.promo_codes)}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Upsell ── */}
                {mktSubTab === 'upsell' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Définissez des règles de suggestion produit. Quand un produit déclencheur est dans le panier, les produits suggérés s&apos;affichent.</p>
                    {(mkt.upsellRules ?? []).map((u, idx) => (
                      <div key={u.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Règle #{idx + 1}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={u.active}
                              onClick={() => updUpsell(u.id, { active: !u.active })}
                              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); updUpsell(u.id, { active: !u.active }); } }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: u.active ? S_OK_T : TEXT3, background: 'none', border: 'none', padding: 0 }}>
                              <div style={{ width: '34px', height: '18px', borderRadius: '99px', background: u.active ? S_OK_BG : BORDER, position: 'relative', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: u.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: u.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {u.active ? 'Active' : 'Inactive'}
                            </button>
                            <button onClick={() => delUpsell(u.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>Label affiché au client</span>
                          <input value={u.label} onChange={e => updUpsell(u.id, { label: e.target.value })}
                            placeholder="Complétez votre routine"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>IDs produits déclencheurs (séparés par virgule)</span>
                          <input value={u.triggerProductIds.join(',')} onChange={e => updUpsell(u.id, { triggerProductIds: parseIds(e.target.value) })}
                            placeholder="prod-001,prod-002"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>IDs produits suggérés (séparés par virgule)</span>
                          <input value={u.suggestedProductIds.join(',')} onChange={e => updUpsell(u.id, { suggestedProductIds: parseIds(e.target.value) })}
                            placeholder="prod-010,prod-011"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }} />
                        </label>
                      </div>
                    ))}
                    <button onClick={addUpsell}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter une règle upsell
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {getSaveButtonText(contentSaved.marketing, contentSaving.marketing)}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Tracking ── */}
                {mktSubTab === 'tracking' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Renseignez vos identifiants de suivi. Les scripts sont injectés automatiquement dans le <code style={{ background: SURFACE2, padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>&lt;head&gt;</code> de toutes les pages.</p>

                    {/* Facebook Pixel */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>📘</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Facebook / Meta Pixel</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>Gestionnaire d&apos;événements Meta → Pixels → Votre Pixel → ID</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Pixel ID</span>
                        <input
                          value={mkt.facebookPixelId ?? ''}
                          onChange={e => updateMkt({ facebookPixelId: e.target.value })}
                          placeholder="ex : 123456789012345"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* Google Ads */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🟡</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Google Ads (gTag)</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>Google Ads → Outils → Balises → ID de conversion (format AW-XXXXXXXXX)</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>ID de conversion</span>
                        <input
                          value={mkt.googleAdsId ?? ''}
                          onChange={e => updateMkt({ googleAdsId: e.target.value })}
                          placeholder="ex : AW-123456789"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* Google Tag Manager */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🏷</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Google Tag Manager</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>GTM → Admin → Votre conteneur → ID du conteneur (format GTM-XXXXXXX)</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Container ID</span>
                        <input
                          value={mkt.googleTagManagerId ?? ''}
                          onChange={e => updateMkt({ googleTagManagerId: e.target.value })}
                          placeholder="ex : GTM-ABCDE12"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* TikTok Pixel */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🎵</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>TikTok Pixel</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>TikTok Ads Manager → Assets → Events → Web Events → Pixel ID</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Pixel ID</span>
                        <input
                          value={mkt.tiktokPixelId ?? ''}
                          onChange={e => updateMkt({ tiktokPixelId: e.target.value })}
                          placeholder="ex : CXXXXXXXXXXXXXXX"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {getSaveButtonText(contentSaved.marketing, contentSaving.marketing)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
}
