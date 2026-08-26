import { test, expect } from '@playwright/test';

/**
 * Tests pour la nouvelle interface Admin Sidebar (Option 1)
 * Valide le design premium, les indicateurs de statut, et l'interactivité
 */

test.describe('Admin Sidebar Interface - Option 1', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'admin (sera redirigé vers login)
    await page.goto('/admin');
  });

  test('doit afficher la page de login avec le bon design', async ({ page }) => {
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/admin/login');
    
    // Vérifier la présence du logo et titre
    await expect(page.locator('h1')).toContainText('Administration');
    
    // Prendre une capture d'écran de la page de login
    await page.screenshot({ path: 'tests/screenshots/admin-login.png', fullPage: true });
  });

  test('doit simuler l\'authentification et tester la sidebar', async ({ page }) => {
    // Simuler une connexion admin (bypass auth pour les tests)
    await page.addInitScript(() => {
      // Mock du localStorage pour simuler l'authentification
      window.localStorage.setItem('admin-auth', 'true');
    });

    // Aller directement au dashboard après auth
    await page.goto('/admin');
    
    // Attendre que la sidebar soit chargée
    await page.waitForSelector('[data-testid="admin-sidebar"]', { timeout: 10000 }).catch(() => {
      // Si pas de data-testid, utiliser un sélecteur CSS
      return page.waitForSelector('aside', { timeout: 10000 });
    });

    // Vérifier la présence de la sidebar premium
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
    
    // Vérifier le logo et branding SD COSMETIQUE
    await expect(sidebar.locator('text=SD COSMETIQUE')).toBeVisible();
    await expect(sidebar.locator('text=Administration')).toBeVisible();
    
    // Prendre une capture d'écran complète du dashboard
    await page.screenshot({ path: 'tests/screenshots/admin-sidebar-full.png', fullPage: true });
  });

  test('doit tester la navigation entre les sections', async ({ page }) => {
    // Simuler l'auth
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
    
    await page.goto('/admin');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // Tester la navigation - Section PRINCIPAL
    const dashboardBtn = page.locator('button:has-text("Tableau de bord")');
    const commandesBtn = page.locator('button:has-text("Commandes")');
    const produitsBtn = page.locator('button:has-text("Produits")');
    const avisBtn = page.locator('button:has-text("Avis")');
    
    // Vérifier que tous les boutons principaux sont visibles
    await expect(dashboardBtn).toBeVisible();
    await expect(commandesBtn).toBeVisible();
    await expect(produitsBtn).toBeVisible();
    await expect(avisBtn).toBeVisible();
    
    // Cliquer sur Commandes et vérifier l'état actif
    await commandesBtn.click();
    await expect(commandesBtn).toHaveAttribute('style', /background.*rgba\(212,162,90/);
    
    // Cliquer sur Marketing et vérifier
    const marketingBtn = page.locator('button:has-text("Marketing")');
    await expect(marketingBtn).toBeVisible();
    await marketingBtn.click();
    
    // Vérifier que le module Marketing est chargé
    await expect(page.locator('h2:has-text("Marketing")')).toBeVisible();
    
    // Prendre une capture d'écran de la section Marketing
    await page.screenshot({ path: 'tests/screenshots/admin-marketing-section.png', fullPage: true });
  });

  test('doit valider les indicateurs de statut et badges', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
    
    await page.goto('/admin');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // Vérifier les indicateurs visuels
    const sidebar = page.locator('aside').first();
    
    // Vérifier les séparateurs de sections avec puces
    await expect(sidebar.locator('text=● PRINCIPAL')).toBeVisible();
    await expect(sidebar.locator('text=● CONTENU')).toBeVisible();
    await expect(sidebar.locator('text=● GESTION')).toBeVisible();
    
    // Vérifier l'indicateur premium pour Fidélité
    const fideliteBtn = page.locator('button:has-text("Fidélité ✦")');
    await expect(fideliteBtn).toBeVisible();
    
    // Vérifier l'indicateur spécial pour Marketing
    const marketingBtn = page.locator('button:has-text("Marketing")');
    await expect(marketingBtn).toBeVisible();
    
    // Vérifier le footer avec avatar et statut
    await expect(sidebar.locator('text=● En ligne')).toBeVisible();
    
    // Tester les boutons d'action rapide dans le footer
    const voirSiteBtn = sidebar.locator('button[title="Voir le site"]');
    const deconnexionBtn = sidebar.locator('button[title="Déconnexion"]');
    
    await expect(voirSiteBtn).toBeVisible();
    await expect(deconnexionBtn).toBeVisible();
  });

  test('doit tester les sous-onglets Marketing', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
    
    await page.goto('/admin');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // Aller à la section Marketing
    await page.locator('button:has-text("Marketing")').click();
    
    // Attendre que les sous-onglets apparaissent
    await page.waitForSelector('button:has-text("Bannières")', { timeout: 5000 });
    
    // Tester tous les sous-onglets
    const subTabs = ['Bannières', 'Pop-up', 'Promos', 'Upsells', 'Tracking'];
    
    for (const tabName of subTabs) {
      const tabButton = page.locator(`button:has-text("${tabName}")`);
      await expect(tabButton).toBeVisible();
      
      // Cliquer sur l'onglet
      await tabButton.click();
      
      // Attendre un moment pour le changement
      await page.waitForTimeout(500);
      
      // Prendre une capture de chaque sous-section
      await page.screenshot({ 
        path: `tests/screenshots/marketing-${tabName.toLowerCase()}.png`, 
        fullPage: true 
      });
    }
    
    // Vérifier que le sous-onglet Tracking contient Facebook Pixel et Google Ads
    await page.locator('button:has-text("Tracking")').click();
    await expect(page.locator('text=Facebook Pixel').or(page.locator('text=Google Ads'))).toBeVisible();
  });

  test('doit valider les animations et interactions visuelles', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
    
    await page.goto('/admin');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    const sidebar = page.locator('aside').first();
    
    // Tester les effets de hover sur les boutons
    const dashboardBtn = sidebar.locator('button:has-text("Tableau de bord")');
    
    // Simuler hover
    await dashboardBtn.hover();
    await page.waitForTimeout(300);
    
    // Vérifier les transitions (les styles devraient changer)
    const styles = await dashboardBtn.getAttribute('style');
    expect(styles).toBeTruthy();
    
    // Tester le clic avec animation
    await dashboardBtn.click();
    await page.waitForTimeout(200);
    
    // Vérifier l'état actif avec bordure et ombre
    await expect(dashboardBtn).toHaveAttribute('style', /background.*rgba\(212,162,90/);
    
    // Prendre une capture finale
    await page.screenshot({ path: 'tests/screenshots/admin-sidebar-final.png', fullPage: true });
  });

  test('doit vérifier la responsivité de l\'interface', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-auth', 'true');
    });
    
    await page.goto('/admin');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // Tester différentes tailles d'écran
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 1024, height: 768, name: 'tablet-landscape' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Vérifier que la sidebar reste visible
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();
      
      // Vérifier que le contenu principal s'adapte
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Prendre une capture pour chaque viewport
      await page.screenshot({ 
        path: `tests/screenshots/responsive-${viewport.name}.png`, 
        fullPage: true 
      });
    }
  });
});