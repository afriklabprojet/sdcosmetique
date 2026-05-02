-- ============================================================
-- SD COSMETIQUE — Supabase Schema
-- Coller dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
create table if not exists public.products (
  id              text primary key,
  name            text not null,
  slug            text unique not null,
  category        text not null,
  price           int not null,
  original_price  int,
  images          text[]   default '{}',
  skin_tones      text[]   default '{}',
  badges          text[]   default '{}',
  rating          numeric(3,1) default 0,
  review_count    int      default 0,
  short_description text,
  description     text,
  benefits        text[]   default '{}',
  usage           text,
  ingredients     text,
  in_stock        boolean  default true,
  is_new          boolean  default false,
  is_bestseller   boolean  default false,
  created_at      timestamptz default now()
);

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,
  created_at      timestamptz default now(),
  subtotal        int not null,
  shipping_cost   int default 0,
  total           int not null,
  payment_method  text not null,
  status          text default 'confirmed',
  items           jsonb default '[]',
  delivery        jsonb default '{}',
  user_id         uuid references auth.users(id)
);

-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references public.products(id) on delete cascade,
  author      text not null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  skin_tone   text,
  verified    boolean default false,
  created_at  timestamptz default now()
);

-- ── RLS (Row Level Security) ──────────────────────────────────
-- Produits : lecture publique
alter table public.products enable row level security;
create policy "products_read_all" on public.products for select using (true);
create policy "products_write_auth" on public.products for all using (auth.role() = 'authenticated');

-- Commandes : lecture par l'auteur + accès total auth
alter table public.orders enable row level security;
create policy "orders_read_own" on public.orders for select using (
  user_id = auth.uid() or auth.role() = 'authenticated'
);
create policy "orders_insert_any" on public.orders for insert with check (true);
create policy "orders_update_auth" on public.orders for update using (auth.role() = 'authenticated');

-- Avis : lecture publique
alter table public.reviews enable row level security;
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_insert_auth" on public.reviews for insert with check (true);

-- ── SEED DATA — PRODUITS ──────────────────────────────────────
insert into public.products (id, name, slug, category, price, original_price, images, skin_tones, badges, rating, review_count, short_description, description, benefits, usage, ingredients, in_stock, is_new, is_bestseller) values

('1', 'Sérum Éclat Intense', 'serum-eclat-intense', 'face', 24900, 32000,
 array['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85','https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=85'],
 array['noir','marron','marron-clair','metisse'],
 array['Bestseller','-22%'],
 4.8, 124,
 'Sérum unificateur pour un teint éclatant en 7 jours',
 'Notre sérum phare formulé spécialement pour les peaux mélanisées. Enrichi en vitamine C africaine et en huile de baobab, il unifie le teint, réduit les taches et révèle l''éclat naturel de votre peau.',
 array['Unifie le teint en 7 jours','Réduit les taches pigmentaires','Hydratation 24h','Sans paraben'],
 'Appliquer 2-3 gouttes sur le visage propre matin et soir. Masser doucement en mouvements circulaires.',
 'Aqua, Niacinamide 10%, Vitamine C, Huile de Baobab, Acide Hyaluronique, Aloe Vera Bio',
 true, false, true),

('2', 'Crème Unifiante Karité', 'creme-unifiante-karite', 'body', 18500, null,
 array['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=85','https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=85'],
 array['noir','marron','marron-clair','clair','metisse'],
 array['Nouveau'],
 4.9, 89,
 'Crème corps unifiante au beurre de karité pur',
 'Formulée avec du beurre de karité pur du Burkina Faso, cette crème nourrit profondément tout en unifiant le teint du corps.',
 array['Peau soyeuse en 3 jours','Formule 100% naturelle','Beurre de karité certifié','Convient à toutes les peaux'],
 'Appliquer sur l''ensemble du corps après la douche sur peau légèrement humide.',
 null, true, true, false),

('3', 'Kit Illuminateur Complet', 'kit-illuminateur-complet', 'kits', 52000, 68000,
 array['https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&q=85','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=85'],
 array['noir','marron','marron-clair','metisse'],
 array['Kit Complet','-24%'],
 4.7, 56,
 'Le kit idéal pour un teint parfait de la tête aux pieds',
 'Coffret complet incluant sérum visage, crème corps, huile sèche et masque éclat. La routine complète pour révéler votre beauté naturelle.',
 array['Routine complète','Économie de 30%','Livraison offerte','Emballage cadeau inclus'],
 'Utiliser chaque produit selon ses instructions spécifiques.',
 null, true, false, true),

('4', 'Huile Précieuse 3-en-1', 'huile-precieuse-3en1', 'face', 21500, null,
 array['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=85','https://images.unsplash.com/photo-1570194065650-d99fb4b38dc8?w=800&q=85'],
 array['noir','marron','marron-clair','clair','metisse'],
 array['Top Rated'],
 4.9, 203,
 'Huile multi-usage visage, corps et cheveux',
 'Mélange exclusif d''huiles précieuses africaines : argan, marula, baobab. Convient au visage, corps et cheveux.',
 array['Triple usage','Absorb. rapide','Éclat immédiat','Anti-âge naturel'],
 'Quelques gouttes sur le visage, les pointes des cheveux ou le corps.',
 null, true, false, true),

('5', 'Duo Visage Éclat', 'duo-visage-eclat', 'duo', 38500, 46000,
 array['https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=800&q=85'],
 array['marron','marron-clair','metisse'],
 array['Duo','-16%'],
 4.6, 41,
 'Sérum + crème jour : duo parfait pour le visage',
 'Association parfaite de notre sérum éclat et de la crème jour hydratante pour une routine visage complète.',
 array['Synergie prouvée','Résultats en 14 jours','Format voyage inclus'],
 'Appliquer le sérum puis la crème jour sur peau propre.',
 null, true, true, false),

('6', 'Masque Argile Purifiant', 'masque-argile-purifiant', 'face', 14500, null,
 array['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=85'],
 array['noir','marron','marron-clair','clair','metisse'],
 array[]::text[],
 4.5, 78,
 'Masque à l''argile verte pour pores affinés',
 'Masque purifiant à l''argile verte et au charbon actif, idéal pour les peaux à tendance grasse.',
 array['Pores affinés','Peau nette','Sans perturbateurs endocriniens'],
 'Appliquer une couche épaisse, laisser 10-15 min, rincer.',
 null, true, false, false),

('7', 'Gamme Royale Complète', 'gamme-royale-complete', 'gammes', 89000, 115000,
 array['https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=85'],
 array['noir','marron','metisse'],
 array['Collection','-23%'],
 5.0, 27,
 'La collection complète pour la reine africaine',
 'Notre gamme premium la plus complète, incluant 7 produits soigneusement sélectionnés pour une transformation totale.',
 array['7 produits essentiels','Transformation en 30 jours','Coffret luxe inclus','Livraison premium'],
 'Suivre le guide de routine inclus dans le coffret.',
 null, true, false, true),

('8', 'Lait Corporel Lumineux', 'lait-corporel-lumineux', 'body', 15900, null,
 array['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=85'],
 array['clair','marron-clair','metisse'],
 array['Hydratant'],
 4.4, 62,
 'Lait corps léger pour un éclat lumineux quotidien',
 'Texture légère et non grasse, ce lait corporel laisse la peau veloutée et lumineuse toute la journée.',
 array['Non gras','Absorption instantanée','Parfum délicat','Vegan'],
 'Appliquer matin et soir sur l''ensemble du corps.',
 null, true, false, false)

on conflict (id) do nothing;

-- ── SEED DATA — AVIS ──────────────────────────────────────────
insert into public.reviews (product_id, author, rating, comment, skin_tone, verified) values
('1', 'Aminata D.', 5, 'Produit exceptionnel, résultats visibles en une semaine !', 'marron', true),
('1', 'Fatou K.', 5, 'Texture agréable, s''intègre parfaitement dans ma routine.', 'noir', true),
('1', 'Marie L.', 4, 'Bon produit, je recommande. Livraison rapide aussi.', 'marron-clair', false),
('2', 'Coumba S.', 5, 'Mon beurre de karité préféré, peau ultra douce !', 'noir', true),
('3', 'Aïssatou B.', 5, 'Le kit parfait pour débuter une routine. Résultats au-delà de mes attentes.', 'marron', true),
('4', 'Sophie M.', 5, 'Cette huile est magique ! Je l''utilise sur le visage et les cheveux.', 'metisse', true)
on conflict do nothing;
