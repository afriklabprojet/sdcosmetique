import type { ReceiptData } from '@/features/receipt/receipt.type';

export default function ReceiptCustomer({ customer }: { customer: ReceiptData['customer'] }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
        Client
      </div>
      {customer ? (
        <>
          <div style={{ fontSize: '12px', color: 'var(--charcoal)' }}>{customer.name}</div>
          {customer.phone && <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)' }}>{customer.phone}</div>}
        </>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--grey-600, #666)' }}>Client comptoir</div>
      )}
    </div>
  );
}
