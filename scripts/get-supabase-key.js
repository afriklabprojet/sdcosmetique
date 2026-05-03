#!/usr/bin/env node

/**
 * Récupération automatique de la clé ANON Supabase
 * Usage: node scripts/get-supabase-key.js
 */

import { readFileSync, writeFileSync } from 'node:fs';

// Parse .env.local
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

const env = loadEnvironmentConfig();   console.error('❌ Impossible de lire .env.local:', err.message);
    process.exit(1);
  }
}

const env = loadEnvironmentConfig();

const accessToken = env.SUPABASE_ACCESS_TOKEN;
const projectRef = env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];

if (!accessToken || !projectRef) {
  console.error('❌ Token ou URL Supabase manquant');
  process.exit(1);
}

console.log('🔐 Récupération de la clé ANON Supabase...');
console.log(`Projet: ${projectRef}`);

async function getAnonKey() {
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Erreur API (${response.status}):`, error);
      return null;
    }

    const data = await response.json();
    const anonKey = data.find(key => key.name === 'anon')?.api_key;
    
    if (!anonKey) {
      console.error('❌ Clé ANON non trouvée dans la réponse');
      return null;
    }

    return anonKey;
  } catch (err) {
    console.error('❌ Erreur réseau:', err.message);
    return null;
  }
}

async function updateEnvFile(newAnonKey) {
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const updatedContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}`
    );
    
    writeFileSync('.env.local', updatedContent);
    console.log('✅ Fichier .env.local mis à jour !');
    return true;
  } catch (err) {
    console.error('❌ Erreur écriture fichier:', err.message);
    return false;
  }
}

// Main
getAnonKey().then(async anonKey => {
  if (anonKey) {
    console.log('✅ Clé ANON récupérée !');
    console.log(`Clé: ${anonKey.substring(0, 20)}...`);
    
    const updated = await updateEnvFile(anonKey);
    if (updated) {
      console.log('\n🎉 Configuration Supabase corrigée !');
      console.log('Redémarrez votre serveur de dev (npm run dev)');
    }
  } else {
    console.log('\n❌ Récupération automatique échouée');
    console.log('📋 Action manuelle requise :');
    console.log('   1. Ouvrir https://supabase.com/dashboard');
    console.log('   2. Projet > Settings > API');
    console.log('   3. Copier "anon public" key');
    console.log('   4. Remplacer dans .env.local');
  }
});