import { CartItem } from '@/shared/types/domain.type';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Valeurs de `orders.payment_status` en base. */
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface OrderDraft {
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  delivery: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  paymentMethod: string;
  /**
   * Avancement logistique de la commande. Ne dit RIEN sur l'argent recu :
   * seul `paymentStatus` fait foi pour savoir si la commande est payee.
   */
  status: 'pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  /**
   * Etat reel du paiement, tel que confirme par le PSP (ou par l'encaissement
   * admin pour le paiement a la livraison). Source de verite unique pour
   * decider qu'une commande est payee. Absent tant que la commande n'a pas ete
   * relue depuis la base.
   */
  paymentStatus?: PaymentStatus;
  /** Utilisé côté serveur pour recalculer les frais de port — jamais pour les frais eux-mêmes. */
  shippingOptionId?: string;
  /** Utilisé côté serveur pour recalculer la remise — jamais pour le montant de remise lui-même. */
  promoCode?: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const ORDERS_KEY = 'sd_orders';
const LAST_ORDER_KEY = 'sd_last_order';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateOrderNumber(): string {
  // base-36 timestamp (5 chars) + random suffix (3 chars) → ~1.6 milliard de combinaisons
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SD-${ts}${rnd}`;
}

export function cacheOrder(order: OrderDraft): void {
  if (globalThis.window === undefined) return;
  const existing = getOrders();
  existing.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
}

export function getLastOrder(): OrderDraft | null {
  if (globalThis.window === undefined) return null;
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as OrderDraft) : null;
  } catch {
    return null;
  }
}

export function getOrders(): OrderDraft[] {
  if (globalThis.window === undefined) return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as OrderDraft[]) : [];
  } catch {
    return [];
  }
}

export function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function updateOrderStatus(orderNumber: string, status: OrderDraft['status']): void {
  if (globalThis.window === undefined) return;
  const orders = getOrders();
  const idx = orders.findIndex(o => o.orderNumber === orderNumber);
  if (idx === -1) return;
  orders[idx].status = status;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  // update last order too if it matches
  const last = getLastOrder();
  if (last?.orderNumber === orderNumber) {
    last.status = status;
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(last));
  }
}
