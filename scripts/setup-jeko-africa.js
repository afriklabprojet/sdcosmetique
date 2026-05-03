#!/usr/bin/env node

/**
 * Configuration des clés Jeko Africa
 * Usage: node scripts/setup-jeko-africa.js
 */

import { readFileSync } from 'node:fs';

console.log('🇨🇮 Configuration Jeko Africa - Paiements Mobile Money');
console.log('='.repeat(60));

// Vérification des clés actuelles
function loadEnvironmentConfig() {
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    const env = {};
    
    for (const line of envLines) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        env[key] = valueParts.join('=');
      }
    }
    return env;
  } catch (err) {
    console.error('❌ Impossible de lire .env.local:', err.message);
    process.exit(1);
  }
}

const env = loadEnvironmentConfig();

const jekoKeys = {
  JEKO_API_KEY: env.JEKO_API_KEY || '',
  JEKO_API_KEY_ID: env.JEKO_API_KEY_ID || '',
  JEKO_WEBHOOK_SECRET: env.JEKO_WEBHOOK_SECRET || '',
  JEKO_STORE_ID: env.JEKO_STORE_ID || '',
};

console.log('📋 État actuel des clés Jeko :');
for (const [key, value] of Object.entries(jekoKeys)) {
  const status = value ? '✅ Configuré' : '❌ Manquant';
  const display = value ? `${value.substring(0, 8)}...` : 'vide';
  console.log(`   ${key}: ${status} (${display})`);
}

const missingKeys = Object.entries(jekoKeys).filter(([, value]) => !value);

if (missingKeys.length === 0) {
  console.log('\n🎉 Toutes les clés Jeko sont configurées !');
  console.log('👉 Testez un paiement : npm run dev + checkout');
} else {
  console.log(`\n⚠️  ${missingKeys.length} clés manquantes`);
  console.log('\n📋 GUIDE DE CONFIGURATION :');
  console.log('   1. Créer un compte marchand : https://jeko.africa');
  console.log('   2. Se connecter au cockpit : https://cockpit.jeko.africa');
  console.log('   3. Paramètres > API & Webhooks');
  console.log('   4. Copier les valeurs suivantes :');
  
  missingKeys.forEach(([key]) => {
    const description = {
      'JEKO_API_KEY': 'Clé API principale',
      'JEKO_API_KEY_ID': 'Identifiant de la clé API',
      'JEKO_WEBHOOK_SECRET': 'Secret pour sécuriser les webhooks',
      'JEKO_STORE_ID': 'Identifiant de votre boutique'
    }[key] || key;
    
    console.log(`      ${key}=${description}`);
  });
  
  console.log('\n📝 Une fois configuré dans .env.local :');
  console.log('   - Redémarrer le serveur (npm run dev)');
  console.log('   - Tester un paiement sur /checkout');
}

// Test de connectivité si clés présentes
async function testJekoConnection() {
  if (!env.JEKO_API_KEY || !env.JEKO_API_KEY_ID) {
    return;
  }

  console.log('\n🔗 Test de connectivité Jeko Africa...');
  
  try {
    const response = await fetch('https://api.jeko.africa/stores', {
      headers: {
        'X-API-KEY': env.JEKO_API_KEY,
        'X-API-KEY-ID': env.JEKO_API_KEY_ID,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Erreur API (${response.status}): ${error}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Connexion Jeko OK !');
    console.log(`📊 ${data.length || 0} boutique(s) trouvée(s)`);
    
    if (data.length > 0) {
      console.log(`💼 Boutique active: ${data[0].name || data[0].id}`);
    }
  } catch (err) {
    console.log('❌ Erreur réseau:', err.message);
  }
}

// Génération d'un exemple de transaction de test
function generateTestOrder() {
  console.log('\n🧪 Exemple de test paiement :');
  console.log('1. Aller sur http://localhost:3000/checkout');
  console.log('2. Ajouter des produits au panier');
  console.log('3. Choisir "Orange Money" ou "Wave"');
  console.log('4. Entrer un numéro de test : +225 07 00 00 00 00');
  console.log('5. Cliquer "Payer maintenant"');
  console.log('6. Vous serez redirigé vers Jeko pour finaliser');
  console.log('');
  console.log('💡 En mode sandbox, les paiements ne sont pas débités.');
}

testJekoConnection().then(() => {
  generateTestOrder();
});