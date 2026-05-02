'use client';

import { useEffect, useState } from 'react';
import type { WelcomePopup } from '@/lib/site-config';

const STORAGE_KEY = 'sdc_popup_shown';

interface WelcomePopupProps {
  config: WelcomePopup;
}

export default function WelcomePopupModal({ config }: WelcomePopupProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!config.enabled) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, (config.delaySeconds ?? 5) * 1000);

    return () => clearTimeout(timer);
  }, [config.enabled, config.delaySeconds]);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const copyCode = async () => {
    if (!config.discountCode) return;
    await navigator.clipboard.writeText(config.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)',
        }}
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: config.bgColor || '#1C1610',
          borderRadius: '16px',
          padding: '40px 32px',
          maxWidth: '420px',
          width: 'calc(100vw - 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          border: '1px solid rgba(200,151,74,0.25)',
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#A8957E',
            fontSize: '20px',
            lineHeight: 1,
            padding: '4px',
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2
          id="popup-title"
          style={{ fontSize: '22px', fontWeight: 800, color: '#C8974A', margin: 0, lineHeight: 1.2 }}
        >
          {config.title || 'Bienvenue !'}
        </h2>

        {/* Subtitle */}
        {config.subtitle && (
          <p style={{ fontSize: '14px', color: '#A8957E', margin: 0, lineHeight: 1.5 }}>
            {config.subtitle}
          </p>
        )}

        {/* Discount code */}
        {config.discountCode && (
          <button
            onClick={copyCode}
            title="Cliquer pour copier"
            style={{
              background: 'rgba(200,151,74,0.1)',
              border: '1.5px dashed #C8974A',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '0.14em',
              color: '#C8974A',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copié !' : config.discountCode}
          </button>
        )}

        {/* CTA */}
        <button
          onClick={close}
          style={{
            background: '#D4A25A',
            color: '#0D0906',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '4px',
            width: '100%',
          }}
        >
          {config.ctaLabel || "Profiter de l'offre"}
        </button>
      </div>
    </>
  );
}
