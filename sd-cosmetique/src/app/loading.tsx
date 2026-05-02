export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '64px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    }}>
      {/* Banner skeleton */}
      <div className="skeleton" style={{ height: '320px', borderRadius: '8px', width: '100%' }} />

      {/* Product grid skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '14px', borderRadius: '4px', width: '80%' }} />
            <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '55%' }} />
            <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '35%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
