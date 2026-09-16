'use client';

import { useMemo, useState } from 'react';
import { Pos, type PosSale, type PosTenderMethod } from '@/shared/api/admin/pos';
import { TENDER_LABELS } from '@/features/pos/pos.type';
import { apiErrorMessage } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { formatPrice } from '@/shared/format/price';
import { SURFACE, SURFACE2, BORDER, BORDER2, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

type Props = {
  sale: PosSale;
  onRefunded: (sale: PosSale) => void;
  onCancel: () => void;
};

const METHODS: PosTenderMethod[] = ['cash', 'card', 'orange_money', 'wave', 'mtn_momo', 'moov_money'];

/**
 * Remboursement total ou partiel par ligne (§21) — par défaut, tout ce qui
 * reste sur la vente ; le vendeur peut décocher "tout rembourser" pour ne
 * choisir que certains articles/quantités. Le montant affiché est une
 * estimation côté navigateur (même règle de remise proportionnelle que le
 * serveur) — c'est toujours Laravel qui a le dernier mot sur le montant réel.
 */
export default function RefundModal({ sale, onRefunded, onCancel }: Readonly<Props>) {
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState<PosTenderMethod>('cash');
  const [refundAll, setRefundAll] = useState(true);
  const [busy, setBusy] = useState(false);

  const refundableItems = useMemo(
    () => sale.items.filter((item) => item.quantity - item.refunded_quantity > 0),
    [sale.items],
  );

  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(refundableItems.map((item) => [item.id, 0])),
  );

  const discountRatio = sale.subtotal > 0 ? Math.max(0, 1 - sale.total / sale.subtotal) : 0;

  const estimatedAmount = refundableItems.reduce((sum, item) => {
    const remaining = item.quantity - item.refunded_quantity;
    const qty = refundAll ? remaining : Math.min(quantities[item.id] ?? 0, remaining);
    return sum + Math.round(item.unit_price * qty * (1 - discountRatio));
  }, 0);

  const nothingSelected = !refundAll && refundableItems.every((item) => (quantities[item.id] ?? 0) === 0);

  const submit = async () => {
    if (!reason.trim() || nothingSelected) return;
    setBusy(true);
    try {
      const items = refundAll
        ? undefined
        : refundableItems
          .filter((item) => (quantities[item.id] ?? 0) > 0)
          .map((item) => ({ order_item_id: item.id, quantity: quantities[item.id] }));

      const updated = await Pos.refund(sale.id, reason.trim(), method, items);
      toast.success('Remboursement enregistré.');
      onRefunded(updated);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Remboursement impossible.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>Rembourser {sale.reference}</h2>
        <p style={{ fontSize: '12px', color: TEXT2, margin: '0 0 16px' }}>
          Le stock des articles rendus est restauré automatiquement. Cette action est définitive.
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: TEXT, marginBottom: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={refundAll} onChange={(e) => setRefundAll(e.target.checked)} />
          Rembourser tout ce qui reste ({refundableItems.reduce((s, i) => s + (i.quantity - i.refunded_quantity), 0)} article(s))
        </label>

        {!refundAll && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {refundableItems.map((item) => {
              const remaining = item.quantity - item.refunded_quantity;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: SURFACE2, borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: TEXT, margin: 0 }}>{item.title}{item.label ? ` — ${item.label}` : ''}</p>
                    <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>{remaining} restant(s) sur {item.quantity}</p>
                  </div>
                  <input
                    type="number" min={0} max={remaining}
                    value={quantities[item.id] ?? 0}
                    onChange={(e) => setQuantities((q) => ({ ...q, [item.id]: Math.max(0, Math.min(remaining, Number(e.target.value) || 0)) }))}
                    style={{ width: '64px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '6px', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Remboursé via</label>
        <select value={method} onChange={(e) => setMethod(e.target.value as PosTenderMethod)}
          style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px', marginBottom: '14px' }}>
          {METHODS.map((m) => <option key={m} value={m}>{TENDER_LABELS[m]}</option>)}
        </select>

        <textarea
          placeholder="Motif du remboursement"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px', marginBottom: '14px', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TEXT2, marginBottom: '18px' }}>
          <span>Montant estimé</span>
          <span style={{ fontWeight: 700, color: TEXT }}>{formatPrice(estimatedAmount)}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onCancel} disabled={busy}
            style={{ flex: 1, padding: '12px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT2, cursor: 'pointer' }}>
            Annuler
          </button>
          <button type="button" onClick={submit} disabled={busy || !reason.trim() || nothingSelected}
            style={{ flex: 1, padding: '12px', background: '#4A1D1D', border: 'none', borderRadius: '8px', color: '#FCA5A5', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', opacity: (!reason.trim() || nothingSelected) ? 0.5 : 1 }}>
            {busy ? 'Traitement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
