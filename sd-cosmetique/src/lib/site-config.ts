/**
 * site-config.ts — Contenu du site éditable depuis le dashboard admin.
 * Stocké dans la table Supabase `site_config` (key TEXT PK, value JSONB).
 *
 * SQL à exécuter dans Supabase → SQL Editor :
 * ```sql
 * CREATE TABLE IF NOT EXISTS site_config (
 *   key        TEXT PRIMARY KEY,
 *   value      JSONB NOT NULL,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ```
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TopBarConfig = {
  message: string;
  phone: string;
};

export type HeroConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
};

export type TrustItem = {
  label: string;
};

// ─── Page produit ───────────────────────────────────────────────────────────

export type ProductTrustItem = {
  /** 'truck' | 'shield' | 'leaf' | 'rotate' (clé d'icône côté client) */
  icon: 'truck' | 'shield' | 'leaf' | 'rotate';
  label: string;
  sub: string;
};

export type PaymentBadge = {
  label: string;
  /** Couleur de fond hex */
  bg: string;
  /** 'white' (défaut) ou autre couleur hex */
  text?: string;
};

export type TestimonialItem = {
  name: string;
  text: string;
  avatar: string;
};

// ─── Types pour les héros des pages catégories ─────────────────────────────

export type CategoryHeroConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  image: string;
};

export type KitsHeroConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  image: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
};

export type DuoHeroConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  image: string;
  synergyNum: string;
  synergyText: string;
};

export type QuizHeroConfig = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  image: string;
  floaterLabel: string;
  floaterText: string;
};

export type ShippingOption = {
  id: string;
  label: string;
  description: string;
  /** Coût de livraison (FCFA). */
  cost: number;
  /** Seuil livraison gratuite (FCFA). 0 = jamais offerte. */
  freeFrom: number;
  active: boolean;
};

export type ShippingConfig = {
  options: ShippingOption[];
  /** Message panier affiché quand la livraison est gratuite. */
  freeShippingMessage: string;
};

export type PromoCode = {
  code: string;
  type: 'percent' | 'fixed';
  /** Pourcentage (0-100) si type='percent', montant FCFA si type='fixed'. */
  value: number;
  /** Sous-total minimum pour appliquer le code (FCFA). 0 = aucun min. */
  minSubtotal?: number;
  active: boolean;
  /** Date d'expiration ISO (yyyy-mm-dd). Vide = jamais. */
  expiresAt?: string;
};

export type FaqItem = { q: string; a: string };
export type FaqCategory = { cat: string; items: FaqItem[] };

export type LegalPage = {
  /** Titre h1. */
  title: string;
  /** Petit eyebrow au-dessus du titre. */
  eyebrow: string;
  /** Lead/intro sous le titre. */
  lead: string;
  /** Corps de page (HTML brut autorisé). */
  bodyHtml: string;
  /** Date de dernière mise à jour (libellable). */
  updatedAt?: string;
};

export type NewsletterConfig = {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  successMessage: string;
};

// ─── Module Marketing ────────────────────────────────────────────────────────

export type PromoBanner = {
  id: string;
  text: string;
  emoji?: string;
  bgColor: string;
  textColor: string;
  link?: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type WelcomePopup = {
  enabled: boolean;
  title: string;
  subtitle: string;
  discountCode?: string;
  delaySeconds: number;
  bgColor: string;
  ctaLabel: string;
};

export type UpsellRule = {
  id: string;
  triggerProductIds: string[];
  suggestedProductIds: string[];
  label: string;
  active: boolean;
};

export type MarketingConfig = {
  banners: PromoBanner[];
  welcomePopup: WelcomePopup;
  upsellRules: UpsellRule[];
  // Tracking pixels
  facebookPixelId?: string;
  googleAdsId?: string;        // ex: AW-XXXXXXXXX
  googleTagManagerId?: string; // ex: GTM-XXXXXXX
  tiktokPixelId?: string;
};

export type SiteConfig = {
  topbar: TopBarConfig;
  hero: HeroConfig;
  trust_items: TrustItem[];
  testimonials_home: TestimonialItem[];
  // Page produit
  product_trust: ProductTrustItem[];
  payment_badges: PaymentBadge[];
  // Héros des pages catégories
  hero_face: CategoryHeroConfig;
  hero_body: CategoryHeroConfig;
  hero_gammes: CategoryHeroConfig;
  hero_kits: KitsHeroConfig;
  hero_duo: DuoHeroConfig;
  hero_quiz: QuizHeroConfig;
  // Frais de livraison
  shipping: ShippingConfig;
  // Codes promo
  promo_codes: PromoCode[];
  // FAQ
  faq: FaqCategory[];
  // Pages légales / statiques
  legal_cgv: LegalPage;
  legal_confidentialite: LegalPage;
  legal_engagements: LegalPage;
  legal_contact: LegalPage;
  // Newsletter (configuration d'affichage)
  newsletter: NewsletterConfig;
  // Module marketing
  marketing: MarketingConfig;
};

// ─── Valeurs par défaut (contenu actuel hardcodé) ─────────────────────────────

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  topbar: {
    message: "Livraison rapide partout en Côte d'Ivoire et à l'international",
    phone: '+225 07 49 49 49 49',
  },
  hero: {
    eyebrow: 'SOINS PREMIUM POUR TOUS LES TEINTS',
    title: 'Révélez la beauté',
    titleAccent: 'naturelle de votre\u00a0teint',
    lead: "Des produits d'exception, formulés pour sublimer chaque type de peau.",
    ctaText: 'DÉCOUVRIR NOS PRODUITS',
    ctaHref: '/categorie/gammes',
    image: '/hero/generated-skincare-hero-3.jpg',
    imageAlt: 'Modèle aux soins SD Cosmétique',
  },
  trust_items: [
    { label: 'Ingrédients naturels\net certifiés' },
    { label: 'Formules testées\ndermatologiquement' },
    { label: 'Convient à tous\nles types de peau' },
    { label: 'Livraison rapide\net sécurisée' },
    { label: 'Paiement 100%\nsécurisé' },
  ],
  testimonials_home: [
    {
      name: 'Aïcha K.',
      text: "Depuis que j'utilise les soins SD COSMETIQUE, ma peau n'a jamais été aussi lumineuse !",
      avatar: '/hero/testimonial-1.jpg',
    },
    {
      name: 'Marie L.',
      text: 'Des produits naturels, efficaces et adaptés à ma peau. Je recommande à 100% !',
      avatar: '/hero/testimonial-2.jpg',
    },
    {
      name: 'Fatou D.',
      text: 'Ma routine SD COSMETIQUE a transformé ma peau. Merci !',
      avatar: '/hero/testimonial-3.jpg',
    },
  ],
  // ─── Page produit ───────────────────────────────────────────────────────
  product_trust: [
    { icon: 'truck',  label: 'Livraison rapide',         sub: 'en 24h - 48h' },
    { icon: 'shield', label: 'Produits authentiques',    sub: '100% certifiés' },
    { icon: 'leaf',   label: 'Ingrédients naturels',     sub: 'et de qualité' },
    { icon: 'rotate', label: 'Satisfait ou remboursé',   sub: 'sous 7 jours' },
  ],
  payment_badges: [
    { label: 'Orange Money',   bg: '#FF6600' },
    { label: 'Wave',           bg: '#0066CC' },
    { label: 'MTN MoMo',       bg: '#FFCC00', text: '#1A1A1A' },
    { label: 'Moov Money',     bg: '#00A651' },
    { label: 'Carte Bancaire', bg: '#1A1F71' },
  ],
  // ─── Héros des pages catégories ─────────────────────────────────────────
  hero_face: {
    eyebrow: 'Soins du visage',
    title: 'Visage',
    titleAccent: "l'éclat révélé",
    lead: "Sérums, masques et huiles formulés spécialement pour les peaux mélanisées. Chaque soin est pensé pour unifier le teint, sublimer l'éclat naturel et nourrir en profondeur.",
    image: '/categories/visage.png',
  },
  hero_body: {
    eyebrow: 'Soins du corps',
    title: 'Corps',
    titleAccent: 'la peau sublimée',
    lead: 'Crèmes, baumes et huiles riches au beurre de karité et aux actifs africains. Une routine corps qui nourrit en profondeur, unifie le grain de peau et révèle un éclat soyeux.',
    image: '/categories/corps.png',
  },
  hero_gammes: {
    eyebrow: 'Collections signature',
    title: 'Gammes',
    titleAccent: "l'art du rituel complet",
    lead: "Des coffrets pensés comme une cérémonie — chaque routine orchestre nos meilleurs soins pour une transformation visible. La quintessence de SD Cosmétique, en une collection.",
    image: '/categories/gammes.png',
  },
  hero_kits: {
    eyebrow: 'Coffrets curatés',
    title: 'Kits',
    titleAccent: 'la routine prête à offrir',
    lead: "Des assemblages pensés par nos experts — chaque kit combine les soins essentiels pour une routine cohérente, à un prix avantageux. Parfait pour démarrer ou offrir.",
    image: '/categories/kits.png',
    stat1Num: '−24%',
    stat1Label: 'vs unitaire',
    stat2Num: '4+',
    stat2Label: 'produits / kit',
    stat3Num: 'Offert',
    stat3Label: 'Emballage cadeau',
  },
  hero_duo: {
    eyebrow: 'Synergie de soins',
    title: 'Duo',
    titleAccent: 'la puissance du tandem',
    lead: "Deux soins pensés pour agir ensemble — un sérum et sa crème, une huile et son baume. La formule juste pour démultiplier les résultats sans complexifier votre routine.",
    image: '/categories/duo.png',
    synergyNum: '1 + 1',
    synergyText: 'résultats en 14 jours',
  },
  hero_quiz: {
    eyebrow: 'Diagnostic personnalisé',
    title: 'Trouvez votre rituel',
    titleAccent: 'en trois questions',
    lead: "Notre quiz éditorial identifie les soins SD Cosmétique faits pour votre carnation, vos préoccupations et votre rythme. Une recommandation taillée à la main, sans détour.",
    image: '/categories/gammes.png',
    floaterLabel: 'Engagement maison',
    floaterText: '« Une beauté juste, conçue pour les peaux mélaninées. »',
  },
  shipping: {
    options: [
      {
        id: 'standard',
        label: 'Livraison standard',
        description: 'Délai 3-5 jours ouvrés',
        cost: 2500,
        freeFrom: 25000,
        active: true,
      },
    ],
    freeShippingMessage: 'Livraison gratuite à partir de 25 000 FCFA',
  },
  promo_codes: [],
  faq: [
    {
      cat: 'Produits & Routines',
      items: [
        { q: 'Comment choisir la routine adaptée à ma peau ?', a: "Notre quiz beauté vous oriente en quelques questions vers les produits parfaitement adaptés à votre type de peau et vos objectifs." },
        { q: 'Vos produits conviennent-ils aux peaux sensibles ?', a: "Oui, l'ensemble de nos formules est testé sous contrôle dermatologique et exempt de parfums synthétiques et d'alcools desséchants." },
      ],
    },
    {
      cat: 'Commande & Paiement',
      items: [
        { q: 'Quels moyens de paiement acceptez-vous ?', a: "Carte bancaire, Wave, Orange Money, MTN MoMo et Moov Money. Tous nos paiements sont sécurisés." },
        { q: 'Comment utiliser un code promotionnel ?', a: "Saisissez votre code lors du tunnel de commande, dans le champ « Code promo ». La réduction est appliquée immédiatement." },
      ],
    },
    {
      cat: 'Livraison & Retours',
      items: [
        { q: 'Quels sont les délais de livraison ?', a: "Abidjan : 24-48h. Reste de la Côte d'Ivoire : 2 à 5 jours ouvrés. International : 5 à 15 jours." },
        { q: 'Puis-je retourner un produit ouvert ?', a: "Pour des raisons d'hygiène, seuls les produits non ouverts dans leur emballage d'origine peuvent être retournés dans les 14 jours." },
      ],
    },
  ],
  legal_cgv: {
    eyebrow: 'Conditions Générales de Vente',
    title: 'CGV',
    lead: "Les présentes conditions régissent l'ensemble des transactions effectuées sur sd-cosmetique.com.",
    bodyHtml: '<p>Le contenu détaillé des CGV peut être édité depuis l’admin (onglet Contenu).</p>',
    updatedAt: '',
  },
  legal_confidentialite: {
    eyebrow: 'Vie privée',
    title: 'Confidentialité',
    lead: "Nous protégeons vos données personnelles. Voici comment.",
    bodyHtml: '<p>La politique de confidentialité peut être éditée depuis l’admin.</p>',
    updatedAt: '',
  },
  legal_engagements: {
    eyebrow: 'Notre charte',
    title: 'Nos engagements',
    lead: 'Une beauté juste, conçue pour les peaux mélaninées.',
    bodyHtml: '<p>Découvrez nos engagements qualité, environnementaux et éthiques.</p>',
    updatedAt: '',
  },
  legal_contact: {
    eyebrow: 'Contact',
    title: 'Nous écrire',
    lead: 'Notre équipe vous répond sous 24h ouvrées.',
    bodyHtml: '<p>contact@sd-cosmetique.com<br/>+225 07 49 49 49 49</p>',
    updatedAt: '',
  },
  newsletter: {
    enabled: true,
    title: 'Rejoignez le cercle SD',
    subtitle: 'Conseils beauté, lancements en avant-première et offres réservées à nos abonnées.',
    ctaLabel: "S'inscrire",
    successMessage: 'Merci ! Vous êtes bien inscrite ✨',
  },
  marketing: {
    banners: [
      {
        id: 'banner-1',
        text: 'Livraison offerte dès 25 000 FCFA',
        emoji: '🚚',
        bgColor: '#1C1610',
        textColor: '#D4A25A',
        active: false,
      },
    ],
    welcomePopup: {
      enabled: false,
      title: 'Bienvenue chez SD Cosmétique',
      subtitle: 'Bénéficiez de 10% sur votre première commande',
      discountCode: 'BIENVENUE10',
      delaySeconds: 5,
      bgColor: '#1C1610',
      ctaLabel: 'Profiter de l\'offre',
    },
    upsellRules: [],
    facebookPixelId: '',
    googleAdsId: '',
    googleTagManagerId: '',
    tiktokPixelId: '',
  },
};

// ─── Save depuis le client (admin dashboard) ──────────────────────────────────

export async function saveSiteConfigSection(
  key: keyof SiteConfig,
  value: SiteConfig[typeof key],
): Promise<void> {
  const { createClient } = await import('@/utils/supabase/client');
  const supabase = createClient();
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

// ─── Lecture côté client (Client Components) ─────────────────────────────────

/** Récupère une section depuis le client (avec fallback sur DEFAULT_SITE_CONFIG). */
export async function fetchSiteConfigSection<K extends keyof SiteConfig>(
  key: K,
): Promise<SiteConfig[K]> {
  try {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return DEFAULT_SITE_CONFIG[key];
    return data.value as SiteConfig[K];
  } catch {
    return DEFAULT_SITE_CONFIG[key];
  }
}

// ─── Codes promo : validation & calcul de réduction ──────────────────────────

export type PromoApplyResult =
  | { ok: true; code: PromoCode; discount: number }
  | { ok: false; reason: string };

/** Valide un code et calcule la réduction (FCFA) sur un sous-total. */
export function applyPromoCode(
  raw: string,
  subtotal: number,
  codes: PromoCode[],
): PromoApplyResult {
  const input = raw.trim().toUpperCase();
  if (!input) return { ok: false, reason: 'Code vide' };
  const code = codes.find(c => c.code.trim().toUpperCase() === input);
  if (!code) return { ok: false, reason: 'Code inconnu' };
  if (!code.active) return { ok: false, reason: 'Code désactivé' };
  if (code.expiresAt) {
    const exp = new Date(code.expiresAt);
    if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
      return { ok: false, reason: 'Code expiré' };
    }
  }
  if (code.minSubtotal && subtotal < code.minSubtotal) {
    return { ok: false, reason: `Minimum ${code.minSubtotal.toLocaleString('fr-FR')} FCFA requis` };
  }
  const discount = code.type === 'percent'
    ? Math.round(subtotal * Math.max(0, Math.min(100, code.value)) / 100)
    : Math.min(subtotal, Math.max(0, code.value));
  return { ok: true, code, discount };
}
