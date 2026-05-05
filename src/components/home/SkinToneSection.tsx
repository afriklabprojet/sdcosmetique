'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';

const TONES = [
  { label: 'NOIR',         sub: 'Peaux très foncées', img: '/hero/skintone-noir.jpg',         slug: 'noir',         fallback: 'var(--skin-noir)' },
  { label: 'MARRON',       sub: 'Peaux foncées',      img: '/hero/skintone-marron.jpg',       slug: 'marron',       fallback: 'var(--skin-marron)' },
  { label: 'MARRON CLAIR', sub: 'Peaux mates',        img: '/hero/skintone-marron-clair.jpg', slug: 'marron-clair', fallback: 'var(--skin-marron-clair)' },
  { label: 'CLAIR',        sub: 'Peaux claires',      img: '/hero/skintone-clair.jpg',        slug: 'clair',        fallback: 'var(--skin-clair)' },
  { label: 'MÉTISSE',      sub: 'Peaux métissées',    img: '/hero/skintone-metisse.jpg',      slug: 'metisse',      fallback: 'var(--skin-metisse)' },
];

export default function SkinToneSection() {
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  return (
    <section ref={sectionRef} style={{ background: 'var(--white)', padding: 'var(--space-section) clamp(12px, 3vw, 24px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className={`reveal${visible ? ' visible' : ''}`} style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
          fontWeight: 600,
          color: '#1A0E05',
          letterSpacing: '0.06em',
          textAlign: 'center',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          Choisissez votre teint
        </h2>

        <div className={`tones-grid reveal-stagger${visible ? ' visible' : ''}`} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '12px',
        }}>
          {TONES.map((t) => (
            <Link key={t.slug} href={`/teint/${t.slug}`}
              className="tone-card"
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '3 / 4',
                cursor: 'pointer',
                display: 'block',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                background: t.fallback,
              }}
            >
              <Image src={t.img} alt={t.label} fill
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 20vw, 240px" />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(26,14,5,0.88) 0%, rgba(26,14,5,0.3) 55%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              {/* Label */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '14px 8px 10px',
                textAlign: 'center',
              }}>
                <div className="tone-label" style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '0.65rem', fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#fff', lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}>{t.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .tone-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.22);
          }
        }
        @media (max-width: 1024px) {
          .tones-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .tones-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .tone-card {
            border-radius: 10px;
            aspect-ratio: 4 / 5 !important;
          }
          .tone-label {
            font-size: 0.72rem !important;
            letter-spacing: 0.1em !important;
          }
        }
        @media (max-width: 768px) {
          .tones-grid > a:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            max-width: min(62%, 260px);
            justify-self: center;
          }
        }
        .tone-card { display: block; }
      `}</style>
    </section>
  );
}
