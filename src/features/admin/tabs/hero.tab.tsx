'use client';

/* Onglet «hero» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import ImageUpload from '@/shared/ui/image.input';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type CategoryRow } from '@/features/catalog/category.repository';
import { type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, BORDER, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface HeroTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
  readonly categories: CategoryRow[];
  readonly heroSectionBlock: React.ReactNode;
}

export default function HeroTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved, categories, heroSectionBlock }: HeroTabProps) {
  return (
            <div className="space-y-6">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>🖼 Bannière Hero</h1>
              <p className="text-xs" style={{ color: TEXT3 }}>Configurez le visuel principal et le message d&apos;accueil affichés en haut de la page d&apos;accueil.</p>
              {heroSectionBlock}

              {/* ── Titre section teint (accueil) ── */}
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p className="text-sm font-semibold" style={{ color: GOLD }}>🎨 Section Teint — Titre (page d&apos;accueil)</p>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="text-xs" style={{ color: TEXT2 }}>Titre affiché au-dessus des cercles de teint</span>
                  <input
                  value={siteContent.skin_tone_section_title ?? ''}
                    onChange={(e) => setSiteContent({ ...siteContent, skin_tone_section_title: e.target.value })}
                    style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }}
                  />
                </label>
                <button
                  onClick={async () => { await saveConfigSection('skin_tone_section_title', siteContent.skin_tone_section_title); }}
                  disabled={contentSaving['skin_tone_section_title']}
                  style={{ alignSelf: 'flex-end', background: contentSaved['skin_tone_section_title'] ? S_SAVE_BG : GOLD2, color: contentSaved['skin_tone_section_title'] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  {getSaveButtonText(contentSaved['skin_tone_section_title'], contentSaving['skin_tone_section_title'])}
                </button>
              </div>

              {/* ── Héros pages catégories ── */}
              {([
                { key: 'hero_face' as const,   label: '🧴 Hero — Visage',  fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_body' as const,   label: '💆 Hero — Corps',   fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_gammes' as const, label: '✨ Hero — Gammes',  fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_kit_levre' as const, label: '💋 Hero — Kit Lèvre', fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_minceur' as const,   label: '🌿 Hero — Minceur',   fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_kits' as const,   label: '🎁 Hero — Kits',   fields: ['eyebrow','title','titleAccent','lead','image','stat1Num','stat1Label','stat2Num','stat2Label','stat3Num','stat3Label'] as const },
                { key: 'hero_duo' as const,    label: '👥 Hero — Duo',    fields: ['eyebrow','title','titleAccent','lead','image','synergyNum','synergyText'] as const },
                { key: 'hero_quiz' as const,   label: '📋 Hero — Quiz Teint', fields: ['eyebrow','title','titleAccent','lead','image','floaterLabel','floaterText'] as const },
                { key: 'hero_teint_noir' as const,         label: '🖤 Hero — Teint Noir',         fields: ['image'] as const },
                { key: 'hero_teint_marron' as const,       label: '🤎 Hero — Teint Marron',       fields: ['image'] as const },
                { key: 'hero_teint_marron_clair' as const, label: '🧡 Hero — Teint Marron Clair', fields: ['image'] as const },
                { key: 'hero_teint_clair' as const,        label: '🤍 Hero — Teint Clair',        fields: ['image'] as const },
                { key: 'hero_teint_metisse' as const,      label: '💛 Hero — Teint Métisse',      fields: ['image'] as const },
              ] as const).map(({ key, label, fields }) => {
                const fieldLabels: Record<string, string> = {
                  eyebrow: 'Accroche (texte au-dessus du titre)',
                  title: 'Titre principal',
                  titleAccent: 'Titre — partie accentuée (dorée)',
                  lead: 'Description / sous-titre',
                  image: 'Image (chemin ex: /categories/visage.png)',
                  stat1Num: 'Stat 1 — chiffre',
                  stat1Label: 'Stat 1 — label',
                  stat2Num: 'Stat 2 — chiffre',
                  stat2Label: 'Stat 2 — label',
                  stat3Num: 'Stat 3 — chiffre',
                  stat3Label: 'Stat 3 — label',
                  synergyNum: 'Synergy — nombre (ex: 1 + 1)',
                  synergyText: 'Synergy — résultat (ex: résultats en 14 jours)',
                  floaterLabel: 'Floater — label',
                  floaterText: 'Floater — texte citation',
                };
                const save = async () => { await saveConfigSection(key, siteContent[key]); };
                const f = siteContent[key] as Record<string, string>;
                return (
                  <div key={key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>{label}</p>
                    {(fields as readonly string[]).filter(f2 => f2 !== 'image').map(field => (
                      <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="text-xs" style={{ color: TEXT2 }}>{fieldLabels[field] ?? field}</span>
                        {field === 'lead' || field === 'floaterText' ? (
                          <textarea
                            rows={3}
                            value={f[field] ?? ''}
                            onChange={(e) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), [field]: e.target.value } })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', resize: 'vertical', outline: 'none' }}
                          />
                        ) : (
                          <input
                            value={f[field] ?? ''}
                            onChange={(e) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), [field]: e.target.value } })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }}
                          />
                        )}
                      </label>
                    ))}
                    <ImageUpload
                      value={f.image ?? ''}
                      onChange={(url: string) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), image: url } })}
                      folder="categories"
                      label="Image du hero"
                      previewSize={140}
                    />
                    <button onClick={save} disabled={contentSaving[key]}
                      style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {getSaveButtonText(contentSaved[key], contentSaving[key])}
                    </button>
                  </div>
                );
              })}


            </div>
  );
}
