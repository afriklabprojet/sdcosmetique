'use client';

import React from 'react';

// Icônes simplifiées
const HomeIcon = () => <span>🏠</span>;
const BoxIcon = () => <span>📦</span>;
const PinIcon = () => <span>📍</span>;
const CardIcon = () => <span>💳</span>;
const HeartIcon = () => <span>❤️</span>;
const StarIcon = () => <span>⭐</span>;
const UserIcon = () => <span>👤</span>;
const GiftIcon = () => <span>🎁</span>;
const MailIcon = () => <span>📧</span>;
const SettingsIcon = () => <span>⚙️</span>;

export type NavItem = 'dashboard' | 'commandes' | 'adresses' | 'paiements' | 'favoris' | 'avis' | 'profil' | 'points' | 'newsletter' | 'parametres';

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard',   label: 'Tableau de bord', icon: <HomeIcon /> },
  { id: 'commandes',   label: 'Mes commandes',   icon: <BoxIcon /> },
  { id: 'adresses',    label: 'Mes adresses',    icon: <PinIcon /> },
  { id: 'paiements',   label: 'Mes paiements',   icon: <CardIcon /> },
  { id: 'favoris',     label: 'Mes favoris',     icon: <HeartIcon /> },
  { id: 'avis',        label: 'Mes avis',        icon: <StarIcon /> },
  { id: 'profil',      label: 'Mon profil',      icon: <UserIcon /> },
  { id: 'points',      label: 'Mes points',      icon: <GiftIcon /> },
  { id: 'newsletter',  label: 'Newsletter',      icon: <MailIcon /> },
  { id: 'parametres',  label: 'Paramètres',      icon: <SettingsIcon /> },
];

interface AccountNavProps {
  active: NavItem;
  onChange: (item: NavItem) => void;
}

export default function AccountNav({ active, onChange }: AccountNavProps) {
  return (
    <div style={{
      minWidth: '240px',
      background: '#0F0F0F',
      border: '1px solid #222',
      borderRadius: '12px',
      padding: '16px',
      height: 'fit-content'
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#D4A24E',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #222'
      }}>
        Mon Compte
      </div>
      
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: active === item.id ? '#D4A24E20' : 'transparent',
            border: active === item.id ? '1px solid #D4A24E30' : '1px solid transparent',
            borderRadius: '8px',
            color: active === item.id ? '#D4A24E' : '#CCC',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          {item.icon}
          {item.label}
          {item.badge && (
            <span style={{
              marginLeft: 'auto',
              background: '#D4A24E',
              color: '#000',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}