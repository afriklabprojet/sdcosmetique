import type React from 'react';

export type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'confirmation';

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export const GOLD    = '#C8974A';
export const BORDER  = '#E2D9CF';
export const BG_ROW  = '#FDFAF7';
export const TXT     = '#2C1810';
export const TXT2    = '#8C7B6E';
export const TXT3    = '#B5A898';

export const inputSt: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: `1px solid ${BORDER}`,
  borderRadius: '4px', fontSize: '13px', color: TXT, background: 'white',
  outline: 'none', boxSizing: 'border-box',
};
