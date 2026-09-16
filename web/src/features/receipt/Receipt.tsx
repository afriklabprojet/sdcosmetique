import '@/features/receipt/receipt.print.css';
import type { ReceiptData, ReceiptFormat, ReceiptMode } from '@/features/receipt/receipt.type';
import ThermalReceipt from '@/features/receipt/layouts/ThermalReceipt';
import A4Receipt from '@/features/receipt/layouts/A4Receipt';
import ReceiptHeader from '@/features/receipt/parts/ReceiptHeader';
import ReceiptInfo from '@/features/receipt/parts/ReceiptInfo';
import ReceiptCustomer from '@/features/receipt/parts/ReceiptCustomer';
import ReceiptItems from '@/features/receipt/parts/ReceiptItems';
import ReceiptTotals from '@/features/receipt/parts/ReceiptTotals';
import ReceiptPayment from '@/features/receipt/parts/ReceiptPayment';
import ReceiptStatusBadge from '@/features/receipt/parts/ReceiptStatusBadge';
import ReceiptQrCode from '@/features/receipt/parts/ReceiptQrCode';
import ReceiptFooter from '@/features/receipt/parts/ReceiptFooter';

const Divider = () => <div style={{ borderTop: '1px dashed #D8C9B8', margin: '12px 0' }} />;

export type ReceiptProps = {
  data: ReceiptData;
  format: ReceiptFormat;
  /** 'print' isole le reçu du reste de la page via receipt.print.css (§25) ; 'preview' est un rendu écran normal. */
  mode?: ReceiptMode;
};

/**
 * Composant central du « Receipt Engine » (§20/§34) : une vente caisse et
 * une commande web consomment le même `ReceiptData`, seule la mise en page
 * (thermique 58/80mm ou A4) change. Modifier le design se fait ici et dans
 * `pdf.receipt.blade.php` — jamais ailleurs.
 */
export default function Receipt({ data, format, mode = 'preview' }: ReceiptProps) {
  const compact = format !== 'a4';

  const content = (
    <>
      <ReceiptHeader merchant={data.merchant} />
      <Divider />
      <ReceiptInfo data={data} />
      <Divider />
      <ReceiptCustomer customer={data.customer} />
      <Divider />
      <ReceiptItems items={data.items} currency={data.currency} compact={compact} />
      <Divider />
      <ReceiptTotals data={data} />
      <ReceiptPayment data={data} />
      <div style={{ margin: '12px 0' }}>
        <ReceiptStatusBadge status={data.status} />
      </div>
      <ReceiptQrCode qrImage={data.qr_image} />
      <ReceiptFooter merchant={data.merchant} />
    </>
  );

  const rootClassName = ['receipt-print-root', mode === 'print' ? 'receipt-print-area' : null].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      {format === 'a4' ? (
        <A4Receipt>{content}</A4Receipt>
      ) : (
        <ThermalReceipt width={format === 'thermal58' ? '58mm' : '80mm'}>{content}</ThermalReceipt>
      )}
    </div>
  );
}
