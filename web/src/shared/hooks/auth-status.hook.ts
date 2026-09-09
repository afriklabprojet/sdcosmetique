'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Account } from '@/shared/api/auth';

/**
 * Sait si un client est connecté, sans jamais forcer d'attente : démarre en
 * `null` (inconnu) puis se résout. Re-vérifie à chaque changement de route
 * pour capter les transitions connexion/déconnexion (même pattern que les
 * stores wishlist/comparaison).
 */
export function useAuthStatus(): boolean | null {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    Account.identify()
      .then((identity) => {
        if (!cancelled) setAuthenticated(Boolean(identity));
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return authenticated;
}
