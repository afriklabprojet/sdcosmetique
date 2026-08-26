'use client';

import { useRouter } from 'next/navigation';

interface SettingsTabProps {
  readonly mobile: boolean;
  readonly deleteConfirm: string;
  readonly setDeleteConfirm: (v: string) => void;
}

export default function SettingsTab({ mobile, deleteConfirm, setDeleteConfirm }: SettingsTabProps) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Langue / région */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Préférences</h2>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div>
            <label htmlFor="pref-language" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Langue</label>
            <select id="pref-language" style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
              <option>Français</option><option>English</option>
            </select>
          </div>
          <div>
            <label htmlFor="pref-currency" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Devise</label>
            <select id="pref-currency" style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
              <option>FCFA (XOF)</option><option>EUR (€)</option><option>USD ($)</option>
            </select>
          </div>
        </div>
        <button style={{ marginTop: 20, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
      </div>

      {/* Notifications */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Notifications</h2>
        {[{ label: 'Statut de commande', desc: 'Recevez les mises à jour de vos commandes par email.' }, { label: 'Promotions exclusives', desc: 'Soyez alerté(e) des offres réservées aux membres.' }].map((n, i) => (
          <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 0 ? '1px solid #F5F0E8' : 'none' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{n.label}</p>
              <p style={{ fontSize: 12, color: '#9A8A7A' }}>{n.desc}</p>
            </div>
            <div style={{ width: 48, height: 26, borderRadius: 99, background: '#3D1400', position: 'relative', flexShrink: 0, marginLeft: 20 }}>
              <span style={{ position: 'absolute', top: 3, left: 24, width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Zone danger */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #FECACA', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Zone de danger</h2>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 20 }}>La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="delete-confirm" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tapez &quot;SUPPRIMER&quot; pour confirmer</label>
          <input
            id="delete-confirm"
            type="text"
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder="SUPPRIMER"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, background: '#FEF2F2', outline: 'none', boxSizing: 'border-box', maxWidth: 320 }}
          />
        </div>
        <button
          disabled={deleteConfirm !== 'SUPPRIMER'}
          onClick={async () => {
            if (deleteConfirm !== 'SUPPRIMER') return;
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
          }}
          style={{ padding: '11px 24px', background: deleteConfirm === 'SUPPRIMER' ? '#DC2626' : '#EDE8E0', border: 'none', borderRadius: 10, color: deleteConfirm === 'SUPPRIMER' ? '#fff' : '#9A8A7A', fontSize: 13, fontWeight: 700, cursor: deleteConfirm === 'SUPPRIMER' ? 'pointer' : 'not-allowed' }}
        >
          Supprimer définitivement mon compte
        </button>
      </div>
    </div>
  );
}
