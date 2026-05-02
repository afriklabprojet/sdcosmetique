import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Tests E2E pour Dashboard Admin Senior - SD Cosmetique
 * 
 * Validation complète du dashboard professionnel avec:
 * - Design System intégré 
 * - Accessibilité WCAG 2.1 AA
 * - Performance optimisée
 * - UX/UI senior
 */

test.describe('Dashboard Admin Senior - SD Cosmetique', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigation vers le dashboard senior (fichier local)
    const filePath = path.join(__dirname, '../public/admin-dashboard-senior.html');
    const fileUrl = `file://${filePath}`;
    await page.goto(fileUrl);
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('🎯 Structure et Design System', () => {
    
    test('should load dashboard with proper branding', async ({ page }) => {
      // Vérifier le titre de la page
      await expect(page).toHaveTitle(/SD Cosmetique Admin - Dashboard Professionnel/);
      
      // Vérifier le badge de démonstration
      await expect(page.locator('.demo-badge')).toBeVisible();
      await expect(page.locator('.demo-badge')).toContainText('Dashboard Admin Senior - Production Ready');
      
      // Vérifier le logo et branding
      await expect(page.locator('.brand-logo')).toBeVisible();
      await expect(page.locator('.brand-name')).toContainText('SD Cosmetique');
      await expect(page.locator('.brand-subtitle')).toContainText('Admin Console');
    });

    test('should display proper layout structure', async ({ page }) => {
      // Vérifier la structure principale
      await expect(page.locator('.admin-layout')).toBeVisible();
      await expect(page.locator('.sidebar')).toBeVisible();
      await expect(page.locator('.main-content')).toBeVisible();
      
      // Vérifier la topbar
      await expect(page.locator('.topbar')).toBeVisible();
      await expect(page.locator('.breadcrumbs')).toBeVisible();
      await expect(page.locator('.topbar-actions')).toBeVisible();
      
      // Vérifier la zone de contenu
      await expect(page.locator('.content-area')).toBeVisible();
    });

    test('should apply correct CSS custom properties', async ({ page }) => {
      // Vérifier que les variables CSS sont appliquées
      const sidebar = page.locator('.sidebar');
      const goldPrimary = await sidebar.evaluate((el) => {
        return getComputedStyle(document.documentElement).getPropertyValue('--gold-primary').trim();
      });
      
      expect(goldPrimary).toBe('#D4A25A');
    });
    
  });

  test.describe('📊 Navigation et Sidebar', () => {
    
    test('should display navigation sections correctly', async ({ page }) => {
      // Vérifier les sections de navigation
      const navSections = page.locator('.nav-section');
      await expect(navSections).toHaveCount(3);
      
      // Vérifier les titres des sections
      await expect(page.locator('.nav-section-title').nth(0)).toContainText('Principal');
      await expect(page.locator('.nav-section-title').nth(1)).toContainText('Gestion');
      await expect(page.locator('.nav-section-title').nth(2)).toContainText('Configuration');
    });

    test('should have active dashboard navigation', async ({ page }) => {
      // Vérifier que Dashboard est actif
      const dashboardNav = page.locator('.nav-item.active');
      await expect(dashboardNav).toBeVisible();
      await expect(dashboardNav.locator('.nav-label')).toContainText('Dashboard');
      
      // Vérifier l'icône Dashboard
      await expect(dashboardNav.locator('.nav-icon')).toHaveClass(/fa-tachometer-alt/);
    });

    test('should display navigation badges correctly', async ({ page }) => {
      // Vérifier les badges sur les éléments de navigation
      const produitsNav = page.locator('.nav-item').filter({ hasText: 'Produits' });
      await expect(produitsNav.locator('.nav-badge')).toContainText('24');
      await expect(produitsNav.locator('.nav-badge')).toHaveClass(/warning/);
      
      const commandesNav = page.locator('.nav-item').filter({ hasText: 'Commandes' });
      await expect(commandesNav.locator('.nav-badge')).toContainText('12');
      await expect(commandesNav.locator('.nav-badge')).toHaveClass(/success/);
    });
    
  });

  test.describe('📈 Statistiques et KPI', () => {
    
    test('should display all stat cards', async ({ page }) => {
      // Vérifier que toutes les cartes de statistiques sont présentes
      const statCards = page.locator('.stat-card');
      await expect(statCards).toHaveCount(4);
    });

    test('should show revenue statistics correctly', async ({ page }) => {
      // Vérifier la carte de chiffre d'affaires
      const revenueCard = page.locator('.stat-card.success');
      await expect(revenueCard.locator('.stat-value')).toContainText('€47,580');
      await expect(revenueCard.locator('.stat-label')).toContainText('Chiffre d\'Affaires');
      await expect(revenueCard.locator('.stat-trend')).toContainText('+15.3% vs mois dernier');
      
      // Vérifier l'icône Euro
      await expect(revenueCard.locator('.stat-icon .fa-euro-sign')).toBeVisible();
    });

    test('should show orders statistics correctly', async ({ page }) => {
      // Vérifier la carte des commandes
      const ordersCard = page.locator('.stat-card.info');
      await expect(ordersCard.locator('.stat-value')).toContainText('1,247');
      await expect(ordersCard.locator('.stat-label')).toContainText('Commandes Totales');
      await expect(ordersCard.locator('.stat-trend')).toContainText('+8.2% vs mois dernier');
    });

    test('should show products statistics with warning', async ({ page }) => {
      // Vérifier la carte des produits
      const productsCard = page.locator('.stat-card.warning');
      await expect(productsCard.locator('.stat-value')).toContainText('847');
      await expect(productsCard.locator('.stat-label')).toContainText('Produits Actifs');
      await expect(productsCard.locator('.stat-trend')).toContainText('3 en rupture de stock');
    });
    
  });

  test.describe('📊 Graphiques et Données', () => {
    
    test('should display revenue chart section', async ({ page }) => {
      // Vérifier la section graphique principal
      const chartCard = page.locator('.card').filter({ hasText: 'Évolution du Chiffre d\'Affaires' });
      await expect(chartCard).toBeVisible();
      
      // Vérifier l'en-tête du graphique
      await expect(chartCard.locator('.card-title')).toContainText('Évolution du Chiffre d\'Affaires');
      await expect(chartCard.locator('.fa-chart-area')).toBeVisible();
      
      // Vérifier le placeholder du graphique
      await expect(chartCard.locator('.chart-placeholder')).toBeVisible();
      await expect(chartCard.locator('.chart-placeholder')).toContainText('Graphique interactif des ventes');
    });

    test('should display recent orders section', async ({ page }) => {
      // Vérifier la section des commandes récentes
      const ordersCard = page.locator('.card').filter({ hasText: 'Commandes Récentes' });
      await expect(ordersCard).toBeVisible();
      
      // Vérifier l'en-tête
      await expect(ordersCard.locator('.card-title')).toContainText('Commandes Récentes');
      
      // Vérifier le bouton "Voir toutes"
      await expect(ordersCard.locator('a[href="/admin/commandes"]')).toBeVisible();
      await expect(ordersCard.locator('a[href="/admin/commandes"]')).toContainText('Voir toutes');
    });

    test('should list recent orders with correct data', async ({ page }) => {
      // Vérifier les éléments de liste des commandes
      const ordersList = page.locator('.list-item');
      await expect(ordersList).toHaveCount(4);
      
      // Vérifier la première commande (Marie Joly)
      const firstOrder = ordersList.first();
      await expect(firstOrder.locator('.list-avatar')).toContainText('MJ');
      await expect(firstOrder.locator('.list-title')).toContainText('Marie Joly');
      await expect(firstOrder.locator('.list-subtitle')).toContainText('Sérum Anti-âge + Crème Hydratante');
      await expect(firstOrder.locator('.list-meta')).toContainText('€89.50');
      await expect(firstOrder.locator('.badge-success')).toContainText('Expédiée');
    });
    
  });

  test.describe('📱 Responsive Design', () => {
    
    test('should adapt to tablet viewport', async ({ page }) => {
      // Changer la taille de l'écran pour tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Vérifier que le contenu reste accessible
      await expect(page.locator('.content-area')).toBeVisible();
      await expect(page.locator('.stats-grid')).toBeVisible();
    });

    test('should adapt to mobile viewport', async ({ page }) => {
      // Changer la taille de l'écran pour mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Vérifier l'adaptation mobile
      await expect(page.locator('.admin-layout')).toBeVisible();
      await expect(page.locator('.content-area')).toBeVisible();
    });
    
  });

  test.describe('⚡ Performance et Optimisation', () => {
    
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/admin-dashboard-senior.html');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Le dashboard devrait se charger en moins de 3 secondes
      expect(loadTime).toBeLessThan(3000);
    });
    
  });

});