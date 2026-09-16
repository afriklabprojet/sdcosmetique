'use client';

import { useMemo, useState } from 'react';
import type { JekoNetwork, PosTenderMethod } from '@/shared/api/admin/pos';
import { JEKO_NETWORK_LABELS, TENDER_LABELS, type TenderLine } from '@/features/pos/pos.type';
import { formatPrice } from '@/shared/format/price';
import { SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, S_ERR_BG, S_ERR_T } from '@/features/admin/admin.constant';

type Props = {
  total: number;
  busy: boolean;
  /** `jekoNetwork` n'est fourni que si un tender `jeko` est présent — requis par l'API dans ce cas. */
  onConfirm: (tenders: TenderLine[], jekoNetwork?: JekoNetwork) => void;
  onCancel: () => void;
};

const METHODS: PosTenderMethod[] = ['cash', 'card', 'orange_money', 'wave', 'mtn_momo', 'moov_money', 'jeko'];
const JEKO_NETWORKS: JekoNetwork[] = ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo'];

/** Paiement en caisse (§9-§11) — espèces avec calcul de monnaie, règlement partagé entre plusieurs moyens, ou paiement Jeko réel (lien/QR, confirmé de façon asynchrone). */
export default function PaymentModal({ total, busy, onConfirm, onCancel }: Readonly<Props>) {
  const [rows, setRows] = useState<TenderLine[]>([{ method: 'cash', amount: total }]);
  const [received, setReceived] = useState(String(total));
  const [jekoNetwork, setJekoNetwork] = useState<JekoNetwork>('orange_money');

  const singleCash = rows.length === 1 && rows[0].method === 'cash';
  const jekoCount = rows.filter((r) => r.method === 'jeko').length;
  const hasJeko = jekoCount > 0;
  const sum = rows.reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  const remaining = total - sum;
  const change = singleCash ? Math.max(0, Number(received) - total) : 0;
  const canConfirm = remaining === 0 && jekoCount <= 1
    && rows.every((r) => r.amount > 0) && (!singleCash || Number(received) >= total);

  const usedMethods = useMemo(() => new Set(rows.map((r) => r.method)), [rows]);
  const nextMethod = METHODS.find((m) => !usedMethods.has(m)) ?? 'cash';

  const updateRow = (index: number, patch: Partial<TenderLine>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => {
      const usedSum = prev.reduce((s, r) => s + r.amount, 0);
      return [...prev, { method: nextMethod, amount: Math.max(0, total - usedSum) }];
    });
  };

  const removeRow = (index: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>Encaissement</h2>
        <p style={{ fontSize: '28px', fontWeight: 800, color: GOLD, margin: '0 0 20px' }}>{formatPrice(total)}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {rows.map((row, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={row.method}
                onChange={(e) => updateRow(index, { method: e.target.value as PosTenderMethod })}
                style={{ flex: 1, background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '12px', fontSize: '13px' }}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>{TENDER_LABELS[m]}</option>
                ))}
              </select>
              <input
                type="number" min={0}
                value={singleCash ? total : row.amount}
                disabled={singleCash}
                onChange={(e) => updateRow(index, { amount: Number(e.target.value) || 0 })}
                style={{ width: '120px', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '12px', fontSize: '14px', textAlign: 'right', opacity: singleCash ? 0.6 : 1 }}
              />
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(index)} style={{ background: 'none', border: 'none', color: '#E07A7A', cursor: 'pointer', fontSize: '15px' }}>✕</button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} style={{ background: 'none', border: 'none', color: GOLD, fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '18px' }}>
          + Ajouter un moyen de paiement
        </button>

        {singleCash && (
          <div style={{ background: SURFACE2, borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Montant reçu (FCFA)</label>
            <input
              type="number" min={total}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              style={{ width: '100%', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '12px', fontSize: '18px', fontWeight: 700, textAlign: 'right', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: TEXT2 }}>
              <span>Monnaie à rendre</span>
              <span style={{ fontWeight: 700, color: TEXT }}>{formatPrice(change)}</span>
            </div>
          </div>
        )}

        {!singleCash && remaining !== 0 && (
          <p style={{ background: S_ERR_BG, color: S_ERR_T, borderRadius: '8px', padding: '10px 12px', fontSize: '12px', marginBottom: '16px' }}>
            {remaining > 0 ? `Il manque ${formatPrice(remaining)}.` : `Le total dépasse de ${formatPrice(-remaining)}.`}
          </p>
        )}

        {hasJeko && (
          <div style={{ background: SURFACE2, borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Réseau Jeko</label>
            <select
              value={jekoNetwork}
              onChange={(e) => setJekoNetwork(e.target.value as JekoNetwork)}
              style={{ width: '100%', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '12px', fontSize: '13px' }}
            >
              {JEKO_NETWORKS.map((n) => (
                <option key={n} value={n}>{JEKO_NETWORK_LABELS[n]}</option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: TEXT3, margin: '8px 0 0' }}>
              Le client recevra un lien/QR à scanner sur son téléphone pour payer — la vente restera en attente jusqu’à confirmation.
            </p>
          </div>
        )}

        {jekoCount > 1 && (
          <p style={{ background: S_ERR_BG, color: S_ERR_T, borderRadius: '8px', padding: '10px 12px', fontSize: '12px', marginBottom: '16px' }}>
            Un seul règlement Jeko est autorisé par vente.
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onCancel} disabled={busy}
            style={{ flex: 1, padding: '14px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: TEXT2, fontSize: '14px', cursor: 'pointer' }}>
            Annuler
          </button>
          <button
            type="button"
            disabled={!canConfirm || busy}
            onClick={() => onConfirm(rows.map((r) => ({
              ...r,
              amount: singleCash ? total : r.amount,
              received: singleCash ? Number(received) : undefined,
            })), hasJeko ? jekoNetwork : undefined)}
            style={{
              flex: 2, padding: '14px', background: GOLD, color: '#1A0E05', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 800, cursor: canConfirm && !busy ? 'pointer' : 'not-allowed', opacity: canConfirm && !busy ? 1 : 0.5,
            }}
          >
            {busy ? 'Validation…' : 'CONFIRMER LE PAIEMENT'}
          </button>
        </div>
      </div>
    </div>
  );
}
