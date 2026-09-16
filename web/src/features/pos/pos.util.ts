import type { CartLine, DiscountInput } from '@/features/pos/pos.type';

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pos-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.product.unit_price * line.quantity, 0);
}

export function discountAmount(subtotal: number, discount: DiscountInput | null): number {
  if (!discount || discount.value <= 0) return 0;
  const amount = discount.type === 'percent' ? Math.round((subtotal * discount.value) / 100) : discount.value;
  return Math.min(amount, subtotal);
}

export function cartTotal(lines: CartLine[], discount: DiscountInput | null): number {
  const subtotal = cartSubtotal(lines);
  return subtotal - discountAmount(subtotal, discount);
}
