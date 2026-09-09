'use client';

import { DEFAULT_TOP_BAR } from '@/features/site-config/site-config.constant';

type TopBarProps = {
  readonly message?: string;
  readonly phone?: string;
  readonly facebook?: string;
  readonly instagram?: string;
  readonly tiktok?: string;
};

export default function TopBar({
  message = "Livraison rapide partout en Côte d'Ivoire et à l'international",
  phone = DEFAULT_TOP_BAR.phone,
  facebook = 'https://www.facebook.com/sdcosmetique',
  instagram = 'https://www.instagram.com/sdcosmetique',
  tiktok = 'https://www.tiktok.com/@sdcosmetique',
}: TopBarProps) {
  return (
    <div className="top-bar-wrapper">
      <div className="top-bar-container">
        <div className="top-bar-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" />
            <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
          </svg>
          <div className="top-bar-marquee">
            <div className="top-bar-marquee-track">
              <span>{message}</span>
              <span aria-hidden="true">{message}</span>
            </div>
          </div>
        </div>
        <div className="top-bar-right">
          <span>Besoin d&apos;aide&nbsp;? {phone}</span>
          <div className="rs-icons">
            <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rs-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 3h-2.3v6.9A10 10 0 0 0 22 12z" /></svg>
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rs-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
            </a>
            <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="rs-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8.3a6 6 0 0 1-3.5-1.1v7.4a4.8 4.8 0 1 1-4.8-4.8v2.6a2.2 2.2 0 1 0 2.2 2.2V2h2.5a4 4 0 0 0 3.6 3.6z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Mobile-first : base = mobile (une seule ligne compacte, façon
           bandeau d'app native — téléphone et réseaux sociaux, redondants
           avec le footer, ne sont réservés qu'au palier desktop où l'espace
           ne coûte rien). Palier unique à 769px pour l'espacement desktop. */
        .top-bar-wrapper {
          background: #8f5922;
          color: #F4E8D8;
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 0.72rem;
          padding: 8px 0;
        }
        .top-bar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
        }
        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          flex: 1;
        }
        .top-bar-left svg {
          flex-shrink: 0;
        }
        .top-bar-marquee {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent);
        }
        .top-bar-marquee-track {
          display: inline-flex;
          width: max-content;
          white-space: nowrap;
          animation: top-bar-scroll 14s linear infinite;
        }
        .top-bar-marquee-track span {
          padding-right: 56px;
        }
        @keyframes top-bar-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .top-bar-marquee-track {
            animation: none;
          }
          .top-bar-marquee-track span:last-child {
            display: none;
          }
          .top-bar-marquee-track span:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            padding-right: 0;
          }
        }
        .top-bar-right {
          display: none;
          align-items: center;
          gap: 12px;
        }
        .rs-icons {
          display: flex;
          gap: 0;
          align-items: center;
        }
        .rs-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          min-height: 32px;
          color: inherit;
          text-decoration: none;
        }
        @media (min-width: 769px) {
          .top-bar-wrapper {
            font-size: 0.78rem;
          }
          .top-bar-container {
            padding: 0 32px;
            justify-content: space-between;
            gap: 16px;
          }
          .top-bar-marquee {
            flex: 0 1 auto;
            mask-image: none;
            -webkit-mask-image: none;
          }
          .top-bar-marquee-track {
            animation: none;
          }
          .top-bar-marquee-track span:last-child {
            display: none;
          }
          .top-bar-right {
            display: flex;
            gap: 22px;
          }
          .rs-icons {
            gap: 4px;
          }
          .rs-link {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
