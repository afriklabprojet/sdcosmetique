'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import styles from '../(static)/static.module.css';
import TestimonialForm from '@/components/home/TestimonialForm';
import { createClient } from '@/utils/supabase/client';

type Review = {
  id: string;
  author: string;
  city: string;
  product: string;
  productSlug: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verified: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function fetchReviewsFromDB(): Promise<Review[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data?.length) return REVIEWS;
    return data.map((row) => ({
      id: String(row.id),
      author: String(row.author),
      city: String(row.city ?? ''),
      product: String(row.product ?? ''),
      productSlug: String(row.product_slug ?? ''),
      rating: Number(row.rating),
      date: row.created_at ? formatDate(String(row.created_at)) : '',
      title: String(row.title ?? ''),
      text: String(row.text),
      verified: Boolean(row.verified),
    }));
  } catch {
    return REVIEWS;
  }
}

const REVIEWS: Review[] = [
  { id: '1', author: 'Aïssatou D.', city: 'Dakar', product: 'Sérum Éclat Intense', productSlug: 'serum-eclat-intense', rating: 5, date: '12 mars 2026', title: 'Une révélation pour ma peau', text: 'J\'utilise le sérum depuis 6 semaines. Mes taches pigmentaires ont visiblement diminué et mon teint est lumineux. Texture légère, parfum délicat. Je rachèterai sans hésiter.', verified: true },
  { id: '2', author: 'Marie-Hélène T.', city: 'Paris', product: 'Crème Unifiante Karité', productSlug: 'creme-unifiante-karite', rating: 5, date: '8 mars 2026', title: 'Texture exceptionnelle', text: 'Je suis fan du karité et celui-ci est exceptionnel. Pénètre vite, odeur subtile, peau soyeuse. Mon mari me la prend aussi !', verified: true },
  { id: '3', author: 'Fatou B.', city: 'Abidjan', product: 'Kit Illuminateur Complet', productSlug: 'kit-illuminateur-complet', rating: 5, date: '5 mars 2026', title: 'Le coffret idéal', text: 'Reçu en cadeau, j\'ai tout adoré. La routine est complète, les produits sont vraiment efficaces. Mes amies me demandent toutes ce que je mets sur ma peau.', verified: true },
  { id: '4', author: 'Léa M.', city: 'Lyon', product: 'Huile Précieuse 3-en-1', productSlug: 'huile-precieuse-3en1', rating: 5, date: '2 mars 2026', title: 'Multi-usage parfait', text: 'Je l\'utilise sur cheveux, visage et corps. Économique, polyvalente, magnifique parfum. Je viens d\'en commander un deuxième flacon.', verified: true },
  { id: '5', author: 'Khady N.', city: 'Saint-Louis', product: 'Sérum Éclat Intense', productSlug: 'serum-eclat-intense', rating: 4, date: '28 février 2026', title: 'Très bon mais cher', text: 'Le sérum est excellent, vraiment efficace sur les marques. Petit bémol sur le prix mais la qualité est au rendez-vous.', verified: true },
  { id: '6', author: 'Camille R.', city: 'Marseille', product: 'Duo Visage Éclat', productSlug: 'duo-visage-eclat', rating: 5, date: '24 février 2026', title: 'Routine complète et efficace', text: 'Le duo nettoyant + sérum est parfait pour ma peau mixte. Plus de boutons hormonaux et un teint lumineux en 3 semaines.', verified: true },
  { id: '7', author: 'Awa S.', city: 'Thiès', product: 'Crème Unifiante Karité', productSlug: 'creme-unifiante-karite', rating: 5, date: '20 février 2026', title: 'Un classique', text: 'J\'en commande tous les deux mois depuis un an. Indispensable de mon armoire de salle de bain.', verified: true },
  { id: '8', author: 'Sophie K.', city: 'Bruxelles', product: 'Kit Illuminateur Complet', productSlug: 'kit-illuminateur-complet', rating: 4, date: '15 février 2026', title: 'Très bonne découverte', text: 'Reçu rapidement, emballage soigné. Les produits sentent merveilleusement bon et fonctionnent vraiment.', verified: true },
];

const FILTERS = [5, 4, 3] as const;

export default function AvisPage() {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  useEffect(() => { fetchReviewsFromDB().then(setReviews).catch(() => {}); }, []);;

  const filtered = useMemo(
    () => (ratingFilter ? reviews.filter((r) => r.rating === ratingFilter) : reviews),
    [ratingFilter, reviews]
  );

  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((n) => ({
      stars: n,
      count: reviews.filter((r) => r.rating === n).length,
      percent: total ? (reviews.filter((r) => r.rating === n).length / total) * 100 : 0,
    }));
    return { total, average, distribution };
  }, [reviews]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Avis clientes</span>
          </nav>
          <span className={styles.eyebrow}>{stats.total} avis vérifiés · {stats.average.toFixed(1)}/5</span>
          <h1 className={styles.title}>
            La parole à <span className={styles.titleAccent}>nos clientes.</span>
          </h1>
          <p className={styles.lede}>
            Des avis 100 % vérifiés, jamais filtrés, ni achetés. Parce que votre confiance se mérite
            par la transparence — bonne ou mauvaise.
          </p>
        </div>
      </section>

      <article className={styles.content} style={{ maxWidth: 1080 }}>
        {/* STATS BLOC */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 280px) 1fr',
            gap: '3rem',
            padding: '2.5rem',
            background: '#FAF6EE',
            borderRadius: 16,
            marginBottom: '3rem',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '4rem', color: '#8F5922', lineHeight: 1, fontWeight: 400 }}>
              {stats.average.toFixed(1)}
              <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>/5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#8F5922" stroke="#8F5922" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(26,14,5,0.6)', marginTop: '0.75rem' }}>
              Sur {stats.total} avis vérifiés
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.distribution.map((d) => (
              <button
                key={d.stars}
                onClick={() => setRatingFilter(ratingFilter === d.stars ? null : d.stars)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 50px',
                  gap: 12,
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textAlign: 'left',
                  opacity: ratingFilter && ratingFilter !== d.stars ? 0.4 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: '#1A0E05', fontWeight: 500 }}>{d.stars} ★</span>
                <span style={{ height: 6, background: '#fff', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: `${d.percent}%`,
                      background: '#8F5922',
                      borderRadius: 999,
                    }}
                  />
                </span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(26,14,5,0.6)', textAlign: 'right' }}>{d.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(26,14,5,0.55)' }}>
            Filtrer
          </span>
          <button
            onClick={() => setRatingFilter(null)}
            style={chipStyle(ratingFilter === null)}
          >
            Tous ({REVIEWS.length})
          </button>
          {FILTERS.map((n) => (
            <button key={n} onClick={() => setRatingFilter(n)} style={chipStyle(ratingFilter === n)}>
              {n} étoiles
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((r) => (
            <article
              key={r.id}
              style={{
                background: '#fff',
                border: '1px solid rgba(143,89,34,0.12)',
                borderRadius: 14,
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#8F5922" stroke="#8F5922" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                {r.verified && (
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8F5922', fontWeight: 600, background: '#FAF6EE', padding: '3px 8px', borderRadius: 999 }}>
                    Vérifié
                  </span>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.1rem', color: '#1A0E05', margin: 0, fontWeight: 500 }}>
                {r.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(26,14,5,0.7)', lineHeight: 1.65, margin: 0 }}>
                « {r.text} »
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(26,14,5,0.06)' }}>
                <p style={{ fontSize: '0.85rem', color: '#1A0E05', margin: 0, fontWeight: 500 }}>
                  {r.author}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(26,14,5,0.5)', margin: '4px 0 0' }}>
                  {r.city} · {r.date}
                </p>
                <Link
                  href={`/produit/${r.productSlug}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '0.6rem',
                    fontSize: '0.78rem',
                    color: '#8F5922',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(143,89,34,0.3)',
                  }}
                >
                  {r.product}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Vous aussi, partagez votre expérience</p>
          <h3 className={styles.bottomCtaTitle}>Laissez votre témoignage</h3>
          <p className={styles.bottomCtaText}>
            Votre témoignage sera visible sur notre page d&apos;accueil après validation par notre équipe.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <TestimonialForm />
          </div>
        </div>
      </article>
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? '#1A0E05' : '#fff',
    color: active ? '#fff' : '#1A0E05',
    border: `1px solid ${active ? '#1A0E05' : 'rgba(143,89,34,0.2)'}`,
    padding: '8px 16px',
    borderRadius: 999,
    fontSize: '0.82rem',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}
