'use client';

/*
 * Recherche produit en surimpression, ouverte depuis la barre de navigation.
 * Extraite de `shared/layout/navbar.tsx` (F-113), qui interrogeait le
 * catalogue alors qu'il n'est cense que naviguer : la question «quel produit
 * correspond a ce texte ?» appartient au catalogue.
 *
 * Le composant n'est monte que lorsque la recherche est ouverte : la saisie
 * repart donc a vide a chaque ouverture, comme le faisait le `setQuery('')`
 * de la barre. La barre garde l'ouverture — c'est elle qui porte le bouton et
 * qui doit bloquer le defilement de la page.
 *
 * Les regles `.search-*` sont scopees par styled-jsx au composant qui les
 * declare : elles suivent le balisage, elles ne pouvaient pas rester derriere.
 */

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS, fetchProducts } from '@/features/catalog/product.query';

interface ProductSearchProps {
  readonly close: () => void;
}

export default function ProductSearch({ close }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState(PRODUCTS);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { fetchProducts().then(setSearchProducts).catch(() => {}); }, []);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

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
    close();
    router.push(`/produit/${slug}`);
  };

  return (
    <button
      type="button"
      aria-label="Fermer la recherche"
      className="search-overlay"
      onClick={close}
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
          <button className="search-close" onClick={close} aria-label="Fermer">
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
                    {p.images[0] && (
                      <Image src={p.images[0]} alt={p.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                    )}
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

      <style jsx>{`
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
          font-family: var(--font-heading);
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
          font-family: var(--font-heading);
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
          font-family: var(--font-heading);
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
    </button>
  );
}
