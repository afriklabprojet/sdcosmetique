'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Category, SkinTone, CATEGORIES } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SkinToneSelector from '@/components/ui/SkinToneSelector';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Populaires' },
  { id: 'newest', label: 'Nouveautés' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating', label: 'Mieux notés' },
];

const CATEGORY_IMAGES: Record<Category, string> = {
  body: '/categories/corps.png',
  face: '/categories/visage.png',
  gammes: '/categories/gammes.png',
  kits: '/categories/kits.png',
  duo: '/categories/duo.png',
  'kit-levre': '/categories/kits.png',
  minceur: '/categories/corps.png',
};

interface Props {
  initialProducts: Product[];
  slug: Category;
}

const NO_SKIN_FILTER_CATEGORIES = new Set<Category>(['minceur', 'kit-levre']);

export default function CategoryClient({ initialProducts, slug }: Readonly<Props>) {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const showSkinToneFilter = !NO_SKIN_FILTER_CATEGORIES.has(slug);

  const category = CATEGORIES.find(c => c.id === slug);
  const activeSkinTone = skinToneFilter
    ? { noir: 'Noir', marron: 'Marron', 'marron-clair': 'Marron clair', clair: 'Clair', metisse: 'Métisse' }[skinToneFilter]
    : null;

  const products = useMemo(() => {
    const list = skinToneFilter
      ? initialProducts.filter(p => p.skinTones.includes(skinToneFilter))
      : initialProducts;
    switch (sortBy) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'newest':     return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      default:           return [...list].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  }, [initialProducts, skinToneFilter, sortBy]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--grey-500)' }}>Catégorie non trouvée</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-72 lg:h-88 overflow-hidden flex items-center" style={{ background: 'linear-gradient(135deg, #fbf7f0 0%, #fff 58%, #f4eadb 100%)' }}>
        <Image
          src={CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.gammes}
          alt={category.label}
          fill
          priority
          sizes="100vw"
          className="object-contain object-right opacity-95"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.86) 42%, rgba(255,255,255,0.16) 100%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>Catégories</span>
            <span style={{ color: 'var(--grey-700)' }}>›</span>
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--grey-700)', fontSize: '0.65rem' }}>{category.label}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--charcoal)' }}>
            {category.label}
          </h1>
          <p className="mt-3 text-sm max-w-md leading-relaxed" style={{ color: 'var(--grey-700)' }}>{category.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <nav className="flex gap-2 overflow-x-auto pb-2 mb-8" aria-label="Toutes les catégories">
          {CATEGORIES.map(item => {
            const isActive = item.id === slug;
            return (
              <Link
                key={item.id}
                href={`/categorie/${item.id}`}
                className="px-4 py-2 text-xs font-medium tracking-widest uppercase border whitespace-nowrap transition-all"
                style={{
                  borderColor: isActive ? 'var(--gold)' : 'var(--grey-200)',
                  background: isActive ? 'var(--gold)' : 'white',
                  color: isActive ? 'white' : 'var(--grey-700)',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            {showSkinToneFilter && (
              <SkinToneSelector selected={skinToneFilter} onChange={setSkinToneFilter} />
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs" style={{ color: 'var(--grey-500)' }}>
              {products.length} produit{products.length === 1 ? '' : 's'}
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs px-3 py-2 border outline-none"
              style={{ borderColor: 'var(--grey-200)', fontFamily: 'var(--font-body)', color: 'var(--charcoal)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {showSkinToneFilter && skinToneFilter && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs" style={{ color: 'var(--grey-500)' }}>Filtre actif :</span>
            <button
              onClick={() => setSkinToneFilter(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
              style={{ background: 'var(--gold-pale)', color: 'var(--gold-dark)' }}
            >
              {activeSkinTone}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
              Aucun produit pour ce filtre
            </h3>
            <p className="text-sm text-center max-w-sm" style={{ color: 'var(--grey-500)' }}>
              {showSkinToneFilter ? 'Essayez une autre carnation ou consultez une autre catégorie.' : 'Aucun produit disponible pour cette catégorie pour le moment.'}
            </p>
            <button
              onClick={() => setSkinToneFilter(null)}
              className="mt-2 px-8 py-3 text-xs font-medium text-white tracking-widest uppercase"
              style={{ background: 'var(--gold)' }}
            >
              Voir tout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
