'use client';

/*
 * Barre de navigation basse — mobile uniquement (masquée dès le palier où
 * la nav desktop complète apparaît, cf. navbar.tsx). Cinq destinations,
 * indicateur actif animé façon application native.
 */

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@/features/cart/cart.store';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { useAuthStatus } from '@/shared/hooks/auth-status.hook';

function HomeIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l-1.3 12.1a2 2 0 0 1-2 1.9H9.3a2 2 0 0 1-2-1.9L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const authenticated = useAuthStatus();
  const prefersReducedMotion = useReducedMotion();

  if (pathname.startsWith('/admin')) return null;

  interface Tab {
    id: string;
    href: string | null;
    label: string;
    icon: () => React.JSX.Element;
    active: boolean;
    badge?: number;
    onClick?: () => void;
  }

  const tabs: Tab[] = [
    { id: 'home', href: '/', label: 'Accueil', icon: HomeIcon, active: pathname === '/' },
    { id: 'shop', href: '/boutique', label: 'Boutique', icon: ShopIcon, active: pathname.startsWith('/boutique') || pathname.startsWith('/categorie') || pathname.startsWith('/produit') },
    { id: 'wishlist', href: '/wishlist', label: 'Favoris', icon: HeartIcon, active: pathname === '/wishlist', badge: wishlistItems.length },
    { id: 'cart', href: null, label: 'Panier', icon: BagIcon, active: false, badge: totalItems, onClick: openCart },
    { id: 'account', href: authenticated ? '/compte' : '/connexion', label: 'Compte', icon: UserIcon, active: pathname === '/connexion' || pathname === '/compte' },
  ];

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="bottom-nav"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 55,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(26,14,5,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const content = (
          <>
            <span style={{ position: 'relative', display: 'flex' }}>
              <motion.span
                whileTap={prefersReducedMotion ? undefined : { scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{ display: 'flex', color: tab.active ? '#8F5922' : '#7A6A5A' }}
              >
                <Icon />
              </motion.span>
              {Boolean(tab.badge) && tab.badge! > 0 && (
                <span
                  key={tab.badge}
                  className="cart-badge-pulse"
                  style={{
                    position: 'absolute', top: -4, right: -8,
                    minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999,
                    background: '#8F5922', color: '#fff', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {tab.badge! > 9 ? '9+' : tab.badge}
                </span>
              )}
              {tab.active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                  style={{
                    position: 'absolute', inset: -6, borderRadius: 12,
                    background: 'rgba(143,89,34,0.1)', zIndex: -1,
                  }}
                />
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: tab.active ? 700 : 500, color: tab.active ? '#8F5922' : '#7A6A5A' }}>
              {tab.label}
            </span>
          </>
        );

        const itemStyle: React.CSSProperties = {
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '8px 0 6px',
          textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer',
          minHeight: 44,
        };

        return tab.href ? (
          <Link key={tab.id} href={tab.href} style={itemStyle} aria-current={tab.active ? 'page' : undefined}>
            {content}
          </Link>
        ) : (
          <button key={tab.id} onClick={tab.onClick} style={itemStyle} aria-label={tab.label}>
            {content}
          </button>
        );
      })}

      <style jsx>{`
        .bottom-nav {
          display: flex;
        }
        @media (min-width: 1280px) {
          .bottom-nav { display: none; }
        }
      `}</style>
    </nav>
  );
}
