'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';

const TONES = [
  { label: 'NOIR',         sub: 'Peaux très foncées', staticImg: '/hero/skintone-noir.jpg',         slug: 'noir',         fallback: 'var(--skin-noir)' },
  { label: 'MARRON',       sub: 'Peaux foncées',      staticImg: '/hero/skintone-marron.jpg',       slug: 'marron',       fallback: 'var(--skin-marron)' },
  { label: 'MARRON CLAIR', sub: 'Peaux mates',        staticImg: '/hero/skintone-marron-clair.jpg', slug: 'marron-clair', fallback: 'var(--skin-marron-clair)' },
  { label: 'CLAIR',        sub: 'Peaux claires',      staticImg: '/hero/skintone-clair.jpg',        slug: 'clair',        fallback: 'var(--skin-clair)' },
  { label: 'MÉTISSE',      sub: 'Peaux métissées',    staticImg: '/hero/skintone-metisse.jpg',      slug: 'metisse',      fallback: 'var(--skin-metisse)' },
];

type Tone = typeof TONES[number];

function ToneCard({ tone, override }: Readonly<{ tone: Tone; override?: string }>) {
  // Cascade: Supabase override -> static local file -> hide (CSS color shows)
  const sources = useMemo(
    () => [override, tone.staticImg].filter(Boolean) as string[],
    [override, tone.staticImg]
  );
  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const src = sources[idx];

  return (
    <Link
      href={`/teint/${tone.slug}`}
      className="tone-card"
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'block',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: tone.fallback,
        aspectRatio: 'var(--tone-card-aspect, 2/3)',
        maxHeight: 'var(--tone-card-maxh, 220px)',
      }}
    >
      {src && !hidden && (
        <Image
          src={src}
          alt={tone.label}
          fill
          onError={() => {
            if (idx < sources.length - 1) setIdx(idx + 1);
            else setHidden(true);
          }}
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 32vw, 200px"
          unoptimized={src.startsWith('http')}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(26,14,5,0.88) 0%, rgba(26,14,5,0.3) 55%, transparent 100%)',
        pointerEvents: 'none',
      }} />
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
        }}>{tone.label}</div>
      </div>
    </Link>
  );
}

interface SkinToneSectionProps {
  images?: {
    noir?: string;
    marron?: string;
    marronClair?: string;
    clair?: string;
    metisse?: string;
  };
  title?: string;
}

export default function SkinToneSection({ images, title }: SkinToneSectionProps = {}) {
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  // Map slug → image URL from Supabase config (fallback to static path)
  const imageMap: Record<string, string> = {
    'noir':         images?.noir        || '',
    'marron':       images?.marron      || '',
    'marron-clair': images?.marronClair || '',
    'clair':        images?.clair       || '',
    'metisse':      images?.metisse     || '',
  };

  return (
    <section ref={sectionRef} style={{ background: 'var(--white)', padding: 'clamp(24px, 4vw, 48px) clamp(12px, 3vw, 24px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className={`reveal${visible ? ' visible' : ''}`} style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
          fontWeight: 600,
          color: '#1A0E05',
          letterSpacing: '0.06em',
          textAlign: 'center',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          {title || 'Choisissez votre teint'}
        </h2>

        <div className={`tones-grid reveal-stagger${visible ? ' visible' : ''}`} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '6px',
        }}>
          {TONES.map((t) => (
            <ToneCard key={t.slug} tone={t} override={imageMap[t.slug]} />
          ))}

        </div>
      </div>
      <style jsx>{`
        .tones-grid {
          --tone-card-aspect: 2 / 3;
          --tone-card-maxh: 220px;
        }
        @media (max-width: 1024px) {
          .tones-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .tones-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            --tone-card-aspect: 3 / 4;
            --tone-card-maxh: 140px;
          }
          .tones-grid > a:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            max-width: min(62%, 260px);
            justify-self: center;
          }
        }
        @media (max-width: 480px) {
          .tones-grid {
            --tone-card-maxh: 120px;
          }
        }
      `}</style>
    </section>
  );
}
