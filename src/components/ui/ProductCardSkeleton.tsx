'use client';

/**
 * Skeleton shimmer pour les cartes produit.
 * Utilisé comme fallback Suspense dans TrendingProducts.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" style={{
      background: 'var(--white)',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--cream)',
    }}>
      {/* Image placeholder */}
      <div className="shimmer" style={{ aspectRatio: '3/4', background: 'var(--cream)' }} />
      {/* Info placeholder */}
      <div style={{ padding: '12px 13px 14px' }}>
        <div className="shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 8, width: '80%' }} />
        <div className="shimmer" style={{ height: 10, borderRadius: 6, marginBottom: 12, width: '50%' }} />
        <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
          {['s1','s2','s3','s4','s5'].map(k => (
            <div key={k} className="shimmer" style={{ width: 11, height: 11, borderRadius: '50%' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="shimmer" style={{ height: 16, width: 72, borderRadius: 6 }} />
          <div className="shimmer" style={{ width: 38, height: 38, borderRadius: 8 }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0ebe4 25%,
            #e8dfd4 50%,
            #f0ebe4 75%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>
    </div>
  );
}

/**
 * Grille de skeletons pour le fallback Suspense.
 */
export function TrendingProductsSkeleton({ count = 5 }: Readonly<{ count?: number }>) {
  return (
    <section style={{ background: 'var(--white)', padding: 'var(--space-section) 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div
            style={{
              height: 28, width: 240, borderRadius: 8,
              background: 'linear-gradient(90deg, #f0ebe4 25%, #e8dfd4 50%, #f0ebe4 75%)',
              backgroundSize: '800px 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}
          />
        </div>
        {/* Cards grid */}
        <div className="skel-grid">
          {Array.from({ length: count }, (_, i) => (
            <ProductCardSkeleton key={`skel-${i}`} />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skel-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .skel-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .skel-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </section>
  );
}
