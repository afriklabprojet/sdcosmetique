import { mapStorefrontProduct } from '@/shared/api/mappers/product';
import type { LaravelCart, LaravelCartItem, LaravelStorefrontDeliveryMethod } from '@/shared/api/types';
import type { CartItem } from '@/shared/types/domain.type';
import type { ShippingOption } from '@/features/site-config/site-config.type';

export type MappedCart = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

export function mapCartItem(dto: LaravelCartItem): CartItem {
  const product = mapStorefrontProduct({
    ...dto.product,
    price: dto.child.price,
    children: dto.product.children,
  });
  return {
    product: {
      ...product,
      variantSlug: dto.child.slug,
    },
    quantity: dto.quantity,
    lineId: dto.id,
  };
}

export function mapCart(dto: LaravelCart): MappedCart {
  return {
    items: dto.items.map(mapCartItem),
    subtotal: dto.subtotal,
    discount: dto.discount,
    total: dto.total,
    couponCode: dto.coupon?.code ?? null,
  };
}

export function mapStorefrontDeliveryMethod(dto: LaravelStorefrontDeliveryMethod): ShippingOption {
  return {
    id: String(dto.id),
    label: dto.name,
    description: dto.zone,
    cost: dto.amount,
    freeFrom: 0,
    active: true,
  };
}

export function sellableSlug(product: { variantSlug?: string; slug: string }): string {
  return product.variantSlug ?? product.slug;
}
