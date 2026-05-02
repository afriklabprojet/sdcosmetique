# SD Cosmetique Admin - Design System & UX Guidelines

> **Design System professionnel** pour l'interface administrateur SD Cosmetique  
> **Standard** : Enterprise-grade UX/UI pour applications e-commerce  
> **Version** : 2.0 (Mai 2026)

---

## 🎯 **Vision & Principes UX**

### Philosophie Design
- **Efficacité** : Workflows rapides, 3-clics maximum pour actions courantes
- **Scalabilité** : Architecture modulaire supportant croissance business
- **Consistance** : Pattern library uniforme sur toutes les vues
- **Accessibilité** : WCAG 2.1 AA compliance, navigation clavier
- **Performance** : Load time < 2s, 60fps interactions

### Persona Principal
**Marie, Responsable E-commerce (32 ans)**
- Gère 50-200 produits quotidiennement  
- Utilise mobile 40% du temps
- Priorité : rapidité, fiabilité, données actionables
- Pain points : interfaces lentes, workflows complexes

---

## 🎨 **Système Visuel Complet**

### Palette Couleurs (Sémantique)

```scss
// === COULEURS PRIMAIRES ===
$gold-primary: #D4A25A;           // Actions principales, CTAs
$gold-light: #E5B366;            // Hover states, highlights  
$gold-dark: #C8974A;             // Active states, focus
$gold-ultra-light: #F7EFE5;      // Backgrounds clairs

// === COULEURS NEUTRES ===
$dark-primary: #0D0906;          // Backgrounds principaux
$dark-secondary: #14100C;        // Cards, modals
$dark-tertiary: #1C1610;         // Hover states
$border-primary: #2E2218;        // Séparateurs, borders
$border-secondary: #3D2E1A;      // Interactive borders

// === COULEURS TEXTE ===
$text-primary: #F7EFE5;          // Headings, labels
$text-secondary: #E8DDD0;        // Body text
$text-tertiary: #A8957E;         // Descriptions
$text-disabled: #6B5840;         // Placeholders, disabled

// === COULEURS STATUT ===
$success: #10B981;               // Actions réussies, validations
$success-bg: #064E3B;            // Backgrounds success
$warning: #FCD34D;               // Alertes, actions requises
$warning-bg: #2A200A;            // Backgrounds warning
$error: #F87171;                 // Erreurs, suppressions
$error-bg: #7F1D1D;             // Backgrounds error
$info: #60A5FA;                  // Informations, tips
$info-bg: #1E3A8A;              // Backgrounds info
```

### Typographie & Hiérarchie

```scss
// === FONT STACK ===
$font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

// === SCALES TYPOGRAPHIQUES ===
$heading-xxl: 28px;    // Page titles (h1)
$heading-xl: 22px;     // Section titles (h2)  
$heading-lg: 18px;     // Subsection titles (h3)
$heading-md: 16px;     // Card titles (h4)
$heading-sm: 14px;     // Labels, small headings (h5)

$body-lg: 15px;        // Important text, descriptions
$body-md: 13px;        // Default body text  
$body-sm: 12px;        // Secondary text, captions
$body-xs: 11px;        // Labels, badges, metadata
$body-xxs: 10px;       // Fine print, timestamps

// === FONT WEIGHTS ===
$weight-light: 300;
$weight-regular: 400;
$weight-medium: 500;
$weight-semibold: 600;
$weight-bold: 700;
$weight-extrabold: 800;
```

### Spacing System (8px Grid)

```scss
// === SPACING SCALE ===
$space-xxs: 4px;      // Micro spacing
$space-xs: 8px;       // Small gaps  
$space-sm: 12px;      // Medium gaps
$space-md: 16px;      // Default spacing
$space-lg: 20px;      // Large spacing
$space-xl: 24px;      // Section spacing
$space-xxl: 32px;     // Page spacing
$space-xxxl: 40px;    // Hero spacing

// === COMPONENT SPACING ===
$padding-tight: 8px 12px;        // Buttons, chips
$padding-default: 12px 16px;     // Cards, inputs
$padding-comfortable: 16px 20px; // Modals, sections
$padding-spacious: 24px 28px;    // Page containers
```

### Shadows & Elevation

```scss
// === SHADOW SYSTEM ===
$shadow-1: 0 1px 3px rgba(0,0,0,0.12);           // Subtle
$shadow-2: 0 2px 8px rgba(0,0,0,0.15);           // Cards
$shadow-3: 0 4px 12px rgba(0,0,0,0.18);          // Dropdowns  
$shadow-4: 0 8px 24px rgba(0,0,0,0.25);          // Modals
$shadow-5: 0 12px 32px rgba(0,0,0,0.35);         // Overlays

// === COLORED SHADOWS ===
$shadow-gold: 0 4px 12px rgba(212,162,90,0.25);  // Premium elements
$shadow-success: 0 4px 12px rgba(16,185,129,0.25);
$shadow-warning: 0 4px 12px rgba(252,211,77,0.25);
```

### Border Radius System

```scss
// === RADIUS SCALE ===
$radius-xs: 4px;      // Badges, chips
$radius-sm: 6px;      // Buttons, inputs
$radius-md: 8px;      // Cards, containers
$radius-lg: 12px;     // Modals, large cards
$radius-xl: 16px;     // Hero sections
$radius-round: 50%;   // Avatars, dots
$radius-pill: 999px;  // Pills, tags
```

---

## 📐 **Layout & Grid System**

### Breakpoints (Mobile-First)

```scss
// === RESPONSIVE BREAKPOINTS ===
$mobile: 480px;       // Phones
$tablet: 768px;       // Tablets  
$desktop: 1024px;     // Small desktop
$desktop-lg: 1280px;  // Large desktop
$desktop-xl: 1440px;  // Extra large
$desktop-xxl: 1920px; // 4K displays

// === CONTAINER WIDTHS ===
$container-sm: 640px;
$container-md: 768px;
$container-lg: 1024px;
$container-xl: 1280px;
```

### Admin Layout Structure

```scss
// === LAYOUT DIMENSIONS ===
$sidebar-width: 260px;           // Navigation sidebar
$sidebar-collapsed: 72px;        // Collapsed state
$topbar-height: 56px;            // Header bar
$footer-height: 48px;            // Optional footer

// === CONTENT SPACING ===
$content-padding: 24px 32px;     // Main content area
$section-gap: 32px;              // Between sections
$card-gap: 16px;                 // Between cards
```

---

## 🧩 **Composants UI - Spécifications**

### Buttons (Système Complet)

```scss
// === PRIMARY BUTTON ===
.btn-primary {
  background: linear-gradient(135deg, $gold-primary, $gold-light);
  color: $dark-primary;
  border: none;
  border-radius: $radius-sm;
  padding: $padding-tight;
  font-weight: $weight-semibold;
  font-size: $body-sm;
  transition: all 0.2s ease;
  box-shadow: $shadow-2;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-3;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// === SECONDARY BUTTON ===
.btn-secondary {
  background: transparent;
  color: $text-secondary;
  border: 1px solid $border-primary;
  border-radius: $radius-sm;
  padding: $padding-tight;
  
  &:hover {
    border-color: $gold-primary;
    color: $gold-primary;
  }
}

// === DANGER BUTTON ===
.btn-danger {
  background: $error;
  color: white;
  
  &:hover {
    background: darken($error, 10%);
  }
}

// === BUTTON SIZES ===
.btn-sm { padding: 6px 12px; font-size: $body-xs; }
.btn-md { padding: 8px 16px; font-size: $body-sm; }  
.btn-lg { padding: 12px 24px; font-size: $body-md; }
```

### Form Controls

```scss
// === INPUT FIELDS ===
.input {
  background: $dark-secondary;
  border: 1px solid $border-primary;
  border-radius: $radius-sm;
  padding: 12px 16px;
  color: $text-primary;
  font-size: $body-md;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: $gold-primary;
    box-shadow: 0 0 0 3px rgba(212,162,90,0.1);
    outline: none;
  }
  
  &::placeholder {
    color: $text-disabled;
  }
  
  &:disabled {
    background: $dark-primary;
    color: $text-disabled;
  }
}

// === SELECT DROPDOWN ===
.select {
  position: relative;
  
  select {
    appearance: none;
    background-image: url("data:image/svg+xml...");
    background-position: right 12px center;
    background-repeat: no-repeat;
    padding-right: 40px;
  }
}

// === CHECKBOX/RADIO ===
.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid $border-primary;
  border-radius: $radius-xs;
  
  &:checked {
    background: $gold-primary;
    border-color: $gold-primary;
  }
}
```

### Cards & Containers

```scss
// === BASE CARD ===
.card {
  background: $dark-secondary;
  border: 1px solid $border-primary;
  border-radius: $radius-md;
  padding: $padding-default;
  box-shadow: $shadow-1;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $border-secondary;
    box-shadow: $shadow-2;
  }
}

// === CARD VARIANTS ===
.card-elevated {
  box-shadow: $shadow-3;
}

.card-premium {
  border: 1px solid rgba($gold-primary, 0.3);
  box-shadow: $shadow-gold;
}

.card-interactive {
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-3;
  }
}
```

### Navigation Components

```scss
// === SIDEBAR NAVIGATION ===
.sidebar-nav {
  width: $sidebar-width;
  background: $dark-secondary;
  border-right: 1px solid $border-primary;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: $text-secondary;
    text-decoration: none;
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
    
    &:hover {
      background: $dark-tertiary;
      color: $text-primary;
    }
    
    &.active {
      background: $dark-tertiary;
      border-left-color: $gold-primary;
      color: $gold-primary;
    }
  }
  
  .nav-icon {
    width: 20px;
    text-align: center;
    font-size: 16px;
  }
  
  .nav-label {
    font-weight: $weight-medium;
    font-size: $body-sm;
  }
  
  .nav-badge {
    margin-left: auto;
    background: $warning;
    color: $dark-primary;
    padding: 2px 6px;
    border-radius: $radius-pill;
    font-size: $body-xxs;
    font-weight: $weight-bold;
  }
}

// === BREADCRUMBS ===
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $body-sm;
  color: $text-tertiary;
  
  .breadcrumb-item {
    &:not(:last-child)::after {
      content: '/';
      margin-left: 8px;
      color: $text-disabled;
    }
    
    &:last-child {
      color: $gold-primary;
    }
  }
}
```

---

## 🎪 **Patterns & Templates**

### Dashboard Layout Pattern

```html
<!-- === STRUCTURE RECOMMANDÉE === -->
<div class="admin-layout">
  <!-- Sidebar Navigation -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="/logo.svg" alt="SD Cosmetique" class="logo" />
      <h2 class="brand-name">SD Cosmetique</h2>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Principal</div>
        <a href="/admin" class="nav-item active">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Dashboard</span>
        </a>
        <a href="/admin/produits" class="nav-item">
          <span class="nav-icon">📦</span>
          <span class="nav-label">Produits</span>
          <span class="nav-badge">24</span>
        </a>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">Gestion</div>
        <a href="/admin/commandes" class="nav-item">
          <span class="nav-icon">🛒</span>
          <span class="nav-label">Commandes</span>
          <span class="nav-badge">12</span>
        </a>
        <a href="/admin/clients" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-label">Clients</span>
        </a>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">AD</div>
        <div class="user-info">
          <div class="user-name">Admin</div>
          <div class="user-status">En ligne</div>
        </div>
      </div>
    </div>
  </aside>
  
  <!-- Main Content -->
  <main class="main-content">
    <!-- Topbar -->
    <header class="topbar">
      <div class="breadcrumbs">
        <span class="breadcrumb-item">Admin</span>
        <span class="breadcrumb-item">Dashboard</span>
      </div>
      
      <div class="topbar-actions">
        <button class="btn-secondary btn-sm">
          <span class="icon">⚙️</span>
          Paramètres
        </button>
        <button class="btn-primary btn-sm">
          <span class="icon">💾</span>
          Sauvegarder
        </button>
      </div>
    </header>
    
    <!-- Content Area -->
    <div class="content-area">
      <div class="page-header">
        <div class="page-icon">📊</div>
        <div class="page-info">
          <h1 class="page-title">Dashboard Principal</h1>
          <p class="page-description">Vue d'ensemble de votre boutique cosmétique</p>
        </div>
      </div>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon success">💰</div>
          <div class="stat-content">
            <div class="stat-value">€12,450</div>
            <div class="stat-label">Ventes du mois</div>
            <div class="stat-trend positive">+15.3%</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon warning">📦</div>
          <div class="stat-content">
            <div class="stat-value">847</div>
            <div class="stat-label">Produits actifs</div>
            <div class="stat-trend neutral">3 en rupture</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon info">🛒</div>
          <div class="stat-content">
            <div class="stat-value">156</div>
            <div class="stat-label">Commandes</div>
            <div class="stat-trend positive">+8.2%</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon primary">👥</div>
          <div class="stat-content">
            <div class="stat-value">2,341</div>
            <div class="stat-label">Clients actifs</div>
            <div class="stat-trend positive">+12.7%</div>
          </div>
        </div>
      </div>
      
      <!-- Action Cards Grid -->
      <div class="action-cards-grid">
        <div class="action-card">
          <div class="card-header">
            <h3 class="card-title">Gestion Produits</h3>
            <div class="card-badge success">24 actifs</div>
          </div>
          <div class="card-content">
            <p class="card-description">Gérez votre catalogue de produits cosmétiques</p>
            <div class="card-actions">
              <button class="btn-secondary btn-sm">Voir tous</button>
              <button class="btn-primary btn-sm">Ajouter produit</button>
            </div>
          </div>
        </div>
        
        <div class="action-card">
          <div class="card-header">
            <h3 class="card-title">Commandes Récentes</h3>
            <div class="card-badge warning">12 nouvelles</div>
          </div>
          <div class="card-content">
            <p class="card-description">Traitez les dernières commandes clients</p>
            <div class="card-actions">
              <button class="btn-secondary btn-sm">Historique</button>
              <button class="btn-primary btn-sm">Traiter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## 📊 **States & Interactions**

### Loading States

```scss
// === SKELETON LOADING ===
.skeleton {
  background: linear-gradient(90deg, 
    $dark-tertiary 25%, 
    lighten($dark-tertiary, 5%) 50%, 
    $dark-tertiary 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// === SPINNER ===
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid $border-primary;
  border-top: 2px solid $gold-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Error States

```scss
// === ERROR MESSAGE ===
.error-message {
  background: $error-bg;
  color: $error;
  border: 1px solid rgba($error, 0.3);
  border-radius: $radius-sm;
  padding: 12px 16px;
  font-size: $body-sm;
  
  .error-icon {
    margin-right: 8px;
  }
}

// === SUCCESS MESSAGE ===
.success-message {
  background: $success-bg;
  color: $success;
  border: 1px solid rgba($success, 0.3);
  border-radius: $radius-sm;
  padding: 12px 16px;
  font-size: $body-sm;
}
```

---

## 🚀 **Performance & Optimisation**

### CSS Guidelines

```scss
// === PERFORMANCE OPTIMIZATIONS ===

// 1. Use CSS Custom Properties for theming
:root {
  --color-primary: #{$gold-primary};
  --color-bg: #{$dark-primary};
  --spacing-md: #{$space-md};
}

// 2. Hardware acceleration for animations
.animated {
  will-change: transform;
  transform: translateZ(0);
}

// 3. Efficient transitions
.transition-fast { transition: all 0.15s ease; }
.transition-medium { transition: all 0.2s ease; }
.transition-slow { transition: all 0.3s ease; }

// 4. Critical CSS inlining
.above-fold {
  /* Styles for above-the-fold content */
}
```

### JavaScript Performance

```javascript
// === PERFORMANCE BEST PRACTICES ===

// 1. Debounced search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 2. Virtual scrolling for large lists
const VirtualList = {
  itemHeight: 60,
  containerHeight: 400,
  visibleItems: Math.ceil(400 / 60),
  // Implementation...
};

// 3. Lazy loading
const lazyLoad = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Load content
    }
  });
});
```

---

## ♿ **Accessibilité (WCAG 2.1 AA)**

### Contraste & Couleurs

```scss
// === CONTRAST RATIOS ===
// Tous les ratios respectent WCAG AA (4.5:1 minimum)

$text-on-dark: #F7EFE5;      // Ratio: 14.8:1 ✅
$text-secondary: #E8DDD0;    // Ratio: 12.1:1 ✅  
$text-tertiary: #A8957E;     // Ratio: 5.2:1 ✅
$gold-on-dark: #D4A25A;      // Ratio: 6.8:1 ✅

// === FOCUS STATES ===
.focusable {
  &:focus-visible {
    outline: 2px solid $gold-primary;
    outline-offset: 2px;
    border-radius: $radius-xs;
  }
}
```

### Navigation Clavier

```javascript
// === KEYBOARD NAVIGATION ===
const KeyboardNavigation = {
  // Tab order management
  setupTabIndex() {
    const focusableElements = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    document.querySelectorAll(focusableElements)
      .forEach((el, index) => {
        el.tabIndex = index + 1;
      });
  },
  
  // Arrow key navigation for lists
  handleArrowKeys(event, items) {
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex;
    
    switch(event.key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      default:
        return;
    }
    
    items[nextIndex].focus();
    event.preventDefault();
  }
};
```

### Screen Reader Support

```html
<!-- === ARIA LABELS === -->
<nav aria-label="Navigation principale">
  <ul role="menu">
    <li role="menuitem">
      <a href="/admin" aria-current="page">Dashboard</a>
    </li>
    <li role="menuitem">
      <a href="/admin/produits">
        Produits
        <span aria-label="24 produits actifs" class="sr-only">24 produits</span>
      </a>
    </li>
  </ul>
</nav>

<!-- === LIVE REGIONS === -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status">
  <!-- Status updates for screen readers -->
</div>

<!-- === FORM ACCESSIBILITY === -->
<div class="field">
  <label for="product-name" class="required">
    Nom du produit
    <span aria-label="requis" class="required-indicator">*</span>
  </label>
  <input 
    type="text" 
    id="product-name"
    aria-describedby="product-name-help product-name-error"
    aria-invalid="false"
  />
  <div id="product-name-help" class="field-help">
    Saisissez le nom commercial du produit
  </div>
  <div id="product-name-error" class="field-error" aria-live="polite">
    <!-- Error messages -->
  </div>
</div>
```

---

## 📱 **Responsive Design**

### Mobile-First Approach

```scss
// === MOBILE-FIRST BREAKPOINTS ===

// Base styles (mobile)
.dashboard-layout {
  display: block; // Stack vertically on mobile
}

.sidebar {
  width: 100%;
  height: auto;
  position: static;
}

.main-content {
  padding: 16px;
}

// Tablet (768px+)
@media (min-width: $tablet) {
  .dashboard-layout {
    display: flex;
  }
  
  .sidebar {
    width: $sidebar-collapsed; // Narrow sidebar
    position: fixed;
    height: 100vh;
  }
  
  .main-content {
    margin-left: $sidebar-collapsed;
    padding: 20px;
  }
}

// Desktop (1024px+)  
@media (min-width: $desktop) {
  .sidebar {
    width: $sidebar-width; // Full sidebar
  }
  
  .main-content {
    margin-left: $sidebar-width;
    padding: 24px 32px;
  }
}

// Large desktop (1440px+)
@media (min-width: $desktop-xl) {
  .main-content {
    max-width: 1200px;
    margin-left: calc($sidebar-width + 2rem);
    padding: 32px 40px;
  }
}
```

### Touch-Friendly Design

```scss
// === TOUCH TARGET SIZES ===
// Minimum 44px touch targets (iOS/Android guidelines)

.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-mobile {
  @extend .touch-target;
  padding: 12px 16px;
  font-size: 16px; // Prevent zoom on iOS
}

// === TOUCH GESTURES ===
.swipeable {
  touch-action: pan-y; // Allow vertical scroll, prevent horizontal
}

.scrollable {
  -webkit-overflow-scrolling: touch; // Smooth iOS scrolling
  overscroll-behavior: contain; // Prevent scroll chaining
}
```

---

## 🧪 **Testing & Quality Assurance**

### Visual Regression Testing

```javascript
// === PERCY/CHROMATIC SETUP ===
const visualTests = [
  'Dashboard - Desktop',
  'Dashboard - Mobile',  
  'Produits - List View',
  'Produits - Grid View',
  'Commandes - Detail View',
  'Modal - Add Product',
  'Form - Error States',
  'Loading - Skeleton States'
];

// Run visual tests
visualTests.forEach(test => {
  it(`Visual: ${test}`, () => {
    cy.visit(test.url);
    cy.percySnapshot(test);
  });
});
```

### Accessibility Testing

```javascript
// === AXE-CORE INTEGRATION ===
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.injectAxe();
  });
  
  it('Should have no a11y violations', () => {
    cy.checkA11y();
  });
  
  it('Should be keyboard navigable', () => {
    cy.get('body').tab();
    cy.focused().should('have.class', 'nav-item');
  });
  
  it('Should announce content changes', () => {
    cy.get('[aria-live]').should('exist');
  });
});
```

### Performance Metrics

```javascript
// === CORE WEB VITALS ===
const performanceThresholds = {
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  FID: 100,   // First Input Delay < 100ms  
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  FCP: 1800,  // First Contentful Paint < 1.8s
  TTI: 3800   // Time to Interactive < 3.8s
};

// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/admin'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.8}]
      }
    }
  }
};
```

---

## 🎯 **Checklist de Livraison**

### ✅ **Design System**
- [ ] Palette couleurs définie et documentée
- [ ] Typography scale établie  
- [ ] Spacing system (8px grid) appliqué
- [ ] Component library complète
- [ ] States & interactions définies
- [ ] Dark theme supporté

### ✅ **UX/UI** 
- [ ] User flows documentés
- [ ] Wireframes validés
- [ ] Prototypes interactifs
- [ ] Design tokens exportés
- [ ] Guidelines de contenu
- [ ] Micro-interactions polies

### ✅ **Accessibilité**
- [ ] Contraste WCAG AA respecté
- [ ] Navigation clavier complète
- [ ] Screen readers supportés  
- [ ] Focus management implémenté
- [ ] ARIA labels appropriés
- [ ] Tests a11y automatisés

### ✅ **Performance**
- [ ] Core Web Vitals < seuils
- [ ] Lazy loading implémenté
- [ ] Code splitting activé
- [ ] Images optimisées
- [ ] CSS critical inline
- [ ] Bundle analysis < 250KB

### ✅ **Responsive**
- [ ] Mobile-first approach
- [ ] Touch targets 44px+
- [ ] Breakpoints cohérents
- [ ] Typography responsive
- [ ] Images adaptatives
- [ ] Test multi-device

### ✅ **Code Quality**
- [ ] TypeScript strict mode
- [ ] ESLint/Prettier configurés
- [ ] Tests unitaires > 80%
- [ ] E2E tests critiques
- [ ] Documentation à jour
- [ ] Performance monitoring

---

## 📚 **Ressources & Références**

### Standards & Guidelines
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/AA/)
- [Nielsen's Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)

### Tools & Libraries
- **Design**: Figma, Adobe XD, Sketch
- **Prototyping**: Framer, Principle, ProtoPie  
- **Code**: React, TypeScript, Tailwind CSS
- **Testing**: Jest, Cypress, Percy, axe-core
- **Performance**: Lighthouse, WebPageTest, GTmetrix

### Team Contacts
- **Lead Designer**: [Contact Design]
- **Frontend Architect**: [Contact Frontend]  
- **UX Researcher**: [Contact UX]
- **Accessibility Specialist**: [Contact A11y]

---

> **Dernière mise à jour** : Mai 2026  
> **Version** : 2.0  
> **Statut** : ✅ Production Ready
--bg-primary: #0D0906;      /* Noir riche - arrière-plan */
--bg-secondary: #14100C;    /* Brun foncé - surfaces */
--bg-tertiary: #1C1610;     /* Brun moyen - états hover */

/* Couleurs de texte */
--text-primary: #F7EFE5;    /* Blanc cassé - titres */
--text-secondary: #E8DDD0;  /* Beige clair - texte */
--text-muted: #A8957E;      /* Beige - texte secondaire */
--text-subtle: #6B5840;     /* Brun - labels */

/* Couleurs d'accent */
--accent-gold: #C8974A;     /* Or - éléments actifs */
--accent-light: #D4A25A;    /* Or clair - hover */
--success: #10B981;         /* Vert - succès */
--warning: #FCD34D;         /* Jaune - attention */

/* Bordures */
--border-subtle: #2E2218;   /* Bordure fine */
--border-accent: #3D2E1A;   /* Bordure accentuée */
```

### Typographie

```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-sizes: 10px | 11px | 12px | 13px | 14px | 16px | 18px | 22px;
--font-weights: 600 (medium) | 700 (bold) | 800 (extra-bold);
```

---

## 📋 4 Options de Dashboard Admin

### 🎯 Option 1: **Sidebar Navigation** _(Recommandée pour gestionnaires expérimentés)_

**🔍 Aperçu UX :**
- Navigation latérale fixe (210px)
- Organisation hiérarchique claire
- Accès rapide à toutes les sections
- Indicateurs de statut visuels (points colorés)

**✨ Avantages :**
- ✅ **Navigation efficace** : Toutes les sections visibles en permanence
- ✅ **Productivité élevée** : Changement de contexte rapide
- ✅ **Familiarité** : Pattern classique d'admin dashboard
- ✅ **Évolutivité** : Facile d'ajouter de nouvelles sections

**⚠️ Inconvénients :**
- ❌ **Espace écran** : Réduit la zone de contenu (surtout sur tablette)
- ❌ **Complexité visuelle** : Peut intimider les nouveaux utilisateurs

**🎨 Éléments visuels caractéristiques :**
```
┌─────────────┬──────────────────────────┐
│   SIDEBAR   │        CONTENU           │
│             │                          │
│ 🏠 Dashboard│ ┌──────────────────────┐ │
│ 📦 Produits │ │                      │ │
│ 🛒 Commandes│ │     Zone d'édition   │ │
│ 👥 Clients  │ │                      │ │
│ 📊 Marketing│ └──────────────────────┘ │
│ ⚙️ Config   │                          │
└─────────────┴──────────────────────────┘
```

**📱 Responsive :** Sidebar se transforme en menu burger sur mobile

**👤 Idéal pour :** Administrateurs quotidiens, équipes techniques, utilisateurs expérimentés

---

### 🎯 Option 2: **Interface Accordéon** _(Recommandée pour organisation par priorité)_

**🔍 Aperçu UX :**
- Sections empilées expandables
- Focus sur une section à la fois
- Aperçu du contenu dans l'en-tête
- Status badges et prévisualisation

**✨ Avantages :**
- ✅ **Concentration** : Une seule section ouverte = focus optimal
- ✅ **Aperçu rapide** : Status et contenu visible sans expansion
- ✅ **Mobile-first** : Excellent sur petit écran
- ✅ **Priorisation** : L'ordre guide naturellement le workflow

**⚠️ Inconvénients :**
- ❌ **Navigation séquentielle** : Plus lent pour jongler entre sections
- ❌ **Contexte limité** : Vue d'ensemble difficile

**🎨 Éléments visuels caractéristiques :**
```
┌────────────────────────────────────────┐
│ 📦 Produits         [●●●○] 24 items ▼│
├────────────────────────────────────────┤
│                                        │
│     Contenu expandé de la section      │
│                                        │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ 🛒 Commandes        [●●○○] 12 items ▶│
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ 👥 Clients          [●●●●] OK      ▶│
└────────────────────────────────────────┘
```

**📱 Responsive :** Naturellement mobile-friendly

**👤 Idéal pour :** Gestion par tâches, utilisateurs occasionnels, workflow organisé

---

### 🎯 Option 3: **Interface à Onglets** _(Recommandée pour polyvalence)_

**🔍 Aperçu UX :**
- Onglets horizontaux avec icônes
- Vue d'ensemble dans l'en-tête
- Indicateurs visuels de statut
- Contenu organisé par domaine

**✨ Avantages :**
- ✅ **Clarté cognitive** : Séparation nette des domaines
- ✅ **Flexibilité** : Bon équilibre navigation/contenu
- ✅ **Familiarité** : Pattern web standard
- ✅ **Indicateurs riches** : Dots, badges, états multiples

**⚠️ Inconvénients :**
- ❌ **Limite d'onglets** : Problème si trop de sections
- ❌ **Navigation horizontale** : Peut déborder sur petit écran

**🎨 Éléments visuels caractéristiques :**
```
┌─────┬─────┬─────┬─────┬─────┬─────────┐
│🏠 Acc│📦 Pro│🛒 Com│👥 Cli│📊 Mar│⚙️ Conf │
└─────┴─────┴─────┴─────┴─────┴─────────┘
┌──────────────────────────────────────────┐
│                                          │
│           Contenu de l'onglet            │
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Section   │  │   Section   │      │
│  │      A      │  │      B      │      │
│  └─────────────┘  └─────────────┘      │
└──────────────────────────────────────────┘
```

**📱 Responsive :** Onglets deviennent menu déroulant sur mobile

**👤 Idéal pour :** Usage mixte, équipes variées, polyvalence maximale

---

### 🎯 Option 4: **Interface Cartes/Wizard** _(Recommandée pour nouveaux utilisateurs)_

**🔍 Aperçu UX :**
- Cartes visuelles cliquables en grille
- Progression guidée étape par étape (mode wizard)
- Focus sur l'action plutôt que la navigation
- Onboarding naturel

**✨ Avantages :**
- ✅ **Accessibilité** : Interface intuitive pour débutants
- ✅ **Vision globale** : Statut de toutes les sections en un coup d'œil
- ✅ **Workflow guidé** : Progression naturelle
- ✅ **Engagement visuel** : Interface attrayante et moderne

**⚠️ Inconvénients :**
- ❌ **Efficacité réduite** : Plus de clics pour utilisateurs avancés
- ❌ **Espace requis** : Grille prend plus d'espace vertical

**🎨 Éléments visuels caractéristiques :**
```
┌─────────────┬─────────────┬─────────────┐
│    📦        │     🛒       │     👥      │
│  Produits   │  Commandes  │   Clients   │
│ [●●●○] 85%  │ [●●○○] 60%  │ [●●●●] 100% │
│  24 items   │  12 nouvelles│   Configuré │
└─────────────┴─────────────┴─────────────┘
┌─────────────┬─────────────┬─────────────┐
│    📊        │     ⚙️       │     📈      │
│  Marketing  │   Config    │  Analytics  │
│ [●○○○] 25%  │ [●●●●] 100% │ [●●○○] 70%  │
│  À configurer│   Terminé   │  En cours   │
└─────────────┴─────────────┴─────────────┘
```

**📱 Responsive :** Grille s'adapte (2 colonnes → 1 colonne)

**👤 Idéal pour :** Nouveaux utilisateurs, onboarding, utilisation sporadique

---

## 🎯 Recommandation par Profil

| Profil Utilisateur | Option Recommandée | Raison |
|-------------------|--------------------|--------|
| **Admin technique quotidien** | **Option 1 - Sidebar** | Maximum d'efficacité et productivité |
| **Gérant de boutique** | **Option 3 - Onglets** | Bon équilibre simplicité/fonctionnalité |
| **Utilisateur occasionnel** | **Option 4 - Cartes** | Interface la plus guidante |
| **Équipe mixte** | **Option 2 - Accordéon** | S'adapte aux différents niveaux |
| **Utilisation mobile** | **Option 2 - Accordéon** | Meilleure adaptation petit écran |

---

## 🚀 Phase d'Implémentation

### Étape 1 : Validation du Choix
- [ ] Sélection de l'option préférée
- [ ] Validation avec l'équipe utilisatrice
- [ ] Test rapide sur prototype cliquable

### Étape 2 : Développement
- [ ] Création des composants UI de base
- [ ] Intégration de la navigation choisie
- [ ] Tests responsive sur tous devices
- [ ] Validation accessibilité (WCAG 2.1)

### Étape 3 : Optimisation
- [ ] Tests utilisateurs réels
- [ ] Ajustements basés sur feedback
- [ ] Métriques d'usage et amélioration continue

---

## 💡 Notes Techniques

**Framework recommandé :** React + Next.js (déjà en place)
**Librairies UI :** Headless UI + Tailwind CSS (pour cohérence avec le frontend)
**État global :** Context API ou Zustand
**Animations :** Framer Motion (pour les transitions entre états)

**Performance cible :**
- First Contentful Paint < 1.5s
- Interaction to Next Paint < 200ms
- Cumulative Layout Shift < 0.1

---

**🎯 Prochaine étape :** Indiquez votre choix et nous procédons à l'implémentation !