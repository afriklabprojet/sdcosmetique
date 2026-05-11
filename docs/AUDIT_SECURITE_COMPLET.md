# Rapport d'Audit Technique — SD Cosmétique
**Date :** Juillet 2025  
**Version analysée :** Next.js 16.2.4 / React 19.2.4 / @supabase/ssr 0.10.2  
**Périmètre :** Sécurité · Perf · Architecture · Qualité Code · DX · Accessibilité · SEO

---

## 📊 Tableau de Bord des Scores

| Dimension | Score | Tendance |
|-----------|-------|----------|
| 🔐 Sécurité | **4 / 10** | ⚠️ 3 failles critiques à corriger immédiatement |
| ⚡ Performance | **7 / 10** | 1 faille cache impactante + monitoring absent |
| 🏗️ Architecture | **6 / 10** | Double-save checkout, localStorage critique |
| 🧹 Qualité Code | **7 / 10** | Validations faibles, erreurs silencieuses |
| 🛠️ DX | **7.5 / 10** | Bonne structure, scripts utiles |
| ♿ Accessibilité | **6 / 10** | Emoji sans alt, sémantique à vérifier |
| 🔍 SEO | **7.5 / 10** | Structure en place, optimisations possibles |

**Score Global : 6.4 / 10**

---

## 🔴 Findings Critiques — P0 *(corriger avant toute mise en prod)*

---

### [SEC-01] Clés Supabase hardcodées dans le source

**Fichier :** `next.config.ts` lignes 28–31  
**Sévérité :** P0 — Critique  

```typescript
// ❌ Code actuel — valeurs réelles exposées dans git history + bundle JS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://spcguwuqqwvjfnfctrzs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Risque :** La clé anonyme Supabase et l'URL du projet sont visibles dans l'historique Git, le bundle JS client, et tout dépôt/CI qui clone le repo. Même si la clé "anon" a des permissions limitées, elle permet d'appeler directement l'API Supabase, de contourner le middleware Next.js, et d'accéder à tout ce que la RLS autorise pour les utilisateurs non-authentifiés.

**Correction :**

```typescript
// ✅ Supprimer les fallbacks — forcer l'obligation des env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[next.config] Env vars Supabase manquantes');
}
```

**Actions supplémentaires :**
1. `git log --all --full-history -- next.config.ts` — vérifier l'historique
2. Dans le dashboard Supabase : **Settings → API → Rotate anon key**
3. Ajouter `next.config.ts` à la revue de secrets CI (GitHub Secret Scanning)

---

### [SEC-02] Absence totale de Content-Security-Policy

**Fichier :** `next.config.ts` (section `headers`)  
**Sévérité :** P0 — Critique  

Le projet a `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy` et `Permissions-Policy`, mais **aucun `Content-Security-Policy`**. Sans CSP, toute XSS injectée dans la page peut exfiltrer des tokens, cookies, ou données bancaires depuis le checkout.

**Correction — ajouter dans `next.config.ts` :**

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // affiner progressivement
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://spcguwuqqwvjfnfctrzs.supabase.co",
    "connect-src 'self' https://*.supabase.co https://graph.facebook.com https://api.resend.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
},
```

> **Note :** Démarrer en mode `Content-Security-Policy-Report-Only` avec un endpoint `/api/csp-report` pour collecter les violations sans bloquer, puis durcir progressivement.

---

### [SEC-05] `getSession()` au lieu de `getUser()` dans le middleware Supabase

**Fichier :** `src/utils/supabase/middleware.ts`  
**Sévérité :** P0 — Critique  

```typescript
// ❌ Non sécurisé — session lue depuis le cookie, non vérifiée par le serveur Auth
const { data: { session }, error } = await supabase.auth.getSession();
```

**Risque :** Un attaquant peut forger un cookie de session valide structurellement (JWT non expiré mais révoqué, ou appartenant à un autre utilisateur). `getSession()` fait confiance au cookie **sans appeler le serveur Supabase Auth** pour vérifier que la session est toujours active. Un utilisateur banni ou dont le token a été révoqué reste "authentifié".

> Source : [Supabase Security Advisory — getSession() vs getUser()](https://supabase.com/docs/guides/auth/server-side/nextjs#security-note)

**Correction :**

```typescript
// ✅ Vérification serveur obligatoire
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  // utilisateur non authentifié
}
```

---

## 🟠 Findings Majeurs — P1 *(traiter dans le prochain sprint)*

---

### [SEC-03] `dangerouslyAllowSVG: true` sans CSP `img-src`

**Fichier :** `next.config.ts` (config `images`)  
**Sévérité :** P1  

```typescript
dangerouslyAllowSVG: true,  // ← sans contentDispositionType ni CSP img-src
```

Les SVG peuvent contenir du JavaScript exécutable. Sans restriction CSP sur `img-src`, un SVG uploadé par un utilisateur malveillant peut déclencher du XSS.

**Correction :**

```typescript
dangerouslyAllowSVG: true,
contentDispositionType: 'attachment',   // force téléchargement au lieu d'affichage inline
contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
```

---

### [SEC-04] `/confirmation` dans les routes publiques sans authentification

**Fichier :** `middleware.ts`  
**Sévérité :** P1  

```typescript
const PUBLIC_PREFIXES = ['/', '/boutique', '/produit', '/categorie', '/quiz', '/teint', '/avis', '/confirmation'];
```

La page `/confirmation` est la page post-commande qui affiche probablement les détails de l'ordre (numéro, montant, adresse de livraison). Elle est **complètement publique** — n'importe qui connaissant le numéro de commande peut accéder aux données personnelles d'un autre client.

**Correction :** Retirer `/confirmation` des `PUBLIC_PREFIXES`. Si la page doit être accessible après paiement sans être loggué (cas mobile money redirect), utiliser un token signé à usage unique dans l'URL :

```typescript
// URL : /confirmation?token=<HMAC-SHA256(orderNumber+userId+secret)>
// Vérification côté serveur du token avant affichage
```

---

### [SEC-06] `/api/config/[key]` — GET public expose les codes promo

**Fichier :** `src/app/api/config/[key]/route.ts`  
**Sévérité :** P1  

```typescript
export async function GET(_req: NextRequest, { params }) {
  // ← Aucune vérification d'authentification
  const supabase = await db();
  const { data } = await supabase.from('site_config').select('value').eq('key', key).single();
  return NextResponse.json({ value: data.value });
}
```

Si la RLS Supabase sur `site_config` autorise `SELECT` pour `anon`, **n'importe qui peut lire les codes promo** en appelant `GET /api/config/promo_codes`. Même si la RLS est restrictive, le pattern est dangereux.

**Correction :**

```typescript
export async function GET(req: NextRequest, { params }) {
  // Limiter aux clés publiques autorisées (whitelist)
  const PUBLIC_CONFIG_KEYS = ['hero', 'top_bar', 'shipping', 'trust_items'];
  const { key } = await params;
  if (!PUBLIC_CONFIG_KEYS.includes(key)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  // ... reste inchangé
}
```

---

### [PERF-01] `Cache-Control: no-store` sur l'endpoint public des produits

**Fichier :** `src/app/api/products/route.ts`  
**Sévérité :** P1  

```typescript
return NextResponse.json(products, {
  headers: { 'Cache-Control': 'no-store' },  // ← 0 cache sur un endpoint public
});
```

Chaque visite de `/boutique` ou `/categorie` déclenche une requête non-cachée vers Supabase. Avec des pics de trafic, cela génère une charge inutile et des temps de réponse variables.

**Correction :**

```typescript
return NextResponse.json(products, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    // ou, si Next.js ISR : utiliser revalidateTag('products') depuis l'admin
  },
});
```

Coupler avec `revalidatePath('/boutique')` + `revalidateTag('products')` déjà en place dans `/api/revalidate`.

---

### [LOG-01] Erreurs webhook Jeko commentées — 0 visibilité production

**Fichier :** `src/app/api/jeko-pay/webhook/route.ts`  
**Sévérité :** P1  

```typescript
// ❌ console.error supprimés/commentés
// if (updateError) console.error(updateError);
```

Si une mise à jour de statut de paiement échoue en base (connexion Supabase perdue, contrainte RLS, etc.), le webhook répond `200 OK` à Jeko sans aucune trace d'erreur. Résultat : Jeko ne retentera pas, la commande reste en état incorrect, et le problème est indétectable en production.

**Correction :**

```typescript
if (updateError) {
  console.error('[webhook:jeko] Échec mise à jour commande', {
    orderNumber: reference,
    error: updateError.message,
    code: updateError.code,
  });
  // Retourner 500 pour que Jeko retente le webhook
  return NextResponse.json({ error: 'db_error' }, { status: 500 });
}
```

---

### [ARCH-01] Double sauvegarde des commandes (localStorage + Supabase)

**Fichier :** `src/app/checkout/page.tsx` (lignes 500–520)  
**Sévérité :** P1  

```typescript
// 1. Sauvegarde locale (localStorage)
const num = saveOrder(orderData);

// 2. Sauvegarde Supabase
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
await saveOrderToDB(orderData, user?.id ?? undefined);
```

**Risques :**
- Si `saveOrderToDB` échoue (réseau, RLS), la commande existe en localStorage mais pas en DB → commande "fantôme"
- Inversement : si la page recharge entre les deux saves, état incohérent
- Duplication de logique métier entre `orders-db.ts` (localStorage) et la DB

**Correction :** Déplacer toute la logique dans une route API serveur :

```typescript
// checkout/page.tsx
const res = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});
const { orderNumber } = await res.json();
if (!res.ok) throw new Error('Echec création commande');
// Plus de localStorage, plus de double save
```

---

### [ARCH-02] Persistance client-side des commandes (`orders-db.ts`)

**Fichier :** `src/lib/orders-db.ts`  
**Sévérité :** P1  

`saveOrder()` utilise `localStorage` comme stockage primaire des commandes avec fallback vers Supabase. Les données de commande (nom, email, adresse, montant) stockées en localStorage sont :
- Accessibles à tout script tiers (XSS → exfiltration)
- Perdues si l'utilisateur vide son navigateur
- Non synchronisables entre appareils

**Correction :** Voir [ARCH-01] — déplacer vers une route API avec Supabase comme seule source de vérité.

---

## 🟡 Findings Mineurs — P2 *(traiter dans le backlog)*

---

### [CQ-01] Validation email insuffisante dans `/api/contact`

**Fichier :** `src/app/api/contact/route.ts`

```typescript
// ❌ Valide uniquement la présence d'un '@'
if (!email.includes('@')) { ... }
```

Permet des valeurs comme `a@`, `@b`, `test@@test.com`.

**Fix :** Utiliser la regex de `newsletter/subscribe` déjà en place :
```typescript
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!EMAIL_RE.test(email)) { ... }
```

---

### [CQ-02] Paramètre `source` non validé avant insert newsletter

**Fichier :** `src/app/api/newsletter/subscribe/route.ts`

```typescript
const source = body.source; // ← aucune validation
await supabase.from('newsletter_subscribers').insert({ email, source });
```

Un appelant peut injecter n'importe quelle valeur (jusqu'à la limite DB). Whitelister les sources valides :

```typescript
const VALID_SOURCES = ['footer', 'popup', 'homepage', 'quiz'];
const source = VALID_SOURCES.includes(body.source) ? body.source : 'unknown';
```

---

### [CQ-03] `dotenv` utilisé en scripts mais absent de `devDependencies`

**Fichier :** `package.json`

```json
"setup:admin": "dotenv -e .env.local npx tsx ..."
```

`dotenv-cli` est utilisé mais non déclaré comme dépendance. Installation fraîche → scripts cassés.

**Fix :** `npm install -D dotenv-cli`

---

### [CQ-04] `checkout/page.tsx` — Client Component de ~700 lignes

**Fichier :** `src/app/checkout/page.tsx`  

Un seul gros Client Component contient toutes les étapes (Cart, Delivery, Payment), le sidebar, et la logique `handlePlaceOrder`. Cela :
- Empêche le code-splitting par étape
- Rend les tests unitaires difficiles
- Augmente le bundle initial

**Recommandation :** Extraire `CartStep`, `DeliveryStep`, `PaymentStep`, `Sidebar` en fichiers séparés avec lazy loading :
```typescript
const DeliveryStep = lazy(() => import('./DeliveryStep'));
```

---

### [CQ-05] Fallback silencieux sur produits statiques

**Fichier :** `src/app/api/products/route.ts`

```typescript
if (error) {
  return NextResponse.json(PRODUCTS); // ← cache statique sans log d'erreur
}
```

Une panne DB est masquée — les clients voient d'anciens produits sans indication, et l'équipe ne sait pas qu'il y a un problème.

**Fix :** Logger l'erreur minimum :
```typescript
if (error) {
  console.error('[api/products] Erreur DB, fallback statique:', error.message);
  return NextResponse.json(PRODUCTS);
}
```

---

### [CQ-06] `void txt` dans `emails.ts` — code smell

**Fichier :** `src/lib/emails.ts`

```typescript
void txt; // Pour éviter l'avertissement lint "txt is declared but its value is never read"
```

Corriger la variable inutilisée plutôt que de la supprimer du lint via `void`.

---

### [CQ-07] Erreurs Resend ignorées silencieusement

**Fichier :** `src/lib/emails.ts`

Les fonctions retournent un `boolean` de succès mais les appelants peuvent l'ignorer. Couplé au fire-and-forget de `orders/notify`, une panne Resend passe totalement inaperçue.

**Fix :** Ajouter au minimum un `console.error` dans `sendTemplate()` sur échec.

---

### [CQ-08] Validation email faible dans `/api/quiz/submit`

**Fichier :** `src/app/api/quiz/submit/route.ts`

```typescript
const user_email = typeof body.email === 'string' && body.email.includes('@') ? body.email.slice(0, 200) : null;
```

Même problème que [CQ-01]. Utiliser la regex standard.

---

### [CQ-09] Aucun audit trail sur les ajustements de points Jeko

**Fichier :** `src/app/api/admin/jeko/adjust/route.ts`

L'admin qui fait un ajustement de points n'est pas enregistré dans la transaction :
```typescript
supabase.from('jeko_transactions').insert({
  user_id: userId,
  points,
  reason: 'manual',
  // ← 'modified_by' manquant — impossible de savoir quel admin a fait l'ajustement
});
```

**Fix :** Ajouter `modified_by: user.id` (l'admin retourné par `requireAdmin()`) dans le record.

---

### [PERF-02] Fire-and-forget email/WhatsApp sans observabilité

**Fichiers :** `src/app/api/orders/notify/route.ts`, `notify-shipped/route.ts`

```typescript
sendOrderConfirmation(order).catch(() => {});  // ← erreur avalée
sendWaOrderConfirmation(order).catch(() => {}); // ← idem
```

Si Resend ou Meta WhatsApp API est en panne, aucun log, aucune alerte, aucun retry. Les clients ne reçoivent jamais leur confirmation.

**Fix minimum :**

```typescript
sendOrderConfirmation(order).catch((err) => {
  console.error('[notify] Échec email confirmation', { order: order.orderNumber, err });
});
```

**Fix complet :** Stocker l'état d'envoi en DB (`notification_sent_at`, `notification_error`) pour permettre un replay manuel depuis l'admin.

---

### [INFO-01] `/api/health` expose la présence de variables d'env sans auth

**Fichier :** `src/app/api/health/route.ts`

```typescript
return NextResponse.json({
  env: {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,  // reconnaissance possible
    redis: !!process.env.UPSTASH_REDIS_REST_URL,
  },
});
```

Risque faible (booléens, pas de valeurs), mais facilite la reconnaissance d'infrastructure. Retirer `env` de la réponse publique ou protéger l'endpoint par un secret header.

---

## ✅ Points Forts — Ce qui fonctionne bien

| Domaine | Implémentation | Fichier |
|---------|---------------|---------|
| Upload sécurisé | Magic bytes validation (JPEG/PNG/GIF/WebP), MIME → extension derivation, path sanitization, 5MB limit | `api/upload/route.ts` |
| Rate limiting | Upstash sliding window sur tous les POST publics, fallback mémoire dev, cache de limiters | `lib/rate-limit.ts` |
| Webhook HMAC | `timingSafeEqual` de `node:crypto`, raw body avant JSON parse, idempotence `.neq('payment_status','paid')` | `lib/jeko-pay/webhook.ts` |
| Admin routes | `requireAdmin()` + `createServiceClient()` systématiques sur tous les endpoints admin | `api/admin/**` |
| Middleware fast-path | Routes publiques servent `NextResponse.next()` sans round-trip Supabase | `middleware.ts` |
| Auth orders/notify | `db()` + `getUser()` server-verified (non `getSession()`) | `api/orders/notify/route.ts` |
| Headers de sécurité | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | `next.config.ts` |
| Newsletter idempotence | Gestion code 23505 (doublon), email normalisé, regex correcte | `newsletter/subscribe/route.ts` |
| Revalidate protégé | Secret header obligatoire avant toute action de cache | `api/revalidate/route.ts` |
| Service client | `server-only` + `persistSession: false` + singleton module-level | `utils/supabase/service.ts` |
| WhatsApp templates | Templates business pré-approuvés (pas de free-form text à risque) | `lib/whatsapp.ts` |
| Admin orders PATCH | `VALID_STATUS: ReadonlySet` validé avant tout update | `api/admin/orders/route.ts` |
| Cron cleanup | `CRON_SECRET` auth obligatoire, soft delete newsletters > 30j | `api/cron/cleanup/route.ts` |
| Quiz data | Rate limit 10/10min, slicing des strings, user_email nullable | `api/quiz/submit/route.ts` |
| Config refacto | `site-config.ts` deprecated proprement avec réexports | `lib/site-config.ts` → `lib/config/` |
| Server.ts | Variables Supabase vérifiées avec `throw` si absentes | `utils/supabase/server.ts` |

---

## 🗺️ Plan d'Action Priorisé

### Sprint 1 — P0 : Sécurité Critique *(~2j effort)*

| ID | Action | Effort | Impact |
|----|--------|--------|--------|
| SEC-05 | Remplacer `getSession()` par `getUser()` dans `middleware.ts` | XS — 5 min | 🔴 Élevé |
| SEC-01 | Supprimer les fallbacks hardcodés, rotate la clé anon Supabase | S — 30 min | 🔴 Élevé |
| SEC-02 | Ajouter CSP en `Report-Only` d'abord, puis enforcer | M — 2h | 🔴 Élevé |

### Sprint 2 — P1 : Architecture & Sécurité Majeure *(~5j effort)*

| ID | Action | Effort | Impact |
|----|--------|--------|--------|
| SEC-06 | Whitelist des clés config publiques dans `/api/config/[key]` | XS — 15 min | 🟠 Élevé |
| SEC-03 | Ajouter `contentDispositionType: 'attachment'` pour SVG | XS — 10 min | 🟠 Moyen |
| SEC-04 | Retirer `/confirmation` des routes publiques ou token signé URL | M — 3h | 🟠 Élevé |
| LOG-01 | Restaurer `console.error` + retourner 500 sur erreur DB dans webhook Jeko | XS — 20 min | 🟠 Élevé |
| PERF-01 | Ajouter `s-maxage=60, stale-while-revalidate=300` sur `/api/products` | XS — 10 min | 🟠 Moyen |
| ARCH-01/02 | Migrer `saveOrder` vers une route API serveur `/api/orders` (POST) | L — 1.5j | 🟠 Élevé |

### Sprint 3 — P2 : Qualité & Observabilité *(backlog)*

| ID | Action | Effort |
|----|--------|--------|
| CQ-01, CQ-08 | Regex email standard dans contact + quiz | XS |
| CQ-02 | Whitelist `source` newsletter | XS |
| CQ-03 | `npm install -D dotenv-cli` | XS |
| CQ-04 | Découpage checkout en composants lazy-loaded | M |
| PERF-02 | Logger les erreurs email/WA (au moins `console.error`) | XS |
| CQ-09 | Ajouter `modified_by` aux ajustements Jeko | XS |
| INFO-01 | Retirer `env` du health endpoint public | XS |

---

## 📋 Annexe — Environnement Technique

| Item | Valeur |
|------|--------|
| Framework | Next.js 16.2.4 (standalone, `--webpack`) |
| React | 19.2.4 |
| `@supabase/ssr` | 0.10.2 |
| Rate limiting | @upstash/ratelimit 2.0.8 + @upstash/redis 1.37.0 |
| Tests E2E | @playwright/test 1.59.1 |
| Paiement | Jeko Africa (Wave, Orange Money, MTN, Moov) |
| WhatsApp | Meta Cloud API v20.0 |
| Email | Resend (HTTP direct, pas de SDK) |
| Image | Sharp 0.34.5, AVIF+WebP, cache 1yr |
| Serveur | Hostinger `82.29.186.206:65002` |
| Supabase | Project ref `spcguwuqqwvjfnfctrzs` |

---

*Audit généré le juillet 2025 — SD Cosmétique*
