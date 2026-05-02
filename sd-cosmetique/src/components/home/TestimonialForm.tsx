'use client';

import React, { useState } from 'react';
import { submitTestimonial } from '@/lib/testimonials-db';
import ImageUpload from '@/components/ui/ImageUpload';

export default function TestimonialForm() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setStatus('loading');
    const { error } = await submitTestimonial({ name, text, avatar_url: avatarUrl || undefined });
    if (error) {
      setErrorMsg(error);
      setStatus('error');
    } else {
      setStatus('success');
      setName('');
      setText('');
      setAvatarUrl('');
    }
  };

  if (status === 'success') {
    return (
      <div style={{
        background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px',
        padding: '32px', textAlign: 'center', maxWidth: '560px', margin: '0 auto',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
        <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.2rem', color: '#14532D', marginBottom: '8px' }}>
          Merci pour votre témoignage&nbsp;!
        </h3>
        <p style={{ color: '#166534', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Votre message a bien été envoyé. Il sera visible sur notre site après validation par notre équipe.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{ marginTop: '20px', background: '#5A2B0C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Soumettre un autre avis
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#F9F6F2', borderRadius: '12px', padding: '32px',
      maxWidth: '560px', margin: '0 auto', fontFamily: 'var(--font-inter), Inter, sans-serif',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontSize: '1.15rem', fontWeight: 700, color: '#5A2B0C',
        marginBottom: '6px',
      }}>
        Partagez votre expérience
      </h3>
      <p style={{ fontSize: '0.83rem', color: '#7A6A5A', marginBottom: '24px', lineHeight: 1.5 }}>
        Votre témoignage sera affiché sur notre site après validation. Merci de partager votre expérience avec nos produits&nbsp;!
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Nom */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4A3828', marginBottom: '6px' }}>
            Votre prénom <span style={{ color: '#C0392B' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="Ex. : Fatou B."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              border: '1px solid #D4C4A8', background: '#fff', fontSize: '0.9rem',
              color: '#1A0E05', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Témoignage */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4A3828', marginBottom: '6px' }}>
            Votre témoignage <span style={{ color: '#C0392B' }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            required
            maxLength={400}
            rows={4}
            placeholder="Décrivez votre expérience avec nos produits…"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              border: '1px solid #D4C4A8', background: '#fff', fontSize: '0.9rem',
              color: '#1A0E05', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9A8A7A', marginTop: '4px' }}>
            {text.length}/400
          </div>
        </div>

        {/* Photo optionnelle */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4A3828', marginBottom: '6px' }}>
            Votre photo <span style={{ fontSize: '0.75rem', color: '#9A8A7A', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            folder="testimonials"
            label=""
            previewSize={80}
          />
        </div>

        {status === 'error' && (
          <p style={{ fontSize: '0.82rem', color: '#C0392B', background: '#FEF2F2', padding: '10px 14px', borderRadius: '8px' }}>
            Une erreur est survenue : {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !name.trim() || !text.trim()}
          style={{
            background: status === 'loading' ? '#9A8A7A' : '#5A2B0C',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '12px 28px', fontSize: '0.9rem', fontWeight: 700,
            cursor: status === 'loading' || !name.trim() || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            alignSelf: 'flex-start',
          }}
        >
          {status === 'loading' ? 'Envoi…' : 'Envoyer mon témoignage'}
        </button>
      </form>
    </div>
  );
}
