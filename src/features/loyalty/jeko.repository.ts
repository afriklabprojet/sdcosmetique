'use server';

/**
 * jeko.repository.ts — Système de fidélité "SDZ Fidélité" avec Drizzle ORM.
 */
import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users, jekoTransactions, jekoConfig } from '@/shared/db/schema';
import type { OperationResult } from '@/shared/types/operation-result.type';
import {
  JEKO_TIERS,
  JEKO_REWARDS,
  type JekoTransaction,
  type JekoReward,
  type JekoConfig,
  type JekoTier,
} from './jeko.constant';

export type { JekoTransaction, JekoReward, JekoConfig, JekoTier };

export async function fetchJekoConfig(): Promise<JekoConfig> {
  try {
    const data = await db.select().from(jekoConfig);
    if (!data?.length) {
      return { settings: { points_per_1000: 10, welcome_bonus: 20 }, tiers: JEKO_TIERS, rewards: JEKO_REWARDS };
    }

    const byKey = Object.fromEntries(data.map(r => [r.key, r.value]));
    return {
      settings: (byKey['settings'] as JekoConfig['settings']) ?? { points_per_1000: 10, welcome_bonus: 20 },
      tiers:    (byKey['tiers']    as JekoTier[])              ?? JEKO_TIERS,
      rewards:  (byKey['rewards']  as JekoReward[])            ?? JEKO_REWARDS,
    };
  } catch {
    return { settings: { points_per_1000: 10, welcome_bonus: 20 }, tiers: JEKO_TIERS, rewards: JEKO_REWARDS };
  }
}

export async function getJekoHistory(userId: string): Promise<JekoTransaction[]> {
  try {
    const data = await db
      .select()
      .from(jekoTransactions)
      .where(eq(jekoTransactions.userId, userId))
      .orderBy(desc(jekoTransactions.createdAt))
      .limit(50);

    return data.map(r => ({
      id: r.id,
      points: r.points,
      reason: r.reason as JekoTransaction['reason'],
      label: r.label,
      reference_id: r.referenceId,
      created_at: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function redeemJekoPoints(
  userId: string,
  reward: JekoReward,
): Promise<OperationResult> {
  try {
    const userRows = await db.select({ points: users.points }).from(users).where(eq(users.id, userId)).limit(1);
    if (!userRows.length || userRows[0].points < reward.pts) {
      return { ok: false, error: 'Solde de points insuffisant.' };
    }

    await db.transaction(async (tx) => {
      await tx.insert(jekoTransactions).values({
        userId,
        points: -reward.pts,
        reason: 'redemption',
        label: `Récompense utilisée : ${reward.label}`,
        referenceId: null,
      });

      await tx.update(users).set({
        points: userRows[0].points - reward.pts,
      }).where(eq(users.id, userId));
    });

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: msg };
  }
}
