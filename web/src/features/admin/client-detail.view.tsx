'use client';

/* Fiche client complète (§4) — route dédiée `/admin/clients/{id}` (seule
 * exception au patron "tout est un onglet de admin.view.tsx" de cette
 * console, demandée explicitement pour avoir une URL réelle). */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Session, Customer, CustomerMessage, Order } from '@/shared/api/admin';
import type { ClientDetail, ClientRow, CustomerMessageRow } from '@/features/admin/admin.type';
import type { MappedOrder } from '@/shared/api/mappers/order';
import { formatPrice } from '@/features/catalog/product.query';
import { formatOrderDate } from '@/features/orders/order.store';
import StatusBadge from '@/features/admin/badges/status.badge';
import SendMessageModal from '@/features/admin/send-message.modal';
import { toast } from '@/shared/ui/toast';
import { apiErrorMessage } from '@/shared/api/client';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, GOLD2, TEXT, TEXT2, TEXT3, thStyle, tdStyle } from '@/features/admin/admin.constant';

const MESSAGE_STATUS_LABELS: Record<CustomerMessageRow['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#F59E0B' },
  sent: { label: 'Envoyé', color: '#10B981' },
  failed: { label: 'Échec', color: '#EF4444' },
};

export default function ClientDetailView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [ready, setReady] = useState(false);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [messages, setMessages] = useState<CustomerMessageRow[]>([]);
  const [allClients, setAllClients] = useState<ClientRow[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [clientData, orderData, messageData] = await Promise.all([
        Customer.get(id),
        Customer.orders(id),
        CustomerMessage.list(id),
      ]);
      setClient(clientData);
      setOrders(orderData);
      setMessages(messageData);
    } catch {
      toast.error('Impossible de charger la fiche client.');
    }
  }, [id]);

  useEffect(() => {
    Session.fetch()
      .then(() => {
        setReady(true);
        void load();
        Customer.list().then(setAllClients).catch(() => {});
      })
      .catch(() => router.replace('/admin/login'));
  }, [router, load]);

  const resend = async (messageId: string) => {
    setResendingId(messageId);
    try {
      await CustomerMessage.resend(messageId);
      toast.success('Message renvoyé.');
      const messageData = await CustomerMessage.list(id);
      setMessages(messageData);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors du renvoi du message.'));
    } finally {
      setResendingId(null);
    }
  };

  if (!ready || !client) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const widgets = [
    { label: 'Commandes', value: String(client.ordersCount) },
    { label: 'Total dépensé', value: formatPrice(client.totalValue) },
    { label: 'Panier moyen', value: formatPrice(client.averageBasket) },
    { label: 'Dernière commande', value: client.lastOrderAt ? formatOrderDate(client.lastOrderAt) : '—' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '28px 24px 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Link href="/admin" style={{ fontSize: '11px', color: TEXT3, textDecoration: 'none' }}>← Retour à l&apos;administration</Link>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: TEXT, marginTop: '6px' }}>{client.name}</h1>
            <p style={{ fontSize: '12px', color: TEXT3 }}>Client depuis le {formatOrderDate(client.createdAt)}</p>
          </div>
          <button onClick={() => setShowMessageModal(true)}
            style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', background: GOLD2, color: BG, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            Envoyer un message
          </button>
        </div>

        {/* Statistiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {widgets.map((w) => (
            <div key={w.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '11px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{w.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: GOLD }}>{w.value}</p>
            </div>
          ))}
        </div>

        {/* Informations client */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '20px 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: GOLD, marginBottom: '14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Informations client</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px' }}>
            <div><span style={{ color: TEXT3 }}>E-mail</span><p style={{ color: TEXT, marginTop: '2px' }}>{client.email}</p></div>
            <div><span style={{ color: TEXT3 }}>Téléphone</span><p style={{ color: TEXT, marginTop: '2px' }}>{client.phone ?? '—'}</p></div>
            {client.whatsapp && client.whatsapp !== client.phone && (
              <div><span style={{ color: TEXT3 }}>WhatsApp</span><p style={{ color: TEXT, marginTop: '2px' }}>{client.whatsapp}</p></div>
            )}
            <div>
              <span style={{ color: TEXT3 }}>Adresse</span>
              <p style={{ color: TEXT, marginTop: '2px' }}>
                {client.address ? `${client.address.line ? client.address.line + ', ' : ''}${client.address.city ?? ''} ${client.address.country ?? ''}`.trim() : '—'}
              </p>
            </div>
            <div><span style={{ color: TEXT3 }}>Première commande</span><p style={{ color: TEXT, marginTop: '2px' }}>{client.firstOrderAt ? formatOrderDate(client.firstOrderAt) : '—'}</p></div>
            <div><span style={{ color: TEXT3 }}>Dernière commande</span><p style={{ color: TEXT, marginTop: '2px' }}>{client.lastOrderAt ? formatOrderDate(client.lastOrderAt) : '—'}</p></div>
          </div>
        </div>

        {/* Historique des commandes */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: GOLD, padding: '20px 24px 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Historique des commandes ({orders.length})
          </p>
          {orders.length === 0 ? (
            <p style={{ padding: '24px', color: TEXT3, fontSize: '12px', textAlign: 'center' }}>Aucune commande.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '12px' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ background: SURFACE2 }}>
                  <tr>{['N° commande', 'Date', 'Montant', 'Statut', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{o.orderNumber}</td>
                      <td style={tdStyle}>{formatOrderDate(o.date)}</td>
                      <td style={{ ...tdStyle, color: GOLD, fontWeight: 600 }}>{formatPrice(o.total)}</td>
                      <td style={tdStyle}><StatusBadge status={o.status} /></td>
                      <td style={tdStyle}>
                        <a href={Order.invoiceViewUrl(o)} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: GOLD, textDecoration: 'none', border: `1px solid ${BORDER2}`, borderRadius: '6px', padding: '5px 10px' }}>
                          Facture
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', paddingBottom: '4px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: GOLD, padding: '20px 24px 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Messages ({messages.length})
          </p>
          {messages.length === 0 ? (
            <p style={{ padding: '24px', color: TEXT3, fontSize: '12px', textAlign: 'center' }}>Aucun message envoyé à ce client.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '12px' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ background: SURFACE2 }}>
                  <tr>{['Sujet', 'Date', 'Statut', 'Expéditeur', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {messages.map((m) => {
                    const s = MESSAGE_STATUS_LABELS[m.status];
                    return (
                      <tr key={m.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{m.subject}</td>
                        <td style={tdStyle}>{formatOrderDate(m.createdAt)}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</span>
                        </td>
                        <td style={{ ...tdStyle, color: TEXT3 }}>{m.sentBy ?? '—'}</td>
                        <td style={tdStyle}>
                          {m.status === 'failed' && (
                            <button onClick={() => resend(m.id)} disabled={resendingId === m.id}
                              style={{ fontSize: '11px', color: TEXT2, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>
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

      {showMessageModal && (
        <SendMessageModal
          clients={allClients}
          fixedClient={{ id: client.id, name: client.name, email: client.email }}
          onClose={() => setShowMessageModal(false)}
          onSent={() => { void load(); }}
        />
      )}
    </div>
  );
}
