# SD Cosmétique

Boutique e-commerce de cosmétiques haut de gamme pour peaux à mélanine, développée avec Next.js 15 App Router.

## Stack

- **Framework** : Next.js 15 (App Router, Server Components)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v4 + CSS custom properties
- **Base de données** : Supabase (PostgreSQL + Auth + Storage)
- **Emails** : Resend
- **Paiement** : Jeko Pay (intégration Africa)
- **Déploiement** : Hostinger VPS (PM2) / Vercel-ready

## Fonctionnalités

- Catalogue produits avec filtres par teinte et catégorie
- Quiz de diagnostic peau → recommandations personnalisées
- Panier, wishlist, checkout complet
- Authentification (inscription, connexion, mot de passe oublié)
- Compte client avec historique commandes
- Dashboard admin avec analytics, gestion commandes/produits/clients
- Programme fidélité Jeko (tiers Bronze → Or → Platine)
- Emails transactionnels (confirmation commande, expédition, bienvenue)
- PWA ready (manifest, offline support)
- SEO : sitemap.xml, robots.txt, OG images, métadonnées dynamiques

## Lancer en local

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY...

# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/          # Pages (App Router)
├── components/   # Composants React
├── lib/          # Services, helpers, config
├── context/      # CartContext, WishlistContext
└── utils/        # Supabase client, helpers
supabase/
└── migrations/   # Schémas SQL versionnés
```

## Scripts utiles

```bash
npm run build       # Build production
npm run lint        # ESLint
npx tsc --noEmit    # Vérification types TypeScript
```

## Variables d'environnement requises

Voir `.env.example` pour la liste complète.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (server-side uniquement) |
| `RESEND_API_KEY` | Clé API Resend (emails) |
| `NEXT_PUBLIC_SITE_URL` | URL du site en production |
| `JEKO_PAY_SECRET_KEY` | Clé secrète Jeko Pay |




