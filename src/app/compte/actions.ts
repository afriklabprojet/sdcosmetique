'use server';

import { fetchUserOrders } from '@/features/orders/order.repository';
import {
  getJekoHistory,
  redeemJekoPoints,
  fetchJekoConfig,
} from '@/features/loyalty/jeko.repository';
import type { OrderDraft } from '@/features/orders/order.store';
import type {
  JekoTransaction,
  JekoReward,
  JekoConfig,
} from '@/features/loyalty/jeko.constant';
import type { OperationResult } from '@/shared/types/operation-result.type';

export async function getUserOrdersAction(userId: string): Promise<OrderDraft[]> {
  return fetchUserOrders(userId);
}

export async function getLoyaltyHistoryAction(userId: string): Promise<JekoTransaction[]> {
  return getJekoHistory(userId);
}

export async function getLoyaltyConfigAction(): Promise<JekoConfig> {
  return fetchJekoConfig();
}

export async function redeemLoyaltyRewardAction(
  userId: string,
  reward: JekoReward,
): Promise<OperationResult> {
  return redeemJekoPoints(userId, reward);
}
