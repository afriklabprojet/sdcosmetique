import type { ReactNode } from 'react';

/** Version A4 (§17) — même contenu et hiérarchie que le thermique, présenté en carte large plutôt qu'en colonne étroite. */
export default function A4Receipt({ children }: { children: ReactNode }) {
  return (
    <div
      className="receipt-a4"
      style={{
        width: '100%',
        maxWidth: '620px',
        margin: '0 auto',
        background: '#fff',
        border: '1px solid var(--cream)',
        borderRadius: '8px',
        padding: '32px 36px',
        fontFamily: 'var(--font-body)',
        color: 'var(--charcoal)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}
