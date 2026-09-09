'use client';

/*
 * Sous-onglet «Transactions» de l'onglet Paiement — lecture seule des
 * paiements et des notifications webhook reçues, pour le support/débogage.
 * `/admin/payments` et `/admin/payment-notifications` n'avaient aucune vue
 * admin avant cette panel.
 */

import React, { useEffect, useState } from 'react';
import { type AdminPaymentRow, type AdminPaymentNotificationRow } from '@/features/admin/admin.type';
import { Payment, PaymentNotification } from '@/shared/api/admin';
import { BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

const STATUS_LABELS: Record<AdminPaymentRow['status'], { label: string; color: string }> = {
  paid: { label: 'Payé', color: '#3FA76B' },
  failed: { label: 'Échoué', color: '#DC6C6C' },
  pending: { label: 'En attente', color: '#F59E0B' },
};

function formatAmount(amount: number | null, currency: string | null): string {
  if (amount === null) return '—';
  return `${amount.toLocaleString('fr-FR')} ${currency ?? ''}`.trim();
}

export default function PaymentTransactionsPanel() {
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [notifications, setNotifications] = useState<AdminPaymentNotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payloadById, setPayloadById] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    Promise.all([Payment.list(), PaymentNotification.list()])
      .then(([p, n]) => { setPayments(p); setNotifications(n); })
      .finally(() => setLoading(false));
  }, []);

  const openNotification = async (row: AdminPaymentNotificationRow) => {
    const next = expanded === row.id ? null : row.id;
    setExpanded(next);
    if (next && !payloadById[row.id]) {
      try {
        const full = await PaymentNotification.show(row.id);
        if (full.payload) setPayloadById(prev => ({ ...prev, [row.id]: full.payload! }));
      } catch {
        // Le payload restera masqué si la requête échoue ; la ligne reste consultable.
      }
    }
  };

  if (loading) {
    return <p style={{ fontSize: 12, color: TEXT3 }}>Chargement des transactions…</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Paiements ── */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Paiements ({payments.length})</h3>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#15110B' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 10, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <div>Commande</div>
            <div>Montant</div>
            <div>Statut</div>
            <div>Date</div>
          </div>
          {payments.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucun paiement.</div>
          )}
          {payments.map(p => {
            const st = STATUS_LABELS[p.status];
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 12, color: TEXT, alignItems: 'center' }}>
                <div>{p.orderReference ?? '—'}</div>
                <div>{formatAmount(p.amount, p.currency)}</div>
                <div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: `${st.color}22`, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ color: TEXT2, fontSize: 11 }}>{new Date(p.created_at).toLocaleString('fr-FR')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Notifications webhook ── */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Notifications webhook ({notifications.length})</h3>
        <p style={{ fontSize: 11, color: TEXT3, marginBottom: 10 }}>Chaque appel reçu sur /webhooks/&#123;terminal&#125;, avant et après vérification de signature.</p>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#15110B' }}>
          {notifications.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucune notification reçue.</div>
          )}
          {notifications.map(n => {
            const isOpen = expanded === n.id;
            return (
              <div key={n.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => openNotification(n)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: n.done ? '#3FA76B' : n.failureReason ? '#DC6C6C' : '#F59E0B' }} />
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: GOLD, fontWeight: 700, width: 70, flexShrink: 0 }}>{n.gateway}</span>
                  <span style={{ flex: 1, fontSize: 12, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.reference}</span>
                  {n.failureReason && !n.done && (
                    <span style={{ fontSize: 11, color: '#DC6C6C', flexShrink: 0 }}>{n.failureReason}</span>
                  )}
                  <span style={{ fontSize: 11, color: TEXT3, flexShrink: 0 }}>{new Date(n.created_at).toLocaleString('fr-FR')}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <pre style={{
                      margin: 0, padding: 12, borderRadius: 8, border: `1px solid ${BORDER2}`, background: '#0F0B07',
                      fontSize: 11, color: TEXT2, overflowX: 'auto', maxHeight: 260, overflowY: 'auto',
                    }}>
                      {payloadById[n.id] ? JSON.stringify(payloadById[n.id], null, 2) : 'Chargement du payload…'}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
