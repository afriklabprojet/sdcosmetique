'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './duo.module.css';
import CategoryBrowser from '@/features/catalog/views/category-browser.view';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { DuoHeroConfig } from '@/features/site-config/site-config.type';


export default function DuoCategoryPage() {
  const [hero, setHero] = useState<DuoHeroConfig>(DEFAULT_SITE_CONFIG.hero_duo);

  useEffect(() => {
    fetch('/api/config/hero_duo')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHero(d.value as DuoHeroConfig); })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      {/* HERO diptyque asymétrique */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <nav className={styles.crumbs} aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link>
              <span className={styles.crumbsSep}>›</span>
              <span className={styles.crumbsCurrent}>Duo</span>
            </nav>

            <span className={styles.eyebrow}>{hero.eyebrow}</span>
            <h1 className={styles.title}>
              {hero.title}
              <span className={styles.titleAccent}>{hero.titleAccent}</span>
            </h1>
            <p className={styles.lede}>
              {hero.lead}
            </p>

            <div className={styles.synergy}>
              <span className={styles.synergyNum}>{hero.synergyNum}</span>
              <span>= synergie prouvée</span>
              <span className={styles.synergyText}>{hero.synergyText}</span>
            </div>

            <div className={styles.heroActions}>
              <a href="#catalogue" className={styles.heroBtn}>
                Découvrir les duos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
              <span className={styles.heroBadge}>Synergie prouvée</span>
            </div>
          </div>

          <div className={styles.heroDiptych}>
            <div className={`${styles.heroCard} ${styles.heroCardBack}`}>
              <Image
                src={hero.image}
                alt="Premier soin du duo"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className={`${styles.heroCard} ${styles.heroCardFront}`}>
              <Image
                src={hero.image}
                alt="Second soin du duo"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className={styles.heroPlus} aria-hidden="true">+</div>
          </div>
        </div>
      </section>

      <CategoryBrowser styles={styles} category="duo" unitLabel="duo" emptyScope="nos duos signature" />
    </div>
  );
}
