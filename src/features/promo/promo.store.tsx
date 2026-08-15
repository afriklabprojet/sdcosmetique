'use client';

/**
 * PromoContext.tsx
 * Fournit la configuration de la promo globale à tous les composants client.
 * Initialisé côté serveur dans layout.tsx — pas de fetch côté client.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { GlobalPromoConfig } from '@/features/site-config/site-config.type';
import { DEFAULT_GLOBAL_PROMO } from '@/features/site-config/site-config.constant';

// ─── Context ──────────────────────────────────────────────────────────────────

const PromoContext = createContext<GlobalPromoConfig>(DEFAULT_GLOBAL_PROMO);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface GlobalPromoProviderProps {
  /** Valeur initialisée depuis le serveur (layout.tsx) */
  readonly initialConfig: GlobalPromoConfig;
  readonly children: ReactNode;
}

export function GlobalPromoProvider({ initialConfig, children }: GlobalPromoProviderProps) {
  return (
    <PromoContext.Provider value={initialConfig ?? DEFAULT_GLOBAL_PROMO}>
      {children}
    </PromoContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Accède à la configuration de la promo globale.
 * Utiliser `promoActive(config)` depuis promo.ts pour vérifier l'état.
 */
export function useGlobalPromo(): GlobalPromoConfig {
  return useContext(PromoContext);
}
