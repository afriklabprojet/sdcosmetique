import type { ReceiptMerchant } from '@/features/receipt/receipt.type';

export default function ReceiptFooter({ merchant }: { merchant: ReceiptMerchant }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--grey-600, #666)', fontSize: '10px', lineHeight: 1.6 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px', whiteSpace: 'pre-line' }}>
        {merchant.thank_you_message || 'Merci pour votre confiance.'}
      </div>
      {merchant.website && <div>{merchant.website}</div>}
      {merchant.whatsapp && <div>{merchant.whatsapp}</div>}
      {merchant.footer_text && <div>{merchant.footer_text}</div>}
    </div>
  );
}
