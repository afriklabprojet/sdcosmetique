'use client';

import { useState } from 'react';
import type { PromoBanner } from '@/lib/site-config';

interface PromoBannerProps {
  banners: PromoBanner[];
}

export default function PromoBannerBar({ banners }: Readonly<PromoBannerProps>) {
  const [dismissed, setDismissed] = useState(false);

  // Find first active + date-valid banner
  const now = new Date();
  const banner = banners.find(b => {
    if (!b.active) return false;
    if (b.startsAt && new Date(b.startsAt) > now) return false;
    if (b.endsAt && new Date(b.endsAt) < now) return false;
    return true;
  });

  if (!banner || dismissed) return null;

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
    </header>
  );
}
