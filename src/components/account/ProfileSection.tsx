'use client';

import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface ProfileSectionProps {
  user: User | null;
}

interface ProfileForm {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  currentPwd: string;
  newPwd: string;
  confirmPwd: string;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    prenom: user?.user_metadata?.first_name || '',
    nom: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    telephone: user?.user_metadata?.phone || '',
    currentPwd: '',
    newPwd: '',
    confirmPwd: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      
      // Mise à jour des métadonnées utilisateur
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: profileForm.prenom,
          last_name: profileForm.nom,
          phone: profileForm.telephone
        }
      });
      
      if (updateError) throw updateError;
      
      // Mise à jour de l'email si changé
      if (profileForm.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        });
        if (emailError) throw emailError;
      }
      
      // Mise à jour du mot de passe si fourni
      if (profileForm.newPwd) {
        if (profileForm.newPwd !== profileForm.confirmPwd) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileForm.newPwd
        });
        if (passwordError) throw passwordError;
      }
      
      setMessage({ type: 'ok', text: 'Profil mis à jour avec succès !' });
      setProfileForm(prev => ({ ...prev, currentPwd: '', newPwd: '', confirmPwd: '' }));
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div style={{ flex: 1, maxWidth: '600px' }}>
      <h2 style={{ fontSize: '20px', color: '#FAFAFA', fontWeight: 600, marginBottom: '24px' }}>Mon profil</h2>
      
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          background: message.type === 'ok' ? '#10B98115' : '#EF444415',
          border: `1px solid ${message.type === 'ok' ? '#10B98130' : '#EF444430'}`,
          color: message.type === 'ok' ? '#10B981' : '#EF4444',
          fontSize: '14px'
        }}>
          {message.text}
        </div>
      )}
      
      <div style={{
        background: '#0F0F0F',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <InputField
            label="Prénom"
            value={profileForm.prenom}
            onChange={v => setProfileForm(prev => ({ ...prev, prenom: v }))}
            placeholder="Votre prénom"
          />
          <InputField
            label="Nom"
            value={profileForm.nom}
            onChange={v => setProfileForm(prev => ({ ...prev, nom: v }))}
            placeholder="Votre nom"
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <InputField
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={v => setProfileForm(prev => ({ ...prev, email: v }))}
            placeholder="votre@email.com"
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <InputField
            label="Téléphone"
            value={profileForm.telephone}
            onChange={v => setProfileForm(prev => ({ ...prev, telephone: v }))}
            placeholder="+225 XX XX XX XX XX"
          />
        </div>
        
        <div style={{ borderTop: '1px solid #222', paddingTop: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#D4A24E', marginBottom: '16px' }}>Changer de mot de passe</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <InputField
              label="Nouveau mot de passe"
              type="password"
              value={profileForm.newPwd}
              onChange={v => setProfileForm(prev => ({ ...prev, newPwd: v }))}
              placeholder="Nouveau mot de passe"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <InputField
              label="Confirmer le mot de passe"
              type="password"
              value={profileForm.confirmPwd}
              onChange={v => setProfileForm(prev => ({ ...prev, confirmPwd: v }))}
              placeholder="Confirmer le mot de passe"
            />
          </div>
        </div>
        
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: saving ? '#666' : '#D4A24E',
            color: saving ? '#CCC' : '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

function InputField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder 
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: '6px',
          color: '#FAFAFA',
          fontSize: '14px',
          outline: 'none'
        }}
      />
    </div>
  );
}

