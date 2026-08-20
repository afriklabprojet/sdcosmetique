'use client';

import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

interface NewsletterTabProps {
  readonly user: { id: string; email: string } | null;
  readonly newsletter: boolean;
  readonly setNewsletter: React.Dispatch<React.SetStateAction<boolean>>;
  readonly newsletterSaved: boolean;
  readonly setNewsletterSaved: (v: boolean) => void;
}

export default function NewsletterTab({ user, newsletter, setNewsletter, newsletterSaved, setNewsletterSaved }: NewsletterTabProps) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '32px 28px' }}>
      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Newsletter</h2>
      <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 32 }}>Gérez vos préférences de communication.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[{ key: 'newsletter', label: `Newsletter ${DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique'}`, desc: 'Recevez nos actualités, offres exclusives et conseils beauté.' }, { key: 'promo', label: 'Offres promotionnelles', desc: 'Soyez informé(e) en avant-première de nos soldes et codes promo.' }, { key: 'tips', label: 'Conseils & astuces beauté', desc: 'Recevez nos guides et tutoriels pour sublimer votre peau.' }].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: '#FAF8F5', borderRadius: 12, border: '1px solid #EDE8E0' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: '#9A8A7A' }}>{item.desc}</p>
            </div>
            <button
              onClick={() => { setNewsletter(v => !v); setNewsletterSaved(false); }}
              style={{ flexShrink: 0, marginLeft: 20, width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: newsletter ? '#3D1400' : '#EDE8E0', position: 'relative', transition: 'background .2s' }}
            >
              <span style={{ position: 'absolute', top: 3, left: newsletter ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
            </button>
          </div>
        ))}
      </div>

      {newsletterSaved && <p style={{ marginTop: 16, fontSize: 13, color: '#059669', fontWeight: 600 }}>✅ Préférences enregistrées !</p>}
      <button
        onClick={async () => {
          if (user) {
            await fetch('/api/auth/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newsletter }),
            });
          }
          setNewsletterSaved(true);
        }}
        style={{ marginTop: 24, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
      >
        Enregistrer mes préférences
      </button>
    </div>
  );
}
