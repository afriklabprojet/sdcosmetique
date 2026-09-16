import type { ReceiptData } from '@/features/receipt/receipt.type';
import { formatReceiptAmount } from '@/features/receipt/receipt.util';

/** Le TOTAL est le point visuel principal du reçu (§11) — encadré, fort contraste. Remise/taxe n'apparaissent que si non nulles (§9/§10). */
export default function ReceiptTotals({ data }: { data: ReceiptData }) {
  const row = (label: string, value: string, opts?: { negative?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
      <span style={{ color: 'var(--grey-600, #666)' }}>{label}</span>
      <span style={{ color: 'var(--charcoal)' }}>{opts?.negative ? '-' : ''}{value}</span>
    </div>
  );

  return (
    <div>
      {row('Sous-total', formatReceiptAmount(data.subtotal, data.currency))}
      {data.discount > 0 && row('Remise', formatReceiptAmount(data.discount, data.currency), { negative: true })}
      {data.tax > 0 && row('Taxe', formatReceiptAmount(data.tax, data.currency))}

      <div style={{
        background: 'var(--gold)', color: '#fff', borderRadius: '6px', padding: '14px 16px', margin: '12px 0', textAlign: 'center',
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-pale)', marginBottom: '4px' }}>Total</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700 }}>{formatReceiptAmount(data.total, data.currency)}</div>
      </div>
    </div>
  );
}
