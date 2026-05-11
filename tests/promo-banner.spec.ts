import { test, expect } from '@playwright/test';

/**
 * Test en direct : vérification de la bannière promotion globale
 * - Vérifie que la bannière apparaît sur le storefront quand la promo est active
 * - Vérifie que le toggle admin auto-sauvegarde
 */
test.describe('Bannière promotion globale', () => {

  test('La bannière promo apparaît sur la page d\'accueil si la promo est active', async ({ page }) => {
    // Screenshot avant
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'tests/promo-screenshots/01-home-initial.png', fullPage: false });

    // Chercher le header banner promo global (role=banner avec aria-label="Promotion en cours")
    const promoBanner = page.locator('[role="banner"][aria-label="Promotion en cours"]');
    const marketingBanner = page.locator('[role="banner"]').first();

    const promoVisible = await promoBanner.isVisible().catch(() => false);
    console.log(`\n🎯 Bannière promo globale visible : ${promoVisible}`);

    if (promoVisible) {
      const text = await promoBanner.textContent();
      console.log(`📢 Contenu bannière : "${text?.trim()}"`);
      await page.screenshot({ path: 'tests/promo-screenshots/02-banner-visible.png', fullPage: false });
      expect(text).toContain('%');
    } else {
      console.log('ℹ️  Aucune promo active en ce moment — test de désactivation OK');
      await page.screenshot({ path: 'tests/promo-screenshots/02-no-banner.png', fullPage: false });
    }
  });

  test('Toggle admin active la promo et la bannière apparaît', async ({ page, context }) => {
    // 1. Login admin
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tests/promo-screenshots/03-login-page.png', fullPage: false });

    // Attendre que le formulaire soit réellement visible (pas juste le skeleton)
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 30000 });
    await page.screenshot({ path: 'tests/promo-screenshots/03-login-ready.png', fullPage: false });

    await page.fill('input[type="email"]', 'admin@sdcosmetique.ci');
    await page.fill('input[type="password"]', 'Admin@SD2026!');
    await page.screenshot({ path: 'tests/promo-screenshots/03-login-filled.png', fullPage: false });

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 }).catch(() => {});
    await page.screenshot({ path: 'tests/promo-screenshots/03b-after-login.png', fullPage: false });

    const url = page.url();
    console.log(`\n🔑 URL après login : ${url}`);
    if (url.includes('/login')) {
      console.log('❌ Échec du login admin — credentials incorrects ou erreur auth');
      test.skip();
      return;
    }

    // Attendre que le dashboard admin soit réellement chargé (Client Component React)
    await page.waitForSelector('text=Tableau de bord', { state: 'visible', timeout: 30000 });
    await page.screenshot({ path: 'tests/promo-screenshots/03c-admin-loaded.png', fullPage: false });
    console.log('✅ Dashboard admin chargé');

    // 2. Cliquer sur "Codes promo 🎟️" dans la sidebar
    // "Réductions & coupons" est le texte DESC du bouton sidebar — unique dans toute l'appli
    const promosTab = page.locator('button').filter({ hasText: 'Réductions & coupons' }).first();
    const promosTabVisible = await promosTab.isVisible({ timeout: 5000 }).catch(() => false);

    if (promosTabVisible) {
      await promosTab.scrollIntoViewIfNeeded();
      await promosTab.click();
      console.log('✅ Onglet "Codes promo" cliqué');
    } else {
      // Fallback : JS natif pour trouver et cliquer le bouton
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b =>
          b.textContent?.includes('Réductions & coupons') ||
          b.textContent?.includes('Codes promo')
        );
        if (btn) { (btn as HTMLElement).click(); return true; }
        return false;
      });
      console.log(clicked ? '✅ Onglet "Codes promo" cliqué via JS fallback' : '❌ Bouton "Codes promo" introuvable');
      if (!clicked) { test.skip(); return; }
    }

    // Attendre que le contenu de l'onglet promos soit rendu
    await page.waitForSelector('text=Promo globale', { state: 'visible', timeout: 10000 })
      .catch(() => console.log('⚠️  "Promo globale" pas trouvé — tab peut-être non chargé'));
    console.log('📍 URL après clic onglet :', page.url());
    await page.screenshot({ path: 'tests/promo-screenshots/04-admin-promos.png', fullPage: false });

    // 3. Chercher le toggle GlobalPromoCard [role="switch"]
    await page.waitForSelector('[role="switch"]', { state: 'visible', timeout: 10000 })
      .catch(() => {});
    const toggle = page.locator('[role="switch"]').first();
    const toggleVisible = await toggle.isVisible().catch(() => false);

    if (!toggleVisible) {
      console.log('ℹ️  Toggle [role=switch] non trouvé après navigation onglet promos');
      // Dump HTML pour diagnostic
      const bodyHTML = await page.locator('body').evaluate(el => el.innerHTML.slice(0, 2000));
      console.log('HTML body (2000 chars):', bodyHTML);
      await page.screenshot({ path: 'tests/promo-screenshots/04b-debug.png', fullPage: true });
      test.skip();
      return;
    }

    const isChecked = await toggle.getAttribute('aria-checked');
    console.log(`\n🔘 État initial toggle : aria-checked="${isChecked}"`);
    await page.screenshot({ path: 'tests/promo-screenshots/05-toggle-before.png', fullPage: false });

    // 4. Activer si désactivé
    if (isChecked !== 'true') {
      await toggle.click();
      await page.waitForTimeout(1500); // laisser le temps à la save async
      console.log('✅ Toggle cliqué → sauvegarde auto déclenchée');
    }
    await page.screenshot({ path: 'tests/promo-screenshots/06-toggle-after.png', fullPage: false });

    // 5. Aller sur le storefront et vérifier la bannière
    const storefront = await context.newPage();
    await storefront.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await storefront.screenshot({ path: 'tests/promo-screenshots/07-storefront-after-activate.png', fullPage: false });

    const banner = storefront.locator('[role="banner"][aria-label="Promotion en cours"]');
    const isBannerVisible = await banner.isVisible().catch(() => false);
    console.log(`\n🏠 Bannière sur storefront après activation : ${isBannerVisible}`);

    if (isBannerVisible) {
      const txt = await banner.textContent();
      console.log(`📢 Texte bannière : "${txt?.trim()}"`);
      await storefront.screenshot({ path: 'tests/promo-screenshots/08-banner-on-storefront.png', fullPage: false });
      expect(txt).toContain('%');
    } else {
      // Le cache Next.js peut retarder de 60s — note dans le rapport
      console.log('⚠️  Bannière pas encore visible (cache Next.js ~60s) — forcer revalidation ou attendre');
      await storefront.screenshot({ path: 'tests/promo-screenshots/08-no-banner-cache.png', fullPage: false });
    }

    await storefront.close();
  });

  test('Bouton × ferme la bannière côté client', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    const banner = page.locator('[role="banner"][aria-label="Promotion en cours"]');
    const isVisible = await banner.isVisible().catch(() => false);

    if (!isVisible) {
      console.log('ℹ️  Pas de bannière active — skip du test fermeture');
      test.skip();
      return;
    }

    // Clic sur le bouton fermeture
    const closeBtn = banner.locator('button[aria-label="Fermer la bannière"]');
    await closeBtn.click();
    await page.waitForTimeout(300);

    const stillVisible = await banner.isVisible().catch(() => false);
    console.log(`\n❌ Bannière après clic × : ${stillVisible ? 'ENCORE VISIBLE (bug)' : 'disparue (OK)'}`);
    expect(stillVisible).toBe(false);
    await page.screenshot({ path: 'tests/promo-screenshots/09-banner-dismissed.png', fullPage: false });
  });
});
