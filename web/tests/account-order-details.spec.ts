import { expect, test, type Page } from '@playwright/test';

const orderReference = 'CMD-2026-000005';

async function mockCustomerAccount(page: Page) {
  await page.route(/^https:\/\/api\.sdcosmetique\.ci\/v1\/.*/, async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname === '/v1/session') {
      await route.fulfill({ json: { user: { id: 42, name: 'Awa Kouassi', email: 'awa@example.com', email_verified_at: null, created_at: '2026-02-01T08:00:00Z' } } });
      return;
    }

    if (pathname === '/v1/account') {
      await route.fulfill({ json: { data: { name: 'Awa Kouassi', email: 'awa@example.com', phone: '0701020304', email_verified_at: null, has_password: true } } });
      return;
    }

    if (pathname === '/v1/account/orders') {
      await route.fulfill({ json: { data: [{
        id: 5,
        reference: orderReference,
        status: 'paid',
        email: 'awa@example.com',
        gateway: 'jeko',
        currency: 'XOF',
        subtotal: 25000,
        total: 27500,
        destination: {
          first_name: 'Awa', last_name: 'Kouassi', line_1: 'Cocody Angré 8e tranche',
          city: 'Abidjan', country: 'CI', phone: '0701020304',
        },
        delivery_method: { id: 1, slug: 'abidjan', name: 'Livraison Abidjan', amount: 2500 },
        items: [{ title: 'Sérum éclat vitamine C', label: null, quantity: 2, unit_price: 12500, total: 25000 }],
        placed_at: '2026-03-10T10:30:00Z',
        paid_at: '2026-03-10T10:35:00Z',
        cancelled_at: null,
        refunded_at: null,
      }] } });
      return;
    }

    await route.fulfill({ status: 404, json: { message: 'Not mocked' } });
  });
}

test('a customer can inspect a paid Jeko order from both account views', async ({ page }) => {
  await mockCustomerAccount(page);
  await page.goto('/compte');

  const detailButton = page.getByRole('button', { name: `Détails de la commande ${orderReference}` });
  await expect(detailButton).toBeVisible();
  await detailButton.click();

  const dialog = page.getByRole('dialog', { name: orderReference });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Confirmée', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Payé', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Jeko', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Sérum éclat vitamine C')).toBeVisible();
  await expect(dialog.getByText('Cocody Angré 8e tranche')).toBeVisible();
  await expect(dialog.getByText('27 500 F CFA')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Mes commandes' }).click();
  await detailButton.click();
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Fermer le détail de la commande' }).click();
  await expect(dialog).toBeHidden();
});