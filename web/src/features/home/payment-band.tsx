'use client';
import React, { useEffect, useState } from 'react';
import { fetchPublicSetting } from '@/shared/api/settings';

/*
 * Fallbacks SVG — affichés tant qu'aucun vrai logo (fichier officiel de la
 * marque) n'est configuré dans Admin → Paiements → `payment_images`. Ce ne
 * sont pas des logos officiels : dessiner un logo de marque déposée pixel
 * pour pixel demande le kit d'assets fourni par chaque fournisseur (Orange
 * Money, Wave, MTN, Moov Africa, Djamo publient tous un press kit). Pour un
 * rendu réellement officiel, uploader ces fichiers via l'admin — le composant
 * bascule automatiquement sur l'image dès qu'elle existe (voir plus bas).
 */
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
    <div className="payment-badge" style={{ background: '#FF6600' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FF6600" fontFamily="Arial,sans-serif">OM</text></svg>
      <div className="payment-badge-label">
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>Orange</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  ),
  wave: (
    <div className="payment-badge" style={{ background: '#1A9BE6' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><path d="M6.5 15.5 Q9 9, 12 14 T17.5 13 T21.5 11" stroke="#1A9BE6" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span className="payment-badge-label" style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>Wave</span>
    </div>
  ),
  mtn_momo: (
    <div className="payment-badge" style={{ background: '#FFCC00' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="#1A1A1A" /><text x="14" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fill="#FFCC00" fontFamily="Arial,sans-serif">MTN</text></svg>
      <div className="payment-badge-label">
        <span style={{ color: '#1A0E05', fontSize: '0.62rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>MTN</span>
        <span style={{ color: 'rgba(26,14,5,0.75)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>MoMo</span>
      </div>
    </div>
  ),
  moov_money: (
    <div className="payment-badge" style={{ background: '#F58220' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="white" /><path d="M8 17 L13.5 10 L19 17" stroke="#F58220" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="payment-badge-label">
        <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'Arial,sans-serif' }}>Moov</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.6rem', fontFamily: 'Arial,sans-serif' }}>Money</span>
      </div>
    </div>
  ),
  visa_mastercard: (
    <div className="payment-badge" style={{ background: '#fff' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none">
        <circle cx="10.5" cy="14" r="7.2" fill="#EB001B" />
        <circle cx="17.5" cy="14" r="7.2" fill="#F79E1B" fillOpacity="0.92" />
      </svg>
      <span className="payment-badge-label" style={{ color: '#1A1F71', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'Arial,sans-serif', letterSpacing: '0.02em' }}>VISA</span>
    </div>
  ),
  djamo: (
    <div className="payment-badge" style={{ background: '#4C35A8' }}>
      <svg className="payment-badge-icon" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="rgba(255,255,255,0.2)" /><text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Arial,sans-serif">DJ</text></svg>
      <span className="payment-badge-label" style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Arial,sans-serif' }}>djamo</span>
    </div>
  ),
};

const ALL_LOGO_IDS = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'visa_mastercard'];

export default function PaymentBand() {
  const [active, setActive] = useState<string[]>(ALL_LOGO_IDS);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPublicSetting('payment_methods_active')
      .then((value) => {
        if (Array.isArray(value) && value.length > 0) setActive(value);
      })
      .catch(() => {});

    fetchPublicSetting('payment_images')
      .then((value) => {
        if (value && typeof value === 'object') setImages(value);
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{ background: '#8f5922', padding: '28px 24px' }}>
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
        {/* Logos — une seule ligne non tronquée côté mobile (badges ronds,
            icône seule), grille avec libellé dès que la largeur le permet. */}
        <div className="payment-badges-row">
          {ALL_LOGO_IDS.filter(id => active.includes(id)).map(id => {
            const imgUrl = images[id];
            if (imgUrl) {
              return (
                <div key={id} className="payment-badge payment-badge--image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={LABELS[id] ?? id} width={120} height={36} className="payment-badge-image" />
                </div>
              );
            }
            return <React.Fragment key={id}>{SVG_FALLBACKS[id]}</React.Fragment>;
          })}
        </div>
      </div>

      <style jsx>{`
        /* Mobile-first : base = ligne unique de badges ronds icône seule
           (défilement horizontal en filet de sécurité si beaucoup de moyens
           sont actifs) ; palier à 641px pour retrouver les pastilles avec
           libellé, en grille qui peut passer à la ligne. */
        .payment-badges-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 2px 2px 6px;
          margin: 0 -2px -6px;
        }
        .payment-badges-row::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 641px) {
          .payment-badges-row {
            justify-content: center;
            flex-wrap: wrap;
            overflow-x: visible;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
      <style jsx global>{`
        .payment-badge {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .payment-badge-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .payment-badge-label {
          display: none;
          flex-direction: column;
          line-height: 1.1;
        }
        /* Les logos réels sont des lockups horizontaux (icône + texte), pas des
           icônes seules comme les repli SVG : un cercle de 46px les écraserait
           illisiblement. Sur mobile, les 5 pastilles se partagent la largeur
           disponible à parts égales (flex-basis 0) pour tenir sur une seule
           ligne sans déborder, quelle que soit la largeur de l'écran. */
        .payment-badge--image {
          background: rgba(255, 255, 255, 0.1);
          flex: 1 1 0;
          flex-shrink: 1;
          width: auto;
          min-width: 0;
          height: 34px;
          border-radius: 7px;
          padding: 4px 5px;
        }
        .payment-badge-image {
          width: 100%;
          height: auto;
          max-height: 20px;
          max-width: 100%;
          object-fit: contain;
        }
        @media (min-width: 641px) {
          .payment-badge {
            width: auto;
            height: 52px;
            border-radius: 10px;
            padding: 10px 18px;
          }
          .payment-badge-label {
            display: flex;
          }
          .payment-badge--image {
            flex: 0 0 auto;
            padding: 8px 16px;
            min-width: 100px;
            height: 52px;
          }
          .payment-badge-image {
            width: auto;
            max-height: 36px;
            max-width: 120px;
          }
        }
      `}</style>
    </section>
  );
}
