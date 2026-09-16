import type { ReceiptData } from '@/features/receipt/receipt.type';
import { formatReceiptAmount } from '@/features/receipt/receipt.util';

/** Mode simple, mobile money ou paiement fractionné (§12) — même structure de lignes, le \"Montant reçu\"/\"Monnaie\" n'apparaît que pour un règlement espèces avec monnaie à rendre. */
export default function ReceiptPayment({ data }: { data: ReceiptData }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
        Paiement
      </div>
      {data.payments.map((payment, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
            <span style={{ color: 'var(--grey-600, #666)' }}>{payment.label}</span>
            <span style={{ color: 'var(--charcoal)' }}>{formatReceiptAmount(payment.amount, data.currency)}</span>
          </div>
          {payment.received !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0', color: 'var(--grey-600, #666)' }}>
              <span>Montant reçu</span>
              <span>{formatReceiptAmount(payment.received, data.currency)}</span>
            </div>
          )}
        </div>
      ))}
      {data.change > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', fontWeight: 600 }}>
          <span style={{ color: 'var(--grey-600, #666)' }}>Monnaie</span>
          <span style={{ color: 'var(--charcoal)' }}>{formatReceiptAmount(data.change, data.currency)}</span>
        </div>
      )}
    </div>
  );
}
