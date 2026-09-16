import type { ReactNode } from 'react';

/** Ticket thermique 58/80mm — pas une A4 réduite : fond blanc, largeur physique réelle, pointillés au lieu de bordures pleines (§16). */
export default function ThermalReceipt({ width, children }: { width: '58mm' | '80mm'; children: ReactNode }) {
  const px = width === '58mm' ? 220 : 300;

  return (
    <div
      className={`receipt-thermal receipt-${width === '58mm' ? '58mm' : '80mm'}`}
      style={{
        width: `${px}px`,
        maxWidth: '100%',
        margin: '0 auto',
        background: '#fff',
        padding: '16px 12px',
        fontFamily: 'var(--font-body)',
        color: 'var(--charcoal)',
      }}
    >
      {children}
    </div>
  );
}
