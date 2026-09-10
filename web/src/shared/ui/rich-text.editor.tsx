'use client';

/**
 * Éditeur riche minimal (gras/italique/titres/listes/liens) sans dépendance
 * externe — `contentEditable` + `execCommand`, suffisant pour un usage admin
 * interne (Chrome/Edge/Firefox). Le HTML produit est de toute façon
 * nettoyé côté serveur (`HtmlSanitizer`) avant stockage/envoi.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Media } from '@/shared/api/admin';
import { toast } from '@/shared/ui/toast';
import { BG, BORDER, BORDER2, TEXT, TEXT2 } from '@/features/admin/admin.constant';

interface RichTextEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly minHeight?: number;
  /** Autorise l'insertion d'images (campagnes marketing, §6) — hors périmètre pour un simple message individuel. */
  readonly allowImages?: boolean;
}

/* Chaque bouton porte visuellement l'effet qu'il applique (gras en gras,
 * italique en italique…) — plus intuitif qu'une icône ou un sigle abstrait
 * pour un utilisateur non technique. */
const BUTTONS: { label: string; title: string; command: string; value?: string; style?: React.CSSProperties }[] = [
  { label: 'Gras', title: 'Texte en gras', command: 'bold', style: { fontWeight: 800 } },
  { label: 'Italique', title: 'Texte en italique', command: 'italic', style: { fontStyle: 'italic' } },
  { label: 'Souligné', title: 'Texte souligné', command: 'underline', style: { textDecoration: 'underline' } },
  { label: 'Titre', title: 'Transformer la ligne en titre', command: 'formatBlock', value: 'h2', style: { fontWeight: 800 } },
  { label: 'Texte normal', title: 'Revenir à un paragraphe simple', command: 'formatBlock', value: 'p' },
  { label: '• Liste', title: 'Liste à puces', command: 'insertUnorderedList' },
  { label: '1. Liste', title: 'Liste numérotée', command: 'insertOrderedList' },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 160, allowImages = false }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // Ne resynchronise que quand la valeur change depuis l'EXTÉRIEUR — sinon
    // chaque frappe reposerait le curseur au début du champ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback(() => {
    onChange(ref.current?.innerHTML ?? '');
  }, [onChange]);

  const run = (command: string, value?: string) => {
    ref.current?.focus();
    if (command === 'createLink') {
      const url = window.prompt('URL du lien :', 'https://');
      if (!url) return;
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand(command, false, value);
    }
    emit();
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await Media.upload(file, 'marketing');
      ref.current?.focus();
      document.execCommand('insertImage', false, url);
      emit();
    } catch {
      toast.error("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const buttonStyle = { padding: '6px 12px', borderRadius: '6px', border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: '12px', fontWeight: 600, cursor: 'pointer' };

  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '8px', background: BG, borderBottom: `1px solid ${BORDER}` }}>
        {BUTTONS.map((b) => (
          <button key={b.title} type="button" title={b.title} onMouseDown={(e) => e.preventDefault()} onClick={() => run(b.command, b.value)} style={{ ...buttonStyle, ...b.style }}>
            {b.label}
          </button>
        ))}
        <button type="button" title="Insérer un lien vers une page" onMouseDown={(e) => e.preventDefault()} onClick={() => run('createLink')} style={buttonStyle}>🔗 Lien</button>
        {allowImages && (
          <>
            <button type="button" title="Insérer une image" disabled={uploading} onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} style={buttonStyle}>
              {uploading ? 'Envoi…' : '🖼 Image'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const file = e.target.files?.[0]; if (file) void insertImage(file); e.target.value = ''; }} />
          </>
        )}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rich-text-editable"
        style={{ minHeight: `${minHeight}px`, padding: '12px 14px', color: TEXT, fontSize: '13px', lineHeight: 1.6, outline: 'none' }}
      />
      <style>{`
        .rich-text-editable:empty::before { content: attr(data-placeholder); color: ${TEXT2}; }
        .rich-text-editable h2 { font-size: 18px; font-weight: 700; margin: 8px 0; }
        .rich-text-editable ul, .rich-text-editable ol { padding-left: 20px; margin: 8px 0; }
        .rich-text-editable a { color: #C8974A; }
        .rich-text-editable img { max-width: 100%; border-radius: 6px; margin: 8px 0; }
      `}</style>
    </div>
  );
}
