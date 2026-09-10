/* eslint-disable @typescript-eslint/no-namespace */
import { api, apiUrl, type Paginated } from '@/shared/api/client';
import { mapMarketingCampaign, mapMarketingCampaignRecipient } from '@/shared/api/mappers/marketing-campaign';
import type { LaravelMarketingCampaign, LaravelMarketingCampaignRecipient, MarketingAudienceType } from '@/shared/api/types';
import type { MarketingCampaignRecipientRow, MarketingCampaignRow } from '@/features/admin/admin.type';

export type CampaignDraft = {
  name: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  content: string;
  audience_type: MarketingAudienceType;
  audience_client_ids?: string[];
};

/** Marketing Bulk (§6-§9) — campagnes groupées, distinctes des messages individuels (`CustomerMessage`). */
export namespace MarketingCampaign {
  export async function list(): Promise<MarketingCampaignRow[]> {
    const body = await api<Paginated<LaravelMarketingCampaign>>('/admin/marketing-campaigns?perPage=100');
    return body.data.map(mapMarketingCampaign);
  }

  export async function get(id: string): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}`);
    return mapMarketingCampaign(body.data);
  }

  export async function create(draft: CampaignDraft): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>('/admin/marketing-campaigns', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
    return mapMarketingCampaign(body.data);
  }

  export async function update(id: string, draft: CampaignDraft): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(draft),
    });
    return mapMarketingCampaign(body.data);
  }

  export async function discard(id: string): Promise<void> {
    await api(`/admin/marketing-campaigns/${id}`, { method: 'DELETE' });
  }

  /** Compteur "Nombre de destinataires" en direct pendant la composition (§6). */
  export async function audienceCount(audienceType: MarketingAudienceType, audienceClientIds?: string[]): Promise<number> {
    const body = await api<{ data: { count: number } }>('/admin/marketing-campaigns/audience-count', {
      method: 'POST',
      body: JSON.stringify({ audience_type: audienceType, audience_client_ids: audienceClientIds }),
    });
    return body.data.count;
  }

  /** URL d'aperçu — rendu HTML réel dans un `<iframe>`. */
  export function previewUrl(id: string): string {
    return apiUrl(`/admin/marketing-campaigns/${id}/preview`);
  }

  export async function sendTest(id: string, testEmail: string): Promise<void> {
    await api(`/admin/marketing-campaigns/${id}/send-test`, {
      method: 'POST',
      body: JSON.stringify({ test_email: testEmail }),
    });
  }

  export async function send(id: string): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}/send`, { method: 'POST' });
    return mapMarketingCampaign(body.data);
  }

  export async function cancel(id: string): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}/cancel`, { method: 'POST' });
    return mapMarketingCampaign(body.data);
  }

  export async function retryFailed(id: string): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}/retry-failed`, { method: 'POST' });
    return mapMarketingCampaign(body.data);
  }

  export async function duplicate(id: string): Promise<MarketingCampaignRow> {
    const body = await api<{ data: LaravelMarketingCampaign }>(`/admin/marketing-campaigns/${id}/duplicate`, { method: 'POST' });
    return mapMarketingCampaign(body.data);
  }

  export async function recipients(id: string): Promise<MarketingCampaignRecipientRow[]> {
    const body = await api<Paginated<LaravelMarketingCampaignRecipient>>(`/admin/marketing-campaigns/${id}/recipients?perPage=200`);
    return body.data.map(mapMarketingCampaignRecipient);
  }
}
