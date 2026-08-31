'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './body.module.css';
import CategoryBrowser from '@/features/catalog/views/category-browser.view';
import { fetchSiteConfigSection } from '@/features/site-config/site-config.util';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { CategoryHeroConfig } from '@/features/site-config/site-config.type';

export default function BodyCategoryPage() {
  const [hero, setHero] = useState<CategoryHeroConfig>(DEFAULT_SITE_CONFIG.hero_body);

  useEffect(() => {
    fetchSiteConfigSection('hero_body').then(setHero).catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroVisual}>
            <Image
              src={hero.image}
              alt="Soins du corps SD Cosmétique"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className={styles.heroContent}>
            <nav className={styles.crumbs} aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link>
              <span className={styles.crumbsSep}>›</span>
              <span className={styles.crumbsCurrent}>Corps</span>
            </nav>

            <span className={styles.eyebrow}>{hero.eyebrow}</span>
            <h1 className={styles.title}>
              {hero.title} <span className={styles.titleAccent}>{hero.titleAccent}</span>
            </h1>
            <p className={styles.lede}>
              {hero.lead}
            </p>

            <div className={styles.heroActions}>
              <a href="#catalogue" className={styles.heroBtn}>
                Découvrir les soins
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
              <span className={styles.heroBadge}>Actifs africains premium</span>
            </div>
          </div>
        </div>
      </section>

      <CategoryBrowser styles={styles} category="body" unitLabel="produit" emptyScope="nos soins corps" />
    </div>
  );
}
