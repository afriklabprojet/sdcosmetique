/**
 * Push les templates d'email personnalisés vers Supabase
 * 
 * Prérequis :
 * 1. Générer un Personal Access Token sur https://supabase.com/dashboard/account/tokens
 * 2. L'ajouter dans .env.local : SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx
 * 
 * Usage :
 *   npx tsx scripts/push-email-templates.ts
 */

import fs from 'fs';
import path from 'path';

// Lire .env.local manuellement sans dépendance dotenv
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const PROJECT_REF = 'spcguwuqqwvjfnfctrzs';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('\n❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local');
  console.error('   → Obtenez votre token sur : https://supabase.com/dashboard/account/tokens');
  console.error('   → Ajoutez dans .env.local : SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx\n');
  process.exit(1);
}

const templatesDir = path.resolve(process.cwd(), 'supabase/templates');

function readTemplate(filename: string): string {
  return fs.readFileSync(path.join(templatesDir, filename), 'utf-8');
}

async function pushTemplates() {
  console.log('\n📧 Push des templates email vers Supabase...\n');

  const confirmation = readTemplate('confirmation.html');
  const recovery = readTemplate('recovery.html');

  const payload = {
    // Sujets des emails
    mailer_subjects_confirmation: 'Confirmez votre inscription — SD Cosmetique',
    mailer_subjects_recovery: 'Réinitialisation de votre mot de passe — SD Cosmetique',
    mailer_subjects_invite: 'Vous êtes invité(e) sur SD Cosmetique',
    mailer_subjects_magic_link: 'Votre lien de connexion — SD Cosmetique',
    mailer_subjects_email_change: 'Confirmez votre nouvelle adresse email — SD Cosmetique',

    // URL de redirection après confirmation email
    // Supabase ajoute automatiquement token_hash et type en paramètre
    site_url: 'http://localhost:3000',
    uri_allow_list: 'http://localhost:3000/**,http://localhost:3001/**',

    // Contenu HTML des emails
    mailer_templates_confirmation_content: confirmation,
    mailer_templates_recovery_content: recovery,
    mailer_templates_invite_content: confirmation.replace(
      'Confirmez votre adresse email',
      'Vous êtes invité(e) à rejoindre SD Cosmetique'
    ).replace(
      'Confirmer mon email',
      'Accepter l\'invitation'
    ),
    mailer_templates_magic_link_content: confirmation.replace(
      'Confirmez votre adresse email',
      'Votre lien de connexion'
    ).replace(
      'Pour finaliser la création de votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.',
      'Cliquez sur le bouton ci-dessous pour vous connecter à votre compte SD Cosmetique.'
    ).replace(
      'Confirmer mon email',
      'Me connecter'
    ),
  };

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Erreur API (${response.status}):`, error);
    process.exit(1);
  }

  console.log('✅ Templates mis à jour avec succès !\n');
  console.log('Templates déployés :');
  console.log('  ✓ Confirmation d\'inscription');
  console.log('  ✓ Réinitialisation du mot de passe');
  console.log('  ✓ Invitation');
  console.log('  ✓ Magic link');
  console.log('\nSujets configurés :');
  console.log('  ✓ Confirmation : "Confirmez votre inscription — SD Cosmetique"');
  console.log('  ✓ Récupération : "Réinitialisation de votre mot de passe — SD Cosmetique"');
  console.log('\nVérifiez le résultat sur : https://supabase.com/dashboard/project/' + PROJECT_REF + '/auth/templates\n');
}

pushTemplates().catch(console.error);
