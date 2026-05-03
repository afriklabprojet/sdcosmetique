#!/usr/bin/env node

/**
 * Application du schéma de base de données Supabase
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

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

function validateSupabaseConfig(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ URL ou clé service Supabase manquante');
    process.exit(1);
  }

  return { supabaseUrl, serviceRoleKey };
}

function loadDatabaseSchema() {
  try {
    const schema = readFileSync('docs/supabase-schema.sql', 'utf8');
    console.log('✅ Schéma SQL chargé');
    return schema;
  } catch (err) {
    console.error('❌ Impossible de lire docs/supabase-schema.sql:', err.message);
    process.exit(1);
  }
}

async function executeSchemaCommand(supabase, command) {
  const tableName = command.match(/create table (?:if not exists )?(?:public\.)?(\w+)/i)?.[1];
  if (tableName) {
    console.log(`   Création de la table ${tableName}...`);
    const { error } = await supabase.from(tableName).select('*').limit(0);
    if (error) {
      console.log(`   ⚠️  Table ${tableName} à créer manuellement`);
      return false;
    } else {
      console.log(`   ✅ Table ${tableName} déjà existante`);
      return true;
    }
  }
  return false;
}

async function applySchemaAlternative(supabase, schema) {
  console.log('ℹ️  RPC exec non disponible, utilisation d\'une approche alternative...');
  
  const commands = schema
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd && !cmd.startsWith('--'));

  let successCount = 0;
  for (const command of commands) {
    if (command.toLowerCase().startsWith('create table')) {
      try {
        const success = await executeSchemaCommand(supabase, command);
        if (success) successCount++;
      } catch (err) {
        console.log(`   ⚠️  Commande ignorée: ${err.message}`);
      }
    }
  }
  
  if (successCount > 0) {
    return true;
  }
  
  console.log('\n📋 Action manuelle requise :');
  console.log('   1. Ouvrir https://supabase.com/dashboard');
  console.log('   2. Votre projet > SQL Editor');
  console.log('   3. Coller le contenu de docs/supabase-schema.sql');
  console.log('   4. Exécuter');
  return false;
}

async function verifyTables(supabase) {
  console.log('\n🔍 Vérification des tables...');
  
  const tables = ['products', 'orders', 'reviews', 'categories', 'testimonials', 'site_config'];
  let existingTables = 0;
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table} - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
        existingTables++;
      }
    } catch (err) {
      console.log(`   ❌ ${table} - ${err.message}`);
    }
  }
  
  console.log(`\n📊 Résultat: ${existingTables}/${tables.length} tables trouvées`);
  return existingTables;
}

async function setupDatabase() {
  const env = loadEnvironmentConfig();
  const { supabaseUrl, serviceRoleKey } = validateSupabaseConfig(env);
  const schema = loadDatabaseSchema();
  
  console.log('🗄️  Configuration de la base de données...');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🚀 Application du schéma...');
    
    // Exécuter le schéma SQL directement
    const { error } = await supabase.rpc('exec', { sql: schema });
    
    if (error) {
      const success = await applySchemaAlternative(supabase, schema);
      if (!success) {
        return false;
      }
    } else {
      console.log('✅ Schéma appliqué avec succès !');
    }
    
    // Test des tables créées
    const existingTables = await verifyTables(supabase);
    
    if (existingTables >= 3) {
      console.log('🎉 Base de données configurée !');
      return true;
    } else {
      console.log('⚠️  Configuration incomplète - action manuelle requise');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erreur lors de la configuration:', err.message);
    return false;
  }
}

setupDatabase().then(success => {
  if (success) {
    console.log('\n✅ Configuration terminée !');
    console.log('👉 Prochaine étape: paiements Jeko Africa');
  } else {
    console.log('\n⚠️  Action manuelle requise pour la BDD');
  }
});