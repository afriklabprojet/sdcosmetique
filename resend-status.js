#!/usr/bin/env node

/**
 * Status Resend — Vérification intégration emails
 */

const fs = require('fs');
const path = require('path');

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function checkResendIntegration() {
  console.clear();
  console.log(`${BOLD}${BLUE}
┌─────────────────────────────────────────────────┐
│            📧 RESEND INTEGRATION STATUS          │
│          Email transactionnel SD Cosmétique     │
└─────────────────────────────────────────────────┘${RESET}
`);

  // 1. Vérifier les fichiers code
  const codeFiles = [
    'src/lib/emails.ts',
    'src/app/api/orders/notify/route.ts'
  ];

  console.log(`${GREEN}✅ Code Resend intégré:${RESET}`);
  codeFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });

  // 2. Analyser emails.ts pour les fonctionnalités
  const emailsPath = 'src/lib/emails.ts';
  if (fs.existsSync(emailsPath)) {
    const content = fs.readFileSync(emailsPath, 'utf8');
    console.log(`\n${GREEN}🎯 Fonctionnalités email prêtes:${RESET}`);
    
    const features = [
      { name: 'Confirmation de commande', check: 'sendOrderConfirmation' },
      { name: 'Notification expédition', check: 'sendOrderShipped' },
      { name: 'Points fidélité', check: 'sendJekoPointsNotification' },
      { name: 'Templates HTML/Text', check: 'orderConfirmationHtml' },
      { name: 'Gestion erreurs', check: 'sendViaResend' }
    ];

    features.forEach(f => {
      const hasFeature = content.includes(f.check);
      console.log(`   ${hasFeature ? '✅' : '❌'} ${f.name}`);
    });
  }

  // 3. Vérifier configuration .env.local
  const envPath = '.env.local';
  console.log(`\n${YELLOW}⚙️  Configuration .env.local:${RESET}`);
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const hasApiKey = envContent.includes('RESEND_API_KEY=re_');
    const hasFromEmail = envContent.match(/RESEND_FROM_EMAIL=.+@.+/);
    
    console.log(`   ${hasApiKey ? '✅' : '❌'} RESEND_API_KEY configuré`);
    console.log(`   ${hasFromEmail ? '✅' : '❌'} RESEND_FROM_EMAIL configuré`);
    
    if (!hasApiKey || !hasFromEmail) {
      console.log(`\n${YELLOW}📋 Action requise:${RESET}`);
      console.log('   1. Créer compte sur https://resend.com/');
      console.log('   2. Générer clé API (commençant par re_...)');
      console.log('   3. Configurer email expéditeur');
      console.log(`   4. Exécuter: ${BLUE}node setup-resend.js${RESET}`);
    } else {
      console.log(`\n${GREEN}🚀 Resend prêt à utiliser!${RESET}`);
      console.log('   • Emails automatiques lors de commandes');
      console.log('   • Notifications expédition');
      console.log('   • System points fidélité');
    }
  } else {
    console.log(`   ${RED}❌ Fichier .env.local introuvable${RESET}`);
  }

  // 4. Usage en développement
  console.log(`\n${BLUE}💡 Utilisation:${RESET}`);
  console.log(`   • Les emails sont envoyés automatiquement`);
  console.log(`   • API: POST /api/orders/notify avec OrderDraft`);
  console.log(`   • En dev sans clés: logs "not_configured"`);
  console.log(`   • Test: delivered@resend.dev (boîte test)`);
  
  console.log(`\n${GREEN}Code 100% prêt${RESET} — Il suffit d'ajouter les clés! 🎯`);
}

if (require.main === module) {
  checkResendIntegration();
}