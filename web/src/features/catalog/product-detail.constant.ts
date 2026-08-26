/*
 * Jetons visuels et valeurs par defaut de la fiche produit.
 * Extraits de `views/product.view.tsx` (F-112) : ils sont lus par la vue, la
 * carte d'achat, le selecteur de teint et les onglets, donc ils ne peuvent
 * plus vivre dans l'un d'eux.
 */
import type { ProductTrustItem, PaymentBadge } from '@/features/site-config/site-config.type';

export const DARK   = '#3D1400';
export const GOLD   = '#8F5922';
export const GOLD2  = '#C8974A';
export const BORDER = '#EDE8E0';
export const TEXT        = '#1A1A1A';
export const TEXT_MUTED  = '#9A8A7A';
export const TEXT_BODY   = '#7A6A5A';
export const BG     = '#F8F4EF';

export const toneColor: Record<string, string> = {
  noir:           '#2C1810',
  marron:         '#7B4A2D',
  'marron-clair': '#C68642',
  clair:          '#F0CEAA',
  metisse:        '#A0714F',
};

export const toneImage: Record<string, string> = {
  noir:           '/hero/skintone-noir.svg',
  marron:         '/hero/skintone-marron.svg',
  'marron-clair': '/hero/skintone-marron-clair.svg',
  clair:          '/hero/skintone-clair.svg',
  metisse:        '/hero/skintone-metisse.svg',
};

export const DEFAULT_TRUST: ProductTrustItem[] = [
  { icon: 'truck',  label: 'Livraison rapide',       sub: 'en 24h - 48h' },
  { icon: 'shield', label: 'Produits authentiques',  sub: '100% certifiés' },
  { icon: 'leaf',   label: 'Ingrédients naturels',   sub: 'et de qualité' },
  { icon: 'rotate', label: 'Satisfait ou remboursé', sub: 'sous 7 jours' },
];

export const DEFAULT_PAYMENT_BADGES: PaymentBadge[] = [
  { label: 'Orange Money',   bg: '#FF6600' },
  { label: 'Wave',           bg: '#0066CC' },
  { label: 'MTN MoMo',       bg: '#FFCC00', text: '#1A1A1A' },
  { label: 'Moov Money',     bg: '#00A651' },
  { label: 'Djamo',          bg: '#4C35A8' },
  { label: 'Carte Bancaire', bg: '#1A1F71' },
];
