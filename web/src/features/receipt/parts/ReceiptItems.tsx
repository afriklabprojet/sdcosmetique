import type { ReceiptItem } from '@/features/receipt/receipt.type';
import { formatReceiptAmount } from '@/features/receipt/receipt.util';

/** Deux présentations distinctes (§7) : compacte pour le ticket thermique, tableau colonné pour le PDF A4 — jamais la même mise en page réduite. */
export default function ReceiptItems({ items, currency, compact }: { items: ReceiptItem[]; currency: string; compact: boolean }) {
  if (compact) {
    return (
      <div>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--charcoal)' }}>{item.title}</div>
            {item.label && <div style={{ fontSize: '10px', color: 'var(--grey-600, #666)' }}>{item.label}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
              <span style={{ color: 'var(--grey-600, #666)' }}>{item.quantity} × {formatReceiptAmount(item.unit_price, currency)}</span>
              <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{formatReceiptAmount(item.total, currency)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr>
          {['Article', 'Qté', 'Prix', 'Total'].map((h, i) => (
            <th key={h} style={{
              textAlign: i === 0 ? 'left' : 'right', padding: '6px 4px', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.04em', color: 'var(--gold)', borderBottom: '1px solid var(--gold-pale)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td style={{ padding: '6px 4px', borderBottom: '1px solid var(--cream)' }}>
              <div>{item.title}</div>
              {item.label && <div style={{ fontSize: '10px', color: 'var(--grey-600, #666)' }}>{item.label}</div>}
            </td>
            <td style={{ padding: '6px 4px', textAlign: 'right', borderBottom: '1px solid var(--cream)' }}>{item.quantity}</td>
            <td style={{ padding: '6px 4px', textAlign: 'right', borderBottom: '1px solid var(--cream)' }}>{formatReceiptAmount(item.unit_price, currency)}</td>
            <td style={{ padding: '6px 4px', textAlign: 'right', borderBottom: '1px solid var(--cream)', fontWeight: 600 }}>{formatReceiptAmount(item.total, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
