'use client';
import React, { useCallback, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ImageUploadProps {
  readonly value: string;           // URL actuelle
  readonly onChange: (url: string) => void;
  readonly folder?: string;         // sous-dossier dans le bucket (ex: 'hero', 'avatars')
  readonly label?: string;
  readonly previewSize?: number;    // px de hauteur de la preview
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label = 'Image',
  previewSize = 120,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5 Mo).');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('site-images')
        .upload(filename, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('site-images').getPublicUrl(filename);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const isExternal = value.startsWith('http');
  const displaySrc = value || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span className="text-xs" style={{ color: '#9A7A5A' }}>{label}</span>

      {/* Zone drag & drop */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label={value ? `Remplacer ${label}` : `Téléverser ${label}`}
        style={{
          border: `2px dashed ${isDragging ? '#D4A25A' : '#2A1A0A'}`,
          borderRadius: '8px',
          padding: '16px',
          cursor: 'pointer',
          background: isDragging ? 'rgba(212,162,90,0.07)' : '#0F0A06',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          transition: 'border-color 0.2s, background 0.2s',
          width: '100%',
          font: 'inherit',
          color: 'inherit',
          textAlign: 'center',
        }}
      >
        {/* Preview */}
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt="preview"
            style={{
              height: previewSize,
              maxWidth: '100%',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #2A1A0A',
            }}
          />
        ) : (
          <div style={{
            height: previewSize,
            width: '100%',
            background: '#1A0E06',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3A2A1A',
            fontSize: '32px',
          }}>
            🖼
          </div>
        )}

        {uploading ? (
          <span style={{ color: '#D4A25A', fontSize: '12px' }}>Envoi en cours…</span>
        ) : (
          <span style={{ color: '#7A6A5A', fontSize: '11px', textAlign: 'center' }}>
            Glissez une image ici, ou <span style={{ color: '#D4A25A' }}>cliquez pour parcourir</span>
            <br />
            <span style={{ color: '#3A2A1A' }}>JPG · PNG · WEBP · GIF — max 5 Mo</span>
          </span>
        )}
      </button>

      {/* URL affichée + bouton supprimer */}
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            readOnly
            value={value}
            style={{
              flex: 1,
              background: '#0F0A06',
              border: '1px solid #1A0E06',
              borderRadius: '6px',
              padding: '5px 10px',
              color: '#5A4A3A',
              fontSize: '10px',
              outline: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          />
          {isExternal && (
            <a href={value} target="_blank" rel="noreferrer"
              style={{ color: '#D4A25A', fontSize: '10px', whiteSpace: 'nowrap' }}>
              ↗ voir
            </a>
          )}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(''); }}
            title="Supprimer l'image"
            style={{ background: 'none', border: '1px solid #3A2020', borderRadius: '4px', color: '#CA5A5A', fontSize: '12px', padding: '2px 7px', cursor: 'pointer', flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <span style={{ color: '#CA5A5A', fontSize: '11px' }}>{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
