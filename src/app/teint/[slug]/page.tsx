import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/products-server';
import { fetchSiteConfigSection } from '@/lib/site-config';
import { SKIN_TONES, type SkinTone } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import styles from '../../(static)/static.module.css';

// Revalide à chaque requête pour que les images admin soient toujours à jour
export const revalidate = 0;

export function generateStaticParams() {
  return SKIN_TONES.map((t) => ({ slug: t.id }));
}

// Mapping SkinTone → clé de config Supabase
const TEINT_CONFIG_KEYS: Record<SkinTone, 'hero_teint_noir' | 'hero_teint_marron' | 'hero_teint_marron_clair' | 'hero_teint_clair' | 'hero_teint_metisse'> = {
  'noir':         'hero_teint_noir',
  'marron':       'hero_teint_marron',
  'marron-clair': 'hero_teint_marron_clair',
  'clair':        'hero_teint_clair',
  'metisse':      'hero_teint_metisse',
};

const TONE_META: Record<SkinTone, { hero: string; title: string; intro: string; tips: string[] }> = {
  noir: {
    hero: '/hero/skintone-noir.jpg',
    title: 'pour peaux très foncées',
    intro: "Une mélanine généreuse, une peau magnifique mais sujette aux taches d'hyperpigmentation et à la déshydratation profonde. Nos formules concentrées révèlent l'éclat naturel de votre carnation.",
    tips: [
      'Privilégiez les actifs unifiants doux : niacinamide, vitamine C stable',
      'Hydratez en profondeur matin et soir avec des textures riches mais non comédogènes',
      'Protection solaire SPF 30 minimum — oui, même sur les peaux foncées',
      'Évitez les exfoliants agressifs qui amplifient les marques post-inflammatoires',
    ],
  },
  marron: {
    hero: '/hero/skintone-marron.jpg',
    title: 'pour peaux foncées',
    intro: "Votre carnation marron profond mérite des soins adaptés à sa richesse en mélanine. Nos formules ciblent l'unification, l'éclat et la protection contre les taches.",
    tips: [
      'Routine éclat avec sérum vitamine C le matin',
      'Soins riches en huiles précieuses (baobab, marula) pour la nutrition',
      'Exfoliation douce 1 à 2 fois par semaine maximum',
      'Toujours porter une protection solaire à large spectre',
    ],
  },
  'marron-clair': {
    hero: '/hero/skintone-marron-clair.jpg',
    title: 'pour peaux mates',
    intro: "Une carnation médiane équilibrée mais qui peut marquer rapidement avec le soleil. Nos soins préservent l'unité du teint et préviennent les taches.",
    tips: [
      'SPF quotidien obligatoire pour préserver l\'uniformité',
      'Sérums anti-taches en cure préventive après l\'été',
      'Hydratation modérée, textures fluides',
      'Masque hebdomadaire pour réveiller l\'éclat',
    ],
  },
  clair: {
    hero: '/hero/skintone-clair.jpg',
    title: 'pour peaux claires',
    intro: "Une peau délicate qui demande douceur et protection. Nos formules respectent votre sensibilité tout en apportant éclat, fermeté et protection antioxydante.",
    tips: [
      'SPF 50 au quotidien, été comme hiver',
      'Antioxydants matin (vitamine C, vitamine E)',
      'Soins anti-rougeurs si peau réactive',
      'Hydratation légère mais constante',
    ],
  },
  metisse: {
    hero: '/hero/skintone-metisse.jpg',
    title: 'pour peaux métissées',
    intro: "Carnation lumineuse, dorée, parfois imprévisible. Nos soins équilibrent les zones plus claires et plus foncées pour une harmonie parfaite du teint.",
    tips: [
      'Soins unifiants doux et progressifs',
      'Routine éclat 2 fois par semaine',
      'Hydratation et nutrition équilibrées selon les zones',
      'SPF quotidien indispensable',
    ],
  },
};

export default async function TeintPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const tone = SKIN_TONES.find((t) => t.id === slug);
  if (!tone) notFound();

  const meta = TONE_META[tone.id];

  // Image héro dynamique depuis la config admin (fallback sur meta.hero si non définie)
  const teintConfig = await fetchSiteConfigSection(TEINT_CONFIG_KEYS[tone.id]);
  const heroImage = teintConfig.image || meta.hero;

  const allProducts = await fetchProducts();
  const products = allProducts.filter((p) => p.skinTones.includes(tone.id)).slice(0, 8);

  return (
    <div className={styles.page}>
      {/* HERO PERSONNALISÉ */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          background: '#1A0E05',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Image
          src={heroImage}
          alt={`Soins ${meta.title}`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.55 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${tone.color}cc 0%, rgba(26,14,5,0.85) 100%)`,
          }}
        />
        <div
          style={{
            position: 'relative',
            maxWidth: 980,
            margin: '0 auto',
            padding: '4rem 1.5rem',
            color: '#fff',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <nav
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Teints</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>{tone.label}</span>
          </nav>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontSize: '0.72rem',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#F5EBD9',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ width: 24, height: 1, background: '#F5EBD9', opacity: 0.6 }} />
            Soins {meta.title}
            <span style={{ width: 24, height: 1, background: '#F5EBD9', opacity: 0.6 }} />
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.05,
              fontWeight: 400,
              color: '#fff',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.015em',
            }}
          >
            Votre peau <span style={{ fontStyle: 'italic', color: '#F5EBD9' }}>{tone.label.toLowerCase()}</span>
            <br />mérite l&apos;excellence.
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            {meta.intro}
          </p>

          {/* Pastille couleur */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginTop: '2rem',
              padding: '8px 18px 8px 8px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 999,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: tone.color,
                border: '2px solid #fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              }}
            />
            <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500 }}>
              Carnation {tone.label}
            </span>
          </div>
        </div>
      </section>

      {/* PRODUITS RECOMMANDÉS */}
      <section style={{ padding: '5rem 1.5rem 3rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className={styles.eyebrow}>Sélection experte</span>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              color: '#1A0E05',
              margin: '0.75rem 0',
            }}
          >
            {products.length} produits <span style={{ fontStyle: 'italic', color: '#8F5922' }}>pour vous</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(26,14,5,0.65)', maxWidth: 540, margin: '0 auto' }}>
            Chaque formule a été testée et validée pour les caractéristiques spécifiques de votre carnation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CONSEILS EXPERTS */}
      <section style={{ background: '#FAF6EE', padding: '5rem 1.5rem', marginTop: '3rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className={styles.eyebrow}>Conseils d&apos;expert</span>
            <h2
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontWeight: 400,
                color: '#1A0E05',
                margin: '0.75rem 0',
              }}
            >
              Votre routine <span style={{ fontStyle: 'italic', color: '#8F5922' }}>idéale</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {meta.tips.map((tip, i) => (
              <div
                key={tip}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr',
                  gap: '1.25rem',
                  alignItems: 'center',
                  background: '#fff',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 12,
                  border: '1px solid rgba(143,89,34,0.1)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FAF6EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    color: '#8F5922',
                    fontWeight: 500,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1A0E05', lineHeight: 1.6 }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.bottomCta} style={{ marginTop: '4rem' }}>
            <p className={styles.bottomCtaEyebrow}>Besoin d&apos;un conseil personnalisé ?</p>
            <h3 className={styles.bottomCtaTitle}>Faites notre quiz beauté</h3>
            <p className={styles.bottomCtaText}>
              7 questions pour une routine sur-mesure, conçue par notre équipe d&apos;expertes.
            </p>
            <Link href="/quiz" className={styles.bottomCtaBtn}>
              Démarrer le quiz
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
