'use client';

import { useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';
import { useReveal } from '@/hooks/useReveal';

export default function TrendingProducts({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  const scroll = (dir: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'next' ? 280 : -280, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} style={{ background: 'var(--white)', padding: 'var(--space-section) 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className={`reveal${visible ? ' visible' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.8rem, 2.2vw, 2.2rem)', fontWeight: 700,
            color: 'var(--brown-deep)', letterSpacing: '0.02em',
          }}>
            Nos meilleures ventes
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
            <Link href="/boutique" style={{ fontSize: '0.78rem', color: 'var(--brown-deep)', textDecoration: 'none', fontWeight: 600 }}>Voir tout</Link>
            {(['prev', 'next'] as const).map((dir, i) => (
              <button key={dir} onClick={() => scroll(dir)}
                aria-label={i === 0 ? 'Précédent' : 'Suivant'}
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  border: '1px solid var(--border-gold)', background: 'var(--white)', cursor: 'pointer',
                  color: 'var(--brown-deep)', fontSize: '14px', lineHeight: 1,
                }}>{i === 0 ? '‹' : '›'}</button>
            ))}
          </div>
        </div>
        <div
          ref={scrollRef}
          className={`prod-grid reveal-stagger${visible ? ' visible' : ''}`}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px',
            overflowX: 'auto', scrollbarWidth: 'none',
          }}
        >
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
      <style jsx>{`
        .prod-grid::-webkit-scrollbar { display: none; }
        @media (max-width: 1024px) { .prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}
