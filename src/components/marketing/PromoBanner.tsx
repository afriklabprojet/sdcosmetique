'use client';

import { useState } from 'react';
import type { PromoBanner } from '@/lib/site-config';
import type { GlobalPromoConfig } from '@/lib/config/types';
import { isPromoActive } from '@/lib/promo';

interface PromoBannerProps {
  banners: PromoBanner[];
  globalPromo?: GlobalPromoConfig;
}

export default function PromoBannerBar({ banners, globalPromo }: Readonly<PromoBannerProps>) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Bouton fermer réutilisable
  const closeBtn = (
    <button
      onClick={() => setDismissed(true)}
      aria-label="Fermer la bannière"
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'inherit',
        opacity: 0.7,
        fontSize: '16px',
        lineHeight: 1,
        padding: '4px',
      }}
    >
      ×
    </button>
  );

  // ── Bannière promotion globale (priorité) ────────────────────────────────────
  if (globalPromo && isPromoActive(globalPromo)) {
    return (
      <header
        role="banner"
        aria-label="Promotion en cours"
        style={{
          background: globalPromo.badgeColor,
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
          padding: '10px 40px 10px 16px',
          textAlign: 'center',
          position: 'relative',
          lineHeight: 1.4,
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <span aria-hidden="true">🎉</span>
          <span>
            {globalPromo.label}
            {' · '}
            <strong>-{globalPromo.discountPercentage}%</strong>
            {' '}sur tous les produits
          </span>
        </span>
        {closeBtn}
      </header>
    );
  }

  // ── Bannière marketing classique ─────────────────────────────────────────────
  const now = new Date();
  const banner = banners.find(b => {
    if (!b.active) return false;
    if (b.startsAt && new Date(b.startsAt) > now) return false;
    if (b.endsAt && new Date(b.endsAt) < now) return false;
    return true;
  });

  if (!banner) return null;

  const content = (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
      {banner.emoji && <span>{banner.emoji}</span>}
      <span>{banner.text}</span>
    </span>
  );

  return (
    <header
      style={{
        background: banner.bgColor,
        color: banner.textColor,
        fontSize: '13px',
        fontWeight: 600,
        padding: '10px 40px 10px 16px',
        textAlign: 'center',
        position: 'relative',
        lineHeight: 1.4,
      }}
    >
      {banner.link ? (
        <a href={banner.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {content}
        </a>
      ) : (
        content
      )}
      {closeBtn}
    </header>
  );
}
