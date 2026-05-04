'use client';

import React from 'react';
import type { TrustItem } from '@/lib/site-config';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import { useReveal } from '@/hooks/useReveal';

const TRUST_DATA: ReadonlyArray<{ readonly id: string; readonly icon: React.ReactElement; readonly label: string }> = [
  {
    id: 'ingredients',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M12 2C7 7 4 11 4 15a8 8 0 0 0 16 0c0-4-3-8-8-13z" />
        <path d="M9 14c1 2 3 3 5 3" />
      </svg>
    ),
    label: 'Ingrédients\nnaturels',
  },
  {
    id: 'formulas',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2" />
        <line x1="9" y1="2" x2="15" y2="2" />
      </svg>
    ),
    label: 'Formules\ntestées',
  },
  {
    id: 'delivery',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <rect x="1" y="6" width="14" height="11" />
        <polygon points="15,10 19,10 22,13 22,17 15,17" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),
    label: 'Livraison\nrapide',
  },
  {
    id: 'service',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0 1 .07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.36 1.902.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.908.34 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
      </svg>
    ),
    label: 'Service client\ndisponible',
  },
];

interface TrustBarProps {
  readonly items?: readonly TrustItem[];
}

export default function TrustBar({ items = DEFAULT_SITE_CONFIG.trust_items }: TrustBarProps) {
  const { ref, visible } = useReveal<HTMLElement>(0.1);

  // Merge labels from items if provided, keeping icons from TRUST_DATA
  const data = TRUST_DATA.map((t, i) => ({
    ...t,
    label: items[i]?.label ?? t.label,
  }));

  return (
    <section
      ref={ref}
      className={`reveal${visible ? ' visible' : ''}`}
      style={{ padding: '0 24px var(--space-section)' }}
    >
      <div
        className="trust-bar"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #5A2B0C 0%, #8F5922 55%, #A8692A 100%)',
          borderRadius: '20px',
          padding: '32px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
        }}
      >
        {data.map((item, index) => (
          <div
            key={item.id}
            className="trust-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '0 12px',
              borderRight: index < data.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none',
              gap: '12px',
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(255,255,255,0.22)',
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <span style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.45,
              whiteSpace: 'pre-line',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .trust-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 0 !important;
            padding: 28px 16px !important;
          }
          .trust-item { border-right: none !important; }
          .trust-item:nth-child(1),
          .trust-item:nth-child(2) {
            border-bottom: 1px solid rgba(255,255,255,0.14);
            padding-bottom: 24px;
          }
        }
      `}</style>
    </section>
  );
}
