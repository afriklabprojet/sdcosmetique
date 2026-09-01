import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ErrorEntry {
  category: string;
  fileKey: string;
  page: string;
  component: string;
  action: string;
  reproduction: string[];
  expected: string;
  actual: string;
  errorMessage: string;
}

const recordedErrors: ErrorEntry[] = [];

function recordError(err: ErrorEntry) {
  recordedErrors.push(err);
  console.log(`\n[ERROR FOUND] ${err.category}/${err.fileKey}: ${err.action} -> ${err.errorMessage}\n`);
}

function flushErrorsToDisk() {
  const rootTrash = path.resolve(process.cwd(), '../trash');
  for (const err of recordedErrors) {
    const targetDir = path.join(rootTrash, err.category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const filePath = path.join(targetDir, `${err.fileKey}.md`);
    const content = `# Error

## Location
- Page: ${err.page}
- Component: ${err.component}
- Action/Button: ${err.action}

## Reproduction
${err.reproduction.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

## Expected
${err.expected}

## Actual
${err.actual}

## Error
\`\`\`text
${err.errorMessage}
\`\`\`
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Written error log to ${filePath}`);
  }
}

test.describe('Admin Full Systematic Action Audit', () => {
  test.describe.configure({ mode: 'serial' });

  let pageErrors: string[] = [];
  let consoleErrors: string[] = [];
  let failedRequests: { url: string; method: string; status: number; body?: string }[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    consoleErrors = [];
    failedRequests = [];

    page.on('pageerror', (err) => {
      pageErrors.push(err.toString());
      console.error('[Browser PageError]', err);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('[Browser ConsoleError]', msg.text());
      }
    });

    page.on('response', async (resp) => {
      if (resp.status() >= 400 && resp.url().includes('8000')) {
        let text = '';
        try {
          text = await resp.text();
        } catch {}
        failedRequests.push({
          url: resp.url(),
          method: resp.request().method(),
          status: resp.status(),
          body: text,
        });
        console.error(`[API Error ${resp.status()}] ${resp.request().method()} ${resp.url()}:`, text.slice(0, 200));
      }
    });
  });

  test.afterAll(() => {
    flushErrorsToDisk();
  });

  test('01. Authentication & Login actions test', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('#admin-email');
    const pwdInput = page.locator('#admin-password');
    const pwdToggle = page.locator('button[aria-label="Afficher le mot de passe"], button[aria-label="Masquer le mot de passe"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(pwdInput).toBeVisible();

    // Toggle password visibility button
    await pwdInput.fill('Secret123!');
    expect(await pwdInput.getAttribute('type')).toBe('password');
    await pwdToggle.click();
    expect(await pwdInput.getAttribute('type')).toBe('text');
    await pwdToggle.click();
    expect(await pwdInput.getAttribute('type')).toBe('password');

    // Invalid credentials
    await emailInput.fill('invalid@sdcosmetique.ci');
    await pwdInput.fill('WrongPassword!');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    const errorBox = page.locator('div[class*="errorBox"]');
    await expect(errorBox).toBeVisible();
    const errText = await errorBox.textContent();
    console.log('Login error message on invalid credentials:', errText);

    // Valid credentials
    await emailInput.fill('admin@sdcosmetique.ci');
    await pwdInput.fill('Admin@SDZ2026!');
    await submitBtn.click();

    await page.waitForURL('**/admin', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('aside')).toBeVisible();
  });

  test('02. Systematic testing of all admin tabs & actions', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/admin/login')) {
      await page.locator('#admin-email').fill('admin@sdcosmetique.ci');
      await page.locator('#admin-password').fill('Admin@SDZ2026!');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/admin', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }

    const aside = page.locator('aside');
    await expect(aside).toBeVisible();

    const clickTab = async (buttonText: string) => {
      const btn = aside.locator(`button:has-text("${buttonText}")`).first();
      await expect(btn).toBeVisible({ timeout: 5000 });
      await btn.click();
      await page.waitForTimeout(600);
    };

    // ── TAB 1: TABLEAU DE BORD (Dashboard) ──
    console.log('\n--- Testing Dashboard Tab ---');
    await clickTab('Tableau de bord');
    const allOrdersBtn = page.locator('button:has-text("Toutes les commandes →")');
    if (await allOrdersBtn.isVisible()) {
      await allOrdersBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('h1:has-text("Commandes")')).toBeVisible();
      await clickTab('Tableau de bord');
    }

    const recentOrderRows = page.locator('tbody tr');
    if (await recentOrderRows.count() > 0) {
      await recentOrderRows.first().click();
      await page.waitForTimeout(500);
      const modalCloseBtn = page.locator('button:has-text("Fermer"), button:has-text("✕")').first();
      if (await modalCloseBtn.isVisible()) {
        await modalCloseBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // ── TAB 2: COMMANDES (Orders) ──
    console.log('\n--- Testing Orders Tab ---');
    await clickTab('Commandes');

    const orderSearch = page.locator('input[placeholder*="Recherche client"]');
    await expect(orderSearch).toBeVisible();
    await orderSearch.fill('NonExistentClientXYZ');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Aucune commande trouvée')).toBeVisible();
    await orderSearch.fill('');
    await page.waitForTimeout(300);

    const statusFilter = page.locator('select[aria-label="Filtrer par statut de commande"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('processing');
      await page.waitForTimeout(300);
      await statusFilter.selectOption('');
      await page.waitForTimeout(300);
    }

    const orderStatusSelects = page.locator('select[aria-label*="Statut de la commande"]');
    if (await orderStatusSelects.count() > 0) {
      const initialFailedCount = failedRequests.length;
      await orderStatusSelects.first().selectOption('processing');
      await page.waitForTimeout(1000);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'orders',
          fileKey: 'order-status-update',
          page: '/admin (Commandes)',
          component: 'OrdersTab',
          action: 'Changer le statut d\'une commande via le selecteur de ligne',
          reproduction: [
            'Aller sur l\'onglet Commandes',
            'Changer le statut d\'une commande à "processing"',
          ],
          expected: 'Le statut de la commande est mis à jour avec succès via PATCH /admin/orders/{id}',
          actual: `L'API a renvoyé HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    const encaisserBtn = page.locator('button:has-text("Encaisser")').first();
    if (await encaisserBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await encaisserBtn.click();
      await page.waitForTimeout(1000);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'orders',
          fileKey: 'order-mark-paid',
          page: '/admin (Commandes)',
          component: 'OrdersTab',
          action: 'Bouton "Encaisser"',
          reproduction: [
            'Aller sur l\'onglet Commandes',
            'Cliquer sur le bouton "Encaisser" pour une commande en attente',
          ],
          expected: 'La commande passe en statut de règlement Payée',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    const detailBtn = page.locator('button:has-text("Détail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('button:has-text("✕")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // ── TAB 3: PRODUITS (Products) ──
    console.log('\n--- Testing Products Tab ---');
    await clickTab('Produits');

    const newProdBtn = page.locator('button:has-text("+ Nouveau")');
    await newProdBtn.click();
    await page.waitForTimeout(500);

    const modalTitleInput = page.locator('input[placeholder*="Sérum Éclat"]').or(page.locator('label:has-text("Nom du produit") + input')).first();
    if (await modalTitleInput.isVisible()) {
      await modalTitleInput.fill('Test Audit Produit');
      await page.waitForTimeout(300);

      const priceInput = page.locator('label:has-text("Prix (FCFA)") + input').first();
      if (await priceInput.isVisible()) {
        await priceInput.fill('15000');
      }

      const addImgBtn = page.locator('button:has-text("+ Ajouter une image")');
      if (await addImgBtn.isVisible()) {
        await addImgBtn.click();
        await page.waitForTimeout(200);
        const imgInput = page.locator('input[placeholder*="https://"]').first();
        if (await imgInput.isVisible()) {
          await imgInput.fill('/categories/visage.png');
        }
      }

      const saveProdBtn = page.locator('button:has-text("+ Ajouter")').or(page.locator('button:has-text("✓ Enregistrer")')).first();
      if (await saveProdBtn.isVisible() && await saveProdBtn.isEnabled()) {
        const initialFailedCount = failedRequests.length;
        await saveProdBtn.click();
        await page.waitForTimeout(1500);
        if (failedRequests.length > initialFailedCount) {
          const lastErr = failedRequests[failedRequests.length - 1];
          recordError({
            category: 'products',
            fileKey: 'product-create',
            page: '/admin (Produits)',
            component: 'ProductEditModal',
            action: 'Bouton "+ Ajouter" (Création de produit)',
            reproduction: [
              'Aller sur l\'onglet Produits',
              'Cliquer sur "+ Nouveau"',
              'Renseigner le nom, la catégorie, le prix et une image',
              'Cliquer sur "+ Ajouter"',
            ],
            expected: 'Le produit est créé via POST /admin/products et apparaît dans la liste',
            actual: `Erreur API HTTP ${lastErr.status}`,
            errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
          });
        }
      } else {
        const cancelBtn = page.locator('button:has-text("Annuler")').first();
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }

    const editProdBtn = page.locator('button:has-text("Éditer")').first();
    if (await editProdBtn.isVisible()) {
      await editProdBtn.click();
      await page.waitForTimeout(500);
      const saveEditBtn = page.locator('button:has-text("✓ Enregistrer")').first();
      if (await saveEditBtn.isVisible() && await saveEditBtn.isEnabled()) {
        const initialFailedCount = failedRequests.length;
        await saveEditBtn.click();
        await page.waitForTimeout(1500);
        if (failedRequests.length > initialFailedCount) {
          const lastErr = failedRequests[failedRequests.length - 1];
          recordError({
            category: 'products',
            fileKey: 'product-update',
            page: '/admin (Produits)',
            component: 'ProductEditModal',
            action: 'Bouton "✓ Enregistrer" (Modification de produit)',
            reproduction: [
              'Aller sur l\'onglet Produits',
              'Cliquer sur "Éditer" sur le premier produit',
              'Cliquer sur "✓ Enregistrer"',
            ],
            expected: 'Le produit est mis à jour via PUT /admin/products/{id}',
            actual: `Erreur API HTTP ${lastErr.status}`,
            errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
          });
        }
      } else {
        const cancelBtn = page.locator('button:has-text("Annuler")').first();
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }

    // ── TAB 4: AVIS (Reviews) ──
    console.log('\n--- Testing Reviews Tab ---');
    await clickTab('Avis');
    const reviewToggleBtn = page.locator('button:has-text("✓ Approuver"), button:has-text("Retirer")').first();
    if (await reviewToggleBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await reviewToggleBtn.click();
      await page.waitForTimeout(1000);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'reviews',
          fileKey: 'review-toggle-approve',
          page: '/admin (Avis)',
          component: 'ReviewsTab',
          action: 'Bouton "✓ Approuver" / "Retirer"',
          reproduction: [
            'Aller sur l\'onglet Avis',
            'Cliquer sur "✓ Approuver" ou "Retirer" pour modérer un avis',
          ],
          expected: 'Le statut de l\'avis est mis à jour via PATCH /admin/reviews/{id}',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 5: TÉMOIGNAGES (Testimonials) ──
    console.log('\n--- Testing Testimonials Tab ---');
    await clickTab('Témoignages');
    const testiToggleBtn = page.locator('button:has-text("✓ Approuver"), button:has-text("Retirer")').first();
    if (await testiToggleBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await testiToggleBtn.click();
      await page.waitForTimeout(1000);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'testimonials',
          fileKey: 'testimonial-toggle-approve',
          page: '/admin (Témoignages)',
          component: 'TestimonialsTab',
          action: 'Bouton "✓ Approuver" / "Retirer"',
          reproduction: [
            'Aller sur l\'onglet Témoignages',
            'Cliquer sur "✓ Approuver" ou "Retirer" pour modérer un témoignage',
          ],
          expected: 'Le témoignage est mis à jour via PUT/PATCH /admin/testimonials/{id}',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 6: CATÉGORIES (Categories) ──
    console.log('\n--- Testing Categories Tab ---');
    await clickTab('Catégories');
    const newCatBtn = page.locator('button:has-text("+ Nouvelle catégorie")');
    await newCatBtn.click();
    await page.waitForTimeout(500);

    const catLabelInput = page.locator('#cat-modal-label');
    if (await catLabelInput.isVisible()) {
      await catLabelInput.fill('Catégorie Test Audit');
      await page.waitForTimeout(200);

      const saveCatBtn = page.locator('button:has-text("Enregistrer")').first();
      if (await saveCatBtn.isVisible() && await saveCatBtn.isEnabled()) {
        const initialFailedCount = failedRequests.length;
        await saveCatBtn.click();
        await page.waitForTimeout(1500);
        if (failedRequests.length > initialFailedCount) {
          const lastErr = failedRequests[failedRequests.length - 1];
          recordError({
            category: 'categories',
            fileKey: 'category-create',
            page: '/admin (Catégories)',
            component: 'CategoriesTab',
            action: 'Bouton "Enregistrer" (Création de catégorie)',
            reproduction: [
              'Aller sur l\'onglet Catégories',
              'Cliquer sur "+ Nouvelle catégorie"',
              'Renseigner le label "Catégorie Test Audit"',
              'Cliquer sur "Enregistrer"',
            ],
            expected: 'La catégorie est créée via POST /admin/categories',
            actual: `Erreur API HTTP ${lastErr.status}`,
            errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
          });
        }
      } else {
        const cancelBtn = page.locator('button:has-text("Annuler")').first();
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }

    // ── TAB 7: QUIZ ──
    console.log('\n--- Testing Quiz Tab ---');
    await clickTab('Quiz');
    const newConcernBtn = page.locator('button:has-text("+ Nouvelle préoccupation")');
    if (await newConcernBtn.isVisible()) {
      await newConcernBtn.click();
      await page.waitForTimeout(500);
      const quizIdInput = page.locator('#quiz-modal-id');
      const quizLabelInput = page.locator('label:has-text("Label *") + input');
      if (await quizIdInput.isVisible()) {
        await quizIdInput.fill('test_concern_audit');
        await quizLabelInput.fill('Test Audit Concern');
        const saveQuizBtn = page.locator('button:has-text("Enregistrer")').first();
        const initialFailedCount = failedRequests.length;
        await saveQuizBtn.click();
        await page.waitForTimeout(1500);
        if (failedRequests.length > initialFailedCount) {
          const lastErr = failedRequests[failedRequests.length - 1];
          recordError({
            category: 'quiz',
            fileKey: 'quiz-concern-create',
            page: '/admin (Quiz)',
            component: 'QuizTab',
            action: 'Bouton "Enregistrer" (+ Nouvelle préoccupation)',
            reproduction: [
              'Aller sur l\'onglet Quiz',
              'Cliquer sur "+ Nouvelle préoccupation"',
              'Renseigner ID "test_concern_audit" et Label "Test Audit Concern"',
              'Cliquer sur "Enregistrer"',
            ],
            expected: 'La préoccupation est enregistrée via l\'API',
            actual: `Erreur API HTTP ${lastErr.status}`,
            errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
          });
        }
      }
    }

    // ── TAB 8: CLIENTS ──
    console.log('\n--- Testing Clients Tab ---');
    await clickTab('Clients');

    // ── TAB 9: CONTENU (Content) ──
    console.log('\n--- Testing Content Tab ---');
    await clickTab('Contenu');
    const topbarSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await topbarSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await topbarSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'content',
          fileKey: 'content-topbar-save',
          page: '/admin (Contenu)',
          component: 'ContentTab',
          action: 'Bouton "Sauvegarder" (Topbar)',
          reproduction: [
            'Aller sur l\'onglet Contenu',
            'Cliquer sur "Sauvegarder" sur la section Barre supérieure',
          ],
          expected: 'Le paramètre topbar est mis à jour via PATCH /admin/settings/topbar',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 10: FIDÉLITÉ (Jeko) ──
    console.log('\n--- Testing Jeko Loyalty Tab ---');
    await clickTab('Fidélité');
    const jekoSaveBtn = page.locator('button:has-text("💾 Sauvegarder")');
    if (await jekoSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await jekoSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'loyalty',
          fileKey: 'jeko-settings-save',
          page: '/admin (Fidélité)',
          component: 'JekoTab',
          action: 'Bouton "💾 Sauvegarder" (Configuration)',
          reproduction: [
            'Aller sur l\'onglet Fidélité',
            'Cliquer sur "💾 Sauvegarder" dans l\'onglet Configuration',
          ],
          expected: 'Les paramètres de fidélité sont enregistrés via PATCH /admin/settings/jeko',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 11: NEWSLETTER ──
    console.log('\n--- Testing Newsletter Tab ---');
    await clickTab('Newsletter');
    const newsSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await newsSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await newsSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'newsletter',
          fileKey: 'newsletter-config-save',
          page: '/admin (Newsletter)',
          component: 'NewsletterTab',
          action: 'Bouton "Sauvegarder" (Affichage Newsletter)',
          reproduction: [
            'Aller sur l\'onglet Newsletter',
            'Cliquer sur "Sauvegarder"',
          ],
          expected: 'La configuration newsletter est sauvegardée via PATCH /admin/settings/newsletter',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    page.once('dialog', async (dialog) => {
      console.log('Dialog on Newsletter unsubscribe:', dialog.message());
      recordError({
        category: 'newsletter',
        fileKey: 'newsletter-unsubscribe-unsupported',
        page: '/admin (Newsletter)',
        component: 'NewsletterTab',
        action: 'Bouton "Désinscrire" / "Réactiver"',
        reproduction: [
          'Aller sur l\'onglet Newsletter',
          'Cliquer sur le bouton "Désinscrire" ou "Réactiver" pour un abonné',
        ],
        expected: 'Le statut d\'abonnement est mis à jour via une requête API',
        actual: `Alerte affichée: "${dialog.message()}"`,
        errorMessage: dialog.message(),
      });
      await dialog.accept();
    });
    const desinscrireBtn = page.locator('button:has-text("Désinscrire"), button:has-text("Réactiver")').first();
    if (await desinscrireBtn.isVisible()) {
      await desinscrireBtn.click();
      await page.waitForTimeout(500);
    }

    // ── TAB 12: LIVRAISON (Shipping) ──
    console.log('\n--- Testing Shipping Tab ---');
    await clickTab('Livraison');
    const shipSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await shipSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await shipSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'shipping',
          fileKey: 'shipping-save',
          page: '/admin (Livraison)',
          component: 'ShippingTab',
          action: 'Bouton "Sauvegarder les options"',
          reproduction: [
            'Aller sur l\'onglet Livraison',
            'Cliquer sur "Sauvegarder les options"',
          ],
          expected: 'Les options de livraison sont enregistrées via POST/PUT /admin/delivery-methods',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 13: MARKETING ──
    console.log('\n--- Testing Marketing Tab ---');
    await clickTab('Marketing');
    const mktSubTabs = ['📢 Bannières', '🎁 Pop-up Bienvenue', '🏷 Codes Promo', '⬆ Upsell', '📊 Tracking'];
    for (const st of mktSubTabs) {
      const stBtn = page.locator(`button:has-text("${st}")`);
      if (await stBtn.isVisible()) {
        await stBtn.click();
        await page.waitForTimeout(300);

        const mktSave = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
        if (await mktSave.isVisible()) {
          const initialFailedCount = failedRequests.length;
          await mktSave.click();
          await page.waitForTimeout(1500);
          if (failedRequests.length > initialFailedCount) {
            const lastErr = failedRequests[failedRequests.length - 1];
            recordError({
              category: 'marketing',
              fileKey: `marketing-${st.replace(/[^a-zA-Z]/g, '').toLowerCase()}-save`,
              page: `/admin (Marketing > ${st})`,
              component: 'MarketingTab',
              action: `Bouton "Sauvegarder" (${st})`,
              reproduction: [
                'Aller sur l\'onglet Marketing',
                `Cliquer sur le sous-onglet ${st}`,
                'Cliquer sur "Sauvegarder"',
              ],
              expected: 'Les paramètres marketing sont enregistrés via PATCH /admin/settings/marketing',
              actual: `Erreur API HTTP ${lastErr.status}`,
              errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
            });
          }
        }
      }
    }

    // ── TAB 14: BRANDING ──
    console.log('\n--- Testing Branding Tab ---');
    await clickTab('Branding');
    const brandingSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await brandingSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await brandingSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'branding',
          fileKey: 'branding-save',
          page: '/admin (Branding)',
          component: 'BrandingTab',
          action: 'Bouton "Enregistrer les modifications"',
          reproduction: [
            'Aller sur l\'onglet Branding',
            'Cliquer sur "Enregistrer les modifications"',
          ],
          expected: 'Le paramètre branding est enregistré via PATCH /admin/settings/branding',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 15: PROMOTIONS (Promos) ──
    console.log('\n--- Testing Promos Tab ---');
    await clickTab('Promos');
    const promoSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').last();
    if (await promoSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await promoSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'promos',
          fileKey: 'coupons-save',
          page: '/admin (Promos)',
          component: 'PromosTab',
          action: 'Bouton "Sauvegarder les codes"',
          reproduction: [
            'Aller sur l\'onglet Promos',
            'Cliquer sur "Sauvegarder les codes"',
          ],
          expected: 'Les coupons sont enregistrés via POST/PUT /admin/coupons',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 16: FAQ ──
    console.log('\n--- Testing FAQ Tab ---');
    await clickTab('FAQ');
    const faqSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await faqSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await faqSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'faq',
          fileKey: 'faq-save',
          page: '/admin (FAQ)',
          component: 'FaqTab',
          action: 'Bouton "Sauvegarder" (FAQ)',
          reproduction: [
            'Aller sur l\'onglet FAQ',
            'Cliquer sur "Sauvegarder"',
          ],
          expected: 'Les FAQs sont enregistrées via PATCH /admin/settings/faq',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 17: HERO ──
    console.log('\n--- Testing Hero Tab ---');
    await clickTab('Hero');
    const heroSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await heroSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await heroSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'hero',
          fileKey: 'hero-save',
          page: '/admin (Hero)',
          component: 'HeroTab',
          action: 'Bouton "Sauvegarder" (Hero)',
          reproduction: [
            'Aller sur l\'onglet Hero',
            'Cliquer sur "Sauvegarder"',
          ],
          expected: 'La configuration Hero est enregistrée via PATCH /admin/settings/hero',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── TAB 18: LEGAL ──
    console.log('\n--- Testing Legal Tab ---');
    await clickTab('Pages légales');
    const legalDetails = page.locator('details');
    if (await legalDetails.count() > 0) {
      await legalDetails.first().click();
      await page.waitForTimeout(300);
      const legalSaveBtn = page.locator('details button:has-text("Enregistrer"), details button:has-text("Sauvegarder")').first();
      if (await legalSaveBtn.isVisible()) {
        const initialFailedCount = failedRequests.length;
        await legalSaveBtn.click();
        await page.waitForTimeout(1500);
        if (failedRequests.length > initialFailedCount) {
          const lastErr = failedRequests[failedRequests.length - 1];
          recordError({
            category: 'legal',
            fileKey: 'legal-mentions-save',
            page: '/admin (Pages légales)',
            component: 'LegalTab',
            action: 'Bouton "Sauvegarder" (Mentions légales)',
            reproduction: [
              'Aller sur l\'onglet Pages légales',
              'Déplier "Mentions légales"',
              'Cliquer sur "Sauvegarder"',
            ],
            expected: 'La page légale est enregistrée via PATCH /admin/settings/legal_mentions',
            actual: `Erreur API HTTP ${lastErr.status}`,
            errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
          });
        }
      }
    }

    // ── TAB 19: PAIEMENT (Payment) ──
    console.log('\n--- Testing Payment Tab ---');
    await clickTab('Paiement');
    const paymentSaveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
    if (await paymentSaveBtn.isVisible()) {
      const initialFailedCount = failedRequests.length;
      await paymentSaveBtn.click();
      await page.waitForTimeout(1500);
      if (failedRequests.length > initialFailedCount) {
        const lastErr = failedRequests[failedRequests.length - 1];
        recordError({
          category: 'payment',
          fileKey: 'payment-methods-save',
          page: '/admin (Paiement)',
          component: 'PaymentTab',
          action: 'Bouton "Enregistrer les moyens de paiement"',
          reproduction: [
            'Aller sur l\'onglet Paiement',
            'Cliquer sur "Enregistrer les moyens de paiement"',
          ],
          expected: 'Les moyens de paiement actifs sont enregistrés via PATCH /admin/settings/payment_methods_active',
          actual: `Erreur API HTTP ${lastErr.status}`,
          errorMessage: `${lastErr.method} ${lastErr.url} -> HTTP ${lastErr.status}: ${lastErr.body}`,
        });
      }
    }

    // ── LOGOUT ──
    console.log('\n--- Testing Logout ---');
    const logoutBtn = aside.locator('button[title="Déconnexion"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/admin/login');
    }
  });
});
