/**
 * site-config.ts — Point d'entrée legacy pour la configuration du site
 * @deprecated Utilisez @/lib/config à la place
 * 
 * Ce fichier a été refactorisé en modules séparés dans @/lib/config
 * pour une meilleure maintenabilité et organisation du code.
 */

// Réexporter tout depuis le nouveau module config
export * from './config';

// Compatibilité avec l'ancien code
export { DEFAULT_SITE_CONFIG } from './config/defaults';
export type { SiteConfig } from './config/types';
export { 
  fetchSiteConfigSection, 
  saveSiteConfigSection, 
  fetchFullSiteConfig, 
  applyPromoCode,
  validatePromoCode,
  calculateShippingCost,
  isFreeShippingEligible
} from './config/utilities';