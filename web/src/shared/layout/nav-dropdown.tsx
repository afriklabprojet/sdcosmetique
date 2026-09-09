'use client';

/*
 * Entrée de nav desktop avec sous-menu (F-118) — seule "Boutique" en a un
 * pour l'instant, mais le composant est générique pour accueillir d'autres
 * groupes plus tard. Ouverture au survol (avec un délai de fermeture pour
 * tolérer le trajet souris vers le panneau) et au focus clavier ; fermeture
 * à l'Escape ou en cliquant ailleurs.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { NavEntry } from '@/shared/layout/navigation.constant';
import { navItemActive } from '@/shared/layout/navigation.constant';
import { NAV_ICONS, BagIcon } from '@/shared/layout/nav-icons';

const CLOSE_DELAY_MS = 180;

interface NavDropdownProps {
  readonly entry: NavEntry;
  readonly active: boolean;
  readonly pathname: string;
}

export default function NavDropdown({ entry, active, pathname }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      style={{ position: 'relative' }}
      onMouseEnter={() => { clearCloseTimer(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={entry.href}
        className={`nav-link${active ? ' nav-active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => { clearCloseTimer(); setOpen(true); }}
        style={{
          position: 'relative',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          minHeight: 44, paddingBottom: 6,
          color: active ? '#8F5922' : '#1A0E05',
          fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em',
          textDecoration: 'none', transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#8F5922'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = active ? '#8F5922' : '#1A0E05'; }}
      >
        {entry.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            aria-label={`Sous-catégories — ${entry.label}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              marginTop: 10, minWidth: 220, listStyle: 'none', margin: '10px 0 0',
              padding: 8, borderRadius: 12,
              background: '#fff', border: '1px solid rgba(143,89,34,0.12)',
              boxShadow: '0 16px 40px -12px rgba(26,14,5,0.22)',
              zIndex: 60,
            }}
          >
            {entry.children?.map((child) => {
              const childActive = navItemActive(child.href, pathname);
              const Icon = NAV_ICONS[child.label] ?? BagIcon;
              return (
                <li key={child.label} role="none">
                  <Link
                    href={child.href}
                    role="menuitem"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 10px', borderRadius: 8,
                      fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.03em',
                      color: childActive ? '#8F5922' : '#1A0E05',
                      background: childActive ? 'rgba(143,89,34,0.08)' : 'transparent',
                      textDecoration: 'none', transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(143,89,34,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = childActive ? 'rgba(143,89,34,0.08)' : 'transparent'; }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: childActive ? 'rgba(143,89,34,0.14)' : 'rgba(26,14,5,0.05)',
                      color: childActive ? '#8F5922' : '#6B5A4A',
                    }}>
                      <Icon />
                    </span>
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
