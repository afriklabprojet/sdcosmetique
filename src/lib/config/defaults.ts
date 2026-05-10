/**
 * defaults.ts — Configurations par défaut du site
 */

import type {
  SiteConfig,
  ProductToneImages,
  TopBarConfig,
  HeroConfig,
  TrustItem,
  TestimonialItem,
  CategoryHeroConfig,
  KitsHeroConfig,
  DuoHeroConfig,
  QuizHeroConfig,
  TeintHeroConfig,
  ProductTrustItem,
  PaymentBadge,
  ShippingConfig,
  PromoCode,
  FaqCategory,
  LegalPage,
  NewsletterConfig,
  MarketingConfig,
  BrandingConfig
} from './types';

// ─── Configurations par défaut ──────────────────────────────────────────────

export const DEFAULT_TOP_BAR: TopBarConfig = {
  message: "Livraison rapide partout en Côte d'Ivoire et à l'international",
  phone: '+225 07 49 49 49 49',
};

export const DEFAULT_HERO: HeroConfig = {
  eyebrow: 'SOINS PREMIUM POUR TOUS LES TEINTS',
  title: 'Révélez la beauté',
  titleAccent: 'naturelle de votre\u00a0teint',
  lead: "Des produits d'exception, formulés pour sublimer chaque type de peau.",
  ctaText: 'DÉCOUVRIR NOS PRODUITS',
  ctaHref: '/categorie/gammes',
  image: '/hero/generated-skincare-hero-3.jpg',
  imageAlt: 'Modèle aux soins SD Cosmétique',
};

export const DEFAULT_TRUST: TrustItem[] = [
  { label: 'Ingrédients naturels\net certifiés' },
  { label: 'Formules testées\ndermatologiquement' },
  { label: 'Convient à tous\nles types de peau' },
  { label: 'Livraison rapide\net sécurisée' },
  { label: 'Paiement 100%\nsécurisé' },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { name: 'Aïcha K.', text: "Depuis que j'utilise les soins SD COSMETIQUE, ma peau n'a jamais été aussi lumineuse !", avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&q=80&auto=format&fit=crop&crop=face' },
  { name: 'Marie L.', text: 'Des produits naturels, efficaces et adaptés à ma peau. Je recommande à 100% !', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80&auto=format&fit=crop&crop=face' },
  { name: 'Fatou D.', text: 'Ma routine SD COSMETIQUE a transformé ma peau. Merci !', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&q=80&auto=format&fit=crop&crop=face' },
];

export const DEFAULT_PRODUCT_TRUST: ProductTrustItem[] = [
  { icon: 'truck',  label: 'Livraison rapide',      sub: 'en 24h - 48h' },
  { icon: 'shield', label: 'Produits authentiques', sub: '100% certifiés' },
  { icon: 'leaf',   label: 'Ingrédients naturels',  sub: 'et de qualité' },
  { icon: 'rotate', label: 'Satisfait ou remboursé', sub: 'sous 7 jours' },
];

export const DEFAULT_PAYMENT_BADGES: PaymentBadge[] = [
  { label: 'Orange Money',   bg: '#FF6600' },
  { label: 'Wave',           bg: '#0066CC' },
  { label: 'MTN MoMo',       bg: '#FFCC00', text: '#1A1A1A' },
  { label: 'Moov Money',     bg: '#00A651' },
  { label: 'Carte Bancaire', bg: '#1A1F71' },
];

export const DEFAULT_CATEGORY_HERO: CategoryHeroConfig = {
  eyebrow: 'Soins du visage',
  title: 'Visage',
  titleAccent: "l'éclat révélé",
  lead: "Sérums, masques et huiles formulés spécialement pour les peaux mélanisées.",
  image: '/categories/visage.png',
};

export const DEFAULT_KITS_HERO: KitsHeroConfig = {
  eyebrow: 'Coffrets curatés',
  title: 'Kits',
  titleAccent: 'la routine prête à offrir',
  lead: "Des assemblages pensés par nos experts — chaque kit combine les soins essentiels.",
  image: '/categories/kits.png',
  stat1Num: '−24%',
  stat1Label: 'vs unitaire',
  stat2Num: '4+',
  stat2Label: 'produits / kit',
  stat3Num: 'Offert',
  stat3Label: 'Emballage cadeau',
};

export const DEFAULT_DUO_HERO: DuoHeroConfig = {
  eyebrow: 'Synergie de soins',
  title: 'Duo',
  titleAccent: 'la puissance du tandem',
  lead: "Deux soins pensés pour agir ensemble — un sérum et sa crème, une huile et son baume.",
  image: '/categories/duo.png',
  synergyNum: '1 + 1',
  synergyText: 'résultats en 14 jours',
};

export const DEFAULT_QUIZ_HERO: QuizHeroConfig = {
  eyebrow: 'Diagnostic personnalisé',
  title: 'Trouvez votre rituel',
  titleAccent: 'en trois questions',
  lead: "Notre quiz éditorial identifie les soins SD Cosmétique faits pour votre carnation.",
  image: '/categories/gammes.png',
  floaterLabel: 'Engagement maison',
  floaterText: '« Une beauté juste, conçue pour les peaux mélaninées. »',
};

export const DEFAULT_TEINT_HERO_NOIR: TeintHeroConfig = { image: '' };
export const DEFAULT_TEINT_HERO_MARRON: TeintHeroConfig = { image: '' };
export const DEFAULT_TEINT_HERO_MARRON_CLAIR: TeintHeroConfig = { image: '' };
export const DEFAULT_TEINT_HERO_CLAIR: TeintHeroConfig = { image: '' };
export const DEFAULT_TEINT_HERO_METISSE: TeintHeroConfig = { image: '' };

export const DEFAULT_SHIPPING: ShippingConfig = {
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
};

export const DEFAULT_PROMO_CODES: PromoCode[] = [];

export const DEFAULT_FAQ: FaqCategory[] = [
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
];

const DEFAULT_LEGAL_PAGE: LegalPage = { title: '', eyebrow: '', lead: '', bodyHtml: '', updatedAt: '' };

export const DEFAULT_NEWSLETTER: NewsletterConfig = {
  enabled: true,
  title: 'Rejoignez le cercle SD',
  subtitle: 'Conseils beauté, lancements en avant-première et offres réservées à nos abonnées.',
  ctaLabel: "S'inscrire",
  successMessage: 'Merci ! Vous êtes bien inscrite ✨',
};

export const DEFAULT_MARKETING: MarketingConfig = {
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
    ctaLabel: "Profiter de l'offre",
  },
  upsellRules: [],
  facebookPixelId: '',
  googleAdsId: '',
  googleTagManagerId: '',
  tiktokPixelId: '',
};

export const DEFAULT_BRANDING: BrandingConfig = {
  siteName: 'SD Cosmetique',
  tagline: 'Beauté Africaine de Prestige',
  description: 'Soins premium formulés pour les peaux mélanisées. Découvrez nos gammes naturelles et efficaces.',
  logoUrl: '',
  faviconUrl: '',
  seoTitle: 'SD Cosmetique — Beauté Africaine de Prestige',
  seoDescription: "Soins premium pour peaux mélanisées. Gammes naturelles certifiées, livraison rapide en Côte d'Ivoire.",
  ogTitle: 'SD Cosmetique — Beauté Africaine de Prestige',
  ogDescription: 'Révélez la beauté naturelle de votre teint avec nos soins exclusifs.',
  twitterHandle: '@sdcosmetique',
  themeColor: '#8F5922',
  instagramUrl: 'https://instagram.com/sdcosmetique',
  tiktokUrl: 'https://tiktok.com/@sdcosmetique',
  facebookUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  adminLoginBg: '/hero/generated-skincare-hero-2.jpg',
};

// Configuration complète par défaut
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  topbar: DEFAULT_TOP_BAR,
  hero: DEFAULT_HERO,
  trust_items: DEFAULT_TRUST,
  testimonials_home: DEFAULT_TESTIMONIALS,
  product_trust: DEFAULT_PRODUCT_TRUST,
  payment_badges: DEFAULT_PAYMENT_BADGES,
  hero_face: {
    eyebrow: 'Soins du visage',
    title: 'Visage',
    titleAccent: "l'éclat révélé",
    lead: "Sérums, masques et huiles formulés spécialement pour les peaux mélanisées.",
    image: '/categories/visage.png',
  },
  hero_body: {
    eyebrow: 'Soins du corps',
    title: 'Corps',
    titleAccent: 'la peau sublimée',
    lead: 'Crèmes, baumes et huiles riches au beurre de karité et aux actifs africains.',
    image: '/categories/corps.png',
  },
  hero_gammes: {
    eyebrow: 'Collections signature',
    title: 'Gammes',
    titleAccent: "l'art du rituel complet",
    lead: "Des coffrets pensés comme une cérémonie — chaque routine orchestre nos meilleurs soins.",
    image: '/categories/gammes.png',
  },
  hero_kits: DEFAULT_KITS_HERO,
  hero_duo: DEFAULT_DUO_HERO,
  hero_quiz: DEFAULT_QUIZ_HERO,
  hero_teint_noir: DEFAULT_TEINT_HERO_NOIR,
  hero_teint_marron: DEFAULT_TEINT_HERO_MARRON,
  hero_teint_marron_clair: DEFAULT_TEINT_HERO_MARRON_CLAIR,
  hero_teint_clair: DEFAULT_TEINT_HERO_CLAIR,
  hero_teint_metisse: DEFAULT_TEINT_HERO_METISSE,
  skin_tone_section_title: 'Choisissez votre teint',
  product_tone_images: {
    noir:         '/hero/skintone-noir.svg',
    marron:       '/hero/skintone-marron.svg',
    marron_clair: '/hero/skintone-marron-clair.svg',
    clair:        '/hero/skintone-clair.svg',
    metisse:      '/hero/skintone-metisse.svg',
  } satisfies ProductToneImages,
  shipping: DEFAULT_SHIPPING,
  promo_codes: DEFAULT_PROMO_CODES,
  faq: DEFAULT_FAQ,
  legal_mentions: {
    eyebrow: 'Informations légales',
    title: 'Mentions légales',
    lead: 'Toutes les informations légales relatives à l\'éditeur du site.',
    bodyHtml: '',
    updatedAt: '',
  },
  legal_cgv: {
    eyebrow: 'Conditions Générales de Vente',
    title: 'CGV',
    lead: "Les présentes conditions régissent l'ensemble des transactions effectuées sur sdcosmetique.ci.",
    bodyHtml: '<p>Le contenu détaillé des CGV peut être édité depuis l\'admin (onglet Contenu).</p>',
    updatedAt: '',
  },
  legal_confidentialite: {
    eyebrow: 'Vie privée',
    title: 'Confidentialité',
    lead: "Nous protégeons vos données personnelles. Voici comment.",
    bodyHtml: '<p>La politique de confidentialité peut être éditée depuis l\'admin.</p>',
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
    ...DEFAULT_LEGAL_PAGE,
    eyebrow: 'Contact',
    title: 'Nous écrire',
    lead: 'Notre équipe vous répond sous 24h ouvrées.',
    bodyHtml: '',
    contactEmail: 'contact@sdcosmetique.ci',
    contactPhone: '+225 07 49 49 49 49',
    contactHours: 'Lun–Ven · 9h–18h GMT',
    officeAddress: 'Route des Almadies',
    officeCity: 'BP 21850 · Dakar, Sénégal',
    officeHours: 'Mar–Sam · 10h–19h',
    pressEmail: 'presse@sdcosmetique.ci',
    partnersEmail: 'partenariats@sdcosmetique.ci',
  },
  newsletter: DEFAULT_NEWSLETTER,
  marketing: DEFAULT_MARKETING,
  branding: DEFAULT_BRANDING,
};

// ─── Configurations par défaut ──────────────────────────────────────────────

