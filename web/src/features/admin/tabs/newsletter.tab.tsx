'use client';

/* Onglet «newsletter» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { type NewsletterSub } from '@/features/admin/admin.type';
import { deleteAdminNewsletter } from '@/shared/api/admin';
import { getNewsletterFilterText, getSaveButtonText } from '@/features/admin/admin.util';
import { type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface NewsletterTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
  readonly newsletterSubs: NewsletterSub[];
  readonly newsletterSearch: string;
  readonly newsletterFilter: 'all' | 'active' | 'unsubscribed';
  readonly setNewsletterSearch: (s: string) => void;
  readonly setNewsletterFilter: (f: 'all' | 'active' | 'unsubscribed') => void;
  readonly reloadNewsletter: () => void;
}

export default function NewsletterTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved, newsletterSubs, newsletterSearch, newsletterFilter, setNewsletterSearch, setNewsletterFilter, reloadNewsletter }: NewsletterTabProps) {
            const q = newsletterSearch.trim().toLowerCase();
            const filtered = newsletterSubs.filter(s => {
              if (newsletterFilter === 'active' && s.unsubscribed) return false;
              if (newsletterFilter === 'unsubscribed' && !s.unsubscribed) return false;
              if (q && !s.email.toLowerCase().includes(q)) return false;
              return true;
            });
            const total = newsletterSubs.length;
            const active = newsletterSubs.filter(s => !s.unsubscribed).length;
            const unsubs = total - active;
            const toggleUnsub = async (_s: NewsletterSub) => {
              alert('Le changement de statut d’un abonné n’est pas encore exposé par l’API. Supprimez l’abonnement à la place.');
            };
            const remove = async (s: NewsletterSub) => {
              if (!confirm(`Supprimer définitivement ${s.email} ?`)) return;
              try {
                await deleteAdminNewsletter(s.id);
                reloadNewsletter();
              } catch {
                alert('Erreur lors de la suppression');
              }
            };
            const n = siteContent.newsletter;
            const update = (patch: Partial<typeof n>) => setSiteContent((c: SiteConfig) => ({ ...c, newsletter: { ...c.newsletter, ...patch } }));
            const save = async () => { await saveConfigSection('newsletter', n); };
            return (
              <div className="space-y-6">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h1 className="text-lg font-bold" style={{ color: TEXT }}>Newsletter</h1>
                    <p className="text-xs" style={{ color: TEXT3 }}>Gérer les abonnés à la newsletter.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rows = [['email', 'unsubscribed', 'created_at'], ...newsletterSubs.map((s) => [s.email, String(s.unsubscribed), s.created_at])];
                      const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'newsletter.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, fontWeight: 600, cursor: 'pointer' }}>
                    ⬇ Exporter CSV
                  </button>
                </div>

                {/* ─── Newsletter (configuration affichage) ─── */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Newsletter — Affichage</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT2 }}>
                    <input type="checkbox" checked={n.enabled} onChange={e => update({ enabled: e.target.checked })} id="newsletter-enabled" />{' '}Afficher le bloc newsletter
                  </label>
                  {(['title', 'subtitle', 'ctaLabel', 'successMessage'] as const).map(k => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                      <input value={n[k]} onChange={e => update({ [k]: e.target.value } as Partial<typeof n>)}
                        style={{ background: SURFACE2, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                    </div>
                  ))}
                  <button onClick={save} disabled={contentSaving.newsletter}
                    style={{ alignSelf: 'flex-end', background: contentSaved.newsletter ? S_SAVE_BG : GOLD2, color: contentSaved.newsletter ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    {getSaveButtonText(contentSaved.newsletter, contentSaving.newsletter)}
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { k: 'Total', v: total, c: TEXT },
                    { k: 'Actifs', v: active, c: GOLD },
                    { k: 'Désinscrits', v: unsubs, c: TEXT3 },
                  ].map(s => (
                    <div key={s.k} style={{ padding: 14, border: `1px solid ${BORDER}`, borderRadius: 10, background: '#15110B' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT3, marginBottom: 6 }}>{s.k}</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text" placeholder="Rechercher un email…"
                    value={newsletterSearch}
                    onChange={e => setNewsletterSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: '#0F0B07', color: TEXT, fontSize: 12 }}
                  />
                  {(['all', 'active', 'unsubscribed'] as const).map(f => (
                    <button key={f} onClick={() => setNewsletterFilter(f)}
                      style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${newsletterFilter === f ? GOLD : BORDER}`, background: newsletterFilter === f ? 'rgba(200,151,74,0.12)' : 'transparent', color: newsletterFilter === f ? GOLD : TEXT2, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                      {getNewsletterFilterText(f)}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#15110B' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 10, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <div>Email</div>
                    <div>Source</div>
                    <div>Date</div>
                    <div>Statut</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {filtered.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucun abonné.</div>
                  )}
                  {filtered.map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 12, color: TEXT, alignItems: 'center' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                      <div style={{ color: TEXT2, fontSize: 11 }}>{s.source ?? '—'}</div>
                      <div style={{ color: TEXT2, fontSize: 11 }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</div>
                      <div>
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: s.unsubscribed ? 'rgba(150,100,80,0.12)' : 'rgba(74,200,130,0.12)', color: s.unsubscribed ? '#B88876' : '#7AC894' }}>
                          {s.unsubscribed ? 'Désinscrit' : 'Actif'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => toggleUnsub(s)}
                          style={{ padding: '5px 9px', borderRadius: 6, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: 10, cursor: 'pointer' }}>
                          {s.unsubscribed ? 'Réactiver' : 'Désinscrire'}
                        </button>
                        <button onClick={() => remove(s)}
                          style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid #5A2B2B', background: 'transparent', color: '#C87A7A', fontSize: 10, cursor: 'pointer' }}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
}
