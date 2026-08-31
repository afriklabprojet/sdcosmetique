import type { OrderDraft, PaymentStatus } from '@/features/orders/order.store';
import type { Product } from '@/shared/types/domain.type';
import type { LaravelOrder, LaravelOrderDestination, LaravelOrderStatus } from '@/shared/api/types';

export type MappedOrder = OrderDraft & { id: string };

const NEXT_FROM_LARAVEL: Record<LaravelOrderStatus, OrderDraft['status']> = {
  draft: 'pending_payment',
  placed: 'pending_payment',
  paid: 'confirmed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export function mapOrderStatus(status: LaravelOrderStatus): OrderDraft['status'] {
  return NEXT_FROM_LARAVEL[status];
}

export function toLaravelOrderStatus(
  status: OrderDraft['status'],
): Extract<LaravelOrderStatus, 'shipped' | 'delivered' | 'cancelled'> | null {
  if (status === 'shipped' || status === 'delivered' || status === 'cancelled') return status;
  return null;
}

function paymentStatus(dto: LaravelOrder): PaymentStatus {
  if (dto.paid_at) return 'paid';
  if (dto.status === 'cancelled') return 'failed';
  return 'pending';
}

function splitName(destination: LaravelOrderDestination | null, email: string | null): {
  firstName: string;
  lastName: string;
} {
  if (destination?.first_name || destination?.last_name) {
    return {
      firstName: destination.first_name ?? '',
      lastName: destination.last_name ?? '',
    };
  }
  const recipient = destination?.recipient?.trim() ?? '';
  if (recipient) {
    const [first = '', ...rest] = recipient.split(/\s+/);
    return { firstName: first, lastName: rest.join(' ') };
  }
  return { firstName: email ?? '', lastName: '' };
}

function stubProduct(title: string, unitPrice: number): Product {
  return {
    id: title,
    name: title,
    slug: title,
    category: 'face',
    price: unitPrice,
    images: [],
    skinTones: [],
    badges: [],
    rating: 0,
    reviewCount: 0,
    shortDescription: '',
    description: '',
    benefits: [],
    usage: '',
    inStock: true,
  };
}

export function mapOrder(dto: LaravelOrder): MappedOrder {
  const destination = dto.destination;
  const name = splitName(destination, dto.email);

  return {
    id: dto.id != null ? String(dto.id) : dto.reference,
    orderNumber: dto.reference,
    date: dto.placed_at ?? new Date().toISOString(),
    items: dto.items.map((item) => ({
      product: stubProduct(item.title, item.unit_price),
      quantity: item.quantity,
    })),
    subtotal: dto.subtotal,
    shippingCost: dto.delivery_method?.amount ?? 0,
    total: dto.total,
    delivery: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: dto.email ?? '',
      phone: destination?.phone ?? '',
      address: [destination?.line_1, destination?.line_2].filter(Boolean).join(', '),
      city: destination?.city ?? '',
      country: destination?.country ?? '',
    },
    paymentMethod: dto.gateway ?? '',
    status: mapOrderStatus(dto.status),
    paymentStatus: paymentStatus(dto),
    shippingOptionId: dto.delivery_method ? String(dto.delivery_method.id) : undefined,
  };
}
