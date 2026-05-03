/**
 * index.ts — Point d'entrée principal pour la configuration du site
 */

// Réexporter tous les types
export type * from './types';

// Réexporter les valeurs par défaut
export * from './defaults';

// Réexporter les utilitaires
export * from './utilities';

// Réexport de compatibilité pour l'ancien fichier site-config.ts
export { DEFAULT_SITE_CONFIG } from './defaults';
export type { SiteConfig } from './types';
export { fetchSiteConfigSection, saveSiteConfigSection, fetchFullSiteConfig, applyPromoCode } from './utilities';