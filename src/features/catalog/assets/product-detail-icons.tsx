/*
 * SVG inline extraits de `views/product.view.tsx` (F-112).
 */
import React from 'react';
import type { ProductTrustItem } from '@/features/site-config/site-config.type';
import { DARK, GOLD, GOLD2, TEXT_MUTED } from '@/features/catalog/product-detail.constant';

/** Pastille tournante devant chaque bienfait — quatre glyphes en boucle. */
export function BenefitIcon({ i }: { readonly i: number }) {
  const c = {
    width: 15, height: 15, viewBox: '0 0 24 24',
    fill: 'none' as const, stroke: GOLD2, strokeWidth: '2',
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const icons = [
    <svg key="sun"  {...c}><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>,
    <svg key="star" {...c}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>,
    <svg key="drop" {...c}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    <svg key="leaf" {...c}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/></svg>,
  ];
  return <>{icons[i % 4]}</>;
}

/** Icones de la barre de garanties, indexees par la cle stockee en config. */
export const TRUST_ICONS: Record<ProductTrustItem['icon'], React.ReactNode> = {
  truck:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  leaf:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 5 5 5 2c0 0 7 1 12 7 3 3 0 9-5 3z"/></svg>,
  rotate: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>,
};

/** Coche blanche posee sur le cercle de teint selectionne. */
export function ToneCheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
}

/** Cœur de la wishlist pose sur l'image principale. Deux tailles selon la colonne. */
export function ProductWishlistIcon({ filled, size }: { readonly filled: boolean; readonly size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? GOLD : 'none'} stroke={filled ? GOLD : TEXT_MUTED} strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
