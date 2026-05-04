'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { PRODUCTS, fetchProductsForClient } from '@/lib/products';

const NAV = [
  { label: 'ACCUEIL', href: '/' },
  { label: 'VISAGE', href: '/categorie/face' },
  { label: 'CORPS', href: '/categorie/body' },
  { label: 'GAMMES', href: '/categorie/gammes' },
  { label: 'KITS', href: '/categorie/kits' },
  { label: 'DUO', href: '/categorie/duo' },
  { label: 'QUIZ TEINT', href: '/quiz' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState(PRODUCTS);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCart();

  useEffect(() => { fetchProductsForClient().then(setSearchProducts); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen || menuOpen) {
      if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, searchProducts]);

  const goToProduct = (slug: string) => {
    setSearchOpen(false);
    router.push(`/produit/${slug}`);
  };

  const totalCount = totalItems;

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/logo.svg"
            alt="SD Cosmetique"
            width={340}
            height={64}
            priority
            style={{ height: 44, width: 'auto' }}
          />
        </Link>

        {/* NAV */}
        <nav
          className="nav-list"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            fontFamily: 'var(--font-inter), Inter, sans-serif',
          }}
        >
          {NAV.map((it) => {
            const isActive = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
            return (
              <Link
                key={it.label}
                href={it.href}
                className={`nav-link${isActive ? ' nav-active' : ''}`}
                style={{
                  position: 'relative',
                  color: isActive ? '#8F5922' : '#1A0E05',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  paddingBottom: 6,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#8F5922'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#8F5922' : '#1A0E05'; }}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* ICONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#1A0E05' }}>
          <button aria-label="Recherche" style={iconBtn} onClick={() => setSearchOpen(true)}>
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
              >
                {totalCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-btn"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', padding: 4, color: '#1A0E05' }}
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
        </div>
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
        .hamburger-btn { display: none; }
        @media (max-width: 900px) {
          .hamburger-btn { display: inline-flex; }
        }
        .search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 14, 5, 0.55);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 96px 24px 24px;
          animation: searchFade 0.25s ease;
        }
        .search-panel {
          width: 100%;
          max-width: 720px;
          background: #fff;
          border: 1px solid rgba(143, 89, 34, 0.15);
          box-shadow: 0 24px 80px rgba(26, 14, 5, 0.18);
          animation: searchSlide 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .search-input-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(143, 89, 34, 0.1);
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.4rem;
          color: #1A0E05;
          background: transparent;
          letter-spacing: 0.01em;
        }
        .search-input::placeholder { color: rgba(26, 14, 5, 0.35); font-style: italic; }
        .search-close {
          background: none;
          border: 1px solid rgba(143, 89, 34, 0.2);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8F5922;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .search-close:hover { background: #8F5922; color: #fff; border-color: #8F5922; }
        .search-results { max-height: 60vh; overflow-y: auto; }
        .search-result {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 24px;
          cursor: pointer;
          border-bottom: 1px solid rgba(143, 89, 34, 0.06);
          transition: background 0.15s ease;
          width: 100%;
          text-align: left;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          font-family: inherit;
        }
        .search-result:hover { background: rgba(245, 235, 217, 0.5); }
        .search-result-img {
          position: relative;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          background: #F5EBD9;
          overflow: hidden;
        }
        .search-result-info { flex: 1; min-width: 0; }
        .search-result-name {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 0.95rem;
          color: #1A0E05;
          margin: 0 0 2px;
        }
        .search-result-meta {
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 0.72rem;
          color: rgba(26, 14, 5, 0.55);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .search-result-price {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 0.95rem;
          color: #8F5922;
          flex-shrink: 0;
        }
        .search-empty {
          padding: 32px 24px;
          text-align: center;
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 0.85rem;
          color: rgba(26, 14, 5, 0.5);
        }
        .search-hint {
          padding: 14px 24px;
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 0.7rem;
          color: rgba(26, 14, 5, 0.45);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-top: 1px solid rgba(143, 89, 34, 0.06);
          background: #FAF6EE;
        }
        @keyframes searchFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes searchSlide { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Mobile drawer */}
      {menuOpen && (
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map((it) => {
              const isActive = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  onClick={() => setMenuOpen(false)}
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
            <Link href="/connexion" onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.9rem', color: '#1A0E05', textDecoration: 'none',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
              Mon compte
            </Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.9rem', color: '#1A0E05', textDecoration: 'none',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
              Mes favoris
            </Link>
          </div>
        </div>
      )}

      {searchOpen && (
        <button
          type="button"
          aria-label="Fermer la recherche"
          className="search-overlay"
          onClick={() => setSearchOpen(false)}
          style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'default' }}
        >
          <dialog
            open
            className="search-panel"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="search-input-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                className="search-input"
                placeholder="Rechercher un soin, une gamme…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="search-close" onClick={() => setSearchOpen(false)} aria-label="Fermer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {query.trim() && (
              <div className="search-results">
                {results.length === 0 ? (
                  <div className="search-empty">Aucun résultat pour « {query} »</div>
                ) : (
                  results.map(p => (
                    <button key={p.id} className="search-result" onClick={() => goToProduct(p.slug)}>
                      <div className="search-result-img">
                        <Image src={p.images[0]} alt={p.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-name">{p.name}</div>
                        <div className="search-result-meta">{p.category}</div>
                      </div>
                      <div className="search-result-price">{(p.price / 100).toFixed(2).replace('.', ',')} €</div>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="search-hint">Echap pour fermer · Entrée pour ouvrir</div>
          </dialog>
        </button>
      )}
    </header>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
};
