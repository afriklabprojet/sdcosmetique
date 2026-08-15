'use client';

/* Onglet «legal» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT3, GOLD2, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface LegalTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
}

export default function LegalTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved }: LegalTabProps) {
  return (
            <div className="space-y-6">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>📄 Pages légales</h1>
              <p className="text-xs" style={{ color: TEXT3 }}>Éditez le contenu des pages légales affichées sur le site.</p>
              {/* ─── Pages légales (CGV, Confidentialité, Engagements, Contact) ─── */}
              {(() => {
                const KEYS = [
                  { key: 'legal_mentions' as const, label: 'Mentions légales', slug: 'mentions-legales' },
                  { key: 'legal_cgv' as const, label: 'CGV', slug: 'cgv' },
                  { key: 'legal_confidentialite' as const, label: 'Confidentialité', slug: 'confidentialite' },
                  { key: 'legal_engagements' as const, label: 'Engagements', slug: 'engagements' },
                  { key: 'legal_contact' as const, label: 'Contact', slug: 'contact' },
                ];
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Pages légales</h3>
                    <p style={{ color: TEXT3, fontSize: '11px' }}>
                      Édite l&apos;eyebrow, le titre, l&apos;intro, la date de mise à jour et un éventuel bloc HTML. Si tu laisses bodyHtml vide, la page conserve son contenu rédactionnel par défaut.
                    </p>
                    {KEYS.map(({ key, label, slug }) => {
                      const lp = siteContent[key];
                      const update = (patch: Partial<typeof lp>) => setSiteContent({ ...siteContent, [key]: { ...siteContent[key], ...patch } } as SiteConfig);
                      const save = () => saveConfigSection(key, lp);
                      const editLandingField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        update({ [e.currentTarget.dataset.k as string]: e.currentTarget.value } as Partial<typeof lp>);
                      return (
                        <details key={key} style={{ border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '10px 12px', background: SURFACE2 }}>
                          <summary style={{ cursor: 'pointer', color: GOLD, fontSize: '12px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <span>{label}</span>
                            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{ fontSize: '10px', color: TEXT3, textDecoration: 'none', border: `1px solid ${BORDER2}`, padding: '2px 8px', borderRadius: '4px' }}>
                              Aperçu ↗
                            </a>
                          </summary>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            {(['eyebrow', 'title', 'lead', 'updatedAt'] as const).map(k => (
                              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                                <input value={lp[k] ?? ''} data-k={k} onChange={editLandingField}
                                  style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                              </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>bodyHtml (optionnel — remplace le corps)</span>
                              <textarea value={lp.bodyHtml ?? ''} onChange={e => update({ bodyHtml: e.target.value })} rows={6}
                                style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical' }} />
                            </div>
                            {/* ─── Champs spécifiques à la page Contact ─── */}
                            {slug === 'contact' && (
                              <>
                                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '10px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>📞 Service client</span>
                                </div>
                                {([
                                  { k: 'contactEmail', label: 'Email service client' },
                                  { k: 'contactPhone', label: 'Téléphone' },
                                  { k: 'contactHours', label: 'Horaires (ex: Lun–Ven · 9h–18h GMT)' },
                                ] as const).map(({ k, label }) => (
                                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                                    <input value={(lp as Record<string, string>)[k] ?? ''} data-k={k} onChange={editLandingField}
                                      style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                                  </div>
                                ))}
                                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '10px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>📍 Adresse atelier</span>
                                </div>
                                {([
                                  { k: 'officeAddress', label: 'Adresse (rue)' },
                                  { k: 'officeCity', label: 'Ville / CP' },
                                  { k: 'officeHours', label: 'Horaires atelier (ex: Mar–Sam · 10h–19h)' },
                                ] as const).map(({ k, label }) => (
                                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                                    <input value={(lp as Record<string, string>)[k] ?? ''} data-k={k} onChange={editLandingField}
                                      style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                                  </div>
                                ))}
                                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '10px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>✉️ Presse & Partenariats</span>
                                </div>
                                {([
                                  { k: 'pressEmail', label: 'Email presse' },
                                  { k: 'partnersEmail', label: 'Email partenariats' },
                                ] as const).map(({ k, label }) => (
                                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                                    <input value={(lp as Record<string, string>)[k] ?? ''} data-k={k} onChange={editLandingField}
                                      style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                                  </div>
                                ))}
                              </>
                            )}
                            <button onClick={save} disabled={contentSaving[key]}
                              style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                              {getSaveButtonText(contentSaved[key], contentSaving[key])}
                            </button>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
  );
}
