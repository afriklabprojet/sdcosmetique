export type ReceiptItem = {
  title: string;
  label: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

export type ReceiptPayment = {
  method: string;
  label: string;
  amount: number;
  received: number | null;
  change: number;
};

export type ReceiptMerchant = {
  name: string;
  logo: string | null;
  phone: string;
  address: string;
  website: string;
  whatsapp: string;
  footer_text: string;
  thank_you_message: string;
};

export type ReceiptStatus = 'paid' | 'pending' | 'refunded' | 'partial_refund' | 'cancelled';

/** Miroir exact du JSON renvoyé par `App\Shared\Receipt\ReceiptData::build()` (backend) — une commande web et une vente caisse produisent la même forme. */
export type ReceiptData = {
  sale_number: string;
  channel: 'pos' | 'web';
  date: string | null;
  time: string | null;
  placed_at: string | null;
  merchant: ReceiptMerchant;
  cashier: { name: string } | null;
  register: { name: string } | null;
  customer: { name: string; phone: string | null } | null;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  payments: ReceiptPayment[];
  change: number;
  status: ReceiptStatus;
  qr_image: string;
  receipt_url: string;
  pdf_url: string;
};

export type ReceiptFormat = 'thermal58' | 'thermal80' | 'a4';
export type ReceiptMode = 'preview' | 'print';
