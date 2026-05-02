# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-dashboard-senior.spec.ts >> Dashboard Admin Senior - SD Cosmetique >> 🎯 Structure et Design System >> should display proper layout structure
- Location: tests/admin-dashboard-senior.spec.ts:42:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('.main-content')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.main-content')
    9 × locator resolved to <main class="main-content">…</main>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]: 🎯Dashboard Admin Senior - Production Ready
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "SC SD Cosmetique Admin Console" [ref=e6] [cursor=pointer]:
        - /url: /admin
        - generic [ref=e7]: SC
        - generic [ref=e8]:
          - generic [ref=e9]: SD Cosmetique
          - generic [ref=e10]: Admin Console
      - navigation [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Principal
          - link " Dashboard" [ref=e14] [cursor=pointer]:
            - /url: /admin
            - generic [ref=e15]: 
            - generic [ref=e16]: Dashboard
          - link " Produits 24" [ref=e17] [cursor=pointer]:
            - /url: /admin/produits
            - generic [ref=e18]: 
            - generic [ref=e19]: Produits
            - generic [ref=e20]: "24"
          - link " Commandes 12" [ref=e21] [cursor=pointer]:
            - /url: /admin/commandes
            - generic [ref=e22]: 
            - generic [ref=e23]: Commandes
            - generic [ref=e24]: "12"
          - link " Clients" [ref=e25] [cursor=pointer]:
            - /url: /admin/clients
            - generic [ref=e26]: 
            - generic [ref=e27]: Clients
        - generic [ref=e28]:
          - generic [ref=e29]: Gestion
          - link " Inventaire 3" [ref=e30] [cursor=pointer]:
            - /url: /admin/inventaire
            - generic [ref=e31]: 
            - generic [ref=e32]: Inventaire
            - generic [ref=e33]: "3"
          - link " Programme Fidélité" [ref=e34] [cursor=pointer]:
            - /url: /admin/fidelite
            - generic [ref=e35]: 
            - generic [ref=e36]: Programme Fidélité
          - link "Marketing 5" [ref=e37] [cursor=pointer]:
            - /url: /admin/marketing
            - generic [ref=e38]: Marketing
            - generic [ref=e39]: "5"
          - link " Newsletter" [ref=e40] [cursor=pointer]:
            - /url: /admin/newsletter
            - generic [ref=e41]: 
            - generic [ref=e42]: Newsletter
        - generic [ref=e43]:
          - generic [ref=e44]: Configuration
          - link " Paramètres" [ref=e45] [cursor=pointer]:
            - /url: /admin/parametres
            - generic [ref=e46]: 
            - generic [ref=e47]: Paramètres
          - link " Utilisateurs" [ref=e48] [cursor=pointer]:
            - /url: /admin/utilisateurs
            - generic [ref=e49]: 
            - generic [ref=e50]: Utilisateurs
          - link " Rapports" [ref=e51] [cursor=pointer]:
            - /url: /admin/rapports
            - generic [ref=e52]: 
            - generic [ref=e53]: Rapports
      - generic [ref=e55]:
        - generic [ref=e56]: AD
        - generic [ref=e57]:
          - generic [ref=e58]: Administrateur
          - generic [ref=e59]: En ligne
    - main:
      - generic [ref=e60]:
        - navigation [ref=e61]:
          - generic [ref=e62]: Admin
          - generic [ref=e63]: /
          - generic [ref=e64]: Dashboard
        - generic [ref=e65]:
          - button " Actualiser" [ref=e66] [cursor=pointer]:
            - generic [ref=e67]: 
            - text: Actualiser
          - button " Exporter" [ref=e68] [cursor=pointer]:
            - generic [ref=e69]: 
            - text: Exporter
      - generic [ref=e70]:
        - generic:
          - generic [ref=e72]: 
          - generic [ref=e73]:
            - heading "Dashboard Principal" [level=1] [ref=e74]
            - paragraph [ref=e75]: Vue d'ensemble complète de votre boutique de cosmétiques. Suivez les performances, gérez les opérations et optimisez vos ventes.
            - generic [ref=e76]:
              - generic [ref=e77]:
                - generic [ref=e78]: 
                - generic [ref=e79]: "Dernière MAJ : il y a 2 min"
              - generic [ref=e80]:
                - generic [ref=e81]: 
                - generic [ref=e82]: "Période : Mai 2026"
              - generic [ref=e83]:
                - generic [ref=e84]: 
                - generic [ref=e85]: "Tendance : +15.3%"
        - generic:
          - article [ref=e86]:
            - generic [ref=e89]: 
            - generic [ref=e90]: €47,580
            - generic [ref=e91]: Chiffre d'Affaires
            - generic [ref=e92]:
              - generic [ref=e93]: 
              - generic [ref=e94]: +15.3% vs mois dernier
          - article [ref=e95]:
            - generic [ref=e98]: 
            - generic [ref=e99]: 1,247
            - generic [ref=e100]: Commandes Totales
            - generic [ref=e101]:
              - generic [ref=e102]: 
              - generic [ref=e103]: +8.2% vs mois dernier
          - article [ref=e104]:
            - generic [ref=e107]: 
            - generic [ref=e108]: "847"
            - generic [ref=e109]: Produits Actifs
            - generic [ref=e110]:
              - generic [ref=e111]: 
              - generic [ref=e112]: 3 en rupture de stock
          - article [ref=e113]:
            - generic [ref=e116]: 
            - generic [ref=e117]: 3,891
            - generic [ref=e118]: Clients Actifs
            - generic [ref=e119]:
              - generic [ref=e120]: 
              - generic [ref=e121]: +12.7% vs mois dernier
        - generic:
          - generic [ref=e122]:
            - generic [ref=e123]:
              - heading " Évolution du Chiffre d'Affaires" [level=2] [ref=e124]:
                - generic [ref=e125]: 
                - text: Évolution du Chiffre d'Affaires
              - generic [ref=e126]:
                - button "" [ref=e127] [cursor=pointer]:
                  - generic [ref=e128]: 
                - button "" [ref=e129] [cursor=pointer]:
                  - generic [ref=e130]: 
            - generic [ref=e131]:
              - generic:
                - generic [ref=e132]: 
                - generic [ref=e133]: Graphique interactif des ventes
                - generic [ref=e134]: Intégration Chart.js / D3.js
          - generic [ref=e135]:
            - generic [ref=e136]:
              - heading " Commandes Récentes" [level=2] [ref=e137]:
                - generic [ref=e138]: 
                - text: Commandes Récentes
              - link "Voir toutes " [ref=e140] [cursor=pointer]:
                - /url: /admin/commandes
                - text: Voir toutes
                - generic [ref=e141]: 
            - generic:
              - generic [ref=e142]:
                - generic [ref=e143]: MJ
                - generic:
                  - generic: Marie Joly
                  - generic: Sérum Anti-âge + Crème Hydratante
                - generic [ref=e144]:
                  - generic [ref=e145]: €89.50
                  - generic [ref=e147]: Expédiée
              - generic [ref=e148]:
                - generic [ref=e149]: PD
                - generic:
                  - generic: Pierre Dubois
                  - generic: Kit Découverte Visage
                - generic [ref=e150]:
                  - generic [ref=e151]: €45.00
                  - generic [ref=e153]: Préparation
              - generic [ref=e154]:
                - generic [ref=e155]: SL
                - generic:
                  - generic: Sophie Lambert
                  - generic: Mascara Volume + Rouge à lèvres
                - generic [ref=e156]:
                  - generic [ref=e157]: €67.80
                  - generic [ref=e159]: Confirmée
              - generic [ref=e160]:
                - generic [ref=e161]: AL
                - generic:
                  - generic: Alice Moreau
                  - generic: Routine Complète Peaux Sensibles
                - generic [ref=e162]:
                  - generic [ref=e163]: €124.90
                  - generic [ref=e165]: Livrée
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import path from 'path';
  3   | 
  4   | /**
  5   |  * Tests E2E pour Dashboard Admin Senior - SD Cosmetique
  6   |  * 
  7   |  * Validation complète du dashboard professionnel avec:
  8   |  * - Design System intégré 
  9   |  * - Accessibilité WCAG 2.1 AA
  10  |  * - Performance optimisée
  11  |  * - UX/UI senior
  12  |  */
  13  | 
  14  | test.describe('Dashboard Admin Senior - SD Cosmetique', () => {
  15  |   
  16  |   test.beforeEach(async ({ page }) => {
  17  |     // Navigation vers le dashboard senior (fichier local)
  18  |     const filePath = path.join(__dirname, '../public/admin-dashboard-senior.html');
  19  |     const fileUrl = `file://${filePath}`;
  20  |     await page.goto(fileUrl);
  21  |     
  22  |     // Attendre que la page soit complètement chargée
  23  |     await page.waitForLoadState('domcontentloaded');
  24  |   });
  25  | 
  26  |   test.describe('🎯 Structure et Design System', () => {
  27  |     
  28  |     test('should load dashboard with proper branding', async ({ page }) => {
  29  |       // Vérifier le titre de la page
  30  |       await expect(page).toHaveTitle(/SD Cosmetique Admin - Dashboard Professionnel/);
  31  |       
  32  |       // Vérifier le badge de démonstration
  33  |       await expect(page.locator('.demo-badge')).toBeVisible();
  34  |       await expect(page.locator('.demo-badge')).toContainText('Dashboard Admin Senior - Production Ready');
  35  |       
  36  |       // Vérifier le logo et branding
  37  |       await expect(page.locator('.brand-logo')).toBeVisible();
  38  |       await expect(page.locator('.brand-name')).toContainText('SD Cosmetique');
  39  |       await expect(page.locator('.brand-subtitle')).toContainText('Admin Console');
  40  |     });
  41  | 
  42  |     test('should display proper layout structure', async ({ page }) => {
  43  |       // Vérifier la structure principale
  44  |       await expect(page.locator('.admin-layout')).toBeVisible();
  45  |       await expect(page.locator('.sidebar')).toBeVisible();
> 46  |       await expect(page.locator('.main-content')).toBeVisible();
      |                                                   ^ Error: expect(locator).toBeVisible() failed
  47  |       
  48  |       // Vérifier la topbar
  49  |       await expect(page.locator('.topbar')).toBeVisible();
  50  |       await expect(page.locator('.breadcrumbs')).toBeVisible();
  51  |       await expect(page.locator('.topbar-actions')).toBeVisible();
  52  |       
  53  |       // Vérifier la zone de contenu
  54  |       await expect(page.locator('.content-area')).toBeVisible();
  55  |     });
  56  | 
  57  |     test('should apply correct CSS custom properties', async ({ page }) => {
  58  |       // Vérifier que les variables CSS sont appliquées
  59  |       const sidebar = page.locator('.sidebar');
  60  |       const goldPrimary = await sidebar.evaluate((el) => {
  61  |         return getComputedStyle(document.documentElement).getPropertyValue('--gold-primary').trim();
  62  |       });
  63  |       
  64  |       expect(goldPrimary).toBe('#D4A25A');
  65  |     });
  66  |     
  67  |   });
  68  | 
  69  |   test.describe('📊 Navigation et Sidebar', () => {
  70  |     
  71  |     test('should display navigation sections correctly', async ({ page }) => {
  72  |       // Vérifier les sections de navigation
  73  |       const navSections = page.locator('.nav-section');
  74  |       await expect(navSections).toHaveCount(3);
  75  |       
  76  |       // Vérifier les titres des sections
  77  |       await expect(page.locator('.nav-section-title').nth(0)).toContainText('Principal');
  78  |       await expect(page.locator('.nav-section-title').nth(1)).toContainText('Gestion');
  79  |       await expect(page.locator('.nav-section-title').nth(2)).toContainText('Configuration');
  80  |     });
  81  | 
  82  |     test('should have active dashboard navigation', async ({ page }) => {
  83  |       // Vérifier que Dashboard est actif
  84  |       const dashboardNav = page.locator('.nav-item.active');
  85  |       await expect(dashboardNav).toBeVisible();
  86  |       await expect(dashboardNav.locator('.nav-label')).toContainText('Dashboard');
  87  |       
  88  |       // Vérifier l'icône Dashboard
  89  |       await expect(dashboardNav.locator('.nav-icon')).toHaveClass(/fa-tachometer-alt/);
  90  |     });
  91  | 
  92  |     test('should display navigation badges correctly', async ({ page }) => {
  93  |       // Vérifier les badges sur les éléments de navigation
  94  |       const produitsNav = page.locator('.nav-item').filter({ hasText: 'Produits' });
  95  |       await expect(produitsNav.locator('.nav-badge')).toContainText('24');
  96  |       await expect(produitsNav.locator('.nav-badge')).toHaveClass(/warning/);
  97  |       
  98  |       const commandesNav = page.locator('.nav-item').filter({ hasText: 'Commandes' });
  99  |       await expect(commandesNav.locator('.nav-badge')).toContainText('12');
  100 |       await expect(commandesNav.locator('.nav-badge')).toHaveClass(/success/);
  101 |     });
  102 |     
  103 |   });
  104 | 
  105 |   test.describe('📈 Statistiques et KPI', () => {
  106 |     
  107 |     test('should display all stat cards', async ({ page }) => {
  108 |       // Vérifier que toutes les cartes de statistiques sont présentes
  109 |       const statCards = page.locator('.stat-card');
  110 |       await expect(statCards).toHaveCount(4);
  111 |     });
  112 | 
  113 |     test('should show revenue statistics correctly', async ({ page }) => {
  114 |       // Vérifier la carte de chiffre d'affaires
  115 |       const revenueCard = page.locator('.stat-card.success');
  116 |       await expect(revenueCard.locator('.stat-value')).toContainText('€47,580');
  117 |       await expect(revenueCard.locator('.stat-label')).toContainText('Chiffre d\'Affaires');
  118 |       await expect(revenueCard.locator('.stat-trend')).toContainText('+15.3% vs mois dernier');
  119 |       
  120 |       // Vérifier l'icône Euro
  121 |       await expect(revenueCard.locator('.stat-icon .fa-euro-sign')).toBeVisible();
  122 |     });
  123 | 
  124 |     test('should show orders statistics correctly', async ({ page }) => {
  125 |       // Vérifier la carte des commandes
  126 |       const ordersCard = page.locator('.stat-card.info');
  127 |       await expect(ordersCard.locator('.stat-value')).toContainText('1,247');
  128 |       await expect(ordersCard.locator('.stat-label')).toContainText('Commandes Totales');
  129 |       await expect(ordersCard.locator('.stat-trend')).toContainText('+8.2% vs mois dernier');
  130 |     });
  131 | 
  132 |     test('should show products statistics with warning', async ({ page }) => {
  133 |       // Vérifier la carte des produits
  134 |       const productsCard = page.locator('.stat-card.warning');
  135 |       await expect(productsCard.locator('.stat-value')).toContainText('847');
  136 |       await expect(productsCard.locator('.stat-label')).toContainText('Produits Actifs');
  137 |       await expect(productsCard.locator('.stat-trend')).toContainText('3 en rupture de stock');
  138 |     });
  139 |     
  140 |   });
  141 | 
  142 |   test.describe('📊 Graphiques et Données', () => {
  143 |     
  144 |     test('should display revenue chart section', async ({ page }) => {
  145 |       // Vérifier la section graphique principal
  146 |       const chartCard = page.locator('.card').filter({ hasText: 'Évolution du Chiffre d\'Affaires' });
```