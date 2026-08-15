'use client';

/*
 * Les cinq actions de droite de la barre : recherche, compte, favoris, panier,
 * hamburger. Extrait de `navbar.tsx` (F-113). `iconBtn` les suit — c'est le
 * seul endroit qui s'en sert.
 *
 * Le compteur du panier est lu ici plutot que passe : la barre ne s'en servait
 * pour rien d'autre.
 */

import Link from 'next/link';
import { useCart } from '@/features/cart/cart.store';

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 13, // 18px icon + 13px*2 = 44px min touch target
  margin: -13, // compense le padding pour ne pas décaler le layout
};

interface NavActionsProps {
  readonly menuOpen: boolean;
  readonly openSearch: () => void;
  readonly toggleMenu: () => void;
}

export default function NavActions({ menuOpen, openSearch, toggleMenu }: NavActionsProps) {
  const { totalItems: totalCount, openCart } = useCart();
  return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#1A0E05' }}>
          <button aria-label="Recherche" style={iconBtn} onClick={openSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          </button>
          <Link href="/connexion" aria-label="Compte" style={{ ...iconBtn, color: '#1A0E05' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
          </Link>
          <Link href="/wishlist" aria-label="Favoris" style={{ ...iconBtn, color: '#1A0E05' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
          </Link>
          <button onClick={openCart} aria-label="Panier" style={{ ...iconBtn, color: '#1A0E05', position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 7h12l-1.5 11h-9z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
            {totalCount > 0 && (
              <span
                key={totalCount}
                className="cart-badge-pulse"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  background: '#8F5922',
                  color: '#fff',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                {totalCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-btn"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={toggleMenu}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', padding: 12, color: '#1A0E05' }}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <style jsx>{`
            .hamburger-btn { display: none; }
            @media (max-width: 900px) {
              .hamburger-btn { display: inline-flex; }
            }
          `}</style>
        </div>
  );
}
