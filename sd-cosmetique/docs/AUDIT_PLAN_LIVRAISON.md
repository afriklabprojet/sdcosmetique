# Audit et plan de livraison - SD Cosmetique

Date: 29 avril 2026
Objectif: terminer un MVP e-commerce complet d'ici demain soir.

## Avancement implementation

### Phase 1 - Stabilisation technique: terminee

- Erreurs ESLint bloquantes corrigees.
- Routes `/boutique` et `/boutique/*` ajoutees pour eviter les 404.
- Liens navbar et Hero categories alignes avec les routes reelles.
- `CartDrawer` monte dans le layout global.
- Icone panier navbar connectee a l'ouverture du drawer.
- Panier persiste en `localStorage`.
- Wishlist persistee en `localStorage`.

Validations apres Phase 1:

```txt
npm run lint: OK avec warnings next/image uniquement
npx tsc --noEmit: OK
npm run build: OK
/boutique et /boutique/*: 200 OK
```

### Phase 2 - Pages categories et catalogue: terminee

- Onglet et textes visibles `Boutique` retires du parcours public.
- `/boutique` conserve comme route de secours et redirige vers `/categorie/gammes`.
- Categories menu verifiees: Visage, Corps, Gammes, Kits, Duo.
- Heroes categories remplaces par les assets locaux SD Cosmetique.
- Page categorie enrichie avec navigation inter-categories, tri, filtre carnation et visuels de marque.
- Cartes produits uniformisees: categorie lisible, stock, badge principal, prix barre, bouton panier.
- Section meilleures ventes connectee au vrai catalogue au lieu de produits mock separes.
- Page produit harmonisee: libelle categorie public, images Next, suggestions contextualisees.
- Hydration React corrigee sur panier/wishlist persistants avec `useSyncExternalStore`.

Validations apres Phase 2:

```txt
npm run lint: OK avec 8 warnings next/image restants
npx tsc --noEmit: OK
npm run build: OK
Routes: /, /categorie/face, /categorie/body, /categorie/gammes, /categorie/kits, /categorie/duo, /produit/serum-eclat-intense: 200 OK
/boutique: 307 vers /categorie/gammes
Navigateur: accueil sans lien Boutique visible, categorie -> produit -> panier OK, aucune erreur hydration
```

## Etat actuel

### Ce qui fonctionne

- Accueil avec sections marketing et HeroBanner.
- Pages categories reelles: `/categorie/face`, `/categorie/body`, `/categorie/gammes`, `/categorie/kits`, `/categorie/duo`.
- Fiche produit: `/produit/serum-eclat-intense` et autres produits via slug.
- Panier persistant via `CartContext` et `localStorage`.
- Wishlist persistante via `WishlistContext` et `localStorage`.
- Checkout en 3 etapes: panier, livraison, paiement.
- Page compte, page confirmation, quiz teint et page wishlist existent.
- Build production Next.js OK.
- TypeScript `npx tsc --noEmit` OK.

### Bloquants restants

- Le paiement est simule avec `setTimeout`.
- Aucune commande n'est persistee apres checkout.
- La page compte est une maquette statique sans authentification.
- Les utilitaires Supabase existent mais ne sont pas branches aux parcours auth/commande.
- Il reste 8 warnings `next/image` non bloquants.
- `npm audit` signale 2 vulnerabilites moderates via PostCSS embarque dans Next. Ne pas lancer `npm audit fix --force`, car il propose une retrogradation cassante de Next.

## Resultats de validation

```txt
npm run build: OK
npx tsc --noEmit: OK
npm run lint: KO - 6 erreurs, 17 warnings
npm audit --audit-level=moderate: KO - 2 vulnerabilites moderates via next/postcss
```

Routes verifiees:

```txt
200 /
404 /boutique
404 /boutique/visage
404 /boutique/corps
404 /boutique/gammes
200 /categorie/face
200 /categorie/body
200 /categorie/gammes
200 /categorie/kits
200 /categorie/duo
200 /produit/serum-eclat-intense
200 /checkout
200 /compte
200 /wishlist
200 /quiz
200 /confirmation
```

## Scope MVP recommande

Pour livrer demain soir, viser un MVP e-commerce demonstrable et utilisable:

- Catalogue complet en donnees locales.
- Navigation sans 404.
- Produit, panier, wishlist et checkout fonctionnels.
- Persistance locale panier/wishlist.
- Creation de commande locale ou Supabase selon disponibilite des credentials.
- Paiement en mode `commande recue / paiement a la livraison ou Mobile Money manuel`, si aucune API paiement n'est disponible.
- Page compte en mode invite ou session Supabase simple si credentials OK.
- Pages legales minimum: livraison, retours, confidentialite, CGV, contact.

Hors scope pour demain si aucune cle API paiement n'est disponible:

- Paiement en ligne reel avec webhook.
- Backoffice complet de gestion produits.
- Historique commande authentifie complet.
- Emails transactionnels automatises en production.

## Plan d'execution priorise

### Phase 1 - Stabilisation technique (2h)

- Corriger les 6 erreurs ESLint.
- Corriger les liens du menu vers `/categorie/*` ou creer des alias `/boutique/*`.
- Monter `CartDrawer` dans `RootLayout`.
- Relier l'icone panier de la navbar a `openCart()` au lieu d'envoyer directement vers checkout.
- Ajouter persistance `localStorage` pour panier et wishlist.

Critere de succes:

- `npm run lint` passe.
- `npm run build` passe.
- Aucun lien navbar en 404.
- Ajout panier visible sans changer de page.

### Phase 2 - Pages categories et catalogue (3h)

- Harmoniser les slugs affiches: `face/body` vs `visage/corps`.
- Ajouter une page boutique globale ou rediriger `/boutique` vers `/categorie/gammes`.
- Verifier chaque categorie avec au moins un produit.
- Remplacer les textes/images generiques les plus visibles.
- Uniformiser les cartes produits, badges, prix, stock et CTA.

Critere de succes:

- Toutes les categories du menu ouvrent une page utile.
- Le parcours accueil -> categorie -> produit -> panier fonctionne.

### Phase 3 - Checkout vendable (4h)

- Valider les champs livraison cote client avec messages clairs.
- Generer un numero de commande stable au moment de la soumission, pas pendant le render.
- Creer un modele `OrderDraft` cote client.
- Enregistrer la derniere commande en `localStorage` si Supabase n'est pas pret.
- Brancher la page confirmation sur la commande creee.
- Ajouter mode paiement manuel clair: Wave, Orange Money, carte, paiement a la livraison selon decision business.

Critere de succes:

- Une commande affiche un numero stable.
- Le recapitulatif confirmation garde les produits apres validation.
- Le panier est vide uniquement apres commande creee.

### Phase 4 - Auth/compte minimal (3h)

Option rapide sans backend:

- Transformer `/compte` en espace client local: dernieres commandes localStorage, favoris, adresses locales.

Option Supabase si env et tables pretes:

- Ajouter login magic link.
- Proteger compte et associer commandes a l'utilisateur.

Critere de succes:

- La page compte n'affiche plus de faux utilisateur `Aicha K.` si aucune session.
- Les commandes visibles correspondent aux commandes creees.

### Phase 5 - Pages de confiance et polish (3h)

- Ajouter pages contact, livraison, retours, CGV, confidentialite.
- Ajouter footer links vers ces pages.
- Verifier mobile: accueil, categorie, produit, checkout, compte.
- Remplacer emojis par icones ou texte si necessaire.
- Nettoyer les warnings `<img>` les plus importants avec `next/image`.

Critere de succes:

- Parcours mobile complet sans element casse.
- Pages legales accessibles depuis footer.

### Phase 6 - QA finale et go-live (2h)

- Tester parcours complet desktop et mobile.
- Tester panier apres refresh.
- Tester wishlist apres refresh.
- Tester checkout avec panier vide et panier rempli.
- Tester toutes les routes principales.
- Relancer `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Capturer une checklist de livraison.

Critere de succes:

- Checks verts.
- Aucun 404 sur navigation visible.
- Parcours achat complet valide.

## Ordre de travail demain

1. 09:00-11:00 - Phase 1: stabilisation technique.
2. 11:00-14:00 - Phase 2: catalogue/categories.
3. 14:00-18:00 - Phase 3: checkout vendable.
4. 18:00-21:00 - Phase 4: compte/auth minimal.
5. 21:00-23:00 - Phase 5: pages de confiance et polish.
6. 23:00-00:30 - Phase 6: QA finale et build.

## Decisions a prendre vite

- Paiement reel demain ou commande manuelle Mobile Money ?
- Supabase disponible avec tables commandes/utilisateurs ou MVP localStorage ?
- Les categories publiques doivent-elles etre `/categorie/*` ou `/boutique/*` ?
- Pays de vente prioritaire: Senegal, Cote d'Ivoire, ou multi-pays ?

## Recommandation

Le meilleur chemin pour terminer demain soir est:

1. Stabiliser un MVP local d'abord.
2. Eviter d'integrer un paiement reel sans credentials et webhooks valides.
3. Utiliser Supabase uniquement si les variables env et le schema sont disponibles au debut de la journee.
4. Garder le checkout en commande manuelle si besoin, mais le rendre transparent et credible.