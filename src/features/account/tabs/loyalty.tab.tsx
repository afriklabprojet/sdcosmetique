'use client';

/*
 * Programme de fidelite Jeko : carte, progression, recompenses, historique.
 * Extrait de `app/compte/page.tsx` (F-111), ou il occupait a lui seul 300
 * lignes derriere une IIFE. Les trois valeurs que cette IIFE calculait —
 * palier, seuil suivant, progression — sont maintenant calculees ici.
 */

import {
  resolveJekoTier, formatJekoDate, reasonLabel,
  type JekoConfig, type JekoReward, type JekoTransaction,
} from '@/features/loyalty/jeko.constant';
import { getTierGradient, getTransactionIcon, jekoNextLabel } from '@/features/account/account.util';

type Message = { type: 'ok' | 'err'; text: string } | null;

interface LoyaltyTabProps {
  readonly mobile: boolean;
  readonly displayEmail: string;
  readonly memberName: string;
  readonly userPoints: number;
  readonly jekoHistory: JekoTransaction[];
  readonly jekoConfig: JekoConfig;
  readonly redeemingReward: JekoReward | null;
  readonly setRedeemingReward: (r: JekoReward | null) => void;
  readonly redeemMsg: Message;
  readonly setRedeemMsg: (m: Message) => void;
  readonly redeemReward: () => void;
}

export default function LoyaltyTab({
  mobile, displayEmail, memberName, userPoints, jekoHistory, jekoConfig,
  redeemingReward, setRedeemingReward, redeemMsg, setRedeemMsg, redeemReward,
}: LoyaltyTabProps) {
  const tier = resolveJekoTier(userPoints, jekoConfig.tiers);
  const nextPts = tier.next === Infinity ? userPoints : tier.next;
  const progress = tier.next === Infinity ? 100 : Math.min(100, Math.round((userPoints / tier.next) * 100));

  return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── Message rédemption ── */}
                  {redeemMsg && (
                    <div style={{
                      padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                      background: redeemMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
                      color: redeemMsg.type === 'ok' ? '#059669' : '#DC2626',
                      border: `1px solid ${redeemMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>{redeemMsg.text}</span>
                      <button onClick={() => setRedeemMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', opacity: .6 }}>✕</button>
                    </div>
                  )}

                  {/* ── Modal confirmation rédemption ── */}
                  {redeemingReward && (
                    <div style={{
                      position: 'fixed', inset: 0, zIndex: 9999,
                      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
                        <p style={{ fontSize: 40, marginBottom: 12 }}>{redeemingReward.icon}</p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Confirmer la récompense</h3>
                        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 6 }}>{redeemingReward.description}</p>
                        <p style={{ fontSize: 13, color: '#C8974A', fontWeight: 700, marginBottom: 24 }}>
                          {redeemingReward.pts} points seront déduits de votre solde.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => setRedeemingReward(null)}
                            style={{ flex: 1, padding: '12px 0', background: '#F5F0E8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#3D1400', cursor: 'pointer' }}
                          >
                            Annuler
                          </button>
                          <button
                            onClick={redeemReward}
                            style={{ flex: 1, padding: '12px 0', background: '#3D1400', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                          >
                            Confirmer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Carte de fidélité ── */}
                  <div style={{
                    position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto',
                    aspectRatio: '1.586 / 1',
                    borderRadius: 20,
                    background: getTierGradient(tier.label),
                    boxShadow: '0 20px 60px rgba(0,0,0,.35), 0 4px 16px rgba(0,0,0,.2)',
                    overflow: 'hidden',
                    color: '#fff',
                    userSelect: 'none',
                  }}>
                    {/* Cercles décoratifs */}
                    <div style={{
                      position: 'absolute', top: -40, right: -40,
                      width: 200, height: 200, borderRadius: '50%',
                      background: 'rgba(255,255,255,.05)',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: -60, left: -20,
                      width: 240, height: 240, borderRadius: '50%',
                      background: 'rgba(255,255,255,.04)',
                    }} />
                    {/* Lignes diagonales décoratives */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.015) 40px, rgba(255,255,255,.015) 41px)',
                    }} />

                    {/* Contenu */}
                    <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>

                      {/* Ligne haute */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        {/* Logo SD */}
                        <div>
                          <p style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
                            SD<span style={{ opacity: .6, fontWeight: 400 }}> cosmétique</span>
                          </p>
                          <p style={{ fontSize: 9, opacity: .5, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Carte de Fidélité</p>
                        </div>
                        {/* Chip NFC */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{
                            width: 36, height: 28, borderRadius: 6,
                            background: 'linear-gradient(135deg, rgba(255,215,100,.6), rgba(255,215,100,.2))',
                            border: '1px solid rgba(255,215,100,.4)',
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                            gap: 2, padding: 4, boxSizing: 'border-box',
                          }}>
                            {['chip-1', 'chip-2', 'chip-3', 'chip-4'].map(segment => (
                              <div key={segment} style={{ background: 'rgba(255,215,100,.35)', borderRadius: 1 }} />
                            ))}
                          </div>
                          {/* WiFi NFC icon */}
                          <svg width="18" height="14" viewBox="0 0 24 18" fill="none" style={{ opacity: .5 }}>
                            <path d="M12 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="white"/>
                            <path d="M6.5 11C7.9 9.3 9.8 8 12 8s4.1 1.3 5.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            <path d="M2 7C4.6 4 8.1 2 12 2s7.4 2 10 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity=".5"/>
                          </svg>
                        </div>
                      </div>

                      {/* Points au centre */}
                      <div>
                        <p style={{ fontSize: 9, opacity: .5, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Solde SD</p>
                        <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {userPoints.toLocaleString('fr-FR')}
                          <span style={{ fontSize: 16, fontWeight: 500, opacity: .6, marginLeft: 6 }}>pts</span>
                        </p>
                        <p style={{ fontSize: 10, opacity: .5, marginTop: 4 }}>≈ {(userPoints * 10).toLocaleString('fr-FR')} FCFA de réduction</p>
                      </div>

                      {/* Ligne basse */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        {/* Nom membre */}
                        <div>
                          <p style={{ fontSize: 9, opacity: .45, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>Membre</p>
                          {[memberName || displayEmail || 'SD Client'].map(n => (
                            <p key={n} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              {n.length > 22 ? n.slice(0, 22) + '…' : n}
                            </p>
                          ))}
                        </div>
                        {/* Badge tier */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(255,255,255,.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,.2)',
                            borderRadius: 99, padding: '5px 12px',
                          }}>
                            <span style={{ fontSize: 14 }}>{tier.emoji}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tier.label}</span>
                          </div>
                          {tier.next !== Infinity && (
                            <p style={{ fontSize: 9, opacity: .45, marginTop: 4 }}>
                              {(tier.next - userPoints).toLocaleString('fr-FR')} pts → {jekoNextLabel(tier.label, jekoConfig.tiers)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Progression ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Progression Jeko
                      </p>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: tier.bg, color: tier.textColor,
                      }}>
                        {tier.emoji} {tier.label}
                        {tier.next !== Infinity && ` → ${jekoNextLabel(tier.label, jekoConfig.tiers)}`}
                      </span>
                    </div>
                    <div style={{ background: '#F5F0E8', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${tier.color},#E8C47A)`, borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A8A7A' }}>
                      <span>{userPoints} pts</span>
                      <span>{tier.next === Infinity ? '🏆 Niveau max !' : `${nextPts} pts`}</span>
                    </div>
                  </div>

                  {/* ── Récompenses ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Récompenses disponibles
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
                      {jekoConfig.rewards.filter(r => r.active !== false).map(r => {
                        const unlocked = userPoints >= r.pts;
                        return (
                          <div key={r.id} style={{
                            borderRadius: 12,
                            border: `1px solid ${unlocked ? '#C8974A' : '#EDE8E0'}`,
                            padding: '16px 12px', textAlign: 'center',
                            background: unlocked ? '#FFF7ED' : '#FAFAF8',
                            opacity: unlocked ? 1 : 0.6,
                            transition: 'all .2s',
                          }}>
                            <p style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>{r.label}</p>
                            <p style={{ fontSize: 10, color: '#9A8A7A', marginBottom: 4 }}>{r.description}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#C8974A', marginBottom: 12 }}>{r.pts} points</p>
                            <button
                              disabled={!unlocked}
                              onClick={() => { setRedeemMsg(null); setRedeemingReward(r); }}
                              style={{
                                width: '100%', padding: '8px 0',
                                background: unlocked ? '#3D1400' : '#EDE8E0',
                                border: 'none', borderRadius: 8,
                                color: unlocked ? '#fff' : '#9A8A7A',
                                fontSize: 11, fontWeight: 700,
                                cursor: unlocked ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {unlocked ? 'Utiliser' : 'Bloqué'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Comment gagner des points ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Comment gagner des Jeko ?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                      {[
                        { icon: '🛍️', title: 'Chaque achat', desc: '10 pts pour 1 000 FCFA dépensés' },
                        { icon: '🎉', title: 'Inscription', desc: '20 pts offerts à la bienvenue' },
                        { icon: '👥', title: 'Parrainage', desc: '50 pts par ami parrainé' },
                        { icon: '⭐', title: 'Laisser un avis', desc: '5 pts par avis produit vérifié' },
                      ].map(item => (
                        <div key={item.title} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '12px 14px', background: '#FAF8F5', borderRadius: 10,
                          border: '1px solid #F0EBE3',
                        }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{item.title}</p>
                            <p style={{ fontSize: 11, color: '#9A8A7A' }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Historique ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Historique des points
                    </p>
                    {jekoHistory.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#9A8A7A', textAlign: 'center', padding: '20px 0' }}>
                        Aucune transaction pour le moment.
                      </p>
                    ) : (
                      jekoHistory.map((tx, i) => {
                        const credit = tx.points > 0;
                        return (
                          <div
                            key={tx.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 0',
                              borderBottom: i < jekoHistory.length - 1 ? '1px solid #F5F0E8' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: credit ? '#ECFDF5' : '#FEF2F2',
                                fontSize: 14,
                              }}>
                                {getTransactionIcon(tx.reason)}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                                  {reasonLabel(tx.reason, tx.label)}
                                </p>
                                <p style={{ fontSize: 11, color: '#9A8A7A' }}>
                                  {formatJekoDate(tx.created_at)}
                                </p>
                              </div>
                            </div>
                            <span style={{
                              fontSize: 15, fontWeight: 800,
                              color: credit ? '#059669' : '#DC2626',
                            }}>
                              {credit ? '+' : ''}{tx.points} pts
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
  );
}
