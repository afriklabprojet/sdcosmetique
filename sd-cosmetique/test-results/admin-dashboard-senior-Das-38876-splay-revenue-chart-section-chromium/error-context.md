# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-dashboard-senior.spec.ts >> Dashboard Admin Senior - SD Cosmetique >> 📊 Graphiques et Données >> should display revenue chart section
- Location: tests/admin-dashboard-senior.spec.ts:144:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('.card').filter({ hasText: 'Évolution du Chiffre d\'Affaires' }).locator('.chart-placeholder')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.card').filter({ hasText: 'Évolution du Chiffre d\'Affaires' }).locator('.chart-placeholder')
    9 × locator resolved to <div class="chart-placeholder">…</div>
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
  147 |       await expect(chartCard).toBeVisible();
  148 |       
  149 |       // Vérifier l'en-tête du graphique
  150 |       await expect(chartCard.locator('.card-title')).toContainText('Évolution du Chiffre d\'Affaires');
  151 |       await expect(chartCard.locator('.fa-chart-area')).toBeVisible();
  152 |       
  153 |       // Vérifier le placeholder du graphique
> 154 |       await expect(chartCard.locator('.chart-placeholder')).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  155 |       await expect(chartCard.locator('.chart-placeholder')).toContainText('Graphique interactif des ventes');
  156 |     });
  157 | 
  158 |     test('should display recent orders section', async ({ page }) => {
  159 |       // Vérifier la section des commandes récentes
  160 |       const ordersCard = page.locator('.card').filter({ hasText: 'Commandes Récentes' });
  161 |       await expect(ordersCard).toBeVisible();
  162 |       
  163 |       // Vérifier l'en-tête
  164 |       await expect(ordersCard.locator('.card-title')).toContainText('Commandes Récentes');
  165 |       
  166 |       // Vérifier le bouton "Voir toutes"
  167 |       await expect(ordersCard.locator('a[href="/admin/commandes"]')).toBeVisible();
  168 |       await expect(ordersCard.locator('a[href="/admin/commandes"]')).toContainText('Voir toutes');
  169 |     });
  170 | 
  171 |     test('should list recent orders with correct data', async ({ page }) => {
  172 |       // Vérifier les éléments de liste des commandes
  173 |       const ordersList = page.locator('.list-item');
  174 |       await expect(ordersList).toHaveCount(4);
  175 |       
  176 |       // Vérifier la première commande (Marie Joly)
  177 |       const firstOrder = ordersList.first();
  178 |       await expect(firstOrder.locator('.list-avatar')).toContainText('MJ');
  179 |       await expect(firstOrder.locator('.list-title')).toContainText('Marie Joly');
  180 |       await expect(firstOrder.locator('.list-subtitle')).toContainText('Sérum Anti-âge + Crème Hydratante');
  181 |       await expect(firstOrder.locator('.list-meta')).toContainText('€89.50');
  182 |       await expect(firstOrder.locator('.badge-success')).toContainText('Expédiée');
  183 |     });
  184 |     
  185 |   });
  186 | 
  187 |   test.describe('📱 Responsive Design', () => {
  188 |     
  189 |     test('should adapt to tablet viewport', async ({ page }) => {
  190 |       // Changer la taille de l'écran pour tablet
  191 |       await page.setViewportSize({ width: 768, height: 1024 });
  192 |       
  193 |       // Vérifier que le contenu reste accessible
  194 |       await expect(page.locator('.content-area')).toBeVisible();
  195 |       await expect(page.locator('.stats-grid')).toBeVisible();
  196 |     });
  197 | 
  198 |     test('should adapt to mobile viewport', async ({ page }) => {
  199 |       // Changer la taille de l'écran pour mobile
  200 |       await page.setViewportSize({ width: 375, height: 667 });
  201 |       
  202 |       // Vérifier l'adaptation mobile
  203 |       await expect(page.locator('.admin-layout')).toBeVisible();
  204 |       await expect(page.locator('.content-area')).toBeVisible();
  205 |     });
  206 |     
  207 |   });
  208 | 
  209 |   test.describe('⚡ Performance et Optimisation', () => {
  210 |     
  211 |     test('should load quickly', async ({ page }) => {
  212 |       const startTime = Date.now();
  213 |       
  214 |       await page.goto('http://localhost:3000/admin-dashboard-senior.html');
  215 |       await page.waitForLoadState('networkidle');
  216 |       
  217 |       const loadTime = Date.now() - startTime;
  218 |       
  219 |       // Le dashboard devrait se charger en moins de 3 secondes
  220 |       expect(loadTime).toBeLessThan(3000);
  221 |     });
  222 |     
  223 |   });
  224 | 
  225 | });
```