import { test, expect } from '@playwright/test';

/*
 * Couvre l'étape "Récapitulatif" du tunnel de commande (checkout/review),
 * ajoutée pour utiliser l'endpoint API `GET /checkout/review` qui existait
 * côté backend sans jamais être appelé côté frontend.
 *
 * Le paiement à la livraison a été retiré du tunnel (mobile money uniquement) :
 * ces tests sélectionnent donc Orange Money et s'arrêtent avant le clic sur
 * "Confirmer ma commande", qui déclencherait un vrai appel serveur vers
 * l'API Jeko — non déterministe et indésirable dans une suite automatisée.
 */
test.describe('Checkout — étape Récapitulatif', () => {
  test.setTimeout(60000);

  async function addFirstProduct(page: import('@playwright/test').Page) {
    await page.goto('/boutique', { waitUntil: 'networkidle' });

    const firstCard = page.locator('.boutique-grid article').first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole('button', { name: 'Ajouter au panier' }).click();

    const cart = page.getByRole('dialog', { name: 'Panier' });
    await expect(cart).toBeVisible();
    await expect(cart.getByText('1 article', { exact: true })).toBeVisible();
    await cart.getByRole('button', { name: 'Fermer le panier' }).click();
    await expect(cart).toBeHidden();
  }

  async function toReviewStep(page: import('@playwright/test').Page, email: string) {
    await addFirstProduct(page);

    await page.goto('/checkout', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /continuer|suivant|passer/i }).first().click();
    await page.waitForTimeout(500);

    await page.fill('#del-firstName', 'Awa');
    await page.fill('#del-lastName', 'Kouassi');
    await page.fill('#del-email', email);
    await page.fill('#del-phone', '+225 07 00 00 00 00');
    await page.fill('#del-address', 'Rue des Jardins, Cocody');
    await page.fill('#del-city', 'Abidjan');
    await page.getByRole('button', { name: /continuer vers le paiement/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Paiement à la livraison')).toHaveCount(0);

    await page.getByRole('radio', { name: 'Orange Money' }).click();
    await page.fill('#pay-mobile-number', '+225 07 00 00 00 00');
    await page.getByRole('button', { name: /continuer →/i }).click();
    await page.waitForTimeout(800);
  }

  test('affiche le récapitulatif avec le mode de paiement choisi', async ({ page }) => {
    page.on('pageerror', err => console.log('BROWSER UNCAUGHT ERROR:', err.stack || err.message));

    await toReviewStep(page, 'test.review@example.com');

    await expect(page.getByText('Récapitulatif de la commande')).toBeVisible();
    await expect(page.getByText('Awa Kouassi')).toBeVisible();
    await expect(page.getByText('Orange Money')).toBeVisible();

    const confirmBtn = page.getByRole('button', { name: /confirmer ma commande/i });
    await expect(confirmBtn).toBeVisible();
  });

  test("le bouton 'Modifier' du paiement ramène à l'étape paiement", async ({ page }) => {
    await toReviewStep(page, 'test.review2@example.com');

    await expect(page.getByText('Récapitulatif de la commande')).toBeVisible();
    await page.getByRole('button', { name: 'Modifier' }).last().click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Mode de paiement')).toBeVisible();
  });

  test('la grille des moyens de paiement ne propose plus le paiement à la livraison', async ({ page }) => {
    await addFirstProduct(page);

    await page.goto('/checkout', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /continuer|suivant|passer/i }).first().click();
    await page.waitForTimeout(500);
    await page.fill('#del-firstName', 'Awa');
    await page.fill('#del-lastName', 'Kouassi');
    await page.fill('#del-email', 'test.review3@example.com');
    await page.fill('#del-phone', '+225 07 00 00 00 00');
    await page.fill('#del-address', 'Rue des Jardins, Cocody');
    await page.fill('#del-city', 'Abidjan');
    await page.getByRole('button', { name: /continuer vers le paiement/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Paiement à la livraison')).toHaveCount(0);
    for (const label of ['Orange Money', 'Wave', 'MTN MoMo', 'Moov Money', 'Djamo']) {
      await expect(page.getByRole('radio', { name: label })).toBeVisible();
    }
  });
});
