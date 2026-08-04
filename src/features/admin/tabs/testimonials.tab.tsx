'use client';

/* Onglet «temoignages» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import Image from 'next/image';
import { type TestimonialRow } from '@/features/testimonials/testimonial.repository';
import { SURFACE, SURFACE2, BORDER, TEXT, TEXT2, TEXT3, BORDER3, S_ERR_BG, S_ERR_T, S_OK_BG, S_OK_T, S_WARN_BG, S_WARN_T, thStyle, tdStyle, card, inputStyle } from '@/features/admin/admin.constant';

interface TestimonialsTabProps {
  readonly testimonials: TestimonialRow[];
  readonly testiSearch: string;
  readonly setTestiSearch: (s: string) => void;
  readonly handleApproveTestimonial: (t: TestimonialRow) => Promise<void>;
  readonly handleDeleteTestimonial: (t: TestimonialRow) => Promise<void>;
}

export default function TestimonialsTab({ testimonials, testiSearch, setTestiSearch, handleApproveTestimonial, handleDeleteTestimonial }: TestimonialsTabProps) {
  return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Témoignages clients ({testimonials.filter(t => testiSearch ? t.name.toLowerCase().includes(testiSearch.toLowerCase()) || t.text.toLowerCase().includes(testiSearch.toLowerCase()) : true).length})
                </h1>
                <label htmlFor="search-testimonials" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 600 }}>Recherche :</span>
                  <input id="search-testimonials" type="search" placeholder="Rechercher nom, message…"
                  value={testiSearch}
                  onChange={e => setTestiSearch(e.target.value)}
                  style={{ ...inputStyle, width: '220px' }}
                  />
                </label>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {testimonials.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    Aucun témoignage soumis pour l&apos;instant.
                  </p>
                ) : (() => {
                  const filtered = testimonials.filter(t =>
                    !testiSearch || t.name.toLowerCase().includes(testiSearch.toLowerCase()) || t.text.toLowerCase().includes(testiSearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucun résultat.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Photo', 'Auteur', 'Message', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {filtered.map(t => (
                            <tr key={t.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, width: '52px' }}>
                                {t.avatar_url ? (
                                  <Image src={t.avatar_url} alt={t.name} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '50%', border: `1px solid ${BORDER}`  }} />
                                ) : (
                                  <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: TEXT3, fontSize: '18px' }}>👤</span>
                                  </div>
                                )}
                              </td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{t.name}</td>
                              <td style={{ ...tdStyle, maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</td>
                              <td style={{ ...tdStyle, color: TEXT3, whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                              <td style={tdStyle}>
                                {t.approved
                                  ? <span style={{ background: S_OK_BG, color: S_OK_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>Approuvé</span>
                                  : <span style={{ background: S_WARN_BG, color: S_WARN_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>En attente</span>
                                }
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleApproveTestimonial(t)}
                                    className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                    style={{ borderColor: t.approved ? BORDER3 : S_OK_BG, color: t.approved ? TEXT2 : S_OK_T }}>
                                    {t.approved ? 'Retirer' : '✓ Approuver'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTestimonial(t)}
                                    className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                                    style={{ background: S_ERR_BG, color: S_ERR_T }}>✕
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Les témoignages affichés sur la page d'accueil viennent uniquement
                  des avis clients approuvés (table testimonials). Approuvez-les
                  dans le tableau ci-dessus pour qu'ils apparaissent sur le site. */}
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px 20px' }}>
                <p className="text-xs" style={{ color: TEXT3, lineHeight: 1.6 }}>
                  💡 Les témoignages affichés en page d&apos;accueil proviennent automatiquement des <strong style={{ color: TEXT }}>avis clients approuvés</strong> ci-dessus. Approuvez un avis pour qu&apos;il apparaisse sur le site — aucune saisie manuelle n&apos;est nécessaire.
                </p>
              </div>
            </div>
  );
}
