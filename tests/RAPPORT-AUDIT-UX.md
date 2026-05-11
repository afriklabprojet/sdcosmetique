# 🔍 RAPPORT D'AUDIT UX/UI — SD Cosmétique
> Audit automatisé par Playwright + Axe-core  
> Date : 11 mai 2026  
> URL auditée : http://localhost:3000  
> Pages analysées : 7 | Viewports : 4 (mobile, tablet, desktop, wide)

---

## 🏆 SCORE GLOBAL

| Dimension | Score | Niveau |
|-----------|-------|--------|
| **UX** | 8/10 | 🟢 Bon |
| **UI** | 3/10 | 🔴 Critique |
| **Accessibilité** | 6/10 | 🟡 Passable |
| **Responsive** | 4/10 | 🔴 Critique |
| **Performance visuelle** | 9/10 | 🟢 Bon |
| **Cohérence design** | 9.5/10 | 🟢 Bon |

**Score moyen : 6.6/10**

---

## 🚨 PROBLÈMES CRITIQUES

- ❌ **[select-name]** Ensure select element has an accessible name *(1 élément(s))*

### ⚠️ Violations sérieuses (1)
- **[color-contrast]** Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds *(11 nœud(s))*

---

## 🔴 PROBLÈMES MAJEURS DÉTECTÉS

### 1. Styles Inline Excessifs
- **Problème :** ? éléments utilisent `style="..."` inline  
- **Impact :** Maintenabilité dégradée, impossible d'avoir un design system cohérent, surcharge HTML  
- **Recommandation :** Migrer vers des classes CSS / design tokens (CSS variables). Cible : < 20 éléments inline  
- **Priorité :** 🔴 HAUTE

### 2. Contraste — 10 potentiels problèmes détectés
- **"SD CosmetiqueBeauté Africaine de Prestig"** → ratio 1.21:1 (requis 4.5:1 — WCAG AA)
- **"SD Cosmetique"** → ratio 1.21:1 (requis 3:1 — WCAG AA Large)
- **"ACCUEIL"** → ratio 1.11:1 (requis 4.5:1 — WCAG AA)
- **"VISAGE"** → ratio 1.11:1 (requis 4.5:1 — WCAG AA)
- **"CORPS"** → ratio 1.11:1 (requis 4.5:1 — WCAG AA)

### 3. Cibles tactiles insuffisantes (mobile)
**15 éléments interactifs < 44px détectés :**
- `<a>` "Facebook" — 14×14px
- `<a>` "Instagram" — 14×14px
- `<a>` "TikTok" — 14×14px
- `<a>` "ACCUEIL" — 61×26px
- `<a>` "VISAGE" — 52×26px
- `<a>` "CORPS" — 48×26px
- `<a>` "GAMMES" — 63×26px
- `<a>` "KITS" — 33×26px

### 4. Overflow horizontal
**10 éléments débordent :**
- `DIV.fixed` → +448px
- `DIV.flex` → +448px
- `DIV` → +116px
- `H2.text-lg` → +116px
- `P.text-xs` → +116px

---

## ⚡ QUICK WINS (fort impact, implémentation rapide)

1. **CSS Variables** — Remplacer les `style={{}}` par des tokens CSS globaux (--color-gold, --spacing-md…). Impact majeur sur maintenabilité.
2. **Focus visible** — S'assurer que `:focus-visible` est visible sur tous les éléments interactifs (outline 2px offset).
3. **alt images** — Vérifier que 100% des `<img>` ont un attribut `alt` descriptif.
4. **Skip link** — Ajouter un lien "Aller au contenu" en top de page pour la navigation clavier.
5. **Loading states** — Ajouter `aria-busy` + skeleton loaders lors des chargements de données.

---

## 📱 ANALYSE MOBILE (390px — iPhone 14)

### Points forts
- Structure verticale correcte sur la plupart des pages
- Images Next.js optimisées (`_next/image`)

### Points d'attention
- ⚠️ **15 éléments tactiles < 44px** — risque de taux de tap manqués élevé
- ❌ **Overflow horizontal** détecté sur 10 éléments
- Vérifier la taille du texte min. **16px** sur tous les inputs (évite le zoom auto iOS)
- Le panier/navbar mobile doit être testée après chaque refacto layout

### Recommandations mobile-first
- Passer à une approche **thumb zone** : CTA principaux dans la zone basse (60–80% du viewport)
- Augmenter les gaps entre éléments de liste à **12px minimum** sur mobile
- S'assurer que le menu mobile ferme correctement après navigation

---

## 🎨 ANALYSE DESIGN SYSTEM

### Typographie
- **Familles de polices détectées :** non disponible
- **Tailles distinctes :** ? tailles → ✅ Acceptable
- **Échelle recommandée :** 12 / 14 / 16 / 18 / 24 / 32 / 48px

### Couleurs
- **Arrière-plans distincts :** ? → ✅ OK
- **Recommandation :** Définir une palette de 3-4 neutres + 1-2 couleurs accent + 1 couleur sémantique (erreur, succès)

### Border Radius
- **Valeurs distinctes :** ? → ✅ Cohérent
- **Recommandation :** 2-3 valeurs maximum (ex: 4px card, 8px modal, 999px pill)

### Espacements
- **CSS Variables définies :** ✅ Oui
- **Styles inline :** ? éléments → ✅ Acceptable

---

## ⚡ PERFORMANCE VISUELLE

| Métrique | Valeur | Cible | Statut |
|---------|--------|-------|--------|
| FCP moyen | 268ms | < 1800ms | ✅ |
| TTFB moyen | 128ms | < 200ms | ✅ |
| Load complet | 939ms | < 4000ms | ✅ |

### Recommandations performance
- Vérifier que `<Image>` Next.js est utilisé sur **toutes** les images produit (pas de balises `<img>` nues)
- Utiliser `priority` sur le LCP (image hero de la homepage)
- Activer le **preloading** des fonts critiques dans `<head>`

---

## ♿ ACCESSIBILITÉ WCAG 2.1

### Résumé par page
| 🔴 `/boutique` | 4 violations | 1 critiques | 1 sérieuses |

### Violations les plus fréquentes
- `color-contrast` — 11 occurrence(s)
- `region` — 4 occurrence(s)
- `heading-order` — 1 occurrence(s)
- `select-name` — 1 occurrence(s)

---

## 🎯 RECOMMANDATIONS SENIOR

### Architecture UI (priorité immédiate)
1. **Design Tokens** — Créer `src/styles/tokens.css` avec variables CSS : couleurs, spacing, typography, shadows, radius. Cible : 0 hardcode.
2. **Component Library** — Extraire Button, Card, Badge, Input en composants atomiques avec variantes (variant="primary|ghost|outline").
3. **Supprimer les styles inline** — ? éléments → passer à des classes Tailwind ou CSS Modules.

### UX Conversion (e-commerce)
4. **Social proof** — Ajouter le nombre d'avis et étoiles directement sur les cartes produit dans la boutique.
5. **Sticky Add-to-Cart** — Sur mobile, le bouton "Ajouter au panier" doit rester sticky en bas lors du scroll sur la page produit.
6. **Progress indicator checkout** — Ajouter un stepper visible (Étape 1/3) au-dessus du formulaire checkout.
7. **Trust signals** — Livraison gratuite / retours / paiement sécurisé → afficher en header ou sous le CTA principal.

### Mobile Premium (SaaS feel)
8. **Micro-interactions** — Ajouter une animation de confirmation lors de l'ajout panier (badge qui pulse, toast).
9. **Skeleton loading** — Remplacer les états vides par des skeletons sur la boutique lors du chargement.
10. **Haptic feedback simulation** — Utiliser `transition: transform 0.1s` + scale(0.97) sur les boutons pour le tap feedback.

### Accessibilité (conformité)
11. **Skip navigation** — `<a href="#main-content" class="sr-only focus:not-sr-only">` en premier élément du `<body>`.
12. **Live regions** — Utiliser `aria-live="polite"` sur les toasts, confirmations panier, messages d'erreur formulaire.
13. **Focus management** — Sur les modales/drawers : piéger le focus, restaurer le focus sur l'élément déclencheur à la fermeture.

---

## 🗺️ ROADMAP D'AMÉLIORATION

### 🔴 Priorité Haute (Sprint 1)
- [ ] Créer `src/styles/tokens.css` — Design tokens CSS variables
- [ ] Auditer et corriger les violations Axe `critical` et `serious`
- [ ] Ajouter `skip-to-content` link
- [ ] Sticky CTA mobile sur page produit
- [ ] Corriger les inputs < 44px sur mobile

### 🟡 Priorité Moyenne (Sprint 2-3)
- [ ] Extraire composants Button, Card, Badge atomiques
- [ ] Ajouter skeleton loaders boutique + liste produits
- [ ] Social proof sur cartes produit (étoiles, nb avis)
- [ ] Micro-animation confirmation ajout panier
- [ ] Progress indicator checkout (étapes)
- [ ] Améliorer les focus states (outline visible)

### 🟢 Priorité Basse (Sprint 4+)
- [ ] Audit complet Lighthouse CI (score > 90)
- [ ] Internationalisation (i18n)
- [ ] Mode sombre (dark mode)
- [ ] Animation de transition page-à-page (View Transitions API)
- [ ] PWA (manifest + service worker)
- [ ] Personnalisation (quiz → recommandations persistantes)

---

## 📁 SCREENSHOTS GÉNÉRÉS

Tous les screenshots sont dans : `tests/audit-screenshots/`

| Fichier | Description |
|---------|-------------|
| `homepage-mobile.png` | homepage — mobile |
| `homepage-tablet.png` | homepage — tablet |
| `homepage-desktop.png` | homepage — desktop |
| `homepage-wide.png` | homepage — wide |
| `boutique-mobile.png` | boutique — mobile |
| `boutique-tablet.png` | boutique — tablet |
| `boutique-desktop.png` | boutique — desktop |
| `boutique-wide.png` | boutique — wide |
| `produit-mobile.png` | produit — mobile |
| `produit-tablet.png` | produit — tablet |
| `produit-desktop.png` | produit — desktop |
| `produit-wide.png` | produit — wide |
| `quiz-mobile.png` | quiz — mobile |
| `quiz-tablet.png` | quiz — tablet |
| `quiz-desktop.png` | quiz — desktop |
| `quiz-wide.png` | quiz — wide |
| `connexion-mobile.png` | connexion — mobile |
| `connexion-tablet.png` | connexion — tablet |
| `connexion-desktop.png` | connexion — desktop |
| `connexion-wide.png` | connexion — wide |
| `inscription-mobile.png` | inscription — mobile |
| `inscription-tablet.png` | inscription — tablet |
| `inscription-desktop.png` | inscription — desktop |
| `inscription-wide.png` | inscription — wide |
| `checkout-mobile.png` | checkout — mobile |
| `checkout-tablet.png` | checkout — tablet |
| `checkout-desktop.png` | checkout — desktop |
| `checkout-wide.png` | checkout — wide |

---

*Rapport généré automatiquement le 11 mai 2026 par Playwright Audit*  
*Stack : Playwright 1.59 + @axe-core/playwright + Analyse DOM custom*
