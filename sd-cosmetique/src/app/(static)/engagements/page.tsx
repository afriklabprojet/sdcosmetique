import Link from 'next/link';
import styles from '../static.module.css';

export const metadata = {
  title: 'Nos engagements — SD Cosmétique',
  description: 'Six engagements concrets pour une beauté juste, tracée et responsable.',
};

const ENGAGEMENTS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12z" />
      </svg>
    ),
    title: 'Clean Beauty radical',
    text: 'Zéro perturbateur endocrinien, zéro silicone, zéro parfum synthétique, zéro huile minérale. 1 412 ingrédients sont bannis de nos laboratoires.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
      </svg>
    ),
    title: 'Sourcing local & tracé',
    text: 'Nos six actifs phares sont sourcés dans un rayon de 200 km autour de notre atelier. Chaque lot est traçable jusqu&apos;à la productrice.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Juste rémunération',
    text: 'Nous payons nos coopératives 35 % au-dessus du prix marché. Audit annuel par cabinet indépendant pour garantir la transparence.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 6l3-3 3 3M6 3v18M21 18l-3 3-3-3M18 21V3" />
      </svg>
    ),
    title: 'Packaging circulaire',
    text: 'Verre 100 % recyclé, capsules en aluminium recyclable infiniment, encres végétales, zéro plastique vierge. Programme de reprise en boutique.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
    title: 'Inclusion réelle',
    text: 'Toutes nos formules sont testées sur 27 carnations différentes. Nos campagnes mettent en lumière la diversité réelle, sans retouche.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Bilan carbone neutre',
    text: 'Mesure annuelle complète de notre empreinte (Scope 1, 2, 3). Compensation par reforestation locale en Casamance — 4 200 arbres plantés en 2025.',
  },
];

export default async function EngagementsPage() {
  const { getSiteConfig } = await import('@/lib/site-config.server');
  const cfg = await getSiteConfig();
  const legal = cfg.legal_engagements;
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Engagements</span>
          </nav>
          <span className={styles.eyebrow}>{legal.eyebrow || 'Beauté juste · responsable · sourcée'}</span>
          <h1 className={styles.title}>{legal.title || 'Une beauté qui a du sens.'}</h1>
          <p className={styles.lede}>
            {legal.lead || 'Six engagements concrets, mesurés, audités. Parce que la beauté ne devrait jamais se faire au détriment de la peau, de la planète ou des productrices qui la rendent possible.'}
          </p>
          {legal.updatedAt ? <p className={styles.meta}>{legal.updatedAt}</p> : null}
        </div>
      </section>
      {legal.bodyHtml && legal.bodyHtml.trim() && !legal.bodyHtml.includes('peut être édité') ? (
        <article className={styles.content}><div dangerouslySetInnerHTML={{ __html: legal.bodyHtml }} /></article>
      ) : null}

      <article className={styles.content}>
        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {ENGAGEMENTS.map((e) => (
            <div key={e.title} className={styles.card}>
              <div className={styles.cardIcon}>{e.icon}</div>
              <h3 className={styles.cardTitle}>{e.title}</h3>
              <p className={styles.cardText}>{e.text}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: '4rem' }}>Notre charte de transparence</h2>
        <p>
          Chaque produit possède une fiche traçabilité publique : origine de chaque actif,
          nom de la coopérative partenaire, prix payé, date de récolte, lieu de fabrication.
          Vous pouvez la consulter sur la fiche produit, onglet « Traçabilité ».
        </p>

        <div className={styles.callout}>
          <p>
            <strong>Programme de reprise</strong> · rapportez vos flacons vides en boutique
            ou par voie postale, recevez 5 € de crédit sur votre prochaine commande. 17 800 contenants
            collectés en 2025.
          </p>
        </div>

        <h2>Certifications &amp; labels</h2>
        <ul>
          <li><strong>Cosmos Organic</strong> · 11 références certifiées Ecocert</li>
          <li><strong>Cruelty Free</strong> · Leaping Bunny et PETA depuis l&apos;origine</li>
          <li><strong>Vegan Society</strong> · 38 références labellisées</li>
          <li><strong>1% for the Planet</strong> · membre depuis 2023</li>
          <li><strong>Fair for Life</strong> · sourcing équitable certifié</li>
        </ul>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Plongez plus profond</p>
          <h3 className={styles.bottomCtaTitle}>Découvrez nos ingrédients</h3>
          <p className={styles.bottomCtaText}>
            De la fleur d&apos;hibiscus au beurre de karité non raffiné — chaque actif a une histoire,
            une provenance, un savoir-faire.
          </p>
          <Link href="/ingredients" className={styles.bottomCtaBtn}>
            Nos ingrédients
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
