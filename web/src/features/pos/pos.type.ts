import type { JekoNetwork, PosProduct, PosTenderMethod } from '@/shared/api/admin/pos';

export type CartLine = {
  product: PosProduct;
  quantity: number;
};

export type DiscountInput = { type: 'fixed' | 'percent'; value: number };

export type CustomerSelection =
  | { mode: 'walkin'; name: string; phone: string; email: string }
  | { mode: 'client'; clientId: number; name: string; phone: string | null };

export type TenderLine = { method: PosTenderMethod; amount: number; received?: number };

export const TENDER_LABELS: Record<PosTenderMethod, string> = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  jeko: 'Jeko (paiement en ligne)',
};

export const JEKO_NETWORK_LABELS: Record<JekoNetwork, string> = {
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  djamo: 'Djamo',
};
