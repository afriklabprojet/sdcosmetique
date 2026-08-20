import 'dotenv/config';
import { db } from '../src/shared/db';
import { users, siteConfig, categories, quizConcerns, quizRoutines, jekoConfig, products } from '../src/shared/db/schema';
import { hashPassword } from '../src/shared/auth/auth.service';
import { DEFAULT_SITE_CONFIG } from '../src/features/site-config/site-config.constant';
import { JEKO_TIERS, JEKO_REWARDS } from '../src/features/loyalty/jeko.repository';
import { eq } from 'drizzle-orm';

const PRODUCTS_TO_SEED = [
  {
    id: '1',
    name: 'Sérum Éclat Intense',
    slug: 'serum-eclat-intense',
    category: 'face',
    price: 24900,
    originalPrice: 32000,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=85',
    ],
    skinTones: ['noir', 'marron', 'marron-clair', 'metisse'],
    badges: ['Bestseller', '-22%'],
    rating: '4.8',
    reviewCount: 124,
    shortDescription: 'Sérum unificateur pour un teint éclatant en 7 jours',
    description: "Notre sérum phare formulé spécialement pour les peaux mélanisées. Enrichi en vitamine C africaine et en huile de baobab, il unifie le teint, réduit les taches et révèle l'éclat naturel de votre peau.",
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
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=85',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=85',
    ],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Nouveau'],
    rating: '4.9',
    reviewCount: 89,
    shortDescription: 'Crème corps unifiante au beurre de karité pur',
    description: 'Formulée avec du beurre de karité pur du Burkina Faso, cette crème nourrit profondément tout en unifiant le teint du corps.',
    benefits: ['Peau soyeuse en 3 jours', 'Formule 100% naturelle', 'Beurre de karité certifié', 'Convient à toutes les peaux'],
    usage: "Appliquer sur l'ensemble du corps après la douche sur peau légèrement humide.",
    ingredients: null,
    inStock: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '3',
    name: 'Kit Illuminateur Complet',
    slug: 'kit-illuminateur-complet',
    category: 'kits',
    price: 52000,
    originalPrice: 68000,
    images: [
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&q=85',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=85',
    ],
    skinTones: ['noir', 'marron', 'marron-clair', 'metisse'],
    badges: ['Kit Complet', '-24%'],
    rating: '4.7',
    reviewCount: 56,
    shortDescription: 'Le kit idéal pour un teint parfait de la tête aux pieds',
    description: 'Coffret complet incluant sérum visage, crème corps, huile sèche et masque éclat. La routine complète pour révéler votre beauté naturelle.',
    benefits: ['Routine complète', 'Économie de 30%', 'Livraison offerte', 'Emballage cadeau inclus'],
    usage: 'Utiliser chaque produit selon ses instructions spécifiques.',
    ingredients: null,
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '4',
    name: 'Huile Précieuse 3-en-1',
    slug: 'huile-precieuse-3en1',
    category: 'face',
    price: 21500,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=85',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38dc8?w=800&q=85',
    ],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: ['Top Rated'],
    rating: '4.9',
    reviewCount: 203,
    shortDescription: 'Huile multi-usage visage, corps et cheveux',
    description: "Mélange exclusif d'huiles précieuses africaines : argan, marula, baobab. Convient au visage, corps et cheveux.",
    benefits: ['Triple usage', 'Absorb. rapide', 'Éclat immédiat', 'Anti-âge naturel'],
    usage: 'Quelques gouttes sur le visage, les pointes des cheveux ou le corps.',
    ingredients: null,
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '5',
    name: 'Duo Visage Éclat',
    slug: 'duo-visage-eclat',
    category: 'duo',
    price: 38500,
    originalPrice: 46000,
    images: ['https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=800&q=85'],
    skinTones: ['marron', 'marron-clair', 'metisse'],
    badges: ['Duo', '-16%'],
    rating: '4.6',
    reviewCount: 41,
    shortDescription: 'Sérum + crème jour : duo parfait pour le visage',
    description: 'Association parfaite de notre sérum éclat et de la crème jour hydratante pour une routine visage complète.',
    benefits: ['Synergie prouvée', 'Résultats en 14 jours', 'Format voyage inclus'],
    usage: 'Appliquer le sérum puis la crème jour sur peau propre.',
    ingredients: null,
    inStock: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '6',
    name: 'Masque Argile Purifiant',
    slug: 'masque-argile-purifiant',
    category: 'face',
    price: 14500,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=85'],
    skinTones: ['noir', 'marron', 'marron-clair', 'clair', 'metisse'],
    badges: [],
    rating: '4.5',
    reviewCount: 78,
    shortDescription: "Masque à l'argile verte pour pores affinés",
    description: "Masque purifiant à l'argile verte et au charbon actif, idéal pour les peaux à tendance grasse.",
    benefits: ['Pores affinés', 'Peau nette', 'Sans perturbateurs endocriniens'],
    usage: 'Appliquer une couche épaisse, laisser 10-15 min, rincer.',
    ingredients: null,
    inStock: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '7',
    name: 'Gamme Royale Complète',
    slug: 'gamme-royale-complete',
    category: 'gammes',
    price: 89000,
    originalPrice: 115000,
    images: ['https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=85'],
    skinTones: ['noir', 'marron', 'metisse'],
    badges: ['Collection', '-23%'],
    rating: '5.0',
    reviewCount: 27,
    shortDescription: 'La collection complète pour la reine africaine',
    description: 'Notre gamme premium la plus complète, incluant 7 produits soigneusement sélectionnés pour une transformation totale.',
    benefits: ['7 produits essentiels', 'Transformation en 30 jours', 'Coffret luxe inclus', 'Livraison premium'],
    usage: 'Suivre le guide de routine inclus dans le coffret.',
    ingredients: null,
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '8',
    name: 'Lait Corporel Lumineux',
    slug: 'lait-corporel-lumineux',
    category: 'body',
    price: 15900,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=85'],
    skinTones: ['clair', 'marron-clair', 'metisse'],
    badges: ['Hydratant'],
    rating: '4.4',
    reviewCount: 62,
    shortDescription: 'Lait corps léger pour un éclat lumineux quotidien',
    description: 'Texture légère et non grasse, ce lait corporel laisse la peau veloutée et lumineuse toute la journée.',
    benefits: ['Non gras', 'Absorption instantanée', 'Parfum délicat', 'Vegan'],
    usage: "Appliquer matin et soir sur l'ensemble du corps.",
    ingredients: null,
    inStock: true,
    isNew: false,
    isBestseller: false,
  },
];

async function seed() {
  console.log('🌱 Starting MariaDB initial seed...');

  // 1. Admin User
  const adminEmail = (process.env.ADMIN_EMAILS || 'admin@sdcosmetique.com').split(',')[0].trim().toLowerCase();
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@SDZ2026!';
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (!existingAdmin.length) {
    console.log(`Creating default admin: ${adminEmail}`);
    const hash = await hashPassword(adminPass);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
      prenom: 'Admin',
      nom: 'SD Cosmétique',
      points: 100,
    });
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  // 2. Site Config
  console.log('Seeding site_config...');
  for (const [key, value] of Object.entries(DEFAULT_SITE_CONFIG)) {
    const existing = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
    if (!existing.length) {
      await db.insert(siteConfig).values({ key, value: value as Record<string, unknown> });
    }
  }

  // 3. Jeko Loyalty Config
  console.log('Seeding jeko_config...');
  const jekoDefaults = [
    { key: 'settings', value: { points_per_1000: 10, welcome_bonus: 20 } },
    { key: 'tiers', value: JEKO_TIERS },
    { key: 'rewards', value: JEKO_REWARDS },
  ];
  for (const item of jekoDefaults) {
    const existing = await db.select().from(jekoConfig).where(eq(jekoConfig.key, item.key)).limit(1);
    if (!existing.length) {
      await db.insert(jekoConfig).values({ key: item.key, value: item.value as Record<string, unknown> });
    }
  }

  // 4. Default Categories
  console.log('Seeding categories...');
  const defaultCategories = [
    { id: 'cat-face', slug: 'face', label: 'Soins Visage', subLabel: 'Nettoyants, sérums & crèmes', image: '/hero/generated-skincare-hero.jpg', orderIndex: 1, active: true },
    { id: 'cat-body', slug: 'body', label: 'Soins Corps', subLabel: 'Laits, huiles & gommages', image: '/hero/generated-skincare-hero-2.jpg', orderIndex: 2, active: true },
    { id: 'cat-routine', slug: 'routine', label: 'Rituels & Coffrets', subLabel: 'Routines complètes', image: '/hero/full.png', orderIndex: 3, active: true },
  ];
  for (const cat of defaultCategories) {
    const existing = await db.select().from(categories).where(eq(categories.id, cat.id)).limit(1);
    if (!existing.length) {
      await db.insert(categories).values(cat);
    }
  }

  // 5. Quiz Concerns & Routines
  console.log('Seeding quiz...');
  const defaultConcerns = [
    { id: 'c1', label: 'Taches pigmentaires & Teint terne', meta: 'Éclat & Unification', glyph: '✦', sortOrder: 1, active: true },
    { id: 'c2', label: 'Sécheresse & Tiraillements', meta: 'Nutrition intense', glyph: '💧', sortOrder: 2, active: true },
    { id: 'c3', label: 'Imperfections & Excès de sébum', meta: 'Purifiant & Équilibrant', glyph: '🌿', sortOrder: 3, active: true },
    { id: 'c4', label: 'Fermeté & Premières rides', meta: 'Anti-âge & Lissant', glyph: '✨', sortOrder: 4, active: true },
  ];
  for (const c of defaultConcerns) {
    const existing = await db.select().from(quizConcerns).where(eq(quizConcerns.id, c.id)).limit(1);
    if (!existing.length) {
      await db.insert(quizConcerns).values(c);
    }
  }

  const defaultRoutines = [
    { id: 'r1', label: 'Éclat & Anti-taches', meta: 'Sérum Éclat + Crème Unifiante', glyph: '☀️', sortOrder: 1, active: true },
    { id: 'r2', label: 'Nutrition & Réparation', meta: 'Baume Karité + Huile Précieuse', glyph: '🌙', sortOrder: 2, active: true },
    { id: 'r3', label: 'Pureté & Matité', meta: 'Gel Purifiant + Soin Équilibrant', glyph: '🌿', sortOrder: 3, active: true },
  ];
  for (const r of defaultRoutines) {
    const existing = await db.select().from(quizRoutines).where(eq(quizRoutines.id, r.id)).limit(1);
    if (!existing.length) {
      await db.insert(quizRoutines).values(r);
    }
  }

  // 6. Products
  console.log('Seeding products...');
  for (const p of PRODUCTS_TO_SEED) {
    const existing = await db.select().from(products).where(eq(products.id, p.id)).limit(1);
    if (!existing.length) {
      await db.insert(products).values(p);
      console.log(`  → Added product: ${p.name}`);
    }
  }

  console.log('✅ MariaDB seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
