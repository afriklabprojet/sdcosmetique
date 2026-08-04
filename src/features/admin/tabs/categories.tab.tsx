'use client';

/* Onglet «categories» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import ImageUpload from '@/shared/ui/image.input';
import Image from 'next/image';
import { addCategoryToDB, deleteCategoryFromDB, fetchAllCategoriesAdmin, updateCategoryInDB, type CategoryRow } from '@/features/catalog/category.repository';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, TITLE, TEXT_M, INFO_C, S_ERR_BG, S_ERR_T, S_OK_T, thStyle, tdStyle, card, inputStyle } from '@/features/admin/admin.constant';

interface CategoriesTabProps {
  readonly categories: CategoryRow[];
  readonly catModal: Partial<CategoryRow> & { _isNew?: boolean } | null;
  readonly catSaving: boolean;
  readonly setCatModal: React.Dispatch<React.SetStateAction<Partial<CategoryRow> & { _isNew?: boolean } | null>>;
  readonly setCatSaving: (v: boolean) => void;
  readonly setCategories: React.Dispatch<React.SetStateAction<CategoryRow[]>>;
}

export default function CategoriesTab({ categories, catModal, catSaving, setCatModal, setCatSaving, setCategories }: CategoriesTabProps) {
  return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Catégories ({categories.length})
                </h1>
                <button
                  onClick={() => setCatModal({ _isNew: true, slug: '', label: '', sub_label: '', image: '', href: '', icon: '', is_quiz: false, order_index: categories.length + 1, active: true })}
                  className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                  style={{ background: GOLD, color: BG }}
                >
                  + Nouvelle catégorie
                </button>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {categories.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucune catégorie.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: SURFACE2 }}>
                        <tr>{['Image', 'Label', 'Sous-titre', 'Slug', 'Lien', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                            <td style={{ ...tdStyle, width: '52px', padding: '8px' }}>
                              {cat.image ? (
                                <Image src={cat.image} alt={cat.label} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '50%', border: `1px solid ${BORDER}`  }} />
                              ) : (
                                <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ color: TEXT3, fontSize: '18px' }}>{cat.is_quiz ? '🎯' : '🗂️'}</span>
                                </div>
                              )}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{cat.label}</td>
                            <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px', whiteSpace: 'pre-line', maxWidth: '120px' }}>{cat.sub_label}</td>
                            <td style={{ ...tdStyle, color: INFO_C, fontFamily: 'monospace', fontSize: '11px' }}>{cat.slug}</td>
                            <td style={{ ...tdStyle, color: INFO_C, fontFamily: 'monospace', fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.href}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' as const }}>{cat.order_index}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                              <span style={{ color: cat.active ? S_OK_T : S_ERR_T, fontSize: '14px', fontWeight: 700 }}>{cat.active ? '✓' : '✕'}</span>
                            </td>
                            <td style={tdStyle}>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setCatModal({ ...cat, _isNew: false })}
                                  className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                  style={{ borderColor: BORDER2, color: TEXT2 }}
                                >Éditer</button>
                                <button
                                  onClick={async () => { if (confirm(`Supprimer "${cat.label}" ?`)) { await deleteCategoryFromDB(cat.id); setCategories(categories.filter(c => c.id !== cat.id)); } }}
                                  className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                                  style={{ background: S_ERR_BG, color: S_ERR_T }}
                                >✕</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ─── Modal catégorie ─── */}
              {catModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-base" style={{ color: TEXT }}>{catModal._isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h2>
                      <button onClick={() => setCatModal(null)} style={{ color: TEXT3, fontSize: '20px', lineHeight: 1 }}>✕</button>
                    </div>
                    <div className="space-y-3">
                      {/* Label → génère le slug automatiquement */}
                      <div>
                        <label htmlFor="cat-modal-label" className="text-xs block mb-1" style={{ color: TEXT_M }}>Label (ex: CORPS) *</label>
                        <input
                          id="cat-modal-label"
                          type="text"
                          value={catModal.label ?? ''}
                          onChange={e => {
                            const label = e.target.value;
                            const slug = label.toLowerCase()
                              .normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '')
                              .replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
                            setCatModal(prev => prev ? { ...prev, label, slug, href: `/categorie/${slug}` } : prev);
                          }}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>
                      {/* Slug — lecture seule, généré depuis le label */}
                      <div>
                        <label htmlFor="cat-modal-slug" className="text-xs block mb-1" style={{ color: TEXT_M }}>Slug (auto-généré)</label>
                        <input
                          id="cat-modal-slug"
                          type="text"
                          value={catModal.slug ?? ''}
                          readOnly
                          style={{ ...inputStyle, width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                        />
                      </div>
                      {([
                        { key: 'sub_label', label: String.raw`Sous-titre (2 lignes avec \n)` },
                        { key: 'href', label: 'Lien (auto-généré, modifiable si besoin)' },
                        { key: 'order_index', label: 'Ordre d\'affichage', type: 'number' },
                      ] as { key: keyof CategoryRow; label: string; required?: boolean; type?: string }[]).map(field => (
                        <div key={String(field.key)}>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>{field.label}</label>
                          <input
                            type={field.type ?? 'text'}
                            value={String(catModal[field.key] ?? '')}
                            onChange={e => setCatModal(prev => prev ? { ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                          />
                        </div>
                      ))}
                      {/* Image — upload drag & drop */}
                      <ImageUpload
                        value={catModal.image ?? ''}
                        onChange={url => setCatModal(prev => prev ? { ...prev, image: url } : prev)}
                        folder="categories"
                        label="Image de la catégorie"
                        previewSize={80}
                      />
                      <div className="flex items-center gap-3">
                        <label htmlFor="quiz-teint" className="text-xs" style={{ color: TEXT_M }}>Quiz teint</label>
                        <input type="checkbox" checked={catModal.is_quiz ?? false} onChange={e => setCatModal(prev => prev ? { ...prev, is_quiz: e.target.checked } : prev)} />
                      </div>
                      <div className="flex items-center gap-3">
                        <label htmlFor="category-visible" className="text-xs" style={{ color: TEXT_M }}>Visible (actif)</label>
                        <input id="category-visible" type="checkbox" checked={catModal.active ?? true} onChange={e => setCatModal(prev => prev ? { ...prev, active: e.target.checked } : prev)} />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setCatModal(null)}
                          className="flex-1 text-xs py-2 rounded border"
                          style={{ borderColor: BORDER2, color: TEXT3 }}
                        >Annuler</button>
                        <button
                          disabled={catSaving || !catModal.label?.trim() || !catModal.slug?.trim()}
                          onClick={async () => {
                            setCatSaving(true);
                            const { _isNew, id, created_at: _createdAt, ...fields } = catModal as CategoryRow & { _isNew?: boolean };
                            if (_isNew) {
                              const { error } = await addCategoryToDB(fields as Omit<CategoryRow, 'id' | 'created_at'>);
                              if (!error) {
                                const fresh = await fetchAllCategoriesAdmin();
                                setCategories(fresh);
                                setCatModal(null);
                              }
                            } else {
                              await updateCategoryInDB(id, fields as Partial<Omit<CategoryRow, 'id' | 'created_at'>>);
                              setCategories(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
                              setCatModal(null);
                            }
                            setCatSaving(false);
                          }}
                          className="flex-1 text-xs py-2 rounded font-semibold transition-all hover:opacity-80"
                          style={{ background: catSaving ? TEXT3 : GOLD, color: TITLE }}
                        >{catSaving ? 'Sauvegarde…' : 'Enregistrer'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
  );
}
