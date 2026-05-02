'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../static.module.css';
import { fetchSiteConfigSection, DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { FaqCategory } from '@/lib/site-config';

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>('cat0-q0');
  const [faq, setFaq] = useState<FaqCategory[]>(DEFAULT_SITE_CONFIG.faq);
  useEffect(() => { fetchSiteConfigSection('faq').then(setFaq).catch(() => {}); }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>FAQ</span>
          </nav>
          <span className={styles.eyebrow}>Vos questions · nos réponses</span>
          <h1 className={styles.title}>
            Foire aux <span className={styles.titleAccent}>questions.</span>
          </h1>
          <p className={styles.lede}>
            Tout ce que vous devez savoir sur nos produits, votre commande et notre service.
            Une question sans réponse ? Notre équipe vous accompagne.
          </p>
        </div>
      </section>

      <article className={styles.content}>
        {faq.map((cat, ci) => (
          <section key={`${cat.cat}-${ci}`} style={{ marginBottom: '3rem' }}>
            <h2>{cat.cat}</h2>
            <div className={styles.faqList}>
              {cat.items.map((item, qi) => {
                const id = `cat${ci}-q${qi}`;
                const isOpen = open === id;
                return (
                  <div key={id} className={styles.faqItem}>
                    <button
                      className={styles.faqQuestion}
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : id)}
                    >
                      <span>{item.q}</span>
                      <span className={styles.faqIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </span>
                    </button>
                    <div className={styles.faqAnswer} data-open={isOpen}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Pas trouvé votre réponse ?</p>
          <h3 className={styles.bottomCtaTitle}>Notre équipe vous accompagne</h3>
          <p className={styles.bottomCtaText}>
            Conseillère beauté, service après-vente ou partenariat — choisissez le sujet
            qui correspond, on revient vers vous sous 24h.
          </p>
          <Link href="/contact" className={styles.bottomCtaBtn}>
            Poser ma question
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
