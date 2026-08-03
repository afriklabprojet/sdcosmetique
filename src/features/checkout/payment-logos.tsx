'use client';

import React from 'react';

export const OMLogo = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <rect width="44" height="44" rx="10" fill="#FF6600" />
    <path d="M12 22c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10-10-4.48-10-10z" fill="rgba(255,255,255,0.15)" />
    <text x="22" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">OM</text>
  </svg>
);

export const WaveLogo = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <rect width="44" height="44" rx="10" fill="#1CA8DD" />
    <ellipse cx="22" cy="26" rx="11" ry="7" fill="white" opacity="0.25" />
    <circle cx="22" cy="19" r="7" fill="white" opacity="0.9" />
  </svg>
);

export const MastercardLogo = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <rect width="44" height="44" rx="10" fill="#EB001B" />
    <circle cx="17" cy="22" r="10" fill="#EB001B" />
    <circle cx="27" cy="22" r="10" fill="#FF5F00" opacity="0.8" />
    <circle cx="22" cy="22" r="6" fill="#FF5F00" />
  </svg>
);

export const VisaLogo = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <rect width="44" height="44" rx="10" fill="#1A1F71" />
    <path d="M15 16h4l2 12h-3l-1.5-8-1.5 8h-3l3-12z" fill="white" />
    <path d="M25 16h3v12h-3z" fill="white" />
    <path d="M30 16h3c1 0 1.5.5 1.5 1.5v9c0 1-.5 1.5-1.5 1.5h-3v-12z" fill="white" />
  </svg>
);