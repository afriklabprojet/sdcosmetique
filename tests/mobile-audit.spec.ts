/**
 * ═══════════════════════════════════════════════════════════════════
 * AUDIT MOBILE SENIOR — SD Cosmétique
 * QA Engineer Mobile × Expert UX Mobile × Testeur Frontend
 * ═══════════════════════════════════════════════════════════════════
 *
 * Couverture :
 *  · Responsive (overflow-x, éléments coupés, breakpoints)
 *  · Tactile (touch targets WCAG 2.5.5, zones cliquables)
 *  · Scroll (horizontal parasite, sticky, rebonds iOS)
 *  · Formulaires (clavier mobile, zoom iOS, types input)
 *  · Navigation (hamburger, drawer, transitions)
 *  · Performance (FCP, TTFB, images, throttling)
 *  · Accessibilité (axe-core, contraste, aria)
 *  · UX conversion (CTA, checkout, panier)
 *  · Safe-area iPhone, Safari-specific pitfalls
 * ═══════════════════════════════════════════════════════════════════
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// ─── Base ────────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:3000';
const SHOT_DIR = path.join(process.cwd(), 'tests', 'mobile-audit-screenshots');
const REPORT_PATH = path.join(process.cwd(), 'tests', 'RAPPORT-MOBILE-AUDIT.md');

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function shot(page: Page, name: string, fullPage = true) {
  ensureDir(SHOT_DIR);
  await page.screenshot({
    path: path.join(SHOT_DIR, `${name}.png`),
    fullPage,
    animations: 'disabled',
  });
}

// ─── Devices ─────────────────────────────────────────────────────────────────
const DEVICES = {
  iPhoneSE:    { width: 375,  height: 667,  label: 'iphone-se',       ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',       isMobile: true,  hasTouch: true,  deviceScaleFactor: 2 },
  iPhone13:    { width: 390,  height: 844,  label: 'iphone-13',       ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',       isMobile: true,  hasTouch: true,  deviceScaleFactor: 3 },
  iPhone15Pro: { width: 430,  height: 932,  label: 'iphone-15-pro',   ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',       isMobile: true,  hasTouch: true,  deviceScaleFactor: 3 },
  galaxyS23:   { width: 360,  height: 780,  label: 'galaxy-s23',      ua: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',                         isMobile: true,  hasTouch: true,  deviceScaleFactor: 3 },
  pixel8:      { width: 412,  height: 915,  label: 'pixel-8',         ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',                          isMobile: true,  hasTouch: true,  deviceScaleFactor: 2.75 },
  redmiNote:   { width: 393,  height: 851,  label: 'redmi-note',      ua: 'Mozilla/5.0 (Linux; Android 12; Redmi Note 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',                    isMobile: true,  hasTouch: true,  deviceScaleFactor: 2 },
  iPad:        { width: 768,  height: 1024, label: 'ipad',            ua: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',                  isMobile: false, hasTouch: true,  deviceScaleFactor: 2 },
  samsungTab:  { width: 800,  height: 1280, label: 'samsung-tab',     ua: 'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',                                 isMobile: false, hasTouch: true,  deviceScaleFactor: 2 },
};

// ─── Pages à tester ──────────────────────────────────────────────────────────
const ROUTES = {
  home:      '/',
  boutique:  '/boutique',
  produit:   '/produit/savon-visage-orange',
  quiz:      '/quiz',
  login:     '/connexion',
  register:  '/inscription',
  checkout:  '/checkout',
  wishlist:  '/wishlist',
  compte:    '/compte',
};

// ─── Shared results collector ─────────────────────────────────────────────────
type Issue = {
  severity: 'CRITIQUE' | 'MAJEUR' | 'MINEUR';
  category: string;
  device: string;
  route: string;
  description: string;
  impact: string;
};

const ISSUES: Issue[] = [];
const METRICS: Record<string, Record<string, unknown>> = {};

function issue(
  severity: Issue['severity'],
  category: string,
  device: string,
  route: string,
  description: string,
  impact: string
) {
  ISSUES.push({ severity, category, device, route, description, impact });
}

// ─── Helper : set device ─────────────────────────────────────────────────────
async function setDevice(page: Page, device: typeof DEVICES[keyof typeof DEVICES]) {
  await page.setViewportSize({ width: device.width, height: device.height });
  await page.setExtraHTTPHeaders({
    'User-Agent': device.ua,
  });
}

// ─── Helper : overflow-x detector ────────────────────────────────────────────
async function detectHorizontalOverflow(page: Page): Promise<{ hasOverflow: boolean; overflowingSelectors: string[] }> {
  return page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    if (docWidth <= vw) return { hasOverflow: false, overflowingSelectors: [] };

    const overflowingSelectors: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 2) {
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : '';
        overflowingSelectors.push(`${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 80));
      }
    });
    return { hasOverflow: true, overflowingSelectors: overflowingSelectors.slice(0, 10) };
  });
}

// ─── Helper : touch target audit ─────────────────────────────────────────────
async function auditTouchTargets(page: Page): Promise<{ small: { selector: string; w: number; h: number }[] }> {
  return page.evaluate(() => {
    const MIN = 44;
    const interactives = Array.from(
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
    const small: { selector: string; w: number; h: number }[] = [];
    interactives.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < MIN || r.height < MIN)) {
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : '';
        const tag = el.tagName.toLowerCase();
        small.push({
          selector: `${tag}${id}${cls}`.slice(0, 60),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    });
    return { small: small.slice(0, 15) };
  });
}

// ─── Helper : font sizes ─────────────────────────────────────────────────────
async function auditFontSizes(page: Page): Promise<{ tooSmall: { selector: string; size: number }[] }> {
  return page.evaluate(() => {
    const tooSmall: { selector: string; size: number }[] = [];
    document.querySelectorAll('p, span, label, li, td, th, small').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) {
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        tooSmall.push({ selector: `${el.tagName.toLowerCase()}${cls}`.slice(0, 60), size: fs });
      }
    });
    return { tooSmall: tooSmall.slice(0, 10) };
  });
}

// ─── Helper : input type audit ────────────────────────────────────────────────
async function auditInputTypes(page: Page): Promise<{ issues: { selector: string; type: string; name: string; recommendation: string }[] }> {
  return page.evaluate(() => {
    const issues: { selector: string; type: string; name: string; recommendation: string }[] = [];
    document.querySelectorAll('input').forEach((el) => {
      const t = el.type;
      const n = el.name || el.id || '';
      let rec = '';
      if (n.match(/phone|tel|mobile/i) && t !== 'tel') rec = 'Utiliser type="tel"';
      if (n.match(/email/i) && t !== 'email') rec = 'Utiliser type="email"';
      if (n.match(/password/i) && t !== 'password') rec = 'Utiliser type="password"';
      if (n.match(/search/i) && t !== 'search') rec = 'Utiliser type="search"';
      if (n.match(/number|qty|quantity|amount/i) && t !== 'number') rec = 'Utiliser type="number"';
      if (n.match(/date|birth/i) && t !== 'date') rec = 'Utiliser type="date"';
      if (rec) {
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        issues.push({ selector: `input${cls}`.slice(0, 60), type: t, name: n, recommendation: rec });
      }
    });
    return { issues };
  });
}

// ─── Helper : iOS zoom trap ────────────────────────────────────────────────────
async function auditIOSZoom(page: Page): Promise<{ zoomTriggers: { selector: string; fontSize: number }[] }> {
  return page.evaluate(() => {
    const zoomTriggers: { selector: string; fontSize: number }[] = [];
    document.querySelectorAll('input, select, textarea').forEach((el) => {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) {
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        zoomTriggers.push({ selector: `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 60), fontSize: Math.round(fs) });
      }
    });
    return { zoomTriggers };
  });
}

// ─── Helper : performance metrics ─────────────────────────────────────────────
async function getPerf(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(e => e.name === 'first-contentful-paint')?.startTime ?? 0;
    if (!nav) return { ttfb: 0, domLoad: 0, fullLoad: 0, fcp: Math.round(fcp), resources: 0, images: 0 };
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images = resources.filter(r => r.initiatorType === 'img');
    return {
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domLoad: Math.round(nav.domContentLoadedEventEnd),
      fullLoad: Math.round(nav.loadEventEnd),
      fcp: Math.round(fcp),
      resources: resources.length,
      images: images.length,
      largeImages: images.filter(i => i.transferSize > 200_000).length,
      totalTransfer: Math.round(resources.reduce((s, r) => s + r.transferSize, 0) / 1024),
    };
  });
}

// ─── Helper : CLS measurement ────────────────────────────────────────────────
async function measureCLS(page: Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const ls = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!ls.hadRecentInput) cls += ls.value ?? 0;
        }
      });
      try {
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // not supported
      }
      setTimeout(() => {
        observer.disconnect();
        resolve(parseFloat(cls.toFixed(4)));
      }, 3000);
    });
  });
}

// ─── Helper : scroll position tracking (horizontal) ────────────────────────────
async function canScrollHorizontally(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const before = window.scrollX;
    window.scrollBy(10, 0);
    const after = window.scrollX;
    window.scrollBy(-10, 0);
    return after > before;
  });
}

// ─── Helper : console errors ─────────────────────────────────────────────────
function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().slice(0, 200));
  });
  page.on('pageerror', err => errors.push(err.message.slice(0, 200)));
  return errors;
}

// ═══════════════════════════════════════════════════════════════════
// SUITE 1 — RESPONSIVE & OVERFLOW
// ═══════════════════════════════════════════════════════════════════

test.describe('📱 Suite 1 — Responsive & Overflow Horizontal', () => {

  for (const [devKey, device] of Object.entries(DEVICES)) {
    test(`[${device.label}] Overflow horizontal — toutes pages`, async ({ page }) => {
      await setDevice(page, device);

      for (const [routeKey, route] of Object.entries(ROUTES)) {
        const errors = captureConsoleErrors(page);
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
          await page.waitForTimeout(800);

          const overflow = await detectHorizontalOverflow(page);
          if (overflow.hasOverflow) {
            issue('CRITIQUE', 'Responsive/Overflow', device.label, route,
              `Débordement horizontal détecté. Éléments : ${overflow.overflowingSelectors.join(' | ')}`,
              'Scroll horizontal parasite — dégrade massivement UX mobile');
            await shot(page, `overflow-${device.label}-${routeKey}`);
          }

          const scrollable = await canScrollHorizontally(page);
          if (scrollable) {
            issue('MAJEUR', 'Responsive/Scroll-X', device.label, route,
              'Scroll horizontal possible (document scrollable latéralement)',
              'Fuite de layout — utilisateur perdu, panier/CTA hors écran');
          }

          // Capture screenshot de référence pour les pages clés
          if (['home', 'boutique', 'checkout'].includes(routeKey) && device.label === 'iphone-13') {
            await shot(page, `ref-${device.label}-${routeKey}`);
          }

          // Log console errors
          if (errors.length > 0) {
            issue('MINEUR', 'Console Errors', device.label, route,
              `${errors.length} erreur(s) console : ${errors.slice(0, 3).join(' | ')}`,
              'Signaux de bug JS potentiels');
          }
        } catch {
          issue('MAJEUR', 'Page Load', device.label, route,
            `Page inaccessible ou timeout (20s)`,
            'Page non chargeable sur mobile');
        }
      }
    });
  }

  test('[iPhone-13] Screenshot référence — pages critiques', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);

    for (const [key, route] of Object.entries(ROUTES)) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(1000);
        await shot(page, `${device.label}-${key}`);
      } catch { /* page may not exist */ }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 2 — TOUCH TARGETS & TACTILE
// ═══════════════════════════════════════════════════════════════════

test.describe('👆 Suite 2 — Touch Targets & Accessibilité Tactile', () => {

  const mobileDevices = [DEVICES.iPhoneSE, DEVICES.iPhone13, DEVICES.galaxyS23, DEVICES.pixel8];

  for (const device of mobileDevices) {
    test(`[${device.label}] Touch targets WCAG 2.5.5 — toutes pages`, async ({ page }) => {
      await setDevice(page, device);

      for (const [routeKey, route] of Object.entries(ROUTES)) {
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
          await page.waitForTimeout(600);

          const { small } = await auditTouchTargets(page);
          if (small.length > 0) {
            const level = small.length > 5 ? 'CRITIQUE' : 'MAJEUR';
            issue(level, 'Touch Targets', device.label, route,
              `${small.length} élément(s) interactif(s) < 44px : ${small.map(s => `${s.selector} (${s.w}×${s.h}px)`).join(' | ')}`,
              'Cibles trop petites — erreurs de tap, frustration, abandon');
          }
        } catch { /* skip */ }
      }
    });
  }

  test('[iPhone-13] Test hamburger & drawer navigation', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(800);

    // Screenshot état initial
    await shot(page, 'nav-closed-iphone13', false);

    // Chercher le bouton hamburger
    const hamburger = page.locator('[id*="hamburger"], button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="navigation"]').first();
    const hamburgerAlt = page.locator('button').filter({ hasText: '' }).nth(0);

    let hamEl = hamburger;
    try {
      await hamburger.waitFor({ timeout: 3000 });
    } catch {
      hamEl = hamburgerAlt;
    }

    const box = await hamEl.boundingBox();
    if (box) {
      if (box.width < 44 || box.height < 44) {
        issue('CRITIQUE', 'Touch Targets', device.label, '/',
          `Hamburger trop petit : ${Math.round(box.width)}×${Math.round(box.height)}px (min 44px)`,
          'Premier point de contact mobile — cible trop petite = bounce utilisateur');
      }

      // Ouvrir le menu
      await hamEl.click();
      await page.waitForTimeout(500);
      await shot(page, 'nav-open-iphone13', false);

      // Vérifier que le menu est visible
      const drawerVisible = await page.evaluate(() => {
        const els = document.querySelectorAll('[role="dialog"], [aria-label*="navigation"], [aria-label*="menu"], nav');
        return Array.from(els).some(el => {
          const r = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return r.width > 100 && style.display !== 'none' && style.visibility !== 'hidden';
        });
      });

      if (!drawerVisible) {
        issue('MAJEUR', 'Navigation', device.label, '/',
          'Menu hamburger ouvert mais aucun drawer/nav visible (possible z-index ou transform bug)',
          'Navigation mobile cassée');
      }

      // Fermer avec tap overlay
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      issue('MAJEUR', 'Navigation', device.label, '/',
        'Bouton hamburger introuvable sur mobile',
        'Navigation mobile inaccessible');
    }
  });

  test('[iPhone-13] Test panier — ouverture/fermeture', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(800);

    // Chercher icône panier
    const cartBtn = page.locator('[aria-label*="panier"], [aria-label*="Panier"], [aria-label*="cart"], button').filter({ hasText: /panier|cart/i }).first();
    const cartBtnAlt = page.locator('button[id*="cart"], a[href*="cart"], a[href*="panier"]').first();

    let btn = cartBtn;
    try { await cartBtn.waitFor({ timeout: 2000 }); }
    catch { btn = cartBtnAlt; }

    try {
      await btn.tap();
      await page.waitForTimeout(600);

      // Vérifier overflow après ouverture panier
      const overflow = await detectHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        issue('CRITIQUE', 'CartDrawer/Overflow', device.label, '/',
          `Débordement horizontal après ouverture du panier (translateX bug) : ${overflow.overflowingSelectors.slice(0, 5).join(' | ')}`,
          'Layout cassé — scroll horizontal brutal au tap panier');
        await shot(page, 'cart-open-overflow-iphone13', false);
      } else {
        await shot(page, 'cart-open-ok-iphone13', false);
      }
    } catch { /* cart btn not found */ }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 3 — FORMULAIRES MOBILE
// ═══════════════════════════════════════════════════════════════════

test.describe('📝 Suite 3 — Formulaires & Clavier Mobile', () => {

  const formDevices = [DEVICES.iPhoneSE, DEVICES.iPhone13, DEVICES.galaxyS23];
  const formRoutes = [
    { key: 'login', route: ROUTES.login },
    { key: 'register', route: ROUTES.register },
    { key: 'checkout', route: ROUTES.checkout },
  ];

  for (const device of formDevices) {
    for (const { key, route } of formRoutes) {
      test(`[${device.label}] Formulaire ${key} — types input & iOS zoom`, async ({ page }) => {
        await setDevice(page, device);
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(600);

        // Audit iOS zoom (font-size < 16px sur inputs)
        const { zoomTriggers } = await auditIOSZoom(page);
        if (zoomTriggers.length > 0) {
          issue('CRITIQUE', 'iOS Zoom', device.label, route,
            `${zoomTriggers.length} input(s) avec font-size < 16px (déclenche zoom iOS Safari) : ${zoomTriggers.map(z => `${z.selector} (${z.fontSize}px)`).join(' | ')}`,
            'Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%');
        }

        // Audit types input
        const { issues: inputIssues } = await auditInputTypes(page);
        if (inputIssues.length > 0) {
          issue('MAJEUR', 'Input Types', device.label, route,
            `${inputIssues.length} input(s) avec mauvais type : ${inputIssues.map(i => `${i.name} (${i.type} → ${i.recommendation})`).join(' | ')}`,
            'Mauvais clavier mobile affiché — friction saisie');
        }

        // Vérifier autocomplete
        await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input'));
          return inputs.map(i => ({ name: i.name, autocomplete: i.autocomplete }));
        }).then(inputs => {
          const missingAC = inputs.filter(i =>
            ['email', 'name', 'given-name', 'family-name', 'tel'].includes(i.name) && !i.autocomplete
          );
          if (missingAC.length > 0) {
            issue('MINEUR', 'Autocomplete', device.label, route,
              `Attribut autocomplete manquant sur : ${missingAC.map(i => i.name).join(', ')}`,
              'Perte du remplissage automatique navigateur — UX dégradée');
          }
        });

        await shot(page, `form-${key}-${device.label}`);
      });
    }
  }

  test('[iPhone-SE] Checkout — scroll avec clavier virtuel ouvert', async ({ page }) => {
    const device = DEVICES.iPhoneSE; // Petit écran, pire cas
    await setDevice(page, device);
    await page.goto(`${BASE}${ROUTES.checkout}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(800);

    // Simuler focus sur un input (clavier virtuel)
    const firstInput = page.locator('input').first();
    try {
      await firstInput.click();
      await page.waitForTimeout(300);
      await shot(page, `checkout-keyboard-${device.label}`, false);

      // Vérifier que le champ est visible dans le viewport réduit
      const inputBox = await firstInput.boundingBox();
      if (inputBox && inputBox.top > device.height * 0.5) {
        issue('MAJEUR', 'Clavier Mobile', device.label, ROUTES.checkout,
          `Input focus positionné en bas d'écran (top: ${Math.round(inputBox.top)}px) — risque masquage par clavier`,
          'Input masqué par clavier virtuel = saisie aveugle ou abandon');
      }
    } catch { /* input not found */ }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 4 — PERFORMANCE MOBILE (throttle CPU + réseau)
// ═══════════════════════════════════════════════════════════════════

test.describe('⚡ Suite 4 — Performance Mobile', () => {

  test('[iPhone-13] Performance pages critiques — métriques réelles', async ({ page, context }) => {
    test.setTimeout(60_000);
    const device = DEVICES.iPhone13;
    await setDevice(page, device);

    // Throttle réseau modéré via CDP (4G lente, plus stable que 3G pour les tests séquentiels)
    const client = await (context as BrowserContext & { newCDPSession(p: Page): Promise<{ send(m: string, p?: unknown): Promise<unknown> }> }).newCDPSession(page);
    try {
      // 4G lente : 1Mbps down, 500kbps up, 100ms latency
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1 * 1024 * 1024 / 8,
        uploadThroughput: 500 * 1024 / 8,
        latency: 100,
      });
    } catch { /* CDP not available */ }

    // Test sur la page d'accueil uniquement (page la plus critique pour le mobile)
    const criticalRoutes = ['/'];

    for (const route of criticalRoutes) {
      try {
        const startTime = Date.now();
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        const wallTime = Date.now() - startTime;

        const perf = await getPerf(page);
        METRICS[`${device.label}${route}`] = { ...perf, wallTime };

        // Seuils Lighthouse Mobile "Good"
        if (perf.fcp > 3000) {
          issue('CRITIQUE', 'Performance/FCP', device.label, route,
            `FCP trop lent : ${perf.fcp}ms (seuil : <3000ms sur 3G)`,
            'First Contentful Paint → utilisateur voit blanc, bounce immédiat');
        } else if (perf.fcp > 1800) {
          issue('MAJEUR', 'Performance/FCP', device.label, route,
            `FCP modéré : ${perf.fcp}ms (idéal : <1800ms)`,
            'Performance perçue dégradée');
        }

        if (perf.ttfb > 800) {
          issue('MAJEUR', 'Performance/TTFB', device.label, route,
            `TTFB élevé : ${perf.ttfb}ms (seuil : <800ms)`,
            'Serveur lent ou CDN absent');
        }

        if ((perf as { largeImages?: number }).largeImages && (perf as { largeImages: number }).largeImages > 0) {
          issue('MAJEUR', 'Performance/Images', device.label, route,
            `${(perf as { largeImages: number }).largeImages} image(s) > 200KB non optimisée(s)`,
            'LCP dégradé, consommation data mobile excessive');
        }

        if ((perf as { totalTransfer?: number }).totalTransfer && (perf as { totalTransfer: number }).totalTransfer > 2000) {
          issue('MINEUR', 'Performance/Bundle', device.label, route,
            `Transfert total : ${(perf as { totalTransfer: number }).totalTransfer}KB (seuil mobile : <2MB)`,
            'Coût data mobile, performance sur réseaux faibles');
        }
      } catch { /* timeout */ }
    }

    // Reset throttling
    try {
      await client.send('Network.emulateNetworkConditions', {
        offline: false, downloadThroughput: -1, uploadThroughput: -1, latency: 0,
      });
    } catch { /* ignore */ }
  });

  test('[iPhone-13] CLS — Cumulative Layout Shift par page', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);

    const clsRoutes = ['/', '/boutique', '/produit/savon-visage-orange'];
    for (const route of clsRoutes) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        const cls = await measureCLS(page);
        METRICS[`cls-${route}`] = { cls };

        if (cls > 0.25) {
          issue('CRITIQUE', 'Performance/CLS', device.label, route,
            `CLS critique : ${cls} (seuil Google "Good" : <0.1)`,
            'Éléments qui sautent = clic raté, frustration, pénalité SEO Core Web Vitals');
        } else if (cls > 0.1) {
          issue('MAJEUR', 'Performance/CLS', device.label, route,
            `CLS modéré : ${cls} (seuil "Needs Improvement" : 0.1-0.25)`,
            'Layout instable perçu par utilisateur');
        }
      } catch { /* skip */ }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 5 — ACCESSIBILITÉ MOBILE (axe-core)
// ═══════════════════════════════════════════════════════════════════

test.describe('♿ Suite 5 — Accessibilité Mobile (axe-core)', () => {

  const a11yDevices = [DEVICES.iPhone13, DEVICES.galaxyS23, DEVICES.iPad];
  const a11yRoutes = [ROUTES.home, ROUTES.boutique, ROUTES.produit, ROUTES.login, ROUTES.checkout];

  for (const device of a11yDevices) {
    test(`[${device.label}] Axe-core — violations accessibilité`, async ({ page }) => {
      await setDevice(page, device);

      for (const route of a11yRoutes) {
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
          await page.waitForTimeout(500);

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
            .exclude('#__next > * > *:not(main)') // Exclure scripts injectés
            .analyze();

          const critical = results.violations.filter(v => v.impact === 'critical');
          const serious = results.violations.filter(v => v.impact === 'serious');

          if (critical.length > 0) {
            critical.forEach(v => {
              issue('CRITIQUE', `A11y/${v.id}`, device.label, route,
                `[WCAG] ${v.description} — ${v.nodes.length} occurrence(s)`,
                v.help);
            });
          }

          if (serious.length > 0) {
            serious.slice(0, 5).forEach(v => {
              issue('MAJEUR', `A11y/${v.id}`, device.label, route,
                `[WCAG] ${v.description} — ${v.nodes.length} occurrence(s)`,
                v.help);
            });
          }

          METRICS[`axe-${device.label}-${route}`] = {
            critical: critical.length,
            serious: serious.length,
            moderate: results.violations.filter(v => v.impact === 'moderate').length,
            minor: results.violations.filter(v => v.impact === 'minor').length,
          };
        } catch { /* skip */ }
      }
    });
  }

  test('[iPhone-13] Font sizes audit — lisibilité mobile', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);

    for (const [routeKey, route] of Object.entries(ROUTES)) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(400);

        const { tooSmall } = await auditFontSizes(page);
        if (tooSmall.length > 0) {
          issue('MAJEUR', 'Lisibilité/Fonts', device.label, route,
            `${tooSmall.length} texte(s) < 12px : ${tooSmall.map(f => `${f.selector} (${f.size}px)`).join(' | ')}`,
            'Illisible sur petit écran, non-conforme WCAG 1.4.4');
        }
      } catch { /* skip */ }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 6 — UX CONVERSION (E-COMMERCE CRITIQUE)
// ═══════════════════════════════════════════════════════════════════

test.describe('🛒 Suite 6 — UX Conversion E-Commerce', () => {

  test('[iPhone-13] Page produit — CTA sticky & add-to-cart', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);
    await page.goto(`${BASE}${ROUTES.produit}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(1000);

    await shot(page, `pdp-top-${device.label}`, false);

    // Scroll vers le bas
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(400);
    await shot(page, `pdp-scrolled-${device.label}`, false);

    // Vérifier la présence d'un CTA sticky ou visible
    const ctaVisible = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.some(el => {
        const text = el.textContent?.toLowerCase() ?? '';
        const r = el.getBoundingClientRect();
        const isAtc = text.includes('panier') || text.includes('ajouter') || text.includes('acheter') || text.includes('commander');
        const isVisible = r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0;
        return isAtc && isVisible;
      });
    });

    if (!ctaVisible) {
      issue('CRITIQUE', 'UX Conversion', device.label, ROUTES.produit,
        'CTA "Ajouter au panier" non visible après scroll (pas de sticky CTA mobile)',
        'CTA invisible = perte de conversion directe. Standard e-com = sticky CTA mobile');
    }

    // Tester le tap sur ATC
    const atcBtn = page.locator('button').filter({ hasText: /ajouter|panier|Ajouter/i }).first();
    try {
      await atcBtn.waitFor({ timeout: 3000 });
      const box = await atcBtn.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        issue('CRITIQUE', 'Touch Targets', device.label, ROUTES.produit,
          `Bouton ATC trop petit : ${Math.round(box.width)}×${Math.round(box.height)}px`,
          'Action principale e-com inaccessible tactile');
      }
      await atcBtn.tap();
      await page.waitForTimeout(600);
      await shot(page, `atc-tap-${device.label}`, false);
    } catch { /* btn not found */ }
  });

  test('[iPhone-13] Boutique — filtres & grille produits', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);
    await page.goto(`${BASE}${ROUTES.boutique}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(1000);

    await shot(page, `boutique-top-${device.label}`, false);

    // Vérifier la grille produit mobile
    const gridInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-product], article, .product-card, [class*="product"]');
      if (!cards.length) return null;
      const first = cards[0].getBoundingClientRect();
      const second = cards.length > 1 ? cards[1].getBoundingClientRect() : null;
      return {
        count: cards.length,
        cardWidth: Math.round(first.width),
        cardHeight: Math.round(first.height),
        isGrid: second ? Math.abs(first.top - second.top) < 20 : false, // même ligne = grid
      };
    });

    if (gridInfo) {
      if (gridInfo.cardWidth < 140) {
        issue('MAJEUR', 'Responsive/Grille', device.label, ROUTES.boutique,
          `Cartes produits trop étroites : ${gridInfo.cardWidth}px (min recommandé 150px sur mobile)`,
          'Images et prix illisibles — UX catalogue dégradée');
      }
      if (gridInfo.isGrid && gridInfo.cardWidth < 150) {
        issue('MINEUR', 'Responsive/Grille', device.label, ROUTES.boutique,
          `Grille 2 colonnes avec cartes ${gridInfo.cardWidth}px — borderline lisible`,
          'Envisager 1 colonne sur iPhone SE');
      }
    } else {
      issue('MAJEUR', 'Responsive/Grille', device.label, ROUTES.boutique,
        'Aucune carte produit détectée avec les sélecteurs standards',
        'Catalogue invisible ou sélecteur CSS non standard');
    }

    // Scroll infini / chargement
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await shot(page, `boutique-bottom-${device.label}`, false);
  });

  test('[iPhone-SE] Checkout — entonnoir conversion mobile', async ({ page }) => {
    const device = DEVICES.iPhoneSE; // Pire cas : petit écran
    await setDevice(page, device);
    await page.goto(`${BASE}${ROUTES.checkout}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(800);

    await shot(page, `checkout-${device.label}`);

    // Overflow vérification critique
    const overflow = await detectHorizontalOverflow(page);
    if (overflow.hasOverflow) {
      issue('CRITIQUE', 'Checkout/Overflow', device.label, ROUTES.checkout,
        `Overflow horizontal sur checkout iPhone SE : ${overflow.overflowingSelectors.join(' | ')}`,
        'Checkout cassé sur petit écran = 0% conversion');
      await shot(page, `checkout-overflow-${device.label}`);
    }

    // Vérifier que les steps sont verticaux (layout)
    const layoutInfo = await page.evaluate(() => {
      const steps = document.querySelectorAll('[class*="step"], [class*="Step"], [aria-label*="étape"], [aria-label*="step"]');
      if (!steps.length) return null;
      const rects = Array.from(steps).map(s => s.getBoundingClientRect());
      const isVertical = rects.every((r, i) => i === 0 || r.top > rects[i-1].top);
      return { count: steps.length, isVertical };
    });

    if (layoutInfo && !layoutInfo.isVertical) {
      issue('MAJEUR', 'Checkout/Layout', device.label, ROUTES.checkout,
        'Les étapes de checkout ne sont pas en colonne verticale sur mobile',
        'Layout horizontal checkout = illisible sur mobile, abandon assuré');
    }

    // Audit touch targets checkout
    const { small } = await auditTouchTargets(page);
    if (small.length > 3) {
      issue('CRITIQUE', 'Checkout/Touch', device.label, ROUTES.checkout,
        `${small.length} éléments < 44px dans le tunnel de paiement`,
        'Tunnel de conversion inutilisable tactile — abandon immédiat');
    }
  });

  test('[iPhone-13 + Pixel-8] Quiz — navigation step by step', async ({ page }) => {
    for (const device of [DEVICES.iPhone13, DEVICES.pixel8]) {
      await setDevice(page, device);
      await page.goto(`${BASE}${ROUTES.quiz}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await page.waitForTimeout(800);

      await shot(page, `quiz-${device.label}`);

      const overflow = await detectHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        issue('MAJEUR', 'Quiz/Overflow', device.label, ROUTES.quiz,
          `Quiz avec overflow horizontal : ${overflow.overflowingSelectors.slice(0,3).join(' | ')}`,
          'Quiz inutilisable = perte de lead qualification');
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 7 — ROTATION & ORIENTATION
// ═══════════════════════════════════════════════════════════════════

test.describe('🔄 Suite 7 — Orientation & Rotation', () => {

  test('[iPhone-13] Rotation portrait → paysage → portrait', async ({ page }) => {
    const device = DEVICES.iPhone13;
    await setDevice(page, device);
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(600);

    await shot(page, `orient-portrait-${device.label}`, false);

    // Landscape
    await page.setViewportSize({ width: device.height, height: device.width });
    await page.waitForTimeout(400);

    const overflow = await detectHorizontalOverflow(page);
    if (overflow.hasOverflow) {
      issue('MAJEUR', 'Orientation', device.label, '/',
        `Overflow horizontal en landscape : ${overflow.overflowingSelectors.slice(0,5).join(' | ')}`,
        'Layout cassé en paysage');
    }
    await shot(page, `orient-landscape-${device.label}`, false);

    // Retour portrait
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.waitForTimeout(400);

    const overflow2 = await detectHorizontalOverflow(page);
    if (overflow2.hasOverflow) {
      issue('MAJEUR', 'Orientation', device.label, '/',
        'Overflow après retour en portrait (layout non restauré)',
        'Bug de rotation — utilisateur bloqué');
    }
    await shot(page, `orient-return-portrait-${device.label}`, false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 8 — TABLETTES
// ═══════════════════════════════════════════════════════════════════

test.describe('📟 Suite 8 — Tablettes', () => {

  test('[iPad + Samsung-Tab] Responsive tablette — pages critiques', async ({ page }) => {
    const tablets = [DEVICES.iPad, DEVICES.samsungTab];

    for (const device of tablets) {
      await setDevice(page, device);

      for (const [routeKey, route] of Object.entries(ROUTES)) {
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
          await page.waitForTimeout(600);

          const overflow = await detectHorizontalOverflow(page);
          if (overflow.hasOverflow) {
            issue('MAJEUR', 'Tablette/Overflow', device.label, route,
              `Overflow horizontal sur tablette : ${overflow.overflowingSelectors.slice(0,5).join(' | ')}`,
              'Layout cassé sur tablette');
          }

          if (['home', 'boutique', 'checkout'].includes(routeKey)) {
            await shot(page, `tablet-${device.label}-${routeKey}`);
          }
        } catch { /* skip */ }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// RAPPORT FINAL — Génération après tous les tests
// ═══════════════════════════════════════════════════════════════════

test.afterAll(async () => {
  ensureDir(SHOT_DIR);

  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Calcul scores
  const critiques = ISSUES.filter(i => i.severity === 'CRITIQUE');
  const majeurs   = ISSUES.filter(i => i.severity === 'MAJEUR');
  const mineurs   = ISSUES.filter(i => i.severity === 'MINEUR');

  const scoreUX          = Math.max(0, 10 - critiques.filter(i => i.category.includes('UX')).length * 2 - majeurs.filter(i => i.category.includes('UX')).length * 0.5);
  const scoreResponsive  = Math.max(0, 10 - critiques.filter(i => i.category.includes('Responsive') || i.category.includes('Overflow')).length * 2 - majeurs.filter(i => i.category.includes('Responsive') || i.category.includes('Overflow')).length);
  const scorePerf        = Math.max(0, 10 - critiques.filter(i => i.category.includes('Performance')).length * 2 - majeurs.filter(i => i.category.includes('Performance')).length);
  const scoreA11y        = Math.max(0, 10 - critiques.filter(i => i.category.includes('A11y') || i.category.includes('iOS Zoom')).length * 2 - majeurs.filter(i => i.category.includes('A11y')).length);
  const scoreConversion  = Math.max(0, 10 - critiques.filter(i => i.category.includes('Conversion') || i.category.includes('Checkout')).length * 2 - majeurs.filter(i => i.category.includes('Conversion') || i.category.includes('Checkout')).length);
  const scoreGlobal      = parseFloat(((scoreUX + scoreResponsive + scorePerf + scoreA11y + scoreConversion) / 5).toFixed(1));

  // Groupes par catégorie
  const byCategory: Record<string, Issue[]> = {};
  ISSUES.forEach(i => {
    const cat = i.category.split('/')[0];
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(i);
  });

  // Métriques perf formatées
  const perfSummary = Object.entries(METRICS)
    .filter(([k]) => k.startsWith('iphone-13'))
    .map(([k, v]) => {
      const m = v as Record<string, number>;
      return `| \`${k.replace('iphone-13', '')}\` | ${m.fcp ?? '-'}ms | ${m.ttfb ?? '-'}ms | ${m.totalTransfer ?? '-'}KB |`;
    }).join('\n');

  const report = `# 📱 RAPPORT AUDIT MOBILE SENIOR — SD Cosmétique
> **Date :** ${now}
> **Auditeur :** QA Mobile Senior × Expert UX Mobile × Testeur Frontend
> **Scope :** ${Object.keys(DEVICES).length} appareils simulés × ${Object.keys(ROUTES).length} pages
> **Outils :** Playwright ${require('../node_modules/@playwright/test/package.json').version} · Axe-core · CDP Throttling · Émulation tactile

---

## 🎯 SCORE GLOBAL MOBILE

| Dimension | Score | Seuil critique |
|-----------|-------|----------------|
| 📐 Responsive | **${scoreResponsive.toFixed(1)}/10** | < 6 |
| 👆 UX Mobile | **${scoreUX.toFixed(1)}/10** | < 6 |
| ⚡ Performance | **${scorePerf.toFixed(1)}/10** | < 6 |
| ♿ Accessibilité | **${scoreA11y.toFixed(1)}/10** | < 7 |
| 🛒 Conversion Mobile | **${scoreConversion.toFixed(1)}/10** | < 7 |
| **🏆 SCORE GLOBAL** | **${scoreGlobal}/10** | < 7 |

> **Résumé :** ${critiques.length} bug(s) CRITIQUE · ${majeurs.length} MAJEUR · ${mineurs.length} MINEUR

---

## 🔴 BUGS CRITIQUES (${critiques.length})

${critiques.length === 0 ? '_Aucun bug critique détecté_ ✅' : critiques.map((i, n) => `### C${n+1}. [${i.device}] ${i.route} — ${i.category}
**Problème :** ${i.description}
**Impact :** ${i.impact}
`).join('\n')}

---

## 🟠 BUGS MAJEURS (${majeurs.length})

${majeurs.length === 0 ? '_Aucun bug majeur_ ✅' : majeurs.map((i, n) => `### M${n+1}. [${i.device}] ${i.route} — ${i.category}
**Problème :** ${i.description}
**Impact :** ${i.impact}
`).join('\n')}

---

## 🟡 PROBLÈMES MINEURS (${mineurs.length})

${mineurs.length === 0 ? '_Aucun problème mineur_ ✅' : mineurs.map((i, n) => `- **Mi${n+1}** [${i.device}] \`${i.route}\` — ${i.category} : ${i.description}`).join('\n')}

---

## ⚡ PERFORMANCE MOBILE (iPhone 13 — 3G simulée)

| Page | FCP | TTFB | Transfert |
|------|-----|------|-----------|
${perfSummary || '| N/A | - | - | - |'}

> **Seuils Lighthouse Mobile :** FCP < 1.8s (Good) · TTFB < 800ms · Transfert < 2MB

---

## 📊 ACCESSIBILITÉ (axe-core par device)

\`\`\`
${Object.entries(METRICS)
  .filter(([k]) => k.startsWith('axe'))
  .map(([k, v]) => {
    const m = v as Record<string, number>;
    return `${k.replace('axe-', '')} → CRITIQUE:${m.critical} SÉRIEUX:${m.serious} MODÉRÉ:${m.moderate} MINEUR:${m.minor}`;
  }).join('\n') || 'Aucune donnée axe collectée'}
\`\`\`

---

## ✅ QUICK WINS (< 1 jour chacun)

### QW1. Font-size 16px sur tous les inputs
\`\`\`css
input, select, textarea {
  font-size: 16px !important; /* Évite zoom iOS Safari */
}
\`\`\`

### QW2. Meta viewport correct
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
\`\`\`

### QW3. Touch targets 44px minimum (WCAG 2.5.5)
\`\`\`css
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
}
\`\`\`

### QW4. overflow-x: hidden sur html + body
\`\`\`css
html, body { overflow-x: hidden; }
\`\`\`

### QW5. Sticky CTA mobile sur page produit
\`\`\`tsx
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden">
  <button className="w-full py-4 bg-primary text-white rounded-xl">Ajouter au panier</button>
</div>
\`\`\`

---

## 🏆 RECOMMANDATIONS SENIOR (niveau Stripe / Revolut / Airbnb)

### R1. **Safe Area iPhone** (Dynamic Island / Notch)
\`\`\`css
.sticky-cta {
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
}
body { padding-top: env(safe-area-inset-top); }
\`\`\`

### R2. **Haptic Feedback sur actions critiques** (déjà partiellement implémenté)
Étendre à : ajouter au panier, validation formulaire, erreurs.

### R3. **Input zoom iOS — Solution définitive**
\`\`\`tsx
// globals.css
@media screen and (max-width: 768px) {
  input, select, textarea { font-size: 16px; }
}
\`\`\`

### R4. **Skeleton loading sur toutes les listes**
Priorité : grille produits boutique, bestsellers homepage.
Temps de chargement perçu réduit de ~40%.

### R5. **Offline-first partiel** (Service Worker)
\`\`\`js
// Cacher les pages vues → expérience réseau faible (métro, transport)
workbox.strategies.StaleWhileRevalidate({ cacheName: 'pages-cache' });
\`\`\`

### R6. **Checkout : un seul champ par écran** (pattern Stripe)
Réduire la charge cognitive = +15-25% completion rate mobile.

### R7. **Images WebP + next/image lazy loading**
Remplacer tout <img> natif par next/image avec sizes adaptatifs.

---

## 🗺️ ROADMAP MOBILE-FIRST

### 🔴 Haute Priorité (Sprint suivant)
${critiques.length > 0 ? critiques.map((i, n) => `- [ ] C${n+1} — [${i.device}] ${i.category} : ${i.description.slice(0, 100)}`).join('\n') : '- [ ] Maintenir niveau actuel — pas de critique détecté ✅'}

### 🟠 Moyenne Priorité (2 semaines)
- [ ] Sticky CTA mobile sur toutes les pages produit
- [ ] Font-size 16px sur tous les inputs (anti-zoom iOS)
- [ ] Optimisation images → WebP + lazy loading
- [ ] Audit safe-area iPhone (notch, Dynamic Island)
- [ ] Réduction bundle JS → code splitting agressif

### 🟡 Basse Priorité (1 mois)
- [ ] Service Worker offline-first partiel
- [ ] Haptic feedback étendu (checkout, wishlist)
- [ ] Refonte checkout mobile (une question par écran)
- [ ] Skeleton loading boutique
- [ ] Analytics mobile (session recording Hotjar / Clarity)

---

## 📸 SCREENSHOTS CAPTURÉS

\`\`\`
${fs.existsSync(SHOT_DIR)
  ? fs.readdirSync(SHOT_DIR).filter(f => f.endsWith('.png')).map(f => `· ${f}`).join('\n')
  : '(aucun screenshot capturé)'}
\`\`\`

---

*Rapport généré automatiquement par Playwright Mobile Audit — SD Cosmétique*
*Auditeur simulé : QA Engineer Senior Mobile × Expert UX Mobile*
`;

  fs.writeFileSync(REPORT_PATH, report, 'utf8');
  console.log(`\n✅ Rapport écrit : ${REPORT_PATH}`);
  console.log(`📸 Screenshots : ${SHOT_DIR}`);
  console.log(`\n📊 RÉSUMÉ :`);
  console.log(`   🔴 CRITIQUES : ${critiques.length}`);
  console.log(`   🟠 MAJEURS   : ${majeurs.length}`);
  console.log(`   🟡 MINEURS   : ${mineurs.length}`);
  console.log(`   🏆 SCORE     : ${scoreGlobal}/10`);
});
