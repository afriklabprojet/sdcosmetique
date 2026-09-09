'use client';

/*
 * Onglet «pages» de la console d'administration — CRUD additif pour des
 * pages de contenu créées sans déploiement, servies sur /page/[slug].
 * Ne touche pas aux pages légales existantes (CGV, FAQ, etc.), qui restent
 * du JSX sur-mesure.
 */

import React, { useEffect, useState } from 'react';
import { type AdminPageRow } from '@/features/admin/admin.type';
import { AdminPage } from '@/shared/api/admin';
import { BG, SURFACE, BORDER, BORDER2, GOLD, TEXT, TEXT_M, TEXT3, TITLE, card, inputStyle, thStyle, tdStyle } from '@/features/admin/admin.constant';

type PageModal = Partial<AdminPageRow> & { _isNew?: boolean };

export default function PagesTab() {
  const [pages, setPages] = useState<AdminPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PageModal | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    AdminPage.list().then(setPages).catch(() => setPages([])).finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const slugify = (value: string) => value.toLowerCase()
    .normalize('NFD').replaceAll(/[̀-ͯ]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: TEXT }}>Pages ({pages.length})</h1>
          <p className="text-xs" style={{ color: TEXT3 }}>Pages additionnelles, servies sur /page/&#123;slug&#125;. N&apos;affecte pas les pages légales existantes.</p>
        </div>
        <button
          onClick={() => setModal({ _isNew: true, slug: '', title: '', content: '', publishedAt: null })}
          className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
          style={{ background: GOLD, color: BG }}
        >
          + Nouvelle page
        </button>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Chargement…</p>
        ) : pages.length === 0 ? (
          <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucune page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: SURFACE }}>
                <tr>{['Titre', 'Slug', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id} className="hover:brightness-110 transition-all">
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{p.title}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px' }}>/page/{p.slug}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: p.publishedAt ? 'rgba(63,167,107,0.15)' : 'rgba(245,158,11,0.15)', color: p.publishedAt ? '#3FA76B' : '#F59E0B' }}>
                        {p.publishedAt ? 'Publiée' : 'Brouillon'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, display: 'flex', gap: 8 }}>
                      <button onClick={() => setModal({ ...p, _isNew: false })} style={{ fontSize: 11, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                      <button
                        onClick={async () => { if (confirm(`Supprimer la page "${p.title}" ?`)) { await AdminPage.remove(p.id); reload(); } }}
                        style={{ fontSize: 11, color: '#DC6C6C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: TEXT }}>{modal._isNew ? 'Nouvelle page' : 'Modifier la page'}</h2>
              <button onClick={() => setModal(null)} style={{ color: TEXT3, fontSize: '20px', lineHeight: 1 }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="page-modal-title" className="text-xs block mb-1" style={{ color: TEXT_M }}>Titre *</label>
                <input
                  id="page-modal-title"
                  type="text"
                  value={modal.title ?? ''}
                  onChange={e => {
                    const title = e.target.value;
                    setModal(prev => prev ? { ...prev, title, ...(prev._isNew ? { slug: slugify(title) } : {}) } : prev);
                  }}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div>
                <label htmlFor="page-modal-slug" className="text-xs block mb-1" style={{ color: TEXT_M }}>Slug (/page/…)</label>
                <input
                  id="page-modal-slug"
                  type="text"
                  value={modal.slug ?? ''}
                  readOnly={!modal._isNew}
                  onChange={e => setModal(prev => prev ? { ...prev, slug: slugify(e.target.value) } : prev)}
                  style={{ ...inputStyle, width: '100%', ...(modal._isNew ? {} : { opacity: 0.5, cursor: 'not-allowed' }) }}
                />
              </div>
              <div>
                <label htmlFor="page-modal-content" className="text-xs block mb-1" style={{ color: TEXT_M }}>Contenu (un paragraphe par ligne vide)</label>
                <textarea
                  id="page-modal-content"
                  rows={10}
                  value={modal.content ?? ''}
                  onChange={e => setModal(prev => prev ? { ...prev, content: e.target.value } : prev)}
                  style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="page-modal-published" className="text-xs" style={{ color: TEXT_M }}>Publiée (visible sur le site)</label>
                <input
                  id="page-modal-published"
                  type="checkbox"
                  checked={Boolean(modal.publishedAt)}
                  onChange={e => setModal(prev => prev ? { ...prev, publishedAt: e.target.checked ? new Date().toISOString() : null } : prev)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 text-xs py-2 rounded border" style={{ borderColor: BORDER2, color: TEXT3 }}>
                  Annuler
                </button>
                <button
                  disabled={saving || !modal.title?.trim() || !modal.slug?.trim()}
                  onClick={async () => {
                    setSaving(true);
                    const row: AdminPageRow = {
                      id: modal.id ?? '',
                      slug: modal.slug ?? '',
                      title: modal.title ?? '',
                      content: modal.content ?? '',
                      publishedAt: modal.publishedAt ?? null,
                      created_at: modal.created_at ?? '',
                    };
                    try {
                      await AdminPage.save(row, Boolean(modal._isNew));
                      reload();
                      setModal(null);
                    } catch {
                      alert('Erreur lors de l’enregistrement (slug déjà utilisé ?).');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="flex-1 text-xs py-2 rounded font-semibold transition-all hover:opacity-80"
                  style={{ background: saving ? TEXT3 : GOLD, color: TITLE }}
                >{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
