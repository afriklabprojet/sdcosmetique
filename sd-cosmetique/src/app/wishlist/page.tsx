'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen" style={{ background: 'var(--off-white)' }}>
      {/* Header */}
      <div className="py-12 text-center border-b" style={{ borderColor: 'var(--grey-100)', background: 'white' }}>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
          <span className="text-xs tracking-widest uppercase font-medium" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>Ma liste</span>
          <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Mes Favoris</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--grey-500)' }}>
          {items.length} produit{items.length !== 1 ? 's' : ''} dans votre liste
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-pale)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--gold)' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Aucun favori pour l&apos;instant
              </h2>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                Explorez nos produits et ajoutez vos coups de cœur.
              </p>
            </div>
            <Link href="/categorie/gammes">
              <button className="px-10 py-4 text-sm font-medium text-white tracking-widest uppercase" style={{ background: 'var(--gold)' }}>
                Découvrir les produits
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
