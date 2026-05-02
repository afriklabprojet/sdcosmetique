'use client';

import React, { useState, useMemo } from 'react';
import { Product, SkinTone, CATEGORIES } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SkinToneSelector from '@/components/ui/SkinToneSelector';
import Link from 'next/link';

const SORT_OPTIONS = [
  { id: 'popular',    label: 'Populaires' },
  { id: 'newest',     label: 'Nouveautés' },
  { id: 'price_asc',  label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating',     label: 'Mieux notés' },
];

export default function BoutiqueClient({ products }: { products: Product[] }) {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');

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
      case 'newest':     return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      default:           return [...list].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  }, [products, skinToneFilter, categoryFilter, sortBy]);

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
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-gold)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Onglets catégories */}
          <nav style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '12px 0 0' }} aria-label="Filtrer par catégorie">
            <button
              onClick={() => setCategoryFilter('all')}
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
                onClick={() => setCategoryFilter(cat.id)}
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
              <SkinToneSelector selected={skinToneFilter} onChange={setSkinToneFilter} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--warm-grey)' }}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
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
            <button onClick={() => { setSkinToneFilter(null); setCategoryFilter('all'); }}
              style={{ fontSize: '0.78rem', color: 'var(--gold)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="boutique-grid">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>

      <style jsx>{`
        .boutique-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .boutique-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .boutique-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
      `}</style>
    </div>
  );
}
