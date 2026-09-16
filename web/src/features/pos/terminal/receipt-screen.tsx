'use client';

import { useEffect, useState } from 'react';
import type { PosSale } from '@/shared/api/admin/pos';
import { Pos } from '@/shared/api/admin/pos';
import type { ReceiptData } from '@/features/receipt/receipt.type';
import Receipt from '@/features/receipt/Receipt';
import { formatReceiptAmount } from '@/features/receipt/receipt.util';
import { SURFACE, BORDER, BORDER2, GOLD, TEXT, TEXT2 } from '@/features/admin/admin.constant';

type Props = {
  sale: PosSale;
  onNewSale: () => void;
};

/** Écran « vente terminée » (§19) — vraie prévisualisation du reçu premium, plus Imprimer/PDF/Partager. */
export default function ReceiptScreen({ sale, onNewSale }: Readonly<Props>) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    Pos.receipt(sale.id).then(setReceipt).catch(() => setReceipt(null));
  }, [sale.id]);

  const share = () => {
    if (!receipt?.receipt_url) return;

    const text = `Reçu ${receipt.sale_number} — ${formatReceiptAmount(receipt.total, receipt.currency)}\n${receipt.receipt_url}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `Reçu ${receipt.sale_number}`, text, url: receipt.receipt_url }).catch(() => {});
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px', overflowY: 'auto' }}>
      <div className="receipt-no-print" style={{ width: '100%', maxWidth: '420px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(122,197,122,0.15)', color: '#7AC57A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>✓</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>Vente terminée</h2>
        <p style={{ fontSize: '30px', fontWeight: 800, color: GOLD, margin: '0 0 20px' }}>{formatReceiptAmount(sale.total, sale.currency)}</p>

        <div style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
          {receipt ? <Receipt data={receipt} format="thermal80" mode="print" /> : (
            <p style={{ fontSize: '13px', color: TEXT2, padding: '20px' }}>Chargement du reçu…</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => window.print()}
              style={{ flex: 1, padding: '12px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: TEXT, fontSize: '13px', cursor: 'pointer' }}>
              🖨 Imprimer
            </button>
            <button type="button" onClick={() => window.open(Pos.receiptPdfUrl(sale.id, 'a4'), '_blank')}
              style={{ flex: 1, padding: '12px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: TEXT, fontSize: '13px', cursor: 'pointer' }}>
              ⬇ PDF
            </button>
            <button type="button" onClick={share} disabled={!receipt?.receipt_url}
              style={{ flex: 1, padding: '12px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '10px', color: receipt?.receipt_url ? TEXT : TEXT2, fontSize: '13px', cursor: receipt?.receipt_url ? 'pointer' : 'not-allowed' }}>
              ↗ Partager
            </button>
          </div>
          <button type="button" onClick={onNewSale}
            style={{ padding: '16px', background: GOLD, color: '#1A0E05', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>
            NOUVELLE VENTE
          </button>
        </div>
      </div>
    </div>
  );
}
