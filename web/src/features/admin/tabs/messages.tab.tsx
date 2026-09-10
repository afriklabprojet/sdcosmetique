'use client';

/* Onglet «messages» de la console d'administration — messages de contact
 * (formulaire /contact) + Messages > Nouveau message / Messages envoyés
 * (§10/§11, messages individuels admin → client, distincts de Marketing Bulk). */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { type ClientRow, type ContactMessageRow, type CustomerMessageRow } from '@/features/admin/admin.type';
import { ContactMessage, CustomerMessage, Customer } from '@/shared/api/admin';
import { toast } from '@/shared/ui/toast';
import { apiErrorMessage } from '@/shared/api/client';
import SendMessageModal from '@/features/admin/send-message.modal';
import { BG, BORDER, BORDER2, GOLD, GOLD2, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

interface MessagesTabProps {
  readonly contactMessages: ContactMessageRow[];
  readonly reloadContactMessages: () => void;
}

const SENT_STATUS_LABELS: Record<CustomerMessageRow['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#F59E0B' },
  sent: { label: 'Envoyé', color: '#10B981' },
  failed: { label: 'Échec', color: '#EF4444' },
};

function ContactMessagesPanel({ contactMessages, reloadContactMessages }: MessagesTabProps) {
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
      toast.error('Erreur lors de la mise à jour du message.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
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

function SentMessagesPanel({ openNewMessage }: { readonly openNewMessage: () => void }) {
  const [messages, setMessages] = useState<CustomerMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    CustomerMessage.list()
      .then(setMessages)
      .catch(() => toast.error('Impossible de charger les messages envoyés.'))
      .finally(() => setLoading(false));
  }, []);

  const resend = async (id: string) => {
    setResendingId(id);
    try {
      await CustomerMessage.resend(id);
      toast.success('Message renvoyé.');
      const refreshed = await CustomerMessage.list();
      setMessages(refreshed);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors du renvoi du message.'));
    } finally {
      setResendingId(null);
    }
  };

  const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 };
  const tdStyle: React.CSSProperties = { padding: '12px 14px', fontSize: '12px', color: TEXT, borderTop: `1px solid ${BORDER}` };

  const totals = {
    sent: messages.filter(m => m.status === 'sent').length,
    pending: messages.filter(m => m.status === 'pending').length,
    failed: messages.filter(m => m.status === 'failed').length,
  };

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {!loading && messages.length > 0 ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: TEXT2 }}>✓ <strong style={{ color: '#10B981' }}>{totals.sent}</strong> envoyés</span>
            <span style={{ fontSize: 12, color: TEXT2 }}>⏳ <strong style={{ color: '#F59E0B' }}>{totals.pending}</strong> en attente</span>
            <span style={{ fontSize: 12, color: TEXT2 }}>✕ <strong style={{ color: totals.failed > 0 ? '#EF4444' : TEXT3 }}>{totals.failed}</strong> échoués</span>
          </div>
        ) : <span />}
        <button onClick={openNewMessage}
          style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: GOLD2, color: BG, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Nouveau message
        </button>
      </div>
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#15110B' }}>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Chargement…</p>
        ) : messages.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucun message envoyé pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>{['Client', 'E-mail', 'Sujet', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {messages.map(m => {
                  const s = SENT_STATUS_LABELS[m.status];
                  return (
                    <tr key={m.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        <Link href={`/admin/clients/${m.clientId}`} style={{ color: GOLD, textDecoration: 'none' }}>{m.clientName ?? `Client #${m.clientId}`}</Link>
                      </td>
                      <td style={{ ...tdStyle, color: TEXT3 }}>{m.recipientEmail}</td>
                      <td style={tdStyle}>{m.subject}</td>
                      <td style={{ ...tdStyle, color: TEXT3 }}>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</span>
                      </td>
                      <td style={tdStyle}>
                        {m.status === 'failed' && (
                          <button onClick={() => resend(m.id)} disabled={resendingId === m.id}
                            style={{ fontSize: 11, color: TEXT2, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                            {resendingId === m.id ? '…' : 'Renvoyer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesTab({ contactMessages, reloadContactMessages }: MessagesTabProps) {
  const [subTab, setSubTab] = useState<'contact' | 'envoyes'>('contact');
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [sentRefreshKey, setSentRefreshKey] = useState(0);
  const openCount = contactMessages.filter(m => m.open).length;

  useEffect(() => { Customer.list().then(setClients).catch(() => {}); }, []);

  const subTabs: { id: typeof subTab; label: string }[] = [
    { id: 'contact', label: `Formulaire de contact${openCount > 0 ? ` (${openCount})` : ''}` },
    { id: 'envoyes', label: 'Messages envoyés' },
  ];

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: TEXT }}>Messages</h1>
          <p className="text-xs" style={{ color: TEXT3 }}>Formulaire de contact et messages individuels envoyés aux clients.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${BORDER}`, paddingBottom: 4 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', border: 'none', borderBottom: subTab === t.id ? `2px solid ${GOLD}` : '2px solid transparent', background: 'transparent', color: subTab === t.id ? GOLD : TEXT2, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'contact' && <ContactMessagesPanel contactMessages={contactMessages} reloadContactMessages={reloadContactMessages} />}
      {subTab === 'envoyes' && <SentMessagesPanel key={sentRefreshKey} openNewMessage={() => setShowNewMessage(true)} />}

      {showNewMessage && (
        <SendMessageModal
          clients={clients}
          onClose={() => setShowNewMessage(false)}
          onSent={() => { setSubTab('envoyes'); setSentRefreshKey(k => k + 1); }}
        />
      )}
    </div>
  );
}
