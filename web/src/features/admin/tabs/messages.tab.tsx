'use client';

/* Onglet «messages» de la console d'administration — lecture des messages du formulaire de contact. */

import React, { useState } from 'react';
import { type ContactMessageRow } from '@/features/admin/admin.type';
import { ContactMessage } from '@/shared/api/admin';
import { BG, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

interface MessagesTabProps {
  readonly contactMessages: ContactMessageRow[];
  readonly reloadContactMessages: () => void;
}

export default function MessagesTab({ contactMessages, reloadContactMessages }: MessagesTabProps) {
  const [filter, setFilter] = useState<'open' | 'handled' | 'all'>('open');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = contactMessages.filter(m => {
    if (filter === 'open') return m.open;
    if (filter === 'handled') return !m.open;
    return true;
  });
  const openCount = contactMessages.filter(m => m.open).length;

  const setHandled = async (m: ContactMessageRow, handled: boolean) => {
    setBusyId(m.id);
    try {
      await ContactMessage.setHandled(m.id, handled);
      reloadContactMessages();
    } catch {
      alert('Erreur lors de la mise à jour du message.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: TEXT }}>Messages de contact</h1>
          <p className="text-xs" style={{ color: TEXT3 }}>Messages reçus depuis le formulaire /contact.</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {([
          { id: 'open', label: `À traiter${openCount > 0 ? ` (${openCount})` : ''}` },
          { id: 'handled', label: 'Traités' },
          { id: 'all', label: 'Tous' },
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${filter === f.id ? GOLD : BORDER}`, background: filter === f.id ? 'rgba(200,151,74,0.12)' : 'transparent', color: filter === f.id ? GOLD : TEXT2, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 10, background: '#15110B' }}>
            Aucun message.
          </div>
        )}
        {filtered.map(m => {
          const isOpen = expanded === m.id;
          return (
            <div key={m.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, background: '#15110B', overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : m.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: m.open ? '#F59E0B' : '#3FA76B' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: TEXT3 }}>{m.email}</span>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.subject || m.message}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: TEXT3, flexShrink: 0 }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: '14px 0' }}>{m.message}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`mailto:${m.email}`}
                      style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                      Répondre par e-mail
                    </a>
                    <button
                      onClick={() => setHandled(m, !m.open ? false : true)}
                      disabled={busyId === m.id}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: m.open ? GOLD : 'transparent', color: m.open ? BG : TEXT2, fontSize: 11, fontWeight: 700, cursor: 'pointer', ...(m.open ? {} : { border: `1px solid ${BORDER2}` }) }}>
                      {m.open ? 'Marquer traité' : 'Rouvrir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
