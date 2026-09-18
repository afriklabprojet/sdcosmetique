import { expect, test, type Page } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const apiOrigin = /^https:\/\/api\.sdcosmetique\.ci\/.*/;

async function mockPosApi(page: Page) {
  let sessionOpen = false;
  let salePayload: Record<string, unknown> | null = null;

  await page.route(apiOrigin, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname === '/sanctum/csrf-cookie') {
      await route.fulfill({ status: 204 });
      return;
    }

    if (pathname === '/v1/admin/session') {
      await route.fulfill({ json: {
        user: { id: 1, name: 'Awa Caissière', email: 'awa.caisse@sdcosmetique.ci' },
        admin: { role: 'cashier', root: false },
      } });
      return;
    }

    if (pathname === '/logout') {
      await route.fulfill({ status: 204 });
      return;
    }

    if (pathname === '/v1/admin/pos/sessions/current') {
      await route.fulfill({ json: { data: sessionOpen ? {
        id: 10,
        cash_register_id: 1,
        status: 'open',
        opening_balance: 0,
        expected_cash: 0,
        actual_cash: null,
        difference: null,
        totals_by_method: {},
        opened_at: '2026-09-17T08:00:00Z',
        closed_at: null,
      } : null } });
      return;
    }

    if (pathname === '/v1/admin/pos/registers') {
      await route.fulfill({ json: { data: [{
        id: 1,
        name: 'Caisse principale',
        location: 'Boutique',
        has_open_session: false,
      }] } });
      return;
    }

    if (pathname === '/v1/admin/pos/sessions/open') {
      sessionOpen = true;
      await route.fulfill({ status: 201, json: { data: {
        id: 10,
        cash_register_id: 1,
        status: 'open',
        opening_balance: 0,
        expected_cash: 0,
        actual_cash: null,
        difference: null,
        totals_by_method: {},
        opened_at: '2026-09-17T08:00:00Z',
        closed_at: null,
      } } });
      return;
    }

    if (pathname === '/v1/admin/pos/sessions/10/close') {
      sessionOpen = false;
      await route.fulfill({ json: { data: {
        id: 10,
        cash_register_id: 1,
        status: 'closed',
        opening_balance: 0,
        expected_cash: 0,
        actual_cash: 0,
        difference: 0,
        totals_by_method: {},
        opened_at: '2026-09-17T08:00:00Z',
        closed_at: '2026-09-17T09:00:00Z',
      } } });
      return;
    }

    if (pathname === '/v1/admin/pos/products') {
      await route.fulfill({ json: { data: [{
        id: 47,
        title: 'Crème visage autonome',
        label: null,
        sku: 'SDC-CREME-47',
        unit_price: 7_500,
        stock: 3,
        available: true,
      }], meta: { current_page: 1, last_page: 1, total: 1 } } });
      return;
    }

    if (pathname === '/v1/admin/pos/reports/daily') {
      await route.fulfill({ json: { data: {
        revenue: 0,
        sales_count: 0,
        average_ticket: 0,
        by_hour: [],
        by_payment_method: {},
        refunds_today: 0,
      } } });
      return;
    }

    if (pathname === '/v1/admin/pos/sales' && request.method() === 'POST') {
      salePayload = request.postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, json: { data: {
        id: 101,
        reference: 'CMD-2026-000101',
        status: 'paid',
        channel: 'pos',
        customer: { client_id: null, name: 'Client de passage', phone: null, email: null },
        cashier: 'Admin SD',
        subtotal: 7_500,
        total: 7_500,
        currency: 'XOF',
        items: [{ id: 1, title: 'Crème visage autonome', label: null, quantity: 1, unit_price: 7_500, total: 7_500, refunded_quantity: 0 }],
        adjustments: [],
        tenders: [{ method: 'cash', amount: 7_500, received: 7_500, change: 0, pending: false, redirect_url: null, qr_image: null }],
        note: null,
        placed_at: '2026-09-17T08:05:00Z',
        paid_at: '2026-09-17T08:05:00Z',
        refunded_at: null,
        refund_status: 'none',
        refunded_amount: 0,
      } } });
      return;
    }

    if (pathname === '/v1/admin/pos/sales/101/receipt') {
      await route.fulfill({ status: 404, json: { message: 'Receipt preview omitted from POS flow test.' } });
      return;
    }

    await route.fulfill({ status: 404, json: { message: `Unmocked path: ${pathname}` } });
  });

  return { getSalePayload: () => salePayload };
}

test('the admin can open the register and complete a cash sale', async ({ page }) => {
  const api = await mockPosApi(page);
  await page.goto('/admin/pos');

  await expect(page.getByRole('heading', { name: 'Ouvrir la caisse' })).toBeVisible();
  await expect(page.getByText('Awa Caissière')).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveValue('1');
  await page.getByRole('button', { name: 'OUVRIR LA CAISSE' }).click();

  const product = page.getByRole('button', { name: /Crème visage autonome/ });
  await expect(product).toBeVisible();
  await product.click();
  await expect(page.getByText('Crème visage autonome').last()).toBeVisible();

  await page.getByRole('button', { name: 'ENCAISSER' }).click();
  await expect(page.getByRole('heading', { name: 'Encaissement' })).toBeVisible();
  await page.getByRole('button', { name: 'CONFIRMER LE PAIEMENT' }).click();

  await expect(page.getByRole('heading', { name: 'Vente terminée' })).toBeVisible();
  await expect(page.getByText('7 500 F CFA').last()).toBeVisible();
  expect(api.getSalePayload()).toMatchObject({
    cash_register_session_id: 10,
    items: [{ product_id: 47, quantity: 1 }],
    tenders: [{ method: 'cash', amount: 7_500, received: 7_500 }],
  });
});

test('switching cashier closes the register before returning to identification', async ({ page }) => {
  await mockPosApi(page);
  await page.goto('/admin/pos');
  await page.getByRole('button', { name: 'OUVRIR LA CAISSE' }).click();

  await expect(page.getByText('Caissière connectée')).toBeVisible();
  await expect(page.getByText('Awa Caissière')).toBeVisible();
  await page.getByRole('button', { name: 'Changer de caissière' }).click();

  await expect(page.getByRole('heading', { name: 'Résumé de caisse' })).toBeVisible();
  await page.getByRole('button', { name: 'FERMER LA CAISSE', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fpos|\/admin\/login\?next=\/admin\/pos/);
});

test('an administrator can create an individual cashier account', async ({ page }) => {
  const cashiers: Array<Record<string, unknown>> = [];

  await page.route(apiOrigin, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname === '/sanctum/csrf-cookie') {
      await route.fulfill({ status: 204 });
      return;
    }

    if (pathname === '/v1/admin/session') {
      await route.fulfill({ json: {
        user: { id: 1, name: 'Administrateur SD', email: 'admin@sdcosmetique.ci' },
        admin: { role: 'admin', root: true },
      } });
      return;
    }

    if (pathname === '/v1/admin/pos/cashiers' && request.method() === 'GET') {
      await route.fulfill({ json: { data: cashiers } });
      return;
    }

    if (pathname === '/v1/admin/pos/cashiers' && request.method() === 'POST') {
      const input = request.postDataJSON() as { name: string; email: string };
      const cashier = { id: 2, ...input, active: true, has_open_session: false, created_at: '2026-09-18T08:00:00Z' };
      cashiers.push(cashier);
      await route.fulfill({ status: 201, json: { data: cashier } });
      return;
    }

    await route.fulfill({ status: 404, json: { message: `Unmocked path: ${pathname}` } });
  });

  await page.goto('/admin/pos/cashiers');
  await expect(page.getByRole('heading', { name: 'Équipe de caisse' })).toBeVisible();

  await page.getByLabel('Nom complet').fill('Awa Caissière');
  await page.getByLabel('Email personnel').fill('awa.caisse@sdcosmetique.ci');
  await page.getByLabel('Mot de passe', { exact: true }).fill('MotDePasse!2026');
  await page.getByLabel('Confirmer le mot de passe').fill('MotDePasse!2026');
  await page.getByRole('button', { name: 'Créer le compte' }).click();

  await expect(page.getByText('Awa Caissière')).toBeVisible();
  await expect(page.getByText('awa.caisse@sdcosmetique.ci')).toBeVisible();
  await expect(page.getByText('Active', { exact: true })).toBeVisible();
});