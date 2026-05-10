import { Product, SkinTone, Category } from '@/types';

// ─── Options de filtrage ──────────────────────────────────────────────────────
export interface FetchProductsOptions {
  category?:    string;
  skinTone?:    SkinTone;
  bestsellers?: boolean;
  limit?:       number;
}

// ─── Fetch produits via API Route (fiable, centralisé) ───────────────────────
export async function fetchProductsForClient(
  category?: string,
  options?: Omit<FetchProductsOptions, 'category'>
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category)               params.set('category',    category);
    if (options?.skinTone)      params.set('skinTone',    options.skinTone);
    if (options?.bestsellers)   params.set('bestsellers', 'true');
    if (options?.limit != null) params.set('limit',       String(options.limit));

    const res = await fetch(`/api/products?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as Product[];
  } catch {
    let products = category ? PRODUCTS.filter(p => p.category === category) : PRODUCTS;
    if (options?.skinTone)    products = products.filter(p => p.skinTones.includes(options.skinTone!));
    if (options?.bestsellers) products = products.filter(p => p.isBestseller);
    if (options?.limit != null) products = products.slice(0, options.limit);
    return products;
  }
}

// ─── Fetch un produit par slug via API Route ──────────────────────────────────
export async function fetchProductBySlugForClient(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as Product;
  } catch {
    return PRODUCTS.find(p => p.slug === slug) ?? null;
  }
}

// ─── Fallback mock products data ─────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sérum Éclat Intense',
    slug: 'serum-eclat-intense',
    category: 'face',
    price: 24900,
    originalPrice: 32000,
    images: ['/products/serum.svg'],
    skinTones: ['noir', 'marron', 'marron-clair', 'metisse'],
    badges: ['Bestseller', '-22%'],
    rating: 4.8,
    reviewCount: 124,
    shortDescription: 'Sérum unificateur pour un teint éclatant en 7 jours',
    description: 'Notre sérum phare formulé spécialement pour les peaux mélanisées. Enrichi en vitamine C africaine et en huile de baobab, il unifie le teint, réduit les taches et révèle l\'éclat naturel de votre peau.',
    benefits: ['Unifie le teint en 7 jours', 'Réduit les taches pigmentaires', 'Hydratation 24h', 'Sans paraben'],
    usage: 'Appliquer 2-3 gouttes sur le visage propre matin et soir. Masser doucement en mouvements circulaires.',
    ingredients: 'Aqua, Niacinamide 10%, Vitamine C, Huile de Baobab, Acide Hyaluronique, Aloe Vera Bio',
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '2',
    name: 'Crème Unifiante Karité',
    slug: 'creme-unifiante-karite',
    category: 'body',
    price: 18500,
    images: ['/products/creme.svg'],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Nouveau'],
    rating: 4.9,
    reviewCount: 89,
    shortDescription: 'Crème corps unifiante au beurre de karité pur',
    description: 'Formulée avec du beurre de karité pur du Burkina Faso, cette crème nourrit profondément tout en unifiant le teint du corps.',
    benefits: ['Peau soyeuse en 3 jours', 'Formule 100% naturelle', 'Beurre de karité certifié', 'Convient à toutes les peaux'],
    usage: 'Appliquer sur l\'ensemble du corps après la douche sur peau légèrement humide.',
    inStock: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '4',
    name: 'Huile Précieuse 3-en-1',
    slug: 'huile-precieuse-3en1',
    category: 'face',
    price: 21500,
    images: ['/products/serum.svg', '/products/creme.svg'],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Top Rated'],
    rating: 4.9,
    reviewCount: 203,
    shortDescription: 'Huile multi-usage visage, corps et cheveux',
    description: 'Mélange exclusif d\'huiles précieuses africaines : argan, marula, baobab. Convient au visage, corps et cheveux.',
    benefits: ['Triple usage', 'Absorb. rapide', 'Éclat immédiat', 'Anti-âge naturel'],
    usage: 'Quelques gouttes sur le visage, les pointes des cheveux ou le corps.',
    inStock: true,
    isBestseller: true,
  },
  {
    id: '5',
    name: 'Duo Visage Éclat',
    slug: 'duo-visage-eclat',
    category: 'duo',
    price: 38500,
    originalPrice: 46000,
    images: ['/products/serum.svg'],
    skinTones: ['marron', 'marron-clair', 'metisse'],
    badges: ['Duo', '-16%'],
    rating: 4.6,
    reviewCount: 41,
    shortDescription: 'Sérum + crème jour : duo parfait pour le visage',
    description: 'Association parfaite de notre sérum éclat et de la crème jour hydratante pour une routine visage complète.',
    benefits: ['Synergie prouvée', 'Résultats en 14 jours', 'Format voyage inclus'],
    usage: 'Appliquer le sérum puis la crème jour sur peau propre.',
    inStock: true,
    isNew: true,
  },
  {
    id: '6',
    name: 'Masque Argile Purifiant',
    slug: 'masque-argile-purifiant',
    category: 'face',
    price: 14500,
    images: ['/products/creme.svg'],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: [],
    rating: 4.5,
    reviewCount: 78,
    shortDescription: 'Masque à l\'argile verte pour pores affinés',
    description: 'Masque purифiant à l\'argile verte et au charbon actif, idéal pour les peaux à tendance grasse.',
    benefits: ['Pores affinés', 'Peau nette', 'Sans perturbateurs endocriniens'],
    usage: 'Appliquer une couche épaisse, laisser 10-15 min, rincer.',
    inStock: true,
  },
  {
    id: '8',
    name: 'Lait Corporel Lumineux',
    slug: 'lait-corporel-lumineux',
    category: 'body',
    price: 15900,
    images: ['/products/lait-corps.svg'],
    skinTones: ['clair', 'marron-clair', 'metisse'],
    badges: ['Hydratant'],
    rating: 4.4,
    reviewCount: 62,
    shortDescription: 'Lait corps léger pour un éclat lumineux quotidien',
    description: 'Texture légère et non grasse, ce lait corporel laisse la peau veloutée et lumineuse toute la journée.',
    benefits: ['Non gras', 'Absorption instantanée', 'Parfum délicat', 'Vegan'],
    usage: 'Appliquer matin et soir sur l\'ensemble du corps.',
    inStock: true,
  },
];

export const getProductsByCategory = (category: Category) =>
  PRODUCTS.filter(p => p.category === category);

export const getProductsBySkinTone = (skinTone: SkinTone) =>
  PRODUCTS.filter(p => p.skinTones.includes(skinTone));

export const getProductBySlug = (slug: string) =>
  PRODUCTS.find(p => p.slug === slug);

export const getBestsellers = () =>
  PRODUCTS.filter(p => p.isBestseller);

export const getNewProducts = () =>
  PRODUCTS.filter(p => p.isNew);

export const getRelatedProducts = (product: Product, limit = 4) =>
  PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, limit);

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
