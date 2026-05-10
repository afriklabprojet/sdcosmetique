'use client';
import React, { useEffect, useState } from 'react';

/* Logos SVG inline pour chaque moyen de paiement */
function OrangeMoneyLogo() {
  return (
    <div style={{ background: '#FF6600', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="white" />
        <text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FF6600" fontFamily="Arial,sans-serif">OM</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif', letterSpacing: '0.02em' }}>Orange</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  );
}

function WaveLogo() {
  return (
    <div style={{ background: '#009EE3', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="white" />
        <path d="M7 16 Q10 10, 14 14 Q18 18, 21 12" stroke="#009EE3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif', letterSpacing: '0.04em' }}>Wave</span>
    </div>
  );
}

function MtnMomoLogo() {
  return (
    <div style={{ background: '#FFCC00', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="white" />
        <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFCC00" fontFamily="Arial,sans-serif">MTN</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#1A0E05', fontSize: '0.62rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>MTN</span>
        <span style={{ color: 'rgba(26,14,5,0.75)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>MoMo</span>
      </div>
    </div>
  );
}

function MoovMoneyLogo() {
  return (
    <div style={{ background: '#003087', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="white" />
        <path d="M8 14 L14 8 L20 14" stroke="#003087" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16 L14 12 L18 16" stroke="#003087" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>Moov</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  );
}

function VisaMastercardLogo() {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
      {/* VISA */}
      <svg width="42" height="14" viewBox="0 0 42 14" fill="none">
        <text x="0" y="12" fontSize="14" fontWeight="900" fill="#1A1F71" fontFamily="Arial,sans-serif" letterSpacing="-0.5">VISA</text>
      </svg>
      <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
      {/* Mastercard circles */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EB001B' }} />
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F79E1B', marginLeft: '-8px' }} />
      </div>
    </div>
  );
}

function DjamoLogo() {
  return (
    <div style={{ background: '#4C35A8', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="rgba(255,255,255,0.2)" />
        <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Arial,sans-serif">DJ</text>
      </svg>
      <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif', letterSpacing: '0.04em' }}>djamo</span>
    </div>
  );
}

const ALL_LOGO_IDS = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'visa_mastercard'];

const LOGOS: Record<string, React.ReactNode> = {
  orange_money: <OrangeMoneyLogo />,
  wave: <WaveLogo />,
  mtn_momo: <MtnMomoLogo />,
  moov_money: <MoovMoneyLogo />,
  djamo: <DjamoLogo />,
  visa_mastercard: <VisaMastercardLogo />,
};

export default function PaymentBand() {
  const [active, setActive] = useState<string[]>(ALL_LOGO_IDS);

  useEffect(() => {
    fetch('/api/config/payment_methods_active')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setActive(data.value);
        }
      })
      .catch(() => { /* garde les valeurs par défaut */ });
  }, []);

  return (
    <section style={{ background: '#3D1A06', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>→</span>
          <p style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            color: '#F4E8D8', fontSize: '0.72rem',
            letterSpacing: '0.22em', textAlign: 'center',
            margin: 0, textTransform: 'uppercase', fontWeight: 600,
          }}>
            Nos moyens de paiement
          </p>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>←</span>
        </div>
        {/* Logos */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {ALL_LOGO_IDS.filter(id => active.includes(id)).map(id => (
            <React.Fragment key={id}>{LOGOS[id]}</React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
