'use client';

import { useState } from 'react';
import type { PosSession } from '@/shared/api/admin/pos';
import { Pos } from '@/shared/api/admin/pos';
import { TENDER_LABELS } from '@/features/pos/pos.type';
import { apiErrorMessage } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { formatPrice } from '@/shared/format/price';
import { SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, S_ERR_BG, S_ERR_T, S_OK_BG, S_OK_T } from '@/features/admin/admin.constant';

type Props = {
  session: PosSession;
  onClosed: () => void;
  onCancel: () => void;
};

/** Fermeture de caisse (§14) — résumé des ventes, comptage, écart affiché avant confirmation. */
export default function CloseSessionModal({ session, onClosed, onCancel }: Readonly<Props>) {
  const [actual, setActual] = useState(String(session.opening_balance));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const cashSales = session.totals_by_method['cash'] ?? 0;
  const expected = session.opening_balance + cashSales;
  const counted = Number(actual) || 0;
  const difference = counted - expected;

  const confirm = async () => {
    setBusy(true);
    try {
      await Pos.closeSession(session.id, counted, notes || undefined);
      toast.success('Caisse fermée.');
      onClosed();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Impossible de fermer la caisse.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 18px' }}>Résumé de caisse</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: TEXT2, marginBottom: '18px' }}>
          <Row label="Fond initial" value={formatPrice(session.opening_balance)} />
          {Object.entries(session.totals_by_method).map(([method, amount]) => (
            <Row key={method} label={`Ventes ${TENDER_LABELS[method as keyof typeof TENDER_LABELS] ?? method}`} value={formatPrice(amount)} />
          ))}
          <div style={{ height: 1, background: BORDER, margin: '4px 0' }} />
          <Row label="Espèces attendues" value={formatPrice(expected)} bold />
        </div>

        <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Espèces comptées (FCFA)</label>
        <input
          type="number" min={0} value={actual} onChange={(e) => setActual(e.target.value)} autoFocus
          style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '14px', fontSize: '18px', fontWeight: 700, textAlign: 'right', marginBottom: '14px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', background: difference === 0 ? S_OK_BG : S_ERR_BG, color: difference === 0 ? S_OK_T : S_ERR_T }}>
          <span style={{ fontSize: '13px' }}>Différence</span>
          <span style={{ fontSize: '16px', fontWeight: 800 }}>{difference > 0 ? '+' : ''}{formatPrice(difference)}</span>
        </div>

        <textarea
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px', marginBottom: '18px', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onCancel} disabled={busy}
            style={{ flex: 1, padding: '14px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: TEXT2, fontSize: '14px', cursor: 'pointer' }}>
            Annuler
          </button>
          <button type="button" onClick={confirm} disabled={busy}
            style={{ flex: 2, padding: '14px', background: GOLD, color: '#1A0E05', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Fermeture…' : 'FERMER LA CAISSE'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: Readonly<{ label: string; value: string; bold?: boolean }>) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 700 : 400, color: bold ? TEXT : undefined }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
