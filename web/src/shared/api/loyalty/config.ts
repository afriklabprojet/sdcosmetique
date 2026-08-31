/* eslint-disable @typescript-eslint/no-namespace */
import { fetchAdminSetting, patchAdminSetting } from '@/shared/api/settings';
import type { JekoRewardConfig, JekoSettings, JekoTierConfig } from './types';

export namespace Config {
  export async function settings(): Promise<JekoSettings> {
    const value = (await fetchAdminSetting('jeko')) as Partial<JekoSettings> | null;
    return {
      points_per_1000: value?.points_per_1000 ?? 10,
      welcome_bonus: value?.welcome_bonus ?? 20,
    };
  }

  export async function saveSettings(value: JekoSettings): Promise<void> {
    const current = ((await fetchAdminSetting('jeko')) as Record<string, unknown>) ?? {};
    await patchAdminSetting('jeko', { ...current, ...value }, false);
  }

  export async function tiers(): Promise<JekoTierConfig[]> {
    return ((await fetchAdminSetting('jeko_tiers')) as JekoTierConfig[]) ?? [];
  }

  export async function saveTiers(value: JekoTierConfig[]): Promise<void> {
    await patchAdminSetting('jeko_tiers', value, false);
  }

  export async function rewards(): Promise<JekoRewardConfig[]> {
    return ((await fetchAdminSetting('jeko_rewards')) as JekoRewardConfig[]) ?? [];
  }

  export async function saveRewards(value: JekoRewardConfig[]): Promise<void> {
    await patchAdminSetting('jeko_rewards', value, false);
  }
}
