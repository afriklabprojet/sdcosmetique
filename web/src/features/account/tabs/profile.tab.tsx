'use client';

import { apiErrorMessage, updatePassword } from '@/shared/api';

type Message = { type: 'ok' | 'err'; text: string } | null;
type ProfileForm = { firstName: string; lastName: string; email: string; phone: string; currentPwd: string; newPwd: string; confirmPwd: string };
type PwdForm = { current: string; next: string; confirm: string };

interface ProfileTabProps {
  readonly mobile: boolean;
  readonly displayEmail: string;
  readonly displayPhone: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly profileForm: ProfileForm;
  readonly setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  readonly profileSaving: boolean;
  readonly profileMsg: Message;
  readonly saveProfileSection: () => void;
  readonly pwdForm: PwdForm;
  readonly setPwdForm: React.Dispatch<React.SetStateAction<PwdForm>>;
  readonly pwdMsg: Message;
  readonly setPwdMsg: (m: Message) => void;
}

export default function ProfileTab({
  mobile, displayEmail, displayPhone, firstName, lastName,
  profileForm, setProfileForm, profileSaving, profileMsg, saveProfileSection,
  pwdForm, setPwdForm, pwdMsg, setPwdMsg,
}: ProfileTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Infos personnelles */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Informations personnelles</h2>
        {profileMsg && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: profileMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2', color: profileMsg.type === 'ok' ? '#059669' : '#DC2626', border: `1px solid ${profileMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}` }}>
            {profileMsg.type === 'ok' ? '✅ ' : '❌ '}{profileMsg.text}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {[{ label: 'Prénom', key: 'firstName', placeholder: firstName || 'Votre prénom' }, { label: 'Nom', key: 'lastName', placeholder: lastName || 'Votre nom' }].map(f => (
            <div key={f.key}>
              <label htmlFor={`profile-${f.key}`} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input
                id={`profile-${f.key}`}
                type="text"
                value={profileForm[f.key as keyof typeof profileForm]}
                placeholder={f.placeholder}
                onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label htmlFor="profile-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adresse email</label>
            <input
              id="profile-email"
              type="email"
              value={profileForm.email || displayEmail}
              disabled
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#9A8A7A', background: '#F5F2EE', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
            />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label htmlFor="profile-phone" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Téléphone</label>
            <input
              id="profile-phone"
              type="tel"
              value={profileForm.phone || displayPhone}
              placeholder="+225 07 00 00 00 00"
              onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <button
          disabled={profileSaving}
          onClick={saveProfileSection}
          style={{ marginTop: 20, padding: '11px 28px', background: profileSaving ? '#9A8A7A' : '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: profileSaving ? 'not-allowed' : 'pointer' }}
        >
          {profileSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>

      {/* Changer mot de passe */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Changer le mot de passe</h2>
        {pwdMsg && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: pwdMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2', color: pwdMsg.type === 'ok' ? '#059669' : '#DC2626', border: `1px solid ${pwdMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}` }}>
            {pwdMsg.type === 'ok' ? '✅ ' : '❌ '}{pwdMsg.text}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[{ label: 'Mot de passe actuel', key: 'current' }, { label: 'Nouveau mot de passe', key: 'next' }, { label: 'Confirmer le nouveau mot de passe', key: 'confirm' }].map(f => (
            <div key={f.key}>
              <label htmlFor={`pwd-${f.key}`} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input
                id={`pwd-${f.key}`}
                type="password"
                value={pwdForm[f.key as keyof typeof pwdForm]}
                onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            if (pwdForm.next !== pwdForm.confirm) { setPwdMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' }); return; }
            if (pwdForm.next.length < 8) { setPwdMsg({ type: 'err', text: 'Le mot de passe doit contenir au moins 8 caractères.' }); return; }
            try {
              await updatePassword({ current: pwdForm.current, next: pwdForm.next });
              setPwdMsg({ type: 'ok', text: 'Mot de passe modifié avec succès !' });
              setPwdForm({ current: '', next: '', confirm: '' });
            } catch (err) {
              setPwdMsg({ type: 'err', text: apiErrorMessage(err, 'Erreur lors du changement de mot de passe.') });
            }
          }}
          style={{ marginTop: 20, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Mettre à jour le mot de passe
        </button>
      </div>
    </div>
  );
}
