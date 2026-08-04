'use client';

/* Onglet «avis» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import Pagination from '@/features/admin/pagination';
import { type ReviewRow } from '@/features/admin/admin.type';
import { getReviewCountText } from '@/features/admin/admin.util';
import { SURFACE2, GOLD, TEXT, TEXT2, TEXT3, BORDER3, S_ERR_BG, S_ERR_T, S_OK_BG, S_OK_T, S_WARN_BG, S_WARN_T, thStyle, tdStyle, card, inputStyle } from '@/features/admin/admin.constant';

interface ReviewsTabProps {
  readonly reviews: ReviewRow[];
  readonly filteredReviews: ReviewRow[];
  readonly pagedReviews: ReviewRow[];
  readonly reviewPage: number;
  readonly reviewPageCount: number;
  readonly reviewSearch: string;
  readonly setReviewPage: (n: number) => void;
  readonly setReviewSearch: (s: string) => void;
  readonly handleDeleteReview: (id: string) => Promise<void>;
  readonly handleToggleReview: (id: string, current: boolean) => Promise<void>;
}

export default function ReviewsTab({ reviews, filteredReviews, pagedReviews, reviewPage, reviewPageCount, reviewSearch, setReviewPage, setReviewSearch, handleDeleteReview, handleToggleReview }: ReviewsTabProps) {
  return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  {getReviewCountText(filteredReviews.length, reviews.length)}
                </h1>
                <label htmlFor="search-reviews" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 600 }}>Recherche :</span>
                  <input id="search-reviews" type="search" placeholder="Rechercher auteur, commentaire…"
                  value={reviewSearch}
                  onChange={e => { setReviewSearch(e.target.value); setReviewPage(1); }}
                  style={{ ...inputStyle, width: '220px' }}
                  />
                </label>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {filteredReviews.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    {reviews.length === 0 ? 'Aucun avis enregistré.' : 'Aucun résultat.'}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Auteur', 'Note', 'Commentaire', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {pagedReviews.map(r => (
                            <tr key={r.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{r.author}</td>
                              <td style={tdStyle}><span style={{ color: GOLD }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></td>
                              <td style={{ ...tdStyle, maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment}</td>
                              <td style={{ ...tdStyle, color: TEXT3, whiteSpace: 'nowrap' }}>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                              <td style={tdStyle}>
                                {r.verified
                                  ? <span style={{ background: S_OK_BG, color: S_OK_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>Vérifié</span>
                                  : <span style={{ background: S_WARN_BG, color: S_WARN_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>En attente</span>
                                }
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => handleToggleReview(r.id, r.verified)}
                                    className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                    style={{ borderColor: r.verified ? BORDER3 : S_OK_BG, color: r.verified ? TEXT2 : S_OK_T }}>
                                    {r.verified ? 'Retirer' : '✓ Approuver'}
                                  </button>
                                  <button onClick={() => handleDeleteReview(r.id)} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reviewPageCount > 1 && <Pagination page={reviewPage} total={reviewPageCount} onChange={setReviewPage} />}
                  </>
                )}
              </div>
            </div>
  );
}
