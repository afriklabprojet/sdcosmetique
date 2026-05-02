'use client';

import React from 'react';
import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';

const TONES = [
  { label: 'PEAUX TRÈS FONCÉES', img: '/hero/skintone-noir.jpg',         slug: 'noir',         fallback: 'var(--skin-noir)' },
  { label: 'PEAUX FONCÉES',      img: '/hero/skintone-marron.jpg',       slug: 'marron',       fallback: 'var(--skin-marron)' },
  { label: 'PEAUX MATES',        img: '/hero/skintone-marron-clair.jpg', slug: 'marron-clair', fallback: 'var(--skin-marron-clair)' },
  { label: 'PEAUX CLAIRES',      img: '/hero/skintone-clair.jpg',        slug: 'clair',        fallback: 'var(--skin-clair)' },
  { label: 'PEAUX MÉTISSÉES',    img: '/hero/skintone-metisse.jpg',      slug: 'metisse',      fallback: 'var(--skin-metisse)' },
];

export default function SkinToneSection() {
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  return (
    <section ref={sectionRef} style={{ background: 'var(--white)', padding: 'var(--space-section) 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className={`reveal${visible ? ' visible' : ''}`} style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 'clamp(2rem, 2.5vw, 2.2rem)',
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.08em',
          textAlign: 'center',
          textTransform: 'uppercase',
          marginBottom: '36px',
        }}>
          Trouvez les soins adaptés à votre teint
        </h2>

        <div className={`tones-grid reveal-stagger${visible ? ' visible' : ''}`} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
        }}>
          {TONES.map((t) => (
            <Link key={t.slug} href={`/teint/${t.slug}`}
              style={{
                position: 'relative',
                borderRadius: '4px',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                cursor: 'pointer',
                display: 'block',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img src={t.img} alt={t.label}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) parent.style.background = t.fallback;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(61,20,0,0.92) 0%, rgba(61,20,0,0.55) 70%, transparent 100%)',
                padding: '18px 12px 12px',
                color: '#fff',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textAlign: 'center',
              }}>{t.label}</div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .tones-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
