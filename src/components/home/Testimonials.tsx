'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { TestimonialItem } from '@/lib/site-config';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { TestimonialRow } from '@/lib/testimonials-db';
import { useReveal } from '@/hooks/useReveal';

function Stars() {
  return (
    <div style={{ display: 'flex', gap: '2px', color: 'var(--gold-muted)', marginBottom: '8px' }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.5 7.1.7-5.4 4.9 1.6 7-6.2-3.6L5.8 21l1.6-7L2 9.2l7.1-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials({
  rows,
  fallbackItems = DEFAULT_SITE_CONFIG.testimonials_home,
  items,
}: Readonly<{
  rows?: TestimonialRow[];
  fallbackItems?: TestimonialItem[];
  items?: TestimonialItem[];
}>) {
  // Priorité : rows (DB) → items (legacy) → fallbackItems (défauts site_config)
  const display: { name: string; text: string; avatar: string }[] =
    rows && rows.length > 0
      ? rows.map(r => ({ name: r.name, text: r.text, avatar: r.avatar_url || '/placeholder-avatar.jpg' }))
      : (items ?? fallbackItems).map(t => ({ name: t.name, text: t.text, avatar: t.avatar }));

  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  return (
    <section ref={sectionRef} style={{ background: 'var(--white)', padding: 'var(--space-section) 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="testi-outer" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '40px', alignItems: 'start' }}>

          {/* Colonne gauche : titre + bouton */}
          <div className={`reveal${visible ? ' visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.6rem, 2vw, 2rem)', fontWeight: 700,
            color: 'var(--brown-deep)', letterSpacing: '0.02em',
            textTransform: 'uppercase', lineHeight: 1.2,
            margin: 0,
          }}>Ils nous font confiance</h2>
            <Link href="/avis" style={{
              display: 'inline-block',
              background: 'var(--gold-dark)', color: '#fff',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '12px 20px', borderRadius: '6px',
              textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.2s',
            }}>Voir tous les avis</Link>
          </div>

          {/* Colonne droite : 3 cartes */}
          <div className={`testi-grid reveal-stagger${visible ? ' visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {display.map((t, i) => (
              <article key={`${t.name}-${i}`} className="testi-card" style={{
                background: '#FFFFFF', borderRadius: '10px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '0',
                boxShadow: '0 2px 16px rgba(90,43,12,0.07)',
                border: '1px solid #F0E8DC',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              >
                {/* Avatar + citation sur la même ligne */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <Image src={t.avatar} alt={t.name} width={52} height={52}
                    style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <p style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '0.8rem', fontStyle: 'italic',
                    color: '#4A3828', lineHeight: 1.6, margin: 0,
                  }}>&ldquo;{t.text}&rdquo;</p>
                </div>
                {/* Nom */}
                <div style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '0.78rem', fontWeight: 600, color: '#1A0E05', marginBottom: '6px',
                }}>– {t.name}</div>
                {/* Étoiles */}
                <Stars />
              </article>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 900px) {
          .testi-outer { grid-template-columns: 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
