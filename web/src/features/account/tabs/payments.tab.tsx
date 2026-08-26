'use client';

/* Moyens de paiement (placeholder premium). Extrait de `app/compte/page.tsx` (F-111). */

import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

interface PaymentsTabProps {
  readonly displayName: string;
}

export default function PaymentsTab({ displayName }: PaymentsTabProps) {
  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Mes moyens de paiement</h2>
                  <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 24 }}>Gérez vos modes de paiement enregistrés.</p>
                  <div style={{ background: 'linear-gradient(135deg,#3D1400,#6B3D14)', borderRadius: 16, padding: '24px', color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
                    <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,151,74,.15)' }} />
                    <p style={{ fontSize: 11, opacity: .7, marginBottom: 16, letterSpacing: '0.1em' }}>CARTE DE FIDÉLITÉ</p>
                    <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 8 }}>**** **** **** ••••</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: .8 }}>
                      <span>{displayName.toUpperCase()}</span>
                      <span>{(DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique').toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ background: '#FFF7ED', border: '1px dashed #C8974A', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#92400E', fontWeight: 700, marginBottom: 4 }}>💳 Paiement Mobile Money disponible</p>
                    <p style={{ fontSize: 12, color: '#9A8A7A' }}>Orange Money • MTN Mobile Money • Wave</p>
                  </div>
                </div>
              </div>
  );
}
