'use client';

import React from 'react';
import type { TrustItem } from '@/lib/site-config';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';

const ICONS = [
  <svg key={0} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.6">
    <path d="M12 2C7 7 4 11 4 15a8 8 0 0 0 16 0c0-4-3-8-8-13z" /><path d="M9 14c1 2 3 3 5 3" />
  </svg>,
  <svg key={1} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.6">
    <path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2" /><line x1="9" y1="2" x2="15" y2="2" />
  </svg>,
  <svg key={2} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.6">
    <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" /><path d="M9 12l2 2 4-4" />
  </svg>,
  <svg key={3} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.6">
    <rect x="1" y="6" width="14" height="11" /><polygon points="15,10 19,10 22,13 22,17 15,17" />
    <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
  </svg>,
  <svg key={4} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.6">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
];

export default function TrustBar({ items = DEFAULT_SITE_CONFIG.trust_items }: { items?: TrustItem[] }) {
  return (
    <section style={{ background: 'var(--white)', padding: '0 24px var(--space-section)' }}>
      <div className="trust-wrap" style={{
        maxWidth: '1200px', margin: '0 auto',
        background: 'var(--cream)', borderRadius: '8px',
        padding: '20px 28px',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px',
      }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            borderRight: i < items.length - 1 ? '1px solid var(--gold-pale)' : 'none',
            paddingRight: '12px',
          }}>
            <div style={{ flexShrink: 0 }}>{ICONS[i % ICONS.length]}</div>
            <div style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.74rem', color: 'var(--charcoal)', lineHeight: 1.4,
              whiteSpace: 'pre-line',
            }}>{it.label}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .trust-wrap { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-wrap > div { border-right: none !important; }
        }
      `}</style>
    </section>
  );
}
