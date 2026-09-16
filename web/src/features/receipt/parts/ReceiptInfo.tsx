import type { ReceiptData } from '@/features/receipt/receipt.type';

export default function ReceiptInfo({ data }: { data: ReceiptData }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        Reçu de vente
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)', marginTop: '2px' }}>N° {data.sale_number}</div>
      <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)', marginTop: '2px' }}>
        {data.date} · {data.time}
      </div>
      {data.cashier && (
        <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)' }}>Vendeur : {data.cashier.name}</div>
      )}
      {data.register && (
        <div style={{ fontSize: '11px', color: 'var(--grey-600, #666)' }}>Caisse : {data.register.name}</div>
      )}
    </div>
  );
}
