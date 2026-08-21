/**
 * Création / promotion des comptes administrateurs (MariaDB + Drizzle).
 *
 * Usage :
 *   pnpm setup:admin                                 # lit ADMIN_EMAILS et ADMIN_DEFAULT_PASSWORD
 *   pnpm setup:admin admin@sdcosmetique.ci 'MotDePasse!'
 *
 * Un compte existant est promu au rôle `admin` et son mot de passe est réinitialisé.
 */

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../src/shared/db';
import { users } from '../src/shared/db/schema';
import { hashPassword } from '../src/shared/auth/auth.service';

const [emailArg, passwordArg] = process.argv.slice(2);

const emails = (emailArg || process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const password = passwordArg || process.env.ADMIN_DEFAULT_PASSWORD;

if (!emails.length) {
  console.error('❌  Aucune adresse fournie — passe un email en argument ou définis ADMIN_EMAILS.');
  process.exit(1);
}

if (!password) {
  console.error('❌  Aucun mot de passe fourni — passe-le en argument ou définis ADMIN_DEFAULT_PASSWORD.');
  process.exit(1);
}

async function main() {
  const passwordHash = await hashPassword(password!);

  for (const email of emails) {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      await db.update(users).set({ passwordHash, role: 'admin' }).where(eq(users.id, existing.id));
      console.log(`✅  ${email} — promu admin, mot de passe réinitialisé (id: ${existing.id})`);
    } else {
      await db.insert(users).values({
        email,
        passwordHash,
        role: 'admin',
        prenom: 'Admin',
        nom: 'SD Cosmétique',
      });
      console.log(`✅  ${email} — compte admin créé`);
    }
  }

  console.log(`\n${emails.length} compte(s) admin prêt(s). Le mot de passe n'est pas affiché.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌  Échec de la création des comptes admin :', err);
  process.exit(1);
});
