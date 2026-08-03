'use client';

interface PaginationProps {
  page: number;
  total: number;
  onChange: (n: number) => void;
}

export default function Pagination({ page, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{
          padding: '6px 12px',
          border: '1px solid #333',
          background: page === 1 ? '#222' : '#1A1A1A',
          color: page === 1 ? '#666' : '#CCC',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: page === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        ← Précédent
      </button>
      
      <span style={{ fontSize: '12px', color: '#888', margin: '0 12px' }}>
        Page {page} sur {total}
      </span>
      
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        style={{
          padding: '6px 12px',
          border: '1px solid #333',
          background: page === total ? '#222' : '#1A1A1A',
          color: page === total ? '#666' : '#CCC',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: page === total ? 'not-allowed' : 'pointer'
        }}
      >
        Suivant →
      </button>
    </div>
  );
}