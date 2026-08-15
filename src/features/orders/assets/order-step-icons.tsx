/*
 * SVG des quatre etapes de traitement d'une commande, et la liste qui les
 * ordonne. Extraits de `app/confirmation/page.tsx` (F-114).
 */
import { DARK } from '@/features/orders/confirmation.constant';

const IconClipboard = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);
const IconBox = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);
const IconTruck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconHome = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export const NEXT_STEPS = [
  { id: 1, label: 'Confirmation', desc: 'Nous avons bien reçu votre commande.',        Icon: IconClipboard, active: true  },
  { id: 2, label: 'Préparation',  desc: 'Votre commande est en cours de préparation.', Icon: IconBox,       active: false },
  { id: 3, label: 'Expédition',   desc: 'Votre commande sera expédiée très bientôt.', Icon: IconTruck,     active: false },
  { id: 4, label: 'Livraison',    desc: "Vous serez livré à l'adresse indiquée.",       Icon: IconHome,      active: false },
];
