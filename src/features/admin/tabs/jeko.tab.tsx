'use client';

/* Onglet «jeko» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { type JekoMember, type JekoRewardConfig, type JekoSettings, type JekoStats, type JekoTierConfig, type JekoTransactionAdmin } from '@/features/loyalty/jeko-admin.repository';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, GOLD2 } from '@/features/admin/admin.constant';

interface JekoTabProps {
  readonly jekoSubTab: 'config' | 'membres' | 'transactions';
  readonly setJekoSubTab: (t: 'config' | 'membres' | 'transactions') => void;
  readonly jekoTiersConf: JekoTierConfig[];
  readonly jekoRewardsConf: JekoRewardConfig[];
  readonly jekoMembers: JekoMember[];
  readonly jekoTxns: JekoTransactionAdmin[];
  readonly jekoStats: JekoStats;
  readonly jekoSettingsEdit: JekoSettings | null;
  readonly setJekoSettingsEdit: React.Dispatch<React.SetStateAction<JekoSettings | null>>;
  readonly jekoMemberSearch: string;
  readonly setJekoMemberSearch: (s: string) => void;
  readonly jekoMemberTxns: { [uid: string]: JekoTransactionAdmin[] };
  readonly setJekoMemberTxns: React.Dispatch<React.SetStateAction<{ [uid: string]: JekoTransactionAdmin[] }>>;
  readonly jekoConfSaving: boolean;
  readonly jekoConfMsg: { ok: boolean; text: string } | null;
  readonly jekoGetTierLabel: (pts: number) => JekoTierConfig;
  readonly jekoSaveSettings: () => Promise<void>;
  readonly loadMemberTxns: (uid: string) => Promise<void>;
  readonly setJekoAdjModal: React.Dispatch<React.SetStateAction<{ member: JekoMember; pts: string; label: string; notify: boolean } | null>>;
  readonly setJekoAdjMsg: (m: { ok: boolean; text: string } | null) => void;
  readonly setJekoRewardEdit: React.Dispatch<React.SetStateAction<JekoRewardConfig | null>>;
  readonly setJekoTierEdit: React.Dispatch<React.SetStateAction<JekoTierConfig | null>>;
}

export default function JekoTab({ jekoSubTab, setJekoSubTab, jekoTiersConf, jekoRewardsConf, jekoMembers, jekoTxns, jekoStats, jekoSettingsEdit, setJekoSettingsEdit, jekoMemberSearch, setJekoMemberSearch, jekoMemberTxns, setJekoMemberTxns, jekoConfSaving, jekoConfMsg, jekoGetTierLabel, jekoSaveSettings, loadMemberTxns, setJekoAdjModal, setJekoAdjMsg, setJekoRewardEdit, setJekoTierEdit }: JekoTabProps) {
            const filteredMembers = jekoMembers.filter(m => {
              const q = jekoMemberSearch.toLowerCase();
              return !q || m.email?.toLowerCase().includes(q) || (m.prenom + ' ' + m.nom).toLowerCase().includes(q);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: GOLD }}>✦ SD Fidélité — Programme de Points</h2>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Membres actifs', value: jekoStats.totalMembers, icon: '👥' },
                    { label: 'Points distribués', value: jekoStats.totalPointsDistributed.toLocaleString('fr-FR'), icon: '✦' },
                    { label: 'Échanges', value: jekoStats.totalRedemptions, icon: '🎁' },
                  ].map(s => (
                    <div key={s.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px 20px' }}>
                      <p style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.icon} {s.label}</p>
                      <p style={{ color: GOLD, fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Sub-tab nav */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['config', 'membres', 'transactions'] as const).map(st => {
                    const jekoTabLabel: Record<string, string> = { config: '⚙️ Configuration', membres: '👥 Membres', transactions: '📋 Transactions' };
                    return (
                    <button key={st} onClick={() => setJekoSubTab(st)}
                      style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${jekoSubTab === st ? GOLD : BORDER}`, background: jekoSubTab === st ? `${GOLD}22` : 'transparent', color: jekoSubTab === st ? GOLD : TEXT2, textTransform: 'capitalize' }}>
                      {jekoTabLabel[st]}
                    </button>
                    );
                  })}
                </div>

                {/* ── CONFIG SUB-TAB ── */}
                {jekoSubTab === 'config' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Paramètres */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>⚙️ Paramètres généraux</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points par 1000 F CFA</span>
                          <input type="number" value={jekoSettingsEdit?.points_per_1000 ?? 0}
                            onChange={e => setJekoSettingsEdit(s => s ? { ...s, points_per_1000: +e.target.value } : s)}
                            style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '14px', fontWeight: 700, outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bonus bienvenue (pts)</span>
                          <input type="number" value={jekoSettingsEdit?.welcome_bonus ?? 0}
                            onChange={e => setJekoSettingsEdit(s => s ? { ...s, welcome_bonus: +e.target.value } : s)}
                            style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '14px', fontWeight: 700, outline: 'none' }} />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px' }}>
                        <button onClick={jekoSaveSettings} disabled={jekoConfSaving}
                          style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: GOLD2, color: BG, opacity: jekoConfSaving ? 0.5 : 1 }}>
                          {jekoConfSaving ? '…' : '💾 Sauvegarder'}
                        </button>
                        {jekoConfMsg && <span style={{ fontSize: '12px', color: jekoConfMsg.ok ? '#4ade80' : '#f87171' }}>{jekoConfMsg.text}</span>}
                      </div>
                    </div>

                    {/* Paliers */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🏆 Paliers</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {jekoTiersConf.map((t, i) => (
                          <div key={`tier-${t.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: SURFACE2, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                            <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{t.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: TEXT, fontSize: '13px' }}>{t.label}</p>
                              <p style={{ color: TEXT3, fontSize: '11px' }}>
                                {t.min} pts → {t.next === null ? '∞' : `${t.next} pts`}
                                {i < jekoTiersConf.length - 1 && ` • prochain: ${jekoTiersConf[i + 1]?.label}`}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }} />
                              <button onClick={() => setJekoTierEdit({ ...t })}
                                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                                Modifier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Récompenses */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🎁 Récompenses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {jekoRewardsConf.map((r, i) => (
                          <div key={`reward-${r.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: SURFACE2, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                            <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: TEXT, fontSize: '13px' }}>{r.label}</p>
                              <p style={{ color: TEXT3, fontSize: '11px' }}>{r.pts} pts · {r.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '99px', background: r.active ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)', color: r.active ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                                {r.active ? 'Actif' : 'Inactif'}
                              </span>
                              <button onClick={() => setJekoRewardEdit({ ...r })}
                                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                                Modifier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MEMBRES SUB-TAB ── */}
                {jekoSubTab === 'membres' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input placeholder="Rechercher par nom ou email…" value={jekoMemberSearch}
                        onChange={e => setJekoMemberSearch(e.target.value)}
                        style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                      <a href="/api/jeko/export?type=members" download
                        style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        ⬇ Exporter CSV
                      </a>
                    </div>

                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                            {['Membre', 'Email', 'Points', 'Palier', 'Inscrit', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.length === 0 && (
                            <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Aucun membre</td></tr>
                          )}
                          {filteredMembers.map(m => {
                            const tierInfo = jekoGetTierLabel(m.points ?? 0);
                            return (
                              <React.Fragment key={m.id}>
                                <tr style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                                  onClick={() => {
                                    loadMemberTxns(m.id); // uses component-level loadMemberTxns
                                    setJekoMemberTxns({ ...jekoMemberTxns });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      loadMemberTxns(m.id);
                                      setJekoMemberTxns({ ...jekoMemberTxns });
                                    }
                                  }}
                                  tabIndex={0}
                                  aria-expanded={!!jekoMemberTxns[m.id]}
                                  aria-label={`Voir les transactions de ${[m.prenom, m.nom].filter(Boolean).join(' ') || m.email}`}>
                                  <td style={{ padding: '10px 14px', color: TEXT, fontSize: '13px', fontWeight: 600 }}>
                                    {[m.prenom, m.nom].filter(Boolean).join(' ') || '—'}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: TEXT2, fontSize: '12px' }}>{m.email}</td>
                                  <td style={{ padding: '10px 14px', color: GOLD, fontSize: '14px', fontWeight: 800 }}>
                                    {(m.points ?? 0).toLocaleString('fr-FR')}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    {tierInfo && (
                                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', background: `${tierInfo.color}22`, color: tierInfo.color, fontWeight: 700 }}>
                                        {tierInfo.emoji} {tierInfo.label}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: TEXT3, fontSize: '11px' }}>
                                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <button
                                      onClick={e => { e.stopPropagation(); setJekoAdjMsg(null); setJekoAdjModal({ member: m, pts: '', label: '', notify: true }); }}
                                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(200,151,74,.15)', color: GOLD }}>
                                      ± Ajuster
                                    </button>
                                  </td>
                                </tr>
                                {/* Historique inline */}
                                {jekoMemberTxns[m.id] && (
                                  <tr>
                                    <td colSpan={6} style={{ padding: '0 14px 12px 14px', background: SURFACE2 }}>
                                      <p style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '10px 0 6px' }}>
                                        Dernières transactions
                                      </p>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {jekoMemberTxns[m.id].slice(0, 8).map(tx => (
                                          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                            <span style={{ color: tx.points > 0 ? '#4ade80' : '#f87171', fontWeight: 700, minWidth: '50px' }}>
                                              {tx.points > 0 ? `+${tx.points}` : tx.points}
                                            </span>
                                            <span style={{ color: TEXT2 }}>{tx.label ?? tx.reason}</span>
                                            <span style={{ color: TEXT3, marginLeft: 'auto', fontSize: '10px' }}>
                                              {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── TRANSACTIONS SUB-TAB ── */}
                {jekoSubTab === 'transactions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <a href="/api/jeko/export?type=transactions" download
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, textDecoration: 'none' }}>
                        ⬇ Exporter CSV
                      </a>
                    </div>
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          {['Date', 'User ID', 'Points', 'Raison', 'Label'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jekoTxns.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: TEXT3 }}>Aucune transaction</td></tr>
                        )}
                        {jekoTxns.map(tx => (
                          <tr key={tx.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: '9px 14px', color: TEXT3, fontSize: '11px' }}>
                              {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '9px 14px', color: TEXT3, fontSize: '10px', fontFamily: 'monospace' }}>
                              {tx.user_id.slice(0, 8)}…
                            </td>
                            <td style={{ padding: '9px 14px', fontWeight: 800, fontSize: '13px', color: tx.points > 0 ? '#4ade80' : '#f87171' }}>
                              {tx.points > 0 ? `+${tx.points}` : tx.points}
                            </td>
                            <td style={{ padding: '9px 14px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', background: SURFACE2, color: TEXT2, fontWeight: 600 }}>{tx.reason}</span>
                            </td>
                            <td style={{ padding: '9px 14px', color: TEXT2, fontSize: '12px' }}>{tx.label ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}

              </div>
            );
}
