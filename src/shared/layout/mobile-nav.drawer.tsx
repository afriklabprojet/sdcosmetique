'use client';

/*
 * Tiroir de navigation mobile. Extrait de `navbar.tsx` (F-113).
 *
 * Il ne detient rien : la barre possede l'ouverture, parce que c'est elle qui
 * porte le bouton hamburger et qui doit bloquer le defilement de la page tant
 * que le tiroir est la.
 */

import Link from 'next/link';
import { NAV, isNavItemActive } from '@/shared/layout/navigation.constant';

interface MobileNavDrawerProps {
  readonly pathname: string;
  readonly onClose: () => void;
}

export default function MobileNavDrawer({ pathname, onClose }: MobileNavDrawerProps) {
  return (
        <div
          style={{
            position: 'fixed', inset: 0, top: 67, zIndex: 49,
            background: '#fff', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
            padding: '24px 24px 40px',
            borderTop: '1px solid rgba(143,89,34,0.1)',
            animation: 'searchFade 0.2s ease',
          }}
        >
          <nav aria-label="Menu mobile" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map((it) => {
              const isActive = isNavItemActive(it.href, pathname);
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  onClick={onClose}
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '1rem', fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: isActive ? '#8F5922' : '#1A0E05',
                    textDecoration: 'none',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(143,89,34,0.08)',
                  }}
                >{it.label}</Link>
              );
            })}
          </nav>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/connexion" onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.9rem', color: '#1A0E05', textDecoration: 'none',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
              Mon compte
            </Link>
            <Link href="/wishlist" onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.9rem', color: '#1A0E05', textDecoration: 'none',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
              Mes favoris
            </Link>
          </div>
        </div>
  );
}
