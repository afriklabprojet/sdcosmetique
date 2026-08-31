import type { PromoCode } from '@/features/site-config/site-config.type';
import type { LaravelCoupon } from '@/shared/api/types';

export type MappedCoupon = PromoCode & { id: string };

export function mapCoupon(dto: LaravelCoupon): MappedCoupon {
  return {
    id: String(dto.id),
    code: dto.code,
    type: dto.type === 'percentage' ? 'percent' : 'fixed',
    value: dto.value,
    minSubtotal: dto.threshold ?? undefined,
    active: dto.active,
    expiresAt: dto.ends_at,
  };
}

export function toCouponPayload(code: PromoCode): {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  threshold: number | null;
  starts_at: string;
  ends_at: string;
} {
  const ends = code.expiresAt && code.expiresAt !== ''
    ? code.expiresAt
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const starts = new Date().toISOString();
  return {
    code: code.code.trim().toUpperCase(),
    type: code.type === 'percent' ? 'percentage' : 'fixed',
    value: code.value,
    threshold: code.minSubtotal ?? null,
    starts_at: starts,
    ends_at: ends,
  };
}
