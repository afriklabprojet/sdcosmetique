import Link from 'next/link';
import styles from '../static.module.css';

export const metadata = {
  title: 'Nos ingrédients — SD Cosmétique',
  description: 'Six actifs phares, sourcés en Afrique de l\'Ouest, transformés à Dakar.',
};

const INGREDIENTS = [
  {
    name: 'Karité non raffiné',
    latin: 'Vitellaria paradoxa',
    origin: 'Casamance, Sénégal',
    benefit: 'Réparateur · Nourrissant · Apaisant',
    story: "Récolté à la main par la coopérative féminine de Ziguinchor, notre karité est extrait à froid pour préserver l'intégralité de ses acides gras essentiels et de sa vitamine A. Couleur ivoire crémeux, parfum subtil de noisette grillée — la signature d'un karité brut, jamais désodorisé.",
    color: '#E8D5B7',
  },
  {
    name: 'Hibiscus fermenté',
    latin: 'Hibiscus sabdariffa',
    origin: 'Vallée du Sine, Sénégal',
    benefit: 'Anti-âge · Éclat · Exfoliant doux',
    story: "Notre hibiscus subit une fermentation lactique de 21 jours qui décuple sa concentration en AHA naturels (acide malique, citrique). Résultat : un actif d'éclat puissant mais doux, parfait pour les peaux sensibles qui ne supportent pas les acides synthétiques.",
    color: '#B91C5C',
  },
  {
    name: 'Baobab pressé à froid',
    latin: 'Adansonia digitata',
    origin: 'Région de Tambacounda',
    benefit: 'Protecteur · Antioxydant · Repulpant',
    story: "Issue de l'arbre de vie, notre huile de baobab est pressée à froid sous 24h pour préserver sa richesse en oméga 3, 6 et 9. Sa concentration exceptionnelle en vitamine E (0,42 mg/g) en fait un anti-âge naturel particulièrement adapté aux peaux exposées.",
    color: '#8B6F47',
  },
  {
    name: 'Niébé fermenté',
    latin: 'Vigna unguiculata',
    origin: 'Sine-Saloum, Sénégal',
    benefit: 'Hydratant · Repulpant · Lissant',
    story: "Le niébé, longtemps réservé à l'alimentation, révèle sous fermentation un complexe peptidique unique au pouvoir filmogène. Notre extrait, breveté, augmente l'hydratation cutanée de 47 % en 14 jours (étude clinique 2024, panel 38 personnes).",
    color: '#D4A574',
  },
  {
    name: 'Argile rose de Tabaski',
    latin: 'Bentonite rose',
    origin: 'Falaise de Tabaski',
    benefit: 'Purifiant · Reminéralisant · Doux',
    story: "Extraite manuellement d'une carrière unique au monde, notre argile rose tire sa teinte de l'oxyde de fer naturellement présent. Plus douce que le rhassoul, plus active que le kaolin, elle convient aux peaux mixtes les plus sensibles.",
    color: '#E8B4A0',
  },
  {
    name: 'Beurre de mangue',
    latin: 'Mangifera indica',
    origin: 'Casamance, Sénégal',
    benefit: 'Nourrissant · Émollient · Souplesse',
    story: "Issu de noyaux de mangues séchés au soleil, notre beurre fond instantanément au contact de la peau. Sa texture proche du karité mais plus légère en fait l'allié des peaux normales à mixtes qui cherchent une nutrition sans effet gras.",
    color: '#F5D89A',
  },
];

export default function IngredientsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Ingrédients</span>
          </nav>
          <span className={styles.eyebrow}>Six actifs · une géographie</span>
          <h1 className={styles.title}>
            La force de la <span className={styles.titleAccent}>terre africaine.</span>
          </h1>
          <p className={styles.lede}>
            Six actifs choisis pour leur efficacité scientifiquement démontrée, sourcés dans un rayon
            de 200 km autour de notre atelier, transformés selon les gestes ancestraux et les
            techniques cosmétiques les plus modernes.
          </p>
        </div>
      </section>

      <article className={styles.content} style={{ maxWidth: 980 }}>
        {INGREDIENTS.map((ing, i) => (
          <section
            key={ing.name}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 220px) 1fr',
              gap: '2.5rem',
              padding: '3rem 0',
              borderBottom: i < INGREDIENTS.length - 1 ? '1px solid rgba(143,89,34,0.1)' : 'none',
              alignItems: 'start',
            }}
          >
            {/* Visual circle */}
            <div
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${ing.color}, ${ing.color}99 60%, ${ing.color}66)`,
                position: 'relative',
                boxShadow: `0 20px 50px ${ing.color}40`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 12,
                  border: `1px solid ${ing.color}`,
                  borderRadius: '50%',
                  opacity: 0.4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  padding: '4px 14px',
                  borderRadius: 999,
                  fontSize: '0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8F5922',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                Actif {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Content */}
            <div>
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#8F5922',
                  margin: '0 0 0.5rem',
                  fontWeight: 600,
                }}
              >
                {ing.benefit}
              </p>
              <h2 style={{ marginTop: 0, paddingLeft: 0 }}>
                {ing.name}
              </h2>
              <style>{`section h2::before{display:none}`}</style>
              <p
                style={{
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  color: 'rgba(26,14,5,0.55)',
                  margin: '-0.5rem 0 0.5rem',
                }}
              >
                {ing.latin} · {ing.origin}
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(26,14,5,0.78)', marginTop: '1rem' }}>
                {ing.story}
              </p>
            </div>
          </section>
        ))}

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Une formulation experte</p>
          <h3 className={styles.bottomCtaTitle}>Découvrez nos rituels</h3>
          <p className={styles.bottomCtaText}>
            Chaque actif révèle sa pleine puissance dans des formules synergiques pensées
            par notre laboratoire.
          </p>
          <Link href="/categorie/gammes" className={styles.bottomCtaBtn}>
            Voir nos produits
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
