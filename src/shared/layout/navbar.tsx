'use client';

/*
 * Barre de navigation. Apres la vague `split` (F-113) elle ne fait plus que
 * naviguer : elle rend le logo et les liens, detient l'ouverture de la
 * recherche et du menu, et bloque le defilement de la page tant que l'un des
 * deux est ouvert.
 *
 * Ce qu'elle a perdu : la recherche produit, partie chez son proprietaire
 * (`features/catalog/product-search.widget`), le tiroir mobile et la grappe
 * d'icones d'action.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV, navItemActive } from '@/shared/layout/navigation.constant';
import NavActions from '@/shared/layout/nav-actions.toolbar';
import MobileNavDrawer from '@/shared/layout/mobile-nav.drawer';
import ProductSearch from '@/features/catalog/product-search.widget';

export default function Navbar({ logoUrl, logoCaption, siteName }: Readonly<{ logoUrl?: string; logoCaption?: string; siteName?: string }>) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen || menuOpen) {
      // Compenser la largeur de la scrollbar pour éviter le layout shift CLS
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [searchOpen, menuOpen]);

  // Close menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect -- pattern intentionnel : réinitialisation sur navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.92)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(143,89,34,0.08)',
        transition: 'all 0.3s ease',
      }}
    >
      <style>{`.nb-logo-text { display: flex; } @media (max-width: 767px) { .nb-logo-text { display: none; } }`}</style>
      <div
        className="nav-bar"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '14px 32px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', textDecoration: 'none', gap: 10 }}>
          <Image
            src={logoUrl || '/logo.svg'}
            alt={siteName || 'SD Cosmetique'}
            width={340}
            height={64}
            priority
            style={{ height: 44, width: 'auto', flexShrink: 0 }}
          />
          <div className="nb-logo-text" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            {siteName && (
              <span style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#1a1a1a',
                fontFamily: 'var(--font-playfair), Playfair Display, serif',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}>{siteName}</span>
            )}
            {logoCaption && (
              <span style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontStyle: 'italic',
                lineHeight: 1,
              }}>{logoCaption}</span>
            )}
          </div>
        </Link>

        {/* NAV */}
        <nav
          className="nav-list"
          aria-label="Navigation principale"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            fontFamily: 'var(--font-inter), Inter, sans-serif',
          }}
        >
          {NAV.map((it) => {
            const active = navItemActive(it.href, pathname);
            return (
              <Link
                key={it.label}
                href={it.href}
                className={`nav-link${active ? ' nav-active' : ''}`}
                style={{
                  position: 'relative',
                  color: active ? '#8F5922' : '#1A0E05',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  paddingBottom: 6,
                  transition: 'color 0.2s ease',
                  // touch target ≥ 44px (WCAG 2.5.5)
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#8F5922'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = active ? '#8F5922' : '#1A0E05'; }}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <NavActions
          menuOpen={menuOpen}
          openSearch={() => setSearchOpen(true)}
          toggleMenu={() => setMenuOpen(!menuOpen)}
        />
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .nav-list { gap: 16px !important; }
        }
        @media (max-width: 900px) {
          .nav-list { display: none !important; }
          .nav-bar { gap: 16px !important; }
        }
        @media (max-width: 480px) {
          .nav-bar { padding: 10px 16px !important; }
        }
        @keyframes searchFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {menuOpen && <MobileNavDrawer pathname={pathname} close={() => setMenuOpen(false)} />}

      {searchOpen && <ProductSearch close={() => setSearchOpen(false)} />}
    </header>
  );
}
