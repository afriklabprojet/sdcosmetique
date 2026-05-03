#!/usr/bin/env node

/**
 * Setup Resend — Configuration email transactionnel
 * Génère guide + test d'envoi + status
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function log(msg) {
  console.log(`${BLUE}[Resend]${RESET} ${msg}`);
}

function success(msg) {
  console.log(`${GREEN}✅ ${msg}${RESET}`);
}

function warn(msg) {
  console.log(`${YELLOW}⚠️  ${msg}${RESET}`);
}

function error(msg) {
  console.log(`${RED}❌ ${msg}${RESET}`);
}

async function main() {
  console.clear();
  console.log(`${BOLD}${BLUE}
┌─────────────────────────────────────────────────┐
│               📧 SETUP RESEND                   │
│          Email transactionnel Resend            │
└─────────────────────────────────────────────────┘${RESET}
`);

  // 1. Vérifier .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    error('Fichier .env.local introuvable');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasResendKey = envContent.includes('RESEND_API_KEY=re_');
  const hasFromEmail = envContent.includes('RESEND_FROM_EMAIL=') && 
                       !envContent.includes('RESEND_FROM_EMAIL=SD Cosmétique');

  log('📋 État actuel:');
  console.log(`   • Clé API Resend: ${hasResendKey ? '✅' : '❌'}`);
  console.log(`   • Email expéditeur: ${hasFromEmail ? '✅' : '❌'}`);
  console.log('');

  if (hasResendKey && hasFromEmail) {
    log('🎯 Configuration Resend complète, test en cours...');
    await testResendConnection();
    return;
  }

  // 2. Guide d'installation
  log('📖 Guide de configuration Resend:');
  console.log(`
${YELLOW}1. Créer un compte Resend${RESET}
   → Aller sur: https://resend.com/
   → Cliquer "Get Started" → Email + Mot de passe
   → Vérifier l'email de confirmation

${YELLOW}2. Créer une clé API${RESET}
   → Dashboard Resend → "API Keys" dans la sidebar
   → Cliquer "Create API Key" 
   → Name: SD Cosmétique (ou autre)
   → Permission: "Sending access" 
   → Domaines: Laisser vide pour commencer
   → Copier la clé commençant par "re_..."

${YELLOW}3. Configurer le domaine (recommandé)${RESET}
   → Dashboard → "Domains" → "Add Domain"
   → Entrer: sdcosmetique.ci (ou votre domaine)
   → Ajouter les enregistrements DNS donnés par Resend
   → Attendre validation (quelques minutes)
   
${YELLOW}4. Entrer les clés ci-dessous${RESET}
`);

  // 3. Saisie interactive des clés
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(resolve => rl.question(q, resolve));

  try {
    const apiKey = await question(`${BLUE}Clé API Resend (re_...)${RESET}: `);
    
    if (!apiKey.startsWith('re_')) {
      error('Clé API invalide (doit commencer par "re_")');
      process.exit(1);
    }

    const fromEmail = await question(`${BLUE}Email expéditeur (ex: contact@votre-domaine.com)${RESET}: `);
    
    if (!fromEmail.includes('@')) {
      error('Email invalide');
      process.exit(1);
    }

    // 4. Mise à jour .env.local
    let newContent = envContent
      .replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${apiKey}`)
      .replace(/RESEND_FROM_EMAIL=.*/, `RESEND_FROM_EMAIL=SD Cosmétique <${fromEmail}>`);

    fs.writeFileSync(envPath, newContent);
    success('Configuration sauvegardée dans .env.local');

    // 5. Test de connexion
    await testResendConnection(apiKey, `SD Cosmétique <${fromEmail}>`);

  } finally {
    rl.close();
  }
}

async function testResendConnection(apiKey, fromEmail) {
  log('🧪 Test de connexion Resend...');
  
  // Récupérer les clés depuis env si pas en paramètre
  if (!apiKey) {
    require('dotenv').config({ path: '.env.local' });
    apiKey = process.env.RESEND_API_KEY;
    fromEmail = process.env.RESEND_FROM_EMAIL;
  }

  if (!apiKey || !fromEmail) {
    warn('Clés Resend manquantes, skip test');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ['delivered@resend.dev'], // Email de test Resend
        subject: '🧪 Test SD Cosmétique',
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 500px;">
            <h2 style="color: #D4A24E;">✅ Test Resend réussi</h2>
            <p>L'integration Resend fonctionne parfaitement pour SD Cosmétique!</p>
            <ul>
              <li>✅ Confirmation de commande</li>
              <li>✅ Notification d'expédition</li>  
              <li>✅ Points fidélité</li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Email envoyé depuis ${fromEmail}
            </p>
          </div>
        `,
        text: 'Test Resend réussi pour SD Cosmétique! Integration email transactionnel opérationnelle.'
      })
    });

    if (response.ok) {
      const result = await response.json();
      success(`Email test envoyé! ID: ${result.id}`);
      console.log(`${GREEN}📧 Email visible dans delivered@resend.dev (boîte de test)${RESET}`);
      
      log('🎯 Fonctionnalités email actives:');
      console.log('   • Confirmation de commande automatique');
      console.log('   • Notification expédition');
      console.log('   • Notifications points fidélité');
      console.log('');
      success('🚀 Resend intégré et opérationnel!');
      
    } else {
      const errorText = await response.text();
      error(`Test échoué: ${response.status} ${errorText}`);
      
      if (response.status === 422) {
        warn('💡 Possibles solutions:');
        console.log('   • Vérifier que le domaine est validé dans Resend');
        console.log('   • Utiliser un email @resend.dev temporairement');
        console.log('   • Vérifier la clé API dans Resend dashboard');
      }
    }
    
  } catch (error) {
    error(`Erreur connexion: ${error.message}`);
  }
}

// Gestion Ctrl+C
process.on('SIGINT', () => {
  console.log(`\n${YELLOW}Configuration interrompue${RESET}`);
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}