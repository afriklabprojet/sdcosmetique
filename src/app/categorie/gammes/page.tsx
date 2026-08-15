'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './gammes.module.css';
import CategoryBrowser from '@/features/catalog/views/category-browser.view';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { CategoryHeroConfig } from '@/features/site-config/site-config.type';


export default function GammesCategoryPage() {
  const [hero, setHero] = useState<CategoryHeroConfig>(DEFAULT_SITE_CONFIG.hero_gammes);

  useEffect(() => {
    fetch('/api/config/hero_gammes')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHero(d.value as CategoryHeroConfig); })
      .catch(() => {});
  }, []);

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
          <div className={styles.heroActions}>
            <a href="#catalogue" className={styles.heroBtn}>
              Explorer les gammes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <span className={styles.heroBadge}>Rituels complets</span>
          </div>
        </div>
      </section>

      <CategoryBrowser styles={styles} category="gammes" unitLabel="gamme" emptyScope="nos collections signatures" />
    </div>
  );
}
