'use client';

import { useEffect, useState } from 'react';
import type { PosSale } from '@/shared/api/admin/pos';
import { Pos } from '@/shared/api/admin/pos';
import { formatReceiptAmount } from '@/features/receipt/receipt.util';
import { SURFACE, BORDER, BORDER2, GOLD, TEXT, TEXT2 } from '@/features/admin/admin.constant';

type Props = {
  sale: PosSale;
  onPaid: (sale: PosSale) => void;
  onCancelled: () => void;
};

const POLL_INTERVAL_MS = 3000;

/** Écran d'attente du paiement Jeko (§ paiement réel) — le client scanne le QR sur son téléphone ; on sonde la vente jusqu'à confirmation par webhook. */
export default function JekoWaitingScreen({ sale, onPaid, onCancelled }: Readonly<Props>) {
  const [cancelling, setCancelling] = useState(false);
  const tender = sale.tenders.find((t) => t.pending);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      Pos.sale(sale.id)
        .then((fresh) => {
          if (cancelled) return;
          if (fresh.status === 'paid') {
            onPaid(fresh);
            return;
          }
          globalThis.setTimeout(poll, POLL_INTERVAL_MS);
        })
        .catch(() => {
          if (!cancelled) globalThis.setTimeout(poll, POLL_INTERVAL_MS);
        });
    };

    const timer = globalThis.setTimeout(poll, POLL_INTERVAL_MS);

    return () => { cancelled = true; globalThis.clearTimeout(timer); };
  }, [sale.id, onPaid]);

  const cancel = async () => {
    setCancelling(true);
    try {
      await Pos.cancelSale(sale.id);
      onCancelled();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>En attente du paiement</h2>
        <p style={{ fontSize: '13px', color: TEXT2, margin: '0 0 18px' }}>Le client scanne le QR ou ouvre le lien sur son téléphone</p>

        {tender?.qr_image && (
          // eslint-disable-next-line @next/next/no-img-element -- data-URI générée par l'API
          <img src={tender.qr_image} alt="QR code de paiement Jeko" style={{ width: '180px', height: '180px', margin: '0 auto 16px', display: 'block' }} />
        )}

        <p style={{ fontSize: '26px', fontWeight: 800, color: GOLD, margin: '0 0 6px' }}>{formatReceiptAmount(sale.total, sale.currency)}</p>

        {tender?.redirect_url && (
          <a href={tender.redirect_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: GOLD, textDecoration: 'underline', display: 'block', marginBottom: '18px' }}>
            Ouvrir le lien de paiement
          </a>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: TEXT2, fontSize: '13px', marginBottom: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
          En attente de confirmation…
        </div>

        <button type="button" onClick={cancel} disabled={cancelling}
          style={{ width: '100%', padding: '14px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: TEXT2, fontSize: '14px', cursor: cancelling ? 'not-allowed' : 'pointer' }}>
          {cancelling ? 'Annulation…' : 'Annuler la vente'}
        </button>
      </div>
    </div>
  );
}
