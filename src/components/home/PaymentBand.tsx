'use client';
import React, { useEffect, useState } from 'react';

/* ─── Fallbacks SVG (affichés si aucune image réelle n'est configurée) ─── */
const LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  djamo: 'Djamo',
  visa_mastercard: 'Visa / Mastercard',
};

const SVG_FALLBACKS: Record<string, React.ReactNode> = {
  orange_money: (
    <div style={{ background: '#FF6600', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FF6600" fontFamily="Arial,sans-serif">OM</text></svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>Orange</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  ),
  wave: (
    <div style={{ background: '#009EE3', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><path d="M7 16 Q10 10, 14 14 Q18 18, 21 12" stroke="#009EE3" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
      <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>Wave</span>
    </div>
  ),
  mtn_momo: (
    <div style={{ background: '#FFCC00', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFCC00" fontFamily="Arial,sans-serif">MTN</text></svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#1A0E05', fontSize: '0.62rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>MTN</span>
        <span style={{ color: 'rgba(26,14,5,0.75)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>MoMo</span>
      </div>
    </div>
  ),
  moov_money: (
    <div style={{ background: '#003087', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><path d="M8 14 L14 8 L20 14" stroke="#003087" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 16 L14 12 L18 16" stroke="#003087" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>Moov</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  ),
  visa_mastercard: (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
      <svg width="42" height="14" viewBox="0 0 42 14" fill="none"><text x="0" y="12" fontSize="14" fontWeight="900" fill="#1A1F71" fontFamily="Arial,sans-serif">VISA</text></svg>
      <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EB001B' }} />
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F79E1B', marginLeft: '-8px' }} />
      </div>
    </div>
  ),
  djamo: (
    <div style={{ background: '#4C35A8', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="rgba(255,255,255,0.2)" /><text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Arial,sans-serif">DJ</text></svg>
      <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>djamo</span>
    </div>
  ),
};

const ALL_LOGO_IDS = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'visa_mastercard'];

export default function PaymentBand() {
  const [active, setActive] = useState<string[]>(ALL_LOGO_IDS);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/config/payment_methods_active')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setActive(data.value);
        }
      })
      .catch(() => {});

    fetch('/api/config/payment_images')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.value && typeof data.value === 'object') {
          setImages(data.value as Record<string, string>);
        }
      })
      .catch(() => {});
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
          {ALL_LOGO_IDS.filter(id => active.includes(id)).map(id => {
            const imgUrl = images[id];
            if (imgUrl) {
              return (
                <div key={id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px', height: '52px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={LABELS[id] ?? id} style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }} />
                </div>
              );
            }
            return <React.Fragment key={id}>{SVG_FALLBACKS[id]}</React.Fragment>;
          })}
        </div>
      </div>
    </section>
  );
}
