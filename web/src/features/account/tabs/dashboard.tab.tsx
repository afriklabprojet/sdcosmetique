'use client';

/* Tableau de bord de l'espace client. Extrait de `app/compte/page.tsx` (F-111). */

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/shared/types/domain.type';
import { formatPrice } from '@/features/catalog/product.query';
import { resolveJekoTier, type JekoConfig } from '@/features/loyalty/jeko.constant';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import { STATUS_CONFIG, type DisplayOrder, type NavItem } from '@/features/account/account.constant';

interface DashboardTabProps {
  readonly mobile: boolean;
  readonly navigate: (tab: NavItem) => void;
  readonly ordersForDisplay: DisplayOrder[];
  readonly displayName: string;
  readonly displayEmail: string;
  readonly displayPhone: string;
  readonly createdAt: string;
  readonly wishlistItems: Product[];
  readonly userPoints: number;
  readonly jekoConfig: JekoConfig;
  readonly compteHeroBg: string;
  readonly parrainageHeroBg: string;
}

export default function DashboardTab({
  mobile, navigate, ordersForDisplay, displayName, displayEmail, displayPhone,
  createdAt, wishlistItems, userPoints, jekoConfig, compteHeroBg, parrainageHeroBg,
}: DashboardTabProps) {
  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ROW 1: Welcome + Points */}
                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Welcome card */}
                  <div style={{
                    borderRadius: 20, overflow: 'hidden', position: 'relative',
                    background: '#1C0A00',
                    minHeight: 220,
                  }}>
                    {/* Photo plein fond */}
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <Image src={compteHeroBg} alt="SD Cosmétique" fill sizes="70vw" loading="eager"
                        style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
                    </div>
                    {/* Overlay dégradé horizontal */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(28,10,0,.96) 0%, rgba(61,20,0,.88) 42%, rgba(61,20,0,.45) 65%, transparent 100%)' }} />

                    <div style={{ position: 'relative', padding: '32px 32px 28px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Badge membre */}
                      <div style={{ marginBottom: 14 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'linear-gradient(135deg,rgba(200,151,74,.22) 0%,rgba(212,169,106,.18) 100%)',
                          border: '1px solid rgba(200,151,74,.35)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 99, padding: '5px 14px',
                          fontSize: 10, color: '#E8C47A', fontWeight: 800,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#E8C47A"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Membre {resolveJekoTier(userPoints, jekoConfig.tiers).label}
                        </span>
                      </div>

                      {/* Nom */}
                      <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                        Bienvenue
                      </p>
                      <h1 style={{
                        color: '#FFFFFF', fontSize: 32, fontWeight: 800,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16,
                      }}>
                        {displayName}
                      </h1>

                      {/* Séparateur doré */}
                      <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#C8974A,#E8C47A)', borderRadius: 99, marginBottom: 14 }} />

                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, lineHeight: 1.6, marginBottom: 22, maxWidth: 240, fontWeight: 400 }}>
                        Merci de faire partie de la famille<br />
                        <span style={{ color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique'}.</span>
                      </p>

                      {/* CTA */}
                      <div>
                        <button
                          onClick={() => navigate('profil')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 22px',
                            background: 'linear-gradient(135deg,#C8974A 0%,#D4A96A 100%)',
                            border: 'none', borderRadius: 12,
                            color: '#fff', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.02em',
                            boxShadow: '0 4px 16px rgba(200,151,74,.35)',
                          }}
                        >
                          Voir mon profil
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Points card */}
                  <div style={{
                    background: '#fff', borderRadius: 20, border: '1px solid #EDE8E0',
                    padding: '24px 22px', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 2px 12px rgba(61,20,0,.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#9A8A7A', textTransform: 'uppercase' }}>Mes Points</p>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#FDF0E0,#FAE4C0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8974A" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                    </div>
                    <p style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 48, fontWeight: 900, color: '#1A1A1A', lineHeight: 1, letterSpacing: '-0.03em' }}>{userPoints}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#C8974A', marginLeft: 6 }}>pts</span>
                    </p>
                    <p style={{ fontSize: 11, color: '#9A8A7A', marginBottom: 16, lineHeight: 1.4 }}>
                      Plus que <strong style={{ color: '#3D1400' }}>{Math.max(0, 500 - userPoints)} pts</strong> pour une réduction.
                    </p>
                    {/* Progress bar */}
                    <div style={{ background: '#F5F0E8', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{ width: `${Math.min(100, Math.round((userPoints / 500) * 100))}%`, height: '100%', background: 'linear-gradient(90deg,#C8974A,#E8C47A)', borderRadius: 99 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <span style={{ fontSize: 10, color: '#9A8A7A' }}>{userPoints} pts</span>
                      <span style={{ fontSize: 10, color: '#9A8A7A' }}>500 pts</span>
                    </div>
                    <button
                      onClick={() => navigate('points')}
                      style={{
                        padding: '10px 0', background: '#3D1400', border: 'none',
                        borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Voir mes récompenses
                    </button>
                  </div>
                </div>

                {/* ROW 2: Commandes + Favoris */}
                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Commandes table */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F5F0E8' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#1A1A1A', textTransform: 'uppercase' }}>Mes Commandes</p>
                      <button onClick={() => navigate('commandes')} style={{ fontSize: 11, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Voir toutes →
                      </button>
                    </div>
                    {ordersForDisplay.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 10 }}>Aucune commande pour le moment.</p>
                        <Link href="/boutique" style={{ fontSize: 12, color: '#C8974A', fontWeight: 600 }}>Découvrir la boutique →</Link>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#FAF8F5' }}>
                            {['Commande', 'Date', 'Statut', 'Montant', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8A7A', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ordersForDisplay.slice(0, 5).map((order) => {
                            const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['Confirmée'];
                            return (
                              <tr key={order.id} style={{ borderTop: '1px solid #F5F0E8' }}>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{order.id}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#7A6A5A', whiteSpace: 'nowrap' }}>{order.date}</td>
                                <td style={{ padding: '11px 14px' }}>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                    background: st.bg, color: st.color,
                                  }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                                    {st.label}
                                  </span>
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{order.total}</td>
                                <td style={{ padding: '11px 14px' }}>
                                  <button style={{
                                    padding: '4px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0',
                                    borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#6B3D14', cursor: 'pointer',
                                  }}>Détails</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Favoris */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F5F0E8' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#1A1A1A', textTransform: 'uppercase' }}>Mes Favoris</p>
                      <button onClick={() => navigate('favoris')} style={{ fontSize: 11, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Voir tous →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 0 }}>
                      {wishlistItems.length === 0 ? (
                        <p style={{ padding: '20px', fontSize: 12, color: '#9A8A7A', gridColumn: '1 / -1', textAlign: 'center' }}>Aucun favori pour l&apos;instant</p>
                      ) : wishlistItems.slice(0, 4).map((fav, i) => (
                        <div key={fav.id} style={{
                          padding: '12px', borderRight: i % 2 === 0 ? '1px solid #F5F0E8' : 'none',
                          borderBottom: i < 2 ? '1px solid #F5F0E8' : 'none',
                          position: 'relative',
                        }}>
                          <button style={{
                            position: 'absolute', top: 8, right: 8, width: 22, height: 22,
                            background: 'rgba(255,255,255,.9)', border: '1px solid #EDE8E0',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: 11, color: '#C8974A',
                          }}>♥</button>
                          <div style={{ height: 72, background: '#FAF8F5', borderRadius: 8, marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
                            <Image src={fav.images?.[0] ?? '/products/serum.svg'} alt={fav.name} fill style={{ objectFit: 'contain', padding: 6 }} />
                          </div>
                          <p style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{fav.name}</p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#C8974A' }}>{formatPrice(fav.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 3: Infos compte + Parrainage */}
                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Infos compte */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: '#8B4513', textTransform: 'uppercase' }}>Informations du compte</p>
                      <button onClick={() => navigate('profil')} style={{ fontSize: 13, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Modifier</button>
                    </div>

                    {/* Champs 2x2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                      {[
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Nom complet', val: displayName },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label: 'Téléphone', val: displayPhone || 'Non renseigné' },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', val: displayEmail },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Date d'inscription", val: createdAt },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>{item.svg}</span>
                          <div>
                            <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4, fontWeight: 400 }}>{item.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{item.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parrainage */}
                  <div style={{
                    borderRadius: 16, overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg,#FFF7ED 0%,#FEF3E8 100%)',
                    border: '1px solid #F5DDB8',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
                      <Image src={parrainageHeroBg} alt="" fill sizes="33vw" style={{ objectFit: 'cover', opacity: .25 }} />
                    </div>
                    <div style={{ position: 'relative', padding: '24px 20px' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#92400E', textTransform: 'uppercase', marginBottom: 8 }}>Parrainez et gagnez</p>
                      <p style={{ fontSize: 12, color: '#7A5A3A', lineHeight: 1.5, marginBottom: 18 }}>
                        Parrainez vos proches et gagnez des points à chaque parrainage.
                      </p>
                      <button
                        onClick={() => navigate('points')}
                        style={{
                          width: '100%', padding: '10px 0', background: '#C8974A',
                          border: 'none', borderRadius: 10, color: '#fff',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Parrainer maintenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  );
}
