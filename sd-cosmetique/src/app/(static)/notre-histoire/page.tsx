import Image from 'next/image';
import Link from 'next/link';
import styles from '../static.module.css';

export const metadata = {
  title: 'Notre histoire — SD Cosmétique',
  description: "L'histoire d'une maison de beauté née entre Dakar et Paris.",
};

const TIMELINE = [
  {
    year: '2018',
    title: "L'éveil d'une vision",
    text: "Sarah Diop quitte un cabinet de conseil parisien pour explorer les rituels de beauté de sa Casamance natale. Trois mois de carnets, de rencontres avec des herboristes, de retours aux gestes ancestraux.",
  },
  {
    year: '2020',
    title: 'Premier laboratoire',
    text: 'Création du laboratoire-atelier dans les Almadies, à Dakar. Les premières formules naissent autour de quatre actifs phares : karité non raffiné, hibiscus fermenté, baobab pressé à froid, niébé.',
  },
  {
    year: '2022',
    title: 'Lancement officiel',
    text: 'SD Cosmétique voit le jour avec une collection de 12 références. Distribution exclusive en ligne, chaque commande accompagnée d&apos;un mot manuscrit.',
  },
  {
    year: '2024',
    title: 'Reconnaissance internationale',
    text: 'Sélection au Salon de la Cosmétique à Paris, présence dans 14 pays. La presse internationale salue notre approche « clean & sourcée ».',
  },
  {
    year: '2026',
    title: 'Ouverture nouvelle ère',
    text: 'Refonte complète de la maison, lancement du programme de traçabilité totale et inauguration de notre boutique-conseil parisienne.',
  },
];

export default function NotreHistoirePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Notre histoire</span>
          </nav>
          <span className={styles.eyebrow}>Notre maison · Notre récit</span>
          <h1 className={styles.title}>
            Une histoire de <span className={styles.titleAccent}>transmission.</span>
          </h1>
          <p className={styles.lede}>
            Née entre la Casamance et Paris, SD Cosmétique célèbre les rituels de beauté
            transmis de mère en fille, sublimés par la science cosmétique contemporaine.
          </p>
        </div>
      </section>

      {/* Image éditoriale grande largeur */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 7', maxHeight: 540, overflow: 'hidden' }}>
        <Image
          src="/hero/full.png"
          alt="L'atelier SD Cosmétique"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <article className={styles.content}>
        <h2>De la Casamance au monde</h2>
        <p>
          Tout commence par un souvenir d&apos;enfance. Le geste de la grand-mère qui passe
          le beurre de karité fondu sur la peau, après le bain. Le parfum amer de l&apos;hibiscus
          séchant au soleil. Les pierres ponces du fleuve, polies par les générations.
        </p>
        <p>
          C&apos;est de cette mémoire sensorielle qu&apos;est née SD Cosmétique. Une maison qui
          refuse l&apos;opposition entre tradition et modernité, entre artisanat et science. Nos
          formules naissent dans un laboratoire de pointe à Dakar, mais chaque ingrédient porte
          une histoire, un geste, une transmission.
        </p>

        <div className={styles.callout}>
          <p>
            <strong>« La beauté juste »</strong> — c&apos;est notre formulation. Juste pour la
            peau, juste pour la planète, juste pour celles et ceux qui la portent.
          </p>
        </div>

        <h2>Notre chronologie</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', margin: '2rem 0 3rem' }}>
          {TIMELINE.map((step, i) => (
            <div
              key={step.year}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '2rem',
                paddingBottom: '2rem',
                borderBottom: i < TIMELINE.length - 1 ? '1px solid rgba(143,89,34,0.12)' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '2rem',
                    color: '#8F5922',
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {step.year}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: '#8F5922',
                    marginTop: '0.75rem',
                    opacity: 0.5,
                  }}
                />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.3rem', color: '#1A0E05', margin: '0 0 0.6rem', fontWeight: 500 }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(26,14,5,0.7)', lineHeight: 1.75 }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2>L&apos;équipe derrière la maison</h2>
        <p>
          Aujourd&apos;hui, nous sommes 23 collaboratrices et collaborateurs, répartis entre
          notre laboratoire de Dakar, notre studio de création parisien, et notre équipe
          logistique. Chacun porte la maison avec exigence, douceur et fierté.
        </p>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Découvrez nos engagements</p>
          <h3 className={styles.bottomCtaTitle}>Une beauté qui a du sens</h3>
          <p className={styles.bottomCtaText}>
            Sourcing tracé, formules clean, packaging recyclable, juste rémunération des
            productrices — découvrez notre charte d&apos;engagement.
          </p>
          <Link href="/engagements" className={styles.bottomCtaBtn}>
            Nos engagements
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
