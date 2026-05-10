'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const COLS = [
  {
    title: 'Liens rapides',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Visage', href: '/categorie/face' },
      { label: 'Corps', href: '/categorie/body' },
      { label: 'Gammes', href: '/categorie/gammes' },
      { label: 'Kits', href: '/categorie/kits' },
      { label: 'Duo', href: '/categorie/duo' },
      { label: 'Quiz Teint', href: '/quiz' },
    ],
  },
  {
    title: 'À propos',
    links: [
      { label: 'Notre histoire', href: '/notre-histoire' },
      { label: 'Nos engagements', href: '/engagements' },
      { label: 'Ingrédients', href: '/ingredients' },
      { label: 'Avis clientes', href: '/avis' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Livraison & Retours', href: '/livraison' },
      { label: 'Paiement', href: '/faq' },
      { label: 'Conditions générales', href: '/cgv' },
      { label: 'Politique de confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
    ],
  },
];

export default function Footer({ logoUrl, siteName }: Readonly<{ logoUrl?: string; siteName?: string }>) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const submitNewsletter = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      if (!res.ok) throw new Error('Newsletter subscription failed');
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('err');
    }
  };

  return (
    <footer style={{ background: '#3D1400', color: '#fff', padding: '48px 24px 24px' }}>
      <div className="footer-grid" style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1.5fr',
        gap: '32px',
      }}>
        {/* Colonne logo */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '14px', gap: 10 }}>
            <Image src={logoUrl || '/logo.svg'} alt={siteName || 'SD Cosmetique'} width={160} height={40} style={{ height: 40, width: 'auto', filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)', flexShrink: 0 }} />
            {siteName && (
              <span style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#fff',
                fontFamily: 'var(--font-playfair), Playfair Display, serif',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}>{siteName}</span>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '0.8rem', color: '#E5D4B8', lineHeight: 1.65, marginBottom: '20px',
          }}>
            Révélez votre éclat naturel.<br />
            Prenez soin de vous,<br />
            nous prenons soin de vous.
          </p>
          <div style={{ display: 'flex', gap: '14px' }}>
            {[
              { letter: 'f', href: 'https://www.facebook.com/sdcosmetique', label: 'Facebook' },
              { letter: 'in', href: 'https://www.linkedin.com/company/sd-cosmetique', label: 'LinkedIn' },
              { letter: 'IG', href: 'https://www.instagram.com/sdcosmetique', label: 'Instagram' },
              { letter: 'TK', href: 'https://www.tiktok.com/@sdcosmetique', label: 'TikTok' },
              { letter: 'YT', href: 'https://www.youtube.com/@sdcosmetique', label: 'YouTube' },
            ].map(({ letter, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
                width: 30, height: 30, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.7rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#8F5922'; e.currentTarget.style.borderColor = '#8F5922'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              >{letter}</a>
            ))}
          </div>
        </div>

        {/* 3 colonnes liens */}
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '0.78rem', fontWeight: 700,
              color: '#D4A24E', letterSpacing: '0.14em',
              textTransform: 'uppercase', marginBottom: '16px',
            }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {col.links.map((link) => (
                <li key={link.label} style={{ marginBottom: '8px' }}>
                  <Link href={link.href} style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: '0.8rem', color: '#E5D4B8',
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#E5D4B8'; }}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div>
          <h4 style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '0.78rem', fontWeight: 700,
            color: '#D4A24E', letterSpacing: '0.14em',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>Newsletter</h4>
          <p style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '0.8rem', color: '#E5D4B8', marginBottom: '14px',
          }}>Recevez nos offres et nouveautés</p>
          <form
            onSubmit={submitNewsletter}
            style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '24px', padding: '4px 4px 4px 16px' }}
          >
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email" required
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '0.82rem', color: '#1A0E05', background: 'transparent',
              }}
            />
            <button type="submit" aria-label="S'inscrire" disabled={status === 'loading'}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#8F5922', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3D1400'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#8F5922'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          {status === 'ok' && <p style={{ fontSize: '0.75rem', color: '#A8E6A8', marginTop: 8 }}>Merci ! Vous êtes bien inscrite ✨</p>}
          {status === 'err' && <p style={{ fontSize: '0.75rem', color: '#F5B5B5', marginTop: 8 }}>Une erreur est survenue, réessayez.</p>}
        </div>
      </div>

      <div style={{
        maxWidth: '1200px', margin: '36px auto 0',
        paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontSize: '0.75rem', color: '#A88E68',
      }}>
        © {new Date().getFullYear()} SD COSMETIQUE. Tous droits réservés.
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px 16px !important;
          }
          /* Logo + description : pleine largeur */
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </footer>
  );
}
