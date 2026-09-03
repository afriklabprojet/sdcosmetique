'use client';

import React, { useState, useMemo } from 'react';
import { Product, SkinTone, CATEGORIES } from '@/shared/types/domain.type';
import ProductCard from '@/features/catalog/cards/product.card';
import SkinToneSelector from '@/features/catalog/selects/skin-tone.select';
import Link from 'next/link';

const SORT_OPTIONS = [
  { id: 'popular',    label: 'Populaires' },
  { id: 'newest',     label: 'Nouveautés' },
  { id: 'price_asc',  label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating',     label: 'Mieux notés' },
];

const ITEMS_PER_PAGE = 8;

export default function ShopView({ products }: Readonly<{ products: Product[] }>) {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let list = categoryFilter === 'all'
      ? products
      : products.filter(p => p.category === categoryFilter);

    if (skinToneFilter) {
      list = list.filter(p => p.skinTones.includes(skinToneFilter));
    }

    switch (sortBy) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'newest':     return [...list].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      default:           return [...list].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    }
  }, [products, skinToneFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safeCurrentPage]);

  const changeCategory = (cat: string) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

  const changeSkinTone = (tone: SkinTone | null) => {
    setSkinToneFilter(tone);
    setCurrentPage(1);
  };

  const changeSort = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    globalThis.window?.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--off-white) 60%, var(--gold-pale) 100%)',
        padding: '56px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Link href="/" style={{ fontSize: '0.65rem', color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Accueil</Link>
          <span style={{ color: 'var(--grey-700)' }}>›</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--grey-700)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Boutique</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700,
          color: 'var(--charcoal)',
          marginBottom: '12px',
          letterSpacing: '-0.02em',
        }}>Notre Boutique</h1>
        <p style={{ color: 'var(--warm-grey)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Tous nos soins conçus pour sublimer les peaux africaines et métissées.
        </p>
      </div>

      {/* Filtres & tri */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-gold)', position: 'sticky', top: 67, zIndex: 10 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Onglets catégories */}
          <nav style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '12px 0 0' }} aria-label="Filtrer par catégorie">
            <button
              onClick={() => changeCategory('all')}
              style={{
                padding: '8px 16px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: categoryFilter === 'all' ? 'var(--gold)' : 'var(--border-gold)',
                background: categoryFilter === 'all' ? 'var(--gold)' : 'transparent',
                color: categoryFilter === 'all' ? 'white' : 'var(--grey-700)',
                borderRadius: '3px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >Tout</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => changeCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: '1px solid',
                  borderColor: categoryFilter === cat.id ? 'var(--gold)' : 'var(--border-gold)',
                  background: categoryFilter === cat.id ? 'var(--gold)' : 'transparent',
                  color: categoryFilter === cat.id ? 'white' : 'var(--grey-700)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >{cat.label}</button>
            ))}
          </nav>

          {/* SkinTone + tri */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ flex: '1 1 auto' }}>
              <SkinToneSelector selected={skinToneFilter} selectTone={changeSkinTone} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--warm-grey)' }}>{filtered.length} produit{filtered.length === 1 ? '' : 's'}</span>
              <select
                aria-label="Trier les produits"
                value={sortBy}
                onChange={e => changeSort(e.target.value)}
                style={{
                  fontSize: '0.72rem', padding: '8px 12px',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-body)',
                  background: 'var(--white)',
                  outline: 'none',
                  borderRadius: '3px',
                }}
              >
                {SORT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grille produits */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px var(--space-section)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--warm-grey)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>Aucun produit pour ce filtre.</p>
            <button onClick={() => { changeSkinTone(null); changeCategory('all'); }}
              style={{ fontSize: '0.78rem', color: 'var(--gold)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="boutique-grid">
              {paginated.map(product => <ProductCard key={product.id} product={product} />)}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-gold)',
              }}>
                <button
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage <= 1}
                  aria-label="Page précédente"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-gold)',
                    borderRadius: '4px',
                    background: safeCurrentPage <= 1 ? '#f5f5f5' : 'white',
                    color: safeCurrentPage <= 1 ? '#bbb' : 'var(--charcoal)',
                    cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ← Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        width: '36px',
                        height: '36px',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        border: '1px solid',
                        borderColor: isActive ? 'var(--gold)' : 'var(--border-gold)',
                        borderRadius: '4px',
                        background: isActive ? 'var(--gold)' : 'white',
                        color: isActive ? 'white' : 'var(--charcoal)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage >= totalPages}
                  aria-label="Page suivante"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-gold)',
                    borderRadius: '4px',
                    background: safeCurrentPage >= totalPages ? '#f5f5f5' : 'white',
                    color: safeCurrentPage >= totalPages ? '#bbb' : 'var(--charcoal)',
                    cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .boutique-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .boutique-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .boutique-grid { grid-template-columns: repeat(1, 1fr); gap: 16px; } }
      `}</style>
    </div>
  );
}
