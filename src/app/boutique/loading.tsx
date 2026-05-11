import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

export default function BoutiqueLoading() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 120px' }}>
      {/* Titre factice */}
      <div style={{ marginBottom: 40 }}>
        <div
          className="skeleton"
          style={{ width: 220, height: 32, borderRadius: 6, marginBottom: 12 }}
          aria-hidden="true"
        />
        <div
          className="skeleton"
          style={{ width: 140, height: 18, borderRadius: 4 }}
          aria-hidden="true"
        />
      </div>

      {/* Grille produits */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
        }}
        role="status"
        aria-label="Chargement des produits…"
        aria-busy="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
