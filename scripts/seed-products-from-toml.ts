/**
 * Seeder produits à partir d'un fichier TOML scrapé (ex: trash/helia-products-2026-08-03.toml).
 *
 * Usage :
 *   1. Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *   2. bunx dotenv -e .env.local -- bunx tsx scripts/seed-products-from-toml.ts <fichier.toml>
 *
 * Le fichier TOML attendu contient des blocs [[products]] avec les champs :
 *   slug, name, brand?, category, price, original_price?, rating?, skin_tones?,
 *   images?, description?, usage?
 *
 * - `id` (PK) = `slug` (déterministe → upsert idempotent, ré-exécutable sans doublons).
 * - `brand`, quand présent, est préfixé au nom ("NIVEA — Déodorant...") car la table
 *   `products` n'a pas de colonne dédiée (supabase/migrations/20260504013000_create_products.sql).
 * - `category` doit être une valeur de CATEGORIES (src/shared/types/domain.type.ts) ;
 *   les valeurs hors-liste sont rejetées pour ne pas casser les filtres boutique.
 */

import { readFileSync } from 'node:fs';
import { parse } from 'smol-toml';
import { createClient } from '@supabase/supabase-js';

const VALID_CATEGORIES = ['body', 'face', 'gammes', 'kits', 'duo', 'kit-levre', 'minceur'];
const VALID_SKIN_TONES = ['noir', 'marron', 'marron-clair', 'clair', 'metisse'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('❌  Usage: tsx scripts/seed-products-from-toml.ts <fichier.toml>');
  process.exit(1);
}

interface TomlProduct {
  slug: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  original_price?: number;
  rating?: number;
  skin_tones?: string[];
  images?: string[];
  description?: string;
  usage?: string;
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function main() {
  const raw = readFileSync(filePath, 'utf-8');
  const data = parse(raw) as { products?: TomlProduct[] };
  const products = data.products ?? [];

  if (products.length === 0) {
    console.error('❌  Aucun bloc [[products]] trouvé dans', filePath);
    process.exit(1);
  }

  console.log(`📦  ${products.length} produit(s) trouvé(s) dans ${filePath}\n`);

  let inserted = 0;
  let skipped = 0;

  for (const p of products) {
    if (!p.slug || !p.name || !p.price) {
      console.warn(`⚠️  Ignoré (champs obligatoires manquants) : ${p.slug ?? p.name ?? '???'}`);
      skipped++;
      continue;
    }

    const category = VALID_CATEGORIES.includes(p.category) ? p.category : 'body';
    if (category !== p.category) {
      console.warn(`⚠️  Catégorie "${p.category}" invalide pour "${p.slug}" → repli sur "body"`);
    }

    const skinTones = (p.skin_tones ?? []).filter((t) => VALID_SKIN_TONES.includes(t));

    const name = p.brand ? `${p.brand} — ${p.name}` : p.name;

    const row = {
      id: p.slug,
      slug: p.slug,
      name,
      category,
      price: Math.round(p.price),
      original_price: p.original_price ? Math.round(p.original_price) : null,
      images: (p.images ?? []).filter((url) => url.trim() !== ''),
      skin_tones: skinTones,
      badges: [] as string[],
      rating: p.rating ?? 0,
      review_count: 0,
      short_description: (p.description ?? '').slice(0, 160).trim() || slugToTitle(p.slug),
      description: p.description ?? '',
      benefits: [] as string[],
      usage: p.usage ?? '',
      ingredients: null,
      in_stock: true,
      is_new: false,
      is_bestseller: false,
    };

    const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });

    if (error) {
      console.error(`❌  Échec pour "${p.slug}" :`, error.message);
      skipped++;
    } else {
      console.log(`✅  ${row.name}`);
      inserted++;
    }
  }

  console.log(`\n🎉  Terminé : ${inserted} upsertés, ${skipped} ignorés.`);
}

main().catch((err) => {
  console.error('❌  Erreur fatale :', err);
  process.exit(1);
});
