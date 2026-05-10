/**
 * Script de création des comptes admin Supabase
 * Usage :
 *   1. Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *   2. npx tsx scripts/create-admin-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://spcguwuqqwvjfnfctrzs.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMINS = [
  { email: 'admin@sdcosmetique.ci', password: 'Admin@SD2026!' },
  { email: 'teya@sdcosmetique.ci',  password: 'Teya@SD2026!'  },
];

async function main() {
  for (const admin of ADMINS) {
    // Tenter de créer — si déjà existant, mettre à jour pour confirmer
    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        // Utilisateur déjà créé → chercher par email et confirmer
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users.find(u => u.email === admin.email);
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, { email_confirm: true });
          console.log(`✅  ${admin.email} — confirmé (existait déjà)`);
        }
      } else {
        console.error(`❌  ${admin.email} :`, error.message);
      }
    } else {
      console.log(`✅  ${admin.email} — créé & confirmé (id: ${data.user?.id})`);
    }
  }

  console.log('\n─────────────────────────────────');
  console.log('Identifiants admin :');
  for (const a of ADMINS) {
    console.log(`  Email    : ${a.email}`);
    console.log(`  Password : ${a.password}`);
    console.log('');
  }
}

main().catch(console.error);
