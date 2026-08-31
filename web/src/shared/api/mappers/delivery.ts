import type { ShippingOption } from '@/features/site-config/site-config.type';
import type { LaravelDeliveryMethod } from '@/shared/api/types';

export type MappedDelivery = ShippingOption & { slug: string; zone: string; carrier: string };

export function mapDeliveryMethod(dto: LaravelDeliveryMethod): MappedDelivery {
  return {
    id: String(dto.id),
    label: dto.name,
    description: [dto.zone, dto.carrier].filter(Boolean).join(' · '),
    cost: dto.amount,
    freeFrom: 0,
    active: dto.visible,
    slug: dto.slug,
    zone: dto.zone,
    carrier: dto.carrier,
  };
}

export function toDeliveryMethodPayload(option: ShippingOption & Partial<MappedDelivery>): {
  slug: string;
  name: string;
  zone: string;
  carrier: string;
  amount: number;
  cost: number;
  position: number;
  visible_at: string | null;
} {
  const fromLabel = option.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = option.slug ?? (fromLabel || `method-${Date.now()}`);
  return {
    slug,
    name: option.label,
    zone: option.zone || option.description || 'CI',
    carrier: option.carrier || 'local',
    amount: option.cost,
    cost: option.cost,
    position: 0,
    visible_at: option.active ? new Date().toISOString() : null,
  };
}
