'use client';

/*
 * Tiroir de navigation mobile. Extrait de `navbar.tsx` (F-113).
 *
 * Il ne detient rien : la barre possede l'ouverture, parce que c'est elle qui
 * porte le bouton hamburger et qui doit bloquer le defilement de la page tant
 * que le tiroir est la.
 *
 * Repensé façon tiroir d'app native (Material/Flutter Drawer) : panneau qui
 * glisse depuis le bord plutôt qu'un plein-écran qui apparaît d'un coup,
 * fond assombri cliquable pour fermer, icône par entrée, pastille active
 * animée — même vocabulaire que la barre de navigation basse.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { NAV, navItemActive, navEntryActive } from '@/shared/layout/navigation.constant';
import { NAV_ICONS, HomeIcon } from '@/shared/layout/nav-icons';

interface MobileNavDrawerProps {
  readonly pathname: string;
  readonly close: () => void;
}

export default function MobileNavDrawer({ pathname, close }: MobileNavDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  // Ouvert d'emblée si la page courante est une des sous-catégories, pour
  // que l'entrée active soit visible sans taper une fois de plus.
  const [boutiqueOpen, setBoutiqueOpen] = useState(() =>
    NAV.some((entry) => entry.children?.some((child) => navItemActive(child.href, pathname))));

  return (
    <>
      <motion.button
        type="button"
        aria-label="Fermer le menu"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 48,
          background: 'rgba(26,14,5,0.45)',
          border: 'none', padding: 0, cursor: 'pointer',
        }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
        transition={prefersReducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 360, damping: 36 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 49,
          width: 'min(86vw, 340px)',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-12px 0 40px rgba(26,14,5,0.16)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid rgba(143,89,34,0.1)',
          paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.svg" alt="SD Cosmétique" width={32} height={32} style={{ height: 32, width: 'auto' }} />
            <span style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontWeight: 700, fontSize: '1rem', color: '#1A0E05' }}>
              SD Cosmétique
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le menu"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(143,89,34,0.08)', border: 'none', cursor: 'pointer', color: '#1A0E05',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Liste de navigation */}
        <nav aria-label="Menu mobile" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
          {NAV.map((it) => {
            const active = navEntryActive(it, pathname);
            const Icon = NAV_ICONS[it.label] ?? HomeIcon;

            if (it.children) {
              const expanded = boutiqueOpen;
              return (
                <div key={it.label}>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex', alignItems: 'stretch', gap: 0,
                      borderRadius: 12,
                      color: active ? '#8F5922' : '#1A0E05',
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="mobile-drawer-active"
                        transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                        style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(143,89,34,0.1)', zIndex: -1 }}
                      />
                    )}
                    <Link
                      href={it.href}
                      onClick={close}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 4px 12px 12px',
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em',
                        color: 'inherit', textDecoration: 'none', minHeight: 44,
                      }}
                    >
                      <span style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? 'rgba(143,89,34,0.14)' : 'rgba(26,14,5,0.05)',
                        color: active ? '#8F5922' : '#6B5A4A',
                      }}>
                        <Icon />
                      </span>
                      {it.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBoutiqueOpen((v) => !v)}
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Réduire les catégories' : 'Déplier les catégories'}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '2px 0 6px 34px' }}>
                      {it.children.map((child) => {
                        const childActive = navItemActive(child.href, pathname);
                        const ChildIcon = NAV_ICONS[child.label] ?? HomeIcon;
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={close}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '9px 10px', borderRadius: 10,
                              fontFamily: 'var(--font-inter), Inter, sans-serif',
                              fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.03em',
                              color: childActive ? '#8F5922' : '#4A3B2E',
                              background: childActive ? 'rgba(143,89,34,0.08)' : 'transparent',
                              textDecoration: 'none', minHeight: 40,
                            }}
                          >
                            <span style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: childActive ? 'rgba(143,89,34,0.14)' : 'rgba(26,14,5,0.04)',
                              color: childActive ? '#8F5922' : '#8A7A6A',
                            }}>
                              <ChildIcon />
                            </span>
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              );
            }

            return (
              <Link
                key={it.label}
                href={it.href}
                onClick={close}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 12px',
                  borderRadius: 12,
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em',
                  color: active ? '#8F5922' : '#1A0E05',
                  textDecoration: 'none',
                  minHeight: 44,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-drawer-active"
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(143,89,34,0.1)', zIndex: -1 }}
                  />
                )}
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(143,89,34,0.14)' : 'rgba(26,14,5,0.05)',
                  color: active ? '#8F5922' : '#6B5A4A',
                }}>
                  <Icon />
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Compte / favoris */}
        <div style={{
          padding: '14px 20px', paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid rgba(143,89,34,0.1)', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Link href="/connexion" onClick={close} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '0.85rem', fontWeight: 500, color: '#1A0E05', textDecoration: 'none',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
            Mon compte
          </Link>
          <Link href="/wishlist" onClick={close} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '0.85rem', fontWeight: 500, color: '#1A0E05', textDecoration: 'none',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
            Mes favoris
          </Link>
        </div>
      </motion.div>
    </>
  );
}
