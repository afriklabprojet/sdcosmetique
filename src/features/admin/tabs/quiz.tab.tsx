'use client';

/* Onglet «quiz» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import QuizAnalyticsCard from '@/features/admin/cards/quiz-analytics.card';
import { type QuizItemModal } from '@/features/admin/admin.type';
import { getQuizModalTitle } from '@/features/admin/admin.util';
import { deleteConcern, deleteRoutine, fetchAllConcernsAdmin, fetchAllRoutinesAdmin, upsertConcern, upsertRoutine, type QuizConcern, type QuizRoutine } from '@/features/quiz/quiz.repository';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, TEXT_M, INFO_C, S_ERR_BG, S_ERR_T, S_OK_T, thStyle, tdStyle, inputStyle } from '@/features/admin/admin.constant';

interface QuizTabProps {
  readonly quizConcerns: QuizConcern[];
  readonly quizRoutines: QuizRoutine[];
  readonly quizModal: QuizItemModal | null;
  readonly quizSaving: boolean;
  readonly setQuizConcerns: React.Dispatch<React.SetStateAction<QuizConcern[]>>;
  readonly setQuizRoutines: React.Dispatch<React.SetStateAction<QuizRoutine[]>>;
  readonly setQuizModal: React.Dispatch<React.SetStateAction<QuizItemModal | null>>;
  readonly setQuizSaving: (v: boolean) => void;
}

export default function QuizTab({ quizConcerns, quizRoutines, quizModal, quizSaving, setQuizConcerns, setQuizRoutines, setQuizModal, setQuizSaving }: QuizTabProps) {
  return (
            <div className="space-y-8">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>Quiz — Configuration</h1>

              <QuizAnalyticsCard />

              {/* ── Préoccupations ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-sm font-semibold" style={{ color: GOLD }}>Préoccupations — Q2 ({quizConcerns.length})</h2>
                  <button
                    onClick={() => setQuizModal({ type: 'concern', data: { _isNew: true, id: '', label: '', meta: '', glyph: '◯', sort_order: quizConcerns.length, active: true } })}
                    className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                    style={{ background: GOLD, color: BG }}
                  >+ Nouvelle préoccupation</button>
                </div>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {quizConcerns.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: TEXT3 }}>Aucune préoccupation.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Glyphe', 'ID', 'Label', 'Sous-titre', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {quizConcerns.map(c => (
                            <tr key={c.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, textAlign: 'center' as const, fontSize: '20px', width: '48px' }}>{c.glyph}</td>
                              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: INFO_C }}>{c.id}</td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{c.label}</td>
                              <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px' }}>{c.meta}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>{c.sort_order}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                                <span style={{ color: c.active ? S_OK_T : S_ERR_T, fontWeight: 700 }}>{c.active ? '✓' : '✕'}</span>
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => setQuizModal({ type: 'concern', data: { ...c, _isNew: false } })} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                                  <button onClick={async () => { if (confirm(`Supprimer "${c.label}" ?`)) { await deleteConcern(c.id); setQuizConcerns(quizConcerns.filter(x => x.id !== c.id)); } }} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Routines ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-sm font-semibold" style={{ color: GOLD }}>Profils de routine — Q3 ({quizRoutines.length})</h2>
                  <button
                    onClick={() => setQuizModal({ type: 'routine', data: { _isNew: true, id: '', label: '', meta: '', glyph: '◇', sort_order: quizRoutines.length, active: true } })}
                    className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                    style={{ background: GOLD, color: BG }}
                  >+ Nouvelle routine</button>
                </div>
                <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {quizRoutines.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: TEXT3 }}>Aucune routine.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Glyphe', 'ID', 'Label', 'Sous-titre', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {quizRoutines.map(r => (
                            <tr key={r.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, textAlign: 'center' as const, fontSize: '20px', width: '48px' }}>{r.glyph}</td>
                              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: INFO_C }}>{r.id}</td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{r.label}</td>
                              <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px' }}>{r.meta}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>{r.sort_order}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                                <span style={{ color: r.active ? S_OK_T : S_ERR_T, fontWeight: 700 }}>{r.active ? '✓' : '✕'}</span>
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => setQuizModal({ type: 'routine', data: { ...r, _isNew: false } })} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                                  <button onClick={async () => { if (confirm(`Supprimer "${r.label}" ?`)) { await deleteRoutine(r.id); setQuizRoutines(quizRoutines.filter(x => x.id !== r.id)); } }} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Modal quiz ─── */}
              {quizModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-base" style={{ color: TEXT }}>
                        {getQuizModalTitle(quizModal.data._isNew ?? false, quizModal.type)}
                      </h2>
                      <button onClick={() => setQuizModal(null)} style={{ color: TEXT3, fontSize: '20px', lineHeight: 1 }}>✕</button>
                    </div>
                    <div className="space-y-3">
                      {/* ID — seulement pour les nouveaux */}
                      {quizModal.data._isNew && (
                        <div>
                          <label htmlFor="quiz-modal-id" className="text-xs block mb-1" style={{ color: TEXT_M }}>ID unique (ex: taches, eclat) *</label>
                          <input
                            id="quiz-modal-id"
                            type="text"
                            value={quizModal.data.id ?? ''}
                            onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, id: e.target.value.toLowerCase().replaceAll(/\s+/g, '_') } } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                            placeholder="sans espaces, sans accents"
                          />
                        </div>
                      )}
                      {[
                        { key: 'label', label: 'Label *' },
                        { key: 'meta',  label: 'Sous-titre' },
                        { key: 'glyph', label: 'Glyphe (1 caractère)' },
                        { key: 'sort_order', label: 'Ordre', type: 'number' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>{field.label}</label>
                          <input
                            type={field.type ?? 'text'}
                            value={(quizModal.data as Record<string, unknown>)[field.key]?.toString() ?? ''}
                            onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <label htmlFor="quiz-modal-active" className="text-xs" style={{ color: TEXT_M }}>Actif</label>
                        <input
                          id="quiz-modal-active"
                          type="checkbox"
                          checked={quizModal.data.active ?? true}
                          onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, active: e.target.checked } } : prev)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button
                        disabled={quizSaving}
                        onClick={async () => {
                          if (!quizModal.data.id || !quizModal.data.label) return;
                          setQuizSaving(true);
                          if (quizModal.type === 'concern') {
                            await upsertConcern(quizModal.data as QuizConcern);
                            setQuizConcerns(await fetchAllConcernsAdmin());
                          } else {
                            await upsertRoutine(quizModal.data as QuizRoutine);
                            setQuizRoutines(await fetchAllRoutinesAdmin());
                          }
                          setQuizSaving(false);
                          setQuizModal(null);
                        }}
                        className="flex-1 py-2 rounded font-semibold text-sm transition-all hover:opacity-80"
                        style={{ background: GOLD, color: BG, opacity: quizSaving ? 0.6 : 1 }}
                      >
                        {quizSaving ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                      <button onClick={() => setQuizModal(null)} className="flex-1 py-2 rounded text-sm" style={{ background: SURFACE2, color: TEXT2 }}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
  );
}
