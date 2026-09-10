'use client';

/* Modale « Envoyer un message » (§5) — recyclée par la fiche client (destinataire
 * fixé) et par Messages > Nouveau message (§10, recherche du destinataire). */

import React, { useMemo, useState } from 'react';
import RichTextEditor from '@/shared/ui/rich-text.editor';
import { Customer } from '@/shared/api/admin';
import { apiErrorMessage } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import type { ClientRow } from '@/features/admin/admin.type';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD2, TEXT, TEXT2, TEXT3, inputStyle } from '@/features/admin/admin.constant';

interface SendMessageModalProps {
  readonly clients: ClientRow[];
  readonly fixedClient?: { id: string; name: string; email: string } | null;
  readonly onClose: () => void;
  readonly onSent: () => void;
}

export default function SendMessageModal({ clients, fixedClient, onClose, onSent }: SendMessageModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ClientRow | null>(
    fixedClient ? { id: fixedClient.id, name: fixedClient.name, email: fixedClient.email, orders: 0, total: 0, lastDate: '' } : null,
  );
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const results = useMemo(() => {
    if (fixedClient || search.trim().length < 2) return [];
    const q = search.trim().toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 8);
  }, [clients, search, fixedClient]);

  const send = async () => {
    if (!selected || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await Customer.sendMessage(selected.id, { subject: subject.trim(), body });
      toast.success('Message envoyé avec succès.');
      onSent();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'envoi du message."));
    } finally {
      setSending(false);
    }
  };

  const labelStyle = { fontSize: '11px', color: TEXT2, marginBottom: '6px', display: 'block' as const, fontWeight: 600 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <button type="button" onClick={onClose} aria-label="Fermer" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: TEXT }}>Envoyer un message</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={labelStyle}>Canal</span>
            <div style={{ padding: '8px 12px', background: BG, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT2, fontSize: '12px' }}>E-mail</div>
          </div>

          <div style={{ position: 'relative' }}>
            <span style={labelStyle}>Destinataire</span>
            {fixedClient || selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: BG, border: `1px solid ${BORDER2}`, borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: TEXT }}>{selected?.name} <span style={{ color: TEXT3 }}>— {selected?.email}</span></span>
                {!fixedClient && (
                  <button onClick={() => { setSelected(null); setSearch(''); }} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: '11px', cursor: 'pointer' }}>Changer</button>
                )}
              </div>
            ) : (
              <>
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, téléphone, e-mail…" style={inputStyle} />
                {results.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden', zIndex: 10 }}>
                    {results.map((c) => (
                      <button key={c.id} onClick={() => setSelected(c)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: TEXT }}>
                        {c.name} <span style={{ color: TEXT3 }}>— {c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <label>
            <span style={labelStyle}>Sujet</span>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} placeholder="Sujet du message" />
          </label>

          <div>
            <span style={labelStyle}>Message</span>
            <RichTextEditor value={body} onChange={setBody} placeholder="Écrivez votre message…" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: '8px', border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={send} disabled={!selected || !subject.trim() || !body.trim() || sending}
            style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: GOLD2, color: BG, fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: (!selected || !subject.trim() || !body.trim() || sending) ? 0.5 : 1 }}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}
