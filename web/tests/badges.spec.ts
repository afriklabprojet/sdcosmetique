import { test, expect } from '@playwright/test';

test.describe('Product Badges - Storefront & Admin', () => {
  test.setTimeout(60000);

  test('should verify Admin modal has Nouveauté and Bestseller badge checkboxes', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER UNCAUGHT ERROR:', err.stack || err.message));
    page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
    page.on('response', res => {
      if (res.status() >= 400) console.log('RES ERROR:', res.status(), res.url());
    });

    // Mock admin session API response
    await page.route('**/*admin/session*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { id: 1, name: 'Admin SD', email: 'admin@sdcosmetique.ci' },
            admin: { role: 'admin', root: true },
          },
          user: { id: 1, name: 'Admin SD', email: 'admin@sdcosmetique.ci' },
          admin: { role: 'admin', root: true },
        }),
      });
    });

    // Mock admin products API response
    await page.route('**/*admin/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              category_id: 1,
              category_slug: 'face',
              slug: 'creme-visage-eclat',
              title: 'Crème Visage Éclat',
              summary: 'Crème hydratante',
              regular_price: 15000,
              sale_price: null,
              stock: 20,
              recent: true,
              published_at: new Date().toISOString(),
              images: [{ id: 1, url: '/products/creme.jpg' }],
              badges: [{ id: 1, label: 'Bestseller', type: 'bestseller' }],
              skin_tones: ['noir', 'marron'],
              children: [],
              translations: [],
            },
          ],
          meta: { current_page: 1, last_page: 1, total: 1 },
        }),
      });
    });

    // Mock admin categories API response
    await page.route('**/*admin/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, slug: 'face', label: 'Visage', order: 1, active: true },
            { id: 2, slug: 'body', label: 'Corps', order: 2, active: true },
          ],
        }),
      });
    });

    // Mock other admin settings and endpoints
    await page.route('**/*admin/orders*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/reviews*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/testimonials*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/customers*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/metrics*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    });
    await page.route('**/*admin/quiz-*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/newsletter-*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/*admin/settings*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    });

    // Go to /admin
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the admin sidebar to appear
    const aside = page.locator('aside').first();
    await expect(aside).toBeVisible({ timeout: 15000 });

    // Click on "Produits" tab
    const produitsBtn = aside.locator('button:has-text("Produits")').first();
    await expect(produitsBtn).toBeVisible({ timeout: 5000 });
    await produitsBtn.click();

    // Verify Nouveauté pill in products table
    const nouveauPill = page.locator('span:has-text("Nouveauté")').first();
    await expect(nouveauPill).toBeVisible({ timeout: 10000 });

    // Open new product modal
    const newBtn = page.locator('button:has-text("+ Nouveau")').first();
    await expect(newBtn).toBeVisible({ timeout: 5000 });
    await newBtn.click();

    // Verify "Nouveauté" and "Bestseller" checkboxes in the modal
    const nouveauCheckbox = page.locator('label:has-text("Nouveauté") input[type="checkbox"]');
    const bestsellerCheckbox = page.locator('label:has-text("Bestseller") input[type="checkbox"]');

    await expect(nouveauCheckbox).toBeVisible({ timeout: 5000 });
    await expect(bestsellerCheckbox).toBeVisible({ timeout: 5000 });

    // Test checking / unchecking Nouveauté checkbox
    await nouveauCheckbox.check();
    await expect(nouveauCheckbox).toBeChecked();

    await nouveauCheckbox.uncheck();
    await expect(nouveauCheckbox).not.toBeChecked();

    await bestsellerCheckbox.check();
    await expect(bestsellerCheckbox).toBeChecked();
  });
});
