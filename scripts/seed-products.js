#!/usr/bin/env node
// Seed la table products dans Supabase avec les 8 produits
// Usage: node scripts/seed-products.js

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spcguwuqqwvjfnfctrzs.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const PRODUCTS = [
  {
    id: '1',
    name: 'Sérum Éclat Intense',
    slug: 'serum-eclat-intense',
    category: 'face',
    price: 24900,
    original_price: 32000,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=85',
    ],
    skin_tones: ['noir', 'marron', 'marron-clair', 'metisse'],
    badges: ['Bestseller', '-22%'],
    rating: 4.8,
    review_count: 124,
    short_description: 'Sérum unificateur pour un teint éclatant en 7 jours',
    description: "Notre sérum phare formulé spécialement pour les peaux mélanisées. Enrichi en vitamine C africaine et en huile de baobab, il unifie le teint, réduit les taches et révèle l'éclat naturel de votre peau.",
    benefits: ['Unifie le teint en 7 jours', 'Réduit les taches pigmentaires', 'Hydratation 24h', 'Sans paraben'],
    usage: 'Appliquer 2-3 gouttes sur le visage propre matin et soir. Masser doucement en mouvements circulaires.',
    ingredients: 'Aqua, Niacinamide 10%, Vitamine C, Huile de Baobab, Acide Hyaluronique, Aloe Vera Bio',
    in_stock: true,
    is_new: false,
    is_bestseller: true,
  },
  {
    id: '2',
    name: 'Crème Unifiante Karité',
    slug: 'creme-unifiante-karite',
    category: 'body',
    price: 18500,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=85',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=85',
    ],
    skin_tones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Nouveau'],
    rating: 4.9,
    review_count: 89,
    short_description: 'Crème corps unifiante au beurre de karité pur',
    description: 'Formulée avec du beurre de karité pur du Burkina Faso, cette crème nourrit profondément tout en unifiant le teint du corps.',
    benefits: ['Peau soyeuse en 3 jours', 'Formule 100% naturelle', 'Beurre de karité certifié', 'Convient à toutes les peaux'],
    usage: "Appliquer sur l'ensemble du corps après la douche sur peau légèrement humide.",
    ingredients: null,
    in_stock: true,
    is_new: true,
    is_bestseller: false,
  },
  {
    id: '3',
    name: 'Kit Illuminateur Complet',
    slug: 'kit-illuminateur-complet',
    category: 'kits',
    price: 52000,
    original_price: 68000,
    images: [
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&q=85',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=85',
    ],
    skin_tones: ['noir', 'marron', 'marron-clair', 'metisse'],
    badges: ['Kit Complet', '-24%'],
    rating: 4.7,
    review_count: 56,
    short_description: 'Le kit idéal pour un teint parfait de la tête aux pieds',
    description: 'Coffret complet incluant sérum visage, crème corps, huile sèche et masque éclat. La routine complète pour révéler votre beauté naturelle.',
    benefits: ['Routine complète', 'Économie de 30%', 'Livraison offerte', 'Emballage cadeau inclus'],
    usage: 'Utiliser chaque produit selon ses instructions spécifiques.',
    ingredients: null,
    in_stock: true,
    is_new: false,
    is_bestseller: true,
  },
  {
    id: '4',
    name: 'Huile Précieuse 3-en-1',
    slug: 'huile-precieuse-3en1',
    category: 'face',
    price: 21500,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=85',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38dc8?w=800&q=85',
    ],
    skin_tones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Top Rated'],
    rating: 4.9,
    review_count: 203,
    short_description: 'Huile multi-usage visage, corps et cheveux',
    description: "Mélange exclusif d'huiles précieuses africaines : argan, marula, baobab. Convient au visage, corps et cheveux.",
    benefits: ['Triple usage', 'Absorb. rapide', 'Éclat immédiat', 'Anti-âge naturel'],
    usage: 'Quelques gouttes sur le visage, les pointes des cheveux ou le corps.',
    ingredients: null,
    in_stock: true,
    is_new: false,
    is_bestseller: true,
  },
  {
    id: '5',
    name: 'Duo Visage Éclat',
    slug: 'duo-visage-eclat',
    category: 'duo',
    price: 38500,
    original_price: 46000,
    images: ['https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=800&q=85'],
    skin_tones: ['marron', 'marron-clair', 'metisse'],
    badges: ['Duo', '-16%'],
    rating: 4.6,
    review_count: 41,
    short_description: 'Sérum + crème jour : duo parfait pour le visage',
    description: 'Association parfaite de notre sérum éclat et de la crème jour hydratante pour une routine visage complète.',
    benefits: ['Synergie prouvée', 'Résultats en 14 jours', 'Format voyage inclus'],
    usage: 'Appliquer le sérum puis la crème jour sur peau propre.',
    ingredients: null,
    in_stock: true,
    is_new: true,
    is_bestseller: false,
  },
  {
    id: '6',
    name: 'Masque Argile Purifiant',
    slug: 'masque-argile-purifiant',
    category: 'face',
    price: 14500,
    original_price: null,
    images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=85'],
    skin_tones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: [],
    rating: 4.5,
    review_count: 78,
    short_description: "Masque à l'argile verte pour pores affinés",
    description: "Masque purifiant à l'argile verte et au charbon actif, idéal pour les peaux à tendance grasse.",
    benefits: ['Pores affinés', 'Peau nette', 'Sans perturbateurs endocriniens'],
    usage: 'Appliquer une couche épaisse, laisser 10-15 min, rincer.',
    ingredients: null,
    in_stock: true,
    is_new: false,
    is_bestseller: false,
  },
  {
    id: '7',
    name: 'Gamme Royale Complète',
    slug: 'gamme-royale-complete',
    category: 'gammes',
    price: 89000,
    original_price: 115000,
    images: ['https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=85'],
    skin_tones: ['noir', 'marron', 'metisse'],
    badges: ['Collection', '-23%'],
    rating: 5.0,
    review_count: 27,
    short_description: 'La collection complète pour la reine africaine',
    description: 'Notre gamme premium la plus complète, incluant 7 produits soigneusement sélectionnés pour une transformation totale.',
    benefits: ['7 produits essentiels', 'Transformation en 30 jours', 'Coffret luxe inclus', 'Livraison premium'],
    usage: 'Suivre le guide de routine inclus dans le coffret.',
    ingredients: null,
    in_stock: true,
    is_new: false,
    is_bestseller: true,
  },
  {
    id: '8',
    name: 'Lait Corporel Lumineux',
    slug: 'lait-corporel-lumineux',
    category: 'body',
    price: 15900,
    original_price: null,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=85'],
    skin_tones: ['clair', 'marron-clair', 'metisse'],
    badges: ['Hydratant'],
    rating: 4.4,
    review_count: 62,
    short_description: 'Lait corps léger pour un éclat lumineux quotidien',
    description: 'Texture légère et non grasse, ce lait corporel laisse la peau veloutée et lumineuse toute la journée.',
    benefits: ['Non gras', 'Absorption instantanée', 'Parfum délicat', 'Vegan'],
    usage: "Appliquer matin et soir sur l'ensemble du corps.",
    ingredients: null,
    in_stock: true,
    is_new: false,
    is_bestseller: false,
  },
];

async function seed() {
  console.log('🌱 Seeding Supabase products table...\n');

  const url = `${SUPABASE_URL}/rest/v1/products`;
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(PRODUCTS),
    });

    const text = await res.text();

    if (res.ok || res.status === 201) {
      console.log(`✅ ${PRODUCTS.length} produits insérés avec succès !`);
      console.log('\nProduits seedés:');
      PRODUCTS.forEach(p => console.log(`  → ${p.id}. ${p.name} (${p.category})`));
    } else {
      console.error(`❌ Erreur ${res.status}: ${text}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);
    process.exit(1);
  }

  // Vérification: récupérer les produits insérés
  console.log('\n🔍 Vérification...');
  const check = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,is_bestseller&order=id`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });
  const data = await check.json();
  console.log(`✅ ${data.length} produits trouvés dans la table:`);
  data.forEach(p => console.log(`  ${p.id}. ${p.name}${p.is_bestseller ? ' ⭐' : ''}`));
}

seed();
