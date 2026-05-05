'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, fetchProductsForClient } from '@/lib/products';
import { CATEGORIES, SkinTone } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SkinToneSelector from '@/components/ui/SkinToneSelector';
import styles from './kits.module.css';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { KitsHeroConfig } from '@/lib/site-config';
import { createClient } from '@/utils/supabase/client';

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

export default function KitsCategoryPage() {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [allProducts, setAllProducts] = useState(PRODUCTS.filter(p => p.category === 'kits'));
  const [hero, setHero] = useState<KitsHeroConfig>(DEFAULT_SITE_CONFIG.hero_kits);

  useEffect(() => { fetchProductsForClient('kits').then(setAllProducts).catch(() => {}); }, []);
  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_config').select('value').eq('key', 'hero_kits').single()
      .then(({ data }) => { if (data?.value) setHero(data.value as KitsHeroConfig); }, () => {});
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
      {/* HERO split-screen 50/50 */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroBigNum} aria-hidden="true">K</span>

          <div className={styles.heroLeftInner}>
            <nav className={styles.crumbs} aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link>
              <span className={styles.crumbsSep}>›</span>
              <span className={styles.crumbsCurrent}>Kits</span>
            </nav>

            <span className={styles.eyebrow}>{hero.eyebrow}</span>
            <h1 className={styles.title}>
              {hero.title}
              <span className={styles.titleAccent}>{hero.titleAccent}</span>
            </h1>
            <p className={styles.lede}>
              {hero.lead}
            </p>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{hero.stat1Num}</span>
                <span className={styles.statLabel}>{hero.stat1Label}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{hero.stat2Num}</span>
                <span className={styles.statLabel}>{hero.stat2Label}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{hero.stat3Num}</span>
                <span className={styles.statLabel}>{hero.stat3Label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroDivider} />

        <div className={styles.heroRight}>
          <Image
            src="/categories/kits.png"
            alt="Kits SD Cosmétique"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* NAV CATÉGORIES */}
      <nav className={styles.catNav} aria-label="Toutes les catégories">
        <div className={styles.catNavInner}>
          {CATEGORIES.map(cat => {
            const isActive = cat.id === 'kits';
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
              kit{products.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.sortWrap}>
              <select
                className={styles.sort}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Trier les kits"
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
            <h3 className={styles.emptyTitle}>Aucun kit pour ce filtre</h3>
            <p className={styles.emptyText}>
              Essayez une autre carnation ou explorez l&apos;ensemble de nos coffrets.
            </p>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={() => setSkinToneFilter(null)}
            >
              Voir tous les kits
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
