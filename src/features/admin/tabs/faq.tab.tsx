'use client';

/* Onglet «faq» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_ERR_T, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface FaqTabProps {
  readonly siteContent: SiteConfig;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
  readonly addFaqCat: () => void;
  readonly addFaqItem: (ci: number) => void;
  readonly removeFaqCat: (ci: number) => void;
  readonly removeFaqItem: (ci: number, qi: number) => void;
  readonly updateFaqCatTitle: (ci: number, title: string) => void;
  readonly updateFaqItem: (ci: number, qi: number, patch: { q?: string; a?: string }) => void;
}

export default function FaqTab({ siteContent, saveConfigSection, contentSaving, contentSaved, addFaqCat, addFaqItem, removeFaqCat, removeFaqItem, updateFaqCatTitle, updateFaqItem }: FaqTabProps) {
            const faq = siteContent.faq;
            const save = async () => { await saveConfigSection('faq', faq); };
            const handleFaqItemInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              updateFaqItem(Number(e.currentTarget.dataset.ci), Number(e.currentTarget.dataset.qi), { [e.currentTarget.dataset.field as 'q' | 'a']: e.currentTarget.value });
            };
            const handleFaqItemRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
              removeFaqItem(Number(e.currentTarget.dataset.ci), Number(e.currentTarget.dataset.qi));
            };
            return (
              <div className="space-y-6">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: TEXT }}>FAQ</h1>
                  <p className="text-xs" style={{ color: TEXT3 }}>Gérez les catégories et les questions/réponses affichées sur le site.</p>
                </div>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>FAQ</h3>
                    <button onClick={addFaqCat} style={{ background: 'transparent', color: GOLD, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}>+ Catégorie</button>
                  </div>
                  {faq.length === 0 && <p style={{ fontSize: '12px', color: TEXT3 }}>Aucune catégorie. Ajoutez-en une.</p>}
                  {faq.map((cat: typeof faq[number], ci: number) => (
                    <div key={`faq-cat-${ci}-${cat.cat.slice(0, 12)}`} style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                        <input value={cat.cat} onChange={e => updateFaqCatTitle(ci, e.target.value)}
                          style={{ flex: 1, background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px', fontWeight: 600 }} />
                        <button onClick={() => addFaqItem(ci)} style={{ background: 'transparent', color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>+ Q/R</button>
                        <button onClick={() => removeFaqCat(ci)} style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>🗑</button>
                      </div>
                      {cat.items.map((it: {q: string; a: string}, qi: number) => (
                        <div key={`faq-item-${ci}-${qi}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderTop: `1px solid ${BORDER2}` }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input placeholder="Question" value={it.q} data-ci={ci} data-qi={qi} data-field="q" onChange={handleFaqItemInput}
                              style={{ flex: 1, background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 9px', fontSize: '12px' }} />
                            <button data-ci={ci} data-qi={qi} onClick={handleFaqItemRemove} style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                          </div>
                          <textarea placeholder="Réponse" value={it.a} data-ci={ci} data-qi={qi} data-field="a" onChange={handleFaqItemInput} rows={3}
                            style={{ width: '100%', background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 9px', fontSize: '12px', resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                      ))}
                    </div>
                  ))}
                  <button onClick={save} disabled={contentSaving.faq}
                    style={{ alignSelf: 'flex-end', background: contentSaved.faq ? S_SAVE_BG : GOLD2, color: contentSaved.faq ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    {getSaveButtonText(contentSaved.faq, contentSaving.faq)}
                  </button>
                </div>
              </div>
            );
}
