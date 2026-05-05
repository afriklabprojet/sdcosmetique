'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryRow } from '@/lib/categories-db';
import { useReveal } from '@/hooks/useReveal';

const FALLBACK_CATEGORIES: CategoryRow[] = [
  { id: '1', slug: 'body',   label: 'CORPS',      sub_label: 'Prendre soin de\nvotre corps',       image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=300&q=80',   href: '/categorie/body',   icon: '', is_quiz: false, order_index: 1, active: true, created_at: '' },
  { id: '2', slug: 'face',   label: 'VISAGE',     sub_label: 'Sublimer votre\nvisage',             image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80',   href: '/categorie/face',   icon: '', is_quiz: false, order_index: 2, active: true, created_at: '' },
  { id: '3', slug: 'gammes', label: 'GAMMES',     sub_label: 'Soins complets\npar teint',          image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=300&q=80', href: '/categorie/gammes', icon: '', is_quiz: false, order_index: 3, active: true, created_at: '' },
  { id: '4', slug: 'kits',   label: 'KITS',       sub_label: 'La routine complète\npour vous',     image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=300&q=80',   href: '/categorie/kits',   icon: '', is_quiz: false, order_index: 4, active: true, created_at: '' },
  { id: '5', slug: 'duo',    label: 'DUO',        sub_label: 'Le duo parfait\npour vous',          image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=300&q=80',    href: '/categorie/duo',    icon: '', is_quiz: false, order_index: 5, active: true, created_at: '' },
];

interface Props {
  categories?: CategoryRow[];
}

export default function CategoryHighlight({ categories }: Readonly<Props>) {
  const raw = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;
  const display = raw.filter(c => !c.is_quiz);
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.1);

  return (
    <section
      ref={sectionRef}
      style={{ background: 'transparent', padding: '0', position: 'relative', zIndex: 10, marginTop: 'clamp(-80px, -6vw, -8px)' }}
    >
      <div
        className={`cat-card reveal${visible ? ' visible' : ''}`}
        style={{
          width: '90%', marginLeft: 'auto', marginRight: 'auto',
          background: '#FFFFFF', borderRadius: '20px',
          boxShadow: '0 14px 50px rgba(0,0,0,0.08)',
          position: 'relative', zIndex: 10,
          padding: '0', overflow: 'hidden',
        }}
      >
        <div className="cat-scroll">
          {display.map((cat, idx) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="cat-item"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
                padding: '16px 10px 14px',
                borderRight: idx < display.length - 1 ? '1px solid #F0EBE0' : 'none',
              }}
            >
              {/* Ovale beige avec image produit */}
              <div className="cat-oval" style={{ position: 'relative' }}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="80px"
                  className="cat-img"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              {/* Textes */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span className="cat-label">{cat.label}</span>
                {cat.sub_label && (
                  <span className="cat-sub">{cat.sub_label}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cat-scroll {
          display: flex;
          width: 100%;
          justify-content: space-evenly;
        }
        .cat-item {
          flex: 0 0 auto;
          min-width: 0;
          transition: background 0.25s ease;
        }
        .cat-item:hover {
          background: #FDFAF6;
        }

        /* Ovale beige centré */
        .cat-oval {
          width: 80px;
          height: 95px;
          background: #F5EDE2;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cat-img {
          transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cat-item:hover .cat-img {
          transform: scale(1.07);
        }

        .cat-label {
          display: block;
          font-family: var(--font-inter), Inter, sans-serif;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          color: #1A0E05;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .cat-sub {
          display: block;
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 0.68rem;
          color: #9A8A7A;
          line-height: 1.5;
          white-space: pre-line;
        }

        @media (max-width: 640px) {
          .cat-scroll {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            justify-content: flex-start;
          }
          .cat-scroll::-webkit-scrollbar { display: none; }
          .cat-item {
            flex: 0 0 auto;
            min-width: 90px;
            scroll-snap-align: start;
            border-right: none !important;
            padding: 12px 8px 10px;
          }
          .cat-item:hover { background: transparent; }
          .cat-oval { width: 62px; height: 74px; }
        }
      `}</style>
    </section>
  );
}


