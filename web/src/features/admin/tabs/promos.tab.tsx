'use client';

/* Onglet «promos» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React, { useEffect, useState } from 'react';
import GlobalPromoCard from '@/features/admin/cards/global-promo.card';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { deleteAdminCoupon, fetchAdminCoupons, saveAdminCoupon } from '@/shared/api/admin';
import { type PromoCode, type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, SURFACE2, BORDER, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_ERR_T, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface PromosTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
}

export default function PromosTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved }: PromosTabProps) {
            const [codes, setCodes] = useState<(PromoCode & { id?: string })[]>([]);
            const [codesSaving, setCodesSaving] = useState(false);
            const [codesSaved, setCodesSaved] = useState(false);
            useEffect(() => {
              fetchAdminCoupons().then(setCodes).catch(() => setCodes([]));
            }, []);
            const addCode = () => setCodes([...codes, { code: '', type: 'percent', value: 10, minSubtotal: 0, active: true, expiresAt: '' }]);
            const updateCode = (i: number, patch: Partial<PromoCode>) =>
              setCodes(codes.map((c, j: number) => j === i ? { ...c, ...patch } : c));
            const removeCode = async (i: number) => {
              const current = codes[i];
              if (current?.id) await deleteAdminCoupon(current.id);
              setCodes(codes.filter((_, j: number) => j !== i));
            };
            const save = async () => {
              setCodesSaving(true);
              try {
                const normalized = codes.map((c) => ({ ...c, code: c.code.trim().toUpperCase() }));
                for (const code of normalized) {
                  if (!code.code) continue;
                  await saveAdminCoupon(code, !code.id);
                }
                setCodes(await fetchAdminCoupons());
                setCodesSaved(true);
                setTimeout(() => setCodesSaved(false), 2500);
              } finally {
                setCodesSaving(false);
              }
            };
            return (
              <div className="space-y-6">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: TEXT }}>Promotions</h1>
                  <p className="text-xs" style={{ color: TEXT3 }}>Promo globale et codes de réduction utilisables au checkout.</p>
                </div>

                {/* ── Promo globale ── */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>🌍 Promotion globale</p>
                    <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: 4, background: siteContent.global_promo?.enabled ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.06)', color: siteContent.global_promo?.enabled ? '#4CAF50' : TEXT3 }}>
                      {siteContent.global_promo?.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: TEXT3, marginBottom: 2 }}>Appliquez automatiquement une remise sur tous les produits.</p>
                  <GlobalPromoCard initialConfig={siteContent.global_promo} />
                </div>

                {/* ── Codes promo ── */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>🎟️ Codes promo</p>
                    <button onClick={addCode}
                      style={{ background: SURFACE2, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      + Nouveau code
                    </button>
                  </div>
                  {codes.length === 0 && (
                    <p className="text-xs" style={{ color: TEXT3 }}>Aucun code promo. Cliquez sur « + Nouveau code » pour en créer un.</p>
                  )}
                  {codes.map((c: PromoCode, i: number) => (
                    <div key={c.code ? `code-${c.code}` : `code-idx-${i}`} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="text-xs" style={{ color: TEXT2 }}>Code</span>
                          <input value={c.code} onChange={e => updateCode(i, { code: e.target.value.toUpperCase() })}
                            placeholder="BIENVENUE10"
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="text-xs" style={{ color: TEXT2 }}>Type</span>
                          <select value={c.type} onChange={e => updateCode(i, { type: e.target.value as PromoCode['type'] })}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }}>
                            <option value="percent">% (pourcent)</option>
                            <option value="fixed">FCFA (fixe)</option>
                          </select>
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="text-xs" style={{ color: TEXT2 }}>Valeur</span>
                          <input type="number" min={0} value={c.value}
                            onChange={e => updateCode(i, { value: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="text-xs" style={{ color: TEXT2 }}>Min. panier (FCFA)</span>
                          <input type="number" min={0} value={c.minSubtotal ?? 0}
                            onChange={e => updateCode(i, { minSubtotal: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="text-xs" style={{ color: TEXT2 }}>Expiration</span>
                          <input type="date" value={c.expiresAt ?? ''}
                            onChange={e => updateCode(i, { expiresAt: e.target.value })}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <button onClick={() => removeCode(i)}
                          style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', fontSize: '11px', cursor: 'pointer', height: '34px' }}>
                          🗑
                        </button>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: TEXT2, cursor: 'pointer' }}>
                        <input type="checkbox" checked={c.active} onChange={e => updateCode(i, { active: e.target.checked })} />
                        <span>Actif</span>
                        <span style={{ marginLeft: '12px', color: TEXT3, fontSize: '11px' }}>
                          Aperçu : {c.type === 'percent' ? `−${c.value}% sur le panier` : `−${c.value.toLocaleString('fr-FR')} FCFA`}
                          {c.minSubtotal ? ` (min ${c.minSubtotal.toLocaleString('fr-FR')} FCFA)` : ''}
                        </span>
                      </label>
                    </div>
                  ))}
                  <button onClick={save} disabled={codesSaving}
                    style={{ alignSelf: 'flex-end', background: codesSaved ? S_SAVE_BG : GOLD2, color: codesSaved ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    {getSaveButtonText(codesSaved, codesSaving)}
                  </button>
                </div>
              </div>
            );
}
