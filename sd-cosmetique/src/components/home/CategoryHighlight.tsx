'use client';

import React from 'react';
import Link from 'next/link';
import type { CategoryRow } from '@/lib/categories-db';

const FALLBACK_CATEGORIES: CategoryRow[] = [
  { id: '1', slug: 'body',   label: 'CORPS',      sub_label: 'Prenez soin\nde votre corps',    image: '/categories/body.jpg',   href: '/categorie/body',   icon: '', is_quiz: false, order_index: 1, active: true, created_at: '' },
  { id: '2', slug: 'face',   label: 'VISAGE',     sub_label: 'Sublimez\nvotre visage',          image: '/categories/face.jpg',   href: '/categorie/face',   icon: '', is_quiz: false, order_index: 2, active: true, created_at: '' },
  { id: '3', slug: 'gammes', label: 'GAMMES',     sub_label: 'Soins complets\npar besoin',      image: '/categories/gammes.jpg', href: '/categorie/gammes', icon: '', is_quiz: false, order_index: 3, active: true, created_at: '' },
  { id: '4', slug: 'kits',   label: 'KITS',       sub_label: 'Votre routine\ncomplète',         image: '/categories/kits.jpg',   href: '/categorie/kits',   icon: '', is_quiz: false, order_index: 4, active: true, created_at: '' },
  { id: '5', slug: 'duo',    label: 'DUO',        sub_label: 'Le duo parfait\npour vous',       image: '/categories/duo.jpg',    href: '/categorie/duo',    icon: '', is_quiz: false, order_index: 5, active: true, created_at: '' },
  { id: '6', slug: 'quiz',   label: 'QUIZ TEINT', sub_label: 'Trouvez vos produits\nidéaux',   image: '', href: '/quiz', icon: '', is_quiz: true,  order_index: 6, active: true, created_at: '' },
];

interface Props {
  categories?: CategoryRow[];
}

export default function CategoryHighlight({ categories }: Props) {
  const display = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;
  return (
    <section style={{ background: 'transparent', padding: '0', position: 'relative', zIndex: 10, marginTop: '-80px' }}>
      <div style={{
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        background: '#FFFFFF',
        borderRadius: '14px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 10,
        padding: '32px 24px',
      }}>
        <div className="cat-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${display.length}, 1fr)`,
          gap: '0',
        }}>
          {display.map((cat, idx) => (
            <Link key={cat.id} href={cat.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 12px',
                borderRight: idx < display.length - 1 ? '1px solid #F0EBE0' : 'none',
                textDecoration: 'none', cursor: 'pointer',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: '#F5EDE2', overflow: 'hidden', marginBottom: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cat.is_quiz ? (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8F5922" strokeWidth="1.5">
                    <circle cx="12" cy="9" r="3" />
                    <path d="M12 12c-3 0-6 2-6 5v2h12v-2c0-3-3-5-6-5z" />
                  </svg>
                ) : (
                  <img src={cat.image} alt={cat.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.12em',
                color: '#1A0E05', marginBottom: '6px',
              }}>{cat.label}</div>
              <div style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '0.7rem', color: '#7A6855',
                textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.45,
              }}>{cat.sub_label}</div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 900px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .cat-grid > a { border-right: none !important; }
        }
        @media (max-width: 500px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

