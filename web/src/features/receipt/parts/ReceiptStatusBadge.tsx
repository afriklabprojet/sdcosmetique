import type { ReceiptStatus } from '@/features/receipt/receipt.type';
import { receiptStatusLabel } from '@/features/receipt/receipt.util';

const COLORS: Record<ReceiptStatus, string> = {
  paid: '#3B7A4A',
  pending: '#9A6B1E',
  refunded: '#B23B3B',
  partial_refund: '#9A6B1E',
  cancelled: '#B23B3B',
};

export default function ReceiptStatusBadge({ status }: { status: ReceiptStatus }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.06em', color: '#fff', background: COLORS[status] ?? '#666',
      }}>
        {receiptStatusLabel(status)}
      </span>
    </div>
  );
}
