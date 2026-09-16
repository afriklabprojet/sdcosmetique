'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Order } from '@/shared/api/checkout';
import type { ReceiptData } from '@/features/receipt/receipt.type';
import Receipt from '@/features/receipt/Receipt';

/**
 * Reçu public d'une commande (§14) — cible du QR code du reçu. Protégée par
 * la signature Laravel portée par le lien lui-même, jamais par l'e-mail du
 * client (voir `App\Shared\Receipt\ReceiptData`).
 */
export default function PublicReceiptPage() {
  const params = useParams<{ reference: string }>();
  const searchParams = useSearchParams();
  const signature = searchParams.get('signature');

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const error = !signature || fetchFailed;

  useEffect(() => {
    if (!signature) return;

    Order.receipt(params.reference, signature)
      .then(setReceipt)
      .catch(() => setFetchFailed(true));
  }, [params.reference, signature]);

  return (
    <div className="receipt-print-root" style={{ minHeight: '100vh', background: 'var(--cream)', padding: '32px 16px' }}>
      {error && (
        <p style={{ textAlign: 'center', color: '#B23B3B', fontSize: '14px' }}>
          Reçu introuvable. Vérifiez le lien fourni sur votre ticket ou votre confirmation de commande.
        </p>
      )}

      {!error && !receipt && (
        <p style={{ textAlign: 'center', color: 'var(--grey-600, #666)', fontSize: '14px' }}>Chargement du reçu…</p>
      )}

      {receipt && (
        <>
          <Receipt data={receipt} format="a4" mode="print" />
          <div className="receipt-no-print" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => window.print()}
              style={{ padding: '12px 20px', border: '1px solid var(--gold)', borderRadius: '6px', background: 'none', color: 'var(--gold)', fontSize: '13px', cursor: 'pointer' }}>
              Imprimer
            </button>
            <a href={receipt.pdf_url} target="_blank" rel="noopener noreferrer"
              style={{ padding: '12px 20px', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '13px', textDecoration: 'none' }}>
              Télécharger le PDF
            </a>
          </div>
        </>
      )}
    </div>
  );
}
