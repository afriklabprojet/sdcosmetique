import React from 'react';

const PAYMENTS = [
  { label: 'Orange Money', bg: '#FF6600', short: 'Orange' },
  { label: 'Wave',         bg: '#1FB6FF', short: 'Wave' },
  { label: 'MTN MoMo',     bg: '#FFD700', short: 'MTN', textColor: '#1A0E05' },
  { label: 'Moov Money',   bg: '#0066CC', short: 'Moov' },
];

export default function PaymentBand() {
  return (
    <section style={{ background: '#5A2B0C', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
          <p style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            color: '#F4E8D8',
            fontSize: '0.78rem',
            letterSpacing: '0.18em',
            textAlign: 'center',
            margin: 0,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Paiement sécurisé
          </p>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px',
        }}>
          {PAYMENTS.map((p) => (
            <div key={p.short} style={{
              background: p.bg, color: p.textColor || '#fff',
              padding: '10px 20px', borderRadius: '6px',
              minWidth: '108px', textAlign: 'center',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}>
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
