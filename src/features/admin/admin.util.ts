/*
 * Libelles calcules de la console d'administration. Extraits de
 * `admin.view.tsx` (F-110) : ils etaient declares au niveau module et sont
 * appeles depuis une dizaine des onglets sortis en vague `split`.
 * Aucun etat entre deux appels : un module de fonctions pures suffit.
 */
import type { AdminTabStatus } from '@/features/admin/admin.type';
import { GOLD } from '@/features/admin/admin.constant';

export const getSaveButtonText = (saved: boolean, saving: boolean) => {
  if (saved) return '✓ Sauvegardé';
  if (saving) return '…';
  return '💾 Sauvegarder';
};

// Fonctions utilitaires pour les couleurs des statuts
export const getTabColor = (isActive: boolean, status: AdminTabStatus) => {
  if (isActive) return GOLD;
  if (status === 'premium') return '#E5B366';
  if (status === 'important') return '#10B981';
  return '#A8956B';
};

// Fonction pour gérer l'état des produits filtrés
export const getProductCountText = (filteredLength: number, totalLength: number) => {
  return filteredLength === totalLength 
    ? `Produits (${filteredLength})` 
    : `Produits (${filteredLength} / ${totalLength})`;
};

// Fonction pour gérer l'état des avis filtrés
export const getReviewCountText = (filteredLength: number, totalLength: number) => {
  return filteredLength === totalLength 
    ? `Avis (${filteredLength})` 
    : `Avis (${filteredLength} / ${totalLength})`;
};

// Fonction utilitaire pour les labels de quiz
export const getQuizModalTitle = (isNew: boolean, type: string) => {
  const prefix = isNew ? 'Nouvelle' : 'Modifier la';
  const suffix = type === 'concern' ? 'préoccupation' : 'routine';
  return `${prefix} ${suffix}`;
};

// Fonction utilitaire pour les filtres newsletter
export const getNewsletterFilterText = (filter: string) => {
  if (filter === 'all') return 'Tous';
  if (filter === 'active') return 'Actifs';
  return 'Désinscrits';
};