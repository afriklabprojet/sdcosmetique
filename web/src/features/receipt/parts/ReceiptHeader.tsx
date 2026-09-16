import type { ReceiptMerchant } from '@/features/receipt/receipt.type';

export default function ReceiptHeader({ merchant }: { merchant: ReceiptMerchant }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {merchant.logo && (
        // eslint-disable-next-line @next/next/no-img-element -- logo distant configurable, jamais optimisable statiquement
        <img src={merchant.logo} alt={merchant.name} style={{ maxHeight: '56px', maxWidth: '180px', marginBottom: '8px' }} />
      )}
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: 700, color: 'var(--charcoal)' }}>
        {merchant.name}
      </div>
      {merchant.address && (
        <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)', marginTop: '4px' }}>{merchant.address}</div>
      )}
      {merchant.phone && (
        <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)' }}>{merchant.phone}</div>
      )}
      {merchant.website && (
        <div style={{ fontSize: '11px', color: 'var(--gold)' }}>{merchant.website}</div>
      )}
    </div>
  );
}
