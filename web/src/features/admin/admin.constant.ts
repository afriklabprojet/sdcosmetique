/*
 * Palette et objets de style de la console d'administration. Extraits de
 * `admin.view.tsx` (F-110) : les dix-neuf onglets sortis en vague `split` les
 * lisent tous, ils ne pouvaient plus vivre dans l'un d'eux.
 *
 * `card`, `thStyle`, `tdStyle` et `inputStyle` etaient recalcules a chaque
 * rendu dans le corps d'`AdminPage` alors qu'ils ne dependent que des
 * constantes ci-dessus. Ils deviennent des constantes de module, ce qui evite
 * aussi d'avoir a les passer en props a chaque onglet.
 */
import type React from 'react';
import type { OrderStatus } from '@/features/admin/admin.type';

export const BG       = '#0D0906';
export const SURFACE  = '#14100C';
export const SURFACE2 = '#1C1610';
export const BORDER   = '#2E2218';
export const BORDER2  = '#3D2E1A';
export const GOLD     = '#C8974A';
export const TEXT     = '#E8DDD0';
export const TEXT2    = '#A8957E';
export const TEXT3    = '#6B5840';
export const TITLE    = '#F7EFE5';
export const TEXT_M   = '#9A8A7A';
export const GOLD2    = '#D4A25A';
export const INFO_C   = '#7A9A7A';
export const BTN_BG   = '#2A1A0A';
export const BORDER3  = '#3A2A1A';
export const S_ERR_BG  = '#4A1D1D';
export const S_ERR_T   = '#FCA5A5';
export const S_OK_BG   = '#064E3B';
export const S_OK_T    = '#6EE7B7';
export const S_WARN_BG = '#4A3A1A';
export const S_WARN_T  = '#FCD34D';
export const S_INFO_BG = '#1E3A5F';
export const S_INFO_T  = '#93C5FD';
export const S_SAVE_BG = '#2A4A2A';
export const S_SAVE_T  = '#5ACA5A';
export const GOLD_D  = '#7B4A1A';
export const GOLD_D3 = '#5A2B0C';
export const ACCENT_P = '#C4B5FD';
export const ACCENT_Y = '#FDE68A';

export const PER_PAGE = 10;

/* ── shared style objects (palette constants are module-level) ── */
export const card: React.CSSProperties = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px' };
export const thStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 600, color: TEXT3, textTransform: 'uppercase' as const, letterSpacing: '0.06em', borderBottom: `1px solid ${BORDER}` };
export const tdStyle: React.CSSProperties = { padding: '11px 16px', fontSize: '12px', color: TEXT, borderBottom: `1px solid ${SURFACE2}` };
export const inputStyle: React.CSSProperties = { background: BG, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '6px 12px', fontSize: '12px', outline: 'none', width: '100%' };

export const STATUS_OPTIONS: { value: OrderStatus; label: string; bg: string; color: string }[] = [
  { value: 'confirmed',  label: 'Confirmée',   bg: S_OK_BG,   color: S_OK_T   },
  { value: 'processing', label: 'En cours',     bg: S_INFO_BG, color: S_INFO_T },
  { value: 'shipped',    label: 'Expédiée',     bg: S_WARN_BG, color: S_WARN_T },
  { value: 'delivered',  label: 'Livrée',       bg: S_OK_BG,   color: S_OK_T   },
];

export const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  visa: 'Visa',
  mastercard: 'Mastercard',
};
