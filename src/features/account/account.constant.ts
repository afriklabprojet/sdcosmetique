/*
 * Vocabulaire et tables de correspondance de l'espace client. Extraits de
 * `app/compte/page.tsx` (F-111) : plusieurs onglets les lisent depuis la
 * vague `split`.
 */

export type NavItem = 'dashboard' | 'commandes' | 'adresses' | 'paiements' | 'favoris' | 'avis' | 'profil' | 'points' | 'newsletter' | 'parametres';

/** Une commande telle que les onglets l'affichent : tout est deja formate. */
export type DisplayOrder = {
  id: string;
  date: string;
  total: string;
  status: string;
};

export type Address = {
  id: string; label: string; firstName: string; lastName: string;
  street: string; city: string; postalCode: string; country: string;
  phone: string; preferred: boolean;
};

export type StatusStyle = { bg: string; color: string; label: string };

export const STATUS_CONFIG: Record<string, StatusStyle> = {
  Livrée:   { bg: '#ECFDF5', color: '#059669', label: 'Livrée' },
  Confirmée:{ bg: '#ECFDF5', color: '#059669', label: 'Confirmée' },
  'En cours':{ bg: '#FFF7ED', color: '#EA580C', label: 'En cours' },
  Expédiée: { bg: '#EFF6FF', color: '#2563EB', label: 'Expédiée' },
  Annulée:  { bg: '#FEF2F2', color: '#DC2626', label: 'Annulée' },
};

export const STATUS_MAP: Record<string, string> = {
  confirmed: 'Confirmée',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
};
