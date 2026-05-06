'use client';

import { useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';
import { useReveal } from '@/hooks/useReveal';

export default function TrendingProducts({ products }: Readonly<{ products: Product[] }>) {
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
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: 700,
            color: 'var(--brown-deep)', letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Nos meilleures ventes
          </h2>
            <div className="scroll-arrows" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
            <Link href="/boutique" style={{ fontSize: '0.78rem', color: 'var(--brown-deep)', textDecoration: 'none', fontWeight: 600 }}>Voir tout</Link>
            {(['prev', 'next'] as const).map((dir, i) => (
              <button key={dir} onClick={() => scroll(dir)}
                aria-label={i === 0 ? 'Précédent' : 'Suivant'}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1px solid var(--border-gold)', background: 'var(--white)', cursor: 'pointer',
                  color: 'var(--brown-deep)', fontSize: '16px', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >{i === 0 ? '‹' : '›'}</button>
            ))}
          </div>
        </div>
        <div
          ref={scrollRef}
          className={`prod-grid reveal-stagger${visible ? ' visible' : ''}`}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px',
          }}
        >
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 1024px) { .prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        .scroll-arrows { display: none !important; }
      `}</style>
    </section>
  );
}
