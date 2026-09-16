'use client';

import { useEffect, useState } from 'react';
import { Pos, type PosRegister } from '@/shared/api/admin/pos';
import { apiErrorMessage } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { BG, SURFACE, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

type Props = {
  onOpened: () => void;
};

/** Écran « ouvrir la caisse » (§13) — obligatoire avant toute vente. */
export default function OpenSessionScreen({ onOpened }: Readonly<Props>) {
  const [registers, setRegisters] = useState<PosRegister[]>([]);
  const [registerId, setRegisterId] = useState<number | null>(null);
  const [opening, setOpening] = useState('0');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Pos.registers()
      .then((rows) => {
        setRegisters(rows);
        const firstFree = rows.find((r) => !r.has_open_session);
        setRegisterId(firstFree?.id ?? rows[0]?.id ?? null);
      })
      .catch(() => toast.error('Impossible de charger les caisses.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (registerId === null) return;
    setBusy(true);
    try {
      await Pos.openSession(registerId, Number(opening) || 0);
      toast.success('Caisse ouverte.');
      onOpened();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Impossible d'ouvrir la caisse."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, marginBottom: '8px' }}>Module Caisse</p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: TEXT, margin: '0 0 24px' }}>Ouvrir la caisse</h1>

        {loading ? (
          <p style={{ color: TEXT2, fontSize: '13px' }}>Chargement des caisses…</p>
        ) : registers.length === 0 ? (
          <p style={{ color: TEXT2, fontSize: '13px' }}>Aucune caisse configurée. Contactez un administrateur.</p>
        ) : (
          <>
            <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Caisse</label>
            <select
              value={registerId ?? ''}
              onChange={(e) => setRegisterId(Number(e.target.value))}
              style={{ width: '100%', background: BG, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '14px 12px', fontSize: '15px', marginBottom: '20px' }}
            >
              {registers.map((r) => (
                <option key={r.id} value={r.id} disabled={r.has_open_session}>
                  {r.name}{r.location ? ` — ${r.location}` : ''}{r.has_open_session ? ' (déjà ouverte)' : ''}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Fond de caisse (FCFA)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              style={{ width: '100%', background: BG, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '14px 12px', fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'right' }}
            />

            <button
              type="button"
              onClick={submit}
              disabled={busy || registerId === null}
              style={{
                width: '100%', padding: '16px', background: GOLD, color: '#1A0E05', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? 'Ouverture…' : 'OUVRIR LA CAISSE'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
