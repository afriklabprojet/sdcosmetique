/**
 * types.ts — Types pour la configuration du site
 */

// ─── Types de base ────────────────────────────────────────────────────────────

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

// ─── Page produit ────────────────────────────────────────────────────────────

export type ProductTrustItem = {
  icon: 'truck' | 'shield' | 'leaf' | 'rotate';
  label: string;
  sub: string;
};

export type PaymentBadge = {
  label: string;
  bg: string;
  text?: string;
};

export type TestimonialItem = {
  name: string;
  text: string;
  avatar: string;
};

// ─── Héros des pages catégories ──────────────────────────────────────────────

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

// ─── Héros pages teint ────────────────────────────────────────────────────────

export type TeintHeroConfig = {
  image: string;
};

// ─── Images cercles teint (fiches produit) ────────────────────────────────────

export type ProductToneImages = {
  noir: string;
  marron: string;
  marron_clair: string;
  clair: string;
  metisse: string;
};

// ─── Livraison ────────────────────────────────────────────────────────────────

export type ShippingOption = {
  id: string;
  label: string;
  description: string;
  cost: number;
  freeFrom: number;
  active: boolean;
};

export type ShippingConfig = {
  options: ShippingOption[];
  freeShippingMessage: string;
};

// ─── Codes promo ──────────────────────────────────────────────────────────────

export type PromoCode = {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal?: number;
  active: boolean;
  expiresAt?: string;
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export type FaqItem = { q: string; a: string };
export type FaqCategory = { cat: string; items: FaqItem[] };

// ─── Pages légales ────────────────────────────────────────────────────────────

export type LegalPage = {
  title: string;
  eyebrow: string;
  lead: string;
  bodyHtml: string;
  updatedAt?: string;
  // Champs spécifiques à la page Contact
  contactEmail?: string;
  contactPhone?: string;
  contactHours?: string;
  officeAddress?: string;
  officeCity?: string;
  officeHours?: string;
  pressEmail?: string;
  partnersEmail?: string;
};

// ─── Newsletter ───────────────────────────────────────────────────────────────

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
  facebookPixelId?: string;
  googleAdsId?: string;
  googleTagManagerId?: string;
  tiktokPixelId?: string;
};

// ─── Branding & identité ─────────────────────────────────────────────────────

export type BrandingConfig = {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  twitterHandle: string;
  themeColor: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  adminLoginBg?: string;
};

// ─── Configuration complète du site ─────────────────────────────────────────

export type SiteConfig = {
  topbar: TopBarConfig;
  hero: HeroConfig;
  trust_items: TrustItem[];
  testimonials_home: TestimonialItem[];
  product_trust: ProductTrustItem[];
  payment_badges: PaymentBadge[];
  hero_face: CategoryHeroConfig;
  hero_body: CategoryHeroConfig;
  hero_gammes: CategoryHeroConfig;
  hero_kits: KitsHeroConfig;
  hero_duo: DuoHeroConfig;
  hero_quiz: QuizHeroConfig;
  hero_teint_noir: TeintHeroConfig;
  hero_teint_marron: TeintHeroConfig;
  hero_teint_marron_clair: TeintHeroConfig;
  hero_teint_clair: TeintHeroConfig;
  hero_teint_metisse: TeintHeroConfig;
  skin_tone_section_title: string;
  product_tone_images: ProductToneImages;
  shipping: ShippingConfig;
  promo_codes: PromoCode[];
  faq: FaqCategory[];
  legal_mentions: LegalPage;
  legal_cgv: LegalPage;
  legal_confidentialite: LegalPage;
  legal_engagements: LegalPage;
  legal_contact: LegalPage;
  newsletter: NewsletterConfig;
  marketing: MarketingConfig;
  branding: BrandingConfig;
};