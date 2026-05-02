#!/usr/bin/env node
/**
 * Test simple de l'interface Admin Sidebar (Option 1)
 * Valide que la nouvelle interface est correctement implémentée
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de l\'Interface Admin Sidebar - Option 1');
console.log('='.repeat(50));

const testResults = [];

function addResult(test, success, message) {
  const icon = success ? '✅' : '❌';
  const result = `${icon} ${test}: ${message}`;
  testResults.push({ test, success, message });
  console.log(result);
}

// Test 1: Vérifier que le fichier AdminDashboard.tsx existe
try {
  const adminPath = './src/app/admin/AdminDashboard.tsx';
  if (fs.existsSync(adminPath)) {
    addResult('Fichier AdminDashboard', true, 'Fichier trouvé');
    
    // Test 2: Vérifier le contenu de la sidebar
    const content = fs.readFileSync(adminPath, 'utf8');
    
    // Test 2.1: Design premium avec gradients
    if (content.includes('linear-gradient(180deg, #1a1410 0%, #141108 100%)')) {
      addResult('Design Premium', true, 'Gradient de fond implémenté');
    } else {
      addResult('Design Premium', false, 'Gradient de fond manquant');
    }
    
    // Test 2.2: Logo SD COSMETIQUE amélioré
    if (content.includes('SD COSMETIQUE') && content.includes('Administration')) {
      addResult('Branding', true, 'Logo et branding SD COSMETIQUE présents');
    } else {
      addResult('Branding', false, 'Branding manquant');
    }
    
    // Test 2.3: Sidebar élargie (260px)
    if (content.includes("width: '260px'")) {
      addResult('Largeur Sidebar', true, 'Sidebar élargie à 260px');
    } else {
      addResult('Largeur Sidebar', false, 'Largeur sidebar non mise à jour');
    }
    
    // Test 2.4: Indicateurs de statut
    if (content.includes('● PRINCIPAL') && content.includes('● CONTENU') && content.includes('● GESTION')) {
      addResult('Séparateurs', true, 'Séparateurs de sections avec puces');
    } else {
      addResult('Séparateurs', false, 'Séparateurs de sections manquants');
    }
    
    // Test 2.5: État actif avec gradients
    if (content.includes('rgba(212,162,90,0.18)') && content.includes('rgba(212,162,90,0.08)')) {
      addResult('États Actifs', true, 'Gradients pour états actifs implémentés');
    } else {
      addResult('États Actifs', false, 'Gradients pour états actifs manquants');
    }
    
    // Test 2.6: Badges de notification
    if (content.includes('ordersInProgress > 0') && content.includes('background: \'linear-gradient(135deg, #DC2626, #B91C1C)\'')) {
      addResult('Badges Notification', true, 'Badges avec gradients pour commandes');
    } else {
      addResult('Badges Notification', false, 'Badges de notification manquants');
    }
    
    // Test 2.7: Indicateurs premium
    if (content.includes('\'premium\'') && content.includes('\'important\'')) {
      addResult('Indicateurs Premium', true, 'Indicateurs de statut premium/important');
    } else {
      addResult('Indicateurs Premium', false, 'Indicateurs premium manquants');
    }
    
    // Test 2.8: Footer interactif
    if (content.includes('En ligne') && content.includes('title="Voir le site"') && content.includes('title="Déconnexion"')) {
      addResult('Footer Interactif', true, 'Footer avec statut et boutons d\'action');
    } else {
      addResult('Footer Interactif', false, 'Footer interactif manquant');
    }
    
    // Test 2.9: Transitions et animations
    if (content.includes('transition: \'all .2s ease\'') && content.includes('boxShadow:')) {
      addResult('Animations', true, 'Transitions et ombres implémentées');
    } else {
      addResult('Animations', false, 'Animations manquantes');
    }
    
    // Test 2.10: Marketing module présent
    if (content.includes('marketing') && content.includes('mktSubTab')) {
      addResult('Module Marketing', true, 'Module marketing intégré');
    } else {
      addResult('Module Marketing', false, 'Module marketing manquant');
    }
    
  } else {
    addResult('Fichier AdminDashboard', false, 'Fichier non trouvé');
  }
} catch (error) {
  addResult('Lecture Fichier', false, `Erreur: ${error.message}`);
}

// Test 3: Vérifier les fichiers de configuration
const configFiles = [
  './playwright.config.ts',
  './tests/admin-sidebar.spec.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addResult(`Config ${path.basename(file)}`, true, 'Fichier de test créé');
  } else {
    addResult(`Config ${path.basename(file)}`, false, 'Fichier de test manquant');
  }
});

// Résumé
console.log('\n📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(20));

const successCount = testResults.filter(r => r.success).length;
const totalCount = testResults.length;
const failureCount = totalCount - successCount;

console.log(`✅ Succès: ${successCount}/${totalCount}`);
console.log(`❌ Échecs: ${failureCount}/${totalCount}`);

if (failureCount === 0) {
  console.log('\n🎉 INTERFACE SIDEBAR OPTION 1 - IMPLÉMENTÉE AVEC SUCCÈS !');
  console.log('\n🚀 Fonctionnalités validées:');
  console.log('   • Design premium avec gradients sombres');
  console.log('   • Sidebar élargie (260px) avec branding SD COSMETIQUE');
  console.log('   • Indicateurs de statut intelligents avec badges');
  console.log('   • Navigation avec séparateurs de sections');
  console.log('   • États actifs avec gradients et ombres');
  console.log('   • Footer interactif avec statut et actions rapides');
  console.log('   • Animations et transitions fluides');
  console.log('   • Module Marketing intégré');
  
  console.log('\n🔗 Pour tester l\'interface:');
  console.log('   1. Démarrez le serveur: npm run dev');
  console.log('   2. Allez sur: http://localhost:3000/admin');
  console.log('   3. Connectez-vous pour voir la nouvelle sidebar');
  
  process.exit(0);
} else {
  console.log('\n🔧 Des corrections sont nécessaires:');
  testResults.filter(r => !r.success).forEach(r => {
    console.log(`   • ${r.test}: ${r.message}`);
  });
  
  process.exit(1);
}