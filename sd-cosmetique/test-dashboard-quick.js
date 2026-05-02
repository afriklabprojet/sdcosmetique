const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🎯 Test rapide du Dashboard Admin Senior...');
  
  try {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Utiliser le chemin fichier local au lieu de HTTP
    const filePath = path.join(__dirname, 'public', 'admin-dashboard-senior.html');
    const fileUrl = `file://${filePath}`;
    
    console.log('⏳ Chargement du dashboard depuis:', fileUrl);
    await page.goto(fileUrl);
    
    console.log('✅ Page chargée, vérification des éléments...');
    
    // Vérifier le titre
    const title = await page.title();
    console.log(`📄 Titre: ${title}`);
    
    // Vérifier le badge demo
    const demoVisible = await page.locator('.demo-badge').isVisible();
    console.log(`🎯 Badge demo visible: ${demoVisible}`);
    
    // Vérifier la sidebar
    const sidebarVisible = await page.locator('.sidebar').isVisible();
    console.log(`📱 Sidebar visible: ${sidebarVisible}`);
    
    // Vérifier les stats cards
    const statsCount = await page.locator('.stat-card').count();
    console.log(`📊 Nombre de cartes statistiques: ${statsCount}`);
    
    // Vérifier la navigation
    const activeNav = await page.locator('.nav-item.active').textContent();
    console.log(`🧭 Navigation active: ${activeNav}`);
    
    // Vérifier les KPIs
    if (statsCount > 0) {
      const firstRevenue = await page.locator('.stat-card').first().locator('.stat-value').textContent();
      console.log(`💰 Premier KPI (CA): ${firstRevenue}`);
    }
    
    // Prendre une capture d'écran
    await page.screenshot({ path: 'dashboard-test-screenshot.png' });
    console.log('📸 Capture d\'écran sauvegardée: dashboard-test-screenshot.png');
    
    await browser.close();
    
    console.log('✅ Test rapide terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
})();
