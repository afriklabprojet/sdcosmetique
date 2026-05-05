'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, fetchProductsForClient } from '@/lib/products';
import { CATEGORIES, SkinTone } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SkinToneSelector from '@/components/ui/SkinToneSelector';
import styles from './gammes.module.css';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { CategoryHeroConfig } from '@/lib/site-config';


const SORT_OPTIONS = [
  { id: 'popular', label: 'Populaires' },
  { id: 'newest', label: 'Nouveautés' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating', label: 'Mieux notés' },
];

const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  noir: 'Noir',
  marron: 'Marron',
  'marron-clair': 'Marron clair',
  clair: 'Clair',
  metisse: 'Métisse',
};

export default function GammesCategoryPage() {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [allProducts, setAllProducts] = useState(PRODUCTS.filter(p => p.category === 'gammes'));
  const [hero, setHero] = useState<CategoryHeroConfig>(DEFAULT_SITE_CONFIG.hero_gammes);

  useEffect(() => { fetchProductsForClient('gammes').then(setAllProducts).catch(() => {}); }, []);
  useEffect(() => {
    fetch('/api/config/hero_gammes')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHero(d.value as CategoryHeroConfig); })
      .catch(() => {});
  }, []);

  const products = useMemo(() => {
    let list = allProducts;
    if (skinToneFilter) {
      list = list.filter(p => p.skinTones.includes(skinToneFilter));
    }
    switch (sortBy) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'newest':     return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      default:           return [...list].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  }, [skinToneFilter, sortBy, allProducts]);

  return (
    <div className={styles.page}>
      {/* HERO cinématique */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src={hero.image}
            alt="Gammes signature SD Cosmétique"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <nav className={styles.crumbs} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className={styles.crumbsSep}>›</span>
            <span className={styles.crumbsCurrent}>Gammes</span>
          </nav>

          <span className={styles.eyebrow}>{hero.eyebrow}</span>
          <h1 className={styles.title}>
            {hero.title}
            <span className={styles.titleAccent}>{hero.titleAccent}</span>
          </h1>
          <p className={styles.lede}>
            {hero.lead}
          </p>
        </div>
      </section>

      {/* NAV CATÉGORIES */}
      <nav className={styles.catNav} aria-label="Toutes les catégories">
        <div className={styles.catNavInner}>
          {CATEGORIES.map(cat => {
            const isActive = cat.id === 'gammes';
            return (
              <Link
                key={cat.id}
                href={`/categorie/${cat.id}`}
                className={`${styles.catLink} ${isActive ? styles.catLinkActive : ''}`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* CONTENU */}
      <main className={styles.main}>
        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.toolbarLabel}>Filtrer par carnation</span>
            <SkinToneSelector selected={skinToneFilter} onChange={setSkinToneFilter} />
          </div>

          <div className={styles.toolbarRight}>
            <span className={styles.count}>
              <span className={styles.countNum}>{products.length}</span>
              gamme{products.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.sortWrap}>
              <select
                className={styles.sort}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Trier les gammes"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>Trier · {opt.label}</option>
                ))}
              </select>
              <span className={styles.sortIcon}>▾</span>
            </div>
          </div>
        </div>

        {/* CHIPS FILTRES ACTIFS */}
        {skinToneFilter && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Filtre actif</span>
            <button
              type="button"
              className={styles.chip}
              onClick={() => setSkinToneFilter(null)}
            >
              {SKIN_TONE_LABELS[skinToneFilter]}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* GRILLE */}
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map(product => (
              <div key={product.id} className={styles.gridItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyGlyph}>◇</div>
            <h3 className={styles.emptyTitle}>Aucune gamme pour ce filtre</h3>
            <p className={styles.emptyText}>
              Essayez une autre carnation ou explorez l&apos;ensemble de nos collections signatures.
            </p>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={() => setSkinToneFilter(null)}
            >
              Voir toutes les gammes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
