// ─── Types centraux SD Cosmetique ────────────────────────────────────────────

export type SkinTone = 'noir' | 'marron' | 'marron-clair' | 'clair' | 'metisse';

export const SKIN_TONES: { id: SkinTone; label: string; color: string; description: string }[] = [
  { id: 'noir',         label: 'Noir',         color: '#2C1810', description: 'Teint très foncé' },
  { id: 'marron',       label: 'Marron',       color: '#7B4A2D', description: 'Teint foncé' },
  { id: 'marron-clair', label: 'Marron Clair', color: '#C68642', description: 'Teint moyen' },
  { id: 'clair',        label: 'Clair',        color: '#F5CBA7', description: 'Teint clair' },
  { id: 'metisse',      label: 'Métisse',      color: '#A0714F', description: 'Teint mixte' },
];

export type Category = 'body' | 'face' | 'gammes' | 'kits' | 'duo' | 'kit-levre' | 'minceur';

export const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
  { id: 'body',   label: 'Corps',   icon: '✦', description: 'Soins du corps' },
  { id: 'face',   label: 'Visage',  icon: '◈', description: 'Soins du visage' },
  { id: 'gammes', label: 'Gammes',  icon: '◇', description: 'Collections complètes' },
  { id: 'kits',   label: 'Kits',    icon: '◆', description: 'Coffrets beauté' },
  { id: 'duo',       label: 'Duo',       icon: '⊕', description: 'Duos essentiels' },
  { id: 'kit-levre', label: 'Kit Lèvre', icon: '◈', description: 'Kits lèvres & soins des lèvres' },
  { id: 'minceur',   label: 'Minceur',   icon: '◇', description: 'Soins minceur & remodelants' },
];

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  originalPrice?: number;
  images: string[];
  skinTones: SkinTone[];
  badges?: string[];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  ingredients?: string;
  inStock: boolean;
  /** Quantité en stock (optionnel). Si défini, prime sur `inStock` (auto = qty > 0). */
  stockQty?: number;
  /** Seuil d'alerte stock bas (défaut: 5). */
  lowStockThreshold?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  /** Encart « Résultats » de la page produit (titre court, ex: « Résultats visibles dès 7 jours d'utilisation »). */
  resultsTitle?: string;
  /** Sous-titre de l'encart « Résultats » (ex: « Peau plus lumineuse, lisse et unifiée. »). */
  resultsSubtitle?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  skinTone?: SkinTone;
  verified: boolean;
}

export type PaymentMethod = 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money' | 'djamo' | 'cash_on_delivery';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'orange_money', label: 'Orange Money', icon: '/icons/orange-money.svg' },
  { id: 'wave',         label: 'Wave',         icon: '/icons/wave.svg' },
  { id: 'mtn_momo',     label: 'MTN MoMo',     icon: '/icons/mtn.svg' },
  { id: 'moov_money',   label: 'Moov Money',   icon: '/icons/moov.svg' },
  { id: 'djamo',        label: 'Djamo',        icon: '/icons/djamo.svg' },
];
