'use client';

/*
 * Colonne de gauche de l'espace client : identite, navigation, deconnexion,
 * encart Club Prive. Extraite de `app/compte/page.tsx` (F-111).
 *
 * `NAV_ITEMS` la suit : la table etait declaree au niveau module et referencait
 * les icones avant leur declaration ; elle n'a de sens que pour ce menu.
 */

import { resolveJekoTier, type JekoConfig } from '@/features/loyalty/jeko.constant';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { NavItem } from '@/features/account/account.constant';
import {
  HomeIcon, BoxIcon, PinIcon, CardIcon, HeartIcon, StarIcon,
  UserIcon, GiftIcon, MailIcon, SettingsIcon, LogoutIcon,
} from '@/features/account/assets/account-icons';

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard',   label: 'Tableau de bord', icon: <HomeIcon /> },
  { id: 'commandes',   label: 'Mes commandes',   icon: <BoxIcon /> },
  { id: 'adresses',    label: 'Mes adresses',     icon: <PinIcon /> },
  { id: 'paiements',   label: 'Mes paiements',    icon: <CardIcon /> },
  { id: 'favoris',     label: 'Mes favoris',      icon: <HeartIcon /> },
  { id: 'avis',        label: 'Mes avis',         icon: <StarIcon /> },
  { id: 'profil',      label: 'Mon profil',       icon: <UserIcon /> },
  { id: 'points',      label: 'Mes points',       icon: <GiftIcon /> },
  { id: 'newsletter',  label: 'Newsletter',       icon: <MailIcon /> },
  { id: 'parametres',  label: 'Paramètres',       icon: <SettingsIcon /> },
];

interface AccountSidebarProps {
  readonly mobile: boolean;
  readonly active: NavItem;
  readonly navigate: (tab: NavItem) => void;
  readonly initial: string;
  readonly displayName: string;
  readonly displayEmail: string;
  readonly userPoints: number;
  readonly jekoConfig: JekoConfig;
  readonly logout: () => void;
}

export default function AccountSidebar({
  mobile, active, navigate, initial, displayName, displayEmail,
  userPoints, jekoConfig, logout,
}: AccountSidebarProps) {
  return (
          <aside style={{ width: mobile ? '100%' : 240, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDE8E0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(61,20,0,.05)' }}>

              {/* Avatar + nom */}
              <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F5F0E8', background: 'linear-gradient(135deg,#FAF8F5 0%,#F5F0E8 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#3D1400,#6B3D14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 2px 8px rgba(61,20,0,.25)',
                  }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{initial}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                    <p style={{ fontSize: 10, color: '#9A8A7A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                      background: resolveJekoTier(userPoints, jekoConfig.tiers).bg, borderRadius: 99, padding: '2px 8px',
                      fontSize: 10, fontWeight: 700, color: resolveJekoTier(userPoints, jekoConfig.tiers).textColor,
                    }}>{resolveJekoTier(userPoints, jekoConfig.tiers).emoji}{' '}Membre {resolveJekoTier(userPoints, jekoConfig.tiers).label}</span>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: '8px' }}>
                {NAV_ITEMS.map(item => {
                  const current = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', textAlign: 'left', border: 'none', cursor: 'pointer',
                        background: current ? '#3D1400' : 'transparent',
                        color: current ? '#fff' : '#4A3828',
                        fontSize: 13, fontWeight: current ? 600 : 400,
                        borderRadius: 10,
                        transition: 'all .15s',
                        marginBottom: 2,
                      }}
                    >
                      <span style={{ opacity: current ? 1 : 0.55, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: current ? 'rgba(255,255,255,.2)' : '#FFF3E0',
                          color: current ? '#FFD89B' : '#92400E',
                        }}>{item.badge}</span>
                      )}
                      {item.id === 'points' && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: current ? 'rgba(255,255,255,.2)' : '#FFF3E0',
                          color: current ? '#FFD89B' : '#92400E',
                        }}>{userPoints} pts</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Séparateur */}
              <div style={{ height: 1, background: '#F5F0E8', margin: '0 8px' }} />

              {/* Déconnexion */}
              <div style={{ padding: '8px' }}>
                <button
                  onClick={logout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', border: 'none', cursor: 'pointer',
                    background: 'transparent', color: '#DC2626', fontSize: 13, fontWeight: 500,
                    borderRadius: 10, transition: 'all .15s',
                  }}
                >
                  <span style={{ display: 'flex', opacity: .7 }}><LogoutIcon /></span>
                  {' '}
                  Déconnexion
                </button>
              </div>

              {/* Club Privé promo */}
              <div style={{ margin: '0 8px 8px', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg,#3D1400 0%,#5A2800 100%)', position: 'relative' }}>
                <div style={{ padding: '16px 14px 12px' }}>
                  <p style={{ color: '#D4A96A', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Exclusif</p>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>{(DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique').toUpperCase()}<br />CLUB PRIVÉ</p>
                  <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 10, margin: '0 0 12px', lineHeight: 1.5 }}>Des avantages exclusifs rien que pour vous !</p>
                  <button style={{
                    width: '100%', padding: '8px 0', background: 'linear-gradient(90deg,#C8974A,#E8B870)',
                    border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}>DÉCOUVRIR</button>
                </div>
              </div>

            </div>
          </aside>
  );
}
