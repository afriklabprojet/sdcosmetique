/*
 * Jetons visuels et coordonnees de contact de la page de confirmation.
 * Extraits de `app/confirmation/page.tsx` (F-114) : depuis la vague `split`,
 * quatre cartes distinctes les lisent.
 */
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

// ── Coordonnées de contact (centralisées dans le config) ──────────────────────
export const CONTACT_PHONE = DEFAULT_SITE_CONFIG.legal_contact.contactPhone ?? '';   // '+225 07 49 49 49 49'
export const CONTACT_PHONE_TEL = CONTACT_PHONE.replaceAll(/\s/g, '');          // 'tel:+2250749494949'
export const CONTACT_EMAIL = DEFAULT_SITE_CONFIG.legal_contact.contactEmail;   // 'contact@sdcosmetique.ci'
export const CONTACT_WA    = `https://wa.me/${CONTACT_PHONE_TEL.replaceAll('+', '')}`;

// ── Palette ───────────────────────────────────────────────────────────────────
export const DARK   = '#3D1400';
export const GOLD   = '#8F5922';
export const BORDER = '#EDE8E0';
export const TEXT        = '#1A1A1A';
export const TEXT_MUTED  = '#9A8A7A';
export const TEXT_BODY   = '#7A6A5A';
export const BG     = '#F8F4EF';

// ── Sparkle positions ─────────────────────────────────────────────────────────
export const SPARKLES = [
  { top: '7%',  left: '3%',  size: 10, rot: 15,  op: 0.5  },
  { top: '3%',  left: '17%', size: 7,  rot: -20, op: 0.35 },
  { top: '13%', left: '29%', size: 9,  rot: 40,  op: 0.45 },
  { top: '5%',  left: '53%', size: 8,  rot: -10, op: 0.4  },
  { top: '9%',  left: '69%', size: 7,  rot: 25,  op: 0.35 },
  { top: '2%',  left: '83%', size: 10, rot: -35, op: 0.45 },
  { top: '19%', left: '93%', size: 6,  rot: 55,  op: 0.3  },
  { top: '17%', left: '8%',  size: 6,  rot: -45, op: 0.3  },
  { top: '27%', left: '41%', size: 8,  rot: 30,  op: 0.35 },
  { top: '1%',  left: '63%', size: 6,  rot: -55, op: 0.25 },
];
