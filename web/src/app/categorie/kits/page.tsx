'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './kits.module.css';
import CategoryBrowser from '@/features/catalog/views/category-browser.view';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { KitsHeroConfig } from '@/features/site-config/site-config.type';


export default function KitsCategoryPage() {
  const [hero, setHero] = useState<KitsHeroConfig>(DEFAULT_SITE_CONFIG.hero_kits);

  useEffect(() => {
    fetch('/api/config/hero_kits')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHero(d.value as KitsHeroConfig); })
      .catch(() => {});
  }, []);

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

            <div className={styles.heroActions}>
              <a href="#catalogue" className={styles.heroBtn}>
                Voir les coffrets
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.heroDivider} />

        <div className={styles.heroRight}>
          <Image
            src={hero.image || '/categories/kits.png'}
            alt="Kits SD Cosmétique"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      <CategoryBrowser styles={styles} category="kits" unitLabel="kit" emptyScope="nos coffrets" />
    </div>
  );
}
